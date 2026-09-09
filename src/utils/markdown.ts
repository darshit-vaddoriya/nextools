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

  return { html, headings };
}
