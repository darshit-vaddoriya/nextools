import React, { useMemo, useState } from 'react';
import { ToolCategory, Tool } from '../types';
import { TOOLS } from '../config/tools';
import {
  Search, ArrowLeft, ChevronRight, Star, X, Layers, FileText,
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
  const [activeCat, setActiveCat] = useState<'all' | ToolCategory>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter(t => {
      if (activeCat !== 'all' && t.category !== activeCat) return false;
      if (!q) return true;
      const catName = categories.find(c => c.id === t.category)?.name ?? '';
      const hay = `${t.name} ${t.description} ${catName} ${(t.keywords ?? []).join(' ')}`.toLowerCase();
      return q.split(/\s+/).every(word => hay.includes(word));
    });
  }, [query, activeCat, categories]);

  const activeCatName = activeCat === 'all'
    ? 'All tools'
    : categories.find(c => c.id === activeCat)?.name ?? '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* ── Breadcrumb + title ─────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-[12.5px] mb-4">
        <button onClick={onBack} className="text-indigo-500 dark:text-indigo-400 hover:underline font-medium">Home</button>
        <span className="dark:text-zinc-600 text-slate-400">/</span>
        <span className="dark:text-zinc-500 text-slate-500">All Tools</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="cat-icon dark:bg-indigo-500/[0.12] bg-indigo-50">
          <Layers className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-[-0.02em]">All Tools</h1>
          <p className="text-[13px] dark:text-zinc-500 text-slate-500 mt-0.5">
            {filtered.length} of {TOOLS.length} tools · every one runs in your browser
          </p>
        </div>
      </div>

      {/* ── Search + filter bar ────────────────────────────── */}
      <div className="sticky top-[66px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 -mt-1 mb-6
        dark:bg-[#0d0d14]/90 bg-white/90 backdrop-blur-md border-b dark:border-white/[0.06] border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ${TOOLS.length} tools…`}
              className="w-full h-11 pl-10 pr-9 rounded-xl border text-[14px] outline-none
                dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white dark:placeholder-zinc-500
                bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400
                focus:border-indigo-400 dark:focus:border-indigo-500/40 focus:bg-white dark:focus:bg-white/[0.07]
                focus:ring-2 focus:ring-indigo-500/15 transition-all duration-150"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full
                  dark:text-zinc-500 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
          <div className="flex items-center gap-1 text-[12px] dark:text-zinc-500 text-slate-400 shrink-0">
            <span className="hidden sm:inline">Filter by category</span>
            <span className="sm:hidden">Category</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <button
            onClick={() => setActiveCat('all')}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 ${
              activeCat === 'all'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_2px_10px_rgba(99,102,241,0.35)]'
                : 'dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:border-indigo-500/30 dark:hover:text-white bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            All
          </button>
          {categories.filter(cat => TOOLS.some(t => t.category === cat.id)).map(cat => {
            const count = TOOLS.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 ${
                  activeCat === cat.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_2px_10px_rgba(99,102,241,0.35)]'
                    : 'dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:border-indigo-500/30 dark:hover:text-white bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {cat.name}
                <span className={`ml-1 text-[10px] font-mono ${activeCat === cat.id ? 'text-white/70' : 'dark:text-zinc-600 text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto rounded-2xl dark:bg-white/[0.05] bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 dark:text-zinc-600 text-slate-400" />
          </div>
          <h3 className="text-[16px] font-semibold dark:text-white text-slate-900 mb-1">No tools found</h3>
          <p className="text-[13px] dark:text-zinc-500 text-slate-500 max-w-xs mx-auto">
            Try a different keyword{activeCat !== 'all' ? ' or switch category' : ''}.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[12.5px] dark:text-zinc-500 text-slate-500 mb-4">
            Showing <span className="font-semibold dark:text-zinc-300 text-slate-700">{filtered.length}</span> tool{filtered.length === 1 ? '' : 's'}
            {activeCat !== 'all' && <> in <span className="font-semibold dark:text-zinc-300 text-slate-700">{activeCatName}</span></>}
            {query.trim() && <> for “<span className="font-semibold dark:text-zinc-300 text-slate-700">{query.trim()}</span>”</>}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((tool, idx) => {
              const catConf = categories.find(c => c.id === tool.category);
              const Icon = catConf?.icon ?? FileText;
              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="group flex flex-col p-4 rounded-xl border text-left
                    dark:bg-white/[0.03] dark:border-white/[0.07]
                    dark:hover:bg-white/[0.06] dark:hover:border-indigo-500/25
                    bg-white border-slate-200 hover:border-indigo-200
                    transition-all duration-150 fade-up"
                  style={{ animationDelay: `${Math.min(idx, 12) * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`cat-icon ${catConf?.iconBg}`}>
                      <Icon style={{ width: 17, height: 17 }} className={catConf?.iconColor} />
                    </div>
                    {tool.isPopular && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mt-0.5" />}
                  </div>
                  <div className="text-[13px] font-semibold dark:text-zinc-200 text-slate-800 leading-snug mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-[11.5px] dark:text-zinc-600 text-slate-400 leading-relaxed line-clamp-2 flex-1">
                    {tool.description}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px]">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catConf?.iconBg} ${catConf?.iconColor}`}>
                      {catConf?.name ?? tool.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400 ml-auto">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
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
