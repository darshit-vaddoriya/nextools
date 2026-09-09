import { BlogPost, BlogCategory } from './types';
import { PDF_POSTS } from './posts/pdf';
import { IMAGE_POSTS } from './posts/image';
import { DEV_POSTS } from './posts/dev';
import { SECURITY_POSTS } from './posts/security';
import { DATA_POSTS } from './posts/data';
import { PRIVACY_POSTS } from './posts/privacy';

export * from './types';

/** All posts, newest first. */
export const BLOG_POSTS: BlogPost[] = [
  ...PDF_POSTS,
  ...IMAGE_POSTS,
  ...DEV_POSTS,
  ...SECURITY_POSTS,
  ...DATA_POSTS,
  ...PRIVACY_POSTS,
].sort((a, b) => b.published.localeCompare(a.published));

export const getPost = (slug: string): BlogPost | undefined =>
  BLOG_POSTS.find(p => p.slug === slug);

export const postsInCategory = (cat: BlogCategory): BlogPost[] =>
  BLOG_POSTS.filter(p => p.category === cat);

/**
 * Picks articles to show under a post: same category first, then whatever is
 * newest, so every article always has somewhere to go next.
 */
export function relatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const sameCategory = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category);
  const rest = BLOG_POSTS.filter(p => p.slug !== post.slug && p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
