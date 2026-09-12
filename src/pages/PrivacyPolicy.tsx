import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList, ExternalLink } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';

interface PrivacyPolicyProps {
  onBack: () => void;
  onOpenCookies?: () => void;
}

const PILLARS = [
  { icon: Cpu, title: '100% Client-Side', desc: 'Every tool (PDF, image, WASM AI, code formatters) runs locally on your device using JavaScript and WebAssembly.', color: 'text-success', bg: 'bg-success/10' },
  { icon: Lock, title: 'Zero File Upload', desc: 'Your files, PDFs, images and code are never sent to an external server. They stay in your browser while you work.', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: HardDrive, title: 'No Account Needed', desc: 'No registration, sign-up or email address is ever required. NextTool is free and accessible instantly.', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, onOpenCookies }) => {
  return (
    <PageLayout
      icon={ShieldCheck}
      title="Privacy Policy"
      subtitle="Zero file uploads · processing happens in your browser · no login required"
      onBack={onBack}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PILLARS.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-5 rounded-xl border border-border bg-muted/50">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-[13px] font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <PageProse>
        <PageSection title="1. Who we are">
          <p>
            This Privacy Policy explains how NextTool ("NextTool", "we", "us") handles information
            when you visit <strong className="text-foreground">https://nexttool.click</strong> and use
            the tools published there. NextTool is an independent, ad-supported website operated
            from India. For any privacy question or request you can write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 hover:brightness-110">
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
            The documents, images and text you open in a tool are read into your browser's memory
            only. They are not transmitted to us, they are not stored on any server we control, and
            they are discarded when you close or reload the page. We have no ability to view,
            recover or share them.
          </p>
        </PageSection>

        <PageSection title="3. Information we do collect">
          <PageList
            items={[
              <><strong className="text-foreground">Usage analytics.</strong> Google Analytics 4 records pageviews and basic technical details (approximate region, device type, browser, referring page) so we know which tools are worth improving. IP addresses are anonymised by Google before we ever see aggregate reports.</>,
              <><strong className="text-foreground">Advertising data.</strong> Google AdSense and its partners may collect data through cookies and similar technologies to select and measure ads. See section 5.</>,
              <><strong className="text-foreground">Local browser storage.</strong> Your theme choice, recently opened tools and starred favourites are stored in <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">localStorage</code> on your own device. This never reaches us.</>,
              <><strong className="text-foreground">Messages you send us.</strong> If you email us, we keep that correspondence so we can reply and follow up.</>,
            ]}
          />
          <p>
            We do not ask for or store names, email addresses, payment details or account
            credentials, because the site has no accounts and no payments.
          </p>
        </PageSection>

        <PageSection title="4. Cookies">
          <p>
            A cookie is a small file a website stores in your browser. NextTool itself sets no
            tracking cookies; the cookies present on this site come from Google Analytics and
            Google AdSense. You can block or delete cookies at any time in your browser settings, the tools will keep working, though ads may become less relevant.
          </p>
          <p>
            A full, itemised list is in our{' '}
            {onOpenCookies ? (
              <button onClick={onOpenCookies} className="text-primary underline underline-offset-2 hover:brightness-110">
                Cookie Policy
              </button>
            ) : (
              <a href="/cookies" className="text-primary underline underline-offset-2 hover:brightness-110">Cookie Policy</a>
            )}.
          </p>
        </PageSection>

        <PageSection title="5. Google AdSense and third-party advertising">
          <p>
            To keep every tool free without subscriptions or login walls, NextTool displays
            advertising served by Google AdSense. Advertisements are clearly labelled and are kept
            outside the working area of each tool. Ad networks never receive the files or text you
            process, that content never leaves your browser in the first place.
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

        <PageSection title="6. Your rights under GDPR (EEA and UK visitors)">
          <p>
            If you are in the European Economic Area or the United Kingdom, you have the right to
            access, correct, delete, restrict or object to the processing of your personal data,
            and the right to data portability. Because we hold no account data, most requests will
            concern analytics or advertising identifiers held by Google, and are exercised through
            the opt-out links above or your browser settings.
          </p>
          <p>
            Where we rely on consent, specifically for personalised advertising and analytics
            cookies, you may withdraw it at any time through the consent banner or your browser.
            Our lawful basis for the strictly necessary operation of the site is our legitimate
            interest in providing and securing it. You also have the right to complain to your
            local data protection authority.
          </p>
        </PageSection>

        <PageSection title="7. Your rights under CCPA/CPRA (California visitors)">
          <p>
            California residents may request disclosure of the categories of personal information
            collected, request deletion, and opt out of the "sale" or "sharing" of personal
            information. NextTool does not sell personal information for money. Cross-context
            behavioural advertising through Google AdSense may qualify as "sharing" under the CPRA;
            you can opt out through the Google Ads Settings link in section 5 or by disabling
            advertising cookies. We will not discriminate against you for exercising these rights.
          </p>
        </PageSection>

        <PageSection title="8. Children's privacy">
          <p>
            NextTool is a general-audience website and is not directed at children under 13 (or the
            equivalent minimum age in your jurisdiction). We do not knowingly collect personal
            information from children. If you believe a child has provided us with personal
            information through an email to us, contact us and we will delete it promptly.
          </p>
        </PageSection>

        <PageSection title="9. Data retention and security">
          <p>
            Files are never retained because they are never received. Analytics data is retained by
            Google according to its standard retention settings (currently 14 months) and is only
            ever seen by us in aggregate. Email correspondence is kept as long as needed to resolve
            your enquiry. The site is served exclusively over HTTPS from a content delivery
            network, and fonts and scripts are self-hosted wherever possible to limit third-party
            requests.
          </p>
        </PageSection>

        <PageSection title="10. External links">
          <p>
            The site links to third-party websites, including advertisers and documentation. We are
            not responsible for the content or privacy practices of those sites, and we encourage
            you to read the privacy policy of every site you visit.
          </p>
        </PageSection>

        <PageSection title="11. Changes to this policy">
          <p>
            We may update this policy as the site evolves or as legal requirements change. Material
            changes will be reflected in the "last updated" date below. Continuing to use NextTool
            after an update means you accept the revised policy.
          </p>
        </PageSection>

        <PageSection title="12. Contact">
          <p>
            Questions, requests or complaints about this policy can be sent to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 hover:brightness-110">
              {CONTACT_EMAIL}
            </a>. We aim to respond within two business days.
          </p>
        </PageSection>
      </PageProse>
    </PageLayout>
  );
};
