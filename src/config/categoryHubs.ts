/**
 * CATEGORY HUBS
 *
 * The structure of every category landing page except File Converters, which
 * has its own format-pair directory (ConverterDirectory). Each hub splits its
 * tools into task groups, says which kinds of file each tool opens, and lists
 * the tools from other categories a visitor here is likely to need next.
 *
 * Kept free of component imports so the build can read it cheaply. The build
 * fails if a tool is missing from its hub or an id is wrong: see
 * `validateCategoryHubs()` below, called from astro.config.ts.
 */
import type { FormatKind } from '../lib/formats';
import type { ToolCategory } from '../types';
import { TOOLS } from './tools';

/** 'any' opens every file (ZIP creator, checksum); [] opens none (generators). */
export type Accepts = FormatKind[] | 'any';

export interface HubGroup {
  id: string;
  title: string;
  /** One line under the group heading: what these tools have in common. */
  blurb: string;
  tools: string[];
  /** What the tools in this group open, unless a tool overrides it. */
  accepts?: Accepts;
  /** Narrows `accepts` to these extensions when the tools read only some
   *  formats of a kind (Word tools read .docx, not .doc or .odt). */
  exts?: string[];
}

export interface CategoryHub {
  /** Shown as the drop zone label when the category is about files. */
  drop?: { label: string; hint: string; accept?: string };
  groups: HubGroup[];
  /** Per-tool exceptions to the group's `accepts`. */
  toolAccepts?: Record<string, Accepts>;
  /** Per-tool exceptions to the group's `exts`. */
  toolExts?: Record<string, string[]>;
  /** Tools from other categories that belong next to these. */
  related?: string[];
}

