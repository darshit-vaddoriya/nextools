/**
 * DOCUMENT ENGINE
 *
 * - Images → PPTX and PDF → PPTX, one picture per slide, via pptxgenjs.
 *   A PDF page becomes an image, so its text also goes into the speaker
 *   notes: the deck stays searchable and the words are one copy away.
 * - EPUB → PDF / TXT / HTML. An EPUB is a ZIP of XHTML chapters in a reading
 *   order (the spine); each chapter is read in that order.
 * - SVG → PDF as real vectors with svg2pdf, so the PDF stays sharp at any zoom.
 */
import JSZip from 'jszip';
import type { ConvFormat } from '../../../config/converters';
import type { RunContext } from '../../../lib/useConversion';
import { yieldToUi } from './yield';
import { convertImage, DEFAULT_IMAGE_OPTIONS } from './image';
import { renderPageForExport } from './pdf';

export interface DeckOptions {
  /** Slide shape: widescreen, classic, or taken from the first image/page. */
  layout: '16x9' | '4x3' | 'match';
  background: 'white' | 'black';
}

export const DEFAULT_DECK_OPTIONS: DeckOptions = { layout: '16x9', background: 'white' };


function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(blob);
  });
}

interface SlideImage { data: string; width: number; height: number; notes?: string }

async function buildDeck(images: SlideImage[], opts: DeckOptions, title: string): Promise<Blob> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.title = title;

  // Slide size in inches. PowerPoint's widescreen default is 13.333 × 7.5.
  let W = 13.333;
  let H = 7.5;
  if (opts.layout === '4x3') { W = 10; H = 7.5; }
  if (opts.layout === 'match' && images[0]) {
    const ratio = images[0].height / images[0].width;
    W = 10;
    H = Math.min(56, Math.max(1, 10 * ratio));
  }
  pptx.defineLayout({ name: 'NT', width: W, height: H });
  pptx.layout = 'NT';

  for (const img of images) {
    const slide = pptx.addSlide();
    slide.background = { color: opts.background === 'black' ? '000000' : 'FFFFFF' };
    // Contain: the whole picture visible, centred, never stretched.
    const scale = Math.min(W / img.width, H / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    slide.addImage({ data: img.data, x: (W - w) / 2, y: (H - h) / 2, w, h });
    if (img.notes) slide.addNotes(img.notes);
  }
  const out = await pptx.write({ outputType: 'blob' });
  return out as Blob;
}

/** Many images → one deck, in the order they were added. */
export async function imagesToPptx(
  files: File[],
  formats: ConvFormat[],
  opts: DeckOptions,
  ctx: RunContext,
): Promise<Blob> {
  const slides: SlideImage[] = [];
  for (let i = 0; i < files.length; i += 1) {
    if (ctx.signal.aborted) throw new Error('Conversion cancelled.');
    const file = files[i];
    const from = formats[i];
    // PowerPoint embeds JPG and PNG as-is; everything else is converted first.
    const blob = from === 'jpg' || from === 'png'
      ? file
      : await convertImage(file, from, from === 'gif' || from === 'svg' || from === 'psd' ? 'png' : 'jpg', { ...DEFAULT_IMAGE_OPTIONS, quality: 0.92 });
    const bitmap = await createImageBitmap(blob);
    slides.push({ data: await blobToDataUrl(blob), width: bitmap.width, height: bitmap.height });
    bitmap.close();
    ctx.onProgress(((i + 1) / files.length) * 85);
    await yieldToUi();
  }
  return buildDeck(slides, opts, 'Slides');
}

