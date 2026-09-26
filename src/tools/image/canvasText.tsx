/**
 * CANVAS TEXT
 *
 * Canva-style text boxes for the drawing tools: multi-line text with word
 * wrap, font family, bold / italic / underline, alignment, line height and
 * a highlight background, edited in place on the canvas through a textarea
 * overlay that uses exactly the same metrics the canvas renderer does, so
 * what you type is what gets exported.
 *
 * Geometry: (x, y) is the top-left of the text box in canvas pixels. `w` is
 * the box width when the user has fixed it by dragging a side handle; when
 * it is undefined the box grows with the longest line (auto width) and only
 * explicit line breaks wrap.
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Minus, Plus, Highlighter, Move,
} from 'lucide-react';
// Tool-page chunks only, so these fonts never load on the homepage.
import '@fontsource-variable/inter';
import '@fontsource-variable/outfit';

export type TextAlign = 'left' | 'center' | 'right';

export interface TextStyle {
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: TextAlign;
  /** Multiple of the font size. */
  lineHeight: number;
  /** Highlight behind the text, or null for none. */
  bg: string | null;
}

export interface TextObject extends TextStyle {
  id: string;
  type: 'text';
  x: number;
  y: number;
  /** Fixed box width; undefined means auto width. */
  w?: number;
  text: string;
  color: string;
  opacity?: number;
}

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans Variable', sans-serif" },
  { label: 'Inter', value: "'Inter Variable', sans-serif" },
  { label: 'Outfit', value: "'Outfit Variable', sans-serif" },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet', value: "'Trebuchet MS', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: "'Times New Roman', Times, serif" },
  { label: 'Impact', value: 'Impact, Haettenschweiler, sans-serif' },
  { label: 'Comic', value: "'Comic Sans MS', 'Comic Sans', cursive" },
  { label: 'Mono', value: "'JetBrains Mono Variable', 'Courier New', monospace" },
];

export const DEFAULT_TEXT_STYLE: TextStyle = {
  font: FONT_OPTIONS[0].value,
  size: 48,
  bold: true,
  italic: false,
  underline: false,
  align: 'left',
  lineHeight: 1.25,
  bg: null,
};

/** Canva's "Add a heading / subheading / body" presets, as a size and weight. */
export const TEXT_PRESETS: { id: string; label: string; text: string; size: number; bold: boolean }[] = [
  { id: 'heading', label: 'Add a heading', text: 'Add a heading', size: 72, bold: true },
  { id: 'subheading', label: 'Add a subheading', text: 'Add a subheading', size: 44, bold: true },
  { id: 'body', label: 'Add body text', text: 'Add a little bit of body text', size: 26, bold: false },
];

export function cssFont(s: Pick<TextStyle, 'font' | 'size' | 'bold' | 'italic'>, scale = 1): string {
  return `${s.italic ? 'italic ' : ''}${s.bold ? 700 : 400} ${s.size * scale}px ${s.font}`;
}

let measureCtx: CanvasRenderingContext2D | null = null;
function mctx(): CanvasRenderingContext2D | null {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  return measureCtx;
}

/** Word-wrap one paragraph to `maxW`. Words longer than a line are broken by character. */
function wrapParagraph(ctx: CanvasRenderingContext2D, para: string, maxW: number): string[] {
  if (para === '') return [''];
  const fits = (s: string) => ctx.measureText(s).width <= maxW;
  const lines: string[] = [];
  let line = '';
  // A word wider than the whole box is broken by character; the tail stays open.
  const hardBreak = (word: string) => {
    let chunk = '';
    for (const ch of word) {
      if (chunk && !fits(chunk + ch)) { lines.push(chunk); chunk = ''; }
      chunk += ch;
    }
    return chunk;
  };
  for (const token of para.split(/(\s+)/)) {
    if (!token) continue;
    if (fits(line + token)) { line += token; continue; }
    if (/^\s+$/.test(token)) continue; // trailing space at a wrap point is dropped
    if (line.trim()) lines.push(line.trimEnd());
    line = fits(token) ? token : hardBreak(token);
  }
  lines.push(line.trimEnd());
  return lines;
}

