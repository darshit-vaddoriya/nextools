import React from 'react';
import { ArrowLeft, Layers, LucideIcon } from 'lucide-react';
import { POLICY_LAST_UPDATED } from '../config/pages';

interface PageLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onBack: () => void;
  /** Hide the "last updated" strip on non-policy pages */
  showUpdated?: boolean;
  children: React.ReactNode;
}

/** Shared shell for the static About/Contact/legal pages. */
export const PageLayout: React.FC<PageLayoutProps> = ({
  icon: Icon, title, subtitle, onBack, showUpdated = true, children,
}) => (
  <div className="space-y-6 animate-fade-up">
    <button onClick={onBack} className="btn-ghost">
      <ArrowLeft className="w-4 h-4" />
      <span>Back to Tools</span>
    </button>

    <div className="rounded-2xl border border-border bg-card shadow-card p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {title}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>

      {children}

      {showUpdated && (
        <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Last updated: {POLICY_LAST_UPDATED} • NextTool © 2026</span>
        </div>
      )}
    </div>
  </div>
);

/** A numbered prose block used throughout the legal pages. */
export const PageSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title, children,
}) => (
  <div>
    <h2 className="text-[15px] font-bold text-foreground mb-2">{title}</h2>
    <div className="space-y-3">{children}</div>
  </div>
);

/** Wrapper that gives the stacked sections their shared prose styling. */
export const PageProse: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-6 text-[13px] text-foreground/80 leading-relaxed">
    {children}
  </div>
);

export const PageList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-1.5 pl-4">
    {items.map((item, i) => (
      <li key={i} className="list-disc marker:text-primary/60">{item}</li>
    ))}
  </ul>
);

export const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href, children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary underline underline-offset-2 hover:brightness-110"
  >
    {children}
  </a>
);
