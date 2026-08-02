import React from 'react';
import { ToolCategory } from '../types';
import { TOOLS } from '../config/tools';
import {
  FileText, FileSpreadsheet, Image, Video, Music, Archive, Type,
  Code, Shield, Palette, Calculator, Globe, Sparkles, Layers,
  ChevronRight, FileCode, ChevronDown, Zap
} from 'lucide-react';

interface SidebarProps {
  activeCategory: ToolCategory | 'all';
  activeToolId: string;
  onSelectCategory: (category: ToolCategory | 'all') => void;
  onSelectTool: (toolId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const CATEGORIES: {
  id: ToolCategory | 'all';
  name: string;
  icon: React.ElementType;
  color: string;
  activeBg: string;
  activeText: string;
}[] = [
  { id: 'all',      name: 'All Tools',      icon: Layers,          color: 'text-indigo-400',  activeBg: 'dark:bg-indigo-500/10 bg-indigo-50',   activeText: 'dark:text-indigo-300 text-indigo-700' },
  { id: 'pdf',      name: 'PDF Tools',      icon: FileText,        color: 'text-red-400',     activeBg: 'dark:bg-red-500/10 bg-red-50',         activeText: 'dark:text-red-300 text-red-700' },
  { id: 'word',      name: 'Word & Office',  icon: FileCode,        color: 'text-blue-400',    activeBg: 'dark:bg-blue-500/10 bg-blue-50',       activeText: 'dark:text-blue-300 text-blue-700' },
  { id: 'excel',    name: 'Excel & CSV',    icon: FileSpreadsheet, color: 'text-emerald-400', activeBg: 'dark:bg-emerald-500/10 bg-emerald-50', activeText: 'dark:text-emerald-300 text-emerald-700' },
  { id: 'powerpoint', name: 'PowerPoint',   icon: FileCode,        color: 'text-orange-400',  activeBg: 'dark:bg-orange-500/10 bg-orange-50',   activeText: 'dark:text-orange-300 text-orange-700' },
  { id: 'image',    name: 'Image Tools',    icon: Image,           color: 'text-pink-400',    activeBg: 'dark:bg-pink-500/10 bg-pink-50',       activeText: 'dark:text-pink-300 text-pink-700' },
  { id: 'video',    name: 'Video Tools',    icon: Video,           color: 'text-orange-400',  activeBg: 'dark:bg-orange-500/10 bg-orange-50',   activeText: 'dark:text-orange-300 text-orange-700' },
  { id: 'audio',    name: 'Audio Tools',    icon: Music,           color: 'text-violet-400',  activeBg: 'dark:bg-violet-500/10 bg-violet-50',   activeText: 'dark:text-violet-300 text-violet-700' },
  { id: 'archive',  name: 'Archive Tools',  icon: Archive,         color: 'text-amber-400',   activeBg: 'dark:bg-amber-500/10 bg-amber-50',     activeText: 'dark:text-amber-300 text-amber-700' },
  { id: 'text',     name: 'Text Utilities', icon: Type,            color: 'text-teal-400',    activeBg: 'dark:bg-teal-500/10 bg-teal-50',       activeText: 'dark:text-teal-300 text-teal-700' },
  { id: 'dev',      name: 'Developer',      icon: Code,            color: 'text-cyan-400',    activeBg: 'dark:bg-cyan-500/10 bg-cyan-50',       activeText: 'dark:text-cyan-300 text-cyan-700' },
  { id: 'security', name: 'Security',       icon: Shield,          color: 'text-emerald-400', activeBg: 'dark:bg-emerald-500/10 bg-emerald-50', activeText: 'dark:text-emerald-300 text-emerald-700' },
  { id: 'color',    name: 'Color & CSS',    icon: Palette,         color: 'text-fuchsia-400', activeBg: 'dark:bg-fuchsia-500/10 bg-fuchsia-50', activeText: 'dark:text-fuchsia-300 text-fuchsia-700' },
  { id: 'utility',  name: 'Calculators',    icon: Calculator,      color: 'text-sky-400',     activeBg: 'dark:bg-sky-500/10 bg-sky-50',         activeText: 'dark:text-sky-300 text-sky-700' },
  { id: 'web',      name: 'Web Tools',      icon: Globe,           color: 'text-indigo-400',  activeBg: 'dark:bg-indigo-500/10 bg-indigo-50',   activeText: 'dark:text-indigo-300 text-indigo-700' },
  { id: 'ai',       name: 'AI Browser',     icon: Sparkles,        color: 'text-purple-400',  activeBg: 'dark:bg-purple-500/10 bg-purple-50',   activeText: 'dark:text-purple-300 text-purple-700' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory, activeToolId, onSelectCategory, onSelectTool, isMobileOpen, onCloseMobile
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Category list */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        <p className="px-2.5 pt-1 pb-2.5 section-label">
          Tool Categories
        </p>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === 'all'
            ? TOOLS.length
            : TOOLS.filter(t => t.category === cat.id).length;
          const isActive = activeCategory === cat.id;
          const subTools = cat.id !== 'all' ? TOOLS.filter(t => t.category === cat.id) : [];

          return (
            <div key={cat.id}>
              <button
                onClick={() => {
                  onSelectCategory(cat.id);
                  if (window.innerWidth < 1024) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[13px] transition-all duration-200 group ${
                  isActive
                    ? `${cat.activeBg} ${cat.activeText} font-semibold`
                    : 'dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-dark-card/70 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-current/10'
                      : 'dark:bg-dark-card/50 bg-slate-100 group-hover:bg-slate-200 dark:group-hover:bg-dark-hover'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? cat.color : 'dark:text-zinc-500 text-slate-400 group-hover:' + cat.color.replace('400', '500')}`} />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md transition-colors ${
                    isActive
                      ? 'dark:bg-dark-bg/60 dark:text-zinc-400 bg-white/60 text-slate-600'
                      : 'dark:text-zinc-600 text-slate-400'
                  }`}>
                    {count}
                  </span>
                  {isActive && cat.id !== 'all' && (
                    <ChevronDown className="w-3 h-3 dark:text-zinc-500 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Sub-tools */}
              {isActive && cat.id !== 'all' && subTools.length > 0 && (
                <div className="mt-1 mb-2 ml-6 pl-3 border-l-2 dark:border-dark-border border-slate-200 space-y-0.5 animate-fade-in">
                  {subTools.map(tool => {
                    const isToolActive = activeToolId === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          onSelectTool(tool.id);
                          if (window.innerWidth < 1024) onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 text-[12px] rounded-lg transition-all duration-150 ${
                          isToolActive
                            ? 'dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/20 bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold shadow-sm'
                            : 'dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-dark-card/50 text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 font-medium border border-transparent'
                        }`}
                      >
                        <span className="truncate">{tool.name}</span>
                        {isToolActive && (
                          <ChevronRight className="w-3 h-3 shrink-0 dark:text-indigo-400 text-indigo-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom widget */}
      <div className="p-2.5 border-t dark:border-dark-border border-slate-200">
        <div className="relative overflow-hidden rounded-xl p-3 border
          dark:bg-gradient-to-br dark:from-indigo-950/50 dark:to-purple-950/40 dark:border-indigo-900/30
          bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          {/* Shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-xl" />
          <div className="relative flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold dark:text-indigo-300 text-indigo-700 leading-tight">NexTools Engine</p>
              <p className="text-[9.5px] dark:text-zinc-500 text-slate-500 mt-0.5 leading-tight">No login needed · always free</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[256px] shrink-0 border-r dark:bg-dark-bg dark:border-dark-border bg-slate-50/70 border-slate-200 flex-col transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="lg:hidden fixed left-0 top-14 bottom-0 z-50 w-[272px] dark:bg-dark-bg bg-white border-r dark:border-dark-border border-slate-200 shadow-2xl overflow-y-auto animate-slide-in">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};
