import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, Clock, Star, Flame, LayoutGrid, CheckCircle2, WifiOff } from 'lucide-react';
import { TOOLS } from '../../config/tools';
import { ALL_CATEGORIES } from '../../config/categories';
import { useFavorites } from '../../utils/favorites';
import { resolveToolIcon } from '../../utils/toolIcons';
import { useOfflineStatus, useOnline } from '../../lib/pwa';
import { AppLink } from '../AppLink';
import { Hero } from '../home/Hero';
import type { Tool, ToolCategory } from '../../types';

interface AppHomeProps {
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onOpenSearch: () => void;
}

const catOf = (cat: ToolCategory) => ALL_CATEGORIES.find(c => c.id === cat);

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** App-launcher tile: coloured icon over a two-line name. */
const ToolTile: React.FC<{ tool: Tool; onSelect: (id: string) => void }> = ({ tool, onSelect }) => {
  const conf = catOf(tool.category);
  const Icon = resolveToolIcon(tool.icon, conf?.icon ?? LayoutGrid);
  return (
    <AppLink
      href={`/tool/${tool.id}`}
      onNavigate={() => onSelect(tool.id)}
      className="flex flex-col items-center gap-1.5 p-1 rounded-2xl text-center active:scale-95 transition-transform"
    >
      <span className={`w-14 h-14 rounded-[18px] flex items-center justify-center ${conf?.iconBg}`}>
        <Icon className={`w-6 h-6 ${conf?.iconColor}`} />
      </span>
      <span className="text-[11.5px] font-semibold leading-tight text-foreground line-clamp-2">{tool.name}</span>
    </AppLink>
  );
};

/** One row in a list card, like a native settings list. */
const ToolRow: React.FC<{ tool: Tool; onSelect: (id: string) => void; trailing?: React.ReactNode }> = ({ tool, onSelect, trailing }) => {
  const conf = catOf(tool.category);
  const Icon = resolveToolIcon(tool.icon, conf?.icon ?? LayoutGrid);
  return (
    <AppLink
      href={`/tool/${tool.id}`}
      onNavigate={() => onSelect(tool.id)}
      className="flex items-center gap-3 px-3.5 py-3 active:bg-surface-container transition-colors"
    >
      <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${conf?.iconBg}`}>
        <Icon className={`w-5 h-5 ${conf?.iconColor}`} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-semibold text-foreground truncate">{tool.name}</span>
        <span className="block text-[12px] text-muted-foreground truncate">{tool.description}</span>
      </span>
      {trailing ?? <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
    </AppLink>
  );
};

const SectionTitle: React.FC<{ icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode }> = ({ icon: I, children, action }) => (
  <div className="flex items-center justify-between px-1 mb-2.5">
    <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-foreground">
      <I className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
      {children}
    </h2>
    {action}
  </div>
);

/**
 * Home screen of the installed app. The website home is a landing page (hero,
 * explainer sections, FAQ) written for search visitors; someone who installed
 * the app already knows what it is, so this is a launcher: search, open a
 * file, jump back into recent and favourite tools, browse by category.
 */
export const AppHome: React.FC<AppHomeProps> = ({ onSelectTool, onSelectCategory, onOpenSearch }) => {
  const { favorites } = useFavorites();
  const offline = useOfflineStatus();
  const online = useOnline();
  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffect(() => {
    try { setRecentIds(JSON.parse(localStorage.getItem('nexttool-recent') || '[]')); } catch { /* ignore */ }
  }, []);

  const byId = useMemo(() => new Map(TOOLS.map(t => [t.id, t])), []);
  const pick = (ids: string[]) => ids.map(id => byId.get(id)).filter((t): t is Tool => !!t && !t.isComingSoon);
  const recent = pick(recentIds).slice(0, 4);
  const favs = pick(favorites).slice(0, 8);
  const popular = useMemo(() => TOOLS.filter(t => t.isPopular && !t.isComingSoon).slice(0, 8), []);
  const categories = useMemo(() => ALL_CATEGORIES
    .map(c => ({ ...c, count: TOOLS.filter(t => t.category === c.id && !t.isComingSoon).length }))
    .filter(c => c.count > 0), []);
  const total = useMemo(() => TOOLS.filter(t => !t.isComingSoon).length, []);

  return (
    <div className="px-4 pt-3 pb-6 space-y-7 fade-in">
      {/* Greeting + search */}
      <section>
        <p className="text-[13px] font-medium text-muted-foreground">{greeting()}</p>
        <h1 className="text-[24px] leading-tight font-extrabold tracking-[-0.02em] text-foreground mt-0.5">
          What do you need to do?
        </h1>
        <button
          type="button"
          onClick={onOpenSearch}
          className="mt-3.5 w-full flex items-center gap-3 h-12 px-4 rounded-2xl bg-card border border-border
            text-muted-foreground text-[14.5px] shadow-card active:scale-[0.99] transition-transform"
        >
          <Search className="w-[18px] h-[18px] text-primary" />
          Search {total} tools
        </button>
        <p className="mt-2.5 flex items-center gap-1.5 px-1 text-[12px] text-muted-foreground">
          {!online
            ? <><WifiOff className="w-3.5 h-3.5" /> Offline{offline.complete ? ', every tool still works' : ', opened tools still work'}</>
            : offline.complete
              ? <><CheckCircle2 className="w-3.5 h-3.5 text-success" /> All tools available offline</>
              : <><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Files never leave your phone</>}
        </p>
      </section>

      {/* Open a file → suggested tools (same router as the website hero) */}
      <section>
        <Hero variant="app" onSelectTool={onSelectTool} onSelectCategory={onSelectCategory} onBrowseAll={() => onSelectCategory('all')} />
      </section>

      {recent.length > 0 && (
        <section>
          <SectionTitle icon={Clock}>Recent</SectionTitle>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {recent.map(t => <ToolRow key={t.id} tool={t} onSelect={onSelectTool} />)}
          </div>
        </section>
      )}

      {favs.length > 0 && (
        <section>
          <SectionTitle icon={Star}>Favourites</SectionTitle>
          <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
            {favs.map(t => <ToolTile key={t.id} tool={t} onSelect={onSelectTool} />)}
          </div>
        </section>
      )}

      <section>
        <SectionTitle icon={Flame}>Popular</SectionTitle>
        <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
          {popular.map(t => <ToolTile key={t.id} tool={t} onSelect={onSelectTool} />)}
        </div>
      </section>

      <section>
        <SectionTitle
          icon={LayoutGrid}
          action={
            <AppLink href="/all-tools" onNavigate={() => onSelectCategory('all')} className="text-[13px] font-semibold text-primary px-1 py-1">
              See all
            </AppLink>
          }
        >
          Categories
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map(c => {
            const Icon = c.icon;
            return (
              <AppLink
                key={c.id}
                href={`/category/${c.id}`}
                onNavigate={() => onSelectCategory(c.id)}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card active:scale-[0.98] transition-transform"
              >
                <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                  <Icon className={`w-5 h-5 ${c.iconColor}`} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-foreground truncate">{c.name}</span>
                  <span className="block text-[11.5px] text-muted-foreground">{c.count} tools</span>
                </span>
              </AppLink>
            );
          })}
        </div>
      </section>
    </div>
  );
};
