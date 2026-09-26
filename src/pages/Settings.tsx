import React, { useEffect, useState } from 'react';
import {
  Monitor, Moon, ShieldCheck, Sun, Trash2, Download, CheckCircle2, RefreshCw, WifiOff, History, ChevronRight, Blocks, DownloadCloud,
} from 'lucide-react';
import {
  usePwa, useOfflineReady, useOfflineStatus, requestInstall, checkForUpdate, downloadForOffline, removeOfflineDownload,
} from '../lib/pwa';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/Toast';
import { clearHistory } from '../lib/history';
import { clearActivity } from '../lib/activity';
import { clearFiles, storageInfo, type StorageInfo } from '../lib/fileStore';
import { formatBytes } from '../lib/formats';
import type { ThemePreference } from '../utils/theme';
import { STATIC_PAGES, type StaticPageId } from '../config/pages';
import { AppLink } from '../components/AppLink';

interface SettingsProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  onOpenHistory?: () => void;
  onOpenPage?: (id: StaticPageId) => void;
  onOpenBlog?: () => void;
}

const PREFS_KEY = 'nexttool-prefs';

interface Prefs {
  /** Keep a local record of conversions. */
  keepHistory: boolean;
  /** Keep copies of input and output files with the history (IndexedDB). */
  keepFiles: boolean;
  /** Download the output the moment a conversion finishes. */
  autoDownload: boolean;
}

