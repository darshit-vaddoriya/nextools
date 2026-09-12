/**
 * FORMAT REGISTRY
 *
 * One recognisable identity per file format: icon, short label, and a
 * semantic tint. Used by the drop zone, file lists, job history and tool
 * cards so a PDF looks like a PDF everywhere in the product.
 *
 * Tints are Tailwind classes bound to design tokens, never raw hex.
 */
import {
  FileText, FileSpreadsheet, FileImage, FileVideo, FileAudio,
  FileArchive, FileCode, FileJson, Presentation, File as FileIcon,
  type LucideIcon,
} from 'lucide-react';

export type FormatKind =
  | 'pdf' | 'document' | 'spreadsheet' | 'presentation'
  | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'text' | 'unknown';

export interface FormatMeta {
  /** Uppercase short label, e.g. "PDF", "JPG". */
  label: string;
  kind: FormatKind;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip, token-bound, theme-aware. */
  tint: string;
}

/** Visual identity per kind. One tint per family keeps the grid legible. */
const KIND_STYLE: Record<FormatKind, { icon: LucideIcon; tint: string }> = {
  pdf:          { icon: FileText,        tint: 'bg-danger/10 text-danger' },
  document:     { icon: FileText,        tint: 'bg-primary/10 text-primary' },
  spreadsheet:  { icon: FileSpreadsheet, tint: 'bg-success/10 text-success' },
  presentation: { icon: Presentation,    tint: 'bg-warning/10 text-warning' },
  image:        { icon: FileImage,       tint: 'bg-secondary/10 text-secondary' },
  video:        { icon: FileVideo,       tint: 'bg-tertiary/10 text-tertiary' },
  audio:        { icon: FileAudio,       tint: 'bg-tertiary/10 text-tertiary' },
  archive:      { icon: FileArchive,     tint: 'bg-warning/10 text-warning' },
  code:         { icon: FileCode,        tint: 'bg-primary/10 text-primary' },
  text:         { icon: FileText,        tint: 'bg-muted text-muted-foreground' },
  unknown:      { icon: FileIcon,        tint: 'bg-muted text-muted-foreground' },
};

/** extension → kind. Extend here when a new format gains tool support. */
const EXT_KIND: Record<string, FormatKind> = {
  pdf: 'pdf',

  doc: 'document', docx: 'document', odt: 'document', rtf: 'document', pages: 'document',
  xls: 'spreadsheet', xlsx: 'spreadsheet', ods: 'spreadsheet', csv: 'spreadsheet', tsv: 'spreadsheet',
  ppt: 'presentation', pptx: 'presentation', odp: 'presentation', key: 'presentation',

  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', avif: 'image',
  svg: 'image', bmp: 'image', ico: 'image', tiff: 'image', tif: 'image', heic: 'image', heif: 'image',

  mp4: 'video', webm: 'video', mkv: 'video', avi: 'video', mov: 'video', wmv: 'video', flv: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio', m4a: 'audio', opus: 'audio',

  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive', bz2: 'archive',

  json: 'code', js: 'code', ts: 'code', tsx: 'code', jsx: 'code', html: 'code', css: 'code',
  xml: 'code', yaml: 'code', yml: 'code', py: 'code', sql: 'code', sh: 'code',

  txt: 'text', md: 'text', log: 'text',
};

/** JSON gets its own glyph, it's the most-used format in the dev tools. */
const EXT_ICON_OVERRIDE: Record<string, LucideIcon> = { json: FileJson };

/** Pull a lowercase extension off a filename. Returns '' if there is none. */
export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot < 1 || dot === filename.length - 1) return '';
  return filename.slice(dot + 1).toLowerCase();
}

/** Resolve the visual identity for a filename or bare extension. */
export function formatOf(filenameOrExt: string): FormatMeta {
  const ext = filenameOrExt.includes('.')
    ? extensionOf(filenameOrExt)
    : filenameOrExt.toLowerCase().replace(/^\./, '');

  const kind = EXT_KIND[ext] ?? 'unknown';
  const style = KIND_STYLE[kind];

  return {
    label: ext ? ext.toUpperCase() : 'FILE',
    kind,
    icon: EXT_ICON_OVERRIDE[ext] ?? style.icon,
    tint: style.tint,
  };
}

/** Which tool categories can act on a given file kind. Powers the hero
 *  drop zone: drop a file, see only the tools that accept it. */
export const KIND_TO_CATEGORIES: Record<FormatKind, string[]> = {
  pdf:          ['pdf'],
  document:     ['word', 'pdf'],
  spreadsheet:  ['excel', 'csv'],
  presentation: ['powerpoint'],
  image:        ['image', 'pdf'],
  video:        ['video'],
  audio:        ['audio'],
  archive:      ['archive'],
  code:         ['dev', 'text'],
  text:         ['text', 'dev'],
  unknown:      [],
};

/** Human-readable size. Binary units, one decimal above KB. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'unknown size';
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit += 1; }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}
