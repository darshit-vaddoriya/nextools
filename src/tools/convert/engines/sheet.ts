/**
 * SPREADSHEET ENGINE
 *
 * XLSX is a ZIP of XML parts, so it is read and written here with JSZip and
 * DOMParser rather than a spreadsheet library: the subset a conversion needs
 * — sheet names, cell values, shared strings, and which number formats are
 * dates — is small, and it keeps a megabyte of dependency off the page.
 *
 * What is preserved: every sheet, every cell value, dates as ISO dates, the
 * cached result of formulas. What is not: formulas themselves, styling,
 * merged cells and charts — none of which CSV or JSON can hold anyway.
 */
import JSZip from 'jszip';
import type { ConvFormat } from '../../../config/converters';

export type Cell = string | number | boolean | null;
export interface Sheet { name: string; rows: Cell[][] }

export interface SheetOptions {
  /** Which sheets of a workbook to export: the first, or every one. */
  sheets: 'first' | 'all';
  /** CSV field separator. */
  delimiter: ',' | ';';
  /** Treat the first row as field names when producing JSON. */
  headerRow: boolean;
  /** PDF tables: one worksheet per page, or everything on one sheet. */
  pdfLayout: 'per-page' | 'single';
  /** SQL identifier quoting: "double quotes" (PostgreSQL, SQLite, SQL Server) or `backticks` (MySQL). */
  sqlDialect: 'standard' | 'mysql';
}

export const DEFAULT_SHEET_OPTIONS: SheetOptions = {
  sheets: 'first',
  delimiter: ',',
  headerRow: true,
  pdfLayout: 'per-page',
  sqlDialect: 'standard',
};

// ─── Reading XLSX ────────────────────────────────────────────────

const parseXml = (text: string) => new DOMParser().parseFromString(text, 'application/xml');

/** Elements by local name, ignoring whatever prefix the writer used. */
const byTag = (root: Document | Element, tag: string) => Array.from(root.getElementsByTagNameNS('*', tag));

/** "BC12" → 54 (zero-based column index). */
function columnIndex(ref: string): number {
  let n = 0;
  for (const ch of ref) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) break;
    n = n * 26 + (code - 64);
  }
  return n - 1;
}

/** Built-in number format ids that Excel renders as dates or times. */
const BUILTIN_DATE_FORMATS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 36, 45, 46, 47, 50, 57]);

function isDateFormatCode(code: string): boolean {
  // Strip quoted literals and colour/condition blocks, then look for date tokens.
  const bare = code.replace(/"[^"]*"/g, '').replace(/\[[^\]]*]/g, '');
  return /[dmyhs]/i.test(bare) && !/^[#0.,%E+\-\s]*$/.test(bare);
}

/** Excel serial date → ISO string. Serial 60 is the fictitious 29 Feb 1900 Lotus bug. */
function serialToIso(serial: number, date1904: boolean): string {
  const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30);
  const ms = Math.round(serial * 86400000);
  const d = new Date(epoch + ms);
  const iso = d.toISOString();
  if (serial % 1 === 0) return iso.slice(0, 10);
  if (serial < 1) return iso.slice(11, 19);
  return iso.slice(0, 19).replace('T', ' ');
}

