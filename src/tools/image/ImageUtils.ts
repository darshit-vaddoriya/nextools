export const ACCEPT_IMAGE = 'image/*';

export interface ProcessedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  fileName: string;
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

export function canvasFromImage(img: HTMLImageElement, maxDim = 2000): HTMLCanvasElement {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxDim || h > maxDim) {
    const scale = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

export async function blobFromCanvas(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  const { blob } = await canvasExport(canvas, type, quality);
  return blob;
}

let webpSupport: boolean | null = null;
let avifSupport: boolean | null = null;

function testEncode(mime: string): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

export function supportsFormat(mime: string): boolean {
  if (mime === 'image/webp') {
    if (webpSupport === null) webpSupport = testEncode('image/webp');
    return webpSupport;
  }
  if (mime === 'image/avif') {
    if (avifSupport === null) avifSupport = testEncode('image/avif');
    return avifSupport;
  }
  return true;
}

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/avif') return 'avif';
  if (mime === 'image/bmp') return 'bmp';
  if (mime === 'image/x-icon') return 'ico';
  return mime.split('/')[1] ?? 'bin';
}

function resolveFormat(mime: string): { mime: string; ext: string } {
  let format = mime === 'image/jpg' ? 'image/jpeg' : mime;
  if (format === 'image/webp' && !supportsFormat('image/webp')) format = 'image/jpeg';
  if (format === 'image/avif' && !supportsFormat('image/avif')) {
    format = supportsFormat('image/webp') ? 'image/webp' : 'image/jpeg';
  }
  return { mime: format, ext: extFromMime(format) };
}

export async function canvasExport(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<{ blob: Blob; ext: string; mime: string }> {
  const fmt = resolveFormat(mime);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, fmt.mime, quality));
  if (!blob) throw new Error('Canvas export failed');
  // Some browsers silently return a PNG blob when the requested format is unsupported,
  // which defeats compression (e.g. image/webp -> image/png). Retry with JPEG to guarantee
  // a small lossy output for any lossy request.
  if (fmt.ext !== 'png' && blob.type === 'image/png') {
    const jblob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality ?? 0.92));
    if (jblob && jblob.type === 'image/jpeg') {
      return { blob: jblob, ext: 'jpg', mime: 'image/jpeg' };
    }
  }
  const actual = extFromMime(blob.type);
  return { blob, ext: actual === 'bin' ? fmt.ext : actual, mime: blob.type || fmt.mime };
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function createResult(blob: Blob, width: number, height: number, baseName: string, ext: string): ProcessedImage {
  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    fileName: `${baseName}.${ext}`,
  };
}

export function getPixelData(canvas: HTMLCanvasElement): ImageData {
  return canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
}

export function putPixelData(canvas: HTMLCanvasElement, data: ImageData) {
  canvas.getContext('2d')!.putImageData(data, 0, 0);
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function baseNameFrom(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '');
}

// ─── Pixel filters ────────────────────────────────────────────

export function applyConvolution(data: ImageData, kernel: number[], divisor = 1, bias = 0) {
  const w = data.width, h = data.height;
  const src = data.data;
  const out = new Uint8ClampedArray(src);
  const side = Math.round(Math.sqrt(kernel.length));
  const half = Math.floor(side / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = 0; ky < side; ky++) {
          for (let kx = 0; kx < side; kx++) {
            const px = clamp(x + kx - half, 0, w - 1);
            const py = clamp(y + ky - half, 0, h - 1);
            sum += kernel[ky * side + kx] * src[(py * w + px) * 4 + c];
          }
        }
        out[(y * w + x) * 4 + c] = clamp(sum / divisor + bias, 0, 255);
      }
    }
  }
  data.data.set(out);
}

export function applyMedian(data: ImageData, radius: number) {
  const w = data.width, h = data.height;
  const src = data.data;
  const out = new Uint8ClampedArray(src);
  const side = radius * 2 + 1;
  const count = side * side;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        const vals = new Uint8Array(count);
        let n = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          const py = clamp(y + ky, 0, h - 1);
          for (let kx = -radius; kx <= radius; kx++) {
            const px = clamp(x + kx, 0, w - 1);
            vals[n++] = src[(py * w + px) * 4 + c];
          }
        }
        vals.sort();
        out[(y * w + x) * 4 + c] = vals[Math.floor(count / 2)];
      }
    }
  }
  data.data.set(out);
}

export function applyUnsharp(data: ImageData, strength: number) {
  // Simple high-pass sharpening via 3x3 laplacian-weighted add
  const w = data.width, h = data.height;
  const src = data.data;
  const out = new Uint8ClampedArray(src);
  const amt = strength / 100;
  const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let c = 0; c < 3; c++) {
        let laplace = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = clamp(x + kx, 0, w - 1);
            const py = clamp(y + ky, 0, h - 1);
            laplace += kernel[(ky + 1) * 3 + (kx + 1)] * src[(py * w + px) * 4 + c];
          }
        }
        const orig = src[(y * w + x) * 4 + c];
        out[(y * w + x) * 4 + c] = clamp(orig + amt * laplace, 0, 255);
      }
    }
  }
  data.data.set(out);
}

export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
