import React, { useMemo, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { errorMessage } from '../utils/errorMessage';
import {
  Play, Minimize2, Trash2, AlertTriangle, Sparkles,
  Download, FileJson, ListTree,
} from 'lucide-react';
import { DarkPanel, WhitePanel, Segmented, SegmentedButton, StatusPill } from '../components/DevToolChrome';

const SAMPLE = {
  status: 'success',
  statusCode: 200,
  data: {
    user: { id: 42, username: 'dev_hero', role: 'admin' },
    tools: ['JSON', 'Base64', 'SHA256'],
  },
};

const DEFAULT_INPUT = JSON.stringify(
  {
    appName: 'NextTool',
    version: '1.0.0',
    isPrivate: true,
    theme: 'Dark & Light',
    features: ['Formatters', 'Encoders', 'Generators', 'Regex'],
    config: { localStorage: true, workers: 2 },
  },
  null,
  2,
);

const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState<string>(DEFAULT_INPUT);
  const [output, setOutput] = useState<string>(() => {
    try {
      return JSON.stringify(JSON.parse(DEFAULT_INPUT), null, 2);
    } catch {
      return '';
    }
  });
  const [indent, setIndent] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'tree'>('formatted');

  const runFormat = (value: string, indentSize: number) => {
    if (!value.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      setOutput(JSON.stringify(JSON.parse(value), null, indentSize));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Invalid JSON syntax'));
    }
  };

  const handleFormat = () => runFormat(input, indent);

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Invalid JSON syntax'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const sampleData = () => {
    const text = JSON.stringify(SAMPLE, null, indent);
    setInput(text);
    setOutput(text);
    setError(null);
  };

  const renderJsonTree = (data: unknown, keyName?: string): React.ReactNode => {
    if (typeof data === 'object' && data !== null) {
      const isArray = Array.isArray(data);
      return (
        <details open className="ml-3 my-0.5 text-xs font-mono">
          <summary className="cursor-pointer text-amber-500 font-semibold select-none">
            {keyName ? <span className="text-muted-foreground mr-1">{keyName}:</span> : null}
            <span className="text-muted-foreground">{isArray ? `Array(${data.length}) [` : 'Object {'}</span>
          </summary>
          <div className="border-l border-border pl-2 my-1 space-y-0.5">
            {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
              <div key={k}>{renderJsonTree(v, k)}</div>
            ))}
          </div>
          <span className="text-muted-foreground font-mono">{isArray ? ']' : '}'}</span>
        </details>
      );
    }

    let valColor = 'text-emerald-500';
    if (typeof data === 'number') valColor = 'text-sky-500 dark:text-sky-400';
    if (typeof data === 'boolean') valColor = 'text-purple-500 dark:text-purple-400';
    if (data === null) valColor = 'text-rose-500 dark:text-rose-400';

    return (
      <div className="ml-3 text-xs font-mono">
        {keyName && <span className="text-muted-foreground mr-1.5">{keyName}:</span>}
        <span className={valColor}>{JSON.stringify(data)}</span>
      </div>
    );
  };

  const parsedTree = useMemo(() => {
    if (!output) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output]);

  const inputLines = input ? input.split('\n').length : 0;
  const isValid = !error && output.length > 0;

  return (
    <div className="space-y-3">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[13.5px] font-bold rounded-[9px] transition-all duration-150 active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5" />
            Beautify
          </button>
          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-card text-foreground border border-border hover:bg-muted text-[13.5px] font-bold rounded-[9px] transition-colors duration-150"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify
          </button>
          <Segmented>
            {[2, 4, 8].map((n) => (
              <SegmentedButton key={n} active={indent === n} onClick={() => { setIndent(n); runFormat(input, n); }}>
                {n}
              </SegmentedButton>
            ))}
          </Segmented>
          <button
            onClick={sampleData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sample
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors duration-150"
            title="Clear input"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <StatusPill valid={isValid} validLabel={`Valid · ${output.length} chars`} invalidLabel={error ? 'Invalid JSON' : 'Empty'} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Editor grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Input pane */}
        <DarkPanel
          label="Input"
          headerRight={<span className="font-mono text-[11px] text-[color:var(--devpanel-label)]">{input.length} chars · {inputLines} lines</span>}
          className="h-[360px] lg:h-[520px]"
        >
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              runFormat(e.target.value, indent);
            }}
            spellCheck={false}
            placeholder="Paste your unformatted JSON here... (live format)"
            className="flex-1 w-full bg-transparent p-4 text-[13.5px] font-mono text-[color:var(--devpanel-text)] placeholder:text-[color:var(--devpanel-label)] resize-none focus:outline-none leading-relaxed outline-none"
          />
        </DarkPanel>

        {/* Output pane */}
        <WhitePanel
          label="Output"
          headerRight={
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('formatted')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-bold rounded-md transition-colors duration-150 ${
                  activeTab === 'formatted' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" /> Formatted
              </button>
              <button
                onClick={() => setActiveTab('tree')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11.5px] font-bold rounded-md transition-colors duration-150 ${
                  activeTab === 'tree' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" /> Tree
              </button>
              <CopyButton text={output} label="Copy" />
              <button
                onClick={() => downloadText(output, 'formatted.json')}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-muted text-foreground/80 hover:bg-muted hover:border-input hover:text-foreground transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          }
          className="h-[440px] lg:h-[520px]"
        >
          <div className="flex-1 p-4 overflow-auto font-mono text-[13.5px]">
            {activeTab === 'formatted' ? (
              <pre className="text-foreground whitespace-pre-wrap leading-relaxed select-text">
                {output || <span className="text-muted-foreground font-sans">Formatted output will appear here...</span>}
              </pre>
            ) : (
              <div>
                {parsedTree ? (
                  renderJsonTree(parsedTree)
                ) : (
                  <span className="text-muted-foreground font-sans">Valid JSON required for tree view.</span>
                )}
              </div>
            )}
          </div>
        </WhitePanel>
      </div>
    </div>
  );
};
