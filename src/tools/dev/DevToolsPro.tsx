import React, { useMemo, useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { DarkPanel, WhitePanel, Segmented, SegmentedButton, StatusPill, ToolShell, useFullView } from '../../components/DevToolChrome';
import { errorMessage } from '../../utils/errorMessage';
import {
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════════
 * Shared chrome for this file
 * ══════════════════════════════════════════════════════════════════════ */

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[13px] font-semibold text-muted-foreground">{children}</p>
);

const ErrorLine: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs">
    <AlertTriangle className="w-4 h-4 shrink-0" />
    <span>{message}</span>
  </div>
);

const CodeOut: React.FC<{ text: string; placeholder: string }> = ({ text, placeholder }) => (
  <pre className="flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground/90 whitespace-pre select-text">
    {text || <span className="font-sans text-muted-foreground">{placeholder}</span>}
  </pre>
);

const editorClass =
  'flex-1 w-full bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed';

/* ════════════════════════════════════════════════════════════════════════
 * 1. JSON → TypeScript / Zod / Go / Python
 * ══════════════════════════════════════════════════════════════════════ */

type TypeTarget = 'typescript' | 'zod' | 'go' | 'python';

const pascal = (s: string) =>
  s
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'Item';

/** "posts" → "Post" so an array of objects gets a singular type name. */
const singular = (s: string) => {
  if (/ies$/i.test(s)) return `${s.slice(0, -3)}y`;
  if (/(ss|us|is)$/i.test(s)) return s;
  return /s$/i.test(s) ? s.slice(0, -1) : s;
};

const safeKey = (k: string) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k));

/** A named shape collected while walking the sample JSON. */
type Shape = { name: string; fields: { key: string; type: string; optional: boolean }[] };

/**
 * Walks a parsed JSON value and returns its type expression, collecting every
 * object it meets as a named shape so nested objects become their own type.
 * Arrays merge the keys of all their elements, so one sample row missing a
 * field marks that field optional rather than dropping it.
 */
function collectShapes(value: unknown, name: string, shapes: Shape[], lang: TypeTarget): string {
  const prim = (t: string) => ({ typescript: t, zod: t, go: t, python: t }[lang]);

  if (value === null) return { typescript: 'null', zod: 'null', go: 'interface{}', python: 'None' }[lang];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { typescript: 'unknown[]', zod: 'unknown[]', go: '[]interface{}', python: 'List[Any]' }[lang];
    }
    const objects = value.filter((v) => v && typeof v === 'object' && !Array.isArray(v)) as Record<string, unknown>[];
    if (objects.length === value.length) {
      const merged: Record<string, unknown> = {};
      const seen = new Map<string, number>();
      for (const obj of objects) {
        for (const [k, v] of Object.entries(obj)) {
          if (!(k in merged) || merged[k] === null) merged[k] = v;
          seen.set(k, (seen.get(k) ?? 0) + 1);
        }
      }
      const inner = collectShapes(merged, singular(name), shapes, lang);
      const shape = shapes.find((s) => s.name === inner);
      if (shape) {
        for (const f of shape.fields) f.optional = (seen.get(f.key) ?? 0) < objects.length;
      }
      return { typescript: `${inner}[]`, zod: `${inner}[]`, go: `[]${inner}`, python: `List[${inner}]` }[lang];
    }
    const elem = collectShapes(value[0], singular(name), shapes, lang);
    return { typescript: `${elem}[]`, zod: `${elem}[]`, go: `[]${elem}`, python: `List[${elem}]` }[lang];
  }
  if (typeof value === 'object') {
    const fields = Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      type: collectShapes(v, pascal(k), shapes, lang),
      optional: false,
    }));
    let typeName = pascal(name);
    let n = 2;
    while (shapes.some((s) => s.name === typeName && JSON.stringify(s.fields) !== JSON.stringify(fields))) {
      typeName = `${pascal(name)}${n++}`;
    }
    if (!shapes.some((s) => s.name === typeName)) shapes.push({ name: typeName, fields });
    return typeName;
  }
  if (typeof value === 'number') {
    return prim(
      { typescript: 'number', zod: 'number', go: Number.isInteger(value) ? 'int' : 'float64', python: Number.isInteger(value) ? 'int' : 'float' }[lang],
    );
  }
  if (typeof value === 'boolean') return { typescript: 'boolean', zod: 'boolean', go: 'bool', python: 'bool' }[lang];
  return { typescript: 'string', zod: 'string', go: 'string', python: 'str' }[lang];
}

