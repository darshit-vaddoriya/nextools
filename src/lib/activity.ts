/**
 * LOCAL ACTIVITY HISTORY
 *
 * A per-tool log of what was changed: which field was edited (with the text
 * before and after), which option was switched, which file was added, what
 * was copied or downloaded. It lives in localStorage on this device only.
 * Nothing is sent to a server and there is no account.
 *
 * Privacy rules:
 *  - Copies of input and output files are kept separately in IndexedDB
 *    (lib/fileStore); entries here only hold references to them.
 *  - Password fields and tools that handle secrets (passwords, JWTs, .env
 *    files, notes) record *that* something changed, never the values.
 *  - Text snapshots are capped, so one huge paste can't fill the quota.
 *  - The "Keep a history" switch in Settings turns all of it off.
 */

import { clearFiles, deleteFiles, type StoredFileRef } from './fileStore';

const STORAGE_KEY = 'nexttool-activity';
const PREFS_KEY = 'nexttool-prefs';
const MAX_ENTRIES = 400;
const MAX_PER_TOOL = 60;
/** Longest before/after snapshot kept, in characters. */
export const SNAPSHOT_LIMIT = 4000;
/** Only this many newest entries keep their text snapshots; older ones keep the summary. */
const SNAPSHOT_ENTRIES = 120;
/** Idle delay before the log is serialised to localStorage. */
const PERSIST_DELAY_MS = 600;
/** Edits to the same field within this window fold into one entry. */
const MERGE_WINDOW_MS = 90_000;

/** Tools whose inputs are secrets: only the fact of a change is logged. */
export const SENSITIVE_TOOLS = new Set([
  'password-generator', 'passphrase-generator', 'password-strength', 'random-string',
  'secure-notes', 'jwt-decoder', 'env-json', 'hash-generator',
]);

export type ActivityKind = 'edit' | 'option' | 'file' | 'copy' | 'download' | 'action' | 'convert';

export interface ActivityEntry {
  id: string;
  toolId: string;
  toolName: string;
  kind: ActivityKind;
  /** The field or control involved, e.g. "Input", "Indent size". */
  label: string;
  /** One-line description shown in lists. */
  summary: string;
  /** Value before and after, when it is safe and useful to keep. */
  before?: string;
  after?: string;
  /** True when a snapshot was cut at SNAPSHOT_LIMIT. */
  truncated?: boolean;
  /** Locates the field again for "Restore" (see ToolActivityTracker). */
  fieldKey?: string;
  /** Saved copies of the files involved (inputs added, outputs downloaded). */
  files?: StoredFileRef[];
  /** Epoch ms of the first and the latest change folded into this entry. */
  at: number;
  updatedAt: number;
  status?: 'done' | 'failed';
}

const fileIds = (list: ActivityEntry[]) => list.flatMap((e) => e.files?.map((f) => f.id) ?? []);

type Listener = (entries: ActivityEntry[]) => void;
const listeners = new Set<Listener>();

export function historyEnabled(): boolean {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const prefs = raw ? (JSON.parse(raw) as { keepHistory?: boolean }) : {};
    return prefs.keepHistory !== false;
  } catch {
    return true;
  }
}

// ─── Storage, kept off the typing path ─────────────────────
// The log is parsed once and then served from memory. Writes update memory
// and listeners immediately; serialising to localStorage (the only slow,
// synchronous part) waits until the browser is idle and is coalesced, so a
// burst of changes costs one write. Pending data is flushed when the page is
// hidden, so nothing is lost on close.

let cache: ActivityEntry[] | null = null;
let persistTimer: number | null = null;

function parseStored(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

/** A copy, so callers can edit the array freely. */
function read(): ActivityEntry[] {
  if (!cache) cache = parseStored();
  return cache.slice();
}

function persistNow(): void {
  if (persistTimer !== null) { window.clearTimeout(persistTimer); persistTimer = null; }
  if (!cache) return;
  let data = cache;
  // On quota errors drop the older half of the snapshots, then entries, and retry.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    } catch {
      const keep = Math.floor(data.length / 2);
      data = data.map((e, i) => (i < keep ? e : { ...e, before: undefined, after: undefined }));
      if (attempt === 2) data = data.slice(0, keep);
      cache = data;
    }
  }
}

function schedulePersist(): void {
  if (persistTimer !== null) return;
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) idle(persistNow, { timeout: 2000 }); else persistNow();
  }, PERSIST_DELAY_MS);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', persistNow);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') persistNow(); });
}

/** Newest first; trims each tool to MAX_PER_TOOL and the whole log to MAX_ENTRIES. */
function write(entries: ActivityEntry[]): void {
  const perTool = new Map<string, number>();
  const capped = entries.filter((e) => {
    const n = (perTool.get(e.toolId) ?? 0) + 1;
    perTool.set(e.toolId, n);
    return n <= MAX_PER_TOOL;
  }).slice(0, MAX_ENTRIES)
    .map((e, i) => (i < SNAPSHOT_ENTRIES || (e.before === undefined && e.after === undefined)
      ? e : { ...e, before: undefined, after: undefined }));

  // Saved files no remaining entry points at are deleted. One file can be
  // shared (an input shown on both its upload and its download entry).
  const stillUsed = new Set(fileIds(capped));
  const orphaned = fileIds(read()).filter((id) => id && !stillUsed.has(id));
  if (orphaned.length) void deleteFiles(Array.from(new Set(orphaned)));

  cache = capped;
  schedulePersist();
  const snapshot = capped.slice();
  listeners.forEach((fn) => fn(snapshot));
}

