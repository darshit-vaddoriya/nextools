import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, Blocks, Heart } from 'lucide-react';
import { NavDrawer } from './NavDrawer';
import { ThemeMenu } from './ThemeMenu';
import { ToolCategory } from '../types';
import { ThemePreference } from '../utils/theme';
import { SUPPORT_URL } from '../config/support';
import { StaticPageId, getStaticPage } from '../config/pages';
import { AppLink } from './AppLink';

export type HeaderView = 'home' | 'tool' | 'category' | 'page' | 'all' | 'blog' | 'files' | 'settings';

const navPath = (id: StaticPageId) => getStaticPage(id)?.path ?? '/';

interface HeaderProps {
  onOpenSearch: () => void;
  theme: ThemePreference;
  resolvedDark: boolean;
  onThemeChange: (t: ThemePreference) => void;
  onGoHome: () => void;
  onOpenPage: (id: StaticPageId) => void;
  onOpenBlog: () => void;
  isBlogActive?: boolean;
  onOpenCategories: () => void;
  onOpenAllTools: () => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  currentView: HeaderView;
  /** Which static page is open, so the nav can highlight it */
  activePageId?: StaticPageId;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch, theme, resolvedDark, onThemeChange,
  onGoHome, onOpenPage, onOpenBlog, onOpenCategories, onOpenAllTools,
  onSelectCategory, currentView, activePageId, isBlogActive
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Full-height items so the active underline lands exactly on the header's bottom border.
  const navLink = (active: boolean) =>
    `relative inline-flex items-center h-16 px-3 text-[13px] font-semibold tracking-[-0.01em]
     border-b-2 transition-colors duration-150 focus-visible:outline-none
     focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-md ${
      active
        ? 'text-primary border-primary'
        : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
    }`;

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${
      scrolled ? 'shadow-card' : ''
    }`}>
      <div className={`border-b transition-colors duration-300 ${
        scrolled ? 'border-outline-variant' : 'border-outline-variant/50'
      } glass`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center gap-2 sm:gap-4">

          {/* ── LOGO + BRAND NAME ──────────────────────────────── */}
          <AppLink
            href="/"
            onNavigate={onGoHome}
            className="flex items-center gap-2.5 shrink-0 select-none group min-w-0 rounded-xl
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="NextTool Home"
          >
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              bg-gradient-to-br from-primary to-tertiary text-white ring-1 ring-inset ring-white/20
              shadow-[0_2px_8px_-2px_rgb(var(--primary)/0.5)]
              transition-all duration-200 group-hover:shadow-[0_4px_14px_-2px_rgb(var(--primary)/0.65)]
              group-hover:-translate-y-px group-active:translate-y-0 group-active:scale-95">
              <Blocks className="w-[18px] h-[18px]" strokeWidth={2.25} />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/25 pointer-events-none" />
            </div>

            <div className="leading-tight text-left min-w-0">
              <div className="text-[18px] sm:text-[19px] font-extrabold tracking-[-0.025em] whitespace-nowrap font-heading">
                <span className="text-on-surface">Next</span><span className="text-primary">Tool</span>
              </div>
            </div>
          </AppLink>

          {/* ── DESKTOP NAV ────────────────────────────────────── */}
          <nav className="hidden lg:flex items-stretch gap-1 mx-auto" aria-label="Main navigation">
            <AppLink href="/" onNavigate={onGoHome} className={navLink(currentView === 'home')}>
              Home
            </AppLink>
            <AppLink href="/all-tools" onNavigate={onOpenAllTools} className={navLink(currentView === 'all')}>
              Tools
            </AppLink>
            <AppLink href="/#categories-section" onNavigate={onOpenCategories} className={navLink(currentView === 'category')}>
              Categories
            </AppLink>
            <AppLink href="/blog" onNavigate={onOpenBlog} className={navLink(!!isBlogActive)}>
              Blog
            </AppLink>
            <AppLink href={navPath('about')} onNavigate={() => onOpenPage('about')} className={navLink(activePageId === 'about')}>
              About
            </AppLink>
            <AppLink href={navPath('contact')} onNavigate={() => onOpenPage('contact')} className={navLink(activePageId === 'contact')}>
              Contact
            </AppLink>
            <AppLink href={navPath('privacy')} onNavigate={() => onOpenPage('privacy')} className={navLink(activePageId === 'privacy')}>
              Privacy
            </AppLink>
          </nav>

          {/* Spacer on mobile (nav hidden) */}
          <div className="flex-1 lg:hidden" />

          {/* ── RIGHT ACTIONS ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Private badge */}
            <div className="hidden xl:flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold
              bg-success/[0.09] border border-success/20 text-success">
              <span className="relative flex w-1.5 h-1.5 shrink-0">
                <span className="absolute inset-0 rounded-full bg-success pulse-dot" />
              </span>
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
                className="group inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12.5px] font-semibold
                  bg-gradient-to-b from-rose-500 to-rose-600 text-white
                  ring-1 ring-inset ring-white/15 shadow-[0_2px_8px_-2px_rgba(244,63,94,0.5)]
                  hover:shadow-[0_4px_14px_-2px_rgba(244,63,94,0.6)] hover:-translate-y-px
                  active:translate-y-0 active:scale-[0.98] transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <Heart
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110"
                  fill="currentColor"
                />
                <span>Support</span>
              </a>
            )}

            {/* Menu, mobile */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl
                border border-outline-variant text-on-surface-variant
                hover:bg-surface-container hover:text-on-surface hover:border-primary/40
                active:scale-95 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Menu className="w-[18px] h-[18px]" />
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
        onOpenPage={(id) => { setIsDrawerOpen(false); onOpenPage(id); }}
        onOpenBlog={() => { setIsDrawerOpen(false); onOpenBlog(); }}
        theme={theme}
        resolvedDark={resolvedDark}
        onThemeChange={onThemeChange}
      />
    </header>
  );
};