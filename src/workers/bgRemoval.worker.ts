/**
 * Background removal, run entirely on the visitor's device with ONNX Runtime Web.
 *
 * Two models, both under permissive licences:
 *  - BiRefNet lite (MIT), fp16. Best edges, but it only runs on WebGPU with
 *    shader-f16: the CPU (WASM) backend has no fp16 kernels and runs out of
 *    its 4 GB address space on this network even in fp32.
 *  - IS-Net general-use (Apache-2.0, from the DIS project), fp32. Runs on WASM,
 *    so it is the fallback for browsers without WebGPU and for any GPU failure.
 *
 * Both URLs are pinned to a Hugging Face commit, so the bytes cannot change
 * under us. The IS-Net file is byte-identical (sha256 60920e99…0d964a) to the
 * isnet-general-use.onnx published in rembg's GitHub releases, whose host does
 * not send CORS headers and so cannot be fetched from a page.
 */
import type * as OrtModule from 'onnxruntime-web';

type Ort = typeof OrtModule;
type Session = OrtModule.InferenceSession;
type Device = 'webgpu' | 'wasm';

interface ModelSpec {
  id: 'birefnet' | 'isnet';
  url: string;
  /** Used for progress when the response has no Content-Length. */
  bytes: number;
  mean: [number, number, number];
  std: [number, number, number];
  /** BiRefNet outputs logits; IS-Net outputs a saliency map to min–max scale. */
  post: 'sigmoid' | 'minmax';
}

const SIZE = 1024;

const BIREFNET: ModelSpec = {
  id: 'birefnet',
  url: 'https://huggingface.co/onnx-community/BiRefNet_lite-ONNX/resolve/de15b22ba131738a16dff04aab8bdf8dc32e3ac1/onnx/model_fp16.onnx',
  bytes: 114_538_221,
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
  post: 'sigmoid',
};

const ISNET: ModelSpec = {
  id: 'isnet',
  url: 'https://huggingface.co/jellybox/isnet-general-use/resolve/bc3706ce4ee38a3db2c3c58082a92582fcdfcfdc/isnet-general-use_1024.onnx',
  bytes: 178_648_008,
  mean: [0.5, 0.5, 0.5],
  std: [1, 1, 1],
  post: 'minmax',
};

/* Not prefixed "nexttool-": the service worker deletes those caches on every
   deploy, and a 100+ MB model should survive deploys. */
const MODEL_CACHE = 'ai-models-v1';

let ortPromise: Promise<Ort> | null = null;
let loaded: { key: string; session: Session } | null = null;
let lastPostedPct = -1;

const post = (message: Record<string, unknown>) => {
  (self as unknown as Worker).postMessage(message);
};

const progress = (pct: number, stage: string) => {
  const rounded = Math.max(1, Math.min(99, Math.round(pct)));
  if (rounded === lastPostedPct) return;
  lastPostedPct = rounded;
  post({ type: 'progress', pct: rounded, stage });
};

const loadOrt = async (): Promise<Ort> => {
  if (!ortPromise) {
    ortPromise = import('onnxruntime-web/webgpu').then((ort) => {
      ort.env.logLevel = 'error';
      return ort as unknown as Ort;
    });
  }
  return ortPromise;
};

/** BiRefNet needs WebGPU with fp16 shaders; everything else gets IS-Net. */
const pickPlan = async (): Promise<{ spec: ModelSpec; device: Device }[]> => {
  const fallback = { spec: ISNET, device: 'wasm' as Device };
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<{ features: Set<string> } | null> } }).gpu;
  if (!gpu) return [fallback];
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) return [fallback];
    if (adapter.features.has('shader-f16')) return [{ spec: BIREFNET, device: 'webgpu' }, fallback];
    return [{ spec: ISNET, device: 'webgpu' }, fallback];
  } catch {
    return [fallback];
  }
};

const openCache = async (): Promise<Cache | null> => {
  try {
    return await caches.open(MODEL_CACHE);
  } catch {
    return null;
  }
};

/** Downloads a model once and keeps it in Cache Storage for later runs. */
const fetchModel = async (spec: ModelSpec): Promise<Uint8Array> => {
  const cache = await openCache();
  if (cache) {
    try {
      const hit = await cache.match(spec.url);
      if (hit) return new Uint8Array(await hit.arrayBuffer());
    } catch {
      /* fall through to the network */
    }
  }

  const res = await fetch(spec.url);
  if (!res.ok || !res.body) throw new Error(`Could not download the AI model (HTTP ${res.status}).`);
  const total = Number(res.headers.get('content-length')) || spec.bytes;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    progress((received / total) * 85, 'Downloading AI model…');
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }

  if (cache) {
    try {
      await cache.put(spec.url, new Response(bytes, { headers: { 'Content-Type': 'application/octet-stream' } }));
      // Drop models from older revisions of this file.
      const keep = new Set([BIREFNET.url, ISNET.url]);
      for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
    } catch {
      /* quota or private mode: the model is simply downloaded again next time */
    }
  }
  return bytes;
};

const getSession = async (ort: Ort, spec: ModelSpec, device: Device): Promise<Session> => {
  const key = `${spec.id}:${device}`;
  if (loaded?.key === key) return loaded.session;
  if (loaded) {
    await loaded.session.release().catch(() => {});
    loaded = null;
  }
  const bytes = await fetchModel(spec);
  progress(87, 'Loading AI model…');
  const session = await ort.InferenceSession.create(bytes, {
    executionProviders: [device],
    graphOptimizationLevel: 'all',
  });
  loaded = { key, session };
  return session;
};

