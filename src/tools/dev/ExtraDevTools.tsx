import React, { useMemo, useState } from 'react';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { DarkPanel, WhitePanel, Segmented, SegmentedButton, StatusPill } from '../../components/DevToolChrome';
import { errorMessage } from '../../utils/errorMessage';
import {
  AlertTriangle,
  CheckCircle,
  Trash2,
  ArrowLeftRight,
  Code2,
  Link2,
  GitCompare,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────
 * Shared little pieces
 * ──────────────────────────────────────────────────────────────────────── */

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
    <AlertTriangle className="w-4 h-4 shrink-0" />
    <span>{message}</span>
  </div>
);

const ValidBanner: React.FC<{ label: string }> = ({ label }) => (
  <span className="text-[11px] text-success flex items-center gap-1 font-mono">
    <CheckCircle className="w-3 h-3" /> {label}
  </span>
);

const ToolBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card border-border shadow-xs">
    {children}
  </div>
);

const Panel: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode; heightClass?: string }> = ({
  title,
  right,
  children,
  heightClass = 'h-[420px]',
}) => (
  <div className={`rounded-xl border bg-card border-border overflow-hidden flex flex-col ${heightClass} shadow-xs`}>
    <div className="px-3.5 py-2 border-b bg-muted border-border flex items-center justify-between text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{title}</span>
      {right}
    </div>
    {children}
  </div>
);

const IndentSelect: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <span>Indent:</span>
    <Select
      value={String(value)}
      onChange={(v) => onChange(Number(v))}
      options={[
        { value: '2', label: '2 Spaces' },
        { value: '4', label: '4 Spaces' },
        { value: '8', label: '8 Spaces' },
      ]}
      className="w-28"
    />
  </div>
);

/* ────────────────────────────────────────────────────────────────────────
 * XML Formatter
 * ──────────────────────────────────────────────────────────────────────── */

function formatXml(xml: string, indentSize: number): string {
  const PADDING = ' '.repeat(indentSize);
  const reg = /(>)(<)(\/*)/g;
  const xmlStr = xml.trim().replace(reg, '$1\n$2$3');
  const lines = xmlStr.split('\n');
  let pad = 0;
  const result: string[] = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    let indentAdjustment = 0;
    if (/^<\/\w/.test(line)) {
      pad = Math.max(pad - 1, 0);
    } else if (/^<\w[^>]*[^/]>.*$/.test(line) && !/<\/\w[^>]*>\s*$/.test(line) && !/^<\?/.test(line)) {
      indentAdjustment = 1;
    }
    result.push(PADDING.repeat(pad) + line);
    pad += indentAdjustment;
  }
  return result.join('\n');
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').trim();
}

function validateXml(xml: string): string | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const errNode = doc.getElementsByTagName('parsererror')[0];
    if (errNode) return errNode.textContent || 'Malformed XML';
    return null;
  } catch (err) {
    return errorMessage(err, 'Malformed XML');
  }
}

export const XmlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('<root>\n<item id="1"><name>NextTool</name></item>\n</root>');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const run = (mode: 'format' | 'minify') => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    const validationError = validateXml(input);
    if (validationError) {
      setError(validationError);
      setOutput('');
      return;
    }
    setError(null);
    setOutput(mode === 'format' ? formatXml(input, indent) : minifyXml(input));
  };

  return (
    <div className="space-y-4">
      <ToolBar>
        <div className="flex items-center gap-2">
          <button onClick={() => run('format')} className="px-3 py-1.5 bg-primary hover:brightness-110 text-primary-foreground text-xs font-medium rounded-md transition-colors shadow-xs">
            Pretty Print
          </button>
          <button onClick={() => run('minify')} className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md transition-colors">
            Minify
          </button>
          <button
            onClick={() => { setInput(''); setOutput(''); setError(null); }}
            className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <IndentSelect value={indent} onChange={setIndent} />
          <CopyButton text={output} label="Copy Result" />
        </div>
      </ToolBar>

      {error && <ErrorBanner message={error} />}

      <Panel title="Input XML" heightClass="h-[300px]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your XML here..."
          className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
        />
      </Panel>

      <Panel title="Output" heightClass="h-[360px]" right={output ? <ValidBanner label="Valid XML" /> : undefined}>
        <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
          {output || <span className="text-muted-foreground font-sans">Result will appear here...</span>}
        </pre>
      </Panel>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * YAML Formatter / YAML<->JSON
 * ──────────────────────────────────────────────────────────────────────── */

type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

function parseScalar(raw: string): YamlValue {
  const s = raw.trim();
  if (s === '' ) return null;
  if (s === 'null' || s === '~') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner).map((v) => parseScalar(v));
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    const inner = s.slice(1, -1).trim();
    const obj: Record<string, YamlValue> = {};
    if (!inner) return obj;
    for (const part of splitTopLevel(inner)) {
      const idx = part.indexOf(':');
      if (idx === -1) continue;
      obj[part.slice(0, idx).trim()] = parseScalar(part.slice(idx + 1));
    }
    return obj;
  }
  return s;
}

