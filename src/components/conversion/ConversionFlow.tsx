import React from 'react';
import {
  ArrowLeft, AlertCircle, Download, RotateCcw, Share2, Sparkles, X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DropZone } from '../ui/DropZone';
import { FileList } from '../ui/FileList';
import { ProgressBar } from '../ui/ProgressBar';
import { Stepper, type Step } from '../ui/Stepper';
import { formatBytes, formatOf } from '../../lib/formats';
import { useConversion, type ConversionResult, type RunContext } from '../../lib/useConversion';
import { useToast } from '../Toast';

const STEPS: Step[] = [
  { id: 'upload',    label: 'Upload' },
  { id: 'configure', label: 'Options' },
  { id: 'convert',   label: 'Convert' },
  { id: 'download',  label: 'Download' },
];

interface ConversionFlowProps {
  toolId: string;
  toolName: string;
  /** Does the work. Throw to surface an error. */
  run: (files: File[], ctx: RunContext) => Promise<ConversionResult>;
  /** `accept` for the file picker, e.g. "application/pdf,.pdf". */
  accept?: string;
  multiple?: boolean;
  /** Order matters (merge, combine), shows reordering controls. */
  ordered?: boolean;
  dropLabel?: string;
  dropHint?: string;
  /** Tool-specific settings, rendered on the Options step. */
  options?: React.ReactNode;
  /** Label for the primary action, e.g. "Merge PDFs". Keep the verb
   *  consistent with the success message the user sees afterwards. */
  actionLabel?: string;
}

/** Compact duration readout: "8s", "1m 20s". */
function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  if (total < 60) return `${total}s`;
  return `${Math.floor(total / 60)}m ${total % 60}s`;
}

/**
 * The four-step flow every file tool shares:
 * Upload → Options → Convert → Download.
 *
 * Tools pass a `run` function and optional settings; this owns the
 * stepper, the states, and the copy.
 */
