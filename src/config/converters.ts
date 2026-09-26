/**
 * FILE CONVERTER REGISTRY
 *
 * Which formats the converter engine reads, which it can write, and which
 * tool pages are a fixed pair (PNG → JPG) rather than the open-ended
 * converter. Kept free of any library import on purpose: the homepage drop
 * zone and the tool config read it, and neither may pull in a decoder.
 *
 * Every conversion listed here runs in the browser. A format appears as a
 * target only when it can be produced reliably in the browser — which is why
 * HEIC, RAR and 7z are readable but not writable.
 */

export type ConvFormat =
  // images
  | 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'bmp' | 'tiff' | 'ico' | 'heic' | 'svg' | 'psd' | 'raw'
  // audio
  | 'mp3' | 'wav' | 'm4a' | 'aac' | 'ogg' | 'opus' | 'flac'
  // video
  | 'mp4' | 'webm' | 'mov' | 'mkv'
  // spreadsheets and structured data
  | 'xlsx' | 'xls' | 'ods' | 'csv' | 'tsv' | 'json' | 'xml' | 'yaml'
  // documents
  | 'pdf' | 'ai' | 'epub' | 'pptx' | 'docx' | 'rtf' | 'md' | 'txt' | 'html'
  // subtitles and database scripts
  | 'srt' | 'vtt' | 'sql'
  // fonts
  | 'ttf' | 'otf' | 'woff' | 'woff2'
  // archives
  | 'zip' | '7z' | 'rar' | 'tar' | 'tgz' | 'tbz' | 'txz';

export type ConvGroup = 'image' | 'audio' | 'video' | 'sheet' | 'data' | 'pdf' | 'doc' | 'font' | 'archive' | 'subtitle';

export interface ConvFormatInfo {
  label: string;
  /** Long name for option lists. */
  name: string;
  exts: string[];
  mime: string;
  group: ConvGroup;
  /** Produced but never read here (PPTX, TXT, HTML): skipped by format detection. */
  outputOnly?: boolean;
}

