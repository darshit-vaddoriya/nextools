import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { CopyButton } from '../../components/CopyButton';
import { renderMarkdown } from '../../utils/markdown';
import { Select } from '../../components/Select';
import { DarkPanel, WhitePanel, Segmented, SegmentedButton, StatusPill, CopyTextButton, ToolShell, useFullView } from '../../components/DevToolChrome';
import { errorMessage } from '../../utils/errorMessage';
import {
  AlertTriangle,
  CheckCircle,
  Trash2,
  ArrowLeftRight,
  Code2,
  Link2,
  GitCompare,
  ChevronUp,
  ChevronDown,
  Maximize2,
  X,
  Upload,
  Download,
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
        Lightweight whitespace/comment-based formatter, not a full parser like Prettier or Terser. Works best on typical, syntactically valid code.
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
            {encoded || <span className="text-muted-foreground font-sans">, </span>}
          </pre>
        </Panel>
        <Panel title="Decoded" right={<CopyButton text={decoded ?? ''} label="Copy" />}>
          <pre className="flex-1 p-3.5 overflow-auto font-mono text-xs text-success whitespace-pre-wrap break-all leading-relaxed select-text">
            {decoded === null ? (
              <span className="text-rose-500 font-sans">Invalid encoded sequence for decoding.</span>
            ) : (
              decoded || <span className="text-muted-foreground font-sans">, </span>
            )}
          </pre>
        </Panel>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * Diff Checker (LCS line diff, side-by-side aligned rows)
 * ──────────────────────────────────────────────────────────────────────── */

type DiffOpType = 'equal' | 'add' | 'remove';
/** One diff step. `ai`/`bi` index back into the original line arrays (-1 when absent). */
type DiffOp = { type: DiffOpType; ai: number; bi: number };

/**
 * LCS diff over pre-normalised keys, returning index ops so callers can render the
 * original (non-normalised) text. Identical head/tail are trimmed first, which keeps
 * the O(n*m) table small for the common "few edits in a big file" case.
 */
function lcsDiff(aKeys: string[], bKeys: string[]): DiffOp[] {
  const ops: DiffOp[] = [];
  let start = 0;
  const maxStart = Math.min(aKeys.length, bKeys.length);
  while (start < maxStart && aKeys[start] === bKeys[start]) start++;
  let endA = aKeys.length;
  let endB = bKeys.length;
  while (endA > start && endB > start && aKeys[endA - 1] === bKeys[endB - 1]) { endA--; endB--; }

  for (let k = 0; k < start; k++) ops.push({ type: 'equal', ai: k, bi: k });

  const a = aKeys.slice(start, endA);
  const b = bKeys.slice(start, endB);
  const n = a.length;
  const m = b.length;

  // Guard against pathological memory use on huge unrelated inputs: fall back to a
  // plain "remove everything, add everything" block instead of allocating the table.
  if (n * m > 6_000_000) {
    for (let i = 0; i < n; i++) ops.push({ type: 'remove', ai: start + i, bi: -1 });
    for (let j = 0; j < m; j++) ops.push({ type: 'add', ai: -1, bi: start + j });
  } else {
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { ops.push({ type: 'equal', ai: start + i, bi: start + j }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: 'remove', ai: start + i, bi: -1 }); i++; }
      else { ops.push({ type: 'add', ai: -1, bi: start + j }); j++; }
    }
    while (i < n) { ops.push({ type: 'remove', ai: start + i, bi: -1 }); i++; }
    while (j < m) { ops.push({ type: 'add', ai: -1, bi: start + j }); j++; }
  }

  for (let k = 0; k < aKeys.length - endA; k++) ops.push({ type: 'equal', ai: endA + k, bi: endB + k });
  return ops;
}

/** Inline (word-level) segments used to highlight what actually changed inside a line. */
type InlineSeg = { text: string; changed: boolean };

