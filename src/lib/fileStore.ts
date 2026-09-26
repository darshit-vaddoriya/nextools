/**
 * LOCAL FILE STORE
 *
 * Keeps copies of the files a tool was given (inputs) and the files it
 * produced (outputs) so History can show and re-download them later. The
 * bytes live in this browser's IndexedDB: never uploaded, never synced.
 *
 * IndexedDB, not localStorage: localStorage holds ~5 MB of strings per site,
 * while IndexedDB stores real Blobs and gets a share of free disk space
 * (see storageInfo). Even so the space is finite and the browser may clear
 * it, so the store keeps itself inside a budget, oldest files first.
 */

const DB_NAME = 'nexttool-files';
const STORE = 'files';
const PREFS_KEY = 'nexttool-prefs';

/** Files bigger than this aren't kept (the history entry still records the name). */
export const MAX_FILE_BYTES = 150 * 1024 * 1024;
/** Upper bound for everything kept, before the browser's own quota is considered. */
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024;

export type FileRole = 'input' | 'output';

export interface StoredFileRef {
  id: string;
  name: string;
  size: number;
  type: string;
  role: FileRole;
  /** Set when the file was deliberately not kept, e.g. "too large". */
  skipped?: string;
}

interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB unavailable')); return; }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => { dbPromise = null; });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

export function fileSavingEnabled(): boolean {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const p = raw ? (JSON.parse(raw) as { keepHistory?: boolean; keepFiles?: boolean }) : {};
    return p.keepHistory !== false && p.keepFiles !== false;
  } catch {
    return true;
  }
}

let persistAsked = false;

/** The same File/Blob object is stored once, however many entries point at it. */
const savedBlobs = new WeakMap<Blob, Promise<StoredFileRef>>();

/**
 * Save a copy of a file. Returns a reference for the history entry, or a
 * reference marked `skipped` when it was too large or storage failed.
 */
export function saveFile(blob: Blob, name: string, role: FileRole): Promise<StoredFileRef> {
  const prior = savedBlobs.get(blob);
  if (prior) return prior.then((ref) => ({ ...ref, name, role }));
  const pending = storeFile(blob, name, role);
  savedBlobs.set(blob, pending);
  return pending;
}

async function storeFile(blob: Blob, name: string, role: FileRole): Promise<StoredFileRef> {
  const id = `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const ref: StoredFileRef = { id, name, size: blob.size, type: blob.type || guessType(name), role };
  if (blob.size > MAX_FILE_BYTES) return { ...ref, skipped: 'too large to keep' };
  try {
    if (!persistAsked && navigator.storage?.persist) {
      persistAsked = true;
      // Asks the browser not to evict this site's data under storage pressure.
      navigator.storage.persist().catch(() => undefined);
    }
    await makeRoom(blob.size);
    await tx('readwrite', (s) => s.put({ id, name, type: ref.type, size: blob.size, createdAt: Date.now(), blob } satisfies StoredFile));
    return ref;
  } catch {
    return { ...ref, skipped: 'browser storage is full' };
  }
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  try {
    return await tx<StoredFile>('readonly', (s) => s.get(id) as IDBRequest<StoredFile>);
  } catch {
    return undefined;
  }
}

export async function deleteFiles(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    await tx('readwrite', (s) => { ids.forEach((id) => s.delete(id)); });
  } catch { /* nothing to clean up */ }
}

export async function clearFiles(): Promise<void> {
  try { await tx('readwrite', (s) => s.clear()); } catch { /* ignore */ }
}

/** id, size and age of every stored file, without loading the bytes. */
async function listMeta(): Promise<{ id: string; size: number; createdAt: number }[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const out: { id: string; size: number; createdAt: number }[] = [];
    const t = db.transaction(STORE, 'readonly');
    const req = t.objectStore(STORE).index('createdAt').openCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return;
      const v = c.value as StoredFile;
      out.push({ id: v.id, size: v.size, createdAt: v.createdAt });
      c.continue();
    };
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
  });
}

async function budget(): Promise<number> {
  try {
    const est = await navigator.storage?.estimate?.();
    // Stay well inside what the browser grants this site.
    if (est?.quota) return Math.min(MAX_TOTAL_BYTES, est.quota * 0.5);
  } catch { /* fall through */ }
  return MAX_TOTAL_BYTES / 4;
}

/** Evict the oldest files until `incoming` more bytes fit in the budget. */
async function makeRoom(incoming: number): Promise<void> {
  const [files, limit] = await Promise.all([listMeta(), budget()]);
  let used = files.reduce((n, f) => n + f.size, 0);
  const evict: string[] = [];
  for (const f of files) { // oldest first
    if (used + incoming <= limit) break;
    evict.push(f.id);
    used -= f.size;
  }
  await deleteFiles(evict);
}

/** Drop stored files no history entry points at any more. */
export async function pruneFiles(referenced: Set<string>): Promise<void> {
  try {
    const files = await listMeta();
    await deleteFiles(files.filter((f) => !referenced.has(f.id)).map((f) => f.id));
  } catch { /* ignore */ }
}

export interface StorageInfo {
  /** Bytes of saved files. */
  filesBytes: number;
  fileCount: number;
  /** What the browser reports for this whole site, when it says. */
  usage?: number;
  quota?: number;
  persisted?: boolean;
  /** The cap this store keeps itself under. */
  budget: number;
}

export async function storageInfo(): Promise<StorageInfo> {
  const [files, limit] = await Promise.all([listMeta().catch(() => []), budget()]);
  let usage: number | undefined;
  let quota: number | undefined;
  let persisted: boolean | undefined;
  try {
    const est = await navigator.storage?.estimate?.();
    usage = est?.usage;
    quota = est?.quota;
    persisted = await navigator.storage?.persisted?.();
  } catch { /* unsupported */ }
  return { filesBytes: files.reduce((n, f) => n + f.size, 0), fileCount: files.length, usage, quota, persisted, budget: limit };
}

const EXT_TYPES: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
  pdf: 'application/pdf', txt: 'text/plain', md: 'text/markdown', csv: 'text/csv', json: 'application/json',
  html: 'text/html', xml: 'application/xml', yaml: 'text/yaml', yml: 'text/yaml', css: 'text/css', js: 'text/javascript',
  ts: 'text/plain', sql: 'text/plain', zip: 'application/zip', mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4',
  webm: 'video/webm', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function guessType(name: string): string {
  return EXT_TYPES[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';
}

/** How a file can be shown inline. */
export function previewKind(type: string, name: string): 'image' | 'pdf' | 'text' | 'audio' | 'video' | 'none' {
  const t = type || guessType(name);
  if (t.startsWith('image/')) return 'image';
  if (t === 'application/pdf') return 'pdf';
  if (t.startsWith('audio/')) return 'audio';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('text/') || /json|xml|yaml|javascript|csv/.test(t)) return 'text';
  return 'none';
}