function renderTypes(shapes: Shape[], rootType: string, rootName: string, lang: TypeTarget): string {
  const ordered = [...shapes].reverse();
  if (lang === 'typescript') {
    const body = ordered
      .map(
        (s) =>
          `export interface ${s.name} {\n${s.fields
            .map((f) => `  ${safeKey(f.key)}${f.optional ? '?' : ''}: ${f.type};`)
            .join('\n')}\n}`,
      )
      .join('\n\n');
    const alias = shapes.some((s) => s.name === rootType) ? '' : `\n\nexport type ${pascal(rootName)} = ${rootType};`;
    return `${body}${alias}\n`;
  }
  if (lang === 'zod') {
    const zodType = (t: string): string => {
      if (t.endsWith('[]')) return `z.array(${zodType(t.slice(0, -2))})`;
      if (['string', 'number', 'boolean'].includes(t)) return `z.${t}()`;
      if (t === 'null') return 'z.null()';
      if (t === 'unknown') return 'z.unknown()';
      return `${t.charAt(0).toLowerCase()}${t.slice(1)}Schema`;
    };
    const body = ordered
      .map(
        (s) =>
          `export const ${s.name.charAt(0).toLowerCase()}${s.name.slice(1)}Schema = z.object({\n${s.fields
            .map((f) => `  ${safeKey(f.key)}: ${zodType(f.type)}${f.optional ? '.optional()' : ''},`)
            .join('\n')}\n});`,
      )
      .join('\n\n');
    const types = ordered
      .map((s) => `export type ${s.name} = z.infer<typeof ${s.name.charAt(0).toLowerCase()}${s.name.slice(1)}Schema>;`)
      .join('\n');
    return `import { z } from 'zod';\n\n${body}\n\n${types}\n`;
  }
  if (lang === 'go') {
    const goName = (k: string) => pascal(k);
    const body = ordered
      .map(
        (s) =>
          `type ${s.name} struct {\n${s.fields
            .map((f) => {
              const t = f.optional && !f.type.startsWith('[]') ? `*${f.type}` : f.type;
              const tag = f.optional ? `\`json:"${f.key},omitempty"\`` : `\`json:"${f.key}"\``;
              return `\t${goName(f.key)} ${t} ${tag}`;
            })
            .join('\n')}\n}`,
      )
      .join('\n\n');
    return `package main\n\n${body}\n`;
  }
  const body = ordered
    .map(
      (s) =>
        `@dataclass\nclass ${s.name}:\n${s.fields
          .map((f) => `    ${f.key.replace(/[^a-zA-Z0-9_]/g, '_')}: ${f.optional ? `Optional[${f.type}]` : f.type}${f.optional ? ' = None' : ''}`)
          .join('\n')}`,
    )
    .join('\n\n\n');
  return `from dataclasses import dataclass\nfrom typing import Any, List, Optional\n\n\n${body}\n`;
}

const JSON_TYPES_SAMPLE = JSON.stringify(
  {
    id: 42,
    name: 'Ada Lovelace',
    active: true,
    score: 9.5,
    tags: ['engineer', 'pioneer'],
    address: { city: 'London', zip: 'W1', geo: { lat: 51.5, lng: -0.12 } },
    posts: [
      { id: 1, title: 'First note', pinned: true },
      { id: 2, title: 'Second note' },
    ],
  },
  null,
  2,
);

export const JsonToTypesTool: React.FC = () => {
  const [input, setInput] = useState(JSON_TYPES_SAMPLE);
  const [lang, setLang] = useState<TypeTarget>('typescript');
  const [rootName, setRootName] = useState('Root');

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null };
    try {
      const parsed: unknown = JSON.parse(input);
      const shapes: Shape[] = [];
      const rootType = collectShapes(parsed, rootName || 'Root', shapes, lang);
      if (shapes.length === 0 && lang !== 'typescript') {
        return { output: '', error: 'Top-level value is not an object — paste a JSON object or array of objects.' };
      }
      return { output: renderTypes(shapes, rootType, rootName || 'Root', lang), error: null };
    } catch (err) {
      return { output: '', error: errorMessage(err, 'Invalid JSON') };
    }
  }, [input, lang, rootName]);

  const ext = { typescript: 'types.ts', zod: 'schema.ts', go: 'types.go', python: 'models.py' }[lang];
  const [full, setFull] = useFullView();
  const panelH = full ? 'h-full min-h-0' : 'h-[520px]';

  return (
    <ToolShell
      title="JSON to TypeScript"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Paste a JSON response and get typed models — nested objects become their own types.</Hint>}
      controls={
        <>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            Root name
            <input
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="input-base h-8 w-28 px-2 text-[12.5px] rounded-lg"
            />
          </label>
          <Segmented>
            <SegmentedButton active={lang === 'typescript'} onClick={() => setLang('typescript')}>TypeScript</SegmentedButton>
            <SegmentedButton active={lang === 'zod'} onClick={() => setLang('zod')}>Zod</SegmentedButton>
            <SegmentedButton active={lang === 'go'} onClick={() => setLang('go')}>Go</SegmentedButton>
            <SegmentedButton active={lang === 'python'} onClick={() => setLang('python')}>Python</SegmentedButton>
          </Segmented>
          <StatusPill valid={!error && !!output} validLabel="Valid JSON" invalidLabel={error ? 'Invalid JSON' : 'Empty'} />
        </>
      }
    >
      {error && <ErrorLine message={error} />}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <DarkPanel label="JSON sample" className={panelH}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste a JSON object or an array of objects…"
            className={editorClass}
          />
        </DarkPanel>
        <WhitePanel label={ext} className={panelH} headerRight={<CopyButton text={output} label="Copy" />}>
          <CodeOut text={output} placeholder="Generated types appear here." />
        </WhitePanel>
      </div>
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 2. Cron expression parser + builder
 * ══════════════════════════════════════════════════════════════════════ */

const CRON_FIELDS = [
  { label: 'Minute', min: 0, max: 59 },
  { label: 'Hour', min: 0, max: 23 },
  { label: 'Day of month', min: 1, max: 31 },
  { label: 'Month', min: 1, max: 12 },
  { label: 'Day of week', min: 0, max: 6 },
] as const;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_ALIASES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAY_ALIASES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Expands one cron field (a step, a range like "1-3,7", or an alias like "MON") into the values it matches. */
function parseCronField(raw: string, min: number, max: number, aliases: string[], label: string): Set<number> {
  const out = new Set<number>();
  const text = raw.trim().toLowerCase();
  if (!text) throw new Error(`${label} is empty`);
  for (const part of text.split(',')) {
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart === undefined ? 1 : Number(stepPart);
    if (!Number.isInteger(step) || step < 1) throw new Error(`${label}: "${part}" has an invalid step`);
    let from: number;
    let to: number;
    if (rangePart === '*' || rangePart === '?') {
      from = min;
      to = max;
    } else if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-');
      from = cronValue(a, aliases, label);
      to = cronValue(b, aliases, label);
    } else {
      from = cronValue(rangePart, aliases, label);
      to = stepPart === undefined ? from : max;
    }
    if (from < min || to > max || from > to) throw new Error(`${label}: "${part}" is out of the ${min}-${max} range`);
    for (let v = from; v <= to; v += step) out.add(v);
  }
  return out;
}

function cronValue(token: string, aliases: string[], label: string): number {
  const alias = aliases.indexOf(token.trim().toLowerCase());
  if (alias !== -1) return aliases === MONTH_ALIASES ? alias + 1 : alias;
  const n = Number(token);
  if (!Number.isInteger(n)) throw new Error(`${label}: "${token}" is not a number`);
  return n;
}

type CronParsed = { minutes: Set<number>; hours: Set<number>; doms: Set<number>; months: Set<number>; dows: Set<number>; domRestricted: boolean; dowRestricted: boolean };

function parseCron(expr: string): CronParsed {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`A cron expression needs exactly 5 fields (minute hour day month weekday) — got ${parts.length}.`);
  }
  const [m, h, dom, mon, dow] = parts;
  const dows = parseCronField(dow, 0, 7, DAY_ALIASES, 'Day of week');
  if (dows.has(7)) { dows.delete(7); dows.add(0); }
  return {
    minutes: parseCronField(m, 0, 59, [], 'Minute'),
    hours: parseCronField(h, 0, 23, [], 'Hour'),
    doms: parseCronField(dom, 1, 31, [], 'Day of month'),
    months: parseCronField(mon, 1, 12, MONTH_ALIASES, 'Month'),
    dows,
    domRestricted: dom.trim() !== '*' && dom.trim() !== '?',
    dowRestricted: dow.trim() !== '*' && dow.trim() !== '?',
  };
}

/** Walks forward minute by minute from `from`, collecting the next matching runs. */
function nextCronRuns(parsed: CronParsed, from: Date, count: number): Date[] {
  const runs: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  // Four years of minutes is the worst realistic case (29 Feb on a fixed weekday).
  const limit = 60 * 24 * 366 * 4;
  for (let i = 0; i < limit && runs.length < count; i++) {
    const monthOk = parsed.months.has(cursor.getMonth() + 1);
    const domOk = parsed.doms.has(cursor.getDate());
    const dowOk = parsed.dows.has(cursor.getDay());
    // Classic crontab rule: when both day fields are restricted, either one matching is enough.
    const dayOk = parsed.domRestricted && parsed.dowRestricted ? domOk || dowOk : domOk && dowOk;
    if (monthOk && dayOk && parsed.hours.has(cursor.getHours()) && parsed.minutes.has(cursor.getMinutes())) {
      runs.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return runs;
}

const listOf = (set: Set<number>, max: number, fmt: (n: number) => string): string => {
  const values = [...set].sort((a, b) => a - b);
  if (values.length === max) return 'every ' + (max === 60 ? 'minute' : 'value');
  if (values.length <= 4) return values.map(fmt).join(', ');
  return `${values.length} values (${fmt(values[0])} … ${fmt(values[values.length - 1])})`;
};

function describeCron(expr: string, parsed: CronParsed): string {
  const [m, h, dom, mon, dow] = expr.trim().split(/\s+/);
  const pad = (n: number) => String(n).padStart(2, '0');

  let time: string;
  if (m === '*' && h === '*') time = 'Every minute';
  else if (h === '*') time = `Every hour at minute ${listOf(parsed.minutes, 60, String)}`;
  else if (parsed.minutes.size === 1 && parsed.hours.size === 1)
    time = `At ${pad([...parsed.hours][0])}:${pad([...parsed.minutes][0])}`;
  else time = `At hour ${listOf(parsed.hours, 24, String)}, minute ${listOf(parsed.minutes, 60, String)}`;

  const parts: string[] = [time];
  if (dow !== '*' && dow !== '?') parts.push(`on ${listOf(parsed.dows, 7, (n) => DAY_NAMES[n])}`);
  if (dom !== '*' && dom !== '?') parts.push(`on day ${listOf(parsed.doms, 31, String)} of the month`);
  if (mon !== '*') parts.push(`in ${listOf(parsed.months, 12, (n) => MONTH_NAMES[n - 1])}`);
  if (parts.length === 1) parts.push('every day');
  return parts.join(', ') + '.';
}

const CRON_PRESETS: { label: string; expr: string }[] = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Daily at 9am', expr: '0 9 * * *' },
  { label: 'Weekdays at 9am', expr: '0 9 * * 1-5' },
  { label: 'Every Monday', expr: '0 9 * * 1' },
  { label: 'First of month', expr: '0 0 1 * *' },
  { label: 'Every quarter', expr: '0 0 1 1,4,7,10 *' },
];

export const CronParserTool: React.FC = () => {
  const [expr, setExpr] = useState('*/15 9-17 * * 1-5');

  const result = useMemo(() => {
    try {
      const parsed = parseCron(expr);
      return {
        error: null as string | null,
        description: describeCron(expr, parsed),
        runs: nextCronRuns(parsed, new Date(), 8),
      };
    } catch (err) {
      return { error: errorMessage(err, 'Invalid cron expression'), description: '', runs: [] as Date[] };
    }
  }, [expr]);

  const fields = expr.trim().split(/\s+/);
  const [full, setFull] = useFullView();

  return (
    <ToolShell
      title="Cron Expression Parser"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Type a cron expression to see it in plain English, plus the next times it will actually fire.</Hint>}
    >
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shrink-0">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          placeholder="*/5 * * * *"
          className="input-base w-full h-14 px-4 font-mono text-[20px] tracking-[0.12em] rounded-xl text-center"
        />
        <div className="grid grid-cols-5 gap-2">
          {CRON_FIELDS.map((f, i) => (
            <div key={f.label} className="text-center rounded-lg bg-muted/70 py-2 px-1">
              <p className="font-mono text-[15px] font-bold text-foreground">{fields[i] ?? '—'}</p>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mt-0.5">{f.label}</p>
              <p className="text-[10px] text-muted-foreground/70 font-mono">{f.min}-{f.max}</p>
            </div>
          ))}
        </div>
      </div>

      {result.error ? (
        <ErrorLine message={result.error} />
      ) : (
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] font-mono text-primary mb-1">In plain English</p>
          <p className="text-[15px] font-semibold text-foreground">{result.description}</p>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <WhitePanel label="Next 8 runs (your local time)" className={full ? 'h-full min-h-0' : 'min-h-[260px]'}>
          <div className="flex-1 overflow-auto divide-y divide-border/60">
            {result.runs.length === 0 ? (
              <p className="p-4 text-[13px] text-muted-foreground">No upcoming runs — check the expression above.</p>
            ) : (
              result.runs.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <span className="font-mono text-foreground">{d.toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-muted-foreground text-[12px]">
                    {i === 0 ? 'next' : `+${Math.round((d.getTime() - result.runs[0].getTime()) / 60000)} min`}
                  </span>
                </div>
              ))
            )}
          </div>
        </WhitePanel>

        <WhitePanel label="Common schedules" className={full ? 'h-full min-h-0' : 'min-h-[260px]'}>
          <div className="flex-1 overflow-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => setExpr(p.expr)}
                className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                  expr.trim() === p.expr ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                }`}
              >
                <span className="block text-[12.5px] font-semibold text-foreground">{p.label}</span>
                <span className="block font-mono text-[11.5px] text-muted-foreground">{p.expr}</span>
              </button>
            ))}
          </div>
        </WhitePanel>
      </div>
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 3. cURL → fetch / axios / Python / Node
 * ══════════════════════════════════════════════════════════════════════ */

