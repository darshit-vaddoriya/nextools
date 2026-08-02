declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-M60L9W8G3B';

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('config', GA_ID, {
    page_path: path,
    ...(title ? { page_title: title } : {}),
  });
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
