import React from 'react';
import { Mail, Instagram, Youtube, LayoutGrid, ShieldCheck, Sparkles, LifeBuoy, FolderTree, ArrowUpRight, Heart, Blocks } from 'lucide-react';
import { ToolCategory } from '../types';
import { SUPPORT_URL } from '../config/support';
import { workingToolCount } from '../utils/toolStats';

interface FooterProps {
  onOpenPrivacy: () => void;
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
  onGoHome: () => void;
  onOpenFaq: () => void;
  onOpenCategories: () => void;
}

const POPULAR_TOOLS = [
  { id: 'pdf-merge',          label: 'PDF Merge' },
  { id: 'image-compressor',   label: 'Image Compressor' },
  { id: 'json-formatter',     label: 'JSON Formatter' },
  { id: 'ai-bg-remover',      label: 'Background Remover' },
  { id: 'password-generator', label: 'Password Generator' },
];

const linkClass =
  'text-[13px] text-muted-foreground hover:text-primary transition-colors duration-150 text-left';

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy, onSelectTool, onSelectCategory, onGoHome, onOpenFaq, onOpenCategories,
}) => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-9">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <button onClick={onGoHome} className="flex items-center gap-2.5" aria-label="NextTool Home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary text-white flex items-center justify-center shrink-0">
                <Blocks className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <span className="text-[18px] font-extrabold tracking-[-0.02em] text-foreground">
                <span>Next</span><span className="text-primary">Tool</span>
              </span>
            </button>
            <p className="mt-3.5 text-[13px] text-muted-foreground leading-relaxed max-w-sm">
              Free browser-based tools for PDF, image, developer and AI tasks.
              Everything runs locally on your device.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-4 rounded-full text-[11px] font-medium bg-success/10 border border-success/25 text-success">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              Files never leave your device
            </div>
            <div className="flex items-center gap-2 mt-5">
              <a
                href="mailto:dk.coder7250@gmail.com"
                aria-label="Email us"
                title="Email"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-150"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/dkcoder8/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram - dkcoder8"
                title="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-150"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@dkcoder"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube - dkcoder"
                title="YouTube"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-150"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="section-label mb-3.5">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onSelectCategory('all')} className={`${linkClass} inline-flex items-center gap-2`}>
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" /> All Tools
                </button>
              </li>
              <li>
                <button onClick={onOpenCategories} className={`${linkClass} inline-flex items-center gap-2`}>
                  <FolderTree className="w-3.5 h-3.5 shrink-0" /> Categories
                </button>
              </li>
              <li>
                <button onClick={onGoHome} className={linkClass}>Popular Tools</button>
              </li>
              {POPULAR_TOOLS.slice(0, 3).map(t => (
                <li key={t.id}>
                  <button onClick={() => onSelectTool(t.id)} className={linkClass}>{t.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="section-label mb-3.5">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onOpenFaq} className={`${linkClass} inline-flex items-center gap-2`}>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" /> FAQ
                </button>
              </li>
              <li>
                <a href="mailto:dk.coder7250@gmail.com" className={`${linkClass} inline-flex items-center gap-2`}>
                  <LifeBuoy className="w-3.5 h-3.5 shrink-0" /> Support
                </a>
              </li>
              <li>
                <a href="mailto:dk.coder7250@gmail.com" className={linkClass}>Feedback</a>
              </li>
              {SUPPORT_URL && (
                <li>
                  <a
                    href={SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} inline-flex items-center gap-2`}
                  >
                    <Heart className="w-3.5 h-3.5 shrink-0" /> Support Us
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="section-label mb-3.5">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:dk.coder7250@gmail.com" className={linkClass}>Contact</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="section-label mb-3.5">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onOpenPrivacy} className={`${linkClass} inline-flex items-center gap-2`}>
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA strip */}
        <div className="mt-9 sm:mt-11 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 px-5 py-4">
          <p className="text-[13px] text-foreground font-medium">
            {workingToolCount()}+ free tools, no sign-up. Ready when you are.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-500 hover:brightness-110 transition-all duration-150"
              >
                <Heart className="w-3.5 h-3.5" /> Support NextTool
              </a>
            )}
            <button
              onClick={() => onSelectCategory('all')}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:brightness-110 transition-all duration-150"
            >
              Browse all tools <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-[12px] text-muted-foreground text-center sm:text-left">
          <span>© 2026 NextTool. All rights reserved.</span>
          <span>{workingToolCount()} tools · client-side only · made for the web</span>
        </div>
      </div>
    </footer>
  );
};
