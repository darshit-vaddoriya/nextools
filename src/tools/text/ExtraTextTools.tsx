import React, { useMemo, useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { errorMessage } from '../../utils/errorMessage';
import {
  ArrowUpDown, FlipHorizontal, WrapText, Link2, Sparkles,
  Replace, Rows3, Mail, Globe2, Phone, Hash, GitCompare, AlertTriangle,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Shared small components
───────────────────────────────────────────────────────── */

const Panel: React.FC<{ label: string; icon: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <p className="section-label">{label}</p>
    </div>
    {children}
  </div>
);

const OutputBox: React.FC<{ value: string; placeholder?: string; rows?: number }> = ({ value, placeholder = 'Result will appear here…', rows = 6 }) => (
  <textarea
    readOnly
    value={value}
    placeholder={placeholder}
    rows={rows}
    className="textarea-base font-mono text-xs"
  />
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-muted-foreground">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded text-primary focus:ring-0 focus:ring-offset-0"
    />
    {label}
  </label>
);

/* ─────────────────────────────────────────────────────────
   1. Remove Duplicate Lines
───────────────────────────────────────────────────────── */

export const RemoveDuplicateLinesTool: React.FC = () => {
  const [text, setText] = useState('apple\nbanana\napple\ncherry\nBanana');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [sort, setSort] = useState(false);

  const result = useMemo(() => {
    const lines = text.split('\n');
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of lines) {
      const key = caseInsensitive ? line.toLowerCase() : line;
      if (!seen.has(key)) { seen.add(key); out.push(line); }
    }
    if (sort) out.sort((a, b) => a.localeCompare(b));
    return out.join('\n');
  }, [text, caseInsensitive, sort]);

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={Rows3}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono text-xs" placeholder="Paste lines to deduplicate…" />
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Toggle checked={caseInsensitive} onChange={setCaseInsensitive} label="Case-insensitive" />
          <Toggle checked={sort} onChange={setSort} label="Sort result" />
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Unique Lines ({result ? result.split('\n').length : 0})</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   2. Sort Lines
───────────────────────────────────────────────────────── */

type SortMode = 'alpha' | 'numeric' | 'length' | 'reverse';

export const SortLinesTool: React.FC = () => {
  const [text, setText] = useState('banana\napple\n10\n2\ncherry');
  const [mode, setMode] = useState<SortMode>('alpha');
  const [descending, setDescending] = useState(false);

  const result = useMemo(() => {
    const lines = text.split('\n');
    let out: string[];
    switch (mode) {
      case 'numeric':
        out = [...lines].sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
        break;
      case 'length':
        out = [...lines].sort((a, b) => a.length - b.length);
        break;
      case 'reverse':
        out = [...lines].reverse();
        break;
      case 'alpha':
      default:
        out = [...lines].sort((a, b) => a.localeCompare(b));
        break;
    }
    if (descending && mode !== 'reverse') out.reverse();
    return out.join('\n');
  }, [text, mode, descending]);

  const modes: { key: SortMode; label: string }[] = [
    { key: 'alpha', label: 'Alphabetical' },
    { key: 'numeric', label: 'Numeric' },
    { key: 'length', label: 'By Length' },
    { key: 'reverse', label: 'Reverse Order' },
  ];

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={ArrowUpDown}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono text-xs" placeholder="Paste lines to sort…" />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                mode === m.key ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {m.label}
            </button>
          ))}
          {mode !== 'reverse' && <Toggle checked={descending} onChange={setDescending} label="Descending" />}
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Sorted Lines</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   3. Reverse Text
───────────────────────────────────────────────────────── */

export const ReverseTextTool: React.FC = () => {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [mode, setMode] = useState<'chars' | 'words'>('chars');

  const result = useMemo(() => {
    if (mode === 'words') return text.split(/\s+/).reverse().join(' ');
    return Array.from(text).reverse().join('');
  }, [text, mode]);

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={FlipHorizontal}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="textarea-base font-mono text-xs" placeholder="Enter text to reverse…" />
        <div className="flex items-center gap-3 pt-1">
          <button onClick={() => setMode('chars')} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${mode === 'chars' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}>Reverse Characters</button>
          <button onClick={() => setMode('words')} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${mode === 'words' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}>Reverse Word Order</button>
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Result</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} rows={5} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   4. Lorem Ipsum Generator
───────────────────────────────────────────────────────── */

const LOREM_WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
  'ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure ' +
  'dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat ' +
  'non proident sunt in culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

