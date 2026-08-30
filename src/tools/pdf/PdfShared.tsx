import React, { useCallback, useRef, useState } from 'react';
import {
  Upload, Download, AlertTriangle, CheckCircle, ShieldCheck,
  Loader2, FileText, Sparkles, X,
} from 'lucide-react';
import { RotationTypes, type PDFDocument, type PDFPage } from 'pdf-lib';
import type { PDFPageProxy } from 'pdfjs-dist';
import { errorMessage } from '../../utils/errorMessage';
import { downloadBlob, formatBytes } from '../image/ImageUtils';

// ─── Small helpers ──────────────────────────────────────────────
export const baseName = (name: string) => name.replace(/\.[^.]+$/, '');

export const downloadPdf = async (doc: PDFDocument, fileName: string) => {
  const bytes = await doc.save();
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  downloadBlob(new Blob([buf], { type: 'application/pdf' }), fileName);
};

export const pageLabel = (pageNum: number, total: number) =>
  `${String(pageNum).padStart(String(total).length, '0')}/${total}`;

export const isPdfFile = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

// ─── Lazy pdf.js loader with worker ─────────────────────────────
let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;
export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((mod) => {
      mod.GlobalWorkerOptions.workerSrc =
        new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      return mod;
    });
  }
  return pdfjsPromise;
}

// ─── Render a pdf.js page onto a canvas ─────────────────────────
export async function renderPageToCanvas(
  page: PDFPageProxy,
  scale: number,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  await page.render({ canvasContext: ctx, viewport } as never).promise;
  return canvas;
}

// ─── Hook: load a PDF and expose pages + thumbnails ─────────────
export function usePdfSource(thumbScale = 0.35) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfjsDoc, setPdfjsDoc] = useState<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const load = useCallback(async (f: File, pw = '') => {
    setFile(f);
    setError(null);
    setBusy(true);
    setThumbs([]);
    setPageCount(0);
    try {
      const pdfjs = await getPdfjs();
      const data = new Uint8Array(await f.arrayBuffer());
      const doc = await pdfjs.getDocument({ data, password: pw || undefined }).promise;
      setPdfjsDoc(doc);
      setPageCount(doc.numPages);
      const arr: string[] = [];
      if (thumbScale > 0) {
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const canvas = await renderPageToCanvas(page, thumbScale);
          arr.push(canvas.toDataURL('image/jpeg', 0.55));
        }
      }
      setThumbs(arr);
    } catch (e) {
      setError(errorMessage(e, 'Could not read this PDF. It may be corrupted or password-protected.'));
      setPdfjsDoc(null);
    } finally {
      setBusy(false);
    }
  }, [thumbScale]);

  const reset = useCallback(() => {
    setFile(null);
    setPdfjsDoc(null);
    setPageCount(0);
    setThumbs([]);
    setError(null);
    setPassword('');
  }, []);

  return { file, pdfjsDoc, pageCount, thumbs, busy, error, password, setPassword, load, reset };
}

// ─── Dropzone ───────────────────────────────────────────────────
interface PdfDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  hint?: string;
  accept?: string;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({
  onFiles,
  multiple = false,
  label = 'Select or drag & drop PDF files',
  hint = 'Processed entirely on your device',
  accept = 'application/pdf',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); acceptFiles(e.dataTransfer.files); }}
      className={`relative rounded-2xl border-2 border-dashed p-8 text-center space-y-3 transition-all duration-200 bg-card
        ${isDragging
          ? 'border-primary bg-primary/[0.06] scale-[1.01]'
          : 'border-border'}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center">
        <Upload className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-foreground">
          {isDragging ? 'Drop PDF files here' : label}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:brightness-110 text-primary-foreground text-xs font-semibold rounded-lg cursor-pointer transition-all active:scale-[0.98]"
      >
        <Upload className="w-3.5 h-3.5" />
        Choose PDF Files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) acceptFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

// ─── File chip (loaded PDF header) ──────────────────────────────
export const SourceFileBar: React.FC<{
  file: File;
  pageCount: number;
  onReset: () => void;
}> = ({ file, pageCount, onReset }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted border-border text-xs">
    <div className="w-9 h-11 rounded-md overflow-hidden bg-card border border-border flex items-center justify-center shrink-0">
      <FileText className="w-4 h-4 text-primary" />
    </div>
    <div className="min-w-0 flex-1">
      <span className="font-semibold text-foreground block truncate">{file.name}</span>
      <span className="text-[10.5px] text-muted-foreground font-mono">
        {formatBytes(file.size)} · {pageCount} pages
      </span>
    </div>
    <button
      onClick={onReset}
      title="Choose a different file"
      className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

// ─── Section card ───────────────────────────────────────────────
export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> =
  ({ title, children, className = '' }) => (
    <div className={`rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4 shadow-card ${className}`}>
      {title && (
        <h3 className="flex items-center gap-2 text-[13px] font-bold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          {title}
        </h3>
      )}
      {children}
    </div>
  );

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="section-label mb-1 block">{children}</span>
);

export const textInputClass =
  'w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 bg-card border-border text-foreground placeholder:text-muted-foreground';

export const ErrorBox: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export const LoadingBox: React.FC<{ label?: string }> = ({ label = 'Processing…' }) => (
  <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-center gap-3 text-center">
    <Loader2 className="w-6 h-6 text-primary animate-spin" />
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

export const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  busyLabel?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'success';
  className?: string;
}> = ({ onClick, disabled, busy, busyLabel = 'Working…', children, variant = 'primary', className = '' }) => {
  const styles =
    variant === 'success'
      ? 'bg-success text-success-foreground'
      : 'bg-primary text-primary-foreground';
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className={`w-full py-2.5 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> {busyLabel}</> : children}
    </button>
  );
};

