import React, { useMemo, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { BarChart2, Clock, FileText, Hash, AlignLeft } from 'lucide-react';

/** Vowel groups, less a silent final e: the usual approximation behind readability scores. */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch Reading Ease bands, as published with the formula. */
function readingEaseLabel(score: number): string {
  if (score >= 90) return 'Very easy';
  if (score >= 70) return 'Easy';
  if (score >= 60) return 'Plain English';
  if (score >= 50) return 'Fairly difficult';
  if (score >= 30) return 'Difficult';
  return 'Very difficult';
}

/** Common English words left out of "most used", which would otherwise always be "the" and "and". */
const STOP_WORDS = new Set(('a an the and or but if then than so of to in on at by for with from into over as is are was were be been being '
  + 'it its this that these those there here i you he she we they me him her us them my your his our their not no do does did done '
  + 'have has had will would can could should may might must just also very more most such only own same too what which who whom '
  + 'when where why how all any both each few other some about after before again against between during under until up down out off').split(' '));

export const TextCounter: React.FC = () => {
  const [text, setText] = useState<string>(
    `This is a sample paragraph. NextTool runs all of its tools directly in your browser, so your files stay on your device. There is no upload, no account and no sign-up needed.`
  );

  const trimmed       = text.trim();
  const words         = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars         = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const lines         = text ? text.split('\n').length : 0;
  const sentences     = trimmed ? (text.match(/(?<![0-9])[.!?]+(?=\s|$)/g) || []).length : 0;
  const paragraphs    = trimmed ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const readingTime   = words === 0 ? '0 min' : words < 200 ? `${Math.max(1, Math.round((words / 200) * 60))} sec` : `${Math.ceil(words / 200)} min`;

  // Reading ease only means something for English prose of a reasonable length.
  const readability = useMemo(() => {
    const latinWords = trimmed.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
    if (latinWords.length < 100 || latinWords.length < words * 0.8) return null;
    const syl = latinWords.reduce((n, w) => n + syllables(w), 0);
    const score = 206.835 - 1.015 * (latinWords.length / Math.max(1, sentences)) - 84.6 * (syl / latinWords.length);
    const rounded = Math.round(Math.max(0, Math.min(100, score)));
    return { score: rounded, label: readingEaseLabel(rounded) };
  }, [trimmed, words, sentences]);

  const topWords = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of trimmed.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) ?? []) {
      if (w.length < 3 || STOP_WORDS.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    return [...counts.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
  }, [trimmed]);

  const stats = [
    { icon: AlignLeft,  label: 'Words',              value: words,         color: 'text-indigo-700 dark:text-indigo-400', bg: 'dark:bg-indigo-500/10 bg-indigo-50' },
    { icon: Hash,       label: 'Characters',          value: chars,         color: 'text-emerald-700 dark:text-emerald-400', bg: 'dark:bg-emerald-500/10 bg-emerald-50' },
    { icon: Hash,       label: 'Chars (no spaces)',   value: charsNoSpaces, color: 'text-cyan-700 dark:text-cyan-400', bg: 'dark:bg-cyan-500/10 bg-cyan-50' },
    { icon: BarChart2,  label: 'Lines',               value: lines,         color: 'text-purple-700 dark:text-purple-400', bg: 'dark:bg-purple-500/10 bg-purple-50' },
    { icon: FileText,   label: 'Sentences',           value: sentences,     color: 'text-amber-700 dark:text-amber-400', bg: 'dark:bg-amber-500/10 bg-amber-50' },
    { icon: FileText,   label: 'Paragraphs',          value: paragraphs,    color: 'text-pink-700 dark:text-pink-400', bg: 'dark:bg-pink-500/10 bg-pink-50' },
    { icon: Clock,      label: 'Reading Time',        value: readingTime, color: 'text-teal-700 dark:text-teal-400', bg: 'dark:bg-teal-500/10 bg-teal-50' },
    { icon: BarChart2,  label: 'Avg Word Length',     value: words > 0 ? (charsNoSpaces / words).toFixed(1) : '0', color: 'text-rose-700 dark:text-rose-400', bg: 'dark:bg-rose-500/10 bg-rose-50' },
  ];

  return (
    <div className="space-y-4">
      {/* Editor */}
      <div className=" bg-card rounded-xl border  border-border overflow-hidden flex flex-col h-[340px]">
        <div className="px-4 py-2.5  bg-muted border-b  border-border text-xs font-semibold  text-muted-foreground flex items-center justify-between">
          <span>Input Text</span>
          <CopyButton text={text} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text for live analysis…"
          className="flex-1 w-full bg-transparent p-4 text-sm  text-muted-foreground  placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className=" bg-card rounded-xl border  border-border p-4 flex flex-col items-center text-center space-y-1.5"
            >
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-0.5`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] font-medium  text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Readability and most-used words */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Readability (Flesch Reading Ease)</p>
          {readability ? (
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">{readability.score}</span>
              <span className="text-sm font-semibold text-foreground">{readability.label}</span>
            </p>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">Add at least 100 words of English text for a meaningful score.</p>
          )}
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
            0 to 100, higher is easier. Based on sentence length and syllables per word; 60 to 70 reads as plain English.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Most used words</p>
          {topWords.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {topWords.map(([w, n]) => (
                <li key={w} className="rounded-md bg-muted px-2 py-1 text-[12.5px] text-foreground">
                  {w} <span className="font-mono text-muted-foreground">×{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">Words used more than once appear here, leaving out common ones like "the" and "and".</p>
          )}
        </div>
      </div>
    </div>
  );
};