/** Resizes to the model's 1024×1024 input and normalises to NCHW float32. */
const toTensor = (ort: Ort, bmp: ImageBitmap, spec: ModelSpec): OrtModule.Tensor => {
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, SIZE, SIZE);
  const px = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const plane = SIZE * SIZE;
  const data = new Float32Array(3 * plane);
  const [m0, m1, m2] = spec.mean;
  const [s0, s1, s2] = spec.std;
  for (let i = 0, p = 0; i < plane; i++, p += 4) {
    data[i] = (px[p] / 255 - m0) / s0;
    data[plane + i] = (px[p + 1] / 255 - m1) / s1;
    data[2 * plane + i] = (px[p + 2] / 255 - m2) / s2;
  }
  return new ort.Tensor('float32', data, [1, 3, SIZE, SIZE]);
};

const halfToFloat = (h: number): number => {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 0x1f;
  const f = h & 0x3ff;
  if (e === 0) return s * 2 ** -14 * (f / 1024);
  if (e === 31) return f ? NaN : s * Infinity;
  return s * 2 ** (e - 15) * (1 + f / 1024);
};

/** Turns the model's output into an alpha mask at the model's resolution. */
const toMask = (out: OrtModule.Tensor, spec: ModelSpec): OffscreenCanvas => {
  const plane = SIZE * SIZE;
  const raw = out.data as Float32Array | Uint16Array;
  const values = new Float32Array(plane);
  if (out.type === 'float16' && raw instanceof Uint16Array) {
    for (let i = 0; i < plane; i++) values[i] = halfToFloat(raw[i]);
  } else {
    for (let i = 0; i < plane; i++) values[i] = Number(raw[i]);
  }

  if (spec.post === 'sigmoid') {
    for (let i = 0; i < plane; i++) values[i] = 1 / (1 + Math.exp(-values[i]));
  } else {
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < plane; i++) {
      if (values[i] < lo) lo = values[i];
      if (values[i] > hi) hi = values[i];
    }
    const range = hi - lo || 1;
    for (let i = 0; i < plane; i++) values[i] = (values[i] - lo) / range;
  }

  const img = new ImageData(SIZE, SIZE);
  for (let i = 0, p = 0; i < plane; i++, p += 4) {
    img.data[p] = 255;
    img.data[p + 1] = 255;
    img.data[p + 2] = 255;
    img.data[p + 3] = Math.round(Math.max(0, Math.min(1, values[i])) * 255);
  }
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable.');
  ctx.putImageData(img, 0, 0);
  return canvas;
};

/** Applies the mask to the full-resolution image and encodes a PNG. */
const cutOut = async (bmp: ImageBitmap, mask: OffscreenCanvas): Promise<Blob> => {
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable.');
  ctx.drawImage(bmp, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(mask, 0, 0, bmp.width, bmp.height);
  return canvas.convertToBlob({ type: 'image/png' });
};

const run = async (e: MessageEvent<{ file: ArrayBuffer; type: string; name: string }>) => {
  const { file, type } = e.data;
  let bmp: ImageBitmap | null = null;
  try {
    progress(1, 'Preparing…');
    try {
      bmp = await createImageBitmap(new Blob([file], { type }));
    } catch {
      throw new Error('This image could not be opened. Try a JPG, PNG or WebP file.');
    }

    const ort = await loadOrt();
    const plan = await pickPlan();
    let lastError: unknown = null;
    for (const { spec, device } of plan) {
      try {
        const session = await getSession(ort, spec, device);
        progress(90, 'Removing background…');
        const input = toTensor(ort, bmp, spec);
        const outputs = await session.run({ [session.inputNames[0]]: input });
        const out = outputs[session.outputNames[0]];
        progress(96, 'Removing background…');
        const blob = await cutOut(bmp, toMask(out, spec));
        const buf = new Uint8Array(await blob.arrayBuffer());
        post({ type: 'result', buffer: buf.buffer, mime: blob.type });
        return;
      } catch (err) {
        // A GPU that runs out of memory or loses its device: try the next plan.
        lastError = err;
        if (loaded) {
          await loaded.session.release().catch(() => {});
          loaded = null;
        }
      }
    }
    throw lastError ?? new Error('Background removal failed.');
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : 'Background removal failed.' });
  } finally {
    bmp?.close();
  }
};

const compress = async (msg: { file: ArrayBuffer; type: string; maxDim: number }) => {
  try {
    post({ type: 'progress', pct: 94, stage: 'Compressing image…' });
    const blob = new Blob([msg.file], { type: msg.type });
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, msg.maxDim / Math.max(bmp.width, bmp.height));
    const cw = Math.max(1, Math.round(bmp.width * scale));
    const ch = Math.max(1, Math.round(bmp.height * scale));
    const canvas = new OffscreenCanvas(cw, ch);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable.');
    ctx.drawImage(bmp, 0, 0, cw, ch);
    const out = await canvas.convertToBlob({ type: 'image/png' });
    const buf = new Uint8Array(await out.arrayBuffer());
    post({ type: 'compressed', buffer: buf.buffer, mime: 'image/png', width: cw, height: ch });
  } catch (err) {
    post({ type: 'compress-error', message: err instanceof Error ? err.message : 'Compression failed.' });
  }
};

(self as unknown as Worker).onmessage = (e: MessageEvent<{ action?: string } & Record<string, unknown>>) => {
  lastPostedPct = -1;
  if (e.data.action === 'compress') {
    void compress(e.data as never);
  } else {
    void run(e as never);
  }
};