function loremWord(i: number): string { return LOREM_WORDS[i % LOREM_WORDS.length]; }

function generateSentence(wordCount: number, offset: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) words.push(loremWord(offset + i));
  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
}

function generateParagraph(sentenceCount: number, offset: number): string {
  const sentences: string[] = [];
  let o = offset;
  for (let i = 0; i < sentenceCount; i++) {
    const len = 6 + ((o + i * 3) % 10);
    sentences.push(generateSentence(len, o));
    o += len;
  }
  return sentences.join(' ');
}

type LoremUnit = 'paragraphs' | 'sentences' | 'words';

export const LoremIpsumTool: React.FC = () => {
  const [unit, setUnit] = useState<LoremUnit>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);

  const result = useMemo(() => {
    let out: string;
    if (unit === 'words') {
      const words: string[] = [];
      for (let i = 0; i < count; i++) words.push(loremWord(i));
      out = words.join(' ');
    } else if (unit === 'sentences') {
      const sentences: string[] = [];
      let offset = 0;
      for (let i = 0; i < count; i++) {
        const len = 6 + ((offset + i * 3) % 10);
        sentences.push(generateSentence(len, offset));
        offset += len;
      }
      out = sentences.join(' ');
    } else {
      const paras: string[] = [];
      let offset = 0;
      for (let i = 0; i < count; i++) {
        const sentCount = 3 + (i % 3);
        paras.push(generateParagraph(sentCount, offset));
        offset += sentCount * 8;
      }
      out = paras.join('\n\n');
    }
    if (startWithLorem && out) {
      out = 'Lorem ipsum dolor sit amet, ' + out.charAt(0).toLowerCase() + out.slice(1);
    }
    return out;
  }, [unit, count, startWithLorem]);

  return (
    <div className="space-y-4">
      <Panel label="Options" icon={Sparkles}>
        <div className="flex flex-wrap items-center gap-3">
          <select value={unit} onChange={(e) => setUnit(e.target.value as LoremUnit)} className="input-base w-auto">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            className="input-base w-24"
          />
          <Toggle checked={startWithLorem} onChange={setStartWithLorem} label="Start with 'Lorem ipsum dolor sit amet'" />
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Generated Text</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} rows={10} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   5. Slug Generator
───────────────────────────────────────────────────────── */

