import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, Wand2 } from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   Shared visual chrome for the "developer tool" pages
   (JSON formatter, Base64, UUID, Password, Hash, JWT).
   Pure presentational pieces, no tool logic lives here.
══════════════════════════════════════════════════════════ */

/** Small pill badge: "runs live, on-device", shown next to dev-tool titles. */
export const DevRunPill: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 shrink-0 ${className}`}
  >
    <span className="w-[7px] h-[7px] rounded-full bg-primary" />
    <span className="text-[12.5px] font-semibold text-primary font-mono">runs live, on-device</span>
  </div>
);

/** Segmented pill toggle group container: `#f4f2f8` bg, rounded-9px. */
export const Segmented: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`inline-flex items-center gap-1 p-1 rounded-[9px] bg-[var(--segmented-bg)] ${className}`}>{children}</div>
);

export const SegmentedButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ active, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-bold transition-colors duration-150 ${
      active
        ? 'bg-[var(--segmented-active-bg)] text-white'
        : 'bg-transparent text-[color:var(--segmented-inactive-fg)] hover:text-foreground'
    } ${className}`}
  >
    {children}
  </button>
);

/** Status/validity pill: valid=success tint, invalid=danger tint. */
export const StatusPill: React.FC<{ valid: boolean; validLabel: string; invalidLabel: string }> = ({
  valid,
  validLabel,
  invalidLabel,
}) => (
  <span
    className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold font-mono ${
      valid ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    }`}
  >
    {valid ? validLabel : invalidLabel}
  </span>
);

/** Dark "code editor" panel wrapper (near-black-violet #171520). Header strip + content. */
export const DarkPanel: React.FC<{
  label: string;
  headerRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ label, headerRight, className = '', children }) => (
  <div
    className={`rounded-2xl overflow-hidden flex flex-col bg-[var(--devpanel-bg)] ${className}`}
  >
    <div className="px-4 py-2.5 flex items-center justify-between border-b border-[color:var(--devpanel-border)] shrink-0">
      <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] font-mono text-[color:var(--devpanel-label)]">
        {label}
      </span>
      {headerRight}
    </div>
    {children}
  </div>
);

/** White output panel with matching header strip + violet "Copy" text button. */
export const WhitePanel: React.FC<{
  label: string;
  headerRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ label, headerRight, className = '', children }) => (
  <div className={`rounded-2xl overflow-hidden flex flex-col bg-card border border-border ${className}`}>
    <div className="px-4 py-2.5 flex items-center justify-between border-b border-border shrink-0">
      <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] font-mono text-muted-foreground">
        {label}
      </span>
      {headerRight}
    </div>
    {children}
  </div>
);

/**
 * "Try a sample" button. A visitor who lands without data to hand can fill the
 * tool in one click and see what it does — the cheapest way to prove value
 * before asking anyone to paste or upload anything.
 */
export const SampleButton: React.FC<{ onClick: () => void; children?: React.ReactNode }> = ({
  onClick,
  children = 'Try a sample',
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg text-[12px] font-bold
      text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
  >
    <Wand2 className="w-4 h-4" />
    {children}
  </button>
);

/** Row of one-click starting points (common regex patterns, cron expressions, …). */
export const PresetChips: React.FC<{
  label?: string;
  presets: { label: string; title?: string }[];
  onPick: (index: number) => void;
}> = ({ label, presets, onPick }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {label && <span className="text-[11.5px] font-semibold text-muted-foreground mr-0.5">{label}</span>}
    {presets.map((p, i) => (
      <button
        key={p.label}
        type="button"
        title={p.title}
        onClick={() => onPick(i)}
        className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold border border-border
          bg-muted text-muted-foreground hover:text-foreground hover:border-primary/40
          active:scale-95 transition-all"
      >
        {p.label}
      </button>
    ))}
  </div>
);

/** Violet text-button used for "Copy" affordances inside dev-tool panels. */
export const CopyTextButton: React.FC<{ onClick: () => void; children?: React.ReactNode }> = ({
  onClick,
  children = 'Copy',
}) => (
  <button
    type="button"
    onClick={onClick}
    className="text-[12.5px] font-bold text-primary hover:text-primary/80 transition-colors"
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════
   Full view: an escape hatch from the page layout for tools
   whose editor panes want the whole screen.
══════════════════════════════════════════════════════════ */

/** Owns the open flag plus the Esc-to-close and background-scroll-lock behaviour. */
export const useFullView = (): [boolean, (open: boolean) => void] => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return [open, setOpen];
};

export const FullViewButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open full view"
    className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg text-[12px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
  >
    <Maximize2 className="w-4 h-4" />
    Full view
  </button>
);

/**
 * Wraps a tool body so it renders either inline on the page or as a full-screen
 * overlay. The overlay is portalled to <body> because, rendered in place, it would
 * sit under the sticky site header (also z-50) and its Close button would be
 * unreachable.
 */
export const ToolShell: React.FC<{
  title: string;
  hint?: React.ReactNode;
  controls?: React.ReactNode;
  full: boolean;
  onFullChange: (open: boolean) => void;
  children: React.ReactNode;
}> = ({ title, hint, controls, full, onFullChange, children }) => {
  if (full) {
    return createPortal(
      <div className="fixed inset-0 z-[90] bg-background flex flex-col p-4 gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[13px] font-bold text-foreground">{title} · full view</span>
          <div className="flex flex-wrap items-center gap-2">
            {controls}
            <button
              type="button"
              onClick={() => onFullChange(false)}
              aria-label="Close full view"
              className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-muted text-foreground hover:bg-border transition-colors"
            >
              <X className="w-4 h-4" />
              Close
              <kbd className="ml-0.5 px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-mono font-semibold text-muted-foreground">Esc</kbd>
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col gap-3">{children}</div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hint}
        <div className="flex flex-wrap items-center gap-2">
          {controls}
          <FullViewButton onClick={() => onFullChange(true)} />
        </div>
      </div>
      {children}
    </div>
  );
};
