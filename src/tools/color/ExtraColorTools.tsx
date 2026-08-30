import React, { useMemo, useState } from 'react';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { Blend, Palette, Contrast, Plus, Trash2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Shared color helpers                                                */
/* ------------------------------------------------------------------ */

function hexToRgb(hexStr: string): { r: number; g: number; b: number } {
  let clean = hexStr.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r: number, g: number, b: number;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

/* ------------------------------------------------------------------ */
/* Gradient Generator                                                  */
/* ------------------------------------------------------------------ */

interface ColorStop { id: number; color: string; position: number; }

export const GradientGeneratorTool: React.FC = () => {
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: '#6366F1', position: 0 },
    { id: 2, color: '#EC4899', position: 100 },
  ]);
  const nextId = React.useRef(3);

  const gradientCss = useMemo(() => {
    const stopsCss = [...stops].sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`).join(', ');
    return type === 'linear'
      ? `linear-gradient(${angle}deg, ${stopsCss})`
      : `radial-gradient(circle, ${stopsCss})`;
  }, [type, angle, stops]);

  const cssCode = `background: ${gradientCss};`;

  const updateStop = (id: number, patch: Partial<ColorStop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addStop = () => {
    setStops((prev) => [...prev, { id: nextId.current++, color: '#22D3EE', position: 50 }]);
  };

  const removeStop = (id: number) => {
    setStops((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== id) : prev));
  };

  return (
    <div className="space-y-4">
      <div
        className="w-full h-40 rounded-xl border border-border shadow-inner"
        style={{ background: gradientCss }}
      />

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Blend className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Gradient Type</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setType('linear')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${type === 'linear' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>Linear</button>
          <button onClick={() => setType('radial')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${type === 'radial' ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>Radial</button>
        </div>
        {type === 'linear' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">Angle</span>
              <span className="font-mono font-bold text-primary">{angle}°</span>
            </div>
            <input
              type="range" min={0} max={360} value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-label">Color Stops</p>
          <button onClick={addStop} className="btn-ghost text-xs py-1 px-2">
            <Plus className="w-3.5 h-3.5" /> Add Stop
          </button>
        </div>
        {stops.map((stop) => (
          <div key={stop.id} className="flex items-center gap-2.5 bg-muted border border-border rounded-lg p-2.5">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(stop.id, { color: e.target.value })}
              className="w-9 h-9 rounded-md border border-border cursor-pointer p-0.5 shrink-0"
            />
            <input
              type="range" min={0} max={100} value={stop.position}
              onChange={(e) => updateStop(stop.id, { position: parseInt(e.target.value) })}
              className="flex-1 h-1.5 bg-card rounded-full appearance-none cursor-pointer accent-primary"
            />
            <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">{stop.position}%</span>
            <button
              onClick={() => removeStop(stop.id)}
              disabled={stops.length <= 2}
              className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="section-label">CSS Code</p>
          <CopyButton text={cssCode} />
        </div>
        <div className="bg-muted border border-border rounded-lg px-3 py-2.5 text-xs font-mono text-foreground break-all">
          {cssCode}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Palette Generator (color harmony)                                   */
/* ------------------------------------------------------------------ */

type Harmony = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';

function generateHarmony(hex: string, harmony: Harmony): string[] {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  const fromHsl = (hh: number, ss: number, ll: number) => {
    const rgb = hslToRgb(hh, ss, ll);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  switch (harmony) {
    case 'complementary':
      return [fromHsl(h, s, l), fromHsl(h + 180, s, l)];
    case 'analogous':
      return [fromHsl(h - 30, s, l), fromHsl(h, s, l), fromHsl(h + 30, s, l)];
    case 'triadic':
      return [fromHsl(h, s, l), fromHsl(h + 120, s, l), fromHsl(h + 240, s, l)];
    case 'tetradic':
      return [fromHsl(h, s, l), fromHsl(h + 90, s, l), fromHsl(h + 180, s, l), fromHsl(h + 270, s, l)];
    case 'monochromatic':
      return [20, 35, 50, 65, 80].map((ll) => fromHsl(h, s, ll));
    default:
      return [fromHsl(h, s, l)];
  }
}

export const PaletteGeneratorTool: React.FC = () => {
  const [seed, setSeed] = useState('#6366F1');
  const [harmony, setHarmony] = useState<Harmony>('complementary');

  const swatches = useMemo(() => generateHarmony(seed, harmony), [seed, harmony]);

  const harmonyOptions: { value: Harmony; label: string }[] = [
    { value: 'complementary', label: 'Complementary' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'monochromatic', label: 'Monochromatic' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Seed Color & Harmony</p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="color"
            value={seed}
            onChange={(e) => setSeed(e.target.value.toUpperCase())}
            className="w-12 h-10 rounded-lg bg-muted border border-border cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value.toUpperCase())}
            className="input-base font-mono uppercase"
          />
        </div>
        <Select value={harmony} options={harmonyOptions} onChange={(v) => setHarmony(v as Harmony)} />
      </div>

      <div className={`grid gap-3 ${swatches.length > 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {swatches.map((hex, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="h-20" style={{ backgroundColor: hex }} />
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-foreground">{hex}</span>
              <CopyButton text={hex} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Contrast Checker                                                    */
/* ------------------------------------------------------------------ */

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export const ContrastCheckerTool: React.FC = () => {
  const [foreground, setForeground] = useState('#111111');
  const [background, setBackground] = useState('#FFFFFF');

  const ratio = useMemo(() => contrastRatio(foreground, background), [foreground, background]);
  const ratioStr = ratio.toFixed(2);

  const checks = [
    { label: 'Normal Text AA', pass: ratio >= 4.5 },
    { label: 'Normal Text AAA', pass: ratio >= 7 },
    { label: 'Large Text AA', pass: ratio >= 3 },
    { label: 'Large Text AAA', pass: ratio >= 4.5 },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Contrast className="w-4 h-4 text-primary shrink-0" />
          <p className="section-label">Colors</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Foreground (Text)</p>
            <div className="flex items-center gap-2">
              <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value.toUpperCase())} className="w-10 h-10 rounded-lg bg-muted border border-border cursor-pointer p-0.5 shrink-0" />
              <input type="text" value={foreground} onChange={(e) => setForeground(e.target.value.toUpperCase())} className="input-base font-mono uppercase" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Background</p>
            <div className="flex items-center gap-2">
              <input type="color" value={background} onChange={(e) => setBackground(e.target.value.toUpperCase())} className="w-10 h-10 rounded-lg bg-muted border border-border cursor-pointer p-0.5 shrink-0" />
              <input type="text" value={background} onChange={(e) => setBackground(e.target.value.toUpperCase())} className="input-base font-mono uppercase" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6 text-center space-y-2" style={{ backgroundColor: background }}>
        <p style={{ color: foreground }} className="text-2xl font-bold">Sample Large Text</p>
        <p style={{ color: foreground }} className="text-sm">The quick brown fox jumps over the lazy dog. This is normal-sized sample text.</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-label">Contrast Ratio</p>
          <span className="text-2xl font-extrabold text-primary font-mono">{ratioStr}:1</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {checks.map((c) => (
            <div key={c.label} className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between ${c.pass ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
              <span>{c.label}</span>
              <span>{c.pass ? 'Pass' : 'Fail'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
