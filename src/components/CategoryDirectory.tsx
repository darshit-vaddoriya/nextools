import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, FileText, Search, ShieldCheck, Star, UserX, X, Zap } from 'lucide-react';
import { TOOLS } from '../config/tools';
import { ALL_CATEGORIES, categoryNoun, type CategoryConfig } from '../config/categories';
import { CATEGORY_HUBS, toolAccepts } from '../config/categoryHubs';
import { converterToolsAccepting } from '../config/converters';
import { extensionOf, formatBytes, formatOf } from '../lib/formats';
import { stageFiles } from '../lib/fileHandoff';
import { resolveToolIcon } from '../utils/toolIcons';
import { trackEvent } from '../utils/analytics';
import type { Tool, ToolCategory } from '../types';
import { AppLink } from './AppLink';
import { FavoriteButton } from './FavoriteButton';
import { DropZone } from './ui/DropZone';

/**
 * A category landing page: the File Converters directory, generalised.
 *
 * Visitors land here holding either a file ("I have a PDF") or a task ("format
 * this JSON"), so the page answers that first. File categories open with a
 * drop zone that narrows the category to the tools that can open the file and
 * hands the file over; the others open with a search. Below that, every tool
 * in task groups, then the related tools that live in other categories.
 */

interface CategoryDirectoryProps {
  cat: ToolCategory;
  conf: CategoryConfig;
  tagline?: string;
  intro?: string;
  onSelectTool: (id: string) => void;
}

const byId = new Map(TOOLS.map((t) => [t.id, t]));
const catOf = (id: ToolCategory) => ALL_CATEGORIES.find((c) => c.id === id);

/** Name, description and keywords, every word of the query must appear. */
function matchesQuery(tool: Tool, q: string): boolean {
  if (!q) return true;
  const haystack = [tool.name, tool.description, ...tool.keywords].join(' ').toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

/** The icon chip, in the tool's own category colour. */
const ToolIcon: React.FC<{ tool: Tool; size?: 'sm' | 'md' }> = ({ tool, size = 'md' }) => {
  const c = catOf(tool.category);
  const Icon = resolveToolIcon(tool.icon, c?.icon ?? FileText);
  const box = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl';
  return (
    <span className={`grid shrink-0 place-items-center ${box} ${c?.iconBg ?? 'bg-muted'} ${c?.iconColor ?? 'text-muted-foreground'}`}>
      <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} aria-hidden="true" />
    </span>
  );
};

/** A row that opens a tool: used for search results and drop matches. */
const ToolRow: React.FC<{ tool: Tool; onOpen: () => void; note?: string }> = ({ tool, onOpen, note }) => (
  <li>
    <AppLink
      href={`/tool/${tool.id}`}
      onNavigate={onOpen}
      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left
                 transition-colors hover:border-primary/50 hover:bg-primary/[0.04]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ToolIcon tool={tool} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-foreground group-hover:text-primary">{tool.name}</span>
        {note && <span className="block truncate text-[12px] text-muted-foreground">{note}</span>}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
    </AppLink>
  </li>
);

