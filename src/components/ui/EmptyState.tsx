import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  /** What this screen is. Written as a statement, not an apology. */
  title: string;
  /** What to do next. An empty screen is an invitation to act. */
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div
    className={[
      'flex flex-col items-center justify-center text-center',
      'rounded-[var(--radius-lg)] border border-dashed border-border bg-card',
      'px-6 py-14',
      className,
    ].join(' ')}
  >
    <span className="grid place-items-center w-14 h-14 rounded-full bg-surface-container text-muted-foreground">
      <Icon className="w-7 h-7" aria-hidden="true" />
    </span>
    <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
    <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
