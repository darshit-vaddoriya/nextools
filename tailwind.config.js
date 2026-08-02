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
        // True Obsidian Dark Mode Palette (No blue tint)
        dark: {
          bg: '#0a0a0f',
          surface: '#0d0d14',
          card: '#111116',
          hover: '#1a1a22',
          border: '#1f1f28',
          'border-light': '#2a2a35',
          text: '#f4f4f5',
          muted: '#a1a1aa',
        },
        // Clean Crisp Light Mode Palette
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          card: '#ffffff',
          hover: '#f1f5f9',
          border: '#e2e8f0',
          'border-light': '#cbd5e1',
          text: '#0f172a',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          emerald: '#10b981',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