export const ResultCard: React.FC<{
  title: string;
  subtitle?: string;
  onDownload: () => void;
  downloadLabel?: string;
}> = ({ title, subtitle, onDownload, downloadLabel = 'Download PDF' }) => (
  <div className="p-4 rounded-2xl border border-success/30 bg-success/10 text-xs space-y-3">
    <div className="flex items-center gap-2 text-success font-bold">
      <CheckCircle className="w-4 h-4" />
      <span>{title}</span>
    </div>
    {subtitle && (
      <div className="flex items-center gap-2 text-success/80">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>{subtitle}</span>
      </div>
    )}
    <button
      onClick={onDownload}
      className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
    >
      <Download className="w-4 h-4" />
      <span>{downloadLabel}</span>
    </button>
  </div>
);

// ─── Page range parsing ("1-3,5,7-9") ───────────────────────────
export function parsePageRanges(input: string, pageCount: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(/[,;\s]+/).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.max(1, parseInt(m[1], 10));
      const b = Math.min(pageCount, parseInt(m[2], 10));
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) pages.add(i);
    } else if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= pageCount) pages.add(n);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

// Split a range input into separate groups — one per comma/semicolon
// token — so "1-2,4" yields [{label:'1-2',indices:[1,2]},{label:'4',indices:[4]}].
export function parseRangeGroups(input: string, pageCount: number): { label: string; indices: number[] }[] {
  const groups: { label: string; indices: number[] }[] = [];
  const parts = input.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const indices = parsePageRanges(part, pageCount);
    if (indices.length) groups.push({ label: part.replace(/\s+/g, ''), indices });
  }
  return groups;
}

// ─── Download several files (browser may prompt for permission) ──
export async function downloadAll(
  items: { blob: Blob; name: string }[],
  onProgress?: (done: number, total: number) => void,
) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    downloadBlob(it.blob, it.name);
    onProgress?.(i + 1, items.length);
    if (i < items.length - 1) await new Promise((r) => setTimeout(r, 350));
  }
}

// ─── pdf-lib page-size helpers ──────────────────────────────────
export const POINTS_PER_MM = 72 / 25.4;

export function pageSizeFromSelection(sel: string): { width: number; height: number } | null {
  const mm = (w: number, h: number) => ({ width: w * POINTS_PER_MM, height: h * POINTS_PER_MM });
  switch (sel) {
    case 'a4': return mm(210, 297);
    case 'a4l': return mm(297, 210);
    case 'letter': return mm(215.9, 279.4);
    case 'legal': return mm(215.9, 355.6);
    case 'auto': return null;
    default: return null;
  }
}

export const PAGE_SIZE_OPTIONS = [
  { value: 'auto', label: 'Auto (fit content)' },
  { value: 'a4', label: 'A4 Portrait' },
  { value: 'a4l', label: 'A4 Landscape' },
  { value: 'letter', label: 'US Letter' },
  { value: 'legal', label: 'US Legal' },
];

// ─── Draw rotated copy of a page on a new page (used by reorder) ──
export async function copyPageWithRotation(
  target: PDFDocument,
  source: PDFDocument,
  sourceIndex: number,
  rotation: number,
): Promise<PDFPage> {
  const [page] = await target.copyPages(source, [sourceIndex]);
  page.setRotation({ type: RotationTypes.Degrees, angle: rotation });
  return page;
}
