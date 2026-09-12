/**
 * BLOCK → PDF RENDERER
 *
 * Draws the rich-text block model with pdf-lib's standard fonts. Every mark
 * the editor can produce has a representation here, so nothing the user
 * applies is silently dropped.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Align, Block, TextRun } from './richText';

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
}

/** Point size and spacing per block type. */
const STYLE: Record<Block['type'], { size: number; leading: number; before: number; after: number; bold: boolean }> = {
  h1:     { size: 22, leading: 27, before: 14, after: 6, bold: true },
  h2:     { size: 16, leading: 21, before: 11, after: 5, bold: true },
  p:      { size: 11, leading: 16, before: 0,  after: 6, bold: false },
  bullet: { size: 11, leading: 16, before: 0,  after: 3, bold: false },
  number: { size: 11, leading: 16, before: 0,  after: 3, bold: false },
};

const LIST_INDENT = 18;

function fontFor(run: TextRun, fonts: Fonts, forceBold: boolean): PDFFont {
  const bold = Boolean(run.bold) || forceBold;
  if (bold && run.italic) return fonts.boldItalic;
  if (bold) return fonts.bold;
  if (run.italic) return fonts.italic;
  return fonts.regular;
}

/** A run split down to a single word, carrying its marks. */
interface Piece { text: string; run: TextRun; font: PDFFont; width: number }

/** Greedy word-wrap across runs, so a bold span can break mid-sentence. */
function layoutLine(pieces: Piece[], maxWidth: number, spaceWidth: number): Piece[][] {
  const lines: Piece[][] = [];
  let current: Piece[] = [];
  let width = 0;

  for (const piece of pieces) {
    if (piece.text === '\n') {
      lines.push(current);
      current = [];
      width = 0;
      continue;
    }
    const advance = current.length === 0 ? piece.width : spaceWidth + piece.width;
    if (width + advance > maxWidth && current.length > 0) {
      lines.push(current);
      current = [piece];
      width = piece.width;
    } else {
      current.push(piece);
      width += advance;
    }
  }
  lines.push(current);
  return lines;
}

function lineWidth(line: Piece[], spaceWidth: number): number {
  return line.reduce((sum, p, i) => sum + p.width + (i > 0 ? spaceWidth : 0), 0);
}

function startX(align: Align, left: number, available: number, used: number): number {
  if (align === 'center') return left + (available - used) / 2;
  if (align === 'right') return left + (available - used);
  return left;
}

export interface RenderOptions {
  width: number;
  height: number;
  margin?: number;
  /** Reports 0–100 as pages are laid out. */
  onProgress?: (percent: number) => void;
}

export async function renderBlocksToPdf(
  blocks: Block[],
  { width, height, margin = 56, onProgress }: RenderOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
  };

  let page: PDFPage = doc.addPage([width, height]);
  let y = height - margin;
  const ink = rgb(0.06, 0.08, 0.13);

  const newPage = () => { page = doc.addPage([width, height]); y = height - margin; };

  blocks.forEach((block, blockIndex) => {
    const style = STYLE[block.type];
    const isList = block.type === 'bullet' || block.type === 'number';
    const indent = isList ? LIST_INDENT : 0;
    const left = margin + indent;
    const available = width - margin * 2 - indent;
    const spaceWidth = fonts.regular.widthOfTextAtSize(' ', style.size);

    y -= style.before;

    // Break each run into words so wrapping can happen anywhere.
    const pieces: Piece[] = [];
    block.runs.forEach((run) => {
      const font = fontFor(run, fonts, style.bold);
      run.text.split('\n').forEach((segment, segmentIndex) => {
        if (segmentIndex > 0) {
          pieces.push({ text: '\n', run, font, width: 0 });
        }
        segment.split(/\s+/).filter(Boolean).forEach((word) => {
          pieces.push({ text: word, run, font, width: font.widthOfTextAtSize(word, style.size) });
        });
      });
    });

    // An empty block is the user's blank line.
    if (pieces.length === 0) { y -= style.leading; return; }

    const lines = layoutLine(pieces, available, spaceWidth);

    lines.forEach((line, lineIndex) => {
      if (y < margin + style.leading) newPage();

      let x = startX(block.align, left, available, lineWidth(line, spaceWidth));

      // The marker sits outside the text column, on the first line only.
      if (isList && lineIndex === 0) {
        const marker = block.type === 'bullet' ? '•' : `${block.ordinal ?? 1}.`;
        page.drawText(marker, {
          x: left - LIST_INDENT + 2, y, size: style.size, font: fonts.regular, color: ink,
        });
      }

      line.forEach((piece, pieceIndex) => {
        if (pieceIndex > 0) x += spaceWidth;
        page.drawText(piece.text, { x, y, size: style.size, font: piece.font, color: ink });

        if (piece.run.underline) {
          const thickness = Math.max(0.5, style.size * 0.055);
          page.drawLine({
            start: { x, y: y - style.size * 0.13 },
            end: { x: x + piece.width, y: y - style.size * 0.13 },
            thickness,
            color: ink,
          });
        }
        x += piece.width;
      });

      y -= style.leading;
    });

    y -= style.after;

    if (onProgress && blocks.length > 0) {
      onProgress(Math.round(((blockIndex + 1) / blocks.length) * 90));
    }
  });

  return doc.save();
}
