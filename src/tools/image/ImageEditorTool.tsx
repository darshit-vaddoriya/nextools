import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PenLine, Highlighter, Eraser, Undo2, Redo2, Trash2, Download, X, Image as ImageIcon,
  MousePointer2, Square, Circle, Minus, MoveRight, Type, Delete, Star, Crop,
  ZoomIn, ZoomOut, Maximize2, Copy, ArrowUp, ArrowDown, ArrowLeft, SlidersHorizontal, RefreshCw,
  CheckCircle2, RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2,
  Upload, ClipboardPaste, Sparkles, SunMedium, Lock, Shapes, Grid3x3,
  AlignLeft, AlignCenter, AlignRight, Settings2,
  Layers as LayersIcon, Ruler, Aperture, Pipette, Plus,
} from 'lucide-react';
import { ErrorNotice } from './ImageShared';
import { Select } from '../../components/Select';
import {
  loadImage, canvasExport, downloadBlob, baseNameFrom, formatBytes, clamp,
  applyUnsharp,
} from './ImageUtils';
import { errorMessage } from '../../utils/errorMessage';

const MAX_DIM = 2800;
const WARN_DIM = 6000;
const WARN_SIZE = 50 * 1024 * 1024;
const HISTORY_LIMIT = 30;
const ZOOM_MIN = 0.05;
const ZOOM_MAX = 5;

const SUPPORTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif', 'image/svg+xml']);
const SUPPORTED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg']);

const FONT_FAMILIES = [
  'Arial, Helvetica, sans-serif',
  'Georgia, serif',
  '"Courier New", monospace',
  '"Times New Roman", serif',
  'Verdana, sans-serif',
  'Impact, sans-serif',
  '"Trebuchet MS", sans-serif',
  '"Comic Sans MS", cursive',
];

type ToolGroup = 'Transform' | 'Draw' | 'Effects';

const TOOL_ORDER: { id: ToolId; label: string; shortcut: string; Icon: React.ElementType; group: ToolGroup }[] = [
  { id: 'select', label: 'Move / Select', shortcut: 'V', Icon: MousePointer2, group: 'Transform' },
  { id: 'crop', label: 'Crop', shortcut: 'C', Icon: Crop, group: 'Transform' },
  { id: 'resize', label: 'Resize', shortcut: 'R', Icon: Ruler, group: 'Transform' },
  { id: 'rotate', label: 'Rotate & Flip', shortcut: '', Icon: RotateCw, group: 'Transform' },
  { id: 'brush', label: 'Brush', shortcut: 'B', Icon: PenLine, group: 'Draw' },
  { id: 'highlighter', label: 'Highlighter', shortcut: 'M', Icon: Highlighter, group: 'Draw' },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', Icon: Eraser, group: 'Draw' },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', Icon: MoveRight, group: 'Draw' },
  { id: 'shapes', label: 'Shapes', shortcut: 'S', Icon: Shapes, group: 'Draw' },
  { id: 'text', label: 'Text', shortcut: 'T', Icon: Type, group: 'Draw' },
  { id: 'blur', label: 'Blur', shortcut: 'U', Icon: Aperture, group: 'Effects' },
  { id: 'pixelate', label: 'Pixelate', shortcut: 'P', Icon: Grid3x3, group: 'Effects' },
  { id: 'eyedropper', label: 'Eyedropper', shortcut: 'I', Icon: Pipette, group: 'Effects' },
  { id: 'adjust', label: 'Adjustments', shortcut: '', Icon: SunMedium, group: 'Effects' },
];

const TOOL_GROUPS: ToolGroup[] = ['Transform', 'Draw', 'Effects'];

const TYPE_META: Record<string, { label: string; Icon: React.ElementType }> = {
  stroke: { label: 'Brush stroke', Icon: PenLine },
  marker: { label: 'Highlight', Icon: Highlighter },
  rect: { label: 'Rectangle', Icon: Square },
  ellipse: { label: 'Ellipse', Icon: Circle },
  star: { label: 'Star', Icon: Star },
  line: { label: 'Line', Icon: Minus },
  arrow: { label: 'Arrow', Icon: MoveRight },
  text: { label: 'Text', Icon: Type },
  blurrect: { label: 'Blur area', Icon: Aperture },
  pixelrect: { label: 'Pixelate area', Icon: Plus },
  blurstroke: { label: 'Blur stroke', Icon: Aperture },
  pixelstroke: { label: 'Pixelate stroke', Icon: Plus },
};

const HINT_BY_TOOL: Record<ToolId, string> = {
  select: 'Click an object to select it, then drag to move. Del removes the selection.',
  crop: 'Drag the crop handles to choose an area, then press Apply. Hold Shift to keep a free ratio.',
  resize: 'Change the image dimensions, or apply a scale percentage or preset.',
  rotate: 'Rotate or flip the image in one click.',
  brush: 'Click and drag to draw a freehand brush stroke.',
  highlighter: 'Drag over the image like a translucent marker.',
  eraser: 'Click or drag over objects to erase them. Objects are removed as a whole.',
  shapes: 'Pick a shape below, then click and drag to draw it.',
  arrow: 'Drag to draw an arrow.',
  text: 'Click anywhere to place your text.',
  blur: 'Drag over faces or text to blur them.',
  pixelate: 'Drag over areas to pixelate them.',
  eyedropper: 'Click anywhere on the image to sample its color.',
  adjust: 'Fine-tune brightness, contrast, saturation and more.',
};

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#facc15', '#f8fafc', '#94a3b8', '#111827',
];

const BRUSH_SIZES = [2, 4, 8, 16, 32, 64];

const TOOL_KEYS: Record<string, ToolId> = {
  v: 'select', c: 'crop', r: 'resize', b: 'brush', m: 'highlighter', e: 'eraser',
  s: 'shapes', a: 'arrow', t: 'text', u: 'blur', p: 'pixelate', i: 'eyedropper',
};

const CROP_RATIOS: { label: string; ratio: number | null }[] = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:5', ratio: 4 / 5 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '9:16', ratio: 9 / 16 },
  { label: 'A4', ratio: 1 / 1.4142 },
];

const RESIZE_PRESETS = [
  { label: 'Instagram Square', w: 1080, h: 1080 },
  { label: 'Instagram Portrait', w: 1080, h: 1350 },
  { label: 'Story / Reels', w: 1080, h: 1920 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'HD', w: 1920, h: 1080 },
];

const PERCENT_PRESETS = [25, 50, 75, 100, 150, 200];

const ADJUST_LABELS: Record<string, string> = {
  brightness: 'Brightness', contrast: 'Contrast', saturation: 'Saturation', exposure: 'Exposure',
  blur: 'Blur', sharpen: 'Sharpen', temp: 'Warmth',
};

const FILTERS: Record<string, { label: string; adj: Partial<Adjustments> }> = {
  original: { label: 'Original', adj: {} },
  grayscale: { label: 'Grayscale', adj: { grayscale: true } },
  sepia: { label: 'Sepia', adj: { sepia: true } },
  bright: { label: 'Bright', adj: { brightness: 35, contrast: 8 } },
  highcontrast: { label: 'High Contrast', adj: { contrast: 55 } },
  cool: { label: 'Cool', adj: { temp: -45 } },
  warm: { label: 'Warm', adj: { temp: 45 } },
  vintage: { label: 'Vintage', adj: { sepia: true, contrast: -12, brightness: 6, saturation: -12 } },
};

type ToolId = 'select' | 'crop' | 'resize' | 'rotate' | 'brush' | 'highlighter' | 'eraser' | 'shapes' | 'arrow' | 'text' | 'blur' | 'pixelate' | 'eyedropper' | 'adjust';

interface Point { x: number; y: number; }

type DrawObject =
  | { id: string; type: 'stroke' | 'marker'; points: Point[]; color: string; size: number; opacity?: number }
  | { id: string; type: 'rect' | 'ellipse' | 'star'; x: number; y: number; w: number; h: number; color: string; fillColor: string; size: number; fill: boolean; opacity?: number }
  | { id: string; type: 'line' | 'arrow'; x1: number; y1: number; x2: number; y2: number; color: string; size: number; doubleHead?: boolean; opacity?: number }
  | { id: string; type: 'text'; x: number; y: number; text: string; color: string; size: number; fontFamily: string; bold: boolean; italic: boolean; underline: boolean; bg: boolean; align?: 'left' | 'center' | 'right'; opacity?: number }
  | { id: string; type: 'blurrect' | 'pixelrect'; x: number; y: number; w: number; h: number; strength: number }
  | { id: string; type: 'blurstroke' | 'pixelstroke'; points: Point[]; strength: number };

interface Adjustments {
  brightness: number; contrast: number; saturation: number; exposure: number;
  blur: number; sharpen: number; temp: number; grayscale: boolean; sepia: boolean; invert: boolean;
}

interface HistoryEntry { raster: HTMLCanvasElement | null; objects: DrawObject[]; }

let idCounter = 0;
const nextId = () => `ie${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const shapeTools: ToolId[] = ['shapes', 'arrow'];
const strokeTools: ToolId[] = ['brush', 'highlighter'];
const effectTools: ToolId[] = ['blur', 'pixelate'];

const SHAPE_CHOICES: { id: 'rect' | 'ellipse' | 'star' | 'line'; label: string; Icon: React.ElementType }[] = [
  { id: 'rect', label: 'Rectangle', Icon: Square },
  { id: 'ellipse', label: 'Ellipse', Icon: Circle },
  { id: 'star', label: 'Star', Icon: Star },
  { id: 'line', label: 'Line', Icon: Minus },
];

const PANEL_TOOLS: ToolId[] = ['select', 'crop', 'resize', 'rotate', 'adjust'];

const NEUTRAL_ADJ: Adjustments = { brightness: 0, contrast: 0, saturation: 0, exposure: 0, blur: 0, sharpen: 0, temp: 0, grayscale: false, sepia: false, invert: false };

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
  onGestureStart?: () => void;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, suffix = '', onGestureStart, onChange }) => {
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
        onPointerDown={onGestureStart}
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
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, title, disabled, active, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    className={`h-9 px-2.5 rounded-lg inline-flex items-center justify-center gap-1.5 text-xs font-medium transition-colors border shrink-0
      ${active
        ? 'bg-primary/10 border-primary text-primary'
        : ' text-muted-foreground hover:bg-muted border-border'}
      disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

const RailBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  title: string;
  shortcut?: string;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ active, onClick, title, shortcut, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    disabled={disabled}
    className={`relative group w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors border
      ${active
        ? 'bg-primary/10 border-primary text-primary'
        : ' dark:border-transparent text-muted-foreground hover:bg-muted border-transparent'}
      disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
    {shortcut && (
      <span className="pointer-events-none absolute z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150
        left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 rounded-md text-[10px] font-medium
        dark:bg-zinc-800  dark:border 
        bg-slate-900 text-white border border-slate-700 shadow-lg
        lg:left-full lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:ml-2 lg:mt-0">
        {title}
        <kbd className="ml-1.5 font-mono opacity-70">{shortcut}</kbd>
      </span>
    )}
  </button>
);

function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  return out;
}

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

function drawObject(ctx: CanvasRenderingContext2D, o: DrawObject, scale = 1) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const alpha = 'opacity' in o ? o.opacity ?? 1 : 1;
  ctx.globalAlpha = alpha;
  switch (o.type) {
    case 'stroke':
    case 'marker': {
      const pts = o.points.map(p => ({ x: p.x * scale, y: p.y * scale }));
      if (pts.length === 1) {
        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, (o.size * scale) / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      if (o.type === 'marker') {
        ctx.globalAlpha = (o.opacity ?? 0.4) * 0.45;
        ctx.lineWidth = Math.max(8, (o.size * scale) * 2.2);
      } else {
        ctx.lineWidth = o.size * scale;
      }
      ctx.strokeStyle = o.color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 2) {
        ctx.lineTo(pts[1].x, pts[1].y);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
      break;
    }
    case 'rect': {
      const rw = Math.abs(o.w) * scale;
      const rh = Math.abs(o.h) * scale;
      const rx = Math.min(o.x, o.x + o.w) * scale;
      const ry = Math.min(o.y, o.y + o.h) * scale;
      ctx.lineWidth = o.size * scale;
      if (o.fill) {
        ctx.fillStyle = o.fillColor;
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillRect(rx, ry, rw, rh);
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = o.color;
      ctx.strokeRect(rx, ry, rw, rh);
      break;
    }
    case 'ellipse': {
      ctx.lineWidth = o.size * scale;
      ctx.beginPath();
      ctx.ellipse((o.x + o.w / 2) * scale, (o.y + o.h / 2) * scale, Math.abs(o.w) * scale / 2, Math.abs(o.h) * scale / 2, 0, 0, Math.PI * 2);
      if (o.fill) {
        ctx.fillStyle = o.fillColor;
        ctx.globalAlpha = alpha * 0.35;
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = o.color;
      ctx.stroke();
      break;
    }
    case 'star': {
      const cx = (o.x + o.w / 2) * scale;
      const cy = (o.y + o.h / 2) * scale;
      const outer = Math.max(1, Math.abs(o.w) * scale / 2);
      const inner = outer * 0.42;
      ctx.lineWidth = o.size * scale;
      if (o.fill) {
        ctx.fillStyle = o.fillColor;
        ctx.globalAlpha = alpha * 0.35;
        starPath(ctx, cx, cy, outer, inner);
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = o.color;
      starPath(ctx, cx, cy, outer, inner);
      ctx.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const x1 = o.x1 * scale, y1 = o.y1 * scale, x2 = o.x2 * scale, y2 = o.y2 * scale;
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size * scale;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const headLen = Math.max(10, o.size * scale * 3.2);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = (cx: number, cy: number, ang: number) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - headLen * Math.cos(ang - Math.PI / 6), cy - headLen * Math.sin(ang - Math.PI / 6));
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - headLen * Math.cos(ang + Math.PI / 6), cy - headLen * Math.sin(ang + Math.PI / 6));
        ctx.stroke();
      };
      if (o.type === 'arrow' || o.doubleHead) head(x2, y2, angle);
      if (o.doubleHead) head(x1, y1, angle + Math.PI);
      break;
    }
    case 'text': {
      const style = `${o.italic ? 'italic ' : ''}${o.bold ? 'bold ' : ''}${Math.round(o.size * scale)}px ${o.fontFamily}`;
      ctx.font = style;
      ctx.textBaseline = 'alphabetic';
      const w = ctx.measureText(o.text).width;
      const x0 = o.align === 'center' ? o.x * scale - w / 2 : o.align === 'right' ? o.x * scale - w : o.x * scale;
      if (o.bg) {
        ctx.fillStyle = o.color;
        ctx.globalAlpha = alpha * 0.35;
        const h = o.size * scale * 1.25;
        ctx.fillRect(x0, o.y * scale - h, w + 12, h + 6);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = o.color;
      ctx.fillText(o.text, x0, o.y * scale);
      if (o.underline) {
        ctx.beginPath();
        ctx.moveTo(x0, o.y * scale + o.size * scale * 0.15);
        ctx.lineTo(x0 + w, o.y * scale + o.size * scale * 0.15);
        ctx.lineWidth = Math.max(1, o.size * scale * 0.06);
        ctx.strokeStyle = o.color;
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

function renderBlurRegion(ctx: CanvasRenderingContext2D, raster: HTMLCanvasElement, o: { x: number; y: number; w: number; h: number; strength: number }, scale = 1) {
  const strength = Math.max(1, o.strength * scale);
  const x = o.x * scale, y = o.y * scale, w = Math.abs(o.w) * scale, h = Math.abs(o.h) * scale;
  const pad = strength * 2;
  const sx = clamp(x - pad, 0, raster.width);
  const sy = clamp(y - pad, 0, raster.height);
  const sw = clamp(w + pad * 2, 0, raster.width - sx);
  const sh = clamp(h + pad * 2, 0, raster.height - sy);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = `blur(${strength}px)`;
  ctx.drawImage(raster, sx, sy, sw, sh, x - pad, y - pad, sw, sh);
  ctx.restore();
}

function renderPixelRegion(ctx: CanvasRenderingContext2D, raster: HTMLCanvasElement, o: { x: number; y: number; w: number; h: number; strength: number }, scale = 1) {
  const x = o.x * scale, y = o.y * scale, w = Math.abs(o.w) * scale, h = Math.abs(o.h) * scale;
  const size = Math.max(2, o.strength * scale);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  const sw = Math.max(1, w / size);
  const sh = Math.max(1, h / size);
  ctx.drawImage(raster, x, y, w, h, x, y, sw, sh);
  ctx.drawImage(raster, x, y, sw, sh, x, y, w, h);
  ctx.restore();
}

function renderBlurStroke(ctx: CanvasRenderingContext2D, raster: HTMLCanvasElement, o: { points: Point[]; strength: number }, scale = 1) {
  const radius = Math.max(4, o.strength * scale);
  const pts = o.points;
  if (!pts.length) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    const cx = p.x * scale, cy = p.y * scale;
    if (cx < minX) minX = cx;
    if (cx > maxX) maxX = cx;
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;
  }
  const pad = radius * 2;
  const bx = clamp(Math.floor(minX - pad), 0, raster.width);
  const by = clamp(Math.floor(minY - pad), 0, raster.height);
  const bw = clamp(Math.ceil(maxX - minX + pad * 2), 0, raster.width - bx);
  const bh = clamp(Math.ceil(maxY - minY + pad * 2), 0, raster.height - by);
  if (bw <= 0 || bh <= 0) return;

  const mask = document.createElement('canvas');
  mask.width = bw;
  mask.height = bh;
  const mctx = mask.getContext('2d')!;
  if (pts.length === 1) {
    mctx.beginPath();
    mctx.arc(pts[0].x * scale - bx, pts[0].y * scale - by, radius, 0, Math.PI * 2);
    mctx.fillStyle = '#fff';
    mctx.fill();
  } else {
    mctx.beginPath();
    mctx.moveTo(pts[0].x * scale - bx, pts[0].y * scale - by);
    for (let i = 1; i < pts.length; i++) {
      mctx.lineTo(pts[i].x * scale - bx, pts[i].y * scale - by);
    }
    mctx.lineWidth = radius * 2;
    mctx.lineCap = 'round';
    mctx.lineJoin = 'round';
    mctx.strokeStyle = '#fff';
    mctx.stroke();
  }

  const blurred = document.createElement('canvas');
  blurred.width = bw;
  blurred.height = bh;
  const bctx = blurred.getContext('2d')!;
  bctx.filter = `blur(${radius * 0.8}px)`;
  bctx.drawImage(raster, bx, by, bw, bh, 0, 0, bw, bh);
  bctx.filter = 'none';
  bctx.globalCompositeOperation = 'destination-in';
  bctx.filter = `blur(${Math.max(1, radius * 0.15)}px)`;
  bctx.drawImage(mask, 0, 0);
  ctx.drawImage(blurred, bx, by);
}

function renderPixelStroke(ctx: CanvasRenderingContext2D, raster: HTMLCanvasElement, o: { points: Point[]; strength: number }, scale = 1) {
  const size = Math.max(4, o.strength * scale);
  for (const p of o.points) {
    const cx = p.x * scale, cy = p.y * scale;
    const sx = clamp(cx - size, 0, raster.width);
    const sy = clamp(cy - size, 0, raster.height);
    const sw = clamp(size * 2, 0, raster.width - sx);
    const sh = clamp(size * 2, 0, raster.height - sy);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(raster, sx, sy, sw, sh, cx - size, cy - size, Math.max(1, sw / size), Math.max(1, sh / size));
    ctx.drawImage(raster, sx, sy, Math.max(1, sw / size), Math.max(1, sh / size), cx - size, cy - size, sw, sh);
    ctx.restore();
  }
}

function objectBounds(o: DrawObject): { x: number; y: number; w: number; h: number } {
  switch (o.type) {
    case 'stroke':
    case 'marker':
    case 'blurstroke':
    case 'pixelstroke': {
      const pts = o.points;
      if (!pts.length) return { x: 0, y: 0, w: 0, h: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of pts) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      }
      const pad = 'strength' in o ? o.strength : o.size;
      return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
    }
    case 'rect':
    case 'ellipse':
    case 'star':
    case 'blurrect':
    case 'pixelrect':
      return { x: Math.min(o.x, o.x + o.w), y: Math.min(o.y, o.y + o.h), w: Math.abs(o.w), h: Math.abs(o.h) };
    case 'line':
    case 'arrow':
      return { x: Math.min(o.x1, o.x2), y: Math.min(o.y1, o.y2), w: Math.abs(o.x2 - o.x1), h: Math.abs(o.y2 - o.y1) };
    case 'text':
      return { x: o.x, y: o.y - o.size, w: Math.max(20, o.text.length * o.size * 0.62), h: o.size * 1.3 };
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

function hitObject(o: DrawObject, px: number, py: number): boolean {
  const pad = 6;
  switch (o.type) {
    case 'stroke':
    case 'marker': {
      if (o.points.length < 2) return o.points.length === 1 && Math.hypot(px - o.points[0].x, py - o.points[0].y) <= o.size / 2 + pad;
      const tol = o.size / 2 + pad;
      for (let i = 1; i < o.points.length; i++) {
        if (distToSegment(px, py, o.points[i - 1].x, o.points[i - 1].y, o.points[i].x, o.points[i].y) <= tol) return true;
      }
      return false;
    }
    case 'rect':
    case 'ellipse':
    case 'star':
    case 'blurrect':
    case 'pixelrect': {
      const { x, y, w, h } = objectBounds(o);
      return px >= x - pad && px <= x + w + pad && py >= y - pad && py <= y + h + pad;
    }
    case 'line':
    case 'arrow':
      return distToSegment(px, py, o.x1, o.y1, o.x2, o.y2) <= o.size / 2 + pad;
    case 'blurstroke':
    case 'pixelstroke': {
      const tol = o.strength / 2 + pad;
      for (let i = 1; i < o.points.length; i++) {
        if (distToSegment(px, py, o.points[i - 1].x, o.points[i - 1].y, o.points[i].x, o.points[i].y) <= tol) return true;
      }
      return o.points.length === 1 && distToSegment(px, py, o.points[0].x, o.points[0].y, o.points[0].x, o.points[0].y) <= tol;
    }
    case 'text': {
      const { x, y, w, h } = objectBounds(o);
      return px >= x - pad && px <= x + w + pad && py >= y - pad && py <= y + h + pad;
    }
  }
}

// ─── Pixel adjustments ────────────────────────────────────────
function adjustImageData(data: ImageData, adj: Adjustments) {
  const px = data.data;
  const sat = 1 + adj.saturation / 100;
  const ct = 1 + adj.contrast / 100;
  const bri = adj.brightness;
  const exp = Math.pow(2, adj.exposure / 100);
  const temp = adj.temp;
  for (let i = 0; i < px.length; i += 4) {
    let r = px[i], g = px[i + 1], b = px[i + 2];
    if (adj.grayscale) {
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = l;
    }
    if (adj.sepia) {
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = tr; g = tg; b = tb;
    }
    if (sat !== 1) {
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = l + (r - l) * sat;
      g = l + (g - l) * sat;
      b = l + (b - l) * sat;
    }
    if (ct !== 1) {
      r = (r - 128) * ct + 128;
      g = (g - 128) * ct + 128;
      b = (b - 128) * ct + 128;
    }
    r += bri;
    g += bri;
    b += bri;
    r *= exp;
    g *= exp;
    b *= exp;
    if (temp !== 0) {
      r += temp * 0.3;
      b -= temp * 0.3;
      g += temp * 0.08;
    }
    if (adj.invert) {
      r = 255 - r; g = 255 - g; b = 255 - b;
    }
    px[i] = clamp(r, 0, 255);
    px[i + 1] = clamp(g, 0, 255);
    px[i + 2] = clamp(b, 0, 255);
  }
}

function boxBlurCanvas(canvas: HTMLCanvasElement, radius: number) {
  if (radius <= 0) return;
  const ctx = canvas.getContext('2d')!;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = data.data;
  const w = data.width, h = data.height;
  const out = new Uint8ClampedArray(src);
  const r = Math.max(1, Math.round(radius));
  for (let pass = 0; pass < 2; pass++) {
    const tmp = new Uint8ClampedArray(out);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (let kx = -r; kx <= r; kx++) {
          const px = clamp(x + kx, 0, w - 1);
          const idx = (y * w + px) * 4;
          sr += tmp[idx]; sg += tmp[idx + 1]; sb += tmp[idx + 2]; n++;
        }
        const idx = (y * w + x) * 4;
        out[idx] = sr / n; out[idx + 1] = sg / n; out[idx + 2] = sb / n;
      }
    }
    const tmp2 = new Uint8ClampedArray(out);
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let sr = 0, sg = 0, sb = 0, n = 0;
        for (let ky = -r; ky <= r; ky++) {
          const py = clamp(y + ky, 0, h - 1);
          const idx = (py * w + x) * 4;
          sr += tmp2[idx]; sg += tmp2[idx + 1]; sb += tmp2[idx + 2]; n++;
        }
        const idx = (y * w + x) * 4;
        out[idx] = sr / n; out[idx + 1] = sg / n; out[idx + 2] = sb / n;
      }
    }
  }
  data.data.set(out);
  ctx.putImageData(data, 0, 0);
}

function isNeutral(adj: Adjustments): boolean {
  return adj.brightness === 0 && adj.contrast === 0 && adj.saturation === 0 && adj.exposure === 0
    && adj.blur === 0 && adj.sharpen === 0 && adj.temp === 0
    && !adj.grayscale && !adj.sepia && !adj.invert;
}

function bakeAdjustments(source: HTMLCanvasElement, adj: Adjustments): HTMLCanvasElement {
  if (isNeutral(adj)) return cloneCanvas(source);
  const out = cloneCanvas(source);
  const ctx = out.getContext('2d')!;
  const data = ctx.getImageData(0, 0, out.width, out.height);
  adjustImageData(data, adj);
  ctx.putImageData(data, 0, 0);
  if (adj.blur > 0) boxBlurCanvas(out, Math.max(1, adj.blur / 5));
  if (adj.sharpen > 0) applyUnsharp(ctx.getImageData(0, 0, out.width, out.height), adj.sharpen);
  return out;
}

// ─── Coordinate transforms for raster ops ─────────────────────
function transformObjects(objects: DrawObject[], fn: (p: Point) => Point, mapText = false): DrawObject[] {
  return objects.map(o => {
    if (o.type === 'stroke' || o.type === 'marker') return { ...o, points: o.points.map(fn) };
    if (o.type === 'blurstroke' || o.type === 'pixelstroke') return { ...o, points: o.points.map(fn) };
    if (o.type === 'blurrect' || o.type === 'pixelrect') {
      const a = fn({ x: o.x, y: o.y }); const b = fn({ x: o.x + o.w, y: o.y + o.h });
      return { ...o, x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
    }
    if (o.type === 'rect' || o.type === 'ellipse' || o.type === 'star') {
      const a = fn({ x: o.x, y: o.y }); const b = fn({ x: o.x + o.w, y: o.y + o.h });
      return { ...o, x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
    }
    if (o.type === 'line' || o.type === 'arrow') {
      const a = fn({ x: o.x1, y: o.y1 }); const b = fn({ x: o.x2, y: o.y2 });
      return { ...o, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    }
    if (o.type === 'text') {
      if (!mapText) return o;
      const a = fn({ x: o.x, y: o.y });
      return { ...o, x: a.x, y: a.y };
    }
    return o;
  });
}

// ─── Main component ───────────────────────────────────────────
export const ImageEditorTool: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('image/png');
  const [tool, setTool] = useState<ToolId>('select');
  const [color, setColor] = useState('#ef4444');
  const [fillColor, setFillColor] = useState('#ef4444');
  const [size, setSize] = useState(8);
  const [fill, setFill] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0]);
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [textBg, setTextBg] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [textValue, setTextValue] = useState('Your text here');
  const [blurStrength, setBlurStrength] = useState(12);
  const [pixelSize, setPixelSize] = useState(12);
  const [doubleHead, setDoubleHead] = useState(false);
  const [objects, setObjects] = useState<DrawObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [view, setView] = useState({ w: 0, h: 0 });
  const [shapeType, setShapeType] = useState<'rect' | 'ellipse' | 'star' | 'line'>('rect');
  const [showSidebar, setShowSidebar] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adj, setAdj] = useState<Adjustments>({ ...NEUTRAL_ADJ });
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [cropRatio, setCropRatio] = useState<number | null>(null);
  const [resizeW, setResizeW] = useState(0);
  const [resizeH, setResizeH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [exportFormat, setExportFormat] = useState('image/png');
  const [exportQuality, setExportQuality] = useState(90);
  const [exportDims, setExportDims] = useState<'current' | 'original' | 'custom'>('current');
  const [exportW, setExportW] = useState(0);
  const [exportH, setExportH] = useState(0);
  const [exportBg, setExportBg] = useState<'transparent' | 'white' | 'custom'>('transparent');
  const [exportBgColor, setExportBgColor] = useState('#ffffff');
  const [exportName, setExportName] = useState('edited-image');
  const [exportResult, setExportResult] = useState<{ url: string; blob: Blob; w: number; h: number } | null>(null);
  const [sampled, setSampled] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const rasterRef = useRef<HTMLCanvasElement | null>(null);
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const undoRef = useRef<HistoryEntry[]>([]);
  const redoRef = useRef<HistoryEntry[]>([]);
  const penRef = useRef<{ points: Point[]; color: string; size: number; opacity: number; kind: 'brush' | 'highlighter' } | null>(null);
  const effectRef = useRef<{ points: Point[]; strength: number; kind: 'blur' | 'pixelate' } | null>(null);
  const previewRef = useRef<{ tool: 'rect' | 'ellipse' | 'star' | 'line' | 'arrow'; color: string; fillColor: string; size: number; fill: boolean; opacity: number; doubleHead: boolean; start: Point; cur: Point } | null>(null);
  const moveRef = useRef<{ id: string; start: Point; origin: Point } | null>(null);
  const erasingRef = useRef(false);
  const moveCommittedRef = useRef(false);
  const textEditPushedRef = useRef(false);
  const objOpacityPushedRef = useRef(false);
  const loadTickRef = useRef(0);
  const fitPendingRef = useRef(false);
  const zoomRef = useRef(1);
  const panRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);
  const spaceDownRef = useRef(false);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cropDragRef = useRef<{ handle: string; start: Point; orig: { x: number; y: number; w: number; h: number }; ratio: number | null } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const pinchRef = useRef<{ id1: number; id2: number; startDist: number; startZoom: number } | null>(null);
  const gesturePushedRef = useRef(false);
  const adjTimerRef = useRef<number | null>(null);

  const objectsRef = useRef<DrawObject[]>([]);
  objectsRef.current = objects;
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;
  const adjRef = useRef<Adjustments>({ ...NEUTRAL_ADJ });
  adjRef.current = adj;

  const pushToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const pushHistory = useCallback((raster: HTMLCanvasElement | null, snapshot: DrawObject[]) => {
    undoRef.current.push({ raster, objects: snapshot });
    if (undoRef.current.length > HISTORY_LIMIT) undoRef.current.shift();
    redoRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const redrawNow = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const raster = rasterRef.current;
    if (!canvas || !ctx || !raster) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(raster, 0, 0);
    const objectsArr = objectsRef.current;
    for (const o of objectsArr) {
      if (o.type === 'blurrect') renderBlurRegion(ctx, raster, o);
      else if (o.type === 'pixelrect') renderPixelRegion(ctx, raster, o);
      else if (o.type === 'blurstroke') renderBlurStroke(ctx, raster, o);
      else if (o.type === 'pixelstroke') renderPixelStroke(ctx, raster, o);
      else drawObject(ctx, o);
    }
    const pen = penRef.current;
    if (pen && pen.points.length) {
      drawObject(ctx, { id: 'pen', type: pen.kind === 'highlighter' ? 'marker' : 'stroke', points: pen.points, color: pen.color, size: pen.size, opacity: pen.opacity } as DrawObject);
    }
    const eff = effectRef.current;
    if (eff && eff.points.length) {
      if (eff.kind === 'blur') renderBlurStroke(ctx, raster, { points: eff.points, strength: eff.strength });
      else renderPixelStroke(ctx, raster, { points: eff.points, strength: eff.strength });
    }
    const preview = previewRef.current;
    if (preview) {
      drawObject(ctx, {
        id: 'preview', type: preview.tool,
        x: Math.min(preview.start.x, preview.cur.x), y: Math.min(preview.start.y, preview.cur.y),
        w: Math.abs(preview.cur.x - preview.start.x), h: Math.abs(preview.cur.y - preview.start.y),
        x1: preview.start.x, y1: preview.start.y, x2: preview.cur.x, y2: preview.cur.y,
        color: preview.color, fillColor: preview.fillColor, size: preview.size, fill: preview.fill,
        opacity: preview.opacity, doubleHead: preview.doubleHead,
      } as DrawObject);
    }
    const sel = objectsArr.find(o => o.id === selectedIdRef.current);
    if (sel && !moveRef.current && !penRef.current && !previewRef.current && !effectRef.current) {
      const b = objectBounds(sel);
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      ctx.restore();
    }
  }, []);

  const undo = useCallback(() => {
    const prev = undoRef.current.pop();
    if (!prev) return;
    const cur: HistoryEntry = { raster: null, objects };
    redoRef.current.push(cur);
    setCanRedo(true);
    if (undoRef.current.length === 0) setCanUndo(false);
    if (prev.raster) {
      rasterRef.current = prev.raster;
      setImgW(prev.raster.width);
      setImgH(prev.raster.height);
      setObjects(prev.objects);
    } else {
      setObjects(prev.objects);
    }
    setSelectedId(null);
    setCropBox(null);
    redrawNow();
  }, [objects, redrawNow]);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    const cur: HistoryEntry = { raster: null, objects };
    undoRef.current.push(cur);
    setCanUndo(true);
    if (redoRef.current.length === 0) setCanRedo(false);
    if (next.raster) {
      rasterRef.current = next.raster;
      setImgW(next.raster.width);
      setImgH(next.raster.height);
      setObjects(next.objects);
    } else {
      setObjects(next.objects);
    }
    setSelectedId(null);
    setCropBox(null);
    redrawNow();
  }, [objects, redrawNow]);

  useEffect(() => { redrawNow(); }, [redrawNow, objects, selectedId]);

  // ── File loading & validation ───────────────────────────────
  const validateFile = (f: File): string | null => {
    if (f.size === 0) return 'This file is empty (0 bytes).';
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeOk = SUPPORTED_TYPES.has(f.type);
    const extOk = SUPPORTED_EXTS.has(ext);
    if (!mimeOk && !extOk) return 'This image format isn\'t supported. Please use JPG, PNG, WebP, BMP, GIF or SVG.';
    if (!mimeOk && extOk && f.type !== '') return 'This image format isn\'t supported. Please use JPG, PNG, WebP, BMP, GIF or SVG.';
    return null;
  };

  const loadFile = useCallback(async (f: File) => {
    const vErr = validateFile(f);
    if (vErr) { setError(vErr); return; }
    try {
      const img = await loadImage(f);
      const natW = img.naturalWidth, natH = img.naturalHeight;
      if (!natW || !natH) throw new Error('The image could not be opened.');
      if (natW > WARN_DIM || natH > WARN_DIM || f.size > WARN_SIZE) {
        const ok = window.confirm('This image is very large and may use significant browser memory. Continue?');
        if (!ok) return;
      }
      let w = natW, h = natH;
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
      bctx.drawImage(img, 0, 0, w, h);
      originalRef.current = cloneCanvas(base);
      rasterRef.current = base;
      undoRef.current = [];
      redoRef.current = [];
      setObjects([]);
      setSelectedId(null);
      setCanUndo(false);
      setCanRedo(false);
      setError(null);
      setAdj({ ...NEUTRAL_ADJ });
      setFile(f);
      setFileType(f.type || (extOfName(f.name) === 'png' ? 'image/png' : 'image/jpeg'));
      setExportName(baseNameFrom(f.name));
      setLoadTick(t => t + 1);
      setConfirmReplace(false);
      setPendingFile(null);
      setExportResult(null);
      setCropBox(null);
      setTool('select');
    } catch (e) {
      setError(errorMessage(e, 'The image could not be opened.'));
    }
  }, []);

  const extOfName = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (file && (objects.length > 0 || !isNeutral(adjRef.current))) {
      setPendingFile(f);
      setConfirmReplace(true);
      return;
    }
    setError(null);
    loadFile(f);
  }, [file, objects.length, loadFile]);

  // ── Paste from clipboard ────────────────────────────────────
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      let imgFile: File | null = null;
      for (const it of items) {
        if (it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) { imgFile = f; break; }
        }
      }
      if (!imgFile) return;
      e.preventDefault();
      if (file && (objects.length > 0 || !isNeutral(adjRef.current))) {
        setPendingFile(imgFile);
        setConfirmReplace(true);
        return;
      }
      loadFile(imgFile);
      pushToast('Image pasted from clipboard');
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [file, objects.length, loadFile, pushToast]);

  useEffect(() => {
    if (loadTickRef.current === loadTick) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const raster = rasterRef.current;
    if (!canvas || !ctx || !raster) return;
    canvas.width = raster.width;
    canvas.height = raster.height;
    setImgW(raster.width);
    setImgH(raster.height);
    setResizeW(raster.width);
    setResizeH(raster.height);
    setExportW(raster.width);
    setExportH(raster.height);
    loadTickRef.current = loadTick;
    fitPendingRef.current = true;
    redrawNow();
  }, [file, loadTick, redrawNow]);

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

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // ── Wheel zoom (Ctrl) ───────────────────────────────────────
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

  // ── Space-to-pan ────────────────────────────────────────────
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

  // ── Adjustments (debounced bake) ────────────────────────────
  const bake = useCallback(() => {
    const orig = originalRef.current;
    if (!orig) return;
    setProcessing(true);
    const newRaster = bakeAdjustments(orig, adjRef.current);
    rasterRef.current = newRaster;
    redrawNow();
    window.setTimeout(() => setProcessing(false), 50);
  }, [redrawNow]);

  const setAdjValue = useCallback((key: keyof Adjustments, v: number | boolean) => {
    if (!gesturePushedRef.current) {
      gesturePushedRef.current = true;
      const cur = rasterRef.current;
      pushHistory(cur ? cloneCanvas(cur) : null, objectsRef.current);
    }
    setAdj(prev => ({ ...prev, [key]: v }));
  }, [pushHistory]);

  useEffect(() => {
    if (adjTimerRef.current) window.clearTimeout(adjTimerRef.current);
    adjTimerRef.current = window.setTimeout(bake, 120);
    return () => { if (adjTimerRef.current) window.clearTimeout(adjTimerRef.current); };
  }, [adj, bake]);

  const applyFilter = useCallback((key: string) => {
    const f = FILTERS[key];
    if (!f) return;
    setAdj(() => ({ ...NEUTRAL_ADJ, ...f.adj }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdj({ ...NEUTRAL_ADJ });
  }, []);

  const gestureReset = useCallback(() => { gesturePushedRef.current = false; }, []);

  // ── Raster operations (crop/resize/rotate/flip) ─────────────
  const applyRasterOp = useCallback((fn: (src: HTMLCanvasElement) => HTMLCanvasElement, mapObjects?: (objs: DrawObject[], srcW: number, srcH: number, dstW: number, dstH: number) => DrawObject[]) => {
    const src = rasterRef.current;
    if (!src) return;
    const srcW = src.width, srcH = src.height;
    pushHistory(cloneCanvas(src), objectsRef.current);
    const dst = fn(src);
    rasterRef.current = dst;
    if (mapObjects) {
      setObjects(mapObjects(objectsRef.current, srcW, srcH, dst.width, dst.height));
    }
    setImgW(dst.width);
    setImgH(dst.height);
    setResizeW(dst.width);
    setResizeH(dst.height);
    setExportW(dst.width);
    setExportH(dst.height);
    fitPendingRef.current = true;
    redrawNow();
  }, [pushHistory, redrawNow]);

  const cropCanvas = (src: HTMLCanvasElement, x: number, y: number, w: number, h: number) => {
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w));
    out.height = Math.max(1, Math.round(h));
    const ctx = out.getContext('2d')!;
    ctx.drawImage(src, x, y, w, h, 0, 0, out.width, out.height);
    return out;
  };

  const applyCrop = useCallback(() => {
    if (!cropBox) return;
    const { x, y, w, h } = cropBox;
    if (w < 4 || h < 4) { setError('Crop area is too small.'); return; }
    applyRasterOp(
      (src) => cropCanvas(src, x, y, w, h),
      (objs) => transformObjects(objs, p => ({ x: p.x - x, y: p.y - y })).filter(o => {
        const b = objectBounds(o);
        return b.x < w && b.y < h && b.x + b.w > 0 && b.y + b.h > 0;
      }),
    );
    setCropBox(null);
    setTool('select');
  }, [cropBox, applyRasterOp]);

  const rotateRaster = (src: HTMLCanvasElement, deg: 90 | 180 | 270) => {
    const out = document.createElement('canvas');
    const ctx = out.getContext('2d')!;
    if (deg === 180) {
      out.width = src.width; out.height = src.height;
      ctx.translate(src.width, src.height);
      ctx.rotate(Math.PI);
      ctx.drawImage(src, 0, 0);
    } else {
      out.width = src.height; out.height = src.width;
      ctx.translate(out.width / 2, out.height / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.drawImage(src, -src.width / 2, -src.height / 2);
    }
    return out;
  };

  const rotateBy = useCallback((deg: 90 | 180 | 270) => {
    applyRasterOp(
      (src) => rotateRaster(src, deg),
      (objs, w, h) => {
        if (deg === 180) return transformObjects(objs, p => ({ x: w - 1 - p.x, y: h - 1 - p.y }), true);
        return transformObjects(objs, p => deg === 90 ? ({ x: p.y, y: w - 1 - p.x }) : ({ x: h - 1 - p.y, y: p.x }), true);
      },
    );
  }, [applyRasterOp]);

  const flipRaster = (src: HTMLCanvasElement, horizontal: boolean) => {
    const out = document.createElement('canvas');
    out.width = src.width; out.height = src.height;
    const ctx = out.getContext('2d')!;
    ctx.translate(horizontal ? src.width : 0, horizontal ? 0 : src.height);
    ctx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
    ctx.drawImage(src, 0, 0);
    return out;
  };

  const flipBy = useCallback((horizontal: boolean) => {
    const w = rasterRef.current?.width ?? 0, h = rasterRef.current?.height ?? 0;
    applyRasterOp(
      (src) => flipRaster(src, horizontal),
      (objs) => transformObjects(objs, p => horizontal ? ({ x: w - 1 - p.x, y: p.y }) : ({ x: p.x, y: h - 1 - p.y }), true),
    );
  }, [applyRasterOp]);

  const resizeRaster = useCallback((w: number, h: number) => {
    const src = rasterRef.current;
    if (!src) return;
    const nw = Math.max(1, Math.min(MAX_DIM, Math.round(w)));
    const nh = Math.max(1, Math.min(MAX_DIM, Math.round(h)));
    if (nw === src.width && nh === src.height) return;
    applyRasterOp(
      (s) => {
        const out = document.createElement('canvas');
        out.width = nw; out.height = nh;
        const ctx = out.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(s, 0, 0, nw, nh);
        return out;
      },
      (objs) => transformObjects(objs, p => ({ x: p.x * (nw / src.width), y: p.y * (nh / src.height) }), true),
    );
    setResizeW(nw); setResizeH(nh);
  }, [applyRasterOp]);

  const resetAll = useCallback(() => {
    const orig = originalRef.current;
    if (!orig) return;
    if (objects.length > 0 || !isNeutral(adjRef.current)) {
      const ok = window.confirm('Restore original image? Your current edits will be removed.');
      if (!ok) return;
    }
    pushHistory(cloneCanvas(rasterRef.current!), objectsRef.current);
    rasterRef.current = cloneCanvas(orig);
    setObjects([]);
    setSelectedId(null);
    setAdj({ ...NEUTRAL_ADJ });
    setImgW(orig.width);
    setImgH(orig.height);
    setResizeW(orig.width);
    setResizeH(orig.height);
    setExportW(orig.width);
    setExportH(orig.height);
    setCropBox(null);
    setExportResult(null);
    fitPendingRef.current = true;
    redrawNow();
  }, [objects.length, pushHistory, redrawNow]);

  const enterCrop = useCallback(() => {
    const w = rasterRef.current?.width ?? 0;
    const h = rasterRef.current?.height ?? 0;
    setCropBox({ x: 0, y: 0, w, h });
    setTool('crop');
  }, []);

  // ── Object ops ──────────────────────────────────────────────
  const duplicate = useCallback(() => {
    if (!selectedId) return;
    const src = objectsRef.current.find(o => o.id === selectedId);
    if (!src) return;
    pushHistory(null, objectsRef.current);
    const copy = { ...src, id: nextId() } as DrawObject;
    switch (copy.type) {
      case 'stroke':
      case 'marker':
        copy.points = copy.points.map(pt => ({ x: pt.x + 18, y: pt.y + 18 }));
        break;
      case 'blurstroke':
      case 'pixelstroke':
        copy.points = copy.points.map(pt => ({ x: pt.x + 18, y: pt.y + 18 }));
        break;
      case 'rect':
      case 'ellipse':
      case 'star':
      case 'blurrect':
      case 'pixelrect':
        copy.x = copy.x + 18;
        copy.y = copy.y + 18;
        break;
      case 'line':
      case 'arrow':
        copy.x1 = copy.x1 + 18; copy.y1 = copy.y1 + 18;
        copy.x2 = copy.x2 + 18; copy.y2 = copy.y2 + 18;
        break;
      case 'text':
        copy.x = copy.x + 18;
        copy.y = copy.y + 18;
        break;
    }
    setObjects(prev => [...prev, copy]);
    setSelectedId(copy.id);
  }, [selectedId, pushHistory]);

  const setObjOpacity = useCallback((v: number) => {
    if (!selectedId) return;
    if (!objOpacityPushedRef.current) {
      objOpacityPushedRef.current = true;
      pushHistory(null, objectsRef.current);
    }
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, opacity: v } : o));
  }, [selectedId, pushHistory]);

  const moveLayer = useCallback((id: string, dir: 1 | -1) => {
    const arr = objectsRef.current;
    const i = arr.findIndex(o => o.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    pushHistory(null, arr);
    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === id);
      const next = [...prev];
      const [o] = next.splice(idx, 1);
      next.splice(idx + dir, 0, o);
      return next;
    });
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory(null, objectsRef.current);
    setObjects(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, pushHistory]);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
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
          if (id === 'crop') { enterCrop(); return; }
          e.preventDefault();
          setTool(id);
          if (id === 'select') setCropBox(null);
          return;
        }
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setCropBox(null);
        setTool(t => t === 'crop' ? 'select' : t);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        pushHistory(null, objects);
        setObjects(prev => prev.filter(o => o.id !== selectedId));
        setSelectedId(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [undo, redo, duplicate, selectedId, objects, pushHistory, enterCrop]);

  // ── Pointer handling on canvas ──────────────────────────────
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
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    if (e.pointerType === 'touch') {
      if (!pinchRef.current) {
        pinchRef.current = { id1: e.pointerId, id2: -1, startDist: 0, startZoom: zoomRef.current };
      } else {
        pinchRef.current.id2 = e.pointerId;
        return;
      }
    }

    const el = containerRef.current;
    if ((spaceDownRef.current || e.button === 1) && el) {
      panRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      setIsPanning(true);
      return;
    }

    if (tool === 'eyedropper') {
      const raster = rasterRef.current;
      if (!raster) return;
      const data = raster.getContext('2d')!.getImageData(clamp(Math.round(p.x), 0, raster.width - 1), clamp(Math.round(p.y), 0, raster.height - 1), 1, 1).data;
      const r = data[0], g = data[1], b = data[2];
      const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
      const hsl = rgbToHsl(r, g, b);
      setSampled({ hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl });
      pushToast(`Sampled ${hex}`);
      return;
    }

    if (tool === 'crop') return;

    if (tool === 'select') {
      moveCommittedRef.current = false;
      const hit = [...objectsRef.current].reverse().find(o => hitObject(o, p.x, p.y));
      if (hit) {
        setSelectedId(hit.id);
        const b = objectBounds(hit);
        moveRef.current = { id: hit.id, start: p, origin: { x: b.x, y: b.y } };
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'eraser') {
      erasingRef.current = true;
      const hit = [...objectsRef.current].reverse().find(o => hitObject(o, p.x, p.y));
      if (hit) {
        pushHistory(null, objectsRef.current);
        setObjects(prev => prev.filter(o => o.id !== hit.id));
        setSelectedId(null);
      }
      return;
    }

    if (strokeTools.includes(tool)) {
      penRef.current = { points: [p], color, size, opacity, kind: tool === 'highlighter' ? 'highlighter' : 'brush' };
      return;
    }

    if (effectTools.includes(tool)) {
      effectRef.current = { points: [p], strength: tool === 'blur' ? blurStrength : pixelSize, kind: tool as 'blur' | 'pixelate' };
      return;
    }

    if (shapeTools.includes(tool)) {
      const st = tool === 'shapes' ? shapeType : 'arrow';
      previewRef.current = { tool: st, color, fillColor, size, fill, opacity, doubleHead, start: p, cur: p };
      return;
    }

    if (tool === 'text') {
      const text = textValue.trim();
      if (!text) { setError('Type some text in the text box first.'); return; }
      pushHistory(null, objectsRef.current);
      const obj: DrawObject = { id: nextId(), type: 'text', x: p.x, y: p.y, text, color, size: fontSize, fontFamily, bold, italic, underline, bg: textBg, align: textAlign, opacity };
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

    if (strokeTools.includes(tool) || effectTools.includes(tool)) {
      const ring = cursorRingRef.current;
      const c = containerRef.current;
      if (ring && c) {
        const rect = c.getBoundingClientRect();
        const r = Math.max(4, ((tool === 'blur' ? blurStrength : tool === 'pixelate' ? pixelSize : size) * zoomRef.current) / 2);
        ring.style.width = `${r * 2}px`;
        ring.style.height = `${r * 2}px`;
        ring.style.transform = `translate(${e.clientX - rect.left + c.scrollLeft - r}px, ${e.clientY - rect.top + c.scrollTop - r}px)`;
        ring.style.borderColor = tool === 'eraser' ? '#94a3b8' : tool === 'blur' || tool === 'pixelate' ? '#a855f7' : color;
      }
    }

    const move = moveRef.current;
    if (move) {
      const dx = p.x - move.start.x;
      const dy = p.y - move.start.y;
      if (!moveCommittedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        moveCommittedRef.current = true;
        pushHistory(null, objectsRef.current);
      }
      setObjects(prev => prev.map(o => {
        if (o.id !== move.id) return o;
        switch (o.type) {
          case 'stroke':
          case 'marker':
            return { ...o, points: o.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
          case 'blurstroke':
          case 'pixelstroke':
            return { ...o, points: o.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
          case 'rect':
          case 'ellipse':
          case 'star':
          case 'blurrect':
          case 'pixelrect':
            return { ...o, x: o.x + dx, y: o.y + dy };
          case 'line':
          case 'arrow':
            return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
          case 'text':
            return { ...o, x: o.x + dx, y: o.y + dy };
        }
        return o;
      }));
      return;
    }

    if (erasingRef.current) {
      const hits = objectsRef.current.filter(o => hitObject(o, p.x, p.y)).map(o => o.id);
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
        redrawNow();
      }
      return;
    }

    const eff = effectRef.current;
    if (eff) {
      const last = eff.points[eff.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) >= (eff.strength / 2)) {
        eff.points.push(p);
        redrawNow();
      }
      return;
    }

    const preview = previewRef.current;
    if (preview) {
      preview.cur = p;
      redrawNow();
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch' && pinchRef.current) {
      if (pinchRef.current.id2 === e.pointerId) pinchRef.current.id2 = -1;
      else if (pinchRef.current.id1 === e.pointerId) {
        pinchRef.current.id1 = pinchRef.current.id2 === -1 ? -1 : pinchRef.current.id1;
        if (pinchRef.current.id1 === -1) pinchRef.current = null;
      }
    }
    if (panRef.current) {
      panRef.current = null;
      setIsPanning(false);
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
        pushHistory(null, objectsRef.current);
        setObjects(prev => [...prev, { id: nextId(), type: pen.kind === 'highlighter' ? 'marker' : 'stroke', points: pen.points, color: pen.color, size: pen.size, opacity: pen.opacity } as DrawObject]);
      }
      penRef.current = null;
      return;
    }
    const eff = effectRef.current;
    if (eff) {
      if (eff.points.length) {
        pushHistory(null, objectsRef.current);
        setObjects(prev => [...prev, { id: nextId(), type: eff.kind === 'blur' ? 'blurstroke' : 'pixelstroke', points: eff.points, strength: eff.strength } as DrawObject]);
      }
      effectRef.current = null;
      return;
    }
    const preview = previewRef.current;
    if (preview) {
      const { tool: t, color: c, fillColor: fc, size: s, fill: f, opacity: o, doubleHead: dh, start, cur } = preview;
      previewRef.current = null;
      if (Math.abs(cur.x - start.x) > 3 || Math.abs(cur.y - start.y) > 3) {
        pushHistory(null, objectsRef.current);
        const obj: DrawObject = {
          id: nextId(), type: t,
          x: Math.min(start.x, cur.x), y: Math.min(start.y, cur.y),
          w: Math.abs(cur.x - start.x), h: Math.abs(cur.y - start.y),
          x1: start.x, y1: start.y, x2: cur.x, y2: cur.y,
          color: c, fillColor: fc, size: s, fill: f, opacity: o, doubleHead: dh,
        };
        setObjects(prev => [...prev, obj]);
        setSelectedId(obj.id);
      }
    }
  };

  // ── Crop overlay pointer handling ───────────────────────────
  const cropPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const z = zoomRef.current || 1;
    return { x: clamp((e.clientX - rect.left) / z, 0, imgW), y: clamp((e.clientY - rect.top) / z, 0, imgH) };
  };

  const onCropDown = (e: React.PointerEvent<HTMLDivElement>, handle: string) => {
    if (!cropBox) return;
    e.preventDefault();
    e.stopPropagation();
    const p = cropPos(e);
    cropDragRef.current = { handle, start: p, orig: { ...cropBox }, ratio: cropRatio };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onCropMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = cropDragRef.current;
    if (!drag || !cropBox) return;
    const p = cropPos(e);
    let { x, y, w, h } = drag.orig;
    const dx = p.x - drag.start.x;
    const dy = p.y - drag.start.y;
    const ratio = drag.ratio;
    const applyRatio = (X: number, Y: number, W: number, H: number, refX: number, refY: number, anchor: 'e' | 'w' | 's' | 'n' | 'ne' | 'nw' | 'se' | 'sw') => {
      let nw = W, nh = H;
      if (ratio) {
        if (Math.abs(W / H) > ratio) nh = W / ratio; else nw = H * ratio;
        if (anchor.includes('w')) x = refX - nw;
        if (anchor.includes('n')) y = refY - nh;
        if (anchor.includes('e')) x = refX;
        if (anchor.includes('s')) y = refY;
        w = nw; h = nh;
      } else {
        if (anchor.includes('w')) x = refX + W - (X - refX) >= 0 ? X : refX;
        if (anchor.includes('n')) y = refY + H - (Y - refY) >= 0 ? Y : refY;
        w = Math.abs(X - refX); h = Math.abs(Y - refY);
      }
    };
    switch (drag.handle) {
      case 'move': {
        x = drag.orig.x + dx;
        y = drag.orig.y + dy;
        x = clamp(x, 0, imgW - w);
        y = clamp(y, 0, imgH - h);
        break;
      }
      case 'se': {
        let nw = clamp(drag.orig.w + dx, 8, imgW - drag.orig.x);
        let nh = clamp(drag.orig.h + dy, 8, imgH - drag.orig.y);
        if (ratio) { if (nw / nh > ratio) nh = nw / ratio; else nw = nh * ratio; }
        w = nw; h = nh;
        break;
      }
      case 'nw': {
        let nw = clamp(drag.orig.w - dx, 8, imgW);
        let nh = clamp(drag.orig.h - dy, 8, imgH);
        if (ratio) { if (nw / nh > ratio) nh = nw / ratio; else nw = nh * ratio; }
        x = drag.orig.x + drag.orig.w - nw;
        y = drag.orig.y + drag.orig.h - nh;
        if (x < 0) { nw += x; x = 0; }
        if (y < 0) { nh += y; y = 0; }
        w = nw; h = nh;
        break;
      }
      case 'ne': {
        let nw = clamp(drag.orig.w + dx, 8, imgW - drag.orig.x);
        let nh = clamp(drag.orig.h - dy, 8, imgH);
        if (ratio) { if (nw / nh > ratio) nh = nw / ratio; else nw = nh * ratio; }
        x = drag.orig.x;
        y = drag.orig.y + drag.orig.h - nh;
        if (y < 0) { nh += y; y = 0; }
        w = nw; h = nh;
        break;
      }
      case 'sw': {
        let nw = clamp(drag.orig.w - dx, 8, imgW);
        let nh = clamp(drag.orig.h + dy, 8, imgH - drag.orig.y);
        if (ratio) { if (nw / nh > ratio) nh = nw / ratio; else nw = nh * ratio; }
        x = drag.orig.x + drag.orig.w - nw;
        y = drag.orig.y;
        if (x < 0) { nw += x; x = 0; }
        w = nw; h = nh;
        break;
      }
      case 'n': {
        let nh = clamp(drag.orig.h - dy, 8, imgH);
        if (ratio) nh = Math.max(nh, drag.orig.w / ratio);
        y = drag.orig.y + drag.orig.h - nh;
        if (y < 0) { nh += y; y = 0; }
        h = nh;
        break;
      }
      case 's': {
        h = clamp(drag.orig.h + dy, 8, imgH - drag.orig.y);
        if (ratio) h = Math.max(h, drag.orig.w / ratio);
        break;
      }
      case 'e': {
        w = clamp(drag.orig.w + dx, 8, imgW - drag.orig.x);
        if (ratio) w = Math.max(w, drag.orig.h * ratio);
        break;
      }
      case 'w': {
        let nw = clamp(drag.orig.w - dx, 8, imgW);
        if (ratio) nw = Math.max(nw, drag.orig.h * ratio);
        x = drag.orig.x + drag.orig.w - nw;
        if (x < 0) { nw += x; x = 0; }
        w = nw;
        break;
      }
    }
    if (w > 8 && h > 8) setCropBox({ x: clamp(x, 0, imgW), y: clamp(y, 0, imgH), w: clamp(w, 8, imgW), h: clamp(h, 8, imgH) });
    void applyRatio;
  };

  const onCropUp = () => { cropDragRef.current = null; };

  // ── Pinch zoom (touch) ──────────────────────────────────────
  const trackPointers = useRef(new Map<number, { x: number; y: number }>());

  useEffect(() => {
    if (!file) return;
    const el = containerRef.current;
    if (!el) return;
    let pinchStart: { dist: number; zoom: number; cx: number; cy: number } | null = null;
    const onPointerDown = (e: PointerEvent) => {
      trackPointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const onPointerMove = (e: PointerEvent) => {
      const cur = trackPointers.current.get(e.pointerId);
      if (cur) { cur.x = e.clientX; cur.y = e.clientY; }
      if (trackPointers.current.size === 2) {
        const [a, b] = Array.from(trackPointers.current.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        if (!pinchStart) {
          pinchStart = { dist, zoom: zoomRef.current, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
          return;
        }
        const ratio = dist / pinchStart.dist;
        const z2 = clamp(pinchStart.zoom * ratio, ZOOM_MIN, ZOOM_MAX);
        const rect = el.getBoundingClientRect();
        const mx = pinchStart.cx - rect.left;
        const my = pinchStart.cy - rect.top;
        el.scrollLeft = ((mx + el.scrollLeft) * (z2 / pinchStart.zoom)) - mx;
        el.scrollTop = ((my + el.scrollTop) * (z2 / pinchStart.zoom)) - my;
        setZoom(z2);
        fitPendingRef.current = false;
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      trackPointers.current.delete(e.pointerId);
      if (trackPointers.current.size < 2) pinchStart = null;
    };
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [file]);

  // ── Export / copy / drag-out ────────────────────────────────
  const composeExport = useCallback((w: number, h: number, bg: 'transparent' | 'white' | 'custom', bgColor: string): HTMLCanvasElement => {
    const raster = rasterRef.current;
    if (!raster) throw new Error('No image to export');
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w));
    out.height = Math.max(1, Math.round(h));
    const ctx = out.getContext('2d')!;
    if (bg === 'white') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, out.width, out.height); }
    if (bg === 'custom') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, out.width, out.height); }
    const sx = out.width / raster.width;
    const sy = out.height / raster.height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(raster, 0, 0, out.width, out.height);
    for (const o of objectsRef.current) {
      if (o.type === 'blurrect') renderBlurRegion(ctx, raster, o, (sx + sy) / 2);
      else if (o.type === 'pixelrect') renderPixelRegion(ctx, raster, o, (sx + sy) / 2);
      else if (o.type === 'blurstroke') renderBlurStroke(ctx, raster, o, (sx + sy) / 2);
      else if (o.type === 'pixelstroke') renderPixelStroke(ctx, raster, o, (sx + sy) / 2);
      else drawObject(ctx, o, (sx + sy) / 2);
    }
    return out;
  }, []);

  const currentExportDims = useCallback((): { w: number; h: number } => {
    const raster = rasterRef.current;
    if (!raster) return { w: 0, h: 0 };
    switch (exportDims) {
      case 'original': {
        const orig = originalRef.current;
        return orig ? { w: orig.width, h: orig.height } : { w: raster.width, h: raster.height };
      }
      case 'custom':
        return { w: Math.max(1, exportW) || raster.width, h: Math.max(1, exportH) || raster.height };
      default:
        return { w: raster.width, h: raster.height };
    }
  }, [exportDims, exportW, exportH]);

  const renderExport = useCallback(async (): Promise<{ canvas: HTMLCanvasElement; blob: Blob; ext: string; mime: string; w: number; h: number }> => {
    const { w, h } = currentExportDims();
    const canvas = composeExport(w, h, exportBg, exportBgColor);
    const fmt = exportFormat === 'image/png' ? 'image/png' : exportFormat;
    const quality = exportFormat === 'image/png' ? undefined : exportQuality / 100;
    const { blob, ext, mime } = await canvasExport(canvas, fmt, quality);
    return { canvas, blob, ext, mime, w, h };
  }, [currentExportDims, composeExport, exportBg, exportBgColor, exportFormat, exportQuality]);

  const downloadExport = useCallback(async () => {
    try {
      const { blob, ext } = await renderExport();
      downloadBlob(blob, `${exportName || 'edited-image'}.${ext}`);
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
    setShowSidebar(false);
    const res = await makeExportResult();
    if (res) setExportResult(res);
  }, [makeExportResult]);

  useEffect(() => {
    if (!exportOpen) return;
    const t = window.setTimeout(() => {
      makeExportResult().then(r => { if (r) setExportResult(r); });
    }, 300);
    return () => window.clearTimeout(t);
  }, [exportOpen, exportFormat, exportQuality, exportDims, exportW, exportH, exportBg, exportBgColor, makeExportResult]);

  const onDragStart = useCallback((e: React.DragEvent<HTMLImageElement>, result: { url: string; blob: Blob; w: number; h: number }) => {
    const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    e.dataTransfer.setData('text/uri-list', result.url);
    e.dataTransfer.setData('text/plain', result.url);
    try {
      e.dataTransfer.setData('DownloadURL', `image/${ext.replace('jpg', 'jpeg')}:${exportName || 'edited-image'}.${ext}:${result.url}`);
    } catch { /* not supported */ }
    try {
      e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    } catch { /* not supported */ }
  }, [exportFormat, exportName]);

  // ── Fullscreen ──────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.().catch(() => { /* ignore */ });
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const copyHex = useCallback(async () => {
    if (!sampled) return;
    try {
      await navigator.clipboard.writeText(sampled.hex);
      pushToast('HEX copied to clipboard');
    } catch {
      setError('Clipboard access is unavailable.');
    }
  }, [sampled, pushToast]);

  const applyFit = useCallback(() => {
    const c = containerRef.current;
    if (!c || !imgW || !imgH) return;
    const s = Math.min((c.clientWidth - 56) / imgW, (c.clientHeight - 56) / imgH, 1);
    setZoom(Math.max(ZOOM_MIN, s));
  }, [imgW, imgH]);

  const selectedObj = objects.find(o => o.id === selectedId) ?? null;
  const isShapeTool = shapeTools.includes(tool);
  const isStrokeTool = strokeTools.includes(tool);
  const isEffectTool = effectTools.includes(tool);
  const zoomPct = `${Math.round(zoom * 100)}%`;
  const activeToolMeta = TOOL_ORDER.find(t => t.id === tool) ?? TOOL_ORDER[0];
  const canvasCursor = isPanning
    ? 'cursor-grabbing'
    : spaceHeld
      ? 'cursor-grab'
      : tool === 'select'
        ? 'cursor-move'
        : PANEL_TOOLS.includes(tool)
          ? 'cursor-default'
          : 'cursor-crosshair';

  const setResizeWBy = (v: number) => {
    const nw = Math.max(1, Math.round(v));
    setResizeW(nw);
    if (lockAspect) setResizeH(Math.max(1, Math.round((nw / (resizeW || 1)) * resizeH)));
  };
  const setResizeHBy = (v: number) => {
    const nh = Math.max(1, Math.round(v));
    setResizeH(nh);
    if (lockAspect) setResizeW(Math.max(1, Math.round((nh / (resizeH || 1)) * resizeW)));
  };

  const canvasSize = { w: Math.max(2, imgW * zoom), h: Math.max(2, imgH * zoom) };

  if (!file) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-muted text-foreground">
        <header className="shrink-0 h-14 flex items-center gap-2 px-3 border-b bg-card border-border">
          <HdrBtn onClick={() => onExit?.()} title="Back to NextTool">
            <ArrowLeft className="w-4 h-4" />
          </HdrBtn>
          <span className="text-xs font-semibold text-foreground">Image Editor</span>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                if (files.length) handleFiles(files);
              }}
              className="relative rounded-2xl border-2 border-dashed bg-card border-border p-10 text-center transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Edit images privately in your browser
              </h3>
              <p className="text-[13px] text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
                Crop, resize, annotate, blur and export — your image never leaves your device.
              </p>

              <div className="mt-7 mx-auto max-w-md rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center transition-colors">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground mt-3">Drop an image here</p>
                <p className="text-[11px] text-muted-foreground mt-1">or use the buttons below to browse your files</p>
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-primary px-5 py-2.5 text-[13px] rounded-lg">
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
                <Lock className="w-3.5 h-3.5" /> Processed locally in your browser — nothing is uploaded
              </p>
            </div>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={editorRef} className="fixed inset-0 z-[60] flex flex-col bg-muted text-foreground">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="shrink-0 h-14 flex items-center gap-2 px-3 border-b bg-card border-border z-10 overflow-x-auto">
        <HdrBtn onClick={() => onExit?.()} title="Back to NextTool">
          <ArrowLeft className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={() => { setFile(null); setError(null); setExportResult(null); }} title="Discard image, start over">
          <X className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={() => { if (objects.length || !isNeutral(adj)) { setPendingFile(null); fileInputRef.current?.click(); } else fileInputRef.current?.click(); }} title="Replace image">
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
          <div className="w-7 h-8 rounded-md overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Image Editor</div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              {file.name} · {imgW || '…'} × {imgH || '…'} · {fileType.replace('image/', '')} · {formatBytes(file.size)} · {zoomPct}
            </div>
          </div>
        </div>

        <HdrBtn onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={resetAll} title="Reset to original">
          <Trash2 className="w-4 h-4" />
        </HdrBtn>

        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-border shrink-0">
          <button onClick={() => setZoom(Math.max(ZOOM_MIN, zoom / 1.25))} title="Zoom out" aria-label="Zoom out"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, z * 1.25))} title="Zoom in" aria-label="Zoom in"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center text-[11px] font-mono text-muted-foreground select-none">{zoomPct}</span>
          <button onClick={applyFit} title="Fit to screen" aria-label="Fit to screen"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(1)} title="Actual size (100%)" aria-label="Actual size"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground">
            <span className="text-[9px] font-bold">1:1</span>
          </button>
        </div>

        <HdrBtn onClick={toggleFullscreen} title="Fullscreen" className="hidden lg:flex" active={isFullscreen}>
          <Maximize2 className="w-4 h-4" />
        </HdrBtn>
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
        {/* ── Left toolbar ─────────────────────────────────── */}
        <nav className="shrink-0 flex lg:flex-col gap-1 p-2 border-r bg-card border-border overflow-x-auto lg:overflow-y-auto lg:w-16 order-2 lg:order-1">
          {TOOL_GROUPS.map((group, gi) => (
            <React.Fragment key={group}>
              {gi > 0 && <div className="w-px h-6 self-center lg:w-6 lg:h-px lg:self-auto lg:my-1 bg-border shrink-0" aria-hidden="true" />}
              {TOOL_ORDER.filter(t => t.group === group).map(t => (
                <RailBtn key={t.id} active={tool === t.id} onClick={() => {
                  setExportOpen(false);
                  setTool(t.id);
                  if (t.id === 'crop') enterCrop();
                  if (t.id !== 'crop') setCropBox(null);
                  if (window.matchMedia('(max-width: 1023px)').matches) setShowSidebar(true);
                }} title={t.label} shortcut={t.shortcut}>
                  <t.Icon className="w-4 h-4" />
                </RailBtn>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* ── Canvas area ──────────────────────────────────── */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col order-1 lg:order-2">
          <div ref={containerRef} className="flex-1 min-h-0 overflow-auto relative bg-muted">
            <div className="min-w-full min-h-full flex">
              <div className="m-auto p-4 relative">
                <div
                  className="checkerboard rounded-lg overflow-hidden border shadow-lg border-border relative"
                  style={{ width: canvasSize.w, height: canvasSize.h }}
                >
                  <canvas
                    ref={canvasRef}
                    style={{ width: canvasSize.w, height: canvasSize.h, display: 'block' }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={() => {
                      onPointerUp({ pointerId: -1, pointerType: 'mouse' } as React.PointerEvent<HTMLCanvasElement>);
                      if (cursorRingRef.current) cursorRingRef.current.style.visibility = 'hidden';
                    }}
                    className={`block touch-none ${canvasCursor}`}
                    aria-label="Image editor canvas"
                  />
                  {tool === 'crop' && cropBox && (
                    <div
                      className="absolute inset-0 touch-none"
                      onPointerDown={(e) => onCropDown(e, 'move')}
                      onPointerMove={onCropMove}
                      onPointerUp={onCropUp}
                      style={{ cursor: 'move' }}
                    >
                      <div className="absolute inset-0 bg-black/45 pointer-events-none" style={{
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${(cropBox.x / imgW) * 100}% 0, ${(cropBox.x / imgW) * 100}% ${(cropBox.y / imgH) * 100}%, ${((cropBox.x + cropBox.w) / imgW) * 100}% ${(cropBox.y / imgH) * 100}%, ${((cropBox.x + cropBox.w) / imgW) * 100}% ${((cropBox.y + cropBox.h) / imgH) * 100}%, ${(cropBox.x / imgW) * 100}% ${((cropBox.y + cropBox.h) / imgH) * 100}%, ${(cropBox.x / imgW) * 100}% ${(cropBox.y / imgH) * 100}%)` }}
                      />
                      <div className="absolute border-2 border-white pointer-events-none shadow-inner"
                        style={{
                          left: cropBox.x * zoom, top: cropBox.y * zoom,
                          width: cropBox.w * zoom, height: cropBox.h * zoom,
                        }}
                      >
                        <span className="absolute -top-6 left-0 text-[10px] font-mono dark:bg-zinc-800/90 bg-slate-900/90 text-white px-1.5 py-0.5 rounded">
                          {Math.round(cropBox.w)} × {Math.round(cropBox.h)}
                        </span>
                      </div>
                      {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map(h => (
                        <div
                          key={h}
                          className="absolute w-3 h-3 bg-card border border-slate-400 rounded-sm"
                          style={{
                            left: (h.includes('w') ? cropBox.x * zoom - 6 : h === 'e' ? (cropBox.x + cropBox.w) * zoom - 6 : cropBox.x * zoom + cropBox.w * zoom / 2 - 6),
                            top: (h.includes('n') ? cropBox.y * zoom - 6 : h === 's' ? (cropBox.y + cropBox.h) * zoom - 6 : cropBox.y * zoom + cropBox.h * zoom / 2 - 6),
                            cursor: { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' }[h],
                          } as React.CSSProperties}
                          onPointerDown={(e) => onCropDown(e, h)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div
                  ref={cursorRingRef}
                  className="pointer-events-none absolute z-20 rounded-full border-2"
                  style={{ visibility: 'hidden', borderColor: '#ef4444', top: 0, left: 0 }}
                />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-1.5 border-t bg-card border-border text-[11px]">
            <p className="text-muted-foreground truncate flex-1">
              {isPanning ? 'Dragging to pan…' : HINT_BY_TOOL[tool]}{' '}
              <span className="hidden md:inline text-muted-foreground/70">· Ctrl+Z undo · Ctrl+Shift+Z redo · Ctrl+D duplicate · Del delete</span>
              <span className="hidden sm:inline text-muted-foreground/70"> · Hold Space to pan</span>
            </p>
            <span className="hidden md:inline text-muted-foreground font-mono shrink-0">{objects.length} object{objects.length === 1 ? '' : 's'} · {imgW} × {imgH} · {zoomPct}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button type="button" onClick={copyImage} className="h-8 px-3 rounded-lg inline-flex items-center gap-1.5 text-[11px] font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-all">
                <Copy className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Copy Image</span>
              </button>
              <button type="button" onClick={downloadExport} className="h-8 px-3 rounded-lg inline-flex items-center gap-1.5 text-[11px] font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors">
                <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </main>

        {/* ── Right sidebar ────────────────────────────────── */}
        {showSidebar && (
          <div className="absolute lg:hidden inset-0 bg-black/50 z-30" onClick={() => setShowSidebar(false)} />
        )}
        <aside className={`${showSidebar ? 'flex' : 'hidden'} lg:flex absolute lg:static top-14 h-[calc(100%-3.5rem)] lg:h-auto right-0 w-80 max-w-[92vw] z-40 lg:z-auto flex-col gap-4 p-4 overflow-y-auto border-l  bg-card border-border`}>
          <div className="flex items-center justify-between shrink-0">
            <h3 className="section-kicker flex items-center gap-1.5">
              <activeToolMeta.Icon className="w-3.5 h-3.5" /> {activeToolMeta.label}
            </h3>
            <button type="button" onClick={() => setShowSidebar(false)} title="Close panel" className="lg:hidden w-8 h-8 -mr-1.5 rounded-lg flex items-center justify-center hover:bg-muted  text-muted-foreground shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {tool === 'crop' && (
            <div>
              <h3 className="section-kicker mb-3">Crop</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {CROP_RATIOS.map(r => (
                      <button key={r.label} type="button" onClick={() => setCropRatio(r.ratio)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${cropRatio === r.ratio ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button type="button" onClick={applyCrop} className="flex-1 h-9 rounded-lg text-xs font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-colors">
                      Apply Crop
                    </button>
                    <button type="button" onClick={() => { setCropBox(null); setTool('select'); }} className="flex-1 h-9 rounded-lg border  text-muted-foreground hover:bg-muted text-xs font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
            </div>
          )}

          {tool === 'select' && (
            <p className="text-[11px]  text-muted-foreground leading-relaxed rounded-lg border border-border p-3">
              {HINT_BY_TOOL.select}
            </p>
          )}

          {tool === 'shapes' && (
            <div>
              <h3 className="section-kicker mb-2.5">Shape</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {SHAPE_CHOICES.map(c => (
                  <button key={c.id} type="button" onClick={() => setShapeType(c.id)} title={c.label}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border text-[10px] font-semibold transition-colors ${shapeType === c.id ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
                    <c.Icon className="w-4 h-4" />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool === 'eraser' && (
            <p className="text-[11px]  text-muted-foreground leading-relaxed rounded-lg border border-border p-3">
              {HINT_BY_TOOL.eraser}
            </p>
          )}

          {(isStrokeTool || tool === 'shapes' || tool === 'arrow') && (
            <div>
              <h3 className="section-kicker mb-3">Style</h3>
                    <label className="block">
                      <FieldLabel>Stroke color</FieldLabel>
                      <div className="flex items-center gap-2.5">
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                          className="w-11 h-10 rounded-lg border border-border cursor-pointer" aria-label="Stroke color" />
                        <span className="font-mono text-[11px]  text-muted-foreground">{color}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {COLOR_PRESETS.map(c => (
                          <button key={c} type="button" onClick={() => setColor(c)} title={c} aria-label={`Color ${c}`}
                            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-primary ring-offset-1' : ''} border-border`}
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </label>
                    {isShapeTool && (
                      <div className="mt-3">
                        <FieldLabel>Fill color</FieldLabel>
                        <div className="flex items-center gap-2.5">
                          <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)}
                            className="w-11 h-10 rounded-lg border border-border cursor-pointer" aria-label="Fill color" />
                          <span className="font-mono text-[11px]  text-muted-foreground">{fillColor}</span>
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <RangeField label="Opacity" value={Math.round(opacity * 100)} min={5} max={100} suffix="%" onChange={(v) => setOpacity(v / 100)} />
                    </div>
                    {(isStrokeTool || isShapeTool) && (
                      <div className="mt-3">
                        <RangeField label="Size" value={size} min={1} max={80} suffix="px" onChange={setSize} />
                        <div className="flex items-center gap-1.5 mt-2">
                          {BRUSH_SIZES.map(s => (
                            <button key={s} type="button" onClick={() => setSize(s)} title={`${s}px`} aria-label={`${s}px brush`}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${size === s ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted'}`}>
                              <span className="rounded-full dark:bg-zinc-200 bg-slate-600" style={{ width: Math.min(12, Math.max(3, s / 4)), height: Math.min(12, Math.max(3, s / 4)) }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {isShapeTool && (
                      <>
                        <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer select-none mt-3">
                          <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} className="w-4 h-4 accent-primary" />
                          <span>Fill shape</span>
                        </label>
                        {tool === 'arrow' && (
                          <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer select-none mt-2">
                            <input type="checkbox" checked={doubleHead} onChange={(e) => setDoubleHead(e.target.checked)} className="w-4 h-4 accent-primary" />
                            <span>Double-ended arrow</span>
                          </label>
                        )}
                      </>
                    )}
                  </div>
          )}

          {isEffectTool && (
            <div>
              <RangeField label={tool === 'blur' ? 'Blur strength' : 'Pixel size'} value={tool === 'blur' ? blurStrength : pixelSize} min={4} max={64} suffix="px"
                onChange={(v) => tool === 'blur' ? setBlurStrength(v) : setPixelSize(v)} />
            </div>
          )}
                    {tool === 'text' && (
                      <>
                        <div className="mt-3">
                          <FieldLabel>Text</FieldLabel>
                          <input value={textValue} onChange={(e) => setTextValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                            className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary  bg-card border-border text-foreground" />
                        </div>
                        <div className="mt-3">
                          <FieldLabel>Font</FieldLabel>
                          <Select value={fontFamily} options={FONT_FAMILIES.map(f => ({ value: f, label: f.split(',')[0].replace(/["']/g, '') }))} onChange={setFontFamily} />
                        </div>
                        <div className="mt-3">
                          <RangeField label="Font size" value={fontSize} min={12} max={200} suffix="px" onChange={setFontSize} />
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                          {[{ k: 'bold', l: 'B' }, { k: 'italic', l: 'I' }, { k: 'underline', l: 'U' }].map(({ k, l }) => (
                            <button key={k} type="button" onClick={() => k === 'bold' ? setBold(b => !b) : k === 'italic' ? setItalic(i => !i) : setUnderline(u => !u)}
                              className={`w-9 h-9 rounded-lg border font-bold text-xs transition-colors ${(k === 'bold' ? bold : k === 'italic' ? italic : underline) ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground'}`}>
                              {l}
                            </button>
                          ))}
                          <label className="flex items-center gap-2 text-[11px]  text-muted-foreground cursor-pointer select-none ml-1">
                            <input type="checkbox" checked={textBg} onChange={(e) => setTextBg(e.target.checked)} className="w-4 h-4 accent-primary" />
                            Highlight
                          </label>
                        </div>
                        <div className="mt-3">
                          <FieldLabel>Alignment</FieldLabel>
                          <div className="flex items-center gap-1.5">
                            {[{ k: 'left', Icon: AlignLeft }, { k: 'center', Icon: AlignCenter }, { k: 'right', Icon: AlignRight }].map(({ k, Icon }) => (
                              <button key={k} type="button" onClick={() => setTextAlign(k as 'left' | 'center' | 'right')} title={`Align ${k}`} aria-label={`Align ${k}`}
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${textAlign === k ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground'}`}>
                                <Icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {tool === 'eyedropper' && sampled && (
                      <div className="mt-4 rounded-xl border border-border p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg border border-border" style={{ backgroundColor: sampled.hex }} />
                          <div className="text-[11px] font-mono  text-muted-foreground flex-1">
                            <div>{sampled.hex}</div>
                            <div className=" text-muted-foreground">{sampled.rgb} · {sampled.hsl}</div>
                          </div>
                          <button type="button" onClick={copyHex} className="h-8 px-2.5 rounded-lg border  text-muted-foreground hover:bg-muted text-[11px] font-medium flex items-center gap-1.5 transition-colors">
                            <Copy className="w-3 h-3" /> HEX
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedObj && (
                    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
                      <h3 className="section-kicker mb-2.5 flex items-center gap-1.5 text-primary">
                        Selected {TYPE_META[selectedObj.type]?.label ?? 'object'}
                      </h3>
                      {selectedObj.type === 'text' && (
                        <div className="mb-2.5">
                          <FieldLabel>Text content</FieldLabel>
                          <input value={selectedObj.text}
                            onFocus={() => { textEditPushedRef.current = false; }}
                            onChange={(e) => {
                              if (!textEditPushedRef.current) { textEditPushedRef.current = true; pushHistory(null, objectsRef.current); }
                              const id = selectedObj.id;
                              setObjects(prev => prev.map(o => o.id === id && o.type === 'text' ? { ...o, text: e.target.value } : o));
                            }}
                            className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25  bg-card border-border text-foreground" />
                        </div>
                      )}
                      {(selectedObj.type === 'blurrect' || selectedObj.type === 'pixelrect' || selectedObj.type === 'blurstroke' || selectedObj.type === 'pixelstroke') && (
                        <RangeField label={selectedObj.type.includes('blur') ? 'Strength' : 'Pixel size'} value={selectedObj.strength} min={4} max={64} suffix="px"
                          onGestureStart={() => { if (!objOpacityPushedRef.current) { objOpacityPushedRef.current = true; pushHistory(null, objectsRef.current); } }}
                          onChange={(v) => {
                            const id = selectedObj.id;
                            setObjects(prev => prev.map(o => o.id === id && 'strength' in o ? { ...o, strength: v } : o));
                          }} />
                      )}
                      {'opacity' in selectedObj && selectedObj.opacity !== undefined && (
                        <RangeField label="Opacity" value={Math.round((selectedObj.opacity ?? 1) * 100)} min={5} max={100} suffix="%" onChange={(v) => setObjOpacity(v / 100)} />
                      )}
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

                  <div className="flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="section-kicker flex items-center gap-1.5"><LayersIcon className="w-3.5 h-3.5" /> Layers</h3>
                      <span className="text-[10px] font-mono  text-muted-foreground">{objects.length}</span>
                    </div>
                    {objects.length === 0 ? (
                      <p className="text-[11px]  text-muted-foreground leading-relaxed">
                        Nothing added yet. Pick a tool from the left and start editing.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {[...objects].reverse().map(o => {
                          const meta = TYPE_META[o.type] ?? { label: o.type, Icon: LayersIcon };
                          const active = o.id === selectedId;
                          return (
                            <li key={o.id} className="flex items-center gap-1">
                              <button onClick={() => setSelectedId(o.id)}
                                className={`flex-1 min-w-0 flex items-center gap-2 px-2 py-1.5 rounded-lg border text-left transition-colors ${active ? 'bg-primary/10 border-primary text-primary' : ' bg-card border-border hover:bg-muted text-muted-foreground'}`}>
                                <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-border" style={{ backgroundColor: o.type.includes('blur') || o.type.includes('pixel') ? '#a855f7' : 'color' in o ? o.color : '#6366f1' }} />
                                <span className="text-[11px] truncate flex-1">{meta.label}</span>
                                <meta.Icon className="w-3 h-3  text-muted-foreground shrink-0" />
                              </button>
                              <button onClick={() => moveLayer(o.id, 1)} title="Bring forward" aria-label="Bring forward"
                                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted  text-muted-foreground shrink-0">
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button onClick={() => moveLayer(o.id, -1)} title="Send backward" aria-label="Send backward"
                                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted  text-muted-foreground shrink-0">
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

          {/* ADJUST */}
          {tool === 'adjust' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-kicker flex items-center gap-1.5"><SunMedium className="w-3.5 h-3.5" /> Adjustments</h3>
                <button type="button" onClick={resetAdjustments} className="text-[11px] font-medium  text-muted-foreground hover:text-primary transition-colors">
                  Reset Adjustments
                </button>
              </div>
              {(['brightness', 'contrast', 'saturation', 'exposure', 'blur', 'sharpen', 'temp'] as (keyof Adjustments)[]).map(key => (
                <div key={key} className="mb-3">
                  <RangeField label={ADJUST_LABELS[key]} value={adj[key] as number} min={key === 'blur' || key === 'sharpen' ? 0 : -100} max={key === 'blur' || key === 'sharpen' ? 100 : 100} suffix=""
                    onGestureStart={gestureReset}
                    onChange={(v) => setAdjValue(key, v)} />
                </div>
              ))}
              <div className="flex flex-wrap gap-2 mt-1">
                {([['grayscale', 'Grayscale'], ['sepia', 'Sepia'], ['invert', 'Invert']] as [keyof Adjustments, string][]).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => { gestureReset(); setAdjValue(k, !adj[k]); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${adj[k] ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <h3 className="section-kicker mt-6 mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Filters</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(FILTERS).map(([k, f]) => (
                  <button key={k} type="button" onClick={() => applyFilter(k)}
                    className={`px-1 py-2 rounded-lg text-[10.5px] font-semibold border transition-colors ${f.label === 'Original' ? '' : ''} ${JSON.stringify({ brightness: adj.brightness, contrast: adj.contrast, saturation: adj.saturation, exposure: adj.exposure, temp: adj.temp, grayscale: adj.grayscale, sepia: adj.sepia }) === JSON.stringify({ ...NEUTRAL_ADJ, ...f.adj }) ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESIZE */}
          {tool === 'resize' && (
            <div>
              <h3 className="section-kicker mb-3 flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Resize</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <FieldLabel>Width (px)</FieldLabel>
                  <input type="number" value={resizeW} min={1} max={MAX_DIM} onChange={(e) => setResizeWBy(Number(e.target.value))}
                    className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25  bg-card border-border text-foreground" />
                </label>
                <label className="block">
                  <FieldLabel>Height (px)</FieldLabel>
                  <input type="number" value={resizeH} min={1} max={MAX_DIM} onChange={(e) => setResizeHBy(Number(e.target.value))}
                    className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25  bg-card border-border text-foreground" />
                </label>
              </div>
              <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer select-none mt-3">
                <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span>Lock aspect ratio</span>
              </label>
              <div className="mt-4">
                <FieldLabel>Scale</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {PERCENT_PRESETS.map(p => (
                    <button key={p} type="button" onClick={() => resizeRaster(Math.round(imgW * p / 100), Math.round(imgH * p / 100))}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border  border-border text-muted-foreground hover:bg-muted transition-colors">
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <FieldLabel>Presets</FieldLabel>
                <div className="flex flex-col gap-1.5">
                  {RESIZE_PRESETS.map(p => (
                    <button key={p.label} type="button" onClick={() => { setResizeW(p.w); setResizeH(p.h); resizeRaster(p.w, p.h); }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border  border-border text-muted-foreground hover:bg-muted text-[11px] font-medium transition-colors">
                      <span>{p.label}</span>
                      <span className="font-mono text-[10px]  text-muted-foreground">{p.w} × {p.h}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => resizeRaster(resizeW, resizeH)} className="mt-4 w-full h-9 rounded-lg text-xs font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-colors">
                Apply Resize
              </button>
            </div>
          )}

          {/* ROTATE */}
          {tool === 'rotate' && (
            <div>
              <h3 className="section-kicker mb-4 flex items-center gap-1.5"><RotateCw className="w-3.5 h-3.5" /> Rotate &amp; Flip</h3>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => rotateBy(90)} className="flex flex-col items-center gap-2 h-20 rounded-xl border  border-border text-muted-foreground hover:bg-muted text-[11px] font-medium transition-colors">
                  <RotateCcw className="w-5 h-5" /> Rotate left
                </button>
                <button type="button" onClick={() => rotateBy(270)} className="flex flex-col items-center gap-2 h-20 rounded-xl border  border-border text-muted-foreground hover:bg-muted text-[11px] font-medium transition-colors">
                  <RotateCw className="w-5 h-5" /> Rotate right
                </button>
                <button type="button" onClick={() => rotateBy(180)} className="flex flex-col items-center gap-2 h-20 rounded-xl border  border-border text-muted-foreground hover:bg-muted text-[11px] font-medium transition-colors">
                  <RefreshCw className="w-5 h-5" /> Rotate 180°
                </button>
                <button type="button" onClick={() => flipBy(true)} className="flex flex-col items-center gap-2 h-20 rounded-xl border  border-border text-muted-foreground hover:bg-muted text-[11px] font-medium transition-colors">
                  <FlipHorizontal2 className="w-5 h-5" /> Flip horizontal
                </button>
                <button type="button" onClick={() => flipBy(false)} className="flex flex-col items-center gap-2 h-20 rounded-xl border  border-border text-muted-foreground hover:bg-muted text-[11px] font-medium transition-colors">
                  <FlipVertical2 className="w-5 h-5" /> Flip vertical
                </button>
              </div>
            </div>
          )}

          {/* EXPORT DRAWER */}
        </aside>

        {exportOpen && (
          <>
            <div className="absolute inset-0 z-[45] lg:hidden bg-black/50" onClick={() => setExportOpen(false)} />
            <div className="absolute top-14 right-0 bottom-0 z-[46] w-80 max-w-[92vw] flex flex-col border-l dark:bg-card border-border shadow-2xl fade-in">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
                <h3 className="section-kicker flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export Image</h3>
                <button type="button" onClick={() => setExportOpen(false)} title="Close export panel" aria-label="Close export panel" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted  text-muted-foreground shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-4">
                {exportResult ? (
                  <div className="rounded-xl border border-border bg-muted p-2.5">
                    <img
                      src={exportResult.url}
                      alt="Export preview"
                      draggable
                      onDragStart={(e) => onDragStart(e, exportResult)}
                      className="w-full max-h-56 object-contain cursor-grab mx-auto"
                    />
                    <div className="flex items-center justify-between mt-2 px-0.5">
                      <span className="text-[10px] font-mono  text-muted-foreground">{exportResult.w} × {exportResult.h} · {formatBytes(exportResult.blob.size)}</span>
                      <span className="text-[10px] font-medium  text-muted-foreground">drag to drop</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-xl border border-border flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                )}
                <div>
                  <FieldLabel>Format</FieldLabel>
                  <div className="flex gap-1.5">
                    {[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setExportFormat(v)}
                        className={`flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-colors ${exportFormat === v ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
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
                          className={`flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-colors ${exportBg === v ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    {exportBg === 'custom' && (
                      <div className="flex items-center gap-2.5 mt-3">
                        <input type="color" value={exportBgColor} onChange={(e) => setExportBgColor(e.target.value)}
                          className="w-11 h-10 rounded-lg border border-border cursor-pointer" aria-label="Background color" />
                        <span className="font-mono text-[11px]  text-muted-foreground">{exportBgColor}</span>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <FieldLabel>Dimensions</FieldLabel>
                  <div className="flex gap-1.5">
                    {([['current', 'Current'], ['original', 'Original'], ['custom', 'Custom']] as ['current' | 'original' | 'custom', string][]).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setExportDims(v)}
                        className={`flex-1 h-9 rounded-lg text-[11px] font-semibold border transition-colors ${exportDims === v ? 'bg-primary/10 border-primary text-primary' : ' border-border text-muted-foreground hover:bg-muted'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {exportDims === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <input type="number" value={exportW} min={1} max={MAX_DIM} onChange={(e) => setExportW(Number(e.target.value))}
                        className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25  bg-card border-border text-foreground" placeholder="Width" aria-label="Export width" />
                      <input type="number" value={exportH} min={1} max={MAX_DIM} onChange={(e) => setExportH(Number(e.target.value))}
                        className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25  bg-card border-border text-foreground" placeholder="Height" aria-label="Export height" />
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel>Filename</FieldLabel>
                  <input value={exportName} onChange={(e) => setExportName(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/25  bg-card border-border text-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={copyImage} className="h-10 rounded-lg text-xs font-semibold bg-primary hover:brightness-110 text-primary-foreground transition-colors inline-flex items-center justify-center gap-1.5">
                    <Copy className="w-4 h-4" /> Copy Image
                  </button>
                  <button type="button" onClick={() => downloadExport()} className="h-10 rounded-lg text-xs font-semibold border  text-muted-foreground hover:bg-muted transition-colors inline-flex items-center justify-center gap-1.5">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                <p className="text-[10px]  text-muted-foreground leading-relaxed">
                  Drag the preview to another app. Drag-out isn't supported everywhere — use <span className=" text-muted-foreground font-medium">Copy Image</span> or <span className=" text-muted-foreground font-medium">Download</span> as a fallback.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Mobile zoom controls */}
        <div className="absolute bottom-16 right-3 sm:hidden z-40 flex items-center gap-0.5 rounded-xl border dark:bg-card border-border shadow-lg p-1">
          <button onClick={() => setZoom(Math.max(ZOOM_MIN, zoom / 1.25))} title="Zoom out" aria-label="Zoom out"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted  text-muted-foreground">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-[11px] font-mono  text-muted-foreground select-none">{zoomPct}</span>
          <button onClick={() => setZoom(z => Math.min(ZOOM_MAX, z * 1.25))} title="Zoom in" aria-label="Zoom in"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted  text-muted-foreground">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={applyFit} title="Fit to screen" aria-label="Fit to screen"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted  text-muted-foreground">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <HdrBtn onClick={() => setShowSidebar(v => !v)} title="Settings panel" className="absolute bottom-3 right-3 lg:hidden z-40 h-11 w-11 rounded-xl shadow-lg">
          <SlidersHorizontal className="w-4 h-4" />
        </HdrBtn>
      </div>

      {/* Replace confirmation */}
      {confirmReplace && pendingFile && (
        <div className="absolute inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border dark:bg-card border-border p-5 shadow-2xl fade-in">
            <h3 className="text-sm font-bold  text-foreground">You have unsaved edits. Replace image?</h3>
            <p className="text-xs  text-muted-foreground mt-1.5">Your current edits will be removed.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => loadFile(pendingFile)} className="flex-1 h-9 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors">
                Replace
              </button>
              <button type="button" onClick={() => { setConfirmReplace(false); setPendingFile(null); }} className="flex-1 h-9 rounded-lg border  text-muted-foreground hover:bg-muted text-xs font-medium transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl border bg-card border-primary/25 shadow-lg fade-in">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-medium  text-muted-foreground">Applying adjustments…</span>
        </div>
      )}
      {toast && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border dark:dark:border-emerald-500/30 bg-card border-emerald-200 shadow-lg fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium  text-muted-foreground">{toast}</span>
        </div>
      )}
      {error && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-md">
          <ErrorNotice message={error} />
        </div>
      )}
    </div>
  );
};
