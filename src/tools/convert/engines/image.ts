/**
 * IMAGE ENGINE
 *
 * Decode anything the browser (or a lazily-loaded decoder) can read into a
 * canvas, then encode that canvas into the target format. Native decoders
 * cover JPG, PNG, WebP, AVIF, GIF, BMP, ICO and SVG; HEIC and TIFF need a
 * decoder the browser does not ship, and those are only fetched when a file
 * of that type actually arrives.
 */
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { ConvFormat } from '../../../config/converters';

export interface ImageOptions {
  /** 0–1, for JPG and WebP. */
  quality: number;
  /** Fill for formats without transparency (JPG, BMP), and for PDF pages. */
  background: string;
  /** Output width in pixels; 0 keeps the source size. Height follows the aspect ratio. */
  width: number;
  /** Icon sizes to pack into an ICO. */
  icoSizes: number[];
  /** SVG tracing: palette size, and whether to favour smooth curves or fine detail. */
  traceColors: 2 | 4 | 8 | 16;
  traceDetail: 'smooth' | 'detailed';
}

export const DEFAULT_IMAGE_OPTIONS: ImageOptions = {
  quality: 0.9,
  background: '#ffffff',
  width: 0,
  icoSizes: [16, 32, 48, 256],
  traceColors: 8,
  traceDetail: 'smooth',
};

/** Formats that have no alpha channel, so transparent pixels need a fill. */
const OPAQUE_TARGETS = new Set<ConvFormat>(['jpg', 'bmp', 'pdf']);

/** A decoded image, sized, ready to draw. */
interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function decodeNative(file: Blob): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // Some formats (SVG, and ICO in Firefox) decode through <img> but not createImageBitmap.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      // An SVG with no width/height attributes reports 0×0; render it at a useful size.
      const width = img.naturalWidth || 1024;
      const height = img.naturalHeight || 1024;
      return { source: img, width, height, release: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error('This browser could not read the image. The file may be damaged, or its format is not supported here.');
    }
  }
}

async function decodeHeic(file: File): Promise<Decoded> {
  // Safari decodes HEIC itself; everyone else needs libheif.
  try {
    return await decodeNative(file);
  } catch {
    const { heicTo } = await import('heic-to');
    try {
      const bitmap = await heicTo({ blob: file, type: 'bitmap' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      throw new Error(`“${file.name}” could not be decoded as HEIC. Live Photos and some burst images store data this decoder cannot read.`);
    }
  }
}

type Utif = typeof import('utif2');

/** UTIF ships as CommonJS; depending on the bundler the namespace sits on `default`. */
async function loadUtif(): Promise<Utif> {
  const mod = await import('utif2');
  return (mod as unknown as { default?: Utif }).default ?? mod;
}

async function decodeTiff(file: File): Promise<Decoded> {
  const UTIF = await loadUtif();
  const buffer = await file.arrayBuffer();
  const ifds = UTIF.decode(buffer);
  // Multi-page TIFFs also carry thumbnails; the largest page is the real image.
  const page = ifds
    .filter((ifd) => ifd.t256 && ifd.t257)
    .sort((a, b) => Number(b.t256) * Number(b.t257) - Number(a.t256) * Number(a.t257))[0];
  if (!page) throw new Error(`“${file.name}” has no readable image page.`);
  UTIF.decodeImage(buffer, page);
  const rgba = UTIF.toRGBA8(page);
  const { width, height } = page;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer as ArrayBuffer), width, height), 0, 0);
  return { source: canvas, width, height, release: () => { canvas.width = 0; } };
}

/** Fully transparent, or one flat colour: a placeholder composite rather than the artwork. */
function isBlank(source: HTMLCanvasElement): boolean {
  const probe = document.createElement('canvas');
  probe.width = 24;
  probe.height = 24;
  const g = probe.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(source, 0, 0, 24, 24);
  const d = g.getImageData(0, 0, 24, 24).data;
  let transparent = true;
  let flat = true;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] !== 0) transparent = false;
    if (d[i] !== d[0] || d[i + 1] !== d[1] || d[i + 2] !== d[2] || d[i + 3] !== d[3]) flat = false;
  }
  return transparent || flat;
}

