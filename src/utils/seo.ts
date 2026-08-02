import { TOOLS } from '../config/tools';
import { ToolCategory } from '../types';

const SITE = 'https://nexttool.app';
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

export function updateHomeMeta() {
  document.title = DEFAULT_TITLE;
  setMeta('description', DEFAULT_DESC);
  setMeta('og:title', DEFAULT_TITLE, true);
  setMeta('og:description', DEFAULT_DESC, true);
  setMeta('og:url', `${SITE}/`, true);
  setMeta('twitter:title', DEFAULT_TITLE);
  setMeta('twitter:description', DEFAULT_DESC);
  setCanonical(`${SITE}/`);

  setJsonLd('page-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NextTool',
    url: `${SITE}/`,
    description: DEFAULT_DESC,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
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
}

export function updateCategoryMeta(cat: ToolCategory) {
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
}

export function updatePrivacyMeta() {
  const title = 'Privacy Policy | NextTool';
  const desc = 'How NextTool protects your privacy. Tools run on your device and your files are never uploaded or tracked.';
  const url = `${SITE}/privacy`;

  document.title = title;
  setMeta('description', desc);
  setMeta('og:title', title, true);
  setMeta('og:description', desc, true);
  setMeta('og:url', url, true);
  setCanonical(url);
}

export function updateAllToolsMeta() {
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

export function parseRoute(pathname: string): {
  view: 'home' | 'tool' | 'category' | 'privacy' | 'all';
  toolId?: string;
  category?: ToolCategory;
} {
  if (pathname === '/privacy') return { view: 'privacy' };
  if (pathname === '/all-tools') return { view: 'all' };
  const toolMatch = pathname.match(/^\/tool\/([a-z0-9-]+)$/);
  if (toolMatch) return { view: 'tool', toolId: toolMatch[1] };
  const catMatch = pathname.match(/^\/category\/([a-z]+)$/);
  if (catMatch) return { view: 'category', category: catMatch[1] as ToolCategory };
  return { view: 'home' };
}

export function buildPath(view: string, id?: string): string {
  if (view === 'privacy') return '/privacy';
  if (view === 'all') return '/all-tools';
  if (view === 'tool' && id) return `/tool/${id}`;
  if (view === 'category' && id) return `/category/${id}`;
  return '/';
}
