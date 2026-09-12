import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  /** Index of the step currently in progress. */
  current: number;
  /** Jump back to an already-completed step. Omit to make the rail static. */
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Horizontal progress rail for a genuinely sequential flow
 * (Upload → Options → Convert → Download).
 *
 * On mobile the labels collapse to a single "Step 2 of 4 · Options"
 * line above a segmented bar, full labels never wrap or scroll.
 */
export const Stepper: React.FC<StepperProps> = ({ steps, current, onStepClick, className = '' }) => {
  const total = steps.length;
  const safeCurrent = Math.min(Math.max(current, 0), total - 1);

  return (
    <div className={className}>
      {/* Announce step changes to screen readers without moving focus. */}
      <p className="sr-only" aria-live="polite">
        Step {safeCurrent + 1} of {total}: {steps[safeCurrent]?.label}
      </p>

      {/* ── Mobile: compact label + segmented bar ── */}
      <div className="sm:hidden">
        <p className="mb-2 text-sm font-semibold text-foreground">
          <span className="text-muted-foreground font-medium">Step {safeCurrent + 1} of {total}</span>
          {'  '}{steps[safeCurrent]?.label}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {steps.map((step, i) => (
            <span
              key={step.id}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors duration-[var(--motion-base)]',
                i <= safeCurrent ? 'bg-primary' : 'bg-surface-container-high',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      {/* ── Tablet and up: full rail ── */}
      <ol className="hidden sm:flex items-center" role="list">
        {steps.map((step, i) => {
          const isDone = i < safeCurrent;
          const isCurrent = i === safeCurrent;
          const canRevisit = Boolean(onStepClick) && isDone;

          const marker = (
            <>
              <span
                className={[
                  'grid place-items-center w-7 h-7 shrink-0 rounded-full text-xs font-bold',
                  'transition-colors duration-[var(--motion-base)]',
                  isDone ? 'bg-primary text-primary-foreground' : '',
                  isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : '',
                  !isDone && !isCurrent ? 'bg-surface-container-high text-muted-foreground' : '',
                ].join(' ')}
              >
                {isDone ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={[
                  'text-sm font-semibold whitespace-nowrap',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                ].join(' ')}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li key={step.id} className="flex items-center gap-3 min-w-0 [&:not(:last-child)]:flex-1">
              {canRevisit ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(i)}
                  aria-label={`Back to step ${i + 1}: ${step.label}`}
                  className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-1 py-1 -mx-1
                             hover:bg-surface-container transition-colors duration-[var(--motion-fast)]
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {marker}
                </button>
              ) : (
                <span className="flex items-center gap-2.5" aria-current={isCurrent ? 'step' : undefined}>
                  {marker}
                </span>
              )}

              {/* Connector fills as the flow advances. */}
              {i < total - 1 && (
                <span
                  aria-hidden="true"
                  className={[
                    'h-0.5 flex-1 min-w-6 rounded-full transition-colors duration-[var(--motion-base)]',
                    isDone ? 'bg-primary' : 'bg-surface-container-high',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
