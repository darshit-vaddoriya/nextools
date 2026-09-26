import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download, History, Search, Trash2, ShieldCheck, LayoutList, Images, ArrowUpRight, Layers, HardDrive, Clock3, Wrench, Eye,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { formatBytes, formatOf } from '../lib/formats';
import { clearHistory, loadHistory, relativeTime, subscribeHistory, type JobRecord } from '../lib/history';
import {
  clearActivity, historyEnabled, loadActivity, subscribeActivity, type ActivityEntry, type ActivityKind,
} from '../lib/activity';
import { previewKind, type StoredFileRef } from '../lib/fileStore';
import {
  ActivityRow, FilePreview, KIND_META, downloadStored, groupByDay, useStoredBlob,
} from '../components/history/ActivityViews';
import { TOOLS } from '../config/tools';
import { resolveToolIcon } from '../utils/toolIcons';

interface MyFilesProps {
  onBrowseTools: () => void;
  onOpenTool: (toolId: string) => void;
}

/** Conversion jobs predate the activity log; show them in the same timeline. */
function jobToEntry(job: JobRecord): ActivityEntry {
  const primary = job.fileNames[0] ?? 'Untitled';
  const extra = job.fileNames.length - 1;
  const verb = job.status === 'processing' ? 'Converting' : 'Converted';
  return {
    id: job.id,
    toolId: job.toolId,
    toolName: job.toolName,
    kind: 'convert',
    label: 'Conversion',
    summary: `${verb} ${primary}${extra > 0 ? ` +${extra} more` : ''} (${formatBytes(job.totalBytes)})${job.error ? `: ${job.error}` : ''}`,
    at: job.startedAt,
    updatedAt: job.startedAt + (job.durationMs ?? 0),
    status: job.status === 'failed' ? 'failed' : job.status === 'done' ? 'done' : undefined,
  };
}

const KIND_FILTERS: (ActivityKind | 'all')[] = ['all', 'edit', 'option', 'file', 'download', 'copy', 'action', 'convert'];
const RANGES = [
  { id: 'all', label: 'All time', ms: Infinity },
  { id: 'today', label: 'Today', ms: 0 },
  { id: '7d', label: 'Last 7 days', ms: 7 * 86_400_000 },
  { id: '30d', label: 'Last 30 days', ms: 30 * 86_400_000 },
] as const;
type RangeId = typeof RANGES[number]['id'];

/** Consecutive entries of one tool less than this apart read as one sitting. */
const SESSION_GAP_MS = 30 * 60_000;
const PAGE = 40;

const TOOL_BY_ID = new Map(TOOLS.map((t) => [t.id, t]));
const toolIcon = (id: string) => resolveToolIcon(TOOL_BY_ID.get(id)?.icon ?? '', Wrench);

interface Session { key: string; toolId: string; toolName: string; start: number; end: number; items: ActivityEntry[] }

/** Split one day's newest-first entries into per-tool sittings. */
function toSessions(items: ActivityEntry[]): Session[] {
  const out: Session[] = [];
  for (const e of items) {
    const last = out[out.length - 1];
    if (last && last.toolId === e.toolId && last.start - e.updatedAt < SESSION_GAP_MS) {
      last.items.push(e);
      last.start = e.updatedAt;
    } else {
      out.push({ key: e.id, toolId: e.toolId, toolName: e.toolName, start: e.updatedAt, end: e.updatedAt, items: [e] });
    }
  }
  return out;
}

const clock = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

/**
 * Everything done across all tools on this device: edits with before/after,
 * settings, files (with saved copies), copies, downloads and conversions.
 * Browser storage only; nothing here is sent anywhere.
 */