type CurlRequest = { url: string; method: string; headers: Record<string, string>; body: string | null };

/** Splits a shell command into tokens, honouring quotes and line continuations. */
function shellSplit(command: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let started = false;
  const text = command.replace(/\\\r?\n/g, ' ');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === '\\' && quote === '"' && i + 1 < text.length) { current += text[++i]; }
      else current += c;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; started = true; continue; }
    if (/\s/.test(c)) {
      if (current || started) { tokens.push(current); current = ''; started = false; }
      continue;
    }
    current += c;
  }
  if (current || started) tokens.push(current);
  return tokens;
}

function parseCurl(command: string): CurlRequest {
  const tokens = shellSplit(command.trim());
  if (tokens[0] !== 'curl') throw new Error('Command must start with "curl".');
  const req: CurlRequest = { url: '', method: '', headers: {}, body: null };
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    const next = () => tokens[++i] ?? '';
    if (t === '-X' || t === '--request') req.method = next().toUpperCase();
    else if (t === '-H' || t === '--header') {
      const h = next();
      const idx = h.indexOf(':');
      if (idx > 0) req.headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary' || t === '--data-ascii') {
      req.body = (req.body ? `${req.body}&` : '') + next();
    } else if (t === '-u' || t === '--user') {
      req.headers.Authorization = `Basic ${btoa(next())}`;
    } else if (t === '--url') req.url = next();
    else if (t === '-A' || t === '--user-agent') req.headers['User-Agent'] = next();
    else if (t === '-b' || t === '--cookie') req.headers.Cookie = next();
    else if (t === '-F' || t === '--form') {
      req.body = (req.body ? `${req.body}\n` : '') + next();
      req.headers['Content-Type'] = 'multipart/form-data';
    } else if (t === '-G' || t === '--get') req.method = 'GET';
    else if (t.startsWith('-')) {
      // Flags with no bearing on the generated code (-s, -k, -L, -i, --compressed…).
      continue;
    } else if (!req.url) req.url = t;
  }
  if (!req.url) throw new Error('No URL found in the command.');
  if (!req.method) req.method = req.body ? 'POST' : 'GET';
  return req;
}

