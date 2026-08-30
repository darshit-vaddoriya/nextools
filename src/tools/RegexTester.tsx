import React, { useState, useEffect, useCallback } from 'react';
import { CopyButton } from '../components/CopyButton';
import { errorMessage } from '../utils/errorMessage';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const RegexTester: React.FC = () => {
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

  return (
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test String */}
        <div className=" bg-card rounded-xl border  border-border overflow-hidden flex flex-col h-[420px]">
          <div className="px-4 py-2.5  bg-muted border-b  border-border text-xs font-semibold  text-muted-foreground">
            Test String
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter test text here…"
            className="flex-1 w-full bg-transparent p-4 text-xs font-mono  text-muted-foreground  placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Match Results */}
        <div className=" bg-card rounded-xl border  border-border overflow-hidden flex flex-col h-[420px]">
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
  );
};