export interface TextLayout {
  lines: string[];
  lineWidths: number[];
  w: number;
  h: number;
  lineH: number;
  ascent: number;
  descent: number;
}

/** Lines, box size and font metrics, shared by the renderer, hit-testing and the editor overlay. */
export function layoutText(o: Pick<TextObject, 'text' | 'w' | keyof TextStyle>): TextLayout {
  const ctx = mctx();
  const lineH = o.size * o.lineHeight;
  if (!ctx) {
    const lines = o.text.split('\n');
    const w = o.w ?? Math.max(o.size, ...lines.map(l => l.length * o.size * 0.55));
    return { lines, lineWidths: lines.map(() => w), w, h: lines.length * lineH, lineH, ascent: o.size * 0.8, descent: o.size * 0.2 };
  }
  ctx.font = cssFont(o);
  const paras = o.text.split('\n');
  const lines = o.w ? paras.flatMap(p => wrapParagraph(ctx, p, o.w!)) : paras;
  const lineWidths = lines.map(l => ctx.measureText(l).width);
  const m = ctx.measureText('Hg');
  const ascent = m.fontBoundingBoxAscent ?? o.size * 0.8;
  const descent = m.fontBoundingBoxDescent ?? o.size * 0.2;
  const w = o.w ?? Math.max(o.size * 0.5, ...lineWidths);
  return { lines, lineWidths, w, h: Math.max(1, lines.length) * lineH, lineH, ascent, descent };
}

export function textBounds(o: TextObject): { x: number; y: number; w: number; h: number } {
  const l = layoutText(o);
  return { x: o.x, y: o.y, w: l.w, h: l.h };
}

/** Paint a text object. Baselines follow CSS half-leading so it lines up with the textarea editor. */
export function drawTextObject(ctx: CanvasRenderingContext2D, o: TextObject, offsetX = 0, offsetY = 0) {
  const l = layoutText(o);
  const x0 = o.x + offsetX;
  const y0 = o.y + offsetY;
  ctx.save();
  ctx.globalAlpha = o.opacity ?? 1;
  if (o.bg) {
    const pad = o.size * 0.18;
    ctx.fillStyle = o.bg;
    roundRect(ctx, x0 - pad, y0 - pad * 0.5, l.w + pad * 2, l.h + pad, Math.min(12, o.size * 0.15));
    ctx.fill();
  }
  ctx.font = cssFont(o);
  ctx.fillStyle = o.color;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = o.align;
  const ax = o.align === 'center' ? x0 + l.w / 2 : o.align === 'right' ? x0 + l.w : x0;
  const halfLeading = (l.lineH - (l.ascent + l.descent)) / 2;
  l.lines.forEach((line, i) => {
    const baseline = y0 + i * l.lineH + halfLeading + l.ascent;
    ctx.fillText(line, ax, baseline);
    if (o.underline && line) {
      const lw = l.lineWidths[i];
      const lx = o.align === 'center' ? ax - lw / 2 : o.align === 'right' ? ax - lw : ax;
      ctx.fillRect(lx, baseline + o.size * 0.09, lw, Math.max(1, o.size / 16));
    }
  });
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Resize a text box from a handle drag. Side handles change the wrap width
 * (the font stays put), corner handles scale the whole thing, like Canva.
 */
export function resizeTextObject(
  orig: TextObject,
  handle: string,
  p: { x: number; y: number },
): TextObject {
  const b = textBounds(orig);
  if (handle === 'e' || handle === 'w') {
    const minW = orig.size * 0.8;
    if (handle === 'e') return { ...orig, w: Math.max(minW, p.x - b.x) };
    const right = b.x + b.w;
    const w = Math.max(minW, right - p.x);
    return { ...orig, x: right - w, w };
  }
  // Corner: proportional scale anchored on the opposite corner.
  const anchorX = handle.includes('w') ? b.x + b.w : b.x;
  const anchorY = handle.includes('n') ? b.y + b.h : b.y;
  const newW = Math.max(8, Math.abs(p.x - anchorX));
  const factor = b.w > 0 ? newW / b.w : 1;
  const size = Math.min(800, Math.max(6, orig.size * factor));
  const f = size / orig.size;
  const w = orig.w ? orig.w * f : undefined;
  const nw = b.w * f;
  const nh = b.h * f;
  return {
    ...orig,
    size,
    w,
    x: handle.includes('w') ? anchorX - nw : anchorX,
    y: handle.includes('n') ? anchorY - nh : anchorY,
  };
}

/** Make sure a web font is ready before the canvas paints with it (canvas never waits on its own). */
export function ensureFontLoaded(style: Pick<TextStyle, 'font' | 'size' | 'bold' | 'italic'>): Promise<unknown> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return document.fonts.load(cssFont({ ...style, size: 32 })).catch(() => undefined);
}

