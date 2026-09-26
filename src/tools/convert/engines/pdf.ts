/** PDF pages → JPG or PNG, one image per page, rendered with pdf.js. */
import type { PDFPageProxy } from 'pdfjs-dist';
import type { ConvFormat } from '../../../config/converters';

/**
 * Render a page for export. The 'print' intent matters: the default 'display'
 * intent paces rendering with requestAnimationFrame, which browsers pause in
 * background tabs — so switching tabs mid-conversion would stall it. Print
 * intent renders straight through, and is the right one for an export anyway.
 */
export async function renderPageForExport(page: PDFPageProxy, scale: number): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');
  await page.render({ canvasContext: ctx, viewport, intent: 'print' } as never).promise;
  return canvas;
}

export async function pdfToImages(
  file: File,
  to: ConvFormat,
  scale: number,
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<{ name: string; blob: Blob }[]> {
  const { getPdfjs } = await import('../../pdf/PdfShared');
  const pdfjs = await getPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let doc;
  try {
    doc = await task.promise;
  } catch {
    throw new Error(`“${file.name}” could not be opened. It may be damaged or password-protected.`);
  }
  const mime = to === 'png' ? 'image/png' : 'image/jpeg';
  const pad = String(doc.numPages).length;
  const out: { name: string; blob: Blob }[] = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    if (signal.aborted) throw new Error('Conversion cancelled.');
    const canvas = await renderPageForExport(await doc.getPage(p), scale);
    if (to !== 'png') {
      // pdf.js leaves unpainted areas transparent; JPG would turn them black.
      const flat = document.createElement('canvas');
      flat.width = canvas.width;
      flat.height = canvas.height;
      const ctx = flat.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, flat.width, flat.height);
      ctx.drawImage(canvas, 0, 0);
      canvas.width = 0;
      out.push({ name: `page-${String(p).padStart(pad, '0')}`, blob: await toBlob(flat, mime) });
    } else {
      out.push({ name: `page-${String(p).padStart(pad, '0')}`, blob: await toBlob(canvas, mime) });
    }
    onProgress((p / doc.numPages) * 95);
  }
  await task.destroy();
  return out;
}

function toBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode the page image.'))), mime, 0.92);
  });
}
