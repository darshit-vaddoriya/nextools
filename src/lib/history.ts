/**
 * LOCAL JOB HISTORY
 *
 * A record of what was converted, kept in localStorage on the user's own
 * machine. There is no server and no account.
 *
 * Deliberately stores metadata only, filename, size, tool, status, time.
 * File *contents* are never written to disk, so the product's core promise
 * ("nothing leaves your device, nothing is kept") stays true. That is why
 * re-download is not offered for past jobs: the bytes are genuinely gone
 * once the tab is closed.
 */
import type { JobStatus } from '../components/ui/Badge';

const STORAGE_KEY = 'nexttool-history';
const MAX_ENTRIES = 100;

export interface JobRecord {
  id: string;
  toolId: string;
  toolName: string;
  /** Input filenames, for display only. */
  fileNames: string[];
  /** Total input size in bytes. */
  totalBytes: number;
  status: JobStatus;
  /** Epoch milliseconds. */
  startedAt: number;
  /** Wall-clock duration in ms, once finished. */
  durationMs?: number;
  /** Human-readable failure reason, when status is 'failed'. */
  error?: string;
}

type Listener = (jobs: JobRecord[]) => void;
const listeners = new Set<Listener>();

function read(): JobRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as JobRecord[]) : [];
  } catch {
    // Corrupt or unavailable storage (private mode, quota), behave as empty.
    return [];
  }
}

function write(jobs: JobRecord[]): void {
  const capped = jobs.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Storage full or blocked; history is non-essential, so fail quietly.
  }
  listeners.forEach((fn) => fn(capped));
}

export function loadHistory(): JobRecord[] {
  return read();
}

export function recordJobStart(
  job: Omit<JobRecord, 'id' | 'startedAt' | 'status'>,
): string {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  write([{ ...job, id, startedAt: Date.now(), status: 'processing' }, ...read()]);
  return id;
}

export function recordJobEnd(
  id: string,
  outcome: { status: Extract<JobStatus, 'done' | 'failed'>; error?: string },
): void {
  write(
    read().map((job) =>
      job.id === id
        ? { ...job, status: outcome.status, error: outcome.error, durationMs: Date.now() - job.startedAt }
        : job,
    ),
  );
}

export function removeJob(id: string): void {
  write(read().filter((job) => job.id !== id));
}

export function clearHistory(): void {
  write([]);
}

/** Subscribe to history changes. Returns an unsubscribe function. */
export function subscribeHistory(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Relative time for job timestamps: "just now", "4 min ago", "3 days ago". */
export function relativeTime(epochMs: number): string {
  const seconds = Math.round((Date.now() - epochMs) / 1000);
  if (seconds < 45) return 'just now';

  const table: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2629800, 'week'],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  for (let i = 0; i < table.length; i += 1) {
    const [limit, unit] = table[i];
    if (seconds < limit) {
      const divisor = i === 0 ? 1 : table[i - 1][0];
      return formatter.format(-Math.round(seconds / divisor), unit);
    }
  }
  return new Date(epochMs).toLocaleDateString();
}