/**
 * Photoshop files carry a flattened "composite" image when saved with
 * Maximize Compatibility (Photoshop's default). Without it, visible layers are
 * stacked in order — blend modes and effects are not reproduced, which is
 * why the composite is always preferred.
 */
async function decodePsd(file: File): Promise<Decoded> {
  // ag-psd resolves to its CommonJS build in some bundler setups, where the API sits on `default`.
  const agPsd = await import('ag-psd');
  const readPsd = agPsd.readPsd ?? (agPsd as unknown as { default: typeof agPsd }).default.readPsd;
  const buffer = await file.arrayBuffer();
  let psd;
  try {
    psd = readPsd(buffer, { skipThumbnail: true, skipLayerImageData: true });
  } catch (err) {
    throw new Error(`“${file.name}” could not be read as a Photoshop file. It may be damaged or use a newer feature this reader lacks.`, { cause: err });
  }
  const composite = psd.canvas as HTMLCanvasElement | undefined;
  let canvas = composite && !isBlank(composite) ? composite : undefined;
  if (!canvas) {
    // No usable composite (Maximize Compatibility off writes an empty one): stack the visible layers.
    const layered = readPsd(buffer, { skipThumbnail: true, skipCompositeImageData: true });
    const stacked = document.createElement('canvas');
    stacked.width = layered.width;
    stacked.height = layered.height;
    const g = stacked.getContext('2d')!;
    let drawn = 0;
    const draw = (layers: typeof layered.children) => {
      for (const layer of layers ?? []) {
        if (layer.hidden) continue;
        if (layer.children) draw(layer.children);
        else if (layer.canvas) {
          g.globalAlpha = layer.opacity ?? 1;
          g.drawImage(layer.canvas as HTMLCanvasElement, layer.left ?? 0, layer.top ?? 0);
          drawn += 1;
        }
      }
    };
    draw(layered.children);
    g.globalAlpha = 1;
    // A genuinely single-colour image with no layers: its composite was right all along.
    canvas = drawn > 0 ? stacked : composite;
  }
  if (!canvas) throw new Error(`“${file.name}” contains no image data.`);
  const c = canvas;
  return { source: c, width: c.width, height: c.height, release: () => { c.width = 0; } };
}

/**
 * RAW files are not developed here — that needs a demosaicing pipeline and the
 * camera's colour profile. Every camera, however, embeds a full-size JPEG
 * preview rendered with its own settings, which is what the camera screen
 * shows. That preview is found and extracted, losslessly.
 */
async function decodeRaw(file: File): Promise<Decoded> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const candidates: { start: number; end: number }[] = [];

  // TIFF-based RAWs (DNG, NEF, CR2, ARW, PEF, ORF…) list their previews in IFDs.
  try {
    const UTIF = await loadUtif();
    const walk = (ifds: Record<string, unknown>[]) => {
      for (const ifd of ifds) {
        const off = Number((ifd.t513 as number[] | undefined)?.[0]);
        const len = Number((ifd.t514 as number[] | undefined)?.[0]);
        if (off > 0 && len > 0) candidates.push({ start: off, end: off + len });
        const comp = Number((ifd.t259 as number[] | undefined)?.[0]);
        const strips = ifd.t273 as number[] | undefined;
        const counts = ifd.t279 as number[] | undefined;
        if ((comp === 6 || comp === 7) && strips?.length === 1 && counts?.length === 1) {
          candidates.push({ start: strips[0], end: strips[0] + counts[0] });
        }
        if (Array.isArray(ifd.subIFD)) walk(ifd.subIFD as Record<string, unknown>[]);
        if (ifd.exifIFD) walk([ifd.exifIFD as Record<string, unknown>]);
      }
    };
    walk(UTIF.decode(bytes.buffer) as unknown as Record<string, unknown>[]);
  } catch {
    // Not TIFF-structured (CR3, RAF): fall through to scanning.
  }
  const JPEG = (c: { start: number; end: number }) => bytes[c.start] === 0xff && bytes[c.start + 1] === 0xd8;
  // Held in an object: TypeScript cannot follow assignments made inside the helper closure.
  const found: { bmp: ImageBitmap | null } = { bmp: null };
  const seen = new Set<number>();
  const tryDecode = async (list: { start: number; end: number }[]) => {
    for (const c of list.filter(JPEG)) {
      if (seen.has(c.start)) continue;
      seen.add(c.start);
      try {
        const bmp = await createImageBitmap(new Blob([bytes.subarray(c.start, Math.min(c.end, bytes.length))], { type: 'image/jpeg' }));
        const prev = found.bmp;
        if (!prev || bmp.width * bmp.height > prev.width * prev.height) { prev?.close(); found.bmp = bmp; } else bmp.close();
      } catch {
        // A false marker inside compressed data; keep looking.
      }
    }
  };
  await tryDecode(candidates);

  // CR3, RAF and a few makers keep the preview outside any IFD, so scan for
  // JPEG start markers — only when no full-size preview has turned up yet.
  const current = found.bmp;
  if (!current || current.width * current.height < 1_000_000) {
    const scanned: { start: number; end: number }[] = [];
    for (let i = 0; i < bytes.length - 3 && scanned.length < 12; i += 1) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff && (bytes[i + 3] & 0xf0) === 0xe0) {
        scanned.push({ start: i, end: bytes.length });
        i += 4096; // skip past this image's own headers and thumbnail
      }
    }
    await tryDecode(scanned);
  }
  if (!found.bmp) {
    throw new Error(`No embedded preview was found in “${file.name}”. Some DNG files from phones and scanners store only raw sensor data; open it in a RAW editor and export a JPG.`);
  }
  const bmp = found.bmp;
  return { source: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() };
}

