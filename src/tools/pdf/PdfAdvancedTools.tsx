import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import {
  Crop, AlignVerticalJustifyCenter, FormInput, Layers, Wrench,
  FileText, Globe, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
} from 'lucide-react';
import {
  PdfDropzone, SourceFileBar, usePdfSource, ErrorBox, LoadingBox,
  ActionButton, ResultCard, downloadAll, baseName, Card, FieldLabel,
  textInputClass, getPdfjs, isPdfFile, renderPageToCanvas,
} from './PdfShared';
import { Select } from '../../components/Select';
import { hexToRgb } from '../image/ImageUtils';
import { useExportProgress } from '../image/ExportProgress';
import { errorMessage } from '../../utils/errorMessage';

async function loadLibDoc(file: File, opts: { ignoreEncryption?: boolean } = {}): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await file.arrayBuffer(), opts);
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e);
    if (/encrypt|password/i.test(msg)) {
      throw new Error('This PDF is password protected and cannot be processed without the password.', { cause: e });
    }
    throw new Error('Could not read this PDF. It may be corrupted or damaged.', { cause: e });
  }
}

const useFileErr = () => {
  const [err, setErr] = useState<string | null>(null);
  return { err, setErr };
};

// ─── CROP PDF ───────────────────────────────────────────────────
export const PdfCropTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(isPdfFile);
    if (f) { setResult(null); setErr(null); load(f); } else setErr('Please select a valid PDF file.');
  }, [load, setErr]);

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const pages = doc.getPages();
        for (const page of pages) {
          const { width, height } = page.getSize();
          const box = {
            x: Math.min(left, width - right - 1),
            y: Math.min(bottom, height - top - 1),
            width: Math.max(1, width - left - right),
            height: Math.max(1, height - top - bottom),
          };
          page.setCropBox(box.x, box.y, box.width, box.height);
        }
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_cropped.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Cropping failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to crop" hint="Trim margins from every page in your browser" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card title="Crop margins (points, 72pt = 1 inch)">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Top</FieldLabel>
                  <input type="number" min={0} value={top} onChange={(e) => setTop(Math.max(0, Number(e.target.value) || 0))} className={textInputClass} />
                </div>
                <div>
                  <FieldLabel>Bottom</FieldLabel>
                  <input type="number" min={0} value={bottom} onChange={(e) => setBottom(Math.max(0, Number(e.target.value) || 0))} className={textInputClass} />
                </div>
                <div>
                  <FieldLabel>Left</FieldLabel>
                  <input type="number" min={0} value={left} onChange={(e) => setLeft(Math.max(0, Number(e.target.value) || 0))} className={textInputClass} />
                </div>
                <div>
                  <FieldLabel>Right</FieldLabel>
                  <input type="number" min={0} value={right} onChange={(e) => setRight(Math.max(0, Number(e.target.value) || 0))} className={textInputClass} />
                </div>
              </div>
              <ActionButton onClick={apply} busy={isBusy} busyLabel="Cropping…" disabled={pageCount === 0}>
                <Crop className="w-4 h-4" /> Crop PDF
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard title="Cropped PDF ready" subtitle="Margins were trimmed on every page."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} downloadLabel={result.name} />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── HEADER & FOOTER ────────────────────────────────────────────
const HF_ALIGN = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const PdfHeaderFooterTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('{page} / {pages}');
  const [align, setAlign] = useState('center');
  const [color, setColor] = useState('#334155');
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(isPdfFile);
    if (f) { setResult(null); setErr(null); load(f); } else setErr('Please select a valid PDF file.');
  }, [load, setErr]);

  const drawLine = (page: import('pdf-lib').PDFPage, font: PDFFont, text: string, y: number, size: number, col: ReturnType<typeof rgb>) => {
    if (!text) return;
    const { width } = page.getSize();
    const w = font.widthOfTextAtSize(text, size);
    const margin = 28;
    let x = (width - w) / 2;
    if (align === 'left') x = margin;
    if (align === 'right') x = width - margin - w;
    page.drawText(text, { x, y, size, font, color: col });
  };

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const font = await doc.embedStandardFont(StandardFonts.Helvetica);
        const col = rgb(...hexToRgb(color).map((c) => c / 255) as [number, number, number]);
        const pages = doc.getPages();
        for (let i = 0; i < pages.length; i++) {
          report(Math.round(10 + (75 * i) / pages.length), `Stamping ${i + 1}/${pages.length}…`);
          const page = pages[i];
          const { height } = page.getSize();
          const fill = (t: string) => t.replaceAll('{page}', String(i + 1)).replaceAll('{pages}', String(pages.length));
          drawLine(page, font, fill(headerText), height - 34, 9, col);
          drawLine(page, font, fill(footerText), 24, 9, col);
        }
        report(90, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_header_footer.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Adding header/footer failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF" hint="Insert header and footer text on every page" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card title="Header & footer text">
              <div>
                <FieldLabel>Header text (use {'{page}'} and {'{pages}'} as tokens)</FieldLabel>
                <input value={headerText} onChange={(e) => setHeaderText(e.target.value)} className={textInputClass} placeholder="My Document" />
              </div>
              <div>
                <FieldLabel>Footer text</FieldLabel>
                <input value={footerText} onChange={(e) => setFooterText(e.target.value)} className={textInputClass} placeholder="Page {page} of {pages}" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Alignment</FieldLabel>
                  <Select value={align} onChange={setAlign} options={HF_ALIGN} />
                </div>
                <div className="flex items-center gap-3">
                  <FieldLabel>Color</FieldLabel>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 rounded-lg border border-border cursor-pointer" />
                </div>
              </div>
              <ActionButton onClick={apply} busy={isBusy} busyLabel="Applying…" disabled={pageCount === 0}>
                <AlignVerticalJustifyCenter className="w-4 h-4" /> Add Header & Footer
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard title="Header & footer added" subtitle="Applied to every page."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} downloadLabel={result.name} />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── FILL PDF FORMS ─────────────────────────────────────────────
interface FormFieldState { name: string; type: 'text' | 'checkbox' | 'unsupported'; value: string; checked: boolean; }

