/**
 * DATA ENGINE — JSON, XML and YAML.
 *
 * XML has no single mapping to JSON, so this uses the convention most
 * converters and APIs agree on: attributes become "@name" keys, element text
 * sits under "#text" when it shares an element with attributes or children,
 * and an element that repeats becomes an array. The reverse direction reads
 * the same convention back, so XML → JSON → XML round-trips.
 */
import type { ConvFormat } from '../../../config/converters';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export interface DataOptions {
  /** Pretty-print output. */
  indent: 2 | 4 | 0;
  /** Name of the XML root element when the JSON has more than one top-level key. */
  rootName: string;
}

export const DEFAULT_DATA_OPTIONS: DataOptions = { indent: 2, rootName: 'root' };

// ─── XML → JSON ──────────────────────────────────────────────────

/** Numbers and booleans in XML text are just text; only obvious ones are typed. */
function typed(text: string): Json {
  const t = text.trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (/^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(t)) return Number(t);
  return text;
}

function elementToJson(el: Element): Json {
  const obj: Record<string, Json> = {};
  for (const attr of Array.from(el.attributes)) obj[`@${attr.name}`] = typed(attr.value);

  let text = '';
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      const value = elementToJson(child);
      const key = child.tagName;
      if (key in obj) {
        const existing = obj[key];
        obj[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else obj[key] = value;
    } else if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
      text += node.nodeValue ?? '';
    }
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return text.trim() === '' ? null : typed(text.trim());
  if (text.trim()) obj['#text'] = typed(text.trim());
  return obj;
}

export function xmlToJson(xml: string): Json {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const error = doc.getElementsByTagName('parsererror')[0];
  if (error) {
    const detail = (error.textContent ?? '').split('\n').find((l) => /line|error/i.test(l))?.trim();
    throw new Error(`That file is not well-formed XML${detail ? `: ${detail}` : '.'}`);
  }
  const root = doc.documentElement;
  return { [root.tagName]: elementToJson(root) };
}

// ─── JSON → XML ──────────────────────────────────────────────────

const escText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => escText(s).replace(/"/g, '&quot;');

/** XML names cannot start with a digit or contain spaces; keep them readable rather than rejecting. */
function safeName(key: string): string {
  let name = key.replace(/[^A-Za-z0-9_.:-]/g, '_');
  if (!/^[A-Za-z_]/.test(name)) name = `_${name}`;
  return name;
}

function toXml(name: string, value: Json, depth: number, indent: string): string {
  const pad = indent ? indent.repeat(depth) : '';
  const nl = indent ? '\n' : '';
  const tag = safeName(name);
  if (Array.isArray(value)) return value.map((v) => toXml(name, v, depth, indent)).join(nl);
  if (value === null) return `${pad}<${tag}/>`;
  if (typeof value !== 'object') return `${pad}<${tag}>${escText(String(value))}</${tag}>`;

  const attrs = Object.entries(value)
    .filter(([k, v]) => k.startsWith('@') && (v === null || typeof v !== 'object'))
    .map(([k, v]) => ` ${safeName(k.slice(1))}="${escAttr(v === null ? '' : String(v))}"`)
    .join('');
  const text = value['#text'];
  const children = Object.entries(value).filter(([k]) => !k.startsWith('@') && k !== '#text');
  if (children.length === 0) {
    return text === undefined || text === null
      ? `${pad}<${tag}${attrs}/>`
      : `${pad}<${tag}${attrs}>${escText(String(text))}</${tag}>`;
  }
  const inner = children.map(([k, v]) => toXml(k, v, depth + 1, indent)).join(nl);
  const textPart = text === undefined || text === null ? '' : `${indent ? indent.repeat(depth + 1) : ''}${escText(String(text))}${nl}`;
  return `${pad}<${tag}${attrs}>${nl}${textPart}${inner}${nl}${pad}</${tag}>`;
}

export function jsonToXml(data: Json, opts: DataOptions): string {
  const indent = opts.indent ? ' '.repeat(opts.indent) : '';
  let body: string;
  // A single top-level key is the root element, as XML → JSON produces.
  if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 1) {
    const [[k, v]] = Object.entries(data);
    body = toXml(k, v, 0, indent);
  } else if (Array.isArray(data)) {
    const items = data.map((v) => toXml('item', v, 1, indent)).join(indent ? '\n' : '');
    body = `<${safeName(opts.rootName)}>${indent ? '\n' : ''}${items}${indent ? '\n' : ''}</${safeName(opts.rootName)}>`;
  } else {
    body = toXml(opts.rootName, data, 0, indent);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`;
}

// ─── Dispatcher ──────────────────────────────────────────────────

function parseJson(text: string): Json {
  try {
    return JSON.parse(text.replace(/^\uFEFF/, '')) as Json;
  } catch (err) {
    throw new Error(`That file is not valid JSON: ${(err as Error).message}`, { cause: err });
  }
}

async function parseYaml(text: string): Promise<Json> {
  const { parse } = await import('yaml');
  try {
    return parse(text) as Json;
  } catch (err) {
    throw new Error(`That file is not valid YAML: ${(err as Error).message}`, { cause: err });
  }
}

export async function convertData(file: File, from: ConvFormat, to: ConvFormat, opts: DataOptions): Promise<Blob> {
  const text = await file.text();
  const data: Json = from === 'json' ? parseJson(text) : from === 'xml' ? xmlToJson(text) : await parseYaml(text);

  if (to === 'json') return new Blob([JSON.stringify(data, null, opts.indent || undefined)], { type: 'application/json' });
  if (to === 'xml') return new Blob([jsonToXml(data, opts)], { type: 'application/xml' });
  if (to === 'yaml') {
    const { stringify } = await import('yaml');
    return new Blob([stringify(data, { indent: opts.indent || 2, lineWidth: 0 })], { type: 'application/yaml' });
  }
  throw new Error(`${from.toUpperCase()} cannot be converted to ${to.toUpperCase()} here.`);
}
