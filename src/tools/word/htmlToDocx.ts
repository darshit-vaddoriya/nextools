import type { Paragraph as ParagraphType } from 'docx';

/** Inline formatting carried down the DOM while collecting a paragraph's runs. */
interface RunStyle {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  strike?: boolean;
  superScript?: boolean;
  subScript?: boolean;
  code?: boolean;
  link?: string;
}

interface CollectedRun extends RunStyle {
  text: string;
}

const HEADING_TAGS: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6 };

/** Tags that carry no text worth keeping in a Word document. */
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK', 'TEMPLATE', 'IFRAME', 'SVG']);

function styleFor(tag: string, inherited: RunStyle): RunStyle {
  switch (tag) {
    case 'B': case 'STRONG': return { ...inherited, bold: true };
    case 'I': case 'EM': case 'CITE': case 'VAR': return { ...inherited, italics: true };
    case 'U': case 'INS': return { ...inherited, underline: true };
    case 'S': case 'DEL': case 'STRIKE': return { ...inherited, strike: true };
    case 'SUP': return { ...inherited, superScript: true };
    case 'SUB': return { ...inherited, subScript: true };
    case 'CODE': case 'KBD': case 'SAMP': case 'TT': return { ...inherited, code: true };
    default: return inherited;
  }
}

