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
      fontFamily: {
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Outfit Variable', 'Outfit', 'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 12px -2px rgb(15 23 42 / 0.05)',
        pop: '0 12px 28px -8px rgb(15 23 42 / 0.12), 0 2px 8px -2px rgb(15 23 42 / 0.06)',
        float: '0 24px 48px -12px rgb(15 23 42 / 0.18), 0 4px 12px -2px rgb(15 23 42 / 0.08)',
      },
      borderRadius: {
        card: '1rem',
        section: '1.25rem',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}