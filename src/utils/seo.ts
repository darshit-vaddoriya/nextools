import { TOOLS } from '../config/tools';
import { ToolCategory } from '../types';
import { TOOL_SEO_CONTENT } from '../config/seoContent';
import { StaticPageId, getStaticPage, getStaticPageByPath } from '../config/pages';
import {
  BLOG_POSTS, getPost, BLOG_CATEGORY_LABELS, BLOG_CATEGORY_META,
  BlogCategory, isBlogCategory, postsInCategory, readingMinutes,
} from '../config/blog';
import { HOME_FAQ } from '../config/faq';

const SITE = 'https://nexttool.click';
const DEFAULT_TITLE = 'NextTool - Free Online Tools';
const DEFAULT_DESC =
  'Free browser tools for PDF, image, developer and AI tasks. Files are processed on your own device, so nothing is uploaded.';
// Mirrors the static tag in index.html, so navigating home from a tool page
// restores it rather than leaving that tool's keywords behind.
const DEFAULT_KEYWORDS =
  'free online tools, pdf tools, image compressor, background remover, json formatter, '
  + 'password generator, base64 encoder, csv to json, browser tools, no upload';

const CATEGORY_NAMES: Record<ToolCategory, string> = {
  pdf: 'PDF Tools',
  word: 'Word & Office',
  excel: 'Excel & CSV',
  powerpoint: 'PowerPoint',
  image: 'Image Tools',
  video: 'Video Tools',
  audio: 'Audio Tools',
  dev: 'Developer Tools',
  ai: 'AI Browser Tools',
  security: 'Security Tools',
  text: 'Text Utilities',
  color: 'Color & CSS',
  utility: 'Calculators',
  web: 'Web Tools',
  archive: 'Archive Tools',
};

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Builds a page title that carries the modifiers people actually type.
 *
 * "Compress PDF" is the head term, but the searches are "compress pdf online"
 * and "compress pdf free", so the qualifiers earn their place. Titles are
 * truncated in results at roughly 60 characters, so the suffix is dropped
 * rather than the tool name when a long name would push it past that.
 */
const TITLE_LIMIT = 60;
function toolTitle(name: string): string {
  const full = `${name} Online - Free, No Upload | NextTool`;
  if (full.length <= TITLE_LIMIT) return full;
  const shorter = `${name} Online - Free | NextTool`;
  return shorter.length <= TITLE_LIMIT ? shorter : `${name} | NextTool`;
}

/** Meta descriptions are cut off around 155 characters, so cut at a word. */
function truncateDescription(text: string, limit = 155): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(' '))}...`;
}

/**
 * De-duplicated, comma-separated keyword list.
 *
 * Worth being clear about what this is for: Google has ignored the keywords
 * meta tag since 2009 and it is not a ranking signal there. It is kept short
 * and honest because a few smaller engines still read it, and because a
 * stuffed list is treated as a spam signal by the ones that do.
 */
function keywordList(words: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const word of words) {
    const key = word.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out.slice(0, 12).join(', ');
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

function setJsonLd(id: string, data: object) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function removeMeta(name: string, isProperty = false) {
  const el = document.querySelector(`meta[${isProperty ? 'property' : 'name'}="${name}"]`);
  if (el) el.remove();
}

/**
 * Undoes what updateBlogPostMeta() adds. Navigation inside the SPA only ever
 * adds tags, so without this a visitor who reads a post and then opens a tool
 * is on a page still claiming og:type=article with the post's publish date,
 * and that is what a share to Facebook or LinkedIn would pick up.
 */
function clearArticleMeta() {
  setMeta('og:type', 'website', true);
  removeMeta('article:published_time', true);
  removeMeta('article:modified_time', true);
  removeMeta('article:section', true);
  removeMeta('article:tag', true);
}

function clearPageSchema() {
  clearArticleMeta();
  const el = document.getElementById('breadcrumb-jsonld');
  if (el) el.remove();
  const faqEl = document.getElementById('faq-jsonld');
  if (faqEl) faqEl.remove();
}

export function updateHomeMeta() {
  clearPageSchema();
  document.title = DEFAULT_TITLE;
  setMeta('description', DEFAULT_DESC);
  setMeta('keywords', DEFAULT_KEYWORDS);
  setMeta('og:title', DEFAULT_TITLE, true);
  setMeta('og:description', DEFAULT_DESC, true);
  setMeta('og:url', `${SITE}/`, true);
  setMeta('twitter:title', DEFAULT_TITLE);
  setMeta('twitter:description', DEFAULT_DESC);
  setCanonical(`${SITE}/`);

  // WebSite + Organization are declared once in index.html for every route.
  // These two describe the homepage specifically, so they are injected here
  // rather than in index.html, otherwise /privacy would also claim to be an
  // application and answer these questions.
  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NextTool',
    url: `${SITE}/`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: DEFAULT_DESC,
    isAccessibleForFree: true,
  });

  // Mirrors the visible FAQ accordion on the homepage.
  setJsonLd('faq-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });
}

export function updateToolMeta(toolId: string) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return updateHomeMeta();

  // Not clearPageSchema(), this route sets its own breadcrumb and FAQ below.
  clearArticleMeta();
  const title = toolTitle(tool.name);
  const desc = truncateDescription(
    `${tool.description}. Free, runs in your browser, no upload and no sign-up.`,
  );
  const url = `${SITE}/tool/${tool.id}`;

  document.title = title;
  setMeta('description', desc);
  setMeta('keywords', keywordList([tool.name, ...tool.keywords, 'free', 'online', 'no upload']));
  setMeta('og:title', title, true);
  setMeta('og:description', desc, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url,
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
  });

  setJsonLd('breadcrumb-jsonld', breadcrumbList([
    { name: 'Home', url: `${SITE}/` },
    { name: CATEGORY_NAMES[tool.category] ?? tool.category, url: `${SITE}/category/${tool.category}` },
    { name: tool.name, url },
  ]));

  const seo = TOOL_SEO_CONTENT[tool.id];
  const faqEl = document.getElementById('faq-jsonld');
  if (!tool.isComingSoon && seo?.faqs?.length) {
    setJsonLd('faq-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  } else if (faqEl) {
    faqEl.remove();
  }
}

export function updateCategoryMeta(cat: ToolCategory) {
  clearPageSchema();
  const name = CATEGORY_NAMES[cat] ?? cat;
  const count = TOOLS.filter(t => t.category === cat).length;
  const title = `${name} | NextTool`;
  const desc = `Free ${name.toLowerCase()} that run in your browser without uploading your files anywhere.`;
  const url = `${SITE}/category/${cat}`;

  document.title = title;
  setMeta('description', desc);
  setMeta('keywords', keywordList([
    name, ...TOOLS.filter(t => t.category === cat).flatMap(t => t.keywords), 'free', 'online',
  ]));
  setMeta('og:title', title, true);
  setMeta('og:description', desc, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${name} - NextTool`,
    url,
    description: desc,
    numberOfItems: count,
  });

  setJsonLd('breadcrumb-jsonld', breadcrumbList([
    { name: 'Home', url: `${SITE}/` },
    { name, url },
  ]));

  const faqEl = document.getElementById('faq-jsonld');
  if (faqEl) faqEl.remove();
}

