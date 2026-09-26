import React from 'react';
import { Info, Cpu, Lock, Infinity as InfinityIcon, Mail } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList, PageHighlights } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';
import { workingToolCount } from '../utils/toolStats';
import { TOOLS } from '../config/tools';
import { ALL_CATEGORIES } from '../config/categories';

interface AboutProps {
  onBack: () => void;
  onOpenContact: () => void;
}

const PILLARS = [
  {
    icon: Cpu,
    title: 'Built for the browser',
    desc: 'Every tool is written in JavaScript and WebAssembly so the work happens on your own hardware, no queue, no upload progress bar, no server bill to pass on to you.',
  },
  {
    icon: Lock,
    title: 'Privacy is the product',
    desc: 'We never receive your documents, photos or code. That is not a policy promise we could quietly break, the files simply never leave the tab.',
  },
  {
    icon: InfinityIcon,
    title: 'Free, funded by ads',
    desc: 'NextTool is supported by advertising and optional support payments instead of subscriptions, watermarks or paywalls.',
  },
];

export const About: React.FC<AboutProps> = ({ onBack, onOpenContact }) => {
  const categoryCount = ALL_CATEGORIES.filter(c => TOOLS.some(t => t.category === c.id)).length;

  return (
    <PageLayout
      icon={Info}
      title="About NextTool"
      subtitle={`${workingToolCount()}+ free browser tools across ${categoryCount} categories, built and maintained independently`}
      onBack={onBack}
      showUpdated={false}
    >
      <PageHighlights items={PILLARS} />

      <PageProse>
        <PageSection title="What NextTool is">
          <p>
            NextTool is a free collection of everyday file and developer utilities that run entirely
            inside your web browser. You can merge and split PDFs, compress and convert images,
            remove backgrounds with an on-device AI model, format JSON and SQL, generate passwords
            and QR codes, convert units and time zones, and dozens of other small jobs that normally
            require either desktop software or a website that wants your files on its servers.
          </p>
          <p>
            The whole site is a static web app with no user accounts and nowhere to upload your
            files. When you open a tool, the code for that tool is downloaded to your browser and
            runs locally, the same way a spreadsheet runs on your laptop. The only things we keep
            about you are a message you choose to send us through the Contact form, and the
            payment record if you choose to support the site.
          </p>
        </PageSection>

        <PageSection title="Why we built it">
          <p>
            Most "free online converter" sites work by uploading your document to a server you know
            nothing about, processing it there, and holding the result behind a watermark, a daily
            limit or a subscription prompt. For a contract, a passport scan or an internal
            spreadsheet, that trade is a bad one.
          </p>
          <p>
            Browsers became powerful enough to do this work themselves. NextTool exists to prove
            that point in practice: the same tasks, without an upload wait, without the file leaving
            your machine, and without asking for an email address first.
          </p>
        </PageSection>

        <PageSection title="How we make decisions">
          <PageList
            items={[
              <><strong className="text-foreground">Local first.</strong> If a feature cannot be built client-side, we would rather not ship it than start uploading your files.</>,
              <><strong className="text-foreground">No dark patterns.</strong> No forced sign-ups, no fake progress bars, no "your download is ready, install this app" detours.</>,
              <><strong className="text-foreground">Honest labelling.</strong> Tools that are still in progress are marked as coming soon rather than dressed up as finished.</>,
              <><strong className="text-foreground">Ads never see your files.</strong> Advertising pays for the site, but ad networks never receive the files or text you work on, because those never leave your browser.</>,
            ]}
          />
        </PageSection>

        <PageSection title="Who runs it">
          <p>
            NextTool is an independent project, built and maintained in India. It is not
            affiliated with, endorsed by or sponsored by Adobe, Google, Microsoft, iLovePDF,
            SmallPDF or any other company whose file formats or products are mentioned on this
            site.
          </p>
          <p>
            Editorial content, the tool guides, FAQs and how-to explanations you see across the
            site, is written by us for this site and is not syndicated from elsewhere.
          </p>
        </PageSection>

        <PageSection title="How we pay for it">
          <p>
            Hosting, bandwidth and development time are paid for by advertising served through
            Google AdSense and by optional support payments. Advertisers have no influence over
            which tools we build, and no advertiser or ad network receives the files you process.
            Full detail is in our Privacy Policy and Cookie Policy.
          </p>
        </PageSection>

        <PageSection title="Talk to us">
          <p>
            Bug reports, missing features and corrections are genuinely welcome; many
            improvements to this site started as somebody's email. Reach us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110">
              {CONTACT_EMAIL}
            </a>{' '}
            or through the contact page.
          </p>
        </PageSection>
      </PageProse>

      <button
        onClick={onOpenContact}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold hover:brightness-110 transition-all"
      >
        <Mail className="w-4 h-4" /> Contact us
      </button>
    </PageLayout>
  );
};
