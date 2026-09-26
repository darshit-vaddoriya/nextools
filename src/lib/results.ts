/**
 * TOOL RESULTS IN HISTORY
 *
 * When a tool finishes and shows its result, the output (plus the files it
 * was made from) is saved to History right away, so it can be previewed or
 * downloaded again later without re-running the tool, and without having to
 * click Download first.
 *
 * Shared result UIs (useConversion, PDF ResultCard, image ResultPanel,
 * SelectableResults, TextPreview) and tools with their own result UI call
 * the hooks below; the tool page's ToolActivityTracker says which tool is
 * open and which files it was given.
 */
import { useEffect, useMemo, useRef } from 'react';
import { historyEnabled, logActivity, replaceLiveResult, SENSITIVE_TOOLS } from './activity';
import { fileSavingEnabled, saveFile, type StoredFileRef } from './fileStore';
import { formatBytes } from './formats';

interface ActiveTool {
  toolId: string;
  toolName: string;
  /** Files most recently given to the tool, already saved. */
  inputs: () => StoredFileRef[];
}

let active: ActiveTool | null = null;

/** Called by ToolActivityTracker while a tool page is open. */
export function setActiveTool(tool: ActiveTool | null): void {
  active = tool;
}

// A result component can re-render or remount (StrictMode); record each output once.
const recorded = new WeakSet<Blob>();

export interface ResultFile { blob: Blob; name: string }

export interface RecordResultOptions {
  /** One output… */
  output?: Blob;
  name?: string;
  /** …or several (split pages, extracted images, …). */
  outputs?: ResultFile[];
  /** Source files; defaults to the tool's latest inputs. */
  inputs?: File[];
  toolId?: string;
  toolName?: string;
  durationMs?: number;
  /**
   * For outputs that update live as the user types: replace this sitting's
   * previous result instead of adding a new entry each time.
   */
  live?: boolean;
}

export async function recordResult(opts: RecordResultOptions): Promise<void> {
  const toolId = opts.toolId ?? active?.toolId;
  const toolName = opts.toolName ?? active?.toolName;
  const outputs = (opts.outputs ?? (opts.output && opts.name ? [{ blob: opts.output, name: opts.name }] : []))
    .filter((o) => !recorded.has(o.blob));
  if (!toolId || !toolName || !outputs.length || !historyEnabled()) return;
  outputs.forEach((o) => recorded.add(o.blob));

  const total = outputs.reduce((n, o) => n + o.blob.size, 0);
  const took = opts.durationMs ? ` in ${(opts.durationMs / 1000).toFixed(1)}s` : '';
  const srcCount = opts.inputs?.length ?? (active?.toolId === toolId ? active.inputs().length : 0);
  const what = outputs.length === 1 ? outputs[0].name : `${outputs.length} files`;
  const summary = `${opts.live ? 'Result' : 'Created'} ${what} (${formatBytes(total)})${srcCount > 1 ? ` from ${srcCount} files` : ''}${took}`;

  if (SENSITIVE_TOOLS.has(toolId) || !fileSavingEnabled()) {
    logActivity({ toolId, toolName, kind: 'convert', label: 'Result', summary, status: 'done' });
    return;
  }

  // saveFile reuses the stored copy when the same File/Blob was saved before.
  const inputs = opts.inputs
    ? await Promise.all(opts.inputs.slice(0, 20).map((f) => saveFile(f, f.name, 'input')))
    : (active?.toolId === toolId ? active.inputs() : []);
  const saved = await Promise.all(outputs.slice(0, 50).map((o) => saveFile(o.blob, o.name, 'output')));
  const files = [...inputs.filter((f) => !f.skipped), ...saved];

  if (opts.live && replaceLiveResult(toolId, summary, files)) return;
  logActivity({ toolId, toolName, kind: 'convert', label: opts.live ? 'Live result' : 'Result', summary, status: 'done', files });
}

/** Record a result as soon as a component shows it. */
export function useRecordResult(blob: Blob | null | undefined, name: string | null | undefined): void {
  useEffect(() => {
    if (blob && name) void recordResult({ output: blob, name });
  }, [blob, name]);
}

/** Record a set of result files (one History entry for the batch). */
export function useRecordResults(items: ResultFile[] | null | undefined): void {
  useEffect(() => {
    if (items && items.length) void recordResult({ outputs: items });
  }, [items]);
}

const LIVE_DELAY_MS = 2500;

/**
 * Record text output that updates as the user types (formatters, converters).
 * Waits until the output has settled, ignores the tool's initial sample
 * output, and keeps one "latest result" entry per sitting.
 */
export function useRecordTextResult(
  text: string | null | undefined,
  filename: string,
  mime = 'text/plain;charset=utf-8',
  /** False when the text comes from a file the user gave, so the first value already counts. */
  skipInitial = true,
): void {
  const initial = useRef<string | null | undefined>(undefined);
  if (initial.current === undefined) initial.current = skipInitial ? (text ?? null) : null;

  const blob = useMemo(
    () => (text && text.trim() && text !== initial.current ? new Blob([text], { type: mime }) : null),
    [text, mime],
  );

  useEffect(() => {
    if (!blob) return;
    const t = window.setTimeout(() => { void recordResult({ output: blob, name: filename, live: true }); }, LIVE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [blob, filename]);
}
