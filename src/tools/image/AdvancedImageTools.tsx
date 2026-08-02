import React, { useEffect, useMemo, useState } from 'react';
import { Stamp, LayoutGrid, Tags, ImagePlus, Download, Eye, X } from 'lucide-react';
import { Select } from '../../components/Select';
import {
  loadImage, canvasFromImage, canvasExport, downloadBlob, createResult,
  baseNameFrom, clamp,
  type ProcessedImage,
} from './ImageUtils';
import { errorMessage } from '../../utils/errorMessage';
import { DropZone, ResultPanel, ErrorNotice } from './ImageShared';
import { useExportProgress } from './ExportProgress';

type Item = { img: HTMLImageElement; file: File; name: string; size: number; width: number; height: number };

async function loadItems(files: File[]): Promise<Item[]> {
  const out: Item[] = [];
  for (const f of files) {
    try {
      const img = await loadImage(f);
      out.push({ img, file: f, name: f.name, size: f.size, width: img.naturalWidth, height: img.naturalHeight });
    } catch {
      /* skip unreadable */
    }
  }
  return out;
}

async function downloadAll(results: ProcessedImage[]) {
  for (const r of results) downloadBlob(r.blob, r.fileName);
}

function BatchResultList({ results, label }: { results: ProcessedImage[]; label: string }) {
  if (!results.length) return null;
  return (
    <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold dark:text-zinc-300 text-slate-700">{label}</span>
        <button onClick={() => downloadAll(results)} className="btn-emerald text-xs px-3 py-1.5">
          <Download className="w-3.5 h-3.5" /> Download All
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {results.map(r => (
          <div key={r.fileName} className="rounded-xl border dark:border-dark-border border-slate-200 overflow-hidden bg-slate-50 dark:bg-dark-bg">
            <img src={r.url} alt={r.fileName} className="h-24 w-full object-contain" />
            <button onClick={() => downloadBlob(r.blob, r.fileName)} className="w-full py-1.5 text-[11px] font-semibold dark:text-indigo-400 text-indigo-600 hover:bg-indigo-500/10">
              {r.fileName}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WATERMARK ──────────────────────────────────────────────
const WATERMARK_POSITIONS = [
  { id: 'bl', label: 'Bottom left' },
  { id: 'br', label: 'Bottom right' },
  { id: 'tl', label: 'Top left' },
  { id: 'tr', label: 'Top right' },
  { id: 'center', label: 'Center' },
  { id: 'tile', label: 'Tile' },
];

export const ImageWatermarkTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState('© NextTool');
  const [size, setSize] = useState(36);
  const [opacity, setOpacity] = useState(60);
  const [position, setPosition] = useState('br');
  const [previewUrl, setPreviewUrl] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [showPreview, setShowPreview] = useState(true);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run: runExport, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const render = useMemo(() => (cb: (url: string) => void) => {
    if (!img) return;
    const canvas = canvasFromImage(img, 1600);
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    ctx.globalAlpha = clamp(opacity, 5, 100) / 100;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size}px Arial, sans-serif`;
    ctx.textBaseline = 'middle';
    const pad = 24;
    const drawAt = (x: number, y: number) => {
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(text, x, y);
      ctx.shadowBlur = 0;
    };
    if (position === 'tile') {
      const stepY = size * 2.2;
      const stepX = size * (text.length + 1) * 0.62;
      ctx.rotate(-0.35);
      for (let y = -h; y < h * 2; y += stepY) {
        for (let x = -w; x < w * 2; x += stepX) drawAt(x, y);
      }
      ctx.rotate(0.35);
    } else {
      const tw = ctx.measureText(text).width;
      const pos: Record<string, [number, number]> = {
        tl: [pad, pad + size / 2],
        tr: [w - tw - pad, pad + size / 2],
        bl: [pad, h - pad - size / 2],
        br: [w - tw - pad, h - pad - size / 2],
        center: [(w - tw) / 2, h / 2],
      };
      const [x, y] = pos[position] ?? pos.br;
      drawAt(x, y);
    }
    ctx.globalAlpha = 1;
    cb(canvas.toDataURL('image/png'));
  }, [img, text, size, opacity, position]);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => render(setPreviewUrl), 25);
    return () => clearTimeout(t);
  }, [img, render]);

  const exportImage = async () => {
    if (!img) return;
    setError(null);
    try {
      await runExport(async (report) => {
        report(15, 'Reading image…');
        const canvas = canvasFromImage(img);
        const ctx = canvas.getContext('2d')!;
        const w = canvas.width, h = canvas.height;
        report(50, 'Adding watermark…');
        ctx.globalAlpha = clamp(opacity, 5, 100) / 100;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        const pad = 24;
        const drawAt = (x: number, y: number) => {
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 4;
          ctx.fillText(text, x, y);
          ctx.shadowBlur = 0;
        };
        if (position === 'tile') {
          const stepY = size * 2.2;
          const stepX = size * (text.length + 1) * 0.62;
          ctx.rotate(-0.35);
          for (let y = -h; y < h * 2; y += stepY) {
            for (let x = -w; x < w * 2; x += stepX) drawAt(x, y);
          }
          ctx.rotate(0.35);
        } else {
          const tw = ctx.measureText(text).width;
          const pos: Record<string, [number, number]> = {
            tl: [pad, pad + size / 2],
            tr: [w - tw - pad, pad + size / 2],
            bl: [pad, h - pad - size / 2],
            br: [w - tw - pad, h - pad - size / 2],
            center: [(w - tw) / 2, h / 2],
          };
          const [x, y] = pos[position] ?? pos.br;
          drawAt(x, y);
        }
        ctx.globalAlpha = 1;
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.9);
        setResult(createResult(blob, canvas.width, canvas.height, 'image-watermarked', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Watermark failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          {showPreview ? (
            <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b dark:border-dark-border border-slate-200">
                <span className="text-xs font-semibold dark:text-zinc-300 text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Preview
                </span>
                <button onClick={() => setShowPreview(false)} className="flex items-center gap-1 text-[11px] font-medium dark:text-zinc-400 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                  <X className="w-3.5 h-3.5" /> Hide
                </button>
              </div>
              <div className="flex items-center justify-center p-4 min-h-[300px]">
                <div className="relative w-full max-w-lg h-[320px] rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-700">
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-900"
                    style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                  >
                    <img src={img.src} alt="Original" className="max-w-full max-h-full object-contain" />
                    <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] uppercase tracking-wider text-white">Original</span>
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    style={{
                      clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
                      backgroundImage: 'conic-gradient(#cbd5e1 25%, #f8fafc 0 50%, #cbd5e1 0 75%, #f8fafc 0)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    <img src={previewUrl} alt="Watermark preview" className="max-w-full max-h-full object-contain" />
                    <span className="absolute top-2 right-2 px-2 py-1 bg-indigo-600 rounded text-[10px] uppercase tracking-wider text-white">Watermarked</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    aria-label="Compare original and watermarked"
                  />
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowPreview(true)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Show preview
            </button>
          )}
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Watermark text</span>
              <input value={text} onChange={(e) => setText(e.target.value)} className="input-base w-full text-xs" placeholder="© Your Name" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs"><span className="dark:text-zinc-400 text-slate-600 font-medium">Size</span><span className="font-mono font-bold text-indigo-500">{size}px</span></div>
                <input type="range" min={12} max={120} value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs"><span className="dark:text-zinc-400 text-slate-600 font-medium">Opacity</span><span className="font-mono font-bold text-indigo-500">{opacity}%</span></div>
                <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs dark:text-zinc-400 text-slate-600 font-medium mr-1">Position</span>
              {WATERMARK_POSITIONS.map(p => (
                <button key={p.id} onClick={() => setPosition(p.id)} className={`btn-secondary text-[11px] px-3 py-1.5 ${position === p.id ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={exportImage} className="btn-primary text-xs px-4 py-2">
            <Stamp className="w-3.5 h-3.5" /> Export Watermarked
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── BATCH RESIZE ───────────────────────────────────────────
export const BatchResizeTool: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [targetWidth, setTargetWidth] = useState(800);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { run: runExport, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    setItems(await loadItems(files));
    setResults([]);
    setError(null);
  };

  const run = async () => {
    if (!items.length) return;
    setBusy(true);
    setError(null);
    const out: ProcessedImage[] = [];
    try {
      await runExport(async (report) => {
        report(5, 'Preparing…');
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          report(Math.round(10 + (70 * i) / items.length), `Resizing ${i + 1}/${items.length}…`);
          const scale = targetWidth / item.width;
          const w = Math.max(1, Math.round(item.width * scale));
          const h = Math.max(1, Math.round(item.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(item.img, 0, 0, w, h);
          report(10 + Math.round(75 * ((i + 0.5) / items.length)), `Resizing ${i + 1}/${items.length}…`);
          const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.9);
          out.push(createResult(blob, w, h, `${baseNameFrom(item.name)}-${w}`, ext));
        }
        report(95, 'Encoding…');
        setResults(out);
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Batch resize failed.'))
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select images to resize" />
      {items.length > 0 && (
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="dark:text-zinc-400 text-slate-500 font-mono">{items.length} file(s) · keeps aspect ratio</span>
            <label className="flex items-center gap-2">
              <span className="section-label">Target width (px)</span>
              <input type="number" min={16} value={targetWidth} onChange={(e) => setTargetWidth(parseInt(e.target.value) || 1)} className="input-base w-24 font-mono" />
            </label>
            <button onClick={run} disabled={busy} className="btn-primary px-4 py-2">
              {busy ? 'Resizing…' : 'Resize All'}
            </button>
          </div>
          <div className="max-h-40 overflow-auto space-y-1">
            {items.map((it, i) => (
              <div key={i} className="flex justify-between dark:text-zinc-500 text-slate-500 font-mono text-[11px]">
                <span>{it.name}</span><span>{it.width} × {it.height} → {Math.round(targetWidth)} × {Math.max(1, Math.round(it.height * targetWidth / it.width))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
      <BatchResultList results={results} label={`${results.length} resized`} />
      {overlay}
    </div>
  );
};

// ─── BATCH CONVERT ──────────────────────────────────────────
const BATCH_FORMATS = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
];

export const BatchConvertTool: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState('image/webp');
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { run: runExport, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    setItems(await loadItems(files));
    setResults([]);
    setError(null);
  };

  const run = async () => {
    if (!items.length) return;
    setBusy(true);
    setError(null);
    const fmt = BATCH_FORMATS.find(f => f.mime === format) ?? BATCH_FORMATS[0];
    const out: ProcessedImage[] = [];
    try {
      await runExport(async (report) => {
        report(5, 'Preparing…');
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const canvas = canvasFromImage(item.img);
          report(Math.round(10 + (70 * i) / items.length), `Converting ${i + 1}/${items.length}…`);
          const { blob, ext } = await canvasExport(canvas, fmt.mime, 0.92);
          out.push(createResult(blob, canvas.width, canvas.height, `${baseNameFrom(item.name)}.${ext}`, ext));
        }
        report(95, 'Encoding…');
        setResults(out);
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Batch convert failed.'))
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select images to convert" />
      {items.length > 0 && (
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="dark:text-zinc-400 text-slate-500 font-mono">{items.length} file(s)</span>
            <label className="flex items-center gap-2">
              <span className="section-label">Convert to</span>
              <Select
                value={format}
                onChange={setFormat}
                options={BATCH_FORMATS.map((f) => ({ value: f.mime, label: f.label }))}
              />
            </label>
            <button onClick={run} disabled={busy} className="btn-primary px-4 py-2">
              {busy ? 'Converting…' : 'Convert All'}
            </button>
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
      <BatchResultList results={results} label={`${results.length} converted`} />
      {overlay}
    </div>
  );
};

// ─── BATCH RENAME ───────────────────────────────────────────
export const BatchRenameTool: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [prefix, setPrefix] = useState('IMG');
  const [startNum, setStartNum] = useState(1);
  const [digits, setDigits] = useState(3);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    setItems(await loadItems(files));
    setResults([]);
    setError(null);
  };

  const newNames = items.map((it, i) => {
    const num = (startNum + i).toString().padStart(digits, '0');
    const ext = it.name.split('.').pop() ?? 'png';
    return `${prefix}-${num}.${ext}`;
  });

  const run = () => {
    setError(null);
    const out: ProcessedImage[] = [];
    items.forEach((it, i) => {
      out.push({ blob: it.file, url: URL.createObjectURL(it.file), width: it.width, height: it.height, fileName: newNames[i] });
    });
    setResults(out);
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select files to rename" hint="Rename is instant - no re-encoding needed" />
      {items.length > 0 && (
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="section-label mb-1 block">Prefix</span>
              <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="input-base w-28 font-mono" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Start at</span>
              <input type="number" value={startNum} onChange={(e) => setStartNum(parseInt(e.target.value) || 0)} className="input-base w-20 font-mono" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Digits</span>
              <input type="number" min={1} max={6} value={digits} onChange={(e) => setDigits(clamp(parseInt(e.target.value) || 1, 1, 6))} className="input-base w-16 font-mono" />
            </label>
            <button onClick={run} className="btn-primary px-4 py-2">
              <Tags className="w-3.5 h-3.5" /> Rename All
            </button>
          </div>
          <div className="max-h-40 overflow-auto space-y-1 font-mono text-[11px] dark:text-zinc-500 text-slate-500">
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="truncate dark:text-zinc-400 text-slate-600">{it.name}</span>
                <span className="text-emerald-500">→</span>
                <span className="truncate">{newNames[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
      <BatchResultList results={results} label={`${results.length} renamed`} />
    </div>
  );
};

// ─── IMAGE COLLAGE ──────────────────────────────────────────
export const ImageCollageTool: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [cols, setCols] = useState(2);
  const [gap, setGap] = useState(8);
  const [bg, setBg] = useState('#f1f5f9');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run: runExport, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    setItems(await loadItems(files));
    setResult(null);
    setError(null);
  };

  const build = async () => {
    if (!items.length) return;
    setError(null);
    try {
      await runExport(async (report) => {
        report(15, 'Reading images…');
        const n = Math.min(items.length, 12);
        const rows = Math.ceil(n / cols);
        const cellW = 400, cellH = 300;
        const w = cols * cellW + (cols + 1) * gap;
        const h = rows * cellH + (rows + 1) * gap;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
          report(Math.round(30 + (45 * i) / n), `Placing ${i + 1}/${n}…`);
          const col = i % cols, row = Math.floor(i / cols);
          const x = gap + col * (cellW + gap);
          const y = gap + row * (cellH + gap);
          const img = items[i].img;
          const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
          const dw = Math.round(img.naturalWidth * scale);
          const dh = Math.round(img.naturalHeight * scale);
          ctx.drawImage(img, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh);
        }
        report(85, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.92);
        setResult(createResult(blob, canvas.width, canvas.height, 'collage', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Collage failed.'))
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select images for your collage" />
      {items.length > 0 && (
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="section-label mb-1 block">Columns</span>
              <Select
                value={String(cols)}
                onChange={(v) => setCols(parseInt(v))}
                options={[1, 2, 3, 4].map((c) => ({ value: String(c), label: `${c}` }))}
              />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Spacing</span>
              <input type="number" min={0} max={48} value={gap} onChange={(e) => setGap(clamp(parseInt(e.target.value) || 0, 0, 48))} className="input-base w-20 font-mono" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Background</span>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-14 rounded border dark:border-dark-border border-slate-300 cursor-pointer bg-transparent" />
            </label>
            <button onClick={build} className="btn-primary px-4 py-2">
              <LayoutGrid className="w-3.5 h-3.5" /> Build Collage
            </button>
            <span className="font-mono text-[11px] dark:text-zinc-500 text-slate-400">Using {Math.min(items.length, 12)} of {items.length} images</span>
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── MEME GENERATOR ─────────────────────────────────────────
export const MemeGeneratorTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [fontSize, setFontSize] = useState(40);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run: runExport, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const draw = useMemo(() => (cb: (url: string) => void) => {
    if (!img) return;
    const canvas = canvasFromImage(img, 1400);
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width, h = canvas.height;
    const capSize = Math.max(18, Math.round(fontSize * (w / 800)));
    const drawText = (text: string, y: number) => {
      ctx.font = `900 ${capSize}px Impact, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = Math.max(3, capSize / 8);
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#fff';
      ctx.lineJoin = 'round';
      const lines: string[] = [];
      let cur = '';
      for (const word of text.split(/\s+/)) {
        const test = cur ? `${cur} ${word}` : word;
        if (ctx.measureText(test).width > w * 0.92 && cur) { lines.push(cur); cur = word; } else { cur = test; }
      }
      lines.push(cur);
      const lh = capSize * 1.05;
      lines.forEach((line, i) => {
        const ly = y + (i - (lines.length - 1) / 2) * lh;
        ctx.strokeText(line, w / 2, ly);
        ctx.fillText(line, w / 2, ly);
      });
    };
    if (topText.trim()) drawText(topText, capSize);
    if (bottomText.trim()) drawText(bottomText, h - capSize);
    cb(canvas.toDataURL('image/png'));
  }, [img, topText, bottomText, fontSize]);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => draw(setPreviewUrl), 25);
    return () => clearTimeout(t);
  }, [img, draw]);

  const exportImage = async () => {
    if (!img) return;
    setError(null);
    try {
      await runExport(async (report) => {
        report(15, 'Reading image…');
        const canvas = canvasFromImage(img);
        const ctx = canvas.getContext('2d')!;
        const w = canvas.width, h = canvas.height;
        const capSize = Math.max(18, Math.round(fontSize * (w / 800)));
        report(50, 'Drawing captions…');
        const drawText = (text: string, y: number) => {
          ctx.font = `900 ${capSize}px Impact, Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.lineWidth = Math.max(3, capSize / 8);
          ctx.strokeStyle = '#000';
          ctx.fillStyle = '#fff';
          ctx.lineJoin = 'round';
          const lines: string[] = [];
          let cur = '';
          for (const word of text.split(/\s+/)) {
            const test = cur ? `${cur} ${word}` : word;
            if (ctx.measureText(test).width > w * 0.92 && cur) { lines.push(cur); cur = word; } else { cur = test; }
          }
          lines.push(cur);
          const lh = capSize * 1.05;
          lines.forEach((line, i) => {
            const ly = y + (i - (lines.length - 1) / 2) * lh;
            ctx.strokeText(line, w / 2, ly);
            ctx.fillText(line, w / 2, ly);
          });
        };
        if (topText.trim()) drawText(topText, capSize);
        if (bottomText.trim()) drawText(bottomText, h - capSize);
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.92);
        setResult(createResult(blob, canvas.width, canvas.height, 'meme', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Meme generation failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select a meme image" compact />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={previewUrl} alt="Meme preview" className="max-h-[320px] mx-auto object-contain" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Top text</span>
              <input value={topText} onChange={(e) => setTopText(e.target.value)} className="input-base w-full text-xs" />
            </label>
            <label className="block text-xs">
              <span className="section-label mb-1 block">Bottom text</span>
              <input value={bottomText} onChange={(e) => setBottomText(e.target.value)} className="input-base w-full text-xs" />
            </label>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs"><span className="dark:text-zinc-400 text-slate-600 font-medium">Text size</span><span className="font-mono font-bold text-indigo-500">{fontSize}</span></div>
            <input type="range" min={16} max={96} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
          </div>
          <button onClick={exportImage} className="btn-primary text-xs px-4 py-2">
            <ImagePlus className="w-3.5 h-3.5" /> Export Meme
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};
