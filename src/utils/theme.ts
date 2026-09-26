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
  // Defaults first, real values after mount: the page is prerendered, and the
  // inline script in <head> has already applied the right theme class, so the
  // first client render only has to match the static HTML.
  const [preference, setPreference] = useState<ThemePreference>('light');
  const [systemDark, setSystemDark] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreference(getStoredTheme());
    setSystemDark(getSystemDark());
    setReady(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedDark =
    preference === 'dark' || (preference === 'system' && systemDark);

  useEffect(() => {
    if (!ready) return;
    applyThemeClass(resolvedDark);
    try { localStorage.setItem(KEY, preference); } catch { /* ignore */ }
    // Colours the phone status bar / installed-app title bar. Matches --background.
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.removeAttribute('media');
      meta.setAttribute('content', resolvedDark ? '#0b0d12' : '#f7f8fa');
    });
  }, [resolvedDark, preference, ready]);

  const setTheme = useCallback((t: ThemePreference) => setPreference(t), []);

  return { preference, resolvedDark, setTheme };
}
