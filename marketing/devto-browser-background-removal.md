---
title: Background removal in the browser with ONNX Runtime Web (and the fp16 trap)
published: false
description: How I run an AI background remover entirely on the user's device with ONNX Runtime Web, WebGPU and a WASM fallback, plus the things that broke along the way.
tags: webdev, javascript, machinelearning, webgpu
---

I run [NextTool](https://nexttool.click), a set of free file tools that work inside the browser. Your file is never uploaded, because there's no server to upload it to. The PDF and image tools were straightforward. The AI background remover was not.

When I audited my dependencies, the background remover was built on an npm package licensed under **AGPL-3.0**. AGPL is a fine licence, but it asks you to publish your own source code, and my site is closed source. So I rebuilt it from scratch on **ONNX Runtime Web** (MIT) with two models under permissive licences.

This post covers how it works, the code, and the problems I hit along the way.

## The plan

- **ONNX Runtime Web** runs the model, on **WebGPU** when the browser has it and on **WebAssembly** (CPU) when it doesn't.
- **BiRefNet lite** (MIT) is the high-quality model, used on WebGPU.
- **IS-Net general-use** (Apache-2.0, from the DIS project) is the fallback for everything else.
- Everything runs in a **Web Worker**, so the page stays responsive.
- The model is downloaded once and kept in **Cache Storage**.

Why two models? Because of the trap in the next section.

## The fp16 trap

BiRefNet lite has an fp16 build on Hugging Face (`onnx-community/BiRefNet_lite-ONNX`) that's about 115 MB. Half the size of fp32, great edges. I plugged it in, tested on the WASM backend first, and got this:

```
Could not find a CPU kernel and hence can't constant fold Sub node '/bb/layers.1/Sub'
...
failed to call OrtRun(). ERROR_CODE: 2
```

**The CPU (WASM) backend of ONNX Runtime doesn't have fp16 kernels for the operators this model uses.** fp16 models are a WebGPU-only thing in practice, and only on GPUs that expose the `shader-f16` feature.

I then tried the fp32 build (224 MB) on WASM. It loaded, but `run()` threw a bare number instead of an error: an unhandled C++ exception from inside the WASM module. My best guess is the 4 GB memory ceiling of 32-bit WebAssembly. A Swin-based network at 1024×1024 needs a lot of activation memory. The same file ran fine with native ONNX Runtime, so the model itself was not the problem.

So BiRefNet is GPU-only, and I needed a second model for the CPU. IS-Net general-use runs on WASM at 1024×1024 without trouble. In my Node tests, one inference took about 11 seconds single-threaded with the WASM build.

## Choosing the backend

The worker checks what the device can do and builds an ordered plan. If a step fails (out of GPU memory, device lost), it moves to the next one:

```ts
type Device = 'webgpu' | 'wasm';

const pickPlan = async (): Promise<{ spec: ModelSpec; device: Device }[]> => {
  const fallback = { spec: ISNET, device: 'wasm' as Device };
  const gpu = (navigator as any).gpu;
  if (!gpu) return [fallback];
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) return [fallback];
    if (adapter.features.has('shader-f16')) {
      return [{ spec: BIREFNET, device: 'webgpu' }, fallback];
    }
    return [{ spec: ISNET, device: 'webgpu' }, fallback];
  } catch {
    return [fallback];
  }
};
```

Note that `navigator.gpu` can exist while `requestAdapter()` returns `null`. That happens on machines with a blocklisted GPU, or in headless and VM browsers. Check both.

## Loading ONNX Runtime with Vite

I import the WebGPU bundle, which also includes the WASM backend:

```ts
const ort = await import('onnxruntime-web/webgpu');
```

Vite rewrites ORT's `new URL('ort-wasm-simd-threaded.jsep.wasm', import.meta.url)` into a hashed asset on its own, so I didn't need to set `wasmPaths`. Be aware that this `.wasm` file is about 24 MB. Lazy-load it inside the worker so it never touches your main bundle.

**TypeScript gotcha:** `onnxruntime-web` declares its modules in a `types.d.ts` file that its `package.json` `exports` map doesn't expose. With `"moduleResolution": "bundler"` you get `TS7016: Could not find a declaration file`. The fix that keeps ESLint happy (no triple-slash reference) is to add the file to `tsconfig.json`:

```json
"include": ["src", "node_modules/onnxruntime-web/types.d.ts"]
```

## Pre-processing

Both models take a 1024×1024 RGB image as an NCHW `float32` tensor. They differ in normalisation:

| Model | Mean | Std | Output |
|---|---|---|---|
| BiRefNet lite | 0.485, 0.456, 0.406 | 0.229, 0.224, 0.225 | logits → sigmoid |
| IS-Net | 0.5, 0.5, 0.5 | 1, 1, 1 | saliency → min-max scale |

`OffscreenCanvas` works inside a worker, so resizing and reading pixels is easy:

```ts
const SIZE = 1024;

function toTensor(ort, bmp: ImageBitmap, mean: number[], std: number[]) {
  const canvas = new OffscreenCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, SIZE, SIZE);
  const px = ctx.getImageData(0, 0, SIZE, SIZE).data;

  const plane = SIZE * SIZE;
  const data = new Float32Array(3 * plane);
  for (let i = 0, p = 0; i < plane; i++, p += 4) {
    data[i]             = (px[p]     / 255 - mean[0]) / std[0];
    data[plane + i]     = (px[p + 1] / 255 - mean[1]) / std[1];
    data[2 * plane + i] = (px[p + 2] / 255 - mean[2]) / std[2];
  }
  return new ort.Tensor('float32', data, [1, 3, SIZE, SIZE]);
}
```

Even the fp16 BiRefNet build expects a `float32` input. Pass `float16` and you get `Unexpected input data type`. Read the error before you write a float16 converter.

## Post-processing: let the canvas do the work

The model gives you a 1024×1024 mask. The user's photo might be 4000×3000. The obvious approach is to scale the mask up, call `getImageData` on the full-size photo, and copy alpha values pixel by pixel. On a 12 MP image that means walking two 48 MB buffers in JavaScript.

There's a much simpler way. Draw the mask as white pixels whose alpha is the mask value, then composite it onto the photo with `destination-in`:

```ts
function maskCanvas(values: Float32Array): OffscreenCanvas {
  const img = new ImageData(SIZE, SIZE);
  for (let i = 0, p = 0; i < values.length; i++, p += 4) {
    img.data[p] = img.data[p + 1] = img.data[p + 2] = 255;
    img.data[p + 3] = Math.round(Math.min(1, Math.max(0, values[i])) * 255);
  }
  const c = new OffscreenCanvas(SIZE, SIZE);
  c.getContext('2d')!.putImageData(img, 0, 0);
  return c;
}

async function cutOut(bmp: ImageBitmap, mask: OffscreenCanvas) {
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0);
  ctx.globalCompositeOperation = 'destination-in'; // keep photo pixels where the mask is opaque
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(mask, 0, 0, bmp.width, bmp.height); // the browser scales the mask for us
  return canvas.convertToBlob({ type: 'image/png' });
}
```

The browser handles the upscaling and the alpha multiply natively, and the output keeps the original resolution.

## Caching a 180 MB model (and a service worker gotcha)

Nobody wants to download 115 to 180 MB twice. The worker stores the model in Cache Storage and streams the first download so it can report progress:

```ts
const MODEL_CACHE = 'ai-models-v1';

async function fetchModel(url: string, onProgress: (f: number) => void) {
  const cache = await caches.open(MODEL_CACHE);
  const hit = await cache.match(url);
  if (hit) return new Uint8Array(await hit.arrayBuffer());

  const res = await fetch(url);
  const total = Number(res.headers.get('content-length')) || 0;
  const reader = res.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onProgress(received / total);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) { bytes.set(c, offset); offset += c.length; }

  await cache.put(url, new Response(bytes));
  return bytes;
}
```

**The gotcha:** my service worker's `activate` handler deletes every cache whose name starts with my site prefix and isn't in its keep-list. That's a common pattern for removing old app-shell caches. If I had called this cache `nexttool-models`, every deploy would have wiped a 180 MB download. Give long-lived caches a name your service worker's cleanup won't match.

Also wrap the cache calls in `try/catch`. In private windows or when storage quota runs out, the model should still download and work. It just won't be saved.

## Hosting the model: CORS and pinning

The original IS-Net ONNX file is published as a GitHub release asset. **GitHub release downloads don't send CORS headers**, so a browser can't `fetch()` them from your page.

I used a Hugging Face mirror instead, but a random mirror is a trust problem. Before using it, I downloaded both files and checked that the SHA-256 hashes matched exactly. I also pin every model URL to a commit:

```
https://huggingface.co/<repo>/resolve/<commit-sha>/model.onnx
```

A `resolve/main/` URL can change under you. A `resolve/<sha>/` URL can't. Hugging Face serves the final file with `Access-Control-Allow-Origin: *`.

## Testing without a GPU

My test browser had `navigator.gpu` but no adapter, so the WebGPU path couldn't run there. To check that both models' pre- and post-processing was right, without eyeballing photos, I fed them a synthetic image in Node: a shaded red disc on a light textured background. Then I measured the mask inside and outside the disc:

```
birefnet  mean alpha inside disc 0.999  outside 0.000
isnet     mean alpha inside disc 0.999  outside 0.000
```

If you get the normalisation wrong or forget the sigmoid, these numbers drift away from 1 and 0 right away. It's a cheap way to catch an inverted mask or a wrong mean/std before testing on real photos.

## What I'd tell my past self

1. **Read the licence of every ML package before you build on it.** The model weights can carry a different licence than the code. Check both.
2. **fp16 means WebGPU.** Don't plan on running fp16 models on the WASM backend.
3. **32-bit WASM has a 4 GB ceiling.** Big models at high resolution may never fit, however long you wait.
4. **Always build a fallback chain.** GPUs run out of memory, lose the device, or are blocklisted.
5. **Let the canvas do compositing.** `destination-in` beats a per-pixel loop.
6. **Pin model URLs to a commit**, and verify hashes when you use a mirror.

You can try the result here: [NextTool Background Remover](https://nexttool.click/tool/ai-bg-remover). Open DevTools, watch the Network tab, and you'll see the model come in and your image never leave.

If you've shipped in-browser ML, I'd like to hear how you handled the CPU fallback. Let me know in the comments.
