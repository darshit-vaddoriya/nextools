import React, { useState } from 'react';
import { Image as ImageIcon, ShieldOff, Download, Copy } from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';
import {
  loadImage, canvasFromImage, canvasExport, downloadBlob, downloadDataUrl,
  createResult, formatBytes,
  type ProcessedImage,
} from './ImageUtils';
import { errorMessage } from '../../utils/errorMessage';
import { DropZone, ResultPanel, ErrorNotice } from './ImageShared';
import { Select } from '../../components/Select';
import { useExportProgress } from './ExportProgress';

// ─── SVG CONVERTER ──────────────────────────────────────────
function svgDims(svg: string): { w: number; h: number } {
  const mW = svg.match(/width="([\d.]+)/);
  const mH = svg.match(/height="([\d.]+)/);
  let w = mW ? parseFloat(mW[1]) : 0;
  let h = mH ? parseFloat(mH[1]) : 0;
  if (!w || !h) {
    const vb = svg.match(/viewBox="([^"]+)"/);
    if (vb) {
      const p = vb[1].split(/[\s,]+/).map(Number);
      if (p.length >= 4) { w = p[2]; h = p[3]; }
    }
  }
  if (!w || !h) { w = 300; h = 150; }
  return { w, h };
}

const SVG_FORMATS = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
];

export const SvgConverterTool: React.FC = () => {
  const [svgText, setSvgText] = useState('');
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState('image/webp');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const text = await files[0].text();
      if (!text.trim().startsWith('<')) throw new Error('Not an SVG file');
      setSvgText(text);
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that SVG file.');
    }
  };

  const convert = async () => {
    if (!svgText.trim()) return;
    setError(null);
    try {
      await run(async (report) => {
        report(15, 'Parsing SVG…');
        const { w, h } = svgDims(svgText);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        report(50, 'Rasterizing…');
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = () => reject(new Error('SVG could not be rasterized'));
          i.src = url;
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        report(80, 'Encoding…');
        const fmt = SVG_FORMATS.find(f => f.mime === format) ?? SVG_FORMATS[0];
        const { blob, ext } = await canvasExport(canvas, fmt.mime, 0.92);
        setResult(createResult(blob, canvas.width, canvas.height, 'converted', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Rasterization failed.'))
    }
  };

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} accept=".svg,image/svg+xml" label="Select an SVG file" hint="Or paste SVG code below" compact />
      <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-3 space-y-2">
        <label className="block text-xs dark:text-zinc-400 text-slate-600 font-medium">SVG markup</label>
        <textarea
          value={svgText}
          onChange={(e) => { setSvgText(e.target.value); setResult(null); }}
          placeholder={`<svg viewBox="0 0 100 100" ...>...</svg>`}
          rows={6}
          className="input-base w-full font-mono text-xs"
        />
      </div>
      {svgText.trim() && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs dark:text-zinc-400 text-slate-600">
            <span>Scale</span>
            <Select
              value={String(scale)}
              onChange={(v) => setScale(parseInt(v))}
              options={[1, 2, 3, 4, 6, 8].map((s) => ({ value: String(s), label: `${s}×` }))}
            />
          </label>
          <label className="flex items-center gap-2 text-xs dark:text-zinc-400 text-slate-600">
            <span>Output</span>
            <Select
              value={format}
              onChange={setFormat}
              options={SVG_FORMATS.map((f) => ({ value: f.mime, label: f.label }))}
            />
          </label>
          <button onClick={convert} className="btn-primary text-xs px-4 py-2">
            Convert SVG
          </button>
          <span className="text-[11px] font-mono dark:text-zinc-500 text-slate-400">Output: {Math.round(svgDims(svgText).w * scale)} × {Math.round(svgDims(svgText).h * scale)} px</span>
        </div>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
      {overlay}
    </div>
  );
};

// ─── ICO GENERATOR ──────────────────────────────────────────
const ICO_SIZES = [16, 32, 48, 64, 128, 256];

async function makeIcoBlob(img: HTMLImageElement): Promise<Blob> {
  const pngs: Blob[] = [];
  for (const s of ICO_SIZES) {
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, s, s);
    const png = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
    if (!png) throw new Error('ICO export failed');
    pngs.push(png);
  }
  const count = pngs.length;
  const headerSize = 6 + 16 * count;
  const bufs: ArrayBuffer[] = [];
  const dirs: { size: number; offset: number }[] = [];
  let offset = headerSize;
  for (const png of pngs) {
    const ab = await png.arrayBuffer();
    dirs.push({ size: ab.byteLength, offset });
    offset += ab.byteLength;
    bufs.push(ab);
  }
  const out = new Uint8Array(offset);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, 0, true);
  dv.setUint16(2, 1, true);
  dv.setUint16(4, count, true);
  dirs.forEach((d, i) => {
    const base = 6 + i * 16;
    const s = ICO_SIZES[i];
    dv.setUint8(base, s >= 256 ? 0 : s);
    dv.setUint8(base + 1, s >= 256 ? 0 : s);
    dv.setUint8(base + 2, 0);
    dv.setUint8(base + 3, 0);
    dv.setUint16(base + 4, 1, true);
    dv.setUint16(base + 6, 32, true);
    dv.setUint32(base + 8, d.size, true);
    dv.setUint32(base + 12, d.offset, true);
  });
  let pos = headerSize;
  for (const b of bufs) {
    out.set(new Uint8Array(b), pos);
    pos += b.byteLength;
  }
  return new Blob([out], { type: 'image/x-icon' });
}

