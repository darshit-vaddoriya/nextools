import React, { useRef, useState } from 'react';
import { Upload, Download, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { formatBytes, type ProcessedImage } from './ImageUtils';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFiles,
  accept = 'image/*',
  multiple = false,
  label = 'Select or drag & drop images',
  hint = 'Processed on your device',
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
      className={`relative rounded-2xl border-2 border-dashed text-center transition-all duration-200
        dark:bg-dark-card bg-white
        ${isDragging
          ? 'border-indigo-500 bg-indigo-500/[0.06] scale-[1.01]'
          : 'dark:border-dark-border border-slate-300'} ${compact ? 'p-5 space-y-2' : 'p-8 space-y-3'}`}
    >
      <div className="w-12 h-12 rounded-2xl dark:bg-indigo-500/10 bg-indigo-50 border dark:border-indigo-500/20 border-indigo-200 mx-auto flex items-center justify-center">
        <Upload className="w-5 h-5 text-indigo-500" />
      </div>
      <div>
        <h3 className="text-[14px] font-bold dark:text-white text-slate-900">{isDragging ? 'Drop files here' : label}</h3>
        <p className="text-[11px] dark:text-zinc-500 text-slate-400 mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-semibold rounded-lg transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        Choose Files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
    </div>
  );
};

interface ResultPanelProps {
  result: ProcessedImage | null;
  onDownload: () => void;
  downloadLabel?: string;
  extraInfo?: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ result, onDownload, downloadLabel = 'Download Image', extraInfo }) => {
  if (!result) return null;
  return (
    <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold dark:text-zinc-300 text-slate-700">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <ImageIcon className="w-4 h-4" /> Result ready
        </span>
        <span className="font-mono text-[11px] dark:text-zinc-500 text-slate-400">
          {result.width} × {result.height} · {formatBytes(result.blob.size)}{extraInfo ? ` · ${extraInfo}` : ''}
        </span>
      </div>
      <div className="rounded-xl overflow-hidden border dark:border-dark-border border-slate-200 bg-slate-50 dark:bg-dark-bg flex items-center justify-center max-h-[340px]">
        <img src={result.url} alt="Result preview" className="max-w-full max-h-[340px] object-contain" />
      </div>
      <button onClick={onDownload} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Download className="w-4 h-4" />
        <span>{downloadLabel}</span>
      </button>
    </div>
  );
};

export const ErrorNotice: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export const ProcessingOverlay: React.FC<{ active: boolean; text?: string }> = ({ active, text = 'Processing…' }) => {
  if (!active) return null;
  return (
    <div className="rounded-2xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 p-8 flex flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      <p className="text-xs dark:text-zinc-400 text-slate-500 font-medium">{text}</p>
    </div>
  );
};
