import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PencilLine, SlidersHorizontal, FileUp, Copy, Download, Zap, FileCog, ChevronDown, RotateCcw, Trash2, Lock,
  Eye, X, ArrowRight, type LucideIcon,
} from 'lucide-react';
import { getFile, previewKind, type StoredFileRef } from '../../lib/fileStore';
import { formatBytes, formatOf } from '../../lib/formats';
import { lcsDiff } from '../../lib/lcsDiff';
import { relativeTime, removeJob } from '../../lib/history';
import { logActivity, removeActivity, SENSITIVE_TOOLS, type ActivityEntry, type ActivityKind } from '../../lib/activity';
import { canRestore, restoreFromHistory } from './ToolActivityTracker';
import { useToast } from '../Toast';

export const KIND_META: Record<ActivityKind, { label: string; icon: LucideIcon; tint: string }> = {
  edit:     { label: 'Edits',       icon: PencilLine,        tint: 'bg-primary/10 text-primary' },
  option:   { label: 'Settings',    icon: SlidersHorizontal, tint: 'bg-warning/10 text-warning' },
  file:     { label: 'Files',       icon: FileUp,            tint: 'bg-success/10 text-success' },
  copy:     { label: 'Copies',      icon: Copy,              tint: 'bg-surface-container text-muted-foreground' },
  download: { label: 'Downloads',   icon: Download,          tint: 'bg-success/10 text-success' },
  action:   { label: 'Actions',     icon: Zap,               tint: 'bg-primary/10 text-primary' },
  convert:  { label: 'Conversions', icon: FileCog,           tint: 'bg-success/10 text-success' },
};

/** Group newest-first entries under "Today", "Yesterday", or a date. */
export function groupByDay<T extends { updatedAt: number }>(items: T[]): { day: string; items: T[] }[] {
  const out: { day: string; items: T[] }[] = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = today.getTime() - 86_400_000;
  for (const it of items) {
    const d = new Date(it.updatedAt); d.setHours(0, 0, 0, 0);
    const day = d.getTime() === today.getTime() ? 'Today'
      : d.getTime() === yesterday ? 'Yesterday'
        : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
    const last = out[out.length - 1];
    if (last && last.day === day) last.items.push(it); else out.push({ day, items: [it] });
  }
  return out;
}

const MAX_DIFF_LINES = 300;

/** Line diff of before → after, or a simple from/to pair for one-line values. */
export const ChangeDiff: React.FC<{ before?: string; after?: string }> = ({ before = '', after = '' }) => {
  const rows = useMemo(() => {
    const a = before.split('\n');
    const b = after.split('\n');
    return lcsDiff(a, b).map((op) => ({
      type: op.type,
      text: op.type === 'add' ? b[op.bi] : a[op.ai],
    }));
  }, [before, after]);

  const singleLine = !before.includes('\n') && !after.includes('\n') && before.length < 120 && after.length < 120;
  if (singleLine) {
    return (
      <div className="flex flex-col gap-1 font-mono text-xs">
        <div className="rounded-md bg-danger/10 px-2.5 py-1.5 text-danger break-all">
          <span className="select-none opacity-60">− </span>{before || <em className="opacity-60">empty</em>}
        </div>
        <div className="rounded-md bg-success/10 px-2.5 py-1.5 text-success break-all">
          <span className="select-none opacity-60">+ </span>{after || <em className="opacity-60">empty</em>}
        </div>
      </div>
    );
  }

  // Collapse long runs of unchanged lines so the change itself stays visible.
  const shown: ({ type: string; text: string } | { type: 'gap'; n: number })[] = [];
  const CONTEXT = 2;
  rows.forEach((r, i) => {
    if (r.type !== 'equal') { shown.push(r); return; }
    const near = rows.slice(Math.max(0, i - CONTEXT), i + CONTEXT + 1).some((x) => x.type !== 'equal');
    if (near) { shown.push(r); return; }
    const last = shown[shown.length - 1];
    if (last && last.type === 'gap') (last as { n: number }).n += 1; else shown.push({ type: 'gap', n: 1 });
  });

  return (
    <div className="max-h-72 overflow-auto rounded-md border border-border bg-surface-container/40 font-mono text-[11.5px] leading-5">
      {shown.slice(0, MAX_DIFF_LINES).map((r, i) => r.type === 'gap' ? (
        <div key={i} className="px-2.5 text-[10.5px] text-muted-foreground bg-surface-container select-none">
          ⋯ {(r as { n: number }).n} unchanged line{(r as { n: number }).n === 1 ? '' : 's'}
        </div>
      ) : (
        <div
          key={i}
          className={`px-2.5 whitespace-pre-wrap break-all ${
            r.type === 'add' ? 'bg-success/10 text-success' : r.type === 'remove' ? 'bg-danger/10 text-danger' : 'text-muted-foreground'}`}
        >
          <span className="select-none opacity-60">{r.type === 'add' ? '+ ' : r.type === 'remove' ? '− ' : '  '}</span>
          {(r as { text: string }).text || ' '}
        </div>
      ))}
      {shown.length > MAX_DIFF_LINES && (
        <div className="px-2.5 py-1 text-[10.5px] text-muted-foreground">… {shown.length - MAX_DIFF_LINES} more lines</div>
      )}
    </div>
  );
};