export const PdfFillFormsTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [fields, setFields] = useState<FormFieldState[]>([]);
  const [scanning, setScanning] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find(isPdfFile);
    if (!f) { setErr('Please select a valid PDF file.'); return; }
    setResult(null);
    setErr(null);
    setFields([]);
    await load(f);
  }, [load, setErr]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setScanning(true);
    (async () => {
      try {
        const doc = await loadLibDoc(file);
        const form = doc.getForm();
        const list: FormFieldState[] = form.getFields().map((field) => {
          const name = field.getName();
          const ctor = field.constructor.name;
          if (ctor === 'PDFCheckBox') return { name, type: 'checkbox', value: '', checked: false };
          if (ctor === 'PDFTextField') return { name, type: 'text', value: '', checked: false };
          return { name, type: 'unsupported', value: '', checked: false };
        });
        if (!cancelled) setFields(list);
      } catch {
        if (!cancelled) setFields([]);
      } finally {
        if (!cancelled) setScanning(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(10, 'Filling form fields…');
        const doc = await loadLibDoc(file);
        const form = doc.getForm();
        for (const f of fields) {
          try {
            if (f.type === 'text') form.getTextField(f.name).setText(f.value);
            if (f.type === 'checkbox') {
              const cb = form.getCheckBox(f.name);
              if (f.checked) cb.check(); else cb.uncheck();
            }
          } catch { /* skip fields that changed shape */ }
        }
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_filled.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Filling the form failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  const supported = fields.filter((f) => f.type !== 'unsupported');

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a fillable PDF" hint="Fill AcroForm text fields and checkboxes" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {(busy || scanning) && <LoadingBox label="Scanning form fields…" />}
          {!busy && !scanning && (
            <Card title={supported.length ? `${supported.length} form field${supported.length === 1 ? '' : 's'} found` : 'No fillable fields found'}>
              {supported.length === 0 && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  This PDF has no AcroForm text fields or checkboxes that can be filled here.
                </p>
              )}
              {supported.map((f) => (
                <div key={f.name}>
                  <FieldLabel>{f.name}</FieldLabel>
                  {f.type === 'text' ? (
                    <input
                      value={f.value}
                      onChange={(e) => setFields((prev) => prev.map((p, idx) => idx === fields.indexOf(f) ? { ...p, value: e.target.value } : p))}
                      className={textInputClass}
                    />
                  ) : (
                    <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={f.checked}
                        onChange={(e) => setFields((prev) => prev.map((p, idx) => idx === fields.indexOf(f) ? { ...p, checked: e.target.checked } : p))}
                        className="w-4 h-4 accent-primary"
                      />
                      <span>Checked</span>
                    </label>
                  )}
                </div>
              ))}
              {supported.length > 0 && (
                <ActionButton onClick={apply} busy={isBusy} busyLabel="Filling…">
                  <FormInput className="w-4 h-4" /> Fill & Save PDF
                </ActionButton>
              )}
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard title="Form filled" subtitle="Values were written into the PDF form."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} downloadLabel={result.name} />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── FLATTEN PDF ────────────────────────────────────────────────
export const PdfFlattenTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource(0);
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(isPdfFile);
    if (f) { setResult(null); setErr(null); load(f); } else setErr('Please select a valid PDF file.');
  }, [load, setErr]);

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(10, 'Reading document…');
        const doc = await loadLibDoc(file);
        report(40, 'Flattening form fields…');
        try {
          doc.getForm().flatten();
        } catch (e) {
          throw new Error('This PDF has no form to flatten, or its fields could not be flattened.', { cause: e });
        }
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_flattened.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Flattening failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to flatten" hint="Bake form fields and annotations into the page content" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Reading PDF…" />}
          {!busy && (
            <Card>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Flattening permanently merges interactive form fields (and their current values) into
                the static page content. The result is no longer fillable.
              </p>
              <ActionButton onClick={apply} busy={isBusy} busyLabel="Flattening…" disabled={pageCount === 0}>
                <Layers className="w-4 h-4" /> Flatten PDF
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard title="Flattened PDF ready" subtitle="Form fields are now static page content."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} downloadLabel={result.name} />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── REPAIR PDF ─────────────────────────────────────────────────
export const PdfRepairTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(isPdfFile);
    if (f) { setResult(null); setErr(null); setFile(f); } else setErr('Please select a valid PDF file.');
  }, [setErr]);

  const apply = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(10, 'Attempting to read damaged file…');
        const doc = await loadLibDoc(file, { ignoreEncryption: true });
        report(50, 'Rebuilding document structure…');
        const bytes = await doc.save({ useObjectStreams: false });
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        setResult({ blob: new Blob([buf], { type: 'application/pdf' }), name: `${baseName(file.name)}_repaired.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'This file is too damaged to repair automatically.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a damaged PDF" hint="Best-effort repair by rebuilding the file structure" />
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted border-border text-xs">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-foreground block truncate">{file.name}</span>
            </div>
            <button onClick={() => { setFile(null); setResult(null); }} className="text-muted-foreground hover:text-danger text-xs">Change</button>
          </div>
          <Card>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This attempts a best-effort fix by tolerantly parsing the file and rewriting its internal
              structure from scratch. It cannot recover data that is truly missing, but it often fixes
              files that fail to open due to structural corruption.
            </p>
            <ActionButton onClick={apply} busy={isBusy} busyLabel="Repairing…">
              <Wrench className="w-4 h-4" /> Attempt Repair
            </ActionButton>
          </Card>
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard title="Repair attempt succeeded" subtitle="Try opening the repaired file, always keep your original as backup."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} downloadLabel={result.name} />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── PDF VIEWER ─────────────────────────────────────────────────
export const PdfViewerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfjsDoc, setPdfjsDoc] = useState<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [busy, setBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find(isPdfFile);
    if (!f) { setErr('Please select a valid PDF file.'); return; }
    setErr(null);
    setBusy(true);
    try {
      const pdfjs = await getPdfjs();
      const data = new Uint8Array(await f.arrayBuffer());
      const doc = await pdfjs.getDocument({ data }).promise;
      setFile(f);
      setPdfjsDoc(doc);
      setPageCount(doc.numPages);
      setPageNum(1);
    } catch (e) {
      setErr(errorMessage(e, 'Could not open this PDF.'));
    } finally {
      setBusy(false);
    }
  }, [setErr]);

  useEffect(() => {
    if (!pdfjsDoc) return;
    let cancelled = false;
    (async () => {
      const page = await pdfjsDoc.getPage(pageNum);
      const canvas = await renderPageToCanvas(page, scale);
      if (cancelled) return;
      const target = canvasRef.current;
      if (!target) return;
      target.width = canvas.width;
      target.height = canvas.height;
      const ctx = target.getContext('2d');
      ctx?.drawImage(canvas, 0, 0);
    })();
    return () => { cancelled = true; };
  }, [pdfjsDoc, pageNum, scale]);

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to view" hint="Browse pages without leaving your browser" />
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted border-border text-xs">
            <span className="font-semibold text-foreground truncate flex-1">{file.name}</span>
            <button onClick={() => { setFile(null); setPdfjsDoc(null); }} className="text-muted-foreground hover:text-danger">Change</button>
          </div>
          {busy && <LoadingBox label="Loading PDF…" />}
          <ErrorBox message={err} />
          {pdfjsDoc && !busy && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setPageNum((p) => Math.max(1, p - 1))} disabled={pageNum <= 1} className="btn-secondary text-xs px-2.5 py-2 disabled:opacity-40">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-muted-foreground">{pageNum} / {pageCount}</span>
                  <button onClick={() => setPageNum((p) => Math.min(pageCount, p + 1))} disabled={pageNum >= pageCount} className="btn-secondary text-xs px-2.5 py-2 disabled:opacity-40">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setScale((s) => Math.max(0.4, s - 0.2))} className="btn-secondary text-xs px-2.5 py-2"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="btn-secondary text-xs px-2.5 py-2"><ZoomIn className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-muted p-3 overflow-auto max-h-[70vh] flex justify-center">
                <canvas ref={canvasRef} className="shadow-card bg-white" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

// ─── COMPARE PDFS ───────────────────────────────────────────────
type DiffToken = { text: string; type: 'same' | 'add' | 'del' };

function diffWords(a: string[], b: string[]): DiffToken[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffToken[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ text: a[i], type: 'same' }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ text: a[i], type: 'del' }); i++; }
    else { out.push({ text: b[j], type: 'add' }); j++; }
  }
  while (i < n) { out.push({ text: a[i], type: 'del' }); i++; }
  while (j < m) { out.push({ text: b[j], type: 'add' }); j++; }
  return out;
}

async function extractPagesText(file: File): Promise<string[]> {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => (it as { str?: string }).str ?? '').join(' '));
  }
  return pages;
}

export const PdfCompareTool: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [diffs, setDiffs] = useState<DiffToken[][] | null>(null);
  const [stats, setStats] = useState<{ added: number; removed: number } | null>(null);

  const compare = useCallback(async (a: File, b: File) => {
    setBusy(true);
    setErr(null);
    setDiffs(null);
    try {
      const [pagesA, pagesB] = await Promise.all([extractPagesText(a), extractPagesText(b)]);
      const pageCount = Math.max(pagesA.length, pagesB.length);
      const result: DiffToken[][] = [];
      let added = 0, removed = 0;
      for (let p = 0; p < pageCount; p++) {
        const wordsA = (pagesA[p] ?? '').split(/\s+/).filter(Boolean);
        const wordsB = (pagesB[p] ?? '').split(/\s+/).filter(Boolean);
        const tokens = diffWords(wordsA, wordsB);
        for (const t of tokens) { if (t.type === 'add') added++; if (t.type === 'del') removed++; }
        result.push(tokens);
      }
      setDiffs(result);
      setStats({ added, removed });
    } catch (e) {
      setErr(errorMessage(e, 'Could not compare these PDFs.'));
    } finally {
      setBusy(false);
    }
  }, [setErr]);

  useEffect(() => {
    if (fileA && fileB) compare(fileA, fileB);
  }, [fileA, fileB, compare]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PdfDropzone
          onFiles={(files) => { const f = files.find(isPdfFile); if (f) setFileA(f); }}
          label={fileA ? fileA.name : 'Original PDF'}
          hint="First document"
        />
        <PdfDropzone
          onFiles={(files) => { const f = files.find(isPdfFile); if (f) setFileB(f); }}
          label={fileB ? fileB.name : 'Revised PDF'}
          hint="Second document"
        />
      </div>
      {busy && <LoadingBox label="Extracting and comparing text…" />}
      <ErrorBox message={err} />
      {stats && !busy && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-xl border bg-muted border-border">
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1">Added</div>
            <div className="text-sm font-bold text-success font-mono">+{stats.added}</div>
          </div>
          <div className="p-3 rounded-xl border bg-muted border-border">
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground mb-1">Removed</div>
            <div className="text-sm font-bold text-danger font-mono">-{stats.removed}</div>
          </div>
        </div>
      )}
      {diffs && !busy && (
        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {diffs.map((tokens, pageIdx) => (
            <Card key={pageIdx} title={`Page ${pageIdx + 1}`}>
              <p className="text-xs leading-relaxed break-words">
                {tokens.map((t, i) => (
                  <span
                    key={i}
                    className={
                      t.type === 'add' ? 'bg-success/20 text-success rounded px-0.5' :
                      t.type === 'del' ? 'bg-danger/20 text-danger line-through rounded px-0.5' :
                      'text-foreground'
                    }
                  >
                    {t.text}{' '}
                  </span>
                ))}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── PDF TO WORD (basic text-only DOCX) ─────────────────────────
export const PdfToWordTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(isPdfFile);
    if (f) { setResult(null); setErr(null); setFile(f); } else setErr('Please select a valid PDF file.');
  }, [setErr]);

  const convert = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(10, 'Extracting text…');
        const pages = await extractPagesText(file);
        report(55, 'Building Word document…');
        const { Document, Packer, Paragraph, HeadingLevel } = await import('docx');
        const children: InstanceType<typeof Paragraph>[] = [];
        pages.forEach((text, i) => {
          children.push(new Paragraph({ text: `Page ${i + 1}`, heading: HeadingLevel.HEADING_3 }));
          const lines = text.split(/\n+/).filter(Boolean);
          if (lines.length === 0) children.push(new Paragraph({ text: '' }));
          for (const line of lines) children.push(new Paragraph({ text: line }));
        });
        const doc = new Document({ sections: [{ children }] });
        report(85, 'Packing DOCX…');
        const blob = await Packer.toBlob(doc);
        setResult({ blob, name: `${baseName(file.name)}.docx` });
        report(100, 'Done');
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
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to convert" hint="Text-only conversion, layout and images are not preserved" />
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted border-border text-xs">
            <span className="font-semibold text-foreground truncate flex-1">{file.name}</span>
            <button onClick={() => { setFile(null); setResult(null); }} className="text-muted-foreground hover:text-danger">Change</button>
          </div>
          <Card>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This extracts the plain text from each page and lays it out as paragraphs in a new DOCX
              file. Fonts, images, tables and exact positioning from the original PDF are not preserved.
            </p>
            <ActionButton onClick={convert} busy={isBusy} busyLabel="Converting…">
              <FileText className="w-4 h-4" /> Convert to DOCX
            </ActionButton>
          </Card>
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard title="DOCX ready" subtitle="Text extracted and formatted as paragraphs." downloadLabel={result.name}
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── HTML TO PDF ────────────────────────────────────────────────
export const HtmlToPdfTool: React.FC = () => {
  const [html, setHtml] = useState('<h1>Hello</h1>\n<p>Paste or write HTML here, then convert it to a PDF.</p>');
  const [isBusy, setIsBusy] = useState(false);
  const { err, setErr } = useFileErr();
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = useCallback((files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setHtml(String(reader.result ?? ''));
    reader.readAsText(f);
  }, []);

  const convert = async () => {
    if (!html.trim()) { setErr('Enter or upload some HTML first.'); return; }
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(10, 'Rendering HTML…');
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
        const host = document.createElement('div');
        host.style.position = 'fixed';
        host.style.left = '-99999px';
        host.style.top = '0';
        host.style.width = '794px';
        host.style.background = '#ffffff';
        host.style.color = '#000000';
        host.style.padding = '32px';
        host.innerHTML = html;
        document.body.appendChild(host);
        try {
          report(35, 'Capturing snapshot…');
          const canvas = await html2canvas(host, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
          report(65, 'Paginating PDF…');
          const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const imgW = pageW;
          const imgH = (canvas.height * imgW) / canvas.width;
          let remaining = imgH;
          let offsetY = 0;
          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          let first = true;
          while (remaining > 0) {
            if (!first) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, -offsetY, imgW, imgH);
            remaining -= pageH;
            offsetY += pageH;
            first = false;
          }
          report(90, 'Saving PDF…');
          const blob = pdf.output('blob');
          setResult({ blob, name: 'html-export.pdf' });
        } finally {
          document.body.removeChild(host);
        }
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Conversion failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="HTML source">
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={10}
          className={`${textInputClass} font-mono`}
          spellCheck={false}
        />
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".html,text/html"
            onChange={(e) => handleUpload(e.target.files)}
            className="block text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-semibold hover:file:brightness-110 cursor-pointer"
          />
        </div>
        <ActionButton onClick={convert} busy={isBusy} busyLabel="Converting…">
          <Globe className="w-4 h-4" /> Convert to PDF
        </ActionButton>
      </Card>
      <ErrorBox message={err} />
      {result && !isBusy && (
        <ResultCard title="PDF ready" subtitle="Rendered from your HTML and paginated to A4." downloadLabel={result.name}
          onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              blob={result.blob}
              filename={result.name} />
      )}
      <div ref={containerRef} className="hidden" />
      {overlay}
    </div>
  );
};
