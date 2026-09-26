/**
 * FONT ENGINE — TTF / OTF ↔ WOFF ↔ WOFF2.
 *
 * WOFF is the desktop font's tables, each zlib-compressed, behind a small
 * header; it is written and read here directly with the browser's own
 * CompressionStream. WOFF2 adds table transforms and Brotli, so it uses
 * Google's reference woff2 library compiled to WebAssembly (woff2-encoder).
 *
 * The glyphs, hinting and metadata are untouched: every table comes out byte
 * for byte as it went in (only their order within the file may change), so
 * every conversion is lossless.
 */
import type { ConvFormat } from '../../../config/converters';

const tag = (v: DataView, o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
const pad4 = (n: number) => (n + 3) & ~3;

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([data as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

type Kind = 'ttf' | 'otf' | 'woff' | 'woff2' | 'collection';

function sniff(bytes: Uint8Array): Kind | null {
  if (bytes.length < 12) return null;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sig = tag(v, 0);
  if (sig === 'wOFF') return 'woff';
  if (sig === 'wOF2') return 'woff2';
  if (sig === 'OTTO') return 'otf';
  if (sig === 'ttcf') return 'collection';
  if (v.getUint32(0) === 0x00010000 || sig === 'true') return 'ttf';
  return null;
}

/** WOFF → the original sfnt (TTF or OTF). */
async function woffToSfnt(bytes: Uint8Array): Promise<Uint8Array> {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flavor = v.getUint32(4);
  const numTables = v.getUint16(12);
  const tables: { tag: number; checksum: number; data: Uint8Array }[] = [];
  for (let i = 0; i < numTables; i += 1) {
    const o = 44 + i * 20;
    const offset = v.getUint32(o + 4);
    const compLength = v.getUint32(o + 8);
    const origLength = v.getUint32(o + 12);
    const raw = bytes.subarray(offset, offset + compLength);
    const data = compLength < origLength ? await pipe(raw, new DecompressionStream('deflate')) : raw;
    if (data.length !== origLength) throw new Error('This WOFF file is damaged: a table did not decompress to its declared size.');
    tables.push({ tag: v.getUint32(o), checksum: v.getUint32(o + 16), data });
  }
  return writeSfnt(flavor, tables);
}

function writeSfnt(flavor: number, tables: { tag: number; checksum: number; data: Uint8Array }[]): Uint8Array {
  tables.sort((a, b) => a.tag - b.tag);
  const n = tables.length;
  const headerSize = 12 + n * 16;
  const total = headerSize + tables.reduce((sum, t) => sum + pad4(t.data.length), 0);
  const out = new Uint8Array(total);
  const v = new DataView(out.buffer);
  // Binary-search helpers the spec requires in the offset table.
  const pow2 = 2 ** Math.floor(Math.log2(n));
  v.setUint32(0, flavor);
  v.setUint16(4, n);
  v.setUint16(6, pow2 * 16);
  v.setUint16(8, Math.log2(pow2));
  v.setUint16(10, n * 16 - pow2 * 16);
  let offset = headerSize;
  tables.forEach((t, i) => {
    const r = 12 + i * 16;
    v.setUint32(r, t.tag);
    v.setUint32(r + 4, t.checksum);
    v.setUint32(r + 8, offset);
    v.setUint32(r + 12, t.data.length);
    out.set(t.data, offset);
    offset += pad4(t.data.length);
  });
  return out;
}

/** TTF/OTF → WOFF (1.0): each table deflated when that makes it smaller. */
async function sfntToWoff(bytes: Uint8Array): Promise<Uint8Array> {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flavor = v.getUint32(0);
  const n = v.getUint16(4);
  const entries: { tag: number; checksum: number; orig: Uint8Array; comp: Uint8Array }[] = [];
  let sfntSize = 12 + n * 16;
  for (let i = 0; i < n; i += 1) {
    const r = 12 + i * 16;
    const offset = v.getUint32(r + 8);
    const length = v.getUint32(r + 12);
    const orig = bytes.subarray(offset, offset + length);
    const deflated = await pipe(orig, new CompressionStream('deflate'));
    entries.push({ tag: v.getUint32(r), checksum: v.getUint32(r + 4), orig, comp: deflated.length < length ? deflated : orig });
    sfntSize += pad4(length);
  }
  entries.sort((a, b) => a.tag - b.tag);
  const headerSize = 44 + n * 20;
  const total = headerSize + entries.reduce((s, e) => s + pad4(e.comp.length), 0);
  const out = new Uint8Array(total);
  const w = new DataView(out.buffer);
  w.setUint32(0, 0x774f4646); // 'wOFF'
  w.setUint32(4, flavor);
  w.setUint32(8, total);
  w.setUint16(12, n);
  w.setUint32(16, sfntSize);
  w.setUint16(20, 1); // version 1.0 of the font data, informational
  let offset = headerSize;
  entries.forEach((e, i) => {
    const r = 44 + i * 20;
    w.setUint32(r, e.tag);
    w.setUint32(r + 4, offset);
    w.setUint32(r + 8, e.comp.length);
    w.setUint32(r + 12, e.orig.length);
    w.setUint32(r + 16, e.checksum);
    out.set(e.comp, offset);
    offset += pad4(e.comp.length);
  });
  return out;
}

/** The WOFF2 codec (Google's reference woff2, as WebAssembly); decompress-only is a much smaller download. */
const woff2Decompress = async (b: Uint8Array) => (await import('woff2-encoder/decompress')).default(b);
const woff2Compress = async (b: Uint8Array) => (await import('woff2-encoder')).compress(b);

/** Returns the font and the extension it should carry (a CFF font is .otf, not .ttf). */
export async function convertFont(file: File, to: ConvFormat): Promise<{ blob: Blob; ext: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) throw new Error(`“${file.name}” is not a TrueType, OpenType, WOFF or WOFF2 font.`);
  if (kind === 'collection') throw new Error('Font collections (.ttc) hold several fonts; extract the one you need with a font editor first.');

  // Everything goes through the plain sfnt, the common form all three share.
  let sfnt: Uint8Array;
  if (kind === 'woff') sfnt = await woffToSfnt(bytes);
  else if (kind === 'woff2') sfnt = await woff2Decompress(bytes);
  else sfnt = bytes;
  const isCff = sniff(sfnt) === 'otf';

  let out: Uint8Array;
  let ext: string;
  if (to === 'woff') { out = kind === 'woff' ? bytes : await sfntToWoff(sfnt); ext = 'woff'; }
  else if (to === 'woff2') { out = kind === 'woff2' ? bytes : await woff2Compress(sfnt); ext = 'woff2'; }
  else if (to === 'ttf' || to === 'otf') { out = sfnt; ext = isCff ? 'otf' : 'ttf'; }
  else throw new Error(`Fonts cannot be converted to ${to.toUpperCase()}.`);

  const mime = ext === 'otf' ? 'font/otf' : `font/${ext}`;
  return { blob: new Blob([out as BlobPart], { type: mime }), ext };
}
