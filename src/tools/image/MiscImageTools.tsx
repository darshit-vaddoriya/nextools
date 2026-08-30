import React, { useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  ImageIcon, Download, Grid3x3, Type, Images, FileImage,
} from 'lucide-react';
import { DropZone, ErrorNotice } from './ImageShared';
import { loadImage, downloadBlob, formatBytes, baseNameFrom, canvasExport } from './ImageUtils';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { errorMessage } from '../../utils/errorMessage';

// ─── ICO GENERATOR ─────────────────────────────────────────────
const ICO_SIZES = [16, 32, 48, 64];

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG encode failed');
  return new Uint8Array(await blob.arrayBuffer());
}

function buildIco(images: { size: number; png: Uint8Array }[]): Blob {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset0 = headerSize + dirEntrySize * count;

  const header = new Uint8Array(headerSize);
  const headerView = new DataView(header.buffer);
  headerView.setUint16(0, 0, true); // reserved
  headerView.setUint16(2, 1, true); // type: icon
  headerView.setUint16(4, count, true);

  const dirEntries: Uint8Array[] = [];
  let offset = dataOffset0;
  for (const img of images) {
    const entry = new Uint8Array(dirEntrySize);
    const dv = new DataView(entry.buffer);
    const dim = img.size >= 256 ? 0 : img.size; // 0 means 256
    entry[0] = dim; // width
    entry[1] = dim; // height
    entry[2] = 0; // color palette
    entry[3] = 0; // reserved
    dv.setUint16(4, 1, true); // color planes
    dv.setUint16(6, 32, true); // bits per pixel
    dv.setUint32(8, img.png.byteLength, true); // size of image data
    dv.setUint32(12, offset, true); // offset
    dirEntries.push(entry);
    offset += img.png.byteLength;
  }

  const parts: BlobPart[] = [header, ...dirEntries, ...images.map((i) => i.png)] as unknown as BlobPart[];
  return new Blob(parts, { type: 'image/x-icon' });
}

export const IcoGeneratorTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icoUrl, setIcoUrl] = useState<string | null>(null);
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setIcoUrl(null);
      setIcoBlob(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const generate = async () => {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      const images: { size: number; png: Uint8Array }[] = [];
      for (const size of ICO_SIZES) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        const png = await canvasToPngBytes(canvas);
        images.push({ size, png });
      }
      const blob = buildIco(images);
      setIcoBlob(blob);
      setIcoUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(errorMessage(e, 'Could not generate .ico file.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select an image to convert to .ico" />
      ) : (
        <>
          <div className="rounded-2xl border bg-card border-border overflow-hidden">
            <img src={img.src} alt="Source" className="max-h-[260px] mx-auto object-contain" />
          </div>
          <p className="text-xs text-muted-foreground">Generates a multi-size .ico containing {ICO_SIZES.join(', ')}px PNG-embedded frames.</p>
          <button onClick={generate} disabled={busy} className="btn-primary text-xs px-4 py-2">
            <FileImage className="w-3.5 h-3.5" /> {busy ? 'Generating…' : 'Generate ICO'}
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      {icoUrl && icoBlob && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <img src={icoUrl} alt="ICO preview" className="w-8 h-8" />
            <span className="text-xs text-muted-foreground font-mono">{formatBytes(icoBlob.size)}</span>
          </div>
          <button onClick={() => downloadBlob(icoBlob, `${baseNameFrom('icon')}.ico`)} className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download favicon.ico
          </button>
        </div>
      )}
    </div>
  );
};

