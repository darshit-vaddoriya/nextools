import React from 'react';
import { Code, FileSpreadsheet, FileText, Image, Lock, Shield } from 'lucide-react';

export type BlogCategory = 'pdf' | 'image' | 'dev' | 'security' | 'data' | 'privacy';

export interface BlogPost {
  /** URL segment: /blog/<slug> */
  slug: string;
  title: string;
  /** <meta name="description"> — keep under ~155 characters */
  description: string;
  /** Card summary on the blog index */
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  /** ISO date, used for <time> and Article JSON-LD */
  published: string;
  updated?: string;
  /** Tool ids from config/tools.ts that this article talks about */
  relatedTools: string[];
  /** Article body in a small Markdown subset (see utils/markdown.ts) */
  body: string;
}

/** Per-category label, icon and colour classes — mirrors the tool category palette. */
export const BLOG_CATEGORY_META: Record<BlogCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  pdf:      { label: 'PDF',        icon: FileText,        color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-500/15' },
  image:    { label: 'Images',     icon: Image,           color: 'text-pink-600 dark:text-pink-400',       bg: 'bg-pink-100 dark:bg-pink-500/15' },
  dev:      { label: 'Developer',  icon: Code,            color: 'text-slate-700 dark:text-slate-300',     bg: 'bg-slate-100 dark:bg-slate-500/15' },
  security: { label: 'Security',   icon: Shield,          color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  data:     { label: 'Data & CSV', icon: FileSpreadsheet, color: 'text-green-600 dark:text-green-400',     bg: 'bg-green-100 dark:bg-green-500/15' },
  privacy:  { label: 'Privacy',    icon: Lock,            color: 'text-indigo-600 dark:text-indigo-400',   bg: 'bg-indigo-100 dark:bg-indigo-500/15' },
};

export const BLOG_CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOG_CATEGORY_META).map(([id, meta]) => [id, meta.label]),
) as Record<BlogCategory, string>;

/** Rough reading time from the raw Markdown, at ~220 words per minute. */
export function readingMinutes(body: string): number {
  const words = body.replace(/[#>*`|-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}
