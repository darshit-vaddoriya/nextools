import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PenLine, Highlighter, Eraser, Undo2, Redo2, Trash2, Download, X, Image as ImageIcon,
  MousePointer2, Square, Circle, Minus, MoveRight, Type, Delete,
  ZoomIn, ZoomOut, Maximize2, Copy, ArrowUp, ArrowDown, SlidersHorizontal, RefreshCw,
  CheckCircle2, Star, Heart, FilePlus2, Upload, ClipboardPaste, Layers,
} from 'lucide-react';
import { ErrorNotice } from './image/ImageShared';
import { Select } from '../components/Select';
import { loadImage, canvasExport, downloadBlob, baseNameFrom } from './image/ImageUtils';
import { errorMessage } from '../utils/errorMessage';

const MAX_DIM = 4000;
const HISTORY_LIMIT = 30;
const ZOOM_MIN = 0.05;
const ZOOM_MAX = 4;

const EXPORT_FORMATS = [
  { value: 'image/png', label: 'PNG (lossless)' },
  { value: 'image/jpeg', label: 'JPG (smaller)' },
  { value: 'image/webp', label: 'WebP (smallest)' },
];

const TOOL_ORDER: { id: ToolId; label: string; shortcut: string; Icon: React.ElementType }[] = [
  { id: 'select', label: 'Move', shortcut: 'V', Icon: MousePointer2 },
  { id: 'pen', label: 'Brush', shortcut: 'B', Icon: PenLine },
  { id: 'marker', label: 'Highlighter', shortcut: 'M', Icon: Highlighter },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', Icon: Eraser },
  { id: 'line', label: 'Line', shortcut: 'L', Icon: Minus },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', Icon: MoveRight },
  { id: 'rect', label: 'Rectangle', shortcut: 'R', Icon: Square },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', Icon: Circle },
  { id: 'star', label: 'Star', shortcut: 'S', Icon: Star },
  { id: 'heart', label: 'Heart', shortcut: 'H', Icon: Heart },
  { id: 'text', label: 'Text', shortcut: 'T', Icon: Type },
];

const TYPE_META: Record<DrawObject['type'], { label: string; Icon: React.ElementType }> = {
  stroke: { label: 'Brush stroke', Icon: PenLine },
  marker: { label: 'Highlight', Icon: Highlighter },
  rect: { label: 'Rectangle', Icon: Square },
  ellipse: { label: 'Ellipse', Icon: Circle },
  star: { label: 'Star', Icon: Star },
  heart: { label: 'Heart', Icon: Heart },
  line: { label: 'Line', Icon: Minus },
  arrow: { label: 'Arrow', Icon: MoveRight },
  text: { label: 'Text', Icon: Type },
};

const HINT_BY_TOOL: Record<ToolId, string> = {
  select: 'Click an object to select it, then drag to move. Del removes the selection.',
  pen: 'Click and drag to draw a freehand brush stroke.',
  marker: 'Drag to highlight over the canvas like a translucent marker.',
  eraser: 'Click or drag over objects to erase them. Objects are removed as a whole.',
  line: 'Drag on the canvas to draw a straight line.',
  arrow: 'Drag on the canvas to draw an arrow.',
  rect: 'Drag on the canvas to draw a rectangle.',
  ellipse: 'Drag on the canvas to draw an ellipse.',
  star: 'Drag on the canvas to draw a five-pointed star.',
  heart: 'Drag on the canvas to draw a heart.',
  text: 'Click anywhere on the canvas to place your text.',
};

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#facc15', '#f8fafc', '#94a3b8', '#111827',
];

const BRUSH_SIZES = [2, 4, 8, 16, 32, 64];

const TOOL_KEYS: Record<string, ToolId> = {
  v: 'select', b: 'pen', m: 'marker', e: 'eraser', l: 'line', a: 'arrow',
  r: 'rect', o: 'ellipse', s: 'star', h: 'heart', t: 'text',
};

const CANVAS_PRESETS = [
  { label: 'Landscape', w: 1920, h: 1080, hint: '16:9' },
  { label: 'Square', w: 1080, h: 1080, hint: '1:1' },
  { label: 'Portrait', w: 1080, h: 1350, hint: '4:5' },
  { label: 'HD Video', w: 1280, h: 720, hint: '16:9' },
  { label: 'A4 Print', w: 2480, h: 3508, hint: '300 dpi' },
  { label: 'Story', w: 1080, h: 1920, hint: '9:16' },
];

