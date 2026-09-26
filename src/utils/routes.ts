import { getStaticPage } from '../config/pages';
import type { BlogCategory } from '../config/blog/types';

// Path builders, kept apart from utils/seo.ts: that module pulls in every
// tool's SEO copy and all blog metadata, and these are needed in the browser.

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
