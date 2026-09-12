import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Leading icon. Decorative, the label carries the meaning. */
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT: Record<Variant, string> = {
  // The accent appears here and on active states, nowhere else.
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-raised',
  secondary:
    'bg-card text-foreground border border-border hover:bg-surface-container active:bg-surface-container-high',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-surface-container hover:text-foreground active:bg-surface-container-high',
  danger:
    'bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 gap-1.5 text-sm rounded-[var(--radius-sm)]',
  md: 'h-11 px-4 gap-2 text-sm rounded-[var(--radius-md)]',
  lg: 'h-13 px-6 gap-2.5 text-base rounded-[var(--radius-md)]',
};

/** Icon sizing tracks the control size so optical weight stays constant. */
const ICON_SIZE: Record<Size, string> = { sm: 'w-4 h-4', md: 'w-4 h-4', lg: 'w-5 h-5' };

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const glyph = ICON_SIZE[size];

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center font-semibold select-none',
        'transition-[background-color,box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--ease)]',
        'active:scale-[0.98] motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading && <Loader2 className={`${glyph} animate-spin`} aria-hidden="true" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className={glyph} aria-hidden="true" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={glyph} aria-hidden="true" />}
    </button>
  );
};
