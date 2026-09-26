/**
 * Wraps a tool page and records what the user changes in it, so every tool
 * gets a history without each one having to wire it up.
 *
 * It listens (in the capture phase, never interfering) for:
 *   - typing in inputs, textareas and contenteditable areas, debounced and
 *     stored as before → after snapshots;
 *   - options: selects, checkboxes, radios, sliders, colour pickers;
 *   - files added by picker or drag-and-drop (names and sizes only);
 *   - copy / download / export and other action buttons.
 *
 * Everything goes to lib/activity, which keeps it in localStorage.
 */
import React, { useEffect, useRef } from 'react';
import { describeTextChange, historyEnabled, logActivity, logOutputFile, SENSITIVE_TOOLS, type ActivityEntry } from '../../lib/activity';
import { fileSavingEnabled, saveFile, type StoredFileRef } from '../../lib/fileStore';
import { formatBytes } from '../../lib/formats';
import { setActiveTool } from '../../lib/results';

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLElement;

const IGNORED_INPUT_TYPES = new Set(['file', 'hidden', 'button', 'submit', 'reset', 'image']);
const OPTION_INPUT_TYPES = new Set(['checkbox', 'radio', 'range', 'number', 'color', 'date', 'time', 'datetime-local', 'month', 'week']);
const TYPE_DEBOUNCE_MS = 1200;

const ACTION_RE = /\b(generate|convert|format|beautif|prettif|minif|compress|merge|split|encode|decode|clear|reset|swap|sort|extract|compare|validate|parse|calculate|apply|rotate|crop|resize|flip|process|run|create|shuffle|reverse|dedupe|escape|unescape|hash|encrypt|decrypt|redact|sign|flatten|repair|ocr|remove|replace|upload|share|print)/i;

/** Open trackers by tool id, so the history panel can put a value back. */
const roots = new Map<string, HTMLElement>();

function fieldsIn(root: HTMLElement): Field[] {
  return Array.from(root.querySelectorAll<Field>('input, textarea, select, [contenteditable="true"], [contenteditable=""]'))
    .filter((el) => !(el instanceof HTMLInputElement && IGNORED_INPUT_TYPES.has(el.type)));
}

function asField(t: EventTarget | null): Field | null {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return null;
  // Opt-out for controls whose changes aren't meaningful history (e.g. in-canvas editors).
  if (el.closest('[data-history-ignore]')) return null;
  if (el instanceof HTMLInputElement) return IGNORED_INPUT_TYPES.has(el.type) ? null : el;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el;
  if (el.isContentEditable) return (el.closest('[contenteditable="true"], [contenteditable=""]') as HTMLElement) ?? el;
  return null;
}

const tidy = (s: string | null | undefined, max = 40) => {
  const t = (s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

/** Best human name for a control: aria, <label>, a caption just before it, placeholder, name. */
function fieldLabel(el: Field): string {
  const aria = el.getAttribute('aria-label');
  if (aria) return tidy(aria);
  const by = el.getAttribute('aria-labelledby');
  if (by) {
    const t = by.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
    if (tidy(t)) return tidy(t);
  }
  if (el.id) {
    const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (l && tidy(l.textContent)) return tidy(l.textContent);
  }
  const wrap = el.closest('label');
  if (wrap) {
    const clone = wrap.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, textarea, select, option').forEach((n) => n.remove());
    if (tidy(clone.textContent)) return tidy(clone.textContent);
  }
  // A short caption sitting right before the field (or its wrapper).
  for (let node: Element | null = el, depth = 0; node && depth < 3; node = node.parentElement, depth += 1) {
    const prev = node.previousElementSibling;
    if (prev && !prev.querySelector('input, textarea, select') && tidy(prev.textContent) && (prev.textContent ?? '').trim().length <= 40) {
      return tidy(prev.textContent);
    }
  }
  const ph = el.getAttribute('placeholder');
  if (ph) return tidy(ph);
  const name = el.getAttribute('name');
  if (name) return tidy(name);
  return el instanceof HTMLTextAreaElement || el.isContentEditable ? 'Text' : 'Field';
}

function valueOf(el: Field): string {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') return el.checked ? 'On' : 'Off';
    if (el.type === 'radio') return el.checked ? (fieldLabel(el) || el.value) : '';
    return el.value;
  }
  if (el instanceof HTMLSelectElement) return el.selectedOptions[0]?.textContent?.trim() ?? el.value;
  if (el instanceof HTMLTextAreaElement) return el.value;
  return el.innerText;
}

function isOption(el: Field) {
  return el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && OPTION_INPUT_TYPES.has(el.type));
}

