import React, { useEffect, useRef, useState } from 'react';
import { AdBanner } from '../components/AdBanner';
import { DropZone, ErrorNotice } from './image/ImageShared';
import { Download, Cpu, Loader2, RotateCcw } from 'lucide-react';

type Phase = 'idle' | 'running' | 'done' | 'error';
type SizeOpt = 'small' | 'medium' | 'large' | 'original';

const SIZE_OPTIONS: { id: SizeOpt; label: string; maxDim: number }[] = [
  { id: 'small', label: 'Small', maxDim: 900 },
  { id: 'medium', label: 'Medium', maxDim: 1400 },
  { id: 'large', label: 'Large', maxDim: 1800 },
  { id: 'original', label: 'Original', maxDim: 0 },
];

export const AiBgRemover: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedSize, setCompressedSize] = useState(0);
  const [sizeOpt, setSizeOpt] = useState<SizeOpt>('small');
  const [compressing, setCompressing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const originalUrlRef = useRef('');
  const resultUrlRef = useRef('');
  const compressedUrlRef = useRef('');
  const fullResBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const genRef = useRef(0);
  const currentFileRef = useRef<File | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const compressTokenRef = useRef(0);
  const workerPendingRef = useRef<{ resolve: (b: Blob | null) => void; reject: (e: Error) => void } | null>(null);
  const workerBusyRef = useRef(false);

  const disposeWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    workerBusyRef.current = false;
    if (workerPendingRef.current) {
      workerPendingRef.current.reject(new Error('Cancelled'));
      workerPendingRef.current = null;
    }
  };

  const sendToWorker = (message: Record<string, unknown> & { action?: string }): Promise<Blob | null> => {
    if (workerBusyRef.current) disposeWorker();
    if (!workerRef.current) {
      const w = new Worker(new URL('../workers/bgRemoval.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e) => {
        const msg = e.data as { type: string; pct?: number; stage?: string; buffer?: ArrayBuffer; mime?: string; message?: string };
        if (msg.type === 'progress') {
          setProgress(msg.pct ?? 0);
          setStageLabel(msg.stage ?? '');
        } else if (msg.type === 'result' || msg.type === 'compressed') {
          workerBusyRef.current = false;
          const p = workerPendingRef.current;
          workerPendingRef.current = null;
          p?.resolve(new Blob([msg.buffer as ArrayBuffer], { type: msg.mime ?? 'image/png' }));
        } else if (msg.type === 'compress-error') {
          workerBusyRef.current = false;
          const p = workerPendingRef.current;
          workerPendingRef.current = null;
          p?.resolve(null);
        } else if (msg.type === 'error') {
          workerBusyRef.current = false;
          const p = workerPendingRef.current;
          workerPendingRef.current = null;
          p?.reject(new Error(msg.message ?? 'Background removal failed.'));
        }
      };
      w.onerror = (e) => {
        workerBusyRef.current = false;
        const p = workerPendingRef.current;
        workerPendingRef.current = null;
        p?.reject(new Error(e.message || 'Background removal worker crashed.'));
      };
      workerRef.current = w;
    }
    workerBusyRef.current = true;
    return new Promise<Blob | null>((resolve, reject) => {
      workerPendingRef.current = { resolve, reject };
      workerRef.current?.postMessage(message);
    });
  };

  const runInWorker = (file: File): Promise<Blob | null> =>
    file.arrayBuffer().then((buf) => sendToWorker({ file: buf, type: file.type, name: file.name }));

  const compressResult = (blob: Blob, maxDim: number, gen: number) => {
    const token = ++compressTokenRef.current;
    setCompressing(true);
    void blob
      .arrayBuffer()
      .then((buf) => sendToWorker({ action: 'compress', file: buf, type: blob.type, maxDim }))
      .then((out) => {
        if (gen !== genRef.current || token !== compressTokenRef.current || !out) return;
        if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
        const url = URL.createObjectURL(out);
        compressedUrlRef.current = url;
        setCompressedUrl(url);
        setCompressedSize(out.size);
      })
      .catch(() => {})
      .finally(() => {
        if (gen === genRef.current && token === compressTokenRef.current) setCompressing(false);
      });
  };

  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    startRef.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 200);
  };

  useEffect(() => {
    const gen = genRef.current;
    return () => {
      genRef.current = gen + 1;
      stopTimer();
      disposeWorker();
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
    };
  }, []);

  const setNewOriginal = (file: File) => {
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    const url = URL.createObjectURL(file);
    originalUrlRef.current = url;
    setOriginalUrl(url);
  };

  const setNewResult = (blob: Blob) => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    const url = URL.createObjectURL(blob);
    resultUrlRef.current = url;
    setResultUrl(url);
    setResultSize(blob.size);
  };

  const runConversion = async (file: File, gen: number) => {
    try {
      setStageLabel('Preparing…');
      const blob = await runInWorker(file);
      if (!blob) throw new Error('Background removal failed. Please try again.');
      if (gen !== genRef.current) return;
      fullResBlobRef.current = blob;
      setNewResult(blob);
      setProgress(100);
      setStageLabel('Done');
      stopTimer();
      setPhase('done');
      const opt = SIZE_OPTIONS.find((o) => o.id === sizeOpt);
      if (opt && opt.maxDim > 0) compressResult(blob, opt.maxDim, gen);
    } catch (e) {
      if (gen !== genRef.current) return;
      stopTimer();
      setError(e instanceof Error ? e.message : 'Background removal failed. Please try again.');
      setPhase('error');
    }
  };

  const handleSizeChange = (opt: SizeOpt) => {
    setSizeOpt(opt);
    const maxDim = SIZE_OPTIONS.find((o) => o.id === opt)?.maxDim ?? 0;
    if (fullResBlobRef.current && maxDim > 0) {
      setCompressedSize(0);
      compressResult(fullResBlobRef.current, maxDim, genRef.current);
    }
  };

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    const gen = ++genRef.current;
    compressTokenRef.current++;
    setCompressing(false);
    stopTimer();
    setError('');
    setFileName(file.name);
    currentFileRef.current = file;
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = '';
      setResultUrl('');
    }
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current);
      compressedUrlRef.current = '';
      setCompressedUrl('');
      setCompressedSize(0);
    }
    setNewOriginal(file);
    setProgress(0);
    setPhase('running');
    startTimer();
    void runConversion(file, gen);
  };

  const reset = () => {
    genRef.current++;
    stopTimer();
    disposeWorker();
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = '';
      setOriginalUrl('');
    }
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = '';
      setResultUrl('');
    }
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current);
      compressedUrlRef.current = '';
      setCompressedUrl('');
      setCompressedSize(0);
    }
    setError('');
    setProgress(0);
    setPhase('idle');
  };

  const baseName = fileName.replace(/\.[^.]+$/, '');
  const pngName = baseName + '-background-removed.png';
  const formatBytes = (b: number) => {
    if (!b) return '';
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };
  const timeText = elapsed < 60 ? `${elapsed.toFixed(1)}s` : `${Math.floor(elapsed / 60)}m ${Math.floor(elapsed % 60)}s`;

  const checkerboard: React.CSSProperties = {
    backgroundImage: 'conic-gradient(#cbd5e1 25%, #f8fafc 0 50%, #cbd5e1 0 75%, #f8fafc 0)',
    backgroundSize: '16px 16px',
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold dark:text-zinc-200 text-slate-800">
            Processed on your device, nothing is uploaded
          </span>
        </div>
      </div>

      <DropZone
        onFiles={handleFiles}
        accept="image/*"
        label={originalUrl ? 'Replace image' : 'Select or drag & drop an image'}
        hint="Background is removed locally with an AI model. First run downloads the model, then it works offline."
        compact
      />

      {originalUrl && (
        <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden relative min-h-[320px] flex items-center justify-center p-4">
          {phase === 'done' ? (
            <div className="relative w-full max-w-lg h-[340px] rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-700">
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-900"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] uppercase tracking-wider text-white">
                  Original
                </span>
              </div>

              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`, ...checkerboard }}
              >
                <img src={resultUrl} alt="Background removed" className="max-w-full max-h-full object-contain" />
                <span className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 rounded text-[10px] uppercase tracking-wider text-white">
                  Background Removed
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                aria-label="Compare before and after"
              />

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center text-[10px] font-bold">
                  ↔
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-lg h-[300px] rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-dark-bg">
              <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
              <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] uppercase tracking-wider text-white">
                Original
              </span>
            </div>
          )}
        </div>
      )}

      {phase === 'running' && (
        <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold dark:text-zinc-200 text-slate-800 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              {stageLabel || 'Processing…'}
            </span>
            <span className="dark:text-zinc-400 text-slate-500 tabular-nums">{timeText}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold dark:text-zinc-200 text-slate-800">{Math.round(progress)}%</span>
            <span className="text-[10px] dark:text-zinc-500 text-slate-500">processed on your device</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] dark:text-zinc-500 text-slate-500">
            First run downloads the AI model (~85 MB) and caches it, then processing is instant. Your image stays on your device.
          </p>
        </div>
      )}

      {error && (
        <ErrorNotice message={error} />
      )}

      {phase === 'error' && (
        <button
          onClick={() => {
            if (currentFileRef.current) handleFiles([currentFileRef.current]);
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
      )}

      {phase === 'done' && (
        <div className="space-y-3 pt-2">
          <AdBanner type="native" />

          <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold dark:text-zinc-200 text-slate-800">
              <span>Output size</span>
              {compressing && (
                <span className="flex items-center gap-1.5 text-[11px] font-medium dark:text-zinc-400 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  Compressing…
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZE_OPTIONS.map((opt) => {
                const active = sizeOpt === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSizeChange(opt.id)}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] leading-tight transition-colors ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-dark-border dark:text-zinc-300 text-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    <span className="block font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {sizeOpt === 'original' ? (
            <a
              href={resultUrl}
              download={pngName}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG (Full Size)</span>
              {resultSize > 0 && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-semibold">{formatBytes(resultSize)}</span>
              )}
            </a>
          ) : (
            <a
              href={compressedUrl || resultUrl}
              download={pngName}
              onClick={(e) => {
                if (compressing) e.preventDefault();
              }}
              aria-disabled={compressing}
              className={`w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors ${
                compressing ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''
              }`}
            >
              {compressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing download…</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PNG ({sizeOpt} size)</span>
                </>
              )}
              {!compressing && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-semibold">
                  {compressedSize > 0 ? formatBytes(compressedSize) : formatBytes(resultSize)}
                </span>
              )}
            </a>
          )}

          <button
            onClick={reset}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-dark-border dark:hover:bg-slate-700 dark:text-zinc-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            New image
          </button>
        </div>
      )}
    </div>
  );
};
