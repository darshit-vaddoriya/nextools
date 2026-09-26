// Build-time only. Imported from .astro frontmatter, never from client code:
// everything here (tool SEO copy, blog bodies, the meta writers in utils/seo)
// runs once per page during `astro build` and ships to the browser as HTML.
import { parseHTML } from 'linkedom';
import baseHead from './head.html?raw';
import { TOOLS } from '../config/tools';
import { STATIC_PAGES } from '../config/pages';
import { BLOG_POSTS, BLOG_CATEGORIES, getPost, loadPostBody, postsForTool, postsForToolCategory } from '../config/blog';
import { TOOL_SEO_CONTENT } from '../config/seoContent';
import { TOOL_EXPLANATIONS } from '../config/toolExplanations';
import { PLANNED_FEATURES } from '../config/toolFeatures';
import { getCategoryContent } from '../config/categoryContent';
import {
  parseRoute, updateHomeMeta, updateAppPageMeta, updateToolMeta, updateCategoryMeta, updatePageMeta,
  updateBlogIndexMeta, updateBlogPostMeta, updateBlogTopicMeta, updateAllToolsMeta, updateNotFoundMeta,
} from '../utils/seo';
import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { Writable } from 'node:stream';
import { ToolBody, type AppRoute, type PageData } from '../App';
import { ToolViewSkeleton } from '../components/Skeleton';
import { ToastProvider } from '../components/Toast';

