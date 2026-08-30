import React, {
  createContext, useCallback, useContext, useMemo, useRef, useState,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ElementType; iconColor: string }> = {
  success: { icon: CheckCircle2, iconColor: 'text-success' },
  error:   { icon: XCircle,      iconColor: 'text-danger' },
  warning: { icon: AlertTriangle, iconColor: 'text-warning' },
  info:    { icon: Info,         iconColor: 'text-primary' },
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
};

let nextId = 1;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const toast = useCallback((opts: ToastOptions) => {
    const id = nextId++;
    const variant = opts.variant ?? 'info';
    const duration = opts.duration ?? 4000;
    setToasts(prev => [...prev.slice(-3), { id, title: opts.title, description: opts.description, variant }]);
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-[80] flex flex-col items-stretch sm:items-end gap-2 pointer-events-none"
      >
        {toasts.map(t => {
          const conf = VARIANT_STYLES[t.variant];
          const Icon = conf.icon;
          return (
            <div
              key={t.id}
              role="status"
              className="toast-in pointer-events-auto flex items-start gap-3 w-full sm:w-[360px] rounded-xl border bg-card text-card-foreground shadow-lg p-3.5 pr-2.5"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${conf.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-tight">{t.title}</p>
                {t.description && (
                  <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