const BG_OPTIONS: { label: string; value: string; class: string }[] = [
  { label: 'White', value: '#ffffff', class: 'bg-card border-border' },
  { label: 'Transparent', value: 'transparent', class: 'checkerboard border-border' },
  { label: 'Dark', value: '#18181b', class: 'bg-zinc-900 border-zinc-700' },
  { label: 'Gray', value: '#e4e4e7', class: 'bg-zinc-200 border-zinc-300' },
];

type ToolId = 'select' | 'pen' | 'marker' | 'eraser' | 'line' | 'arrow' | 'rect' | 'ellipse' | 'star' | 'heart' | 'text';

interface Point { x: number; y: number; }

type DrawObject =
  | { id: string; type: 'stroke' | 'marker'; points: Point[]; color: string; size: number; opacity?: number }
  | { id: string; type: 'rect' | 'ellipse' | 'star' | 'heart'; x: number; y: number; w: number; h: number; color: string; size: number; fill: boolean; opacity?: number }
  | { id: string; type: 'line' | 'arrow'; x1: number; y1: number; x2: number; y2: number; color: string; size: number; opacity?: number }
  | { id: string; type: 'text'; x: number; y: number; text: string; color: string; size: number; opacity?: number };

let idCounter = 0;
const nextId = () => `d${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

const shapeTools: ToolId[] = ['rect', 'ellipse', 'line', 'arrow', 'star', 'heart'];

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
}> = ({ label, value, min, max, step = 1, suffix = '', onChange }) => (
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
      className="w-full h-1.5 cursor-pointer accent-indigo-500"
    />
  </label>
);

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

const RailBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  title: string;
  shortcut?: string;
  children: React.ReactNode;
}> = ({ active, onClick, title, shortcut, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`relative group w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors border
      ${active
        ? 'dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300 bg-indigo-100 border-indigo-300 text-indigo-700'
        : ' dark:hover:bg-white/[0.06] dark:border-transparent text-muted-foreground hover:bg-muted border-transparent'}`}
  >
    {children}
    {shortcut && (
      <span className="pointer-events-none absolute z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150
        left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 rounded-md text-[10px] font-medium
        dark:bg-zinc-800  dark:border dark:border-white/10
        bg-slate-900 text-white border border-slate-700 shadow-lg
        lg:left-full lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:ml-2 lg:mt-0">
        {title}
        <kbd className="ml-1.5 font-mono opacity-70">{shortcut}</kbd>
      </span>
    )}
  </button>
);

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2, cy = y + h / 2;
  const outer = Math.max(1, Math.min(w, h) / 2);
  const inner = outer * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + r * Math.cos(ang);
    const py = cy + r * Math.sin(ang);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  ctx.beginPath();
  ctx.moveTo(cx, y + h);
  ctx.bezierCurveTo(x, y + h * 0.55, x - w * 0.08, y + h * 0.1, x + w * 0.3, y + h * 0.06);
  ctx.bezierCurveTo(x + w * 0.44, y + h * 0.04, cx, y + h * 0.2, cx, y + h * 0.3);
  ctx.bezierCurveTo(cx, y + h * 0.2, cx + w * 0.56, y + h * 0.04, x + w * 0.7, y + h * 0.06);
  ctx.bezierCurveTo(x + w * 1.08, y + h * 0.1, x + w, y + h * 0.55, cx, y + h);
  ctx.closePath();
}

function drawObject(ctx: CanvasRenderingContext2D, o: DrawObject, offsetX = 0, offsetY = 0) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const alpha = o.opacity ?? 1;
  switch (o.type) {
    case 'stroke':
    case 'marker': {
      const baseAlpha = o.type === 'marker' ? 0.3 : 1;
      if (o.points.length < 2) {
        if (o.points.length === 1) {
          ctx.fillStyle = o.color;
          ctx.globalAlpha = alpha * baseAlpha;
          ctx.beginPath();
          ctx.arc(o.points[0].x + offsetX, o.points[0].y + offsetY, o.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      ctx.globalAlpha = alpha * baseAlpha;
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
        ctx.fillStyle = o.color;
        ctx.globalAlpha = alpha * 0.22;
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
        ctx.fillStyle = o.color;
        ctx.globalAlpha = alpha * 0.22;
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.stroke();
      break;
    }
    case 'star': {
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      starPath(ctx, o.x + offsetX, o.y + offsetY, o.w, o.h);
      if (o.fill) {
        ctx.fillStyle = o.color;
        ctx.globalAlpha = alpha * 0.22;
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.stroke();
      break;
    }
    case 'heart': {
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      heartPath(ctx, o.x + offsetX, o.y + offsetY, o.w, o.h);
      if (o.fill) {
        ctx.fillStyle = o.color;
        ctx.globalAlpha = alpha * 0.22;
        ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.stroke();
      break;
    }
    case 'line':
    case 'arrow': {
      const x1 = o.x1 + offsetX, y1 = o.y1 + offsetY, x2 = o.x2 + offsetX, y2 = o.y2 + offsetY;
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.size;
      ctx.globalAlpha = alpha;
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
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${o.size}px Arial, Helvetica, sans-serif`;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(o.text, o.x + offsetX, o.y + offsetY);
      break;
    }
  }
  ctx.restore();
}