export async function readXlsx(file: File): Promise<Sheet[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    if (head[0] === 0xd0 && head[1] === 0xcf) {
      throw new Error('This is an old binary .xls file. Open it in Excel, LibreOffice or Google Sheets and save it as .xlsx first.');
    }
    throw new Error(`“${file.name}” is not a readable Excel workbook.`);
  }
  const read = async (path: string) => zip.file(path)?.async('string') ?? null;

  const workbookXml = await read('xl/workbook.xml');
  if (!workbookXml) throw new Error(`“${file.name}” has no workbook inside it.`);
  const workbook = parseXml(workbookXml);
  const date1904 = byTag(workbook, 'workbookPr')[0]?.getAttribute('date1904') === '1';

  const rels = parseXml((await read('xl/_rels/workbook.xml.rels')) ?? '<Relationships/>');
  const targets = new Map(byTag(rels, 'Relationship').map((r) => [r.getAttribute('Id'), r.getAttribute('Target') ?? '']));

  const shared: string[] = [];
  const sharedXml = await read('xl/sharedStrings.xml');
  if (sharedXml) {
    for (const si of byTag(parseXml(sharedXml), 'si')) {
      // Rich text is split into runs; phonetic guides (rPh) are not part of the value.
      shared.push(byTag(si, 't').filter((t) => (t.parentNode as Element)?.localName !== 'rPh').map((t) => t.textContent ?? '').join(''));
    }
  }

  const dateStyles = new Set<number>();
  const stylesXml = await read('xl/styles.xml');
  if (stylesXml) {
    const styles = parseXml(stylesXml);
    const custom = new Map(byTag(styles, 'numFmt').map((f) => [Number(f.getAttribute('numFmtId')), f.getAttribute('formatCode') ?? '']));
    const xfs = byTag(styles, 'cellXfs')[0];
    if (xfs) {
      Array.from(xfs.children).forEach((xf, i) => {
        const id = Number(xf.getAttribute('numFmtId') ?? 0);
        if (BUILTIN_DATE_FORMATS.has(id) || (custom.has(id) && isDateFormatCode(custom.get(id)!))) dateStyles.add(i);
      });
    }
  }

  const sheets: Sheet[] = [];
  for (const el of byTag(workbook, 'sheet')) {
    const name = el.getAttribute('name') ?? `Sheet${sheets.length + 1}`;
    const rid = el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ?? el.getAttribute('r:id');
    let target = targets.get(rid) ?? '';
    if (!target) continue;
    target = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
    const xml = await read(target);
    if (!xml) continue;

    const rows: Cell[][] = [];
    for (const row of byTag(parseXml(xml), 'row')) {
      const r = Number(row.getAttribute('r') ?? rows.length + 1) - 1;
      const cells: Cell[] = [];
      let next = 0;
      for (const c of byTag(row, 'c')) {
        const ref = c.getAttribute('r');
        const col = ref ? columnIndex(ref) : next;
        next = col + 1;
        const type = c.getAttribute('t');
        const raw = byTag(c, 'v')[0]?.textContent ?? null;
        let value: Cell = null;
        if (type === 's') value = raw === null ? null : shared[Number(raw)] ?? '';
        else if (type === 'inlineStr') value = byTag(c, 't').map((t) => t.textContent ?? '').join('');
        else if (type === 'str' || type === 'e') value = raw;
        else if (type === 'b') value = raw === '1';
        else if (raw !== null) {
          const num = Number(raw);
          const style = Number(c.getAttribute('s') ?? -1);
          value = dateStyles.has(style) && Number.isFinite(num) ? serialToIso(num, date1904) : num;
        }
        cells[col] = value;
      }
      rows[r] = Array.from(cells, (v) => (v === undefined ? null : v));
    }
    sheets.push({ name, rows: Array.from(rows, (r) => r ?? []) });
  }
  if (sheets.length === 0) throw new Error('No worksheets were found in this workbook.');
  return sheets;
}

// ─── Writing XLSX ────────────────────────────────────────────────

const esc = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  // XML 1.0 forbids most control characters; Excel refuses the file if they appear.
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

