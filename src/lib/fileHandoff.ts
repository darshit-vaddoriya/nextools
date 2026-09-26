/**
 * FILE HANDOFF
 *
 * Carries files from a drop zone (homepage, category pages, File Converters)
 * into the tool the user picks, so choosing a tool after dropping a file
 * doesn't ask for the same file again.
 *
 * Every URL is its own prerendered page, so opening a tool is a full page load
 * and a module variable does not survive it. The files are therefore parked in
 * IndexedDB, which can hold File objects as they are, stay on this device, and
 * are read back once by the tool page. A copy is also kept in memory for the
 * rare same-page case.
 *
 * The slot holds at most one handoff, is consumed exactly once and expires
 * after a few minutes, so a later visit to a tool never picks up a stale file.
 */

interface Handoff {
  toolId: string;
  files: File[];
  at: number;
}

const DB_NAME = 'nexttool-handoff';
const STORE = 'pending';
const KEY = 'current';
/** Long enough for a slow page load, short enough that nothing lingers. */
const MAX_AGE_MS = 5 * 60 * 1000;

let pending: Handoff | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Runs one request in its own transaction and resolves with its result. */
async function withStore(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest | void): Promise<unknown> {
  const db = await openDb();
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/**
 * Stage files for the tool about to be opened, replacing any previous stage.
 * Await it before navigating: the write has to land before the page unloads.
 * Never rejects, and gives up after a second and a half so a broken or
 * blocked IndexedDB cannot stop the navigation; the tool then simply asks
 * for the file again.
 */
export async function stageFiles(toolId: string, files: File[]): Promise<void> {
  pending = files.length ? { toolId, files, at: Date.now() } : null;
  if (typeof indexedDB === 'undefined') return;
  const write = withStore('readwrite', (store) =>
    pending ? store.put(pending, KEY) : store.delete(KEY),
  ).catch(() => undefined);
  await Promise.race([write, new Promise((r) => setTimeout(r, 1500))]);
}

/**
 * Claim files staged for `toolId`, clearing the slot.
 * Resolves to an empty array when nothing (fresh) was staged for this tool.
 */
export async function takeStagedFiles(toolId: string): Promise<File[]> {
  if (pending?.toolId === toolId) {
    const { files } = pending;
    pending = null;
    void withStore('readwrite', (store) => store.delete(KEY)).catch(() => undefined);
    return files;
  }
  if (typeof indexedDB === 'undefined') return [];
  try {
    const stored = (await withStore('readonly', (store) => store.get(KEY))) as Handoff | undefined;
    if (!stored || stored.toolId !== toolId) return [];
    await withStore('readwrite', (store) => store.delete(KEY));
    return Date.now() - stored.at <= MAX_AGE_MS ? stored.files : [];
  } catch {
    return [];
  }
}

/**
 * Claim whatever was staged for the tool the URL is currently on.
 *
 * Tools are not built on one shared file component, most own their drop zone
 * and their own `handleFiles`, so rather than thread a tool id through every
 * one of them, the drop zones ask this on mount. The id comes from the route
 * because that is the same id the drop zone staged under a moment earlier.
 *
 * Resolves to an empty array anywhere that is not a tool page, so it is safe
 * to call unconditionally.
 */
export function takeStagedFilesForRoute(): Promise<File[]> {
  const match = /^\/tool\/([^/]+)/.exec(window.location.pathname);
  return match ? takeStagedFiles(match[1]) : Promise.resolve([]);
}

/** Drop anything staged, used when navigating away without opening a tool. */
export function clearStagedFiles(): void {
  pending = null;
  if (typeof indexedDB === 'undefined') return;
  void withStore('readwrite', (store) => store.delete(KEY)).catch(() => undefined);
}