export const CONV_FORMATS: Record<ConvFormat, ConvFormatInfo> = {
  jpg:  { label: 'JPG',  name: 'JPG image',              exts: ['jpg', 'jpeg', 'jfif'], mime: 'image/jpeg',    group: 'image' },
  png:  { label: 'PNG',  name: 'PNG image',              exts: ['png'],                 mime: 'image/png',     group: 'image' },
  webp: { label: 'WEBP', name: 'WebP image',             exts: ['webp'],                mime: 'image/webp',    group: 'image' },
  avif: { label: 'AVIF', name: 'AVIF image',             exts: ['avif'],                mime: 'image/avif',    group: 'image' },
  gif:  { label: 'GIF',  name: 'GIF image',              exts: ['gif'],                 mime: 'image/gif',     group: 'image' },
  bmp:  { label: 'BMP',  name: 'Bitmap image',           exts: ['bmp', 'dib'],          mime: 'image/bmp',     group: 'image' },
  tiff: { label: 'TIFF', name: 'TIFF image',             exts: ['tif', 'tiff'],         mime: 'image/tiff',    group: 'image' },
  ico:  { label: 'ICO',  name: 'Windows icon',           exts: ['ico'],                 mime: 'image/x-icon',  group: 'image' },
  heic: { label: 'HEIC', name: 'HEIC photo (iPhone)',    exts: ['heic', 'heif'],        mime: 'image/heic',    group: 'image' },
  svg:  { label: 'SVG',  name: 'SVG vector',             exts: ['svg'],                 mime: 'image/svg+xml', group: 'image' },
  psd:  { label: 'PSD',  name: 'Photoshop document',     exts: ['psd', 'psb'],          mime: 'image/vnd.adobe.photoshop', group: 'image' },
  raw:  { label: 'RAW',  name: 'Camera RAW photo',       exts: ['dng', 'nef', 'nrw', 'cr2', 'cr3', 'arw', 'srf', 'sr2', 'orf', 'rw2', 'raf', 'pef', 'srw', 'erf', 'kdc', 'mrw', 'x3f'], mime: 'image/x-raw', group: 'image' },

  mp3:  { label: 'MP3',  name: 'MP3 audio',              exts: ['mp3'],                 mime: 'audio/mpeg',    group: 'audio' },
  wav:  { label: 'WAV',  name: 'WAV audio (PCM)',        exts: ['wav', 'wave'],         mime: 'audio/wav',     group: 'audio' },
  m4a:  { label: 'M4A',  name: 'M4A audio (AAC)',        exts: ['m4a'],                 mime: 'audio/mp4',     group: 'audio' },
  aac:  { label: 'AAC',  name: 'AAC audio',              exts: ['aac'],                 mime: 'audio/aac',     group: 'audio' },
  ogg:  { label: 'OGG',  name: 'OGG audio (Opus)',       exts: ['ogg', 'oga'],          mime: 'audio/ogg',     group: 'audio' },
  opus: { label: 'OPUS', name: 'Opus audio',             exts: ['opus', 'weba'],        mime: 'audio/opus',    group: 'audio' },
  flac: { label: 'FLAC', name: 'FLAC audio',             exts: ['flac'],                mime: 'audio/flac',    group: 'audio' },

  mp4:  { label: 'MP4',  name: 'MP4 video',              exts: ['mp4', 'm4v'],          mime: 'video/mp4',     group: 'video' },
  webm: { label: 'WEBM', name: 'WebM video',             exts: ['webm'],                mime: 'video/webm',    group: 'video' },
  mov:  { label: 'MOV',  name: 'QuickTime video',        exts: ['mov', 'qt'],           mime: 'video/quicktime', group: 'video' },
  mkv:  { label: 'MKV',  name: 'Matroska video',         exts: ['mkv'],                 mime: 'video/x-matroska', group: 'video' },

  xlsx: { label: 'XLSX', name: 'Excel workbook',         exts: ['xlsx', 'xlsm'],        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', group: 'sheet' },
  xls:  { label: 'XLS',  name: 'Excel 97–2003 workbook', exts: ['xls'],                 mime: 'application/vnd.ms-excel', group: 'sheet' },
  ods:  { label: 'ODS',  name: 'OpenDocument spreadsheet', exts: ['ods'],               mime: 'application/vnd.oasis.opendocument.spreadsheet', group: 'sheet' },
  csv:  { label: 'CSV',  name: 'CSV (comma separated)',  exts: ['csv'],                 mime: 'text/csv',      group: 'sheet' },
  tsv:  { label: 'TSV',  name: 'TSV (tab separated)',    exts: ['tsv', 'tab'],          mime: 'text/tab-separated-values', group: 'sheet' },
  json: { label: 'JSON', name: 'JSON data',              exts: ['json'],                mime: 'application/json', group: 'data' },
  xml:  { label: 'XML',  name: 'XML data',               exts: ['xml'],                 mime: 'application/xml', group: 'data' },
  yaml: { label: 'YAML', name: 'YAML data',              exts: ['yaml', 'yml'],         mime: 'application/yaml', group: 'data' },

  pdf:  { label: 'PDF',  name: 'PDF document',           exts: ['pdf'],                 mime: 'application/pdf', group: 'pdf' },
  epub: { label: 'EPUB', name: 'EPUB e-book',            exts: ['epub'],                mime: 'application/epub+zip', group: 'doc' },
  ai:   { label: 'AI',   name: 'Adobe Illustrator file', exts: ['ai'],                  mime: 'application/illustrator', group: 'pdf' },
  pptx: { label: 'PPTX', name: 'PowerPoint deck',        exts: ['pptx'],                mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', group: 'doc', outputOnly: true },
  docx: { label: 'DOCX', name: 'Word document',          exts: ['docx'],                mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', group: 'doc', outputOnly: true },
  rtf:  { label: 'RTF',  name: 'Rich Text document',     exts: ['rtf'],                 mime: 'application/rtf', group: 'doc' },
  md:   { label: 'MD',   name: 'Markdown',               exts: ['md', 'markdown'],      mime: 'text/markdown', group: 'doc' },
  txt:  { label: 'TXT',  name: 'Plain text',             exts: ['txt'],                 mime: 'text/plain',    group: 'doc' },
  html: { label: 'HTML', name: 'HTML page',              exts: ['html', 'htm', 'xhtml'], mime: 'text/html',    group: 'doc' },

  srt:  { label: 'SRT',  name: 'SubRip subtitles',       exts: ['srt'],                 mime: 'application/x-subrip', group: 'subtitle' },
  vtt:  { label: 'VTT',  name: 'WebVTT subtitles',       exts: ['vtt'],                 mime: 'text/vtt',      group: 'subtitle' },
  sql:  { label: 'SQL',  name: 'SQL script',             exts: ['sql'],                 mime: 'application/sql', group: 'data', outputOnly: true },

  ttf:  { label: 'TTF',  name: 'TrueType font',          exts: ['ttf'],                 mime: 'font/ttf',      group: 'font' },
  otf:  { label: 'OTF',  name: 'OpenType font',          exts: ['otf'],                 mime: 'font/otf',      group: 'font' },
  woff: { label: 'WOFF', name: 'WOFF web font',          exts: ['woff'],                mime: 'font/woff',     group: 'font' },
  woff2:{ label: 'WOFF2',name: 'WOFF2 web font',         exts: ['woff2'],               mime: 'font/woff2',    group: 'font' },

  zip:  { label: 'ZIP',  name: 'ZIP archive',            exts: ['zip'],                 mime: 'application/zip', group: 'archive' },
  '7z': { label: '7Z',   name: '7-Zip archive',          exts: ['7z'],                  mime: 'application/x-7z-compressed', group: 'archive' },
  rar:  { label: 'RAR',  name: 'RAR archive',            exts: ['rar'],                 mime: 'application/vnd.rar', group: 'archive' },
  tar:  { label: 'TAR',  name: 'TAR archive',            exts: ['tar'],                 mime: 'application/x-tar', group: 'archive' },
  tgz:  { label: 'TAR.GZ', name: 'Gzipped TAR',          exts: ['tgz', 'gz'],           mime: 'application/gzip', group: 'archive' },
  tbz:  { label: 'TAR.BZ2', name: 'Bzip2 TAR',           exts: ['tbz2', 'tbz', 'bz2'],  mime: 'application/x-bzip2', group: 'archive' },
  txz:  { label: 'TAR.XZ', name: 'XZ TAR',               exts: ['txz', 'xz'],           mime: 'application/x-xz', group: 'archive' },
};

/** Output file extension; `tgz` is written as the more familiar .tar.gz. */
export function outputExt(format: ConvFormat): string {
  if (format === 'tgz') return 'tar.gz';
  return CONV_FORMATS[format].exts[0];
}

const IMAGE_TARGETS: ConvFormat[] = ['jpg', 'png', 'webp', 'avif', 'svg', 'gif', 'bmp', 'tiff', 'ico', 'pdf', 'pptx'];
const AUDIO_TARGETS: ConvFormat[] = ['mp3', 'wav', 'flac', 'ogg', 'm4a'];
const VIDEO_TARGETS: ConvFormat[] = ['mp4', 'webm', 'mov', 'mkv', 'mp3', 'wav', 'flac', 'ogg', 'm4a', 'gif'];
const ARCHIVE_TARGETS: ConvFormat[] = ['zip', 'tgz', 'tar'];

/** What a given input format can be converted into, best choices first. */
export function targetsFor(from: ConvFormat): ConvFormat[] {
  const info = CONV_FORMATS[from];
  if (info.outputOnly) return [];
  let list: ConvFormat[];
  switch (info.group) {
    case 'image':   list = from === 'gif' ? ['mp4', 'webm', ...IMAGE_TARGETS] : IMAGE_TARGETS; break;
    case 'audio':   list = AUDIO_TARGETS; break;
    case 'video':   list = VIDEO_TARGETS; break;
    case 'pdf':     list = from === 'ai' ? ['pdf', 'png', 'jpg', 'pptx'] : ['xlsx', 'csv', 'pptx', 'jpg', 'png']; break;
    case 'doc':     list = from === 'epub' ? ['pdf', 'txt', 'html'] : from === 'rtf' ? ['docx', 'txt', 'html'] : ['epub']; break;
    case 'subtitle': list = from === 'srt' ? ['vtt'] : ['srt']; break;
    case 'font':    list = from === 'woff2' ? ['ttf', 'woff'] : from === 'woff' ? ['woff2', 'ttf'] : ['woff2', 'woff']; break;
    case 'archive': list = ARCHIVE_TARGETS; break;
    case 'data':    list = from === 'json' ? ['xlsx', 'csv', 'xml', 'yaml'] : ['json', from === 'xml' ? 'yaml' : 'xml']; break;
    default:
      // Spreadsheets: xlsx, xls, ods, csv, tsv.
      list = from === 'csv' || from === 'tsv'
        ? ['xlsx', 'json', from === 'csv' ? 'tsv' : 'csv', 'sql', 'html', 'xml', 'pdf']
        : ['xlsx', 'csv', 'json', 'tsv', 'pdf'];
  }
  return list.filter((f) => f !== from);
}

const EXT_TO_FORMAT: Record<string, ConvFormat> = Object.fromEntries(
  (Object.keys(CONV_FORMATS) as ConvFormat[])
    .filter((f) => !CONV_FORMATS[f].outputOnly)
    .flatMap((f) => CONV_FORMATS[f].exts.map((e) => [e, f])),
);

/** Resolve a file to a converter format by extension, then by MIME type. */
export function detectFormat(file: { name: string; type?: string }): ConvFormat | null {
  const lower = file.name.toLowerCase();
  // Two-part extensions first, so "site.tar.gz" is a TAR, not a lone GZ.
  if (/\.tar\.gz$/.test(lower)) return 'tgz';
  if (/\.tar\.bz2$/.test(lower)) return 'tbz';
  if (/\.tar\.xz$/.test(lower)) return 'txz';
  const dot = lower.lastIndexOf('.');
  const ext = dot > 0 ? lower.slice(dot + 1) : '';
  if (EXT_TO_FORMAT[ext]) return EXT_TO_FORMAT[ext];
  const mime = (file.type ?? '').toLowerCase();
  if (!mime) return null;
  const hit = (Object.keys(CONV_FORMATS) as ConvFormat[])
    .find((f) => !CONV_FORMATS[f].outputOnly && CONV_FORMATS[f].mime === mime);
  if (hit) return hit;
  if (mime === 'image/jpg') return 'jpg';
  if (mime === 'audio/x-wav' || mime === 'audio/wave') return 'wav';
  if (mime === 'audio/x-m4a') return 'm4a';
  if (mime === 'text/xml') return 'xml';
  return null;
}

/** `accept` attribute for a set of input formats. */
export function acceptFor(formats: ConvFormat[]): string {
  return formats
    .flatMap((f) => [CONV_FORMATS[f].mime, ...CONV_FORMATS[f].exts.map((e) => `.${e}`)])
    .join(',');
}

export const ALL_INPUT_FORMATS = (Object.keys(CONV_FORMATS) as ConvFormat[]).filter((f) => !CONV_FORMATS[f].outputOnly);
const AUDIO_INPUTS: ConvFormat[] = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'flac', 'mp4', 'webm', 'mov', 'mkv'];
const VIDEO_INPUTS: ConvFormat[] = ['mp4', 'mov', 'webm', 'mkv'];
const IMAGE_INPUTS: ConvFormat[] = ['jpg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'heic', 'svg', 'psd', 'raw'];

export interface ConverterToolSpec {
  /** Formats the page accepts. The engine reads any of them. */
  inputs: ConvFormat[];
  /** Fixed target for a pair page; a list shows a picker; omitted means "whatever the input allows". */
  targets?: ConvFormat[];
  /** All files go into one output (images → one PowerPoint deck) instead of one output each. */
  combine?: boolean;
}

/**
 * The tool pages driven by the shared converter. A pair page accepts the
 * rest of its family too, so dropping a JPG on "PNG to JPG" still works
 * instead of failing on a technicality — the heading just says what the
 * page is best at.
 */
export const CONVERTER_TOOLS: Record<string, ConverterToolSpec> = {
  'file-converter':  { inputs: ALL_INPUT_FORMATS },

  'png-to-jpg':      { inputs: ['png', 'webp', 'bmp', 'gif', 'tiff', 'avif', 'svg', 'ico'], targets: ['jpg'] },
  'jpg-to-png':      { inputs: ['jpg', 'webp', 'bmp', 'gif', 'tiff', 'avif'],               targets: ['png'] },
  'webp-to-jpg':     { inputs: ['webp', 'avif', 'png', 'gif'],                              targets: ['jpg'] },
  'webp-to-png':     { inputs: ['webp', 'avif', 'jpg', 'gif'],                              targets: ['png'] },
  'jpg-to-webp':     { inputs: ['jpg', 'png', 'bmp', 'tiff'],                               targets: ['webp'] },
  'png-to-webp':     { inputs: ['png', 'jpg', 'gif', 'bmp'],                                targets: ['webp'] },
  'heic-to-jpg':     { inputs: ['heic'],                                                    targets: ['jpg', 'png'] },
  'avif-to-jpg':     { inputs: ['avif', 'webp'],                                            targets: ['jpg', 'png'] },
  'tiff-to-jpg':     { inputs: ['tiff'],                                                    targets: ['jpg', 'png', 'pdf'] },
  'psd-to-png':      { inputs: ['psd'],                                                     targets: ['png', 'jpg', 'webp'] },
  'raw-to-jpg':      { inputs: ['raw'],                                                     targets: ['jpg', 'png', 'tiff'] },
  'svg-to-pdf':      { inputs: ['svg'],                                                     targets: ['pdf'] },
  'jpg-to-avif':     { inputs: ['jpg', 'png', 'webp', 'bmp', 'tiff', 'heic'],               targets: ['avif'] },
  'png-to-svg':      { inputs: ['png', 'jpg', 'webp', 'bmp', 'gif'],                        targets: ['svg'] },
  'tiff-to-pdf':     { inputs: ['tiff'],                                                    targets: ['pdf'] },
  'ai-to-pdf':       { inputs: ['ai'],                                                      targets: ['pdf', 'png', 'jpg'] },

  'audio-converter': { inputs: AUDIO_INPUTS, targets: ['mp3', 'wav', 'flac', 'ogg', 'm4a'] },
  'wav-to-flac':     { inputs: ['wav', 'mp3', 'm4a', 'aac', 'ogg', 'opus', 'mp4', 'mov', 'webm'], targets: ['flac'] },
  'mp4-to-mp3':      { inputs: ['mp4', 'mov', 'webm', 'mkv', 'm4a'], targets: ['mp3'] },
  'wav-to-mp3':      { inputs: ['wav', 'flac', 'ogg', 'opus'],       targets: ['mp3'] },
  'mp3-to-wav':      { inputs: ['mp3', 'm4a', 'aac', 'ogg', 'opus', 'flac'], targets: ['wav'] },
  'm4a-to-mp3':      { inputs: ['m4a', 'aac', 'mp4'],                targets: ['mp3'] },
  'video-to-gif':    { inputs: VIDEO_INPUTS,                          targets: ['gif'] },
  'video-converter': { inputs: VIDEO_INPUTS,                          targets: ['mp4', 'webm', 'mov', 'mkv'] },
  'video-compressor':{ inputs: VIDEO_INPUTS,                          targets: ['mp4', 'webm'] },
  'mov-to-mp4':      { inputs: ['mov', 'mkv'],                        targets: ['mp4'] },
  'webm-to-mp4':     { inputs: ['webm', 'mkv'],                       targets: ['mp4'] },
  'gif-to-mp4':      { inputs: ['gif'],                               targets: ['mp4', 'webm'] },

  'excel-to-csv':    { inputs: ['xlsx', 'xls', 'ods'], targets: ['csv', 'tsv'] },
  'csv-to-excel':    { inputs: ['csv', 'tsv'],  targets: ['xlsx'] },
  'excel-to-json':   { inputs: ['xlsx', 'xls', 'ods'], targets: ['json'] },
  'json-to-excel':   { inputs: ['json'],        targets: ['xlsx'] },
  'pdf-to-excel':    { inputs: ['pdf'],         targets: ['xlsx', 'csv'] },
  'excel-to-pdf':    { inputs: ['xlsx', 'xls', 'ods', 'csv', 'tsv'], targets: ['pdf'] },
  'xls-to-xlsx':     { inputs: ['xls'],         targets: ['xlsx', 'csv'] },
  'ods-to-xlsx':     { inputs: ['ods'],         targets: ['xlsx', 'csv'] },
  'xml-to-json':     { inputs: ['xml'],         targets: ['json', 'yaml'] },
  'json-to-xml':     { inputs: ['json'],        targets: ['xml'] },
  'yaml-to-json':    { inputs: ['yaml'],        targets: ['json', 'xml'] },
  'json-to-yaml':    { inputs: ['json'],        targets: ['yaml'] },
  'csv-to-sql':      { inputs: ['csv', 'tsv', 'xlsx', 'xls', 'ods'], targets: ['sql', 'html'] },

  'images-to-pptx':  { inputs: IMAGE_INPUTS,    targets: ['pptx'], combine: true },
  'pdf-to-pptx':     { inputs: ['pdf'],         targets: ['pptx'] },
  'epub-to-pdf':     { inputs: ['epub'],        targets: ['pdf', 'txt', 'html'] },
  'markdown-to-epub':{ inputs: ['md', 'txt', 'html'], targets: ['epub'] },
  'rtf-to-docx':     { inputs: ['rtf'],         targets: ['docx', 'txt', 'html'] },

  'srt-to-vtt':      { inputs: ['srt'],         targets: ['vtt'] },
  'vtt-to-srt':      { inputs: ['vtt'],         targets: ['srt'] },

  'font-converter':  { inputs: ['ttf', 'otf', 'woff', 'woff2'], targets: ['woff2', 'woff', 'ttf'] },
  'ttf-to-woff2':    { inputs: ['ttf', 'otf', 'woff'], targets: ['woff2', 'woff'] },
  'woff2-to-ttf':    { inputs: ['woff2', 'woff'],      targets: ['ttf'] },

  'rar-to-zip':      { inputs: ['rar'],                targets: ['zip'] },
  '7z-to-zip':       { inputs: ['7z'],                 targets: ['zip'] },
  'tar-to-zip':      { inputs: ['tar', 'tgz', 'tbz', 'txz'], targets: ['zip'] },
  'zip-to-tar':      { inputs: ['zip', '7z', 'rar'],   targets: ['tgz', 'tar'] },
};

/** Tools a dropped file of this extension can go to, for the homepage router. */
export function converterToolsAccepting(file: { name: string; type?: string }): string[] {
  const format = detectFormat(file);
  if (!format) return [];
  return Object.entries(CONVERTER_TOOLS)
    .filter(([, spec]) => spec.inputs.includes(format))
    .map(([id]) => id);
}

export interface ConverterGroup {
  id: 'image' | 'media' | 'data' | 'doc' | 'font' | 'archive';
  title: string;
  blurb: string;
  tools: string[];
  reads: ConvFormat[];
  writes: ConvFormat[];
}

/** How the converter category page groups its tools. */
export const CONVERTER_GROUPS: ConverterGroup[] = [
  {
    id: 'image',
    title: 'Image converters',
    blurb: 'Photos, screenshots, Photoshop and camera RAW files, with quality, resize and transparency controls.',
    tools: ['png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'webp-to-png', 'jpg-to-webp', 'png-to-webp', 'jpg-to-avif', 'heic-to-jpg', 'avif-to-jpg', 'tiff-to-jpg', 'tiff-to-pdf', 'psd-to-png', 'raw-to-jpg', 'ai-to-pdf', 'svg-to-pdf', 'png-to-svg'],
    reads: ['jpg', 'png', 'webp', 'avif', 'heic', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'psd', 'raw', 'ai'],
    writes: ['jpg', 'png', 'webp', 'avif', 'svg', 'gif', 'bmp', 'tiff', 'ico', 'pdf', 'pptx'],
  },
  {
    id: 'media',
    title: 'Video, audio & subtitle converters',
    blurb: 'Change video formats, shrink videos, extract soundtracks, make GIFs and convert subtitles, using your device\'s video encoder.',
    tools: ['video-converter', 'video-compressor', 'mov-to-mp4', 'webm-to-mp4', 'gif-to-mp4', 'video-to-gif', 'audio-converter', 'mp4-to-mp3', 'wav-to-mp3', 'mp3-to-wav', 'm4a-to-mp3', 'wav-to-flac', 'srt-to-vtt', 'vtt-to-srt'],
    reads: ['mp4', 'mov', 'webm', 'mkv', 'gif', 'mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus', 'srt', 'vtt'],
    writes: ['mp4', 'webm', 'mov', 'mkv', 'gif', 'mp3', 'wav', 'flac', 'ogg', 'm4a', 'srt', 'vtt'],
  },
  {
    id: 'data',
    title: 'Spreadsheet & data converters',
    blurb: 'Move tables between Excel, OpenDocument, CSV, JSON, XML and YAML, or pull them out of PDFs.',
    tools: ['excel-to-csv', 'csv-to-excel', 'excel-to-json', 'json-to-excel', 'excel-to-pdf', 'xls-to-xlsx', 'ods-to-xlsx', 'pdf-to-excel', 'csv-to-sql', 'xml-to-json', 'json-to-xml', 'yaml-to-json', 'json-to-yaml'],
    reads: ['xlsx', 'xls', 'ods', 'csv', 'tsv', 'json', 'xml', 'yaml', 'pdf'],
    writes: ['xlsx', 'csv', 'tsv', 'json', 'xml', 'yaml', 'sql', 'html', 'pdf'],
  },
  {
    id: 'doc',
    title: 'Document & presentation converters',
    blurb: 'Build PowerPoint decks, make and read e-books, and open old RTF documents in Word.',
    tools: ['images-to-pptx', 'pdf-to-pptx', 'epub-to-pdf', 'markdown-to-epub', 'rtf-to-docx'],
    reads: ['jpg', 'png', 'webp', 'pdf', 'epub', 'md', 'txt', 'html', 'rtf'],
    writes: ['pptx', 'pdf', 'epub', 'docx', 'txt', 'html'],
  },
  {
    id: 'font',
    title: 'Font converters',
    blurb: 'Compress desktop fonts into web fonts, or unpack web fonts back to TTF.',
    tools: ['font-converter', 'ttf-to-woff2', 'woff2-to-ttf'],
    reads: ['ttf', 'otf', 'woff', 'woff2'],
    writes: ['woff2', 'woff', 'ttf', 'otf'],
  },
  {
    id: 'archive',
    title: 'Archive converters',
    blurb: 'Repack RAR, 7-Zip and TAR archives as ZIP, or the other way round.',
    tools: ['rar-to-zip', '7z-to-zip', 'tar-to-zip', 'zip-to-tar'],
    reads: ['zip', 'rar', '7z', 'tar', 'tgz', 'tbz', 'txz'],
    writes: ['zip', 'tar', 'tgz'],
  },
];
