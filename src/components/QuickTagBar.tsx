import React from 'react';
import { TOOLS } from '../config/tools';
import { Flame } from 'lucide-react';

interface QuickTagBarProps {
  onSelectTool: (toolId: string) => void;
  activeToolId: string;
}

export const QuickTagBar: React.FC<QuickTagBarProps> = ({ onSelectTool, activeToolId }) => {
  const popularTools = TOOLS.filter((t) => t.isPopular);

  return (
    <div className="w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-3 overflow-x-auto no-scrollbar">
        {/* Label */}
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          <div className="flex items-center gap-1 text-warning">
            <Flame className="w-3.5 h-3.5 fill-warning" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Popular</span>
          </div>
        </div>

        <div className="h-4 w-px bg-border shrink-0" />

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
                    ? 'bg-primary text-primary-foreground border-primary scale-[1.03]'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5'
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
