import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { errorMessage } from '../utils/errorMessage';
import { Select } from '../components/Select';
import { Play, Minimize2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState<string>(
    JSON.stringify(
      {
        appName: "NextTool",
        version: "1.0.0",
        isPrivate: true,
        theme: "Dark & Light",
        features: ["Formatters", "Encoders", "Generators", "Regex"],
        config: {
          localStorage: true,
          workers: 2
        }
      },
      null,
      2
    )
  );
  const [output, setOutput] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'tree'>('formatted');

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (err) {
      setError(errorMessage(err, 'Invalid JSON syntax'));
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
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
    const sample = {
      status: "success",
      statusCode: 200,
      data: {
        user: { id: 42, username: "dev_hero", role: "admin" },
        tools: ["JSON", "Base64", "SHA256"]
      }
    };
    setInput(JSON.stringify(sample, null, 2));
    setOutput(JSON.stringify(sample, null, 2));
    setError(null);
  };

  const renderJsonTree = (data: unknown, keyName?: string): React.ReactNode => {
    if (typeof data === 'object' && data !== null) {
      const isArray = Array.isArray(data);
      return (
        <details open className="ml-3 my-0.5 text-xs font-mono">
          <summary className="cursor-pointer text-amber-500 font-semibold select-none">
            {keyName ? <span className="dark:text-zinc-300 text-slate-700 mr-1">{keyName}:</span> : null}
            <span className="dark:text-zinc-400 text-slate-500">{isArray ? `Array(${data.length}) [` : 'Object {'}</span>
          </summary>
          <div className="border-l dark:border-zinc-800 border-slate-200 pl-2 my-1 space-y-0.5">
            {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
              <div key={k}>{renderJsonTree(v, k)}</div>
            ))}
          </div>
          <span className="dark:text-zinc-400 text-slate-500 font-mono">{isArray ? ']' : '}'}</span>
        </details>
      );
    }

    let valColor = 'text-emerald-500 dark:text-emerald-400';
    if (typeof data === 'number') valColor = 'text-sky-500 dark:text-sky-400';
    if (typeof data === 'boolean') valColor = 'text-purple-500 dark:text-purple-400';
    if (data === null) valColor = 'text-rose-500 dark:text-rose-400';

    return (
      <div className="ml-3 text-xs font-mono">
        {keyName && <span className="dark:text-zinc-400 text-slate-500 mr-1.5">{keyName}:</span>}
        <span className={valColor}>{JSON.stringify(data)}</span>
      </div>
    );
  };

  let parsedTree: unknown = null;
  if (output) {
    try {
      parsedTree = JSON.parse(output);
    } catch {
      parsedTree = null;
    }
  }

  return (
    <div className="space-y-4">
      {/* Tool Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Format JSON</span>
          </button>
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 dark:bg-dark-hover dark:text-zinc-300 dark:border-dark-border dark:hover:text-white bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 border text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>
          <button
            onClick={sampleData}
            className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border dark:border-dark-border border-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors"
          >
            Sample
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
            title="Clear Input"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <span>Indent:</span>
            <Select
              value={String(indent)}
              onChange={(v) => setIndent(Number(v))}
              options={[
                { value: '2', label: '2 Spaces' },
                { value: '4', label: '4 Spaces' },
                { value: '8', label: '8 Spaces' },
              ]}
              className="w-32"
            />
          </div>

          <CopyButton text={output} label="Copy Result" />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Editor Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden flex flex-col h-[500px] shadow-xs">
          <div className="px-3.5 py-2 border-b dark:bg-dark-bg/60 dark:border-dark-border bg-slate-50 border-slate-200 flex items-center justify-between text-xs dark:text-zinc-400 text-slate-500">
            <span className="font-semibold dark:text-zinc-200 text-slate-800">Input JSON</span>
            <span>{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="Paste your unformatted JSON here..."
            className="flex-1 w-full bg-transparent p-3.5 text-xs font-mono dark:text-zinc-200 text-slate-900 placeholder-slate-400 resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="rounded-xl border dark:bg-dark-card dark:border-dark-border bg-white border-slate-200 overflow-hidden flex flex-col h-[500px] shadow-xs">
          <div className="px-3.5 py-1.5 border-b dark:bg-dark-bg/60 dark:border-dark-border bg-slate-50 border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('formatted')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'formatted'
                    ? 'dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800/60 bg-indigo-50 text-indigo-700 border-indigo-200 border'
                    : 'dark:text-zinc-400 text-slate-600 hover:text-slate-900'
                }`}
              >
                Formatted Text
              </button>
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'tree'
                    ? 'dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800/60 bg-indigo-50 text-indigo-700 border-indigo-200 border'
                    : 'dark:text-zinc-400 text-slate-600 hover:text-slate-900'
                }`}
              >
                Tree View
              </button>
            </div>
            {output && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3 h-3" /> Valid JSON
              </span>
            )}
          </div>

          <div className="flex-1 p-3.5 overflow-auto font-mono text-xs">
            {activeTab === 'formatted' ? (
              <pre className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed select-text">
                {output || <span className="text-slate-400 font-sans">Formatted output will appear here...</span>}
              </pre>
            ) : (
              <div>
                {parsedTree ? (
                  renderJsonTree(parsedTree)
                ) : (
                  <span className="text-slate-400 font-sans">Valid JSON required for tree view.</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
