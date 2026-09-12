/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic design tokens (RGB triplets, see src/index.css)
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          container: 'rgb(var(--primary-container) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
          container: 'rgb(var(--secondary-container) / <alpha-value>)',
        },
        tertiary: {
          DEFAULT: 'rgb(var(--tertiary) / <alpha-value>)',
          foreground: 'rgb(var(--on-tertiary) / <alpha-value>)',
          container: 'rgb(var(--tertiary-container) / <alpha-value>)',
        },
        'on-surface': 'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--on-surface-variant) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--on-primary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--on-secondary-container) / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--on-tertiary-container) / <alpha-value>)',
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          foreground: 'rgb(var(--warning-foreground) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          foreground: 'rgb(var(--danger-foreground) / <alpha-value>)',
        },
        ring: 'rgb(var(--ring) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          container: 'rgb(var(--surface-container) / <alpha-value>)',
          'container-low': 'rgb(var(--surface-container-low) / <alpha-value>)',
          'container-high': 'rgb(var(--surface-container-high) / <alpha-value>)',
          'container-highest': 'rgb(var(--surface-container-highest) / <alpha-value>)',
          variant: 'rgb(var(--surface-variant) / <alpha-value>)',
        },
        outline: {
          DEFAULT: 'rgb(var(--outline) / <alpha-value>)',
          variant: 'rgb(var(--outline-variant) / <alpha-value>)',
        },
        'success-green': 'rgb(var(--success-green) / <alpha-value>)',
        'warning-amber': 'rgb(var(--warning-amber) / <alpha-value>)',
      },
      // One family carries the whole product. Hierarchy comes from weight
      // and size, not from a second typeface. `heading` is kept as an alias
      // so existing markup keeps working. Mono is for code and numeric
      // readouts only — never for labels.
      fontFamily: {
        sans: ['Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      // Modular scale, base 16px, ratio 1.25 (major third).
      fontSize: {
        xs:    ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.01em' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.625rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5625rem',{ lineHeight: '2.125rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.9375rem',{ lineHeight: '2.5rem',   letterSpacing: '-0.02em' }],
        '4xl': ['2.4375rem',{ lineHeight: '2.875rem', letterSpacing: '-0.02em' }],
        '5xl': ['3.0625rem',{ lineHeight: '3.5rem',   letterSpacing: '-0.03em' }],
        '6xl': ['3.8125rem',{ lineHeight: '4.125rem', letterSpacing: '-0.03em' }],
      },
      spacing: {
        13: '3.25rem', // large control height
      },
      // Resting cards use a border. Shadow is reserved for surfaces that
      // genuinely float above the page.
      boxShadow: {
        raised:   '0 1px 2px rgb(16 20 34 / 0.04), 0 2px 8px -2px rgb(16 20 34 / 0.06)',
        floating: '0 12px 28px -8px rgb(16 20 34 / 0.14), 0 2px 8px -2px rgb(16 20 34 / 0.06)',
        overlay:  '0 24px 48px -12px rgb(16 20 34 / 0.20), 0 4px 12px -2px rgb(16 20 34 / 0.08)',
        // Legacy aliases — existing tools still reference these.
        card: '0 1px 2px rgb(16 20 34 / 0.04), 0 2px 8px -2px rgb(16 20 34 / 0.06)',
        pop: '0 12px 28px -8px rgb(16 20 34 / 0.14), 0 2px 8px -2px rgb(16 20 34 / 0.06)',
        float: '0 24px 48px -12px rgb(16 20 34 / 0.20), 0 4px 12px -2px rgb(16 20 34 / 0.08)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        card: 'var(--radius-lg)',
        section: 'var(--radius-xl)',
      },
      keyframes: {
        'progress-slide': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
        'step-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'progress-slide': 'progress-slide 1.4s var(--ease) infinite',
        'step-in': 'step-in var(--motion-base) var(--ease-out) both',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}