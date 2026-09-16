import React from 'react';
import { Calculator, Code, FileSpreadsheet, FileText, FileType2, Image, Lock, Shield } from 'lucide-react';

export type BlogCategory = 'pdf' | 'docs' | 'image' | 'dev' | 'data' | 'numbers' | 'security' | 'privacy';

export interface BlogPost {
  /** URL segment: /blog/<slug> */
  slug: string;
  title: string;
  /** <meta name="description">, keep under ~155 characters */
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
  /**
   * 3-5 conclusions, shown in a box above the article. Written as the answers
   * themselves rather than as a list of what the article covers, so a reader
   * who stops here still leaves with something.
   */
  takeaways?: string[];
  /** Article body in a small Markdown subset (see utils/markdown.ts) */
  body: string;
}

/**
 * Per-category label, icon and colour classes, mirrors the tool category palette.
 *
 * `heading` and `description` are what the topic hub at /blog/topic/<id> puts in
 * its <h1> and <meta name="description">. They are written per category rather
 * than templated from the label, because six pages reading "Guides about X" is
 * exactly the thin, duplicated copy that keeps hub pages out of the index.
 */
export const BLOG_CATEGORY_META: Record<BlogCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  heading: string;
  description: string;
}> = {
  pdf: {
    label: 'PDF', icon: FileText,
    color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/15',
    heading: 'Working with PDFs',
    description: 'Why PDFs refuse to shrink, what a merge quietly breaks, how redaction actually works, and what OCR can and cannot read off a scan.',
  },
  docs: {
    label: 'Documents', icon: FileType2,
    color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15',
    heading: 'Word documents and Markdown',
    description: 'Reading a DOCX without Word, what survives a conversion to PDF and back, and using Markdown as the source your documents are generated from.',
  },
  image: {
    label: 'Images', icon: Image,
    color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-500/15',
    heading: 'Images and file formats',
    description: 'Choosing between JPEG, PNG, WebP and AVIF, the difference between resizing and compressing, and how to get a photo small without making it look it.',
  },
  dev: {
    label: 'Developer', icon: Code,
    color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-500/15',
    heading: 'Encoding, formats and everyday developer problems',
    description: 'JSON errors, Base64, JWTs, UUIDs, regex, URL encoding and mojibake, explained by what the specification actually says rather than by folklore.',
  },
  numbers: {
    label: 'Numbers & Time', icon: Calculator,
    color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15',
    heading: 'Dates, units and the maths behind the calculators',
    description: 'Unix timestamps and the off-by-one-hour bug, how loan EMI and GST are actually computed, and why unit conversion is less obvious than it looks.',
  },
  security: {
    label: 'Security', icon: Shield,
    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15',
    heading: 'Passwords, hashing and verification',
    description: 'What makes a password strong, how hashing differs from encryption, how to verify a download, and what a digital signature really proves.',
  },
  data: {
    label: 'Data & CSV', icon: FileSpreadsheet,
    color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/15',
    heading: 'Spreadsheets, CSV and messy data',
    description: 'Why Excel mangles your CSV, how delimiters, quoting and encoding break files, and a repeatable order of operations for cleaning a dataset.',
  },
  privacy: {
    label: 'Privacy', icon: Lock,
    color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/15',
    heading: 'What your files give away',
    description: 'What happens to a file you upload to a free online tool, what metadata your photos and documents carry, and what tracking you can actually control.',
  },
};

export const BLOG_CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOG_CATEGORY_META).map(([id, meta]) => [id, meta.label]),
) as Record<BlogCategory, string>;

/** Rough reading time from the raw Markdown, at ~220 words per minute. */
export function readingMinutes(body: string): number {
  const words = body.replace(/[#>*`|-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}
