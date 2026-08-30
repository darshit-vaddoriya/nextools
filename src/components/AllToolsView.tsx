import React, { useMemo, useState } from 'react';
import { ToolCategory } from '../types';
import { TOOLS } from '../config/tools';
import { ToolCard } from './ToolCard';
import { useFavorites } from '../utils/favorites';
import {
  Search, ArrowLeft, X, Layers, FileText, Star, CheckCircle2,
} from 'lucide-react';

interface CategoryConf {
  id: ToolCategory;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface AllToolsViewProps {
  onSelectTool: (id: string) => void;
  onBack: () => void;
  categories: CategoryConf[];
}

export const AllToolsView: React.FC<AllToolsViewProps> = ({ onSelectTool, onBack, categories }) => {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<'all' | 'fav' | ToolCategory>('all');
  const { favorites: favIds } = useFavorites();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter(t => {
      if (activeCat === 'fav' && !favIds.includes(t.id)) return false;
      if (activeCat !== 'all' && activeCat !== 'fav' && t.category !== activeCat) return false;
      if (!q) return true;
      const catName = categories.find(c => c.id === t.category)?.name ?? '';
      const hay = `${t.name} ${t.description} ${catName} ${(t.keywords ?? []).join(' ')}`.toLowerCase();
      return q.split(/\s+/).every(word => hay.includes(word));
    });
  }, [query, activeCat, categories, favIds]);

  const activeCatName = activeCat === 'all'
    ? 'All tools'
    : activeCat === 'fav'
      ? 'Favorites'
      : categories.find(c => c.id === activeCat)?.name ?? '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* ── Breadcrumb + title ─────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-[12.5px] mb-4">
        <button onClick={onBack} className="text-primary hover:underline font-medium">Home</button>
        <span className="text-border">/</span>
        <span className="text-muted-foreground/70">All Tools</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 border border-primary/15">
            <Layers className="w-5.5 h-5.5 text-primary" style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-[-0.02em]">All Tools</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {filtered.length} of {TOOLS.length} tools · every one runs in your browser
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full text-[11px] font-medium bg-success/10 border border-success/25 text-success shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          100% local · no uploads
        </div>
      </div>

      {/* ── Search + filter bar ────────────────────────────── */}
      <div className="sticky top-[66px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 -mt-1 mb-6
        bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${TOOLS.length} tools…`}
              className="input-base w-full h-11 pl-10 pr-9 rounded-xl text-[14px]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full
                  text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground/70 shrink-0">
            <span className="hidden sm:inline">Filter by category</span>
            <span className="sm:hidden">Category</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <button
            onClick={() => setActiveCat('all')}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 ${
              activeCat === 'all'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCat('fav')}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 inline-flex items-center gap-1 ${
              activeCat === 'fav'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Star className={`w-3 h-3 ${activeCat === 'fav' ? 'fill-current' : ''}`} />
            Favorites
            <span className={`text-[10px] font-mono ${activeCat === 'fav' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{favIds.length}</span>
          </button>
          {categories.filter(cat => TOOLS.some(t => t.category === cat.id)).map(cat => {
            const count = TOOLS.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 ${
                  activeCat === cat.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.name}
                <span className={`ml-1 text-[10px] font-mono ${activeCat === cat.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            {activeCat === 'fav'
              ? <Star className="w-6 h-6 text-muted-foreground/50" />
              : <Search className="w-6 h-6 text-muted-foreground/50" />}
          </div>
          <h3 className="text-[16px] font-semibold text-foreground mb-1">
            {activeCat === 'fav' ? 'No favorites yet' : 'No tools found'}
          </h3>
          <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">
            {activeCat === 'fav'
              ? 'Tap the star on any tool card to pin it here for quick access.'
              : 'Try a different keyword or switch category.'}
          </p>
          {activeCat === 'fav' && (
            <button
              onClick={() => setActiveCat('all')}
              className="btn-ghost mt-4"
            >
              Browse all tools
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-[12.5px] text-muted-foreground mb-4">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> tool{filtered.length === 1 ? '' : 's'}
            {activeCat !== 'all' && <> in <span className="font-semibold text-foreground">{activeCatName}</span></>}
            {query.trim() && <> for “<span className="font-semibold text-foreground">{query.trim()}</span>”</>}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((tool, idx) => {
              const catConf = categories.find(c => c.id === tool.category);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  icon={catConf?.icon ?? FileText}
                  iconColor={catConf?.iconColor}
                  iconBg={catConf?.iconBg}
                  categoryLabel={catConf?.name}
                  onSelect={onSelectTool}
                  showPopularBadge={tool.isPopular}
                  className="fade-up"
                  style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}
                />
              );
            })}
          </div>
        </>
      )}

      <button onClick={onBack} className="btn-ghost mt-8 text-[13px]">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </button>
    </div>
  );
};
