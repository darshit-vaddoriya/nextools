import React from 'react';
import { ChevronRight, Star, CheckCircle2, Sparkles, Construction } from 'lucide-react';
import { Tool } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { AppLink } from './AppLink';
import { resolveToolIcon } from '../utils/toolIcons';

interface ToolCardProps {
  tool: Tool;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  categoryLabel?: string;
  onSelect: (id: string) => void;
  showPopularBadge?: boolean;
  showLocalBadge?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool, icon: fallbackIcon, iconColor = 'text-muted-foreground', iconBg = 'bg-muted',
  categoryLabel, onSelect, showPopularBadge = false, showLocalBadge = false,
  style, className = '',
}) => {
  const Icon = resolveToolIcon(tool.icon, fallbackIcon);

  return (
    <article
      style={style}
      className={`group relative flex flex-col p-5 rounded-2xl border text-left cursor-pointer
        transition-all duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-primary/60
        hover:-translate-y-1 hover:shadow-card
        ${tool.isComingSoon
          ? 'border-warning/25 bg-warning/[0.03] hover:border-warning/50'
          : 'border-border bg-card hover:border-primary/40'}
        ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} transition-transform duration-200 group-hover:scale-105`}>
          <Icon style={{ width: 18, height: 18 }} className={`${iconColor} transition-colors duration-150`} />
        </div>
        <div className="flex items-center gap-1">
          {categoryLabel && (
            <span className="code-font text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/80 mr-0.5">
              {categoryLabel}
            </span>
          )}
          {tool.isComingSoon && (
            <span className="inline-flex items-center gap-0.5 px-1.5 h-6 rounded-md text-[9.5px] font-bold uppercase tracking-wide bg-warning/15 text-warning border border-warning/30" title="Coming soon">
              <Construction className="w-2.5 h-2.5" /> Soon
            </span>
          )}
          {!tool.isComingSoon && tool.isNew && (
            <span className="inline-flex items-center gap-0.5 px-1.5 h-6 rounded-md text-[9.5px] font-semibold uppercase tracking-wide bg-tertiary/10 text-tertiary" title="New">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
          {showPopularBadge && (
            <span className="w-7 h-7 inline-flex items-center justify-center rounded-lg" title="Popular">
              <Star className="w-3.5 h-3.5 text-warning fill-current" />
            </span>
          )}
          {/* Sits above the stretched link so it stays independently clickable. */}
          <span className="relative z-10">
            <FavoriteButton toolId={tool.id} toolName={tool.name} />
          </span>
        </div>
      </div>
      <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1.5 tracking-[-0.01em] group-hover:text-primary transition-colors">
        {/*
          The card's clickable surface is this anchor, stretched over the whole
          article via ::after. That keeps one real crawlable <a href> per tool, with the tool name as anchor text, instead of a click handler that
          search engines cannot follow.
        */}
        <AppLink
          href={`/tool/${tool.id}`}
          onNavigate={() => onSelect(tool.id)}
          className="after:absolute after:inset-0 after:content-[''] after:rounded-2xl focus:outline-none"
        >
          {tool.name}
        </AppLink>
      </h3>
      <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
        {tool.description}
      </p>
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-1.5 text-[11px]">
        {showLocalBadge && (
          <span className="flex items-center gap-1 text-success text-[10px] font-medium">
            <CheckCircle2 className="w-3 h-3" /> local
          </span>
        )}
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ml-auto group-hover:gap-1.5 transition-all ${tool.isComingSoon ? 'text-warning' : 'text-primary'}`}>
          {tool.isComingSoon ? 'Preview' : 'Open'} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" />
        </span>
      </div>
    </article>
  );
};