const bodyLiteral = (req: CurlRequest): string => {
  if (!req.body) return '';
  try {
    return JSON.stringify(JSON.parse(req.body), null, 2);
  } catch {
    return '';
  }
};

function toFetch(req: CurlRequest): string {
  const json = bodyLiteral(req);
  const headers = Object.entries(req.headers);
  const lines = [`const response = await fetch(${JSON.stringify(req.url)}, {`, `  method: ${JSON.stringify(req.method)},`];
  if (headers.length) {
    lines.push('  headers: {');
    for (const [k, v] of headers) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    lines.push('  },');
  }
  if (req.body) lines.push(`  body: ${json ? `JSON.stringify(${json.split('\n').join('\n  ')})` : JSON.stringify(req.body)},`);
  lines.push('});', '', 'const data = await response.json();', 'console.log(data);');
  return lines.join('\n');
}

function toAxios(req: CurlRequest): string {
  const json = bodyLiteral(req);
  const cfg: string[] = [`  method: ${JSON.stringify(req.method.toLowerCase())},`, `  url: ${JSON.stringify(req.url)},`];
  if (Object.keys(req.headers).length) {
    cfg.push('  headers: {');
    for (const [k, v] of Object.entries(req.headers)) cfg.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    cfg.push('  },');
  }
  if (req.body) cfg.push(`  data: ${json ? json.split('\n').join('\n  ') : JSON.stringify(req.body)},`);
  return `import axios from 'axios';\n\nconst { data } = await axios({\n${cfg.join('\n')}\n});\n\nconsole.log(data);`;
}

function toPython(req: CurlRequest): string {
  const json = bodyLiteral(req);
  const lines = ['import requests', ''];
  if (Object.keys(req.headers).length) {
    lines.push('headers = {');
    for (const [k, v] of Object.entries(req.headers)) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    lines.push('}', '');
  }
  if (req.body) {
    lines.push(
      json
        ? `payload = ${json.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')}`
        : `payload = ${JSON.stringify(req.body)}`,
      '',
    );
  }
  const args = [JSON.stringify(req.url)];
  if (Object.keys(req.headers).length) args.push('headers=headers');
  if (req.body) args.push(json ? 'json=payload' : 'data=payload');
  lines.push(`response = requests.${req.method.toLowerCase()}(${args.join(', ')})`, 'print(response.json())');
  return lines.join('\n');
}

function toNode(req: CurlRequest): string {
  const json = bodyLiteral(req);
  const lines = ["const https = require('node:https');", '', 'const options = {', `  method: ${JSON.stringify(req.method)},`];
  if (Object.keys(req.headers).length) {
    lines.push('  headers: {');
    for (const [k, v] of Object.entries(req.headers)) lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    lines.push('  },');
  }
  lines.push('};', '', `const req = https.request(${JSON.stringify(req.url)}, options, (res) => {`, "  let body = '';", "  res.on('data', (chunk) => { body += chunk; });", "  res.on('end', () => console.log(body));", '});', '');
  if (req.body) lines.push(`req.write(${json ? `JSON.stringify(${json})` : JSON.stringify(req.body)});`);
  lines.push('req.end();');
  return lines.join('\n');
}

const CURL_TARGETS = [
  { id: 'fetch', label: 'fetch', render: toFetch },
  { id: 'axios', label: 'axios', render: toAxios },
  { id: 'python', label: 'Python', render: toPython },
  { id: 'node', label: 'Node https', render: toNode },
] as const;

export const CurlConverterTool: React.FC = () => {
  const [input, setInput] = useState(
    `curl -X POST https://api.example.com/v1/users \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer TOKEN" \\\n  -d '{"name":"Ada","role":"admin"}'`,
  );
  const [target, setTarget] = useState<(typeof CURL_TARGETS)[number]['id']>('fetch');

  const { output, error, parsed } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null, parsed: null as CurlRequest | null };
    try {
      const req = parseCurl(input);
      const render = CURL_TARGETS.find((t) => t.id === target)!.render;
      return { output: render(req), error: null, parsed: req };
    } catch (err) {
      return { output: '', error: errorMessage(err, 'Could not parse this curl command'), parsed: null };
    }
  }, [input, target]);

  const [full, setFull] = useFullView();
  const panelH = full ? 'h-full min-h-0' : 'h-[420px]';

  return (
    <ToolShell
      title="cURL to Code"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Paste a command copied from DevTools “Copy as cURL” and get ready-to-run client code.</Hint>}
      controls={
        <>
          <Segmented>
            {CURL_TARGETS.map((t) => (
              <SegmentedButton key={t.id} active={target === t.id} onClick={() => setTarget(t.id)}>
                {t.label}
              </SegmentedButton>
            ))}
          </Segmented>
          <StatusPill valid={!!parsed} validLabel={parsed ? `${parsed.method} request` : 'Parsed'} invalidLabel={error ? 'Unparsed' : 'Empty'} />
        </>
      }
    >
      {error && <ErrorLine message={error} />}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <DarkPanel label="cURL command" className={panelH}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="curl -X POST https://api.example.com …"
            className={editorClass}
          />
        </DarkPanel>
        <WhitePanel
          label={CURL_TARGETS.find((t) => t.id === target)!.label}
          className={panelH}
          headerRight={<CopyButton text={output} label="Copy" />}
        >
          <CodeOut text={output} placeholder="Generated code appears here." />
        </WhitePanel>
      </div>

      {parsed && (
        <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px] shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1">Method</p>
            <p className="font-mono font-bold text-foreground">{parsed.method}</p>
          </div>
          <div className="sm:col-span-2 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1">URL</p>
            <p className="font-mono text-foreground break-all">{parsed.url}</p>
          </div>
          <div className="sm:col-span-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1">
              Headers ({Object.keys(parsed.headers).length})
            </p>
            <p className="font-mono text-muted-foreground break-all">
              {Object.keys(parsed.headers).join(', ') || 'none'}
            </p>
          </div>
        </div>
      )}
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 4. String escaper / unescaper
 * ══════════════════════════════════════════════════════════════════════ */

