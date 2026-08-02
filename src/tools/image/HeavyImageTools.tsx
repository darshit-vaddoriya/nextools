import React, { useState } from 'react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { toDataURL as qrToDataURL } from 'qrcode';
import { createWorker, PSM, type Worker } from 'tesseract.js';
import { Select } from '../../components/Select';
import { Clapperboard, QrCode, ScanText, ZoomIn, Download, Loader2, Film } from 'lucide-react';
import {
  loadImage, canvasFromImage, canvasExport, downloadBlob, createResult,
  getPixelData, putPixelData, applyUnsharp, clamp,
  type ProcessedImage,
} from './ImageUtils';
import { DropZone, ResultPanel, ErrorNotice } from './ImageShared';
import { CopyButton } from '../../components/CopyButton';
import { useExportProgress } from './ExportProgress';

// ─── GIF CONVERTER ──────────────────────────────────────────
type GifSource = { img: HTMLImageElement; name: string };

export const GifConverterTool: React.FC = () => {
  const [mode, setMode] = useState<'images' | 'video'>('images');
  const [items, setItems] = useState<GifSource[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [delay, setDelay] = useState(120);
  const [width, setWidth] = useState(320);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleImages = async (files: File[]) => {
    const list: GifSource[] = [];
    for (const f of files) {
      try { list.push({ img: await loadImage(f), name: f.name }); } catch { /* skip */ }
    }
    setItems(list);
    setResult(null);
    setError(null);
  };

  const handleVideo = async (files: File[]) => {
    setVideoFile(files[0]);
    setResult(null);
    setError(null);
  };

  const build = async () => {
    setBusy(true);
    setError(null);
    try {
      await run(async (report) => {
        report(5, 'Preparing…');
        const gif = GIFEncoder();
        if (mode === 'images') {
          if (!items.length) throw new Error('Add at least one image.');
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            report(Math.round(10 + (80 * i) / items.length), `Encoding frame ${i + 1}/${items.length}…`);
            const scale = width / it.img.naturalWidth;
            const cw = Math.round(width);
            const ch = Math.round(it.img.naturalHeight * scale);
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(it.img, 0, 0, cw, ch);
            const data = ctx.getImageData(0, 0, cw, ch).data;
            const palette = quantize(data, 256);
            const index = applyPalette(data, palette);
            gif.writeFrame(index, cw, ch, { palette, delay });
          }
        } else {
          if (!videoFile) throw new Error('Add a video file.');
          const frames = 24;
          const url = URL.createObjectURL(videoFile);
          const video = document.createElement('video');
          video.muted = true;
          video.playsInline = true;
          video.src = url;
          await new Promise<void>((res, rej) => { video.onloadedmetadata = () => res(); video.onerror = () => rej(new Error('Could not read video')); });
          const duration = video.duration || 0;
          for (let i = 0; i < frames; i++) {
            report(Math.round(10 + (80 * i) / frames), `Sampling frame ${i + 1}/${frames}…`);
            video.currentTime = duration * (i / Math.max(frames - 1, 1));
            await new Promise<void>((res) => { video.onseeked = () => res(); });
            const scale = width / video.videoWidth;
            const cw = Math.round(width);
            const ch = Math.round(video.videoHeight * scale);
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(video, 0, 0, cw, ch);
            const data = ctx.getImageData(0, 0, cw, ch).data;
            const palette = quantize(data, 256);
            const index = applyPalette(data, palette);
            gif.writeFrame(index, cw, ch, { palette, delay });
          }
          URL.revokeObjectURL(url);
        }
        report(92, 'Finalizing GIF…');
        gif.finish();
        const blob = new Blob([gif.bytes()], { type: 'image/gif' });
        setResult({ blob, url: URL.createObjectURL(blob), width, height: 0, fileName: 'animated.gif' });
        report(100, 'Done');
      });
    } catch (e: any) {
      setError(e?.message || 'GIF creation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setMode('images')} className={`btn-secondary text-xs px-4 py-2 ${mode === 'images' ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
          <Clapperboard className="w-3.5 h-3.5" /> Images → GIF
        </button>
        <button onClick={() => setMode('video')} className={`btn-secondary text-xs px-4 py-2 ${mode === 'video' ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
          <Film className="w-3.5 h-3.5" /> Video → GIF
        </button>
      </div>
      {mode === 'images' ? (
        <DropZone onFiles={handleImages} multiple label="Select frames (in order)" hint="The order of your selection becomes the animation" />
      ) : (
        <DropZone onFiles={handleVideo} accept="video/*" label="Select a video clip" hint="Frames will be sampled across the whole clip" />
      )}
      {(items.length > 0 || videoFile) && (
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="section-label mb-1 block">Frame delay (ms)</span>
              <input type="number" min={20} max={2000} value={delay} onChange={(e) => setDelay(parseInt(e.target.value) || 100)} className="input-base w-24 font-mono" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Output width (px)</span>
              <input type="number" min={80} max={800} value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 320)} className="input-base w-24 font-mono" />
            </label>
            <button onClick={build} disabled={busy} className="btn-primary px-4 py-2">
              {busy ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Building…</> : <><Download className="w-3.5 h-3.5" /> Create GIF</>}
            </button>
            <span className="font-mono text-[11px] dark:text-zinc-500 text-slate-400">
              {mode === 'images' ? `${items.length} frame(s)` : videoFile?.name}
            </span>
          </div>
          {mode === 'images' && items.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {items.map((it, i) => (
                <img key={i} src={it.img.src} alt={`frame-${i}`} className="h-16 w-16 object-contain rounded-lg border dark:border-dark-border border-slate-200 dark:bg-dark-bg bg-slate-100" />
              ))}
            </div>
          )}
        </div>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} downloadLabel="Download GIF" />
      {overlay}
    </div>
  );
};

// ─── QR & BARCODE GENERATOR ────────────────────────────────
type QrKind = 'url' | 'text' | 'wifi' | 'vcard';

export const QrGeneratorTool: React.FC = () => {
  const [kind, setKind] = useState<QrKind>('url');
  const [url, setUrl] = useState('https://nex-tools.vercel.app');
  const [text, setText] = useState('Hello from NexTools!');
  const [ssid, setSsid] = useState('MyWiFi');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');
  const [vName, setVName] = useState('John Doe');
  const [vPhone, setVPhone] = useState('+1 555 000 1234');
  const [vEmail, setVEmail] = useState('john@example.com');
  const [size, setSize] = useState(256);
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [ec, setEc] = useState('M');
  const [dataUrl, setDataUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = () => {
    switch (kind) {
      case 'url': return url;
      case 'text': return text;
      case 'wifi': return `WIFI:T:${wifiEnc};S:${ssid};P:${wifiPass};;`;
      case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${vName}\nTEL:${vPhone}\nEMAIL:${vEmail}\nEND:VCARD`;
    }
  };

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const p = payload();
      if (!p.trim()) throw new Error('Enter some content first.');
      const d = await qrToDataURL(p, {
        width: size,
        margin: 2,
        errorCorrectionLevel: ec as 'L' | 'M' | 'Q' | 'H',
        color: { dark: fg, light: bg },
      });
      setDataUrl(d);
    } catch (e: any) {
      setError(e?.message || 'QR generation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {([['url', 'URL'], ['text', 'Plain Text'], ['wifi', 'Wi-Fi'], ['vcard', 'vCard']] as [QrKind, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setKind(k)} className={`btn-secondary text-xs px-4 py-2 ${kind === k ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
        {kind === 'url' && (
          <label className="block text-xs">
            <span className="section-label mb-1 block">URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-base w-full font-mono text-xs" />
          </label>
        )}
        {kind === 'text' && (
          <label className="block text-xs">
            <span className="section-label mb-1 block">Text</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="input-base w-full text-xs" />
          </label>
        )}
        {kind === 'wifi' && (
          <div className="grid grid-cols-3 gap-3 text-xs">
            <label className="block">
              <span className="section-label mb-1 block">Encryption</span>
              <Select
                value={wifiEnc}
                onChange={setWifiEnc}
                options={[
                  { value: 'WPA', label: 'WPA' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'No password' },
                ]}
              />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">SSID</span>
              <input value={ssid} onChange={(e) => setSsid(e.target.value)} className="input-base w-full font-mono" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Password</span>
              <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="input-base w-full font-mono" />
            </label>
          </div>
        )}
        {kind === 'vcard' && (
          <div className="grid grid-cols-3 gap-3 text-xs">
            <label className="block">
              <span className="section-label mb-1 block">Name</span>
              <input value={vName} onChange={(e) => setVName(e.target.value)} className="input-base w-full" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Phone</span>
              <input value={vPhone} onChange={(e) => setVPhone(e.target.value)} className="input-base w-full font-mono" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Email</span>
              <input value={vEmail} onChange={(e) => setVEmail(e.target.value)} className="input-base w-full font-mono" />
            </label>
          </div>
        )}
        <div className="grid grid-cols-4 gap-3 text-xs">
          <label className="block">
            <span className="section-label mb-1 block">Size (px)</span>
            <input type="number" min={64} max={1024} value={size} onChange={(e) => setSize(parseInt(e.target.value) || 256)} className="input-base w-full font-mono" />
          </label>
          <label className="block">
            <span className="section-label mb-1 block">Error level</span>
            <Select
              value={ec}
              onChange={setEc}
              options={['L', 'M', 'Q', 'H'].map((l) => ({ value: l, label: l }))}
            />
          </label>
          <label className="block">
            <span className="section-label mb-1 block">Color</span>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-8 w-full rounded border dark:border-dark-border border-slate-300 cursor-pointer bg-transparent" />
          </label>
          <label className="block">
            <span className="section-label mb-1 block">Background</span>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-full rounded border dark:border-dark-border border-slate-300 cursor-pointer bg-transparent" />
          </label>
        </div>
        <button onClick={generate} disabled={busy} className="btn-primary text-xs px-4 py-2">
          <QrCode className="w-3.5 h-3.5" /> {busy ? 'Generating…' : 'Generate QR Code'}
        </button>
      </div>
      <ErrorNotice message={error} />
      {dataUrl && (
        <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3 text-center">
          <div className="mx-auto w-fit rounded-xl border dark:border-dark-border border-slate-200 p-3 bg-white">
            <img src={dataUrl} alt="QR code" className="mx-auto" style={{ width: Math.min(size, 280) }} />
          </div>
          <div className="flex justify-center gap-2">
            <CopyButton text={dataUrl} label="Copy Data URL" />
            <button onClick={() => downloadDataUrl(dataUrl, 'qrcode.png')} className="btn-emerald text-xs px-3 py-1.5">
              <Download className="w-3.5 h-3.5" /> Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── OCR IMAGE TO TEXT ──────────────────────────────────────
const OCR_LANGUAGES = [
  { id: 'eng', label: 'English' },
  { id: 'hin', label: 'Hindi' },
  { id: 'eng+hin', label: 'English + Hindi' },
  { id: 'spa', label: 'Spanish' },
  { id: 'fra', label: 'French' },
  { id: 'deu', label: 'German' },
];

const OCR_PSM: { id: PSM; label: string }[] = [
  { id: PSM.AUTO, label: 'Auto' },
  { id: PSM.SINGLE_BLOCK, label: 'Single block' },
  { id: PSM.SPARSE_TEXT, label: 'Sparse (screenshots)' },
  { id: PSM.SINGLE_LINE, label: 'Single line' },
];

function preprocessForOcr(img: HTMLImageElement): HTMLCanvasElement {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  const small = Math.min(w, h);
  if (small < 900 && small > 0) {
    const s = Math.min(2, 900 / small);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const MAX = 2600;
  if (w > MAX || h > MAX) {
    const s = Math.min(MAX / w, MAX / h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const contrast = 1.4;
  for (let i = 0; i < px.length; i += 4) {
    const v = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2] - 128) * contrast + 128;
    const c = Math.min(255, Math.max(0, v));
    px[i] = c;
    px[i + 1] = c;
    px[i + 2] = c;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

export const OcrImageTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [lang, setLang] = useState('eng');
  const [psm, setPsm] = useState<PSM>(PSM.AUTO);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'recognizing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setText('');
    setStatus('idle');
    setError(null);
  };

  const recognize = async () => {
    if (!file) return;
    setStatus('loading');
    setError(null);
    let worker: Worker | null = null;
    try {
      worker = await createWorker(lang);
      await worker.setParameters({ tessedit_pageseg_mode: psm });
      setStatus('recognizing');
      const img = await loadImage(file);
      const canvas = preprocessForOcr(img);
      const { data } = await worker.recognize(canvas, { rotateAuto: true });
      setText(data.text.trim());
      setStatus('done');
    } catch (e: any) {
      setError(e?.message || 'OCR failed - check your connection.');
      setStatus('error');
    } finally {
      if (worker) await worker.terminate().catch(() => {});
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <DropZone onFiles={handleFiles} label="Select an image with text" hint="Uses Tesseract.js on your device, so the image never gets uploaded" />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={previewUrl} alt="OCR source" className="max-h-[260px] mx-auto object-contain" />
          </div>
          <div className="flex items-center gap-3 text-xs dark:text-zinc-400 text-slate-600">
            <span className="font-mono">{file.name}</span>
            <span className="font-mono dark:text-zinc-500 text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Language</span>
              <Select
                value={lang}
                onChange={setLang}
                options={OCR_LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
              />
            </label>
            <label className="block text-xs">
              <span className="section-label mb-1 block">Layout</span>
              <Select
                value={psm}
                onChange={(v) => setPsm(v as PSM)}
                options={OCR_PSM.map((p) => ({ value: p.id, label: p.label }))}
              />
            </label>
          </div>
          <button onClick={recognize} disabled={status === 'loading' || status === 'recognizing'} className="btn-primary text-xs px-4 py-2">
            {status === 'loading' || status === 'recognizing' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {status === 'loading' ? 'Loading language model…' : 'Recognizing…'}</> : <><ScanText className="w-3.5 h-3.5" /> Extract Text</>}
          </button>
          <p className="text-[11px] dark:text-zinc-500 text-slate-500 leading-relaxed">
            Tips: sharp, high-contrast images give the best results. For app/website screenshots, pick <span className="font-semibold dark:text-zinc-300 text-slate-700">Sparse</span> layout. First run of a language downloads its model, then it works offline.
          </p>
        </>
      )}
      {(status === 'done' || text) && (
        <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold dark:text-zinc-300 text-slate-700 flex items-center gap-1.5">
              <ScanText className="w-4 h-4 text-emerald-500" /> Extracted text
            </span>
            <CopyButton text={text} label="Copy Text" />
          </div>
          <textarea readOnly value={text} rows={8} className="input-base w-full text-xs leading-relaxed" />
        </div>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};

// ─── AI IMAGE UPSCALER ──────────────────────────────────────
export const AiUpscalerTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(2);
  const [sharpen, setSharpen] = useState(30);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const upscale = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Reading image…');
        const maxOut = 6000;
        const w = clamp(Math.round(img.naturalWidth * scale), 1, maxOut);
        const h = clamp(Math.round(img.naturalHeight * scale), 1, maxOut);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        report(50, 'Upscaling pixels…');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        if (sharpen > 0) {
          const data = getPixelData(canvas);
          applyUnsharp(data, sharpen);
          putPixelData(canvas, data);
        }
        report(80, 'Compressing…');
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.92);
        setResult(createResult(blob, canvas.width, canvas.height, `image-${scale}x`, ext));
        report(100, 'Done');
      });
    } catch (e: any) {
      setError(e?.message || 'Upscale failed.');
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select a photo to upscale" />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 flex items-center gap-4">
            <img src={img.src} alt="Source" className="w-24 h-24 object-contain rounded-lg dark:bg-dark-bg bg-slate-100 border dark:border-dark-border border-slate-200" />
            <div className="text-xs dark:text-zinc-400 text-slate-600 space-y-1">
              <p className="font-mono dark:text-zinc-300 text-slate-700">{img.naturalWidth} × {img.naturalHeight} → {Math.min(clamp(Math.round(img.naturalWidth * scale), 1, 6000), 6000)} × {Math.min(clamp(Math.round(img.naturalHeight * scale), 1, 6000), 6000)}</p>
              <p>High-quality interpolation with detail enhancement.</p>
            </div>
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-4">
            <div className="flex gap-2">
              {[2, 4].map(s => (
                <button key={s} onClick={() => setScale(s)} className={`btn-secondary text-xs px-4 py-2 ${scale === s ? 'dark:bg-indigo-500/20 bg-indigo-100 border-indigo-300' : ''}`}>
                  {s}× Upscale
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs"><span className="dark:text-zinc-400 text-slate-600 font-medium">Detail enhancement</span><span className="font-mono font-bold text-indigo-500">{sharpen}%</span></div>
              <input type="range" min={0} max={100} value={sharpen} onChange={(e) => setSharpen(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-500 cursor-pointer" />
            </div>
          </div>
          <button onClick={upscale} className="btn-primary text-xs px-4 py-2">
            <ZoomIn className="w-3.5 h-3.5" /> Upscale Image
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};
