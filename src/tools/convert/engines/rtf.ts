/**
 * RTF → HTML / TXT / DOCX.
 *
 * RTF is plain text with control words (\b, \par, \'e9) and nested { }
 * groups. This reader keeps what a document is made of — paragraphs, line
 * breaks, tabs, bold, italic, underline, and every character in any code page
 * or as \u Unicode — and skips the destinations that are not body text: font
 * and colour tables, style sheets, document info, headers, footers, fields'
 * instructions and embedded pictures. Page layout and fonts are not kept.
 */
import type { ConvFormat } from '../../../config/converters';

interface State { b: boolean; i: boolean; u: boolean; skip: boolean; uc: number }

/** Destinations whose content is never body text. */
const SKIP = new Set([
  'fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'header', 'footer', 'headerl', 'headerr', 'headerf',
  'footerl', 'footerr', 'footerf', 'fldinst', 'listtable', 'listoverridetable', 'rsidtbl', 'generator',
  'themedata', 'colorschememapping', 'latentstyles', 'datastore', 'xmlnstbl', 'object', 'filetbl', 'revtbl',
  'pgdsctbl', 'bkmkstart', 'bkmkend', 'footnote', 'annotation', 'atnid', 'atnauthor', 'mmathPr',
]);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function rtfToHtml(rtf: string): { html: string; text: string } {
  if (!rtf.startsWith('{\\rtf')) throw new Error('This file is not an RTF document.');
  const codepage = Number(rtf.match(/\\ansicpg(\d+)/)?.[1] ?? 1252);
  let decoder: TextDecoder;
  try { decoder = new TextDecoder(`windows-${codepage}`); } catch { decoder = new TextDecoder('windows-1252'); }

  const paragraphs: { html: string; text: string }[] = [];
  let html = '';
  let text = '';
  let open = { b: false, i: false, u: false };
  const stack: State[] = [];
  let st: State = { b: false, i: false, u: false, skip: false, uc: 1 };
  let pendingBytes: number[] = [];
  let skipChars = 0;

  const closeTags = () => {
    if (open.u) html += '</u>';
    if (open.i) html += '</em>';
    if (open.b) html += '</strong>';
    open = { b: false, i: false, u: false };
  };
  /** Bring the open tags in line with the current state; closing all first keeps nesting valid. */
  const syncTags = () => {
    if (st.b === open.b && st.i === open.i && st.u === open.u) return;
    closeTags();
    if (st.b) html += '<strong>';
    if (st.i) html += '<em>';
    if (st.u) html += '<u>';
    open = { b: st.b, i: st.i, u: st.u };
  };
  const flushBytes = () => {
    if (!pendingBytes.length) return;
    const s = decoder.decode(new Uint8Array(pendingBytes));
    pendingBytes = [];
    emit(s);
  };
  const emit = (s: string) => {
    if (st.skip || !s) return;
    syncTags();
    html += esc(s);
    text += s;
  };
  const endParagraph = () => {
    flushBytes();
    closeTags();
    paragraphs.push({ html, text });
    html = '';
    text = '';
  };

  let i = 0;
  const n = rtf.length;
  let destinationNext = false;
  while (i < n) {
    const ch = rtf[i];
    if (ch === '{') {
      flushBytes();
      stack.push({ ...st });
      i += 1;
      continue;
    }
    if (ch === '}') {
      flushBytes();
      st = stack.pop() ?? st;
      i += 1;
      continue;
    }
    if (ch === '\\') {
      const next = rtf[i + 1];
      if (next === '\\' || next === '{' || next === '}') { flushBytes(); if (skipChars > 0) skipChars -= 1; else emit(next); i += 2; continue; }
      if (next === '*') { destinationNext = true; i += 2; continue; }
      if (next === "'") {
        const byte = parseInt(rtf.slice(i + 2, i + 4), 16);
        if (skipChars > 0) skipChars -= 1;
        else if (!Number.isNaN(byte)) pendingBytes.push(byte);
        i += 4;
        continue;
      }
      if (next === '~') { flushBytes(); emit('\u00a0'); i += 2; continue; }
      if (next === '-' || next === '_') { i += 2; continue; }
      if (next === '\n' || next === '\r') { endParagraph(); i += 2; continue; }
      const m = /^([a-zA-Z]{1,32})(-?\d{1,10})? ?/.exec(rtf.slice(i + 1, i + 50));
      if (!m) { i += 1; continue; }
      i += 1 + m[0].length;
      const word = m[1];
      const param = m[2] === undefined ? null : Number(m[2]);
      if (word !== 'u') flushBytes();
      // {\*\anything} is an optional destination readers may ignore; SKIP lists the known non-text ones.
      if (destinationNext || SKIP.has(word)) {
        destinationNext = false;
        st.skip = true;
        continue;
      }
      switch (word) {
        case 'par': case 'sect': case 'page': endParagraph(); break;
        case 'line': if (!st.skip) { syncTags(); html += '<br>'; text += '\n'; } break;
        case 'tab': emit('\t'); break;
        case 'cell': emit('\t'); break;
        case 'row': endParagraph(); break;
        case 'b': st.b = param !== 0; break;
        case 'i': st.i = param !== 0; break;
        case 'ul': st.u = param !== 0; break;
        case 'ulnone': st.u = false; break;
        case 'plain': st.b = false; st.i = false; st.u = false; break;
        case 'uc': st.uc = param ?? 1; break;
        case 'u': {
          flushBytes();
          const code = param! < 0 ? param! + 65536 : param!;
          emit(String.fromCharCode(code));
          skipChars = st.uc; // the fallback characters that follow \uN
          break;
        }
        case 'emdash': emit('—'); break;
        case 'endash': emit('–'); break;
        case 'bullet': emit('•'); break;
        case 'lquote': emit('‘'); break;
        case 'rquote': emit('’'); break;
        case 'ldblquote': emit('“'); break;
        case 'rdblquote': emit('”'); break;
        default: break; // formatting we do not keep: fonts, sizes, colours, spacing
      }
      continue;
    }
    if (ch === '\r' || ch === '\n') { i += 1; continue; }
    // Plain text: take the run up to the next special character in one go.
    let j = i;
    while (j < n && rtf[j] !== '\\' && rtf[j] !== '{' && rtf[j] !== '}' && rtf[j] !== '\r' && rtf[j] !== '\n') j += 1;
    let run = rtf.slice(i, j);
    if (skipChars > 0) { const k = Math.min(skipChars, run.length); run = run.slice(k); skipChars -= k; }
    flushBytes();
    emit(run);
    i = j;
  }
  if (html || text) endParagraph();

  // Trailing empty paragraphs are an artefact of how editors end files.
  while (paragraphs.length && !paragraphs[paragraphs.length - 1].text.trim()) paragraphs.pop();
  return {
    html: paragraphs.map((p) => (p.text.trim() ? `<p>${p.html.replace(/\t/g, '&emsp;')}</p>` : '<p><br></p>')).join('\n'),
    text: paragraphs.map((p) => p.text).join('\n'),
  };
}

export async function convertRtf(file: File, to: ConvFormat): Promise<Blob> {
  // RTF is 7-bit ASCII with escapes, so reading it as Latin-1 never corrupts it.
  const raw = new TextDecoder('latin1').decode(await file.arrayBuffer());
  const { html, text } = rtfToHtml(raw);
  if (!text.trim()) throw new Error(`“${file.name}” has no readable text.`);
  const title = file.name.replace(/\.[^.]+$/, '');
  if (to === 'txt') return new Blob([text.trim() + '\n'], { type: 'text/plain;charset=utf-8' });
  if (to === 'html') {
    return new Blob([`<!doctype html>\n<html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{max-width:44rem;margin:2rem auto;padding:0 1rem;font:1rem/1.6 Georgia,serif;color:#1f2328}p{margin:0 0 .8em}</style>
</head><body>\n${html}\n</body></html>\n`], { type: 'text/html;charset=utf-8' });
  }
  if (to === 'docx') {
    const { htmlToDocxBlob } = await import('../../word/htmlToDocx');
    return htmlToDocxBlob(html, title);
  }
  throw new Error(`RTF cannot be converted to ${to.toUpperCase()} here.`);
}