export const CategoryDirectory: React.FC<CategoryDirectoryProps> = ({ cat, conf, tagline, intro, onSelectTool }) => {
  const hub = CATEGORY_HUBS[cat];
  const tools = useMemo(() => TOOLS.filter((t) => t.category === cat && !t.isComingSoon), [cat]);
  const [group, setGroup] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [dropped, setDropped] = useState<File[]>([]);

  const q = query.trim().toLowerCase();
  const popular = useMemo(() => {
    const starred = tools.filter((t) => t.isPopular);
    return (starred.length >= 3 ? starred : [...starred, ...tools.filter((t) => !t.isPopular)]).slice(0, 6);
  }, [tools]);

  // Without a hub config (a new category), fall back to one flat group.
  const groups = hub?.groups ?? [{ id: 'all-tools', title: `All ${categoryNoun(conf)}`, blurb: '', tools: tools.map((t) => t.id) }];
  const visibleGroups = groups
    .filter((g) => group === 'all' || g.id === group)
    .map((g) => ({ ...g, visible: g.tools.map((id) => byId.get(id)).filter((t): t is Tool => !!t && matchesQuery(t, q)) }))
    .filter((g) => g.visible.length > 0);
  const related = (hub?.related ?? []).map((id) => byId.get(id)).filter((t): t is Tool => !!t);

  // ── Drop: which tools here, and which converters elsewhere, open this file ──
  const first = dropped[0];
  const meta = first ? formatOf(first.name) : null;
  const ext = first ? extensionOf(first.name) : '';
  const dropMatches = first && hub && meta
    ? tools.filter((t) => toolAccepts(hub, t.id, meta.kind, ext))
    : [];
  const converterMatches = first
    ? converterToolsAccepting(first).map((id) => byId.get(id)).filter((t): t is Tool => !!t && t.category !== cat).slice(0, 6)
    : [];

  const openWithFiles = async (id: string) => {
    // The write must land before the tool page loads and reads it back.
    if (dropped.length) await stageFiles(id, dropped);
    trackEvent('category_drop_open', { category: cat, tool_id: id, file_ext: ext });
    onSelectTool(id);
  };

  const searchResults = q ? tools.filter((t) => matchesQuery(t, q)).slice(0, 6) : [];
  const Icon = conf.icon;
  const noun = categoryNoun(conf);

  return (
    <div className="space-y-14">
      {/* ── Hero: drop a file, or say what you want to do ─────────── */}
      <section className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] font-semibold text-muted-foreground">
          <Icon className={`h-3.5 w-3.5 ${conf.iconColor}`} aria-hidden="true" />
          {tools.length} tools · runs in your browser
        </span>
        <h1 className="mt-4 font-heading text-[30px] sm:text-[40px] font-extrabold leading-tight tracking-[-0.025em] text-foreground">
          {conf.name}
        </h1>
        {tagline && <p className="mx-auto mt-3 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground">{tagline}</p>}

        <div className="mt-8 rounded-3xl border border-border bg-card p-4 text-left shadow-card sm:p-6">
          {hub?.drop ? (
            first ? (
              <div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${meta?.tint}`}>
                    {meta && <meta.icon className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-foreground">
                      {dropped.length > 1 ? `${first.name} and ${dropped.length - 1} more` : first.name}
                    </span>
                    <span className="block text-[12px] text-muted-foreground">
                      {formatBytes(dropped.reduce((n, f) => n + f.size, 0))} · stays on this device
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDropped([])}
                    aria-label="Choose a different file"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {dropMatches.length > 0 && (
                  <>
                    <h2 className="mb-3 mt-5 text-[14px] font-bold text-foreground">
                      {dropMatches.length} {dropMatches.length === 1 ? 'tool' : 'tools'} here can open {meta?.label} files
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2" role="list">
                      {dropMatches.map((t) => (
                        <ToolRow key={t.id} tool={t} onOpen={() => openWithFiles(t.id)} />
                      ))}
                    </ul>
                  </>
                )}

                {converterMatches.length > 0 && (
                  <>
                    <h2 className="mb-3 mt-5 text-[14px] font-bold text-foreground">
                      {dropMatches.length ? 'Or convert it to another format' : `Convert your ${meta?.label} file`}
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2" role="list">
                      {converterMatches.map((t) => (
                        <ToolRow key={t.id} tool={t} onOpen={() => openWithFiles(t.id)} note="File Converters" />
                      ))}
                    </ul>
                  </>
                )}

                {dropMatches.length === 0 && converterMatches.length === 0 && (
                  <p className="mt-5 text-center text-[14px] text-muted-foreground">
                    No tool here opens {meta?.label} files. Try the{' '}
                    <a href="/all-tools" className="font-semibold text-primary hover:underline">full tool list</a>
                    .
                  </p>
                )}
              </div>
            ) : (
              <DropZone
                onFiles={(files) => {
                  setDropped(files);
                  trackEvent('category_drop', { category: cat, file_ext: extensionOf(files[0]?.name ?? '') });
                }}
                multiple
                label={hub.drop.label}
                hint={hub.drop.hint}
              />
            )
          ) : (
            <div>
              <label className="relative block">
                <span className="sr-only">Search {noun}</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`What do you want to do? e.g. ${popular[0]?.name.toLowerCase() ?? 'search'}`}
                  className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-10 text-[15px] text-foreground
                             placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
              <h2 className="mb-3 mt-5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                {q ? (searchResults.length ? 'Best matches' : `Nothing matches “${query}”`) : 'Most used'}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2" role="list">
                {(q ? searchResults : popular).map((t) => (
                  <ToolRow key={t.id} tool={t} onOpen={() => onSelectTool(t.id)} note={t.description} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" /> Files never leave your device</li>
          <li className="flex items-center gap-1.5"><UserX className="h-4 w-4 text-primary" aria-hidden="true" /> No sign-up</li>
          <li className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-warning" aria-hidden="true" /> Free, no watermarks</li>
        </ul>

        {hub?.drop && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[12px] font-semibold text-muted-foreground">Popular:</span>
            {popular.map((t) => (
              <AppLink
                key={t.id}
                href={`/tool/${t.id}`}
                onNavigate={() => onSelectTool(t.id)}
                className="rounded-full border border-border bg-card px-3 py-1 text-[12.5px] font-semibold text-foreground
                           transition-colors hover:border-primary/50 hover:text-primary"
              >
                {t.name}
              </AppLink>
            ))}
          </div>
        )}
      </section>

      {/* ── Every tool, by task ───────────────────────────────────── */}
      <section aria-labelledby="cat-all" className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="cat-all" className="font-heading text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
              All {noun}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Grouped by what you want to get done. Star a tool to find it again on the homepage.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {groups.length > 1 && (
              <div role="tablist" aria-label={`${noun} groups`} className="flex flex-wrap gap-1.5">
                {[{ id: 'all', title: 'All', count: groups.reduce((n, g) => n + g.tools.length, 0) },
                  ...groups.map((g) => ({ id: g.id, title: g.title, count: g.tools.length }))].map((g) => {
                  const active = group === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setGroup(g.id)}
                      className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {g.title} <span className="opacity-70">{g.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {hub?.drop && (
              <label className="relative block sm:w-56">
                <span className="sr-only">Search {noun}</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search these tools"
                  className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-8 text-[13px] text-foreground
                             placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
            )}
          </div>
        </div>

        {visibleGroups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-[14px] font-semibold text-foreground">No tool here matches “{query}”.</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              <button type="button" onClick={() => { setQuery(''); setGroup('all'); }} className="font-semibold text-primary hover:underline">
                Show all {noun}
              </button>
              {' '}or search every category from the top of the page.
            </p>
          </div>
        )}

        {visibleGroups.map((g) => (
          <div key={g.id} className="space-y-3 cv-auto">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-bold text-foreground">
                {g.title}{g.blurb && <span className="font-normal text-muted-foreground"> · {g.blurb}</span>}
              </h3>
              <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{g.visible.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {g.visible.map((tool) => (
                <article
                  key={tool.id}
                  className="group relative flex items-start gap-3 rounded-2xl border border-border bg-card p-4
                             transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card
                             motion-reduce:hover:translate-y-0
                             focus-within:outline focus-within:outline-2 focus-within:outline-primary/60"
                >
                  <ToolIcon tool={tool} />
                  <div className="min-w-0 flex-1">
                    <h4 className="flex items-center gap-1.5 text-[14.5px] font-bold leading-snug text-foreground group-hover:text-primary">
                      <AppLink
                        href={`/tool/${tool.id}`}
                        onNavigate={() => onSelectTool(tool.id)}
                        className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-none"
                      >
                        {tool.name}
                      </AppLink>
                      {tool.isPopular && <Star className="h-3 w-3 shrink-0 fill-current text-warning" aria-label="Popular" />}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{tool.description}</p>
                  </div>
                  {/* Above the stretched link so it stays independently clickable. */}
                  <span className="relative z-10 -mr-1 -mt-1">
                    <FavoriteButton toolId={tool.id} toolName={tool.name} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Next steps that live in other categories ──────────────── */}
      {related.length > 0 && (
        <section aria-labelledby="cat-related" className="space-y-4">
          <div>
            <h2 id="cat-related" className="font-heading text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
              Related tools
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Often used alongside these, from other categories.</p>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {related.map((t) => (
              <li key={t.id}>
                <AppLink
                  href={`/tool/${t.id}`}
                  onNavigate={() => onSelectTool(t.id)}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3
                             transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ToolIcon tool={t} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-foreground group-hover:text-primary">{t.name}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{catOf(t.category)?.name}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </AppLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {intro && (
        <section aria-labelledby="cat-about" className="max-w-3xl space-y-3">
          <h2 id="cat-about" className="font-heading text-[19px] font-extrabold tracking-[-0.02em] text-foreground">
            About these {noun}
          </h2>
          <p className="text-[14px] leading-relaxed text-muted-foreground">{intro}</p>
        </section>
      )}
    </div>
  );
};
