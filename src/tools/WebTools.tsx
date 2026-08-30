import React, { useMemo, useRef, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { errorMessage } from '../utils/errorMessage';
import {
  Link as LinkIcon, Smartphone, FileSearch, Code2,
  Hash as HashIcon, Calculator, AlertTriangle, Upload,
} from 'lucide-react';

const Panel: React.FC<{ label: string; icon: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <p className="section-label">{label}</p>
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────────────
   1. URL Parser
───────────────────────────────────────────────────────── */

export const UrlParserTool: React.FC = () => {
  const [input, setInput] = useState('https://user:pass@www.example.com:8080/path/to/page?foo=bar&baz=qux#section-1');

  const { url, error } = useMemo(() => {
    try {
      return { url: new URL(input), error: null as string | null };
    } catch (err) {
      return { url: null as URL | null, error: errorMessage(err, 'Enter a valid, fully-qualified URL') };
    }
  }, [input]);

  const rows: { label: string; value: string }[] = url
    ? [
        { label: 'Protocol', value: url.protocol },
        { label: 'Host', value: url.hostname },
        { label: 'Port', value: url.port || '(default)' },
        { label: 'Path', value: url.pathname || '/' },
        { label: 'Hash', value: url.hash || '(none)' },
        { label: 'Origin', value: url.origin },
      ]
    : [];

  const params = url ? Array.from(url.searchParams.entries()) : [];

  return (
    <div className="space-y-4">
      <Panel label="URL" icon={LinkIcon}>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="input-base font-mono text-xs" placeholder="https://example.com/path?query=1" />
      </Panel>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {url && (
        <>
          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            <p className="section-label mb-1">Components</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rows.map((r) => (
                <div key={r.label} className="bg-muted border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{r.label}</span>
                  <span className="text-xs font-mono text-foreground break-all">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 space-y-2">
            <p className="section-label mb-1">Query Parameters ({params.length})</p>
            {params.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No query parameters.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-1.5 font-semibold">Key</th>
                      <th className="text-left px-3 py-1.5 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map(([k, v], idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-3 py-1.5 text-primary break-all">{k}</td>
                        <td className="px-3 py-1.5 text-foreground break-all">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   2. User Agent Parser
───────────────────────────────────────────────────────── */

function parseUserAgent(ua: string) {
  let browser = 'Unknown', browserVersion = '';
  let os = 'Unknown';
  let engine = 'Unknown';
  let device: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';

  const browserPatterns: [RegExp, string][] = [
    [/Edg\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/CriOS\/([\d.]+)/, 'Chrome (iOS)'],
    [/FxiOS\/([\d.]+)/, 'Firefox (iOS)'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
    [/MSIE ([\d.]+)/, 'Internet Explorer'],
    [/Trident\/.*rv:([\d.]+)/, 'Internet Explorer'],
  ];
  for (const [re, name] of browserPatterns) {
    const m = ua.match(re);
    if (m) { browser = name; browserVersion = m[1]; break; }
  }

  const osPatterns: [RegExp, string][] = [
    [/Windows NT 10\.0/, 'Windows 10/11'],
    [/Windows NT 6\.3/, 'Windows 8.1'],
    [/Windows NT 6\.2/, 'Windows 8'],
    [/Windows NT 6\.1/, 'Windows 7'],
    [/Windows/, 'Windows'],
    [/Mac OS X ([\d_.]+)/, 'macOS'],
    [/iPhone OS ([\d_]+)/, 'iOS'],
    [/iPad.*OS ([\d_]+)/, 'iPadOS'],
    [/Android ([\d.]+)/, 'Android'],
    [/CrOS/, 'Chrome OS'],
    [/Linux/, 'Linux'],
  ];
  for (const [re, name] of osPatterns) {
    const m = ua.match(re);
    if (m) { os = m[1] ? `${name} (${m[1].replace(/_/g, '.')})` : name; break; }
  }

  if (/Gecko\)/.test(ua) && /Firefox/.test(ua)) engine = 'Gecko';
  else if (/AppleWebKit/.test(ua)) engine = /Chrome|Chromium|Edg|OPR/.test(ua) ? 'Blink' : 'WebKit';
  else if (/Trident/.test(ua)) engine = 'Trident';

  if (/Mobile|iPhone|Android.*Mobile/.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet|Android(?!.*Mobile)/.test(ua)) device = 'Tablet';

  return { browser, browserVersion, os, engine, device };
}

export const UserAgentParserTool: React.FC = () => {
  const [ua, setUa] = useState(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const parsed = useMemo(() => parseUserAgent(ua), [ua]);

  const rows = [
    { label: 'Browser', value: `${parsed.browser}${parsed.browserVersion ? ' ' + parsed.browserVersion : ''}` },
    { label: 'Operating System', value: parsed.os },
    { label: 'Rendering Engine', value: parsed.engine },
    { label: 'Device Type', value: parsed.device },
  ];

  return (
    <div className="space-y-4">
      <Panel label="User Agent String" icon={Smartphone}>
        <textarea value={ua} onChange={(e) => setUa(e.target.value)} rows={3} className="textarea-base font-mono text-xs" placeholder="Paste a User-Agent string…" />
        <button onClick={() => setUa(navigator.userAgent)} className="btn-secondary text-xs mt-1">Use my browser's UA</button>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <p className="section-label mb-1">Parsed Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {rows.map((r) => (
            <div key={r.label} className="bg-muted border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{r.label}</span>
              <span className="text-xs font-mono text-foreground break-all">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   3. MIME / Magic-Bytes Checker
───────────────────────────────────────────────────────── */

const MAGIC_SIGNATURES: { bytes: number[]; mime: string; offset?: number }[] = [
  { bytes: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png' },
  { bytes: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf' },
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: 'application/zip' },
  { bytes: [0x50, 0x4b, 0x05, 0x06], mime: 'application/zip' },
  { bytes: [0x1f, 0x8b], mime: 'application/gzip' },
  { bytes: [0x42, 0x4d], mime: 'image/bmp' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mime: 'audio/wav or video/avi (RIFF container)' },
  { bytes: [0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', offset: 4 },
  { bytes: [0x49, 0x44, 0x33], mime: 'audio/mpeg' },
  { bytes: [0x4f, 0x67, 0x67, 0x53], mime: 'audio/ogg' },
  { bytes: [0x37, 0x7a, 0xbc, 0xaf], mime: 'application/x-7z-compressed' },
  { bytes: [0x75, 0x73, 0x74, 0x61, 0x72], mime: 'application/x-tar', offset: 257 },
];

function detectMime(bytes: Uint8Array): string {
  for (const sig of MAGIC_SIGNATURES) {
    const offset = sig.offset ?? 0;
    if (bytes.length < offset + sig.bytes.length) continue;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (bytes[offset + i] !== sig.bytes[i]) { match = false; break; }
    }
    if (match) return sig.mime;
  }
  return 'Unknown (no matching signature)';
}

export const MimeCheckerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hexBytes, setHexBytes] = useState('');
  const [detected, setDetected] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    const buf = await f.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(buf);
    setHexBytes(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' '));
    setDetected(detectMime(bytes));
  };

  return (
    <div className="space-y-4">
      <Panel label="Upload File" icon={FileSearch}>
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1.5" />
          <p className="text-xs text-muted-foreground">{file ? file.name : 'Click to choose a file'}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </Panel>

      {file && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          <p className="section-label">Analysis</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-muted border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reported Type (File.type)</span>
              <span className="text-xs font-mono text-foreground">{file.type || '(empty)'}</span>
            </div>
            <div className="bg-muted border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Detected From Magic Bytes</span>
              <span className="text-xs font-mono text-primary">{detected}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">First 32 Bytes (hex)</p>
            <div className="bg-muted border border-border rounded-lg px-3 py-2 text-xs font-mono break-all select-all">{hexBytes}</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   4. HTML Entity Encoder/Decoder
───────────────────────────────────────────────────────── */

function htmlEncode(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function htmlDecode(str: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

export const HtmlEntityTool: React.FC = () => {
  const [text, setText] = useState('<div class="greeting">Hello & "World" — café</div>');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const result = useMemo(() => (mode === 'encode' ? htmlEncode(text) : htmlDecode(text)), [text, mode]);

  return (
    <div className="space-y-4">
      <Panel label={mode === 'encode' ? 'Plain Text / HTML' : 'Encoded HTML Entities'} icon={Code2}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="textarea-base font-mono text-xs" placeholder="Enter text…" />
        <div className="flex items-center gap-3 pt-1">
          <button onClick={() => setMode('encode')} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${mode === 'encode' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${mode === 'decode' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground'}`}>Decode</button>
        </div>
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Result</p>
          <CopyButton text={result} />
        </div>
        <textarea readOnly value={result} rows={6} className="textarea-base font-mono text-xs" />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   5. Unicode Converter
───────────────────────────────────────────────────────── */

export const UnicodeConverterTool: React.FC = () => {
  const [text, setText] = useState('Hello 🌍 café');
  const [codePoints, setCodePoints] = useState('U+0048 U+0065 U+006C U+006C U+006F');
  const [lastEdited, setLastEdited] = useState<'text' | 'codes'>('text');

  const derivedCodes = useMemo(
    () => Array.from(text).map((ch) => `U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`).join(' '),
    [text]
  );

  const derivedText = useMemo(() => {
    try {
      return codePoints
        .split(/\s+/)
        .filter(Boolean)
        .map((tok) => {
          const hex = tok.replace(/^U\+/i, '');
          const num = parseInt(hex, 16);
          return Number.isFinite(num) ? String.fromCodePoint(num) : '';
        })
        .join('');
    } catch {
      return '';
    }
  }, [codePoints]);

  const shownCodes = lastEdited === 'text' ? derivedCodes : codePoints;
  const shownText = lastEdited === 'codes' ? derivedText : text;

  return (
    <div className="space-y-4">
      <Panel label="Text" icon={HashIcon}>
        <textarea
          value={shownText}
          onChange={(e) => { setText(e.target.value); setLastEdited('text'); }}
          rows={4}
          className="textarea-base font-mono text-xs"
          placeholder="Type text (supports emoji)…"
        />
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Code Points</p>
          <CopyButton text={shownCodes} />
        </div>
        <textarea
          value={shownCodes}
          onChange={(e) => { setCodePoints(e.target.value); setLastEdited('codes'); }}
          rows={4}
          className="textarea-base font-mono text-xs"
          placeholder="U+0048 U+0065 U+006C U+006C U+006F"
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   6. ASCII Converter
───────────────────────────────────────────────────────── */

export const AsciiConverterTool: React.FC = () => {
  const [text, setText] = useState('Hello');
  const [codes, setCodes] = useState('72 101 108 108 111');
  const [lastEdited, setLastEdited] = useState<'text' | 'codes'>('text');

  const derivedCodes = useMemo(() => Array.from(text).map((ch) => ch.charCodeAt(0)).join(' '), [text]);
  const derivedText = useMemo(
    () => codes.split(/\s+/).filter(Boolean).map((n) => {
      const num = parseInt(n, 10);
      return Number.isFinite(num) ? String.fromCharCode(num) : '';
    }).join(''),
    [codes]
  );

  const shownCodes = lastEdited === 'text' ? derivedCodes : codes;
  const shownText = lastEdited === 'codes' ? derivedText : text;

  return (
    <div className="space-y-4">
      <Panel label="Text" icon={HashIcon}>
        <textarea
          value={shownText}
          onChange={(e) => { setText(e.target.value); setLastEdited('text'); }}
          rows={4}
          className="textarea-base font-mono text-xs"
          placeholder="Type text…"
        />
      </Panel>
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">ASCII / Decimal Codes</p>
          <CopyButton text={shownCodes} />
        </div>
        <textarea
          value={shownCodes}
          onChange={(e) => { setCodes(e.target.value); setLastEdited('codes'); }}
          rows={4}
          className="textarea-base font-mono text-xs"
          placeholder="72 101 108 108 111"
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   7. Binary / Decimal / Hex / Octal Converter
───────────────────────────────────────────────────────── */

type BaseKey = 'bin' | 'dec' | 'hex' | 'oct';

export const BinaryConverterTool: React.FC = () => {
  const [values, setValues] = useState<Record<BaseKey, string>>({ bin: '1010', dec: '10', hex: 'A', oct: '12' });
  const [error, setError] = useState<string | null>(null);

  const bases: { key: BaseKey; label: string; radix: number }[] = [
    { key: 'bin', label: 'Binary', radix: 2 },
    { key: 'dec', label: 'Decimal', radix: 10 },
    { key: 'hex', label: 'Hexadecimal', radix: 16 },
    { key: 'oct', label: 'Octal', radix: 8 },
  ];

  const handleChange = (key: BaseKey, raw: string) => {
    const radix = bases.find((b) => b.key === key)!.radix;
    const cleanedInput = key === 'hex' ? raw.replace(/[^0-9a-fA-F]/g, '') : raw.replace(/[^0-9]/g, '');
    if (cleanedInput === '') {
      setValues({ bin: '', dec: '', hex: '', oct: '' });
      setError(null);
      return;
    }
    const num = parseInt(cleanedInput, radix);
    if (!Number.isFinite(num) || Number.isNaN(num)) {
      setValues((prev) => ({ ...prev, [key]: raw }));
      setError('Invalid number for this base');
      return;
    }
    setError(null);
    setValues({
      bin: num.toString(2),
      dec: num.toString(10),
      hex: num.toString(16).toUpperCase(),
      oct: num.toString(8),
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Number Base Converter</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bases.map((b) => (
            <div key={b.key} className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{b.label}</p>
              <div className="flex items-center gap-2">
                <input
                  value={values[b.key]}
                  onChange={(e) => handleChange(b.key, e.target.value)}
                  className="input-base font-mono text-xs"
                  placeholder={`Enter ${b.label.toLowerCase()} value…`}
                />
                <CopyButton text={values[b.key]} label="" />
              </div>
            </div>
          ))}
        </div>
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>
    </div>
  );
};
