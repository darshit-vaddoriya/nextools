import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PenLine, Eraser, Undo2, Redo2, Trash2, Download, X, Image as ImageIcon,
  MousePointer2, Square, Circle, Star, Minus, MoveRight, Type, Delete,
  ZoomIn, ZoomOut, Maximize2, Copy, ArrowUp, ArrowDown, SlidersHorizontal, RefreshCw,
  CheckCircle2, Shapes, Upload, ClipboardPaste, Lock, Settings2, Paintbrush, MoveUpRight,
} from 'lucide-react';
import { ErrorNotice } from './ImageShared';
import {
  loadImage, canvasExport, downloadBlob, baseNameFrom, formatBytes,
} from './ImageUtils';
import { errorMessage } from '../../utils/errorMessage';

const MAX_DIM = 4000;
const HISTORY_LIMIT = 30;
const ZOOM_MIN = 0.05;
const ZOOM_MAX = 4;

const TOOL_ORDER: { id: ToolId; label: string; shortcut: string; Icon: React.ElementType }[] = [
  { id: 'select', label: 'Pointer', shortcut: 'V', Icon: MousePointer2 },
  { id: 'brush', label: 'Brush', shortcut: 'B', Icon: Paintbrush },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', Icon: Eraser },
  { id: 'shapes', label: 'Shapes', shortcut: 'S', Icon: Shapes },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', Icon: MoveUpRight },
  { id: 'text', label: 'Text', shortcut: 'T', Icon: Type },
];

const TYPE_META: Record<DrawObject['type'], { label: string; Icon: React.ElementType }> = {
  stroke: { label: 'Brush stroke', Icon: PenLine },
  rect: { label: 'Rectangle', Icon: Square },
  ellipse: { label: 'Ellipse', Icon: Circle },
  star: { label: 'Star', Icon: Star },
  line: { label: 'Line', Icon: Minus },
  arrow: { label: 'Arrow', Icon: MoveRight },
  text: { label: 'Text', Icon: Type },
};

const HINT_BY_TOOL: Record<ToolId, string> = {
  select: 'Click an object to select it, drag to move, or drag a handle to resize (Shift keeps the ratio).',
  brush: 'Click and drag to draw a freehand brush stroke.',
  eraser: 'Click or drag over objects to erase them. Objects are removed as a whole.',
  shapes: 'Pick a shape on the right, then drag on the image to draw it.',
  arrow: 'Drag on the image to draw an arrow.',
  text: 'Click anywhere on the image to place your text.',
};

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#57534e', '#111827', '#ffffff',
];

const BRUSH_SIZES = [2, 4, 8, 16, 32, 64];

const TOOL_KEYS: Record<string, ToolId> = {
  v: 'select', b: 'brush', e: 'eraser', s: 'shapes', a: 'arrow', t: 'text',
};

type ToolId = 'select' | 'brush' | 'eraser' | 'shapes' | 'arrow' | 'text';

type ShapeKind = 'rect' | 'ellipse' | 'star' | 'line';

const SHAPE_KINDS: { id: ShapeKind; label: string; Icon: React.ElementType }[] = [
  { id: 'rect', label: 'Rectangle', Icon: Square },
  { id: 'ellipse', label: 'Ellipse', Icon: Circle },
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'line', label: 'Line', Icon: Minus },
];

interface Point { x: number; y: number; }

type DrawObject =
  | { id: string; type: 'stroke'; points: Point[]; color: string; size: number; opacity?: number }
  | { id: string; type: 'rect' | 'ellipse' | 'star'; x: number; y: number; w: number; h: number; color: string; fillColor: string; size: number; fill: boolean; opacity?: number }
  | { id: string; type: 'line' | 'arrow'; x1: number; y1: number; x2: number; y2: number; color: string; size: number; opacity?: number }
  | { id: string; type: 'text'; x: number; y: number; text: string; color: string; size: number; opacity?: number };

let idCounter = 0;
const nextId = () => `d${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const shapeTools: ToolId[] = ['shapes', 'arrow'];

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number, inner: number) {
  const spikes = 5;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="section-label block mb-1.5">{children}</span>
);

const RangeField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, suffix = '', onChange }) => {
  const pct = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="section-label">{label}</span>
        <span className="text-[10px] font-mono  text-muted-foreground">
          {suffix ? `${value}${suffix}` : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-progress"
        style={{ background: `linear-gradient(to right, var(--range-fill) 0%, var(--range-fill) ${pct}%, var(--range-track) ${pct}%, var(--range-track) 100%)` }}
      />
    </label>
  );
};

const HdrBtn: React.FC<{
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, title, disabled, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    className={`h-9 px-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-colors border shrink-0
       dark:hover:bg-white/[0.06] dark:border-white/[0.08]
      text-muted-foreground hover:bg-muted border-border
      disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const MenuItem: React.FC<{
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  Icon: React.ElementType;
  children: React.ReactNode;
}> = ({ onClick, shortcut, disabled, danger, Icon, children }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full h-8 px-2.5 rounded-lg flex items-center gap-2.5 text-left text-xs transition-colors
      ${danger
        ? 'text-rose-500 dark:text-rose-400 hover:bg-rose-500/10'
        : 'text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}
      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
  >
    <Icon className="w-3.5 h-3.5 shrink-0" />
    <span className="flex-1 truncate">{children}</span>
    {shortcut && <kbd className="font-mono text-[10px] opacity-60 shrink-0">{shortcut}</kbd>}
  </button>
);

const MenuSep: React.FC = () => <div className="my-1 h-px bg-border dark:bg-white/[0.08]" />;

const RailBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  title: string;
  shortcut?: string;
  disabled?: boolean;
  label?: string;
  children: React.ReactNode;
}> = ({ active, onClick, title, shortcut, disabled, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    className={`relative group w-11 lg:w-full h-11 lg:h-auto shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 lg:py-1.5 transition-colors border
      ${active
        ? 'dark:bg-primary/20 dark:border-primary/40 dark:text-primary bg-primary-container border-primary/40 text-on-primary-container'
        : ' dark:hover:bg-white/[0.06] dark:border-transparent text-muted-foreground hover:bg-muted border-transparent'}
      disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
    {label && <span className="hidden lg:block text-[9px] font-medium leading-none">{label}</span>}
    {shortcut && (
      <span className="pointer-events-none absolute z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150
        left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 rounded-md text-[10px] font-medium
        bg-foreground text-background border border-border shadow-lg
        lg:left-full lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:ml-2 lg:mt-0">
        {title}
        <kbd className="ml-1.5 font-mono opacity-70">{shortcut}</kbd>
      </span>
    )}
  </button>
);

function drawObject(ctx: CanvasRenderingContext2D, o: DrawObject, offsetX = 0, offsetY = 0) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const alpha = o.opacity ?? 1;
  ctx.globalAlpha = alpha;
  switch (o.type) {
    case 'stroke': {
      if (o.points.length < 2) {
        if (o.points.length === 1) {
          ctx.fillStyle = o.color;
          ctx.beginPath();
          ctx.arc(o.points[0].x + offsetX, o.points[0].y + offsetY, o.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      ctx.beginPath();
      ctx.moveTo(o.points[0].x + offsetX, o.points[0].y + offsetY);
      if (o.points.length === 2) {
        ctx.lineTo(o.points[1].x + offsetX, o.points[1].y + offsetY);
      } else {
        for (let i = 1; i < o.points.length - 1; i++) {
          const xc = (o.points[i].x + o.points[i + 1].x) / 2 + offsetX;
          const yc = (o.points[i].y + o.points[i + 1].y) / 2 + offsetY;
          ctx.quadraticCurveTo(o.points[i].x + offsetX, o.points[i].y + offsetY, xc, yc);
        }
        ctx.lineTo(o.points[o.points.length - 1].x + offsetX, o.points[o.points.length - 1].y + offsetY);
      }
      ctx.stroke();
      break;
    }
    case 'rect': {
      const rw = Math.abs(o.w);
      const rh = Math.abs(o.h);
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      if (o.fill) {
        ctx.fillStyle = o.fillColor;
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillRect(o.x + offsetX, o.y + offsetY, rw, rh);
      }
      ctx.globalAlpha = alpha;
      ctx.strokeRect(o.x + offsetX, o.y + offsetY, rw, rh);
      break;
    }
    case 'ellipse': {
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      ctx.beginPath();
      ctx.ellipse(o.x + o.w / 2 + offsetX, o.y + o.h / 2 + offsetY, Math.abs(o.w) / 2, Math.abs(o.h) / 2, 0, 0, Math.PI * 2);
      if (o.fill) {
        ctx.fillStyle = o.fillColor;
        ctx.globalAlpha = alpha * 0.25;
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.stroke();
      break;
    }
    case 'star': {
      const cx = o.x + o.w / 2 + offsetX;
      const cy = o.y + o.h / 2 + offsetY;
      const outer = Math.max(1, Math.abs(o.w) / 2);
      const inner = outer * 0.42;
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      if (o.fill) {
        ctx.fillStyle = o.fillColor;
        ctx.globalAlpha = alpha * 0.25;
        starPath(ctx, cx, cy, outer, inner);
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      starPath(ctx, cx, cy, outer, inner);
      ctx.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const x1 = o.x1 + offsetX, y1 = o.y1 + offsetY, x2 = o.x2 + offsetX, y2 = o.y2 + offsetY;
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (o.type === 'arrow') {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const len = Math.max(10, o.size * 3.2);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - len * Math.cos(angle - Math.PI / 6), y2 - len * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - len * Math.cos(angle + Math.PI / 6), y2 - len * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
      break;
    }
    case 'text': {
      ctx.fillStyle = o.color;
      ctx.font = `bold ${o.size}px Arial, Helvetica, sans-serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(o.text, o.x + offsetX, o.y + offsetY);
      break;
    }
  }
  ctx.restore();
}

