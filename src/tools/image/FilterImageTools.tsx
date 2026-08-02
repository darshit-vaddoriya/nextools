import React, { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import {
  loadImage, canvasFromImage, canvasExport, downloadBlob, createResult,
  getPixelData, putPixelData, applyMedian, applyUnsharp,
  type ProcessedImage,
} from './ImageUtils';
import { errorMessage } from '../../utils/errorMessage';
import { DropZone, ResultPanel, ErrorNotice } from './ImageShared';
import { useExportProgress } from './ExportProgress';

function Slider({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; display?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="dark:text-zinc-400 text-slate-600 font-medium">{label}</span>
        <span className="font-mono font-bold text-indigo-500">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
    </div>
  );
}

// ─── BRIGHTNESS / CONTRAST ──────────────────────────────────
export const ImageAdjustTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [bright, setBright] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [sat, setSat] = useState(0);
  const [hue, setHue] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const loaded = await loadImage(files[0]);
      setImg(loaded);
      setBright(0); setContrast(0); setSat(0); setHue(0);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const renderPreview = useMemo(() => (cb: (url: string) => void) => {
    if (!img) return;
    const canvas = canvasFromImage(img, 1400);
    const ctx = canvas.getContext('2d')!;
    ctx.filter = [
      `brightness(${1 + bright / 100})`,
      `contrast(${1 + contrast / 100})`,
      `saturate(${1 + sat / 100})`,
      `hue-rotate(${hue}deg)`,
    ].join(' ');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    cb(canvas.toDataURL('image/png'));
  }, [img, bright, contrast, sat, hue]);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => renderPreview(setPreviewUrl), 20);
    return () => clearTimeout(t);
  }, [img, renderPreview]);

  const exportImage = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Reading image…');
        const canvas = canvasFromImage(img);
        const ctx = canvas.getContext('2d')!;
        report(45, 'Applying adjustments…');
        ctx.filter = [
          `brightness(${1 + bright / 100})`,
          `contrast(${1 + contrast / 100})`,
          `saturate(${1 + sat / 100})`,
          `hue-rotate(${hue}deg)`,
        ].join(' ');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.85);
        setResult(createResult(blob, canvas.width, canvas.height, 'image-adjusted', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Adjust failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={previewUrl} alt="Adjusted preview" className="max-h-[320px] mx-auto object-contain" />
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <Slider label="Brightness" value={bright} min={-100} max={100} onChange={setBright} display={`${bright >= 0 ? '+' : ''}${bright}`} />
            <Slider label="Contrast" value={contrast} min={-100} max={100} onChange={setContrast} display={`${contrast >= 0 ? '+' : ''}${contrast}`} />
            <Slider label="Saturation" value={sat} min={-100} max={100} onChange={setSat} display={`${sat >= 0 ? '+' : ''}${sat}`} />
            <Slider label="Hue" value={hue} min={-180} max={180} onChange={setHue} display={`${hue}°`} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setBright(0); setContrast(0); setSat(0); setHue(0); }} className="btn-secondary text-xs px-4 py-2">
              <RefreshCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={exportImage} className="btn-primary text-xs px-4 py-2">
              <Download className="w-3.5 h-3.5" /> Export Image
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

