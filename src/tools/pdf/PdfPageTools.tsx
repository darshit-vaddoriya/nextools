import React, { useCallback, useMemo, useState } from 'react';
import { PDFDocument, RotationTypes } from 'pdf-lib';
import {
  Scissors, RotateCw, RotateCcw, Trash2, ArrowUp, ArrowDown, FileMinus2,
  GripVertical, Download, RefreshCw, FileOutput, CheckSquare, Square,
} from 'lucide-react';
import {
  PdfDropzone, SourceFileBar, usePdfSource, parsePageRanges, parseRangeGroups, ErrorBox,
  LoadingBox, ActionButton, ResultCard, downloadAll,
  baseName, Card, FieldLabel, textInputClass, pageLabel,
} from './PdfShared';
import { formatBytes } from '../image/ImageUtils';
import { useExportProgress } from '../image/ExportProgress';
import { errorMessage } from '../../utils/errorMessage';

async function loadLibDoc(file: File): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(await file.arrayBuffer());
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e);
    if (/encrypt|password/i.test(msg)) {
      throw new Error('This PDF is password protected. Use the Unlock PDF tool first.', { cause: e });
    }
    throw new Error('Could not read this PDF. It may be corrupted or damaged.', { cause: e });
  }
}

async function appendPage(out: PDFDocument, src: PDFDocument, srcIndex: number) {
  const srcPage = src.getPage(srcIndex);
  const rotation = srcPage.getRotation().angle;
  const [page] = await out.copyPages(src, [srcIndex]);
  page.setRotation({ type: RotationTypes.Degrees, angle: rotation });
  out.addPage(page);
}

// ─── Shared page grid ───────────────────────────────────────────
const gridCellClass =
  'relative rounded-lg border   bg-muted border-border overflow-hidden';

