import { TOOLS } from '../config/tools';
import { ToolCategory } from '../types';
import { TOOL_SEO_CONTENT } from '../config/seoContent';
import { StaticPageId, getStaticPage, getStaticPageByPath } from '../config/pages';
import { BLOG_POSTS, getPost, BLOG_CATEGORY_LABELS, readingMinutes } from '../config/blog';
import { HOME_FAQ } from '../config/faq';

const SITE = 'https://nexttool.click';
const DEFAULT_TITLE = 'NextTool - Free Online Tools';
const DEFAULT_DESC =
  'Free browser tools for PDF, image, developer and AI tasks. Files are processed on your own device, so nothing is uploaded.';

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

function clearPageSchema() {
  const el = document.getElementById('breadcrumb-jsonld');
  if (el) el.remove();
  const faqEl = document.getElementById('faq-jsonld');
  if (faqEl) faqEl.remove();
}

export function updateHomeMeta() {
  clearPageSchema();
  document.title = DEFAULT_TITLE;
  setMeta('description', DEFAULT_DESC);
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

  const title = `${tool.name} | NextTool`;
  const desc = `${tool.description}. Files stay on your device, nothing is uploaded.`;
  const url = `${SITE}/tool/${tool.id}`;

  document.title = title;
  setMeta('description', desc);
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

export function updateBlogPostMeta(slug: string) {
  const post = getPost(slug);
  if (!post) return updateBlogIndexMeta();

  clearPageSchema();
  const title = `${post.title} | NextTool`;
  const url = `${SITE}/blog/${post.slug}`;

  document.title = title;
  setMeta('description', post.description);
  setMeta('og:title', post.title, true);
  setMeta('og:description', post.description, true);
  setMeta('og:url', url, true);
  setMeta('og:type', 'article', true);
  setMeta('article:published_time', post.published, true);
  setMeta('article:section', BLOG_CATEGORY_LABELS[post.category], true);
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
} {
  const page = getStaticPageByPath(pathname);
  if (page) return { view: 'page', pageId: page.id };
  if (pathname === '/my-files') return { view: 'files' };
  if (pathname === '/settings') return { view: 'settings' };
  if (pathname === '/blog') return { view: 'blog' };
  const postMatch = pathname.match(/^\/blog\/([a-z0-9-]+)$/);
  if (postMatch) return { view: 'blog', blogSlug: postMatch[1] };
  if (pathname === '/all-tools') return { view: 'all' };
  const toolMatch = pathname.match(/^\/tool\/([a-z0-9-]+)$/);
  if (toolMatch) return { view: 'tool', toolId: toolMatch[1] };
  const catMatch = pathname.match(/^\/category\/([a-z]+)$/);
  if (catMatch) return { view: 'category', category: catMatch[1] as ToolCategory };
  return { view: 'home' };
}

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