// Tool UIs are prerendered too (see renderTool in App.tsx). Some read saved
// settings while rendering; at build time there is nothing saved, so they get
// an empty storage and render their defaults, as on a first visit.
function emptyStorage(): Storage {
  return {
    length: 0,
    clear() {}, key: () => null, getItem: () => null, setItem() {}, removeItem() {},
  };
}
const g0 = globalThis as unknown as Record<string, unknown>;
if (!('localStorage' in g0)) g0.localStorage = emptyStorage();
if (!('sessionStorage' in g0)) g0.sessionStorage = emptyStorage();
// pdf.js constructs a DOMMatrix when its module loads. Nothing is drawn at
// build time, so an identity matrix is enough to let the PDF tools prerender.
if (!('DOMMatrix' in g0)) {
  g0.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

/**
 * Every URL the Vite SPA served as a real page, unchanged: the sitemap's URLs,
 * plus the routes that are linked but deliberately not submitted
 * (/tool/image-editor carries noindex) and the app's own screens.
 * Anything else is the 404 page.
 */
export function allRoutes(): string[] {
  const routes = ['/', '/all-tools', '/my-files', '/settings', '/blog'];
  for (const p of STATIC_PAGES) routes.push(p.path);
  for (const cat of BLOG_CATEGORIES) routes.push(`/blog/topic/${cat}`);
  for (const post of BLOG_POSTS) routes.push(`/blog/${post.slug}`);
  for (const cat of new Set(TOOLS.map(t => t.category))) routes.push(`/category/${cat}`);
  for (const tool of TOOLS) routes.push(`/tool/${tool.id}`);
  return [...new Set(routes)];
}

export function routeFor(path: string): AppRoute {
  return parseRoute(path);
}

/**
 * A tool's interface as static HTML, rendered on its own so a tool that cannot
 * run outside a browser costs that one page its markup (it gets the loading
 * skeleton, as the browser shows before the tool loads) instead of failing
 * the build.
 */
export async function toolHtmlFor(toolId: string, plannedFeatures?: string[]): Promise<string> {
  const html = await new Promise<string | null>(resolve => {
    let out = '';
    let failed = false;
    const sink = new Writable({
      write(chunk, _enc, done) { out += chunk.toString(); done(); },
      final(done) { resolve(failed ? null : out); done(); },
    });
    try {
      const { pipe } = renderToPipeableStream(
        // Same providers the tool gets inside the app (see src/Root.tsx).
        React.createElement(ToastProvider, null, React.createElement(ToolBody, { toolId, plannedFeatures })),
        {
          onAllReady() { pipe(sink); },
          onShellError() { resolve(null); },
          onError(e) { failed = true; if (process.env.DEBUG_TOOL_SSR) console.warn(toolId, e); },
        },
      );
    } catch {
      resolve(null);
    }
  });
  if (html) return html;
  console.warn(`  (tool ${toolId}: interface not prerendered, skeleton used)`);
  return renderToString(React.createElement(ToolViewSkeleton));
}

export async function pageDataFor(route: AppRoute): Promise<PageData> {
  if (route.view === 'tool' && route.toolId) {
    return {
      toolSeo: TOOL_SEO_CONTENT[route.toolId],
      toolExplanation: TOOL_EXPLANATIONS[route.toolId],
      toolGuides: postsForTool(route.toolId),
      plannedFeatures: PLANNED_FEATURES[route.toolId],
    };
  }
  if (route.view === 'category' && route.category) {
    const cat = route.category;
    return {
      categoryContent: getCategoryContent(cat),
      categoryGuides: postsForToolCategory(TOOLS.filter(t => t.category === cat).map(t => t.id), 4),
    };
  }
  if (route.view === 'blog' && route.blogSlug) {
    const post = getPost(route.blogSlug);
    if (post) return { post, postBody: await loadPostBody(post) };
  }
  return {};
}

const escAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escText = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const VOID = new Set(['meta', 'link', 'base']);

/**
 * linkedom's innerHTML leaves `&` unescaped in attribute values and <title>,
 * so a description containing a literal "&amp;" would change meaning. This
 * writes the (flat) head the way a browser serialises it.
 */
function serializeHead(head: ParentNode): string {
  let out = '';
  for (const node of Array.from(head.childNodes)) {
    if (node.nodeType === 3) out += escText(node.textContent ?? '');
    else if (node.nodeType === 8) out += `<!--${node.textContent ?? ''}-->`;
    else if (node.nodeType === 1) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const attrs = Array.from(el.attributes).map(a => ` ${a.name}="${escAttr(a.value)}"`).join('');
      if (VOID.has(tag)) out += `<${tag}${attrs}>`;
      else if (tag === 'script' || tag === 'style') out += `<${tag}${attrs}>${el.textContent ?? ''}</${tag}>`;
      else out += `<${tag}${attrs}>${escText(el.textContent ?? '')}</${tag}>`;
    }
  }
  return out;
}

/**
 * The page's <head>, produced by the very functions the SPA ran in the browser
 * (utils/seo.ts) against index.html's head. Running them on a DOM built from
 * the same template means title, meta, canonical, robots and JSON-LD come out
 * exactly as Google has been indexing them.
 */
export function headFor(route: AppRoute): string {
  const { document } = parseHTML(`<!DOCTYPE html><html lang="en"><head>${baseHead}</head><body></body></html>`);
  const g = globalThis as unknown as { document?: unknown };
  const previous = g.document;
  g.document = document;
  try {
    if (route.view === 'notfound') updateNotFoundMeta();
    else if (route.view === 'files' || route.view === 'settings') updateAppPageMeta(route.view);
    else if (route.view === 'page' && route.pageId) updatePageMeta(route.pageId);
    else if (route.view === 'blog') {
      if (route.blogSlug) updateBlogPostMeta(route.blogSlug);
      else if (route.blogTopic) updateBlogTopicMeta(route.blogTopic);
      else updateBlogIndexMeta();
    }
    else if (route.view === 'all') updateAllToolsMeta();
    else if (route.view === 'tool' && route.toolId) updateToolMeta(route.toolId);
    else if (route.view === 'category' && route.category) updateCategoryMeta(route.category);
    else updateHomeMeta();
    return serializeHead(document.head as unknown as ParentNode);
  } finally {
    g.document = previous;
  }
}
