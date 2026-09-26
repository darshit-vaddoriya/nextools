import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

// Cloudflare Turnstile, the captcha in front of the contact form. Loaded only
// on the page that renders this component, and in explicit mode so React
// controls when and where the widget appears.

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    s.onerror = () => { scriptPromise = null; reject(new Error('turnstile')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Tokens are single-use: call after every submit to get a fresh one. */
  reset: () => void;
}

interface TurnstileProps {
  siteKey: string;
  /** A fresh token, or null when it expired or the check failed. */
  onToken: (token: string | null) => void;
  /** The script could not load (blocked, offline). */
  onLoadError?: () => void;
}

export const Turnstile = React.forwardRef<TurnstileHandle, TurnstileProps>(
  ({ siteKey, onToken, onLoadError }, ref) => {
    const box = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    // Latest callbacks without re-rendering the widget when they change.
    const cb = useRef({ onToken, onLoadError });
    cb.current = { onToken, onLoadError };

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
        cb.current.onToken(null);
      },
    }), []);

    // The widget cannot change theme once rendered, so a theme switch re-renders it.
    const [dark, setDark] = useState(() =>
      typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    useEffect(() => {
      const root = document.documentElement;
      const observer = new MutationObserver(() => setDark(root.classList.contains('dark')));
      observer.observe(root, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      let cancelled = false;
      loadTurnstile().then(api => {
        if (cancelled || !box.current) return;
        widgetId.current = api.render(box.current, {
          sitekey: siteKey,
          theme: dark ? 'dark' : 'light',
          size: 'flexible',
          callback: (token: string) => cb.current.onToken(token),
          'expired-callback': () => cb.current.onToken(null),
          'error-callback': () => cb.current.onToken(null),
        });
      }).catch(() => { if (!cancelled) cb.current.onLoadError?.(); });

      return () => {
        cancelled = true;
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      };
    }, [siteKey, dark]);

    // Reserve the widget's height so the form does not jump when it appears.
    return <div ref={box} className="min-h-[65px]" />;
  },
);
Turnstile.displayName = 'Turnstile';
