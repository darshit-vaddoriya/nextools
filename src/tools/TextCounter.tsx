import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { BarChart2, Clock, FileText, Hash, AlignLeft } from 'lucide-react';

export const TextCounter: React.FC = () => {
  const [text, setText] = useState<string>(
    `This is a sample paragraph. NexTools runs all of its tools directly in your browser, so your files stay on your device. There is no upload, no account and no sign-up needed.`
  );

  const words         = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars         = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const lines         = text ? text.split('\n').length : 0;
  const sentences     = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphs    = text.trim() ? text.split(/\n\s*\n/).length : 0;
  const readingTime   = Math.ceil(words / 200);

  const stats = [
    { icon: AlignLeft,  label: 'Words',              value: words,         color: 'text-indigo-500', bg: 'dark:bg-indigo-500/10 bg-indigo-50' },
    { icon: Hash,       label: 'Characters',          value: chars,         color: 'text-emerald-500', bg: 'dark:bg-emerald-500/10 bg-emerald-50' },
    { icon: Hash,       label: 'Chars (no spaces)',   value: charsNoSpaces, color: 'text-cyan-500', bg: 'dark:bg-cyan-500/10 bg-cyan-50' },
    { icon: BarChart2,  label: 'Lines',               value: lines,         color: 'text-purple-500', bg: 'dark:bg-purple-500/10 bg-purple-50' },
    { icon: FileText,   label: 'Sentences',           value: sentences,     color: 'text-amber-500', bg: 'dark:bg-amber-500/10 bg-amber-50' },
    { icon: FileText,   label: 'Paragraphs',          value: paragraphs,    color: 'text-pink-500', bg: 'dark:bg-pink-500/10 bg-pink-50' },
    { icon: Clock,      label: 'Reading Time',        value: `${readingTime} min`, color: 'text-teal-500', bg: 'dark:bg-teal-500/10 bg-teal-50' },
    { icon: BarChart2,  label: 'Avg Word Length',     value: words > 0 ? (charsNoSpaces / words).toFixed(1) : '0', color: 'text-rose-500', bg: 'dark:bg-rose-500/10 bg-rose-50' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-slate-200 p-4 flex flex-col items-center text-center space-y-1.5"
            >
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-0.5`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] font-medium dark:text-zinc-500 text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Editor */}
      <div className="dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-slate-200 overflow-hidden flex flex-col h-[340px]">
        <div className="px-4 py-2.5 dark:bg-dark-bg/50 bg-slate-50 border-b dark:border-dark-border border-slate-200 text-xs font-semibold dark:text-zinc-400 text-slate-600 flex items-center justify-between">
          <span>Input Text</span>
          <CopyButton text={text} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text for live analysis…"
          className="flex-1 w-full bg-transparent p-4 text-sm dark:text-zinc-300 text-slate-700 dark:placeholder-zinc-700 placeholder-slate-400 resize-none focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
};
