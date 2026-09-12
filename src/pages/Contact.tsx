import React, { useState } from 'react';
import { Mail, Send, Bug, Scale, Clock, Instagram, Youtube, Copy, Check, Globe } from 'lucide-react';
import { PageLayout, PageProse, PageSection } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';

interface ContactProps {
  onBack: () => void;
}

const TOPICS = [
  { id: 'support',   icon: Bug,       label: 'Support & bug reports',  desc: 'A tool misbehaved, produced a broken file or will not open.' },
  { id: 'feature',   icon: Send,      label: 'Feature requests',       desc: 'A tool you wish existed, or an option missing from one that does.' },
  { id: 'legal',     icon: Scale,     label: 'Legal & privacy',        desc: 'Copyright, data protection and takedown requests.' },
];

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[13px] text-foreground ' +
  'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all';

export const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const [topic, setTopic]     = useState('support');
  const [name, setName]       = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied]   = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const topicLabel = TOPICS.find(t => t.id === topic)?.label ?? 'Support';
  const subjectText = `[NextTool] ${topicLabel}${name ? `, ${name}` : ''}`;
  const bodyText = message ? `${message}\n\n, ${name || 'NextTool user'}` : '';
  const mailtoHref =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

  // Desktop browsers only honour mailto: when the OS has a default mail app. Plenty of
  // laptops never had one configured, so the click silently does nothing, this opens a
  // pre-filled compose window in the browser instead.
  const gmailHref =
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&to=${encodeURIComponent(CONTACT_EMAIL)}` +
    `&su=${encodeURIComponent(subjectText)}` +
    `&body=${encodeURIComponent(bodyText)}`;

  const copyText = async (text: string, done: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      done(true);
      setTimeout(() => done(false), 2000);
    } catch {
      /* clipboard blocked, the address is shown on screen for manual copying */
    }
  };

  /** Fallback for visitors with no mail client wired up: paste this into any webmail. */
  const copyMessage = () =>
    copyText(`To: ${CONTACT_EMAIL}\nSubject: ${subjectText}\n\n${bodyText}`, setCopied);

  return (
    <PageLayout
      icon={Mail}
      title="Contact Us"
      subtitle="Questions, bug reports, feature ideas or business enquiries, we read every message"
      onBack={onBack}
      showUpdated={false}
    >
      {/* Primary contact card */}
      <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-5 sm:p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary mb-2">
          Email us directly
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[18px] sm:text-[21px] font-extrabold text-foreground tracking-tight hover:text-primary transition-colors break-all"
          >
            {CONTACT_EMAIL}
          </a>
          <button
            type="button"
            onClick={() => copyText(CONTACT_EMAIL, setAddrCopied)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-card text-[11.5px] font-semibold
              text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shrink-0"
          >
            {addrCopied
              ? <><Check className="w-3.5 h-3.5 text-success" /> Copied</>
              : <><Copy className="w-3.5 h-3.5" /> Copy address</>}
          </button>
        </div>
        <p className="text-[12.5px] text-muted-foreground mt-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          We usually reply within two business days.
        </p>
      </div>

      {/* Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TOPICS.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="p-4 rounded-xl border border-border bg-muted/50">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <h3 className="text-[13px] font-bold text-foreground">{t.label}</h3>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Compose form, opens the visitor's own mail client, no data is sent to us */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-[15px] font-bold text-foreground mb-1">Write to us</h2>
        <p className="text-[12.5px] text-muted-foreground mb-5">
          This form composes the message in your own email app, nothing is submitted to or stored
          on our servers.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="contact-topic" className="block text-[12px] font-semibold text-foreground mb-1.5">
              Topic
            </label>
            <select
              id="contact-topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className={inputClass}
            >
              {TOPICS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contact-name" className="block text-[12px] font-semibold text-foreground mb-1.5">
              Your name <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-[12px] font-semibold text-foreground mb-1.5">
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us which tool you were using, what you expected and what happened instead."
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:brightness-110 transition-all"
            >
              <Send className="w-4 h-4" /> Open in email app
            </a>
            <a
              href={gmailHref}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-muted text-foreground text-[13px] font-semibold hover:border-primary/40 hover:text-primary transition-all"
            >
              <Globe className="w-4 h-4" /> Open in Gmail
            </a>
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-muted text-foreground text-[13px] font-semibold hover:border-primary/40 hover:text-primary transition-all"
            >
              {copied
                ? <><Check className="w-4 h-4 text-success" /> Copied</>
                : <><Copy className="w-4 h-4" /> Copy message</>}
            </button>
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            <span className="font-semibold text-foreground">Open in email app</span> needs a mail
            program installed on your computer. If nothing happens when you click it, use{' '}
            <span className="font-semibold text-foreground">Open in Gmail</span> instead, or{' '}
            <span className="font-semibold text-foreground">Copy message</span> and paste it into
            Outlook or any other webmail.
          </p>
        </div>
      </div>

      <PageProse>
        <PageSection title="Elsewhere">
          <p>
            You can also reach us on social media, though email is the fastest route for anything
            that needs a real answer.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://www.instagram.com/dkcoder8/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.youtube.com/@dkcoder"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </PageSection>

        <PageSection title="Before you write about a broken file">
          <p>
            Because every tool runs on your own device, we cannot see the file you were working
            with, and we do not want to. Please describe the problem instead: which tool, which
            browser and version, roughly how large the file was, and any message shown on screen.
            Do not attach confidential documents to a support email.
          </p>
        </PageSection>
      </PageProse>
    </PageLayout>
  );
};
