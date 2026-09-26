import React, { useRef, useState } from 'react';
import {
  ArrowLeft, Mail, Send, Bug, Scale, Instagram, Copy, Check, Loader2,
  CheckCircle2, AlertTriangle, Lightbulb,
} from 'lucide-react';
import { CONTACT_EMAIL } from '../config/pages';
import {
  CONTACT_LIMITS, ContactError, ContactErrorKind, ContactTopic, TURNSTILE_SITE_KEY,
  isContactConfigured, sendContactMessage,
} from '../lib/contact';
import { Turnstile, TurnstileHandle } from '../components/Turnstile';

/** What to tell someone after a failed send, and what they can do about it. */
const ERROR_TEXT: Record<ContactErrorKind, string> = {
  captcha: 'The verification check did not pass. Complete it again, then resend.',
  rate: 'Too many messages have been sent in a short time. Wait a few minutes and try again, or use your own email below.',
  invalid: 'Check your email address and that the message has at least 10 characters, then resend.',
  network: 'The message did not send. Your text is still here: try again, or send it from your own email with the links below.',
};

interface ContactProps {
  onBack: () => void;
}

const TOPICS: {
  id: ContactTopic;
  icon: React.ElementType;
  /** Short name for the segmented control. */
  short: string;
  /** Full name, used in the email subject. */
  label: string;
  hint: string;
  /** Prompt in the message box, so people include what we need to answer this kind of message. */
  placeholder: string;
}[] = [
  {
    id: 'support', icon: Bug, short: 'Bug or problem', label: 'Support & bug reports',
    hint: 'A tool misbehaved, produced a broken file or will not open.',
    placeholder: 'Which tool were you using, and in which browser? What did you expect, and what happened instead? Include any message shown on screen.',
  },
  {
    id: 'feature', icon: Lightbulb, short: 'Idea', label: 'Feature requests',
    hint: 'A tool you wish existed, or an option missing from one that does.',
    placeholder: 'What would you like to do that NextTool cannot do yet? A real example of the file or task helps a lot.',
  },
  {
    id: 'legal', icon: Scale, short: 'Legal & privacy', label: 'Legal & privacy',
    hint: 'Copyright, data protection and takedown requests. These are answered first.',
    placeholder: 'Describe your request. To have a message deleted, give the email address you wrote from.',
  },
];

const fieldClass =
  'w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground ' +
  'placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/60 transition-colors';

const labelClass = 'block text-[13px] font-semibold text-foreground mb-2';

const linkClass = 'font-semibold text-primary underline-offset-2 hover:underline';