function objectBounds(o: DrawObject): { x: number; y: number; w: number; h: number } {
  switch (o.type) {
    case 'stroke':
    case 'marker': {
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
    case 'heart':
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
    case 'ellipse':
    case 'star':
    case 'heart': {
      const { x, y, w, h } = objectBounds(o);
      return px >= x - pad && px <= x + w + pad && py >= y - pad && py <= y + h + pad;
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

export const DrawingTool: React.FC = () => {
  const [mode, setMode] = useState<'setup' | 'edit'>('setup');
  const [setupW, setSetupW] = useState(1920);
  const [setupH, setSetupH] = useState(1080);
  const [bg, setBg] = useState('#ffffff');
  const [isDragging, setIsDragging] = useState(false);

  const [tool, setTool] = useState<ToolId>('pen');
  const [color, setColor] = useState('#6366f1');
  const [size, setSize] = useState(8);
  const [fill, setFill] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(40);
  const [textValue, setTextValue] = useState('Your text here');
  const [format, setFormat] = useState('image/png');
  const [objects, setObjects] = useState<DrawObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [view, setView] = useState({ w: 0, h: 0 });
  const [canvasName, setCanvasName] = useState('drawing');
  const [showOptions, setShowOptions] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseRef = useRef<string | null>(null);
  const bgLayerRef = useRef<HTMLCanvasElement | null>(null);
  const undoRef = useRef<DrawObject[][]>([]);
  const redoRef = useRef<DrawObject[][]>([]);
  const penRef = useRef<{ points: Point[]; color: string; size: number; opacity: number; marker: boolean } | null>(null);
  const previewRef = useRef<{ tool: 'rect' | 'ellipse' | 'star' | 'heart' | 'line' | 'arrow'; color: string; size: number; fill: boolean; opacity: number; start: Point; cur: Point } | null>(null);
  const moveRef = useRef<{ id: string; start: Point; origin: Point } | null>(null);
  const erasingRef = useRef(false);
  const moveCommittedRef = useRef(false);
  const textEditPushedRef = useRef(false);
  const objOpacityPushedRef = useRef(false);
  const fitPendingRef = useRef(false);
  const zoomRef = useRef(1);
  const panRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);
  const spaceDownRef = useRef(false);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const savedTimerRef = useRef<number | null>(null);

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
    const bgc = bgLayerRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgc) ctx.drawImage(bgc, 0, 0);
    const pen = penRef.current;
    const preview = previewRef.current;
    for (const o of objects) {
      drawObject(ctx, o);
    }
    if (pen && pen.points.length) {
      drawObject(ctx, { id: 'pen', type: pen.marker ? 'marker' : 'stroke', points: pen.points, color: pen.color, size: pen.size, opacity: pen.opacity });
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
    if (sel && !moveRef.current && !penRef.current && !previewRef.current) {
      const b = objectBounds(sel);
      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      ctx.restore();
    }
  }, [objects, selectedId]);

  useEffect(() => {
    if (mode === 'edit') redraw();
  }, [redraw, mode]);

  useEffect(() => {
    textEditPushedRef.current = false;
    objOpacityPushedRef.current = false;
  }, [selectedId]);

  useEffect(() => {
    const ring = cursorRingRef.current;
    if (!ring) return;
    ring.style.visibility = (tool === 'pen' || tool === 'marker' || tool === 'eraser') && !spaceHeld && mode === 'edit' ? 'visible' : 'hidden';
  }, [tool, spaceHeld, mode]);

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
      case 'marker':
        copy.points = copy.points.map(pt => ({ x: pt.x + 14, y: pt.y + 14 }));
        break;
      case 'rect':
      case 'ellipse':
      case 'star':
      case 'heart':
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

  const setupCanvas = useCallback((base: HTMLCanvasElement, name: string) => {
    bgLayerRef.current = base;
    baseRef.current = base.toDataURL('image/png');
    undoRef.current = [];
    redoRef.current = [];
    setObjects([]);
    setSelectedId(null);
    setCanUndo(false);
    setCanRedo(false);
    setError(null);
    setImgW(base.width);
    setImgH(base.height);
    setCanvasName(name);
    setConfirmClear(false);
    setMode('edit');
    fitPendingRef.current = true;
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    try {
      const loaded = await loadImage(f);
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
      setupCanvas(base, baseNameFrom(f.name) || 'image');
    } catch (e) {
      setError(errorMessage(e, 'Could not load that image.'));
    }
  }, [setupCanvas]);

  const startBlank = useCallback((w: number, h: number, bgColor: string) => {
    const ww = Math.round(Math.min(MAX_DIM, Math.max(32, isFinite(w) ? w : 1920)));
    const hh = Math.round(Math.min(MAX_DIM, Math.max(32, isFinite(h) ? h : 1080)));
    const base = document.createElement('canvas');
    base.width = ww;
    base.height = hh;
    if (bgColor !== 'transparent') {
      const bctx = base.getContext('2d')!;
      bctx.fillStyle = bgColor;
      bctx.fillRect(0, 0, ww, hh);
    }
    setupCanvas(base, `drawing_${ww}x${hh}`);
  }, [setupCanvas]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find(t => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          handleFiles([new File([blob], 'pasted-image.png', { type: imgType })]);
          return;
        }
      }
      setError('No image found in the clipboard.');
    } catch {
      setError('Clipboard access was denied. Upload an image instead.');
    }
  }, [handleFiles]);

  useEffect(() => {
    if (mode !== 'edit' || !imgW || !imgH) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = imgW;
    canvas.height = imgH;
    redraw();
    const c = containerRef.current;
    if (c) setView({ w: c.clientWidth, h: c.clientHeight });
    fitPendingRef.current = true;
  }, [mode, imgW, imgH, redraw]);

  useEffect(() => {
    if (mode !== 'edit') return;
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => setView({ w: c.clientWidth, h: c.clientHeight }));
    ro.observe(c);
    return () => ro.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!fitPendingRef.current || !imgW || !imgH) return;
    const c = containerRef.current;
    if (!c || !c.clientWidth) return;
    const s = Math.min((c.clientWidth - 56) / imgW, (c.clientHeight - 56) / imgH, 1);
    setZoom(Math.max(ZOOM_MIN, s));
    fitPendingRef.current = false;
  }, [imgW, imgH, view]);

  useEffect(() => {
    if (mode !== 'edit') return;
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
  }, [mode]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (mode !== 'edit') return;
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
  }, [mode]);

  useEffect(() => {
    if (mode !== 'edit') return;
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
  }, [mode, undo, redo, duplicate, selectedId, objects, pushHistory]);

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
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    const el = containerRef.current;
    if ((spaceDownRef.current || e.button === 1) && el) {
      panRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      setIsPanning(true);
      return;
    }

    if (tool === 'select') {
      moveCommittedRef.current = false;
      const hit = [...objects].reverse().find(o => hitObject(o, p.x, p.y));
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
      const hit = [...objects].reverse().find(o => hitObject(o, p.x, p.y));
      if (hit) {
        pushHistory(objects);
        setObjects(prev => prev.filter(o => o.id !== hit.id));
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'pen' || tool === 'marker') {
      penRef.current = { points: [p], color, size, opacity, marker: tool === 'marker' };
      return;
    }

    if (shapeTools.includes(tool)) {
      previewRef.current = { tool: tool as 'rect' | 'ellipse' | 'star' | 'heart' | 'line' | 'arrow', color, size, fill, opacity, start: p, cur: p };
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

    if (tool === 'pen' || tool === 'marker' || tool === 'eraser') {
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

    const move = moveRef.current;
    if (move) {
      const dx = p.x - move.start.x;
      const dy = p.y - move.start.y;
      if (!moveCommittedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        moveCommittedRef.current = true;
        pushHistory(objects);
      }
      setObjects(prev => prev.map(o => {
        if (o.id !== move.id) return o;
        switch (o.type) {
          case 'stroke':
          case 'marker': return { ...o, points: o.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
          case 'rect':
          case 'ellipse':
          case 'star':
          case 'heart': return { ...o, x: o.x + dx, y: o.y + dy };
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
        setObjects(prev => [...prev, { id: nextId(), type: pen.marker ? 'marker' : 'stroke', points: pen.points, color: pen.color, size: pen.size, opacity: pen.opacity }]);
      }
      penRef.current = null;
      return;
    }
    const preview = previewRef.current;
    if (preview) {
      const { tool: t, color: c, size: s, fill: f, opacity: o, start, cur } = preview;
      previewRef.current = null;
      if (Math.abs(cur.x - start.x) > 3 || Math.abs(cur.y - start.y) > 3) {
        pushHistory(objects);
        const obj: DrawObject = {
          id: nextId(), type: t,
          x: Math.min(start.x, cur.x), y: Math.min(start.y, cur.y),
          w: Math.abs(cur.x - start.x), h: Math.abs(cur.y - start.y),
          x1: start.x, y1: start.y, x2: cur.x, y2: cur.y,
          color: c, size: s, fill: f, opacity: o,
        };
        setObjects(prev => [...prev, obj]);
        setSelectedId(obj.id);
      }
    }
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const out = document.createElement('canvas');
      out.width = canvas.width;
      out.height = canvas.height;
      const octx = out.getContext('2d')!;
      const bgc = bgLayerRef.current;
      if (bgc) octx.drawImage(bgc, 0, 0);
      for (const o of objects) drawObject(octx, o);
      let source = out;
      if (format === 'image/jpeg') {
        const white = document.createElement('canvas');
        white.width = out.width;
        white.height = out.height;
        const wctx = white.getContext('2d')!;
        wctx.fillStyle = '#ffffff';
        wctx.fillRect(0, 0, white.width, white.height);
        wctx.drawImage(out, 0, 0);
        source = white;
      }
      const { blob, ext } = await canvasExport(source, format);
      downloadBlob(blob, `${canvasName}.${ext}`);
      setSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => setSaved(false), 2600);
    } catch (e) {
      setError(errorMessage(e, 'Could not export the image.'));
    }
  };

  const selectedObj = objects.find(o => o.id === selectedId) ?? null;
  const isShapeTool = shapeTools.includes(tool);
  const isDrawTool = tool === 'pen' || tool === 'marker';
  const zoomPct = `${Math.round(zoom * 100)}%`;
  const canvasCursor = isPanning
    ? 'cursor-grabbing'
    : spaceHeld
      ? 'cursor-grab'
      : tool === 'select'
        ? 'cursor-move'
        : 'cursor-crosshair';

  if (mode === 'setup') {
    const presetActive = CANVAS_PRESETS.some(p => p.w === setupW && p.h === setupH);
    return (
      <div className="max-w-3xl mx-auto fade-in">
        <div className="mb-6">
          <span className="section-kicker mb-2">Create & draw</span>
          <h1 className="text-xl sm:text-2xl font-bold  text-foreground tracking-[-0.02em]">
            Drawing Board
          </h1>
          <p className="text-[13px]  text-muted-foreground mt-1">
            Sketch on a blank canvas from scratch or draw over a photo — everything stays on your device.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border   bg-card border-border p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg dark:bg-indigo-500/15 bg-indigo-100 flex items-center justify-center">
                <FilePlus2 className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold  text-foreground">Blank canvas</h3>
                <p className="text-[11px]  text-muted-foreground">Start drawing from scratch</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {CANVAS_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setSetupW(p.w); setSetupH(p.h); }}
                  className={`px-2 py-2 rounded-lg border text-left transition-colors ${
                    setupW === p.w && setupH === p.h
                      ? 'dark:border-indigo-500/50 dark:bg-indigo-500/15 bg-indigo-100 border-indigo-300'
                      : 'dark:border-white/[0.08] dark:hover:bg-white/[0.05] dark:bg-white/[0.03] border-border hover:bg-muted bg-card'
                  }`}
                >
                  <div className="text-[11.5px] font-semibold  text-muted-foreground">{p.label}</div>
                  <div className="text-[10px] font-mono  text-muted-foreground">
                    {p.w}×{p.h} <span className="opacity-70">· {p.hint}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <label className="flex-1">
                <span className="section-label block mb-1.5">Width</span>
                <input
                  type="number"
                  min={32}
                  max={MAX_DIM}
                  value={setupW}
                  onChange={(e) => setSetupW(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:bg-white/[0.07] dark:border-white/[0.14]  bg-card border-border text-foreground"
                />
              </label>
              <span className="pb-2 text-xs  text-muted-foreground">×</span>
              <label className="flex-1">
                <span className="section-label block mb-1.5">Height</span>
                <input
                  type="number"
                  min={32}
                  max={MAX_DIM}
                  value={setupH}
                  onChange={(e) => setSetupH(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:bg-white/[0.07] dark:border-white/[0.14]  bg-card border-border text-foreground"
                />
              </label>
            </div>
            {!presetActive && (
              <p className="text-[10px] font-mono  text-muted-foreground">Custom {setupW} × {setupH} px</p>
            )}

            <div>
              <span className="section-label block mb-1.5">Background</span>
              <div className="flex items-center gap-2.5">
                {BG_OPTIONS.map(o => (
                  <button
                    key={o.label}
                    type="button"
                    title={o.label}
                    aria-label={`Background ${o.label}`}
                    onClick={() => setBg(o.value)}
                    className={`w-8 h-8 rounded-lg border transition-transform hover:scale-110 ${o.class} ${
                      bg === o.value ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-dark-card' : ''
                    }`}
                  />
                ))}
                <span className="text-[11px]  text-muted-foreground">{BG_OPTIONS.find(o => o.value === bg)?.label}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startBlank(setupW, setupH, bg)}
              disabled={!(isFinite(setupW) && isFinite(setupH) && setupW >= 32 && setupH >= 32)}
              className="w-full h-10 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create canvas
            </button>
          </div>

          <div className="rounded-2xl border   bg-card border-border p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg dark:bg-pink-500/15 bg-pink-100 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold  text-foreground">Start from a photo</h3>
                <p className="text-[11px]  text-muted-foreground">Annotate, highlight and sketch over it</p>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files);
                if (files.length) handleFiles(files);
              }}
              className={`rounded-xl border-2 border-dashed text-center transition-all duration-200 p-6 space-y-3 ${
                isDragging ? 'border-indigo-500 bg-indigo-500/[0.06] scale-[1.01]' : ' border-border'
              }`}
            >
              <div className="w-11 h-11 rounded-xl dark:bg-indigo-500/10 bg-indigo-50 border dark:border-indigo-500/20 border-indigo-200 mx-auto flex items-center justify-center">
                <Upload className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-[12px] font-semibold  text-foreground">{isDragging ? 'Drop it to open' : 'Upload an image'}</p>
              <p className="text-[11px]  text-muted-foreground">PNG, JPG, WebP, GIF & more</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Choose image
              </button>
              <button
                type="button"
                onClick={pasteFromClipboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium border dark:border-white/[0.12]  dark:hover:bg-white/[0.06] border-border text-muted-foreground hover:bg-muted transition-colors ml-1.5"
              >
                <ClipboardPaste className="w-3.5 h-3.5" /> Paste
              </button>
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
            </div>

            <div className="rounded-xl dark:bg-white/[0.03] bg-muted border dark:border-white/[0.06] border-border p-3 space-y-1.5">
              {[
                'Pen, highlighter, eraser & shapes',
                'Text, arrows and free-form strokes',
                'Layers, undo/redo & zoom',
                'Export to PNG, JPG or WebP',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-[11px]  text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="mt-4"><ErrorNotice message={error} /></div>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-muted dark:bg-[#0b0b12] text-foreground ">
      <header className="shrink-0 h-14 flex items-center gap-2 px-3 border-b dark:bg-[#12121a] dark:border-white/[0.08] bg-card border-border z-10 overflow-x-auto">
        <HdrBtn onClick={() => { setMode('setup'); setError(null); }} title="Close editor">
          <X className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={() => startBlank(1920, 1080, '#ffffff')} title="New blank canvas">
          <FilePlus2 className="w-4 h-4" />
        </HdrBtn>
        <HdrBtn onClick={() => fileInputRef.current?.click()} title="Open an image">
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
            <div className="text-xs font-semibold  text-foreground truncate">{canvasName}</div>
            <div className="text-[10px] font-mono  text-muted-foreground">
              {imgW} × {imgH}px · {objects.length} object{objects.length === 1 ? '' : 's'}
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

        <div className="hidden md:block w-40 shrink-0">
          <Select value={format} options={EXPORT_FORMATS} onChange={setFormat} />
        </div>
        <button onClick={download} className="h-9 px-3.5 rounded-lg inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0">
          <Download className="w-4 h-4" /> Export
        </button>
      </header>

      <div className="flex-1 min-h-0 flex">
        <nav className="shrink-0 flex lg:flex-col gap-1 p-2 border-r dark:bg-[#12121a] dark:border-white/[0.08] bg-card border-border overflow-x-auto lg:overflow-y-auto lg:w-14">
          {TOOL_ORDER.map(t => (
            <RailBtn key={t.id} active={tool === t.id} onClick={() => setTool(t.id)} title={t.label} shortcut={t.shortcut}>
              <t.Icon className="w-4 h-4" />
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
                    onPointerLeave={() => {
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
              <span className="hidden md:inline  text-slate-300">· Ctrl+Z undo · Ctrl+Shift+Z redo · Ctrl+D duplicate · Del delete</span>
              <span className="hidden sm:inline  text-slate-300"> · Hold Space to pan</span>
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
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-dark-card' : ''} dark:border-white/20 border-border`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </label>
            <div className="mt-3">
              <RangeField label="Opacity" value={Math.round(opacity * 100)} min={5} max={100} suffix="%" onChange={(v) => setOpacity(v / 100)} />
            </div>
            {(isDrawTool || isShapeTool) && (
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
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${size === s ? 'dark:border-indigo-500/50 dark:bg-indigo-500/15 bg-indigo-100 border-indigo-300' : 'dark:border-white/[0.1] dark:hover:bg-white/[0.06] border-border hover:bg-muted'}`}
                    >
                      <span
                        className="rounded-full dark:bg-zinc-200 bg-slate-600"
                        style={{ width: Math.min(12, Math.max(3, s / 4)), height: Math.min(12, Math.max(3, s / 4)) }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isShapeTool && (
              <label className="flex items-center gap-2.5 text-xs  text-muted-foreground cursor-pointer select-none mt-3">
                <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
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
                    className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 dark:bg-white/[0.07] dark:border-white/[0.14]  bg-card border-border text-foreground"
                  />
                </div>
                <div className="mt-3">
                  <RangeField label="Font size" value={fontSize} min={12} max={180} suffix="px" onChange={setFontSize} />
                </div>
              </>
            )}
          </div>

          {selectedObj && (
            <div className="rounded-xl border dark:border-indigo-500/25 border-indigo-200 dark:bg-indigo-500/[0.07] bg-indigo-50 p-3">
              <h3 className="section-kicker mb-2.5 flex items-center gap-1.5 dark:text-indigo-300 text-indigo-700">
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
                    className="w-full rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:bg-white/[0.07] dark:border-white/[0.14]  bg-card border-border text-foreground"
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
                            ? 'dark:bg-indigo-500/15 dark:border-indigo-500/40 dark:text-indigo-200 bg-indigo-100 border-indigo-300 text-indigo-800'
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

          <div className="rounded-xl dark:bg-white/[0.03] bg-muted border dark:border-white/[0.06] border-border p-3">
            <div className="flex items-center gap-2 text-[11px]  text-muted-foreground mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold">Canvas</span>
            </div>
            <p className="text-[10.5px] font-mono  text-muted-foreground leading-relaxed">
              {imgW} × {imgH} px
            </p>
            <div className="flex gap-1.5 mt-2">
              <HdrBtn onClick={() => startBlank(imgW, imgH, '#ffffff')} title="Start over with a white canvas of the same size" className="h-8 px-2.5 text-[11px]">
                <FilePlus2 className="w-3.5 h-3.5" /> New
              </HdrBtn>
              <HdrBtn onClick={() => setMode('setup')} title="Choose a different canvas or image" className="h-8 px-2.5 text-[11px]">
                <RefreshCw className="w-3.5 h-3.5" /> Change
              </HdrBtn>
            </div>
          </div>
        </aside>

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
      {saved && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border dark:bg-[#12121a] dark:border-emerald-500/30 bg-card border-emerald-200 shadow-lg fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium  text-muted-foreground">Image exported successfully</span>
        </div>
      )}
    </div>
  );
};
