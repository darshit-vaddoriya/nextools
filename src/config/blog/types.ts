import React from 'react';
import { Calculator, Code, FileSpreadsheet, FileText, FileType2, Image, Lock, Shield, Video } from 'lucide-react';

export type BlogCategory = 'pdf' | 'docs' | 'image' | 'media' | 'dev' | 'data' | 'numbers' | 'security' | 'privacy';

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
  /**
   * Word count of the article body, precomputed at authoring time.
   *
   * The body itself lives in config/blog/bodies/<category>.ts and is fetched on
   * demand, so reading time has to be derivable without it — post cards on the
   * blog index and the "related guides" strip on tool pages all show a reading
   * time for articles whose text is never loaded.
   */
  words: number;
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
  /**
   * The standfirst doubles as a meta description and has to stay under ~155
   * characters. `intro` is the paragraph the hub page itself shows: what this
   * subject keeps getting wrong, and why the guides under it exist. Without it
   * a hub is a heading over a grid of cards, which is the same thin listing
   * repeated on nine different URLs.
   */
  intro: string;
}> = {
  pdf: {
    label: 'PDF', icon: FileText,
    color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/15',
    heading: 'Working with PDFs',
    description: 'Why PDFs refuse to shrink, what a merge quietly breaks, how redaction actually works, and what OCR can and cannot read off a scan.',
    intro:
      'Nearly every complaint about PDFs traces back to one design decision: the format records where ink goes on a page, not what the page means. There are no paragraphs in a PDF, no headings, no tables, only positioned glyphs and images that a reader\'s eye assembles into those things. Once that clicks, the rest follows. Text extraction returns odd line breaks because the line breaks were never recorded. A scan has no text at all until OCR puts some there. Compression barely touches a text-only document and transforms an image-heavy one. These guides work through the consequences one at a time.'
  },
  docs: {
    label: 'Documents', icon: FileType2,
    color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15',
    heading: 'Word documents and Markdown',
    description: 'Reading a DOCX without Word, what survives a conversion to PDF and back, and using Markdown as the source your documents are generated from.',
    intro:
      'Word documents are the format most likely to be sitting between you and what you actually want: a web page, a Markdown file, a PDF, or just the words. A .docx is a ZIP archive of XML, which is the reason any of that is possible without Word installed, and the reason conversion is a question of mapping structure rather than taking a picture of a page. What these guides cover is which structure survives each hop, what Word quietly stores about you inside every file you send, and why using Markdown as the source is easier than converting away from Word over and over.'
  },
  image: {
    label: 'Images', icon: Image,
    color: 'text-pink-700 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-500/15',
    heading: 'Images and file formats',
    description: 'Choosing between JPEG, PNG, WebP and AVIF, the difference between resizing and compressing, and how to get a photo small without making it look it.',
    intro:
      'Image questions look like format questions and are usually resolution questions wearing a disguise. A photograph at four thousand pixels wide displayed in an eight-hundred-pixel column is carrying five times the data anyone will ever see, and no amount of clever compression fixes that as cheaply as resizing does. The guides here work through the order of operations, dimensions first, then format, then quality, and through the specific traps: why JPEG ruins screenshots, why re-saving compounds loss, what your photos carry in EXIF, and where AI background removal genuinely works and where it visibly does not.'
  },
  media: {
    label: 'Video & Audio', icon: Video,
    color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/15',
    heading: 'Video and audio files',
    description: 'What a codec is and why MP4 is not one, how to make a video smaller without ruining it, trimming without re-encoding, and getting audio or subtitles out of a clip.',
    intro:
      'Video is the subject where the vocabulary actively misleads. MP4 is a container, not a codec; the thing that determines whether a file plays is what is inside it, and two files with the same extension can behave completely differently. These guides are about reading what a file actually contains, understanding which edits copy streams in seconds and which decode every frame, and knowing which of resolution, bit rate and frame rate to cut first when something has to be smaller. NextTool does not publish video tools, so this is the reasoning rather than a pitch.'
  },
  dev: {
    label: 'Developer', icon: Code,
    color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-500/15',
    heading: 'Encoding, formats and everyday developer problems',
    description: 'JSON errors, Base64, JWTs, UUIDs, regex, URL encoding and mojibake, explained by what the specification actually says rather than by folklore.',
    intro:
      'Most of the problems in this section are specification problems that folklore has papered over. JSON does not allow trailing commas and never did; Base64 is an encoding with no secrecy in it; a JWT\'s payload is readable by anyone holding the token, and only the signature makes it trustworthy. Each guide here takes one of those, states what the relevant specification actually says, and then works through the failure it explains: the mojibake, the double-encoded URL, the regex that matches almost the right thing.'
  },
  numbers: {
    label: 'Numbers & Time', icon: Calculator,
    color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15',
    heading: 'Dates, units and the maths behind the calculators',
    description: 'Unix timestamps and the off-by-one-hour bug, how loan EMI and GST are actually computed, and why unit conversion is less obvious than it looks.',
    intro:
      'The interesting part of a calculator is never the arithmetic, it is the assumption the arithmetic rests on. An inch is exactly 25.4 millimetres, so that conversion has no error in it at all. A currency rate is a number at a moment with a spread attached, and a converter reporting one is reporting a snapshot, not a fact. Between those two extremes sit timestamps that are off by an hour twice a year, loan schedules whose totals depend on compounding basis, and tax arithmetic that is exact but fed by inputs people routinely misread.'
  },
  security: {
    label: 'Security', icon: Shield,
    color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15',
    heading: 'Passwords, hashing and verification',
    description: 'What makes a password strong, how hashing differs from encryption, how to verify a download, and what a digital signature really proves.',
    intro:
      'Three operations get confused constantly, and the confusion is the source of most bad security decisions made by otherwise careful people. Hashing is one-way and proves a file has not changed. Encoding is reversible by anyone and protects nothing. Encryption is reversible with a key and provides confidentiality. These guides separate them properly, then apply the distinction: what makes a password strong (length, not punctuation), what a checksum does and does not prove about a download, and what a signature adds that a hash cannot.'
  },
  data: {
    label: 'Data & CSV', icon: FileSpreadsheet,
    color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/15',
    heading: 'Spreadsheets, CSV and messy data',
    description: 'Why Excel mangles your CSV, how delimiters, quoting and encoding break files, and a repeatable order of operations for cleaning a dataset.',
    intro:
      'CSV is the format everything reads and nothing agrees on. Delimiters vary by locale, quoting rules vary by writer, encodings vary by whatever produced the export, and a spreadsheet application will convert a column of order IDs to scientific notation on import without asking. The guides here cover why that happens, how to avoid letting it happen, and a repeatable order of operations for cleaning a dataset (normalise, then deduplicate, then merge) that turns the usual hour of frustration into a few deliberate steps.'
  },
  privacy: {
    label: 'Privacy', icon: Lock,
    color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/15',
    heading: 'What your files give away',
    description: 'What happens to a file you upload to a free online tool, what metadata your photos and documents carry, and what tracking you can actually control.',
    intro:
      'The honest answer to what happens to a file you upload to a free online tool is that you do not know, and that the tool has no particular incentive to tell you. These guides are about the parts you can establish: what metadata your photos and documents actually carry, which of it is a privacy problem rather than a curiosity, what a browser-based tool can and cannot see, and which tracking you can genuinely control versus which is theatre.'
  },
};

export const BLOG_CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOG_CATEGORY_META).map(([id, meta]) => [id, meta.label]),
) as Record<BlogCategory, string>;

/** Rough reading time at ~220 words per minute, from the post's stored word count. */
export function readingMinutes(post: Pick<BlogPost, 'words'>): number {
  return Math.max(2, Math.round(post.words / 220));
}
