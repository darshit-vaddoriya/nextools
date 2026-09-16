import { marked } from 'marked';

export interface Heading {
  id: string;
  text: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** The callout kinds an article body can use, keyed by their `[!KIND]` marker. */
const CALLOUTS: Record<string, { cls: string; label: string }> = {
  NOTE:    { cls: 'callout-note',    label: 'Worth knowing' },
  TIP:     { cls: 'callout-tip',     label: 'Tip' },
  WARNING: { cls: 'callout-warning', label: 'Watch out' },
};

/**
 * Turns GitHub-style alert blockquotes into styled callouts.
 *
 *     > [!WARNING]
 *     > A black rectangle is not redaction.
 *
 * marked has no notion of these, so it emits an ordinary blockquote whose first
 * paragraph begins with the literal marker. Rewriting the tags afterwards keeps
 * the authoring syntax portable: the same body still reads as a sensible quote
 * in any other Markdown viewer, which a custom fence would not.
 */
function renderCallouts(html: string): string {
  return html.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|WARNING)\]\s*(?:<br\s*\/?>)?\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g,
    (_match, kind: string, inner: string) => {
      const { cls, label } = CALLOUTS[kind];
      return `<aside class="callout ${cls}"><p class="callout-label">${label}</p><p>${inner}</p></aside>`;
    },
  );
}

/**
 * Renders a blog post body to HTML.
 *
 * The input is authored by us in this repo, never by a visitor, so the output is
 * safe to inject directly. `<h2>` tags get slug ids injected afterwards (rather
 * than through a custom renderer) so this keeps working across marked versions.
 */
export function renderMarkdown(md: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  for (const match of md.matchAll(/^##\s+(.+)$/gm)) {
    const text = match[1].trim();
    headings.push({ id: slugify(text), text });
  }

  let html = marked.parse(md, { async: false, gfm: true, breaks: false }) as string;

  let i = 0;
  html = html.replace(/<h2>/g, () => {
    const h = headings[i++];
    return h ? `<h2 id="${h.id}">` : '<h2>';
  });

  html = renderCallouts(html);

  // Each table gets a scroll container of its own, so a wide comparison table
  // swipes sideways on a phone instead of forcing the whole page to.
  html = html
    .replace(/<table>/g, '<div class="table-scroll"><table>')
    .replace(/<\/table>/g, '</table></div>');

  return { html, headings };
}
