import React from 'react';
import { Mail, Instagram, Youtube } from 'lucide-react';
import { ToolCategory } from '../types';
import { TOOLS } from '../config/tools';

interface FooterProps {
  onOpenPrivacy: () => void;
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: ToolCategory | 'all') => void;
}

const POPULAR_TOOLS = [
  { id: 'pdf-merge',          label: 'PDF Merge' },
  { id: 'image-compressor',   label: 'Image Compressor' },
  { id: 'json-formatter',     label: 'JSON Formatter' },
  { id: 'ai-bg-remover',      label: 'Background Remover' },
  { id: 'password-generator', label: 'Password Generator' },
];

const ALL_FOOTER_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'pdf',   label: 'PDF Tools' },
  { id: 'image', label: 'Image Tools' },
  { id: 'dev',   label: 'Developer Tools' },
  { id: 'ai',    label: 'AI Tools' },
  { id: 'word',  label: 'Word & Office' },
];
const CATEGORIES = ALL_FOOTER_CATEGORIES.filter(c => TOOLS.some(t => t.category === c.id));

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onSelectTool, onSelectCategory }) => {
  return (
    <footer className="border-t dark:border-dark-border border-slate-200 dark:bg-dark-bg bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0
                shadow-[0_2px_10px_rgba(99,102,241,0.35)]">
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1 }}>
                  DK
                </span>
              </div>
              <span className="text-[16px] font-bold tracking-[-0.02em] dark:text-white text-slate-900">
                Next<span className="text-indigo-500">Tool</span>
              </span>
            </div>
            <p className="mt-3 text-[13px] dark:text-zinc-500 text-slate-500 leading-relaxed max-w-sm">
              Free browser-based tools for PDF, image, developer and AI tasks.
              Everything runs locally on your device.
            </p>

            {/* Contact */}
            <div className="mt-5">
              <h4 className="section-label mb-3">Contact</h4>
              <a
                href="mailto:dk.coder7250@gmail.com"
                className="inline-flex items-center gap-2 text-[13px] dark:text-zinc-500 dark:hover:text-indigo-400 text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                dk.coder7250@gmail.com
              </a>
              <div className="flex items-center gap-2 mt-3">
                <a
                  href="https://www.instagram.com/dkcoder8/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram - dkcoder8"
                  title="Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/[0.16] dark:hover:bg-white/[0.08]
                    bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white hover:border-slate-300 transition-all duration-150"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@dkcoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube - dkcoder"
                  title="YouTube"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/[0.16] dark:hover:bg-white/[0.08]
                    bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white hover:border-slate-300 transition-all duration-150"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="section-label mb-3">Popular Tools</h4>
            <ul className="space-y-2">
              {POPULAR_TOOLS.map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => onSelectTool(t.id)}
                    className="text-[13px] dark:text-zinc-500 dark:hover:text-indigo-400 text-slate-500 hover:text-indigo-600 transition-colors text-left"
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories + Legal */}
          <div>
            <h4 className="section-label mb-3">Categories</h4>
            <ul className="space-y-2 mb-6">
              {CATEGORIES.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelectCategory(c.id)}
                    className="text-[13px] dark:text-zinc-500 dark:hover:text-indigo-400 text-slate-500 hover:text-indigo-600 transition-colors text-left"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
            <h4 className="section-label mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenPrivacy} className="text-[13px] dark:text-zinc-500 dark:hover:text-indigo-400 text-slate-500 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t dark:border-dark-border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] dark:text-zinc-600 text-slate-400">
          <span>© 2026 NextTool. All rights reserved.</span>
          <span className="dark:text-zinc-700 text-slate-500">{TOOLS.length} tools · client-side only</span>
        </div>
      </div>
    </footer>
  );
};