/** Flattens one block element into styled runs, following nested inline tags. */
function collectRuns(node: Node, inherited: RunStyle, out: CollectedRun[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    // Collapse HTML whitespace the way a browser would; a source file's
    // indentation must not become leading spaces inside the Word paragraph.
    const text = (node.textContent ?? '').replace(/\s+/g, ' ');
    if (text) out.push({ ...inherited, text });
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as HTMLElement;
  if (SKIP_TAGS.has(el.tagName)) return;

  if (el.tagName === 'BR') { out.push({ ...inherited, text: '\n' }); return; }

  let style = styleFor(el.tagName, inherited);
  if (el.tagName === 'A') {
    const href = el.getAttribute('href');
    if (href && !href.startsWith('#')) style = { ...style, link: href };
  }
  for (const child of Array.from(el.childNodes)) collectRuns(child, style, out);
}

function trimRuns(runs: CollectedRun[]): CollectedRun[] {
  const out = runs.filter(r => r.text !== '');
  if (out.length) {
    out[0] = { ...out[0], text: out[0].text.replace(/^ +/, '') };
    const last = out.length - 1;
    out[last] = { ...out[last], text: out[last].text.replace(/ +$/, '') };
  }
  return out.filter(r => r.text !== '');
}

/**
 * Turns an HTML fragment into `docx` paragraphs.
 *
 * Word has no CSS, so this maps structure rather than appearance: headings,
 * paragraphs, list items, blockquotes and table cell text. Anything that only
 * exists as styling in the source is deliberately dropped rather than
 * approximated, which is why the tool page says layout is not preserved.
 */
export async function htmlToDocxBlob(html: string, title?: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel, AlignmentType } =
    await import('docx');

  const HEADING_LEVELS = [
    HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6,
  ];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const paragraphs: ParagraphType[] = [];

  const runsToChildren = (runs: CollectedRun[]) =>
    runs.map(run => {
      const textRun = new TextRun({
        text: run.text,
        bold: run.bold,
        italics: run.italics,
        underline: run.underline ? {} : undefined,
        strike: run.strike,
        superScript: run.superScript,
        subScript: run.subScript,
        font: run.code ? 'Consolas' : undefined,
      });
      return run.link
        ? new ExternalHyperlink({ children: [textRun], link: run.link })
        : textRun;
    });

  const pushBlock = (
    el: HTMLElement,
    options: { heading?: number; bullet?: number; numbered?: number; quote?: boolean; mono?: boolean } = {},
  ) => {
    const runs = trimRuns((() => { const acc: CollectedRun[] = []; collectRuns(el, {}, acc); return acc; })());
    if (!runs.length) return;
    paragraphs.push(new Paragraph({
      children: runsToChildren(options.mono ? runs.map(r => ({ ...r, code: true })) : runs),
      heading: options.heading ? HEADING_LEVELS[options.heading - 1] : undefined,
      bullet: options.bullet !== undefined ? { level: options.bullet } : undefined,
      numbering: options.numbered !== undefined
        ? { reference: 'html-ordered', level: options.numbered }
        : undefined,
      alignment: options.quote ? AlignmentType.LEFT : undefined,
      indent: options.quote ? { left: 720 } : undefined,
      spacing: { after: 120 },
    }));
  };

  const walkList = (list: HTMLElement, depth: number, ordered: boolean) => {
    for (const li of Array.from(list.children)) {
      if (li.tagName !== 'LI') continue;
      const nested = Array.from(li.children).filter(c => c.tagName === 'UL' || c.tagName === 'OL');
      const clone = li.cloneNode(true) as HTMLElement;
      for (const n of Array.from(clone.children)) {
        if (n.tagName === 'UL' || n.tagName === 'OL') clone.removeChild(n);
      }
      pushBlock(clone, ordered ? { numbered: Math.min(depth, 4) } : { bullet: Math.min(depth, 4) });
      for (const n of nested) walkList(n as HTMLElement, depth + 1, n.tagName === 'OL');
    }
  };

  const walkBlocks = (parent: ParentNode) => {
    for (const child of Array.from(parent.children)) {
      const el = child as HTMLElement;
      const tag = el.tagName;
      if (SKIP_TAGS.has(tag)) continue;

      if (HEADING_TAGS[tag]) { pushBlock(el, { heading: HEADING_TAGS[tag] }); continue; }
      if (tag === 'P') { pushBlock(el); continue; }
      if (tag === 'UL' || tag === 'OL') { walkList(el, 0, tag === 'OL'); continue; }
      if (tag === 'BLOCKQUOTE') { pushBlock(el, { quote: true }); continue; }
      if (tag === 'PRE') {
        for (const line of (el.textContent ?? '').split('\n')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 20 })],
          }));
        }
        continue;
      }
      if (tag === 'HR') { paragraphs.push(new Paragraph({ text: '' })); continue; }
      if (tag === 'TABLE') {
        // Word tables need a fixed grid; flattening each row to a tab-separated
        // line keeps every cell's text rather than losing rows we cannot model.
        for (const row of Array.from(el.querySelectorAll('tr'))) {
          const cells = Array.from(row.querySelectorAll('th,td'))
            .map(c => (c.textContent ?? '').replace(/\s+/g, ' ').trim());
          if (cells.some(Boolean)) {
            paragraphs.push(new Paragraph({
              children: [new TextRun({ text: cells.join('\t'), bold: row.querySelector('th') !== null })],
            }));
          }
        }
        continue;
      }
      // A wrapper (div, section, article, main…): descend if it holds blocks,
      // otherwise treat its own text as one paragraph.
      if (el.children.length > 0) walkBlocks(el);
      else pushBlock(el);
    }
  };

  walkBlocks(doc.body);

  if (!paragraphs.length) {
    const fallback = (doc.body.textContent ?? '').trim();
    if (!fallback) throw new Error('No readable text was found in this HTML.');
    for (const line of fallback.split(/\n+/)) paragraphs.push(new Paragraph({ text: line }));
  }

  const document = new Document({
    title,
    numbering: {
      config: [{
        reference: 'html-ordered',
        levels: [0, 1, 2, 3, 4].map(level => ({
          level,
          format: 'decimal' as const,
          text: `%${level + 1}.`,
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } },
        })),
      }],
    },
    sections: [{ children: paragraphs }],
  });

  return Packer.toBlob(document);
}

/** Plain text → DOCX, one paragraph per non-empty line. Used by the tools that
 *  deliberately throw formatting away. */
export async function textToDocxBlob(text: string, title?: string): Promise<Blob> {
  const { Document, Packer, Paragraph } = await import('docx');
  const children = text
    .split(/\r?\n/)
    .map(line => new Paragraph({ text: line.trim(), spacing: { after: 120 } }));
  const doc = new Document({ title, sections: [{ children: children.length ? children : [new Paragraph({ text: '' })] }] });
  return Packer.toBlob(doc);
}
