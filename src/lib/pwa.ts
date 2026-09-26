import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * PWA runtime state, kept outside React so the install prompt and the waiting
 * service worker are captured even if they fire before the first render.
 * `initPwa()` runs once from main.tsx; components read through the hooks below.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaState {
  /** Chromium's deferred install prompt, present only while install is possible. */
  installEvent: BeforeInstallPromptEvent | null;
  /** A new service worker has installed and is waiting to take over. */
  updateReady: boolean;
  /** Running as an installed app (home-screen / dock), not in a browser tab. */
  standalone: boolean;
  installed: boolean;
  /** The "how to install" sheet (iOS, or a browser without a prompt) is open. */
  installHelpOpen: boolean;
  /** Progress of "Download all tools for offline", reported by the worker. */
  offline: OfflineStatus;
  /**
   * Render the mobile-app UI (app bar, tab bar, app home) instead of the
   * website: running installed, on a phone or tablet width. `?mode=app`
   * forces it in a normal tab for previewing, `?mode=web` turns that off.
   */
  appMode: boolean;
}

export interface OfflineStatus {
  /** The visitor asked for (or the installed app defaulted to) a full copy. */
  enabled: boolean;
  downloading: boolean;
  complete: boolean;
  done: number;
  total: number;
  /** Uncompressed size of the full set, for the "~N MB" label. */
  bytes: number;
  error?: 'offline' | 'partial';
}

let state: PwaState = {
  installEvent: null,
  updateReady: false,
  standalone: false,
  installed: false,
  installHelpOpen: false,
  offline: { enabled: false, downloading: false, complete: false, done: 0, total: 0, bytes: 0 },
  appMode: false,
};

const APP_PREVIEW_KEY = 'nexttool-app-preview';
const APP_WIDTH = '(max-width: 1023.98px)';

/** Same rule as the inline script in index.html, which applies it before paint. */
function computeAppMode(standalone: boolean): boolean {
  let preview = false;
  try { preview = localStorage.getItem(APP_PREVIEW_KEY) === '1'; } catch { /* ignore */ }
  let narrow = false;
  try { narrow = window.matchMedia(APP_WIDTH).matches; } catch { /* ignore */ }
  return (standalone || preview) && narrow;
}

function syncAppMode() {
  const appMode = computeAppMode(state.standalone);
  document.documentElement.classList.toggle('app-mode', appMode);
  if (appMode !== state.appMode) set({ appMode });
}
let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function detectStandalone(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch { return false; }
}

export const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent)
  // iPadOS 13+ reports itself as a Mac; touch support gives it away.
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function trackWaiting(reg: ServiceWorkerRegistration) {
  const markWaiting = (w: ServiceWorker | null) => {
    // Only an *update* is worth announcing: on the very first install there is
    // no old version on screen to replace.
    if (w && navigator.serviceWorker.controller) {
      waitingWorker = w;
      set({ updateReady: true });
    }
  };
  markWaiting(reg.waiting);
  reg.addEventListener('updatefound', () => {
    const w = reg.installing;
    if (!w) return;
    w.addEventListener('statechange', () => {
      if (w.state === 'installed') markWaiting(w);
    });
  });
}

const OFFLINE_KEY = 'nexttool-offline-all';

function readOfflinePref(): '1' | '0' | null {
  try {
    const v = localStorage.getItem(OFFLINE_KEY);
    return v === '1' || v === '0' ? v : null;
  } catch { return null; }
}

function writeOfflinePref(v: '1' | '0') {
  try { localStorage.setItem(OFFLINE_KEY, v); } catch { /* ignore */ }
}

async function postToWorker(msg: { type: string }) {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const target = navigator.serviceWorker.controller ?? reg?.active;
  if (!target) return false;
  target.postMessage(msg);
  return true;
}

/** Saves every tool's code on the device so the whole app works offline. */
export async function downloadForOffline() {
  writeOfflinePref('1');
  set({ offline: { ...state.offline, enabled: true, downloading: true, error: undefined } });
  const sent = await postToWorker({ type: 'CACHE_ALL' });
  if (!sent) set({ offline: { ...state.offline, downloading: false } });
}

export async function removeOfflineDownload() {
  writeOfflinePref('0');
  set({ offline: { ...state.offline, enabled: false, downloading: false, complete: false, done: 0 } });
  await postToWorker({ type: 'CLEAR_OFFLINE' });
}

