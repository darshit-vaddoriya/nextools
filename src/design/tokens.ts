/**
 * DESIGN TOKENS
 *
 * `src/index.css` is the single source of truth for *color*, it defines
 * the CSS custom properties for both themes, and Tailwind consumes them
 * via `rgb(var(--x) / <alpha-value>)`.
 *
 * This file does two jobs:
 *   1. Documents the non-color scales (spacing, radius, type, motion) that
 *      have no better home, so extending the system stays consistent.
 *   2. Exposes a runtime reader for code that needs a real color value in
 *      JS, canvas rendering, generated thumbnails, chart libraries.
 *
 * Color hexes are deliberately NOT repeated here. Duplicating them would
 * create a second source of truth that silently drifts from the CSS.
 */

/* ── Color access ───────────────────────────────────────────────────
   Read the live, theme-resolved value of a token. Because it reads from
   the cascade, it automatically returns the correct light/dark value.
------------------------------------------------------------------- */

/** Semantic color tokens available as CSS custom properties. */
export type ColorToken =
  | 'background' | 'foreground'
  | 'card' | 'card-foreground'
  | 'muted' | 'muted-foreground'
  | 'border' | 'input' | 'ring'
  | 'primary' | 'primary-foreground' | 'primary-container' | 'on-primary-container'
  | 'secondary' | 'secondary-foreground' | 'secondary-container'
  | 'success' | 'warning' | 'danger'
  | 'surface' | 'surface-container' | 'surface-container-high'
  | 'outline' | 'outline-variant';

/**
 * Resolve a token to a usable CSS color string, e.g. `rgb(35 71 255)`.
 * Pass `alpha` for a translucent variant.
 *
 * Returns an empty string during SSR/prerender, where there is no
 * computed style to read, callers should treat that as "use default".
 */
export function getColor(token: ColorToken, alpha = 1): string {
  if (typeof window === 'undefined') return '';
  const triplet = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${token}`)
    .trim();
  if (!triplet) return '';
  return alpha === 1 ? `rgb(${triplet})` : `rgb(${triplet} / ${alpha})`;
}

/* ── Spacing, 8px scale ────────────────────────────────────────────
   Tailwind's 4px step is the substrate; these are the rungs we actually
   use for layout. Prefer these over arbitrary values.
------------------------------------------------------------------- */
export const space = {
  1: '4px',   // icon↔label, hairline gaps
  2: '8px',   // base unit
  3: '12px',  // control padding
  4: '16px',  // card padding (compact)
  6: '24px',  // card padding (default)
  8: '32px',  // block spacing
  12: '48px', // section spacing (mobile)
  16: '64px', // section spacing (tablet)
  24: '96px', // section spacing (desktop)
} as const;

/* ── Radius, varies by hierarchy, deliberately not one value ───────
   Small controls read as crisp; large surfaces read as soft.
   Mirrors --radius-* in index.css.
------------------------------------------------------------------- */
export const radius = {
  sm: 'var(--radius-sm)',   //  8px, chips, badges, inputs
  md: 'var(--radius-md)',   // 12px, buttons, tool cards
  lg: 'var(--radius-lg)',   // 16px, panels, dialogs
  xl: 'var(--radius-xl)',   // 24px, the hero drop zone
  full: '9999px',
} as const;

/* ── Type, one family, hierarchy from weight and size ──────────────
   Plus Jakarta Sans is self-hosted via @fontsource, so the app makes no
   third-party font request, required to honour the privacy claim.
   Mono is for code and numeric readouts only, never for labels.
------------------------------------------------------------------- */

/** Modular scale, base 16px, ratio 1.25 (major third). */
export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '25px',
  '3xl': '31px',
  '4xl': '39px',
  '5xl': '49px',
  '6xl': '61px',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800, // display headlines only
} as const;

/* ── Elevation ──────────────────────────────────────────────────────
   Resting cards use a border, not a shadow. Shadow is reserved for
   surfaces that genuinely float above the page.
   Consumed in Tailwind as shadow-raised / shadow-floating / shadow-overlay.
------------------------------------------------------------------- */
export const shadow = {
  raised: '0 1px 2px rgb(16 20 34 / 0.04), 0 2px 8px -2px rgb(16 20 34 / 0.06)',
  floating: '0 12px 28px -8px rgb(16 20 34 / 0.14), 0 2px 8px -2px rgb(16 20 34 / 0.06)',
  overlay: '0 24px 48px -12px rgb(16 20 34 / 0.20), 0 4px 12px -2px rgb(16 20 34 / 0.08)',
} as const;

/* ── Motion ─────────────────────────────────────────────────────────
   Motion answers a user action. All gated on prefers-reduced-motion.
   Mirrors --motion-* / --ease* in index.css.
------------------------------------------------------------------- */
export const motion = {
  fast: 'var(--motion-fast)',  // 150ms, hover, press
  base: 'var(--motion-base)',  // 220ms, disclosure, step transitions
  slow: 'var(--motion-slow)',  // 380ms, flow step changes
  ease: 'var(--ease)',
  easeOut: 'var(--ease-out)',
} as const;

/* ── Layout ─────────────────────────────────────────────────────────── */
export const layout = {
  maxWidth: '1200px',
  proseWidth: '68ch', // body copy stays under ~80 characters
} as const;
