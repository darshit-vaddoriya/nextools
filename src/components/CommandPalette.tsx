import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, Sparkles } from 'lucide-react';
import { TOOLS } from '../config/tools';
import { Tool } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = TOOLS.filter((tool) => {
    const q = query.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.includes(q))
    );
  });

  const handleSelect = (tool: Tool) => {
    onSelectTool(tool.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 h-14 border-b dark:border-dark-border border-slate-100">
          <Search className="w-4 h-4 dark:text-zinc-500 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PDF tools, JSON, AI, Video, Crypto…"
            className="flex-1 bg-transparent text-[13px] dark:text-white text-slate-900 dark:placeholder-zinc-500 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg dark:text-zinc-500 dark:hover:text-white text-slate-400 hover:text-slate-700 dark:hover:bg-dark-hover hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm dark:text-zinc-500 text-slate-400">No tools found for "{query}"</p>
            </div>
          ) : (
            filtered.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleSelect(tool)}
                className="w-full group p-3 rounded-xl flex items-center justify-between dark:hover:bg-dark-hover hover:bg-slate-50 transition-colors text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold dark:text-zinc-200 text-slate-800 group-hover:text-indigo-500 transition-colors truncate">
                      {tool.name}
                    </span>
                    {tool.isPopular && <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] dark:text-zinc-500 text-slate-500 mt-0.5 truncate">{tool.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md dark:bg-dark-bg dark:text-zinc-600 bg-slate-100 text-slate-400">{tool.category}</span>
                  <CornerDownLeft className="w-3.5 h-3.5 dark:text-zinc-600 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t dark:border-dark-border dark:bg-dark-bg/50 border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] dark:text-zinc-600 text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded border dark:border-dark-border border-slate-200 font-mono text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded border dark:border-dark-border border-slate-200 font-mono text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded border dark:border-dark-border border-slate-200 font-mono text-[10px]">Esc</kbd> Close</span>
          </div>
          <span>{filtered.length} tools</span>
        </div>
      </div>
    </div>
  );
};
