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
      className={`relative rounded-2xl border-2 border-dashed text-center transition-all duration-200 bg-card
        ${isDragging
          ? 'border-primary bg-primary/[0.06] scale-[1.01]'
          : 'border-border'} ${compact ? 'p-5 space-y-2' : 'p-8 space-y-3'}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center">
        <Upload className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-[14px] font-bold text-foreground">{isDragging ? 'Drop files here' : label}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-primary-foreground text-[12px] font-semibold rounded-lg transition-all active:scale-[0.98]"
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
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
        <span className="flex items-center gap-1.5 text-success">
          <ImageIcon className="w-4 h-4" /> Result ready
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {result.width} × {result.height} · {formatBytes(result.blob.size)}{extraInfo ? ` · ${extraInfo}` : ''}
        </span>
      </div>
      <div className="rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center max-h-[340px]">
        <img src={result.url} alt="Result preview" className="max-w-full max-h-[340px] object-contain" />
      </div>
      <button onClick={onDownload} className="w-full py-2.5 bg-success hover:brightness-110 text-success-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
        <Download className="w-4 h-4" />
        <span>{downloadLabel}</span>
      </button>
    </div>
  );
};

export const ErrorNotice: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export const ProcessingOverlay: React.FC<{ active: boolean; text?: string }> = ({ active, text = 'Processing…' }) => {
  if (!active) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center justify-center gap-3 text-center">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
      <p className="text-xs text-muted-foreground font-medium">{text}</p>
    </div>
  );
};