function isSecret(el: Field) {
  return el instanceof HTMLInputElement && (el.type === 'password' || el.autocomplete === 'current-password' || el.autocomplete === 'new-password');
}

/** Stable-enough address for a field: its position among the tool's fields plus its label. */
function keyFor(root: HTMLElement, el: Field): string {
  const idx = fieldsIn(root).indexOf(el);
  return `${el.tagName.toLowerCase()}:${idx}:${fieldLabel(el)}`;
}

function findByKey(root: HTMLElement, key: string): Field | null {
  const [tag, idxStr, ...rest] = key.split(':');
  const label = rest.join(':');
  const fields = fieldsIn(root);
  const at = fields[Number(idxStr)];
  if (at && at.tagName.toLowerCase() === tag && fieldLabel(at) === label) return at;
  return fields.find((f) => f.tagName.toLowerCase() === tag && fieldLabel(f) === label) ?? at ?? null;
}

let suppress = false;

// ─── Output capture ─────────────────────────────────────────
// Tools download results in many ways, but nearly all end in an <a download>
// being clicked, usually with a blob: URL. Watching for that one moment
// catches every tool's output without touching the tools.

type OutputSink = (blob: Blob, name: string) => void;
let outputSink: OutputSink | null = null;
const blobsByUrl = new Map<string, Blob>();
const handledAnchors = new WeakSet<HTMLAnchorElement>();
let captureInstalled = false;

function captureAnchor(a: HTMLAnchorElement) {
  const sink = outputSink;
  if (!sink || !a.hasAttribute('download') || !a.href || a.dataset.fromHistory) return;
  const name = a.getAttribute('download') || a.href.split('/').pop() || 'download';
  const known = blobsByUrl.get(a.href);
  if (known) { sink(known, name); return; }
  if (a.href.startsWith('blob:') || a.href.startsWith('data:')) {
    // The fetch captures the URL now, so a revoke right after the click is harmless.
    fetch(a.href).then((r) => r.blob()).then((b) => sink(b, name)).catch(() => undefined);
  }
}

function installOutputCapture() {
  if (captureInstalled || typeof window === 'undefined') return;
  captureInstalled = true;

  const create = URL.createObjectURL.bind(URL);
  const revoke = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = (obj: Blob | MediaSource) => {
    const url = create(obj);
    if (obj instanceof Blob) blobsByUrl.set(url, obj);
    return url;
  };
  URL.revokeObjectURL = (url: string) => {
    // Kept a moment longer so a capture already in flight still finds it.
    window.setTimeout(() => blobsByUrl.delete(url), 5000);
    revoke(url);
  };

  // Programmatic downloads: `a.click()` on an element that is often never attached.
  const nativeClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function patchedClick(this: HTMLAnchorElement) {
    if (outputSink) {
      handledAnchors.add(this);
      try { captureAnchor(this); } catch { /* never block the download */ }
    }
    return nativeClick.call(this);
  };

  // Real clicks on a visible download link.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[download]') as HTMLAnchorElement | null;
    if (!a || handledAnchors.has(a)) return;
    try { captureAnchor(a); } catch { /* ignore */ }
  }, true);
}

/** Set a value the way a user would, so React-controlled fields pick it up. */
function setFieldValue(el: Field, value: string): boolean {
  suppress = true;
  try {
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      if ((value === 'On') !== el.checked) el.click();
      return true;
    }
    if (el instanceof HTMLSelectElement) {
      const opt = Array.from(el.options).find((o) => o.textContent?.trim() === value || o.value === value);
      if (!opt) return false;
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set?.call(el, opt.value);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const proto = el instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  } finally {
    suppress = false;
  }
}

/** Can this entry be put back into the open tool? */
export function canRestore(entry: ActivityEntry): boolean {
  return !!entry.fieldKey && (entry.kind === 'edit' || entry.kind === 'option') && roots.has(entry.toolId)
    && !entry.truncated && !entry.fieldKey.startsWith('div:');
}

