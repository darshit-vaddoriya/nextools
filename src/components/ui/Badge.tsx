import React from 'react';
import { Check, Clock, Loader2, AlertTriangle, type LucideIcon } from 'lucide-react';

export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  tone?: Tone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-container text-muted-foreground border-border',
  accent:  'bg-primary-container text-on-primary-container border-transparent',
  success: 'bg-success/10 text-success border-transparent',
  warning: 'bg-warning/10 text-warning border-transparent',
  danger:  'bg-danger/10 text-danger border-transparent',
};

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', icon: Icon, children, className = '' }) => (
  <span
    className={[
      'inline-flex items-center gap-1.5 border px-2 py-0.5',
      'rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap',
      TONE[tone],
      className,
    ].join(' ')}
  >
    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
    {children}
  </span>
);

/* ── Job status ─────────────────────────────────────────────────────
   Status is communicated by icon + word, never by color alone, so it
   survives both colorblindness and a monochrome screenshot.
------------------------------------------------------------------- */
const STATUS: Record<JobStatus, { tone: Tone; icon: LucideIcon; label: string }> = {
  queued:     { tone: 'neutral', icon: Clock,         label: 'Queued' },
  processing: { tone: 'accent',  icon: Loader2,       label: 'Processing' },
  done:       { tone: 'success', icon: Check,         label: 'Done' },
  failed:     { tone: 'danger',  icon: AlertTriangle, label: 'Failed' },
};

export const StatusBadge: React.FC<{ status: JobStatus; className?: string }> = ({ status, className }) => {
  const { tone, icon: Icon, label } = STATUS[status];
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 border px-2 py-0.5',
        'rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap',
        TONE[tone],
        className ?? '',
      ].join(' ')}
    >
      <Icon
        className={`w-3.5 h-3.5 shrink-0 ${status === 'processing' ? 'animate-spin motion-reduce:animate-none' : ''}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
};
