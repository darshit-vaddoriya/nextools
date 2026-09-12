import React, { useCallback, useRef, useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  ImageIcon, Images, ScanText, Type, FileCog, FileText, FilePlus,
} from 'lucide-react';
import { GlobalWorkerOptions, ImageKind, OPS } from 'pdfjs-dist';
import {
  PdfDropzone, SourceFileBar, usePdfSource, ErrorBox, LoadingBox,
  ActionButton, ResultCard, downloadAll, baseName, Card,
  FieldLabel, textInputClass, getPdfjs, renderPageToCanvas, PAGE_SIZE_OPTIONS,
  pageSizeFromSelection,
} from './PdfShared';
import { Select } from '../../components/Select';
import { SelectableResults } from '../../components/ui/SelectableResults';
import { RichTextEditor, type RichTextEditorHandle } from '../../components/ui/RichTextEditor';
import { TextPreview } from '../../components/ui/TextPreview';
import { EmptyState } from '../../components/ui/EmptyState';
import { renderBlocksToPdf } from '../../lib/renderBlocksToPdf';
import { loadImage, blobFromCanvas, canvasExport, formatBytes } from '../image/ImageUtils';
import { createWorker, type Worker } from 'tesseract.js';
import { useExportProgress } from '../image/ExportProgress';
import { errorMessage } from '../../utils/errorMessage';

GlobalWorkerOptions.workerSrc =
  new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const imageTypes = [
  { value: 'png', label: 'PNG (lossless)' },
  { value: 'jpg', label: 'JPG (smaller)' },
  { value: 'webp', label: 'WebP (smallest)' },
];

const ocrLangs = [
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'deu', label: 'German' },
  { value: 'fra', label: 'French' },
  { value: 'ita', label: 'Italian' },
  { value: 'por', label: 'Portuguese' },
  { value: 'rus', label: 'Russian' },
  { value: 'hin', label: 'Hindi' },
  { value: 'ara', label: 'Arabic' },
  { value: 'nld', label: 'Dutch' },
  { value: 'tur', label: 'Turkish' },
  { value: 'pol', label: 'Polish' },
];

async function loadLibDoc(file: File): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e);
    if (/encrypt|password/i.test(msg)) {
      throw new Error('This PDF is password protected. It cannot be edited without the password.', { cause: e });
    }
    throw new Error('Could not read this PDF. It may be corrupted or damaged.', { cause: e });
  }
}

async function readImageForPdf(file: File): Promise<{ bytes: Uint8Array; isPng: boolean }> {
  const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
  const isJpg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);
  if (isPng || isJpg) {
    return { bytes: new Uint8Array(await file.arrayBuffer()), isPng };
  }
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(img, 0, 0);
  const blob = await blobFromCanvas(canvas, 'image/png');
  return { bytes: new Uint8Array(await blob.arrayBuffer()), isPng: true };
}

// ─── PDF → IMAGES ───────────────────────────────────────────────
export const PdfToImagesTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [format, setFormat] = useState('png');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<{ blob: Blob; name: string }[]>([]);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResults([]);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const convert = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setResults([]);
    try {
      await run(async (report) => {
        const pdfjs = await getPdfjs();
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const mime = `image/${format}`;
        const q = format === 'png' ? undefined : 0.92;
        const out: { blob: Blob; name: string }[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          report(Math.round((i / doc.numPages) * 90), `Rendering page ${i}/${doc.numPages}…`);
          const page = await doc.getPage(i);
          const canvas = await renderPageToCanvas(page, 2);
          const { blob, ext } = await canvasExport(canvas, mime, q);
          out.push({ blob, name: `${baseName(file.name)}_page${i}.${ext}` });
        }
        report(100, 'Done');
        setResults(out);
      });
    } catch (e) {
      setErr(errorMessage(e, 'Conversion failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to convert" hint="Each page becomes a separate image" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          <Card title="Output format">
            <FieldLabel>Image format</FieldLabel>
            <Select value={format} options={imageTypes} onChange={setFormat} />
            <ActionButton onClick={convert} busy={isBusy} busyLabel="Converting…" disabled={pageCount === 0}>
              <ImageIcon className="w-4 h-4" /> Convert pages to {format.toUpperCase()}
            </ActionButton>
          </Card>
        </>
      )}
      <ErrorBox message={err || error} />
      {busy && <LoadingBox label="Reading PDF…" />}
      {isBusy && <LoadingBox label="Converting pages…" />}
      {results.length > 0 && !isBusy && (
        <SelectableResults
          items={results}
          title={`${results.length} ${results.length === 1 ? 'image' : 'images'} ready`}
          zipName={`${baseName(file?.name ?? 'pages')}_${format}`}
        />
      )}
      {overlay}
    </div>
  );
};

