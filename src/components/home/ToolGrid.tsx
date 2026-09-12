import React, { useDeferredValue, useMemo, useState } from 'react';
import { FileText, LayoutGrid, Search, SearchX, X } from 'lucide-react';
import { TOOLS } from '../../config/tools';
import { ALL_CATEGORIES } from '../../config/categories';
import { resolveToolIcon } from '../../utils/toolIcons';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import type { Tool, ToolCategory } from '../../types';

interface ToolGridProps {
  onSelectTool: (toolId: string) => void;
}

type Filter = ToolCategory | 'all';

/** Match against name, description and keywords so "shrink" finds "Compress". */
function matchesQuery(tool: Tool, query: string): boolean {
  const q = query.toLowerCase();
  return (
    tool.name.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.keywords.some((k) => k.includes(q))
  );
}

/**
 * Each tool keeps its category's colour so the grid is scannable by hue, * PDF red, Excel green, image pink. The palette is defined once in
 * `categories.ts`; nothing here hardcodes a colour.
 */
const ToolTile: React.FC<{ tool: Tool; onSelect: (id: string) => void }> = ({ tool, onSelect }) => {
  const Icon = resolveToolIcon(tool.icon, FileText);
  const category = ALL_CATEGORIES.find((c) => c.id === tool.category);

  return (
    <button
      type="button"
      onClick={() => onSelect(tool.id)}
      className="group flex flex-col items-start gap-3 h-full rounded-[var(--radius-md)] border border-border
                 bg-card p-4 text-left transition-all duration-[var(--motion-fast)]
                 hover:border-primary/50 hover:shadow-raised hover:-translate-y-0.5
                 motion-reduce:hover:translate-y-0
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                 focus-visible:ring-offset-background"
    >
      <span
        className={[
          'grid place-items-center w-11 h-11 shrink-0 rounded-[var(--radius-md)]',
          'transition-transform duration-[var(--motion-fast)] group-hover:scale-105',
          'motion-reduce:group-hover:scale-100',
          category?.iconBg ?? 'bg-muted',
          category?.iconColor ?? 'text-muted-foreground',
        ].join(' ')}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-bold text-foreground">{tool.name}</span>
        <span className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {tool.description}
        </span>
      </span>
    </button>
  );
};

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // Keeps typing responsive while 120+ tiles re-filter.
  const deferredQuery = useDeferredValue(query);

  const available = useMemo(() => TOOLS.filter((t) => !t.isComingSoon), []);

  /** Only show categories that actually have tools, no empty sections. */
  const categories = useMemo(
    () => ALL_CATEGORIES.filter((c) => available.some((t) => t.category === c.id)),
    [available],
  );

  const visible = useMemo(() => {
    const q = deferredQuery.trim();
    return available.filter(
      (t) => (filter === 'all' || t.category === filter) && (!q || matchesQuery(t, q)),
    );
  }, [available, filter, deferredQuery]);

  /** Grouped for browsing; flat when searching, since relevance beats grouping. */
  const grouped = useMemo(() => {
    if (deferredQuery.trim()) return null;
    return categories
      .map((c) => ({ category: c, tools: visible.filter((t) => t.category === c.id) }))
      .filter((g) => g.tools.length > 0);
  }, [categories, visible, deferredQuery]);

  const isSearching = Boolean(deferredQuery.trim());

  return (
    <section id="tools" className="px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          All tools
        </h2>
        <p className="mt-1.5 text-base text-muted-foreground">
          {available.length} tools, grouped by what they work on.
        </p>

        {/* ── Search ── */}
        <div className="relative mt-6">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, try &ldquo;compress&rdquo; or &ldquo;merge&rdquo;"
            aria-label="Search tools"
            className="h-13 w-full rounded-[var(--radius-md)] border border-border bg-card
                       pl-12 pr-11 text-base text-foreground placeholder:text-muted-foreground
                       transition-colors duration-[var(--motion-fast)]
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/30
                       [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8
                         rounded-[var(--radius-sm)] text-muted-foreground hover:bg-surface-container
                         hover:text-foreground transition-colors duration-[var(--motion-fast)]
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ── Category filter ── */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
          {([{ id: 'all' as Filter, name: 'All', icon: LayoutGrid, iconColor: 'text-primary' }, ...categories]).map((c) => {
            const isActive = filter === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id as Filter)}
                aria-pressed={isActive}
                className={[
                  'inline-flex items-center gap-1.5 shrink-0 h-9 pl-2.5 pr-3.5 rounded-full',
                  'text-sm font-semibold whitespace-nowrap border',
                  'transition-colors duration-[var(--motion-fast)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-outline-variant',
                ].join(' ')}
              >
                {Icon && (
                  // Inside the filled pill the icon inherits the button colour;
                  // outside it keeps the category's own hue.
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? '' : c.iconColor ?? ''}`}
                    aria-hidden="true"
                  />
                )}
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Result count for screen readers as the list narrows. */}
        <p className="sr-only" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'tool' : 'tools'} shown
        </p>

        {/* ── Results ── */}
        {visible.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={SearchX}
            title={`Nothing matches “${deferredQuery.trim()}”`}
            description="Try a shorter word, or the format you want: “pdf”, “png”, “zip”."
            action={
              <Button variant="secondary" onClick={() => { setQuery(''); setFilter('all'); }}>
                Clear search
              </Button>
            }
          />
        ) : isSearching ? (
          <ul className="mt-8 grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
            {visible.map((tool) => (
              <li key={tool.id}><ToolTile tool={tool} onSelect={onSelectTool} /></li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col gap-12">
            {grouped?.map(({ category, tools }) => (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid place-items-center w-10 h-10 shrink-0 rounded-[var(--radius-md)]
                                    ${category.iconBg} ${category.iconColor}`}>
                    <category.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 id={`cat-${category.id}`} className="flex items-baseline gap-2 text-lg font-bold text-foreground">
                      {category.name}
                      <span className="text-sm font-medium text-muted-foreground">{tools.length}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.desc}</p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
                  {tools.map((tool) => (
                    <li key={tool.id}><ToolTile tool={tool} onSelect={onSelectTool} /></li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
