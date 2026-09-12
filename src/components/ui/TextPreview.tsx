import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, Search, WrapText, X } from 'lucide-react';
import { Button } from './Button';
import { countWords } from '../../lib/richText';
import { formatBytes } from '../../lib/formats';

interface TextPreviewProps {
  text: string;
  /** Filename used when the text is downloaded. */
  filename: string;
  title?: string;
  className?: string;
}

/** Escape user text before injecting highlight markup. */
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));

/**
 * Read the extracted text in place instead of downloading a file to find out
 * whether the extraction worked.
 *
 * Supports find-within-text, copy, and download. Long documents stay usable
 * because the surface scrolls rather than growing the page.
 */
export const TextPreview: React.FC<TextPreviewProps> = ({
  text, filename, title = 'Extracted text', className = '',
}) => {
  const [query, setQuery] = useState('');
  const [wrap, setWrap] = useState(true);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => ({
    words: countWords(text),
    characters: text.length,
    lines: text ? text.split('\n').length : 0,
  }), [text]);

  /** Highlight every match of the query. */
  const html = useMemo(() => {
    const escaped = escapeHtml(text);
    const needle = query.trim();
    if (!needle) return escaped;
    const pattern = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return escaped.replace(pattern, (m) => `<mark class="bg-warning/30 text-foreground rounded-sm">${m}</mark>`);
  }, [text, query]);

  const matchCount = useMemo(() => {
    const needle = query.trim();
    if (!needle) return 0;
    const pattern = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (text.match(pattern) ?? []).length;
  }, [text, query]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked, the download still works */ }
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-[var(--radius-lg)] border border-border bg-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="font-mono">{stats.words}</span> words
            {' · '}<span className="font-mono">{stats.lines}</span> lines
            {' · '}<span className="font-mono">{formatBytes(new Blob([text]).size)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWrap((w) => !w)}
            aria-pressed={wrap}
            aria-label="Wrap long lines"
            title="Wrap long lines"
            className={[
              'grid place-items-center w-9 h-9 rounded-[var(--radius-sm)] transition-colors',
              'duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              wrap ? 'bg-primary-container text-on-primary-container' : 'text-muted-foreground hover:bg-surface-container',
            ].join(' ')}
          >
            <WrapText className="w-4 h-4" aria-hidden="true" />
          </button>
          <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button size="sm" icon={Download} onClick={download}>Download</Button>
        </div>
      </div>

      {/* ── Find within the text ── */}
      <div className="relative border-b border-border px-5 py-3">
        <Search
          className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find in text"
          aria-label="Find in text"
          className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface-container-low
                     pl-9 pr-24 text-sm text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/25
                     [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </span>
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear find"
              className="grid place-items-center w-6 h-6 rounded text-muted-foreground
                         hover:bg-surface-container hover:text-foreground
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </span>
        )}
      </div>

      <div
        className={[
          'max-h-[26rem] overflow-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-foreground',
          wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
        ].join(' ')}
        tabIndex={0}
        role="region"
        aria-label={title}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