// ─── IMAGES → PDF ───────────────────────────────────────────────
export const ImagesToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState('auto');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const create = async () => {
    if (!files.length) return;
    setIsBusy(true);
    setErr(null);
    setResult(null);
    try {
      await run(async (report) => {
        report(5, 'Preparing images…');
        const doc = await PDFDocument.create();
        const fixed = pageSizeFromSelection(pageSize);
        for (let i = 0; i < files.length; i++) {
          report(10 + Math.round((i / files.length) * 80), `Placing image ${i + 1}/${files.length}…`);
          const { bytes, isPng } = await readImageForPdf(files[i]);
          const img = await loadImage(files[i]);
          let w: number;
          let h: number;
          if (fixed) {
            w = fixed.width;
            h = fixed.height;
          } else {
            w = img.naturalWidth * 0.75;
            h = img.naturalHeight * 0.75;
          }
          const page = doc.addPage([w, h]);
          const pdfImg = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
          const margin = 24;
          const s = Math.min((w - 2 * margin) / pdfImg.width, (h - 2 * margin) / pdfImg.height);
          const dw = pdfImg.width * s;
          const dh = pdfImg.height * s;
          page.drawImage(pdfImg, { x: (w - dw) / 2, y: (h - dh) / 2, width: dw, height: dh });
        }
        report(95, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: files.length === 1 ? `${baseName(files[0].name)}.pdf` : 'images.pdf' });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Could not create the PDF.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PdfDropzone onFiles={(list) => { setFiles(list); setResult(null); setErr(null); }} multiple
        accept="image/*"
        label="Select images (PNG, JPG, WebP…)" hint="They are merged into a single PDF, processed entirely on your device" />
      {files.length > 0 && (
        <Card title={`${files.length} image${files.length === 1 ? '' : 's'} ready`}>
          <ul className="space-y-1.5 text-xs  text-muted-foreground max-h-44 overflow-auto">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2 justify-between">
                <span className="flex items-center gap-1.5 truncate">
                  <Images className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{f.name}</span>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
          <div>
            <FieldLabel>Page size</FieldLabel>
            <Select value={pageSize} options={PAGE_SIZE_OPTIONS} onChange={setPageSize} />
          </div>
          <ActionButton onClick={create} busy={isBusy} busyLabel="Creating PDF…" variant="success">
            <FilePlus className="w-4 h-4" /> Create PDF ({files.length})
          </ActionButton>
        </Card>
      )}
      <ErrorBox message={err} />
      {isBusy && <LoadingBox label="Creating PDF…" />}
      {result && !isBusy && (
        <ResultCard title="PDF created" subtitle={`${result.blob.size ? formatBytes(result.blob.size) : ''} · ${files.length} pages`}
          onDownload={() => downloadAll([result])} downloadLabel="Download PDF" blob={result.blob} filename={result.name} />
      )}
      {overlay}
    </div>
  );
};

// ─── EXTRACT IMAGES FROM PDF ────────────────────────────────────
/** A decoded image as pdf.js hands it over. */
interface PdfImageObject {
  width: number;
  height: number;
  kind?: number;
  data?: Uint8Array | Uint8ClampedArray | null;
  /** pdf.js 6 decodes images in the worker and returns an ImageBitmap. */
  bitmap?: ImageBitmap | null;
}

/**
 * Resolve an image XObject.
 *
 * The synchronous `objs.get(id)` throws "object isn't resolved yet" unless
 * the object happens to be ready, so the callback form is the only reliable
 * way to read images out of an operator list.
 */
function resolveImageObject(
  objs: { get(id: string, cb: (obj: unknown) => void): void },
  id: string,
  timeoutMs = 8000,
): Promise<PdfImageObject | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: PdfImageObject | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    try {
      objs.get(id, (obj) => finish((obj as PdfImageObject) ?? null));
    } catch {
      finish(null);
    }
    // A damaged object may never resolve; don't hang the whole extraction.
    window.setTimeout(() => finish(null), timeoutMs);
  });
}