function inlineDiff(before: string, after: string): { left: InlineSeg[]; right: InlineSeg[] } {
  const split = (s: string) => s.split(/(\s+|\b)/).filter((t) => t.length > 0);
  const a = split(before);
  const b = split(after);
  const ops = lcsDiff(a, b);
  const left: InlineSeg[] = [];
  const right: InlineSeg[] = [];
  const push = (arr: InlineSeg[], text: string, changed: boolean) => {
    const last = arr[arr.length - 1];
    if (last && last.changed === changed) last.text += text;
    else arr.push({ text, changed });
  };
  for (const op of ops) {
    if (op.type === 'equal') { push(left, a[op.ai], false); push(right, b[op.bi], false); }
    else if (op.type === 'remove') push(left, a[op.ai], true);
    else push(right, b[op.bi], true);
  }
  return { left, right };
}

/** One rendered row: a left line, a right line, or an aligned pair of both. */
type DiffSide = { num: number; text: string; segs?: InlineSeg[] } | null;
type DiffRow = { type: 'equal' | 'add' | 'remove' | 'modify'; left: DiffSide; right: DiffSide };

/**
 * Turns the raw op stream into aligned rows: a run of removals immediately followed by
 * a run of additions is zipped index-wise so a changed line sits opposite its counterpart
 * instead of being pushed out of line by a blank filler.
 */
