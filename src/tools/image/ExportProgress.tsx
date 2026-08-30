import React, { useCallback, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

type Report = (pct: number, label?: string) => void;

interface State {
  active: boolean;
  progress: number;
  label: string;
}

export function useExportProgress() {
  const [state, setState] = useState<State>({ active: false, progress: 0, label: '' });
  const labelRef = useRef('Preparing…');

  const run = useCallback(async (work: (report: Report) => Promise<void>) => {
    setState({ active: true, progress: 4, label: 'Preparing…' });
    labelRef.current = 'Preparing…';
    let last = 4;
    try {
      await work((pct, label) => {
        last = Math.max(last, Math.min(100, pct));
        if (label) labelRef.current = label;
        setState({ active: true, progress: last, label: labelRef.current });
      });
      setState({ active: true, progress: 100, label: labelRef.current });
      await new Promise((r) => setTimeout(r, 300));
    } finally {
      setState({ active: false, progress: 0, label: '' });
    }
  }, []);

  const overlay = (
    <ExportOverlay active={state.active} progress={state.progress} label={state.label} />
  );

  return { run, overlay };
}

export const ExportOverlay: React.FC<State> = ({ active, progress, label }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="status" aria-live="polite">
      <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-6 text-center shadow-float">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
          {progress >= 100
            ? <Download className="w-5 h-5 text-success" />
            : <Loader2 className="w-5 h-5 text-primary animate-spin" />}
        </div>
        <p className="text-xs font-semibold text-foreground mb-3">{label}</p>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-[11px] font-mono text-muted-foreground">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};
