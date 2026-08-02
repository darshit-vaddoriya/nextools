import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2, Maximize2, Scissors, Download, RefreshCw } from 'lucide-react';
import {
  loadImage, canvasFromImage, blobFromCanvas, canvasExport, downloadBlob, createResult,
  baseNameFrom, clamp, formatBytes,
  type ProcessedImage,
} from './ImageUtils';
import { DropZone, ResultPanel, ErrorNotice } from './ImageShared';
import { Select } from '../../components/Select';
import { useExportProgress } from './ExportProgress';

// ─── FORMAT OPTIONS ──────────────────────────────────────────
const FORMATS = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
  { label: 'BMP', mime: 'image/bmp', ext: 'bmp' },
];

const COMPRESSED_FORMATS = [
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
  { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', mime: 'image/png', ext: 'png' },
];

// ─── RESIZE IMAGE ────────────────────────────────────────────
export const ImageResizeTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState('image/webp');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const file = files[0];
      const loaded = await loadImage(file);
      setImg(loaded);
      setOrigW(loaded.naturalWidth);
      setOrigH(loaded.naturalHeight);
      setWidth(loaded.naturalWidth);
      setHeight(loaded.naturalHeight);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image. Please try a JPG, PNG or WebP file.');
    }
  };

  const onWidth = (v: number) => {
    setWidth(v);
    if (lockAspect && img) setHeight(Math.max(1, Math.round(v * (origH / origW))));
  };
  const onHeight = (v: number) => {
    setHeight(v);
    if (lockAspect && img) setWidth(Math.max(1, Math.round(v * (origW / origH))));
  };

  const apply = async () => {
    if (!img || !width || !height) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Reading image…');
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));
        const ctx = canvas.getContext('2d')!;
        report(55, 'Resizing pixels…');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        report(80, 'Compressing…');
        const fmt = FORMATS.find(f => f.mime === format) ?? FORMATS[0];
        const { blob, ext } = await canvasExport(canvas, fmt.mime, 0.92);
        setResult(createResult(blob, canvas.width, canvas.height, `${baseNameFrom('image')}-${canvas.width}x${canvas.height}`, ext));
        report(100, 'Done');
      });
    } catch (e: any) {
      setError(e?.message || 'Resize failed.');
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={img.src} alt="Original" className="max-h-[320px] mx-auto object-contain" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Width (px)</span>
              <input type="number" min={1} value={width} onChange={(e) => onWidth(parseInt(e.target.value) || 1)} className="input-base w-full font-mono" />
            </label>
            <label className="block text-xs">
              <span className="section-label mb-1 block">Height (px)</span>
              <input type="number" min={1} value={height} onChange={(e) => onHeight(parseInt(e.target.value) || 1)} className="input-base w-full font-mono" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs dark:text-zinc-400 text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="rounded text-indigo-500" />
              Lock aspect ratio
            </label>
            <span className="dark:text-zinc-600 text-slate-400 font-mono text-[11px]">Original: {origW} × {origH}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Output format</span>
              <Select
                value={format}
                onChange={setFormat}
                options={FORMATS.map((f) => ({ value: f.mime, label: f.label }))}
              />
            </label>
            <button onClick={apply} className="btn-primary px-5 py-2 text-xs mt-4">
              <Maximize2 className="w-3.5 h-3.5" /> Resize Image
            </button>
          </div>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── ROTATE IMAGE ────────────────────────────────────────────
export const ImageRotateTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [angle, setAngle] = useState(0);
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(85);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setAngle(0);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const apply = async (finalAngle: number) => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(12, 'Reading image…');
        const rad = (finalAngle * Math.PI) / 180;
        const w = img.naturalWidth, h = img.naturalHeight;
        report(45, 'Rotating pixels…');
        const nw = Math.round(Math.abs(Math.cos(rad)) * w + Math.abs(Math.sin(rad)) * h);
        const nh = Math.round(Math.abs(Math.sin(rad)) * w + Math.abs(Math.cos(rad)) * h);
        const canvas = document.createElement('canvas');
        canvas.width = nw;
        canvas.height = nh;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.translate(nw / 2, nh / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -w / 2, -h / 2);
        report(75, 'Compressing…');
        const fmt = COMPRESSED_FORMATS.find(f => f.mime === format) ?? COMPRESSED_FORMATS[0];
        const { blob, ext } = await canvasExport(canvas, fmt.mime, quality / 100);
        setResult(createResult(blob, nw, nh, `${baseNameFrom('image')}-rotated-${finalAngle}`, ext));
        report(100, 'Done');
      });
    } catch (e: any) {
      setError(e?.message || 'Rotation failed.');
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden p-3">
            <img src={img.src} alt="Original" className="max-h-[300px] mx-auto object-contain" style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.1s linear' }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { const a = (angle + 90) % 360; setAngle(a); }} className="btn-secondary text-xs px-4 py-2">
              <RotateCw className="w-3.5 h-3.5" /> 90°
            </button>
            <button onClick={() => { const a = (angle - 90 + 360) % 360; setAngle(a); }} className="btn-secondary text-xs px-4 py-2">
              <RotateCcw className="w-3.5 h-3.5" /> -90°
            </button>
            <button onClick={() => setAngle((angle + 180) % 360)} className="btn-secondary text-xs px-4 py-2">
              Rotate 180°
            </button>
            <button onClick={() => { setAngle(0); setResult(null); }} className="btn-secondary text-xs px-4 py-2">
              Reset
            </button>
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="section-label">Exact rotation</span>
                <span className="font-mono font-bold text-indigo-500">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                className="w-full h-2 cursor-pointer accent-indigo-500"
                aria-label="Rotation angle"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="block text-xs">
                <span className="section-label mb-1 block">Output format</span>
                <Select
                  value={format}
                  onChange={setFormat}
                  options={COMPRESSED_FORMATS.map((f) => ({ value: f.mime, label: f.label }))}
                />
              </label>
              <label className="block text-xs flex-1 min-w-[160px]">
                <span className="section-label mb-1 block">Quality {quality}%</span>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value) || 85)}
                  className="w-full h-2 cursor-pointer accent-indigo-500"
                  aria-label="Output quality"
                />
              </label>
              <button onClick={() => apply(angle)} className="btn-primary text-xs px-4 py-2">
                <RotateCw className="w-3.5 h-3.5" /> Apply Rotation
              </button>
            </div>
          </div>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── FLIP IMAGE ──────────────────────────────────────────────
