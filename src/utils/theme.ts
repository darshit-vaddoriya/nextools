import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const KEY = 'nexttool-theme';

export function getStoredTheme(): ThemePreference {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark' || t === 'system') return t;
  } catch { /* ignore */ }
  return 'light';
}

export function getSystemDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch { return false; }
}

export function applyThemeClass(resolvedDark: boolean) {
  document.documentElement.classList.toggle('dark', resolvedDark);
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(getStoredTheme);
  const [systemDark, setSystemDark] = useState<boolean>(getSystemDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedDark =
    preference === 'dark' || (preference === 'system' && systemDark);

  useEffect(() => {
    applyThemeClass(resolvedDark);
    try { localStorage.setItem(KEY, preference); } catch { /* ignore */ }
    // Colours the phone status bar / installed-app title bar. Matches --background.
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.removeAttribute('media');
      meta.setAttribute('content', resolvedDark ? '#0b0d12' : '#f7f8fa');
    });
  }, [resolvedDark, preference]);

  const setTheme = useCallback((t: ThemePreference) => setPreference(t), []);

  return { preference, resolvedDark, setTheme };
}