function columnName(i: number): string {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/**
 * Should this text be stored as a number? Only when nothing is lost: "007",
 * a 16-digit card number or "1e5" typed as a product code must stay text.
 */
function asNumber(v: string): number | null {
  if (!/^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(v.trim())) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Sheet names: 31 chars, none of : \ / ? * [ ], unique. */
function safeSheetNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((raw, i) => {
    const base = (raw.replace(/[:\\/?*[\]]/g, ' ').trim() || `Sheet${i + 1}`).slice(0, 31);
    let name = base;
    for (let k = 2; used.has(name.toLowerCase()); k += 1) name = `${base.slice(0, 28)} (${k})`;
    used.add(name.toLowerCase());
    return name;
  });
}

function sheetXml(rows: Cell[][], boldHeader: boolean): string {
  const widths: number[] = [];
  const body = rows.map((row, r) => {
    const cells = row.map((v, c) => {
      if (v === null || v === '') return '';
      const ref = `${columnName(c)}${r + 1}`;
      const style = boldHeader && r === 0 ? ' s="1"' : '';
      widths[c] = Math.max(widths[c] ?? 0, String(v).length);
      if (typeof v === 'number') return `<c r="${ref}"${style}><v>${v}</v></c>`;
      if (typeof v === 'boolean') return `<c r="${ref}"${style} t="b"><v>${v ? 1 : 0}</v></c>`;
      const n = r === 0 && boldHeader ? null : asNumber(v);
      if (n !== null) return `<c r="${ref}"${style}><v>${n}</v></c>`;
      return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
    }).join('');
    return `<row r="${r + 1}">${cells}</row>`;
  }).join('');
  const cols = widths.length
    ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${Math.min(60, Math.max(8, (w ?? 0) + 2))}" customWidth="1"/>`).join('')}</cols>`
    : '';
  const freeze = boldHeader && rows.length > 1
    ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
    : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${freeze}${cols}<sheetData>${body}</sheetData></worksheet>`;
}

export async function writeXlsx(sheets: Sheet[], { boldHeader = true } = {}): Promise<Blob> {
  const zip = new JSZip();
  const names = safeSheetNames(sheets.map((s) => s.name));
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${
    sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
  }</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${
    names.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')
  }</sheets></workbook>`);
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${
    sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
  }<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`);
  sheets.forEach((s, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows, boldHeader)));
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE' });
}

// ─── CSV / TSV ───────────────────────────────────────────────────

/** Guess the separator from the first line: whichever of , ; tab | appears most outside quotes. */
function sniffDelimiter(text: string): string {
  const line = text.slice(0, text.search(/\r?\n/) === -1 ? undefined : text.search(/\r?\n/)).replace(/"[^"]*"/g, '');
  const counts = [',', ';', '\t', '|'].map((d) => [d, line.split(d).length - 1] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ',';
}

/** RFC 4180: quoted fields may hold separators, doubled quotes and newlines. */
export function parseDelimited(text: string, delimiter?: string): string[][] {
  const src = text.replace(/^\uFEFF/, '');
  const d = delimiter ?? sniffDelimiter(src);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === d) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const cellText = (v: Cell) => (v === null ? '' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v));

export function toDelimited(rows: Cell[][], delimiter: string): string {
  return rows.map((row) => row.map((v) => {
    const s = cellText(v);
    return /["\r\n]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(delimiter)).join('\r\n');
}

// ─── JSON ────────────────────────────────────────────────────────

/** Nested objects become dotted columns ("address.city"); arrays of scalars are joined. */
function flatten(value: unknown, prefix: string, out: Record<string, Cell>): void {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0 && prefix) out[prefix] = '';
    for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (Array.isArray(value)) {
    out[prefix] = value.every((v) => v === null || typeof v !== 'object')
      ? value.map((v) => cellText(v as Cell)).join(', ')
      : JSON.stringify(value);
  } else {
    out[prefix || 'value'] = value === undefined ? null : (value as Cell);
  }
}

/** Find the list of records in whatever shape the JSON arrived in. */
export function jsonToSheets(text: string, fallbackName: string): Sheet[] {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch (err) {
    throw new Error(`That file is not valid JSON: ${(err as Error).message}`, { cause: err });
  }

  const toRows = (list: unknown[]): Cell[][] => {
    if (list.every(Array.isArray)) return (list as unknown[][]).map((r) => r.map((v) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : (v as Cell))));
    const records = list.map((item) => { const o: Record<string, Cell> = {}; flatten(item, '', o); return o; });
    const headers: string[] = [];
    const seen = new Set<string>();
    records.forEach((r) => Object.keys(r).forEach((k) => { if (!seen.has(k)) { seen.add(k); headers.push(k); } }));
    return [headers, ...records.map((r) => headers.map((h) => r[h] ?? null))];
  };

  if (Array.isArray(data)) return [{ name: fallbackName, rows: toRows(data) }];
  if (data && typeof data === 'object') {
    const arrays = Object.entries(data as Record<string, unknown>).filter(([, v]) => Array.isArray(v) && (v as unknown[]).length > 0);
    // { "users": [...], "orders": [...] } → one sheet per list.
    if (arrays.length > 0) return arrays.map(([k, v]) => ({ name: k, rows: toRows(v as unknown[]) }));
    return [{ name: fallbackName, rows: toRows([data]) }];
  }
  return [{ name: fallbackName, rows: [['value'], [data as Cell]] }];
}

export function sheetsToJson(sheets: Sheet[], headerRow: boolean): string {
  const convert = (rows: Cell[][]) => {
    const trimmed = rows.filter((r) => r.some((v) => v !== null && v !== ''));
    if (!headerRow) return trimmed;
    const [head = [], ...body] = trimmed;
    const keys = head.map((h, i) => (h === null || h === '' ? `column${i + 1}` : String(h)));
    return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? null])));
  };
  const value = sheets.length === 1 ? convert(sheets[0].rows) : Object.fromEntries(sheets.map((s) => [s.name, convert(s.rows)]));
  return JSON.stringify(value, null, 2);
}

// ─── PDF tables ──────────────────────────────────────────────────

interface TextBit { x: number; y: number; w: number; h: number; str: string }

/**
 * Rebuild rows and columns from positioned text. A PDF has no table
 * structure, only glyph runs at coordinates, so rows are runs that share a
 * baseline and columns are the x positions that recur down the page.
 */
function layoutToRows(bits: TextBit[]): string[][] {
  if (bits.length === 0) return [];
  const lineGap = Math.max(2, median(bits.map((b) => b.h)) * 0.5);
  const sorted = [...bits].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: TextBit[][] = [];
  for (const bit of sorted) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(line[0].y - bit.y) <= lineGap) line.push(bit);
    else lines.push([bit]);
  }

  // Within a line, runs closer than about one space are the same cell.
  const cellLines = lines.map((line) => {
    line.sort((a, b) => a.x - b.x);
    const cells: { x: number; text: string; end: number }[] = [];
    for (const bit of line) {
      const last = cells[cells.length - 1];
      const space = bit.h * 0.35;
      if (last && bit.x - last.end < space * 2.2) {
        last.text += (bit.x - last.end > space * 0.6 ? ' ' : '') + bit.str;
        last.end = bit.x + bit.w;
      } else cells.push({ x: bit.x, text: bit.str, end: bit.x + bit.w });
    }
    return cells;
  });

  // Column anchors: cluster the left edges of every cell on the page.
  const edges = cellLines.flat().map((c) => c.x).sort((a, b) => a - b);
  const anchors: number[] = [];
  const tolerance = Math.max(4, median(bits.map((b) => b.h)) * 0.8);
  for (const x of edges) {
    if (anchors.length && x - anchors[anchors.length - 1] <= tolerance) continue;
    anchors.push(x);
  }

  return cellLines.map((cells) => {
    const row: string[] = [];
    for (const cell of cells) {
      let col = 0;
      for (let i = 0; i < anchors.length; i += 1) if (anchors[i] <= cell.x + tolerance) col = i;
      row[col] = row[col] ? `${row[col]} ${cell.text}` : cell.text;
    }
    return Array.from(row, (v) => v ?? '');
  });
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/** Drop columns that are empty on every row — left-over anchors from stray text. */
function pruneEmptyColumns(rows: string[][]): string[][] {
  const width = Math.max(0, ...rows.map((r) => r.length));
  const keep = Array.from({ length: width }, (_, c) => rows.some((r) => (r[c] ?? '').trim() !== ''));
  return rows.map((r) => keep.flatMap((k, c) => (k ? [r[c] ?? ''] : [])));
}

export async function pdfToSheets(
  file: File,
  layout: SheetOptions['pdfLayout'],
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<Sheet[]> {
  const { getPdfjs } = await import('../../pdf/PdfShared');
  const pdfjs = await getPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let doc;
  try {
    doc = await task.promise;
  } catch {
    throw new Error(`“${file.name}” could not be opened. It may be damaged or password-protected.`);
  }
  const pages: Sheet[] = [];
  let anyText = false;
  for (let p = 1; p <= doc.numPages; p += 1) {
    if (signal.aborted) throw new Error('Conversion cancelled.');
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const bits: TextBit[] = [];
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const [a, b, , , e, f] = item.transform as number[];
      bits.push({ x: e, y: f, w: item.width, h: Math.hypot(a, b) || item.height || 10, str: item.str });
    }
    if (bits.length) anyText = true;
    pages.push({ name: `Page ${p}`, rows: pruneEmptyColumns(layoutToRows(bits)) });
    onProgress((p / doc.numPages) * 90);
  }
  await task.destroy();
  if (!anyText) {
    throw new Error('This PDF has no selectable text — it is probably a scan. Run it through PDF OCR first, then convert the result.');
  }
  if (layout === 'single') {
    const rows: Cell[][] = [];
    pages.forEach((pg, i) => { if (i > 0) rows.push([]); rows.push(...pg.rows); });
    return [{ name: 'Tables', rows }];
  }
  return pages.filter((pg) => pg.rows.length > 0);
}

// ─── Dispatcher ──────────────────────────────────────────────────

export interface SheetOutput { blob: Blob; ext: string }

async function readSheets(file: File, from: ConvFormat, opts: SheetOptions, onProgress: (p: number) => void, signal: AbortSignal): Promise<Sheet[]> {
  const base = file.name.replace(/\.[^.]+$/, '') || 'Sheet1';
  if (from === 'xlsx') {
    const all = await readXlsx(file);
    return opts.sheets === 'all' ? all : all.slice(0, 1);
  }
  if (from === 'xls' || from === 'ods') {
    const all = await readWithSheetJs(file);
    return opts.sheets === 'all' ? all : all.slice(0, 1);
  }
  if (from === 'pdf') return pdfToSheets(file, opts.pdfLayout, onProgress, signal);
  const text = await file.text();
  if (from === 'json') return jsonToSheets(text, base);
  return [{ name: base, rows: parseDelimited(text, from === 'tsv' ? '\t' : undefined) }];
}

/**
 * Convert between XLSX, CSV, TSV, JSON — and PDF tables into any of them.
 * CSV and TSV hold one sheet, so a multi-sheet export returns several files.
 */
export async function convertSheet(
  file: File,
  from: ConvFormat,
  to: ConvFormat,
  opts: SheetOptions,
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<{ name: string; blob: Blob }[]> {
  const sheets = await readSheets(file, from, opts, onProgress, signal);
  if (sheets.every((s) => s.rows.length === 0)) throw new Error(`“${file.name}” contains no data to convert.`);
  onProgress(92);

  if (to === 'xlsx') return [{ name: '', blob: await writeXlsx(sheets, { boldHeader: from !== 'pdf' }) }];
  if (to === 'json') return [{ name: '', blob: new Blob([sheetsToJson(sheets, opts.headerRow)], { type: 'application/json' }) }];
  if (to === 'csv' || to === 'tsv') {
    const d = to === 'tsv' ? '\t' : opts.delimiter;
    // A UTF-8 byte-order mark is what makes Excel open accented text correctly.
    const make = (s: Sheet) => new Blob(['\uFEFF', toDelimited(s.rows, d)], { type: to === 'tsv' ? 'text/tab-separated-values' : 'text/csv' });
    if (sheets.length === 1) return [{ name: '', blob: make(sheets[0]) }];
    return sheets.map((s) => ({ name: s.name, blob: make(s) }));
  }
  if (to === 'xml') return [{ name: '', blob: new Blob([sheetsToXml(sheets)], { type: 'application/xml' }) }];
  if (to === 'sql') return [{ name: '', blob: new Blob([sheetsToSql(sheets, opts.sqlDialect)], { type: 'application/sql' }) }];
  if (to === 'html') return [{ name: '', blob: new Blob([sheetsToHtml(sheets, file.name.replace(/\.[^.]+$/, ''))], { type: 'text/html;charset=utf-8' }) }];
  if (to === 'pdf') return [{ name: '', blob: await sheetsToPdf(sheets, file.name.replace(/\.[^.]+$/, '')) }];
  throw new Error(`Spreadsheets cannot be converted to ${to.toUpperCase()}.`);
}

// ─── Legacy XLS and OpenDocument, via SheetJS ────────────────────

/**
 * The binary Excel 97–2003 format is a compound-file container of BIFF
 * records — decades of edge cases that SheetJS already handles. It is loaded
 * only when one of these files is actually dropped.
 */
async function readWithSheetJs(file: File): Promise<Sheet[]> {
  const XLSX = await import('xlsx');
  let wb;
  try {
    wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: true, dense: true });
  } catch (err) {
    throw new Error(`“${file.name}” could not be read as a spreadsheet. It may be damaged or password-protected.`, { cause: err });
  }
  return wb.SheetNames.map((name) => {
    const raw = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: true, defval: null, blankrows: true });
    const rows: Cell[][] = raw.map((row) => row.map((v) => {
      if (v instanceof Date) {
        const iso = v.toISOString();
        return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso.slice(0, 19).replace('T', ' ');
      }
      return v === undefined ? null : (v as Cell);
    }));
    return { name, rows };
  });
}

// ─── Rows → XML ──────────────────────────────────────────────────

function xmlName(raw: string, i: number): string {
  let n = raw.trim().replace(/[^A-Za-z0-9_.-]+/g, '_');
  if (!n) n = `column${i + 1}`;
  if (!/^[A-Za-z_]/.test(n)) n = `_${n}`;
  return n;
}

const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** First row names the fields; every later row becomes a <row> record. */
export function sheetsToXml(sheets: Sheet[]): string {
  const body = sheets.map((sheet) => {
    const [head = [], ...rows] = sheet.rows.filter((r) => r.some((v) => v !== null && v !== ''));
    const names = head.map((h, i) => xmlName(h === null ? '' : String(h), i));
    const records = rows.map((r) => `    <row>\n${names.map((n, i) => {
      const v = r[i];
      return v === null || v === undefined || v === '' ? `      <${n}/>` : `      <${n}>${xmlEsc(String(v))}</${n}>`;
    }).join('\n')}\n    </row>`).join('\n');
    return `  <sheet name="${xmlEsc(sheet.name).replace(/"/g, '&quot;')}">\n${records}\n  </sheet>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<workbook>\n${body}\n</workbook>\n`;
}

