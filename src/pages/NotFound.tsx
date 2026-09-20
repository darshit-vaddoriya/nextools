import React from 'react';
import { SearchX, Home, LayoutGrid, BookOpen, Mail } from 'lucide-react';
import { AppLink } from '../components/AppLink';
import { TOOLS } from '../config/tools';
import { ALL_CATEGORIES } from '../config/categories';

interface NotFoundProps {
  /** The path that was requested, shown so the visitor can spot a typo. */
  path: string;
  onGoHome: () => void;
  onOpenAllTools: () => void;
  onOpenBlog: () => void;
  onSelectTool: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onOpenContact: () => void;
}

/**
 * Netlify answers every unmatched path with index.html at HTTP 200, so a
 * mistyped or retired URL cannot return a real 404 status. This view is the
 * next best thing: it says plainly that the address does not exist, carries
 * `noindex` (set in updateNotFoundMeta), and offers the routes that do — which
 * is what stops the address being counted as a broken, contentless page.
 */
export const NotFound: React.FC<NotFoundProps> = ({
  path, onGoHome, onOpenAllTools, onOpenBlog, onSelectTool, onSelectCategory, onOpenContact,
}) => {
  const popular = TOOLS.filter(t => t.isPopular && !t.isComingSoon).slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center fade-in">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-6">
        <SearchX className="w-8 h-8 text-muted-foreground" />
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-[-.02em] text-foreground mb-3">
        This page does not exist
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
        Nothing is published at{' '}
        <code className="px-1.5 py-0.5 rounded-md bg-muted border border-border font-mono text-[12px] text-foreground break-all">
          {path}
        </code>
        . The address may have a typo, or it may point at a tool that was never
        built. Everything NextTool actually publishes is one of the links below.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
        <button onClick={onGoHome} className="btn-primary text-xs px-4 py-2.5">
          <Home className="w-4 h-4" /> Home
        </button>
        <button onClick={onOpenAllTools} className="btn-secondary text-xs px-4 py-2.5">
          <LayoutGrid className="w-4 h-4" /> All {TOOLS.filter(t => !t.isComingSoon).length} tools
        </button>
        <button onClick={onOpenBlog} className="btn-secondary text-xs px-4 py-2.5">
          <BookOpen className="w-4 h-4" /> Blog
        </button>
        <AppLink href="/contact" onNavigate={onOpenContact} className="btn-ghost text-xs px-4 py-2.5">
          <Mail className="w-4 h-4" /> Report a broken link
        </AppLink>
      </div>

      <div className="mt-12 text-left">
        <h2 className="section-label mb-3 text-center">Most used tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {popular.map(tool => (
            <AppLink
              key={tool.id}
              href={`/tool/${tool.id}`}
              onNavigate={() => onSelectTool(tool.id)}
              className="rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
            >
              <span className="block text-[13px] font-bold text-foreground">{tool.name}</span>
              <span className="block text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                {tool.description}
              </span>
            </AppLink>
          ))}
        </div>
      </div>

      <div className="mt-10 text-left">
        <h2 className="section-label mb-3 text-center">Browse by category</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {ALL_CATEGORIES.filter(c => TOOLS.some(t => t.category === c.id)).map(cat => (
            <AppLink
              key={cat.id}
              href={`/category/${cat.id}`}
              onNavigate={() => onSelectCategory(cat.id)}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              {cat.name}
            </AppLink>
          ))}
        </div>
      </div>
    </div>
  );
};
