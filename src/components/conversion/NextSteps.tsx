import React, { useMemo } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { ALL_CATEGORIES } from '../../config/categories';
import { stageFiles } from '../../lib/fileHandoff';
import { toolsForFile } from '../../lib/toolsForFile';
import { extensionOf } from '../../lib/formats';
import { resolveToolIcon } from '../../utils/toolIcons';
import { trackEvent } from '../../utils/analytics';

interface NextStepsProps {
  /** The file the tool just produced. */
  file: File;
  /** The tool the visitor is on, left out of the suggestions. */
  currentToolId: string;
}

/**
 * "Keep going with this file": the tools that can open the result, each of
 * which receives the file already loaded. Converting a HEIC to JPG is rarely
 * the end of the job, the next step is usually compressing it or putting it
 * in a PDF, and this saves downloading the file only to pick it again.
 */
export const NextSteps: React.FC<NextStepsProps> = ({ file, currentToolId }) => {
  // A ZIP of batch results is only a download, not something to continue with.
  const suggestions = useMemo(
    () => (extensionOf(file.name) === 'zip' ? [] : toolsForFile(file, currentToolId).slice(0, 6)),
    [file, currentToolId],
  );
  if (suggestions.length === 0) return null;

  const open = async (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Modified clicks open a new tab the normal way, without the file.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    trackEvent('next_step_open', { from_tool: currentToolId, tool_id: id });
    await stageFiles(id, [file]);
    window.location.assign(`/tool/${id}`);
  };

  return (
    <section aria-labelledby="next-steps" className="rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:p-6">
      <h2 id="next-steps" className="text-base font-bold text-foreground">Keep going with this file</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Opens in the next tool with the file already loaded. It still never leaves your device.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2" role="list">
        {suggestions.map((tool) => {
          const category = ALL_CATEGORIES.find((c) => c.id === tool.category);
          const Icon = resolveToolIcon(tool.icon, category?.icon ?? FileText);
          return (
            <li key={tool.id}>
              <a
                href={`/tool/${tool.id}`}
                onClick={(e) => open(e, tool.id)}
                className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background p-3
                           transition-colors hover:border-primary/50 hover:bg-primary/[0.04]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)]
                                  ${category?.iconBg ?? 'bg-muted'} ${category?.iconColor ?? 'text-muted-foreground'}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">{tool.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{tool.description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
