import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, options, onChange, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 dark:bg-white/[0.07] dark:border-white/[0.14] dark:text-zinc-100 dark:hover:bg-white/[0.1] bg-white border-slate-300 text-slate-900 hover:border-slate-400 transition-colors duration-150"
      >
        <span className="truncate text-left">{current?.label ?? value}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 dark:text-zinc-400 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-40 mt-1.5 w-full min-w-[8rem] rounded-lg border dark:bg-dark-card dark:border-white/[0.14] bg-white border-slate-200 shadow-xl py-1 max-h-64 overflow-auto"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                o.value === value
                  ? 'dark:bg-indigo-500/15 dark:text-indigo-300 text-indigo-700 bg-indigo-50'
                  : 'dark:text-zinc-200 dark:hover:bg-white/[0.07] text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