export async function decodeImage(file: File, format: ConvFormat | null): Promise<Decoded> {
  if (format === 'heic') return decodeHeic(file);
  if (format === 'tiff') return decodeTiff(file);
  if (format === 'psd') return decodePsd(file);
  if (format === 'raw') return decodeRaw(file);
  return decodeNative(file);
}

/** Largest canvas side browsers reliably allocate (Safari caps area at ~16.7 MP). */
const MAX_SIDE = 8192;

function drawToCanvas(img: Decoded, target: ConvFormat, opts: ImageOptions): HTMLCanvasElement {
  let width = opts.width > 0 ? Math.round(opts.width) : img.width;
  let height = Math.max(1, Math.round((img.height / img.width) * width));
  const over = Math.max(width, height) / MAX_SIDE;
  if (over > 1) {
    width = Math.floor(width / over);
    height = Math.floor(height / over);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  if (OPAQUE_TARGETS.has(target)) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img.source, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The browser could not encode the image.'))), mime, quality);
  });
}

/** 24-bit bottom-up BMP. Canvas has no BMP encoder, and the format is simple enough to write. */
function encodeBmp(canvas: HTMLCanvasElement): Blob {
  const { width, height } = canvas;
  const px = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const dataSize = rowSize * height;
  const buf = new ArrayBuffer(54 + dataSize);
  const v = new DataView(buf);
  v.setUint16(0, 0x4d42, true);          // "BM"
  v.setUint32(2, 54 + dataSize, true);
  v.setUint32(10, 54, true);             // pixel data offset
  v.setUint32(14, 40, true);             // BITMAPINFOHEADER
  v.setInt32(18, width, true);
  v.setInt32(22, height, true);
  v.setUint16(26, 1, true);
  v.setUint16(28, 24, true);
  v.setUint32(34, dataSize, true);
  v.setInt32(38, 2835, true);            // 72 DPI
  v.setInt32(42, 2835, true);
  const out = new Uint8Array(buf);
  for (let y = 0; y < height; y += 1) {
    const src = (height - 1 - y) * width * 4;
    let dst = 54 + y * rowSize;
    for (let x = 0; x < width; x += 1) {
      const i = src + x * 4;
      out[dst++] = px[i + 2];
      out[dst++] = px[i + 1];
      out[dst++] = px[i];
    }
  }
  return new Blob([buf], { type: 'image/bmp' });
}

