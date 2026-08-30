import React, { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Sparkles } from 'lucide-react';

export const GlassmorphismGenerator: React.FC = () => {
  const [blur,          setBlur]          = useState<number>(12);
  const [opacity,       setOpacity]       = useState<number>(20);
  const [borderOpacity, setBorderOpacity] = useState<number>(30);
  const [borderRadius,  setBorderRadius]  = useState<number>(16);

  const cssCode = `.glass-card {
  background: rgba(255, 255, 255, ${(opacity / 100).toFixed(2)});
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border-radius: ${borderRadius}px;
  border: 1px solid rgba(255, 255, 255, ${(borderOpacity / 100).toFixed(2)});
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}`;

  const sliders = [
    { label: 'Backdrop Blur',   unit: 'px',  min: 0, max: 40, value: blur,          set: setBlur },
    { label: 'Glass Opacity',   unit: '%',   min: 0, max: 80, value: opacity,       set: setOpacity },
    { label: 'Border Opacity',  unit: '%',   min: 0, max: 80, value: borderOpacity, set: setBorderOpacity },
    { label: 'Border Radius',   unit: 'px',  min: 0, max: 50, value: borderRadius,  set: setBorderRadius },
  ];

  return (
    <div className="space-y-5">
      {/* Canvas Preview */}
      <div className="relative overflow-hidden rounded-2xl border border-border min-h-[280px] flex items-center justify-center p-10"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 40%, #312e81 100%)'
        }}
      >
        {/* Ambient orbs */}
        <div className="absolute top-6 left-10 w-28 h-28 bg-indigo-500/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-6 right-10 w-36 h-36 bg-purple-500/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-pink-500/30 rounded-full blur-2xl pointer-events-none" />

        {/* Glass card */}
        <div
          className="relative z-10 w-full max-w-sm p-6 text-white space-y-3 transition-all duration-200"
          style={{
            background: `rgba(255, 255, 255, ${(opacity / 100).toFixed(2)})`,
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            borderRadius: `${borderRadius}px`,
            border: `1px solid rgba(255, 255, 255, ${(borderOpacity / 100).toFixed(2)})`,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <h4 className="font-bold text-[15px]">Glassmorphism</h4>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Real-time frosted glass preview using CSS <code className="text-white/90 font-mono">backdrop-filter</code>.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="section-label mb-4">Adjust Parameters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sliders.map((s) => (
            <div key={s.label} className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">{s.label}</span>
                <span className="font-mono font-bold text-primary">{s.value}{s.unit}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={s.value}
                onChange={(e) => s.set(parseInt(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Generated CSS */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="section-label">Generated CSS</p>
          <CopyButton text={cssCode} label="Copy CSS" />
        </div>
        <pre className="bg-muted border border-border rounded-xl p-4 text-[12px] font-mono text-success overflow-x-auto leading-relaxed">
          {cssCode}
        </pre>
      </div>
    </div>
  );
};