/** Each PDF page → one slide image, with the page's text as speaker notes. */
export async function pdfToPptx(file: File, opts: DeckOptions, ctx: RunContext): Promise<Blob> {
  const { getPdfjs } = await import('../../pdf/PdfShared');
  const pdfjs = await getPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let doc;
  try {
    doc = await task.promise;
  } catch {
    throw new Error(`“${file.name}” could not be opened. It may be damaged or password-protected.`);
  }
  const slides: SlideImage[] = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    if (ctx.signal.aborted) throw new Error('Conversion cancelled.');
    const page = await doc.getPage(p);
    // 2× gives ~1600 px wide slides: sharp on a projector without bloating the deck.
    const canvas = await renderPageForExport(page, 2);
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const g = flat.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, flat.width, flat.height);
    g.drawImage(canvas, 0, 0);
    const text = (await page.getTextContent()).items
      .map((it) => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : ''))
      .join('').replace(/[ \t]+\n/g, '\n').trim();
    slides.push({ data: flat.toDataURL('image/jpeg', 0.88), width: flat.width, height: flat.height, notes: text || undefined });
    canvas.width = 0;
    flat.width = 0;
    ctx.onProgress((p / doc.numPages) * 85);
    await yieldToUi();
  }
  await task.destroy();
  // Slides always take the page's own shape, so nothing is cropped or letterboxed.
  return buildDeck(slides, { ...opts, layout: 'match' }, file.name.replace(/\.[^.]+$/, ''));
}

// ─── EPUB ────────────────────────────────────────────────────────

interface Chapter { href: string; doc: Document }
interface Book { title: string; author: string; chapters: Chapter[]; zip: JSZip }

const dirOf = (path: string) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '');

/** Resolve "../images/a.jpg" against "OEBPS/text/ch1.xhtml". */
function resolvePath(base: string, rel: string): string {
  const parts = (dirOf(base) + decodeURIComponent(rel.split('#')[0])).split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (part === '..') out.pop();
    else if (part && part !== '.') out.push(part);
  }
  return out.join('/');
}

async function readEpub(file: File): Promise<Book> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(`“${file.name}” is not a readable EPUB file.`);
  }
  if (zip.file('META-INF/encryption.xml') && /EncryptedData/.test(await zip.file('META-INF/encryption.xml')!.async('string'))) {
    const enc = await zip.file('META-INF/encryption.xml')!.async('string');
    // Font obfuscation also lives here and is harmless; DRM encrypts content documents.
    if (/\.x?html/i.test(enc)) {
      throw new Error('This e-book is protected with DRM, so its text is encrypted and cannot be converted. DRM-free EPUBs convert normally.');
    }
  }
  const parse = (xml: string, type: DOMParserSupportedType = 'application/xml') => new DOMParser().parseFromString(xml, type);
  const container = zip.file('META-INF/container.xml');
  if (!container) throw new Error('This EPUB is missing its container file, so its chapters cannot be found.');
  const opfPath = parse(await container.async('string')).getElementsByTagNameNS('*', 'rootfile')[0]?.getAttribute('full-path');
  if (!opfPath || !zip.file(opfPath)) throw new Error('This EPUB has no package document.');
  const opf = parse(await zip.file(opfPath)!.async('string'));
  const byTag = (tag: string) => Array.from(opf.getElementsByTagNameNS('*', tag));

  const manifest = new Map(byTag('item').map((it) => [it.getAttribute('id'), { href: it.getAttribute('href') ?? '', type: it.getAttribute('media-type') ?? '' }]));
  const chapters: Chapter[] = [];
  for (const ref of byTag('itemref')) {
    const item = manifest.get(ref.getAttribute('idref'));
    if (!item || !/html/.test(item.type)) continue;
    const href = resolvePath(opfPath, item.href);
    const entry = zip.file(href);
    if (!entry) continue;
    const raw = await entry.async('string');
    let doc = parse(raw, 'application/xhtml+xml');
    if (doc.getElementsByTagName('parsererror').length) doc = parse(raw, 'text/html');
    chapters.push({ href, doc });
  }
  if (chapters.length === 0) throw new Error('No readable chapters were found in this EPUB.');
  return {
    title: byTag('title')[0]?.textContent?.trim() || file.name.replace(/\.[^.]+$/, ''),
    author: byTag('creator')[0]?.textContent?.trim() || '',
    chapters,
    zip,
  };
}

