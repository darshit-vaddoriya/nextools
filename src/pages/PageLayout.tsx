import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { POLICY_LAST_UPDATED } from '../config/pages';

interface PageLayoutProps {
  /** Kept for the callers; the redesigned header no longer shows a page icon. */
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  onBack: () => void;
  /** Show the "last updated" date (policy pages); off for About and Contact. */
  showUpdated?: boolean;
  children: React.ReactNode;
}

/** URL fragment for a section title: "4. Information we do collect" -> "information-we-do-collect". */
export const sectionId = (title: string) =>
  title.toLowerCase().replace(/^\d+\.\s*/, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Shared shell for About and the legal pages: a document, not a card. A large
 * title and lead paragraph, then the text at a readable measure, with an
 * "On this page" index beside it on wide screens once there are enough
 * sections to need one.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title, subtitle, onBack, showUpdated = true, children,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  // Read from the rendered sections after mount, so every page gets an index
  // without listing its sections twice. Navigation only, so it is fine that
  // the prerendered HTML does not carry it.
  const [toc, setToc] = useState<{ id: string; title: string }[]>([]);
  const [active, setActive] = useState('');

  useEffect(() => {
    const headings = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('h2[data-toc]') ?? []);
    setToc(headings.map(h => ({ id: h.id, title: h.textContent ?? '' })));
    if (!headings.length) return;
    const onScroll = () => {
      let current = headings[0].id;
      for (const h of headings) if (h.getBoundingClientRect().top <= 140) current = h.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showToc = toc.length >= 5;

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="btn-ghost mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tools</span>
      </button>

      <header className="max-w-[68ch] pb-8 border-b border-border">
        <h1 className="font-heading text-[32px] sm:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.05] text-foreground">
          {title}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{subtitle}</p>
        {showUpdated && (
          <p className="mt-4 text-[13px] text-muted-foreground">
            Last updated <time className="font-semibold text-foreground">{POLICY_LAST_UPDATED}</time>
          </p>
        )}
      </header>

      <div className={`pt-8 ${showToc ? 'lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12' : ''}`}>
        {showToc && (
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-[90px]">
              <p className="text-[13px] font-semibold text-foreground mb-3">On this page</p>
              <ol className="space-y-0.5 border-l border-border">
                {toc.map(item => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={active === item.id ? 'location' : undefined}
                      className={`block -ml-px border-l-2 pl-3 py-1 text-[12.5px] leading-snug transition-colors
                        ${active === item.id
                          ? 'border-primary text-foreground font-semibold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        )}
        <div ref={bodyRef} className="min-w-0 max-w-[68ch] space-y-10">
          {children}
        </div>
      </div>
    </div>
  );
};

/** A titled block of prose. Its heading gets an anchor and an entry in the page index. */
export const PageSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title, children,
}) => (
  <section>
    <h2
      id={sectionId(title)}
      data-toc=""
      className="scroll-mt-24 font-heading text-[19px] sm:text-[20px] font-bold tracking-[-0.015em] text-foreground mb-3"
    >
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </section>
);

/** Wrapper that gives the stacked sections their shared prose styling. */
export const PageProse: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-10 text-[15px] text-foreground/80 leading-[1.7]">
    {children}
  </div>
);

export const PageList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2.5 pl-5">
    {items.map((item, i) => (
      <li key={i} className="list-disc marker:text-primary/60 pl-1">{item}</li>
    ))}
  </ul>
);

/**
 * The short "at a glance" points some pages open with: icon, title, one
 * sentence each, as a list rather than a row of boxes.
 */
export const PageHighlights: React.FC<{
  items: { icon: LucideIcon; title: string; desc: string }[];
}> = ({ items }) => (
  // Pairs sit side by side; an odd count reads better as a single column
  // than as a grid with a gap in it.
  <ul className={`grid grid-cols-1 gap-x-8 gap-y-6 ${items.length % 2 === 0 ? 'sm:grid-cols-2' : ''}`}>
    {items.map(item => {
      const Icon = item.icon;
      return (
        <li key={item.title} className="flex gap-3.5">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-foreground">{item.title}</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
          </div>
        </li>
      );
    })}
  </ul>
);

export const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href, children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary underline underline-offset-2 [overflow-wrap:anywhere] hover:brightness-110"
  >
    {children}
  </a>
);
