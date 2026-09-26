import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { loadActivity, subscribeActivity, type ActivityEntry } from '../../lib/activity';

const ToolHistoryDrawer = React.lazy(() => import('./ToolHistoryDrawer'));

interface Props {
  toolId: string;
  toolName: string;
  onOpenAllHistory: () => void;
}

/** "History" button on a tool page, opening a side panel with just this tool's changes. */
export const ToolHistoryButton: React.FC<Props> = ({ toolId, toolName, onOpenAllHistory }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ActivityEntry[]>(() => loadActivity(toolId));

  useEffect(() => {
    setEntries(loadActivity(toolId));
    return subscribeActivity((all) => setEntries(all.filter((e) => e.toolId === toolId)));
  }, [toolId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`${toolName} history`}
        aria-label={`Open ${toolName} history`}
        className="relative w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border
                   text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <History className="w-4 h-4" />
        {entries.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground
                           text-[10px] font-bold leading-[18px] text-center tabular-nums">
            {entries.length > 99 ? '99+' : entries.length}
          </span>
        )}
      </button>

      {open && (
        <React.Suspense fallback={null}>
          <ToolHistoryDrawer
            toolId={toolId}
            toolName={toolName}
            entries={entries}
            onClose={() => setOpen(false)}
            onOpenAllHistory={onOpenAllHistory}
          />
        </React.Suspense>
      )}
    </>
  );
};
