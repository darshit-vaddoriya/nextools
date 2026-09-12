/**
 * RICH TEXT MODEL
 *
 * A deliberately small document model that sits between the editor's
 * contentEditable DOM and a PDF renderer. It captures only what can
 * actually be drawn with pdf-lib's standard fonts, weight, slant,
 * underline, block type and alignment, and discards everything else.
 *
 * Keeping this pure (no React, no pdf-lib) means the parser can be
 * reasoned about and tested on its own.
 */

export type BlockType = 'p' | 'h1' | 'h2' | 'bullet' | 'number';
export type Align = 'left' | 'center' | 'right';

/** A contiguous span of text sharing one set of marks. */
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface Block {
  type: BlockType;
  align: Align;
  runs: TextRun[];
  /** 1-based position within a run of numbered items. */
  ordinal?: number;
}

interface Marks {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

const BLOCK_TAGS: Record<string, BlockType> = {
  H1: 'h1', H2: 'h2', H3: 'h2',
  P: 'p', DIV: 'p',
  BLOCKQUOTE: 'p',
};

/** Marks contributed by a single element. */
function marksFor(el: HTMLElement, inherited: Marks): Marks {
  const tag = el.tagName;
  const style = el.style;
  const weight = style.fontWeight;
  return {
    bold: inherited.bold || tag === 'B' || tag === 'STRONG' || weight === 'bold' || Number(weight) >= 600,
    italic: inherited.italic || tag === 'I' || tag === 'EM' || style.fontStyle === 'italic',
    underline: inherited.underline || tag === 'U' || style.textDecoration.includes('underline'),
  };
}

function alignOf(el: HTMLElement, inherited: Align): Align {
  const value = el.style.textAlign || '';
  if (value === 'center' || value === 'right' || value === 'left') return value;
  return inherited;
}

/** Append a run, merging into the previous one when the marks match. */
function pushRun(runs: TextRun[], text: string, marks: Marks): void {
  if (!text) return;
  const last = runs[runs.length - 1];
  if (
    last &&
    Boolean(last.bold) === marks.bold &&
    Boolean(last.italic) === marks.italic &&
    Boolean(last.underline) === marks.underline
  ) {
    last.text += text;
    return;
  }
  runs.push({
    text,
    ...(marks.bold ? { bold: true } : {}),
    ...(marks.italic ? { italic: true } : {}),
    ...(marks.underline ? { underline: true } : {}),
  });
}

/**
 * Convert an editor root element into blocks.
 *
 * Loose inline content at the root (what you get from a plain paste) is
 * gathered into an implicit paragraph, so text never goes missing.
 */
export function parseBlocks(root: HTMLElement): Block[] {
  const blocks: Block[] = [];
  let counter = 0; // running <ol> position

  const emit = (type: BlockType, align: Align, runs: TextRun[], ordinal?: number) => {
    // Keep empty paragraphs, they are the user's blank lines.
    if (runs.length === 0 && type !== 'p') return;
    blocks.push({ type, align, runs, ...(ordinal ? { ordinal } : {}) });
  };

  /** Collect the inline text of an element into runs. */
  const collect = (node: Node, marks: Marks, runs: TextRun[]): void => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        pushRun(runs, child.textContent ?? '', marks);
        return;
      }
      if (!(child instanceof HTMLElement)) return;
      if (child.tagName === 'BR') { pushRun(runs, '\n', marks); return; }
      collect(child, marksFor(child, marks), runs);
    });
  };

  const walk = (node: Node, align: Align, inList: 'bullet' | 'number' | null): void => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? '';
        if (!text.trim()) return;
        const runs: TextRun[] = [];
        pushRun(runs, text, { bold: false, italic: false, underline: false });
        emit('p', align, runs);
        return;
      }
      if (!(child instanceof HTMLElement)) return;

      const tag = child.tagName;
      const childAlign = alignOf(child, align);

      if (tag === 'UL') { walk(child, childAlign, 'bullet'); return; }
      if (tag === 'OL') { counter = 0; walk(child, childAlign, 'number'); return; }

      if (tag === 'LI') {
        const runs: TextRun[] = [];
        collect(child, { bold: false, italic: false, underline: false }, runs);
        if (inList === 'number') { counter += 1; emit('number', childAlign, runs, counter); }
        else emit('bullet', childAlign, runs);
        return;
      }

      const blockType = BLOCK_TAGS[tag];
      if (blockType) {
        // A wrapper div holding block children is structure, not a paragraph.
        const hasBlockChildren = Array.from(child.children).some(
          (el) => BLOCK_TAGS[el.tagName] || el.tagName === 'UL' || el.tagName === 'OL',
        );
        if (hasBlockChildren) { walk(child, childAlign, inList); return; }

        const runs: TextRun[] = [];
        collect(child, { bold: false, italic: false, underline: false }, runs);
        emit(blockType, childAlign, runs);
        return;
      }

      // Inline element sitting directly at this level.
      const runs: TextRun[] = [];
      collect(child, marksFor(child, { bold: false, italic: false, underline: false }), runs);
      if (runs.length) emit('p', childAlign, runs);
    });
  };

  // Inline-only content (a plain paste) has no block wrappers at all.
  const hasBlocks = Array.from(root.children).some(
    (el) => BLOCK_TAGS[el.tagName] || el.tagName === 'UL' || el.tagName === 'OL',
  );

  if (!hasBlocks) {
    const runs: TextRun[] = [];
    collect(root, { bold: false, italic: false, underline: false }, runs);
    // Split on the newlines produced by <br> so paste keeps its line breaks.
    const text = runs.map((r) => r.text).join('');
    if (text.trim()) {
      text.split('\n').forEach((line) => {
        const lineRuns: TextRun[] = [];
        pushRun(lineRuns, line, { bold: false, italic: false, underline: false });
        emit('p', 'left', lineRuns);
      });
    }
    return blocks;
  }

  walk(root, 'left', null);
  return blocks;
}

/** Plain-text projection, used for word and character counts. */
export function blocksToText(blocks: Block[]): string {
  return blocks.map((b) => b.runs.map((r) => r.text).join('')).join('\n');
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
