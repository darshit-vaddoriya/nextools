import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Palette } from 'lucide-react';

export const ColorPicker: React.FC = () => {
  const [hex, setHex] = useState<string>('#6366F1');

  const hexToRgb = (hexStr: string) => {
    let clean = hexStr.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 99, g: 102, b: 241 };
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
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
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  // Compute luminance to decide text color on preview
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const previewText = luminance > 0.55 ? '#000' : '#fff';

  // Generate a small palette of shades
  const shades = [10, 20, 40, 60, 80, 90].map(l => {
    const h2 = hsl.h;
    const s2 = Math.round(hsl.s * 0.9);
    const l2 = l;
    return `hsl(${h2}, ${s2}%, ${l2}%)`;
  });

  const formats = [
    { label: 'HEX', value: hex.toUpperCase(), color: 'text-primary' },
    { label: 'RGB', value: rgbString, color: 'text-emerald-500 ' },
    { label: 'HSL', value: hslString, color: 'text-purple-500 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-5">
      {/* Big preview + picker */}
      <div className=" bg-card rounded-xl border  border-border p-5">
        <div className="flex flex-col sm:flex-row items-stretch gap-5">
          {/* Color swatch */}
          <div
            className="w-full sm:w-36 h-36 rounded-2xl shadow-lg border-4 dark:border-dark-bg border-white transition-colors duration-200 flex items-end p-3 shrink-0"
            style={{ backgroundColor: hex.length === 7 ? hex : '#6366F1' }}
          >
            <span className="text-[11px] font-bold font-mono rounded-lg px-2 py-1 bg-black/20 backdrop-blur-sm" style={{ color: previewText }}>
              {hex.toUpperCase()}
            </span>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary shrink-0" />
              <p className="section-label">Pick a Color</p>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={hex.length === 7 ? hex : '#6366F1'}
                onChange={(e) => setHex(e.target.value.toUpperCase())}
                className="w-12 h-10 rounded-lg  bg-muted border  border-border cursor-pointer p-0.5 transition-colors"
                title="Pick color"
              />
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value.toUpperCase())}
                placeholder="#000000"
                className="input-base font-mono uppercase"
              />
            </div>

            {/* Shade strip */}
            <div>
              <p className="text-[10px]  text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Shade Palette</p>
              <div className="flex gap-1.5">
                {shades.map((shade, i) => (
                  <button
                    key={i}
                    title={shade}
                    onClick={() => {
                      // Convert hsl back to hex approx
                      const el = document.createElement('div');
                      el.style.color = shade;
                      document.body.appendChild(el);
                      const computed = getComputedStyle(el).color;
                      document.body.removeChild(el);
                      const m = computed.match(/\d+/g);
                      if (m && m.length >= 3) {
                        const toHex = (n: number) => n.toString(16).padStart(2, '0');
                        setHex(`#${toHex(+m[0])}${toHex(+m[1])}${toHex(+m[2])}`.toUpperCase());
                      }
                    }}
                    className="flex-1 h-7 rounded-md border-2 dark:border-dark-bg border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: shade }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {formats.map(f => (
          <div key={f.label} className=" bg-card rounded-xl border  border-border p-4 space-y-2 hover:border-border transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold  text-muted-foreground uppercase tracking-wider">{f.label}</span>
              <CopyButton text={f.value} />
            </div>
            <div className={` bg-muted border  border-border rounded-lg px-3 py-2.5 text-[13px] font-mono font-bold select-all ${f.color}`}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