/** Paint a decoded image object onto a canvas, whichever form it arrived in. */
function imageObjectToCanvas(obj: PdfImageObject): HTMLCanvasElement | null {
  const { width, height } = obj;
  if (!width || !height) return null;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Preferred path on pdf.js 6, the worker already decoded the pixels.
  if (obj.bitmap) {
    ctx.drawImage(obj.bitmap, 0, 0);
    return canvas;
  }

  // Fallback: raw samples, laid out according to `kind`.
  const src = obj.data;
  if (!src) return null;
  const image = ctx.createImageData(width, height);
  const dst = image.data;
  if (obj.kind === ImageKind.RGB_24BPP) {
    for (let k = 0, j = 0; k < dst.length; k += 4, j += 3) {
      dst[k] = src[j]; dst[k + 1] = src[j + 1]; dst[k + 2] = src[j + 2]; dst[k + 3] = 255;
    }
  } else if (obj.kind === ImageKind.RGBA_32BPP) {
    dst.set(src.subarray(0, dst.length));
  } else {
    for (let k = 0, j = 0; k < dst.length; k += 4, j++) {
      dst[k] = src[j]; dst[k + 1] = src[j]; dst[k + 2] = src[j]; dst[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export const ExtractImagesTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<{ blob: Blob; name: string }[]>([]);
  const [summary, setSummary] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResults([]);
      setSummary('');
      setHasRun(false);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const extract = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setResults([]);
    setSummary('');
    setHasRun(false);
    try {
      await run(async (report) => {
        const pdfjs = await getPdfjs();
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const seen = new Set<string>();
        const out: { blob: Blob; name: string }[] = [];
        let scanned = 0;
        for (let p = 1; p <= doc.numPages; p++) {
          report(Math.round((p / doc.numPages) * 85), `Scanning page ${p}/${doc.numPages}…`);
          const page = await doc.getPage(p);
          // Rendering is what makes the worker decode the page's image
          // XObjects; until then there is nothing to fetch.
          await renderPageToCanvas(page, 0.4);
          const ops = await page.getOperatorList();
          const { fnArray, argsArray } = ops;

          for (let i = 0; i < fnArray.length; i++) {
            const fn = fnArray[i];
            if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) continue;
            const arg = argsArray[i];

            let obj: PdfImageObject | null;
            let objId: string;
            if (fn === OPS.paintInlineImageXObject) {
              // Inline images travel in the operator list itself.
              obj = (Array.isArray(arg) ? arg[0] : arg) as PdfImageObject;
              objId = `inline-p${p}-${i}`;
            } else {
              objId = Array.isArray(arg) ? String(arg[0]) : '';
              obj = objId ? await resolveImageObject(page.objs, objId) : null;
            }

            if (!obj || !objId || seen.has(objId)) continue;
            seen.add(objId);

            const canvas = imageObjectToCanvas(obj);
            if (!canvas) continue;

            scanned++;
            const { blob, ext } = await canvasExport(canvas, 'image/png');
            out.push({ blob, name: `${baseName(file.name)}_p${p}_${scanned}.${ext}` });
          }
        }
        report(100, 'Done');
        setResults(out);
        setHasRun(true);
        setSummary(`${out.length} image${out.length === 1 ? '' : 's'} found`);
      });
    } catch (e) {
      setErr(errorMessage(e, 'Could not extract images.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to extract images from" hint="Finds and exports every embedded image as PNG" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          <ActionButton onClick={extract} busy={isBusy} busyLabel="Extracting…" disabled={pageCount === 0}>
            <Images className="w-4 h-4" /> Extract images
          </ActionButton>
        </>
      )}
      <ErrorBox message={err || error} />
      {busy && <LoadingBox label="Reading PDF…" />}
      {isBusy && <LoadingBox label="Extracting images…" />}
      {hasRun && results.length === 0 && !isBusy && (
        <EmptyState
          icon={Images}
          title="No images in this PDF"
          description="Every page here is text or vector drawing, so there are no embedded photos or graphics to pull out."
        />
      )}
      {results.length > 0 && !isBusy && (
        <SelectableResults
          items={results}
          title={summary}
          zipName={`${baseName(file?.name ?? 'pdf')}_images`}
        />
      )}
      {overlay}
    </div>
  );
};

// ─── EXTRACT TEXT ───────────────────────────────────────────────
export const ExtractTextTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [isEmptyResult, setIsEmptyResult] = useState(false);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setText('');
      setIsEmptyResult(false);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const extract = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setText('');
    setIsEmptyResult(false);
    try {
      await run(async (report) => {
        const pdfjs = await getPdfjs();
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const chunks: string[] = [];
        let hasAnyText = false;
        for (let p = 1; p <= doc.numPages; p++) {
          report(Math.round((p / doc.numPages) * 90), `Reading page ${p}/${doc.numPages}…`);
          const page = await doc.getPage(p);
          const content = await page.getTextContent();
          const line = content.items
            .map(it => {
              const s = (it as { str?: string }).str;
              return typeof s === 'string' ? s : '';
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          chunks.push(`Page ${p}\n${line}\n`);
          hasAnyText = hasAnyText || line.length > 0;
        }
        setText(chunks.join('\n'));
        // A scanned PDF has pages but no text layer, say so rather than
        // handing over a file containing nothing but page markers.
        setIsEmptyResult(!hasAnyText);
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Could not extract text.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to read text from" hint="Extracts the selectable text layer into a .txt file" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          <ActionButton onClick={extract} busy={isBusy} busyLabel="Extracting…" disabled={pageCount === 0}>
            <FileText className="w-4 h-4" /> Extract text
          </ActionButton>
        </>
      )}
      <ErrorBox message={err || error} />
      {busy && <LoadingBox label="Reading PDF…" />}
      {isBusy && <LoadingBox label="Extracting text…" />}

      {isEmptyResult && !isBusy && (
        <EmptyState
          icon={ScanText}
          title="This PDF has no text layer"
          description="The pages are images, so there is nothing to copy out. Run it through PDF OCR to recognize the text first."
        />
      )}

      {text && !isEmptyResult && !isBusy && (
        <TextPreview
          text={text}
          filename={`${baseName(file?.name ?? 'document')}.txt`}
          title="Extracted text"
        />
      )}
      {overlay}
    </div>
  );
};

// ─── PDF OCR (scanned → searchable text) ────────────────────────
interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Flatten tesseract's block → paragraph → line → word tree.
 *
 * `recognize()` only fills `blocks` when asked for it via the output flags;
 * there is no top-level `words` array in tesseract.js v7.
 */
function wordsFromResult(page: { blocks?: unknown }): OcrWord[] {
  const words: OcrWord[] = [];
  const blocks = (page.blocks ?? []) as {
    paragraphs?: { lines?: { words?: OcrWord[] }[] }[];
  }[];
  for (const block of blocks) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        for (const word of line.words ?? []) {
          if (word?.text?.trim() && word.bbox) words.push(word);
        }
      }
    }
  }
  return words;
}

