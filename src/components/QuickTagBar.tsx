import React from 'react';
import { TOOLS } from '../config/tools';
import { Flame, TrendingUp } from 'lucide-react';

interface QuickTagBarProps {
  onSelectTool: (toolId: string) => void;
  activeToolId: string;
}

export const QuickTagBar: React.FC<QuickTagBarProps> = ({ onSelectTool, activeToolId }) => {
  const popularTools = TOOLS.filter((t) => t.isPopular);

  return (
    <div className="w-full border-b dark:border-dark-border border-slate-200 dark:bg-dark-surface/60 bg-white/80 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {/* Label */}
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Popular</span>
          </div>
        </div>

        <div className="h-4 w-px dark:bg-dark-border bg-slate-200 shrink-0" />

        {/* Tool chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {popularTools.map((tool) => {
            const isActive = activeToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-all duration-200 shrink-0 whitespace-nowrap border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.03]'
                    : 'dark:bg-dark-card dark:border-dark-border dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white dark:hover:bg-dark-hover bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
