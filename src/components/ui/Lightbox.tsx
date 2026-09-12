import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';

export interface LightboxItem {
  /** Immediately-available preview (a cheap thumbnail data URL). */
  src: string;
  /** Caption shown under the image, e.g. "Page 3 of 12". */
  label: string;
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index to open at, or `null` when closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  /**
   * Optional high-resolution render for the open item. The thumbnail shows
   * instantly and is replaced when this resolves, so opening never blocks.
   */
  renderFull?: (index: number) => Promise<string>;
}

/**
 * Full-screen preview with keyboard navigation.
 *
 * Arrow keys move between items, Escape closes, and focus is trapped on the
 * dialog while open so Tab can't wander behind the overlay.
 */
export const Lightbox: React.FC<LightboxProps> = ({
  items, index, onClose, onIndexChange, renderFull,
}) => {
  const isOpen = index !== null && index >= 0 && index < items.length;
  const [fullSrc, setFullSrc] = useState<string>('');
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const go = useCallback((delta: number) => {
    if (index === null) return;
    const next = (index + delta + items.length) % items.length;
    onIndexChange(next);
  }, [index, items.length, onIndexChange]);

  /* Upgrade the thumbnail to a full render for the current item. */
  useEffect(() => {
    setFullSrc('');
    if (!isOpen || !renderFull || index === null) return;

    let cancelled = false;
    setIsLoadingFull(true);
    renderFull(index)
      .then((src) => { if (!cancelled) setFullSrc(src); })
      .catch(() => { /* keep showing the thumbnail */ })
      .finally(() => { if (!cancelled) setIsLoadingFull(false); });

    return () => { cancelled = true; };
  }, [isOpen, index, renderFull]);

  /* Keyboard handling, focus capture, and background scroll lock. */
  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Tab') {
        // Only the dialog's own controls are reachable while it is open.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, go, onClose]);

  if (!isOpen || index === null) return null;
  const item = items[index];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${item.label}`}
      tabIndex={-1}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/85 p-4 backdrop-blur-sm
                 focus:outline-none"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 grid place-items-center w-10 h-10 rounded-full bg-white/10 text-white
                   hover:bg-white/20 transition-colors duration-[var(--motion-fast)]
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      {items.length > 1 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous page"
          className="absolute left-2 sm:left-4 grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white
                     hover:bg-white/20 transition-colors duration-[var(--motion-fast)]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      <div className="relative flex max-h-[82vh] max-w-[92vw] items-center justify-center">
        <img
          src={fullSrc || item.src}
          alt={item.label}
          className="max-h-[82vh] max-w-[92vw] rounded-[var(--radius-sm)] bg-white object-contain shadow-overlay"
        />
        {isLoadingFull && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60
                           px-2.5 py-1 text-xs font-semibold text-white">
            <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Sharpening
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-white/90" aria-live="polite">
        {item.label}
      </p>

      {items.length > 1 && (
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next page"
          className="absolute right-2 sm:right-4 grid place-items-center w-11 h-11 rounded-full bg-white/10 text-white
                     hover:bg-white/20 transition-colors duration-[var(--motion-fast)]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
