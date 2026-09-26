import React from 'react';
import { Home, LayoutGrid, Search, History, Settings } from 'lucide-react';
import { AppLink } from './AppLink';
import type { HeaderView } from './Header';

interface MobileTabBarProps {
  currentView: HeaderView;
  onGoHome: () => void;
  onOpenAllTools: () => void;
  onOpenSearch: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

// Pill behind the active icon, the way native tab bars mark the current tab.
const TabIcon: React.FC<{ icon: React.ElementType; active: boolean }> = ({ icon: I, active }) => (
  <span className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-200 ${
    active ? 'bg-primary/[0.12]' : ''
  }`}>
    <I className="w-[20px] h-[20px]" strokeWidth={active ? 2.4 : 2} />
  </span>
);

/**
 * App-style bottom navigation for phones and small tablets (hidden from lg up,
 * where the header nav takes over). Sits at z-40: under the header (50), the
 * search palette and full-screen editors (60) and the drawer (70), so every
 * overlay still covers it. Its height is reserved by --app-bottom-inset in
 * index.css, which the page, the footer and toasts all offset against.
 */
export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentView, onGoHome, onOpenAllTools, onOpenSearch, onOpenHistory, onOpenSettings,
}) => {
  const tab = (active: boolean) =>
    `relative flex-1 flex flex-col items-center justify-center gap-0.5 h-full min-w-0
     text-[10.5px] font-semibold tracking-[-0.005em] transition-colors duration-150
     focus-visible:outline-none focus-visible:bg-primary/5 active:scale-[0.96] ${
      active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`;

  const isTools = currentView === 'all' || currentView === 'category' || currentView === 'tool';

  return (
    <nav
      aria-label="App navigation"
      className="mobile-tabbar lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant glass"
    >
      <div className="flex items-stretch h-[var(--tabbar-h)] max-w-xl mx-auto px-1">
        <AppLink href="/" onNavigate={onGoHome} className={tab(currentView === 'home')}
          aria-current={currentView === 'home' ? 'page' : undefined}>
          <TabIcon icon={Home} active={currentView === 'home'} />
          <span>Home</span>
        </AppLink>

        <AppLink href="/all-tools" onNavigate={onOpenAllTools} className={tab(isTools)}
          aria-current={currentView === 'all' ? 'page' : undefined}>
          <TabIcon icon={LayoutGrid} active={isTools} />
          <span>Tools</span>
        </AppLink>

        {/* Search is the primary action, so it gets the raised centre button. */}
        <button type="button" onClick={onOpenSearch} className={tab(false)} aria-label="Search tools">
          <span className="flex items-center justify-center w-12 h-12 -mt-5 rounded-2xl text-white
            bg-gradient-to-br from-primary to-tertiary ring-4 ring-background
            shadow-[0_6px_16px_-4px_rgb(var(--primary)/0.55)]">
            <Search className="w-[21px] h-[21px]" strokeWidth={2.4} />
          </span>
          <span>Search</span>
        </button>

        <AppLink href="/my-files" onNavigate={onOpenHistory} rel="nofollow" className={tab(currentView === 'files')}
          aria-current={currentView === 'files' ? 'page' : undefined}>
          <TabIcon icon={History} active={currentView === 'files'} />
          <span>History</span>
        </AppLink>

        <AppLink href="/settings" onNavigate={onOpenSettings} rel="nofollow" className={tab(currentView === 'settings')}
          aria-current={currentView === 'settings' ? 'page' : undefined}>
          <TabIcon icon={Settings} active={currentView === 'settings'} />
          <span>Settings</span>
        </AppLink>
      </div>
    </nav>
  );
};
