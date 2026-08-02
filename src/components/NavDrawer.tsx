import React, { useState } from 'react';
import { ToolCategory } from '../types';
import { TOOLS } from '../config/tools';
import {
  FileText, FileSpreadsheet, Image, Video, Music, Archive, Type,
  Code, Shield, Palette, Calculator, Globe, Cpu, Layers,
  FileCode, Presentation, X, Star, ChevronRight
} from 'lucide-react';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  activeToolId: string;
}

const CATS: {
  id: ToolCategory | 'all'; name: string; icon: React.ElementType;
  iconColor: string; iconBg: string;
}[] = [
  { id: 'all',        name: 'All Tools',      icon: Layers,          iconColor: 'text-indigo-500', iconBg: 'dark:bg-indigo-500/15 bg-indigo-100' },
  { id: 'pdf',        name: 'PDF Tools',      icon: FileText,        iconColor: 'text-red-500',    iconBg: 'dark:bg-red-500/15 bg-red-100' },
  { id: 'word',       name: 'Word & Office',  icon: FileCode,        iconColor: 'text-blue-500',   iconBg: 'dark:bg-blue-500/15 bg-blue-100' },
  { id: 'excel',      name: 'Excel & CSV',    icon: FileSpreadsheet, iconColor: 'text-green-500',  iconBg: 'dark:bg-green-500/15 bg-green-100' },
  { id: 'powerpoint', name: 'PowerPoint',     icon: Presentation,    iconColor: 'text-orange-500', iconBg: 'dark:bg-orange-500/15 bg-orange-100' },
  { id: 'image',      name: 'Image Tools',    icon: Image,           iconColor: 'text-pink-500',   iconBg: 'dark:bg-pink-500/15 bg-pink-100' },
  { id: 'video',      name: 'Video Tools',    icon: Video,           iconColor: 'text-violet-500', iconBg: 'dark:bg-violet-500/15 bg-violet-100' },
  { id: 'audio',      name: 'Audio Tools',    icon: Music,           iconColor: 'text-cyan-500',   iconBg: 'dark:bg-cyan-500/15 bg-cyan-100' },
  { id: 'archive',    name: 'Archive',        icon: Archive,         iconColor: 'text-amber-500',  iconBg: 'dark:bg-amber-500/15 bg-amber-100' },
  { id: 'text',       name: 'Text Utilities', icon: Type,            iconColor: 'text-teal-500',   iconBg: 'dark:bg-teal-500/15 bg-teal-100' },
  { id: 'dev',        name: 'Developer',      icon: Code,            iconColor: 'text-slate-400',  iconBg: 'dark:bg-slate-500/15 bg-slate-100' },
  { id: 'security',   name: 'Security',       icon: Shield,          iconColor: 'text-emerald-500',iconBg: 'dark:bg-emerald-500/15 bg-emerald-100' },
  { id: 'color',      name: 'Color & CSS',    icon: Palette,         iconColor: 'text-fuchsia-500',iconBg: 'dark:bg-fuchsia-500/15 bg-fuchsia-100' },
  { id: 'utility',    name: 'Calculators',    icon: Calculator,      iconColor: 'text-sky-500',    iconBg: 'dark:bg-sky-500/15 bg-sky-100' },
  { id: 'web',        name: 'Web Tools',      icon: Globe,           iconColor: 'text-indigo-400', iconBg: 'dark:bg-indigo-500/15 bg-indigo-100' },
  { id: 'ai',         name: 'AI Browser',     icon: Cpu,             iconColor: 'text-purple-500', iconBg: 'dark:bg-purple-500/15 bg-purple-100' },
];

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen, onClose, onSelectTool, onSelectCategory, activeToolId
}) => {
  const [activeCat, setActiveCat] = useState<ToolCategory | 'all'>('pdf');

  if (!isOpen) return null;

  const catTools = activeCat === 'all' ? TOOLS : TOOLS.filter(t => t.category === activeCat);
  const activeCatConf = CATS.find(c => c.id === activeCat);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel — drops down from header */}
      <div className="fixed top-[60px] left-0 right-0 z-50 slide-down px-5 sm:px-8 pb-6 max-w-6xl mx-auto left-1/2 -translate-x-1/2 w-full">
        <div className="dark:bg-[#111116] bg-white rounded-xl border dark:border-white/[0.07] border-slate-200 shadow-2xl dark:shadow-black/50 overflow-hidden">
          <div className="flex" style={{ height: '480px' }}>

            {/* Left — Category sidebar */}
            <div className="w-48 shrink-0 border-r dark:border-white/[0.07] border-slate-100 dark:bg-black/20 bg-slate-50 overflow-y-auto py-2 px-2">
              {CATS.map(cat => {
                const Icon = cat.icon;
                const count = cat.id === 'all' ? TOOLS.length : TOOLS.filter(t => t.category === cat.id).length;
                const isActive = activeCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] mb-0.5 transition-colors duration-100 text-left ${
                      isActive
                        ? 'dark:bg-white/[0.07] bg-white dark:text-white text-slate-900 font-semibold shadow-sm border dark:border-white/[0.06] border-slate-200'
                        : 'dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.04] text-slate-500 hover:text-slate-800 hover:bg-white/60 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isActive ? cat.iconBg : 'dark:bg-white/[0.04] bg-slate-100'}`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? cat.iconColor : 'dark:text-zinc-600 text-slate-400'}`} />
                    </div>
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'dark:text-zinc-400 text-slate-500' : 'dark:text-zinc-700 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right — Tools grid */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/[0.07] border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  {activeCatConf && (
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${activeCatConf.iconBg}`}>
                      {React.createElement(activeCatConf.icon, { className: `w-3.5 h-3.5 ${activeCatConf.iconColor}` })}
                    </div>
                  )}
                  <span className="text-[13px] font-semibold dark:text-zinc-300 text-slate-700">
                    {activeCatConf?.name}
                  </span>
                  <span className="text-[11px] dark:text-zinc-600 text-slate-400 font-medium">
                    {catTools.length} tools
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg
                    dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-white/[0.06]
                    text-slate-400 hover:text-slate-600 hover:bg-slate-100
                    transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tool cards */}
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 content-start">
                {catTools.map(tool => {
                  const isActive = activeToolId === tool.id;
                  const catConf = CATS.find(c => c.id === tool.category);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => { onSelectTool(tool.id); onClose(); }}
                      className={`group text-left p-3 rounded-lg border transition-colors duration-100 ${
                        isActive
                          ? 'dark:bg-indigo-500/[0.12] dark:border-indigo-500/25 dark:text-indigo-300 bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.06] dark:hover:border-white/[0.1] bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold dark:text-zinc-200 text-slate-800 leading-tight line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </span>
                        {tool.isPopular && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[10.5px] dark:text-zinc-600 text-slate-400 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="px-4 py-2.5 border-t dark:border-white/[0.07] border-slate-100 dark:bg-black/20 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] dark:text-zinc-600 text-slate-400">
              {TOOLS.length} tools · {CATS.length - 1} categories · 100% free
            </span>
            <button
              onClick={() => { onSelectCategory('all'); onClose(); }}
              className="flex items-center gap-1 text-[12px] font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              Browse all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