// ─── In-place editor ─────────────────────────────────────────

interface TextEditorProps {
  obj: TextObject;
  zoom: number;
  onChange: (text: string) => void;
  onCommit: () => void;
  onToggle?: (key: 'bold' | 'italic' | 'underline') => void;
  /** Called once when the move grip starts dragging, then with each step in canvas pixels. */
  onMoveStart?: () => void;
  onMove?: (dx: number, dy: number) => void;
  /** Put the move grip above the box (when the toolbar sits below it). */
  gripAbove?: boolean;
}

/**
 * A transparent textarea laid exactly over the text on the canvas. Font,
 * line height and alignment are the canvas's, scaled by the zoom, so the
 * caret sits where the glyphs will be drawn.
 */
export const CanvasTextEditor: React.FC<TextEditorProps> = ({
  obj, zoom, onChange, onCommit, onToggle, onMoveStart, onMove, gripAbove,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const dragRef = useRef<{ x: number; y: number; started: boolean } | null>(null);
  const l = layoutText(obj);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.select();
  }, [obj.id]);

  // Keep the box sized to its content while typing.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.max(el.scrollHeight, l.h * zoom)}px`;
  });

  const caretRoom = obj.w ? 0 : obj.size * 0.6;
  const boxW = (l.w + caretRoom) * zoom;
  const endDrag = () => {
    dragRef.current = null;
    ref.current?.focus({ preventScroll: true });
  };
  return (
    <>
    <textarea
      ref={ref}
      value={obj.text}
      spellCheck={false}
      aria-label="Edit text"
      // Canvas text has its own undo; keep it out of the page-level history.
      data-history-ignore=""
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        const mod = e.ctrlKey || e.metaKey;
        const toggle = mod && ({ b: 'bold', i: 'italic', u: 'underline' } as const)[e.key.toLowerCase() as 'b' | 'i' | 'u'];
        if (toggle && onToggle) {
          e.preventDefault();
          onToggle(toggle);
          return;
        }
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          onCommit();
        }
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute z-20 m-0 p-0 border-0 resize-none overflow-hidden bg-transparent outline-none
                 ring-2 ring-[#6366f1] ring-offset-0 rounded-[2px]"
      style={{
        left: obj.x * zoom,
        top: obj.y * zoom,
        width: (l.w + caretRoom) * zoom,
        font: cssFont(obj, zoom),
        lineHeight: `${l.lineH * zoom}px`,
        color: obj.color,
        caretColor: obj.color,
        opacity: obj.opacity ?? 1,
        textAlign: obj.align,
        textDecoration: obj.underline ? 'underline' : 'none',
        whiteSpace: obj.w ? 'pre-wrap' : 'pre',
        overflowWrap: 'break-word',
        backgroundColor: obj.bg ?? 'transparent',
      }}
    />
    {onMove && (
      // The textarea takes every click for the caret, so moving while typing goes through this grip.
      <button
        type="button"
        title="Drag to move"
        aria-label="Drag to move text"
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          dragRef.current = { x: e.clientX, y: e.clientY, started: false };
        }}
        onPointerMove={(e) => {
          const d = dragRef.current;
          if (!d) return;
          const dx = (e.clientX - d.x) / zoom;
          const dy = (e.clientY - d.y) / zoom;
          if (!dx && !dy) return;
          if (!d.started) { d.started = true; onMoveStart?.(); }
          d.x = e.clientX;
          d.y = e.clientY;
          onMove(dx, dy);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute z-30 w-7 h-7 -ml-3.5 rounded-full flex items-center justify-center touch-none
                   cursor-move bg-[#6366f1] text-white shadow-lg ring-2 ring-white dark:ring-[#12121a]
                   hover:scale-110 transition-transform"
        style={{
          left: obj.x * zoom + boxW / 2,
          top: gripAbove ? obj.y * zoom - 38 : (obj.y + l.h) * zoom + 10,
        }}
      >
        <Move className="w-3.5 h-3.5" />
      </button>
    )}
    </>
  );
};

