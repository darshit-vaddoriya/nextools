import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, Blocks, Menu, Sun, Moon } from 'lucide-react';
import type { ThemePreference } from '../../utils/theme';

interface AppTopBarProps {
  title: string;
  /** Root screens (a tab) show the brand; inner screens show a back arrow. */
  isRoot: boolean;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  resolvedDark: boolean;
  onThemeChange: (t: ThemePreference) => void;
  /** Extra buttons for this screen, e.g. favourite on a tool. */
  actions?: React.ReactNode;
}

/**
 * The installed app's top bar, in place of the website header. Native-app
 * pattern: a back arrow and the screen's name on inner screens, the brand on
 * the tab roots. It gains a hairline and shadow once the page scrolls.
 */
export const AppTopBar: React.FC<AppTopBarProps> = ({
  title, isRoot, onBack, onOpenSearch, onOpenMenu, resolvedDark, onThemeChange, actions,
}) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const iconBtn = `w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-on-surface-variant
    hover:bg-surface-container active:bg-surface-container-high active:scale-95 transition-all duration-150
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`;

  return (
    <header
      className={`sticky top-0 z-50 pt-[env(safe-area-inset-top)] glass transition-[box-shadow,border-color] duration-200 border-b ${
        scrolled ? 'border-outline-variant shadow-card' : 'border-transparent'
      }`}
    >
      <div className="h-14 flex items-center gap-1 px-2">
        {isRoot ? (
          <span className="flex items-center gap-2.5 pl-2 min-w-0 flex-1">
            <span className="w-8 h-8 rounded-[10px] shrink-0 flex items-center justify-center text-white
              bg-gradient-to-br from-[#632be2] to-[#db2777]">
              <Blocks className="w-[17px] h-[17px]" strokeWidth={2.25} />
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.02em] truncate">{title}</span>
          </span>
        ) : (
          <>
            <button type="button" onClick={onBack} aria-label="Back" className={iconBtn}>
              <ArrowLeft className="w-[22px] h-[22px]" />
            </button>
            <h1 className="flex-1 min-w-0 truncate text-[17px] font-bold tracking-[-0.01em] pl-1">{title}</h1>
          </>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          {actions}
          <button type="button" onClick={onOpenSearch} aria-label="Search tools" className={iconBtn}>
            <Search className="w-[20px] h-[20px]" />
          </button>
          {isRoot && (
            <button type="button" onClick={() => onThemeChange(resolvedDark ? 'light' : 'dark')}
              aria-label={`Switch to ${resolvedDark ? 'light' : 'dark'} mode`} className={iconBtn}>
              {resolvedDark ? <Sun className="w-[20px] h-[20px]" /> : <Moon className="w-[20px] h-[20px]" />}
            </button>
          )}
          <button type="button" onClick={onOpenMenu} aria-label="Open menu" className={iconBtn}>
            <Menu className="w-[20px] h-[20px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
