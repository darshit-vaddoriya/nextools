import React, { useMemo, useState } from 'react';
import { ArrowRight, FileText, ShieldCheck, X, Zap } from 'lucide-react';
import { DropZone } from '../ui/DropZone';
import { Button } from '../ui/Button';
import { TOOLS } from '../../config/tools';
import { ALL_CATEGORIES } from '../../config/categories';
import { KIND_TO_CATEGORIES, formatBytes, formatOf } from '../../lib/formats';
import { stageFiles } from '../../lib/fileHandoff';
import { resolveToolIcon } from '../../utils/toolIcons';
import type { ToolCategory } from '../../types';

interface HeroProps {
  onSelectTool: (toolId: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onBrowseAll: () => void;
}

/**
 * The homepage opening.
 *
 * The drop zone is a router, not an uploader: with 120+ tools a universal
 * "choose file" box is only useful if it can answer "what can I do with
 * this?". Dropping a file resolves its format and narrows the page to the
 * tools that accept it, the one orchestrated moment on the page.
 *
 * Below it, category shortcuts give people who aren't holding a file
 * somewhere concrete to go, so the hero is never a dead end.
 */
export const Hero: React.FC<HeroProps> = ({ onSelectTool, onSelectCategory, onBrowseAll }) => {
  const [dropped, setDropped] = useState<File | null>(null);

  const meta = dropped ? formatOf(dropped.name) : null;

  const available = useMemo(() => TOOLS.filter((t) => !t.isComingSoon), []);

  /** Only categories that actually have working tools. */
  const shortcuts = useMemo(
    () => ALL_CATEGORIES
      .map((c) => ({ ...c, count: available.filter((t) => t.category === c.id).length }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    [available],
  );

  const matches = useMemo(() => {
    if (!meta) return [];
    const categories = KIND_TO_CATEGORIES[meta.kind];
    return available
      .filter((t) => categories.includes(t.category))
      .sort((a, b) => Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular)))
      .slice(0, 8);
  }, [meta, available]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-12 sm:pt-16">
      <div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-5">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          File conversion and developer tools, all in your browser.
        </h1>
        <p className="max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
          {available.length} free tools for PDF, image and document conversion, code formatting,
          calculators and more. Nothing is uploaded, ever.
        </p>
      </div>

      <div className="mx-auto mt-9 max-w-2xl">
        {!dropped ? (
          <>
            <DropZone
              size="hero"
              onFiles={(files) => setDropped(files[0] ?? null)}
              label="Choose a file"
              hint="or drop it here, any format"
            />

            {/* Two claims that actually differ: speed, and privacy. */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-success" aria-hidden="true" />
                Files never leave your device
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0 text-warning" aria-hidden="true" />
                No account, no watermarks
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-border bg-card p-5 sm:p-6 shadow-raised">
            {/* What we found */}
            <div className="flex items-center gap-3">
              {meta && (
                <span className={`grid place-items-center w-12 h-12 shrink-0 rounded-[var(--radius-md)] ${meta.tint}`}>
                  <meta.icon className="w-6 h-6" aria-hidden="true" />
                </span>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="truncate text-sm font-bold text-foreground" title={dropped.name}>
                  {dropped.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {meta?.label} <span className="font-mono">{formatBytes(dropped.size)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDropped(null)}
                aria-label="Clear selected file"
                className="grid place-items-center w-9 h-9 shrink-0 rounded-[var(--radius-sm)] text-muted-foreground
                           hover:bg-surface-container hover:text-foreground transition-colors duration-[var(--motion-fast)]
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <hr className="my-5 border-border" />

            {matches.length > 0 ? (
              <>
                <h2 className="mb-3 text-left text-sm font-bold text-foreground">
                  {matches.length} {matches.length === 1 ? 'tool works' : 'tools work'} with {meta?.label} files
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2" role="list">
                  {matches.map((tool) => {
                    const Icon = resolveToolIcon(tool.icon, FileText);
                    const category = ALL_CATEGORIES.find((c) => c.id === tool.category);
                    return (
                      <li key={tool.id}>
                        <button
                          type="button"
                          onClick={() => {
                            // Hand the file over so the tool opens with it
                            // already queued, instead of asking again.
                            if (dropped) stageFiles(tool.id, [dropped]);
                            onSelectTool(tool.id);
                          }}
                          className="group w-full flex items-center gap-3 rounded-[var(--radius-md)] border border-border
                                     bg-card p-3 text-left transition-colors duration-[var(--motion-fast)]
                                     hover:border-primary/50 hover:bg-primary/[0.04]
                                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className={`grid place-items-center w-9 h-9 shrink-0 rounded-[var(--radius-sm)]
                                            ${category?.iconBg ?? 'bg-muted'} ${category?.iconColor ?? 'text-muted-foreground'}`}>
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </span>
                          <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                            {tool.name}
                          </span>
                          <ArrowRight
                            className="w-4 h-4 shrink-0 text-muted-foreground opacity-0 -translate-x-1
                                       group-hover:opacity-100 group-hover:translate-x-0
                                       transition-all duration-[var(--motion-fast)] motion-reduce:transition-none"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm font-semibold text-foreground">
                  No tool handles {meta?.label} files yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse the full library to find something close.
                </p>
                <Button variant="secondary" className="mt-4" onClick={onBrowseAll}>
                  Browse all tools
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Category shortcuts ──────────────────────────────────────
          A path forward for anyone who doesn't have a file to hand. */}
      {!dropped && (
        <nav aria-label="Tool categories" className="mx-auto mt-12 max-w-[1100px]">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" role="list">
            {shortcuts.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className="group w-full flex flex-col items-center gap-2.5 rounded-[var(--radius-lg)]
                             border border-border bg-card px-3 py-5
                             transition-all duration-[var(--motion-fast)]
                             hover:border-primary/50 hover:shadow-raised hover:-translate-y-0.5
                             motion-reduce:hover:translate-y-0
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                             focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className={`grid place-items-center w-12 h-12 rounded-[var(--radius-md)]
                                    ${category.iconBg} ${category.iconColor}
                                    transition-transform duration-[var(--motion-fast)]
                                    group-hover:scale-105 motion-reduce:group-hover:scale-100`}>
                    <category.icon className="w-6 h-6" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold text-foreground text-center leading-tight">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{category.count} tools</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
};
