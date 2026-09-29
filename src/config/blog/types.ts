import React from 'react';
import { Code, FileSpreadsheet, FileText, Image, Shield } from 'lucide-react';

/**
 * Five topics. There used to be nine, and after the September 2026 pruning four
 * of them held one to five guides each: a hub that is an intro over two or
 * three cards is a thin page. Documents joined PDF, Video & Audio joined
 * Images, Numbers joined Data, and Privacy joined Security.
 */
export type BlogCategory = 'pdf' | 'image' | 'dev' | 'data' | 'security';

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
    label: 'PDF & Documents', icon: FileText,
    color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/15',
    heading: 'PDFs and Word documents',
    description: 'Why PDFs refuse to shrink, what merging and redaction really do, reading a DOCX without Word, and what survives a conversion between them.',
    intro:
      'Nearly every complaint about PDFs traces back to one design decision: the format records where ink goes on a page, not what the page means. There are no paragraphs in a PDF, no headings and no tables, only positioned glyphs and images that a reader\'s eye assembles into those things. Text extraction returns odd line breaks because the line breaks were never recorded, a scan has no text at all until OCR puts some there, and compression barely touches a text-only document while transforming an image-heavy one. A Word file is the opposite: a .docx is a ZIP of XML that records structure and leaves the final layout to whichever program opens it. That is why converting Word to PDF fixes how a document looks, and why converting back has to guess the structure. These guides work through both formats and the hops between them.'
  },
  image: {
    label: 'Images & Video', icon: Image,
    color: 'text-pink-700 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-500/15',
    heading: 'Images, video and audio',
    description: 'Choosing between JPEG, PNG, WebP and AVIF, resizing versus compressing, why MP4 is not a codec, and shrinking a video or GIF without ruining it.',
    intro:
      'Image questions look like format questions and are usually resolution questions in disguise. A photograph four thousand pixels wide shown in an eight-hundred-pixel column carries far more data than anyone will see, and no compression setting fixes that as cheaply as resizing does. Video has the same shape of problem with more moving parts. MP4 is a container, not a codec, so two files with the same extension can behave completely differently, and when a clip has to be smaller the order in which you cut bit rate, resolution and frame rate decides whether it still looks right. The guides here cover images, GIFs, video, extracted audio and subtitles, and each one ends at a tool on this site that does the job in your browser.'
  },
  dev: {
    label: 'Developer', icon: Code,
    color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-500/15',
    heading: 'Encoding, formats and everyday developer problems',
    description: 'JSON errors, Base64, JWTs, UUIDs, regex, URL encoding and mojibake, explained by what the specification actually says rather than by folklore.',
    intro:
      'Most of the problems in this section are specification problems that folklore has papered over. JSON does not allow trailing commas and never did; Base64 is an encoding with no secrecy in it; a JWT\'s payload is readable by anyone holding the token, and only the signature makes it trustworthy. Each guide here takes one of those, states what the relevant specification actually says, and then works through the failure it explains: the mojibake, the double-encoded URL, the regex that matches almost the right thing.'
  },
  data: {
    label: 'Data & Numbers', icon: FileSpreadsheet,
    color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/15',
    heading: 'Spreadsheets, data, units and dates',
    description: 'Why Excel mangles your CSV, cleaning a messy dataset, timestamps and the off-by-one-hour bug, and the formulas behind EMI, GST and unit conversion.',
    intro:
      'CSV is the format everything reads and nothing agrees on. Delimiters vary by locale, quoting rules vary by writer, encodings vary by whatever produced the export, and a spreadsheet will turn a column of order IDs into scientific notation on import without asking. The guides here cover why that happens and a repeatable order for cleaning a dataset: normalise, then deduplicate, then merge. The same habit of checking the assumption applies to numbers. A Unix timestamp has no time zone until you give it one, removing GST from a price is division rather than subtraction, and a temperature conversion needs an offset where a length conversion needs only a factor.'
  },
  security: {
    label: 'Security & Privacy', icon: Shield,
    color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15',
    heading: 'Passwords, hashing, verification and metadata',
    description: 'What makes a password strong, how hashing differs from encryption, how to verify a download, and what the metadata in your photos gives away.',
    intro:
      'Three operations get confused constantly, and the confusion is the source of most bad security decisions made by otherwise careful people. Hashing is one-way and proves a file has not changed. Encoding is reversible by anyone and protects nothing. Encryption is reversible with a key and provides confidentiality. These guides separate them properly, then apply the distinction: what makes a password strong (length, not punctuation), what a checksum does and does not prove about a download, and what a signature adds that a hash cannot. The privacy side is what your own files give away, starting with the EXIF data in a photo, which can include the exact place it was taken.'
  },
};

export const BLOG_CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOG_CATEGORY_META).map(([id, meta]) => [id, meta.label]),
) as Record<BlogCategory, string>;

/** Rough reading time at ~220 words per minute, from the post's stored word count. */
export function readingMinutes(post: Pick<BlogPost, 'words'>): number {
  return Math.max(2, Math.round(post.words / 220));
}
