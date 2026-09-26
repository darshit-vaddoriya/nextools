import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemePreference } from '../utils/theme';

interface ThemeMenuProps {
  theme: ThemePreference;
  resolvedDark: boolean;
  onThemeChange: (t: ThemePreference) => void;
}

export const ThemeMenu: React.FC<ThemeMenuProps> = ({ resolvedDark, onThemeChange }) => {
  return (
    <button
      onClick={() => onThemeChange(resolvedDark ? 'light' : 'dark')}
      title="Toggle theme"
      aria-label={`Switch to ${resolvedDark ? 'light' : 'dark'} mode`}
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-primary/40 active:scale-95 transition-all duration-150"
    >
      {resolvedDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
