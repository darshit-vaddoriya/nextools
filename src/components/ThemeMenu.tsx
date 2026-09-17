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
      className="w-9 h-9 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {resolvedDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