export const IcoGeneratorTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: File[]) => {
    try {
      setImg(await loadImage(files[0]));
      setResult(null);
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
      const blob = await makeIcoBlob(img);
      setResult({ blob, url: URL.createObjectURL(blob), width: 256, height: 256, fileName: 'favicon.ico' });
    } catch (e) {
      setError(errorMessage(e, 'ICO generation failed.'))
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select a square image (PNG works best)" />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 flex items-center gap-4">
            <img src={img.src} alt="Source" className="w-16 h-16 object-contain rounded-lg dark:bg-dark-bg bg-slate-100 border dark:border-dark-border border-slate-200" />
            <div className="text-xs dark:text-zinc-400 text-slate-600 space-y-0.5">
              <p className="font-mono dark:text-zinc-300 text-slate-700">{img.naturalWidth} × {img.naturalHeight}</p>
              <p>Sizes included: {ICO_SIZES.join(' · ')} px</p>
            </div>
          </div>
          <button onClick={generate} disabled={busy} className="btn-primary text-xs px-4 py-2">
            <Download className="w-3.5 h-3.5" /> {busy ? 'Generating…' : 'Generate favicon.ico'}
          </button>
        </>
      )}
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} downloadLabel="Download .ico" />
    </div>
  );
};

// ─── IMAGE TO BASE64 ────────────────────────────────────────
export const ImageToBase64Tool: React.FC = () => {
  const [dataUrl, setDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [withPrefix, setWithPrefix] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    try {
      const file = files[0];
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });
      setDataUrl(text);
      setFileName(file.name);
      setError(null);
    } catch {
      setError('Could not read that file.');
    }
  };

  const value = withPrefix ? dataUrl : dataUrl.replace(/^data:[^;]*;base64,/, '');
  const base64Only = dataUrl.replace(/^data:[^;]*;base64,/, '');

  return (
    <div className="space-y-4">
      <DropZone onFiles={handleFiles} label="Select an image to encode" compact />
      {dataUrl && (
        <>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs dark:text-zinc-400 text-slate-600">
              <span className="font-mono">{fileName}</span>
              <span className="font-mono dark:text-zinc-500 text-slate-400">{base64Only.length.toLocaleString()} chars</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={withPrefix} onChange={(e) => setWithPrefix(e.target.checked)} className="rounded text-indigo-500" />
                Include data URL prefix
              </label>
            </div>
            <textarea readOnly value={value} rows={7} className="input-base w-full font-mono text-[11px]" onFocus={(e) => e.target.select()} />
            <div className="flex gap-2">
              <CopyButton text={value} label="Copy Base64" className="px-3 py-1.5" />
              <button onClick={() => downloadDataUrl('data:text/plain;charset=utf-8,' + encodeURIComponent(value), `${fileName || 'image'}.b64.txt`)} className="btn-secondary text-xs px-3 py-1.5">
                <Download className="w-3.5 h-3.5" /> Download .txt
              </button>
            </div>
          </div>
        </>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};

// ─── BASE64 TO IMAGE ────────────────────────────────────────
export const Base64ToImageTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = async () => {
    setError(null);
    const clean = input.trim().replace(/^data:[^;]*;base64,/, '');
    if (!clean) { setError('Paste a Base64 string first.'); return; }
    try {
      const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'image/png' });
      const img = await loadImage(blob);
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileName: 'decoded-image.png',
      });
    } catch {
      setError('That is not valid Base64 image data.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-3 space-y-2">
        <label className="block text-xs dark:text-zinc-400 text-slate-600 font-medium">Base64 string</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); }}
          placeholder="data:image/png;base64, iVBORw0KGgo..."
          rows={7}
          className="input-base w-full font-mono text-[11px]"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono dark:text-zinc-500 text-slate-400">{input.trim().length.toLocaleString()} chars</span>
          <button onClick={decode} className="btn-primary text-xs px-4 py-2">
            <ImageIcon className="w-3.5 h-3.5" /> Decode to Image
          </button>
        </div>
      </div>
      <ErrorNotice message={error} />
      <ResultPanel result={result} onDownload={() => result && downloadBlob(result.blob, result.fileName)} />
    </div>
  );
};