const ESCAPERS = {
  json: {
    label: 'JSON string',
    escape: (s: string) => JSON.stringify(s).slice(1, -1),
    unescape: (s: string) => JSON.parse(`"${s.replace(/(^|[^\\])"/g, '$1\\"')}"`) as string,
  },
  javascript: {
    label: 'JS / TS',
    escape: (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t'),
    unescape: (s: string) => s.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
  },
  sql: {
    label: 'SQL',
    escape: (s: string) => s.replace(/'/g, "''"),
    unescape: (s: string) => s.replace(/''/g, "'"),
  },
  shell: {
    label: 'Shell',
    escape: (s: string) => `'${s.replace(/'/g, `'\\''`)}'`,
    unescape: (s: string) => s.replace(/^'|'$/g, '').replace(/'\\''/g, "'"),
  },
  regex: {
    label: 'Regex',
    escape: (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    unescape: (s: string) => s.replace(/\\([.*+?^${}()|[\]\\])/g, '$1'),
  },
  csv: {
    label: 'CSV field',
    escape: (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s),
    unescape: (s: string) => (s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1).replace(/""/g, '"') : s),
  },
  xml: {
    label: 'XML / HTML',
    escape: (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
    unescape: (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
  },
  url: {
    label: 'URL component',
    escape: (s: string) => encodeURIComponent(s),
    unescape: (s: string) => decodeURIComponent(s),
  },
} as const;

type EscaperKey = keyof typeof ESCAPERS;

export const StringEscaperTool: React.FC = () => {
  const [input, setInput] = useState(`He said "it's 3 > 2" and\nthen left.`);
  const [flavour, setFlavour] = useState<EscaperKey>('json');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: null as string | null };
    try {
      const fn = mode === 'escape' ? ESCAPERS[flavour].escape : ESCAPERS[flavour].unescape;
      return { output: fn(input), error: null };
    } catch (err) {
      return { output: '', error: errorMessage(err, `Input is not valid escaped ${ESCAPERS[flavour].label} text`) };
    }
  }, [input, flavour, mode]);

  const [full, setFull] = useFullView();
  const panelH = full ? 'h-full min-h-0' : 'h-[320px]';

  return (
    <ToolShell
      title="String Escaper"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Escape a string for code, or paste escaped text to get the original back.</Hint>}
      controls={
        <>
          <Select
            value={flavour}
            onChange={(v) => setFlavour(v as EscaperKey)}
            options={Object.entries(ESCAPERS).map(([k, v]) => ({ value: k, label: v.label }))}
            className="w-40"
          />
          <Segmented>
            <SegmentedButton active={mode === 'escape'} onClick={() => setMode('escape')}>Escape</SegmentedButton>
            <SegmentedButton active={mode === 'unescape'} onClick={() => setMode('unescape')}>Unescape</SegmentedButton>
          </Segmented>
          <button
            type="button"
            onClick={() => { setInput(output); setMode(mode === 'escape' ? 'unescape' : 'escape'); }}
            disabled={!output}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
          </button>
        </>
      }
    >
      {error && <ErrorLine message={error} />}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <DarkPanel label={mode === 'escape' ? 'Raw text' : 'Escaped text'} className={panelH}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Type or paste text…"
            className={editorClass}
          />
        </DarkPanel>
        <WhitePanel
          label={mode === 'escape' ? `Escaped for ${ESCAPERS[flavour].label}` : 'Original text'}
          className={panelH}
          headerRight={<CopyButton text={output} label="Copy" />}
        >
          <pre className="flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-all select-text">
            {output || <span className="font-sans text-muted-foreground">Result appears here.</span>}
          </pre>
        </WhitePanel>
      </div>
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 5. .env ↔ JSON
 * ══════════════════════════════════════════════════════════════════════ */

function envToJson(env: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of env.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const withoutExport = line.replace(/^export\s+/, '');
    const idx = withoutExport.indexOf('=');
    if (idx === -1) continue;
    const key = withoutExport.slice(0, idx).trim();
    let value = withoutExport.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      // An unquoted value ends at the first ` #` comment.
      const hash = value.indexOf(' #');
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    out[key] = value.replace(/\\n/g, '\n');
  }
  return out;
}

function jsonToEnv(json: string): string {
  const parsed = JSON.parse(json) as Record<string, unknown>;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Provide a flat JSON object of key/value pairs.');
  }
  return Object.entries(parsed)
    .map(([k, v]) => {
      const value = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
      const needsQuotes = /[\s#"'=]/.test(value) || value === '';
      return `${k}=${needsQuotes ? `"${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"` : value}`;
    })
    .join('\n');
}

export const EnvJsonTool: React.FC = () => {
  const [direction, setDirection] = useState<'envToJson' | 'jsonToEnv'>('envToJson');
  const [input, setInput] = useState(
    '# Database\nDATABASE_URL="postgres://user:pass@localhost:5432/app"\nPORT=3000\nDEBUG=false\nAPP_NAME=NextTool Kit',
  );

  const { output, error, count } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null as string | null, count: 0 };
    try {
      if (direction === 'envToJson') {
        const obj = envToJson(input);
        return { output: JSON.stringify(obj, null, 2), error: null, count: Object.keys(obj).length };
      }
      const env = jsonToEnv(input);
      return { output: env, error: null, count: env ? env.split('\n').length : 0 };
    } catch (err) {
      return { output: '', error: errorMessage(err, 'Could not convert this input'), count: 0 };
    }
  }, [input, direction]);

  const flip = () => {
    setDirection(direction === 'envToJson' ? 'jsonToEnv' : 'envToJson');
    if (output) setInput(output);
  };

  const [full, setFull] = useFullView();
  const panelH = full ? 'h-full min-h-0' : 'h-[420px]';

  return (
    <ToolShell
      title=".env to JSON"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Turn a .env file into JSON for config code, or a JSON object back into .env lines.</Hint>}
      controls={
        <>
          <Segmented>
            <SegmentedButton active={direction === 'envToJson'} onClick={() => setDirection('envToJson')}>.env → JSON</SegmentedButton>
            <SegmentedButton active={direction === 'jsonToEnv'} onClick={() => setDirection('jsonToEnv')}>JSON → .env</SegmentedButton>
          </Segmented>
          <button
            type="button"
            onClick={flip}
            disabled={!output}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Use output as input
          </button>
          <StatusPill valid={!error && !!output} validLabel={`${count} keys`} invalidLabel={error ? 'Error' : 'Empty'} />
        </>
      }
    >
      {error && <ErrorLine message={error} />}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <DarkPanel label={direction === 'envToJson' ? '.env' : 'JSON'} className={panelH}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={direction === 'envToJson' ? 'KEY=value' : '{ "KEY": "value" }'}
            className={editorClass}
          />
        </DarkPanel>
        <WhitePanel
          label={direction === 'envToJson' ? 'JSON' : '.env'}
          className={panelH}
          headerRight={<CopyButton text={output} label="Copy" />}
        >
          <CodeOut text={output} placeholder="Converted output appears here." />
        </WhitePanel>
      </div>

      <p className="text-[12px] text-muted-foreground shrink-0">
        Secrets stay on your device — this page never uploads the values you paste.
      </p>
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 6. HTTP status code reference
 * ══════════════════════════════════════════════════════════════════════ */