export function updatePageMeta(pageId: StaticPageId) {
  const page = getStaticPage(pageId);
  if (!page) return updateHomeMeta();

  clearPageSchema();
  const title = `${page.title} | NextTool`;
  const url = `${SITE}${page.path}`;

  document.title = title;
  setMeta('description', page.description);
  removeMeta('keywords');
  setMeta('og:title', title, true);
  setMeta('og:description', page.description, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', title);
  setMeta('twitter:description', page.description);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': pageId === 'about' ? 'AboutPage' : pageId === 'contact' ? 'ContactPage' : 'WebPage',
    name: page.title,
    url,
    description: page.description,
    isPartOf: { '@type': 'WebSite', name: 'NextTool', url: `${SITE}/` },
    publisher: { '@type': 'Organization', name: 'NextTool', url: `${SITE}/` },
  });

  setJsonLd('breadcrumb-jsonld', breadcrumbList([
    { name: 'Home', url: `${SITE}/` },
    { name: page.label, url },
  ]));
}

export function updateAllToolsMeta() {
  clearPageSchema();
  const title = 'All Tools | NextTool';
  const desc = 'Browse all free NextTool utilities, from PDF and image tools to developer and AI helpers. Everything runs on your device.';
  const url = `${SITE}/all-tools`;

  document.title = title;
  setMeta('description', desc);
  setMeta('keywords', DEFAULT_KEYWORDS);
  setMeta('og:title', title, true);
  setMeta('og:description', desc, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All NextTool',
    url,
    description: desc,
    numberOfItems: TOOLS.length,
  });
}

export function updateBlogIndexMeta() {
  clearPageSchema();
  const title = 'Blog | NextTool';
  const desc = 'Practical guides to file formats, compression, encoding, security and privacy, the reasoning behind every tool on NextTool.';
  const url = `${SITE}/blog`;

  document.title = title;
  setMeta('description', desc);
  setMeta('keywords', keywordList(BLOG_POSTS.flatMap(p => p.tags)));
  setMeta('og:title', title, true);
  setMeta('og:description', desc, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'NextTool Blog',
    url,
    description: desc,
    publisher: { '@type': 'Organization', name: 'NextTool', url: `${SITE}/` },
    blogPost: BLOG_POSTS.slice(0, 10).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
      datePublished: p.published,
      description: p.description,
    })),
  });

  setJsonLd('breadcrumb-jsonld', breadcrumbList([
    { name: 'Home', url: `${SITE}/` },
    { name: 'Blog', url },
  ]));
}

/**
 * A topic hub, /blog/topic/pdf and friends. These exist so the subject filter
 * on the blog index is a real, linkable, indexable page rather than component
 * state, which is the difference between six landing pages and none.
 */
