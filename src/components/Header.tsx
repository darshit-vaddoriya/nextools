import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, Blocks, Heart } from 'lucide-react';
import { NavDrawer } from './NavDrawer';
import { ThemeMenu } from './ThemeMenu';
import { ToolCategory } from '../types';
import { ThemePreference } from '../utils/theme';
import { SUPPORT_URL } from '../config/support';

export type HeaderView = 'home' | 'tool' | 'category' | 'privacy' | 'all';

interface HeaderProps {
  onOpenSearch: () => void;
  theme: ThemePreference;
  resolvedDark: boolean;
  onThemeChange: (t: ThemePreference) => void;
  onGoHome: () => void;
  onOpenPrivacy: () => void;
  onOpenCategories: () => void;
  onOpenAllTools: () => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  currentView: HeaderView;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch, theme, resolvedDark, onThemeChange,
  onGoHome, onOpenPrivacy, onOpenCategories, onOpenAllTools,
  onSelectCategory, currentView
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLink = (active: boolean) =>
    `relative px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
      active
        ? 'text-primary bg-primary/[0.08]'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`;

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-200 ${
      scrolled ? 'shadow-card' : ''
    }`}>
      <div className={`border-b transition-colors duration-200 ${
        scrolled ? 'border-outline-variant' : 'border-outline-variant/70'
      } glass`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center gap-2 sm:gap-4">

          {/* ── LOGO + BRAND NAME ──────────────────────────────── */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 shrink-0 select-none group min-w-0"
            aria-label="NextTool Home"
          >
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              bg-gradient-to-br from-primary to-tertiary text-white shadow-md ring-1 ring-black/5
              transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <Blocks className="w-[18px] h-[18px]" strokeWidth={2.25} />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 via-white/0 to-white/25 pointer-events-none" />
            </div>

            <div className="leading-tight text-left min-w-0">
              <div className="text-[18px] sm:text-[19px] font-extrabold tracking-[-0.02em] whitespace-nowrap font-heading">
                <span className="text-on-surface">Next</span><span className="text-primary">Tool</span>
              </div>
            </div>
          </button>

          {/* ── DESKTOP NAV ────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5 mx-auto" aria-label="Main navigation">
            <button onClick={onGoHome} className={navLink(currentView === 'home')}>
              Home
            </button>
            <button onClick={onOpenAllTools} className={navLink(currentView === 'all')}>
              Tools
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

            {/* Private badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium
              bg-success/10 border border-success/25 text-success">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              Private &amp; local
            </div>

            {/* Theme */}
            <ThemeMenu theme={theme} resolvedDark={resolvedDark} onThemeChange={onThemeChange} />

            {/* Support / Buy me a coffee */}
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Support NextTool"
                title="Support NextTool"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12.5px] font-semibold
                  bg-rose-500 text-white shadow-sm shadow-rose-500/30
                  hover:bg-rose-600 hover:shadow-rose-500/40
                  active:scale-[0.98] transition-all duration-150"
              >
                <Heart className="w-3.5 h-3.5" fill="currentColor" />
                <span>Support</span>
              </a>
            )}

            {/* Menu — mobile */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectCategory={onSelectCategory}
        onOpenSearch={() => { setIsDrawerOpen(false); onOpenSearch(); }}
        onGoHome={() => { setIsDrawerOpen(false); onGoHome(); }}
        onOpenPrivacy={() => { setIsDrawerOpen(false); onOpenPrivacy(); }}
        theme={theme}
        resolvedDark={resolvedDark}
        onThemeChange={onThemeChange}
      />
    </header>
  );
};