// ─── REMOVE METADATA ────────────────────────────────────────
function scanMetadata(file: File, bytes: Uint8Array): { fields: string[]; type: string } {
  const fields: string[] = [];
  if (file.type === 'image/png') {
    if (new TextDecoder().decode(bytes.subarray(0, 8)).includes('PNG')) {
      const ascii = new TextDecoder().decode(bytes.subarray(8, Math.min(bytes.length, 4096)));
      if (ascii.includes('eXIf')) fields.push('EXIF data (eXIf chunk)');
      if (ascii.includes('tEXt')) fields.push('Text metadata (tEXt chunk)');
      if (ascii.includes('iTXt')) fields.push('International text (iTXt chunk)');
      if (ascii.includes('gAMA')) fields.push('Gamma metadata (gAMA chunk)');
    }
  } else if (file.type === 'image/jpeg') {
    const s = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 65536)));
    if (s.includes('Exif')) fields.push('EXIF data');
    if (s.includes('ICC_PROFILE') || s.includes('ICC_PRO')) fields.push('ICC color profile');
    if (s.includes('Photoshop')) fields.push('Photoshop metadata');
    if (s.includes('Adobe')) fields.push('Adobe metadata');
  } else {
    fields.push('Embedded metadata blocks');
  }
  if (!fields.length) fields.push('No identifiable metadata blocks');
  return { fields, type: file.type || 'unknown' };
}