/** Put a field of the open tool back to a value from its history. */
export function restoreFromHistory(entry: ActivityEntry, which: 'before' | 'after'): boolean {
  const root = roots.get(entry.toolId);
  const value = entry[which];
  if (!root || !entry.fieldKey || value === undefined) return false;
  const el = findByKey(root, entry.fieldKey);
  if (!el || !setFieldValue(el, value)) return false;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return true;
}

interface Props {
  toolId: string;
  toolName: string;
  children: React.ReactNode;
}

export const ToolActivityTracker: React.FC<Props> = ({ toolId, toolName, children }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    roots.set(toolId, root);

    const sensitiveTool = SENSITIVE_TOOLS.has(toolId);
    const keepFiles = () => !sensitiveTool && historyEnabled() && fileSavingEnabled();

    installOutputCapture();
    let lastOutput = { key: '', at: 0 };
    /** The latest files given to this tool, shown next to each output as its source. */
    let sessionInputs: StoredFileRef[] = [];
    setActiveTool({ toolId, toolName, inputs: () => sessionInputs });
    outputSink = (blob, name) => {
      if (!keepFiles()) {
        logOutputFile(toolId, toolName, { id: '', name, size: blob.size, type: blob.type, role: 'output', skipped: 'file saving is off' });
        return;
      }
      // Same file twice in a row (e.g. a double click) is saved once.
      const key = `${name}:${blob.size}`;
      const now = Date.now();
      if (lastOutput.key === key && now - lastOutput.at < 3000) return;
      lastOutput = { key, at: now };
      void saveFile(blob, name, 'output').then((ref) => logOutputFile(toolId, toolName, ref, sessionInputs));
    };
    const baseline = new WeakMap<Field, string>();
    const timers = new Map<Field, number>();
    let lastAction = { key: '', at: 0 };

    const log = (e: Omit<Parameters<typeof logActivity>[0], 'toolId' | 'toolName'>) =>
      logActivity({ toolId, toolName, ...e });

    const flush = (el: Field) => {
      const t = timers.get(el);
      if (t) { window.clearTimeout(t); timers.delete(el); }
      if (!root.contains(el)) return;
      const cur = valueOf(el);
      const before = baseline.get(el);
      if (before === cur) return;
      baseline.set(el, cur);
      if (before === undefined && cur === '') return;
      const label = fieldLabel(el);
      const secret = sensitiveTool || isSecret(el);
      const option = isOption(el);
      let summary: string;
      if (option) {
        summary = secret || before === undefined
          ? `${label}: ${tidy(cur, 30)}`
          : `${label}: ${tidy(before, 24) || '—'} → ${tidy(cur, 24) || '—'}`;
        if (secret) summary = `Changed ${label}`;
      } else {
        summary = secret
          ? `Edited ${label}`
          : `Edited ${label} (${describeTextChange(before ?? '', cur)})`;
      }
      log({
        kind: option ? 'option' : 'edit',
        label,
        summary,
        before: secret ? undefined : before,
        after: secret ? undefined : cur,
        fieldKey: keyFor(root, el),
      });
    };

    const flushAll = () => { Array.from(timers.keys()).forEach(flush); };

    const onFocusIn = (e: Event) => {
      const el = asField(e.target);
      if (el && !baseline.has(el)) baseline.set(el, valueOf(el));
    };

    const onInput = (e: Event) => {
      if (suppress) return;
      const el = asField(e.target);
      if (!el) return;
      if (!baseline.has(el)) {
        // Unfocused change (e.g. Safari doesn't focus checkboxes on click): infer where it started.
        baseline.set(el, el instanceof HTMLInputElement && el.type === 'checkbox' ? (el.checked ? 'Off' : 'On') : '');
      }
      const prev = timers.get(el);
      if (prev) window.clearTimeout(prev);
      timers.set(el, window.setTimeout(() => flush(el), TYPE_DEBOUNCE_MS));
    };

    const logFiles = (files: File[], how: string) => {
      if (!files.length) return;
      const total = files.reduce((n, f) => n + f.size, 0);
      const names = files.slice(0, 3).map((f) => f.name).join(', ') + (files.length > 3 ? ` +${files.length - 3} more` : '');
      const summary = `${how} ${files.length === 1 ? 'file' : `${files.length} files`}: ${names} (${formatBytes(total)})`;
      if (!keepFiles()) {
        log({ kind: 'file', label: 'Files', summary });
        return;
      }
      void Promise.all(files.slice(0, 20).map((f) => saveFile(f, f.name, 'input')))
        .then((refs: StoredFileRef[]) => {
          sessionInputs = refs;
          log({ kind: 'file', label: 'Files', summary, files: refs });
        });
    };

    const onChange = (e: Event) => {
      if (suppress) return;
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement && target.type === 'file') {
        logFiles(Array.from(target.files ?? []), 'Added');
        return;
      }
      const el = asField(target);
      if (!el) return;
      if (el instanceof HTMLInputElement && el.type === 'radio' && !el.checked) return;
      if (isOption(el) && !(el instanceof HTMLInputElement && (el.type === 'range' || el.type === 'color' || el.type === 'number'))) {
        // Radios in a group share one history line.
        if (el instanceof HTMLInputElement && el.type === 'radio' && el.name) {
          const group = root.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
          const prevChecked = Array.from(group).find((r) => r !== el && baseline.get(r) === (fieldLabel(r) || r.value));
          group.forEach((r) => baseline.set(r, r.checked ? (fieldLabel(r) || r.value) : ''));
          log({ kind: 'option', label: el.name, summary: `Chose ${fieldLabel(el) || el.value}${prevChecked ? ` (was ${fieldLabel(prevChecked)})` : ''}` });
          return;
        }
        flush(el);
      }
    };

    const onFocusOut = (e: Event) => {
      const el = asField(e.target);
      if (el && timers.has(el)) flush(el);
    };

    const onDrop = (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) logFiles(files, 'Dropped');
    };

    const onPaste = (e: ClipboardEvent) => {
      if (asField(e.target)) return; // text paste shows up as an edit
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) logFiles(files, 'Pasted');
    };

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('button, a, [role="button"], [role="menuitem"]');
      if (!el || !root.contains(el) || (el as HTMLButtonElement).disabled) return;
      const text = tidy(el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText, 48);
      const anchor = el instanceof HTMLAnchorElement ? el : null;
      let kind: 'copy' | 'download' | 'action' | null = null;
      if (anchor?.hasAttribute('download')) kind = 'download';
      else if (/\bcop(y|ied)\b/i.test(text)) kind = 'copy';
      else if (/\b(download|export|save)\b/i.test(text)) kind = 'download';
      else if (text.length > 1 && ACTION_RE.test(text)) kind = 'action';
      if (!kind) return;

      const key = `${kind}:${text}`;
      const now = Date.now();
      if (lastAction.key === key && now - lastAction.at < 1500) return;
      lastAction = { key, at: now };

      // Pending edits happened first; keep the log in order.
      flushAll();
      const file = anchor?.getAttribute('download');
      const summary = kind === 'download'
        ? `Downloaded${file ? ` ${file}` : text && !/^(download|export|save)$/i.test(text) ? ` (${text})` : ''}`
        : kind === 'copy'
          ? `Copied${text && !/^cop(y|ied)$/i.test(text) ? ` (${text})` : ' to clipboard'}`
          : text;
      log({ kind, label: text || kind, summary });
    };

    root.addEventListener('focusin', onFocusIn, true);
    root.addEventListener('input', onInput, true);
    root.addEventListener('change', onChange, true);
    root.addEventListener('focusout', onFocusOut, true);
    root.addEventListener('drop', onDrop, true);
    root.addEventListener('paste', onPaste, true);
    root.addEventListener('click', onClick, true);
    window.addEventListener('pagehide', flushAll);

    return () => {
      flushAll();
      if (roots.get(toolId) === root) roots.delete(toolId);
      outputSink = null;
      setActiveTool(null);
      root.removeEventListener('focusin', onFocusIn, true);
      root.removeEventListener('input', onInput, true);
      root.removeEventListener('change', onChange, true);
      root.removeEventListener('focusout', onFocusOut, true);
      root.removeEventListener('drop', onDrop, true);
      root.removeEventListener('paste', onPaste, true);
      root.removeEventListener('click', onClick, true);
      window.removeEventListener('pagehide', flushAll);
    };
  }, [toolId, toolName]);

  // display:contents keeps the tool's own layout untouched; events still bubble through.
  return <div ref={rootRef} style={{ display: 'contents' }}>{children}</div>;
};
