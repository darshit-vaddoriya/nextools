import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { AdBanner } from '../components/AdBanner';
import { errorMessage } from '../utils/errorMessage';
import { FileText, Upload, Trash2, ArrowUp, ArrowDown, Download, CheckCircle, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { useExportProgress } from './image/ExportProgress';

interface PdfItem {
  id: string;
  name: string;
  size: number;
  pages: number;
  file: File;
  previewUrl?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const PdfMergeTool: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { run, overlay } = useExportProgress();

  const renderThumbnail = async (file: File): Promise<string> => {
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await getDocument({ data }).promise;
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.45 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      await page.render({ canvasContext: ctx, viewport } as never).promise;
      return canvas.toDataURL('image/png');
    } catch {
      return '';
    }
  };

  const addFiles = useCallback(async (files: File[]) => {
    const pdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
      setError('Please select valid PDF files.');
      return;
    }
    setError(null);
    setMergedUrl(null);

    const newItems: PdfItem[] = [];
    for (const f of pdfs) {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true }).catch(() => null);
      if (doc) {
        newItems.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: f.name, size: f.size, pages: doc.getPageCount(), file: f, previewUrl: '' });
      } else {
        setError(`Could not read "${f.name}". It may be corrupted or password-protected.`);
      }
    }
    if (newItems.length) {
      setPdfFiles(prev => [...prev, ...newItems]);
      newItems.forEach((item) => {
        renderThumbnail(item.file).then((thumb) => {
          if (thumb) setPdfFiles(prev => prev.map(p => (p.id === item.id ? { ...p, previewUrl: thumb } : p)));
        });
      });
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) addFiles(Array.from(files));
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); };

  const removePdf = (id: string) => {
    setPdfFiles(prev => prev.filter(p => p.id !== id));
    setMergedUrl(null);
  };

  const movePdf = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= pdfFiles.length) return;
    const list = [...pdfFiles];
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setPdfFiles(list);
    setMergedUrl(null);
  };

  const clearAll = () => { setPdfFiles([]); setMergedUrl(null); setError(null); };

  const handleMerge = async () => {
    if (pdfFiles.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      await run(async (report) => {
        report(5, 'Preparing…');
        const out = await PDFDocument.create();
        for (let i = 0; i < pdfFiles.length; i++) {
          const item = pdfFiles[i];
          report(Math.round(10 + (75 * i) / pdfFiles.length), `Merging ${i + 1}/${pdfFiles.length}…`);
          const src = await PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: true });
          const pages = await out.copyPages(src, src.getPageIndices());
          pages.forEach(p => out.addPage(p));
        }
        report(90, 'Saving PDF…');
        const bytes = await out.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setMergedUrl(url);
        report(100, 'Done');
      });
    } catch (err) {
      setError(errorMessage(err, 'Merge failed. Please try again.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = pdfFiles.reduce((acc, curr) => acc + curr.pages, 0);
  const totalSize = pdfFiles.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center space-y-3 transition-all duration-200 bg-card
          ${isDragging ? 'border-primary bg-primary/[0.06] scale-[1.01]' : 'border-border'}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-foreground">
            {isDragging ? 'Drop PDF files here' : 'Select or drag & drop PDF files'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Merged with real <span className="font-mono text-muted-foreground">pdf-lib</span>, right in your browser
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:brightness-110 text-primary-foreground text-xs font-semibold rounded-lg cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Choose PDF Files
          </button>
          {pdfFiles.length > 0 && (
            <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="application/pdf" multiple onChange={handleFileUpload} className="hidden" />
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PDF List Workspace */}
      {pdfFiles.length > 0 && (
        <div className="rounded-2xl border bg-card border-border p-4 space-y-3 shadow-card">
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Files to Merge ({pdfFiles.length})
            </span>
            <span className="text-success font-mono text-[11px]">{totalPages} pages · {formatSize(totalSize)}</span>
          </div>

          <div className="space-y-2">
            {pdfFiles.map((pdf, idx) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-muted border-border text-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-[68px] rounded-lg overflow-hidden border bg-card border-border flex items-center justify-center shrink-0">
                    {pdf.previewUrl ? (
                      <img src={pdf.previewUrl} alt={pdf.name} className="w-full h-full object-contain" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground block truncate">{pdf.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{formatSize(pdf.size)} • {pdf.pages} pages</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => movePdf(idx, 'up')} disabled={idx === 0}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move up">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => movePdf(idx, 'down')} disabled={idx === pdfFiles.length - 1}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move down">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removePdf(pdf.id)}
                    className="p-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors" title="Remove">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleMerge}
            disabled={pdfFiles.length === 0 || isProcessing}
            className="w-full py-3 bg-primary hover:brightness-110 text-primary-foreground text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Merging PDFs in browser…</>
            ) : (
              <><Download className="w-4 h-4" /> Merge {pdfFiles.length} PDFs</>
            )}
          </button>
        </div>
      )}

      {/* Post-merge result */}
      {mergedUrl && (
        <div className="p-4 rounded-2xl border border-success/30 bg-success/10 text-xs space-y-3">
          <div className="flex items-center gap-2 text-success font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Merged {pdfFiles.length} PDFs ({totalPages} pages) on your device</span>
          </div>
          <div className="flex items-center gap-2 text-success/80 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Nothing was uploaded. Your files never left this device.
          </div>
          <a
            href={mergedUrl}
            download={`merged_${pdfFiles.length}_files.pdf`}
            className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Merged PDF</span>
          </a>
          <AdBanner type="native" />
        </div>
      )}
      {overlay}
    </div>
  );
};