function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** Minimal indentation-based YAML parser: supports nested maps, nested lists, flow arrays/objects, scalars. No anchors/tags/multi-doc. */
function parseYaml(text: string): YamlValue {
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const lines: { indent: number; content: string }[] = [];
  for (const line of rawLines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const indent = line.match(/^ */)?.[0].length ?? 0;
    lines.push({ indent, content: line.trim() });
  }

  let pos = 0;

  function parseBlock(indent: number): YamlValue {
    if (pos >= lines.length) return null;
    if (lines[pos].content.startsWith('- ') || lines[pos].content === '-') {
      const arr: YamlValue[] = [];
      while (pos < lines.length && lines[pos].indent === indent && (lines[pos].content === '-' || lines[pos].content.startsWith('- '))) {
        const content = lines[pos].content === '-' ? '' : lines[pos].content.slice(2);
        pos++;
        if (content.includes(':') && !content.trim().startsWith('{') && !content.trim().startsWith('[')) {
          // inline map start on the same line as the dash
          const idx = content.indexOf(':');
          const key = content.slice(0, idx).trim();
          const rest = content.slice(idx + 1).trim();
          const obj: Record<string, YamlValue> = {};
          obj[key] = rest ? parseScalar(rest) : parseBlock(indent + 2);
          while (pos < lines.length && lines[pos].indent === indent + 2) {
            const line2 = lines[pos].content;
            const idx2 = line2.indexOf(':');
            if (idx2 === -1) break;
            const k2 = line2.slice(0, idx2).trim();
            const v2raw = line2.slice(idx2 + 1).trim();
            pos++;
            obj[k2] = v2raw ? parseScalar(v2raw) : parseBlock(indent + 4);
          }
          arr.push(obj);
        } else if (content === '') {
          arr.push(parseBlock(indent + 2));
        } else {
          arr.push(parseScalar(content));
        }
      }
      return arr;
    }

    const obj: Record<string, YamlValue> = {};
    while (pos < lines.length && lines[pos].indent === indent) {
      const content = lines[pos].content;
      const idx = content.indexOf(':');
      if (idx === -1) { pos++; continue; }
      const key = content.slice(0, idx).trim().replace(/^["']|["']$/g, '');
      const valueRaw = content.slice(idx + 1).trim();
      pos++;
      if (valueRaw === '') {
        if (pos < lines.length && lines[pos].indent > indent) {
          obj[key] = parseBlock(lines[pos].indent);
        } else {
          obj[key] = null;
        }
      } else {
        obj[key] = parseScalar(valueRaw);
      }
    }
    return obj;
  }

  return parseBlock(lines[0]?.indent ?? 0);
}

function yamlScalarToString(v: YamlValue): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') {
    if (v === '' || /^[-?:,[\]{}#&*!|>'"%@`]/.test(v) || /: |:$/.test(v) || v.trim() !== v) {
      return JSON.stringify(v);
    }
    return v;
  }
  return String(v);
}

function stringifyYaml(value: YamlValue, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]\n`;
    return value
      .map((item) => {
        if (item !== null && typeof item === 'object') {
          const nested = stringifyYaml(item, indent + 1);
          const nestedLines = nested.split('\n').filter(Boolean);
          const first = nestedLines[0]?.trimStart();
          const rest = nestedLines.slice(1).join('\n');
          return `${pad}- ${first}${rest ? '\n' + rest : ''}`;
        }
        return `${pad}- ${yamlScalarToString(item)}`;
      })
      .join('\n') + '\n';
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return `${pad}{}\n`;
    return entries
      .map(([k, v]) => {
        if (v !== null && typeof v === 'object' && (Array.isArray(v) ? v.length : Object.keys(v).length)) {
          return `${pad}${k}:\n${stringifyYaml(v, indent + 1)}`;
        }
        if (Array.isArray(v) || (v !== null && typeof v === 'object')) {
          return `${pad}${k}: ${Array.isArray(v) ? '[]' : '{}'}`;
        }
        return `${pad}${k}: ${yamlScalarToString(v)}`;
      })
      .join('\n') + '\n';
  }
  return `${pad}${yamlScalarToString(value)}\n`;
}

export const YamlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('app:\n  name: NextTool\n  version: 1.0.0\nfeatures:\n  - formatters\n  - encoders\n');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'format' | 'toJson' | 'fromJson'>('format');

  const run = (m: 'format' | 'toJson' | 'fromJson') => {
    setMode(m);
    if (!input.trim()) { setOutput(''); setError(null); return; }
    try {
      if (m === 'fromJson') {
        const parsed = JSON.parse(input);
        setOutput(stringifyYaml(parsed).trimEnd());
      } else {
        const parsed = parseYaml(input);
        setOutput(m === 'toJson' ? JSON.stringify(parsed, null, 2) : stringifyYaml(parsed).trimEnd());
      }
      setError(null);
    } catch (err) {
      setError(errorMessage(err, `Invalid ${m === 'fromJson' ? 'JSON' : 'YAML'} input`));
    }
  };

  return (
    <div className="space-y-4">
      <ToolBar>
        <div className="flex items-center gap-2">
          <button onClick={() => run('format')} className="px-3 py-1.5 bg-primary hover:brightness-110 text-primary-foreground text-xs font-medium rounded-md transition-colors shadow-xs">
            Format YAML
          </button>
          <button onClick={() => run('toJson')} className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md transition-colors">
            YAML → JSON
          </button>
          <button onClick={() => run('fromJson')} className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md transition-colors">
            JSON → YAML
          </button>
        </div>
        <CopyButton text={output} label="Copy Result" />
      </ToolBar>

      <p className="text-[11px] text-muted-foreground px-1">
        Note: this is a lightweight YAML implementation for typical config-style files (nested maps/lists, flow arrays/objects, scalars). Anchors, tags, multi-line block scalars, and multi-document files are not supported.
      </p>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={mode === 'fromJson' ? 'Input JSON' : 'Input YAML'}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YAML or JSON here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title="Output" right={output ? <ValidBanner label="OK" /> : undefined}>
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
            {output || <span className="text-muted-foreground font-sans">Result will appear here...</span>}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * SQL Formatter
 * ──────────────────────────────────────────────────────────────────────── */

const SQL_NEWLINE_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING',
  'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'VALUES', 'SET', 'INSERT INTO', 'UPDATE',
  'DELETE FROM', 'ON',
];

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'AS', 'ON',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'GROUP', 'BY', 'ORDER', 'HAVING',
  'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'LIKE', 'BETWEEN', 'EXISTS', 'DEFAULT', 'PRIMARY',
  'KEY', 'FOREIGN', 'REFERENCES', 'CROSS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
];

function formatSql(sqlInput: string, indentSize: number): string {
  const indent = ' '.repeat(indentSize);
  let sql = sqlInput.trim().replace(/\s+/g, ' ');

  // Uppercase keywords (word-boundary based, case-insensitive)
  for (const kw of SQL_KEYWORDS) {
    const re = new RegExp(`\\b${kw}\\b`, 'gi');
    sql = sql.replace(re, kw.toUpperCase());
  }

  // Insert newline markers before major clauses (longest phrases first)
  const sortedClauses = [...SQL_NEWLINE_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const clause of sortedClauses) {
    const re = new RegExp(`\\s+${clause.replace(/ /g, '\\s+')}\\b`, 'g');
    sql = sql.replace(re, `\n${clause} `);
  }

  sql = sql.replace(/,\s*/g, ',\n' + indent);
  sql = sql.replace(/\(\s*/g, ' (\n' + indent);
  sql = sql.replace(/\)\s*/g, '\n)');

  const lines = sql.split('\n').map((l) => l.trim()).filter(Boolean);
  let depth = 0;
  const result: string[] = [];
  for (const line of lines) {
    let d = depth;
    if (line.startsWith(')')) d = Math.max(depth - 1, 0);
    const isClause = SQL_NEWLINE_KEYWORDS.some((c) => line.startsWith(c));
    result.push(indent.repeat(isClause ? 0 : d) + line);
    if (line.endsWith('(')) depth++;
    if (line.startsWith(')')) depth = Math.max(depth - 1, 0);
  }
  return result.join('\n').replace(/\n{2,}/g, '\n');
}

export const SqlFormatterTool: React.FC = () => {
  const [input, setInput] = useState(
    "select id, name, email from users inner join orders on users.id = orders.user_id where users.active = true and orders.total > 100 order by orders.total desc limit 10;"
  );
  const [indent, setIndent] = useState(2);
  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return formatSql(input, indent);
    } catch (err) {
      return `-- Error formatting SQL: ${errorMessage(err, 'unknown error')}`;
    }
  }, [input, indent]);

  return (
    <div className="space-y-4">
      <ToolBar>
        <p className="text-xs text-muted-foreground">Simple token-based beautifier (uppercases keywords, splits major clauses). Not a full SQL parser.</p>
        <div className="flex items-center gap-3">
          <IndentSelect value={indent} onChange={setIndent} />
          <CopyButton text={output} label="Copy Result" />
        </div>
      </ToolBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Input SQL">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title="Formatted SQL">
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
            {output || <span className="text-muted-foreground font-sans">Formatted SQL will appear here...</span>}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * HTML Formatter
 * ──────────────────────────────────────────────────────────────────────── */

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function tokenizeHtml(html: string): string[] {
  const tokens: string[] = [];
  const re = /<!--[\s\S]*?-->|<[^>]+>|[^<]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const t = m[0];
    if (t.trim() || /^<[^>]+>$/.test(t)) tokens.push(t);
  }
  return tokens;
}

function formatHtml(html: string, indentSize: number): string {
  const pad = ' '.repeat(indentSize);
  const tokens = tokenizeHtml(html.trim());
  let depth = 0;
  const lines: string[] = [];

  for (const token of tokens) {
    if (/^<!--/.test(token)) {
      lines.push(pad.repeat(depth) + token.trim());
      continue;
    }
    const tagMatch = token.match(/^<\/?([a-zA-Z0-9-]+)/);
    if (!tagMatch) {
      const text = token.trim();
      if (text) lines.push(pad.repeat(depth) + text);
      continue;
    }
    const tagName = tagMatch[1].toLowerCase();
    const isClosing = token.startsWith('</');
    const isSelfClosing = /\/>$/.test(token) || VOID_TAGS.has(tagName);

    if (isClosing) {
      depth = Math.max(depth - 1, 0);
      lines.push(pad.repeat(depth) + token.trim());
    } else {
      lines.push(pad.repeat(depth) + token.trim());
      if (!isSelfClosing) depth++;
    }
  }
  return lines.join('\n');
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const HtmlFormatterTool: React.FC = () => {
  const [input, setInput] = useState('<div class="card"><h1>Hello</h1><p>Welcome to NextTool.</p></div>');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);

  const run = (mode: 'format' | 'minify') => {
    if (!input.trim()) { setOutput(''); return; }
    setOutput(mode === 'format' ? formatHtml(input, indent) : minifyHtml(input));
  };

  return (
    <div className="space-y-4">
      <ToolBar>
        <div className="flex items-center gap-2">
          <button onClick={() => run('format')} className="px-3 py-1.5 bg-primary hover:brightness-110 text-primary-foreground text-xs font-medium rounded-md transition-colors shadow-xs">
            Pretty Print
          </button>
          <button onClick={() => run('minify')} className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md transition-colors">
            Minify
          </button>
        </div>
        <div className="flex items-center gap-3">
          <IndentSelect value={indent} onChange={setIndent} />
          <CopyButton text={output} label="Copy Result" />
        </div>
      </ToolBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Input HTML">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your HTML here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title="Output">
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
            {output || <span className="text-muted-foreground font-sans">Result will appear here...</span>}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * CSS Formatter
 * ──────────────────────────────────────────────────────────────────────── */

function formatCss(css: string, indentSize: number): string {
  const pad = ' '.repeat(indentSize);
  let out = '';
  let depth = 0;
  let i = 0;
  const s = css.trim();
  let buffer = '';

  const flushSelector = () => {
    const trimmed = buffer.trim();
    buffer = '';
    return trimmed;
  };

  while (i < s.length) {
    const ch = s[i];
    if (ch === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2);
      const comment = end === -1 ? s.slice(i) : s.slice(i, end + 2);
      out += pad.repeat(depth) + comment.trim() + '\n';
      i = end === -1 ? s.length : end + 2;
      continue;
    }
    if (ch === '{') {
      out += pad.repeat(depth) + flushSelector() + ' {\n';
      depth++;
      i++;
      continue;
    }
    if (ch === '}') {
      const decl = flushSelector();
      if (decl) out += pad.repeat(depth) + decl.replace(/;?$/, ';') + '\n';
      depth = Math.max(depth - 1, 0);
      out += pad.repeat(depth) + '}\n';
      i++;
      continue;
    }
    if (ch === ';') {
      const decl = flushSelector();
      if (decl) out += pad.repeat(depth) + decl + ';\n';
      i++;
      continue;
    }
    buffer += ch;
    i++;
  }
  const rest = flushSelector();
  if (rest) out += pad.repeat(depth) + rest + '\n';

  return out
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l, idx, arr) => !(l === '' && arr[idx - 1] === ''))
    .join('\n')
    .trim();
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const CssFormatterTool: React.FC = () => {
  const [input, setInput] = useState('.card{padding:1rem;border-radius:8px;} .card h1{font-size:1.25rem;color:#111;}');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);

  const run = (mode: 'format' | 'minify') => {
    if (!input.trim()) { setOutput(''); return; }
    setOutput(mode === 'format' ? formatCss(input, indent) : minifyCss(input));
  };

  return (
    <div className="space-y-4">
      <ToolBar>
        <div className="flex items-center gap-2">
          <button onClick={() => run('format')} className="px-3 py-1.5 bg-primary hover:brightness-110 text-primary-foreground text-xs font-medium rounded-md transition-colors shadow-xs">
            Pretty Print
          </button>
          <button onClick={() => run('minify')} className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md transition-colors">
            Minify
          </button>
        </div>
        <div className="flex items-center gap-3">
          <IndentSelect value={indent} onChange={setIndent} />
          <CopyButton text={output} label="Copy Result" />
        </div>
      </ToolBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Input CSS">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your CSS (or basic SCSS/LESS) here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title="Output">
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
            {output || <span className="text-muted-foreground font-sans">Result will appear here...</span>}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * JS/TS Formatter (lightweight)
 * ──────────────────────────────────────────────────────────────────────── */

function stripJsComments(js: string): string {
  let out = '';
  let i = 0;
  const n = js.length;
  while (i < n) {
    const ch = js[i];
    const next = js[i + 1];
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      out += ch;
      i++;
      while (i < n && js[i] !== quote) {
        if (js[i] === '\\') { out += js[i] + (js[i + 1] ?? ''); i += 2; continue; }
        out += js[i];
        i++;
      }
      out += js[i] ?? '';
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < n && js[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < n && !(js[i] === '*' && js[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function minifyJs(js: string): string {
  const noComments = stripJsComments(js);
  return noComments
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s*([{}();,:])\s*/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function prettifyJs(js: string, indentSize: number): string {
  const pad = ' '.repeat(indentSize);
  const cleaned = stripJsComments(js);
  let depth = 0;
  const out: string[] = [];
  // Split into statements/lines by braces, semicolons, and existing newlines while respecting strings.
  let buffer = '';
  const tokens: string[] = [];
  let i = 0;
  const n = cleaned.length;
  while (i < n) {
    const ch = cleaned[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      buffer += ch;
      i++;
      while (i < n && cleaned[i] !== quote) {
        if (cleaned[i] === '\\') { buffer += cleaned[i] + (cleaned[i + 1] ?? ''); i += 2; continue; }
        buffer += cleaned[i];
        i++;
      }
      buffer += cleaned[i] ?? '';
      i++;
      continue;
    }
    if (ch === '{' || ch === '}' || ch === ';') {
      buffer += ch;
      tokens.push(buffer);
      buffer = '';
      i++;
      continue;
    }
    if (ch === '\n') {
      if (buffer.trim()) tokens.push(buffer);
      buffer = '';
      i++;
      continue;
    }
    buffer += ch;
    i++;
  }
  if (buffer.trim()) tokens.push(buffer);

  for (const rawToken of tokens) {
    const token = rawToken.trim();
    if (!token) continue;
    if (token === '}' || token.startsWith('}')) {
      depth = Math.max(depth - 1, 0);
    }
    out.push(pad.repeat(depth) + token);
    const opens = (token.match(/\{/g) || []).length;
    const closes = (token.match(/\}/g) || []).length;
    depth += opens - closes - (token === '}' || token.startsWith('}') ? 0 : 0);
    depth = Math.max(depth, 0);
  }
  return out.join('\n');
}

export const JsFormatterTool: React.FC = () => {
  const [input, setInput] = useState(
    "function greet(name) {\n  // say hello\n  console.log('Hello, ' + name);\n}\ngreet('NextTool');"
  );
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);

  const run = (mode: 'prettify' | 'minify') => {
    if (!input.trim()) { setOutput(''); return; }
    setOutput(mode === 'prettify' ? prettifyJs(input, indent) : minifyJs(input));
  };

  return (
    <div className="space-y-4">
      <ToolBar>
        <div className="flex items-center gap-2">
          <button onClick={() => run('prettify')} className="px-3 py-1.5 bg-primary hover:brightness-110 text-primary-foreground text-xs font-medium rounded-md transition-colors shadow-xs">
            Prettify
          </button>
          <button onClick={() => run('minify')} className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md transition-colors">
            Minify
          </button>
        </div>
        <div className="flex items-center gap-3">
          <IndentSelect value={indent} onChange={setIndent} />
          <CopyButton text={output} label="Copy Result" />
        </div>
      </ToolBar>

      <p className="text-[11px] text-muted-foreground px-1 flex items-center gap-1">
        <Code2 className="w-3.5 h-3.5 shrink-0" />
        Lightweight whitespace/comment-based formatter — not a full parser like Prettier or Terser. Works best on typical, syntactically valid code.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Input JS / TS">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JavaScript or TypeScript here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title="Output">
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
            {output || <span className="text-muted-foreground font-sans">Result will appear here...</span>}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * URL Encoder / Decoder
 * ──────────────────────────────────────────────────────────────────────── */

export const UrlEncoderTool: React.FC = () => {
  const [input, setInput] = useState('https://example.com/search?q=hello world&lang=en');
  const [mode, setMode] = useState<'component' | 'full'>('component');
  const [error, setError] = useState<string | null>(null);

  const encoded = useMemo(() => {
    try {
      setError(null);
      return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
    } catch (err) {
      setError(errorMessage(err, 'Could not encode input'));
      return '';
    }
  }, [input, mode]);

  const decoded = useMemo(() => {
    try {
      return mode === 'component' ? decodeURIComponent(input) : decodeURI(input);
    } catch {
      return null;
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <ToolBar>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
          <button
            onClick={() => setMode('component')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === 'component' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
          >
            URI Component
          </button>
          <button
            onClick={() => setMode('full')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === 'full' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Full URI
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link2 className="w-3.5 h-3.5" />
          <span>{mode === 'component' ? 'encodeURIComponent / decodeURIComponent' : 'encodeURI / decodeURI'}</span>
        </div>
      </ToolBar>

      {error && <ErrorBanner message={error} />}

      <Panel title="Input" heightClass="h-[220px]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text or URL to encode/decode..."
          className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
        />
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Encoded" right={<CopyButton text={encoded} label="Copy" />}>
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap break-all leading-relaxed select-text">
            {encoded || <span className="text-muted-foreground font-sans">—</span>}
          </pre>
        </Panel>
        <Panel title="Decoded" right={<CopyButton text={decoded ?? ''} label="Copy" />}>
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap break-all leading-relaxed select-text">
            {decoded === null ? (
              <span className="text-rose-500 font-sans">Invalid encoded sequence for decoding.</span>
            ) : (
              decoded || <span className="text-muted-foreground font-sans">—</span>
            )}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * Diff Checker (LCS-based line diff)
 * ──────────────────────────────────────────────────────────────────────── */

type DiffOp = { type: 'equal' | 'add' | 'remove'; line: string };

function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', line: a[i] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', line: a[i] });
      i++;
    } else {
      ops.push({ type: 'add', line: b[j] });
      j++;
    }
  }
  while (i < n) { ops.push({ type: 'remove', line: a[i] }); i++; }
  while (j < m) { ops.push({ type: 'add', line: b[j] }); j++; }
  return ops;
}

/** Row for the split (side-by-side) diff view — mirrors diffchecker.com's two-gutter layout. */
type SplitRow = { num: number | null; line: string; type: 'equal' | 'add' | 'remove' | 'empty' };

function buildSplitRows(ops: DiffOp[]): { leftRows: SplitRow[]; rightRows: SplitRow[] } {
  const leftRows: SplitRow[] = [];
  const rightRows: SplitRow[] = [];
  let leftNum = 1;
  let rightNum = 1;
  for (const op of ops) {
    if (op.type === 'equal') {
      leftRows.push({ num: leftNum++, line: op.line, type: 'equal' });
      rightRows.push({ num: rightNum++, line: op.line, type: 'equal' });
    } else if (op.type === 'remove') {
      leftRows.push({ num: leftNum++, line: op.line, type: 'remove' });
      rightRows.push({ num: null, line: '', type: 'empty' });
    } else {
      leftRows.push({ num: null, line: '', type: 'empty' });
      rightRows.push({ num: rightNum++, line: op.line, type: 'add' });
    }
  }
  return { leftRows, rightRows };
}

const DIFF_ROW_BG: Record<SplitRow['type'], string> = {
  equal: '',
  add: 'bg-emerald-500/[0.14]',
  remove: 'bg-rose-500/[0.14]',
  empty: 'bg-muted/40',
};

export const DiffCheckerTool: React.FC = () => {
  const [left, setLeft] = useState('line one\nline two\nline three');
  const [right, setRight] = useState('line one\nline two changed\nline three\nline four');
  const [view, setView] = useState<'split' | 'unified'>('split');

  const ops = useMemo(() => diffLines(left.split('\n'), right.split('\n')), [left, right]);
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const op of ops) {
      if (op.type === 'add') added++;
      if (op.type === 'remove') removed++;
    }
    return { added, removed };
  }, [ops]);
  const identical = stats.added === 0 && stats.removed === 0;
  const { leftRows, rightRows } = useMemo(() => buildSplitRows(ops), [ops]);

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          <GitCompare className="w-4 h-4 text-primary" />
          <span>Compare two blocks of code or text line-by-line, entirely on-device</span>
        </div>
        <div className="flex items-center gap-2">
          <Segmented>
            <SegmentedButton active={view === 'split'} onClick={() => setView('split')}>Split</SegmentedButton>
            <SegmentedButton active={view === 'unified'} onClick={() => setView('unified')}>Unified</SegmentedButton>
          </Segmented>
          <StatusPill valid={identical} validLabel="Identical" invalidLabel={`+${stats.added} -${stats.removed}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <DarkPanel label="Original" className="h-[240px]">
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
            placeholder="Paste original text or code..."
            className="flex-1 w-full bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed"
          />
        </DarkPanel>
        <DarkPanel label="Changed" className="h-[240px]">
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
            placeholder="Paste changed text or code..."
            className="flex-1 w-full bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed"
          />
        </DarkPanel>
      </div>

      <WhitePanel
        label={view === 'split' ? 'Side-by-side diff' : 'Unified diff'}
        headerRight={
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{stats.added}</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">-{stats.removed}</span>
          </div>
        }
      >
        {view === 'split' ? (
          <div className="grid grid-cols-2 max-h-[420px] overflow-auto font-mono text-[12.5px] leading-relaxed divide-x divide-border">
            {[leftRows, rightRows].map((rows, side) => (
              <div key={side} className="min-w-0">
                {rows.map((r, idx) => (
                  <div key={idx} className={`flex ${DIFF_ROW_BG[r.type]}`}>
                    <span className="shrink-0 w-9 px-2 py-0.5 text-right text-muted-foreground/60 select-none border-r border-border/60">
                      {r.num ?? ''}
                    </span>
                    <span className="flex-1 px-2.5 py-0.5 whitespace-pre-wrap break-all text-foreground/90">
                      {r.line || (r.type === 'empty' ? '' : ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-[420px] overflow-auto font-mono text-[12.5px] leading-relaxed">
            {ops.map((op, idx) => (
              <div
                key={idx}
                className={`px-4 py-0.5 whitespace-pre-wrap break-all ${
                  op.type === 'add'
                    ? 'bg-emerald-500/[0.14] text-emerald-700 dark:text-emerald-400'
                    : op.type === 'remove'
                    ? 'bg-rose-500/[0.14] text-rose-700 dark:text-rose-400'
                    : 'text-muted-foreground'
                }`}
              >
                <span className="select-none opacity-70 mr-1.5">
                  {op.type === 'add' ? '+' : op.type === 'remove' ? '−' : ' '}
                </span>
                {op.line || ' '}
              </div>
            ))}
          </div>
        )}
      </WhitePanel>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * Markdown Preview
 * ──────────────────────────────────────────────────────────────────────── */

export const MarkdownPreviewTool: React.FC = () => {
  const [input, setInput] = useState('# Hello NextTool\n\nThis is **live** markdown preview with `code` support.\n\n- Item one\n- Item two\n\n> Blockquote example');

  const html = useMemo(() => {
    try {
      // marked escapes raw HTML in the input by default (no `mangle`/raw html passthrough),
      // so the rendered output only ever contains markup marked itself generated.
      const result = marked.parse(input, { async: false });
      return typeof result === 'string' ? result : '';
    } catch {
      return '<p>Could not render markdown.</p>';
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <ToolBar>
        <p className="text-xs text-muted-foreground">Live side-by-side markdown editor and preview.</p>
        <CopyButton text={input} label="Copy Markdown" />
      </ToolBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Markdown" heightClass="h-[480px]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type markdown here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title="Preview" heightClass="h-[480px]">
          <div
            className="flex-1 p-4 overflow-auto prose prose-sm dark:prose-invert max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * HTML <-> Markdown
 * ──────────────────────────────────────────────────────────────────────── */

export const HtmlMarkdownTool: React.FC = () => {
  const [direction, setDirection] = useState<'htmlToMd' | 'mdToHtml'>('htmlToMd');
  const [input, setInput] = useState('<h1>Hello</h1>\n<p>This is <strong>NextTool</strong>.</p>\n<ul><li>One</li><li>Two</li></ul>');
  const [error, setError] = useState<string | null>(null);

  const turndownService = useMemo(() => new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' }), []);

  const output = useMemo(() => {
    if (!input.trim()) { setError(null); return ''; }
    try {
      if (direction === 'htmlToMd') {
        const result = turndownService.turndown(input);
        setError(null);
        return result;
      }
      const result = marked.parse(input, { async: false });
      setError(null);
      return typeof result === 'string' ? result : '';
    } catch (err) {
      setError(errorMessage(err, 'Conversion failed'));
      return '';
    }
  }, [input, direction, turndownService]);

  const toggleDirection = () => {
    setDirection((d) => (d === 'htmlToMd' ? 'mdToHtml' : 'htmlToMd'));
    setInput(output || '');
  };

  return (
    <div className="space-y-4">
      <ToolBar>
        <button
          onClick={toggleDirection}
          className="px-3 py-1.5 bg-muted text-muted-foreground hover:bg-muted border-border border text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{direction === 'htmlToMd' ? 'HTML → Markdown' : 'Markdown → HTML'}</span>
        </button>
        <CopyButton text={output} label="Copy Result" />
      </ToolBar>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={direction === 'htmlToMd' ? 'Input HTML' : 'Input Markdown'} heightClass="h-[420px]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'htmlToMd' ? 'Paste HTML here...' : 'Paste Markdown here...'}
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
        </Panel>
        <Panel title={direction === 'htmlToMd' ? 'Output Markdown' : 'Output HTML'} heightClass="h-[420px]">
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap leading-relaxed select-text">
            {output || <span className="text-muted-foreground font-sans">Result will appear here...</span>}
          </pre>
        </Panel>
      </div>
    </div>
  );
};