/** Helvetica is WinAnsi-encoded; anything outside it would throw on draw. */
const isEncodable = (text: string) => /^[\x20-\x7E\xA0-\xFF]*$/.test(text);

export const PdfOcrTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [lang, setLang] = useState('eng');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [notice, setNotice] = useState('');
  const { run, overlay } = useExportProgress();
  const workerRef = useRef<Worker | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const runOcr = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setResult(null);
    setRecognizedText('');
    setNotice('');
    try {
      await run(async (report) => {
        report(2, 'Loading OCR engine…');
        const w = await createWorker(lang);
        workerRef.current = w;
        const pdfjs = await getPdfjs();
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const out = await PDFDocument.create();
        const font = await out.embedStandardFont(StandardFonts.Helvetica);

        const pageTexts: string[] = [];
        let wordsPlaced = 0;
        let wordsSkipped = 0;

        for (let p = 1; p <= doc.numPages; p++) {
          report(5 + Math.round(((p - 1) / doc.numPages) * 88), `Recognizing page ${p}/${doc.numPages}… (large pages take a while)`);
          const page = await doc.getPage(p);
          // One render serves both OCR and the embedded image, at 2x so the
          // recognizer sees enough detail and the page stays sharp.
          const canvas = await renderPageToCanvas(page, 2);
          const w2 = workerRef.current;
          if (!w2) throw new Error('OCR engine failed to start.');

          // `blocks` must be requested explicitly, without it the result
          // carries only plain text and the searchable layer comes out empty.
          const { data: rec } = await w2.recognize(canvas, { rotateAuto: false }, { text: true, blocks: true });

          const baseViewport = page.getViewport({ scale: 1 });
          const outPage = out.addPage([baseViewport.width, baseViewport.height]);
          const png = await blobFromCanvas(canvas, 'image/png');
          const pdfImg = await out.embedPng(new Uint8Array(await png.arrayBuffer()));
          const { width: pageW, height: pageH } = outPage.getSize();
          outPage.drawImage(pdfImg, { x: 0, y: 0, width: pageW, height: pageH });

          pageTexts.push(rec.text ?? '');

          const words = wordsFromResult(rec as { blocks?: unknown });
          const k = pageW / canvas.width;

          for (const word of words) {
            const text = word.text.trim();
            // Helvetica can't encode non-Latin scripts; skip rather than throw.
            if (!isEncodable(text)) { wordsSkipped += 1; continue; }
            const size = Math.max(4, (word.bbox.y1 - word.bbox.y0) * k * 0.9);
            outPage.drawText(text, {
              x: word.bbox.x0 * k,
              y: pageH - word.bbox.y1 * k,
              size,
              font,
              // Invisible: the scan stays legible, the text stays selectable.
              opacity: 0,
            });
            wordsPlaced += 1;
          }
        }

        report(95, 'Saving searchable PDF…');
        const bytes = await out.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_searchable.pdf` });
        setRecognizedText(pageTexts.join('\n\n').trim());

        if (wordsPlaced === 0) {
          setNotice(wordsSkipped > 0
            ? `Recognized ${wordsSkipped} words, but this language uses characters the standard PDF font can’t store. The text below is complete, the PDF itself stays image-only.`
            : 'No text was found on these pages. If the scan is faint or skewed, a higher-quality scan usually helps.');
        } else if (wordsSkipped > 0) {
          setNotice(`${wordsSkipped} words used characters the standard PDF font can’t store and were left out of the searchable layer.`);
        }

        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'OCR failed.'));
    } finally {
      const w = workerRef.current;
      workerRef.current = null;
      if (w) w.terminate().catch(() => {});
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a scanned PDF" hint="Recognizes text in scans and adds a searchable text layer" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          <Card title="OCR options">
            <FieldLabel>Language</FieldLabel>
            <Select value={lang} options={ocrLangs} onChange={setLang} />
            <p className="text-[11px]  text-muted-foreground leading-relaxed">
              The first run downloads the language pack for your chosen language.
              An invisible text layer is placed over the scan, so the page looks unchanged
              but the text becomes searchable and selectable.
            </p>
            <ActionButton onClick={runOcr} busy={isBusy} busyLabel="Recognizing…" disabled={pageCount === 0}>
              <ScanText className="w-4 h-4" /> Recognize text
            </ActionButton>
          </Card>
        </>
      )}
      <ErrorBox message={err || error} />
      {busy && <LoadingBox label="Reading PDF…" />}
      {isBusy && <LoadingBox label="Running OCR…" />}
      {notice && !isBusy && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-warning/30 bg-warning/[0.07]
                      px-4 py-3 text-sm leading-relaxed text-foreground">
          <FileCog className="w-4 h-4 mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <span>{notice}</span>
        </p>
      )}
      {result && !isBusy && (
        <ResultCard title="Searchable PDF ready" subtitle="An invisible text layer was added over the scan" onDownload={() => downloadAll([result])} downloadLabel="Download PDF" blob={result.blob} filename={result.name} />
      )}
      {recognizedText && !isBusy && (
        <TextPreview
          text={recognizedText}
          filename={`${baseName(file?.name ?? 'scan')}_ocr.txt`}
          title="Recognized text"
        />
      )}
      {overlay}
    </div>
  );
};

// ─── METADATA EDITOR ────────────────────────────────────────────
export const MetadataTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [meta, setMeta] = useState({ title: '', author: '', subject: '', keywords: '', creator: '', producer: '' });
  const { run, overlay } = useExportProgress();

  const set = (key: keyof typeof meta) => (v: string) => setMeta(m => ({ ...m, [key]: v }));

  const loadFile = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (!f) { setErr('Please select a valid PDF file.'); return; }
    setErr(null);
    setResult(null);
    (async () => {
      try {
        const doc = await PDFDocument.load(await f.arrayBuffer());
        setMeta({
          title: doc.getTitle() ?? '',
          author: doc.getAuthor() ?? '',
          subject: doc.getSubject() ?? '',
          keywords: doc.getKeywords() ?? '',
          creator: doc.getCreator() ?? '',
          producer: doc.getProducer() ?? '',
        });
        setFile(f);
      } catch (e) {
        setErr(errorMessage(e, 'Could not read the PDF metadata.'));
      }
    })();
  }, []);

  const save = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setResult(null);
    try {
      await run(async (report) => {
        report(10, 'Reading document…');
        const doc = await loadLibDoc(file);
        if (meta.title.trim()) doc.setTitle(meta.title.trim());
        if (meta.author.trim()) doc.setAuthor(meta.author.trim());
        if (meta.subject.trim()) doc.setSubject(meta.subject.trim());
        const kw = meta.keywords.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
        if (kw.length) doc.setKeywords(kw);
        if (meta.creator.trim()) doc.setCreator(meta.creator.trim());
        if (meta.producer.trim()) doc.setProducer(meta.producer.trim());
        report(70, 'Saving…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_metadata.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Could not save metadata.'));
    } finally {
      setIsBusy(false);
    }
  };

  const fields: { key: keyof typeof meta; label: string }[] = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'subject', label: 'Subject' },
    { key: 'keywords', label: 'Keywords (comma separated)' },
    { key: 'creator', label: 'Creator' },
    { key: 'producer', label: 'Producer' },
  ];

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={loadFile} label="Select a PDF to view metadata" hint="Read and edit title, author, keywords and more" />
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 rounded-xl border   bg-muted border-border text-xs">
            <div className="min-w-0 flex-1">
              <span className="font-semibold  text-foreground block truncate">{file.name}</span>
              <span className="text-[10.5px] text-muted-foreground font-mono">{formatBytes(file.size)}</span>
            </div>
            <button
              onClick={() => { setFile(null); setResult(null); setErr(null); }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              Choose different file
            </button>
          </div>
          <Card title="Document properties">
            <div className="space-y-3">
              {fields.map(f => (
                <div key={f.key}>
                  <FieldLabel>{f.label}</FieldLabel>
                  <input className={textInputClass} value={meta[f.key]} onChange={e => set(f.key)(e.target.value)} placeholder={`, not set, `} />
                </div>
              ))}
            </div>
            <ActionButton onClick={save} busy={isBusy} busyLabel="Saving…" variant="success" disabled={!file}>
              <FileCog className="w-4 h-4" /> Save metadata
            </ActionButton>
          </Card>
        </>
      )}
      <ErrorBox message={err} />
      {isBusy && <LoadingBox label="Saving metadata…" />}
      {result && !isBusy && (
        <ResultCard title="Metadata updated" subtitle="A copy with the new properties was created" onDownload={() => downloadAll([result])} downloadLabel="Download PDF" blob={result.blob} filename={result.name} />
      )}
      {overlay}
    </div>
  );
};

// ─── TEXT → PDF ─────────────────────────────────────────────────
export const TextToPdfTool: React.FC = () => {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [pageSize, setPageSize] = useState('a4');
  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const create = async () => {
    const blocks = editorRef.current?.getBlocks() ?? [];
    const hasContent = blocks.some(b => b.runs.some(r => r.text.trim()));
    if (!hasContent) { setErr('Type or paste some text first.'); return; }

    setIsBusy(true);
    setErr(null);
    setResult(null);
    try {
      await run(async (report) => {
        report(10, 'Typesetting…');
        const size = pageSizeFromSelection(pageSize) ?? pageSizeFromSelection('a4')!;
        const bytes = await renderBlocksToPdf(blocks, {
          width: size.width,
          height: size.height,
          onProgress: (p) => report(Math.max(10, p), 'Typesetting…'),
        });
        report(95, 'Saving PDF…');
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: 'document.pdf' });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Could not create the PDF.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <RichTextEditor
        ref={editorRef}
        onStatsChange={setStats}
        placeholder="Start typing, or paste your text. Use the toolbar to add headings, lists and emphasis, they all carry through to the PDF."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-xs text-muted-foreground">
          <span className="font-mono">{stats.words}</span> {stats.words === 1 ? 'word' : 'words'}
          {' · '}
          <span className="font-mono">{stats.characters}</span> characters
        </p>
      </div>

      <Card title="Page setup">
        <FieldLabel>Page size</FieldLabel>
        <Select value={pageSize} options={PAGE_SIZE_OPTIONS.filter(o => o.value !== 'auto')} onChange={setPageSize} />
        <ActionButton onClick={create} busy={isBusy} busyLabel="Creating…" variant="success" disabled={stats.words === 0}>
          <Type className="w-4 h-4" /> Create PDF
        </ActionButton>
      </Card>

      <ErrorBox message={err} />
      {isBusy && <LoadingBox label="Creating PDF…" />}
      {result && !isBusy && (
        <ResultCard title="PDF created" subtitle={`${formatBytes(result.blob.size)} · Helvetica (Latin characters)`} onDownload={() => downloadAll([result])} downloadLabel="Download PDF" blob={result.blob} filename={result.name} />
      )}
      {overlay}
    </div>
  );
};
