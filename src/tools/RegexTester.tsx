import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CopyButton } from '../components/CopyButton';
import { errorMessage } from '../utils/errorMessage';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ToolShell, useFullView, PresetChips } from '../components/DevToolChrome';

/** The patterns people actually come to a regex tester to build. */
const PRESETS: { label: string; title: string; pattern: string; text: string }[] = [
  {
    label: 'Email',
    title: 'Match email addresses',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    text: 'Send inquiries to support@toolslab.dev or contact admin@example.com for help.',
  },
  {
    label: 'URL',
    title: 'Match http/https URLs',
    pattern: 'https?://[^\\s/$.?#].[^\\s]*',
    text: 'Docs at https://nexttool.click/blog and mirror http://example.org/page?q=1 are live.',
  },
  {
    label: 'IPv4',
    title: 'Match IPv4 addresses',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    text: 'Gateway 192.168.1.1 forwards to 10.0.0.254 and resolver 8.8.8.8.',
  },
  {
    label: 'Date',
    title: 'Match ISO yyyy-mm-dd dates',
    pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
    text: 'Released 2024-11-03, patched 2025-02-18, next audit 2026-01-30.',
  },
  {
    label: 'Hex colour',
    title: 'Match #RGB and #RRGGBB colours',
    pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b',
    text: 'Primary #7c5cff, surface #fff, accent #1A9E6C, shorthand #f0a.',
  },
  {
    label: 'Phone',
    title: 'Match international phone numbers',
    pattern: '\\+?\\d{1,3}[\\s-]?\\(?\\d{2,4}\\)?[\\s-]?\\d{3,4}[\\s-]?\\d{3,4}',
    text: 'Call +91 98765 43210, +1 (415) 555-0132 or 020-7946-0958.',
  },
];

/** Splits the test string into plain and matched segments so hits can be highlighted in place. */
const segment = (text: string, matches: RegExpMatchArray[]) => {
  const spans = matches
    .filter(m => typeof m.index === 'number')
    .map(m => ({ start: m.index as number, end: (m.index as number) + m[0].length }))
    .filter(s => s.end > s.start)
    .sort((a, b) => a.start - b.start);

  const out: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start < cursor) continue; // skip overlaps
    if (s.start > cursor) out.push({ text: text.slice(cursor, s.start), hit: false });
    out.push({ text: text.slice(s.start, s.end), hit: true });
    cursor = s.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), hit: false });
  return out;
};

