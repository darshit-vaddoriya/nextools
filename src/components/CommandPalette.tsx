import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, CornerDownLeft, Sparkles, Clock, TrendingUp, SearchX, Command } from 'lucide-react';
import { TOOLS } from '../config/tools';
import { ALL_CATEGORIES } from '../config/categories';
import { Tool } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
}

const RECENT_KEY = 'nexttool-recent-searches';
const POPULAR_SEARCHES = ['PDF Merge', 'Image Compressor', 'QR Code', 'Background Remover', 'JSON Formatter', 'Password Generator'];

const loadRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};

const saveRecent = (query: string) => {
  try {
    const q = query.trim();
    if (!q) return;
    const next = [q, ...loadRecent().filter(r => r !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
};

const catConf = (cat: string) => ALL_CATEGORIES.find(c => c.id === cat);

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter((tool) =>
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.includes(q))
    );
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else { setQuery(''); setRecentSearches(loadRecent()); }
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setRecentSearches(loadRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const handleSelect = (tool: Tool) => {
    saveRecent(tool.name);
    setRecentSearches(loadRecent());
    onSelectTool(tool.id);
    onClose();
  };

  const runSearch = (q: string) => {
    saveRecent(q);
    setRecentSearches(loadRecent());
    setQuery('');
    const t = TOOLS.find(tool => tool.name.toLowerCase() === q.trim().toLowerCase());
    if (t) onSelectTool(t.id);
    onClose();
  };

  const activeTool = results[activeIndex];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeTool) handleSelect(activeTool);
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-card shadow-float overflow-hidden toast-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="w-4 h-4 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, categories…"
            aria-label="Search tools"
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="kbd hidden sm:flex items-center gap-1">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close search">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {!hasQuery ? (
          <div className="max-h-[400px] overflow-y-auto p-3 space-y-5">
            {recentSearches.length > 0 && (
              <section aria-label="Recent searches">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recent
                  </p>
                  <button
                    onClick={() => {
                      try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
                      setRecentSearches([]);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {recentSearches.map(r => (
                    <button
                      key={r}
                      onClick={() => runSearch(r)}
                      className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-muted text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section aria-label="Popular searches">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5 px-2 mb-2">
                <TrendingUp className="w-3 h-3" /> Popular
              </p>
              <div className="flex flex-wrap gap-1.5 px-2">
                {POPULAR_SEARCHES.map(r => (
                  <button
                    key={r}
                    onClick={() => runSearch(r)}
                    className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-muted text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>

            <section aria-label="All tools">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground px-2 mb-2">
                All tools
              </p>
              <div className="space-y-0.5">
                {TOOLS.slice(0, 6).map(tool => {
                  const conf = catConf(tool.category);
                  const Icon = conf?.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(tool)}
                      className="w-full group p-2.5 rounded-lg flex items-center justify-between hover:bg-muted transition-colors text-left"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${conf?.iconBg}`}>
                            <Icon style={{ width: 14, height: 14 }} className={conf?.iconColor} />
                          </span>
                        )}
                        <span className="text-[13px] font-medium text-foreground/90 truncate">{tool.name}</span>
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        ) : results.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-muted flex items-center justify-center mb-3">
              <SearchX className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-medium text-foreground">No tools found</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              No matches for "{query.trim()}". Try a different keyword.
            </p>
          </div>
        ) : (
          <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2" role="listbox" aria-label="Search results">
            {results.map((tool, idx) => {
              const isActive = idx === activeIndex;
              const conf = catConf(tool.category);
              const Icon = conf?.icon;
              return (
                <button
                  key={tool.id}
                  data-index={idx}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(tool)}
                  className={`w-full group p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                    isActive ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  {Icon && (
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${conf?.iconBg}`}>
                      <Icon style={{ width: 16, height: 16 }} className={conf?.iconColor} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {tool.name}
                      </span>
                      {tool.isPopular && <Sparkles className="w-3 h-3 text-warning shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-md ${isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {conf?.name ?? tool.category}
                    </span>
                    <CornerDownLeft className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'} transition-opacity`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="kbd">↑↓</kbd> Navigate</span>
            <span><kbd className="kbd">↵</kbd> Select</span>
            <span><kbd className="kbd">Esc</kbd> Close</span>
          </div>
          {hasQuery && <span>{results.length} tool{results.length === 1 ? '' : 's'}</span>}
        </div>
      </div>
    </div>
  );
};