const PageGrid: React.FC<{
  thumbs: string[];
  overlay: (i: number) => React.ReactNode;
  controls: (i: number) => React.ReactNode;
  onDragStart?: (i: number) => void;
  onDragOver?: (i: number) => void;
  onDragLeave?: (i: number) => void;
  onDrop?: (i: number) => void;
  draggingIndex?: number | null;
}> = ({ thumbs, overlay, controls, onDragStart, onDragOver, onDragLeave, onDrop, draggingIndex }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
    {thumbs.map((thumb, i) => (
      <div
        key={i}
        draggable={Boolean(onDragStart)}
        onDragStart={onDragStart ? (e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(i); } : undefined}
        onDragOver={onDragOver ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver(i); } : undefined}
        onDragLeave={onDragLeave ? () => onDragLeave(i) : undefined}
        onDrop={onDrop ? (e) => { e.preventDefault(); onDrop(i); } : undefined}
        className={`${gridCellClass} ${onDragStart && draggingIndex === i ? 'opacity-40 ring-2 ring-primary' : ''} ${onDragOver ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <div className="relative aspect-[3/4]">
          <img src={thumb} alt={`Page ${i + 1}`} className="w-full h-full object-contain" />
          <span className="absolute top-1 left-1 text-[9px] font-mono px-1 py-0.5 rounded
            dark:bg-black/60 bg-white/80 text-muted-foreground  backdrop-blur-sm">
            {pageLabel(i + 1, thumbs.length)}
          </span>
          {overlay(i)}
        </div>
        <div className="p-1.5 flex items-center justify-center gap-1 border-t  border-border">
          {controls(i)}
        </div>
      </div>
    ))}
  </div>
);

// ─── SPLIT PDF ──────────────────────────────────────────────────
type SplitMode = 'pages' | 'ranges';

export const PdfSplitTool: React.FC = () => {
  const { file, pageCount, busy, error, load, reset } = usePdfSource();
  const [mode, setMode] = useState<SplitMode>('pages');
  const [ranges, setRanges] = useState('1-2,4');
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<{ name: string; blob: Blob; pages: number }[]>([]);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResults([]);
      setErr(null);
      load(f);
    } else {
      setErr('Please select a valid PDF file.');
    }
  }, [load]);

  const split = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    setResults([]);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const rangesToSplit: { name: string; indices: number[] }[] = [];
        if (mode === 'pages') {
          for (let i = 0; i < doc.getPageCount(); i++) {
            rangesToSplit.push({ name: `${baseName(file.name)}_${String(i + 1).padStart(2, '0')}.pdf`, indices: [i] });
          }
        } else {
          const groups = parseRangeGroups(ranges, doc.getPageCount());
          if (groups.length === 0) {
            throw new Error('No valid page ranges. Use formats like 1-3, 5, 7-9.');
          }
          for (const g of groups) {
            rangesToSplit.push({
              name: `${baseName(file.name)}_${g.label}.pdf`,
              indices: g.indices.map(n => n - 1),
            });
          }
        }
        const out: { name: string; blob: Blob; pages: number }[] = [];
        for (let i = 0; i < rangesToSplit.length; i++) {
          report(Math.round(10 + (80 * i) / rangesToSplit.length), `Building part ${i + 1}/${rangesToSplit.length}…`);
          const part = await PDFDocument.create();
          for (const idx of rangesToSplit[i].indices) await appendPage(part, doc, idx);
          const bytes = await part.save();
          const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          out.push({ name: rangesToSplit[i].name, blob: new Blob([buf], { type: 'application/pdf' }), pages: rangesToSplit[i].indices.length });
        }
        setResults(out);
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Splitting failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to split" hint="Split into separate files, right in your browser" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Loading PDF pages…" />}
          {!busy && (
            <Card title="Split options">
              <div className="flex gap-2">
                <button onClick={() => setMode('pages')} className={`btn-secondary text-xs px-4 py-2 flex-1 justify-center ${mode === 'pages' ? 'bg-primary/10 border-primary' : ''}`}>
                  <Scissors className="w-3.5 h-3.5" /> Every page separately
                </button>
                <button onClick={() => setMode('ranges')} className={`btn-secondary text-xs px-4 py-2 flex-1 justify-center ${mode === 'ranges' ? 'bg-primary/10 border-primary' : ''}`}>
                  <FileMinus2 className="w-3.5 h-3.5" /> Split by ranges
                </button>
              </div>
              {mode === 'ranges' && (
                <div>
                  <FieldLabel>Page ranges (e.g. 1-3, 5, 7-9)</FieldLabel>
                  <input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 5, 7-9" className={textInputClass} />
                  <p className="text-[11px]  text-muted-foreground mt-1.5">
                    Produces one PDF per range. Current ranges yield {parseRangeGroups(ranges, pageCount).length} file(s) with {parsePageRanges(ranges, pageCount).length} page(s) of {pageCount}.
                  </p>
                </div>
              )}
              <ActionButton onClick={split} busy={isBusy} busyLabel="Splitting…" disabled={pageCount === 0}>
                <Scissors className="w-4 h-4" /> Split into {mode === 'pages' ? `${pageCount} files` : `${parseRangeGroups(ranges, pageCount).length} files`}
              </ActionButton>
            </Card>
          )}
          <ErrorBox message={err} />
          {results.length > 0 && !isBusy && (
            <Card title={`${results.length} file${results.length > 1 ? 's' : ''} ready`}>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {results.map((r) => (
                  <div key={r.name} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border   bg-muted border-border text-xs">
                    <span className="font-mono truncate  text-muted-foreground">{r.name}</span>
                    <span className="shrink-0  text-muted-foreground font-mono">{r.pages}p · {formatBytes(r.blob.size)}</span>
                    <button onClick={() => downloadAll([{ blob: r.blob, name: r.name }])} className="shrink-0 p-1.5 rounded-lg text-success hover:bg-emerald-500/10 transition-colors" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => downloadAll(results.map(r => ({ blob: r.blob, name: r.name })))} className="btn-primary w-full justify-center text-xs px-4 py-2.5">
                <Download className="w-4 h-4" /> Download all {results.length} files
              </button>
            </Card>
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── ROTATE PDF ─────────────────────────────────────────────────
export const PdfRotateTool: React.FC = () => {
  const { file, pageCount, thumbs, busy, error, load, reset } = usePdfSource();
  const [rotations, setRotations] = useState<number[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      setRotations([]);
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const applyRotation = useCallback((idx: number, delta: number) => {
    setRotations(prev => {
      const next = [...prev];
      next[idx] = ((next[idx] ?? 0) + delta + 360) % 360;
      return next;
    });
    setResult(null);
  }, []);

  const rotateAll = useCallback((delta: number) => {
    setRotations(prev => prev.map(r => ((r + delta + 360) % 360)));
    setResult(null);
  }, []);

  const save = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const pages = doc.getPages();
        for (let i = 0; i < pages.length; i++) {
          const delta = rotations[i] ?? 0;
          if (delta !== 0) {
            const current = pages[i].getRotation().angle;
            pages[i].setRotation({ type: RotationTypes.Degrees, angle: ((current + delta) % 360 + 360) % 360 });
          }
        }
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_rotated.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Rotation failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  const someRotated = rotations.some(r => r !== 0);

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to rotate" hint="Rotate pages 90°, 180° or 270° in your browser" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Loading PDF pages…" />}
          {!busy && pageCount > 0 && (
            <>
              <Card title="Rotate pages">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => rotateAll(90)} className="btn-secondary text-xs px-3 py-2"><RotateCw className="w-3.5 h-3.5" /> Rotate all 90°</button>
                  <button onClick={() => rotateAll(-90)} className="btn-secondary text-xs px-3 py-2"><RotateCcw className="w-3.5 h-3.5" /> Rotate all −90°</button>
                  <button onClick={() => { setRotations([]); setResult(null); }} className="btn-secondary text-xs px-3 py-2"><RefreshCw className="w-3.5 h-3.5" /> Reset</button>
                </div>
                <p className="text-[11px]  text-muted-foreground">Tip: click a page thumbnail to rotate it 90° clockwise.</p>
              </Card>
              <PageGrid
                thumbs={thumbs}
                overlay={(i) => (rotations[i] ?? 0) !== 0 ? (
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.5 rounded bg-primary text-primary-foreground">
                    {(rotations[i] ?? 0)}°
                  </span>
                ) : null}
                controls={(i) => (
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => applyRotation(i, -90)} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Rotate −90°"><RotateCcw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => applyRotation(i, 90)} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Rotate 90°"><RotateCw className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
              <ActionButton onClick={save} busy={isBusy} busyLabel="Rotating…" disabled={!someRotated}>
                <RotateCw className="w-4 h-4" /> Save Rotated PDF
              </ActionButton>
            </>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title="Rotated PDF ready"
              subtitle="The rotated pages were saved on your device."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
              downloadLabel={result.name}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── DELETE PAGES ───────────────────────────────────────────────
export const PdfDeletePagesTool: React.FC = () => {
  const { file, pageCount, thumbs, busy, error, load, reset } = usePdfSource();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (f) {
      setResult(null);
      setErr(null);
      setSelected(new Set());
      load(f);
    } else setErr('Please select a valid PDF file.');
  }, [load]);

  const toggle = useCallback((idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(thumbs.map((_, i) => i)));
  }, [thumbs]);

  const selectNone = useCallback(() => setSelected(new Set()), []);

  const save = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const remove = Array.from(selected).sort((a, b) => b - a);
        for (const idx of remove) doc.removePage(idx);
        report(85, 'Saving PDF…');
        const bytes = await doc.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_pages_removed.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Deleting pages failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to remove pages from" hint="Tick the pages you want to delete" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Loading PDF pages…" />}
          {!busy && pageCount > 0 && (
            <>
              <Card title={`Select pages to remove (${selected.size} selected)`}>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={selectAll} className="btn-secondary text-xs px-3 py-2"><CheckSquare className="w-3.5 h-3.5" /> Select all</button>
                  <button onClick={selectNone} className="btn-secondary text-xs px-3 py-2"><Square className="w-3.5 h-3.5" /> Clear</button>
                </div>
                <p className="text-[11px]  text-muted-foreground">{pageCount - selected.size} of {pageCount} pages will remain.</p>
              </Card>
              <PageGrid
                thumbs={thumbs}
                overlay={(i) => selected.has(i) ? (
                  <span className="absolute inset-0 bg-rose-500/20 ring-2 ring-rose-500 rounded-lg pointer-events-none" />
                ) : null}
                controls={(i) => (
                  <button
                    onClick={() => toggle(i)}
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                      selected.has(i)
                        ? 'bg-rose-500 text-white'
                        : 'dark:bg-white/[0.06] bg-card border  border-border text-muted-foreground '
                    }`}
                  >
                    {selected.has(i) ? <><Trash2 className="w-3 h-3" /> Remove</> : 'Keep'}
                  </button>
                )}
              />
              <ActionButton onClick={save} busy={isBusy} busyLabel="Deleting pages…" disabled={selected.size === 0} variant="success">
                <Trash2 className="w-4 h-4" /> Delete {selected.size} page{selected.size === 1 ? '' : 's'}
              </ActionButton>
            </>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title={`PDF saved with ${pageCount - selected.size} pages`}
              subtitle="Removed pages were deleted on your device."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── EXTRACT PAGES (range) ──────────────────────────────────────
export const PdfExtractPagesTool: React.FC = () => {
  const { file, pageCount, thumbs, busy, error, load, reset } = usePdfSource();
  const [ranges, setRanges] = useState('1-3');
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

  const pageNums = useMemo(() => (pageCount ? parsePageRanges(ranges, pageCount) : []), [ranges, pageCount]);

  const extract = async () => {
    if (!file) return;
    if (pageNums.length === 0) { setErr('No valid pages in the given range.'); return; }
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const out = await PDFDocument.create();
        for (let i = 0; i < pageNums.length; i++) {
          report(Math.round(15 + (70 * i) / pageNums.length), `Extracting page ${pageNums[i]}…`);
          await appendPage(out, doc, pageNums[i] - 1);
        }
        report(90, 'Saving PDF…');
        const bytes = await out.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_extracted.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Extraction failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to extract pages from" hint="Pull out a page range as a brand-new PDF" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Loading PDF pages…" />}
          {!busy && pageCount > 0 && (
            <>
              <Card title="Page range to extract">
                <div>
                  <FieldLabel>Pages (e.g. 1-3, 5, 7-9)</FieldLabel>
                  <input value={ranges} onChange={(e) => setRanges(e.target.value)} className={textInputClass} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]  text-muted-foreground">
                    {pageNums.length} page{pageNums.length === 1 ? '' : 's'} will be extracted · {pageCount} total
                  </span>
                  <span className="text-[10px] font-mono  text-muted-foreground">
                    {pageNums.map(n => n).join(', ')}
                  </span>
                </div>
                <ActionButton onClick={extract} busy={isBusy} busyLabel="Extracting…" disabled={pageNums.length === 0}>
                  <FileOutput className="w-4 h-4" /> Extract {pageNums.length} page{pageNums.length === 1 ? '' : 's'}
                </ActionButton>
              </Card>
              <PageGrid
                thumbs={thumbs}
                overlay={(i) => pageNums.includes(i + 1) ? (
                  <span className="absolute inset-0 ring-2 ring-primary rounded-lg pointer-events-none" />
                ) : (
                  <span className="absolute inset-0 bg-black/40 rounded-lg pointer-events-none" />
                )}
                controls={(i) => (
                  <span className={`text-[10px] font-mono ${pageNums.includes(i + 1) ? 'text-primary font-bold' : ' text-muted-foreground'}`}>
                    {pageNums.includes(i + 1) ? 'Included' : 'Skipped'}
                  </span>
                )}
              />
            </>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title={`Extracted PDF with ${pageNums.length} pages`}
              subtitle="Extracted pages saved on your device."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};

// ─── REORDER PAGES ──────────────────────────────────────────────
export const PdfReorderTool: React.FC = () => {
  const { file, pageCount, thumbs, busy, error, load, reset } = usePdfSource();
  const [order, setOrder] = useState<number[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const hoverIndexRef = React.useRef<number | null>(null);
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

  // Initialize order when thumbnails are first available
  const prevThumbs = React.useRef<string[]>([]);
  React.useEffect(() => {
    if (thumbs.length && thumbs !== prevThumbs.current) {
      prevThumbs.current = thumbs;
      setOrder(thumbs.map((_, i) => i));
      setDragIndex(null);
      hoverIndexRef.current = null;
    }
  }, [thumbs]);

  const move = useCallback((pos: number, dir: -1 | 1) => {
    setOrder(prev => {
      const next = [...prev];
      const target = pos + dir;
      if (target < 0 || target >= next.length) return prev;
      const t = next[pos];
      next[pos] = next[target];
      next[target] = t;
      return next;
    });
    setResult(null);
  }, []);

  const dropAt = useCallback((from: number, to: number) => {
    setOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDragIndex(null);
    hoverIndexRef.current = null;
    setResult(null);
  }, []);

  const reverse = useCallback(() => {
    setOrder(prev => [...prev].reverse());
    setResult(null);
  }, []);

  const save = async () => {
    if (!file) return;
    setIsBusy(true);
    setErr(null);
    try {
      await run(async (report) => {
        report(5, 'Reading document…');
        const doc = await loadLibDoc(file);
        const out = await PDFDocument.create();
        for (let i = 0; i < order.length; i++) {
          report(Math.round(10 + (75 * i) / order.length), `Reordering ${i + 1}/${order.length}…`);
          await appendPage(out, doc, order[i]);
        }
        report(90, 'Saving PDF…');
        const bytes = await out.save();
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const blob = new Blob([buf], { type: 'application/pdf' });
        setResult({ blob, name: `${baseName(file.name)}_reordered.pdf` });
        report(100, 'Done');
      });
    } catch (e) {
      setErr(errorMessage(e, 'Reordering failed.'));
    } finally {
      setIsBusy(false);
    }
  };

  const reorderedThumbs = order.map(i => thumbs[i]);

  return (
    <div className="space-y-4">
      {!file ? (
        <PdfDropzone onFiles={handleFiles} label="Select a PDF to rearrange" hint="Drag pages into any order, right in your browser" />
      ) : (
        <>
          <SourceFileBar file={file} pageCount={pageCount} onReset={reset} />
          {error && <ErrorBox message={error} />}
          {busy && <LoadingBox label="Loading PDF pages…" />}
          {!busy && reorderedThumbs.length > 0 && (
            <>
              <Card title="Arrange pages">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={reverse} className="btn-secondary text-xs px-3 py-2"><RefreshCw className="w-3.5 h-3.5" /> Reverse order</button>
                  <button onClick={() => { setOrder(thumbs.map((_, i) => i)); setDragIndex(null); hoverIndexRef.current = null; setResult(null); }} className="btn-secondary text-xs px-3 py-2"><GripVertical className="w-3.5 h-3.5" /> Reset</button>
                </div>
                <p className="text-[11px]  text-muted-foreground">Tip: drag any page onto another to move it, or use the arrows to nudge pages left and right.</p>
              </Card>
              <PageGrid
                thumbs={reorderedThumbs}
                onDragStart={setDragIndex}
                onDragOver={(i) => { hoverIndexRef.current = i; }}
                onDragLeave={() => { hoverIndexRef.current = null; }}
                onDrop={(i) => { if (dragIndex !== null && dragIndex !== i) dropAt(dragIndex, i); setDragIndex(null); hoverIndexRef.current = null; }}
                draggingIndex={dragIndex}
                overlay={(i) => (
                  <span className="absolute bottom-1 left-1 text-[9px] font-mono px-1 py-0.5 rounded bg-primary text-primary-foreground">
                    {i + 1}
                  </span>
                )}
                controls={(i) => (
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors" title="Move left"><ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === order.length - 1} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors" title="Move right"><ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" /></button>
                  </div>
                )}
              />
              <ActionButton onClick={save} busy={isBusy} busyLabel="Reordering…">
                <GripVertical className="w-4 h-4" /> Save Rearranged PDF
              </ActionButton>
            </>
          )}
          <ErrorBox message={err} />
          {result && !isBusy && (
            <ResultCard
              title="Rearranged PDF ready"
              subtitle="New page order saved on your device."
              onDownload={() => downloadAll([{ blob: result.blob, name: result.name }])}
            />
          )}
        </>
      )}
      {overlay}
    </div>
  );
};