/** Load a stored file's bytes; null while loading, false when it's gone (evicted or cleared). */
export function useStoredBlob(id: string | null): Blob | null | false {
  const [blob, setBlob] = useState<Blob | null | false>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setBlob(null);
    getFile(id).then((f) => { if (alive) setBlob(f ? f.blob : false); });
    return () => { alive = false; };
  }, [id]);
  return blob;
}

export async function downloadStored(ref: StoredFileRef): Promise<boolean> {
  const f = await getFile(ref.id);
  if (!f) return false;
  const url = URL.createObjectURL(f.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ref.name;
  // Re-downloading from History is not new tool output; the tracker skips it.
  a.dataset.fromHistory = '1';
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent('click'));
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/** Full-screen viewer for a saved input or output file. */
export const FilePreview: React.FC<{ file: StoredFileRef; onClose: () => void }> = ({ file, onClose }) => {
  const blob = useStoredBlob(file.id);
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const kind = previewKind(file.type, file.name);

  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    if (kind === 'text') blob.slice(0, 400_000).text().then(setText);
    return () => URL.revokeObjectURL(u);
  }, [blob, kind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 fade-in" role="dialog" aria-modal="true" aria-label={file.name}>
      <div className="flex items-center gap-3 px-4 py-3 text-white">
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold">{file.name}</p>
          <p className="text-xs opacity-70">{file.role === 'input' ? 'Input' : 'Output'} · {formatBytes(file.size)}</p>
        </div>
        <button type="button" onClick={() => void downloadStored(file)}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold">
          <Download className="w-4 h-4" /> Download
        </button>
        <button type="button" onClick={onClose} aria-label="Close preview"
          className="grid place-items-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center p-4 pt-0" onClick={onClose}>
        <div className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
          {blob === false ? (
            <p className="text-sm text-white/80">This file is no longer stored in the browser.</p>
          ) : !url ? (
            <span className="block w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : kind === 'image' ? (
            <img src={url} alt={file.name} className="max-w-[92vw] max-h-[82vh] object-contain rounded-lg bg-[repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)] bg-[length:16px_16px]" />
          ) : kind === 'pdf' ? (
            <iframe src={url} title={file.name} className="w-[92vw] h-[82vh] rounded-lg bg-white" />
          ) : kind === 'video' ? (
            <video src={url} controls className="max-w-[92vw] max-h-[82vh] rounded-lg" />
          ) : kind === 'audio' ? (
            <audio src={url} controls />
          ) : kind === 'text' ? (
            <pre className="w-[92vw] max-w-4xl h-[82vh] overflow-auto rounded-lg bg-card p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
              {text ?? ''}{blob && blob.size > 400_000 ? '\n\n… (preview cut, download for the full file)' : ''}
            </pre>
          ) : (
            <div className="rounded-xl bg-card p-6 text-center">
              <p className="text-sm text-foreground">No preview for this file type.</p>
              <button type="button" onClick={() => void downloadStored(file)}
                className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

/** One saved file: icon, name, Input/Output tag, preview and download. */
const FileChip: React.FC<{ file: StoredFileRef; onPreview: () => void }> = ({ file, onPreview }) => {
  const { toast } = useToast();
  const { icon: Icon, tint } = formatOf(file.name);
  const canPreview = !file.skipped && previewKind(file.type, file.name) !== 'none';
  return (
    <div className="flex items-center gap-2.5 min-w-0 rounded-[var(--radius-sm)] border border-border bg-surface-container/40 p-2">
      <span className={`grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] ${tint}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-semibold text-foreground" title={file.name}>{file.name}</p>
        <p className="text-[11px] text-muted-foreground">
          <span className={`font-bold ${file.role === 'output' ? 'text-success' : 'text-primary'}`}>{file.role === 'output' ? 'Output' : 'Input'}</span>
          {' · '}{formatBytes(file.size)}{file.skipped ? ` · not saved (${file.skipped})` : ''}
        </p>
      </div>
      {!file.skipped && (
        <>
          {canPreview && (
            <button type="button" onClick={onPreview} title="Preview" aria-label={`Preview ${file.name}`}
              className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] text-muted-foreground hover:bg-surface-container hover:text-foreground">
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button type="button" title="Download" aria-label={`Download ${file.name}`}
            onClick={async () => {
              if (!(await downloadStored(file))) {
                toast({ title: 'File no longer stored', description: 'The browser cleared it or it was removed to free space.', variant: 'warning' });
              }
            }}
            className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] text-muted-foreground hover:bg-surface-container hover:text-foreground">
            <Download className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export const FileList: React.FC<{ files: StoredFileRef[] }> = ({ files }) => {
  const [preview, setPreview] = useState<StoredFileRef | null>(null);
  const inputs = files.filter((f) => f.role === 'input');
  const outputs = files.filter((f) => f.role === 'output');
  const paired = inputs.length > 0 && outputs.length > 0;
  return (
    <>
      <div className={paired ? 'grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center' : 'grid gap-2 sm:grid-cols-2'}>
        {paired ? (
          <>
            <div className="flex flex-col gap-2 min-w-0">{inputs.map((f) => <FileChip key={f.id + f.role} file={f} onPreview={() => setPreview(f)} />)}</div>
            <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground" aria-label="became" />
            <div className="flex flex-col gap-2 min-w-0">{outputs.map((f) => <FileChip key={f.id + f.role} file={f} onPreview={() => setPreview(f)} />)}</div>
          </>
        ) : files.map((f) => <FileChip key={f.id + f.role} file={f} onPreview={() => setPreview(f)} />)}
      </div>
      {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}
    </>
  );
};

interface RowProps {
  entry: ActivityEntry;
  /** Show the tool name (the all-tools page) and make it a link. */
  onOpenTool?: (toolId: string) => void;
  /** Borderless, for rows stacked inside a session card. */
  flat?: boolean;
}

export const ActivityRow: React.FC<RowProps> = ({ entry, onOpenTool, flat }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const meta = KIND_META[entry.kind];
  const Icon = meta.icon;
  const hasDiff = entry.before !== undefined || entry.after !== undefined;
  const secret = SENSITIVE_TOOLS.has(entry.toolId) && (entry.kind === 'edit' || entry.kind === 'option');
  const restorable = hasDiff && canRestore(entry);

  const restore = (which: 'before' | 'after') => {
    if (restoreFromHistory(entry, which)) {
      logActivity({
        toolId: entry.toolId, toolName: entry.toolName, kind: 'action', label: entry.label,
        summary: `Restored ${entry.label} to ${which === 'before' ? 'the earlier' : 'the later'} version`,
      });
      toast({ title: 'Restored', description: entry.label, variant: 'success', duration: 2000 });
    } else {
      toast({ title: 'Could not restore', description: 'That field is no longer on the page.', variant: 'error' });
    }
  };

  return (
    <li className={flat
      ? 'group/row transition-colors hover:bg-surface-container/40'
      : 'rounded-[var(--radius-md)] border border-border bg-card transition-colors hover:border-outline-variant'}>
      <div className="flex items-start gap-3 p-3">
        <span className={`grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] ${meta.tint}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground break-words">
            {entry.summary}
            {entry.status === 'failed' && <span className="ml-1.5 text-xs font-bold text-danger">failed</span>}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            {onOpenTool && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenTool(entry.toolId)}
                  className="font-semibold text-primary hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {entry.toolName}
                </button>
                <span aria-hidden="true">·</span>
              </>
            )}
            <time dateTime={new Date(entry.updatedAt).toISOString()} title={new Date(entry.updatedAt).toLocaleString()}>
              {relativeTime(entry.updatedAt)}
            </time>
            {secret && (
              <span className="inline-flex items-center gap-1"><span aria-hidden="true">·</span><Lock className="w-3 h-3" aria-hidden="true" /> values not stored</span>
            )}
          </p>
        </div>
        {hasDiff && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 h-8 px-2 shrink-0 rounded-[var(--radius-sm)] text-xs font-semibold
                       text-muted-foreground hover:bg-surface-container hover:text-foreground
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Changes
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => (entry.kind === 'convert' ? removeJob(entry.id) : removeActivity(entry.id))}
          aria-label="Remove from history"
          title="Remove from history"
          className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] text-muted-foreground
                     hover:bg-danger/10 hover:text-danger transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
      {entry.files && entry.files.length > 0 && (
        <div className="px-3 pb-3 -mt-0.5">
          <FileList files={entry.files} />
        </div>
      )}
      {open && hasDiff && (
        <div className="border-t border-border px-3 pb-3 pt-2.5">
          <ChangeDiff before={entry.before} after={entry.after} />
          {entry.truncated && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">Long text: only the first part was kept.</p>
          )}
          {restorable && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button type="button" onClick={() => restore('before')}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] border border-border text-xs font-semibold text-foreground hover:bg-surface-container">
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Restore before
              </button>
              <button type="button" onClick={() => restore('after')}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] border border-border text-xs font-semibold text-foreground hover:bg-surface-container">
                <RotateCcw className="w-3.5 h-3.5 -scale-x-100" aria-hidden="true" /> Restore after
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};
