import React from 'react';
import { Cookie } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList, ExternalLink } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';

interface CookiePolicyProps {
  onBack: () => void;
  onOpenPrivacy?: () => void;
}

const COOKIE_ROWS = [
  { name: '_ga / _ga_*',              provider: 'Google Analytics', purpose: 'Distinguishes visitors and sessions so we can count pageviews per tool.', expiry: '2 years' },
  { name: '__gads / __gpi',           provider: 'Google AdSense',   purpose: 'Measures ad interactions and limits how often the same ad is shown.',     expiry: 'Up to 13 months' },
  { name: 'IDE / test_cookie',        provider: 'Google DoubleClick', purpose: 'Selects and measures advertising across sites.',                        expiry: 'Up to 13 months' },
  { name: 'NID',                      provider: 'Google',           purpose: 'Stores ad preferences such as language and personalisation settings.',    expiry: '6 months' },
];

const STORAGE_ROWS = [
  { key: 'nexttool-theme',           purpose: 'Remembers your light / dark / system theme choice.' },
  { key: 'nexttool-recent',          purpose: 'Lists the tools you opened most recently on this device.' },
  { key: 'nexttool-favorites',       purpose: 'Stores the tools you starred.' },
  { key: 'nexttool-seen-search-tip', purpose: 'Hides the first-visit search tip once you dismiss it.' },
  { key: 'nexttool-recent-searches', purpose: 'Remembers your recent searches in the tool search box.' },
  { key: 'nexttool-prefs',           purpose: 'Your Settings: whether History and saved files are on, and automatic downloads.' },
  { key: 'nexttool-activity',        purpose: 'Your tool History: edits (with before / after text), options changed, files added, copies and downloads. Values from password fields and secret-handling tools are never kept.' },
  { key: 'nexttool-history',         purpose: 'Your conversion History: file names, sizes, tool, status and time.' },
  { key: 'secure-notes-v1',          purpose: 'A note you save in the Secure Notes tool, encrypted with your passphrase (AES-GCM) before it is stored.' },
  { key: 'nexttool-handoff (IndexedDB)', purpose: 'Holds a file you dropped on the homepage or a category page for the few seconds it takes to open the tool you picked, then deletes it. Anything unclaimed expires after five minutes.' },
  { key: 'nexttool-files (IndexedDB)', purpose: 'Copies of the files you added and the results you downloaded, so History can show them again. Only when "Save files in history" is on. Oldest files are removed first.' },
];

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack, onOpenPrivacy }) => (
  <PageLayout
    icon={Cookie}
    title="Cookie Policy"
    subtitle="Exactly which cookies and local storage keys this site uses, and how to switch them off"
    onBack={onBack}
  >
    <PageProse>
      <PageSection title="What cookies are">
        <p>
          Cookies are small text files that a website, or a third party it works with, stores in
          your browser. They are used to remember preferences and, in the case of advertising, to
          select and measure the ads you see. Similar technologies such as local storage, pixels
          and web beacons serve comparable purposes and are covered by this policy.
        </p>
        <p>
          NextTool sets no cookies of its own. The cookies on this site come from Google Analytics
          and Google AdSense. On the Contact page only, the Cloudflare Turnstile spam check may
          also store a short-lived value in your browser while it verifies the form.
        </p>
      </PageSection>

      <PageSection title="Cookies set by third parties">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-[13.5px] min-w-[560px]">
            <thead className="bg-muted/60">
              <tr className="text-foreground">
                <th className="px-3 py-2.5 font-semibold">Cookie</th>
                <th className="px-3 py-2.5 font-semibold">Provider</th>
                <th className="px-3 py-2.5 font-semibold">Purpose</th>
                <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {COOKIE_ROWS.map(row => (
                <tr key={row.name} className="border-t border-border align-top">
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-foreground whitespace-nowrap">{row.name}</td>
                  <td className="px-3 py-2.5">{row.provider}</td>
                  <td className="px-3 py-2.5">{row.purpose}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{row.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Exact cookie names and lifetimes are set by Google and may change. Google documents its
          current list at{' '}
          <ExternalLink href="https://business.safety.google/adscookies/">
            business.safety.google/adscookies
          </ExternalLink>.
        </p>
      </PageSection>

      <PageSection title="Local storage we use">
        <p>
          These keys are written by NextTool itself and stay on your device. They are never sent
          to us or to anyone else. You can turn History off or clear it in Settings, and clearing
          your browser's site data removes all of them.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-[13.5px] min-w-[420px]">
            <thead className="bg-muted/60">
              <tr className="text-foreground">
                <th className="px-3 py-2.5 font-semibold">Key</th>
                <th className="px-3 py-2.5 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {STORAGE_ROWS.map(row => (
                <tr key={row.key} className="border-t border-border align-top">
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-foreground whitespace-nowrap">{row.key}</td>
                  <td className="px-3 py-2.5">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>

      <PageSection title="Advertising cookies and your choices">
        <PageList
          items={[
            <>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this or other websites.</>,
            <>Opt out of personalised advertising from Google at{' '}<ExternalLink href="https://www.google.com/settings/ads">Google Ads Settings</ExternalLink>.</>,
            <>Opt out of many other vendors at{' '}<ExternalLink href="https://www.aboutads.info/choices/">aboutads.info/choices</ExternalLink>{' '}or{' '}<ExternalLink href="https://optout.networkadvertising.org/">optout.networkadvertising.org</ExternalLink>.</>,
            <>Visitors in the EEA, the UK and Switzerland: analytics and advertising cookies are switched off by default (through Google Consent Mode) and are only set if you agree through a consent message. Where that message is shown, your choice can be changed from the privacy link it provides. Outside those regions no consent message is shown, and the opt-out links above are the way to exercise a choice.</>,
          ]}
        />
      </PageSection>

      <PageSection title="Turning cookies off in your browser">
        <p>
          Every major browser lets you block or delete cookies from its settings, usually under
          Privacy or Site data. Blocking cookies does not break any tool on this site: everything
          still runs locally. You may simply see less relevant advertising, and your theme and
          recent-tools preferences, History and saved files will be removed if you also clear site
          data.
        </p>
        <p>
          You can also opt out of Google Analytics entirely with the{' '}
          <ExternalLink href="https://tools.google.com/dlpage/gaoptout">
            Google Analytics opt-out browser add-on
          </ExternalLink>.
        </p>
      </PageSection>

      <PageSection title="More information">
        <p>
          For the wider picture of how we handle data, see our{' '}
          {onOpenPrivacy ? (
            <button onClick={onOpenPrivacy} className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">
              Privacy Policy
            </button>
          ) : (
            <a href="/privacy" className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">Privacy Policy</a>
          )}
          . Questions about cookies can go to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">
            {CONTACT_EMAIL}
          </a>.
        </p>
      </PageSection>
    </PageProse>
  </PageLayout>
);
