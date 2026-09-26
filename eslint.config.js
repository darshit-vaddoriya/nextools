import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.astro', 'supabase/functions'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Build-time Node script. `document` also appears inside a Puppeteer
    // page.waitForFunction() callback, which actually runs in-browser.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', document: 'readonly', URL: 'readonly' },
    },
  },
  {
    // Service worker: runs in the worker scope, not the page.
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly', caches: 'readonly', fetch: 'readonly', URL: 'readonly', Response: 'readonly',
        Request: 'readonly', clients: 'readonly', console: 'readonly', Promise: 'readonly', setTimeout: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