export const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const [topic, setTopic]     = useState<ContactTopic>('support');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  // Left empty by people; bots that fill every field give themselves away.
  const [website, setWebsite] = useState('');
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorKind, setErrorKind] = useState<ContactErrorKind>('network');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const captcha = useRef<TurnstileHandle>(null);
  const [sentTo, setSentTo]   = useState('');
  const [copied, setCopied]   = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const activeTopic = TOPICS.find(t => t.id === topic) ?? TOPICS[0];
  const subjectText = `[NextTool] ${activeTopic.label}${name ? `, ${name}` : ''}`;
  const bodyText = message ? `${message}\n\n${name || 'A NextTool user'}` : '';
  const mailtoHref =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

  // Desktop browsers only honour mailto: when the OS has a default mail app. Plenty of
  // laptops never had one configured, so the click silently does nothing. This opens a
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
      /* clipboard blocked; the address is shown on screen for manual copying */
    }
  };

  /** Fallback for visitors with no mail client wired up: paste this into any webmail. */
  const copyMessage = () =>
    copyText(`To: ${CONTACT_EMAIL}\nSubject: ${subjectText}\n\n${bodyText}`, setCopied);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending' || !captchaToken) return;
    // Honeypot tripped: look successful so the bot moves on, store nothing.
    if (website) { setStatus('sent'); return; }
    setStatus('sending');
    try {
      await sendContactMessage({ topic, name, email, message }, captchaToken);
      setSentTo(email.trim());
      setStatus('sent');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      setErrorKind(err instanceof ContactError ? err.kind : 'network');
      setStatus('error');
    } finally {
      // A token is valid for one check only, whatever the outcome.
      captcha.current?.reset();
    }
  };

  const messageLength = message.trim().length;
  const messageTooShort = messageLength > 0 && messageLength < CONTACT_LIMITS.messageMin;

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="btn-ghost mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tools</span>
      </button>

      {/* Mobile order: intro, form, details. From lg: intro and details on the
          left, the form spanning both rows on the right. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-x-12 gap-y-8">

        {/* ── Intro ── */}
        <header className="lg:col-start-1 lg:row-start-1 lg:pt-4">
          <h1 className="font-heading text-[32px] sm:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.05] text-foreground">
            Contact Us
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground max-w-[42ch]">
            Found a bug, missing a tool, or have a legal question? Write to us here and a
            person reads it.
          </p>
        </header>

        {/* ── The form ── */}
        <section
          aria-labelledby="contact-form-heading"
          className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start rounded-2xl border border-border bg-card shadow-card p-5 sm:p-8"
        >
          <h2 id="contact-form-heading" className="sr-only">Send us a message</h2>

          {status === 'sent' ? (
            <div role="status" className="py-8 sm:py-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <p className="font-heading text-[22px] font-extrabold tracking-[-0.02em] text-foreground mt-5">
                Message sent
              </p>
              <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed max-w-[38ch] mx-auto">
                We will reply to{' '}
                {sentTo ? <span className="font-semibold text-foreground break-all">{sentTo}</span> : 'the email address you gave'}.
                If you do not see it, check your spam folder.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-muted text-[13px] font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              {/* Topic: a segmented control; the prompt below adapts to it. */}
              <fieldset>
                <legend className={labelClass}>What is it about?</legend>
                <div role="radiogroup" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted border border-border">
                  {TOPICS.map(t => {
                    const Icon = t.icon;
                    const selected = t.id === topic;
                    return (
                      <label
                        key={t.id}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 min-h-11 px-2 py-2 rounded-lg cursor-pointer
                          text-center text-[12.5px] sm:text-[13px] font-semibold leading-tight transition-colors
                          focus-within:ring-2 focus-within:ring-primary/40
                          ${selected
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <input
                          type="radio"
                          name="topic"
                          value={t.id}
                          checked={selected}
                          onChange={() => setTopic(t.id)}
                          className="sr-only"
                        />
                        <Icon className={`w-4 h-4 shrink-0 ${selected ? 'text-primary' : ''}`} aria-hidden="true" />
                        {t.short}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">{activeTopic.hint}</p>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-email" className={labelClass}>Your email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={CONTACT_LIMITS.email}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Name <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    maxLength={CONTACT_LIMITS.name}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="How should we address you?"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>Message</label>
                <textarea
                  id="contact-message"
                  required
                  minLength={CONTACT_LIMITS.messageMin}
                  maxLength={CONTACT_LIMITS.messageMax}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={7}
                  placeholder={activeTopic.placeholder}
                  aria-describedby="contact-message-hint"
                  className={`${fieldClass} resize-y leading-relaxed`}
                />
                <div id="contact-message-hint" className="flex justify-between gap-4 mt-2 text-[12px]">
                  <span className={messageTooShort ? 'text-danger' : 'text-muted-foreground'}>
                    {messageTooShort
                      ? `Add a little more detail, at least ${CONTACT_LIMITS.messageMin} characters.`
                      : 'Do not include passwords or confidential documents.'}
                  </span>
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    {message.length.toLocaleString('en')}/{CONTACT_LIMITS.messageMax.toLocaleString('en')}
                  </span>
                </div>
              </div>

              {/* Honeypot: hidden from people and screen readers, filled in by bots. */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>

              {status === 'error' && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-[13px] text-foreground leading-relaxed">{ERROR_TEXT[errorKind]}</p>
                </div>
              )}

              {!isContactConfigured && (
                <p className="text-[13px] text-muted-foreground">
                  The form is unavailable right now. Email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>{CONTACT_EMAIL}</a> instead.
                </p>
              )}

              {isContactConfigured && (
                <div>
                  <Turnstile
                    ref={captcha}
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={setCaptchaToken}
                    onLoadError={() => setCaptchaFailed(true)}
                  />
                  {captchaFailed && (
                    <p className="text-[13px] text-danger mt-2">
                      The verification check could not load, often because of a content blocker.
                      Allow challenges.cloudflare.com, or use your own email below.
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={status === 'sending' || !isContactConfigured || !captchaToken}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-primary text-primary-foreground
                    text-[14px] font-semibold whitespace-nowrap hover:brightness-110 transition-all
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending</>
                    : <><Send className="w-4 h-4" /> Send message</>}
                </button>

                {/* The same message through the visitor's own email instead. */}
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Rather use your own email? Open this message in{' '}
                  <a href={mailtoHref} className={linkClass}>your email app</a> or{' '}
                  <a href={gmailHref} target="_blank" rel="noopener noreferrer" className={linkClass}>Gmail</a>, or{' '}
                  <button type="button" onClick={copyMessage} className={linkClass}>
                    {copied ? 'copied' : 'copy it'}
                  </button>.
                </p>
              </div>
            </form>
          )}
        </section>

        {/* ── Other ways to reach us ── */}
        <div className="lg:col-start-1 lg:row-start-2 space-y-8">
          <dl className="divide-y divide-border border-y border-border">
            <div className="py-4 flex gap-3.5">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-[13px] font-semibold text-foreground">Email</dt>
                <dd className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[14px] text-muted-foreground hover:text-primary transition-colors break-all">
                    {CONTACT_EMAIL}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyText(CONTACT_EMAIL, setAddrCopied)}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline underline-offset-2"
                  >
                    {addrCopied
                      ? <><Check className="w-3.5 h-3.5" /> Copied</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </dd>
              </div>
            </div>
            <div className="py-4 flex gap-3.5">
              <Instagram className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <dt className="text-[13px] font-semibold text-foreground">Social</dt>
                <dd className="mt-0.5 text-[14px] text-muted-foreground">
                  <a href="https://www.instagram.com/dkcoder8/" target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-2 hover:text-primary transition-colors">Instagram</a>
                  {' and '}
                  <a href="https://www.youtube.com/@dkcoder" target="_blank" rel="noopener noreferrer" className="underline decoration-border underline-offset-2 hover:text-primary transition-colors">YouTube</a>
                  , though email gets a faster answer.
                </dd>
              </div>
            </div>
          </dl>

          <div className="space-y-6 text-[14px] leading-relaxed text-muted-foreground max-w-[60ch]">
            <section>
              <h2 className="text-[15px] font-bold text-foreground mb-1.5">Before you write about a broken file</h2>
              <p>
                Every tool runs on your own device, so we cannot see the file you were working
                with, and we do not want to. Describe the problem instead: which tool, which
                browser and version, roughly how large the file was, and any message shown on
                screen.
              </p>
            </section>
            <section>
              <h2 className="text-[15px] font-bold text-foreground mb-1.5">What happens to your message</h2>
              <p>
                It is stored securely so we can read and answer it, and deleted within 12 months.
                We never add you to a mailing list, and you can ask us to delete it at any time.
                Details are in our{' '}
                <a href="/privacy" className={linkClass}>Privacy Policy</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
