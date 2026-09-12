import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { formatBytes, formatOf } from '../../lib/formats';

export interface QueuedFile {
  id: string;
  file: File;
}

interface FileListProps {
  files: QueuedFile[];
  onRemove: (id: string) => void;
  /** Enables reordering controls. Omit for single-file tools. */
  onReorder?: (from: number, to: number) => void;
  className?: string;
}

/**
 * The queued files for a conversion: format icon, name, size, and a remove
 * action. Where order is meaningful (merge, combine) it can be changed.
 *
 * Reordering uses explicit buttons rather than drag-only, so it works by
 * keyboard and on touch. Order changes are announced politely.
 */
export const FileList: React.FC<FileListProps> = ({ files, onRemove, onReorder, className = '' }) => {
  const [announcement, setAnnouncement] = React.useState('');

  const move = (from: number, to: number) => {
    if (!onReorder || to < 0 || to >= files.length) return;
    onReorder(from, to);
    setAnnouncement(`${files[from].file.name} moved to position ${to + 1} of ${files.length}`);
  };

  if (files.length === 0) return null;

  return (
    <div className={className}>
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <ul className="flex flex-col gap-2" role="list">
        {files.map((entry, index) => {
          const { icon: Icon, label, tint } = formatOf(entry.file.name);

          return (
            <li
              key={entry.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border
                         bg-card p-3 transition-colors duration-[var(--motion-fast)] hover:border-outline-variant"
            >
              {onReorder && files.length > 1 && (
                <span className="flex flex-col -my-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${entry.file.name} up`}
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-container
                               disabled:opacity-30 disabled:pointer-events-none
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === files.length - 1}
                    aria-label={`Move ${entry.file.name} down`}
                    className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-container
                               disabled:opacity-30 disabled:pointer-events-none
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                </span>
              )}

              <span className={`grid place-items-center w-10 h-10 shrink-0 rounded-[var(--radius-sm)] ${tint}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground" title={entry.file.name}>
                  {entry.file.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {label} &middot; <span className="font-mono">{formatBytes(entry.file.size)}</span>
                </span>
              </span>

              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                aria-label={`Remove ${entry.file.name}`}
                className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)]
                           text-muted-foreground hover:bg-danger/10 hover:text-danger
                           transition-colors duration-[var(--motion-fast)]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
