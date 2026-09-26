import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, WifiOff, X, Share, PlusSquare, MoreVertical, Blocks } from 'lucide-react';
import {
  usePwa, useOnline, useOfflineStatus, requestInstall, closeInstallHelp, applyUpdate, dismissUpdate, isIOS,
} from '../lib/pwa';

const DISMISS_KEY = 'nexttool-install-dismissed';
const VISITS_KEY = 'nexttool-visits';
/** Once dismissed, the install banner stays away this long. */
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
/** On a first visit, wait this long before offering install. */
const FIRST_VISIT_DELAY_MS = 25_000;

function snoozed(): boolean {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - t < SNOOZE_MS;
  } catch { return true; }
}

function countVisit(): number {
  try {
    // One count per browser session, not per page view.
    if (sessionStorage.getItem(VISITS_KEY)) return Number(localStorage.getItem(VISITS_KEY) || 1);
    const n = Number(localStorage.getItem(VISITS_KEY) || 0) + 1;
    localStorage.setItem(VISITS_KEY, String(n));
    sessionStorage.setItem(VISITS_KEY, '1');
    return n;
  } catch { return 1; }
}

/** Floating cards sit above the mobile tab bar (see --app-bottom-inset). */
const FLOAT = 'fixed inset-x-3 sm:inset-x-auto sm:right-4 z-[45] sm:w-[380px] bottom-[calc(var(--app-bottom-inset)+0.75rem)]';

/**
 * Everything the installed-app layer shows on its own: the install offer, the
 * "new version" banner, the offline notice and the install how-to sheet.
 * Mounted once in App. None of it renders during prerender (no install event,
 * no service worker, always online there), so none of it ends up in the HTML.
 */
export const PwaPrompts: React.FC = () => {
  const pwa = usePwa();
  const online = useOnline();
  const offlineCopy = useOfflineStatus();
  const [offerInstall, setOfferInstall] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOffline = React.useRef(false);

  // Offer install only to people who have actually come back, or stayed a while.
  useEffect(() => {
    if (!pwa.installable || snoozed()) return;
    if (countVisit() >= 2) { setOfferInstall(true); return; }
    const t = setTimeout(() => setOfferInstall(true), FIRST_VISIT_DELAY_MS);
    return () => clearTimeout(t);
  }, [pwa.installable]);

  useEffect(() => {
    if (!online) { wasOffline.current = true; return; }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    setShowBackOnline(true);
    const t = setTimeout(() => setShowBackOnline(false), 2500);
    return () => clearTimeout(t);
  }, [online]);

  const dismissInstall = () => {
    setOfferInstall(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  const install = async () => {
    setOfferInstall(false);
    const accepted = await requestInstall();
    if (!accepted && pwa.canPrompt) dismissInstall();
  };

  return (
    <>
      {/* ── Offline / back online ── */}
      {(!online || showBackOnline) && (
        <div className="fixed inset-x-0 z-[55] top-[calc(52px+env(safe-area-inset-top)+0.5rem)] flex justify-center pointer-events-none">
          <div
            role="status"
            className="toast-in flex items-center gap-2 h-8 px-3.5 rounded-full text-[12px] font-semibold shadow-lg whitespace-nowrap
              bg-foreground text-background"
          >
            {online
              ? <><span className="w-1.5 h-1.5 rounded-full bg-success-green" /> Back online</>
              : <><WifiOff className="w-3.5 h-3.5" /> Offline · {offlineCopy.complete ? 'all tools still work' : 'opened tools still work'}</>}
          </div>
        </div>
      )}

      {/* ── Update ready ── (takes precedence over the install offer) */}
      {pwa.updateReady ? (
        <div role="status" className={`${FLOAT} toast-in flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pl-3.5 shadow-2xl`}>
          <span className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <RefreshCw className="w-[18px] h-[18px]" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold leading-tight">Update available</p>
            <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">A newer NextTool is ready.</p>
          </div>
          <button onClick={dismissUpdate} className="h-9 px-2.5 rounded-lg text-[12.5px] font-semibold text-muted-foreground hover:bg-muted">
            Later
          </button>
          <button onClick={applyUpdate} className="h-9 px-3.5 rounded-lg text-[12.5px] font-bold bg-primary text-primary-foreground active:scale-95 transition-transform">
            Reload
          </button>
        </div>
      ) : offerInstall && pwa.installable && (
        <div role="dialog" aria-label="Install NextTool" className={`${FLOAT} toast-in rounded-2xl border border-border bg-card p-3.5 shadow-2xl`}>
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center text-white bg-gradient-to-br from-[#632be2] to-[#db2777]">
              <Blocks className="w-[22px] h-[22px]" strokeWidth={2.25} />
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[14px] font-bold leading-tight">Install NextTool</p>
              <p className="text-[12.5px] text-muted-foreground leading-snug mt-1">
                Opens from your home screen, full screen, and every tool keeps working offline.
              </p>
            </div>
            <button onClick={dismissInstall} aria-label="Not now"
              className="-mt-1 -mr-1 w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={dismissInstall} className="flex-1 h-10 rounded-xl text-[13px] font-semibold border border-border hover:bg-muted">
              Not now
            </button>
            <button onClick={install} className="flex-1 h-10 rounded-xl text-[13px] font-bold bg-primary text-primary-foreground inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform">
              <Download className="w-4 h-4" /> Install app
            </button>
          </div>
        </div>
      )}

      {pwa.installHelpOpen && <InstallHelpSheet />}
    </>
  );
};

/** Bottom sheet with manual steps, for browsers that give no install prompt. */
const InstallHelpSheet: React.FC = () => {
  const ios = isIOS();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeInstallHelp(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, []);

  const steps = ios
    ? [
        { icon: Share, text: <>Tap the <b>Share</b> button in Safari&rsquo;s toolbar.</> },
        { icon: PlusSquare, text: <>Scroll down and choose <b>Add to Home Screen</b>.</> },
        { icon: Blocks, text: <>Tap <b>Add</b>. NextTool now opens like an app.</> },
      ]
    : [
        { icon: MoreVertical, text: <>Open your browser&rsquo;s <b>menu</b> (⋮ or ⋯).</> },
        { icon: PlusSquare, text: <>Choose <b>Install app</b> or <b>Add to Home screen</b>.</> },
        { icon: Blocks, text: <>Confirm. NextTool now opens like an app.</> },
      ];

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="install-help-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeInstallHelp} />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl
        p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sheet-up">
        <div className="sm:hidden mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-outline-variant" />
        <div className="flex items-center justify-between">
          <h2 id="install-help-title" className="text-[17px] font-extrabold tracking-tight">Install NextTool</h2>
          <button onClick={closeInstallHelp} aria-label="Close" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[13px] text-muted-foreground mt-1">Free, no store and no account. It takes three taps.</p>
        <ol className="mt-4 space-y-2.5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-surface-container p-3">
              <span className="w-9 h-9 shrink-0 rounded-xl bg-card border border-border text-primary flex items-center justify-center">
                <s.icon className="w-[18px] h-[18px]" />
              </span>
              <span className="text-[13.5px] leading-snug">{s.text}</span>
            </li>
          ))}
        </ol>
        <button onClick={closeInstallHelp} className="mt-4 w-full h-11 rounded-xl text-[14px] font-bold bg-primary text-primary-foreground">
          Got it
        </button>
      </div>
    </div>
  );
};
