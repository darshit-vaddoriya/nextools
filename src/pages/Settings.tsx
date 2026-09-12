import React, { useEffect, useState } from 'react';
import { Monitor, Moon, ShieldCheck, Sun, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/Toast';
import { clearHistory } from '../lib/history';
import type { ThemePreference } from '../utils/theme';

interface SettingsProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

const PREFS_KEY = 'nexttool-prefs';

interface Prefs {
  /** Keep a local record of conversions. */
  keepHistory: boolean;
  /** Download the output the moment a conversion finishes. */
  autoDownload: boolean;
}

const DEFAULTS: Prefs = { keepHistory: true, autoDownload: false };

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

export const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange }) => {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => { setPrefs(loadPrefs()); }, []);

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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
      <p className="mt-1.5 text-base text-muted-foreground">
        Preferences are stored in this browser. There is no account to sign in to.
      </p>

      {/* ── Appearance ── */}
      <section className="mt-10" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-lg font-bold text-foreground">Appearance</h2>
        <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:p-6">
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
        <div className="mt-4 divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:p-6">
          <Row
            htmlFor="pref-history"
            title="Keep a history"
            description="Record the tool, filename and time of each conversion on this device."
          >
            <Toggle id="pref-history" checked={prefs.keepHistory} onChange={(v) => update({ keepHistory: v })} />
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
        <div className="mt-4 rounded-[var(--radius-lg)] border border-border bg-card p-5 sm:p-6">
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-success" aria-hidden="true" />
            <span>
              Every tool runs inside your browser. Your files are never sent anywhere, and the only
              thing stored is the small history and preferences on this page.
            </span>
          </p>
          <hr className="my-5 border-border" />
          <Row
            title="Clear conversion history"
            description="Removes every entry from My files. This cannot be undone."
          >
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                clearHistory();
                toast({ title: 'History cleared', variant: 'success' });
              }}
            >
              Clear history
            </Button>
          </Row>
        </div>
      </section>
    </div>
  );
};