export function updateBlogTopicMeta(category: BlogCategory) {
  clearPageSchema();
  const meta = BLOG_CATEGORY_META[category];
  const posts = postsInCategory(category);
  const title = `${meta.heading} | NextTool`;
  const url = `${SITE}/blog/topic/${category}`;

  document.title = title;
  setMeta('description', meta.description);
  setMeta('keywords', keywordList([meta.label, ...posts.flatMap(p => p.tags), 'guides']));
  setMeta('og:title', meta.heading, true);
  setMeta('og:description', meta.description, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', meta.heading);
  setMeta('twitter:description', meta.description);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.heading,
    url,
    description: meta.description,
    isPartOf: { '@type': 'Blog', name: 'NextTool Blog', url: `${SITE}/blog` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  });

  setJsonLd('breadcrumb-jsonld', breadcrumbList([
    { name: 'Home', url: `${SITE}/` },
    { name: 'Blog', url: `${SITE}/blog` },
    { name: meta.label, url },
  ]));
}

export function updateBlogPostMeta(slug: string) {
  const post = getPost(slug);
  if (!post) return updateBlogIndexMeta();

  clearPageSchema();
  // Article headlines are already the keyword-bearing part, so when adding the
  // site suffix would push the title past where results truncate, the suffix
  // is what goes rather than the end of the headline.
  const title = post.title.length + 11 <= TITLE_LIMIT ? `${post.title} | NextTool` : post.title;
  const url = `${SITE}/blog/${post.slug}`;

  document.title = title;
  setMeta('description', post.description);
  setMeta('keywords', keywordList([...post.tags, BLOG_CATEGORY_LABELS[post.category], 'guide', 'nexttool']));
  setMeta('og:title', post.title, true);
  setMeta('og:description', post.description, true);
  setMeta('og:url', url, true);
  setMeta('og:type', 'article', true);
  setMeta('article:published_time', post.published, true);
  setMeta('article:modified_time', post.updated ?? post.published, true);
  setMeta('article:section', BLOG_CATEGORY_LABELS[post.category], true);
  setMeta('article:tag', post.tags.join(', '), true);
  setMeta('twitter:title', post.title);
  setMeta('twitter:description', post.description);
  setCanonical(url);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    keywords: post.tags.join(', '),
    wordCount: post.body.split(/\s+/).length,
    timeRequired: `PT${readingMinutes(post.body)}M`,
    articleSection: BLOG_CATEGORY_LABELS[post.category],
    author: { '@type': 'Organization', name: 'NextTool', url: `${SITE}/` },
    publisher: {
      '@type': 'Organization',
      name: 'NextTool',
      url: `${SITE}/`,
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon-512.png` },
    },
    image: `${SITE}/og-image.png`,
  });

  setJsonLd('breadcrumb-jsonld', breadcrumbList([
    { name: 'Home', url: `${SITE}/` },
    { name: 'Blog', url: `${SITE}/blog` },
    { name: post.title, url },
  ]));
}

export function parseRoute(pathname: string): {
  view: 'home' | 'tool' | 'category' | 'page' | 'all' | 'blog' | 'files' | 'settings';
  toolId?: string;
  category?: ToolCategory;
  pageId?: StaticPageId;
  blogSlug?: string;
  blogTopic?: BlogCategory;
} {
  // Netlify's pretty-URL handling 301s /blog to /blog/, so every hard refresh
  // and every shared link arrives here with a trailing slash. Without this the
  // patterns below all miss and the app drops the reader on the home page.
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.replace(/\/+$/, '') || '/';

  const page = getStaticPageByPath(pathname);
  if (page) return { view: 'page', pageId: page.id };
  if (pathname === '/my-files') return { view: 'files' };
  if (pathname === '/settings') return { view: 'settings' };
  if (pathname === '/blog') return { view: 'blog' };
  // Checked before the post pattern, otherwise /blog/topic/pdf reads as a post
  // with the slug "topic" and 404s into the index.
  const topicMatch = pathname.match(/^\/blog\/topic\/([a-z]+)$/);
  if (topicMatch && isBlogCategory(topicMatch[1])) return { view: 'blog', blogTopic: topicMatch[1] };
  const postMatch = pathname.match(/^\/blog\/([a-z0-9-]+)$/);
  if (postMatch) return { view: 'blog', blogSlug: postMatch[1] };
  if (pathname === '/all-tools') return { view: 'all' };
  const toolMatch = pathname.match(/^\/tool\/([a-z0-9-]+)$/);
  if (toolMatch) return { view: 'tool', toolId: toolMatch[1] };
  const catMatch = pathname.match(/^\/category\/([a-z]+)$/);
  if (catMatch) return { view: 'category', category: catMatch[1] as ToolCategory };
  return { view: 'home' };
}

export const blogTopicPath = (category: BlogCategory): string => `/blog/topic/${category}`;

export function buildPath(view: string, id?: string): string {
  if (view === 'files') return '/my-files';
  if (view === 'settings') return '/settings';
  if (view === 'page' && id) return getStaticPage(id)?.path ?? '/';
  if (view === 'blog') return id ? `/blog/${id}` : '/blog';
  if (view === 'all') return '/all-tools';
  if (view === 'tool' && id) return `/tool/${id}`;
  if (view === 'category' && id) return `/category/${id}`;
  return '/';
}