const DEFAULTS: Prefs = { keepHistory: true, keepFiles: true, autoDownload: false };

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** A labelled row wrapping one control. */
const Row: React.FC<{ title: string; description: string; children: React.ReactNode; htmlFor?: string }> = ({
  title, description, children, htmlFor,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
    <div className="min-w-0 flex-1 basis-64">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-foreground">{title}</label>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

/** Accessible switch built on a real checkbox. */
const Toggle: React.FC<{ id: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  id, checked, onChange,
}) => (
  <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
    <input
      id={id}
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className="h-6 w-11 rounded-full bg-surface-container-highest transition-colors duration-[var(--motion-fast)]
                 peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring
                 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background
                 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full
                 after:bg-white after:shadow-raised after:transition-transform after:duration-[var(--motion-fast)]
                 peer-checked:after:translate-x-5 motion-reduce:after:transition-none"
    />
  </label>
);

const THEMES: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, onOpenHistory, onOpenPage, onOpenBlog }) => {
  const { toast } = useToast();
  const pwa = usePwa();
  const offlineReady = useOfflineReady();
  const offline = useOfflineStatus();
  const pct = offline.total ? Math.round((offline.done / offline.total) * 100) : 0;
  const [checking, setChecking] = useState(false);

  const onCheckUpdate = async () => {
    setChecking(true);
    try {
      const r = await checkForUpdate();
      if (r === 'none') toast({ title: 'You’re up to date', variant: 'success' });
      else if (r === 'unsupported') toast({ title: 'Updates install automatically', description: 'This browser loads the latest version on every visit.' });
    } catch {
      toast({ title: 'Couldn’t check for updates', description: 'Check your connection and try again.', variant: 'error' });
    } finally {
      setChecking(false);
    }
  };
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  const [storage, setStorage] = useState<StorageInfo | null>(null);

  useEffect(() => { setPrefs(loadPrefs()); }, []);
  useEffect(() => { storageInfo().then(setStorage).catch(() => undefined); }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      toast({ title: 'Couldn’t save that setting', description: 'Browser storage is unavailable.', variant: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <h1 className="web-only text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
      <p className="mt-1.5 text-sm sm:text-base text-muted-foreground">
        Preferences are stored in this browser. There is no account to sign in to.
      </p>

      {/* ── App (PWA) ── */}
      <section className="mt-6 sm:mt-10" aria-labelledby="app-heading">
        <h2 id="app-heading" className="text-lg font-bold text-foreground">App</h2>
        <div className="mt-3 sm:mt-4 rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3.5">
            <span className="w-12 h-12 shrink-0 rounded-[15px] flex items-center justify-center text-white bg-gradient-to-br from-[#632be2] to-[#db2777]">
              <Blocks className="w-6 h-6" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-foreground">NextTool</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                {pwa.standalone
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden="true" /> Installed on this device</>
                  : 'Running in your browser'}
              </p>
            </div>
            {!pwa.standalone && (
              <Button icon={Download} onClick={() => { void requestInstall(); }}>
                Install
              </Button>
            )}
          </div>

          <ul className="mt-4 grid gap-2 text-sm">
            <li className="rounded-[var(--radius-md)] bg-surface-container px-3 py-3">
              <div className="flex items-start gap-2.5">
                {offline.complete
                  ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-success" aria-hidden="true" />
                  : offlineReady
                    ? <DownloadCloud className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    : <WifiOff className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    {offline.complete ? 'All tools work offline'
                      : offline.downloading ? `Downloading tools… ${pct}%`
                      : 'Use every tool offline'}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {!offlineReady
                      ? 'Available after the app has finished loading once.'
                      : offline.complete
                        ? `Saved on this device${offline.bytes ? ` (${formatBytes(offline.bytes)})` : ''}. AI background removal and OCR still need internet the first time.`
                        : offline.error === 'offline'
                          ? 'You’re offline. Reconnect to download.'
                          : offline.error === 'partial'
                            ? 'A few files didn’t download. Try again on a steadier connection.'
                            : `Saves every tool on this device${offline.bytes ? ` (about ${formatBytes(offline.bytes)})` : ''}. Tools you’ve already opened work offline either way.`}
                  </p>
                </div>
              </div>
              {offline.downloading && (
                <div className="mt-2.5 h-1.5 rounded-full bg-card overflow-hidden" role="progressbar"
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Offline download">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
                </div>
              )}
              {offlineReady && !offline.downloading && (
                <div className="mt-2.5 flex justify-end">
                  {offline.complete || (offline.enabled && !offline.error) ? (
                    <Button variant="ghost" size="sm" onClick={() => { void removeOfflineDownload(); toast({ title: 'Offline copy removed' }); }}>
                      Remove offline copy
                    </Button>
                  ) : (
                    <Button size="sm" icon={Download} onClick={() => { void downloadForOffline(); }}>
                      {offline.error ? 'Try again' : 'Download for offline'}
                    </Button>
                  )}
                </div>
              )}
            </li>
            <li className="flex items-center justify-between gap-2.5 rounded-[var(--radius-md)] bg-surface-container px-3 py-1.5">
              <span className="flex items-center gap-2.5 text-foreground">
                <RefreshCw className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {pwa.updateReady ? 'An update is ready' : 'Updates'}
              </span>
              <Button variant="ghost" size="sm" loading={checking} onClick={onCheckUpdate}>
                Check now
              </Button>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Appearance ── */}
      <section className="mt-8 sm:mt-10" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-lg font-bold text-foreground">Appearance</h2>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-6">
          <Row title="Theme" description="Match your system, or pick one and keep it.">
            <div role="radiogroup" aria-label="Theme" className="flex gap-1 rounded-[var(--radius-md)] bg-surface-container p-1">
              {THEMES.map(({ value, label, icon: Icon }) => {
                const isActive = theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => onThemeChange(value)}
                    className={[
                      'inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-sm)] text-sm font-semibold',
                      'transition-colors duration-[var(--motion-fast)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive ? 'bg-card text-foreground shadow-raised' : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </Row>
        </div>
      </section>

      {/* ── Conversions ── */}
      <section className="mt-8" aria-labelledby="conversions-heading">
        <h2 id="conversions-heading" className="text-lg font-bold text-foreground">Conversions</h2>
        <div className="mt-4 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-6">
          <Row
            htmlFor="pref-history"
            title="Keep a history"
            description="Record what you change in each tool (edits, settings, files, downloads) on this device only. Nothing is sent anywhere."
          >
            <Toggle id="pref-history" checked={prefs.keepHistory} onChange={(v) => update({ keepHistory: v })} />
          </Row>
          <Row
            htmlFor="pref-files"
            title="Save files in history"
            description="Keep a copy of the files you upload and the results you download, so you can preview or download them again from History. Stored in this browser only; the oldest files are removed first when space runs low."
          >
            <Toggle id="pref-files" checked={prefs.keepHistory && prefs.keepFiles} onChange={(v) => update({ keepFiles: v })} />
          </Row>
          <Row
            htmlFor="pref-autodownload"
            title="Download automatically"
            description="Save the result as soon as a conversion finishes, without the extra click."
          >
            <Toggle id="pref-autodownload" checked={prefs.autoDownload} onChange={(v) => update({ autoDownload: v })} />
          </Row>
        </div>
      </section>

      {/* ── Data ── */}
      <section className="mt-8" aria-labelledby="data-heading">
        <h2 id="data-heading" className="text-lg font-bold text-foreground">Your data</h2>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-6">
          {onOpenHistory && (
            <>
              <button type="button" onClick={onOpenHistory}
                className="w-full flex items-center gap-3 -mx-1 px-1 py-1 rounded-[var(--radius-md)] text-left hover:bg-muted transition-colors">
                <span className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <History className="w-[18px] h-[18px]" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-foreground">History</span>
                  <span className="block text-xs text-muted-foreground">Your recent edits, files and downloads</span>
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              </button>
              <hr className="my-4 border-border" />
            </>
          )}
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-success" aria-hidden="true" />
            <span>
              Every tool runs inside your browser. Your files are never sent anywhere. History,
              saved files and preferences stay in this browser&rsquo;s own storage on this device.
            </span>
          </p>
          {storage && (
            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-bold text-foreground">Saved files</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {storage.fileCount} file{storage.fileCount === 1 ? '' : 's'} · {formatBytes(storage.filesBytes)} of {formatBytes(storage.budget)}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-surface-container overflow-hidden" role="progressbar"
                aria-valuemin={0} aria-valuemax={storage.budget} aria-valuenow={storage.filesBytes} aria-label="Saved files storage">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (storage.filesBytes / Math.max(1, storage.budget)) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {storage.quota ? <>This browser allows this site about {formatBytes(storage.quota)}. </> : null}
                {storage.persisted ? 'Storage is marked persistent, so the browser won’t clear it on its own.' : 'The browser may clear saved files if the disk gets full or the site goes unused for a long time.'}
              </p>
              {storage.fileCount > 0 && (
                <Button className="mt-3" variant="secondary" size="sm" icon={Trash2}
                  onClick={async () => {
                    await clearFiles();
                    setStorage(await storageInfo());
                    toast({ title: 'Saved files deleted', description: 'History entries were kept.', variant: 'success' });
                  }}>
                  Delete saved files only
                </Button>
              )}
            </div>
          )}
          <hr className="my-5 border-border" />
          <Row
            title="Clear history"
            description="Removes every entry from History, for all tools. This cannot be undone."
          >
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                clearHistory();
                clearActivity();
                void clearFiles().then(storageInfo).then(setStorage);
                toast({ title: 'History cleared', variant: 'success' });
              }}
            >
              Clear history
            </Button>
          </Row>
        </div>
      </section>

      {/* ── About & legal ── the installed app hides the site footer, so its
          pages are listed here instead. */}
      {onOpenPage && (
        <section className="mt-8" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-lg font-bold text-foreground">About &amp; legal</h2>
          <nav className="mt-4 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card overflow-hidden" aria-labelledby="about-heading">
            {onOpenBlog && (
              <AppLink href="/blog" onNavigate={onOpenBlog}
                className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                Guides &amp; blog
                <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              </AppLink>
            )}
            {STATIC_PAGES.map(page => (
              <AppLink key={page.id} href={page.path} onNavigate={() => onOpenPage(page.id)}
                className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                {page.title}
                <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              </AppLink>
            ))}
          </nav>
          <p className="mt-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} NextTool · Everything runs on your device</p>
        </section>
      )}
    </div>
  );
};