// ─── Rows → PDF table ────────────────────────────────────────────

/**
 * A printable table: header row repeated on every page, columns sized by
 * content, landscape when the sheet is wide. pdf-lib's built-in Helvetica
 * covers Western European text; characters outside it print as "?", which is
 * stated on the page rather than failing the whole export.
 */
export async function sheetsToPdf(sheets: Sheet[], title: string): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ok = new Map<string, boolean>();
  const clean = (text: string) => Array.from(text.replace(/[\r\n\t]+/g, ' ')).map((ch) => {
    if (!ok.has(ch)) {
      try { font.widthOfTextAtSize(ch, 9); ok.set(ch, true); } catch { ok.set(ch, false); }
    }
    return ok.get(ch) ? ch : '?';
  }).join('');

  const SIZE = 8.5;
  const PAD = 4;
  const ROW_H = SIZE + PAD * 2;
  const MARGIN = 36;

  for (const sheet of sheets) {
    const rows = sheet.rows.filter((r) => r.some((v) => v !== null && v !== ''));
    if (rows.length === 0) continue;
    const cols = Math.max(...rows.map((r) => r.length));
    const text = rows.map((r) => Array.from({ length: cols }, (_, c) => clean(cellText(r[c] ?? null))));

    const landscape = cols > 6;
    const [pw, ph] = landscape ? [841.89, 595.28] : [595.28, 841.89];
    const usable = pw - MARGIN * 2;
    // Width ∝ longest cell (sampled), clamped so one long column cannot starve the rest.
    const want = Array.from({ length: cols }, (_, c) => {
      let w = 0;
      for (let r = 0; r < Math.min(text.length, 300); r += 1) w = Math.max(w, (r === 0 ? bold : font).widthOfTextAtSize(text[r][c], SIZE));
      return Math.min(Math.max(w + PAD * 2, 28), usable * 0.45);
    });
    const scale = Math.min(1, usable / want.reduce((a, b) => a + b, 0));
    const widths = want.map((w) => w * scale);
    const tableWidth = widths.reduce((a, b) => a + b, 0);

    const fit = (s: string, f: typeof font, w: number) => {
      if (f.widthOfTextAtSize(s, SIZE) <= w - PAD * 2) return s;
      let t = s;
      while (t.length > 1 && f.widthOfTextAtSize(`${t}…`, SIZE) > w - PAD * 2) t = t.slice(0, -1);
      return `${t}…`;
    };

    const header = text[0];
    let body = text.slice(1);
    let pageNo = 0;
    const perPage = Math.floor((ph - MARGIN * 2 - 24 - ROW_H) / ROW_H);
    do {
      pageNo += 1;
      const page = doc.addPage([pw, ph]);
      let y = ph - MARGIN;
      page.drawText(clean(sheets.length > 1 ? `${title} · ${sheet.name}` : title), { x: MARGIN, y: y - 10, size: 11, font: bold, color: rgb(0.1, 0.1, 0.15) });
      y -= 24;
      const drawRow = (cells: string[], f: typeof font, fill?: [number, number, number]) => {
        if (fill) page.drawRectangle({ x: MARGIN, y: y - ROW_H, width: tableWidth, height: ROW_H, color: rgb(...fill) });
        let x = MARGIN;
        cells.forEach((cell, c) => {
          page.drawText(fit(cell, f, widths[c]), { x: x + PAD, y: y - ROW_H + PAD + 1, size: SIZE, font: f, color: rgb(0.12, 0.12, 0.16) });
          x += widths[c];
        });
        page.drawLine({ start: { x: MARGIN, y: y - ROW_H }, end: { x: MARGIN + tableWidth, y: y - ROW_H }, thickness: 0.4, color: rgb(0.82, 0.83, 0.86) });
        y -= ROW_H;
      };
      drawRow(header, bold, [0.93, 0.94, 0.97]);
      body.slice(0, perPage).forEach((r, i) => drawRow(r, font, i % 2 ? [0.975, 0.978, 0.985] : undefined));
      body = body.slice(perPage);
      page.drawText(`${pageNo}`, { x: pw - MARGIN - 10, y: MARGIN / 2, size: 8, font, color: rgb(0.5, 0.5, 0.55) });
    } while (body.length > 0);
  }
  if (doc.getPageCount() === 0) throw new Error('There is no data to put in the PDF.');
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