export const ConversionFlow: React.FC<ConversionFlowProps> = ({
  toolId,
  toolName,
  run,
  accept,
  multiple = false,
  ordered = false,
  dropLabel = 'Choose a file',
  dropHint = 'or drop it here',
  options,
  actionLabel = 'Convert',
}) => {
  const { toast } = useToast();
  const flow = useConversion({ toolId, toolName, run });

  const totalBytes = flow.files.reduce((sum, f) => sum + f.file.size, 0);

  const handleDownload = () => {
    if (!flow.result || !flow.downloadUrl) return;
    const link = document.createElement('a');
    link.href = flow.downloadUrl;
    link.download = flow.result.filename;
    link.click();
    toast({ title: 'Downloaded', description: flow.result.filename, variant: 'success' });
  };

  const handleShare = async () => {
    if (!flow.result) return;
    const file = new File([flow.result.blob], flow.result.filename, { type: flow.result.blob.type });
    // Share only works over https with a supporting browser; fall back cleanly.
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: flow.result.filename });
      } catch {
        // User dismissed the sheet, not an error worth reporting.
      }
    } else {
      toast({
        title: 'Sharing is not available here',
        description: 'Download the file and share it from your device.',
        variant: 'info',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Stepper
        steps={STEPS}
        current={flow.stepIndex}
        onStepClick={flow.phase === 'done' ? undefined : (i) => { if (i === 0) flow.reset(); }}
      />

      {/* ── Step 1 · Upload ───────────────────────────────────────── */}
      {flow.phase === 'upload' && (
        <div className="animate-step-in">
          <DropZone
            onFiles={(files) => flow.addFiles(files, { multiple })}
            accept={accept}
            multiple={multiple}
            label={dropLabel}
            hint={dropHint}
          />
        </div>
      )}

      {/* ── Step 2 · Options ──────────────────────────────────────── */}
      {flow.phase === 'configure' && (
        <div className="flex flex-col gap-6 animate-step-in">
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">
                {flow.files.length === 1 ? 'Your file' : `Your files (${flow.files.length})`}
              </h2>
              <span className="text-sm text-muted-foreground font-mono">{formatBytes(totalBytes)}</span>
            </div>

            <FileList
              files={flow.files}
              onRemove={flow.removeFile}
              onReorder={ordered ? flow.reorderFiles : undefined}
            />

            {multiple && (
              <DropZone
                onFiles={(files) => flow.addFiles(files, { multiple })}
                accept={accept}
                multiple
                label="Add another file"
                hint="or drop it here"
                className="mt-1"
              />
            )}
          </section>

          {options && (
            <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">Settings</h2>
              {options}
            </section>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button variant="ghost" icon={ArrowLeft} onClick={flow.reset}>
              Start over
            </Button>
            <Button size="lg" icon={Sparkles} onClick={flow.start} disabled={flow.files.length === 0}>
              {actionLabel}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3 · Converting ───────────────────────────────────── */}
      {flow.phase === 'converting' && (
        <div className="flex flex-col items-center gap-5 rounded-[var(--radius-lg)] border border-border
                        bg-card px-6 py-12 text-center animate-step-in">
          <div className="w-full max-w-md flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-base font-bold text-foreground">
                Working on {flow.files.length === 1 ? flow.files[0].file.name : `${flow.files.length} files`}
              </span>
              <span className="font-mono text-sm font-semibold text-primary tabular-nums">
                {flow.progress === null ? '' : `${Math.round(flow.progress)}%`}
              </span>
            </div>

            <ProgressBar value={flow.progress} label={`${toolName} progress`} />

            <p className="text-sm text-muted-foreground">
              {flow.etaMs !== null && flow.etaMs > 1000
                ? `About ${formatDuration(flow.etaMs)} left`
                : `Running on your device, ${formatDuration(flow.elapsedMs)} elapsed`}
            </p>
          </div>

          <Button variant="ghost" icon={X} onClick={flow.cancel}>
            Cancel
          </Button>
        </div>
      )}

      {/* ── Step 4 · Done ─────────────────────────────────────────── */}
      {flow.phase === 'done' && flow.result && (
        <div className="flex flex-col gap-6 animate-step-in">
          <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-success/30
                          bg-success/[0.06] px-6 py-10 text-center">
            {(() => {
              const { icon: Icon, tint } = formatOf(flow.result.filename);
              return (
                <span className={`grid place-items-center w-16 h-16 rounded-[var(--radius-lg)] ${tint}`}>
                  <Icon className="w-8 h-8" aria-hidden="true" />
                </span>
              );
            })()}

            <div className="flex flex-col gap-1 min-w-0 max-w-full">
              <h2 className="text-xl font-bold text-foreground">Your file is ready</h2>
              <p className="truncate text-sm text-muted-foreground" title={flow.result.filename}>
                {flow.result.filename}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {formatBytes(flow.result.blob.size)}
                {flow.elapsedMs > 0 && ` · took ${formatDuration(flow.elapsedMs)}`}
              </p>
            </div>

            <Button size="lg" icon={Download} onClick={handleDownload}>
              Download
            </Button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
            <Button variant="secondary" icon={RotateCcw} onClick={flow.reset}>
              Convert another file
            </Button>
            <Button variant="ghost" icon={Share2} onClick={handleShare}>
              Share
            </Button>
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────── */}
      {flow.phase === 'error' && (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-danger/30
                     bg-danger/[0.06] px-6 py-10 text-center animate-step-in"
        >
          <span className="grid place-items-center w-14 h-14 rounded-full bg-danger/10 text-danger">
            <AlertCircle className="w-7 h-7" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-foreground">That conversion didn&rsquo;t finish</h2>
            <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{flow.error}</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="ghost" onClick={flow.reset}>Start over</Button>
            <Button icon={RotateCcw} onClick={flow.retry}>Try again</Button>
          </div>
        </div>
      )}
    </div>
  );
};