function encodeGif(canvas: HTMLCanvasElement): Blob {
  const { width, height } = canvas;
  const rgba = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  const quant = quantize as unknown as (d: Uint8ClampedArray, n: number, o?: object) => number[][];
  const palette = quant(rgba, 256, { format: 'rgba4444', oneBitAlpha: true });
  const index = applyPalette(rgba, palette as unknown as Uint32Array, 'rgba4444');
  const transparentIndex = palette.findIndex((c) => c[3] === 0);
  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, {
    palette: palette as unknown as Uint32Array,
    transparent: transparentIndex >= 0,
    transparentIndex: Math.max(0, transparentIndex),
  });
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

async function encodeTiff(canvas: HTMLCanvasElement): Promise<Blob> {
  const UTIF = await loadUtif();
  const { width, height } = canvas;
  const rgba = canvas.getContext('2d')!.getImageData(0, 0, width, height).data;
  const bytes = UTIF.encodeImage(new Uint8Array(rgba.buffer), width, height);
  return new Blob([bytes], { type: 'image/tiff' });
}

/** ICO with PNG-compressed entries, which every Windows since Vista and every browser reads. */
async function encodeIco(img: Decoded, sizes: number[]): Promise<Blob> {
  const list = [...new Set(sizes)].filter((s) => s >= 16 && s <= 256).sort((a, b) => a - b);
  if (list.length === 0) throw new Error('Pick at least one icon size.');
  const pngs: Uint8Array<ArrayBuffer>[] = [];
  for (const size of list) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    // Fit inside the square, centred, so a wide logo is not squashed.
    const scale = Math.min(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img.source, (size - w) / 2, (size - h) / 2, w, h);
    pngs.push(new Uint8Array(await (await canvasToBlob(c, 'image/png')).arrayBuffer()));
  }
  const header = new DataView(new ArrayBuffer(6 + 16 * list.length));
  header.setUint16(2, 1, true);
  header.setUint16(4, list.length, true);
  let offset = 6 + 16 * list.length;
  list.forEach((size, i) => {
    const p = 6 + i * 16;
    header.setUint8(p, size === 256 ? 0 : size);
    header.setUint8(p + 1, size === 256 ? 0 : size);
    header.setUint16(p + 4, 1, true);
    header.setUint16(p + 6, 32, true);
    header.setUint32(p + 8, pngs[i].length, true);
    header.setUint32(p + 12, offset, true);
    offset += pngs[i].length;
  });
  return new Blob([header.buffer, ...pngs], { type: 'image/x-icon' });
}

/** AVIF through libavif (Squoosh's WebAssembly build); browsers can show AVIF but not create it. */
async function encodeAvif(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const { default: encode } = await import('@jsquash/avif/encode');
  const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
  // Squoosh's scale: 0–100, where ~60 matches a JPG at 90 for visual quality at a fraction of the size.
  const bytes = await encode(data, { quality: Math.round(quality * 100 * 0.7), speed: 6 });
  return new Blob([bytes], { type: 'image/avif' });
}

/** Largest side traced; beyond this, tracing slows sharply and the SVG balloons without gaining detail. */
const TRACE_MAX = 1200;

/**
 * Raster → SVG by colour quantisation and path fitting (ImageTracer). It is
 * the right tool for logos, icons, line art and flat illustrations; a
 * photograph traces into thousands of blobs, which is a limit of vectorising,
 * not of this tracer.
 */
async function encodeSvg(img: Decoded, opts: ImageOptions): Promise<Blob> {
  const mod = await import('imagetracerjs');
  const tracer = ((mod as unknown as { default?: unknown }).default ?? mod) as {
    imagedataToSVG: (d: ImageData, o: Record<string, unknown>) => string;
  };
  const scale = Math.min(1, TRACE_MAX / Math.max(img.width, img.height), opts.width > 0 ? opts.width / img.width : 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img.source, 0, 0, w, h);
  const smooth = opts.traceDetail === 'smooth';
  const svg = tracer.imagedataToSVG(g.getImageData(0, 0, w, h), {
    numberofcolors: opts.traceColors,
    colorquantcycles: 4,
    ltres: smooth ? 1 : 0.5,
    qtres: smooth ? 1 : 0.5,
    pathomit: smooth ? 12 : 4,
    blurradius: smooth ? 1 : 0,
    roundcoords: 1,
    viewbox: true,
    strokewidth: 0,
  });
  return new Blob([svg], { type: 'image/svg+xml' });
}