// ─── Rows → SQL ──────────────────────────────────────────────────

type SqlType = 'INTEGER' | 'REAL' | 'DATE' | 'BOOLEAN' | 'TEXT';

/** The narrowest type every non-empty value in a column fits. Leading zeros keep a column TEXT. */
function columnType(values: Cell[]): SqlType {
  const present = values.filter((v) => v !== null && v !== '');
  if (present.length === 0) return 'TEXT';
  if (present.every((v) => typeof v === 'boolean' || /^(true|false)$/i.test(String(v)))) return 'BOOLEAN';
  if (present.every((v) => typeof v === 'number' ? Number.isInteger(v) : /^-?(0|[1-9]\d{0,17})$/.test(String(v)))) return 'INTEGER';
  if (present.every((v) => typeof v === 'number' || /^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/.test(String(v)))) return 'REAL';
  if (present.every((v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v)))) return 'DATE';
  return 'TEXT';
}

export function sheetsToSql(sheets: Sheet[], dialect: SheetOptions['sqlDialect']): string {
  const q = (name: string) => (dialect === 'mysql' ? `\`${name.replace(/`/g, '``')}\`` : `"${name.replace(/"/g, '""')}"`);
  const lit = (v: Cell, type: SqlType): string => {
    if (v === null || v === '') return 'NULL';
    if (type === 'INTEGER' || type === 'REAL') return String(v);
    if (type === 'BOOLEAN') return /^true$/i.test(String(v)) || v === true ? 'TRUE' : 'FALSE';
    return `'${String(v).replace(/'/g, "''")}'`;
  };
  const used = new Set<string>();
  const out: string[] = [`-- Generated by NextTool. ${dialect === 'mysql' ? 'MySQL / MariaDB' : 'PostgreSQL, SQLite and SQL Server'} syntax.`];
  for (const sheet of sheets) {
    const rows = sheet.rows.filter((r) => r.some((v) => v !== null && v !== ''));
    if (rows.length === 0) continue;
    const [head, ...body] = rows;
    const width = Math.max(...rows.map((r) => r.length));
    const seen = new Set<string>();
    const cols = Array.from({ length: width }, (_, i) => {
      let name = String(head[i] ?? '').trim().replace(/\s+/g, '_').replace(/[^\w]/g, '').toLowerCase() || `column_${i + 1}`;
      if (/^\d/.test(name)) name = `c_${name}`;
      let unique = name;
      for (let k = 2; seen.has(unique); k += 1) unique = `${name}_${k}`;
      seen.add(unique);
      return unique;
    });
    const types = cols.map((_, i) => columnType(body.map((r) => r[i] ?? null)));
    let table = sheet.name.trim().replace(/\s+/g, '_').replace(/[^\w]/g, '').toLowerCase() || 'data';
    if (/^\d/.test(table)) table = `t_${table}`;
    for (let k = 2; used.has(table); k += 1) table = `${table}_${k}`;
    used.add(table);

    out.push('', `CREATE TABLE ${q(table)} (`, cols.map((c, i) => `  ${q(c)} ${types[i]}`).join(',\n'), ');');
    // Batches of 500 rows stay under every server's default statement size limit.
    for (let start = 0; start < body.length; start += 500) {
      const chunk = body.slice(start, start + 500);
      out.push(`INSERT INTO ${q(table)} (${cols.map(q).join(', ')}) VALUES`);
      out.push(chunk.map((r) => `  (${cols.map((_, i) => lit(r[i] ?? null, types[i])).join(', ')})`).join(',\n') + ';');
    }
  }
  return out.join('\n') + '\n';
}

