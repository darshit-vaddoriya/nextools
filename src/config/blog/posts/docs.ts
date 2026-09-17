import { BlogPost } from '../types';

export const DOCS_POSTS: BlogPost[] = [
  {
    slug: 'word-to-pdf-and-back',
    title: 'Word to PDF and back: what survives the round trip',
    description: 'Going from DOCX to PDF is a one-way conversion dressed up as a save. Here is what changes, and why the return journey never gives you the original back.',
    excerpt: 'A PDF made from a Word file has no paragraphs, no styles and no reading order, only glyphs at coordinates. That single fact explains every frustration with converting one back.',
    category: 'docs',
    tags: ['word', 'docx', 'pdf', 'conversion'],
    takeaways: [
      'DOCX describes structure; PDF describes appearance. Converting one way is rendering, converting back is guesswork.',
      'Export to PDF from Word rather than printing to PDF. Only the export route writes the tag tree a converter needs.',
      'If you cannot select text in the PDF with your cursor, it is a scan and no converter can recover words without OCR first.',
      'Keep the DOCX. Almost every painful conversion starts with the source having been thrown away.',
    ],
    published: '2026-09-09',
    relatedTools: ['docx-to-pdf', 'pdf-to-word', 'docx-to-markdown', 'word-remove-format'],
    words: 1059,
  },

  {
    slug: 'open-a-docx-without-word',
    title: 'Opening a DOCX without Word, and what is hiding inside it',
    description: 'A .docx is a zip file full of XML. That explains how any browser can read one, and why documents leak author names and edit history.',
    excerpt: 'Rename a .docx to .zip and open it. Everything Word knows about your document is sitting there in plain XML, including who wrote it and how long they took.',
    category: 'docs',
    tags: ['docx', 'word', 'metadata'],
    published: '2026-09-11',
    relatedTools: ['word-viewer', 'docx-to-txt', 'docx-to-html', 'word-metadata'],
    takeaways: [
      'A .docx is an ordinary zip archive. Rename it to .zip and you can read the XML inside with no Office licence.',
      'docProps/core.xml carries the author, last editor, revision count and total editing time, and it travels with every copy you send.',
      'Deleted text survives in the file if tracked changes were never accepted, so deleting and saving is not removal.',
      'Converting to plain text or HTML drops all of it, which makes conversion a reliable way to strip history you did not mean to share.',
    ],
    words: 856,
  },

  {
    slug: 'markdown-as-a-document-source',
    title: 'Writing in Markdown and generating the Word file later',
    description: 'Keeping the source as Markdown and producing DOCX or HTML on demand solves versioning, diffing and consistency problems that Word cannot.',
    excerpt: 'Word documents cannot be diffed, merged or reviewed line by line. Plain text can. The trick is generating the DOCX at the end rather than living in it.',
    category: 'docs',
    tags: ['markdown', 'docx', 'html', 'workflow'],
    published: '2026-09-12',
    relatedTools: ['markdown-to-docx', 'html-to-docx', 'markdown-preview', 'html-markdown'],
    takeaways: [
      'A DOCX is compressed XML, so two versions have no meaningful textual difference and nothing can diff or merge them.',
      'Markdown is plain text, so review becomes reading a change rather than hunting for one.',
      'Write once and generate DOCX for reviewers and HTML for the web, instead of maintaining two copies that drift apart.',
      'Markdown has no page size, margins or headers. If the layout is the deliverable, it is the wrong source format.',
    ],
    words: 784,
  },

  {
    slug: 'word-styles-and-templates',
    title: 'Word styles: why formatting by hand costs you later',
    description: 'Direct formatting and styles look identical and behave completely differently. One converts, exports and restyles; the other does not.',
    excerpt: 'Bold 16pt text looks like a heading and is not one. Nothing downstream can tell the difference, which is where the trouble starts.',
    category: 'docs',
    tags: ['word', 'styles', 'templates', 'formatting'],
    published: '2026-09-10',
    relatedTools: ['word-remove-format', 'docx-to-html', 'markdown-to-docx', 'docx-to-markdown'],
    takeaways: [
      'A real Heading 1 carries meaning; bold 16pt text carries appearance. Only the first survives conversion or export.',
      'Styles are what generate a table of contents, a navigation pane and a tagged PDF. Direct formatting generates none of them.',
      'Pasting from another document drags its styles in, which is how a file ends up with fourteen near-identical fonts.',
      'Stripping all formatting and reapplying styles is usually faster than repairing a document formatted by hand.',
    ],
    words: 797,
  },

  {
    slug: 'comparing-two-documents',
    title: 'Finding what changed between two versions of a document',
    description: 'Comparing documents, PDFs and plain text each work differently, and knowing which comparison you are running explains the false positives.',
    excerpt: 'A comparison that reports the whole document changed usually means one paragraph moved and everything after it reflowed.',
    category: 'docs',
    tags: ['compare', 'diff', 'versions', 'review'],
    published: '2026-09-11',
    relatedTools: ['word-compare', 'diff-text', 'pdf-compare', 'text-cleaner'],
    takeaways: [
      'Text comparison finds what changed. Visual comparison finds where the pixels differ, which is not the same question.',
      'A single insertion near the top reflows every page after it, so a visual diff reports the whole document as changed.',
      'Normalise line endings and whitespace before comparing, or formatting noise buries the real edit.',
      'Comparing scans only works visually, because there is no text in them to compare.',
    ],
    words: 788,
  },
];