function clip(v: string | undefined): { value?: string; cut: boolean } {
  if (v === undefined) return { cut: false };
  return v.length > SNAPSHOT_LIMIT ? { value: v.slice(0, SNAPSHOT_LIMIT), cut: true } : { value: v, cut: false };
}

export interface LogInput {
  toolId: string;
  toolName: string;
  kind: ActivityKind;
  label: string;
  summary: string;
  before?: string;
  after?: string;
  fieldKey?: string;
  status?: 'done' | 'failed';
  files?: StoredFileRef[];
}

/**
 * Record one change. A follow-up edit to the same field of the same tool
 * within MERGE_WINDOW_MS updates the latest entry instead of adding a new
 * one, keeping its original "before", so the log reads as "what changed"
 * rather than one row per keystroke burst.
 */
export function logActivity(input: LogInput): void {
  if (!historyEnabled()) return;
  const sensitive = SENSITIVE_TOOLS.has(input.toolId);
  const before = sensitive ? { cut: false } : clip(input.before);
  const after = sensitive ? { cut: false } : clip(input.after);
  const now = Date.now();
  const entries = read();
  const last = entries[0];

  if (
    last && input.fieldKey && (input.kind === 'edit' || input.kind === 'option') &&
    last.toolId === input.toolId && last.fieldKey === input.fieldKey && last.kind === input.kind &&
    now - last.updatedAt < MERGE_WINDOW_MS
  ) {
    // Back where it started: the change cancelled itself out, so drop it.
    if (!sensitive && last.before !== undefined && last.before === after.value) {
      write(entries.slice(1));
      return;
    }
    entries[0] = {
      ...last,
      summary: input.summary,
      after: after.value,
      truncated: last.truncated || after.cut,
      updatedAt: now,
    };
    write(entries);
    return;
  }

  const entry: ActivityEntry = {
    id: `act_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    toolId: input.toolId,
    toolName: input.toolName,
    kind: input.kind,
    label: input.label,
    summary: input.summary,
    before: before.value,
    after: after.value,
    truncated: before.cut || after.cut || undefined,
    fieldKey: input.fieldKey,
    files: input.files?.length ? input.files : undefined,
    at: now,
    updatedAt: now,
    status: input.status,
  };
  write([entry, ...entries]);
}

/**
 * Attach a downloaded output file. It joins the "Downloaded" entry the click
 * just created when there is one, otherwise it becomes its own entry.
 */
export function logOutputFile(toolId: string, toolName: string, ref: StoredFileRef, inputs: StoredFileRef[] = []): void {
  if (!historyEnabled()) return;
  const entries = read();
  const now = Date.now();
  const i = entries.slice(0, 6).findIndex((e) =>
    e.toolId === toolId && e.kind === 'download' && !e.files?.length && now - e.updatedAt < 20_000);
  const summary = `Downloaded ${ref.name}`;
  const files = [...inputs.filter((f) => !f.skipped), ref];
  if (i >= 0) {
    entries[i] = { ...entries[i], summary, files, updatedAt: now };
    write(entries);
    return;
  }
  logActivity({ toolId, toolName, kind: 'download', label: 'Output', summary, files });
}

/** Live results of one sitting within this window replace each other. */
const LIVE_RESULT_WINDOW_MS = 30 * 60_000;

/**
 * Swap in a newer live result (formatter output, converted text) for the
 * same tool instead of stacking entries. The replaced output file is freed.
 * Returns false when there is no recent live result to replace.
 */
export function replaceLiveResult(toolId: string, summary: string, files: StoredFileRef[]): boolean {
  if (!historyEnabled()) return true;
  const entries = read();
  const now = Date.now();
  const i = entries.slice(0, 15).findIndex((e) =>
    e.toolId === toolId && e.kind === 'convert' && e.label === 'Live result' && now - e.updatedAt < LIVE_RESULT_WINDOW_MS);
  if (i < 0) return false;
  const [prev] = entries.splice(i, 1);
  write([{ ...prev, summary, files, updatedAt: now }, ...entries]);
  return true;
}

export function loadActivity(toolId?: string): ActivityEntry[] {
  const all = read();
  return toolId ? all.filter((e) => e.toolId === toolId) : all;
}

export function removeActivity(id: string): void {
  write(read().filter((e) => e.id !== id));
}

export function clearActivity(toolId?: string): void {
  if (!toolId) void clearFiles();
  write(toolId ? read().filter((e) => e.toolId !== toolId) : []);
}

export function subscribeActivity(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

// Another tab changed the log: tell this tab's subscribers.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      cache = parseStored();
      const entries = cache.slice();
      listeners.forEach((fn) => fn(entries));
    }
  });
}

/** "+42 chars", "−3 lines", used in edit summaries. */
export function describeTextChange(before: string, after: string): string {
  const bl = before.split('\n').length;
  const al = after.split('\n').length;
  if (!before) return `added ${plural(after.length, 'char')}`;
  if (!after) return 'cleared';
  const dc = after.length - before.length;
  const dl = al - bl;
  const parts: string[] = [];
  if (dl) parts.push(`${dl > 0 ? '+' : '−'}${plural(Math.abs(dl), 'line')}`);
  if (dc) parts.push(`${dc > 0 ? '+' : '−'}${plural(Math.abs(dc), 'char')}`);
  return parts.length ? parts.join(', ') : 'rewritten, same length';
}

function plural(n: number, word: string) {
  return `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;
}