type StatusEntry = { code: number; name: string; summary: string };

const HTTP_STATUSES: StatusEntry[] = [
  { code: 100, name: 'Continue', summary: 'The client should keep sending the request body.' },
  { code: 101, name: 'Switching Protocols', summary: 'The server agreed to switch protocol, typically to WebSocket.' },
  { code: 200, name: 'OK', summary: 'The request succeeded and the response carries the result.' },
  { code: 201, name: 'Created', summary: 'A new resource was created; its URL is usually in the Location header.' },
  { code: 202, name: 'Accepted', summary: 'The request was queued for processing but is not finished yet.' },
  { code: 204, name: 'No Content', summary: 'Success, but there is deliberately no response body.' },
  { code: 206, name: 'Partial Content', summary: 'A range of the resource is returned, used for resumable downloads and video seeking.' },
  { code: 301, name: 'Moved Permanently', summary: 'The resource has a new permanent URL; search engines transfer ranking to it.' },
  { code: 302, name: 'Found', summary: 'A temporary redirect; the original URL should keep being used.' },
  { code: 303, name: 'See Other', summary: 'Fetch the result of the request from a different URL using GET.' },
  { code: 304, name: 'Not Modified', summary: 'The cached copy is still fresh, so no body is sent.' },
  { code: 307, name: 'Temporary Redirect', summary: 'Like 302 but the method and body must not change.' },
  { code: 308, name: 'Permanent Redirect', summary: 'Like 301 but the method and body must not change.' },
  { code: 400, name: 'Bad Request', summary: 'The server could not understand the request — usually malformed JSON or a missing field.' },
  { code: 401, name: 'Unauthorized', summary: 'Authentication is missing or invalid. Really means "unauthenticated".' },
  { code: 402, name: 'Payment Required', summary: 'Reserved for payment flows; used by some APIs for billing limits.' },
  { code: 403, name: 'Forbidden', summary: 'The caller is authenticated but not allowed to do this.' },
  { code: 404, name: 'Not Found', summary: 'No resource matches this URL. Also used to hide existence of private resources.' },
  { code: 405, name: 'Method Not Allowed', summary: 'The URL exists but not for this HTTP method.' },
  { code: 406, name: 'Not Acceptable', summary: 'No representation matches the Accept headers the client sent.' },
  { code: 408, name: 'Request Timeout', summary: 'The client took too long to send the request.' },
  { code: 409, name: 'Conflict', summary: 'The request clashes with the current state, such as a duplicate or stale version.' },
  { code: 410, name: 'Gone', summary: 'The resource existed but was intentionally removed for good.' },
  { code: 413, name: 'Payload Too Large', summary: 'The request body exceeds the server limit — common on file uploads.' },
  { code: 415, name: 'Unsupported Media Type', summary: 'The Content-Type of the body is not supported by this endpoint.' },
  { code: 418, name: "I'm a teapot", summary: 'An April Fools code from RFC 2324, still returned as a joke by some APIs.' },
  { code: 422, name: 'Unprocessable Content', summary: 'The syntax is fine but the data fails validation rules.' },
  { code: 429, name: 'Too Many Requests', summary: 'Rate limit hit. Check the Retry-After header before retrying.' },
  { code: 451, name: 'Unavailable For Legal Reasons', summary: 'Blocked because of a legal demand, such as a takedown or geo restriction.' },
  { code: 500, name: 'Internal Server Error', summary: 'An unhandled error on the server. The catch-all failure code.' },
  { code: 501, name: 'Not Implemented', summary: 'The server does not support the functionality required.' },
  { code: 502, name: 'Bad Gateway', summary: 'A proxy got an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', summary: 'The server is overloaded or down for maintenance — usually temporary.' },
  { code: 504, name: 'Gateway Timeout', summary: 'A proxy waited too long for the upstream server to answer.' },
  { code: 507, name: 'Insufficient Storage', summary: 'The server ran out of room to store the representation.' },
];