export const ImageFlipTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(85);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setFlipH(false);
      setFlipV(false);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const apply = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(12, 'Reading image…');
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        report(45, 'Flipping pixels…');
        ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, 0, 0);
        const parts: string[] = [];
        if (flipH) parts.push('h');
        if (flipV) parts.push('v');
        report(75, 'Compressing…');
        const fmt = COMPRESSED_FORMATS.find(f => f.mime === format) ?? COMPRESSED_FORMATS[0];
        const { blob, ext } = await canvasExport(canvas, fmt.mime, quality / 100);
        setResult(createResult(blob, canvas.width, canvas.height, `${baseNameFrom('image')}-flip-${parts.join('') || 'none'}`, ext));
        report(100, 'Done');
      });
    } catch (e: any) {
      setError(e?.message || 'Flip failed.');
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={img.src} alt="Original" className="max-h-[320px] mx-auto object-contain" style={{ transform: `${flipH ? 'scaleX(-1)' : ''} ${flipV ? 'scaleY(-1)' : ''}`, transition: 'transform 0.2s' }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFlipH(p => !p)} className={`btn-secondary text-xs px-4 py-2 ${flipH ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
              <FlipHorizontal2 className="w-3.5 h-3.5" /> Flip Horizontal
            </button>
            <button onClick={() => setFlipV(p => !p)} className={`btn-secondary text-xs px-4 py-2 ${flipV ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
              <FlipVertical2 className="w-3.5 h-3.5" /> Flip Vertical
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-4 rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Output format</span>
              <Select
                value={format}
                onChange={setFormat}
                options={COMPRESSED_FORMATS.map((f) => ({ value: f.mime, label: f.label }))}
              />
            </label>
            <label className="block text-xs flex-1 min-w-[160px]">
              <span className="section-label mb-1 block">Quality {quality}%</span>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value) || 85)}
                className="w-full h-2 cursor-pointer accent-indigo-500"
                aria-label="Output quality"
              />
            </label>
            <button onClick={apply} className="btn-primary text-xs px-4 py-2">
              <Download className="w-3.5 h-3.5" /> Apply & Export
            </button>
          </div>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── CONVERT IMAGE FORMATS ───────────────────────────────────