export const CATEGORY_HUBS: Partial<Record<ToolCategory, CategoryHub>> = {
  pdf: {
    drop: { label: 'Choose a PDF', hint: 'or drop it here to see every tool that can use it' },
    groups: [
      { id: 'organise', title: 'Organise pages', blurb: 'Combine, split, reorder, rotate and trim pages.', accepts: ['pdf'],
        tools: ['pdf-merge', 'pdf-split', 'pdf-reorder', 'pdf-rotate', 'pdf-delete-pages', 'pdf-page-extractor', 'pdf-crop'] },
      { id: 'from-pdf', title: 'Convert from PDF', blurb: 'Turn pages into Word, images or plain text, including scans.', accepts: ['pdf'],
        tools: ['pdf-to-word', 'pdf-to-jpg', 'pdf-extract-text', 'pdf-extract-images', 'pdf-ocr'] },
      { id: 'to-pdf', title: 'Create a PDF', blurb: 'Make a PDF from photos, web pages or plain text.',
        tools: ['jpg-to-pdf', 'html-to-pdf', 'text-to-pdf'] },
      { id: 'edit', title: 'Edit, sign and protect', blurb: 'Stamp, number, sign, fill in and redact.', accepts: ['pdf'],
        tools: ['pdf-sign', 'pdf-fill-forms', 'pdf-watermark', 'pdf-page-numbers', 'pdf-header-footer', 'pdf-redact'] },
      { id: 'optimise', title: 'Compress and repair', blurb: 'Make files smaller, flatten forms and fix damaged ones.', accepts: ['pdf'],
        tools: ['pdf-compress', 'pdf-flatten', 'pdf-repair'] },
      { id: 'inspect', title: 'View and compare', blurb: 'Read, compare versions and check document properties.', accepts: ['pdf'],
        tools: ['pdf-viewer', 'pdf-compare', 'pdf-metadata'] },
    ],
    // Only tools that pick up a handed-over file are offered after a drop;
    // the HTML and text converters start from a paste box instead.
    toolAccepts: { 'jpg-to-pdf': ['image'], 'html-to-pdf': [], 'text-to-pdf': [] },
    related: ['pdf-to-excel', 'pdf-to-pptx', 'excel-to-pdf', 'tiff-to-pdf', 'svg-to-pdf', 'epub-to-pdf', 'docx-to-pdf'],
  },

  word: {
    drop: { label: 'Choose a Word file', hint: 'or drop a .docx here to see what you can do with it' },
    groups: [
      { id: 'from-docx', title: 'Convert Word files', blurb: 'Save a .docx as PDF, HTML, Markdown or plain text.', accepts: ['document'], exts: ['docx'],
        tools: ['docx-to-pdf', 'docx-to-html', 'docx-to-markdown', 'docx-to-txt'] },
      { id: 'to-docx', title: 'Create Word files', blurb: 'Build an editable .docx from web content or Markdown.',
        tools: ['html-to-docx', 'markdown-to-docx'] },
      { id: 'inspect', title: 'View, compare and clean', blurb: 'Read without Word, spot changes and strip formatting.', accepts: ['document'], exts: ['docx'],
        tools: ['word-viewer', 'word-compare', 'word-metadata', 'word-remove-format'] },
    ],
    toolAccepts: { 'html-to-docx': [], 'markdown-to-docx': [] },
    related: ['pdf-to-word', 'rtf-to-docx', 'markdown-to-epub', 'markdown-preview', 'word-counter'],
  },

  excel: {
    drop: { label: 'Choose a CSV file', hint: 'or drop it here to see every tool that can open it' },
    groups: [
      { id: 'view', title: 'View and edit', blurb: 'Open a CSV as a table and change it in place.', accepts: ['spreadsheet'], exts: ['csv', 'tsv'],
        tools: ['csv-editor', 'csv-viewer'] },
      { id: 'clean', title: 'Clean and combine', blurb: 'Fix whitespace and encodings, drop duplicates, merge files.', accepts: ['spreadsheet'], exts: ['csv', 'tsv'],
        tools: ['csv-cleaner', 'remove-duplicates', 'merge-csv'] },
      { id: 'convert', title: 'Convert data', blurb: 'Move between CSV, TSV, JSON and other delimiters.', accepts: ['spreadsheet'], exts: ['csv', 'tsv'],
        tools: ['csv-to-json', 'json-to-csv', 'tsv-converter', 'delimiter-converter'] },
    ],
    toolAccepts: { 'json-to-csv': [], 'tsv-converter': [], 'delimiter-converter': [], 'merge-csv': [] },
    related: ['excel-to-csv', 'csv-to-excel', 'excel-to-json', 'json-to-excel', 'excel-to-pdf', 'pdf-to-excel', 'xls-to-xlsx', 'ods-to-xlsx', 'csv-to-sql'],
  },

  image: {
    drop: { label: 'Choose an image', hint: 'or drop it here to see every tool that can use it' },
    groups: [
      { id: 'size', title: 'Compress and resize', blurb: 'Smaller files and exact dimensions, one image or a batch.', accepts: ['image'],
        tools: ['image-compressor', 'image-resize', 'batch-resize', 'image-crop'] },
      { id: 'edit', title: 'Edit and enhance', blurb: 'Rotate, flip, sharpen, adjust colour and remove backgrounds.', accepts: ['image'],
        tools: ['image-editor', 'ai-bg-remover', 'image-adjust', 'image-sharpen', 'image-rotate', 'image-flip'] },
      { id: 'convert', title: 'Convert and encode', blurb: 'Change format, make icons and embed images as Base64.', accepts: ['image'],
        tools: ['image-convert', 'svg-converter', 'ico-generator', 'image-to-base64', 'base64-to-image'] },
      { id: 'create', title: 'Draw and create', blurb: 'Annotate, watermark, make memes, collages and QR codes.', accepts: ['image'],
        tools: ['image-draw', 'image-watermark', 'meme-generator', 'image-collage', 'drawing', 'qr-generator'] },
      { id: 'inspect', title: 'Read and inspect', blurb: 'Pull text out of a picture and check its hidden metadata.', accepts: ['image'],
        tools: ['ocr-image', 'image-metadata'] },
    ],
    toolAccepts: { 'base64-to-image': [], drawing: [], 'qr-generator': [] },
    toolExts: { 'svg-converter': ['svg'] },
    related: ['heic-to-jpg', 'png-to-jpg', 'webp-to-jpg', 'raw-to-jpg', 'psd-to-png', 'png-to-svg', 'jpg-to-avif', 'jpg-to-pdf'],
  },

  archive: {
    drop: { label: 'Choose files', hint: 'or drop a ZIP to extract it, or any files to zip them' },
    groups: [
      { id: 'extract', title: 'Open archives', blurb: 'List and extract what is inside a ZIP.', accepts: ['archive'], exts: ['zip'],
        tools: ['zip-extractor'] },
      { id: 'create', title: 'Create archives', blurb: 'Pack files into one ZIP, or zip each file separately.', accepts: 'any',
        tools: ['zip-creator', 'batch-zip'] },
    ],
    related: ['rar-to-zip', '7z-to-zip', 'tar-to-zip', 'zip-to-tar'],
  },

  dev: {
    groups: [
      { id: 'format', title: 'Format and validate', blurb: 'Pretty-print, minify and check code and data.',
        tools: ['json-formatter', 'yaml-formatter', 'sql-formatter', 'xml-formatter', 'html-formatter', 'css-formatter', 'js-formatter'] },
      { id: 'encode', title: 'Encode and decode', blurb: 'URL encoding, Base64, JWTs and string escaping.',
        tools: ['base64', 'url-encoder', 'jwt-decoder', 'string-escaper'] },
      { id: 'generate', title: 'Generate', blurb: 'IDs, hashes, TypeScript types, mock data and fetch code.',
        tools: ['uuid-generator', 'hash-generator', 'json-to-types', 'mock-json', 'curl-to-code'] },
      { id: 'test', title: 'Test and preview', blurb: 'Diff text, query JSON, read cron schedules, preview Markdown.',
        tools: ['diff-checker', 'jsonpath-tester', 'cron-parser', 'markdown-preview'] },
      { id: 'reference', title: 'Convert and look up', blurb: 'HTML to Markdown, .env to JSON and HTTP status codes.',
        tools: ['html-markdown', 'env-json', 'http-status-codes'] },
    ],
    related: ['regex-tester', 'json-to-yaml', 'yaml-to-json', 'xml-to-json', 'json-to-xml', 'csv-to-json', 'timestamp-converter'],
  },

  text: {
    groups: [
      { id: 'clean', title: 'Clean up text', blurb: 'Tidy spacing, drop duplicates and empty lines, sort, replace.',
        tools: ['text-cleaner', 'remove-duplicates-text', 'remove-empty-lines', 'sort-lines', 'find-replace'] },
      { id: 'transform', title: 'Transform and generate', blurb: 'Change case, reverse, make slugs and placeholder text.',
        tools: ['case-converter', 'slug-generator', 'reverse-text', 'lorem-ipsum'] },
      { id: 'extract', title: 'Extract and match', blurb: 'Pull emails, links, numbers and hashtags, or test a pattern.',
        tools: ['extract-emails', 'extract-urls', 'extract-phones', 'extract-hashtags', 'regex-tester'] },
      { id: 'analyse', title: 'Count and compare', blurb: 'Word and character counts, and what changed between versions.',
        tools: ['word-counter', 'diff-text'] },
    ],
    related: ['markdown-preview', 'text-to-pdf', 'docx-to-txt', 'ocr-image'],
  },

  security: {
    groups: [
      { id: 'passwords', title: 'Passwords and secrets', blurb: 'Generate strong passwords and passphrases, and test them.',
        tools: ['password-generator', 'passphrase-gen', 'password-strength', 'random-string'] },
      { id: 'files', title: 'Files and notes', blurb: 'Verify a download and keep notes encrypted in this browser.',
        tools: ['file-checksum', 'secure-notes'] },
    ],
    related: ['hash-generator', 'jwt-decoder', 'uuid-generator', 'pdf-redact', 'image-metadata'],
  },

  color: {
    groups: [
      { id: 'values', title: 'Colour values', blurb: 'Convert formats, build palettes and check contrast.',
        tools: ['color-converter', 'palette-color', 'contrast-checker'] },
      { id: 'css', title: 'CSS effects', blurb: 'Gradients and frosted-glass panels, with copyable CSS.',
        tools: ['gradient-generator', 'glassmorphism'] },
    ],
    related: ['css-formatter', 'svg-converter', 'image-adjust'],
  },

  utility: {
    groups: [
      { id: 'money', title: 'Money', blurb: 'Loan EMIs, GST and percentages.',
        tools: ['emi-calculator', 'gst-calculator', 'percentage-calc'] },
      { id: 'time', title: 'Units and time', blurb: 'Measurement units, time zones and Unix timestamps.',
        tools: ['unit-converter', 'timezone-converter', 'timestamp-converter'] },
      { id: 'everyday', title: 'Everyday maths', blurb: 'A full scientific calculator, age and BMI.',
        tools: ['scientific-calc', 'age-calculator', 'bmi-calculator'] },
      { id: 'numbers', title: 'Numbers and words', blurb: 'Write numbers out in words, or as Roman numerals.',
        tools: ['number-to-words', 'roman-numerals'] },
    ],
    related: ['cron-parser', 'word-counter'],
  },

  web: {
    groups: [
      { id: 'inspect', title: 'URLs and browsers', blurb: 'Break down URLs, user agents and file types.',
        tools: ['url-parser', 'user-agent-parser', 'mime-checker'] },
      { id: 'encoding', title: 'Characters and encoding', blurb: 'HTML entities, Unicode, ASCII and binary.',
        tools: ['html-entity', 'unicode-converter', 'ascii-converter', 'binary-converter'] },
    ],
    related: ['url-encoder', 'base64', 'string-escaper', 'http-status-codes'],
  },
};

