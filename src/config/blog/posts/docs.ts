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
    body: `Someone sends you a PDF and asks for "the Word version". You run it through a converter, open the result, and the first thing you see is a table that has become forty separate text boxes. Nothing has gone wrong. You asked for something the file could not give you.

## The two formats describe different things

A DOCX is a description of **structure**. Underneath the zip wrapper it is XML saying: this is a Heading 1, this is a numbered list at level two, this table has four columns, this paragraph uses the style called Body Text. Where any of it physically lands on a page is worked out later, by Word, when it lays the document out.

A PDF is a description of **appearance**. It says: draw the glyph "T" at x=72, y=698 in 11pt Calibri, then draw "h" at x=79.2. There is no concept of a paragraph, a heading, a list or a table. A table in a PDF is some lines and some text that happen to be positioned so a human reads it as a grid.

Converting DOCX to PDF is therefore a **rendering** step, the same category of operation as printing. Converting PDF back to DOCX is an **inference** step, where software looks at scattered glyph positions and tries to guess the structure that produced them.

One of those is reliable. The other is a reconstruction.

## Going DOCX to PDF

This direction is the well-behaved one, but there are three things that genuinely change.

**Fonts get embedded or substituted.** If the document uses a font the converter has, it embeds a subset and the output looks identical. If it does not, it substitutes something metrically similar and your line breaks move. This is why a CV that fitted on one page in Word arrives as a page and a half.

**Everything interactive stops being interactive.** Comments, tracked changes, hidden text and field codes are resolved and flattened. A \`{ PAGE }\` field becomes the literal number. A cross-reference becomes the text it happened to say at conversion time. Tracked changes are either burned in or dropped depending on the view being rendered, so it is worth accepting or rejecting them deliberately first rather than finding out afterwards.

**Reflow ends.** A DOCX re-lays out for the page size it is opened at. Once it is a PDF, the pagination is fixed. That is usually the point of converting, but it also means an A4 layout stays A4 on US Letter, with the margins slightly wrong.

## Going PDF to DOCX

Here the converter is reverse-engineering. How well it does depends entirely on what kind of PDF you gave it.

| What you start with | What a converter can recover |
|---|---|
| PDF exported from Word, text intact | Paragraphs and most runs of formatting, usually good |
| PDF with a tagged structure tree | Headings, lists and tables, genuinely reliable |
| Designed PDF from InDesign or LaTeX | Text, but the structure is a guess |
| Multi-column layout | Text, often in the wrong reading order |
| Scanned pages | Nothing at all without OCR first |

That third row is worth dwelling on. A PDF has no reading order unless someone added one. In a two-column newsletter, the glyphs may be stored in the order they were drawn, which can interleave the columns. The converter reads what it is given and you get alternating half-sentences.

The fourth row is a hard stop. If you cannot select a sentence in the PDF with your cursor, there is no text in it, only an image of text. No converter can pull words out of that. It needs [OCR](/tool/pdf-ocr) to generate the text first, and then you are working from a transcription with its own error rate rather than from the original characters.

## What "tagged" means and why it is the whole game

A tagged PDF carries an invisible structure tree alongside the visual content, marking which glyphs belong to which heading, paragraph, list item or table cell. It exists for screen readers, and it is also exactly what a converter needs.

Word writes tags when you export properly. It does not when you use the print-to-PDF driver, because a printer driver only knows about ink. Those two routes produce files that look identical and convert completely differently.

So if you control the original, the useful habit is: **export, do not print.** In Word that means File → Save as PDF, or Export, rather than Print → Microsoft Print to PDF. The file is a little larger and it stays convertible, searchable and accessible.

## When you are stuck with the PDF

If you did not make the file and it converts badly, the question is what you actually need from it.

- **You need the words, not the layout.** [Extract the text](/tool/pdf-extract-text) and paste it into a clean document. You will reformat, but you will not be deleting forty rogue text boxes first.
- **You need the words in a document you will restyle anyway.** Convert to DOCX, then run [remove formatting](/tool/word-remove-format) immediately. Stripping the inherited mess is faster than editing around it.
- **You need it as portable structured text.** [DOCX to Markdown](/tool/docx-to-markdown) keeps headings and lists as plain, diffable text with no layout to fight.
- **You need to change three words in a contract.** Do not convert at all. Edit the PDF directly or ask the sender for the source. A round trip through DOCX will reflow the whole thing and change what the document looks like to the other party.

## The habit that saves the most time

Keep the DOCX. The PDF is the output, not the file.

Almost every painful conversion starts with the original being lost and the PDF being the only copy left. When the source exists, you edit it and re-export in thirty seconds. When it does not, you are paying a reconstruction tax every time the document needs a change, and paying it again at every future revision.

[DOCX to PDF](/tool/docx-to-pdf) and [PDF to Word](/tool/pdf-to-word) both run in the browser tab here, with no upload step. That is worth having for the ordinary reason that contracts, offer letters and medical forms are the documents people convert most, and they are a poor fit for a free service with an unread privacy policy.`,
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
    body: `The .docx extension has been a zip file since 2007. Not "like" a zip file, actually one. Copy a document, rename it to \`report.zip\`, and any unzip tool will open it and show you a folder tree of XML.

That single design decision is why a web page can read a Word document at all, and it is also why Word documents give away more than their authors expect.

## What is in the box

Unzip a typical document and you get something close to this:

| Path | What it holds |
|---|---|
| \`word/document.xml\` | The text, as a tree of paragraph and run elements |
| \`word/styles.xml\` | Every style definition the document can use |
| \`word/media/\` | The images, as ordinary files |
| \`word/comments.xml\` | Comment threads, if there are any |
| \`docProps/core.xml\` | Author, last editor, created and modified dates, revision count |
| \`docProps/app.xml\` | Word version, editing time, page and word counts, template name |

The text itself is not stored as a page. It is stored as structure: this is a paragraph using the style Heading 1, this run of characters is bold, this is a table with these cells. Where any of it physically lands is decided when something lays it out.

That is why a [DOCX viewer](/tool/word-viewer) in a browser can show you a readable document without Word installed. It is reading the same XML Word reads and applying the same style definitions. It is also why the rendering is close but not pixel-identical: Word's line-breaking and hyphenation are its own, and nothing else reproduces them exactly.

## The metadata nobody remembers is there

Open \`docProps/core.xml\` in any text editor and you will find something like this:

\`\`\`xml
<dc:creator>Priya Nair</dc:creator>
<cp:lastModifiedBy>a.kumar</cp:lastModifiedBy>
<cp:revision>47</cp:revision>
<dcterms:created>2026-03-02T09:14:00Z</dcterms:created>
\`\`\`

And in \`docProps/app.xml\`, a \`TotalTime\` field counting the minutes the document has been open for editing across its whole life.

None of this is visible in the document. All of it is copied when you send the file.

> [!WARNING]
> The consequences are ordinary and awkward. A CV built from a template still names the person who wrote the template. A proposal sent to a client names the other client whose document it was copied from. A "fresh" report has a revision count of 47 and a created date from two years ago.

If you want to see what a specific file is carrying, a [metadata viewer](/tool/word-metadata) reads those two files and shows you the fields without you having to unzip anything.

## Tracked changes are not deletions

This one has produced actual news stories.

When change tracking is on, deleted text is not removed from \`document.xml\`. It is wrapped in a \`<w:del>\` element and hidden from the current view. The characters are still in the file. Anyone who turns tracking display on, or who unzips the document and reads the XML, can read every sentence that was cut.

The same applies to comments. Resolving a comment thread does not delete it, and \`comments.xml\` keeps the text and the names.

Accepting all changes and deleting all comments genuinely removes them. Saving over the file without doing that does not.

## Getting the text out cleanly

Once you know the text lives in XML, the conversion options make more sense as a set of trade-offs about how much structure you want to keep.

- **[DOCX to plain text](/tool/docx-to-txt)** keeps the words and nothing else. No styles, no metadata, no tracked changes, no comments. This is the bluntest and most reliable way to reduce a document to its content.
- **[DOCX to HTML](/tool/docx-to-html)** keeps headings, lists, tables, bold and italic, and maps them onto real HTML elements. This is what you want when the text is going onto a web page, because you keep the structure and lose the Word-specific markup that otherwise arrives as a mess of inline styles.
- **[DOCX to Markdown](/tool/docx-to-markdown)** keeps the same structure as plain, diffable text. Useful when the document is going into a repository or anywhere a future version needs to be compared against this one.

All three drop \`docProps\` entirely, because none of the target formats has anywhere to put it. Converting is therefore a side-effect-free way of removing history: what comes out is the text you can see and nothing you cannot.

## A checklist before sending a document out

1. **Accept or reject all tracked changes.** Not "hide" them.
2. **Delete resolved comments.** Resolving is not deleting.
3. **Check the author fields**, especially if the file started life as someone else's template.
4. **Consider whether they need a DOCX at all.** If they are not going to edit it, a PDF or plain text carries far less.

None of this requires uploading the document anywhere. Reading a zip archive and parsing XML is something a browser does natively, which is why the viewer, the metadata reader and all three converters here run on your own machine. The documents most worth checking are the ones you would least like to hand to a stranger, which is the whole point.`,
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
    body: `Two people edit the same report. One sends back \`report-final-v2-JS.docx\`, the other \`report-final-AK-edits.docx\`. Now someone has to open both side by side and reconcile them by eye, because there is no way to ask what actually changed.

This is not a discipline problem, it is a format problem. A DOCX is a zip archive of compressed XML, so two versions of it have no meaningful textual difference: a one-word edit changes compressed bytes throughout the file. Nothing can diff it, nothing can merge it, and nothing can show a reviewer the three lines that moved.

Plain text can do all three, which is the whole argument for keeping the source in Markdown and treating the Word file as output.

## What you get back

**Real diffs.** Any [text comparison](/tool/diff-text) shows exactly which lines changed. Review becomes reading a change rather than hunting for one.

**Merges.** Two people editing different sections combine automatically. The only conflicts are genuine ones, where both edited the same lines.

**One source, several outputs.** The same file becomes a DOCX for the reviewer who wants Track Changes, HTML for the intranet, and a PDF for the archive. They cannot drift apart, because there is only one of them.

**Consistency for free.** A heading is a heading because the line starts with \`##\`, not because someone remembered to apply Heading 2 rather than bold 14pt. A whole class of inconsistency stops being possible.

**Durability.** It is text. It will open in thirty years, in any editor, with no licence.

## Where it stops being the right answer

Markdown describes structure and nothing else, and that is a real limit rather than a purist's preference.

| You need | Markdown |
|---|---|
| Headings, lists, tables, links, emphasis | Fine |
| Code blocks, quotes, footnotes | Fine |
| Page size, margins, headers and footers | No concept of them |
| Precise figure placement and text wrapping | No |
| Columns, text boxes, pull quotes | No |
| Comments and Track Changes for reviewers | No |

So the split is roughly this. If the **content** is the deliverable, Markdown is a better source than Word. If the **layout** is the deliverable, a brochure or a formatted report where the position of things carries meaning, then Word or a real layout tool is the right place to work and there is nothing to gain from fighting it.

Reviewers wanting Track Changes is the objection that comes up most, and it has a straightforward answer: generate the DOCX, send that, and treat their marked-up copy as a list of changes to apply back to the source. You lose the round trip, which is the cost. You keep a source that can be diffed, which is the benefit.

## Generating the outputs

[Markdown to DOCX](/tool/markdown-to-docx) maps the structure onto real Word styles, so \`##\` becomes Heading 2 and a bullet list becomes a Word list. Because those are styles rather than direct formatting, the recipient can restyle the whole document from the Styles pane, which is not true of a document where every heading was hand-formatted.

[Markdown preview](/tool/markdown-preview) is worth keeping open while writing, for the ordinary reason that a broken table or an unclosed emphasis is easier to spot rendered than in the source.

For the other direction, [HTML to DOCX](/tool/html-to-docx) handles the case where the content already exists as a web page and someone has asked for it in Word.

> [!TIP]
> The most useful conversion in day-to-day work goes the opposite way. Pasting from Word into a CMS drops a mess of \`<span style="...">\` and \`mso-\` attributes into the page source. Running it through [HTML to Markdown](/tool/html-markdown) and back out strips all of that and leaves the structure intact, which is much faster than cleaning the markup by hand.

## Starting without rewriting your archive

You do not need to convert anything to get the benefit. This works from the next document onward.

1. Write the next thing in Markdown. Any text editor will do.
2. Preview as you go to catch structural mistakes.
3. Generate the DOCX or HTML when somebody needs one.
4. Apply returned edits to the Markdown, never to the generated file.

Step four is the one that decides whether this holds. The moment someone edits the DOCX and that becomes the real version, you are back to reconciling files by eye and the source is just an out-of-date copy.

Every conversion named here runs in the browser tab. That matters less for a public blog post than for the internal documents this workflow attracts, which are the ones with salary bands, client names and unannounced plans in them.`,
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
    body: `Two documents look identical on screen. One has headings made with the Heading 1 style; the other has bold 16pt text. Export both to PDF and one has a navigation tree and the other does not. Convert both to HTML and one produces real heading elements and the other produces paragraphs. Ask Word to build a table of contents and one works.

The difference is invisible on the page and decides everything that happens to the document afterwards.

## Direct formatting versus styles

**Direct formatting** applies appearance to the characters you selected. Bold, 16pt, dark blue. That is all the file records.

**A style** is a named definition applied to a paragraph. The paragraph is a Heading 1; Heading 1 currently means 16pt bold dark blue, and that definition lives in one place.

The practical difference is that a style carries **meaning** and direct formatting carries only **appearance**. Everything downstream reads meaning:

| Feature | Needs styles |
|---|---|
| Table of contents | Yes |
| Navigation pane | Yes |
| Restyling the whole document | Yes |
| Tagged, accessible PDF export | Yes |
| Clean conversion to HTML or Markdown | Yes |
| Looking right on screen | No |

That last row is why the habit persists. Formatting by hand looks correct immediately, and the cost arrives later, usually when somebody asks for the document in another format.

## What it costs at conversion time

This is where the abstract argument becomes concrete. A document formatted with real styles run through [DOCX to HTML](/tool/docx-to-html) produces \`<h1>\`, \`<h2>\`, \`<ul>\` and \`<table>\` elements: structure a browser and a screen reader both understand.

The same document formatted by hand produces a flat sequence of paragraphs carrying inline styling, because there was no structure to map. You get the appearance approximately and the structure not at all, and someone has to rebuild the headings manually.

[DOCX to Markdown](/tool/docx-to-markdown) has the same dependency, for the same reason: \`##\` is a heading level, and a heading level is what the style provided.

> [!NOTE]
> The same applies to exporting a PDF. Word writes a tagged structure tree from your styles, and that tree is what makes the PDF accessible and what makes it [convert back to Word cleanly](/blog/word-to-pdf-and-back). A hand-formatted document exports a PDF that looks right and is structurally empty.

## Lists and spacing, the two other classics

**Manual bullets.** Typing a hyphen and a space produces something that looks like a list and is a paragraph beginning with a hyphen. It will not renumber, will not indent consistently, and converts to nothing.

**Empty paragraphs for spacing.** Pressing Enter twice is the most common way documents acquire inconsistent gaps, because the space then depends on the font size of an invisible paragraph. Space Before and Space After in the style definition is the mechanism that exists for this, and it stays consistent when the document is restyled.

## Style bloat, and the fastest way out

Pasting content from another document brings that document's style definitions with it. Do it repeatedly and the style list fills with \`Heading 1\`, \`Heading 11\`, \`Heading 1 + Calibri\`, all subtly different, and the document acquires several fonts nobody chose.

Repairing this by editing each style is slow and rarely converges. The faster route is to remove everything and start from a known state:

1. [Strip all formatting](/tool/word-remove-format) to reduce the document to plain text with paragraph breaks.
2. Apply your template.
3. Apply Heading 1, Heading 2 and list styles where they belong.

That sounds drastic and is usually quicker than the alternative, because you end with a document that has exactly the styles you intended rather than one you have negotiated with.

> [!TIP]
> If you write in [Markdown and generate the DOCX](/blog/markdown-as-a-document-source), this problem cannot occur. \`##\` becomes Heading 2 by definition, so every generated document has correct structure and identical styling with nothing to maintain. [Markdown to DOCX](/tool/markdown-to-docx) is the step that does it.

## A template worth having

A template is a document containing style definitions and no content. Setting one up once takes about twenty minutes and pays for itself the first time somebody asks for a different font throughout.

Define Heading 1 to 3, Body Text, a list style and a caption style. Set fonts, sizes, colours and spacing in the definitions rather than on the text. Then every new document starts correct, and changing the look of all of them later is a change in one place.

The test for whether it worked: open the navigation pane. If your headings are listed there, the document has structure. If it is empty, the document has appearance only, and every conversion from here will be a rebuild.`,
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
    body: `Someone returns a contract "with a few small changes". The comparison tool reports that 38 of 40 pages differ. Two of those pages contain a real edit and the other 36 moved down by four lines.

Which comparison you are running decides whether that happens.

## Three different questions

**Text comparison** extracts the words from both files and finds the minimal set of insertions and deletions that turns one into the other. It answers: what words changed?

**Visual comparison** renders both to images and highlights regions where the pixels differ. It answers: where does this look different?

**Structural comparison**, which is what Word's own compare does, works on the document model, so it can distinguish a changed paragraph from a moved one and can report formatting changes separately from text changes.

They give different answers to the same pair of files, and none of them is wrong.

## The reflow problem

This is the single biggest source of noise, and it is worth understanding because it is not a defect.

Insert a sentence on page 2 of a 40-page document. Every subsequent line moves. A **visual** comparison correctly reports that nearly every page now differs, because nearly every page does differ in pixel terms.

A **text** comparison handles it correctly, because it compares sequences of words and is indifferent to where they landed on a page. This is the underlying mechanism described in [how diff tools find changes](/blog/how-diff-tools-find-changes): the algorithm looks for the longest common subsequence, so shifted-but-unchanged content is recognised as unchanged.

So the rule is: **if both files contain real text, compare the text.** Fall back to visual only when one of them is a scan.

## Granularity changes what you see

A line-based comparison reports an entire line as changed when one word in it changed, which is right for code and unhelpful for prose, where a paragraph is one long line.

A word-based comparison is what you want for documents. It shows the three words that actually changed inside a paragraph rather than flagging the paragraph.

[Text comparison](/tool/diff-text) offers this choice, and picking it deliberately is most of the difference between a readable result and a wall of red.

## Clean before you compare

Most false positives are formatting, not content.

> [!TIP]
> Before comparing, normalise both sides: consistent line endings, collapsed runs of whitespace, no trailing spaces, and the same quote characters. A [text cleaner](/tool/text-cleaner) does this in one pass, and it frequently reduces a hundred reported differences to the four that matter.

Smart quotes are a specific and common culprit. A document that has been through Word has curly quotes; one that has been through a plain editor has straight ones. Every quoted phrase then reports as changed.

The same applies to line endings, which differ between Windows and Unix systems and are invisible. A file that appears entirely rewritten, with no change you can see, is usually this.

## Documents and PDFs

For two Word files, [document comparison](/tool/word-compare) works on the text and reports insertions and deletions in place. This is also what Word's own Compare feature does, and it produces a marked-up document you can walk through and accept or reject.

For two PDFs, [PDF comparison](/tool/pdf-compare) picks its approach based on what is in them. If both have a text layer, the comparison is textual and precise. If either is a scan, it falls back to visual and inherits the reflow problem described above.

Which means the most useful thing you can do for future comparisons is [run OCR](/tool/pdf-ocr) on scanned documents when you file them, rather than when you need to compare them. A text layer added at filing time makes every later comparison precise instead of approximate.

## When the answer is not a diff

If you control both versions and the document matters, the comparison problem is a symptom rather than the issue. A DOCX cannot be diffed meaningfully because it is compressed XML, which is the argument in [writing in Markdown and generating the Word file later](/blog/markdown-as-a-document-source): a plain-text source gives you a real change history instead of a reconstruction.

That does not help with a contract someone else drafted, which is exactly when you need comparison most. For that case:

1. Get both as text if you can, rather than as scans.
2. Normalise whitespace and quotes on both sides.
3. Compare at word granularity.
4. Read the seams, meaning the areas immediately around each reported change, because that is where a subtle edit hides next to an obvious one.

All four steps run locally here, which matters given that the documents people compare are almost always the ones under negotiation.`,
  },
];
