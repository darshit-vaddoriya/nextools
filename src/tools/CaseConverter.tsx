import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Type } from 'lucide-react';

export const CaseConverter: React.FC = () => {
  const [text, setText] = useState<string>('hello world developer tools lab');

  const toCamelCase  = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  const toSnakeCase  = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();
  const toKebabCase  = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  const toPascalCase = (s: string) => s.toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, c) => c.toUpperCase());
  const toTitleCase  = (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const cases = [
    { name: 'camelCase',  value: toCamelCase(text),      color: 'text-indigo-500 dark:text-indigo-400' },
    { name: 'snake_case', value: toSnakeCase(text),       color: 'text-emerald-500 dark:text-emerald-400' },
    { name: 'kebab-case', value: toKebabCase(text),       color: 'text-cyan-500 dark:text-cyan-400' },
    { name: 'PascalCase', value: toPascalCase(text),      color: 'text-purple-500 dark:text-purple-400' },
    { name: 'Title Case', value: toTitleCase(text),       color: 'text-pink-500 dark:text-pink-400' },
    { name: 'UPPERCASE',  value: text.toUpperCase(),      color: 'text-amber-500 dark:text-amber-400' },
    { name: 'lowercase',  value: text.toLowerCase(),      color: 'text-teal-500 dark:text-teal-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-slate-200 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="section-label">Source Text</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert case…"
          rows={3}
          className="textarea-base font-mono h-24"
        />
      </div>

      {/* Output cases grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cases.map((c) => (
          <div
            key={c.name}
            className="dark:bg-dark-card bg-white rounded-xl border dark:border-dark-border border-slate-200 p-3.5 space-y-2 dark:hover:border-zinc-700 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold dark:text-zinc-500 text-slate-500 uppercase tracking-wider">
                {c.name}
              </span>
              <CopyButton text={c.value} />
            </div>
            <div className={`dark:bg-dark-bg bg-slate-50 border dark:border-dark-border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-mono font-semibold break-all select-all ${c.color}`}>
              {c.value || <span className="dark:text-zinc-700 text-slate-400 font-normal italic">Converted text will appear here…</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
