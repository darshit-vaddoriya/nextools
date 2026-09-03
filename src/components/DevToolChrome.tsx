import React from 'react';

/* ══════════════════════════════════════════════════════════
   Shared visual chrome for the "developer tool" pages
   (JSON formatter, Base64, UUID, Password, Hash, JWT).
   Pure presentational pieces — no tool logic lives here.
══════════════════════════════════════════════════════════ */

/** Small pill badge: "runs live, on-device" — shown next to dev-tool titles. */
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