// ─── Rows → HTML table ───────────────────────────────────────────

export function sheetsToHtml(sheets: Sheet[], title: string): string {
  const e = (v: Cell) => cellText(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const tables = sheets.map((sheet) => {
    const rows = sheet.rows.filter((r) => r.some((v) => v !== null && v !== ''));
    if (rows.length === 0) return '';
    const width = Math.max(...rows.map((r) => r.length));
    const [head, ...body] = rows;
    const cells = (r: Cell[], tag: 'th' | 'td') => Array.from({ length: width }, (_, i) => {
      const v = r[i] ?? null;
      return `<${tag}${tag === 'td' && typeof v === 'number' ? ' class="n"' : ''}>${e(v)}</${tag}>`;
    }).join('');
    return `${sheets.length > 1 ? `<h2>${e(sheet.name)}</h2>\n` : ''}<table>\n<thead><tr>${cells(head, 'th')}</tr></thead>\n<tbody>\n${body.map((r) => `<tr>${cells(r, 'td')}</tr>`).join('\n')}\n</tbody>\n</table>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title>
<style>body{font:14px/1.45 system-ui,sans-serif;margin:2rem;color:#1f2328}table{border-collapse:collapse;margin-bottom:2rem}th,td{border:1px solid #d0d7de;padding:.35rem .6rem;text-align:left;vertical-align:top}thead th{background:#f6f8fa;position:sticky;top:0}tbody tr:nth-child(even){background:#fafbfc}td.n{text-align:right;font-variant-numeric:tabular-nums}</style>
</head><body>
<h1>${e(title)}</h1>
${tables}
</body></html>
`;
}
