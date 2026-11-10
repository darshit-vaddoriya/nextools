/**
 * Tools other sites can embed with an <iframe>. Each gets a bare page at
 * /embed/<id> (no header, ads or analytics; noindex, canonical to the tool
 * page) and an "Embed this tool" box on its tool page with the snippet.
 *
 * Only small, self-contained tools belong here: ones that work in a ~500 px
 * box and need no files from the visitor. `height` is the iframe height the
 * snippet starts with.
 */
import { TOOLS } from './tools';

export const EMBED_SITE = 'https://nexttool.click';

export interface EmbedSpec {
  toolId: string;
  height: number;
}

export const EMBEDS: EmbedSpec[] = [
  // Heights measured at a 700 px wide frame (2026-11-10). Case Converter lists
  // every case at once (~1,380 px); it scrolls inside a shorter frame instead.
  { toolId: 'word-counter', height: 880 },
  { toolId: 'password-generator', height: 460 },
  { toolId: 'case-converter', height: 900 },
  { toolId: 'qr-generator', height: 760 },
  { toolId: 'age-calculator', height: 560 },
  { toolId: 'unit-converter', height: 520 },
];

export const EMBED_BY_ID: Record<string, EmbedSpec> = Object.fromEntries(EMBEDS.map(e => [e.toolId, e]));

export type EmbedTheme = 'light' | 'dark' | 'auto';

export const embedUrl = (toolId: string, theme: EmbedTheme = 'light'): string =>
  `${EMBED_SITE}/embed/${toolId}${theme === 'light' ? '' : `?theme=${theme}`}`;

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The HTML a site owner pastes. The credit link sits outside the iframe, on
 * their page, and is plain and visible with a branded anchor: a link inside
 * the iframe would belong to our own page, and hidden or keyword-stuffed
 * widget links are what search engines treat as link schemes.
 */
export function embedSnippet(toolId: string, theme: EmbedTheme = 'light', height?: number): string {
  const tool = TOOLS.find(t => t.id === toolId);
  const name = escHtml(tool?.name ?? toolId);
  const h = Math.round(height ?? EMBED_BY_ID[toolId]?.height ?? 520);
  return [
    `<iframe src="${embedUrl(toolId, theme)}" title="${name}" width="100%" height="${h}" style="border:0;max-width:720px;" loading="lazy"></iframe>`,
    `<p style="margin:6px 0 0;font:13px/1.4 system-ui,sans-serif;">${name} by <a href="${EMBED_SITE}/tool/${toolId}">NextTool</a></p>`,
  ].join('\n');
}

/** Builds fail fast if an id here stops matching a tool. */
export function validateEmbeds(): string[] {
  return EMBEDS.filter(e => !TOOLS.some(t => t.id === e.toolId)).map(e => `Embed "${e.toolId}" is not a tool id`);
}
