import React, { useEffect, useState } from 'react';
import { FolderClock, Info, Trash2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { formatBytes, formatOf } from '../lib/formats';
import {
  clearHistory, loadHistory, relativeTime, removeJob, subscribeHistory, type JobRecord,
} from '../lib/history';

interface MyFilesProps {
  onBrowseTools: () => void;
  onOpenTool: (toolId: string) => void;
}

/**
 * A log of what has been converted on this device.
 *
 * Re-download is deliberately absent: output bytes are never written to
 * disk, so once the tab closes the file is genuinely gone. Rather than
 * offer a link that would break, each entry reopens the tool it used.
 */
export const MyFiles: React.FC<MyFilesProps> = ({ onBrowseTools, onOpenTool }) => {
  const [jobs, setJobs] = useState<JobRecord[] | null>(null);

  useEffect(() => {
    // Deferred a frame so the skeleton is real rather than a fake delay.
    const id = window.requestAnimationFrame(() => setJobs(loadHistory()));
    const unsubscribe = subscribeHistory(setJobs);
    return () => { window.cancelAnimationFrame(id); unsubscribe(); };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My files</h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Everything you have converted on this device.
          </p>
        </div>
        {jobs && jobs.length > 0 && (
          <Button variant="ghost" icon={Trash2} onClick={clearHistory}>
            Clear history
          </Button>
        )}
      </div>

      {/* Explains the missing re-download link before anyone looks for it. */}
      {jobs && jobs.length > 0 && (
        <p className="mt-6 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-border
                      bg-surface-container px-4 py-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            This list is stored only in this browser. The converted files themselves were never
            saved anywhere, so they can&rsquo;t be downloaded again. Open the tool to redo one.
          </span>
        </p>
      )}

      <div className="mt-6">
        {jobs === null ? (
          <ul className="flex flex-col gap-2" role="list" aria-label="Loading history">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-card p-4">
                <Skeleton className="w-10 h-10 rounded-[var(--radius-sm)]" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={FolderClock}
            title="No conversions yet"
            description="Once you convert a file, it shows up here so you can find the tool again."
            action={<Button onClick={onBrowseTools}>Browse tools</Button>}
          />
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {jobs.map((job) => {
              const primary = job.fileNames[0] ?? 'Untitled';
              const { icon: Icon, tint } = formatOf(primary);
              const extra = job.fileNames.length - 1;

              return (
                <li
                  key={job.id}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-card p-4
                             transition-colors duration-[var(--motion-fast)] hover:border-outline-variant"
                >
                  <span className={`grid place-items-center w-10 h-10 shrink-0 rounded-[var(--radius-sm)] ${tint}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold text-foreground" title={job.fileNames.join(', ')}>
                      {primary}{extra > 0 && <span className="font-medium text-muted-foreground"> +{extra} more</span>}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => onOpenTool(job.toolId)}
                        className="font-semibold text-primary hover:underline focus-visible:outline-none
                                   focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {job.toolName}
                      </button>
                      {' · '}<span className="font-mono">{formatBytes(job.totalBytes)}</span>
                      {' · '}{relativeTime(job.startedAt)}
                    </p>
                    {job.status === 'failed' && job.error && (
                      <p className="mt-1 text-xs text-danger">{job.error}</p>
                    )}
                  </div>

                  <StatusBadge status={job.status} />

                  <button
                    type="button"
                    onClick={() => removeJob(job.id)}
                    aria-label={`Remove ${primary} from history`}
                    className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)]
                               text-muted-foreground hover:bg-danger/10 hover:text-danger
                               transition-colors duration-[var(--motion-fast)]
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