export const MyFiles: React.FC<MyFilesProps> = ({ onBrowseTools, onOpenTool }) => {
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [view, setView] = useState<'timeline' | 'files'>('timeline');
  const [toolFilter, setToolFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState<ActivityKind | 'all'>('all');
  const [range, setRange] = useState<RangeId>('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    // Deferred a frame so the skeleton is real rather than a fake delay.
    const id = window.requestAnimationFrame(() => { setActivity(loadActivity()); setJobs(loadHistory()); });
    const offA = subscribeActivity(setActivity);
    const offJ = subscribeHistory(setJobs);
    return () => { window.cancelAnimationFrame(id); offA(); offJ(); };
  }, []);

  useEffect(() => { setLimit(PAGE); setConfirmClear(false); }, [toolFilter, kindFilter, range, query, view]);

  const all = useMemo(() => {
    if (!activity) return null;
    return [...activity, ...jobs.map(jobToEntry)].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [activity, jobs]);

  const tools = useMemo(() => {
    const counts = new Map<string, { name: string; n: number; last: number }>();
    for (const e of all ?? []) {
      const c = counts.get(e.toolId);
      counts.set(e.toolId, { name: e.toolName, n: (c?.n ?? 0) + 1, last: Math.max(c?.last ?? 0, e.updatedAt) });
    }
    return Array.from(counts, ([id, v]) => ({ id, ...v })).sort((a, b) => b.last - a.last);
  }, [all]);

  /** Tool + range + search; the type filter applies on top, per view. */
  const scoped = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    const r = RANGES.find((x) => x.id === range)!;
    const since = r.id === 'today' ? new Date().setHours(0, 0, 0, 0) : Date.now() - r.ms;
    return all.filter((e) =>
      (toolFilter === 'all' || e.toolId === toolFilter) &&
      e.updatedAt >= since &&
      (!q || `${e.summary} ${e.toolName} ${e.label} ${e.after ?? ''} ${e.files?.map((f) => f.name).join(' ') ?? ''}`.toLowerCase().includes(q)));
  }, [all, toolFilter, range, query]);

  const timeline = useMemo(
    () => (kindFilter === 'all' ? scoped : scoped.filter((e) => e.kind === kindFilter)),
    [scoped, kindFilter],
  );

  const files = useMemo(() => {
    const seen = new Set<string>();
    const out: { file: StoredFileRef; entry: ActivityEntry }[] = [];
    for (const e of scoped) {
      for (const f of e.files ?? []) {
        const k = `${f.id}:${f.role}`;
        if (f.skipped || !f.id || seen.has(k)) continue;
        seen.add(k);
        out.push({ file: f, entry: e });
      }
    }
    return out;
  }, [scoped]);

  const stats = useMemo(() => {
    const saved = new Map<string, number>();
    for (const e of all ?? []) for (const f of e.files ?? []) if (!f.skipped && f.id) saved.set(f.id, f.size);
    return {
      changes: all?.length ?? 0,
      tools: tools.length,
      files: saved.size,
      bytes: Array.from(saved.values()).reduce((n, s) => n + s, 0),
      last: all?.[0]?.updatedAt,
    };
  }, [all, tools]);

  const clearScoped = () => {
    if (toolFilter === 'all') { clearActivity(); clearHistory(); } else clearActivity(toolFilter);
    setConfirmClear(false);
    setToolFilter('all');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexttool-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.dataset.fromHistory = '1';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const activeTool = tools.find((t) => t.id === toolFilter);
  const enabled = historyEnabled();

  // ── Loading / empty ──
  if (all === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10" aria-busy="true">
        <Skeleton className="h-9 w-40" />
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-[var(--radius-lg)]" />)}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-[var(--radius-lg)]" />)}
        </div>
      </div>
    );
  }

  if (all.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:py-12">
        <h1 className="web-only text-3xl font-extrabold tracking-tight text-foreground">History</h1>
        <p className="mt-1.5 text-base text-muted-foreground">What you do in each tool, kept only in this browser.</p>
        <EmptyState
          className="mt-8"
          icon={History}
          title={enabled ? 'No history yet' : 'History is turned off'}
          description={enabled
            ? 'Use any tool and your edits, settings, uploaded files and downloaded results show up here, grouped by tool, so you can check or download them again later.'
            : 'Turn on “Keep a history” in Settings to start recording what you change in each tool.'}
          action={enabled
            ? <Button onClick={onBrowseTools}>Browse tools</Button>
            : <a href="/settings" className="inline-flex h-11 items-center px-4 rounded-[var(--radius-md)] bg-primary text-primary-foreground text-sm font-semibold">Open Settings</a>}
        />
      </div>
    );
  }

  const sessionsByDay = groupByDay(timeline.slice(0, limit)).map((g) => ({ day: g.day, sessions: toSessions(g.items) }));
  const shownCount = view === 'timeline' ? timeline.length : files.length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:py-10">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="web-only text-3xl font-extrabold tracking-tight text-foreground">History</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
            Stored only in this browser. Nothing is uploaded.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={exportJson}>Export</Button>
          {confirmClear ? (
            <>
              <Button variant="danger" size="sm" onClick={clearScoped}>
                {toolFilter === 'all' ? 'Delete everything' : `Delete ${activeTool?.name ?? ''} history`}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmClear(true)}>
              {toolFilter === 'all' ? 'Clear all' : 'Clear tool'}
            </Button>
          )}
        </div>
      </div>

      {!enabled && (
        <p className="mt-5 rounded-[var(--radius-md)] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          History is turned off in <a href="/settings" className="font-semibold text-primary hover:underline">Settings</a>. Older entries are shown, but nothing new is recorded.
        </p>
      )}

      {/* ── Stats ── */}
      <dl className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Changes', value: stats.changes.toLocaleString() },
          { icon: Wrench, label: 'Tools used', value: stats.tools.toLocaleString() },
          { icon: HardDrive, label: 'Saved files', value: `${stats.files} · ${formatBytes(stats.bytes)}` },
          { icon: Clock3, label: 'Last activity', value: stats.last ? relativeTime(stats.last) : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-3 sm:px-4 py-3 sm:py-3.5">
            {/* Icon dropped on phones: two cards a row leave the value too little room. */}
            <span className="hidden sm:grid place-items-center w-9 h-9 shrink-0 rounded-[var(--radius-sm)] bg-surface-container text-muted-foreground">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
              <dd className="sm:truncate leading-snug text-base font-extrabold text-foreground tabular-nums">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* grid-cols-1 = minmax(0, 1fr): with the implicit auto column, the tool
          chip scroller set the column to its full width (~1000px on a phone)
          and everything past the screen edge was clipped. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* ── Tools (sidebar on desktop, scroller on mobile) ── */}
        <nav aria-label="Filter by tool" className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="hidden lg:block mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tools</h2>
          <ul className="flex lg:flex-col gap-1.5 lg:gap-0.5 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 lg:pb-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            {[{ id: 'all', name: 'All tools', n: all.length, last: 0 }, ...tools].map((t) => {
              const active = toolFilter === t.id;
              const Icon = t.id === 'all' ? Layers : toolIcon(t.id);
              return (
                <li key={t.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setToolFilter(t.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`w-full flex items-center gap-2.5 h-10 px-3 lg:px-2.5 rounded-full lg:rounded-[var(--radius-md)] border lg:border-0 text-left text-sm transition-colors
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? 'bg-primary/10 border-primary/40 text-primary font-bold'
                        : 'border-border text-muted-foreground hover:bg-surface-container hover:text-foreground font-medium'}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate lg:flex-1 whitespace-nowrap">{t.name}</span>
                    <span className="text-[11px] font-mono tabular-nums opacity-70">{t.n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">
          {/* ── Toolbar ── */}
          <div className="sticky top-[52px] z-10 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <div role="tablist" aria-label="View" className="flex gap-1 rounded-[var(--radius-md)] bg-surface-container p-1">
                {([['timeline', 'Timeline', LayoutList], ['files', 'Files', Images]] as const).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={view === id}
                    onClick={() => setView(id)}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-sm font-semibold transition-colors ${
                      view === id ? 'bg-card text-foreground shadow-raised' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" /> {label}
                    {id === 'files' && files.length > 0 && <span className="text-[11px] font-mono opacity-70">{files.length}</span>}
                  </button>
                ))}
              </div>
              <label className="relative flex-1 min-w-[180px]">
                <span className="sr-only">Search history</span>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search changes and file names…"
                  className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label>
                <span className="sr-only">Time range</span>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as RangeId)}
                  className="h-10 px-3 rounded-[var(--radius-md)] border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>
            </div>
            {view === 'timeline' && (
              <div className="mt-2.5 flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by type">
                {KIND_FILTERS.map((k) => {
                  const active = kindFilter === k;
                  const n = k === 'all' ? scoped.length : scoped.filter((e) => e.kind === k).length;
                  if (k !== 'all' && n === 0) return null;
                  const Icon = k === 'all' ? null : KIND_META[k].icon;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setKindFilter(k)}
                      className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                        active ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:bg-surface-container hover:text-foreground'}`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
                      {k === 'all' ? 'Everything' : KIND_META[k].label}
                      <span className="font-mono opacity-70">{n}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {toolFilter !== 'all' && activeTool && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{activeTool.name}</span> only · {shownCount} result{shownCount === 1 ? '' : 's'}
              </p>
              <button type="button" onClick={() => onOpenTool(toolFilter)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Open tool <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* ── Content ── */}
          <div className="mt-5">
            {view === 'timeline' ? (
              timeline.length === 0 ? (
                <NoMatches onReset={() => { setQuery(''); setKindFilter('all'); setRange('all'); }} />
              ) : (
                <>
                  {sessionsByDay.map((g) => (
                    <section key={g.day} className="mb-7 last:mb-0">
                      <h2 className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {g.day}<span className="h-px flex-1 bg-border" aria-hidden="true" />
                      </h2>
                      <div className="flex flex-col gap-3">
                        {g.sessions.map((s) => {
                          const Icon = toolIcon(s.toolId);
                          return (
                            <article key={s.key} className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card">
                              <header className="flex items-center gap-3 px-3.5 py-2.5 border-b border-border bg-surface-container/40">
                                <span className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] bg-primary/10 text-primary">
                                  <Icon className="w-4 h-4" aria-hidden="true" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <h3 className="truncate text-sm font-bold text-foreground">{s.toolName}</h3>
                                  <p className="text-xs text-muted-foreground tabular-nums">
                                    {clock(s.start)}{s.end - s.start > 60_000 ? ` – ${clock(s.end)}` : ''} · {s.items.length} change{s.items.length === 1 ? '' : 's'}
                                  </p>
                                </div>
                                <button type="button" onClick={() => onOpenTool(s.toolId)}
                                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-[var(--radius-sm)] text-xs font-semibold text-primary hover:bg-primary/10">
                                  Open <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </header>
                              <ul className="divide-y divide-border" role="list">
                                {s.items.map((e) => <ActivityRow key={e.id} entry={e} flat />)}
                              </ul>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                  {timeline.length > limit && (
                    <div className="mt-6 flex justify-center">
                      <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
                        Show more ({timeline.length - limit} left)
                      </Button>
                    </div>
                  )}
                </>
              )
            ) : files.length === 0 ? (
              <EmptyState
                icon={Images}
                title="No saved files here"
                description="Files you upload to a tool and results you download are kept here, so you can preview or download them again."
              />
            ) : (
              <FileGallery items={files.slice(0, limit)} onOpenTool={onOpenTool} more={files.length - limit} onMore={() => setLimit((l) => l + PAGE)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NoMatches: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="py-16 text-center">
    <p className="text-sm font-bold text-foreground">Nothing matches these filters</p>
    <button type="button" onClick={onReset} className="mt-2 text-sm font-semibold text-primary hover:underline">Reset filters</button>
  </div>
);

// ─── Files gallery ─────────────────────────────────────────

/** Image thumbnail read from IndexedDB only once the tile scrolls into view. */
const Thumb: React.FC<{ file: StoredFileRef }> = ({ file }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isImage = previewKind(file.type, file.name) === 'image';
  const blob = useStoredBlob(isImage && visible ? file.id : null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isImage) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [isImage]);

  useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  const { icon: Icon, tint } = formatOf(file.name);
  return (
    <div ref={ref} className="relative aspect-[4/3] bg-surface-container grid place-items-center overflow-hidden">
      {url ? (
        <img src={url} alt="" className="absolute inset-0 w-full h-full object-contain" loading="lazy" decoding="async" />
      ) : blob === false ? (
        <span className="text-xs text-muted-foreground">No longer stored</span>
      ) : (
        <span className={`grid place-items-center w-12 h-12 rounded-[var(--radius-md)] ${tint}`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </span>
      )}
    </div>
  );
};

const FileGallery: React.FC<{
  items: { file: StoredFileRef; entry: ActivityEntry }[];
  onOpenTool: (id: string) => void;
  more: number;
  onMore: () => void;
}> = ({ items, onOpenTool, more, onMore }) => {
  const [preview, setPreview] = useState<StoredFileRef | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3" role="list">
        {items.map(({ file, entry }) => {
          const canPreview = previewKind(file.type, file.name) !== 'none';
          return (
            <li key={`${file.id}:${file.role}`} className="group overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card transition-colors hover:border-outline-variant">
              <button type="button" onClick={() => setPreview(file)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Preview ${file.name}`}>
                <div className="relative">
                  <Thumb file={file} />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    file.role === 'output' ? 'bg-success text-success-foreground' : 'bg-card/90 text-foreground border border-border'}`}>
                    {file.role === 'output' ? 'Output' : 'Input'}
                  </span>
                  {canPreview && (
                    <span className="absolute inset-0 grid place-items-center bg-black/0 group-hover:bg-black/25 transition-colors">
                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </button>
              <div className="flex items-start gap-2 p-2.5">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-foreground" title={file.name}>{file.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    <button type="button" onClick={() => onOpenTool(entry.toolId)} className="font-semibold text-primary hover:underline">{entry.toolName}</button>
                    {' · '}{formatBytes(file.size)} · {relativeTime(entry.updatedAt)}
                  </p>
                </div>
                <button type="button" onClick={() => void downloadStored(file)} title="Download" aria-label={`Download ${file.name}`}
                  className="grid place-items-center w-8 h-8 shrink-0 rounded-[var(--radius-sm)] text-muted-foreground hover:bg-surface-container hover:text-foreground">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {more > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={onMore}>Show more ({more} left)</Button>
        </div>
      )}
      {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}
    </>
  );
};
