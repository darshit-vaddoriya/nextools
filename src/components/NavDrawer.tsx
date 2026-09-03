import React, { useEffect } from 'react';
import { ToolCategory } from '../types';
import { TOOLS } from '../config/tools';
import { workingToolCount } from '../utils/toolStats';
import { ALL_CATEGORIES } from '../config/categories';
import {
  X, Search, Home, Sun, Moon, MonitorSmartphone,
  ChevronRight, LayoutGrid, ShieldCheck, Check, Blocks, Heart,
} from 'lucide-react';
import { ThemePreference } from '../utils/theme';
import { SUPPORT_URL } from '../config/support';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onOpenSearch: () => void;
  onGoHome: () => void;
  onOpenPrivacy: () => void;
  theme: ThemePreference;
  resolvedDark: boolean;
  onThemeChange: (t: ThemePreference) => void;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen, onClose, onSelectCategory, onOpenSearch,
  onGoHome, onOpenPrivacy, theme, resolvedDark, onThemeChange,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 bottom-0 z-[75] w-[300px] max-w-[85vw] flex flex-col
          bg-background border-l border-border shadow-2xl lg:hidden toast-in"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
          <button onClick={onGoHome} className="flex items-center gap-2.5" aria-label="NextTool Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary text-white flex items-center justify-center shrink-0">
              <Blocks className="w-4 h-4" strokeWidth={2.25} />
            </div>
            <span className="text-[18px] font-extrabold tracking-[-0.02em]">
              <span>Next</span><span className="text-primary">Tool</span>
            </span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Search */}
          <button
            onClick={() => { onOpenSearch(); onClose(); }}
            className="w-full flex items-center gap-2.5 h-11 px-3.5 rounded-xl border border-border bg-muted/50 text-muted-foreground text-[13px] hover:border-primary/40 transition-colors"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Search tools…</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-card border border-border text-muted-foreground">⌘K</kbd>
          </button>

          {/* Primary nav */}
          <nav className="mt-4 space-y-0.5" aria-label="Primary">
            <button onClick={() => { onGoHome(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-foreground hover:bg-muted transition-colors">
              <Home className="w-4 h-4 text-muted-foreground" /> Home
            </button>
            <button onClick={() => { onSelectCategory('all'); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-foreground hover:bg-muted transition-colors">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" /> All Tools
            </button>
            <button onClick={() => { onOpenPrivacy(); onClose(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-foreground hover:bg-muted transition-colors">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Privacy
            </button>
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <Heart className="w-4 h-4" fill="currentColor" /> Support NextTool
              </a>
            )}
          </nav>

          {/* Categories */}
          <p className="px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Categories
          </p>
          <div className="space-y-0.5">
            {ALL_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = TOOLS.filter(t => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { onSelectCategory(cat.id); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-foreground/90 hover:bg-muted transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cat.iconColor}`} />
                  </div>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{count}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Theme
          </p>
          <div className="flex items-center gap-1 px-3">
            {([
              { value: 'light' as const, label: 'Light', Icon: Sun },
              { value: 'dark' as const, label: 'Dark', Icon: Moon },
              { value: 'system' as const, label: 'System', Icon: MonitorSmartphone },
            ]).map(({ value, label, Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => onThemeChange(value)}
                  aria-pressed={active}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden min-[360px]:inline">{label}</span>
                  {active && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
          <p className="px-3 pt-3 text-[11px] text-muted-foreground leading-relaxed">
            {workingToolCount()} tools · processed locally in your browser
            {theme === 'system' && <>{resolvedDark ? ' · System: dark' : ' · System: light'}</>}
          </p>
        </div>
      </aside>
    </>
  );
};