export const ImageMetadataTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ fields: string[]; type: string } | null>(null);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, overlay } = useExportProgress();

  const handleFiles = async (files: File[]) => {
    try {
      const f = files[0];
      const loaded = await loadImage(f);
      const bytes = new Uint8Array(await f.arrayBuffer());
      setImg(loaded);
      setFile(f);
      setMeta(scanMetadata(f, bytes));
      setResult(null);
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const strip = async () => {
    if (!img) return;
    setError(null);
    try {
      await run(async (report) => {
        report(20, 'Reading image…');
        const canvas = canvasFromImage(img);
        report(55, 'Removing metadata…');
        const { blob, ext } = await canvasExport(canvas, file?.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.95);
        setResult(createResult(blob, canvas.width, canvas.height, 'image-stripped', ext));
        report(100, 'Done');
      });
    } catch (e) {
      setError(errorMessage(e, 'Strip failed.'))
    }
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select an image to inspect & clean" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4">
              <p className="text-[10px] uppercase tracking-wider dark:text-zinc-600 text-slate-400 font-semibold mb-1">Original</p>
              <p className="font-mono text-[13px] dark:text-zinc-200 text-slate-700">{formatBytes(file?.size ?? 0)}</p>
              <p className="font-mono text-[10px] dark:text-zinc-600 text-slate-400">{img.naturalWidth} × {img.naturalHeight} · {meta?.type.split('/')[1] ?? ''}</p>
            </div>
            <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4">
              <p className="text-[10px] uppercase tracking-wider dark:text-zinc-600 text-slate-400 font-semibold mb-1">After strip</p>
              <p className="font-mono text-[13px] dark:text-zinc-200 text-slate-700">{result ? formatBytes(result.blob.size) : '-'}</p>
              <p className="font-mono text-[10px] dark:text-zinc-600 text-slate-400">{result ? `${Math.max(0, Math.round((1 - result.blob.size / (file?.size ?? 1)) * 100))}% smaller` : 'waiting'}</p>
            </div>
          </div>
          <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-2">
            <p className="section-label">Detected metadata</p>
            <ul className="space-y-1">
              {meta?.fields.map((f, i) => (
                <li key={i} className="text-xs flex items-center gap-2 dark:text-zinc-400 text-slate-600">
                  <ShieldOff className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={strip} className="btn-primary text-xs px-4 py-2 mt-2">
              <ShieldOff className="w-3.5 h-3.5" /> Strip Metadata
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

// ─── PALETTE GENERATOR ──────────────────────────────────────
function extractPalette(canvas: HTMLCanvasElement, count = 8): string[] {
  const small = document.createElement('canvas');
  small.width = 64;
  small.height = 64;
  const sctx = small.getContext('2d')!;
  sctx.drawImage(canvas, 0, 0, 64, 64);
  const data = sctx.getImageData(0, 0, 64, 64).data;
  const buckets = new Map<string, number>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] >> 4, g = data[i + 1] >> 4, b = data[i + 2] >> 4;
    if (data[i + 3] < 200) continue;
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const ranked = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]);
  const out: string[] = [];
  for (const [key] of ranked) {
    const [r, g, b] = key.split(',').map((n) => (parseInt(n) << 4) + 8);
    out.push('#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''));
    if (out.length >= count) break;
  }
  return out;
}

export const PaletteGeneratorTool: React.FC = () => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    try {
      const loaded = await loadImage(files[0]);
      setImg(loaded);
      const canvas = canvasFromImage(loaded, 800);
      setPalette(extractPalette(canvas, 8));
      setError(null);
    } catch {
      setError('Could not read that image.');
    }
  };

  const copyAll = () => {
    if (!palette.length) return;
    navigator.clipboard.writeText(palette.join(', ')).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {!img ? (
        <DropZone onFiles={handleFiles} label="Select an image to extract colors" compact />
      ) : (
        <>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden">
            <img src={img.src} alt="Palette source" className="max-h-[240px] w-full object-contain dark:bg-dark-bg bg-slate-50" />
          </div>
          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="section-label mb-0">Extracted palette</p>
              <button onClick={copyAll} className="btn-secondary text-xs px-3 py-1.5">
                <Copy className="w-3.5 h-3.5" /> Copy all
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {palette.map((hex, i) => (
                <div key={i} className="rounded-xl overflow-hidden border dark:border-dark-border border-slate-200">
                  <div className="h-14" style={{ backgroundColor: hex }} />
                  <button onClick={() => navigator.clipboard.writeText(hex)} className="w-full py-1.5 text-[10px] font-mono dark:text-zinc-400 text-slate-600 hover:dark:bg-dark-bg hover:bg-slate-50">{hex}</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <ErrorNotice message={error} />
    </div>
  );
};