export const RegexTester: React.FC = () => {
  const [full, setFull] = useFullView();
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const [pattern, setPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean }>({ g: true, i: true, m: false });
  const [text, setText] = useState<string>(
    'Send inquiries to support@toolslab.dev or contact admin@example.com for help.'
  );
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testRegex = useCallback(() => {
    if (!pattern) { setMatches([]); setError(null); return; }
    const flagString = `${flags.g ? 'g' : ''}${flags.i ? 'i' : ''}${flags.m ? 'm' : ''}`;
    try {
      const regex = new RegExp(pattern, flagString);
      setError(null);
      if (flags.g) {
        setMatches(Array.from(text.matchAll(regex)));
      } else {
        const match = text.match(regex);
        setMatches(match ? [match] : []);
      }
    } catch (err) {
      setError(errorMessage(err, 'Invalid Regular Expression syntax'));
      setMatches([]);
    }
  }, [pattern, flags, text]);

  useEffect(() => { testRegex(); }, [pattern, flags, text, testRegex]);

  const segments = useMemo(() => segment(text, matches), [text, matches]);

  const applyPreset = (i: number) => {
    const p = PRESETS[i];
    setPattern(p.pattern);
    setText(p.text);
  };

  return (
    <ToolShell
      title="Regex Tester"
      full={full}
      onFullChange={setFull}
      hint={
        <p className="text-[12.5px] text-muted-foreground">
          Live regex matching with capture groups — nothing is sent anywhere.
        </p>
      }
    >
    <div className={full ? 'flex flex-col gap-4 flex-1 min-h-0' : 'space-y-4'}>
      {/* Quick-start patterns */}
      <PresetChips label="Common patterns:" presets={PRESETS} onPick={applyPreset} />

      {/* Pattern + Flags */}
      <div className=" bg-card rounded-xl border  border-border p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="section-label">Regular Expression Pattern</p>
          <div className="flex items-center gap-4 text-xs  text-muted-foreground">
            {[
              { key: 'g', label: 'Global (g)' },
              { key: 'i', label: 'Case-Insensitive (i)' },
              { key: 'm', label: 'Multiline (m)' },
            ].map(f => (
              <label key={f.key} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={flags[f.key as keyof typeof flags]}
                  onChange={(e) => setFlags({ ...flags, [f.key]: e.target.checked })}
                  className="rounded text-primary  focus:ring-0 focus:ring-offset-0"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        {/* Pattern input */}
        <div className={`flex items-center gap-2  bg-muted border rounded-xl px-3.5 py-2.5 transition-colors ${
          error
            ? 'border-rose-500/50'
            : ' border-border focus-within:border-primary'
        }`}>
          <span className=" text-muted-foreground font-mono text-sm select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Type regex pattern…"
            className="flex-1 bg-transparent text-xs font-mono  text-foreground  placeholder:text-muted-foreground focus:outline-none"
          />
          <span className=" text-muted-foreground font-mono text-sm select-none">
            /{flags.g ? 'g' : ''}{flags.i ? 'i' : ''}{flags.m ? 'm' : ''}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Dual panel */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${full ? 'flex-1 min-h-0' : ''}`}>
        {/* Test String */}
        <div className={`bg-card rounded-xl border border-border overflow-hidden flex flex-col ${full ? 'flex-1 min-h-0' : 'h-[420px]'}`}>
          <div className="px-4 py-2.5  bg-muted border-b  border-border text-xs font-semibold  text-muted-foreground">
            Test String
          </div>
          {/*
            The highlight layer sits behind a transparent-text textarea. Both use
            identical type metrics and padding so the painted spans line up with
            the real glyphs; scroll is mirrored so they stay aligned.
          */}
          <div className="relative flex-1 min-h-0">
            <div
              ref={backdropRef}
              aria-hidden
              className="absolute inset-0 overflow-auto p-4 text-xs font-mono leading-relaxed
                whitespace-pre-wrap break-words pointer-events-none text-muted-foreground"
            >
              {segments.map((s, i) =>
                s.hit
                  ? <mark key={i} className="bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 rounded-[3px]">{s.text}</mark>
                  : <span key={i}>{s.text}</span>,
              )}
              {/* trailing newline needs height or the last line clips */}
              {'\n'}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onScroll={(e) => {
                if (backdropRef.current) {
                  backdropRef.current.scrollTop = e.currentTarget.scrollTop;
                  backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }
              }}
              placeholder="Enter test text here…"
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent p-4 text-xs font-mono
                text-transparent caret-foreground placeholder:text-muted-foreground
                resize-none focus:outline-none leading-relaxed whitespace-pre-wrap break-words"
            />
          </div>
        </div>

        {/* Match Results */}
        <div className={`bg-card rounded-xl border border-border overflow-hidden flex flex-col ${full ? 'flex-1 min-h-0' : 'h-[420px]'}`}>
          <div className="px-4 py-2.5  bg-muted border-b  border-border text-xs font-semibold  text-muted-foreground flex items-center justify-between">
            <span>Matches ({matches.length})</span>
            {matches.length > 0 && (
              <span className="flex items-center gap-1 text-emerald-500  font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Found
              </span>
            )}
          </div>
          <div className="flex-1 p-3 overflow-auto space-y-2.5 font-mono text-xs">
            {matches.length === 0 ? (
              <p className=" text-muted-foreground font-sans text-xs pt-2">
                No matches found for the current pattern.
              </p>
            ) : (
              matches.map((m, idx) => (
                <div key={idx} className="p-3  bg-muted border  border-border hover:border-primary/40 rounded-xl space-y-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary">Match #{idx + 1}</span>
                    <CopyButton text={m[0]} label="Copy" />
                  </div>
                  <div className="text-emerald-500  font-semibold break-all dark:bg-emerald-500/10 bg-emerald-50 px-2 py-1.5 rounded-lg border dark:border-emerald-500/20 border-emerald-200 text-[11.5px]">
                    "{m[0]}"
                  </div>
                  {m.length > 1 && (
                    <div className="pt-0.5 space-y-1 text-[11px]">
                      <span className=" text-muted-foreground font-sans font-semibold">Capture Groups:</span>
                      {Array.from(m).slice(1).map((group, gIdx) => (
                        <div key={gIdx} className=" text-muted-foreground pl-2">
                          Group ${gIdx + 1}: <span className="text-cyan-500 dark:text-cyan-400 font-semibold">"{group}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </ToolShell>
  );
};
