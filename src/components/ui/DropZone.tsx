import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, ShieldCheck } from 'lucide-react';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  /** `accept` attribute, e.g. "application/pdf,.pdf". Omit to accept anything. */
  accept?: string;
  multiple?: boolean;
  /** `hero` is the oversized homepage target; `panel` sits inside a tool. */
  size?: 'hero' | 'panel';
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Drag-and-drop plus click-to-browse target.
 *
 * Rendered as a <button> wrapping a visually-hidden <input type="file">, so
 * it is reachable by Tab and activates on Enter/Space with no extra handlers.
 */
export const DropZone: React.FC<DropZoneProps> = ({
  onFiles,
  accept,
  multiple = false,
  size = 'panel',
  label = 'Choose a file',
  hint = 'or drop it here',
  disabled = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Nested children fire dragleave; counting depth avoids flicker.
  const dragDepth = useRef(0);

  const emit = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    onFiles(Array.from(list));
  }, [onFiles]);

  const isHero = size === 'hero';

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          if (disabled) return;
          dragDepth.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragDepth.current = 0;
          setIsDragging(false);
          if (disabled) return;
          emit(e.dataTransfer.files);
        }}
        className={[
          'group relative w-full flex flex-col items-center justify-center text-center',
          'border-2 border-dashed transition-all duration-[var(--motion-base)] ease-[var(--ease)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none',
          isHero
            ? 'rounded-[var(--radius-xl)] px-6 py-12 sm:py-16 gap-4'
            : 'rounded-[var(--radius-lg)] px-5 py-10 gap-3',
          isDragging
            ? 'border-primary bg-primary/[0.06] scale-[1.01] motion-reduce:scale-100'
            : 'border-border bg-card hover:border-primary/50 hover:bg-surface-container-low',
        ].join(' ')}
      >
        <span
          className={[
            'grid place-items-center rounded-full transition-colors duration-[var(--motion-base)]',
            isHero ? 'w-16 h-16' : 'w-12 h-12',
            isDragging ? 'bg-primary text-primary-foreground' : 'bg-primary-container text-on-primary-container',
          ].join(' ')}
        >
          <UploadCloud className={isHero ? 'w-8 h-8' : 'w-6 h-6'} aria-hidden="true" />
        </span>

        <span className="flex flex-col gap-1">
          <span className={isHero ? 'text-xl sm:text-2xl font-bold text-foreground' : 'text-base font-bold text-foreground'}>
            {isDragging ? 'Drop to add' : label}
          </span>
          <span className="text-sm text-muted-foreground">{hint}</span>
        </span>

        {/* The product's actual differentiator, stated where the decision happens. */}
        {isHero && (
          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Nothing uploads. Files stay on your device.
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        aria-label={label}
        onChange={(e) => {
          emit(e.target.files);
          // Reset so picking the same file twice still fires onChange.
          e.target.value = '';
        }}
      />
    </div>
  );
};