const STATUS_CLASSES = [
  { id: '1', label: '1xx Informational', tone: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
  { id: '2', label: '2xx Success', tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
  { id: '3', label: '3xx Redirect', tone: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: '4', label: '4xx Client error', tone: 'text-orange-600 dark:text-orange-400 bg-orange-500/10' },
  { id: '5', label: '5xx Server error', tone: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
];

export const HttpStatusTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HTTP_STATUSES.filter((s) => {
      if (group !== 'all' && String(s.code)[0] !== group) return false;
      if (!q) return true;
      return `${s.code} ${s.name} ${s.summary}`.toLowerCase().includes(q);
    });
  }, [query, group]);

  const toneFor = (code: number) => STATUS_CLASSES.find((c) => c.id === String(code)[0])?.tone ?? '';

  const [full, setFull] = useFullView();

  return (
    <ToolShell
      title="HTTP Status Codes"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Every HTTP status code a web app realistically returns, with what it actually means in practice.</Hint>}
    >
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <label className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 404, timeout, redirect…"
            className="input-base w-full h-10 pl-9 pr-3 rounded-xl text-[13.5px]"
          />
        </label>
        <Segmented>
          <SegmentedButton active={group === 'all'} onClick={() => setGroup('all')}>All</SegmentedButton>
          {STATUS_CLASSES.map((c) => (
            <SegmentedButton key={c.id} active={group === c.id} onClick={() => setGroup(c.id as '1')}>
              {c.id}xx
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <div className={`rounded-2xl border border-border bg-card divide-y divide-border/60 overflow-y-auto ${full ? 'flex-1 min-h-0' : ''}`}>
        {results.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-muted-foreground">No status code matches “{query}”.</p>
        ) : (
          results.map((s) => (
            <div key={s.code} className="flex items-start gap-3 px-4 py-3">
              <span className={`shrink-0 px-2 py-1 rounded-lg font-mono text-[13px] font-bold ${toneFor(s.code)}`}>{s.code}</span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-foreground">{s.name}</p>
                <p className="text-[13px] text-muted-foreground">{s.summary}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 7. JSONPath tester
 * ══════════════════════════════════════════════════════════════════════ */

/**
 * Small JSONPath subset: `$`, `.key`, `['key']`, `[0]`, `[*]`, `..key` (recursive
 * descent) and `[?(@.key==value)]` equality filters — enough for the everyday
 * "pull this field out of an API response" job without pulling in a parser.
 */
function queryJsonPath(data: unknown, path: string): unknown[] {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '$') return [data];
  if (!trimmed.startsWith('$')) throw new Error('A JSONPath expression must start with "$".');

  const tokens = trimmed
    .slice(1)
    .replace(/\[(\d+|\*)\]/g, '.$1')
    .replace(/\['([^']+)'\]/g, '.$1')
    .replace(/\["([^"]+)"\]/g, '.$1')
    .split(/(?=\.)/)
    .filter(Boolean);

  let current: unknown[] = [data];
  for (const rawToken of tokens) {
    const recursive = rawToken.startsWith('..');
    const token = rawToken.replace(/^\.+/, '');
    if (!token) continue;

    const filter = token.match(/^\[\?\(@\.([\w$]+)\s*(==|!=|>|<|>=|<=)\s*(.+)\)\]$/);
    const next: unknown[] = [];

    const gather = (value: unknown, deep: boolean) => {
      if (value === null || typeof value !== 'object') return;
      if (Array.isArray(value)) {
        for (const item of value) {
          if (token === '*') next.push(item);
          else if (deep) gather(item, true);
          if (!deep && token !== '*' && item && typeof item === 'object' && token in (item as object)) {
            next.push((item as Record<string, unknown>)[token]);
          }
        }
        return;
      }
      const obj = value as Record<string, unknown>;
      if (token === '*') next.push(...Object.values(obj));
      else if (token in obj) next.push(obj[token]);
      if (deep) for (const v of Object.values(obj)) gather(v, true);
    };

    if (filter) {
      const [, key, op, rawValue] = filter;
      const expected = JSON.parse(rawValue.replace(/'/g, '"')) as string | number | boolean;
      for (const value of current) {
        const items = Array.isArray(value) ? value : [value];
        for (const item of items) {
          if (!item || typeof item !== 'object') continue;
          const actual = (item as Record<string, unknown>)[key];
          const ok =
            op === '==' ? actual === expected
              : op === '!=' ? actual !== expected
              : op === '>' ? Number(actual) > Number(expected)
              : op === '<' ? Number(actual) < Number(expected)
              : op === '>=' ? Number(actual) >= Number(expected)
              : Number(actual) <= Number(expected);
          if (ok) next.push(item);
        }
      }
    } else if (/^\d+$/.test(token)) {
      const index = Number(token);
      for (const value of current) if (Array.isArray(value) && index < value.length) next.push(value[index]);
    } else {
      for (const value of current) gather(value, recursive);
    }
    current = next;
    if (current.length === 0) break;
  }
  return current;
}

const JSONPATH_SAMPLE = JSON.stringify(
  {
    store: {
      name: 'NextTool Books',
      books: [
        { title: 'Refactoring', author: 'Fowler', price: 44.9, inStock: true },
        { title: 'The Pragmatic Programmer', author: 'Hunt', price: 39.5, inStock: false },
        { title: 'Clean Code', author: 'Martin', price: 32, inStock: true },
      ],
      bicycle: { color: 'red', price: 199 },
    },
  },
  null,
  2,
);

const JSONPATH_EXAMPLES = [
  '$.store.books[*].title',
  '$.store.books[0]',
  '$..price',
  "$.store.books[?(@.inStock==true)]",
  '$.store.*',
];

export const JsonPathTool: React.FC = () => {
  const [json, setJson] = useState(JSONPATH_SAMPLE);
  const [path, setPath] = useState('$.store.books[*].title');

  const { output, error, matches } = useMemo(() => {
    try {
      const data: unknown = JSON.parse(json);
      const found = queryJsonPath(data, path);
      return { output: JSON.stringify(found, null, 2), error: null as string | null, matches: found.length };
    } catch (err) {
      return { output: '', error: errorMessage(err, 'Invalid JSON or path expression'), matches: 0 };
    }
  }, [json, path]);

  const [full, setFull] = useFullView();
  const panelH = full ? 'h-full min-h-0' : 'h-[460px]';

  return (
    <ToolShell
      title="JSONPath Tester"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Query a JSON document with a path expression and see exactly which values match.</Hint>}
    >
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          spellCheck={false}
          placeholder="$.store.books[*].title"
          className="input-base flex-1 min-w-[240px] h-11 px-3.5 font-mono text-[14px] rounded-xl"
        />
        <StatusPill valid={!error} validLabel={`${matches} match${matches === 1 ? '' : 'es'}`} invalidLabel="Error" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        {JSONPATH_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setPath(ex)}
            className={`px-2.5 py-1 rounded-full border font-mono text-[11.5px] transition-colors ${
              path === ex ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {error && <ErrorLine message={error} />}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <DarkPanel label="JSON document" className={panelH}>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            spellCheck={false}
            placeholder="Paste JSON here…"
            className={editorClass}
          />
        </DarkPanel>
        <WhitePanel label="Matches" className={panelH} headerRight={<CopyButton text={output} label="Copy" />}>
          <CodeOut text={output} placeholder="Matching values appear here." />
        </WhitePanel>
      </div>
    </ToolShell>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 * 8. Mock JSON data generator
 * ══════════════════════════════════════════════════════════════════════ */

const FIRST_NAMES = ['Ada', 'Alan', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Tim'];
const LAST_NAMES = ['Lovelace', 'Turing', 'Hopper', 'Torvalds', 'Hamilton', 'Ritchie', 'Liskov', 'Thompson', 'Perlman', 'Berners-Lee'];
const CITIES = ['London', 'Mumbai', 'Berlin', 'Tokyo', 'Toronto', 'Lagos', 'Lisbon', 'Austin', 'Sydney', 'Oslo'];
const COMPANIES = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Soylent', 'Stark', 'Wayne', 'Cyberdyne'];
const WORDS = ['data', 'render', 'cache', 'signal', 'stream', 'token', 'vector', 'bundle', 'cluster', 'schema', 'pipeline', 'origin'];

const FIELD_TYPES = [
  'id', 'uuid', 'firstName', 'lastName', 'fullName', 'email', 'username', 'city', 'company',
  'phone', 'boolean', 'integer', 'price', 'date', 'datetime', 'sentence', 'paragraph', 'url', 'ipv4', 'color',
] as const;
type FieldType = (typeof FIELD_TYPES)[number];

type MockField = { id: number; name: string; type: FieldType };

/** Mulberry32 — a tiny seeded PRNG so a given seed always rebuilds the same dataset. */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mockValue(type: FieldType, index: number, rand: () => number): unknown {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  switch (type) {
    case 'id': return index + 1;
    case 'uuid': return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(rand() * 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    case 'firstName': return first;
    case 'lastName': return last;
    case 'fullName': return `${first} ${last}`;
    case 'email': return `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}@${pick(COMPANIES).toLowerCase()}.com`;
    case 'username': return `${first.toLowerCase()}_${int(10, 999)}`;
    case 'city': return pick(CITIES);
    case 'company': return pick(COMPANIES);
    case 'phone': return `+1-${int(200, 989)}-${int(100, 999)}-${String(int(0, 9999)).padStart(4, '0')}`;
    case 'boolean': return rand() > 0.5;
    case 'integer': return int(1, 1000);
    case 'price': return Math.round(rand() * 50000) / 100;
    case 'date': return new Date(Date.now() - int(0, 365) * 86400000).toISOString().slice(0, 10);
    case 'datetime': return new Date(Date.now() - int(0, 365) * 86400000).toISOString();
    case 'sentence': return `${pick(WORDS)} ${pick(WORDS)} ${pick(WORDS)} ${pick(WORDS)}`.replace(/^./, (c) => c.toUpperCase()) + '.';
    case 'paragraph': return Array.from({ length: 3 }, () => `${pick(WORDS)} ${pick(WORDS)} ${pick(WORDS)} ${pick(WORDS)}.`).join(' ');
    case 'url': return `https://${pick(COMPANIES).toLowerCase()}.com/${pick(WORDS)}/${int(1, 500)}`;
    case 'ipv4': return `${int(10, 250)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)}`;
    default: return `#${Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0')}`;
  }
}

export const MockJsonTool: React.FC = () => {
  const [fields, setFields] = useState<MockField[]>([
    { id: 1, name: 'id', type: 'id' },
    { id: 2, name: 'name', type: 'fullName' },
    { id: 3, name: 'email', type: 'email' },
    { id: 4, name: 'city', type: 'city' },
    { id: 5, name: 'active', type: 'boolean' },
  ]);
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<'json' | 'csv' | 'sql'>('json');
  const [seed, setSeed] = useState(1);

  const rows = useMemo(() => {
    const rand = makeRandom(seed * 7919 + 13);
    return Array.from({ length: Math.min(Math.max(count, 1), 500) }, (_, i) => {
      const row: Record<string, unknown> = {};
      for (const f of fields) row[f.name || `field_${f.id}`] = mockValue(f.type, i, rand);
      return row;
    });
  }, [fields, count, seed]);

  const output = useMemo(() => {
    if (rows.length === 0) return '';
    if (format === 'json') return JSON.stringify(rows, null, 2);
    const keys = Object.keys(rows[0]);
    if (format === 'csv') {
      const escape = (v: unknown) => {
        const s = String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      return [keys.join(','), ...rows.map((r) => keys.map((k) => escape(r[k])).join(','))].join('\n');
    }
    const literal = (v: unknown) => (typeof v === 'number' ? String(v) : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : `'${String(v).replace(/'/g, "''")}'`);
    return rows
      .map((r) => `INSERT INTO mock_data (${keys.join(', ')}) VALUES (${keys.map((k) => literal(r[k])).join(', ')});`)
      .join('\n');
  }, [rows, format]);

  const updateField = (id: number, patch: Partial<MockField>) =>
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const [full, setFull] = useFullView();
  const panelH = full ? 'h-full min-h-0' : 'h-[460px]';

  return (
    <ToolShell
      title="Mock JSON Generator"
      full={full}
      onFullChange={setFull}
      hint={<Hint>Build a realistic fake dataset for seeding a database, a demo UI or an API stub.</Hint>}
      controls={
        <>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            Rows
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
              className="input-base h-8 w-20 px-2 text-[12.5px] rounded-lg"
            />
          </label>
          <Segmented>
            <SegmentedButton active={format === 'json'} onClick={() => setFormat('json')}>JSON</SegmentedButton>
            <SegmentedButton active={format === 'csv'} onClick={() => setFormat('csv')}>CSV</SegmentedButton>
            <SegmentedButton active={format === 'sql'} onClick={() => setFormat('sql')}>SQL</SegmentedButton>
          </Segmented>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
        </>
      }
    >
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
        <WhitePanel
          label={`Fields (${fields.length})`}
          className={panelH}
          headerRight={
            <button
              type="button"
              onClick={() => setFields((prev) => [...prev, { id: Date.now(), name: `field_${prev.length + 1}`, type: 'sentence' }])}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-primary/80"
            >
              <Plus className="w-3.5 h-3.5" /> Add field
            </button>
          }
        >
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {fields.map((f) => (
              <div key={f.id} className="flex items-center gap-2">
                <input
                  value={f.name}
                  onChange={(e) => updateField(f.id, { name: e.target.value })}
                  placeholder="field name"
                  className="input-base h-9 flex-1 min-w-0 px-2.5 text-[12.5px] font-mono rounded-lg"
                />
                <Select
                  value={f.type}
                  onChange={(v) => updateField(f.id, { type: v as FieldType })}
                  options={FIELD_TYPES.map((t) => ({ value: t, label: t }))}
                  className="w-36 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setFields((prev) => prev.filter((x) => x.id !== f.id))}
                  disabled={fields.length === 1}
                  aria-label={`Remove ${f.name}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </WhitePanel>

        <WhitePanel
          label={`${rows.length} rows · ${format.toUpperCase()}`}
          className={panelH}
          headerRight={<CopyButton text={output} label="Copy" />}
        >
          <CodeOut text={output} placeholder="Generated data appears here." />
        </WhitePanel>
      </div>
    </ToolShell>
  );
};
