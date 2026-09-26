import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu, History } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList, ExternalLink, PageHighlights } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';

interface PrivacyPolicyProps {
  onBack: () => void;
  onOpenCookies?: () => void;
}

const PILLARS = [
  { icon: Cpu, title: 'Tools Run on Your Device', desc: 'Every tool (PDF, image, WASM AI, code formatters) runs locally in your browser using JavaScript and WebAssembly.' },
  { icon: Lock, title: 'Zero File Upload', desc: 'Your files, PDFs, images and code are never sent to an external server. They stay in your browser while you work.' },
  { icon: HardDrive, title: 'No Account Needed', desc: 'No registration, sign-up or email address is ever required. NextTool is free and accessible instantly.' },
  { icon: History, title: 'History Stays Local', desc: 'Your optional tool history and saved files live only in this browser. You can turn them off or clear them at any time.' },
];

const code = 'px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono';
const link = 'text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110';

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, onOpenCookies }) => {
  return (
    <PageLayout
      icon={ShieldCheck}
      title="Privacy Policy"
      subtitle="Zero file uploads · processing happens in your browser · no login required"
      onBack={onBack}
    >
      <PageHighlights items={PILLARS} />

      <PageProse>
        <PageSection title="1. Who we are">
          <p>
            This Privacy Policy explains how NextTool ("NextTool", "we", "us") handles information
            when you visit <strong className="text-foreground">https://nexttool.click</strong> and use
            the tools published there. NextTool is an independent, ad-supported website operated
            from India. For any privacy question or request you can write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">
              {CONTACT_EMAIL}
            </a>.
          </p>
          <p>
            By using this site you agree to the practices described below. If you do not agree,
            please stop using the site.
          </p>
        </PageSection>

        <PageSection title="2. The files you process are never collected">
          <p>
            NextTool is a static website. Every tool, PDF merging and splitting, image compression
            and conversion, AI background removal, OCR, code formatting, hashing and the rest, executes inside your browser using standard browser technologies such as the WebCrypto
            API, HTML5 Canvas, WebAssembly and on-device machine-learning models.
          </p>
          <p>
            Some tools need a library or model that is too large to ship with every page. The AI
            Background Remover downloads its model from IMG.LY's content delivery network
            (staticimgly.com), and the OCR tools download their recognition engine and language
            data from jsDelivr (cdn.jsdelivr.net). Those downloads go from the provider to you:
            like any web request they reveal your IP address and browser to that provider, but
            your file is never sent to them.
          </p>
          <p>
            The documents, images and text you open in a tool are read into your browser's memory.
            They are not transmitted to us and they are not stored on any server we control. If
            the History feature is on (it is by default), a record of your work and copies of your
            files are kept in your own browser's storage, on your device, as described in section
            3. Nothing in that history is ever sent to us. If History is off, your content is
            discarded when you close or reload the page. Either way, we have no ability to view,
            recover or share it.
          </p>
        </PageSection>

        <PageSection title="3. History and saved files (stored on your device only)">
          <p>
            NextTool has a History page (<a href="/my-files" className={link}>/my-files</a>) and
            a History panel inside each tool, so you can see what you did, restore earlier text
            and download files again. All of this is kept by your browser on your device. It is
            not uploaded, not synced between devices, not linked to any account, and not
            available to us, to advertisers or to analytics providers.
          </p>
          <PageList
            items={[
              <><strong className="text-foreground">Activity log.</strong> For each tool, History records what changed: which field you edited, with the text before and after the edit; which option you switched; which files you added; and what you copied or downloaded. Conversion jobs record the file name, size, tool, status and time. This is stored in <code className={code}>localStorage</code> under <code className={code}>nexttool-activity</code> and <code className={code}>nexttool-history</code>. It holds at most 400 entries. Text snapshots are capped at 4,000 characters, and only the newest entries keep them.</>,
              <><strong className="text-foreground">Saved files.</strong> When "Save files in history" is on, History keeps copies of the files you add to a tool and the results you download, so you can preview or download them again. These copies are stored in your browser's <code className={code}>IndexedDB</code> database <code className={code}>nexttool-files</code>. Files larger than 150 MB are not kept. The whole store stays under 1 GB and inside your browser's own storage quota, with the oldest files removed first. Your browser may also clear them if your disk gets full.</>,
              <><strong className="text-foreground">Secrets are not kept.</strong> Password fields, and tools that handle secrets (password, passphrase and random string generators, the password strength checker, Secure Notes, the JWT decoder, the .env converter and the hash generator), only record that something changed. They never record the value, and they never save file copies.</>,
            ]}
          />
          <p>
            <strong className="text-foreground">Your controls.</strong> In{' '}
            <a href="/settings" className={link}>Settings</a> you can turn off "Keep a history" to
            stop recording anything new, or turn off "Save files in history" to keep the log
            without file copies. "Delete saved files only" removes the stored files but keeps the
            log, and "Clear history" deletes everything. You can also delete single entries, or one
            tool's history, from the History page. Clearing this site's data in your browser
            removes all of it, and a private or incognito window discards it when it is closed.
          </p>
          <p>
            Because this data lives in your browser, anyone who uses the same browser profile can
            see it. On a shared or public computer, turn History off or clear it before you leave.
          </p>
        </PageSection>

        <PageSection title="4. Information we do collect">
          <PageList
            items={[
              <><strong className="text-foreground">Server logs.</strong> The site is hosted by Netlify. Like any web host, Netlify processes your IP address, the page requested, the time and your browser's user-agent to deliver the site and protect it from abuse, and keeps these logs for a limited period under its own privacy policy.</>,
              <><strong className="text-foreground">Usage analytics.</strong> Google Analytics 4 records pageviews and basic technical details (approximate region, device type, browser, referring page) so we know which tools are worth improving. Google Analytics 4 does not log or store IP addresses; it uses them only to estimate an approximate location, and we only ever see aggregate reports.</>,
              <><strong className="text-foreground">Advertising data.</strong> Google AdSense and its partners may collect data through cookies and similar technologies to select and measure ads. See section 6.</>,
              <><strong className="text-foreground">Local browser storage.</strong> Your theme choice, settings, recently opened tools, starred favourites and, if enabled, your History (section 3) are stored in <code className={code}>localStorage</code> and <code className={code}>IndexedDB</code> on your own device. So is a file you drop on the homepage or a category page, for the few seconds it takes to open the tool you picked. None of this reaches us.</>,
              <><strong className="text-foreground">Messages you send us.</strong> If you use the form on our Contact page, we receive the topic you choose, your message, the email address you give (so we can reply), your name if you add it, the page you sent it from and your browser's user-agent string (which helps us reproduce bug reports). This is stored in a database hosted by Supabase, which processes it on our behalf and does not use it for its own purposes. To keep automated spam out, the form is protected by Cloudflare Turnstile, which checks signals from your browser and your IP address to tell people from bots; Cloudflare's handling of that data is described at <ExternalLink href="https://www.cloudflare.com/turnstile-privacy-policy/">cloudflare.com/turnstile-privacy-policy</ExternalLink>. If you email us instead, we keep that correspondence so we can reply and follow up.</>,
              <><strong className="text-foreground">Optional support payments.</strong> The Support button opens a payment page run by Razorpay. Paying is entirely optional and unlocks nothing. If you do pay, Razorpay processes your payment details under its own privacy policy; we never see your card, UPI or bank details, and receive only what Razorpay passes on to a merchant, such as the amount and the name, email address and phone number you entered there. We use these only to keep records the law requires.</>,
            ]}
          />
          <p>
            Apart from what you choose to send through the Contact form, by email or with an
            optional support payment, we do not ask for or store names, email addresses or account
            credentials, and the site has no accounts. Contact messages are used only to answer
            you: never for marketing, never sold and never shared, except with the service
            providers that store them and check the form for spam.
          </p>
        </PageSection>

        <PageSection title="5. Cookies">
          <p>
            A cookie is a small file a website stores in your browser. NextTool itself sets no
            tracking cookies (the local storage it uses for preferences and History is not used for
            tracking and is never read by anyone but you); the cookies present on this site come from Google Analytics and
            Google AdSense. You can block or delete cookies at any time in your browser settings, the tools will keep working, though ads may become less relevant.
          </p>
          <p>
            A full, itemised list is in our{' '}
            {onOpenCookies ? (
              <button onClick={onOpenCookies} className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">
                Cookie Policy
              </button>
            ) : (
              <a href="/cookies" className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">Cookie Policy</a>
            )}.
          </p>
        </PageSection>

        <PageSection title="6. Google AdSense and third-party advertising">
          <p>
            To keep every tool free without subscriptions or login walls, NextTool displays, or
            may display, advertising served by Google AdSense. Ad networks never receive the files
            or text you process in a tool; that content never leaves your browser in the first
            place.
          </p>
          <PageList
            items={[
              'Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.',
              <>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You may opt out of personalised advertising by visiting{' '}<ExternalLink href="https://www.google.com/settings/ads">Google Ads Settings</ExternalLink>.</>,
              <>You can opt out of third-party vendors' use of cookies for personalised advertising at{' '}<ExternalLink href="https://www.aboutads.info/choices/">aboutads.info/choices</ExternalLink>{' '}or{' '}<ExternalLink href="https://optout.networkadvertising.org/">optout.networkadvertising.org</ExternalLink>.</>,
              <>How Google uses information from sites that use its services is described at{' '}<ExternalLink href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</ExternalLink>.</>,
            ]}
          />
          <p>
            Third-party ad servers or ad networks may also use technologies such as JavaScript
            tags, cookies and web beacons in the advertisements shown on this site, which are sent
            directly to your browser. They automatically receive your IP address when this occurs.
            NextTool has no access to or control over the cookies used by third-party advertisers,
            and this Privacy Policy does not cover their practices, consult their own policies for
            details and opt-out instructions.
          </p>
        </PageSection>

        <PageSection title="7. Your rights under GDPR (EEA and UK visitors)">
          <p>
            If you are in the European Economic Area or the United Kingdom, you have the right to
            access, correct, delete, restrict or object to the processing of your personal data,
            and the right to data portability. Because we hold no account data, most requests will
            concern analytics or advertising identifiers held by Google, and are exercised through
            the opt-out links above or your browser settings.
          </p>
          <p>
            Where we rely on consent, specifically for personalised advertising and analytics
            cookies, those cookies are switched off by default for visitors in the EEA, the UK and
            Switzerland (through Google Consent Mode) and are only set if you agree through a
            consent message. You may withdraw consent at any time: through the privacy link in
            that message where it is shown, through the opt-out links in section 6, or by
            blocking cookies in your browser.
            Our lawful basis for the strictly necessary operation of the site (including server
            logs and spam protection on the Contact form) is our legitimate interest in providing
            and securing it. We process a Contact form message or an email to answer the request
            you made in it.
          </p>
          <p>
            The service providers named in this policy (Netlify, Supabase, Cloudflare, Google,
            IMG.LY, jsDelivr and Razorpay) may process data in countries other than yours,
            including India and the United States. Where the law requires it, they rely on
            safeguards such as the European Commission's standard contractual clauses. You also
            have the right to complain to your local data protection authority.
          </p>
        </PageSection>

        <PageSection title="8. Your rights under CCPA/CPRA (California visitors)">
          <p>
            California residents may request disclosure of the categories of personal information
            collected, request deletion, and opt out of the "sale" or "sharing" of personal
            information. NextTool does not sell personal information for money. Cross-context
            behavioural advertising through Google AdSense may qualify as "sharing" under the CPRA;
            you can opt out through the Google Ads Settings link in section 6 or by disabling
            advertising cookies. We will not discriminate against you for exercising these rights.
          </p>
        </PageSection>

        <PageSection title="9. Visitors in India">
          <p>
            NextTool is operated from India. Under the Digital Personal Data Protection Act, 2023
            you may ask what personal data we hold about you (in practice, only a Contact form
            message or an email you sent), ask us to correct or erase it, and withdraw any consent
            you gave. Write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a>, which is
            also the contact for grievances about how we handle your data.
          </p>
        </PageSection>

        <PageSection title="10. Children's privacy">
          <p>
            NextTool is a general-audience website and is not directed at children. The tools
            themselves collect nothing from anyone, but if you are under 18 (the age of a child
            under India's Digital Personal Data Protection Act), please do not send us a message
            through the Contact form, by email or with a support payment without a parent or
            guardian's permission. We do not knowingly collect personal data from children. If you
            believe a child has sent us personal data, contact us and we will delete it promptly.
          </p>
        </PageSection>

        <PageSection title="11. Data retention and security">
          <p>
            We never receive your files, so we keep none of them. Your local History (section 3)
            stays on your device until you delete it, turn it off, or your browser clears it. We
            cannot read it, recover it or delete it for you. Analytics data is retained by
            Google for no longer than 14 months and is only ever seen by us in aggregate. Contact form messages and email correspondence are kept
            as long as needed to resolve your enquiry and deleted within 12 months; write to us
            and we will delete yours sooner. Records of support payments are kept only as long as
            tax and accounting law requires. The site is served exclusively over HTTPS from a
            content delivery network, and fonts and scripts are self-hosted wherever possible to
            limit third-party requests.
          </p>
        </PageSection>

        <PageSection title="12. External links">
          <p>
            The site links to third-party websites, including advertisers and documentation. We are
            not responsible for the content or privacy practices of those sites, and we encourage
            you to read the privacy policy of every site you visit.
          </p>
        </PageSection>

        <PageSection title="13. Changes to this policy">
          <p>
            We may update this policy as the site evolves or as legal requirements change. Material
            changes will be reflected in the "last updated" date at the top of this page. Continuing to use NextTool
            after an update means you accept the revised policy.
          </p>
        </PageSection>

        <PageSection title="14. Contact">
          <p>
            Questions, requests or complaints about this policy can be sent to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">
              {CONTACT_EMAIL}
            </a>. We answer data-protection requests within one month at the latest.
          </p>
        </PageSection>
      </PageProse>
    </PageLayout>
  );
};