export const SlugGeneratorTool: React.FC = () => {
  const [text, setText] = useState('Hello World! This is a Sample Title.');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [lowercase, setLowercase] = useState(true);

  const slug = useMemo(() => {
    let s = text
      .trim()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .replace(/[\s_-]+/g, separator);
    if (lowercase) s = s.toLowerCase();
    return s;
  }, [text, separator, lowercase]);

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={Link2}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="textarea-base font-mono text-xs" placeholder="Enter a title to slugify…" />
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Separator:
            <select value={separator} onChange={(e) => setSeparator(e.target.value as '-' | '_')} className="input-base w-auto py-1">
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
            </select>
          </label>
          <Toggle checked={lowercase} onChange={setLowercase} label="Lowercase" />
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="section-label">Slug</p>
          <CopyButton text={slug} />
        </div>
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-mono font-semibold break-all select-all text-primary">
          {slug || <span className="text-muted-foreground font-normal italic">Slug will appear here…</span>}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   6. Text Cleaner
───────────────────────────────────────────────────────── */

export const TextCleanerTool: React.FC = () => {
  const [text, setText] = useState('<p>Hello   World!</p>\r\n\r\nThis  has   extra   spaces.\r\n');
  const [stripHtml, setStripHtml] = useState(true);
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [normalizeLineEndings, setNormalizeLineEndings] = useState(true);

  const result = useMemo(() => {
    let s = text;
    if (normalizeLineEndings) s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (stripHtml) s = s.replace(/<[^>]*>/g, '');
    if (collapseWhitespace) {
      s = s
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n');
    }
    return s;
  }, [text, stripHtml, collapseWhitespace, normalizeLineEndings]);

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={WrapText}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="textarea-base font-mono text-xs" placeholder="Paste messy text or HTML…" />
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Toggle checked={collapseWhitespace} onChange={setCollapseWhitespace} label="Remove extra whitespace" />
          <Toggle checked={stripHtml} onChange={setStripHtml} label="Strip HTML tags" />
          <Toggle checked={normalizeLineEndings} onChange={setNormalizeLineEndings} label="Normalize line endings" />
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Cleaned Text</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} rows={7} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   7. Find & Replace
───────────────────────────────────────────────────────── */

export const FindReplaceTool: React.FC = () => {
  const [text, setText] = useState('The cat sat on the mat. The cat was happy.');
  const [find, setFind] = useState('cat');
  const [replace, setReplace] = useState('dog');
  const [useRegex, setUseRegex] = useState(false);
  const [flags, setFlags] = useState('g');

  const { result, count, error } = useMemo(() => {
    if (!find) return { result: text, count: 0, error: null as string | null };
    try {
      let matchCount = 0;
      let out: string;
      if (useRegex) {
        const re = new RegExp(find, flags);
        out = text.replace(re, (...args) => { matchCount++; return typeof replace === 'string' ? replace.replace(/\$(\d+)/g, (_, n) => args[Number(n)] ?? '') : replace; });
      } else {
        const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(escaped, flags.includes('g') ? (flags.includes('i') ? 'gi' : 'g') : (flags.includes('i') ? 'i' : ''));
        out = text.replace(re, () => { matchCount++; return replace; });
      }
      return { result: out, count: matchCount, error: null as string | null };
    } catch (err) {
      return { result: text, count: 0, error: errorMessage(err, 'Invalid regular expression') };
    }
  }, [text, find, replace, useRegex, flags]);

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={Replace}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="textarea-base font-mono text-xs" placeholder="Paste text to search & replace…" />
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="section-label">Find</p>
            <input value={find} onChange={(e) => setFind(e.target.value)} className="input-base font-mono text-xs" placeholder={useRegex ? 'Regex pattern' : 'Text to find'} />
          </div>
          <div className="space-y-1.5">
            <p className="section-label">Replace With</p>
            <input value={replace} onChange={(e) => setReplace(e.target.value)} className="input-base font-mono text-xs" placeholder="Replacement text" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Toggle checked={useRegex} onChange={setUseRegex} label="Use regular expression" />
          {useRegex && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Flags:
              <input value={flags} onChange={(e) => setFlags(e.target.value)} className="input-base w-20 py-1 font-mono" placeholder="gi" />
            </label>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{count} match{count === 1 ? '' : 'es'}</span>
        </div>
      </div>
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Result</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} rows={6} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   8. Remove Empty Lines
───────────────────────────────────────────────────────── */

export const RemoveEmptyLinesTool: React.FC = () => {
  const [text, setText] = useState('Line one\n\nLine two\n   \nLine three');

  const result = useMemo(
    () => text.split('\n').filter((line) => line.trim().length > 0).join('\n'),
    [text]
  );

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={Rows3}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono text-xs" placeholder="Paste text with blank lines…" />
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Result ({result ? result.split('\n').length : 0} lines)</p>
          <CopyButton text={result} />
        </div>
        <OutputBox value={result} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Extraction tools (shared layout)
───────────────────────────────────────────────────────── */

const ExtractionLayout: React.FC<{
  label: string;
  icon: React.ElementType;
  text: string;
  setText: (v: string) => void;
  items: string[];
  resultLabel: string;
}> = ({ label, icon, text, setText, items, resultLabel }) => (
  <div className="space-y-4">
    <Panel label={label} icon={icon}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="textarea-base font-mono text-xs" placeholder="Paste text to scan…" />
    </Panel>
    <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="section-label">{resultLabel} ({items.length})</p>
        <CopyButton text={items.join('\n')} label="Copy All" />
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic pt-1">No matches found.</p>
      ) : (
        <div className="max-h-64 overflow-auto space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 bg-muted border border-border rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className="break-all">{item}</span>
              <CopyButton text={item} label="" className="!px-1.5 !py-0.5 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* 9. Extract Emails */
export const ExtractEmailsTool: React.FC = () => {
  const [text, setText] = useState('Contact us at support@example.com or sales@company.co.uk for more info.');
  const emails = useMemo(() => {
    const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return Array.from(new Set(text.match(re) ?? []));
  }, [text]);
  return <ExtractionLayout label="Source Text" icon={Mail} text={text} setText={setText} items={emails} resultLabel="Emails Found" />;
};

/* 10. Extract URLs */
export const ExtractUrlsTool: React.FC = () => {
  const [text, setText] = useState('Visit https://example.com or http://sub.example.co.uk/path?x=1 for details.');
  const urls = useMemo(() => {
    const re = /\bhttps?:\/\/[^\s<>"'`]+/gi;
    return Array.from(new Set(text.match(re) ?? []));
  }, [text]);
  return <ExtractionLayout label="Source Text" icon={Globe2} text={text} setText={setText} items={urls} resultLabel="URLs Found" />;
};

/* 11. Extract Phones */
export const ExtractPhonesTool: React.FC = () => {
  const [text, setText] = useState('Call me at +1 (555) 123-4567 or +91-98765-43210, office: 555.987.6543');
  const phones = useMemo(() => {
    const re = /(\+?\d{1,3}[-.\s]?)?(\(\d{2,4}\)[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}(?:[-.\s]?\d{2,4})?/g;
    const matches = (text.match(re) ?? []).map((m) => m.trim()).filter((m) => m.replace(/\D/g, '').length >= 7);
    return Array.from(new Set(matches));
  }, [text]);
  return <ExtractionLayout label="Source Text" icon={Phone} text={text} setText={setText} items={phones} resultLabel="Phone Numbers Found" />;
};

/* 12. Extract Hashtags & Mentions */
export const ExtractHashtagsTool: React.FC = () => {
  const [text, setText] = useState('Loving this #sunset view! Thanks @naturephotos for the tip. #photography #travel');
  const { hashtags, mentions } = useMemo(() => {
    const hashtags = Array.from(new Set(text.match(/#[a-zA-Z0-9_]+/g) ?? []));
    const mentions = Array.from(new Set(text.match(/@[a-zA-Z0-9_]+/g) ?? []));
    return { hashtags, mentions };
  }, [text]);

  return (
    <div className="space-y-4">
      <Panel label="Source Text" icon={Hash}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="textarea-base font-mono text-xs" placeholder="Paste a social media post…" />
      </Panel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="section-label">Hashtags ({hashtags.length})</p>
            <CopyButton text={hashtags.join(' ')} label="Copy All" />
          </div>
          {hashtags.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None found.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((h, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-muted border border-border text-xs font-mono text-primary">{h}</span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="section-label">Mentions ({mentions.length})</p>
            <CopyButton text={mentions.join(' ')} label="Copy All" />
          </div>
          {mentions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">None found.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {mentions.map((m, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-muted border border-border text-xs font-mono text-cyan-500 dark:text-cyan-400">{m}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   13. Text Diff (word-level LCS diff)
───────────────────────────────────────────────────────── */

interface DiffToken { text: string; type: 'same' | 'add' | 'del'; }

function diffWords(a: string[], b: string[]): DiffToken[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffToken[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ text: a[i], type: 'same' }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ text: a[i], type: 'del' }); i++; }
    else { out.push({ text: b[j], type: 'add' }); j++; }
  }
  while (i < n) { out.push({ text: a[i], type: 'del' }); i++; }
  while (j < m) { out.push({ text: b[j], type: 'add' }); j++; }
  return out;
}

export const TextDiffTool: React.FC = () => {
  const [before, setBefore] = useState('The quick brown fox jumps over the lazy dog.');
  const [after, setAfter] = useState('The quick red fox leaps over the sleepy dog.');

  const tokens = useMemo(() => {
    const wordsA = before.split(/(\s+)/).filter((w) => w.length > 0);
    const wordsB = after.split(/(\s+)/).filter((w) => w.length > 0);
    return diffWords(wordsA, wordsB);
  }, [before, after]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    for (const t of tokens) { if (t.type === 'add' && t.text.trim()) added++; if (t.type === 'del' && t.text.trim()) removed++; }
    return { added, removed };
  }, [tokens]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Panel label="Before" icon={GitCompare}>
          <textarea value={before} onChange={(e) => setBefore(e.target.value)} rows={6} className="textarea-base font-mono text-xs" placeholder="Original text…" />
        </Panel>
        <Panel label="After" icon={GitCompare}>
          <textarea value={after} onChange={(e) => setAfter(e.target.value)} rows={6} className="textarea-base font-mono text-xs" placeholder="Modified text…" />
        </Panel>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Diff Result</p>
          <span className="text-xs text-muted-foreground">
            <span className="text-emerald-500 font-semibold">+{stats.added}</span>{' '}
            <span className="text-rose-500 font-semibold">-{stats.removed}</span>
          </span>
        </div>
        <div className="bg-muted border border-border rounded-lg p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
          {tokens.map((t, idx) => {
            if (t.type === 'same') return <span key={idx}>{t.text}</span>;
            if (t.type === 'add') return <span key={idx} className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">{t.text}</span>;
            return <span key={idx} className="bg-rose-500/15 text-rose-600 dark:text-rose-400 line-through">{t.text}</span>;
          })}
        </div>
      </div>
    </div>
  );
};