/**
 * Every page of a multi-page TIFF — a fax, a scanned contract — as one PDF,
 * each page sized from the TIFF's own DPI so it prints at its real size.
 */
export async function tiffToPdf(file: File, quality: number): Promise<Blob> {
  const [UTIF, { PDFDocument }] = await Promise.all([loadUtif(), import('pdf-lib')]);
  const buffer = await file.arrayBuffer();
  // NewSubfileType bit 0 marks reduced-resolution copies (thumbnails); those are not pages.
  const pages = UTIF.decode(buffer).filter((ifd) => ifd.t256 && ifd.t257 && !(Number((ifd.t254 as number[] | undefined)?.[0] ?? 0) & 1));
  if (pages.length === 0) throw new Error(`“${file.name}” has no readable image pages.`);
  const doc = await PDFDocument.create();
  for (const ifd of pages) {
    UTIF.decodeImage(buffer, ifd);
    const rgba = UTIF.toRGBA8(ifd);
    const canvas = document.createElement('canvas');
    canvas.width = ifd.width;
    canvas.height = ifd.height;
    const g = canvas.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, ifd.width, ifd.height);
    const layer = document.createElement('canvas');
    layer.width = ifd.width;
    layer.height = ifd.height;
    layer.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer as ArrayBuffer), ifd.width, ifd.height), 0, 0);
    g.drawImage(layer, 0, 0);
    const toDpi = (tag: unknown) => { const v = (tag as number[] | undefined)?.[0]; return typeof v === 'number' && v > 10 ? v : 0; };
    const unitCm = Number((ifd.t296 as number[] | undefined)?.[0]) === 3;
    const xdpi = (toDpi(ifd.t282) || 96) * (unitCm ? 2.54 : 1);
    const ydpi = (toDpi(ifd.t283) || xdpi) * (unitCm && toDpi(ifd.t283) ? 2.54 : 1);
    const jpg = await canvasToBlob(canvas, 'image/jpeg', Math.max(quality, 0.85));
    const embedded = await doc.embedJpg(await jpg.arrayBuffer());
    const w = (ifd.width / xdpi) * 72;
    const h = (ifd.height / ydpi) * 72;
    doc.addPage([w, h]).drawImage(embedded, { x: 0, y: 0, width: w, height: h });
    canvas.width = 0;
    layer.width = 0;
  }
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

async function encodePdf(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const jpg = await canvasToBlob(canvas, 'image/jpeg', Math.max(quality, 0.85));
  const embedded = await doc.embedJpg(await jpg.arrayBuffer());
  // 96 px per inch on screen, 72 points per inch on paper.
  const w = canvas.width * 0.75;
  const h = canvas.height * 0.75;
  doc.addPage([w, h]).drawImage(embedded, { x: 0, y: 0, width: w, height: h });
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

export async function convertImage(
  file: File,
  from: ConvFormat | null,
  to: ConvFormat,
  opts: ImageOptions,
): Promise<Blob> {
  const img = await decodeImage(file, from);
  try {
    if (to === 'ico') return await encodeIco(img, opts.icoSizes);
    if (to === 'svg') return await encodeSvg(img, opts);
    const canvas = drawToCanvas(img, to, opts);
    switch (to) {
      case 'jpg':  return await canvasToBlob(canvas, 'image/jpeg', opts.quality);
      case 'png':  return await canvasToBlob(canvas, 'image/png');
      case 'webp': {
        const blob = await canvasToBlob(canvas, 'image/webp', opts.quality);
        // Browsers without a WebP encoder silently hand back a PNG instead.
        if (blob.type !== 'image/webp') {
          throw new Error('This browser can display WebP but cannot create it. Use Chrome, Edge or Firefox for this conversion.');
        }
        return blob;
      }
      case 'avif': return await encodeAvif(canvas, opts.quality);
      case 'gif':  return encodeGif(canvas);
      case 'bmp':  return encodeBmp(canvas);
      case 'tiff': return await encodeTiff(canvas);
      case 'pdf':  return await encodePdf(canvas, opts.quality);
      default:     throw new Error(`Images cannot be converted to ${to.toUpperCase()}.`);
    }
  } finally {
    img.release();
  }
}