export const ImageConverterTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState('image/webp');
  const [results, setResults] = useState<(ProcessedImage | null)[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fmt = FORMATS.find(f => f.mime === format) ?? FORMATS[0];

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    setResults(new Array(incoming.length).fill(null));
    setError(null);
  };

  const convertOne = async (index: number) => {
    setBusyId(String(index));
    setError(null);
    try {
      const file = files[index];
      const img = await loadImage(file);
      const canvas = canvasFromImage(img);
      const { blob, ext } = await canvasExport(canvas, fmt.mime, 0.92);
      const result = createResult(blob, canvas.width, canvas.height, `${baseNameFrom(file.name)}.${ext}`, ext);
      setResults(prev => {
        const next = [...prev];
        next[index] = result;
        return next;
      });
    } catch {
      setError(`Could not convert "${files[index]?.name ?? 'file'}".`);
    } finally {
      setBusyId(null);
    }
  };

  const convertAll = async () => {
    if (!files.length) return;
    setBusyId('all');
    setError(null);
    try {
      const out: ProcessedImage[] = [];
      for (const file of files) {
        const img = await loadImage(file);
        const canvas = canvasFromImage(img);
        const { blob, ext } = await canvasExport(canvas, fmt.mime, 0.92);
        out.push(createResult(blob, canvas.width, canvas.height, `${baseNameFrom(file.name)}.${ext}`, ext));
      }
      setResults(out);
    } catch (e: any) {
      setError(e?.message || 'Conversion failed for one or more files.');
    } finally {
      setBusyId(null);
    }
  };

  const downloadOne = (result: ProcessedImage) => downloadBlob(result.blob, result.fileName);

  const downloadAll = () => {
    results.forEach(r => r && downloadBlob(r.blob, r.fileName));
  };

  const convertedCount = results.filter(r => r).length;

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select images to convert" />
      {files.length > 0 && (
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="dark:text-zinc-400 text-slate-500 font-mono">{files.length} file(s) selected</span>
            <label className="flex items-center gap-2">
              <span className="section-label">Convert to</span>
              <Select
                value={format}
                onChange={setFormat}
                options={FORMATS.map((f) => ({ value: f.mime, label: f.label }))}
              />
            </label>
            <button onClick={convertAll} disabled={busyId !== null} className="btn-primary px-4 py-2">
              {busyId === 'all' ? 'Converting…' : 'Convert All'}
            </button>
          </div>
          <div className="max-h-64 overflow-auto space-y-1.5">
            {files.map((f, i) => {
              const result = results[i];
              const busy = busyId === String(i);
              return (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-lg border dark:border-dark-border border-slate-200 px-3 py-2">
                  <span className="truncate dark:text-zinc-400 text-slate-600">{f.name}</span>
                  <span className="font-mono text-[10px] dark:text-zinc-600 text-slate-400 shrink-0">{formatBytes(f.size)}</span>
                  {busy ? (
                    <span className="shrink-0 text-[10px] text-indigo-500">Converting…</span>
                  ) : result ? (
                    <button onClick={() => downloadOne(result)} className="btn-emerald text-[10px] px-2.5 py-1 shrink-0">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  ) : (
                    <button onClick={() => convertOne(i)} disabled={busyId !== null} className="btn-secondary text-[10px] px-2.5 py-1 shrink-0">
                      <RefreshCw className="w-3 h-3" /> Convert
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
      {convertedCount > 0 && (
        <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold dark:text-zinc-300 text-slate-700">{convertedCount} converted</span>
            <button onClick={downloadAll} className="btn-emerald text-xs px-3 py-1.5">Download All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.filter((r): r is ProcessedImage => Boolean(r)).map(r => (
              <div key={r.fileName} className="rounded-xl border dark:border-dark-border border-slate-200 overflow-hidden bg-slate-50 dark:bg-dark-bg">
                <img src={r.url} alt={r.fileName} className="h-24 w-full object-contain" />
                <button onClick={() => downloadOne(r)} className="w-full py-1.5 text-[11px] font-semibold dark:text-indigo-400 text-indigo-600 hover:bg-indigo-500/10">
                  {r.fileName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── IMAGE COMPRESSOR ────────────────────────────────────────
export const ImageCompressorTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('image/jpeg');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    try {
      const file = files[0];
      setImg(await loadImage(file));
      setOrigSize(file.size);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const compress = useCallback(async () => {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = canvasFromImage(img);
      const mime = format === 'image/png' ? 'image/png' : format === 'image/webp' ? 'image/webp' : 'image/jpeg';
      const blob = await blobFromCanvas(canvas, mime, quality / 100);
      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      setResult(createResult(blob, canvas.width, canvas.height, `${baseNameFrom('image')}-compressed`, ext));
    } catch (e: any) {
      setError(e?.message || 'Compression failed.');
    } finally {
      setBusy(false);
    }
  }, [img, format, quality]);

  useEffect(() => { const t = setTimeout(() => { if (img && !result) compress(); }, 500); return () => clearTimeout(t); }, [compress, img, result]);

  const savings = result && origSize ? Math.max(0, Math.round((1 - result.blob.size / origSize) * 100)) : 0;

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select an image to compress" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border dark:border-dark-border border-slate-200 bg-slate-50 dark:bg-dark-bg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider dark:text-zinc-600 text-slate-400 font-semibold mb-1">Original</p>
              <p className="font-mono text-[13px] dark:text-zinc-200 text-slate-700">{formatBytes(origSize)}</p>
              <p className="font-mono text-[10px] dark:text-zinc-600 text-slate-400">{img.naturalWidth} × {img.naturalHeight}</p>
            </div>
            <div className="rounded-xl border dark:border-dark-border border-slate-200 bg-slate-50 dark:bg-dark-bg p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider dark:text-zinc-600 text-slate-400 font-semibold mb-1">Compressed</p>
              <p className="font-mono text-[13px] dark:text-emerald-500 text-emerald-600">{result ? formatBytes(result.blob.size) : '…'}</p>
              <p className="font-mono text-[10px] dark:text-zinc-600 text-slate-400">{result ? `${savings}% saved` : 'waiting'}</p>
            </div>
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="dark:text-zinc-400 text-slate-600 font-medium">Quality</span>
                <span className="font-mono font-bold text-indigo-500">{quality}%</span>
              </div>
              <input type="range" min={5} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
            </div>
            <label className="flex items-center gap-2 text-xs dark:text-zinc-400 text-slate-600">
              <span>Format</span>
              <Select
                value={format}
                onChange={setFormat}
                options={[
                  { value: 'image/jpeg', label: 'JPG' },
                  { value: 'image/webp', label: 'WebP' },
                  { value: 'image/png', label: 'PNG' },
                ]}
              />
            </label>
          </div>
          {busy && <p className="text-xs text-indigo-500">Compressing…</p>}
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} extraInfo={result && origSize ? `${savings}% smaller` : undefined} />
    </div>
  );
};

// ─── CROP IMAGE ──────────────────────────────────────────────
export const ImageCropTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { run, overlay } = useExportProgress();

  // selection in source-image pixel coords
  const [sel, setSel] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 }); // preview coords
  const [fit, setFit] = useState({ w: 0, h: 0, scale: 1 });

  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ px: 0, py: 0, ox: 0, oy: 0 });
  const [resizing, setResizing] = useState(false);

  const handleFiles = async (files: File[]) => {
    try {
      const loaded = await loadImage(files[0]);
      setImg(loaded);
      const w = loaded.naturalWidth, h = loaded.naturalHeight;
      setSel({ x: 0, y: 0, w, h });
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  useEffect(() => {
    if (!img || !wrapRef.current) return;
    const wrap = wrapRef.current;
    const maxW = Math.min(wrap.clientWidth || 640, 720);
    const maxH = 360;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const fw = Math.round(img.naturalWidth * scale);
    const fh = Math.round(img.naturalHeight * scale);
    setFit({ w: fw, h: fh, scale });
    setBox({ x: 0, y: 0, w: fw, h: fh });
    setPreviewUrl(img.src);
  }, [img]);

  const pointerToBox = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const { px, py } = pointerToBox(e);
    const nearHandle = Math.abs(px - (box.x + box.w)) < 14 && Math.abs(py - (box.y + box.h)) < 14;
    if (nearHandle) {
      setResizing(true);
      setDragStart({ px, py, ox: box.x, oy: box.y });
    } else if (px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h) {
      setDragging(true);
      setDragStart({ px, py, ox: box.x, oy: box.y });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!img) return;
    const { px, py } = pointerToBox(e);
    if (resizing) {
      const w = clamp(px - box.x, 8, fit.w - box.x);
      const h = clamp(py - box.y, 8, fit.h - box.y);
      setBox(b => ({ ...b, w, h }));
    } else if (dragging) {
      const nx = clamp(dragStart.ox + (px - dragStart.px), 0, fit.w - box.w);
      const ny = clamp(dragStart.oy + (py - dragStart.py), 0, fit.h - box.h);
      setBox(b => ({ ...b, x: nx, y: ny }));
    }
  };

  const stopDrag = () => { setDragging(false); setResizing(false); };

  const setAspect = (ratio: number | null) => {
    if (!img) return;
    const w = box.w;
    const h = ratio ? Math.round(w / ratio) : box.h;
    const nh = clamp(h, 8, fit.h);
    const nw = clamp(ratio ? Math.round(nh * ratio) : w, 8, fit.w);
    setBox(b => ({ ...b, w: nw, h: nh }));
  };

  const apply = async () => {
    if (!img || !fit.scale) return;
    setError(null);
    try {
      await run(async (report) => {
        report(20, 'Reading image…');
        const x = Math.round(sel.x), y = Math.round(sel.y);
        const w = Math.round(sel.w), h = Math.round(sel.h);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d')!;
        report(55, 'Cropping…');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.92);
        setResult(createResult(blob, w, h, `${baseNameFrom('image')}-cropped`, ext));
        report(100, 'Done');
      });
    } catch (e: any) {
      setError(e?.message || 'Crop failed.');
    }
  };

  const commitBox = () => {
    const x = Math.round(box.x / fit.scale), y = Math.round(box.y / fit.scale);
    const w = Math.round(box.w / fit.scale), h = Math.round(box.h / fit.scale);
    setSel({ x, y, w, h });
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div
            ref={wrapRef}
            className="relative rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden select-none"
            style={{ height: 360 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            <img
              src={previewUrl}
              alt="Crop preview"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
            {fit.w > 0 && (
              <>
                <div
                  className="absolute border-2 border-indigo-500 bg-indigo-500/10"
                  style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                >
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white cursor-nwse-resize" />
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono dark:bg-black/60 bg-black/50 text-white px-2 py-1 rounded">
                  {Math.round(box.w / fit.scale)} × {Math.round(box.h / fit.scale)} px
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ label: 'Free', r: null }, { label: '1:1', r: 1 }, { label: '4:3', r: 4 / 3 }, { label: '16:9', r: 16 / 9 }].map(a => (
              <button key={a.label} onClick={() => setAspect(a.r)} className="btn-secondary text-xs px-4 py-2">{a.label}</button>
            ))}
            <button onClick={() => { commitBox(); apply(); }} className="btn-primary text-xs px-4 py-2">
              <Scissors className="w-3.5 h-3.5" /> Crop Image
            </button>
          </div>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

