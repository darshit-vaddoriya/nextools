import React from 'react';
import { Search, Sun, Moon, LayoutGrid, ShieldCheck } from 'lucide-react';

export type HeaderView = 'home' | 'tool' | 'category' | 'privacy' | 'all';

interface HeaderProps {
  onOpenSearch: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  onOpenPrivacy: () => void;
  onOpenCategories: () => void;
  onOpenAllTools: () => void;
  currentView: HeaderView;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch, isDarkMode, onToggleTheme,
  onGoHome, onOpenPrivacy, onOpenCategories, onOpenAllTools, currentView
}) => {
  const navLink = (active: boolean) =>
    `relative px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
      active
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/[0.06]'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-white/[0.06]
      bg-white/90 dark:bg-[#09090e]/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80
      dark:supports-[backdrop-filter]:bg-[#09090e]/80">
      {/* Gradient accent line */}
      <div className="h-[2px] bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-4">

        {/* ── LOGO + BRAND NAME ──────────────────────────────── */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 shrink-0 select-none group min-w-0"
          aria-label="NextTool Home"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600
            group-hover:scale-105 transition-transform shadow-[0_2px_12px_rgba(99,102,241,0.4)]">
            <span className="text-white text-[12px] font-extrabold tracking-tight leading-none">
              DK
            </span>
          </div>

          <div className="leading-tight text-left min-w-0">
            <div className="text-[16px] sm:text-[17px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white whitespace-nowrap">
              Next<span className="text-indigo-500">Tool</span>
            </div>
            <div className="hidden sm:block text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400 dark:text-zinc-600 mt-0.5 whitespace-nowrap">
              Free Online Tools
            </div>
          </div>
        </button>

        {/* ── DESKTOP NAV ────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-0.5 mx-auto" aria-label="Main navigation">
          <button onClick={onGoHome} className={navLink(currentView === 'home')}>
            Home
          </button>
          <button onClick={onOpenAllTools} className={navLink(currentView === 'all')}>
            <span className="flex items-center gap-1">
              All Tools
            </span>
          </button>
          <button onClick={onOpenCategories} className={navLink(currentView === 'category')}>
            Categories
          </button>
          <button onClick={onOpenPrivacy} className={navLink(currentView === 'privacy')}>
            Privacy
          </button>
        </nav>

        {/* Spacer on mobile (nav hidden) */}
        <div className="flex-1 lg:hidden" />

        {/* ── RIGHT ACTIONS ──────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Search (desktop) */}
          <button
            onClick={onOpenSearch}
            aria-label="Search tools"
            className="hidden md:flex flex-1 max-w-[220px] items-center justify-between
              h-9 px-3.5 rounded-xl border text-[13px]
              dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-500
              bg-slate-50 border-slate-200 text-slate-400
              dark:hover:bg-white/[0.07] dark:hover:border-white/[0.13]
              hover:bg-white hover:border-slate-300 transition-all duration-150"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Search tools…</span>
            </div>
            <kbd className="hidden xl:block px-1.5 py-0.5 rounded text-[10px] font-mono ml-2 shrink-0
              dark:bg-white/[0.06] dark:border-white/[0.08] dark:text-zinc-600
              bg-white border border-slate-200 text-slate-400">⌘K</kbd>
          </button>

          {/* Private badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium
            dark:bg-emerald-500/[0.1] dark:border dark:border-emerald-500/20 dark:text-emerald-400
            bg-emerald-50 border border-emerald-200 text-emerald-700">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            Private &amp; local
          </div>

          {/* Search — mobile icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border
              dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:bg-white/[0.08]
              bg-white border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            aria-label="Search tools"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 flex items-center justify-center rounded-xl border transition-colors duration-150
              dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400
              dark:hover:bg-white/[0.09] dark:hover:text-zinc-200 dark:hover:border-white/[0.14]
              bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* All Tools — compact toggle (mobile + fallback) */}
          <button
            onClick={onOpenAllTools}
            aria-label="All tools"
            className="flex items-center gap-1.5 sm:gap-2 h-9 px-3 sm:px-4 rounded-xl border text-[13px] font-semibold transition-all duration-150 lg:hidden
              dark:bg-indigo-600/[0.1] dark:border-indigo-500/25 dark:text-indigo-400 dark:hover:bg-indigo-600/[0.18]
              bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden min-[400px]:inline">Tools</span>
          </button>
        </div>
      </div>
    </header>
  );
};