// ─── IMAGE TO BASE64 ────────────────────────────────────────────
export const ImageToBase64Tool: React.FC = () => {
  const [dataUrl, setDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result));
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} label="Select an image to convert to Base64" />
      <ErrorNotice message={error} />
      {dataUrl && (
        <div className="space-y-3">
          <div className="rounded-2xl border bg-card border-border overflow-hidden flex items-center justify-center p-3">
            <img src={dataUrl} alt={fileName} className="max-h-[220px] object-contain" />
          </div>
          <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="section-label">Base64 data URL</p>
              <CopyButton text={dataUrl} />
            </div>
            <textarea readOnly value={dataUrl} rows={6} className="textarea-base font-mono h-32 break-all" />
            <p className="text-[10px] text-muted-foreground font-mono">{formatBytes(dataUrl.length)} as text</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── BASE64 TO IMAGE ────────────────────────────────────────────
export const Base64ToImageTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<{ url: string; mime: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = () => {
    setError(null);
    setPreview(null);
    const raw = input.trim();
    if (!raw) return;
    try {
      let mime = 'image/png';
      let base64 = raw;
      const match = raw.match(/^data:([^;]+);base64,(.*)$/s);
      if (match) {
        mime = match[1];
        base64 = match[2];
      }
      const binary = atob(base64.replace(/\s+/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      setPreview({ url: URL.createObjectURL(blob), mime });
    } catch {
      setError('Could not decode this Base64 string. Make sure it is a valid data URL or raw Base64.');
    }
  };

  const ext = preview?.mime.split('/')[1] ?? 'png';

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <p className="section-label">Base64 string or data URL</p>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="data:image/png;base64,iVBORw0KGgo…" rows={6} className="textarea-base font-mono h-32" />
        <button onClick={decode} className="btn-primary text-xs px-4 py-2"><ImageIcon className="w-3.5 h-3.5" /> Decode Image</button>
      </div>
      <ErrorNotice message={error} />
      {preview && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center max-h-[320px]">
            <img src={preview.url} alt="Decoded" className="max-w-full max-h-[320px] object-contain" />
          </div>
          <a href={preview.url} download={`decoded.${ext}`} className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Image
          </a>
        </div>
      )}
    </div>
  );
};

// ─── IMAGE COLLAGE ──────────────────────────────────────────────
export const ImageCollageTool: React.FC = () => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [cols, setCols] = useState(0); // 0 = auto
  const [gap, setGap] = useState(8);
  const [format, setFormat] = useState('image/png');
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: File[]) => {
    const slice = files.slice(0, 9);
    try {
      const loaded = await Promise.all(slice.map((f) => loadImage(f)));
      setImages(loaded);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read one or more images.');
    }
  };

  const autoCols = useMemo(() => Math.ceil(Math.sqrt(images.length || 1)), [images.length]);
  const effectiveCols = cols || autoCols;

  const generate = async () => {
    if (images.length < 2) { setError('Add at least 2 images.'); return; }
    setBusy(true);
    setError(null);
    try {
      const c = effectiveCols;
      const rows = Math.ceil(images.length / c);
      const cellW = Math.max(...images.map((i) => i.naturalWidth));
      const cellH = Math.max(...images.map((i) => i.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = c * cellW + gap * (c - 1);
      canvas.height = rows * cellH + gap * (rows - 1);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      images.forEach((img, i) => {
        const col = i % c;
        const row = Math.floor(i / c);
        const x = col * (cellW + gap);
        const y = row * (cellH + gap);
        const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, x + (cellW - w) / 2, y + (cellH - h) / 2, w, h);
      });
      const { blob } = await canvasExport(canvas, format, 0.92);
      setResult({ url: URL.createObjectURL(blob), blob });
    } catch (e) {
      setError(errorMessage(e, 'Could not create collage.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select 2-9 images" hint="Arranged into a grid collage" />
      {images.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs text-muted-foreground font-mono">{images.length} image(s) selected · grid {effectiveCols} columns</p>
          <div className="flex flex-wrap items-end gap-4">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Columns (0 = auto)</span>
              <input type="number" min={0} max={9} value={cols} onChange={(e) => setCols(parseInt(e.target.value) || 0)} className="input-base w-24 font-mono" />
            </label>
            <label className="block text-xs">
              <span className="section-label mb-1 block">Gap (px)</span>
              <input type="number" min={0} max={40} value={gap} onChange={(e) => setGap(parseInt(e.target.value) || 0)} className="input-base w-24 font-mono" />
            </label>
            <label className="block text-xs">
              <span className="section-label mb-1 block">Format</span>
              <Select value={format} onChange={setFormat} options={[{ value: 'image/png', label: 'PNG' }, { value: 'image/jpeg', label: 'JPG' }]} className="w-28" />
            </label>
            <button onClick={generate} disabled={busy} className="btn-primary text-xs px-4 py-2">
              <Grid3x3 className="w-3.5 h-3.5" /> {busy ? 'Building…' : 'Create Collage'}
            </button>
          </div>
        </div>
      )}
      <ErrorNotice message={error} />
      {result && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center max-h-[340px]">
            <img src={result.url} alt="Collage" className="max-w-full max-h-[340px] object-contain" />
          </div>
          <button onClick={() => downloadBlob(result.blob, 'collage.png')} className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Collage
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MEME GENERATOR ─────────────────────────────────────────────
export const MemeGeneratorTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const drawMemeText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, fontSize: number) => {
    ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.lineWidth = Math.max(2, fontSize / 12);
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    const words = text.toUpperCase().split(' ');
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => {
      const ly = y + i * fontSize * 1.1;
      ctx.strokeText(l, x, ly);
      ctx.fillText(l, x, ly);
    });
  };

  const generate = async () => {
    if (!img) return;
    setError(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const fontSize = Math.round(canvas.width / 12);
      if (topText.trim()) drawMemeText(ctx, topText, canvas.width / 2, fontSize + 10, canvas.width * 0.9, fontSize);
      if (bottomText.trim()) drawMemeText(ctx, bottomText, canvas.width / 2, canvas.height - fontSize * 0.6, canvas.width * 0.9, fontSize);
      const { blob } = await canvasExport(canvas, 'image/png');
      setResult({ url: URL.createObjectURL(blob), blob });
      canvasRef.current = canvas;
    } catch (e) {
      setError(errorMessage(e, 'Could not generate meme.'));
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select an image for your meme" />
      ) : (
        <>
          <div className="rounded-2xl border bg-card border-border overflow-hidden">
            <img src={img.src} alt="Source" className="max-h-[260px] mx-auto object-contain" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-xs">
              <span className="section-label mb-1 block">Top text</span>
              <input value={topText} onChange={(e) => setTopText(e.target.value)} className="input-base w-full" />
            </label>
            <label className="block text-xs">
              <span className="section-label mb-1 block">Bottom text</span>
              <input value={bottomText} onChange={(e) => setBottomText(e.target.value)} className="input-base w-full" />
            </label>
          </div>
          <button onClick={generate} className="btn-primary text-xs px-4 py-2"><Type className="w-3.5 h-3.5" /> Generate Meme</button>
        </>
      )}
      <ErrorNotice message={error} />
      {result && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center max-h-[340px]">
            <img src={result.url} alt="Meme" className="max-w-full max-h-[340px] object-contain" />
          </div>
          <button onClick={() => downloadBlob(result.blob, 'meme.png')} className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Meme
          </button>
        </div>
      )}
    </div>
  );
};

// ─── BATCH RESIZE ────────────────────────────────────────────────
export const BatchResizeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'exact' | 'percent'>('exact');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [percent, setPercent] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    setError(null);
  };

  const run = async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const zip = new JSZip();
      for (const file of files) {
        const img = await loadImage(file);
        let w: number, h: number;
        if (mode === 'exact') {
          w = width;
          h = height;
        } else {
          w = Math.max(1, Math.round(img.naturalWidth * (percent / 100)));
          h = Math.max(1, Math.round(img.naturalHeight * (percent / 100)));
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        const { blob, ext } = await canvasExport(canvas, 'image/webp', 0.9);
        zip.file(`${baseNameFrom(file.name)}-${w}x${h}.${ext}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'resized-images.zip');
    } catch (e) {
      setError(errorMessage(e, 'Could not resize these images.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} multiple label="Select images to batch resize" />
      {files.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-xs text-muted-foreground font-mono">{files.length} file(s) selected</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setMode('exact')} className={`btn-secondary text-xs px-4 py-2 ${mode === 'exact' ? 'bg-primary/10 border-primary' : ''}`}>Exact size</button>
            <button onClick={() => setMode('percent')} className={`btn-secondary text-xs px-4 py-2 ${mode === 'percent' ? 'bg-primary/10 border-primary' : ''}`}>By percentage</button>
          </div>
          {mode === 'exact' ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs">
                <span className="section-label mb-1 block">Width (px)</span>
                <input type="number" min={1} value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 1)} className="input-base w-full font-mono" />
              </label>
              <label className="block text-xs">
                <span className="section-label mb-1 block">Height (px)</span>
                <input type="number" min={1} value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 1)} className="input-base w-full font-mono" />
              </label>
            </div>
          ) : (
            <label className="block text-xs">
              <span className="section-label mb-1 block">Scale {percent}%</span>
              <input type="range" min={1} max={200} value={percent} onChange={(e) => setPercent(parseInt(e.target.value) || 1)} className="w-full h-2 cursor-pointer accent-primary" />
            </label>
          )}
          <button onClick={run} disabled={busy} className="btn-primary w-full py-2.5 text-xs">
            <Images className="w-4 h-4" /> {busy ? 'Resizing…' : 'Resize All & Download ZIP'}
          </button>
        </div>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};
