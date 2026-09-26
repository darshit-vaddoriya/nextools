/**
 * ARCHIVE ENGINE — ZIP, 7z, RAR, TAR (+ gzip, bzip2, xz) in; ZIP, TAR and
 * TAR.GZ out.
 *
 * Reading uses libarchive — the library behind bsdtar and macOS Archive
 * Utility — compiled to WebAssembly and run in a worker. Writing does not:
 * libarchive.js 2.0 emits an empty file unless an outer compression filter is
 * set, so ZIP is written with JSZip and TAR by hand (ustar is a 512-byte
 * header per file), gzipped with the browser's own CompressionStream.
 *
 * Converting is extract-then-repack: names and folders carry over and the
 * bytes of every file are identical to the original.
 *
 * The worker and its .wasm are served from /vendor/libarchive/ (see the
 * vendor files in astro.config.ts), since the worker locates the .wasm next
 * to itself and a bundler would rename one of them.
 */
import type { ConvFormat } from '../../../config/converters';
import type { RunContext } from '../../../lib/useConversion';

type Lib = typeof import('libarchive.js');

let lib: Promise<Lib> | null = null;
function loadLib(): Promise<Lib> {
  if (!lib) {
    lib = import('libarchive.js').then((m) => {
      m.Archive.init({ workerUrl: '/vendor/libarchive/worker-bundle.js' });
      return m;
    });
  }
  return lib;
}

interface Entry { file: File; path: string }

export async function convertArchive(file: File, to: ConvFormat, ctx: RunContext): Promise<Blob> {
  const { Archive } = await loadLib();
  ctx.onProgress(5);

  let archive;
  try {
    archive = await Archive.open(file);
  } catch (err) {
    throw new Error(`“${file.name}” could not be opened as an archive. It may be damaged or incomplete.`, { cause: err });
  }
  try {
    if (await archive.hasEncryptedData()) {
      throw new Error('This archive is password-protected. Extract it with the password in 7-Zip or The Unarchiver, then convert the files.');
    }
    ctx.onProgress(15);
    const tree = await archive.extractFiles();
    if (ctx.signal.aborted) throw new Error('Conversion cancelled.');
    ctx.onProgress(60);

    const entries: Entry[] = [];
    const walk = (node: Record<string, unknown>, prefix: string) => {
      for (const [name, value] of Object.entries(node)) {
        if (value instanceof File) entries.push({ file: value, path: `${prefix}${name}` });
        else if (value && typeof value === 'object') walk(value as Record<string, unknown>, `${prefix}${name}/`);
      }
    };
    walk(tree as Record<string, unknown>, '');
    if (entries.length === 0) throw new Error('This archive is empty.');

    const base = file.name.replace(/(\.tar)?\.[^.]+$/i, '') || 'archive';
    const out = await writeArchive(entries, to);
    ctx.onProgress(98);
    return new File([out], `${base}.${to === 'tgz' ? 'tar.gz' : to}`, { type: out.type });
  } finally {
    await archive.close();
  }
}

// ─── Writers ─────────────────────────────────────────────────────

async function writeArchive(entries: Entry[], to: ConvFormat): Promise<Blob> {
  if (to === 'zip') {
    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();
    for (const e of entries) zip.file(e.path, e.file, { date: new Date(e.file.lastModified || Date.now()) });
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 }, mimeType: 'application/zip' });
  }
  if (to === 'tar' || to === 'tgz') {
    const tar = await writeTar(entries);
    if (to === 'tar') return tar;
    const gz = tar.stream().pipeThrough(new CompressionStream('gzip'));
    return new Blob([await new Response(gz).arrayBuffer()], { type: 'application/gzip' });
  }
  throw new Error(`Archives cannot be converted to ${to.toUpperCase()} here.`);
}

const enc = new TextEncoder();

/** POSIX ustar. Paths over 100 bytes use the 155-byte prefix field, split at a slash. */
async function writeTar(entries: Entry[]): Promise<Blob> {
  const parts: BlobPart[] = [];
  for (const e of entries) {
    let name = e.path;
    let prefix = '';
    if (enc.encode(name).length > 100) {
      // Split at the first slash that leaves a name ≤ 100 bytes and a prefix ≤ 155 bytes.
      let split = -1;
      for (let i = 0; i < name.length && split < 0; i += 1) {
        if (name[i] === '/' && enc.encode(name.slice(i + 1)).length <= 100 && enc.encode(name.slice(0, i)).length <= 155) split = i;
      }
      if (split <= 0) throw new Error(`The path “${name}” is too long for a TAR archive. Use ZIP instead.`);
      prefix = name.slice(0, split);
      name = name.slice(split + 1);
    }
    const h = new Uint8Array(512);
    const put = (text: string, off: number, len: number) => h.set(enc.encode(text).subarray(0, len), off);
    const octal = (n: number, len: number) => n.toString(8).padStart(len - 1, '0') + '\0';
    put(name, 0, 100);
    put('0000644\0', 100, 8);
    put('0000000\0', 108, 8);
    put('0000000\0', 116, 8);
    put(octal(e.file.size, 12), 124, 12);
    put(octal(Math.floor((e.file.lastModified || Date.now()) / 1000), 12), 136, 12);
    put('        ', 148, 8); // checksum is computed with this field as spaces
    put('0', 156, 1);
    put('ustar\0', 257, 6);
    put('00', 263, 2);
    put(prefix, 345, 155);
    const sum = h.reduce((a, b) => a + b, 0);
    put(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8);
    parts.push(h, e.file);
    const padding = (512 - (e.file.size % 512)) % 512;
    if (padding) parts.push(new Uint8Array(padding));
  }
  parts.push(new Uint8Array(1024)); // two zero blocks end the archive
  return new Blob(parts, { type: 'application/x-tar' });
}