const BLOCK_TAGS = new Set(['p', 'div', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'pre', 'tr', 'br', 'hr', 'figure', 'figcaption', 'dt', 'dd']);

/** Text with paragraph breaks, which textContent alone loses. */
function textOf(node: Node): string {
  let out = '';
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) { out += (n.nodeValue ?? '').replace(/\s+/g, ' '); return; }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (n as Element).localName.toLowerCase();
    if (tag === 'script' || tag === 'style') return;
    const block = BLOCK_TAGS.has(tag);
    if (block) out += '\n';
    n.childNodes.forEach(walk);
    if (block) out += '\n';
  };
  walk(node);
  return out.split('\n').map((l) => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const bodyOf = (doc: Document) => doc.body ?? doc.getElementsByTagNameNS('*', 'body')[0] ?? doc.documentElement;

async function epubToHtml(book: Book): Promise<string> {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const parts: string[] = [];
  for (const ch of book.chapters) {
    const body = bodyOf(ch.doc).cloneNode(true) as Element;
    body.querySelectorAll('script, link, style').forEach((el) => el.remove());
    // Inline pictures as data URLs so the single HTML file is self-contained.
    for (const img of Array.from(body.querySelectorAll('img, image'))) {
      const attr = img.hasAttribute('src') ? 'src' : img.getAttribute('href') ? 'href' : 'xlink:href';
      const src = img.getAttribute(attr) ?? img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (!src || /^data:/.test(src)) continue;
      const entry = book.zip.file(resolvePath(ch.href, src));
      if (!entry) continue;
      const bytes = await entry.async('base64');
      const ext = src.split('.').pop()?.toLowerCase() ?? 'png';
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      img.setAttribute(attr === 'xlink:href' ? 'href' : attr, `data:${mime};base64,${bytes}`);
    }
    parts.push(`<section class="chapter">${body.innerHTML}</section>`);
  }
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(book.title)}</title>
<style>body{max-width:42rem;margin:2rem auto;padding:0 1rem;font:1.05rem/1.65 Georgia,serif;color:#1f2328}
img,svg{max-width:100%;height:auto}.chapter{margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #ddd}
h1,h2,h3{font-family:system-ui,sans-serif;line-height:1.25}</style></head>
<body><header><h1>${esc(book.title)}</h1>${book.author ? `<p><em>${esc(book.author)}</em></p>` : ''}</header>
${parts.join('\n')}
</body></html>`;
}

async function epubToPdf(book: Book, ctx: RunContext): Promise<Blob> {
  const [{ parseBlocks }, { renderBlocksToPdf }, { PDFDocument, StandardFonts }] = await Promise.all([
    import('../../../lib/richText'), import('../../../lib/renderBlocksToPdf'), import('pdf-lib'),
  ]);
  // The PDF uses the standard Helvetica set; characters it cannot encode become "?".
  const probe = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
  const cache = new Map<string, string>();
  let replaced = 0;
  let total = 0;
  const safe = (text: string) => Array.from(text).map((ch) => {
    total += 1;
    if (!cache.has(ch)) {
      try { probe.encodeText(ch); cache.set(ch, ch); } catch { cache.set(ch, '?'); }
    }
    const out = cache.get(ch)!;
    if (out !== ch) replaced += 1;
    return out;
  }).join('');

  const blocks: ReturnType<typeof parseBlocks> = [
    { type: 'h1', align: 'center', runs: [{ text: safe(book.title), bold: true }] },
    ...(book.author ? [{ type: 'p' as const, align: 'center' as const, runs: [{ text: safe(book.author), italic: true }] }] : []),
  ];
  const host = document.createElement('div');
  book.chapters.forEach((ch, i) => {
    host.innerHTML = '';
    host.append(document.importNode(bodyOf(ch.doc), true));
    host.querySelectorAll('h3, h4, h5, h6').forEach((h) => { const p = document.createElement('h2'); p.innerHTML = h.innerHTML; h.replaceWith(p); });
    for (const block of parseBlocks(host)) {
      block.runs = block.runs.map((r) => ({ ...r, text: safe(r.text) }));
      blocks.push(block);
    }
    ctx.onProgress(((i + 1) / book.chapters.length) * 60);
  });
  if (total > 200 && replaced / total > 0.2) {
    throw new Error('This book is mostly in a script the PDF fonts here cannot print (for example Hindi, Arabic or Chinese). Convert it to HTML instead, then print that page to PDF from your browser.');
  }
  const bytes = await renderBlocksToPdf(blocks, { width: 432, height: 648, margin: 50, onProgress: (p) => ctx.onProgress(60 + p * 0.38) });
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}

export async function convertEpub(file: File, to: ConvFormat, ctx: RunContext): Promise<Blob> {
  const book = await readEpub(file);
  ctx.onProgress(10);
  if (to === 'txt') {
    const text = [book.title, book.author, ...book.chapters.map((c) => textOf(bodyOf(c.doc)))].filter(Boolean).join('\n\n');
    return new Blob([text.trim() + '\n'], { type: 'text/plain;charset=utf-8' });
  }
  if (to === 'html') return new Blob([await epubToHtml(book)], { type: 'text/html;charset=utf-8' });
  if (to === 'pdf') return epubToPdf(book, ctx);
  throw new Error(`EPUB cannot be converted to ${to.toUpperCase()} here.`);
}

// ─── SVG → vector PDF ────────────────────────────────────────────

export async function svgToPdf(file: File): Promise<Blob> {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const svg = new DOMParser().parseFromString(await file.text(), 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') throw new Error(`“${file.name}” is not a valid SVG file.`);
  const vb = (svg.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  const num = (v: string | null) => (v && !v.endsWith('%') ? parseFloat(v) : NaN);
  let w = num(svg.getAttribute('width'));
  let h = num(svg.getAttribute('height'));
  if (!(w > 0) || !(h > 0)) { w = vb[2] > 0 ? vb[2] : 800; h = vb[3] > 0 ? vb[3] : 600; }
  // CSS pixels → PDF points.
  const pw = w * 0.75;
  const ph = h * 0.75;
  const pdf = new jsPDF({ unit: 'pt', format: [pw, ph], orientation: pw > ph ? 'landscape' : 'portrait' });
  // svg2pdf measures text and resolves styles, which needs the element in the document.
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-99999px;top:0;visibility:hidden';
  host.append(svg);
  document.body.append(host);
  try {
    await svg2pdf(svg, pdf, { x: 0, y: 0, width: pw, height: ph });
  } finally {
    host.remove();
  }
  return pdf.output('blob');
}

// ─── Markdown / TXT / HTML → EPUB ────────────────────────────────

const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Source text → an HTML body, whatever the input format. */
async function sourceToBody(file: File, from: ConvFormat): Promise<HTMLElement> {
  const text = (await file.text()).replace(/^\uFEFF/, '');
  let html: string;
  if (from === 'md') {
    const { marked } = await import('marked');
    html = await marked.parse(text, { gfm: true });
  } else if (from === 'txt') {
    // Blank lines separate paragraphs; single line breaks are kept inside a paragraph.
    html = text.replace(/\r\n?/g, '\n').split(/\n{2,}/).filter((p) => p.trim())
      .map((p) => `<p>${xmlEsc(p.trim()).replace(/\n/g, '<br/>')}</p>`).join('\n');
  } else {
    html = text;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Images are dropped: a source file's relative paths cannot be resolved, and an EPUB may only
  // reference resources listed in its own manifest.
  doc.body.querySelectorAll('script, style, link, iframe, object, embed, form, img, picture, video, audio').forEach((el) => el.remove());
  return doc.body;
}

interface EpubChapter { title: string; xhtml: string }

/**
 * Split at <h1>, or at <h2> when a document has no h1 (a Markdown file often
 * starts at "##"). Each part becomes one chapter file, serialised as XHTML,
 * which EPUB requires and HTML parsers do not produce on their own.
 */
function splitChapters(body: HTMLElement, fallbackTitle: string): EpubChapter[] {
  const level = body.querySelector('h1') ? 'H1' : body.querySelector('h2') ? 'H2' : null;
  const groups: { title: string; nodes: Node[] }[] = [];
  let current: { title: string; nodes: Node[] } = { title: fallbackTitle, nodes: [] };
  for (const node of Array.from(body.childNodes)) {
    if (level && node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === level) {
      if (current.nodes.some((n) => (n.textContent ?? '').trim())) groups.push(current);
      current = { title: (node.textContent ?? '').trim() || fallbackTitle, nodes: [] };
    }
    current.nodes.push(node);
  }
  if (current.nodes.some((n) => (n.textContent ?? '').trim()) || groups.length === 0) groups.push(current);

  const serializer = new XMLSerializer();
  return groups.map((g) => {
    const wrapper = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'div', null).documentElement;
    g.nodes.forEach((n) => wrapper.appendChild(wrapper.ownerDocument.importNode(n, true)));
    // XMLSerializer on an XHTML-namespaced tree writes self-closing, well-formed markup.
    const inner = Array.from(wrapper.childNodes).map((n) => serializer.serializeToString(n))
      .join('').replace(/ xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"/g, '');
    return { title: g.title, xhtml: inner };
  });
}

export async function buildEpub(file: File, from: ConvFormat): Promise<Blob> {
  const base = file.name.replace(/\.[^.]+$/, '') || 'Book';
  const body = await sourceToBody(file, from);
  if (!(body.textContent ?? '').trim()) throw new Error(`“${file.name}” has no text to put in an e-book.`);
  const title = body.querySelector('h1')?.textContent?.trim() || base;
  const chapters = splitChapters(body, title);
  const id = `urn:uuid:${crypto.randomUUID()}`;
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const zip = new JSZip();
  // The mimetype entry must come first and be stored uncompressed, or readers reject the book.
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  zip.file('OEBPS/style.css', 'body{font-family:Georgia,serif;line-height:1.55;margin:0 5%}h1,h2,h3{font-family:sans-serif;line-height:1.25}pre,code{font-family:monospace;font-size:.9em}pre{white-space:pre-wrap}table{border-collapse:collapse}td,th{border:1px solid #999;padding:.2em .4em}blockquote{margin-left:1.5em;font-style:italic}img{max-width:100%}');

  chapters.forEach((ch, i) => {
    zip.file(`OEBPS/ch${i + 1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="UTF-8"/><title>${xmlEsc(ch.title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>${ch.xhtml}</body></html>`);
  });
  const navItems = chapters.map((ch, i) => `<li><a href="ch${i + 1}.xhtml">${xmlEsc(ch.title)}</a></li>`).join('');
  zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en"><head><meta charset="UTF-8"/><title>Contents</title></head>
<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${navItems}</ol></nav></body></html>`);
  // toc.ncx is EPUB 2's table of contents; older readers and some Kindle converters still use it.
  zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${id}"/></head><docTitle><text>${xmlEsc(title)}</text></docTitle><navMap>${
    chapters.map((ch, i) => `<navPoint id="n${i + 1}" playOrder="${i + 1}"><navLabel><text>${xmlEsc(ch.title)}</text></navLabel><content src="ch${i + 1}.xhtml"/></navPoint>`).join('')
  }</navMap></ncx>`);
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="en">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">${id}</dc:identifier><dc:title>${xmlEsc(title)}</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">${modified}</meta></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="css" href="style.css" media-type="text/css"/>${
    chapters.map((_, i) => `<item id="c${i + 1}" href="ch${i + 1}.xhtml" media-type="application/xhtml+xml"/>`).join('')
  }</manifest>
<spine toc="ncx">${chapters.map((_, i) => `<itemref idref="c${i + 1}"/>`).join('')}</spine>
</package>`);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip', compression: 'DEFLATE' });
}
