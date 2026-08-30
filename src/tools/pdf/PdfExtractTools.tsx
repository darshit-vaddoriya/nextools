import React, { useCallback, useEffect, useRef, useState } from 'react';
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
        <ResultCard
          title={`${results.length} images ready`}
          subtitle="Your browser may ask for permission to download multiple files."
          onDownload={() => downloadAll(results)}
          downloadLabel={`Download all (${results.length})`}
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
          onDownload={() => downloadAll([result])} downloadLabel="Download PDF" />
      )}
      {overlay}
    </div>
  );
};

// ─── EXTRACT IMAGES FROM PDF ────────────────────────────────────
export const ExtractImagesTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<{ blob: Blob; name: string }[]>([]);
  const [summary, setSummary] = useState('');
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResults([]);
      setSummary('');
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
          const ops = await page.getOperatorList();
          const { fnArray, argsArray } = ops;
          for (let i = 0; i < fnArray.length; i++) {
            const fn = fnArray[i];
            if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) continue;
            const arg = argsArray[i];
            let obj: unknown;
            let objId: string;
            if (fn === OPS.paintInlineImageXObject) {
              obj = Array.isArray(arg) ? arg[0] : arg;
              objId = `inline-p${p}-${i}`;
            } else {
              objId = Array.isArray(arg) ? String(arg[0]) : '';
              obj = objId ? page.objs.get(objId) : null;
            }
            if (!obj || !objId || seen.has(objId)) continue;
            const o = obj as { width: number; height: number; kind: number; data: Uint8Array };
            if (!o.width || !o.height || !o.data) continue;
            seen.add(objId);
            scanned++;
            const canvas = document.createElement('canvas');
            canvas.width = o.width;
            canvas.height = o.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;
            const im = ctx.createImageData(o.width, o.height);
            const src = o.data;
            const dst = im.data;
            if (o.kind === ImageKind.RGB_24BPP) {
              for (let k = 0, j = 0; k < dst.length; k += 4, j += 3) {
                dst[k] = src[j]; dst[k + 1] = src[j + 1]; dst[k + 2] = src[j + 2]; dst[k + 3] = 255;
              }
            } else if (o.kind === ImageKind.RGBA_32BPP) {
              for (let k = 0, j = 0; k < dst.length; k += 4, j += 4) {
                dst[k] = src[j]; dst[k + 1] = src[j + 1]; dst[k + 2] = src[j + 2]; dst[k + 3] = src[j + 3];
              }
            } else {
              for (let k = 0, j = 0; k < dst.length; k += 4, j++) {
                dst[k] = src[j]; dst[k + 1] = src[j]; dst[k + 2] = src[j]; dst[k + 3] = 255;
              }
            }
            ctx.putImageData(im, 0, 0);
            const { blob, ext } = await canvasExport(canvas, 'image/png');
            out.push({ blob, name: `${baseName(file.name)}_p${p}_${scanned}.${ext}` });
          }
        }
        report(100, 'Done');
        setResults(out);
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
      {results.length > 0 && !isBusy && (
        <ResultCard
          title={summary}
          subtitle="Your browser may ask for permission to download multiple files."
          onDownload={() => downloadAll(results)}
          downloadLabel={`Download all (${results.length})`}
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
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const extract = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setResult(null);
    try {
      await run(async (report) => {
        const pdfjs = await getPdfjs();
        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const chunks: string[] = [];
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
        }
        const text = chunks.join('\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        setResult({ blob, name: `${baseName(file.name)}.txt` });
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
      {result && !isBusy && (
        <ResultCard title="Text extracted" subtitle="Plain text with page markers" onDownload={() => downloadAll([result])} downloadLabel="Download .txt" />
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

export const PdfOcrTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [lang, setLang] = useState('eng');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
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
        for (let p = 1; p <= doc.numPages; p++) {
          report(5 + Math.round((p / doc.numPages) * 88), `Recognizing page ${p}/${doc.numPages}… (large pages take a while)`);
          const page = await doc.getPage(p);
          const canvas = await renderPageToCanvas(page, 2);
          const w2 = workerRef.current;
          if (!w2) throw new Error('OCR engine failed to start.');
          const { data: rec } = await w2.recognize(canvas, { rotateAuto: false });
          const baseViewport = page.getViewport({ scale: 1 });
          const outPage = out.addPage([baseViewport.width, baseViewport.height]);
          const flat = await renderPageToCanvas(page, 1);
          const png = await blobFromCanvas(flat, 'image/png');
          const pdfImg = await out.embedPng(new Uint8Array(await png.arrayBuffer()));
          outPage.drawImage(pdfImg, { x: 0, y: 0, width: outPage.getSize().width, height: outPage.getSize().height });
          const words = (rec as { words?: OcrWord[] }).words ?? [];
          const k = outPage.getSize().width / canvas.width;
          const pageH = outPage.getSize().height;
          for (const w of words) {
            if (!w.text || !w.bbox) continue;
            const fs = Math.max(4, (w.bbox.y1 - w.bbox.y0) * k * 0.9);
            outPage.drawText(w.text, {
              x: w.bbox.x0 * k,
              y: pageH - w.bbox.y1 * k,
              size: fs,
              font,
            });
          }
        }
        report(95, 'Saving searchable PDF…');
        const bytes = await out.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_searchable.pdf` });
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
              Text is placed on top of the scanned page, making the PDF searchable and copyable.
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
      {result && !isBusy && (
        <ResultCard title="Searchable PDF ready" subtitle="Text was recognized and embedded" onDownload={() => downloadAll([result])} downloadLabel="Download PDF" />
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
                  <input className={textInputClass} value={meta[f.key]} onChange={e => set(f.key)(e.target.value)} placeholder={`— not set —`} />
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
        <ResultCard title="Metadata updated" subtitle="A copy with the new properties was created" onDownload={() => downloadAll([result])} downloadLabel="Download PDF" />
      )}
      {overlay}
    </div>
  );
};

// ─── TEXT → PDF ─────────────────────────────────────────────────
export const TextToPdfTool: React.FC = () => {
  const [text, setText] = useState('');
  const [pageSize, setPageSize] = useState('a4');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.clipboardData?.getData('text');
      if (t) setText(t);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  const create = async () => {
    if (!text.trim()) { setErr('Paste or type some text first.'); return; }
    setIsBusy(true);
    setErr(null);
    setResult(null);
    try {
      await run(async (report) => {
        report(10, 'Typesetting…');
        const doc = await PDFDocument.create();
        const font = await doc.embedStandardFont(StandardFonts.Helvetica);
        const size = pageSizeFromSelection(pageSize) ?? pageSizeFromSelection('a4')!;
        const fontSize = 11;
        const leading = 16;
        const margin = 54;
        const maxWidth = size.width - margin * 2;
        let page = doc.addPage([size.width, size.height]);
        let y = size.height - margin;
        const lines: string[] = [];
        for (const raw of text.split(/\r?\n/)) {
          const words = raw.split(' ').filter(Boolean);
          let cur = '';
          for (const w of words) {
            const probe = cur ? `${cur} ${w}` : w;
            if (font.widthOfTextAtSize(probe, fontSize) > maxWidth && cur) {
              lines.push(cur);
              cur = w;
            } else cur = probe;
          }
          lines.push(cur);
        }
        for (const line of lines) {
          if (y < margin + leading) {
            page = doc.addPage([size.width, size.height]);
            y = size.height - margin;
          }
          page.drawText(line || ' ', { x: margin, y, size: fontSize, font });
          y -= leading;
        }
        report(80, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: 'text.pdf' });
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
      <Card title="Your text">
        <FieldLabel>Text (or paste with Ctrl+V)</FieldLabel>
        <textarea
          className={`${textInputClass} h-44 resize-y font-mono`}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste plain text here…"
        />
        <div>
          <FieldLabel>Page size</FieldLabel>
          <Select value={pageSize} options={PAGE_SIZE_OPTIONS.filter(o => o.value !== 'auto')} onChange={setPageSize} />
        </div>
        <ActionButton onClick={create} busy={isBusy} busyLabel="Creating…" variant="success" disabled={!text.trim()}>
          <Type className="w-4 h-4" /> Create PDF
        </ActionButton>
      </Card>
      <ErrorBox message={err} />
      {isBusy && <LoadingBox label="Creating PDF…" />}
      {result && !isBusy && (
        <ResultCard title="PDF created" subtitle={`${formatBytes(result.blob.size)} · classic font (Latin characters)`} onDownload={() => downloadAll([result])} downloadLabel="Download PDF" />
      )}
      {overlay}
    </div>
  );
};