// ─── Style controls ──────────────────────────────────────────

const btn = (active: boolean) =>
  `h-8 min-w-8 px-1.5 rounded-md inline-flex items-center justify-center text-xs transition-colors
   ${active
    ? 'bg-primary/15 text-primary'
    : 'text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}`;

/** Keeps focus in the text editor while the toolbar is clicked. */
const keepFocus = (e: React.MouseEvent) => {
  const tag = (e.target as HTMLElement).tagName;
  if (tag !== 'SELECT' && tag !== 'INPUT') e.preventDefault();
};

interface TextToolbarProps {
  style: TextStyle;
  color: string;
  onStyle: (patch: Partial<TextStyle>) => void;
  onColor: (c: string) => void;
}

const ALIGN_NEXT: Record<TextAlign, TextAlign> = { left: 'center', center: 'right', right: 'left' };
const ALIGN_ICON: Record<TextAlign, React.ElementType> = { left: AlignLeft, center: AlignCenter, right: AlignRight };

/** The compact contextual bar that floats above a selected text box. */
export const TextFloatingToolbar: React.FC<TextToolbarProps & { left: number; top: number; below?: boolean }> = ({
  style, color, onStyle, onColor, left, top, below,
}) => {
  const AlignIcon = ALIGN_ICON[style.align];
  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={keepFocus}
      className="absolute z-30 flex items-center gap-0.5 p-1 rounded-xl border shadow-xl bg-card border-border
                 dark:bg-[#12121a] dark:border-white/[0.12] whitespace-nowrap"
      style={{ left, top, transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)' }}
    >
      <select
        value={style.font}
        onChange={(e) => onStyle({ font: e.target.value })}
        aria-label="Font"
        className="h-8 max-w-[120px] rounded-md bg-transparent px-1.5 text-xs text-foreground border border-border dark:border-white/[0.1]"
      >
        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <button type="button" className={btn(false)} title="Smaller" aria-label="Decrease font size"
        onClick={() => onStyle({ size: Math.max(6, Math.round(style.size - stepFor(style.size))) })}>
        <Minus className="w-3.5 h-3.5" />
      </button>
      <input
        type="number"
        value={Math.round(style.size)}
        min={6}
        max={800}
        aria-label="Font size"
        onChange={(e) => { const v = Number(e.target.value); if (v >= 6) onStyle({ size: Math.min(800, v) }); }}
        className="w-11 h-8 rounded-md border border-border dark:border-white/[0.1] bg-transparent text-center text-xs font-mono text-foreground"
      />
      <button type="button" className={btn(false)} title="Bigger" aria-label="Increase font size"
        onClick={() => onStyle({ size: Math.min(800, Math.round(style.size + stepFor(style.size))) })}>
        <Plus className="w-3.5 h-3.5" />
      </button>
      <span className="mx-0.5 h-5 w-px bg-border" />
      <label className={`${btn(false)} relative cursor-pointer`} title="Text color">
        <span className="flex flex-col items-center leading-none">
          <span className="text-[13px] font-bold text-foreground">A</span>
          <span className="mt-0.5 h-1 w-4 rounded-full" style={{ backgroundColor: color }} />
        </span>
        <input type="color" value={color} onChange={(e) => onColor(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Text color" />
      </label>
      <button type="button" className={btn(style.bold)} title="Bold (Ctrl+B)" aria-pressed={style.bold} onClick={() => onStyle({ bold: !style.bold })}>
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn(style.italic)} title="Italic (Ctrl+I)" aria-pressed={style.italic} onClick={() => onStyle({ italic: !style.italic })}>
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn(style.underline)} title="Underline (Ctrl+U)" aria-pressed={style.underline} onClick={() => onStyle({ underline: !style.underline })}>
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn(false)} title={`Align ${style.align}`} aria-label="Change alignment"
        onClick={() => onStyle({ align: ALIGN_NEXT[style.align] })}>
        <AlignIcon className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn(!!style.bg)} title="Highlight background" aria-pressed={!!style.bg}
        onClick={() => onStyle({ bg: style.bg ? null : '#fde047' })}>
        <Highlighter className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

function stepFor(size: number) {
  return size < 24 ? 1 : size < 72 ? 2 : 4;
}

/** Full text controls for the side panel. */
export const TextStylePanel: React.FC<TextToolbarProps> = ({ style, color, onStyle, onColor }) => (
  <div className="flex flex-col gap-3">
    <label className="block">
      <span className="section-label block mb-1.5">Font</span>
      <select
        value={style.font}
        onChange={(e) => onStyle({ font: e.target.value })}
        className="w-full h-9 rounded-lg border px-2.5 text-xs bg-card border-border dark:bg-white/[0.07] dark:border-white/[0.14] text-foreground"
      >
        {FONT_OPTIONS.map(f => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
        ))}
      </select>
    </label>
    <div className="flex items-center gap-1.5">
      <div className="flex items-center rounded-lg border border-border dark:border-white/[0.1]">
        <button type="button" className={btn(false)} aria-label="Decrease font size"
          onClick={() => onStyle({ size: Math.max(6, Math.round(style.size - stepFor(style.size))) })}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number" value={Math.round(style.size)} min={6} max={800} aria-label="Font size"
          onChange={(e) => { const v = Number(e.target.value); if (v >= 6) onStyle({ size: Math.min(800, v) }); }}
          className="w-12 h-8 bg-transparent text-center text-xs font-mono text-foreground"
        />
        <button type="button" className={btn(false)} aria-label="Increase font size"
          onClick={() => onStyle({ size: Math.min(800, Math.round(style.size + stepFor(style.size))) })}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <label className="relative w-9 h-9 rounded-lg border border-border dark:border-white/[0.1] cursor-pointer overflow-hidden" title="Text color">
        <span className="absolute inset-1.5 rounded" style={{ backgroundColor: color }} />
        <input type="color" value={color} onChange={(e) => onColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Text color" />
      </label>
    </div>
    <div className="flex flex-wrap items-center gap-1">
      <button type="button" className={btn(style.bold)} aria-pressed={style.bold} title="Bold" onClick={() => onStyle({ bold: !style.bold })}><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" className={btn(style.italic)} aria-pressed={style.italic} title="Italic" onClick={() => onStyle({ italic: !style.italic })}><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" className={btn(style.underline)} aria-pressed={style.underline} title="Underline" onClick={() => onStyle({ underline: !style.underline })}><Underline className="w-3.5 h-3.5" /></button>
      <span className="mx-1 h-5 w-px bg-border" />
      {(['left', 'center', 'right'] as TextAlign[]).map(a => {
        const Icon = ALIGN_ICON[a];
        return (
          <button key={a} type="button" className={btn(style.align === a)} aria-pressed={style.align === a} title={`Align ${a}`} onClick={() => onStyle({ align: a })}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="section-label">Line spacing</span>
        <span className="text-[10px] font-mono text-muted-foreground">{style.lineHeight.toFixed(2)}</span>
      </span>
      <input type="range" min={0.8} max={2.5} step={0.05} value={style.lineHeight}
        onChange={(e) => onStyle({ lineHeight: Number(e.target.value) })} className="w-full accent-primary" />
    </label>
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
        <input type="checkbox" checked={!!style.bg} onChange={(e) => onStyle({ bg: e.target.checked ? '#fde047' : null })} className="w-4 h-4 accent-primary" />
        Background
      </label>
      {style.bg && (
        <input type="color" value={style.bg} onChange={(e) => onStyle({ bg: e.target.value })}
          className="w-8 h-7 rounded border border-border cursor-pointer" aria-label="Background color" />
      )}
    </div>
  </div>
);