let measureCtx: CanvasRenderingContext2D | null = null;

/** Real glyph width, so the selection box and handles hug the text. */
function measureTextWidth(text: string, size: number): number {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return Math.max(20, text.length * size * 0.62);
  measureCtx.font = `bold ${size}px Arial, Helvetica, sans-serif`;
  return Math.max(8, measureCtx.measureText(text).width);
}

function objectBounds(o: DrawObject): { x: number; y: number; w: number; h: number } {
  switch (o.type) {
    case 'stroke': {
      if (!o.points.length) return { x: 0, y: 0, w: 0, h: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of o.points) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      }
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case 'rect':
    case 'ellipse':
    case 'star':
      return { x: Math.min(o.x, o.x + o.w), y: Math.min(o.y, o.y + o.h), w: Math.abs(o.w), h: Math.abs(o.h) };
    case 'line':
    case 'arrow':
      return { x: Math.min(o.x1, o.x2), y: Math.min(o.y1, o.y2), w: Math.abs(o.x2 - o.x1), h: Math.abs(o.y2 - o.y1) };
    case 'text':
      return { x: o.x, y: o.y - o.size, w: measureTextWidth(o.text, o.size), h: o.size * 1.3 };
  }
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'p1' | 'p2';

const HANDLE_CURSOR: Record<HandleId, string> = {
  nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize',
  n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
  p1: 'crosshair', p2: 'crosshair',
};

/** Selection handles, in canvas coordinates. Lines/arrows get their two endpoints. */
function handlesFor(o: DrawObject): { id: HandleId; x: number; y: number }[] {
  if (o.type === 'line' || o.type === 'arrow') {
    return [{ id: 'p1', x: o.x1, y: o.y1 }, { id: 'p2', x: o.x2, y: o.y2 }];
  }
  const b = objectBounds(o);
  const x1 = b.x - 4, y1 = b.y - 4, x2 = b.x + b.w + 4, y2 = b.y + b.h + 4;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return [
    { id: 'nw', x: x1, y: y1 }, { id: 'n', x: mx, y: y1 }, { id: 'ne', x: x2, y: y1 },
    { id: 'e', x: x2, y: my }, { id: 'se', x: x2, y: y2 }, { id: 's', x: mx, y: y2 },
    { id: 'sw', x: x1, y: y2 }, { id: 'w', x: x1, y: my },
  ];
}

/** Rebuild `orig` so the dragged handle sits at `p`. Shift keeps a corner drag proportional. */
function resizeObject(orig: DrawObject, handle: HandleId, p: Point, shift: boolean): DrawObject {
  if (orig.type === 'line' || orig.type === 'arrow') {
    return handle === 'p1' ? { ...orig, x1: p.x, y1: p.y } : { ...orig, x2: p.x, y2: p.y };
  }
  const MIN = 4;
  const b = objectBounds(orig);
  let x1 = b.x, y1 = b.y, x2 = b.x + b.w, y2 = b.y + b.h;
  if (handle.includes('w')) x1 = p.x;
  if (handle.includes('e')) x2 = p.x;
  if (handle.includes('n')) y1 = p.y;
  if (handle.includes('s')) y2 = p.y;
  if (x2 - x1 < MIN) { if (handle.includes('w')) x1 = x2 - MIN; else x2 = x1 + MIN; }
  if (y2 - y1 < MIN) { if (handle.includes('n')) y1 = y2 - MIN; else y2 = y1 + MIN; }
  const isCorner = handle.length === 2;
  if ((shift || orig.type === 'text') && isCorner && b.w > 0 && b.h > 0) {
    const nh = (x2 - x1) * (b.h / b.w);
    if (handle.includes('n')) y1 = y2 - nh; else y2 = y1 + nh;
  }
  const nw = x2 - x1;
  const nh = y2 - y1;

  switch (orig.type) {
    case 'rect':
    case 'ellipse':
    case 'star':
      return { ...orig, x: x1, y: y1, w: nw, h: nh };
    case 'text': {
      const factor = b.h > 0 ? nh / b.h : 1;
      const size = Math.max(6, orig.size * factor);
      return { ...orig, size, x: x1, y: y1 + size };
    }
    case 'stroke': {
      const sx = b.w > 0 ? nw / b.w : 1;
      const sy = b.h > 0 ? nh / b.h : 1;
      return {
        ...orig,
        points: orig.points.map(pt => ({ x: x1 + (pt.x - b.x) * sx, y: y1 + (pt.y - b.y) * sy })),
        size: Math.max(1, orig.size * ((Math.abs(sx) + Math.abs(sy)) / 2)),
      };
    }
    default:
      return orig;
  }
}

function hitObject(o: DrawObject, px: number, py: number): boolean {
  const pad = 6;
  switch (o.type) {
    case 'stroke': {
      if (o.points.length < 2) {
        return o.points.length === 1 && Math.hypot(px - o.points[0].x, py - o.points[0].y) <= o.size / 2 + pad;
      }
      const tol = o.size / 2 + pad;
      for (let i = 1; i < o.points.length; i++) {
        if (distToSegment(px, py, o.points[i - 1].x, o.points[i - 1].y, o.points[i].x, o.points[i].y) <= tol) return true;
      }
      return false;
    }
    case 'rect':
    case 'star': {
      const { x, y, w, h } = objectBounds(o);
      return px >= x - pad && px <= x + w + pad && py >= y - pad && py <= y + h + pad;
    }
    case 'ellipse': {
      const { x, y, w, h } = objectBounds(o);
      const cx = x + w / 2, cy = y + h / 2;
      const rx = Math.max(w / 2 + pad, 1), ry = Math.max(h / 2 + pad, 1);
      const dx = (px - cx) / rx, dy = (py - cy) / ry;
      return dx * dx + dy * dy <= 1;
    }
    case 'line':
    case 'arrow':
      return distToSegment(px, py, o.x1, o.y1, o.x2, o.y2) <= o.size / 2 + pad;
    case 'text': {
      const { x, y, w, h } = objectBounds(o);
      return px >= x - pad && px <= x + w + pad && py >= y - pad && py <= y + h + pad;
    }
  }
}

export const ImageDrawTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tool, setTool] = useState<ToolId>('brush');
  const [color, setColor] = useState('#ef4444');
  const [fillColor] = useState('#6366f1');
  const [shapeKind, setShapeKind] = useState<ShapeKind>('rect');
  const [size, setSize] = useState(6);
  const [fill, setFill] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(36);
  const [textValue, setTextValue] = useState('Your text here');
  const [objects, setObjects] = useState<DrawObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [view, setView] = useState({ w: 0, h: 0 });
  const [showOptions, setShowOptions] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number; targetId: string | null } | null>(null);

  // ── Export options ────────────────────────────────────────────
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('image/png');
  const [exportQuality, setExportQuality] = useState(90);
  const [exportBg, setExportBg] = useState<'transparent' | 'white' | 'custom'>('transparent');
  const [exportBgColor, setExportBgColor] = useState('#ffffff');
  const [exportDims, setExportDims] = useState<'current' | 'original' | 'custom'>('current');
  const [exportW, setExportW] = useState(0);
  const [exportH, setExportH] = useState(0);
  const [exportName, setExportName] = useState('drawing');
  const [exportResult, setExportResult] = useState<{ url: string; blob: Blob; w: number; h: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const landingInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<{ w: number; h: number } | null>(null);
  const objectsRef = useRef<DrawObject[]>([]);
  const baseRef = useRef<string | null>(null);
  const bgLayerRef = useRef<HTMLCanvasElement | null>(null);
  const undoRef = useRef<DrawObject[][]>([]);
  const redoRef = useRef<DrawObject[][]>([]);
  const penRef = useRef<{ points: Point[]; color: string; size: number; opacity: number } | null>(null);
  const previewRef = useRef<{ tool: 'rect' | 'ellipse' | 'star' | 'line' | 'arrow'; color: string; fillColor: string; size: number; fill: boolean; opacity: number; start: Point; cur: Point } | null>(null);
  const moveRef = useRef<{ id: string; last: Point; totalX: number; totalY: number } | null>(null);
  const resizeRef = useRef<{ id: string; handle: HandleId; orig: DrawObject } | null>(null);
  const resizeCommittedRef = useRef(false);
  const erasingRef = useRef(false);
  const moveCommittedRef = useRef(false);
  const eraseCommittedRef = useRef(false);
  const textEditPushedRef = useRef(false);
  const objOpacityPushedRef = useRef(false);
  const loadTickRef = useRef(0);
  const fitPendingRef = useRef(false);
  const zoomRef = useRef(1);
  const panRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);
  const spaceDownRef = useRef(false);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => { objectsRef.current = objects; }, [objects]);

  const pushToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const pushHistory = useCallback((snapshot: DrawObject[]) => {
    undoRef.current.push(snapshot);
    if (undoRef.current.length > HISTORY_LIMIT) undoRef.current.shift();
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const prev = undoRef.current.pop();
    if (prev === undefined) return;
    redoRef.current.push(objects);
    setCanRedo(true);
    if (undoRef.current.length === 0) setCanUndo(false);
    setObjects(prev);
    setSelectedId(null);
  }, [objects]);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (next === undefined) return;
    undoRef.current.push(objects);
    setCanUndo(true);
    if (redoRef.current.length === 0) setCanRedo(false);
    setObjects(next);
    setSelectedId(null);
  }, [objects]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const bg = bgLayerRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bg) ctx.drawImage(bg, 0, 0);
    const pen = penRef.current;
    const preview = previewRef.current;
    for (const o of objects) {
      drawObject(ctx, o);
    }
    if (pen && pen.points.length) {
      drawObject(ctx, { id: 'pen', type: 'stroke', points: pen.points, color: pen.color, size: pen.size, opacity: pen.opacity });
    }
    if (preview) {
      drawObject(ctx, {
        id: 'preview', type: preview.tool,
        x: Math.min(preview.start.x, preview.cur.x), y: Math.min(preview.start.y, preview.cur.y),
        w: Math.abs(preview.cur.x - preview.start.x), h: Math.abs(preview.cur.y - preview.start.y),
        x1: preview.start.x, y1: preview.start.y, x2: preview.cur.x, y2: preview.cur.y,
        color: preview.color, size: preview.size, fill: preview.fill, opacity: preview.opacity,
      } as DrawObject);
    }
    const sel = objects.find(o => o.id === selectedId);
    if (sel && !penRef.current && !previewRef.current) {
      const b = objectBounds(sel);
      const z = Math.max(zoom, 0.01);
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5 / z;
      ctx.setLineDash([5 / z, 4 / z]);
      ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      ctx.restore();
      if (tool === 'select') {
        // Handles are drawn at a constant on-screen size, whatever the zoom is.
        const hs = 9 / z;
        ctx.save();
        ctx.lineWidth = 1.5 / z;
        ctx.strokeStyle = '#6366f1';
        ctx.fillStyle = '#ffffff';
        for (const h of handlesFor(sel)) {
          if (h.id === 'p1' || h.id === 'p2') {
            ctx.beginPath();
            ctx.arc(h.x, h.y, hs / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
            ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
          }
        }
        ctx.restore();
      }
    }
  }, [objects, selectedId, zoom, tool]);

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    textEditPushedRef.current = false;
    objOpacityPushedRef.current = false;
  }, [selectedId]);

  useEffect(() => {
    const ring = cursorRingRef.current;
    if (!ring) return;
    ring.style.visibility = (tool === 'brush' || tool === 'eraser') && !spaceHeld ? 'visible' : 'hidden';
  }, [tool, spaceHeld]);

  useEffect(() => {
    if (!confirmClear) return;
    const t = window.setTimeout(() => setConfirmClear(false), 3200);
    return () => window.clearTimeout(t);
  }, [confirmClear]);

  const clear = useCallback(() => {
    if (objects.length === 0) return;
    pushHistory(objects);
    setObjects([]);
    setSelectedId(null);
  }, [objects, pushHistory]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory(objects);
    setObjects(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
  }, [objects, selectedId, pushHistory]);

  const duplicate = useCallback(() => {
    if (!selectedId) return;
    const src = objects.find(o => o.id === selectedId);
    if (!src) return;
    pushHistory(objects);
    const copy = { ...src, id: nextId() } as DrawObject;
    switch (copy.type) {
      case 'stroke':
        copy.points = copy.points.map(pt => ({ x: pt.x + 14, y: pt.y + 14 }));
        break;
      case 'rect':
      case 'ellipse':
      case 'star':
        copy.x = copy.x + 14;
        copy.y = copy.y + 14;
        break;
      case 'line':
      case 'arrow':
        copy.x1 = copy.x1 + 14;
        copy.y1 = copy.y1 + 14;
        copy.x2 = copy.x2 + 14;
        copy.y2 = copy.y2 + 14;
        break;
      case 'text':
        copy.x = copy.x + 14;
        copy.y = copy.y + 14;
        break;
    }
    setObjects(prev => [...prev, copy]);
    setSelectedId(copy.id);
  }, [objects, selectedId, pushHistory]);

  const setObjOpacity = useCallback((v: number) => {
    if (!selectedId) return;
    if (!objOpacityPushedRef.current) {
      objOpacityPushedRef.current = true;
      pushHistory(objects);
    }
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, opacity: v } : o));
  }, [objects, selectedId, pushHistory]);

  const moveLayer = useCallback((id: string, dir: 1 | -1) => {
    const i = objects.findIndex(o => o.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= objects.length) return;
    pushHistory(objects);
    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === id);
      const next = [...prev];
      const [o] = next.splice(idx, 1);
      next.splice(idx + dir, 0, o);
      return next;
    });
  }, [objects, pushHistory]);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    try {
      const loaded = await loadImage(f);
      originalRef.current = { w: loaded.naturalWidth, h: loaded.naturalHeight };
      let w = loaded.naturalWidth;
      let h = loaded.naturalHeight;
      if (w > MAX_DIM || h > MAX_DIM) {
        const s = Math.min(MAX_DIM / w, MAX_DIM / h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      const base = document.createElement('canvas');
      base.width = w;
      base.height = h;
      const bctx = base.getContext('2d')!;
      bctx.imageSmoothingEnabled = true;
      bctx.imageSmoothingQuality = 'high';
      bctx.drawImage(loaded, 0, 0, w, h);
      baseRef.current = base.toDataURL('image/png');
      bgLayerRef.current = base;
      undoRef.current = [];
      redoRef.current = [];
      setObjects([]);
      setSelectedId(null);
      setCanUndo(false);
      setCanRedo(false);
      setError(null);
      setFile(f);
      setLoadTick(t => t + 1);
      setConfirmClear(false);
      setExportW(w);
      setExportH(h);
      setExportDims('current');
      setExportResult(prev => { if (prev) URL.revokeObjectURL(prev.url); return null; });
      setExportOpen(false);
      setExportName(`${baseNameFrom(f.name || 'drawing')}_drawing`);
    } catch (e) {
      setError(errorMessage(e, 'Could not load that image.'));
    }
  }, []);

  // ── Paste an image from the clipboard (Ctrl/Cmd + V) ──────────
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const item = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'));
      if (!item) return;
      const blob = item.getAsFile();
      if (!blob) return;
      e.preventDefault();
      const ext = blob.type.split('/')[1] || 'png';
      handleFiles([new File([blob], `pasted-image.${ext}`, { type: blob.type })]);
      pushToast('Image pasted from clipboard');
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFiles, pushToast]);

  useEffect(() => {
    if (loadTickRef.current === loadTick) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseRef.current) return;
    const tmp = new Image();
    tmp.onload = () => {
      canvas.width = tmp.naturalWidth;
      canvas.height = tmp.naturalHeight;
      setImgW(tmp.naturalWidth);
      setImgH(tmp.naturalHeight);
      redraw();
    };
    tmp.src = baseRef.current;
    loadTickRef.current = loadTick;
    fitPendingRef.current = true;
  }, [file, loadTick, redraw]);

  useEffect(() => {
    if (!file) return;
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => setView({ w: c.clientWidth, h: c.clientHeight }));
    ro.observe(c);
    setView({ w: c.clientWidth, h: c.clientHeight });
    return () => ro.disconnect();
  }, [file]);

  useEffect(() => {
    if (!fitPendingRef.current || !imgW || !imgH) return;
    const c = containerRef.current;
    if (!c || !c.clientWidth) return;
    const s = Math.min((c.clientWidth - 56) / imgW, (c.clientHeight - 56) / imgH, 1);
    setZoom(Math.max(ZOOM_MIN, s));
    fitPendingRef.current = false;
  }, [imgW, imgH, view]);

  useEffect(() => {
    if (!file) return;
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const z = zoomRef.current;
      const z2 = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, e.deltaY < 0 ? z * 1.15 : z / 1.15));
      if (z2 === z) return;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      el.scrollLeft = ((mx + el.scrollLeft) * (z2 / z)) - mx;
      el.scrollTop = ((my + el.scrollTop) * (z2 / z)) - my;
      setZoom(z2);
      fitPendingRef.current = false;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [file]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (!file) return;
    const isField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isField(e.target)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        spaceDownRef.current = true;
        setSpaceHeld(true);
        setIsPanning(false);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDownRef.current = false;
        setSpaceHeld(false);
        setIsPanning(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      spaceDownRef.current = false;
      setSpaceHeld(false);
    };
  }, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicate();
        return;
      }
      if (!mod) {
        const id = TOOL_KEYS[e.key.toLowerCase()];
        if (id) {
          e.preventDefault();
          setTool(id);
          return;
        }
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        pushHistory(objects);
        setObjects(prev => prev.filter(o => o.id !== selectedId));
        setSelectedId(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [undo, redo, duplicate, selectedId, objects, pushHistory]);

  // ── Right-click menu ────────────────────────────────────────
  const openMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    const hit = [...objects].reverse().find(o => hitObject(o, px, py)) ?? null;
    if (hit) setSelectedId(hit.id);
    setMenu({ x: e.clientX, y: e.clientY, targetId: hit?.id ?? null });
  };

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    window.addEventListener('pointerdown', close);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find(t => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          await handleFiles([new File([blob], `pasted-image.${imgType.split('/')[1] || 'png'}`, { type: imgType })]);
          pushToast('Image pasted from clipboard');
          return;
        }
      }
      setError('No image found in the clipboard.');
    } catch {
      setError('Clipboard access was denied. Use Ctrl/Cmd + V instead.');
    }
  }, [handleFiles, pushToast]);

  const applyFit = useCallback(() => {
    const c = containerRef.current;
    if (!c || !imgW || !imgH) return;
    const s = Math.min((c.clientWidth - 56) / imgW, (c.clientHeight - 56) / imgH, 1);
    setZoom(Math.max(ZOOM_MIN, s));
  }, [imgW, imgH]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const p = getPos(e);
    if (!canvas || !ctx || !p) return;
    if (e.button === 2) return; // right-click opens the context menu instead
    e.preventDefault();
    setMenu(null);
    canvas.setPointerCapture(e.pointerId);

    const el = containerRef.current;
    if ((spaceDownRef.current || e.button === 1) && el) {
      panRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      setIsPanning(true);
      return;
    }

    if (tool === 'select') {
      moveCommittedRef.current = false;
      // A handle on the current selection wins over picking a new object.
      const sel = objects.find(o => o.id === selectedId);
      if (sel) {
        const tol = 9 / Math.max(zoomRef.current, 0.01);
        const h = handlesFor(sel).find(hh => Math.abs(p.x - hh.x) <= tol && Math.abs(p.y - hh.y) <= tol);
        if (h) {
          resizeRef.current = { id: sel.id, handle: h.id, orig: JSON.parse(JSON.stringify(sel)) as DrawObject };
          resizeCommittedRef.current = false;
          return;
        }
      }
      const hit = [...objects].reverse().find(o => hitObject(o, p.x, p.y));
      if (hit) {
        setSelectedId(hit.id);
        moveRef.current = { id: hit.id, last: p, totalX: 0, totalY: 0 };
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'eraser') {
      erasingRef.current = true;
      eraseCommittedRef.current = false;
      const hit = [...objects].reverse().find(o => hitObject(o, p.x, p.y));
      if (hit) {
        eraseCommittedRef.current = true;
        pushHistory(objects);
        setObjects(prev => prev.filter(o => o.id !== hit.id));
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'brush') {
      penRef.current = { points: [p], color, size, opacity };
      return;
    }

    if (shapeTools.includes(tool)) {
      previewRef.current = { tool: tool === 'arrow' ? 'arrow' : shapeKind, color, fillColor, size, fill, opacity, start: p, cur: p };
      return;
    }

    if (tool === 'text') {
      const text = textValue.trim();
      if (!text) { setError('Type some text in the text box first.'); return; }
      pushHistory(objects);
      const obj: DrawObject = { id: nextId(), type: 'text', x: p.x, y: p.y, text, color, size: fontSize, opacity };
      setObjects(prev => [...prev, obj]);
      setSelectedId(obj.id);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const p = getPos(e);
    if (!canvas || !ctx || !p) return;

    const pan = panRef.current;
    if (pan) {
      const c = containerRef.current;
      if (c) {
        c.scrollLeft = pan.scrollLeft - (e.clientX - pan.startX);
        c.scrollTop = pan.scrollTop - (e.clientY - pan.startY);
      }
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      const ring = cursorRingRef.current;
      const c = containerRef.current;
      if (ring && c) {
        const rect = c.getBoundingClientRect();
        const r = Math.max(4, (size * zoom) / 2);
        ring.style.width = `${r * 2}px`;
        ring.style.height = `${r * 2}px`;
        ring.style.transform = `translate(${e.clientX - rect.left + c.scrollLeft - r}px, ${e.clientY - rect.top + c.scrollTop - r}px)`;
        ring.style.borderColor = tool === 'eraser' ? '#94a3b8' : color;
      }
    }

    const resize = resizeRef.current;
    if (resize) {
      if (!resizeCommittedRef.current) {
        resizeCommittedRef.current = true;
        pushHistory(objects);
      }
      setObjects(prev => prev.map(o => o.id === resize.id ? resizeObject(resize.orig, resize.handle, p, e.shiftKey) : o));
      return;
    }

    // Hover feedback on the selection handles.
    if (tool === 'select' && !moveRef.current && canvas) {
      const sel = objects.find(o => o.id === selectedId);
      let cursor = '';
      if (sel) {
        const tol = 9 / Math.max(zoomRef.current, 0.01);
        const h = handlesFor(sel).find(hh => Math.abs(p.x - hh.x) <= tol && Math.abs(p.y - hh.y) <= tol);
        if (h) cursor = HANDLE_CURSOR[h.id];
      }
      canvas.style.cursor = cursor;
    }

    const move = moveRef.current;
    if (move) {
      // Incremental delta: each move applies only the distance travelled since
      // the previous event, so the object tracks the pointer exactly.
      const dx = p.x - move.last.x;
      const dy = p.y - move.last.y;
      if (dx === 0 && dy === 0) return;
      move.last = p;
      move.totalX += dx;
      move.totalY += dy;
      if (!moveCommittedRef.current && (Math.abs(move.totalX) > 2 || Math.abs(move.totalY) > 2)) {
        moveCommittedRef.current = true;
        pushHistory(objects);
      }
      setObjects(prev => prev.map(o => {
        if (o.id !== move.id) return o;
        switch (o.type) {
          case 'stroke': return { ...o, points: o.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
          case 'rect':
          case 'ellipse':
          case 'star': return { ...o, x: o.x + dx, y: o.y + dy };
          case 'line':
          case 'arrow': return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
          case 'text': return { ...o, x: o.x + dx, y: o.y + dy };
        }
        return o;
      }));
      return;
    }

    if (erasingRef.current) {
      const hits = objects.filter(o => hitObject(o, p.x, p.y)).map(o => o.id);
      if (hits.length) {
        setObjects(prev => prev.filter(o => !hits.includes(o.id)));
        setSelectedId(null);
      }
      return;
    }

    const pen = penRef.current;
    if (pen) {
      const last = pen.points[pen.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) >= 0.5) {
        pen.points.push(p);
        redraw();
      }
      return;
    }

    const preview = previewRef.current;
    if (preview) {
      preview.cur = p;
      redraw();
    }
  };

  const onPointerUp = () => {
    if (panRef.current) {
      panRef.current = null;
      setIsPanning(false);
      return;
    }
    if (resizeRef.current) {
      resizeRef.current = null;
      return;
    }
    if (moveRef.current) {
      moveRef.current = null;
      return;
    }
    if (erasingRef.current) {
      erasingRef.current = false;
      return;
    }
    const pen = penRef.current;
    if (pen) {
      if (pen.points.length) {
        pushHistory(objects);
        setObjects(prev => [...prev, { id: nextId(), type: 'stroke', points: pen.points, color: pen.color, size: pen.size, opacity: pen.opacity }]);
      }
      penRef.current = null;
      return;
    }
    const preview = previewRef.current;
    if (preview) {
      const { tool: t, color: c, fillColor: fc, size: s, fill: f, opacity: o, start, cur } = preview;
      previewRef.current = null;
      if (Math.abs(cur.x - start.x) > 3 || Math.abs(cur.y - start.y) > 3) {
        pushHistory(objects);
        const obj = {
          id: nextId(), type: t,
          x: Math.min(start.x, cur.x), y: Math.min(start.y, cur.y),
          w: Math.abs(cur.x - start.x), h: Math.abs(cur.y - start.y),
          x1: start.x, y1: start.y, x2: cur.x, y2: cur.y,
          color: c, fillColor: fc, size: s, fill: f, opacity: o,
        } as DrawObject;
        setObjects(prev => [...prev, obj]);
        setSelectedId(obj.id);
      }
    }
  };

  // ── Export / copy / drag-out ────────────────────────────────
  const composeExport = useCallback((w: number, h: number, bg: 'transparent' | 'white' | 'custom', bgColor: string): HTMLCanvasElement => {
    const base = bgLayerRef.current;
    if (!base) throw new Error('No image to export');
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w));
    out.height = Math.max(1, Math.round(h));
    const ctx = out.getContext('2d')!;
    if (bg === 'white') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, out.width, out.height); }
    if (bg === 'custom') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, out.width, out.height); }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(base, 0, 0, out.width, out.height);
    const sx = out.width / base.width;
    const sy = out.height / base.height;
    ctx.save();
    ctx.scale(sx, sy);
    for (const o of objectsRef.current) drawObject(ctx, o);
    ctx.restore();
    return out;
  }, []);

  const currentExportDims = useCallback((): { w: number; h: number } => {
    const base = bgLayerRef.current;
    if (!base) return { w: 0, h: 0 };
    switch (exportDims) {
      case 'original': {
        const orig = originalRef.current;
        return orig ? { w: orig.w, h: orig.h } : { w: base.width, h: base.height };
      }
      case 'custom':
        return { w: Math.max(1, exportW) || base.width, h: Math.max(1, exportH) || base.height };
      default:
        return { w: base.width, h: base.height };
    }
  }, [exportDims, exportW, exportH]);

  const renderExport = useCallback(async (): Promise<{ blob: Blob; ext: string; w: number; h: number }> => {
    const { w, h } = currentExportDims();
    // JPG has no alpha, so always flatten it onto a solid background.
    const bg = exportFormat === 'image/png' ? exportBg : (exportBg === 'transparent' ? 'white' : exportBg);
    const canvas = composeExport(w, h, bg, exportBgColor);
    const quality = exportFormat === 'image/png' ? undefined : exportQuality / 100;
    const { blob, ext } = await canvasExport(canvas, exportFormat, quality);
    return { blob, ext, w, h };
  }, [currentExportDims, composeExport, exportBg, exportBgColor, exportFormat, exportQuality]);

  const downloadExport = useCallback(async () => {
    try {
      const { blob, ext } = await renderExport();
      downloadBlob(blob, `${exportName || 'drawing'}.${ext}`);
      pushToast('Image downloaded');
    } catch (e) {
      setError(errorMessage(e, 'Could not export the image.'));
    }
  }, [renderExport, exportName, pushToast]);

  const copyImage = useCallback(async () => {
    try {
      const { blob } = await renderExport();
      if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
        setError('Copy isn\'t supported by this browser. Use Download instead.');
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      pushToast('Image copied to clipboard');
    } catch {
      setError('Clipboard access is unavailable. Use Download instead.');
    }
  }, [renderExport, pushToast]);

  const makeExportResult = useCallback(async (): Promise<{ url: string; blob: Blob; w: number; h: number } | null> => {
    try {
      const { blob, w, h } = await renderExport();
      const url = URL.createObjectURL(blob);
      return { url, blob, w, h };
    } catch (e) {
      setError(errorMessage(e, 'Could not export the image.'));
      return null;
    }
  }, [renderExport]);

  const openExport = useCallback(async () => {
    setExportOpen(true);
    setShowOptions(false);
    const res = await makeExportResult();
    if (res) setExportResult(prev => { if (prev) URL.revokeObjectURL(prev.url); return res; });
  }, [makeExportResult]);

  useEffect(() => {
    if (!exportOpen) return;
    const t = window.setTimeout(() => {
      makeExportResult().then(r => { if (r) setExportResult(prev => { if (prev) URL.revokeObjectURL(prev.url); return r; }); });
    }, 300);
    return () => window.clearTimeout(t);
  }, [exportOpen, exportFormat, exportQuality, exportDims, exportW, exportH, exportBg, exportBgColor, objects, makeExportResult]);

  const onDragStart = useCallback((e: React.DragEvent<HTMLImageElement>, result: { url: string; blob: Blob; w: number; h: number }) => {
    const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    e.dataTransfer.setData('text/uri-list', result.url);
    e.dataTransfer.setData('text/plain', result.url);
    try {
      e.dataTransfer.setData('DownloadURL', `image/${ext.replace('jpg', 'jpeg')}:${exportName || 'drawing'}.${ext}:${result.url}`);
    } catch { /* not supported */ }
    try {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    } catch { /* not supported */ }
  }, [exportFormat, exportName]);

  const selectedObj = objects.find(o => o.id === selectedId) ?? null;
  const isShapeTool = shapeTools.includes(tool);
  const isPenTool = tool === 'brush';
  const zoomPct = `${Math.round(zoom * 100)}%`;
  const canvasCursor = isPanning
    ? 'cursor-grabbing'
    : spaceHeld
      ? 'cursor-grab'
      : tool === 'select'
        ? 'cursor-move'
        : 'cursor-crosshair';

  if (!file) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length) handleFiles(files);
          }}
          className={`relative rounded-2xl border-2 border-dashed bg-card p-6 sm:p-10 text-center transition-colors ${isDragging ? 'border-primary bg-primary/[0.06]' : 'border-border'}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center mb-4">
            <PenLine className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Draw on images privately in your browser
          </h3>
          <p className="text-[13px] text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
            Annotate with brush, shapes, arrows and text, then export, your image never leaves your device.
          </p>

          <div className="mt-7 mx-auto max-w-md rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors">
            <div className="w-12 h-12 rounded-xl bg-muted border border-border mx-auto flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mt-3">
              {isDragging ? 'Drop it to open' : 'Drop an image here'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">or use the buttons below to browse your files</p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <button type="button" onClick={() => landingInputRef.current?.click()} className="btn-primary px-5 py-2.5 text-[13px] rounded-lg">
              <Upload className="w-4 h-4" /> Upload Image
            </button>
            <button type="button" onClick={() => pushToast('Press Ctrl/Cmd + V to paste an image')} className="btn-secondary px-5 py-2.5 text-[13px] rounded-lg">
              <ClipboardPaste className="w-4 h-4" /> Paste Image
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-5 font-medium tracking-wide">
            JPG • PNG • WebP
          </p>
          <p className="text-[11px] text-success font-medium mt-4 inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Processed locally in your browser, nothing is uploaded
          </p>
        </div>
        <input
          ref={landingInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
        {error && <div className="mt-3"><ErrorNotice message={error} /></div>}
        {toast && (
          <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border bg-card border-emerald-200 dark:border-emerald-500/30 fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">{toast}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-muted dark:bg-[#0b0b12] text-foreground ">
      <header className="shrink-0 h-14 flex items-center gap-2 px-3 border-b dark:bg-[#12121a] dark:border-white/[0.08] bg-card border-border z-10 overflow-x-auto">
        <HdrBtn onClick={() => { setFile(null); setError(null); }} title="Close editor">
          <X className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={() => fileInputRef.current?.click()} title="Load another image">
          <RefreshCw className="w-4 h-4" />
        </HdrBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />

        <div className="min-w-0 flex-1 flex items-center gap-2.5">
          <div className="w-7 h-8 rounded-md overflow-hidden  bg-card border  border-border flex items-center justify-center shrink-0">
            <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold  text-foreground truncate">{file.name}</div>
            <div className="text-[10px] font-mono  text-muted-foreground">
              {imgW || '…'} × {imgH || '…'}px · {objects.length} object{objects.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <HdrBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-4 h-4" />
        </HdrBtn>
        {confirmClear ? (
          <div className="flex items-center gap-1.5 shrink-0 rounded-lg border dark:border-rose-500/40 border-rose-300 dark:bg-rose-500/10 bg-rose-50 px-1.5 py-1 fade-in">
            <span className="text-[10px] font-semibold dark:text-rose-300 text-rose-600 pl-1 whitespace-nowrap">Clear everything?</span>
            <button type="button" onClick={() => { clear(); setConfirmClear(false); }} className="h-7 px-2.5 rounded-md text-[11px] font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors">Clear</button>
            <button type="button" onClick={() => setConfirmClear(false)} className="h-7 px-2.5 rounded-md text-[11px] font-medium dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground transition-colors">Cancel</button>
          </div>
        ) : (
          <HdrBtn onClick={() => { if (objects.length) setConfirmClear(true); }} title="Remove all drawings">
            <Trash2 className="w-4 h-4" />
          </HdrBtn>
        )}

        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border dark:border-white/[0.08] border-border shrink-0">
          <button onClick={() => setZoom(Math.max(ZOOM_MIN, zoom / 1.25))} title="Zoom out" aria-label="Zoom out"
            className="w-7 h-7 rounded-md flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, z * 1.25))} title="Zoom in" aria-label="Zoom in"
            className="w-7 h-7 rounded-md flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center text-[11px] font-mono  text-muted-foreground select-none">{zoomPct}</span>
          <button onClick={applyFit} title="Fit to screen" aria-label="Fit to screen"
            className="w-7 h-7 rounded-md flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(1)} title="Actual size (100%)" aria-label="Actual size"
            className="w-7 h-7 rounded-md flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <span className="text-[9px] font-bold">1:1</span>
          </button>
        </div>

        <HdrBtn onClick={copyImage} title="Copy image to clipboard">
          <Copy className="w-4 h-4" /> <span className="hidden md:inline">Copy</span>
        </HdrBtn>
        <div className="flex items-center shrink-0 rounded-lg overflow-hidden">
          <button onClick={downloadExport} className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={openExport} title="Export options" aria-label="Export options"
            className="h-9 px-2 inline-flex items-center bg-primary hover:brightness-110 text-primary-foreground transition-all border-l border-primary-foreground/20">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        <nav className="shrink-0 flex lg:flex-col gap-1 p-2 border-r dark:bg-[#12121a] dark:border-white/[0.08] bg-card border-border overflow-x-auto lg:overflow-y-auto lg:w-[68px] lg:p-1.5">
          {TOOL_ORDER.map(t => (
            <RailBtn key={t.id} active={tool === t.id} onClick={() => setTool(t.id)} title={t.label} shortcut={t.shortcut} label={t.label}>
              <t.Icon className="w-[18px] h-[18px]" />
            </RailBtn>
          ))}
        </nav>

        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          <div ref={containerRef} className="flex-1 min-h-0 overflow-auto relative">
            <div className="min-w-full min-h-full flex">
              <div className="m-auto p-4">
                <div
                  className="checkerboard rounded-lg overflow-hidden border shadow-lg dark:border-white/10 border-border"
                  style={{ width: Math.max(2, imgW * zoom), height: Math.max(2, imgH * zoom) }}
                >
                  <canvas
                    ref={canvasRef}
                    style={{ width: imgW * zoom, height: imgH * zoom }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onContextMenu={openMenu}
                    onPointerLeave={(ev) => {
                      ev.currentTarget.style.cursor = '';
                      onPointerUp();
                      if (cursorRingRef.current) cursorRingRef.current.style.visibility = 'hidden';
                    }}
                    className={`block touch-none ${canvasCursor}`}
                    aria-label="Drawing canvas"
                  />
                </div>
              </div>
            </div>
            <div
              ref={cursorRingRef}
              className={`pointer-events-none absolute top-0 left-0 z-20 rounded-full border-2 ${tool === 'eraser' ? 'border-dashed' : 'border-solid'}`}
              style={{ visibility: 'hidden', borderColor: '#ef4444' }}
            />
          </div>

          <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-1.5 border-t dark:bg-[#12121a] dark:border-white/[0.08] bg-card border-border text-[11px]">
            <p className=" text-muted-foreground truncate flex-1">
              {isPanning ? 'Dragging to pan…' : HINT_BY_TOOL[tool]}{' '}
              <span className="hidden md:inline  text-muted-foreground">· Ctrl+Z undo · Ctrl+Shift+Z redo · Ctrl+D duplicate · Del delete</span>
              <span className="hidden sm:inline  text-muted-foreground"> · Hold Space to pan · Right-click for quick actions</span>
            </p>
            <span className=" text-muted-foreground font-mono shrink-0">{objects.length} object{objects.length === 1 ? '' : 's'} · {zoomPct}</span>
          </div>
        </main>

        {showOptions && (
          <div className="absolute lg:hidden inset-0 bg-black/50 z-30" onClick={() => setShowOptions(false)} />
        )}
        <aside className={`${showOptions ? 'flex' : 'hidden'} lg:flex absolute lg:static top-14 h-[calc(100%-3.5rem)] lg:h-auto right-0 w-72 max-w-[88vw] z-40 lg:z-auto flex-col gap-5 p-4 overflow-y-auto border-l  dark:border-white/[0.08] bg-card border-border`}>
          <div>
            <h3 className="section-kicker mb-3">Style</h3>
            <label className="block">
              <FieldLabel>Color</FieldLabel>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-11 h-10 rounded-lg border dark:border-white/[0.14] border-border cursor-pointer"
                  aria-label="Drawing color"
                />
                <span className="font-mono text-[11px]  text-muted-foreground">{color}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    title={c}
                    aria-label={`Color ${c}`}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-dark-card' : ''} dark:border-white/20 border-border`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </label>
            <div className="mt-3">
              <RangeField label="Opacity" value={Math.round(opacity * 100)} min={5} max={100} suffix="%" onChange={(v) => setOpacity(v / 100)} />
            </div>
            {(isPenTool || isShapeTool) && (
              <div className="mt-3">
                <RangeField label="Brush size" value={size} min={1} max={80} suffix="px" onChange={setSize} />
                <div className="flex items-center gap-1.5 mt-2">
                  {BRUSH_SIZES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      title={`${s}px`}
                      aria-label={`${s}px brush`}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${size === s ? 'dark:border-primary/50 dark:bg-primary/15 bg-primary-container border-primary/40' : 'dark:border-white/[0.1] dark:hover:bg-white/[0.06] border-border hover:bg-muted'}`}
                    >
                      <span
                        className="rounded-full bg-background"
                        style={{ width: Math.min(12, Math.max(3, s / 4)), height: Math.min(12, Math.max(3, s / 4)) }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {tool === 'shapes' && (
              <div className="mt-3">
                <FieldLabel>Shape</FieldLabel>
                <div className="grid grid-cols-4 gap-1.5">
                  {SHAPE_KINDS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShapeKind(s.id)}
                      title={s.label}
                      aria-label={s.label}
                      className={`h-10 rounded-lg flex items-center justify-center border transition-colors ${shapeKind === s.id
                        ? 'dark:border-primary/50 dark:bg-primary/15 dark:text-primary bg-primary-container border-primary/40 text-on-primary-container'
                        : 'dark:border-white/[0.1] dark:hover:bg-white/[0.06] border-border hover:bg-muted text-muted-foreground'}`}
                    >
                      <s.Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isShapeTool && shapeKind !== 'line' && tool !== 'arrow' && (
              <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer select-none mt-3">
                <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span>Fill shape</span>
              </label>
            )}
            {tool === 'text' && (
              <>
                <div className="mt-3">
                  <FieldLabel>Text</FieldLabel>
                  <input
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary dark:bg-white/[0.07] dark:border-white/[0.14]  bg-card border-border text-foreground"
                  />
                </div>
                <div className="mt-3">
                  <RangeField label="Font size" value={fontSize} min={12} max={160} suffix="px" onChange={setFontSize} />
                </div>
              </>
            )}
          </div>

          {selectedObj && (
            <div className="rounded-xl border dark:border-primary/25 border-primary/30 dark:bg-primary/[0.07] bg-primary-container p-3">
              <h3 className="section-kicker mb-2.5 flex items-center gap-1.5 dark:text-primary/40 text-on-primary-container">
                Selected {TYPE_META[selectedObj.type].label}
              </h3>
              {selectedObj.type === 'text' && (
                <div className="mb-2.5">
                  <FieldLabel>Text content</FieldLabel>
                  <input
                    value={selectedObj.text}
                    onFocus={() => { textEditPushedRef.current = false; }}
                    onChange={(e) => {
                      if (!textEditPushedRef.current) {
                        textEditPushedRef.current = true;
                        pushHistory(objects);
                      }
                      const id = selectedObj.id;
                      setObjects(prev => prev.map(o => o.id === id && o.type === 'text' ? { ...o, text: e.target.value } : o));
                    }}
                    className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 dark:bg-white/[0.07] dark:border-white/[0.14]  bg-card border-border text-foreground"
                  />
                </div>
              )}
              <RangeField label="Opacity" value={Math.round((selectedObj.opacity ?? 1) * 100)} min={5} max={100} suffix="%" onChange={(v) => setObjOpacity(v / 100)} />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <HdrBtn onClick={duplicate} title="Duplicate (Ctrl+D)" className="h-8 px-2.5">
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </HdrBtn>
                <HdrBtn onClick={() => moveLayer(selectedObj.id, 1)} title="Bring forward" className="h-8 px-2.5">
                  <ArrowUp className="w-3.5 h-3.5" />
                </HdrBtn>
                <HdrBtn onClick={() => moveLayer(selectedObj.id, -1)} title="Send backward" className="h-8 px-2.5">
                  <ArrowDown className="w-3.5 h-3.5" />
                </HdrBtn>
                <HdrBtn onClick={deleteSelected} title="Delete (Del)" className="h-8 px-2.5 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/30">
                  <Delete className="w-3.5 h-3.5" /> Delete
                </HdrBtn>
              </div>
            </div>
          )}

          <div className="shrink-0 rounded-xl border border-border dark:border-white/[0.08] p-3">
            <h3 className="section-kicker mb-2.5 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export
            </h3>
            <FieldLabel>Format</FieldLabel>
            <div className="flex gap-1.5">
              {[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setExportFormat(v)}
                  className={`flex-1 h-8 rounded-lg text-[11px] font-semibold border transition-colors ${exportFormat === v
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-border dark:border-white/[0.1] text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}`}>
                  {l}
                </button>
              ))}
            </div>
            {exportFormat !== 'image/png' && (
              <div className="mt-3">
                <RangeField label="Quality" value={exportQuality} min={50} max={100} step={5} suffix="%" onChange={setExportQuality} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button type="button" onClick={copyImage}
                className="h-9 rounded-lg text-[11px] font-semibold border border-border dark:border-white/[0.1] text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06] transition-colors inline-flex items-center justify-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> Copy image
              </button>
              <button type="button" onClick={downloadExport}
                className="h-9 rounded-lg text-[11px] font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-colors inline-flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
            <button type="button" onClick={openExport}
              className="mt-2 w-full h-8 rounded-lg text-[11px] font-medium text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06] transition-colors inline-flex items-center justify-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" /> More export options…
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-kicker">Layers</h3>
              <span className="text-[10px] font-mono  text-muted-foreground">{objects.length}</span>
            </div>
            {objects.length === 0 ? (
              <p className="text-[11px]  text-muted-foreground leading-relaxed">
                Nothing drawn yet. Pick a tool from the left and start drawing.
              </p>
            ) : (
              <ul className="space-y-1">
                {[...objects].reverse().map(o => {
                  const meta = TYPE_META[o.type];
                  const active = o.id === selectedId;
                  return (
                    <li key={o.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedId(o.id)}
                        className={`flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 rounded-lg border text-left transition-colors
                          ${active
                            ? 'dark:bg-primary/15 dark:border-primary/40 dark:text-primary/30 bg-primary-container border-primary/40 text-on-primary-container'
                            : 'dark:bg-white/[0.03] dark:border-white/[0.07] dark:hover:bg-white/[0.06]  bg-card border-border hover:bg-muted text-muted-foreground'}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 border dark:border-white/20 border-border" style={{ backgroundColor: o.color }} />
                        <span className="text-[11px] truncate flex-1">{meta.label}</span>
                        <meta.Icon className="w-3 h-3  text-muted-foreground shrink-0" />
                      </button>
                      <button onClick={() => moveLayer(o.id, 1)} title="Bring forward" aria-label="Bring forward"
                        className="w-6 h-6 rounded-md flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground shrink-0">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveLayer(o.id, -1)} title="Send backward" aria-label="Send backward"
                        className="w-6 h-6 rounded-md flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground shrink-0">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {exportOpen && (
          <>
            <div className="absolute inset-0 z-[45] lg:hidden bg-black/50" onClick={() => setExportOpen(false)} />
            <div className="absolute top-14 right-0 bottom-0 z-[46] w-80 max-w-[92vw] flex flex-col border-l bg-card dark:bg-[#12121a] border-border dark:border-white/[0.08] shadow-2xl fade-in">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
                <h3 className="section-kicker flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export Image</h3>
                <button type="button" onClick={() => setExportOpen(false)} title="Close export panel" aria-label="Close export panel"
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted dark:hover:bg-white/[0.06] text-muted-foreground shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-4">
                {exportResult ? (
                  <div className="rounded-xl border border-border dark:border-white/[0.08] bg-muted dark:bg-white/[0.03] p-2.5">
                    <img
                      src={exportResult.url}
                      alt="Export preview"
                      draggable
                      onDragStart={(e) => onDragStart(e, exportResult)}
                      className="w-full max-h-56 object-contain cursor-grab mx-auto"
                    />
                    <div className="flex items-center justify-between mt-2 px-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground">{exportResult.w} × {exportResult.h} · {formatBytes(exportResult.blob.size)}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">drag to drop</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl border border-border dark:border-white/[0.08] flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                )}
                <div>
                  <FieldLabel>Format</FieldLabel>
                  <div className="flex gap-1.5">
                    {[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setExportFormat(v)}
                        className={`flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-colors ${exportFormat === v ? 'bg-primary/10 border-primary text-primary' : 'border-border dark:border-white/[0.1] text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {exportFormat !== 'image/png' && (
                  <div>
                    <RangeField label="Quality" value={exportQuality} min={50} max={100} step={5} suffix="%" onChange={setExportQuality} />
                  </div>
                )}
                {exportFormat === 'image/png' && (
                  <div>
                    <FieldLabel>Background</FieldLabel>
                    <div className="flex gap-1.5">
                      {([['transparent', 'Transparent'], ['white', 'White'], ['custom', 'Custom']] as ['transparent' | 'white' | 'custom', string][]).map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setExportBg(v)}
                          className={`flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-colors ${exportBg === v ? 'bg-primary/10 border-primary text-primary' : 'border-border dark:border-white/[0.1] text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    {exportBg === 'custom' && (
                      <div className="flex items-center gap-2.5 mt-3">
                        <input type="color" value={exportBgColor} onChange={(e) => setExportBgColor(e.target.value)}
                          className="w-11 h-10 rounded-lg border border-border dark:border-white/[0.14] cursor-pointer" aria-label="Background color" />
                        <span className="font-mono text-[11px] text-muted-foreground">{exportBgColor}</span>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <FieldLabel>Dimensions</FieldLabel>
                  <div className="flex gap-1.5">
                    {([['current', 'Current'], ['original', 'Original'], ['custom', 'Custom']] as ['current' | 'original' | 'custom', string][]).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setExportDims(v)}
                        className={`flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-colors ${exportDims === v ? 'bg-primary/10 border-primary text-primary' : 'border-border dark:border-white/[0.1] text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {exportDims === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <input type="number" value={exportW} min={1} max={MAX_DIM} onChange={(e) => setExportW(Number(e.target.value))}
                        className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 bg-card dark:bg-white/[0.07] border-border dark:border-white/[0.14] text-foreground" placeholder="Width" aria-label="Export width" />
                      <input type="number" value={exportH} min={1} max={MAX_DIM} onChange={(e) => setExportH(Number(e.target.value))}
                        className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 bg-card dark:bg-white/[0.07] border-border dark:border-white/[0.14] text-foreground" placeholder="Height" aria-label="Export height" />
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel>Filename</FieldLabel>
                  <input value={exportName} onChange={(e) => setExportName(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 bg-card dark:bg-white/[0.07] border-border dark:border-white/[0.14] text-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={copyImage} className="h-10 rounded-lg text-xs font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-colors inline-flex items-center justify-center gap-1.5">
                    <Copy className="w-4 h-4" /> Copy Image
                  </button>
                  <button type="button" onClick={() => downloadExport()} className="h-10 rounded-lg text-xs font-semibold border border-border dark:border-white/[0.1] text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06] transition-colors inline-flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Drag the preview to another app. Drag-out isn't supported everywhere, use <span className="text-muted-foreground font-medium">Copy Image</span> or <span className="text-muted-foreground font-medium">Download</span> as a fallback.
                </p>
              </div>
            </div>
          </>
        )}

        <div className="absolute bottom-16 right-3 sm:hidden z-40 flex items-center gap-0.5 rounded-xl border dark:bg-[#12121a] dark:border-white/[0.12] bg-card border-border shadow-lg p-1">
          <button onClick={() => setZoom(Math.max(ZOOM_MIN, zoom / 1.25))} title="Zoom out" aria-label="Zoom out"
            className="w-8 h-8 rounded-lg flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-11 text-center text-[11px] font-mono  text-muted-foreground select-none">{zoomPct}</span>
          <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, z * 1.25))} title="Zoom in" aria-label="Zoom in"
            className="w-8 h-8 rounded-lg flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={applyFit} title="Fit to screen" aria-label="Fit to screen"
            className="w-8 h-8 rounded-lg flex items-center justify-center dark:hover:bg-white/[0.06] hover:bg-muted  text-muted-foreground">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <HdrBtn
          onClick={() => setShowOptions(v => !v)}
          title="Style & layers"
          className="absolute bottom-3 right-3 lg:hidden z-40 h-10 w-10 rounded-xl shadow-lg"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </HdrBtn>
      </div>

      {error && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-md">
          <ErrorNotice message={error} />
        </div>
      )}
      {menu && (
        <div
          role="menu"
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          className="fixed z-[80] w-56 p-1.5 rounded-xl border shadow-2xl fade-in bg-card border-border dark:bg-[#12121a] dark:border-white/[0.1]"
          style={{
            left: Math.max(8, Math.min(menu.x, (typeof window !== 'undefined' ? window.innerWidth : 0) - 240)),
            top: Math.max(8, Math.min(menu.y, (typeof window !== 'undefined' ? window.innerHeight : 0) - (menu.targetId ? 400 : 470))),
          }}
        >
          <div className="px-1 pt-0.5 pb-1">
            <div className="px-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tools</div>
            <div className="grid grid-cols-6 gap-0.5">
              {TOOL_ORDER.map(t => (
                <button
                  key={t.id}
                  type="button"
                  title={`${t.label} (${t.shortcut})`}
                  aria-label={`Switch to ${t.label}`}
                  onClick={() => { setTool(t.id); setMenu(null); }}
                  className={`h-8 rounded-lg flex items-center justify-center border transition-colors ${tool === t.id
                    ? 'dark:bg-primary/20 dark:border-primary/40 dark:text-primary bg-primary-container border-primary/40 text-on-primary-container'
                    : 'border-transparent text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06]'}`}
                >
                  <t.Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
          <MenuSep />
          {menu.targetId ? (
            <>
              <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {TYPE_META[(objects.find(o => o.id === menu.targetId)?.type) ?? 'stroke'].label}
              </div>
              <MenuItem Icon={MousePointer2} shortcut="V" onClick={() => { setTool('select'); setMenu(null); }}>Pointer (move objects)</MenuItem>
              <MenuItem Icon={Copy} shortcut="Ctrl+D" onClick={() => { duplicate(); setMenu(null); }}>Duplicate</MenuItem>
              <MenuItem Icon={ArrowUp} onClick={() => { moveLayer(menu.targetId!, 1); setMenu(null); }}>Bring forward</MenuItem>
              <MenuItem Icon={ArrowDown} onClick={() => { moveLayer(menu.targetId!, -1); setMenu(null); }}>Send backward</MenuItem>
              <MenuSep />
              <MenuItem Icon={Undo2} shortcut="Ctrl+Z" disabled={!canUndo} onClick={() => { undo(); setMenu(null); }}>Undo</MenuItem>
              <MenuItem Icon={Redo2} shortcut="Ctrl+⇧+Z" disabled={!canRedo} onClick={() => { redo(); setMenu(null); }}>Redo</MenuItem>
              <MenuSep />
              <MenuItem Icon={ImageIcon} onClick={() => { copyImage(); setMenu(null); }}>Copy image</MenuItem>
              <MenuItem Icon={Download} onClick={() => { downloadExport(); setMenu(null); }}>Export image</MenuItem>
              <MenuSep />
              <MenuItem Icon={Delete} shortcut="Del" danger onClick={() => { deleteSelected(); setMenu(null); }}>Delete</MenuItem>
            </>
          ) : (
            <>
              <MenuItem Icon={MousePointer2} shortcut="V" onClick={() => { setTool('select'); setMenu(null); }}>Pointer (move objects)</MenuItem>
              <MenuSep />
              <MenuItem Icon={Undo2} shortcut="Ctrl+Z" disabled={!canUndo} onClick={() => { undo(); setMenu(null); }}>Undo</MenuItem>
              <MenuItem Icon={Redo2} shortcut="Ctrl+⇧+Z" disabled={!canRedo} onClick={() => { redo(); setMenu(null); }}>Redo</MenuItem>
              <MenuSep />
              <MenuItem Icon={ImageIcon} onClick={() => { copyImage(); setMenu(null); }}>Copy image</MenuItem>
              <MenuItem Icon={Download} onClick={() => { downloadExport(); setMenu(null); }}>Export image</MenuItem>
              <MenuItem Icon={Settings2} onClick={() => { openExport(); setMenu(null); }}>Export options…</MenuItem>
              <MenuSep />
              <MenuItem Icon={Maximize2} onClick={() => { applyFit(); setMenu(null); }}>Fit to screen</MenuItem>
              <MenuItem Icon={ZoomIn} onClick={() => { setZoom(1); setMenu(null); }}>Actual size (100%)</MenuItem>
              <MenuSep />
              <MenuItem Icon={ClipboardPaste} shortcut="Ctrl+V" onClick={() => { pasteFromClipboard(); setMenu(null); }}>Paste image</MenuItem>
              <MenuItem Icon={RefreshCw} onClick={() => { fileInputRef.current?.click(); setMenu(null); }}>Replace image</MenuItem>
              <MenuSep />
              <MenuItem Icon={Trash2} danger disabled={!objects.length} onClick={() => { clear(); setMenu(null); }}>Clear all drawings</MenuItem>
            </>
          )}
        </div>
      )}

      {toast && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border dark:bg-[#12121a] dark:border-emerald-500/30 bg-card border-emerald-200 shadow-lg fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium  text-muted-foreground">{toast}</span>
        </div>
      )}
    </div>
  );
};
