import React from 'react';
import { Info, Cpu, Lock, Infinity as InfinityIcon, Mail } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList } from './PageLayout';
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
    desc: 'NextTool is supported by modest advertising and voluntary donations instead of subscriptions, watermarks or file-size limits.',
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PILLARS.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-5 rounded-xl border border-border bg-muted/50">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-[13px] font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <PageProse>
        <PageSection title="What NextTool is">
          <p>
            NextTool is a free collection of everyday file and developer utilities that run entirely
            inside your web browser. You can merge and split PDFs, compress and convert images,
            remove backgrounds with an on-device AI model, format JSON and SQL, generate passwords
            and QR codes, convert units and currencies, and dozens of other small jobs that normally
            require either desktop software or a website that wants your files on its servers.
          </p>
          <p>
            The whole site is a static web app. There is no database, no user account system and no
            upload endpoint. When you open a tool, the code for that tool is downloaded to your
            browser and runs locally, the same way a spreadsheet runs on your laptop.
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
            that point in practice: the same tasks, done faster, without the file ever leaving your
            machine, and without asking for an email address first.
          </p>
        </PageSection>

        <PageSection title="How we make decisions">
          <PageList
            items={[
              <><strong className="text-foreground">Local first.</strong> If a feature cannot be built client-side, we would rather not ship it than start uploading your files.</>,
              <><strong className="text-foreground">No dark patterns.</strong> No forced sign-ups, no fake progress bars, no "your download is ready, install this app" detours.</>,
              <><strong className="text-foreground">Honest labelling.</strong> Tools that are still in progress are marked as coming soon rather than dressed up as finished.</>,
              <><strong className="text-foreground">Ads stay in their lane.</strong> Advertising is kept out of the working area of each tool and is clearly labelled where it appears.</>,
            ]}
          />
        </PageSection>

        <PageSection title="Who runs it">
          <p>
            NextTool is an independent project built and maintained by a small team of web
            developers led by Darshit Vadadoriya. It is not affiliated with, endorsed by or
            sponsored by Adobe, Google, Microsoft, iLovePDF, SmallPDF or any other company whose
            file formats or products are mentioned on this site.
          </p>
          <p>
            Editorial content, the tool guides, FAQs and how-to explanations you see across the
            site, is written by us for this site and is not syndicated from elsewhere.
          </p>
        </PageSection>

        <PageSection title="How we pay for it">
          <p>
            Hosting, bandwidth and development time are paid for by advertising served through
            Google AdSense and by optional reader donations. Advertisers have no influence over
            which tools we build, and no advertiser or ad network receives the files you process.
            Full detail is in our Privacy Policy and Cookie Policy.
          </p>
        </PageSection>

        <PageSection title="Talk to us">
          <p>
            Bug reports, missing features and corrections are genuinely welcome, most of the tools
            on this site started as somebody's email. Reach us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 hover:brightness-110">
              {CONTACT_EMAIL}
            </a>{' '}
            or through the contact page.
          </p>
        </PageSection>
      </PageProse>

      <button
        onClick={onOpenContact}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all"
      >
        <Mail className="w-4 h-4" /> Contact us
      </button>
    </PageLayout>
  );
};