function buildRows(ops: DiffOp[], aLines: string[], bLines: string[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let k = 0;
  while (k < ops.length) {
    if (ops[k].type === 'equal') {
      const op = ops[k];
      rows.push({
        type: 'equal',
        left: { num: op.ai + 1, text: aLines[op.ai] },
        right: { num: op.bi + 1, text: bLines[op.bi] },
      });
      k++;
      continue;
    }
    const removed: number[] = [];
    const added: number[] = [];
    while (k < ops.length && ops[k].type !== 'equal') {
      if (ops[k].type === 'remove') removed.push(ops[k].ai);
      else added.push(ops[k].bi);
      k++;
    }
    const pairs = Math.max(removed.length, added.length);
    for (let p = 0; p < pairs; p++) {
      const ai = removed[p];
      const bi = added[p];
      if (ai !== undefined && bi !== undefined) {
        const seg = inlineDiff(aLines[ai], bLines[bi]);
        rows.push({
          type: 'modify',
          left: { num: ai + 1, text: aLines[ai], segs: seg.left },
          right: { num: bi + 1, text: bLines[bi], segs: seg.right },
        });
      } else if (ai !== undefined) {
        rows.push({ type: 'remove', left: { num: ai + 1, text: aLines[ai] }, right: null });
      } else {
        rows.push({ type: 'add', left: null, right: { num: bi + 1, text: bLines[bi] } });
      }
    }
  }
  return rows;
}

/** Extensions the diff file picker offers; anything text-ish still drops fine. */
const UPLOAD_ACCEPT = 'text/*,.txt,.log,.json,.csv,.tsv,.md,.js,.jsx,.ts,.tsx,.css,.scss,.html,.xml,.svg,.yml,.yaml,.toml,.ini,.env,.py,.rb,.go,.rs,.java,.php,.sh,.sql,.diff,.patch';

/** Runs of untouched rows longer than this collapse behind a "show N lines" button. */
const COLLAPSE_THRESHOLD = 8;
const COLLAPSE_CONTEXT = 3;

type RenderItem =
  | { kind: 'row'; row: DiffRow; index: number }
  | { kind: 'gap'; id: number; count: number; from: number; to: number };

/** Hides long stretches of identical lines so the eye lands on the actual changes. */
function collapseRows(rows: DiffRow[], expanded: Set<number>): RenderItem[] {
  const items: RenderItem[] = [];
  let i = 0;
  while (i < rows.length) {
    if (rows[i].type !== 'equal') {
      items.push({ kind: 'row', row: rows[i], index: i });
      i++;
      continue;
    }
    let j = i;
    while (j < rows.length && rows[j].type === 'equal') j++;
    const runLength = j - i;
    const leadContext = i === 0 ? 0 : COLLAPSE_CONTEXT;
    const tailContext = j === rows.length ? 0 : COLLAPSE_CONTEXT;
    if (runLength <= COLLAPSE_THRESHOLD || expanded.has(i)) {
      for (let k = i; k < j; k++) items.push({ kind: 'row', row: rows[k], index: k });
    } else {
      for (let k = i; k < i + leadContext; k++) items.push({ kind: 'row', row: rows[k], index: k });
      const hidden = runLength - leadContext - tailContext;
      items.push({ kind: 'gap', id: i, count: hidden, from: i + leadContext, to: j - tailContext });
      for (let k = j - tailContext; k < j; k++) items.push({ kind: 'row', row: rows[k], index: k });
    }
    i = j;
  }
  return items;
}

const ROW_TONE: Record<DiffRow['type'], { left: string; right: string }> = {
  equal: { left: '', right: '' },
  add: { left: 'bg-muted/50', right: 'bg-emerald-500/[0.13]' },
  remove: { left: 'bg-rose-500/[0.13]', right: 'bg-muted/50' },
  modify: { left: 'bg-rose-500/[0.10]', right: 'bg-emerald-500/[0.10]' },
};

/** One half of a side-by-side row: line-number gutter + change marker + code. */
const DiffCell: React.FC<{
  side: DiffSide;
  tone: string;
  marker: string;
  wrap: boolean;
  highlight: string;
}> = ({ side, tone, marker, wrap, highlight }) => (
  <div className={`flex min-w-0 ${tone}`}>
    <span className="shrink-0 w-11 px-2 py-[3px] text-right text-[11px] text-muted-foreground/60 select-none border-r border-border/50">
      {side ? side.num : ''}
    </span>
    <span className="shrink-0 w-4 py-[3px] text-center text-muted-foreground/70 select-none">{side ? marker : ''}</span>
    <code
      className={`flex-1 min-w-0 px-2 py-[3px] text-foreground/90 ${
        wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
      }`}
    >
      {side
        ? side.segs
          ? side.segs.map((s, si) => (
              <span key={si} className={s.changed ? `${highlight} rounded-[2px]` : ''}>
                {s.text}
              </span>
            ))
          : side.text || ' '
        : ' '}
    </code>
  </div>
);

export const DiffCheckerTool: React.FC = () => {
  const [left, setLeft] = useState('function greet(name) {\n  const msg = "Hello " + name;\n  console.log(msg);\n  return msg;\n}');
  const [right, setRight] = useState('function greet(name, greeting = "Hello") {\n  const msg = `${greeting} ${name}`;\n  console.log(msg);\n  return msg;\n}');
  const [view, setView] = useState<'split' | 'unified'>('split');
  const [wrap, setWrap] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [fullscreen, setFullscreen] = useState(false);
  const [fileNames, setFileNames] = useState<{ left: string | null; right: string | null }>({ left: null, right: null });
  const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);
  const [cursor, setCursor] = useState(0);

  const resultRef = useRef<HTMLDivElement>(null);

  const aLines = useMemo(() => left.split('\n'), [left]);
  const bLines = useMemo(() => right.split('\n'), [right]);

  const normalise = useCallback(
    (line: string) => {
      let key = line;
      if (ignoreWhitespace) key = key.trim().replace(/\s+/g, ' ');
      if (ignoreCase) key = key.toLowerCase();
      return key;
    },
    [ignoreWhitespace, ignoreCase],
  );

  const rows = useMemo(() => {
    const ops = lcsDiff(aLines.map(normalise), bLines.map(normalise));
    return buildRows(ops, aLines, bLines);
  }, [aLines, bLines, normalise]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let modified = 0;
    for (const r of rows) {
      if (r.type === 'add') added++;
      else if (r.type === 'remove') removed++;
      else if (r.type === 'modify') modified++;
    }
    return { added, removed, modified };
  }, [rows]);
  const identical = stats.added === 0 && stats.removed === 0 && stats.modified === 0;

  // Indices of rows that start a change block, used by the prev/next change jumper.
  const changeAnchors = useMemo(() => {
    const anchors: number[] = [];
    rows.forEach((r, i) => {
      if (r.type !== 'equal' && (i === 0 || rows[i - 1].type === 'equal')) anchors.push(i);
    });
    return anchors;
  }, [rows]);

  useEffect(() => {
    setExpanded(new Set());
    setCursor(0);
  }, [left, right, ignoreWhitespace, ignoreCase]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  const items = useMemo(() => collapseRows(rows, expanded), [rows, expanded]);

  const unifiedText = useMemo(
    () =>
      rows
        .flatMap((r) => {
          if (r.type === 'equal') return [`  ${r.left!.text}`];
          if (r.type === 'add') return [`+ ${r.right!.text}`];
          if (r.type === 'remove') return [`- ${r.left!.text}`];
          return [`- ${r.left!.text}`, `+ ${r.right!.text}`];
        })
        .join('\n'),
    [rows],
  );

  const jump = (delta: number) => {
    if (changeAnchors.length === 0) return;
    const next = (cursor + delta + changeAnchors.length) % changeAnchors.length;
    setCursor(next);
    const target = resultRef.current?.querySelector(`[data-row="${changeAnchors[next]}"]`);
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const swap = () => {
    setLeft(right);
    setRight(left);
    setFileNames((prev) => ({ left: prev.right, right: prev.left }));
  };
  const clearAll = () => {
    setLeft('');
    setRight('');
    setFileNames({ left: null, right: null });
  };

  /** Reads a dropped or picked file into one side, remembering its name for the button label. */
  const readFileInto = (target: 'left' | 'right', file: File) => {
    file.text().then((text) => {
      if (target === 'left') setLeft(text);
      else setRight(text);
      setFileNames((prev) => ({ ...prev, [target]: file.name }));
    });
  };

  const loadFile = (target: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFileInto(target, file);
    e.target.value = '';
  };

  const toggleGap = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const summary = (
    <div className="flex items-center gap-3 text-[12px] font-mono font-bold">
      <span className="text-emerald-600 dark:text-emerald-400">+{stats.added + stats.modified}</span>
      <span className="text-rose-600 dark:text-rose-400">-{stats.removed + stats.modified}</span>
      {stats.modified > 0 && <span className="text-amber-600 dark:text-amber-400">~{stats.modified}</span>}
    </div>
  );

  const resultBody = (
    <div ref={resultRef} className="flex-1 overflow-auto font-mono text-[12.5px] leading-[1.65]">
      {identical ? (
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <CheckCircle className="w-7 h-7 text-success" />
          <p className="text-[13px] font-semibold text-foreground">Both sides are identical</p>
          <p className="text-xs text-muted-foreground font-sans">Edit either side above to see changes appear instantly.</p>
        </div>
      ) : view === 'split' ? (
        <div className={wrap ? '' : 'min-w-max'}>
          {items.map((item) =>
            item.kind === 'gap' ? (
              <button
                key={`gap-${item.id}`}
                type="button"
                onClick={() => toggleGap(item.id)}
                className="w-full px-4 py-1.5 text-left text-[11.5px] font-sans font-semibold text-primary bg-muted/60 border-y border-border/60 hover:bg-muted transition-colors sticky-none"
              >
                ⋯ Show {item.count} unchanged {item.count === 1 ? 'line' : 'lines'}
              </button>
            ) : (
              <div key={item.index} data-row={item.index} className="grid grid-cols-2 divide-x divide-border/70">
                <DiffCell
                  side={item.row.left}
                  tone={ROW_TONE[item.row.type].left}
                  marker={item.row.type === 'remove' || item.row.type === 'modify' ? '−' : ''}
                  wrap={wrap}
                  highlight="bg-rose-500/30"
                />
                <DiffCell
                  side={item.row.right}
                  tone={ROW_TONE[item.row.type].right}
                  marker={item.row.type === 'add' || item.row.type === 'modify' ? '+' : ''}
                  wrap={wrap}
                  highlight="bg-emerald-500/30"
                />
              </div>
            ),
          )}
        </div>
      ) : (
        <div className={wrap ? '' : 'min-w-max'}>
          {items.map((item) => {
            if (item.kind === 'gap') {
              return (
                <button
                  key={`gap-${item.id}`}
                  type="button"
                  onClick={() => toggleGap(item.id)}
                  className="w-full px-4 py-1.5 text-left text-[11.5px] font-sans font-semibold text-primary bg-muted/60 border-y border-border/60 hover:bg-muted transition-colors"
                >
                  ⋯ Show {item.count} unchanged {item.count === 1 ? 'line' : 'lines'}
                </button>
              );
            }
            const { row, index } = item;
            const lines: { side: DiffSide; sign: string; tone: string; highlight: string }[] = [];
            if (row.type === 'equal') lines.push({ side: row.left, sign: ' ', tone: '', highlight: '' });
            else {
              if (row.left) lines.push({ side: row.left, sign: '−', tone: 'bg-rose-500/[0.13]', highlight: 'bg-rose-500/30' });
              if (row.right) lines.push({ side: row.right, sign: '+', tone: 'bg-emerald-500/[0.13]', highlight: 'bg-emerald-500/30' });
            }
            return (
              <div key={index} data-row={index}>
                {lines.map((l, li) => (
                  <DiffCell
                    key={li}
                    side={l.side}
                    tone={l.tone}
                    marker={l.sign}
                    wrap={wrap}
                    highlight={l.highlight}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const resultToolbar = (
    <div className="flex items-center gap-2">
      {summary}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => jump(-1)}
          disabled={changeAnchors.length === 0}
          title="Previous change"
          aria-label="Previous change"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
          {changeAnchors.length ? `${cursor + 1}/${changeAnchors.length}` : '0/0'}
        </span>
        <button
          type="button"
          onClick={() => jump(1)}
          disabled={changeAnchors.length === 0}
          title="Next change"
          aria-label="Next change"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <CopyButton text={unifiedText} label="Copy diff" />
      {/* In full view the Close control lives in the overlay's own top bar instead. */}
      {!fullscreen && (
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          title="Open full view"
          aria-label="Open full view"
          className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg text-[12px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
          Full view
        </button>
      )}
    </div>
  );

  const viewControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented>
        <SegmentedButton active={view === 'split'} onClick={() => setView('split')}>Split</SegmentedButton>
        <SegmentedButton active={view === 'unified'} onClick={() => setView('unified')}>Unified</SegmentedButton>
      </Segmented>
      <Segmented>
        <SegmentedButton active={wrap} onClick={() => setWrap(true)}>Wrap</SegmentedButton>
        <SegmentedButton active={!wrap} onClick={() => setWrap(false)}>No wrap</SegmentedButton>
      </Segmented>
      <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer select-none">
        <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} className="accent-[color:var(--segmented-active-bg)]" />
        Ignore whitespace
      </label>
      <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer select-none">
        <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="accent-[color:var(--segmented-active-bg)]" />
        Ignore case
      </label>
    </div>
  );

  if (fullscreen) {
    // Portalled to <body>: the tool renders inside the page layout, so an in-place overlay
    // sits under the sticky site header (also z-50) and hides its own Close button.
    return createPortal(
      <div className="fixed inset-0 z-[90] bg-background flex flex-col p-4 gap-3">
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
            <GitCompare className="w-4 h-4 text-primary" />
            Diff Checker · full view
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close full view"
            className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-muted text-foreground hover:bg-border transition-colors"
          >
            <X className="w-4 h-4" />
            Close
            <kbd className="ml-0.5 px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-mono font-semibold text-muted-foreground">Esc</kbd>
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
          {viewControls}
          {resultToolbar}
        </div>
        <div className="flex-1 min-h-0 rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 divide-x divide-border/70 border-b border-border shrink-0 text-[11.5px] font-bold uppercase tracking-[0.06em] font-mono text-muted-foreground">
            <span className="px-4 py-2">Original · {aLines.length} lines</span>
            <span className="px-4 py-2">Changed · {bLines.length} lines</span>
          </div>
          {resultBody}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
          <GitCompare className="w-4 h-4 text-primary" />
          <span>Compare two blocks of code or text line-by-line, entirely on-device</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={swap}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
          <StatusPill valid={identical} validLabel="Identical" invalidLabel={`${stats.added + stats.modified} added · ${stats.removed + stats.modified} removed`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {([
          { label: 'Original', value: left, set: setLeft, side: 'left' as const, count: aLines.length },
          { label: 'Changed', value: right, set: setRight, side: 'right' as const, count: bLines.length },
        ]).map((pane) => (
          <DarkPanel
            key={pane.side}
            label={`${pane.label} · ${pane.count} ${pane.count === 1 ? 'line' : 'lines'}`}
            className="h-[260px]"
            headerRight={
              <label
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[color:var(--devpanel-border)] bg-white/[0.06] text-[12px] font-bold text-[color:var(--devpanel-text)] hover:bg-white/[0.12] cursor-pointer transition-colors"
                title="Load a text or code file from your device"
              >
                <Upload className="w-3.5 h-3.5" />
                {fileNames[pane.side] ?? 'Upload file'}
                <input
                  type="file"
                  accept={UPLOAD_ACCEPT}
                  onChange={loadFile(pane.side)}
                  className="sr-only"
                />
              </label>
            }
          >
            <textarea
              value={pane.value}
              onChange={(e) => pane.set(e.target.value)}
              onDragOver={(e) => { e.preventDefault(); setDragSide(pane.side); }}
              onDragLeave={() => setDragSide(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragSide(null);
                const file = e.dataTransfer.files?.[0];
                if (file) readFileInto(pane.side, file);
              }}
              spellCheck={false}
              placeholder={`Paste ${pane.label.toLowerCase()} text or code, or drop a file here…`}
              className={`flex-1 w-full bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed ${
                dragSide === pane.side ? 'ring-2 ring-inset ring-primary/70 bg-primary/5' : ''
              }`}
            />
          </DarkPanel>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">{viewControls}</div>

      <WhitePanel
        label={view === 'split' ? 'Side-by-side diff' : 'Unified diff'}
        headerRight={resultToolbar}
        className="min-h-[460px] max-h-[80vh]"
      >
        {view === 'split' && !identical && (
          <div className="grid grid-cols-2 divide-x divide-border/70 border-b border-border shrink-0 text-[11px] font-bold uppercase tracking-[0.06em] font-mono text-muted-foreground">
            <span className="px-4 py-1.5">Original</span>
            <span className="px-4 py-1.5">Changed</span>
          </div>
        )}
        {resultBody}
      </WhitePanel>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
 * Markdown Preview
 * ──────────────────────────────────────────────────────────────────────── */

const MARKDOWN_SAMPLE = `## Release notes

Write Markdown on the left, see the **rendered structure** on the right — headings,
lists, tables and code all styled exactly as they will read.

### What changed

| Tool | Status | Notes |
| --- | --- | --- |
| Diff Checker | Shipped | Side-by-side with inline word highlights |
| JSON Formatter | Shipped | Tree view + full screen |
| Markdown Preview | In review | GFM tables and task lists |

### Checklist

- [x] Tables render with borders
- [x] Task lists keep their checkboxes
- [ ] Mermaid diagrams

1. Paste or type Markdown
2. Watch the preview update live
3. Copy the Markdown or the generated HTML

> Everything runs on your device — nothing is uploaded.

\`\`\`ts
const render = (md: string) => marked.parse(md, { gfm: true });
\`\`\`

Inline \`code\`, a [link](https://nexttool.click) and ~~struck text~~ all work.
`;

/** One button in the Markdown formatting toolbar. */
type MdAction =
  | { kind: 'wrap'; before: string; after: string; placeholder: string }
  | { kind: 'prefix'; prefix: string | ((index: number) => string); placeholder: string }
  | { kind: 'block'; text: string };

const MD_TOOLBAR: { id: string; label: string; title: string; action: MdAction; shortcut?: string }[] = [
  { id: 'bold', label: 'B', title: 'Bold (Ctrl+B)', shortcut: 'b', action: { kind: 'wrap', before: '**', after: '**', placeholder: 'bold text' } },
  { id: 'italic', label: 'I', title: 'Italic (Ctrl+I)', shortcut: 'i', action: { kind: 'wrap', before: '_', after: '_', placeholder: 'italic text' } },
  { id: 'strike', label: 'S', title: 'Strikethrough', action: { kind: 'wrap', before: '~~', after: '~~', placeholder: 'struck text' } },
  { id: 'h2', label: 'H2', title: 'Heading 2', action: { kind: 'prefix', prefix: '## ', placeholder: 'Heading' } },
  { id: 'h3', label: 'H3', title: 'Heading 3', action: { kind: 'prefix', prefix: '### ', placeholder: 'Subheading' } },
  { id: 'link', label: '🔗', title: 'Link (Ctrl+K)', shortcut: 'k', action: { kind: 'wrap', before: '[', after: '](https://)', placeholder: 'link text' } },
  { id: 'code', label: '`', title: 'Inline code', action: { kind: 'wrap', before: '`', after: '`', placeholder: 'code' } },
  { id: 'codeblock', label: '{ }', title: 'Code block', action: { kind: 'wrap', before: '```ts\n', after: '\n```', placeholder: 'const x = 1;' } },
  { id: 'ul', label: '• List', title: 'Bullet list', action: { kind: 'prefix', prefix: '- ', placeholder: 'List item' } },
  { id: 'ol', label: '1. List', title: 'Numbered list', action: { kind: 'prefix', prefix: (i: number) => `${i + 1}. `, placeholder: 'List item' } },
  { id: 'task', label: '☑', title: 'Task list', action: { kind: 'prefix', prefix: '- [ ] ', placeholder: 'To do' } },
  { id: 'quote', label: '❝', title: 'Blockquote', action: { kind: 'prefix', prefix: '> ', placeholder: 'Quoted text' } },
  { id: 'table', label: 'Table', title: 'Insert table', action: { kind: 'block', text: '\n| Column | Column |\n| --- | --- |\n| Cell | Cell |\n' } },
  { id: 'hr', label: '—', title: 'Divider', action: { kind: 'block', text: '\n---\n' } },
];

const downloadBlob = (text: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const MarkdownPreviewTool: React.FC = () => {
  // Sample starts at h2: an h1 here would render a second <h1> into the tool page,
  // competing with the page's real heading.
  const [input, setInput] = useState(MARKDOWN_SAMPLE);
  const [pane, setPane] = useState<'split' | 'preview' | 'html'>('split');
  const [syncScroll, setSyncScroll] = useState(true);
  const [full, setFull] = useFullView();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  // Guards the two scroll handlers from echoing each other into a feedback loop.
  const scrollingFrom = useRef<'editor' | 'preview' | null>(null);

  const html = useMemo(() => {
    try {
      // marked escapes raw HTML in the input by default (no `mangle`/raw html passthrough),
      // so the rendered output only ever contains markup marked itself generated.
      // renderMarkdown also wraps every table in its own scroll container.
      return renderMarkdown(input).html;
    } catch {
      return '<p>Could not render markdown.</p>';
    }
  }, [input]);

  const stats = useMemo(() => {
    const words = input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0;
    return {
      words,
      chars: input.length,
      lines: input.split('\n').length,
      minutes: Math.max(1, Math.round(words / 220)),
      headings: (input.match(/^#{1,6}\s/gm) ?? []).length,
    };
  }, [input]);

  /** Applies a toolbar action to the current selection and keeps the caret sensible. */
  const applyAction = (action: MdAction) => {
    const el = editorRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = input.slice(start, end);

    let replacement: string;
    let caretStart: number;
    let caretEnd: number;

    if (action.kind === 'wrap') {
      const text = selected || action.placeholder;
      replacement = `${action.before}${text}${action.after}`;
      caretStart = start + action.before.length;
      caretEnd = caretStart + text.length;
    } else if (action.kind === 'prefix') {
      const lines = (selected || action.placeholder).split('\n');
      replacement = lines
        .map((line, i) => `${typeof action.prefix === 'function' ? action.prefix(i) : action.prefix}${line}`)
        .join('\n');
      caretStart = start;
      caretEnd = start + replacement.length;
    } else {
      replacement = action.text;
      caretStart = start + action.text.length;
      caretEnd = caretStart;
    }

    const next = input.slice(0, start) + replacement + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caretStart, caretEnd);
    });
  };

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const hit = MD_TOOLBAR.find((b) => b.shortcut === e.key.toLowerCase());
    if (!hit) return;
    e.preventDefault();
    applyAction(hit.action);
  };

  /** Mirrors one pane's scroll position onto the other as a percentage of its range. */
  const syncFrom = (source: 'editor' | 'preview') => () => {
    if (!syncScroll || pane !== 'split') return;
    if (scrollingFrom.current && scrollingFrom.current !== source) return;
    const from = source === 'editor' ? editorRef.current : previewRef.current;
    const to = source === 'editor' ? previewRef.current : editorRef.current;
    if (!from || !to) return;
    const range = from.scrollHeight - from.clientHeight;
    if (range <= 0) return;
    scrollingFrom.current = source;
    to.scrollTop = (from.scrollTop / range) * (to.scrollHeight - to.clientHeight);
    requestAnimationFrame(() => { scrollingFrom.current = null; });
  };

  const panelHeight = full ? 'h-full min-h-0' : 'h-[620px]';

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-[color:var(--devpanel-border)] shrink-0">
      {MD_TOOLBAR.map((b) => (
        <button
          key={b.id}
          type="button"
          title={b.title}
          aria-label={b.title}
          onClick={() => applyAction(b.action)}
          className={`px-2 h-7 min-w-[28px] rounded-md text-[12px] text-[color:var(--devpanel-text)] hover:bg-white/10 transition-colors ${
            b.id === 'bold' ? 'font-extrabold' : b.id === 'italic' ? 'italic font-serif' : b.id === 'strike' ? 'line-through' : 'font-semibold'
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );

  const editorPanel = (
    <DarkPanel
      label="Markdown"
      className={panelHeight}
      headerRight={
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[color:var(--devpanel-label)]">{stats.lines} lines</span>
          <CopyTextButton onClick={() => navigator.clipboard.writeText(input)}>Copy</CopyTextButton>
        </div>
      }
    >
      {toolbar}
      <textarea
        ref={editorRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onEditorKeyDown}
        onScroll={syncFrom('editor')}
        spellCheck={false}
        placeholder="Type or paste Markdown here… use the toolbar or Ctrl+B / Ctrl+I / Ctrl+K"
        className="flex-1 w-full bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed"
      />
    </DarkPanel>
  );

  const previewPanel = (
    <WhitePanel
      label="Preview"
      className={panelHeight}
      headerRight={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadBlob(input, 'document.md', 'text/markdown')}
            title="Download .md"
            aria-label="Download Markdown file"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> .md
          </button>
          <CopyButton text={html} label="Copy HTML" />
        </div>
      }
    >
      <div ref={previewRef} onScroll={syncFrom('preview')} className="flex-1 overflow-auto px-6 py-7">
        {/* Preview-only mode reads like a document, so the prose gets a measure cap
            and centres itself instead of stretching across the whole screen. */}
        <div
          className={`blog-prose md-preview ${pane === 'preview' ? 'mx-auto max-w-[780px]' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </WhitePanel>
  );

  const htmlPanel = (
    <WhitePanel
      label="Generated HTML"
      className={panelHeight}
      headerRight={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadBlob(html, 'document.html', 'text/html')}
            title="Download .html"
            aria-label="Download HTML file"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> .html
          </button>
          <CopyButton text={html} label="Copy HTML" />
        </div>
      }
    >
      <pre className="flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words select-text">
        {html}
      </pre>
    </WhitePanel>
  );

  const statBar = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 rounded-xl bg-muted/60 border border-border/70 text-[12px] text-muted-foreground shrink-0">
      <span><strong className="text-foreground font-bold">{stats.words}</strong> words</span>
      <span><strong className="text-foreground font-bold">{stats.chars}</strong> characters</span>
      <span><strong className="text-foreground font-bold">{stats.headings}</strong> headings</span>
      <span><strong className="text-foreground font-bold">{stats.minutes}</strong> min read</span>
      <span className="ml-auto flex items-center gap-1.5">
        <input
          id="md-sync-scroll"
          type="checkbox"
          checked={syncScroll}
          onChange={(e) => setSyncScroll(e.target.checked)}
          className="accent-[color:var(--segmented-active-bg)]"
        />
        <label htmlFor="md-sync-scroll" className="cursor-pointer select-none">Sync scroll</label>
      </span>
    </div>
  );

  const body = (
    <>
      {statBar}
      {pane === 'split' ? (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
          {editorPanel}
          {previewPanel}
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-3.5 ${full ? 'flex-1 min-h-0' : ''}`}>
          {pane === 'preview' ? previewPanel : htmlPanel}
        </div>
      )}
    </>
  );

  return (
    <ToolShell
      title="Markdown Preview"
      full={full}
      onFullChange={setFull}
      hint={
        <p className="text-[13px] font-semibold text-muted-foreground">
          Live Markdown editor and preview — GitHub-flavoured tables, task lists and code blocks.
        </p>
      }
      controls={
        <Segmented>
          <SegmentedButton active={pane === 'split'} onClick={() => setPane('split')}>Split</SegmentedButton>
          <SegmentedButton active={pane === 'preview'} onClick={() => setPane('preview')}>Preview</SegmentedButton>
          <SegmentedButton active={pane === 'html'} onClick={() => setPane('html')}>HTML</SegmentedButton>
        </Segmented>
      }
    >
      {body}
    </ToolShell>
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
