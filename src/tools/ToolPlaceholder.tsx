import React from 'react';
import { Construction, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface ToolPlaceholderProps {
  toolName: string;
  toolDescription: string;
  category: string;
  features?: string[];
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export const ToolPlaceholder: React.FC<ToolPlaceholderProps> = ({
  toolName,
  toolDescription,
  category,
  features = [],
  gradientFrom = 'from-indigo-500',
  gradientTo = 'to-purple-600',
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero banner */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 sm:p-8 text-white`}>
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-20px] w-36 h-36 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {category} Tool
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">{toolName}</h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-xl">{toolDescription}</p>
        </div>
      </div>

      {/* Under construction card */}
      <div className="dark:bg-dark-card bg-white rounded-2xl border dark:border-dark-border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 flex items-center justify-center mx-auto mb-5">
          <Construction className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold dark:text-white text-slate-900 mb-2">Coming Soon</h3>
        <p className="text-sm dark:text-zinc-500 text-slate-500 max-w-md mx-auto leading-relaxed">
          <strong className="dark:text-zinc-300 text-slate-700">{toolName}</strong> is currently under development.
          Everything will be processed on your device, with no uploads and no servers.
        </p>
      </div>

      {/* Planned features */}
      {features.length > 0 && (
        <div className="dark:bg-dark-card bg-white rounded-2xl border dark:border-dark-border border-slate-200 p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest dark:text-zinc-500 text-slate-400 mb-4">
            Planned Features
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5 text-sm dark:text-zinc-400 text-slate-600">
                <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl dark:bg-emerald-500/5 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200">
        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs dark:text-emerald-400 text-emerald-700 leading-relaxed">
          <strong>Private:</strong> Everything is processed on your device.
          Your files are never uploaded.
        </p>
      </div>
    </div>
  );
};
