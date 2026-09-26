import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { History, X, Trash2, ShieldCheck } from 'lucide-react';
import { clearActivity, historyEnabled, type ActivityEntry } from '../../lib/activity';
import { ActivityRow, groupByDay } from './ActivityViews';

interface Props {
  toolId: string;
  toolName: string;
  entries: ActivityEntry[];
  onClose: () => void;
  onOpenAllHistory: () => void;
}

/**
 * The per-tool history side panel. Its own chunk, loaded on first open, so
 * tool pages don't pay for the diff viewer and file previews up front.
 * Portalled so the page header's stacking context can't sit on top of it.
 */
const ToolHistoryDrawer: React.FC<Props> = ({ toolId, toolName, entries, onClose, onOpenAllHistory }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const enabled = historyEnabled();
  const setOpen = (v: boolean) => { if (!v) onClose(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={`${toolName} history`}>
          <div className="absolute inset-0 bg-black/40 fade-in" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md flex flex-col bg-background border-l border-border shadow-2xl fade-in">
            <header className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-foreground">History</h2>
                <p className="mt-0.5 text-sm text-muted-foreground truncate">{toolName} · {entries.length} change{entries.length === 1 ? '' : 's'}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close history"
                className="grid place-items-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-surface-container hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!enabled && (
                <p className="mb-4 rounded-[var(--radius-md)] border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-foreground">
                  History is turned off in <a href="/settings" className="font-semibold text-primary hover:underline">Settings</a>, so new changes aren&rsquo;t being recorded.
                </p>
              )}
              {entries.length === 0 ? (
                <div className="flex flex-col items-center text-center py-16">
                  <span className="grid place-items-center w-12 h-12 rounded-full bg-surface-container text-muted-foreground">
                    <History className="w-6 h-6" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-foreground">Nothing yet</p>
                  <p className="mt-1 max-w-[34ch] text-sm text-muted-foreground">
                    Edits, settings, files, copies and downloads in this tool will show up here.
                  </p>
                </div>
              ) : (
                groupByDay(entries).map((g) => (
                  <section key={g.day} className="mb-5 last:mb-0">
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{g.day}</h3>
                    <ul className="flex flex-col gap-2" role="list">
                      {g.items.map((e) => <ActivityRow key={e.id} entry={e} />)}
                    </ul>
                  </section>
                ))
              )}
            </div>

            <footer className="border-t border-border px-5 py-3 flex flex-wrap items-center gap-2">
              <p className="flex-1 min-w-[180px] flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-success" /> Stored only in this browser
              </p>
              <button
                type="button"
                onClick={() => { setOpen(false); onOpenAllHistory(); }}
                className="h-8 px-3 rounded-[var(--radius-sm)] text-xs font-semibold text-primary hover:bg-primary/10"
              >
                All history
              </button>
              {entries.length > 0 && (confirmClear ? (
                <span className="inline-flex items-center gap-1.5">
                  <button type="button" onClick={() => { clearActivity(toolId); setConfirmClear(false); }}
                    className="h-8 px-3 rounded-[var(--radius-sm)] text-xs font-semibold bg-danger text-danger-foreground hover:bg-danger/90">
                    Clear {entries.length}
                  </button>
                  <button type="button" onClick={() => setConfirmClear(false)}
                    className="h-8 px-2.5 rounded-[var(--radius-sm)] text-xs font-semibold text-muted-foreground hover:bg-surface-container">
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-xs font-semibold text-muted-foreground hover:bg-danger/10 hover:text-danger">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              ))}
            </footer>
          </aside>
        </div>,
        document.body,
  );
};

export default ToolHistoryDrawer;