// ─── SHARPEN IMAGE ──────────────────────────────────────────
export const ImageSharpenTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [strength, setStrength] = useState(100);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const loaded = await loadImage(files[0]);
      setImg(loaded);
      setStrength(100);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const process = useMemo(() => (cb: (url: string) => void) => {
    if (!img) return;
    const canvas = canvasFromImage(img, 1200);
    const data = getPixelData(canvas);
    applyUnsharp(data, strength);
    putPixelData(canvas, data);
    cb(canvas.toDataURL('image/png'));
  }, [img, strength]);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => process(setPreviewUrl), 20);
    return () => clearTimeout(t);
  }, [img, process]);

  const exportImage = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Reading image…');
        const canvas = canvasFromImage(img);
        const data = getPixelData(canvas);
        report(50, 'Sharpening pixels…');
        applyUnsharp(data, strength);
        putPixelData(canvas, data);
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.9);
        setResult(createResult(blob, canvas.width, canvas.height, 'image-sharpened', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Sharpen failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={previewUrl} alt="Sharpen preview" className="max-h-[320px] mx-auto object-contain" />
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <Slider label="Strength" value={strength} min={0} max={300} onChange={setStrength} display={`${Math.round(strength)}%`} />
          </div>
          <button onClick={exportImage} className="btn-primary text-xs px-4 py-2">
            <Download className="w-3.5 h-3.5" /> Export Sharpened
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── NOISE REDUCTION ────────────────────────────────────────
export const NoiseReductionTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [radius, setRadius] = useState(1);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const loaded = await loadImage(files[0]);
      setImg(loaded);
      setRadius(1);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const process = useMemo(() => (cb: (url: string) => void) => {
    if (!img) return;
    const canvas = canvasFromImage(img, 900);
    const data = getPixelData(canvas);
    applyMedian(data, radius);
    putPixelData(canvas, data);
    cb(canvas.toDataURL('image/png'));
  }, [img, radius]);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => process(setPreviewUrl), 20);
    return () => clearTimeout(t);
  }, [img, process]);

  const exportImage = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Reading image…');
        const canvas = canvasFromImage(img, 1200);
        const data = getPixelData(canvas);
        report(55, 'Reducing noise…');
        applyMedian(data, radius);
        putPixelData(canvas, data);
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.9);
        setResult(createResult(blob, canvas.width, canvas.height, 'image-denoised', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Denoise failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={previewUrl} alt="Denoise preview" className="max-h-[320px] mx-auto object-contain" />
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <Slider label="Denoise Strength" value={radius} min={1} max={2} onChange={setRadius} display={radius === 1 ? 'Mild' : 'Strong'} />
          </div>
          <button onClick={exportImage} className="btn-primary text-xs px-4 py-2">
            <Download className="w-3.5 h-3.5" /> Export Denoised
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── BLUR BACKGROUND ────────────────────────────────────────
export const BlurBackgroundTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [blurAmount, setBlurAmount] = useState(12);
  const [zoom, setZoom] = useState(65);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const loaded = await loadImage(files[0]);
      setImg(loaded);
      setBlurAmount(12); setZoom(65);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const render = useMemo(() => (cb: (url: string) => void) => {
    if (!img) return;
    const canvas = canvasFromImage(img, 1400);
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d')!;
    const blurred = document.createElement('canvas');
    blurred.width = w;
    blurred.height = h;
    const bctx = blurred.getContext('2d')!;
    bctx.filter = `blur(${blurAmount}px)`;
    bctx.drawImage(img, 0, 0, w, h);
    ctx.drawImage(blurred, 0, 0);
    const rx = (zoom / 100) * 0.75;
    const ry = (zoom / 100) * 0.75;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * rx, h * ry, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
    cb(canvas.toDataURL('image/png'));
  }, [img, blurAmount, zoom]);

  useEffect(() => {
    if (!img) return;
    const t = setTimeout(() => render(setPreviewUrl), 20);
    return () => clearTimeout(t);
  }, [img, render]);

  const exportImage = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Reading image…');
        const canvas = canvasFromImage(img);
        const w = canvas.width, h = canvas.height;
        const ctx = canvas.getContext('2d')!;
        const blurred = document.createElement('canvas');
        blurred.width = w;
        blurred.height = h;
        const bctx = blurred.getContext('2d')!;
        report(50, 'Blurring background…');
        bctx.filter = `blur(${blurAmount}px)`;
        bctx.drawImage(img, 0, 0, w, h);
        ctx.drawImage(blurred, 0, 0);
        const rx = (zoom / 100) * 0.75;
        const ry = (zoom / 100) * 0.75;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, w * rx, h * ry, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.85);
        setResult(createResult(blob, canvas.width, canvas.height, 'image-blurred-bg', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Blur failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select a photo to blur its background" />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={previewUrl} alt="Blur preview" className="max-h-[320px] mx-auto object-contain" />
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <Slider label="Blur Amount" value={blurAmount} min={2} max={40} onChange={setBlurAmount} display={`${blurAmount}px`} />
            <Slider label="Keep Subject (size)" value={zoom} min={40} max={100} onChange={setZoom} display={`${zoom}%`} />
          </div>
          <button onClick={exportImage} className="btn-primary text-xs px-4 py-2">
            <Download className="w-3.5 h-3.5" /> Export Photo
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};