export function initPwa() {
  try {
    const mode = new URLSearchParams(window.location.search).get('mode');
    if (mode === 'app') localStorage.setItem(APP_PREVIEW_KEY, '1');
    else if (mode === 'web') localStorage.removeItem(APP_PREVIEW_KEY);
  } catch { /* ignore */ }

  const standalone = detectStandalone();
  set({ standalone, installed: standalone });
  document.documentElement.classList.toggle('pwa-standalone', standalone);
  syncAppMode();
  try {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
      const s = detectStandalone();
      document.documentElement.classList.toggle('pwa-standalone', s);
      set({ standalone: s });
      syncAppMode();
    });
    window.matchMedia(APP_WIDTH).addEventListener('change', syncAppMode);
  } catch { /* old Safari */ }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // show our own UI instead of Chrome's mini-infobar
    set({ installEvent: e as BeforeInstallPromptEvent });
  });
  window.addEventListener('appinstalled', () => set({ installEvent: null, installed: true }));

  // Production only: in dev a service worker would cache Vite's unhashed
  // modules and serve stale code across edits. Headless browsers (the
  // prerender pass) are skipped too, so no worker is baked into the snapshot.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || navigator.webdriver) return;

  navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
    const d = e.data as { type?: string } & Partial<OfflineStatus>;
    if (d?.type !== 'OFFLINE_STATUS') return;
    const complete = !!d.complete;
    set({ offline: {
      ...state.offline,
      done: d.done ?? state.offline.done,
      total: d.total ?? state.offline.total,
      bytes: d.bytes ?? state.offline.bytes,
      complete,
      downloading: !complete && !d.error && (d.total ?? 0) > 0 && (d.done ?? 0) < (d.total ?? 0),
      error: d.error,
    } });
  });

  // The installed app downloads everything by default (unless the visitor
  // turned it off, or is on a data saver); in a browser tab it is opt-in.
  const pref = readOfflinePref();
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const wantAll = pref === '1' || (pref === null && standalone && !saveData);
  set({ offline: { ...state.offline, enabled: wantAll } });
  if (wantAll) {
    navigator.serviceWorker.ready.then(() => {
      // Let the page itself finish loading first.
      setTimeout(() => { void downloadForOffline(); }, 3000);
    }).catch(() => {});
  }

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !waitingWorker) return;
    reloading = true;
    window.location.reload();
  });

  const register = () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(reg => {
      trackWaiting(reg);
      // An installed app can stay open for days; look for a new build hourly
      // and whenever it is brought back to the foreground.
      setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch(() => { /* unsupported or blocked — the site works without it */ });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

/** Tell the waiting worker to take over; the page reloads on controllerchange. */
export function applyUpdate() {
  if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  else window.location.reload();
}

/** Manual "check for updates". Resolves 'none' | 'ready' | 'unsupported'. */
export async function checkForUpdate(): Promise<'none' | 'ready' | 'unsupported'> {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return 'unsupported';
  await reg.update();
  // A found update installs asynchronously; give it a moment to reach "waiting".
  for (let i = 0; i < 20 && !reg.waiting && reg.installing; i++) {
    await new Promise(r => setTimeout(r, 250));
  }
  if (reg.waiting && navigator.serviceWorker.controller) {
    waitingWorker = reg.waiting;
    set({ updateReady: true });
    return 'ready';
  }
  return 'none';
}

/** True once a service worker controls this page, i.e. it can load offline. */
export function useOfflineReady(): boolean {
  const [ready, setReady] = useState(() =>
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const on = () => setReady(!!navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', on);
    navigator.serviceWorker.ready.then(on).catch(() => {});
    return () => navigator.serviceWorker.removeEventListener('controllerchange', on);
  }, []);
  return ready;
}

export function dismissUpdate() {
  set({ updateReady: false });
}

/** Opens the browser's native install dialog. Resolves true if accepted. */
export async function promptInstall(): Promise<boolean> {
  const ev = state.installEvent;
  if (!ev) return false;
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  set({ installEvent: null });
  return outcome === 'accepted';
}

/**
 * The one action behind every "Install app" button: the native dialog where
 * the browser offers one, otherwise the step-by-step sheet.
 */
export async function requestInstall(): Promise<boolean> {
  if (state.installEvent) return promptInstall();
  set({ installHelpOpen: true });
  return false;
}

export function closeInstallHelp() {
  set({ installHelpOpen: false });
}

export function useAppMode(): boolean {
  return useSyncExternalStore(subscribe, () => state.appMode, () => false);
}

export function useOfflineStatus(): OfflineStatus {
  return useSyncExternalStore(subscribe, () => state.offline, () => state.offline);
}

export function usePwa() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  const ios = typeof navigator !== 'undefined' && isIOS();
  return {
    ...s,
    /** Chromium can install with one tap. */
    canPrompt: !!s.installEvent,
    /** iOS Safari only installs via Share → Add to Home Screen. */
    needsIosInstructions: ios && !s.standalone,
    /** Anything install-related worth offering on this device. */
    installable: !s.standalone && (!!s.installEvent || ios),
  };
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}
