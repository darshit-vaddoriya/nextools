import React, { useMemo, useState } from 'react';
import { Code2 } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { EMBED_BY_ID, embedSnippet, embedUrl, type EmbedTheme } from '../config/embeds';

const THEMES: { id: EmbedTheme; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Match visitor' },
];

/**
 * "Embed this tool" on the tool page: the iframe snippet for another site,
 * with a theme and height choice and a live preview. Collapsed by default;
 * the preview iframe loads only once the box is opened.
 */
export const EmbedThisTool: React.FC<{ toolId: string; toolName: string }> = ({ toolId, toolName }) => {
  const spec = EMBED_BY_ID[toolId];
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<EmbedTheme>('light');
  const [height, setHeight] = useState(spec?.height ?? 520);
  const snippet = useMemo(() => embedSnippet(toolId, theme, height), [toolId, theme, height]);
  if (!spec) return null;

  return (
    <details
      className="group rounded-2xl border bg-card border-border shadow-card"
      onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="hit-y flex cursor-pointer list-none items-center gap-3 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Code2 className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[15px] font-extrabold text-foreground">Embed this tool on your website</span>
          <span className="block text-[12.5px] text-muted-foreground">
            Free for blogs, schools and docs. Paste one snippet; it runs in your visitors' browsers.
          </span>
        </span>
        <span className="text-[12px] font-semibold text-primary group-open:hidden">Get code</span>
        <span className="hidden text-[12px] font-semibold text-muted-foreground group-open:inline">Close</span>
      </summary>

      <div className="space-y-4 border-t border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <fieldset className="space-y-1.5">
            <legend className="text-[12px] font-semibold text-foreground">Theme</legend>
            <div className="flex gap-1.5">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={theme === t.id}
                  className={`hit-y rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                    theme === t.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground/80 hover:border-input hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="space-y-1.5">
            <span className="block text-[12px] font-semibold text-foreground">Height (px)</span>
            <input
              type="number"
              min={300}
              max={1600}
              step={20}
              value={height}
              onChange={e => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) setHeight(Math.min(1600, Math.max(300, v)));
              }}
              className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-[13px] text-foreground"
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-foreground">HTML snippet</span>
            <CopyButton text={snippet} label="Copy code" />
          </div>
          <textarea
            readOnly
            value={snippet}
            rows={4}
            onFocus={e => e.currentTarget.select()}
            aria-label={`Embed code for ${toolName}`}
            className="w-full resize-none rounded-xl border border-border bg-muted/40 p-3 font-mono text-[12px] leading-relaxed text-foreground"
          />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Paste it into any page that accepts HTML (WordPress: a Custom HTML block). Please keep the credit
            line under the tool; it is how this free tool stays free.
          </p>
        </div>

        {open && (
          <div className="space-y-2">
            <span className="text-[12px] font-semibold text-foreground">Preview</span>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <iframe
                src={embedUrl(toolId, theme).replace(/^https:\/\/nexttool\.click/, '')}
                title={`${toolName} preview`}
                width="100%"
                height={height}
                loading="lazy"
                className="block w-full max-w-[720px] rounded-lg border-0 bg-background"
              />
            </div>
          </div>
        )}
      </div>
    </details>
  );
};