/** What a tool opens: its own override, else its group's, else nothing. */
export function acceptsOf(hub: CategoryHub, toolId: string): Accepts {
  const own = hub.toolAccepts?.[toolId];
  if (own) return own;
  return hub.groups.find(g => g.tools.includes(toolId))?.accepts ?? [];
}

/** Whether a tool in this hub can open a file of this kind and extension. */
export function toolAccepts(hub: CategoryHub, toolId: string, kind: FormatKind, ext: string): boolean {
  const a = acceptsOf(hub, toolId);
  if (a !== 'any' && !a.includes(kind)) return false;
  const exts = hub.toolExts?.[toolId] ?? hub.groups.find(g => g.tools.includes(toolId))?.exts;
  return !exts || exts.includes(ext);
}

/**
 * Every tool in a hub category must be listed exactly once and every id must
 * exist, or a tool silently disappears from its landing page. Returns the
 * problems found, empty when the config is consistent.
 */
export function validateCategoryHubs(): string[] {
  const ids = new Set(TOOLS.map(t => t.id));
  const problems: string[] = [];
  for (const [cat, hub] of Object.entries(CATEGORY_HUBS)) {
    if (!hub) continue;
    const listed = hub.groups.flatMap(g => g.tools);
    const seen = new Set<string>();
    for (const id of listed) {
      if (!ids.has(id)) problems.push(`${cat}: unknown tool ${id}`);
      if (seen.has(id)) problems.push(`${cat}: ${id} listed twice`);
      seen.add(id);
    }
    for (const t of TOOLS.filter(t => t.category === cat)) {
      if (!seen.has(t.id)) problems.push(`${cat}: ${t.id} is in no group`);
    }
    for (const id of hub.related ?? []) if (!ids.has(id)) problems.push(`${cat}: unknown related tool ${id}`);
  }
  return problems;
}
