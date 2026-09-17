import { BlogPost, BlogCategory, BLOG_CATEGORY_META } from './types';
import { PDF_POSTS } from './posts/pdf';
import { DOCS_POSTS } from './posts/docs';
import { IMAGE_POSTS } from './posts/image';
import { MEDIA_POSTS } from './posts/media';
import { DEV_POSTS } from './posts/dev';
import { SECURITY_POSTS } from './posts/security';
import { DATA_POSTS } from './posts/data';
import { NUMBERS_POSTS } from './posts/numbers';
import { PRIVACY_POSTS } from './posts/privacy';

export * from './types';

/** All posts, newest first. */
export const BLOG_POSTS: BlogPost[] = [
  ...PDF_POSTS,
  ...DOCS_POSTS,
  ...IMAGE_POSTS,
  ...MEDIA_POSTS,
  ...DEV_POSTS,
  ...SECURITY_POSTS,
  ...DATA_POSTS,
  ...NUMBERS_POSTS,
  ...PRIVACY_POSTS,
].sort((a, b) => b.published.localeCompare(a.published));

export const getPost = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find(p => p.slug === slug);

export const postsInCategory = (cat: BlogCategory): BlogPost[] =>
  BLOG_POSTS.filter(p => p.category === cat);

/**
 * Categories that actually have something in them, in the order they are
 * declared. A topic hub with no posts would be a thin page, so an empty
 * category never gets a URL, a nav entry or a sitemap line.
 */
export const BLOG_CATEGORIES = (Object.keys(BLOG_CATEGORY_META) as BlogCategory[])
  .filter(cat => BLOG_POSTS.some(post => post.category === cat));

export const isBlogCategory = (value: string): value is BlogCategory =>
  (BLOG_CATEGORIES as string[]).includes(value);

/**
 * The reverse of `post.relatedTools`: every guide that names a given tool.
 * Built once, because tool pages ask this on every render and a linear scan of
 * all posts per tool would be repeated work for a fixed answer.
 */
const POSTS_BY_TOOL = BLOG_POSTS.reduce<Record<string, BlogPost[]>>((acc, post) => {
  for (const toolId of post.relatedTools) (acc[toolId] ??= []).push(post);
  return acc;
}, {});

export const postsForTool = (toolId: string, limit = 3): BlogPost[] =>
  (POSTS_BY_TOOL[toolId] ?? []).slice(0, limit);

/**
 * Picks articles to show under a post: same category first, then whatever is
 * newest, so every article always has somewhere to go next.
 */
export function relatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const sameCategory = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category);
  const rest = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/**
 * Fetches an article's Markdown body, one chunk per topic.
 *
 * Bodies are deliberately not part of BlogPost: ~500 KB of article text was
 * reaching the entry bundle, so the homepage and every tool page paid for
 * articles they never render. A reader opening one guide now downloads only
 * that guide's topic.
 */
const BODY_LOADERS: Record<BlogCategory, () => Promise<Record<string, string>>> = {
  pdf:      () => import('./bodies/pdf').then(m => m.PDF_BODIES),
  docs:     () => import('./bodies/docs').then(m => m.DOCS_BODIES),
  image:    () => import('./bodies/image').then(m => m.IMAGE_BODIES),
  media:    () => import('./bodies/media').then(m => m.MEDIA_BODIES),
  dev:      () => import('./bodies/dev').then(m => m.DEV_BODIES),
  security: () => import('./bodies/security').then(m => m.SECURITY_BODIES),
  data:     () => import('./bodies/data').then(m => m.DATA_BODIES),
  numbers:  () => import('./bodies/numbers').then(m => m.NUMBERS_BODIES),
  privacy:  () => import('./bodies/privacy').then(m => m.PRIVACY_BODIES),
};

export async function loadPostBody(post: BlogPost): Promise<string> {
  const bodies = await BODY_LOADERS[post.category]();
  return bodies[post.slug] ?? '';
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
