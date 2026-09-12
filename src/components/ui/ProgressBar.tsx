import React from 'react';

interface ProgressBarProps {
  /** 0–100. Pass `null` for indeterminate work of unknown length. */
  value: number | null;
  label?: string;
  className?: string;
}

/**
 * Determinate or indeterminate progress.
 *
 * Carries full `progressbar` semantics so assistive tech can report the
 * percentage; the visible number is the same value, never a separate guess.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label = 'Progress', className = '' }) => {
  const isIndeterminate = value === null;
  const pct = isIndeterminate ? 0 : Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-surface-container-high ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={isIndeterminate ? undefined : 0}
      aria-valuemax={isIndeterminate ? undefined : 100}
      aria-valuenow={isIndeterminate ? undefined : pct}
      aria-valuetext={isIndeterminate ? 'Working' : `${pct} percent`}
    >
      {isIndeterminate ? (
        <div className="h-full w-2/5 rounded-full bg-primary animate-progress-slide motion-reduce:animate-none motion-reduce:w-full motion-reduce:opacity-60" />
      ) : (
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-[var(--motion-base)] ease-[var(--ease-out)]"
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
};
