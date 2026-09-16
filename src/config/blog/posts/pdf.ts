import { BlogPost } from '../types';

export const PDF_POSTS: BlogPost[] = [
  {
    slug: 'how-pdf-compression-actually-works',
    title: 'How PDF compression actually works (and why some files refuse to shrink)',
    description: 'A PDF is a bundle of streams, fonts and images. Knowing which part is heavy tells you whether compression will help or waste your time.',
    excerpt: 'Every "compress PDF" button does roughly four things. Understanding them tells you in advance whether your 40 MB file will drop to 3 MB or stubbornly stay at 39 MB.',
    category: 'pdf',
    tags: ['pdf', 'compression', 'file-size'],
    published: '2026-08-06',
    relatedTools: ['pdf-compress', 'pdf-metadata', 'pdf-to-jpg'],
    takeaways: [
      'Text streams in a PDF are already deflated, which is why a text-only document will barely shrink no matter what you do.',
      'The savings come from images: downsampling them, re-encoding them, and subsetting fonts.',
      'Compression is lossless for text and lossy for images, so words stay sharp while scans degrade permanently.',
      'Compress once from the highest-quality original. Repeating the pass is how documents end up looking like a fax.',
    ],
    body: `You drag a 42 MB PDF into a compressor, wait, and get back a 41.6 MB file. The same tool takes someone else's 30 MB scan down to 2 MB. Neither result is a bug, the two files are heavy for completely different reasons.

## What is actually inside a PDF

A PDF is not a picture of a page. It is a container holding numbered objects: page definitions, content streams describing where to draw each glyph and line, embedded font programs, images, and a cross-reference table that says where each object lives in the file.

Almost every one of those content streams is already compressed with Flate, the same algorithm as ZIP. That single fact explains most disappointing results: **if your PDF is mostly text, the bytes are already squeezed and there is very little left to take.**

So when a file is huge, the weight is nearly always in one of three places: images, fonts, or accumulated junk.

## The four things a compressor can do

**1. Downsample images.** A phone photo pasted into a document may be 4000 pixels wide, sitting in a box 6 cm across. At print resolution that box only needs about 700 pixels. Throwing away the other 3300 columns of pixels is invisible on paper and on screen, and it is where the dramatic savings come from.

**2. Re-encode images.** A page scanned as PNG (lossless) can be re-saved as JPEG at quality 70. For photographic or scanned content the visual difference is small and the size drop is often 80–90%.

**3. Subset fonts.** A full font file can be several hundred kilobytes because it contains every glyph, including scripts you never used. Subsetting keeps only the characters the document actually prints. Embed four unsubsetted font weights and you have paid a megabyte before writing a word.

**4. Remove the leftovers.** Page thumbnails, old incremental-save revisions, unused objects, document metadata, embedded file attachments and JavaScript. Individually small, collectively meaningful, and rewriting the cross-reference table as a compressed object stream tidies up the rest.

## Why your file behaves the way it does

| File type | What dominates | Realistic saving |
|---|---|---|
| Scanned document (images of pages) | JPEG/PNG page images | 60–90% |
| Report with photos and charts | Embedded images | 40–80% |
| Contract, invoice, text-only | Already-deflated text streams | 0–10% |
| Slide deck exported to PDF | Background images, embedded fonts | 30–70% |

If you have a text-only PDF that will not shrink, no tool will fix that, there is simply nothing left to compress. The honest answer is to send it as it is.

## The part people get wrong

Compression is lossy for images and lossless for text. That means:

- Text stays perfectly sharp and selectable no matter how hard you compress. You are never blurring your words.
- Images degrade permanently. Compress a scan twice and you compress already-compressed JPEG data, which introduces visible blocking around letters.
- **Compress once, from the highest-quality original you have.** Repeating the process is how documents end up looking like a photocopy of a fax.

Also worth knowing: compression is not encryption. Shrinking a file does nothing to protect it, and a compressed PDF is exactly as readable to anyone who opens it.

## A practical order of operations

1. Check what you are dealing with. Open the PDF and try to select a sentence with your cursor. If text highlights, it is a digital PDF. If nothing selects, it is a scan and image settings are what matter.
2. Compress once at a moderate setting and look at the result before going harder.
3. If a scan is still too large, reduce the target resolution rather than the JPEG quality, 200 DPI is fine for reading on screen, 300 DPI for printing text.
4. If only three pages of a fifty-page document matter, extract those pages instead. A smaller document beats a degraded one.
5. Strip metadata separately if privacy is the concern; it barely affects size but it does remove author names, software fingerprints and edit timestamps.

## Where this runs matters

Every one of these steps is arithmetic on bytes your browser already has. There is no technical reason to send a contract, a bank statement or a passport scan to someone else's server to have its images resampled. NextTool's [PDF compressor](/tool/pdf-compress) does the whole pass locally, which is why there is no upload progress bar and no file-size cap beyond your own memory.

The practical benefit is speed as much as privacy: a 50 MB file never has to travel up and back down a connection before you see the result.`,
  },

  {
    slug: 'merge-pdf-files-without-uploading',
    title: 'Merging PDFs: what gets preserved, what quietly breaks',
    description: 'Combining PDFs is not just stapling pages. Forms, bookmarks, links and page sizes each behave differently, here is what survives a merge.',
    excerpt: 'Merging looks trivial until a signed form comes out blank or a 3 MB and 4 MB file produce a 12 MB result. Both have the same cause.',
    category: 'pdf',
    tags: ['pdf', 'merge', 'forms'],
    published: '2026-08-12',
    relatedTools: ['pdf-merge', 'pdf-reorder', 'pdf-page-extractor', 'pdf-flatten'],
    takeaways: [
      'Page content, fonts, images and page sizes survive a merge intact, because nothing is re-rendered.',
      'Form fields, bookmarks, internal links and digital signatures frequently do not.',
      'Flatten filled forms before merging, or identically named fields from two documents will collide.',
      'Merge first and compress second, so duplicate fonts and repeated logos get deduplicated.',
    ],
    body: `Merging two PDFs sounds like concatenating two files. It is not. A PDF is an object graph with an index at the end, so merging means copying objects out of one graph into another, renumbering every reference, and rebuilding the index. Most of the surprises come from what happens to the objects that are not simple page content.

## What survives reliably

- **Page content.** Text, vector graphics and images copy across intact. Nothing is re-rendered, so quality is unchanged.
- **Embedded fonts.** They come along with the pages that use them.
- **Page dimensions and rotation.** Each page keeps its own size, which is why an A4 document merged with a US Letter one produces a file whose pages are subtly different widths.
- **Images.** Copied byte-for-byte, not recompressed.

## What often does not

**Interactive form fields.** A PDF form lives in a document-level structure called the AcroForm, plus per-page widget annotations. If both documents have a field named \`name\`, you now have two fields with one name, and viewers will either link them (typing in one fills the other) or drop one. If you are merging filled forms, flatten them first, flattening converts the filled values into ordinary page content, which merges perfectly.

**Bookmarks and outlines.** These are a document-level tree. Many merge implementations rebuild pages but not the outline, so a 200-page manual with a full table of contents can come out with no navigation at all.

**Digital signatures.** A cryptographic signature covers a specific byte range of a specific file. Merging changes the bytes, so the signature is mathematically invalidated. This is correct behaviour, not a defect, a signature that survived editing would be worthless.

**Internal links.** A link that pointed to "page 12 of this document" may now point at the wrong page unless destinations are remapped.

**Attachments, JavaScript and embedded media.** Frequently dropped.

## Why the merged file is bigger than the sum

Merge a 3 MB and a 4 MB file and you can get 12 MB. The usual culprit is fonts and resources being copied twice. If both documents embed the same font, a naive merge stores two full copies rather than recognising they are identical. The same applies to a logo image repeated on every page of both files.

The fix is a compression pass after merging, which deduplicates identical objects. Merge first, compress second, never the other way round.

## A merge checklist that avoids rework

1. **Decide the order before you start.** Reordering after the fact means dragging thumbnails around; naming your files \`01-cover.pdf\`, \`02-body.pdf\` sorts the problem out at the source.
2. **Flatten any filled forms.** This locks in the values and removes the field-name collision problem entirely.
3. **Check page sizes.** Mixing A4 and Letter is fine on screen and annoying in print. If it will be printed, normalise first.
4. **Merge, then compress.** In that order, for the deduplication reason above.
5. **Open the result and scroll the whole thing.** Especially the seams between documents, that is where a missing page or a wrong rotation shows up.

## The upload question

Merging is one of the most common reasons people hand documents to an unknown web service, and it is also one of the least justified. The operation is pure object copying: no rendering, no server-side libraries you could not run locally, no computation a laptop struggles with.

NextTool's [PDF merger](/tool/pdf-merge) runs the whole thing in the browser tab. The files are read into memory, the new document is assembled, and a download is produced. Nothing is transmitted, which matters when the documents in question are a lease, a medical report or a set of ID scans, exactly the sort of thing people merge most often.

If you only need a handful of pages from each source, [extract those pages](/tool/pdf-page-extractor) first. Merging less is always faster than compressing more.`,
  },

  {
    slug: 'how-to-redact-a-pdf-properly',
    title: 'How to redact a PDF properly (a black rectangle is not redaction)',
    description: 'Drawing a black box over text leaves the text underneath, fully copyable. Here is what real redaction removes and how to verify it worked.',
    excerpt: 'Courts, police departments and law firms have all published documents whose "redacted" passages could be read by selecting the text and pasting it elsewhere. The mistake is always the same.',
    category: 'pdf',
    tags: ['pdf', 'redaction', 'privacy'],
    published: '2026-08-20',
    relatedTools: ['pdf-redact', 'pdf-flatten', 'pdf-metadata', 'pdf-to-jpg'],
    takeaways: [
      'A black rectangle is a drawing on top. The text underneath stays selectable, searchable and copyable.',
      'Real redaction removes the underlying text operators and image data, not just the view of them.',
      'Flattening pages to images is the blunt method that always works, at the cost of searchable text and file size.',
      'Verify by selecting all, copying, and searching the result for what you removed.',
    ],
    body: `There is a specific, repeated, very public failure mode in document handling: someone opens a PDF, draws filled black rectangles over the sensitive passages, saves, and publishes. The passages are then recovered by anyone who selects the page and pastes it into a text editor.

It has happened in court filings, government disclosures and corporate reports. The people involved were not careless with the concept of redaction; they misunderstood what a PDF is.

## Why the black box fails

A PDF page has layers of drawing instructions. The text instruction says *draw the glyphs "Account 4471-8890" at these coordinates*. When you add a rectangle, you append a new instruction: *fill this area with black*.

The rectangle is drawn on top. The text instruction is still there, unchanged. A PDF viewer renders the black box over the letters, but the letters remain in the content stream, and:

- **Select-all and copy** extracts them, because text extraction reads the stream, not the rendered pixels.
- **Search** finds them.
- **Any text-extraction tool** dumps them in plain sight.
- **Removing the annotation**, if the rectangle was added as an annotation rather than page content, restores the page instantly.

The same trap applies to white boxes, highlighter shapes, and "hiding" content by moving an image over it.

## What real redaction does

Proper redaction removes the underlying content, not just its appearance. That means:

1. **Deleting the text operators** for the redacted region from the content stream, so there is nothing left to extract.
2. **Cropping or replacing image data** in that region, if the sensitive material is part of a scan.
3. **Drawing an opaque mark** so a reader can see that something was removed, this part is cosmetic, but it is the honest signal.
4. **Clearing metadata**, because document properties, XMP records and edit history frequently carry the author's name, the original filename and sometimes a full revision trail.
5. **Removing annotations and comments**, which live outside the page content and are routinely forgotten.

## The blunt method that always works

If the document is going to a stranger and the stakes are high, there is a crude technique that cannot fail: **flatten the page to an image.**

Convert the PDF pages to images, apply the black marks to the images, then rebuild a PDF from those images. Because a raster image has no text layer at all, there is nothing to extract. You lose selectable text and searchability for the whole document, and the file gets larger, but the redaction is unarguable.

Use this when the document is short, the recipient is adversarial, or you cannot verify the tooling.

## Verifying your redaction

Never trust the visual result. Run these three checks on the output file:

1. **Select all, copy, paste into a plain text editor.** Read what comes out. If any redacted string appears, the redaction failed.
2. **Search the document** for a distinctive redacted term, a surname, an account number.
3. **Inspect the metadata.** Author, title, producer, creation and modification timestamps often reveal more than people expect.

If all three come back clean, the content is genuinely gone.

## What redaction cannot fix

- **Context.** Redacting a name but leaving "the CFO of a 40-person firm in Ahmedabad" identifies the person anyway. Statistical re-identification is a real risk in documents with rich surrounding detail.
- **Redaction shape.** A black box whose width matches the text tells a reader how long the removed word was. For a short field like a name or a country, that narrows things considerably. Use uniform-width marks where it matters.
- **Other copies.** Redacting your outgoing PDF does nothing about the original sitting in an email thread.

## Doing it without handing over the document

There is an obvious irony in uploading a document to a third-party server precisely because it contains material too sensitive to share. Redaction is the one operation where local processing is not a nice-to-have.

NextTool's [PDF redaction tool](/tool/pdf-redact) removes the underlying content in your browser and never transmits the file; the [flatten](/tool/pdf-flatten) and [metadata](/tool/pdf-metadata) tools cover the other two steps. Whatever tool you use, run the copy-paste test on the result before it leaves your machine.`,
  },

  {
    slug: 'ocr-scanned-pdf-explained',
    title: 'OCR on scanned PDFs: what it can read, what it cannot, and why DPI matters',
    description: 'Optical character recognition turns page images into searchable text. Scan quality, resolution and layout decide whether you get 99% accuracy or gibberish.',
    excerpt: 'A scanned PDF is a stack of photographs. OCR is what turns those photographs back into words, when the input gives it a fair chance.',
    category: 'pdf',
    tags: ['ocr', 'pdf', 'scanning'],
    published: '2026-08-28',
    relatedTools: ['pdf-ocr', 'ocr-image', 'pdf-extract-text', 'image-adjust'],
    takeaways: [
      'OCR adds an invisible text layer under the page image. The picture is unchanged; the document becomes searchable.',
      'Resolution is the single biggest factor. 300 DPI for ordinary body text, and accuracy falls sharply below it.',
      'Skew, uneven lighting, patterned backgrounds and photographs taken at an angle wreck accuracy more than font choice does.',
      'Accuracy is never 100%. Anything that matters legally or financially needs checking by a human.',
    ],
    body: `There are two completely different kinds of PDF, and telling them apart takes two seconds: try to select a sentence with your cursor. If the text highlights, the document contains real text. If nothing happens, you are looking at pictures of pages and no amount of "extract text" will help, you need OCR.

## What OCR is doing

Optical character recognition converts pixels into characters. Modern engines such as Tesseract run roughly this pipeline:

1. **Binarisation**, convert the greyscale scan to pure black and white, adapting the threshold per region so a shadow across the page does not swallow a paragraph.
2. **Deskew and despeckle**, straighten a page scanned at an angle, drop isolated specks of noise.
3. **Layout analysis**, find blocks, then lines, then words. This is where columns, tables and sidebars are identified or misidentified.
4. **Recognition**, since version 4, Tesseract feeds line images to an LSTM neural network that reads a line as a sequence rather than classifying glyphs one at a time. This is why it handles joined and slightly distorted type far better than older engines.
5. **Language modelling**, the engine weighs its character guesses against a dictionary and character-sequence statistics for the language you selected. Choosing the wrong language is one of the biggest accuracy losses available, because the model will happily bend words toward the wrong vocabulary.

## Resolution is the single biggest factor

OCR accuracy depends on how many pixels make up each character. The rule of thumb the Tesseract project itself gives is around **300 DPI for ordinary body text**.

- Below ~200 DPI, small type loses the fine distinctions between similar letters and you start seeing classic confusions: \`rn\` read as \`m\`, \`l\`/\`1\`/\`I\`, \`0\`/\`O\`, \`5\`/\`S\`.
- Above ~400 DPI you gain almost nothing and pay for it in processing time and memory.
- For unusually small print, footnotes, legal fine print, receipts, 400–600 DPI genuinely helps.

If you are scanning the document yourself, this is the one setting worth getting right. Rescanning at 300 DPI beats any amount of post-processing on a 150 DPI capture.

## What wrecks accuracy

- **Photographs of screens or paper taken at an angle.** Perspective distortion is not the same as skew and is much harder to correct.
- **Uneven lighting**, especially a phone's shadow across the page.
- **Coloured or patterned backgrounds**, which confuse binarisation.
- **Handwriting.** General-purpose OCR is built for printed type. Cursive handwriting recognition is a different problem and mostly a different class of model.
- **Complex tables.** The characters may be read correctly while the structure, which value belongs to which column, is lost entirely.
- **Multi-column layouts**, where lines from adjacent columns get interleaved into one nonsense sentence.
- **Decorative or heavily stylised fonts**, and text over images.

## Practical steps for a better result

1. **Fix the image before recognising it.** Increase contrast, straighten the page, crop away the desk. A ten-second adjustment often does more than any engine setting.
2. **Set the correct language**, and set multiple languages if the document genuinely mixes them.
3. **Scan in greyscale, not colour**, for plain documents. It reduces noise and file size without losing information the engine uses.
4. **Split the job.** If only pages 4–7 matter, OCR those pages. Recognition is the slowest step in any document pipeline.
5. **Always proofread numbers.** Even at 98% character accuracy, a page of figures will contain errors, and a digit error in an invoice total is far worse than a letter error in a sentence.

## Expectations, honestly set

A clean 300 DPI scan of a modern printed page in a well-supported language will typically land in the high nineties for character accuracy. A phone photo of a crumpled receipt under a desk lamp will not, and no tool will make it. OCR is a quality-in, quality-out process.

## Running it locally

OCR is computationally heavy, which used to be the argument for sending documents to a server. That argument has expired: Tesseract compiled to WebAssembly runs entirely in a browser tab, using your own CPU.

That is how NextTool's [PDF OCR](/tool/pdf-ocr) and [image OCR](/tool/ocr-image) work. It is slower than a datacentre GPU, and the trade is that your medical records, contracts and ID documents, which is overwhelmingly what people OCR, never leave the machine. Expect a few seconds per page, and expect the first run to pause while the language data downloads.`,
  },

  {
    slug: 'reduce-pdf-file-size-for-upload-limits',
    title: 'Getting a PDF under a strict upload limit, without destroying it',
    description: 'Government portals want 1 MB, email wants 25 MB, and your scan is 48 MB. A decision order that gets you under the limit with the least damage.',
    excerpt: 'When a portal rejects your document at 1.2 MB against a 1 MB cap, panic-compressing to the lowest setting is the wrong move. There is a better order to try things in.',
    category: 'pdf',
    tags: ['pdf', 'file-size', 'compression'],
    published: '2026-09-04',
    relatedTools: ['pdf-compress', 'pdf-page-extractor', 'pdf-to-jpg', 'jpg-to-pdf', 'image-compressor'],
    takeaways: [
      'Find out what is heavy first. If text highlights when you select it, images are not the problem and compression will disappoint.',
      'Sending fewer pages beats degrading every page. Extraction is lossless.',
      'Lower the target resolution rather than the JPEG quality, because resolution is where the bytes actually are.',
      'Do not zip it, do not rename it, and do not password-protect it. None of those reduce size.',
    ],
    body: `Upload limits are arbitrary and unforgiving. Visa application portals commonly cap documents at 1–2 MB. University admission systems often say 500 KB. Gmail refuses attachments over 25 MB. Meanwhile a single phone-scanned page can easily be 4 MB on its own.

The instinct is to slam the compressor to maximum and hope. That reliably produces an illegible document, which gets rejected for a different reason. Here is a better sequence.

## Step 0: find out what is heavy

Before compressing, work out which kind of file you have. Select a line of text with your cursor.

- **Text highlights** → digital PDF. The weight is images, fonts, or nothing at all.
- **Nothing highlights** → scanned PDF. It is a stack of page images, and image settings are the only lever that matters.

This determines everything that follows, and most people skip it.

## Step 1: send fewer pages

The cheapest megabyte is the one you do not send. If the portal asks for your degree certificate and you are uploading a 40-page transcript, extract the two pages that matter. This costs zero quality and is the single most effective step available.

## Step 2: fix the resolution, not the quality

For scans, there are two independent dials, and people reach for the wrong one.

- **Quality** (JPEG compression level) introduces blocking artefacts around letters. Push it too far and text develops a smeared halo.
- **Resolution** (DPI) reduces the pixel count. Dropping a 600 DPI scan to 200 DPI cuts the data by roughly 89% and remains perfectly readable on screen.

Reduce resolution first, and only then reduce quality. A 200 DPI scan at quality 80 looks dramatically better than a 600 DPI scan at quality 20, at a similar file size.

Useful reference points: 150 DPI is fine for reading on a screen, 200 DPI is a safe general target, 300 DPI is what you want if it will be printed or OCR'd.

## Step 3: greyscale, when colour is not information

A black-ink document scanned in full colour stores three channels where one would do. Converting to greyscale typically cuts a scan by a third to a half with no loss of legibility, as long as the document does not rely on colour for meaning (a coloured official stamp, a highlighted clause, a chart).

Check the portal's requirements first. Some explicitly demand colour scans of ID documents.

## Step 4: compress once, from the original

Every compression pass re-encodes already-lossy data. Two 60% passes are visibly worse than one 40% pass at the same final size. If you have already compressed and it is still too big, go back to the original file and start again with harsher settings, rather than compressing the compressed version.

## Step 5: rebuild from images, as a last resort

For a stubborn scanned document, export the pages as JPEGs, compress those images individually where you have fine control, and rebuild a PDF from them. You lose any text layer, but for a document that never had one you lose nothing at all, and per-image control usually beats a whole-document slider.

## Common limits worth remembering

| Destination | Typical cap |
|---|---|
| Gmail / most email | 25 MB per message |
| Visa and passport portals | 1–2 MB per document |
| University applications | 500 KB – 2 MB |
| Job application portals | 2–5 MB |
| Government tender uploads | Often 1 MB, occasionally 100 KB |

When a form specifies both a size and a dimension requirement, common for photographs, meet the dimension requirement first, then compress.

## What not to do

- **Do not rename a JPEG to .pdf.** It will be rejected, and on some systems it will be silently accepted and then fail downstream.
- **Do not password-protect a file to shrink it.** Encryption does not reduce size, and many portals reject protected files outright.
- **Do not zip it** unless the portal asks for a zip. PDFs are already compressed internally, so the saving is marginal, and most upload forms only accept \`.pdf\`.
- **Do not compress an already-approved document** you may need to submit again. Keep the original.

## Doing this without uploading the document first

There is a real absurdity in uploading a passport scan to an unknown compression service in order to make it small enough to upload to an official portal. You have handed the document to two parties instead of one.

[Compression](/tool/pdf-compress), [page extraction](/tool/pdf-page-extractor) and [PDF-to-image conversion](/tool/pdf-to-jpg) on NextTool all run inside your browser, so the document only ever reaches the destination you actually intended.`,
  },

  {
    slug: 'taking-pages-out-of-a-pdf',
    title: 'Taking pages out of a PDF: split, delete, extract, and which you want',
    description: 'Splitting, deleting pages and extracting a range sound interchangeable. They produce different files, and picking the wrong one loses work.',
    excerpt: 'Three buttons that look like the same operation. The difference is how many files come out and what happens to everything you did not select.',
    category: 'pdf',
    tags: ['pdf', 'pages', 'extract'],
    published: '2026-09-13',
    relatedTools: ['pdf-split', 'pdf-delete-pages', 'pdf-extract-images', 'pdf-viewer'],
    takeaways: [
      'Split makes many files, extract makes one file from a range, delete makes one file with pages removed. Pick by what you want out.',
      'Page numbers in a PDF are positions, not the numbers printed on the page. A document with a cover and roman-numbered front matter will be off by several.',
      'Links and bookmarks pointing outside the pages you kept will break. That is unavoidable, not a tool defect.',
      'Extracting images is a different operation from converting pages to images, and gives you the originals at full resolution.',
    ],
    body: `You need pages 12 to 18 of a 200-page report. There are three buttons in front of you and they all appear to do it. They do not produce the same thing, and the difference matters more once you have the output.

## The three operations

**Split** takes one file and gives you many. Either one file per page, or one file per range you define. Use it when you genuinely want separate documents, such as breaking a batch of scanned invoices into one file per invoice.

**Extract** takes one file and gives you one file containing the range you asked for. Use it when you want a shorter document, which is the case most of the time.

**Delete** takes one file and gives you one file with the pages you named removed, keeping everything else. Use it when what you want to get rid of is smaller than what you want to keep.

Extract and delete are complements. Extracting 12 to 18 from a 200-page file and deleting 1 to 11 and 19 to 200 produce an identical result. Reach for whichever one requires you to type fewer numbers, because every number typed is a chance to get it wrong.

## The page numbering trap

This catches nearly everyone once.

A PDF numbers its pages by position in the file, starting at 1. The numbers printed on the pages are just ink. In a report with a cover, a blank verso, a contents page numbered \`i\` and body text starting at printed page 1, the printed page 1 is the file's page 5.

So "extract pages 12 to 18" means twelfth to eighteenth sheet in the file, which may be printed pages 8 to 14.

> [!TIP]
> Open the document in a [viewer](/tool/pdf-viewer) and check what is actually on the page at each position before you type the range. Thirty seconds of checking beats extracting the wrong chapter and not noticing until someone else reads it.

## What breaks when you take pages away

**Internal links and bookmarks.** A link that pointed to "page 143 of this document" has nowhere to go once page 143 is gone. A bookmark tree referring to removed sections either disappears or points at the wrong place. This is not a fixable defect: you removed the destination.

**Cross-references in the text.** "See the table on page 47" survives as text and is now wrong. Nothing will warn you.

**Form fields spanning the document.** If a form's fields were defined at document level and you keep only some pages, filled values can be lost. Flatten before extracting if the form is filled.

**Nothing else.** Text stays sharp, images are copied byte-for-byte rather than re-encoded, fonts come along with the pages that use them. Extraction is lossless for page content, which is why extracting three pages from a large report is almost always a better way to hit an email size limit than compressing the whole thing.

## Extracting images is a different job

"Extract images" and "convert pages to images" sound similar and are not related.

Converting pages to images renders each page, text and all, into a picture at a resolution you choose. You get a picture of the page.

[Extracting images](/tool/pdf-extract-images) pulls the embedded image objects out of the file and gives you the originals. If a report contains eight photographs, you get eight image files at whatever resolution they were embedded at, with no page furniture around them and no re-encoding.

The second is what you want when you need the pictures. It also reveals something people forget: an image cropped inside the document is usually stored uncropped, because cropping in a PDF changes the visible window rather than the data. Extracting can therefore hand you more of the photograph than the document displays.

> [!WARNING]
> That is worth remembering in the other direction too. Cropping a page or an image in a PDF hides content rather than deleting it, so it is not a way to remove something sensitive. Only [proper redaction](/blog/how-to-redact-a-pdf-properly) removes the underlying data.

## A short order of operations

1. **Look at the document first** and note the file positions, not the printed numbers.
2. **Flatten any filled forms** before splitting or extracting.
3. **Extract rather than compress** when the goal is a smaller file and you only need part of it.
4. **Open the output and read the first and last page.** Off-by-one errors are the common failure and they show up immediately at the boundaries.

All of this is object copying and index rebuilding, which is arithmetic your browser is perfectly capable of. [Splitting](/tool/pdf-split), [deleting pages](/tool/pdf-delete-pages) and [extracting images](/tool/pdf-extract-images) here all work on the file in memory, which is the behaviour you want given that the documents people most often need three pages out of are bank statements, medical records and contracts.`,
  },

  {
    slug: 'page-numbers-headers-and-margins',
    title: 'Page numbers, headers and margins: making a PDF look submitted, not exported',
    description: 'Adding page furniture to a finished PDF is straightforward once you know what a page box is and why rotation is not what you think.',
    excerpt: 'A PDF page has four different boundaries and a rotation value that does not move any content. Both explain why stamped text lands in odd places.',
    category: 'pdf',
    tags: ['pdf', 'layout', 'print'],
    published: '2026-09-13',
    relatedTools: ['pdf-page-numbers', 'pdf-header-footer', 'pdf-crop', 'pdf-rotate'],
    takeaways: [
      'A PDF page has several boxes. Cropping changes the visible one and does not delete anything outside it.',
      'Rotation is a page property, not a transformation of content, so stamped text can land sideways unless the tool accounts for it.',
      'Add page numbers after merging and reordering, never before, or the numbering will not match the final sequence.',
      'Check the first, last and any landscape page. Those three are where stamping goes wrong.',
    ],
    body: `You have assembled a submission from four different sources. It reads correctly and looks like four documents stapled together: no page numbers, no running header, and one landscape page that a reader has to tilt their head for. Fixing that is a small job, and it goes wrong in predictable ways worth knowing in advance.

## A page has more than one boundary

A PDF page defines several rectangles, and they are not the same thing.

| Box | What it means |
|---|---|
| MediaBox | The full sheet, the physical paper size |
| CropBox | The region a viewer actually displays |
| TrimBox | The finished page after cutting, for print |
| BleedBox | The area including print bleed |

Almost everything you see is the CropBox. That has one consequence worth stating plainly: **cropping a PDF page changes which rectangle is displayed and deletes nothing.** The content outside the crop is still in the file, and anyone can restore it by resetting the box.

> [!WARNING]
> [Cropping](/tool/pdf-crop) is a layout operation, not a privacy one. If you are trying to hide a signature, an address or a figure at the edge of a page, cropping does not do it. The data stays in the file.

Where cropping is genuinely useful is trimming the wide margins on a scanned book so it reads better on a screen, or normalising a set of pages that came from different sources to the same visible size.

## Rotation is a property, not a transformation

Every page carries a \`/Rotate\` value of 0, 90, 180 or 270. A viewer applies it when displaying the page. The content underneath is not moved, redrawn or re-encoded.

This explains two things people find strange.

Rotating a page is instant and lossless even on a huge scan, because nothing is being re-rendered. It is a number changing from 0 to 90.

And stamping text onto a rotated page can put it sideways or off the edge, because the stamp is placed in the page's own unrotated coordinate system while you are looking at the rotated result. A tool that handles this correctly compensates for \`/Rotate\`; one that does not will produce exactly the wrong result on precisely the pages you rotated.

So the order matters: [rotate](/tool/pdf-rotate) everything to its final orientation first, then stamp.

## Getting the numbering right

[Page numbers](/tool/pdf-page-numbers) are stamped as ordinary page content, so a few decisions are worth making deliberately.

**Do it last.** After merging, after reordering, after deleting. Numbering a document and then inserting a page gives you a document that is confidently wrong, which is worse than one with no numbers at all.

**Decide where the count starts.** Submissions usually want the cover unnumbered and the count starting on the first content page. That means the stamp begins on file page 2 and prints "1", which is two separate settings and the most common thing to get wrong.

**Mind the gutter.** A number centred at the bottom is safe. A number in the outer corner has to alternate sides on a double-sided document, and a number in the inner corner disappears into the binding.

**Leave room.** If the source pages already have content near the bottom edge, a stamped number will overlap it. This is where [cropping](/tool/pdf-crop) to normalise page sizes first actually helps, because you can see how much margin you have to work with.

The same applies to a [header or footer](/tool/pdf-header-footer): a document title, a case reference or a confidentiality line running on every page is what makes a stack of merged exports read as one document.

## The pages that break

Three positions account for nearly every stamping problem, and checking them takes under a minute.

1. **The first page.** Usually the cover, usually the one that should not be stamped.
2. **The last page.** Often a back cover or an appendix from a different source with a different page size.
3. **Any landscape page.** Different dimensions and probably a \`/Rotate\` value, so it is where a stamp lands wrongly if it is going to.

## The sequence that works

1. Merge everything into one document.
2. Reorder and delete until the sequence is final.
3. Rotate any sideways pages to their finished orientation.
4. Crop to normalise page sizes, if they are inconsistent and it will be printed.
5. Add the header, footer and page numbers.
6. Compress, if it needs to be smaller.
7. Open it and check page one, the last page, and every landscape page.

Compressing at step six rather than earlier matters, because stamping after compression adds new uncompressed content streams to a file you just squeezed.

All of these are page-content and dictionary edits, which is why [numbering](/tool/pdf-page-numbers), [headers and footers](/tool/pdf-header-footer), [cropping](/tool/pdf-crop) and [rotation](/tool/pdf-rotate) all run locally here. A submission bundle is usually the last document you would want to hand to an anonymous web service, and none of this needs one.`,
  },

  {
    slug: 'making-a-pdf-from-something-else',
    title: 'Making a PDF out of HTML, plain text and a form you filled in',
    description: 'Generating a PDF from a web page or a text file involves choices about page size, fonts and what happens to links. Here is what each one costs.',
    excerpt: 'A web page has no pages. Turning one into a PDF means inventing page breaks, and where they land is the whole problem.',
    category: 'pdf',
    tags: ['pdf', 'html', 'forms'],
    published: '2026-09-14',
    relatedTools: ['html-to-pdf', 'text-to-pdf', 'pdf-fill-forms', 'pdf-watermark', 'pdf-repair'],
    takeaways: [
      'A web page is one continuous column with no page breaks, so converting it to PDF means inventing them.',
      'Fill PDF forms in a proper form filler, not by typing into a drawing layer, and flatten before sending.',
      'A watermark stamped into page content is part of the document; one added as an annotation can be deleted in seconds.',
      'If a PDF will not open at all, the cross-reference table is usually the damaged part and the content is often recoverable.',
    ],
    body: `Three different jobs get called "make a PDF": turn this web page into one, turn this text file into one, and give me back the form I just filled in. They share an output format and almost nothing else.

## HTML has no pages

This is the root of every surprise in the first job. A web page is one continuous column of unknown length. A PDF is a sequence of fixed rectangles. Converting means deciding where to cut, and nothing in the HTML says where a cut would be acceptable.

So a table splits across a page boundary with its header left behind. A heading lands as the last line of a page with its paragraph overleaf. A chart is bisected.

[HTML to PDF](/tool/html-to-pdf) has to make those decisions, and a few things make its job easier:

- **Give it a page size deliberately.** A4 and US Letter differ by about 18mm of height, which is enough to move every break in a long document.
- **Expect backgrounds to be dropped.** Browsers omit background colours and images when printing unless told otherwise, which is why a dark-themed page often converts to black text on white.
- **Fixed and sticky positioning has no meaning.** A sticky header belongs to a viewport, and there is no viewport. It usually renders once at the top or repeats on every page, and neither is what the page looked like.
- **Links survive as links.** Anchors become clickable PDF link annotations, which is genuinely useful and often unexpected.

If what you actually want is a readable archive of an article rather than a facsimile of the page, strip it to the content first. Fewer elements means fewer things to break across a boundary.

## Plain text is the easy case

[Text to PDF](/tool/text-to-pdf) has no layout to preserve, so the only decisions are page size, margins, font and size. That makes it reliable, and useful for the specific job of turning a log, a transcript or an exported note into something that paginates and prints predictably.

The one thing to watch is line length. Text files often contain lines far wider than a page. They either wrap, which is usually fine, or overflow, which is not. If the content is code or tabular output where wrapping destroys the meaning, landscape orientation and a smaller monospace size is the fix.

## Filling a form is not drawing on a page

A PDF form has real fields: named objects with types, values and validation, defined in the document's AcroForm structure. Filling them properly means setting those values.

The alternative people fall into is typing text on top of the page as an annotation or a drawing. It looks the same on screen and behaves completely differently. The values are not in the fields, so anything that reads the form programmatically, which is the point of a form, sees an empty document.

[Fill PDF forms](/tool/pdf-fill-forms) sets the field values. Then, before you send it:

> [!TIP]
> Flatten the document. Flattening converts filled values into ordinary page content, which locks them in, removes the chance of a viewer clearing them, and avoids field-name collisions if the file is later merged into a bundle. Flatten last, after filling and after any signing decision, because it changes the bytes.

## Watermarks: content or annotation

A [watermark](/tool/pdf-watermark) can be added two ways, and the difference decides whether it is worth anything.

**As page content** it is drawn into the content stream, the same layer as the text. Removing it means editing the page.

**As an annotation** it sits in a separate layer, and any viewer with an annotation panel deletes it in two clicks.

If the watermark is decorative, either is fine. If it says DRAFT or CONFIDENTIAL and you care that it stays, it needs to be content. Even then, be clear about what it does: a watermark marks a document, it does not protect it. Anyone determined enough can re-render the pages. It is a label, useful for stopping a draft being mistaken for a final, and not a control.

## When the file will not open at all

A PDF ends with a cross-reference table saying where every object lives. It is the part most often damaged by a truncated download, a failed sync or a crash mid-save, and a viewer that cannot read it refuses the whole file even though the page content is usually intact.

[Repairing a PDF](/tool/pdf-repair) means scanning the file for object definitions and rebuilding that index from what is found. It often works, because the damage is to the map rather than the territory.

What it cannot do is invent bytes that are not there. If a download stopped at 60%, the last 40% of the pages do not exist and no repair recovers them. What you usually get back is the pages that made it, which is worth having.

Everything above runs in the browser tab: rendering HTML, laying out text, setting field values and rebuilding a cross-reference table are all things a modern browser does without a server. Given that filled forms are, by definition, documents with your details in them, that is the property worth having.`,
  },

  {
    slug: 'images-to-pdf-and-comparing-versions',
    title: 'Turning photos into a PDF, and finding what changed between two versions',
    description: 'Scanning with a phone and assembling the result into a PDF has a few decisions in it. So does working out what actually changed in a revised contract.',
    excerpt: 'Twelve photos of pages is not a document until something gives them an order, a page size and a sensible resolution.',
    category: 'pdf',
    tags: ['pdf', 'scanning', 'compare'],
    published: '2026-09-14',
    relatedTools: ['jpg-to-pdf', 'pdf-reorder', 'pdf-compare', 'pdf-merge'],
    takeaways: [
      'Set a page size when building a PDF from photos, or every page inherits the dimensions of its image and the document prints inconsistently.',
      'Filenames sort as text, so IMG_10 comes before IMG_9. Zero-pad before relying on the order.',
      'Photograph pages at around 200 to 300 DPI equivalent. More is wasted bytes; less loses small print.',
      'Comparing PDFs works on text when there is text, and falls back to a visual diff when there is not.',
    ],
    body: `You photograph twelve pages of a signed agreement with your phone. You now have twelve JPEGs, in an order determined by how fast you were working, each 4000 pixels wide and 3 MB. Turning that into something a solicitor will accept involves four decisions, and it is worth making them deliberately.

## Order comes from filenames, and filenames sort as text

The first surprise is almost always ordering. \`IMG_9.jpg\` sorts after \`IMG_10.jpg\`, because \`1\` precedes \`9\` character by character. Photographs from a phone usually carry sequential names that avoid this, but anything renamed by hand will hit it.

Two ways out. Zero-pad the names, so \`page-01\` through \`page-12\` sort correctly as text. Or accept whatever order you get and fix it afterwards by [reordering the pages](/tool/pdf-reorder) with thumbnails in front of you, which is more reliable for a short document because you can see what you are doing.

## Page size is a decision you should make

When [converting images to PDF](/tool/jpg-to-pdf), each page can either take the dimensions of its image, or be fitted to a standard size like A4.

Taking the image dimensions means a document whose pages are all slightly different sizes, because you did not hold the phone at a consistent distance. It looks fine on screen and prints inconsistently, with content scaled differently page to page.

Fitting to A4 gives a uniform document. The trade is margins: an image with a different aspect ratio to A4 will be letterboxed, and the page will have white bands. That is almost always preferable to a document that prints at twelve different scales.

> [!TIP]
> Crop each photo to the page edges before converting. It removes the desk, the shadow and your fingers, and it makes the aspect ratio much closer to A4, which removes most of the letterboxing at the same time.

## Resolution: more is not better

A phone photograph of a sheet of A4 at 4000 pixels wide is roughly 480 DPI. That is more detail than the scanner in a solicitor's office would produce and far more than anyone needs to read.

The useful range is 200 to 300 DPI equivalent, which for A4 means about 1700 to 2500 pixels on the long edge. Below that, small print and superscripts start to break down, and OCR accuracy drops sharply. Above it, you are paying megabytes per page for detail nobody will see.

Twelve pages at 3 MB each gives a 36 MB PDF that will bounce off most email limits. The same twelve at a sensible resolution is 3 to 5 MB. Resize the images before converting rather than compressing the PDF afterwards, because you get a cleaner result from downscaling once than from downscaling an already-JPEG-compressed page.

## Then comparing two versions

The other half of document work is the opposite question: someone has sent back a revised version and you need to know what moved.

[Comparing two PDFs](/tool/pdf-compare) works in one of two ways depending on what is in them.

**If both have real text**, the comparison is textual: extract the words from each and diff them. This finds inserted clauses, deleted sentences and changed numbers precisely, and it is what you want for a contract.

**If either is a scan**, there is no text to compare, so the fallback is visual: render both to images and highlight the regions that differ. This catches that something changed on page 4 without being able to say what.

Both have a failure mode worth knowing about.

> [!WARNING]
> Reflow produces false positives. If a paragraph was added on page 2, every subsequent page has shifted, and a visual comparison will report the entire rest of the document as changed. A textual comparison handles this correctly, which is another reason to keep documents as real text rather than scans wherever you have the choice.

## The sequence for a phone-scanned document

1. Photograph each page square-on, in even light, with the page filling the frame.
2. Crop each image to the page edges.
3. Resize so the long edge is around 2000 pixels.
4. [Convert to PDF](/tool/jpg-to-pdf), fitting pages to A4.
5. Check the order and [reorder](/tool/pdf-reorder) if anything is out of place.
6. Run [OCR](/tool/pdf-ocr) if the text needs to be searchable or comparable later.

Step six is the one people skip and later regret, because it is the difference between a document you can search, quote and diff, and twelve pictures.

All of these run in the browser here. Given that the documents people photograph page by page are overwhelmingly contracts, identity documents and medical records, that is the property worth having.`,
  },

  {
    slug: 'preparing-files-for-print',
    title: 'Sending a file to a printer: bleed, DPI and why the colours shift',
    description: 'Screens emit light and mix colours additively; ink absorbs it and mixes subtractively. That one difference explains most print disappointments.',
    excerpt: 'The blue on your screen cannot be reproduced in ink. Knowing which of your colours are out of gamut before you print saves the reprint.',
    category: 'pdf',
    tags: ['print', 'dpi', 'colour', 'bleed'],
    published: '2026-09-12',
    relatedTools: ['pdf-crop', 'image-resize', 'color-converter', 'pdf-page-numbers'],
    takeaways: [
      'Print resolution is 300 DPI at final size, so a 6 inch wide image needs about 1800 pixels.',
      'Bleed means extending artwork past the trim line, usually 3mm, because guillotines are not exact.',
      'Screens are RGB and additive; ink is CMYK and subtractive, so vivid screen colours have no ink equivalent.',
      'Pure black text should be 100% K, not a mix of all four inks, or it will look fuzzy where the plates misalign.',
    ],
    body: `You send a poster to a printer. It comes back with a white strip down one edge, the photographs look soft, and the vivid blue in your logo has arrived as a flat purple-grey. Three separate problems, and all three are predictable before you send the file.

## Resolution is measured at final size

Screen work is measured in pixels; print is measured in dots per inch **at the size it will be printed**. The two only connect once you fix the physical dimensions.

The standard is 300 DPI. So:

\`\`\`
pixels needed = inches x 300
\`\`\`

An image printed 6 inches wide needs about 1800 pixels across. A full A4 page at 8.27 inches wide needs about 2480.

| Printed at | Pixels needed (300 DPI) |
|---|---|
| Business card, 3.5 in | 1050 |
| A5 flyer, 5.8 in | 1748 |
| A4 page, 8.27 in | 2480 |
| A3 poster, 11.7 in | 3508 |

A web image at 800 pixels wide is fine on screen and prints acceptably at about 2.5 inches. Stretched across an A4 page it is roughly 96 DPI and will look visibly soft.

> [!WARNING]
> [Resizing](/tool/image-resize) upward does not add detail. Enlarging an 800px image to 2480px interpolates, producing a bigger soft image rather than a sharper one. If the pixels are not there, the only fix is a higher-resolution source.

Large-format work is the exception. A billboard read from thirty metres is fine at 30 DPI, because viewing distance is what actually determines the resolution required.

## Bleed, and the white strip

A guillotine cutting a stack of paper is accurate to about a millimetre, not to zero. If your background colour stops exactly at the trim line, any drift leaves a sliver of unprinted paper along the edge.

**Bleed** is artwork extended past the trim line so there is something to cut into. The convention is 3mm on each side, so an A4 document is supplied at 216x303mm rather than 210x297mm.

There is a matching rule on the inside: keep text and anything that must not be clipped at least 3 to 5mm **inside** the trim line. That inner boundary is the safe area, and it exists for the same reason as the [safe area on a social preview image](/blog/social-preview-images), which is that something downstream is going to crop your work by an amount you do not control.

[Cropping a PDF](/tool/pdf-crop) is useful for normalising pages that arrived at inconsistent sizes before you add bleed. It is worth repeating that cropping only changes which rectangle is displayed and deletes nothing, so it is a layout operation and never a way to remove something sensitive from a page.

## Why the colours change

Screens are **additive**. They emit red, green and blue light, and more of everything gives white.

Ink is **subtractive**. Cyan, magenta, yellow and black absorb light from the paper, and more of everything approaches a muddy dark brown, which is why black gets its own plate rather than being mixed.

These are different physical processes with different ranges of achievable colour. The CMYK gamut is smaller than sRGB, and it is smallest exactly where screens are most impressive: saturated blues, bright oranges, vivid greens and anything approaching neon.

A colour outside the printable gamut gets mapped to the nearest one that is achievable. Nobody consulted you about the substitution, and it is why the electric blue became purple-grey.

The practical consequence is not that you must work in CMYK, but that you should **expect the shift and check for it early**. A [colour converter](/tool/color-converter) that shows you HEX, RGB and HSL together makes it easier to reason about what you are asking for: a colour at very high saturation and mid lightness is the profile most likely to be unreachable in ink.

> [!TIP]
> Black text is a specific trap. Pure black should be 100% K and nothing else. If it is mixed from all four inks, any tiny misregistration between the plates leaves coloured fringes around every letter, which reads as blurry text. Large black areas are the opposite case and often want a rich black mix to avoid looking washed out.

## Fonts and the document itself

Fonts must be embedded, or the printer's system substitutes something metrically similar and your line breaks move. Exporting to PDF properly embeds a subset; printing to PDF through a driver is less reliable, which is the same distinction that decides whether a [Word file converts back cleanly](/blog/word-to-pdf-and-back).

If a font's licence forbids embedding, convert that text to outlines. It stops being editable and it prints exactly as drawn.

## A checklist before you send

1. Every image at 300 DPI **at its printed size**, not at its pixel dimensions in isolation.
2. Bleed added, usually 3mm, with the background extending into it.
3. Text and logos at least 3mm inside the trim line.
4. Fonts embedded or outlined.
5. Black text set to 100% K.
6. [Page numbers and any headers](/tool/pdf-page-numbers) added last, after the page sizes are final.
7. A single PDF, with pages in reading order, checked from first page to last.

Point seven catches more errors than the other six combined, and it takes two minutes.

Cropping, resizing and stamping all run in this browser tab, which is the useful property when the document in question is an unreleased design or a client's confidential report on its way to a print shop.`,
  },

  {
    slug: 'pdf-a-and-long-term-archiving',
    title: 'PDF/A: making a document still readable in twenty years',
    description: 'An ordinary PDF depends on fonts and software that may not exist later. PDF/A is the version that carries everything it needs.',
    excerpt: 'A PDF that renders perfectly today can open wrong in a decade, because it borrowed a font from your machine and that machine is gone.',
    category: 'pdf',
    tags: ['pdf-a', 'archiving', 'compliance', 'fonts'],
    published: '2026-09-09',
    relatedTools: ['pdf-metadata', 'pdf-compress', 'pdf-ocr', 'pdf-flatten'],
    takeaways: [
      'PDF/A requires every font to be embedded, because a font referenced but not included is the main way old PDFs break.',
      'It forbids JavaScript, external links to content, encryption and audio or video, so the file is self-contained.',
      'A scanned page saved as PDF/A is still just an image unless OCR has added a text layer.',
      'Conversion does not validate itself. A file can claim PDF/A conformance and fail a real check.',
    ],
    body: `Open a PDF from 2006 and the text may render in a font you did not choose, with the spacing subtly wrong and a few characters missing. The file is not corrupt. It named a font it expected the reader to have, that reader is a different program on a different operating system, and the substitution is the best it can do.

PDF/A exists to make that impossible.

## What the A stands for

PDF/A is a restricted profile of PDF, standardised by ISO, for documents that need to be readable long after the software that made them is gone. It is not a different file format: a PDF/A file is a valid PDF and opens in any reader.

The restrictions are the point. A conforming file must:

- **Embed every font it uses**, including a subset of the glyph program itself.
- **Declare colour unambiguously**, with an embedded colour profile rather than a reference to one.
- **Carry its own metadata** in XMP form inside the file.
- **Contain no JavaScript**, no embedded audio or video, no launch actions.
- **Not be encrypted.**
- **Not depend on external content**, so no images loaded from a URL.

The common thread is self-containment. Anything that requires the outside world to still exist is forbidden, because in twenty years it may not.

## The conformance levels

| Level | Means |
|---|---|
| PDF/A-1b | Basic. The visual appearance is reliably reproducible. |
| PDF/A-1a | Accessible. Adds a tagged structure tree and a defined reading order. |
| PDF/A-2 | Adds JPEG2000, transparency, and PDF/A file attachments. |
| PDF/A-3 | Adds attachments of any type, which is how e-invoicing embeds XML. |

For most archiving, 1b or 2b is what is asked for. The **a** levels additionally require the document to be tagged, which is the same structure discussed in [alt text and accessible documents](/blog/alt-text-and-accessible-documents), and which also happens to be what makes a PDF convert back to a usable Word file.

PDF/A-3 is worth knowing about for a specific reason: it allows an arbitrary file to ride inside the PDF. European e-invoicing formats use exactly this, embedding machine-readable XML inside a human-readable invoice, so one file serves both readers.

## What conversion actually changes

Running a normal PDF through a PDF/A conversion typically does four things.

It **embeds missing fonts**, which is where most of the added size comes from. It **converts colour** to a device-independent space with a profile attached. It **strips** JavaScript, embedded media and anything else on the forbidden list. And it **writes XMP metadata** identifying the conformance level.

> [!WARNING]
> If a font is unavailable at conversion time and cannot be embedded, the converter substitutes one. The resulting file conforms, and it no longer looks like your original. Convert from a machine that has the fonts, and check the output before filing it.

Removing encryption is also worth noticing, because archival and confidentiality pull in opposite directions here. A PDF/A file cannot be password-protected. If the document is sensitive, the protection has to come from where you store it rather than from the file.

## Scans need OCR, or the archive is an image

This is the failure that undermines whole archives.

A scanned page saved as PDF/A is a conforming file containing a picture. It will still display in twenty years, which satisfies the letter of the requirement, and nobody will be able to search it, quote it or read it with a screen reader.

[Running OCR](/tool/pdf-ocr) adds an invisible text layer beneath the image, which is what turns a preserved picture into a preserved document. For anything going into long-term storage this is not optional, and it is the step most often skipped because the file looks fine either way. The accuracy caveats in [OCR on scanned PDFs](/blog/ocr-scanned-pdf-explained) still apply, so a high-value document deserves a check.

## Before you file something

1. **Flatten filled forms.** Form field values are interactive state; [flattening](/tool/pdf-flatten) turns them into page content that cannot be cleared.
2. **OCR anything scanned.**
3. **Convert to PDF/A**, at the level you were asked for.
4. **Check the [metadata](/tool/pdf-metadata).** Title, author and subject are what a future archivist searches on, and the defaults are usually wrong.
5. **Open the result and compare it to the original**, particularly anything using an unusual font.

> [!TIP]
> Do the compression thinking before conversion, not after. Embedding fonts makes the file larger, so a document [compressed](/tool/pdf-compress) first and converted second lands smaller than one done the other way round. Just do not compress so hard that the archived scan becomes unreadable, since the whole exercise is about the copy that outlives the original.

## The honest limit

PDF/A guarantees that the bytes describe a self-contained document. It does not guarantee that anyone in 2046 still has a PDF reader, that your storage medium survived, or that the file was not quietly corrupted in between.

Those are separate problems, and they are the ones covered by [a backup that works](/blog/a-backup-that-actually-works): more than one copy, on more than one kind of media, with checksums so you can prove the file you restore is the file you filed.`,
  },

  {
    slug: 'getting-tables-out-of-a-pdf',
    title: 'Getting a table out of a PDF without retyping it',
    description: 'PDFs have no tables, only text positioned in a grid. That is why extraction produces jumbled columns, and what to do about it.',
    excerpt: 'A table in a PDF is not a table. It is text at coordinates that happens to line up, which is why copying it gives you one long column.',
    category: 'pdf',
    tags: ['pdf', 'tables', 'extraction', 'csv'],
    published: '2026-09-10',
    relatedTools: ['pdf-extract-text', 'pdf-ocr', 'csv-editor', 'csv-cleaner'],
    takeaways: [
      'PDF has no table structure. Extraction infers columns from x-coordinates, which is why merged cells and wrapped text break it.',
      'Copying a table usually yields one column because the text is stored in drawing order, not reading order.',
      'A tagged PDF does carry real table structure, and extracts reliably. An untagged one is guesswork.',
      'Always check totals after extracting. A shifted column produces numbers that look plausible and are wrong.',
    ],
    body: `You select a table in a PDF, copy it, paste into a spreadsheet, and get every value stacked in column A in an order that does not match what you saw.

Nothing went wrong. You asked a format that has no concept of tables to give you one.

## What a table in a PDF actually is

A PDF content stream says where to draw each glyph. A table is text placed so that a human reads it as a grid, plus possibly some lines drawn separately. There is no row object, no cell, no column, and no relationship between the number in one place and the header above it.

So extracting a table means **inferring** the structure: grouping glyphs into text runs, clustering their x-coordinates into likely column boundaries, clustering y-coordinates into rows, and hoping the layout was regular enough for that to work.

This is the same inference problem as [converting a PDF back to Word](/blog/word-to-pdf-and-back), applied to a grid instead of paragraphs, and it fails in the same situations.

## Why it goes wrong

**Reading order is drawing order.** Glyphs are stored in whatever sequence the producer emitted them, which is often column by column rather than row by row. Copying then yields a column when you wanted a row.

**Merged cells break the grid.** A heading spanning three columns gives the clustering algorithm a text run whose x-range covers three boundaries at once.

**Wrapped text creates phantom rows.** A description that runs onto a second line looks like another row to anything counting y-positions.

**Right-aligned numbers shift boundaries.** A column of figures aligned right has its left edge determined by digit count, so a column boundary computed from x-coordinates moves when one value is longer.

**Borderless tables have no hint at all.** Where there are no ruling lines, whitespace is the only signal.

> [!NOTE]
> A **tagged** PDF is a different situation. Tagging records a real structure tree including table, row and cell elements, so extraction reads structure rather than guessing at it. Documents exported properly from Word or produced by an accessibility-conscious publisher usually have this. Documents made by printing to PDF never do.

## The approach that works

**1. Find out what you are dealing with.** Try to select a sentence. If nothing highlights, it is a scan and there is no text to extract. [Run OCR](/tool/pdf-ocr) first, at 300 DPI or better, and accept that the accuracy caveats apply to every digit.

**2. [Extract the text](/tool/pdf-extract-text)** and look at what comes out before doing anything else. The shape of the failure tells you what to fix. Values in reading order with inconsistent separators is recoverable. Values in the wrong order is a reading-order problem and usually needs a different approach.

**3. Work one page at a time** if the table spans pages. Repeated headers mid-document are a common source of rows that are not data.

**4. Normalise the separators.** Extracted output is usually space-aligned rather than delimited. Converting runs of whitespace into a single delimiter turns it into something a [CSV cleaner](/tool/csv-cleaner) or [editor](/tool/csv-editor) can work with.

**5. Fix it in a grid, not in text.** Once it is roughly tabular, a [CSV editor](/tool/csv-editor) is far faster for the remaining corrections than editing delimiters by hand.

## Checking, which is the part that matters

Extraction failures do not announce themselves. A column shifted by one produces a table full of numbers that are individually plausible and collectively wrong, and nothing highlights in red.

> [!WARNING]
> Always reconcile against something. Add up a column and compare it to the printed total. Count the rows and compare them to the document. Spot-check the first and last row of every page boundary, because that is where repeated headers and split rows do their damage.

Two more things worth checking, both covered in [why CSVs break in Excel](/blog/why-csv-files-break-in-excel): identifiers that begin with a zero, and long numbers that a spreadsheet will silently convert to scientific notation and truncate. A table of account numbers extracted correctly can still be destroyed by the program you paste it into.

## When to stop

If the document is a bank statement, an invoice or any published report, ask whether the data exists somewhere better. Most institutions offer a CSV export of the same information, and five minutes looking for it beats an hour of extraction and reconciliation.

Extraction is the right tool when the PDF genuinely is the only copy, which is common for older archives and for documents you received rather than generated.

[Text extraction](/tool/pdf-extract-text), [OCR](/tool/pdf-ocr) and the [CSV tools](/tool/csv-editor) here all run in the browser, which is the relevant property given that the tables people most often need out of a PDF are financial statements and payroll reports.`,
  },
];
