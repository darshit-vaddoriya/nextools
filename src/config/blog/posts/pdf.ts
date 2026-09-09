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
    body: `You drag a 42 MB PDF into a compressor, wait, and get back a 41.6 MB file. The same tool takes someone else's 30 MB scan down to 2 MB. Neither result is a bug — the two files are heavy for completely different reasons.

## What is actually inside a PDF

A PDF is not a picture of a page. It is a container holding numbered objects: page definitions, content streams describing where to draw each glyph and line, embedded font programs, images, and a cross-reference table that says where each object lives in the file.

Almost every one of those content streams is already compressed with Flate, the same algorithm as ZIP. That single fact explains most disappointing results: **if your PDF is mostly text, the bytes are already squeezed and there is very little left to take.**

So when a file is huge, the weight is nearly always in one of three places: images, fonts, or accumulated junk.

## The four things a compressor can do

**1. Downsample images.** A phone photo pasted into a document may be 4000 pixels wide, sitting in a box 6 cm across. At print resolution that box only needs about 700 pixels. Throwing away the other 3300 columns of pixels is invisible on paper and on screen, and it is where the dramatic savings come from.

**2. Re-encode images.** A page scanned as PNG (lossless) can be re-saved as JPEG at quality 70. For photographic or scanned content the visual difference is small and the size drop is often 80–90%.

**3. Subset fonts.** A full font file can be several hundred kilobytes because it contains every glyph, including scripts you never used. Subsetting keeps only the characters the document actually prints. Embed four unsubsetted font weights and you have paid a megabyte before writing a word.

**4. Remove the leftovers.** Page thumbnails, old incremental-save revisions, unused objects, document metadata, embedded file attachments and JavaScript. Individually small, collectively meaningful — and rewriting the cross-reference table as a compressed object stream tidies up the rest.

## Why your file behaves the way it does

| File type | What dominates | Realistic saving |
|---|---|---|
| Scanned document (images of pages) | JPEG/PNG page images | 60–90% |
| Report with photos and charts | Embedded images | 40–80% |
| Contract, invoice, text-only | Already-deflated text streams | 0–10% |
| Slide deck exported to PDF | Background images, embedded fonts | 30–70% |

If you have a text-only PDF that will not shrink, no tool will fix that — there is simply nothing left to compress. The honest answer is to send it as it is.

## The part people get wrong

Compression is lossy for images and lossless for text. That means:

- Text stays perfectly sharp and selectable no matter how hard you compress. You are never blurring your words.
- Images degrade permanently. Compress a scan twice and you compress already-compressed JPEG data, which introduces visible blocking around letters.
- **Compress once, from the highest-quality original you have.** Repeating the process is how documents end up looking like a photocopy of a fax.

Also worth knowing: compression is not encryption. Shrinking a file does nothing to protect it, and a compressed PDF is exactly as readable to anyone who opens it.

## A practical order of operations

1. Check what you are dealing with. Open the PDF and try to select a sentence with your cursor. If text highlights, it is a digital PDF. If nothing selects, it is a scan and image settings are what matter.
2. Compress once at a moderate setting and look at the result before going harder.
3. If a scan is still too large, reduce the target resolution rather than the JPEG quality — 200 DPI is fine for reading on screen, 300 DPI for printing text.
4. If only three pages of a fifty-page document matter, extract those pages instead. A smaller document beats a degraded one.
5. Strip metadata separately if privacy is the concern; it barely affects size but it does remove author names, software fingerprints and edit timestamps.

## Where this runs matters

Every one of these steps is arithmetic on bytes your browser already has. There is no technical reason to send a contract, a bank statement or a passport scan to someone else's server to have its images resampled. NextTool's [PDF compressor](/tool/pdf-compress) does the whole pass locally, which is why there is no upload progress bar and no file-size cap beyond your own memory.

The practical benefit is speed as much as privacy: a 50 MB file never has to travel up and back down a connection before you see the result.`,
  },

  {
    slug: 'merge-pdf-files-without-uploading',
    title: 'Merging PDFs: what gets preserved, what quietly breaks',
    description: 'Combining PDFs is not just stapling pages. Forms, bookmarks, links and page sizes each behave differently — here is what survives a merge.',
    excerpt: 'Merging looks trivial until a signed form comes out blank or a 3 MB and 4 MB file produce a 12 MB result. Both have the same cause.',
    category: 'pdf',
    tags: ['pdf', 'merge', 'forms'],
    published: '2026-08-12',
    relatedTools: ['pdf-merge', 'pdf-reorder', 'pdf-page-extractor', 'pdf-flatten'],
    body: `Merging two PDFs sounds like concatenating two files. It is not. A PDF is an object graph with an index at the end, so merging means copying objects out of one graph into another, renumbering every reference, and rebuilding the index. Most of the surprises come from what happens to the objects that are not simple page content.

## What survives reliably

- **Page content.** Text, vector graphics and images copy across intact. Nothing is re-rendered, so quality is unchanged.
- **Embedded fonts.** They come along with the pages that use them.
- **Page dimensions and rotation.** Each page keeps its own size, which is why an A4 document merged with a US Letter one produces a file whose pages are subtly different widths.
- **Images.** Copied byte-for-byte, not recompressed.

## What often does not

**Interactive form fields.** A PDF form lives in a document-level structure called the AcroForm, plus per-page widget annotations. If both documents have a field named \`name\`, you now have two fields with one name, and viewers will either link them (typing in one fills the other) or drop one. If you are merging filled forms, flatten them first — flattening converts the filled values into ordinary page content, which merges perfectly.

**Bookmarks and outlines.** These are a document-level tree. Many merge implementations rebuild pages but not the outline, so a 200-page manual with a full table of contents can come out with no navigation at all.

**Digital signatures.** A cryptographic signature covers a specific byte range of a specific file. Merging changes the bytes, so the signature is mathematically invalidated. This is correct behaviour, not a defect — a signature that survived editing would be worthless.

**Internal links.** A link that pointed to "page 12 of this document" may now point at the wrong page unless destinations are remapped.

**Attachments, JavaScript and embedded media.** Frequently dropped.

## Why the merged file is bigger than the sum

Merge a 3 MB and a 4 MB file and you can get 12 MB. The usual culprit is fonts and resources being copied twice. If both documents embed the same font, a naive merge stores two full copies rather than recognising they are identical. The same applies to a logo image repeated on every page of both files.

The fix is a compression pass after merging, which deduplicates identical objects. Merge first, compress second — never the other way round.

## A merge checklist that avoids rework

1. **Decide the order before you start.** Reordering after the fact means dragging thumbnails around; naming your files \`01-cover.pdf\`, \`02-body.pdf\` sorts the problem out at the source.
2. **Flatten any filled forms.** This locks in the values and removes the field-name collision problem entirely.
3. **Check page sizes.** Mixing A4 and Letter is fine on screen and annoying in print. If it will be printed, normalise first.
4. **Merge, then compress.** In that order, for the deduplication reason above.
5. **Open the result and scroll the whole thing.** Especially the seams between documents — that is where a missing page or a wrong rotation shows up.

## The upload question

Merging is one of the most common reasons people hand documents to an unknown web service, and it is also one of the least justified. The operation is pure object copying: no rendering, no server-side libraries you could not run locally, no computation a laptop struggles with.

NextTool's [PDF merger](/tool/pdf-merge) runs the whole thing in the browser tab. The files are read into memory, the new document is assembled, and a download is produced. Nothing is transmitted, which matters when the documents in question are a lease, a medical report or a set of ID scans — exactly the sort of thing people merge most often.

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
    body: `There is a specific, repeated, very public failure mode in document handling: someone opens a PDF, draws filled black rectangles over the sensitive passages, saves, and publishes. The passages are then recovered by anyone who selects the page and pastes it into a text editor.

It has happened in court filings, government disclosures and corporate reports. The people involved were not careless with the concept of redaction; they misunderstood what a PDF is.

## Why the black box fails

A PDF page has layers of drawing instructions. The text instruction says *draw the glyphs "Account 4471-8890" at these coordinates*. When you add a rectangle, you append a new instruction: *fill this area with black*.

The rectangle is drawn on top. The text instruction is still there, unchanged. A PDF viewer renders the black box over the letters, but the letters remain in the content stream, and:

- **Select-all and copy** extracts them, because text extraction reads the stream, not the rendered pixels.
- **Search** finds them.
- **Any text-extraction tool** dumps them in plain sight.
- **Removing the annotation** — if the rectangle was added as an annotation rather than page content — restores the page instantly.

The same trap applies to white boxes, highlighter shapes, and "hiding" content by moving an image over it.

## What real redaction does

Proper redaction removes the underlying content, not just its appearance. That means:

1. **Deleting the text operators** for the redacted region from the content stream, so there is nothing left to extract.
2. **Cropping or replacing image data** in that region, if the sensitive material is part of a scan.
3. **Drawing an opaque mark** so a reader can see that something was removed — this part is cosmetic, but it is the honest signal.
4. **Clearing metadata**, because document properties, XMP records and edit history frequently carry the author's name, the original filename and sometimes a full revision trail.
5. **Removing annotations and comments**, which live outside the page content and are routinely forgotten.

## The blunt method that always works

If the document is going to a stranger and the stakes are high, there is a crude technique that cannot fail: **flatten the page to an image.**

Convert the PDF pages to images, apply the black marks to the images, then rebuild a PDF from those images. Because a raster image has no text layer at all, there is nothing to extract. You lose selectable text and searchability for the whole document, and the file gets larger — but the redaction is unarguable.

Use this when the document is short, the recipient is adversarial, or you cannot verify the tooling.

## Verifying your redaction

Never trust the visual result. Run these three checks on the output file:

1. **Select all, copy, paste into a plain text editor.** Read what comes out. If any redacted string appears, the redaction failed.
2. **Search the document** for a distinctive redacted term — a surname, an account number.
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
    excerpt: 'A scanned PDF is a stack of photographs. OCR is what turns those photographs back into words — when the input gives it a fair chance.',
    category: 'pdf',
    tags: ['ocr', 'pdf', 'scanning'],
    published: '2026-08-28',
    relatedTools: ['pdf-ocr', 'ocr-image', 'pdf-extract-text', 'image-adjust'],
    body: `There are two completely different kinds of PDF, and telling them apart takes two seconds: try to select a sentence with your cursor. If the text highlights, the document contains real text. If nothing happens, you are looking at pictures of pages and no amount of "extract text" will help — you need OCR.

## What OCR is doing

Optical character recognition converts pixels into characters. Modern engines such as Tesseract run roughly this pipeline:

1. **Binarisation** — convert the greyscale scan to pure black and white, adapting the threshold per region so a shadow across the page does not swallow a paragraph.
2. **Deskew and despeckle** — straighten a page scanned at an angle, drop isolated specks of noise.
3. **Layout analysis** — find blocks, then lines, then words. This is where columns, tables and sidebars are identified or misidentified.
4. **Recognition** — since version 4, Tesseract feeds line images to an LSTM neural network that reads a line as a sequence rather than classifying glyphs one at a time. This is why it handles joined and slightly distorted type far better than older engines.
5. **Language modelling** — the engine weighs its character guesses against a dictionary and character-sequence statistics for the language you selected. Choosing the wrong language is one of the biggest accuracy losses available, because the model will happily bend words toward the wrong vocabulary.

## Resolution is the single biggest factor

OCR accuracy depends on how many pixels make up each character. The rule of thumb the Tesseract project itself gives is around **300 DPI for ordinary body text**.

- Below ~200 DPI, small type loses the fine distinctions between similar letters and you start seeing classic confusions: \`rn\` read as \`m\`, \`l\`/\`1\`/\`I\`, \`0\`/\`O\`, \`5\`/\`S\`.
- Above ~400 DPI you gain almost nothing and pay for it in processing time and memory.
- For unusually small print — footnotes, legal fine print, receipts — 400–600 DPI genuinely helps.

If you are scanning the document yourself, this is the one setting worth getting right. Rescanning at 300 DPI beats any amount of post-processing on a 150 DPI capture.

## What wrecks accuracy

- **Photographs of screens or paper taken at an angle.** Perspective distortion is not the same as skew and is much harder to correct.
- **Uneven lighting**, especially a phone's shadow across the page.
- **Coloured or patterned backgrounds**, which confuse binarisation.
- **Handwriting.** General-purpose OCR is built for printed type. Cursive handwriting recognition is a different problem and mostly a different class of model.
- **Complex tables.** The characters may be read correctly while the structure — which value belongs to which column — is lost entirely.
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

That is how NextTool's [PDF OCR](/tool/pdf-ocr) and [image OCR](/tool/ocr-image) work. It is slower than a datacentre GPU, and the trade is that your medical records, contracts and ID documents — which is overwhelmingly what people OCR — never leave the machine. Expect a few seconds per page, and expect the first run to pause while the language data downloads.`,
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

A black-ink document scanned in full colour stores three channels where one would do. Converting to greyscale typically cuts a scan by a third to a half with no loss of legibility — as long as the document does not rely on colour for meaning (a coloured official stamp, a highlighted clause, a chart).

Check the portal's requirements first. Some explicitly demand colour scans of ID documents.

## Step 4: compress once, from the original

Every compression pass re-encodes already-lossy data. Two 60% passes are visibly worse than one 40% pass at the same final size. If you have already compressed and it is still too big, go back to the original file and start again with harsher settings, rather than compressing the compressed version.

## Step 5: rebuild from images, as a last resort

For a stubborn scanned document, export the pages as JPEGs, compress those images individually where you have fine control, and rebuild a PDF from them. You lose any text layer, but for a document that never had one you lose nothing at all — and per-image control usually beats a whole-document slider.

## Common limits worth remembering

| Destination | Typical cap |
|---|---|
| Gmail / most email | 25 MB per message |
| Visa and passport portals | 1–2 MB per document |
| University applications | 500 KB – 2 MB |
| Job application portals | 2–5 MB |
| Government tender uploads | Often 1 MB, occasionally 100 KB |

When a form specifies both a size and a dimension requirement — common for photographs — meet the dimension requirement first, then compress.

## What not to do

- **Do not rename a JPEG to .pdf.** It will be rejected, and on some systems it will be silently accepted and then fail downstream.
- **Do not password-protect a file to shrink it.** Encryption does not reduce size, and many portals reject protected files outright.
- **Do not zip it** unless the portal asks for a zip. PDFs are already compressed internally, so the saving is marginal, and most upload forms only accept \`.pdf\`.
- **Do not compress an already-approved document** you may need to submit again. Keep the original.

## Doing this without uploading the document first

There is a real absurdity in uploading a passport scan to an unknown compression service in order to make it small enough to upload to an official portal. You have handed the document to two parties instead of one.

[Compression](/tool/pdf-compress), [page extraction](/tool/pdf-page-extractor) and [PDF-to-image conversion](/tool/pdf-to-jpg) on NextTool all run inside your browser, so the document only ever reaches the destination you actually intended.`,
  },
];
