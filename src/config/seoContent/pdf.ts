import { ToolSeoMap } from './types';

export const PDF_SEO_CONTENT: ToolSeoMap = {
  'pdf-merge': {
    intro:
      'PDF Merge lets you combine invoices, scanned contracts, lecture notes, or multi-part reports into a single tidy document without installing any software. Students stitching together separate chapter scans, freelancers assembling a proposal packet, and office workers consolidating signed forms all use it to save time before emailing or printing. Every file is joined right inside your browser tab, so the original documents never leave your device.',
    steps: [
      { title: 'Add your PDF files', description: 'Click the upload area or drag and drop two or more PDF files into the tool.' },
      { title: 'Reorder the files', description: 'Drag the file thumbnails into the exact order you want them to appear in the final document.' },
      { title: 'Merge the documents', description: 'Click Merge to combine all the pages into one continuous PDF.' },
      { title: 'Download the result', description: 'Save the combined PDF to your device once processing finishes.' },
    ],
    faqs: [
      { question: 'Is there a limit to how many PDFs I can merge?', answer: 'You can merge as many files as your browser memory allows; most users combine anywhere from 2 to several dozen PDFs without issue.' },
      { question: 'Are my files uploaded to a server?', answer: 'No. Merging happens entirely in your browser using JavaScript, so your documents never leave your computer.' },
      { question: 'Can I change the page order after merging?', answer: 'Yes, drag and drop the file thumbnails into any order before clicking Merge; the final PDF follows that exact sequence.' },
      { question: 'Will merging reduce the quality of my PDFs?', answer: 'No, merging simply concatenates the original pages, so text and image quality stay exactly the same.' },
      { question: 'Does it work with password-protected PDFs?', answer: 'Encrypted PDFs may fail to load since the tool cannot decrypt them in-browser; remove the password first if you run into issues.' },
      { question: 'Can I use this tool on my phone?', answer: 'Yes, it works on any modern mobile browser, though selecting and reordering many files is easier on a larger screen.' },
    ],
    useCases: [
      'Assembling a multi-chapter report from separate PDF exports before emailing it',
      'Combining scanned pages of a signed contract into one file for filing',
      'Merging several invoice PDFs into a single document for a client or accountant',
      'Stitching together lecture note scans into one file before an exam',
    ],
    tips: [
      'Upload files in any order first, then use drag-and-drop to fix the sequence rather than re-uploading.',
      'Merging does not fix inconsistent page sizes or orientations, so rotate or crop mismatched pages beforehand if you want a uniform look.',
      'If a file fails to load, check whether it is password-protected; remove the password first.',
    ],
  },
  'pdf-split': {
    intro:
      'PDF Split breaks a large PDF into individual pages or custom page ranges, which is handy when you only need to send one chapter of a report, extract a single invoice from a scanned batch, or share just a signature page instead of the entire contract. Everything is processed locally, so sensitive documents like tax records or legal filings never touch a remote server. The tool works directly on the file you upload and lets you preview pages before deciding how to split them.',
    steps: [
      { title: 'Upload your PDF', description: 'Select or drag in the PDF file you want to split.' },
      { title: 'Choose a split method', description: 'Split into individual pages, or specify custom page ranges such as 1-3, 5, 8-10.' },
      { title: 'Preview the pages', description: 'Check the page thumbnails to confirm you are splitting at the right points.' },
      { title: 'Download the pieces', description: 'Download each resulting PDF, or a zip containing all of them at once.' },
    ],
    faqs: [
      { question: 'Can I split by custom page ranges instead of one page at a time?', answer: 'Yes, you can enter specific ranges like 1-3 or 7,9,12 to extract exactly the pages you need.' },
      { question: 'Do I get a separate file for every page?', answer: 'By default each page becomes its own PDF, but you can group ranges together into fewer output files.' },
      { question: 'Is the original PDF uploaded anywhere?', answer: 'No, the split happens locally in your browser and the source file is never transmitted to a server.' },
      { question: 'What happens to bookmarks and links when I split a PDF?', answer: 'Internal links that point outside the extracted page range will no longer resolve, since those target pages are removed.' },
      { question: 'Can I split a scanned PDF the same way as a text PDF?', answer: 'Yes, splitting works on any valid PDF regardless of whether the pages contain scanned images or selectable text.' },
      { question: 'Is there a file size limit?', answer: 'Very large PDFs are limited mainly by your device memory and browser, so extremely large scanned files may take longer to process.' },
    ],
    useCases: [
      'Pulling a single invoice out of a large scanned batch to send separately',
      'Sharing just one chapter of a report instead of the whole document',
      'Separating a signature page from a contract for standalone signing',
      'Breaking a scanned book into individual page files for archiving',
    ],
    tips: [
      'Preview the page thumbnails before splitting to make sure your ranges line up with the content you expect.',
      'Use custom ranges like 1-3,7,10-12 instead of splitting every page individually when you only need a few sections.',
      'Remember that internal links pointing outside the extracted range will stop working in the split files.',
    ],
  },
  'pdf-compress': {
    intro:
      'Compress PDF shrinks bulky PDFs so they fit under email attachment limits or upload faster to portals, without sending your files to a third-party cloud service. It is popular with students submitting assignments with size caps, real estate agents attaching floor plans to listings, and anyone trying to reduce a scanned document full of high-resolution images. The compression algorithm runs directly in your browser tab and lets you compare the size before and after.',
    steps: [
      { title: 'Upload your PDF', description: 'Choose the PDF file you want to shrink.' },
      { title: 'Pick a compression level', description: 'Select a preset such as low, medium, or high compression depending on how much quality you can trade for size.' },
      { title: 'Run the compression', description: 'Click Compress and let the tool re-encode images and optimize the file structure.' },
      { title: 'Compare and download', description: 'Check the new file size against the original, then download the compressed PDF.' },
    ],
    faqs: [
      { question: 'How much smaller will my PDF get?', answer: 'Results vary widely depending on content, but image-heavy scanned PDFs often shrink by 50 percent or more, while text-only PDFs compress less dramatically.' },
      { question: 'Will compression make my text blurry?', answer: 'Text and vector content stay sharp; only embedded raster images are re-encoded, and higher quality presets keep visible loss minimal.' },
      { question: 'Is my document uploaded to the cloud to be compressed?', answer: 'No, compression runs locally using in-browser libraries, so the file never leaves your device.' },
      { question: 'Can I compress a PDF that already has small file size?', answer: 'You can, though there may be little to no reduction if the file has already been optimized or contains mostly text.' },
      { question: 'Does compressing remove any pages or content?', answer: 'No pages or text are removed; compression only re-encodes images and optimizes internal structures to reduce size.' },
      { question: 'Will it work on a scanned PDF made of only images?', answer: 'Yes, that is actually where compression has the biggest impact since it targets the embedded image data directly.' },
    ],
    useCases: [
      'Shrinking a scanned assignment or application so it fits under a portal or email attachment limit',
      'Reducing the size of a floor plan or brochure PDF before attaching it to a listing',
      'Preparing an image-heavy PDF for faster upload to a slow connection',
      'Cutting storage space used by an archive of scanned documents',
    ],
    tips: [
      'Start with a medium preset and compare the result before jumping to high compression, since image-heavy files can lose noticeable clarity at aggressive settings.',
      'Text-only PDFs will not shrink much because compression mainly targets embedded raster images.',
      'If a file is already optimized, expect minimal size reduction no matter the preset you choose.',
    ],
  },
  'pdf-to-word': {
    intro:
      'PDF to Word extracts readable text from a PDF and converts it into an editable DOCX file, saving you from retyping a contract, resume, or report that only exists as a PDF. It is especially useful for professionals who need to update an old document but no longer have the original source file. Conversion happens locally in the browser, so confidential resumes or agreements are never uploaded anywhere during the process.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file whose text you want to make editable.' },
      { title: 'Wait for text extraction', description: 'The tool reads the text content from each page of the PDF.' },
      { title: 'Review the output', description: 'Check that the extracted text and basic formatting look correct.' },
      { title: 'Download the DOCX file', description: 'Save the converted document and open it in Word or Google Docs to continue editing.' },
    ],
    faqs: [
      { question: 'Will the converted Word file keep the exact same formatting as the PDF?', answer: 'Basic text flow is preserved, but complex layouts, columns, and precise font styling may not match the original PDF exactly.' },
      { question: 'Does this work on scanned PDFs with no selectable text?', answer: 'No, this tool extracts existing text layers; for scanned or image-only PDFs use the PDF OCR tool first.' },
      { question: 'Is my PDF sent to a server for conversion?', answer: 'No, the extraction and DOCX generation both happen entirely in your browser.' },
      { question: 'Can I edit the DOCX file on my phone after downloading?', answer: 'Yes, any mobile Word-compatible app can open the resulting DOCX file for editing.' },
      { question: 'What happens to images embedded in the PDF?', answer: 'This tool focuses on text extraction, so embedded images may not carry over into the DOCX output.' },
      { question: 'Does it support multi-column PDFs like resumes?', answer: 'Text is extracted in reading order as best as possible, but multi-column layouts can sometimes come out slightly reordered.' },
    ],
    useCases: [
      'Updating an old contract or resume when the original Word file has been lost',
      'Turning a PDF report into an editable draft for revisions or reuse',
      'Repurposing text from a PDF brochure into a new document',
      'Converting a received PDF form into an editable outline before filling it out in Word',
    ],
    tips: [
      'Check complex layouts like tables and multi-column resumes carefully, since formatting rarely survives conversion perfectly.',
      'Run scanned or image-only PDFs through the PDF OCR tool first, since this tool only extracts existing text layers.',
      'Expect embedded images to be dropped, so re-insert any logos or figures manually after conversion.',
    ],
  },
  'pdf-to-jpg': {
    intro:
      'PDF to Image renders each page of a PDF as a standalone JPG or PNG file, which is useful for pasting a page into a slide deck, posting a flyer on social media, or generating thumbnails for a document library. Designers and marketers often use it to pull a single page out of a brochure PDF for quick sharing. Rendering happens on your own device using the browser canvas, so nothing is uploaded to convert your pages into images.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file you want to convert to images.' },
      { title: 'Choose format and quality', description: 'Pick JPG or PNG output and set the resolution or quality level.' },
      { title: 'Convert the pages', description: 'The tool renders every page as a separate image file.' },
      { title: 'Download images', description: 'Download individual pages or a zip file containing all converted images.' },
    ],
    faqs: [
      { question: 'Can I choose the image resolution?', answer: 'Yes, you can select a quality or scale setting so exported images are sharp enough for printing or presentations.' },
      { question: 'Does it convert every page, or just one?', answer: 'By default every page is converted, but you can select specific pages if you only need a few.' },
      { question: 'Which is better, JPG or PNG output?', answer: 'JPG produces smaller files for photos and scans, while PNG preserves sharper edges for text-heavy pages and supports transparency.' },
      { question: 'Are my files uploaded anywhere during conversion?', answer: 'No, pages are rendered locally using your browser, so the PDF never leaves your computer.' },
      { question: 'Will text stay sharp in the converted images?', answer: 'Yes, at higher resolution settings text remains crisp, though very high zoom levels will still show pixelation since it becomes a raster image.' },
      { question: 'Can I convert a password-protected PDF this way?', answer: 'You will need to remove the password first, since the browser cannot render encrypted pages without the correct credentials.' },
    ],
    useCases: [
      'Pulling a single page out of a brochure PDF to paste into a slide deck',
      'Generating a flyer image to post on social media from a print-ready PDF',
      'Creating thumbnail previews for a document library or catalog',
      'Turning a report page into an image for embedding in an email or webpage',
    ],
    tips: [
      'Choose PNG for text-heavy pages or when you need transparency, and JPG for photo-heavy pages where smaller file size matters.',
      'Bump up the resolution setting if the image will be printed or zoomed into, since low settings can look pixelated at larger sizes.',
      'Remove any password protection from the source PDF first, as encrypted pages cannot be rendered in-browser.',
    ],
  },
  'jpg-to-pdf': {
    intro:
      'Image to PDF bundles one or many JPG or PNG images into a single, shareable PDF document, which is exactly what you need after scanning receipts with your phone camera or collecting photos of a whiteboard for a report. Small business owners use it to compile expense photos, and students use it to submit handwritten homework as one file. The whole conversion is done client-side, keeping personal photos off any external server.',
    steps: [
      { title: 'Add your images', description: 'Upload one or more JPG or PNG images you want combined into a PDF.' },
      { title: 'Arrange the order', description: 'Drag images into the sequence you want them to appear as pages.' },
      { title: 'Adjust page settings', description: 'Choose page size and orientation if needed to fit your images properly.' },
      { title: 'Generate and download', description: 'Click Convert to build the PDF, then download the finished file.' },
    ],
    faqs: [
      { question: 'Can I combine multiple images into one PDF, or only convert one at a time?', answer: 'You can upload several images at once and they will all be placed as separate pages in a single PDF.' },
      { question: 'Does it support both JPG and PNG in the same batch?', answer: 'Yes, you can mix JPG and PNG images together and they will all be converted into pages of the same PDF.' },
      { question: 'Will the images lose quality when converted?', answer: 'Images are embedded at their original resolution, so there is no additional compression beyond what the source file already had.' },
      { question: 'Can I change the page orientation or size?', answer: 'Yes, you can typically choose between page sizes like A4 or Letter and set portrait or landscape orientation.' },
      { question: 'Are my photos uploaded to a server to build the PDF?', answer: 'No, the PDF is assembled entirely in your browser and your images stay on your device.' },
      { question: 'Can I reorder images before creating the PDF?', answer: 'Yes, drag and drop the image thumbnails into the order you want before generating the final document.' },
    ],
    useCases: [
      'Compiling phone photos of receipts into one PDF for an expense report',
      'Submitting handwritten homework as a single file after photographing each page',
      'Turning whiteboard photos from a meeting into a shareable document',
      'Building a photo-based product catalog or portfolio as a PDF',
    ],
    tips: [
      'Arrange image order before converting; reordering afterward means starting over with the PDF output.',
      'Pick a consistent page size and orientation if your source photos vary in dimensions, so pages do not look mismatched.',
      'Photograph documents straight-on with good lighting for crisper results, since the tool embeds images at their original resolution without enhancing them.',
    ],
  },
  'html-to-pdf': {
    intro:
      'HTML to PDF converts raw HTML markup or pasted web content into a clean, paginated PDF document, which developers use to generate printable reports or invoices straight from templated HTML. It is also handy for saving a styled email or web snippet as an archivable file. Rendering and pagination take place inside your browser, so no HTML content or credentials are ever sent to an external conversion service.',
    steps: [
      { title: 'Paste or write your HTML', description: 'Enter the HTML markup you want to render as a PDF.' },
      { title: 'Preview the rendered output', description: 'Check how the content will look once paginated onto PDF pages.' },
      { title: 'Adjust page settings', description: 'Set page size, margins, or orientation if the tool offers those options.' },
      { title: 'Generate and download', description: 'Click Convert to produce the PDF and save it to your device.' },
    ],
    faqs: [
      { question: 'Does it support CSS styling in the HTML?', answer: 'Basic inline and embedded CSS is rendered, but very complex layouts or external stylesheets may not render identically to a browser page.' },
      { question: 'Can I convert a full webpage URL to PDF?', answer: 'This tool works on HTML content you paste in; it does not fetch and render arbitrary external URLs.' },
      { question: 'Will fonts and images show up correctly in the PDF?', answer: 'Standard web-safe fonts and embedded or linked images typically render fine, but custom fonts not available on your device may fall back to a default.' },
      { question: 'Is the HTML content sent to a server to be converted?', answer: 'No, conversion happens entirely client-side in your browser.' },
      { question: 'Can I control page breaks in the output?', answer: 'Yes, using standard CSS page-break properties in your HTML you can influence where pages split.' },
      { question: 'Does it work with JavaScript-heavy HTML content?', answer: 'The tool renders static markup and styles; dynamic content that depends on external scripts running may not appear as expected.' },
    ],
    useCases: [
      'Generating a printable invoice or report from a templated HTML snippet',
      'Archiving a styled email or web page as a standalone PDF',
      'Turning a developer-generated HTML document into a shareable PDF handout',
      'Producing a print-ready version of a formatted HTML letter or memo',
    ],
    tips: [
      'Use inline or embedded CSS rather than external stylesheets, since linked stylesheets outside the pasted markup are not fetched.',
      'Add explicit CSS page-break rules if you need control over where content splits across pages.',
      'Stick to web-safe fonts, since custom fonts not installed on your device will fall back to a default.',
    ],
  },
  'text-to-pdf': {
    intro:
      'Text to PDF turns plain text, such as notes, code snippets, or a quick letter, into a properly formatted, printable PDF document in seconds. Writers drafting a simple manuscript excerpt or developers documenting a changelog often reach for this instead of opening a full word processor. Formatting and pagination happen in your browser, so your text content is never transmitted anywhere while the PDF is created.',
    steps: [
      { title: 'Type or paste your text', description: 'Enter the plain text content you want turned into a PDF.' },
      { title: 'Choose formatting options', description: 'Set font size, page size, and margins to match how you want the document to look.' },
      { title: 'Preview the layout', description: 'Check how the text wraps and paginates across pages.' },
      { title: 'Generate and download', description: 'Click Convert to create the PDF and save it to your device.' },
    ],
    faqs: [
      { question: 'Can I control the font and text size?', answer: 'Yes, most versions of the tool let you adjust font size and sometimes font family before generating the PDF.' },
      { question: 'Does it preserve line breaks and paragraphs exactly as typed?', answer: 'Yes, line breaks and blank lines are preserved and reflected in the paginated PDF output.' },
      { question: 'Is there a limit on how much text I can convert?', answer: 'There is no strict limit, though extremely large amounts of text may take a moment longer to paginate across many pages.' },
      { question: 'Will my text be uploaded to a server?', answer: 'No, the PDF is generated entirely within your browser and your text never leaves your device.' },
      { question: 'Can I add multiple pages of text at once?', answer: 'Yes, the tool automatically paginates long text into as many pages as needed.' },
      { question: 'Does it support special characters and emoji?', answer: 'Standard Unicode text is supported, though rendering of unusual symbols depends on the fonts available for the PDF engine.' },
    ],
    useCases: [
      'Turning a plain-text changelog or release note into a shareable PDF',
      'Formatting a quick letter or memo without opening a full word processor',
      'Converting a code snippet or log file into a printable document',
      'Producing a simple manuscript excerpt for review without extra formatting tools',
    ],
    tips: [
      'Set font size and page size before previewing so you can see how much content fits per page.',
      'Keep paragraphs separated with blank lines, since line breaks are preserved exactly as typed.',
      'For unusual symbols or non-Latin scripts, preview the output carefully, as rendering depends on the fonts available to the PDF engine.',
    ],
  },
  'pdf-ocr': {
    intro:
      'PDF OCR extracts text from scanned documents and image-based PDFs, such as printed contracts, old book scans, or photographed receipts, using optical character recognition that runs right in your browser. This makes previously unsearchable scans copyable and searchable without sending them to a cloud OCR API. It is a favorite among researchers digitizing archives and anyone trying to quote text from a scanned document without retyping it by hand.',
    steps: [
      { title: 'Upload your scanned PDF', description: 'Select the image-based or scanned PDF you want to run OCR on.' },
      { title: 'Choose the recognition language', description: 'Pick the language that matches the text in your document for best accuracy.' },
      { title: 'Run OCR processing', description: 'Let the tool analyze the pages and recognize the text characters.' },
      { title: 'Review and export', description: 'Check the recognized text for errors, then copy it or download it as a text file.' },
    ],
    faqs: [
      { question: 'How accurate is the text recognition?', answer: 'Accuracy depends heavily on scan quality and font clarity; clean, high-resolution scans typically yield very good results while blurry or handwritten text is less reliable.' },
      { question: 'Does OCR processing happen in the cloud?', answer: 'No, recognition runs locally in your browser using an in-browser OCR engine, so scanned documents are not uploaded anywhere.' },
      { question: 'Can it recognize handwriting?', answer: 'OCR is optimized for printed text; handwritten content is usually recognized poorly or not at all.' },
      { question: 'Does it support languages other than English?', answer: 'Yes, you can select from multiple supported languages to improve recognition accuracy for non-English documents.' },
      { question: 'Will OCR work on a low-quality phone scan?', answer: 'It can, but results improve significantly with better lighting, higher resolution, and a straight, non-blurry scan.' },
      { question: 'How long does OCR take on a multi-page document?', answer: 'Processing time scales with the number of pages and your device speed, so larger scanned documents take proportionally longer.' },
    ],
    useCases: [
      'Digitizing archived paper contracts or old book scans into searchable text',
      'Quoting text from a photographed receipt or printed article without retyping it',
      'Making a scanned research paper searchable for keyword lookup',
      'Recovering text from a scan when the original digital file no longer exists',
    ],
    tips: [
      'Select the correct recognition language before running OCR, since mismatched language settings hurt accuracy significantly.',
      'Higher-resolution, well-lit, and straight scans produce far better results than blurry or skewed ones.',
      'Do not expect good results on handwriting; OCR is tuned for printed text.',
    ],
  },
  'pdf-extract-text': {
    intro:
      'Extract Text from PDF pulls every bit of selectable text out of a PDF so you can copy it into an email, paste it into a search, or save it as a plain TXT file. It is a quick way to grab a quote from a report or repurpose content from a PDF brochure without manual retyping. The extraction runs entirely in your browser, keeping any sensitive text content off external servers.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF you want to pull text out of.' },
      { title: 'Let the tool scan the pages', description: 'The tool reads the text layer from every page in the document.' },
      { title: 'Review the extracted text', description: 'Check the output in the preview panel for accuracy.' },
      { title: 'Copy or download', description: 'Copy the text to your clipboard or download it as a TXT file.' },
    ],
    faqs: [
      { question: 'Does it work on scanned PDFs without a text layer?', answer: 'No, this tool reads existing text layers only; for scanned images use the PDF OCR tool instead.' },
      { question: 'Is my document uploaded to extract the text?', answer: 'No, all extraction happens locally in your browser and the file is never sent to a server.' },
      { question: 'Will formatting like bold or headings be preserved?', answer: 'No, the output is plain text, so visual formatting is stripped and only the raw text content remains.' },
      { question: 'Can I extract text from just specific pages?', answer: 'Some versions let you select a page range, but by default all pages are processed.' },
      { question: 'What if my PDF has multiple columns?', answer: 'Text is pulled in the reading order embedded in the PDF, which may occasionally interleave columns unexpectedly.' },
      { question: 'Can I extract text from a password-protected PDF?', answer: 'You need to remove the password first, since the browser cannot read the text layer of an encrypted file directly.' },
    ],
    useCases: [
      'Grabbing a quote or citation from a report without retyping it by hand',
      'Repurposing content from a PDF brochure into an email or blog post',
      'Pulling text out of a PDF to search or index it elsewhere',
      'Saving the plain text of a document as a lightweight TXT backup',
    ],
    tips: [
      'If the output looks empty or garbled, the PDF likely has no text layer; use the PDF OCR tool for scanned images instead.',
      'Expect multi-column layouts to occasionally interleave text out of the natural reading order.',
      'Remember the result is plain text, so bold, headings, and other formatting will be stripped.',
    ],
  },
  'pdf-extract-images': {
    intro:
      'Extract Images from PDF finds every embedded picture inside a PDF, such as product photos in a catalog or diagrams in a manual, and lets you download them individually as standalone image files. Designers reusing assets from an old brochure and researchers pulling figures out of a paper both rely on this instead of taking manual screenshots. Since the scanning happens locally, the source PDF is never uploaded to complete the extraction.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file containing the images you want to extract.' },
      { title: 'Scan for embedded images', description: 'The tool detects all raster images embedded across the pages.' },
      { title: 'Preview the found images', description: 'Review thumbnails of each detected image before downloading.' },
      { title: 'Download images', description: 'Save individual images or download them all together as a zip file.' },
    ],
    faqs: [
      { question: 'Does it extract vector graphics as well as photos?', answer: 'It primarily extracts embedded raster images; pure vector drawings built from PDF path data may not be captured as separate image files.' },
      { question: 'What image format are the extracted files saved as?', answer: 'Images are typically saved in their original embedded format, such as JPG or PNG, depending on how they were stored in the PDF.' },
      { question: 'Is my PDF sent anywhere to find the images?', answer: 'No, the scan and extraction happen entirely within your browser.' },
      { question: 'Can I extract images from just one page?', answer: 'Some tool configurations let you filter by page, though by default it scans the whole document.' },
      { question: 'Will tiny background graphics also be extracted?', answer: 'Yes, any embedded image data will be detected, including small icons or background graphics, which can result in many extracted files.' },
      { question: 'Does image quality change during extraction?', answer: 'No, images are pulled out at their original embedded resolution without additional recompression.' },
    ],
    useCases: [
      'Reusing product photos or diagrams from an old catalog or manual',
      'Pulling figures out of a research paper for a presentation',
      'Recovering original images from a PDF when the source files were lost',
      'Collecting all photos from a scanned photo album PDF into separate files',
    ],
    tips: [
      'Expect many small results if the document has background graphics or icons, since every embedded raster image is detected.',
      'Pure vector illustrations built from PDF path data will not be captured; only embedded raster images are extracted.',
      'Download as a zip when there are many images instead of saving each one individually.',
    ],
  },
  'pdf-rotate': {
    intro:
      'Rotate PDF fixes pages that were scanned sideways or upside down by rotating all pages or just selected ones by 90, 180, or 270 degrees. This is a common fix after scanning a stack of documents on a machine that does not auto-detect orientation, or after receiving a PDF from someone whose scanner flipped a few pages. Rotation is applied directly in your browser, so the corrected file is ready to download without any file ever leaving your machine.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file containing pages that need rotating.' },
      { title: 'Select the pages to rotate', description: 'Choose all pages or pick specific ones that are misoriented.' },
      { title: 'Pick a rotation angle', description: 'Rotate the selected pages by 90, 180, or 270 degrees as needed.' },
      { title: 'Save the corrected PDF', description: 'Download the PDF with the pages now in the correct orientation.' },
    ],
    faqs: [
      { question: 'Can I rotate just one page instead of the whole document?', answer: 'Yes, you can select individual pages and rotate only those, leaving the rest of the document untouched.' },
      { question: 'Does rotating affect the text quality or resolution?', answer: 'No, rotation only changes the page orientation metadata and does not re-render or compress the content.' },
      { question: 'Is my file uploaded to a server to be rotated?', answer: 'No, rotation is performed entirely client-side in your browser.' },
      { question: 'Can I rotate pages by an angle other than 90, 180, or 270?', answer: 'The tool supports standard 90 degree increments since PDF page rotation is defined in those fixed steps.' },
      { question: 'Will the rotation be permanent in the saved file?', answer: 'Yes, the downloaded PDF has the rotation baked into the page orientation so it displays correctly everywhere.' },
      { question: 'Does it work on scanned image-based PDFs?', answer: 'Yes, rotation works on any PDF page regardless of whether it contains scanned images or text.' },
    ],
    useCases: [
      'Fixing a batch of scanned pages that came out sideways from a scanner',
      'Correcting a few upside-down pages in an otherwise properly oriented PDF',
      'Straightening a received document before forwarding it to someone else',
      'Preparing a mixed-orientation scan for consistent printing',
    ],
    tips: [
      'Rotate only the specific misoriented pages rather than the whole document to avoid flipping pages that are already correct.',
      'Remember rotation only changes orientation metadata, so it will not fix a document that was scanned mirrored or skewed.',
      'Preview the result before downloading, since PDF rotation is limited to 90-degree increments.',
    ],
  },
  'pdf-reorder': {
    intro:
      'Reorder PDF Pages lets you drag page thumbnails into any sequence you like, which is perfect for fixing a scanner that grabbed pages out of order or rearranging a report before sending it to a client. Anyone assembling a portfolio or combining sections from different sources can use it to get the final page order exactly right before saving. The rearranged document is built entirely in-browser, with no intermediate upload step.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF whose pages you want to rearrange.' },
      { title: 'View the page thumbnails', description: 'The tool displays a thumbnail grid representing every page in order.' },
      { title: 'Drag pages into the new order', description: 'Click and drag thumbnails to rearrange them into the sequence you want.' },
      { title: 'Save the reordered PDF', description: 'Download the document with pages saved in the new order.' },
    ],
    faqs: [
      { question: 'Can I reorder a large document with many pages?', answer: 'Yes, though dragging many thumbnails is easier with a larger screen; the tool handles documents of typical office length well.' },
      { question: 'Does reordering delete any pages?', answer: 'No, reordering only changes page sequence; use the Delete PDF Pages tool if you also need to remove pages.' },
      { question: 'Is the file uploaded to reorder the pages?', answer: 'No, all reordering happens locally in your browser using the file you selected.' },
      { question: 'Can I undo a reorder before saving?', answer: 'Yes, you can keep rearranging thumbnails freely until you are satisfied, and nothing is finalized until you download.' },
      { question: 'Will reordering affect bookmarks or links in the PDF?', answer: 'Internal bookmarks may point to the old page numbers, so double-check navigation links after significant reordering.' },
      { question: 'Does it work on touchscreens for dragging pages?', answer: 'Yes, touch-based drag and drop is supported on most modern mobile and tablet browsers.' },
    ],
    useCases: [
      'Fixing a scanner that fed pages in out of sequence',
      'Rearranging sections of a report before sending it to a client',
      'Assembling a portfolio by combining pages from different source documents in the right order',
      'Moving a table of contents or cover page to the front after merging files',
    ],
    tips: [
      'Double-check internal bookmarks and links after a major reorder, since they may still point to the old page positions.',
      'Use this tool alongside Delete PDF Pages if you also need to remove pages, since reordering alone does not delete anything.',
      'On a larger screen it is easier to drag thumbnails precisely when working with long documents.',
    ],
  },
  'pdf-delete-pages': {
    intro:
      'Delete PDF Pages removes unwanted pages, such as a blank cover sheet, a duplicate scan, or an outdated section, without needing to rebuild the whole document from scratch. It is a quick fix for administrators trimming down scanned packets or students removing extra pages before submitting an assignment. Because deletion happens in the browser, the PDF you are editing never gets uploaded to a remote server.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file containing pages you want removed.' },
      { title: 'Select pages to delete', description: 'Click on the thumbnails of the pages you no longer need.' },
      { title: 'Confirm the deletion', description: 'Review your selection before removing the pages permanently from the copy.' },
      { title: 'Download the updated PDF', description: 'Save the new document with the selected pages removed.' },
    ],
    faqs: [
      { question: 'Can I select multiple pages to delete at once?', answer: 'Yes, you can select any number of pages before removing them in a single operation.' },
      { question: 'Does deleting pages change the file size much?', answer: 'Removing pages typically reduces file size somewhat, especially if the deleted pages contained large images.' },
      { question: 'Is the original file changed, or do I get a copy?', answer: 'The tool works on a copy loaded into your browser; your original file on disk is left untouched unless you overwrite it.' },
      { question: 'Are my documents uploaded to a server for editing?', answer: 'No, page deletion is processed entirely client-side in your browser.' },
      { question: 'Can I delete a page and then restore it?', answer: 'Deletions can be undone before you download the final file, but once downloaded the removed pages are gone from that copy.' },
      { question: 'Does it work with large scanned PDFs?', answer: 'Yes, though very large scanned files may take a bit longer to load thumbnails and process.' },
    ],
    useCases: [
      'Removing a blank cover sheet or duplicate scan before filing a document',
      'Trimming an outdated section out of a report before redistributing it',
      'Cleaning up extra pages before submitting an assignment',
      'Shortening a scanned packet down to only the pages that matter',
    ],
    tips: [
      'Select all pages to delete in one pass rather than repeating the process, since multiple pages can be removed in a single operation.',
      'Keep a copy of the original file, since the tool works on a loaded copy and downloaded results cannot be restored afterward.',
      'Removing image-heavy pages will shrink file size more noticeably than removing text-only pages.',
    ],
  },
  'pdf-crop': {
    intro:
      'Crop PDF trims excess margins or resizes pages to a custom crop box, which helps when preparing a document for printing on a specific paper size or removing scanner border artifacts from a scanned page. Publishers preparing a book excerpt and students tidying up scanned worksheets both use it to get cleaner-looking pages. The cropping tool renders and clips pages directly in the browser, so no file upload is required to see or apply the crop.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file you want to crop.' },
      { title: 'Set the crop area', description: 'Drag the crop handles over a page preview to define the region to keep.' },
      { title: 'Apply to one or all pages', description: 'Choose whether to apply the same crop to every page or just selected ones.' },
      { title: 'Download the cropped PDF', description: 'Save the resulting document with the new page boundaries.' },
    ],
    faqs: [
      { question: 'Can I crop all pages the same way at once?', answer: 'Yes, you can define one crop area and apply it uniformly across every page in the document.' },
      { question: 'Does cropping delete content outside the crop box permanently?', answer: 'The content is hidden outside the visible crop area in the output file, effectively trimming the page dimensions.' },
      { question: 'Is my PDF uploaded to perform the crop?', answer: 'No, cropping is rendered and applied entirely within your browser.' },
      { question: 'Can I crop different pages with different areas?', answer: 'Yes, most workflows let you set a custom crop per page if your document has inconsistent margins.' },
      { question: 'Will cropping affect the text resolution?', answer: 'No, cropping only changes the visible page boundary and does not resample or degrade the underlying content.' },
      { question: 'Can I undo a crop after applying it?', answer: 'You can crop again or re-upload the original file to start over, since the tool works on the file loaded in your session.' },
    ],
    useCases: [
      'Removing scanner border artifacts from a scanned worksheet or document',
      'Resizing pages to fit a specific paper size before printing',
      'Trimming excess white space from a book excerpt before publishing',
      'Standardizing margins across pages pulled from different sources',
    ],
    tips: [
      'Apply one crop uniformly across all pages when margins are consistent, but crop individually if pages have varying layouts.',
      'Cropping only hides content outside the box in the output; it does not resample or blur the remaining content.',
      'Keep the original file handy since you will need to re-upload it to adjust the crop area later.',
    ],
  },
  'pdf-watermark': {
    intro:
      'Add Watermark stamps custom text, like "Confidential" or a company name, or a logo image across PDF pages to protect drafts, brand documents, or mark sample copies before wider distribution. Photographers protecting proofs and legal teams marking draft contracts both rely on this to discourage unauthorized reuse. The watermark is composited onto every page locally in the browser, so your original document is never sent anywhere during the process.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file you want to watermark.' },
      { title: 'Choose text or image watermark', description: 'Enter watermark text or upload a logo image to stamp onto pages.' },
      { title: 'Adjust position and opacity', description: 'Set the placement, size, rotation, and transparency of the watermark.' },
      { title: 'Apply and download', description: 'Apply the watermark to all pages and download the finished PDF.' },
    ],
    faqs: [
      { question: 'Can I use an image logo instead of text as the watermark?', answer: 'Yes, you can upload an image file and place it as the watermark instead of, or alongside, text.' },
      { question: 'Will the watermark appear on every page automatically?', answer: 'Yes, by default the watermark is applied to all pages, though some setups let you limit it to a page range.' },
      { question: 'Can I control how transparent the watermark is?', answer: 'Yes, you can adjust the opacity so the watermark is subtle or bold depending on your needs.' },
      { question: 'Is my document uploaded to add the watermark?', answer: 'No, the watermark is drawn onto the pages entirely within your browser.' },
      { question: 'Can the watermark be removed later by someone else?', answer: 'A watermark stamped into the page content is difficult to remove without specialized editing tools, though it is not fully tamper-proof.' },
      { question: 'Can I rotate the watermark diagonally across the page?', answer: 'Yes, rotation controls let you angle the watermark, such as a classic diagonal "Draft" stamp.' },
    ],
    useCases: [
      'Marking a draft contract as "Confidential" before circulating it for review',
      'Stamping photo proofs with a logo to discourage unauthorized use',
      'Branding internal reports with a company name or logo across every page',
      'Labeling sample copies of a document before wider distribution',
    ],
    tips: [
      'Lower the opacity for a subtle background watermark that does not interfere with reading the page content.',
      'A diagonal rotation across the page reads more clearly than a straight horizontal stamp for classic "Draft" or "Confidential" marks.',
      'A stamped watermark deters casual reuse but is not fully tamper-proof against determined editing.',
    ],
  },
  'pdf-page-numbers': {
    intro:
      'Add Page Numbers automatically stamps sequential numbers onto every page of a PDF in the position you choose, saving you from manually labeling each page of a long report or thesis. Authors preparing a manuscript and office staff finalizing a multi-page handbook both use it to give documents a polished, navigable feel. Numbering is calculated and applied directly in the browser, so there is no upload step involved in generating the final file.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file you want to number.' },
      { title: 'Choose position and style', description: 'Pick where the numbers appear, such as bottom center, and choose a starting number or format.' },
      { title: 'Preview the numbering', description: 'Check a page preview to confirm the numbers look correct.' },
      { title: 'Apply and download', description: 'Apply the page numbers to the whole document and download the result.' },
    ],
    faqs: [
      { question: 'Can I start numbering from a page other than 1?', answer: 'Yes, you can set a custom starting number, which is useful when a document continues from another file.' },
      { question: 'Can I choose where the page number appears?', answer: 'Yes, common positions like top or bottom, left, center, or right are usually available.' },
      { question: 'Does it support formats like "Page 1 of 10"?', answer: 'Many configurations support that format alongside simple numeric page numbers, depending on the tool options provided.' },
      { question: 'Is my PDF uploaded to add page numbers?', answer: 'No, numbers are stamped onto the pages entirely within your browser.' },
      { question: 'Will page numbers overwrite existing content on the page?', answer: 'Numbers are placed in the margin area you select, so they should not overlap with page content if positioned appropriately.' },
      { question: 'Can I skip numbering the first page, like a cover?', answer: 'Yes, many setups let you exclude a specific page or start numbering from a later page.' },
    ],
    useCases: [
      'Numbering a thesis or manuscript before submission',
      'Adding page numbers to a multi-page employee handbook for easier navigation',
      'Continuing numbering across a document that picks up from another file',
      'Finalizing a long report with clear page references for a table of contents',
    ],
    tips: [
      'Exclude the cover page from numbering if your document starts with a title page.',
      'Use a custom starting number when a document continues the pagination of a separate file.',
      'Preview the placement first to make sure numbers do not overlap with existing footer content on any page.',
    ],
  },
  'pdf-header-footer': {
    intro:
      'Add Header & Footer inserts repeating text, such as a document title, date, or company name, into the top or bottom margin of every page in a PDF. Businesses standardizing internal documents and students formatting a thesis according to university guidelines both use it to add consistent branding or metadata without manually editing each page. The header and footer text is composited onto pages locally in your browser with no file upload required.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file you want to add a header or footer to.' },
      { title: 'Enter header and footer text', description: 'Type the text you want repeated, such as a title, date, or page label.' },
      { title: 'Adjust styling and position', description: 'Set font size, alignment, and margin placement for the text.' },
      { title: 'Apply and download', description: 'Apply the header and footer to all pages and download the finished PDF.' },
    ],
    faqs: [
      { question: 'Can I add both a header and a footer at the same time?', answer: 'Yes, you can configure text for the header and footer independently and apply both in one pass.' },
      { question: 'Can I insert the current date automatically?', answer: 'Many configurations support a date placeholder that inserts the current date automatically into the header or footer.' },
      { question: 'Is my document uploaded to add the header or footer?', answer: 'No, the text is drawn onto pages entirely within your browser.' },
      { question: 'Will the header or footer overlap with existing page content?', answer: 'It is placed in the page margin, so it should not overlap as long as your document has adequate margin space.' },
      { question: 'Can I apply different text to different pages?', answer: 'Standard usage applies the same header and footer to every page, though some setups support page-specific text.' },
      { question: 'Does adding a header and footer affect the original page size?', answer: 'No, the page dimensions stay the same; the text is simply layered into the existing margin area.' },
    ],
    useCases: [
      'Standardizing internal company documents with a consistent title and date footer',
      'Formatting a thesis according to university header and footer requirements',
      'Adding a document title or version label that repeats across every page',
      'Branding a proposal or handbook with a company name in the footer',
    ],
    tips: [
      'Use the automatic date placeholder if you want the current date inserted without retyping it every time you edit.',
      'Check that your document has enough margin space, since header and footer text is placed there rather than reflowing existing content.',
      'Configure header and footer text independently if you want different information at the top and bottom of the page.',
    ],
  },
  'pdf-sign': {
    intro:
      'Sign PDF lets you draw a signature with your mouse or finger, type your name in a script font, or upload an image of your handwritten signature, then place it anywhere on a PDF page. Freelancers signing client contracts and tenants signing lease agreements use it to avoid printing, signing, and rescanning paperwork. Because signing happens fully in the browser, your signature image and the document you are signing are never uploaded to a remote server.',
    steps: [
      { title: 'Upload the PDF to sign', description: 'Select the PDF document that needs a signature.' },
      { title: 'Create your signature', description: 'Draw it with your mouse or touchscreen, type it, or upload an image of your signature.' },
      { title: 'Place the signature on the page', description: 'Drag and resize the signature to the correct spot on the document.' },
      { title: 'Save the signed PDF', description: 'Apply the signature and download the finished, signed document.' },
    ],
    faqs: [
      { question: 'Is a signature added this way legally binding?', answer: 'It functions as an electronic signature similar to typing your name, but legal validity depends on your jurisdiction and the specific agreement, so check requirements for formal contracts.' },
      { question: 'Can I sign on my phone using my finger?', answer: 'Yes, the drawing option works with touch input on mobile devices and tablets.' },
      { question: 'Is my document uploaded to a server to add the signature?', answer: 'No, the signing process happens entirely in your browser and the file is not transmitted anywhere.' },
      { question: 'Can I add multiple signatures to different pages?', answer: 'Yes, you can place the same or different signatures on as many pages as needed.' },
      { question: 'Can I save my signature for reuse later?', answer: 'Depending on your browser session, you may be able to reuse a drawn or uploaded signature during the same visit.' },
      { question: 'Does it work on scanned PDF documents?', answer: 'Yes, you can place a signature image on top of any PDF page, including scanned documents.' },
    ],
    useCases: [
      'Signing a freelance contract without printing, signing, and rescanning it',
      'Signing a lease agreement sent as a PDF by a landlord',
      'Adding a signature to a scanned form that has no interactive fields',
      'Countersigning multiple copies of the same agreement quickly',
    ],
    tips: [
      'Draw your signature with a mouse for a more natural look than typing it in a script font, especially for formal documents.',
      'Check your jurisdiction and the specific agreement type, since legal validity of an electronic signature varies by context.',
      'Resize and reposition the signature carefully before finalizing, since placement cannot be adjusted after the document is saved.',
    ],
  },
  'pdf-fill-forms': {
    intro:
      'Fill PDF Forms lets you type directly into interactive form fields, such as job applications, tax forms, or intake paperwork, without printing the document first. It is a common time-saver for anyone dealing with government forms or HR paperwork that arrives as a fillable PDF. All the field data you enter stays local to your browser session, meaning personal information typed into the form is never sent to an external server.',
    steps: [
      { title: 'Upload the fillable PDF', description: 'Select the PDF that contains interactive form fields.' },
      { title: 'Click into each field', description: 'Enter text, select checkboxes, or choose dropdown options as needed.' },
      { title: 'Review your entries', description: 'Check each filled field for accuracy before finalizing.' },
      { title: 'Save the completed form', description: 'Download the filled-in PDF ready to submit or print.' },
    ],
    faqs: [
      { question: 'Does this work on any PDF, or only ones with form fields?', answer: 'It works on PDFs that contain actual interactive AcroForm fields; a plain scanned document has no fields to fill in this way.' },
      { question: 'Is my personal information uploaded when I fill in a form?', answer: 'No, everything you type stays in your browser and is only embedded into the PDF you download.' },
      { question: 'Can I fill checkboxes and dropdown menus, not just text fields?', answer: 'Yes, common interactive field types including checkboxes, radio buttons, and dropdowns are supported.' },
      { question: 'Can I save my progress and finish the form later?', answer: 'You would need to download a partially filled copy and re-upload it later, since the session does not persist automatically after closing the tab.' },
      { question: 'Will the filled data be editable if I reopen the PDF elsewhere?', answer: 'Yes, unless you flatten the form afterward, the entered values remain in editable form fields when opened in another PDF viewer.' },
      { question: 'What if the PDF has no fillable fields at all?', answer: 'If there are no interactive fields, you will not be able to click and type directly; consider adding text manually with an editing tool instead.' },
    ],
    useCases: [
      'Filling out a government form that arrived as a fillable PDF',
      'Completing a job application or intake form without printing it first',
      'Filling in a tax form ahead of submission or filing',
      'Entering HR paperwork details directly into a PDF template',
    ],
    tips: [
      'Confirm the PDF actually has interactive AcroForm fields first; a plain scanned document has nothing to click into.',
      'Review every field carefully before downloading, since there is no autosave to recover mistakes after the fact.',
      'Flatten the form afterward if you want to lock in the values and prevent accidental edits by whoever receives it.',
    ],
  },
  'pdf-flatten': {
    intro:
      'Flatten PDF converts interactive form fields, annotations, and comments into permanent, non-editable page content, which is useful once you have finished filling out a form and want to lock in the values before sending it out. Businesses distributing finalized agreements and HR teams archiving completed applications use this to prevent recipients from accidentally altering submitted data. Flattening happens entirely within your browser, keeping the finished document private during processing.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF with form fields or annotations you want to finalize.' },
      { title: 'Review the current fields', description: 'Confirm all form values and annotations are correct before locking them in.' },
      { title: 'Flatten the document', description: 'Click Flatten to merge interactive elements into the static page content.' },
      { title: 'Download the flattened PDF', description: 'Save the finalized, non-editable version of the document.' },
    ],
    faqs: [
      { question: 'Can I still edit the form fields after flattening?', answer: 'No, flattening permanently converts fields into static page content, so they can no longer be edited as form fields.' },
      { question: 'Does flattening change how the document looks visually?', answer: 'No, the visual appearance stays the same; only the underlying interactivity of the fields is removed.' },
      { question: 'Is my PDF uploaded to a server to flatten it?', answer: 'No, flattening is processed entirely within your browser.' },
      { question: 'Why would I want to flatten a completed form?', answer: 'Flattening prevents accidental changes to submitted values and ensures the document prints and displays consistently across viewers.' },
      { question: 'Does flattening also remove comments and annotations?', answer: 'Yes, comments and markup annotations are merged into the page content and are no longer separately editable after flattening.' },
      { question: 'Can I flatten only some fields and leave others editable?', answer: 'Typically flattening applies to the entire document at once rather than selectively per field.' },
    ],
    useCases: [
      'Locking in values on a completed form before sending it out for signatures',
      'Archiving a finalized application so recipients cannot alter submitted data',
      'Preparing a distributed agreement that should display consistently across viewers',
      'Finalizing annotated review comments into permanent page content',
    ],
    tips: [
      'Flatten only after you are certain all field values and annotations are correct, since the fields cannot be edited again afterward.',
      'Keep an unflattened copy of the original if you might need to make changes later.',
      'Flattening does not change the visual appearance, only whether the content stays interactive.',
    ],
  },
  'pdf-repair': {
    intro:
      'Repair PDF attempts to fix corrupted or damaged PDF files that fail to open properly, such as documents interrupted during a download or partially saved after a crash. It works by re-parsing the file structure and rebuilding a valid PDF where possible, which can rescue important files like a corrupted invoice or report you cannot otherwise access. The repair process runs locally in your browser, so a potentially sensitive damaged file never has to be uploaded elsewhere to attempt a fix.',
    steps: [
      { title: 'Upload the damaged PDF', description: 'Select the corrupted or broken PDF file you are having trouble opening.' },
      { title: 'Run the repair scan', description: 'The tool analyzes the file structure and attempts to recover valid page and object data.' },
      { title: 'Review the recovered content', description: 'Check whether pages and content were successfully restored.' },
      { title: 'Download the repaired file', description: 'Save the newly reconstructed PDF to your device.' },
    ],
    faqs: [
      { question: 'Can every corrupted PDF be fully repaired?', answer: 'No, severely damaged files with missing critical data may only be partially recovered or may fail to repair at all.' },
      { question: 'Is my damaged file uploaded to attempt the repair?', answer: 'No, the repair process happens locally in your browser without sending the file anywhere.' },
      { question: 'What usually causes a PDF to become corrupted?', answer: 'Common causes include an interrupted download, a crash during saving, or transfer errors over an unstable connection.' },
      { question: 'Will repairing a PDF change its original content?', answer: 'The tool tries to preserve original content while fixing structural issues, though in some recovery cases minor elements may be lost.' },
      { question: 'Can this tool fix a PDF that will not open at all?', answer: 'It is designed for exactly that scenario, though results depend on how much of the file structure is still intact.' },
      { question: 'Does it work on password-protected PDFs that are also corrupted?', answer: 'Encryption combined with corruption is much harder to recover from, so results in that case are less reliable.' },
    ],
    useCases: [
      'Rescuing an invoice or report that got corrupted during an interrupted download',
      'Recovering a file that will not open after a crash during saving',
      'Fixing a PDF damaged by a transfer error over an unstable connection',
      'Attempting to restore access to a critical document with no other backup',
    ],
    tips: [
      'Try repair as soon as you notice corruption, since files damaged further by repeated failed opens can be harder to recover.',
      'Expect only partial recovery on severely damaged files where critical structural data is missing.',
      'If the file is both encrypted and corrupted, recovery odds drop significantly, so keep expectations modest.',
    ],
  },
  'pdf-compare': {
    intro:
      'Compare PDFs highlights the differences between two versions of a document side by side, which is invaluable when reviewing a redlined contract, checking a revised report against the original, or verifying that a reprinted document matches its source. Legal assistants tracking contract revisions and editors checking manuscript changes both rely on this instead of manually scanning every line. Both files are loaded and compared directly in your browser, so neither document is uploaded to a remote comparison service.',
    steps: [
      { title: 'Upload both PDFs', description: 'Select the original PDF and the revised version you want to compare.' },
      { title: 'Run the comparison', description: 'The tool analyzes both documents page by page to detect differences.' },
      { title: 'Review the highlighted changes', description: 'Added, removed, or altered content is highlighted in the side-by-side view.' },
      { title: 'Export or save the results', description: 'Save a summary or annotated view of the differences if needed.' },
    ],
    faqs: [
      { question: 'Does it compare text content, visual layout, or both?', answer: 'It primarily compares text and page content differences, highlighting additions and removals between the two versions.' },
      { question: 'Can I compare documents with a different number of pages?', answer: 'Yes, the tool will show which pages were added, removed, or shifted between the two versions.' },
      { question: 'Are both files uploaded to a server for comparison?', answer: 'No, the comparison is computed entirely within your browser using both files you selected.' },
      { question: 'Does it work on scanned PDFs without selectable text?', answer: 'Comparison works best on PDFs with a text layer; purely scanned image pages may only be compared visually rather than by text differences.' },
      { question: 'Can I compare very large documents with hundreds of pages?', answer: 'Yes, though comparing very large files may take longer depending on your device performance.' },
      { question: 'Will minor formatting changes be flagged as differences?', answer: 'Depending on sensitivity settings, formatting-only changes without text differences may or may not be highlighted.' },
    ],
    useCases: [
      'Reviewing a redlined contract against the original before signing',
      'Checking a revised report matches the intended changes from an editor',
      'Verifying that a reprinted or re-exported document matches its source file',
      'Tracking manuscript changes across drafts without manually scanning every line',
    ],
    tips: [
      'Use this on PDFs with a text layer for the most reliable results; purely scanned pages can only be compared visually.',
      'Expect page-count differences to show up clearly as added, removed, or shifted pages between versions.',
      'For very large documents, give the comparison a bit more time to process on lower-powered devices.',
    ],
  },
  'pdf-redact': {
    intro:
      'Redact PDF permanently blacks out sensitive text or regions, such as social security numbers, account details, or confidential clauses, before sharing a document externally. HR teams removing personal identifiers from records and legal teams preparing court filings for public release both depend on proper redaction rather than a cosmetic highlight that can be reversed. Redaction is applied to the page content locally in your browser, so the unredacted original never leaves your device during the process.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file that contains sensitive information to hide.' },
      { title: 'Draw redaction boxes', description: 'Click and drag over the text or regions you want permanently blacked out.' },
      { title: 'Apply the redactions', description: 'Confirm the selected areas to permanently remove the underlying content.' },
      { title: 'Download the redacted PDF', description: 'Save the finished document with sensitive areas irreversibly blacked out.' },
    ],
    faqs: [
      { question: 'Is redacted text truly removed, or just covered visually?', answer: 'A proper redaction removes the underlying text content from that area rather than just drawing a black box over it, preventing copy-paste recovery.' },
      { question: 'Is my document uploaded to apply the redaction?', answer: 'No, redaction is processed entirely in your browser, which is especially important for confidential material.' },
      { question: 'Can I redact multiple areas across several pages at once?', answer: 'Yes, you can draw as many redaction boxes as needed across any pages before applying them all together.' },
      { question: 'Will redacted content still be visible if someone copies the text?', answer: 'No, properly applied redaction removes the underlying text so it cannot be selected or copied from the redacted area.' },
      { question: 'Can I undo a redaction after applying it?', answer: 'Once applied and downloaded, the redaction is permanent on that file; keep your original unredacted copy separately if you need to make changes later.' },
      { question: 'Does redaction work on scanned image-based PDFs?', answer: 'Yes, you can black out any visual area on a scanned page, though there is no separate text layer to remove in that case.' },
    ],
    useCases: [
      'Removing social security numbers or account details before sharing a record externally',
      'Preparing a court filing for public release with confidential clauses hidden',
      'Blacking out personal identifiers from HR records before archiving',
      'Hiding pricing or proprietary terms in a contract shared with a third party',
    ],
    tips: [
      'Always keep an unredacted original copy separately, since redaction is permanent once applied and downloaded.',
      'Verify a proper redaction removes the underlying text, not just draws a black box, especially before sending sensitive documents externally.',
      'Draw boxes generously over sensitive areas rather than tightly, to avoid leaving a sliver of visible text at the edges.',
    ],
  },
  'pdf-metadata': {
    intro:
      'PDF Metadata Editor lets you view and update the title, author, subject, and keyword fields embedded in a PDF file, which helps with organizing document libraries and correcting information before official distribution. Authors preparing an ebook and companies standardizing internal report metadata both use it to keep file properties accurate and searchable. Metadata is read and rewritten directly in your browser, so the document is never sent to a server just to update its properties.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF whose metadata you want to inspect or change.' },
      { title: 'View current metadata', description: 'See the existing title, author, subject, and keywords stored in the file.' },
      { title: 'Edit the fields', description: 'Update any of the metadata fields with new information.' },
      { title: 'Save the updated PDF', description: 'Download the document with the new metadata applied.' },
    ],
    faqs: [
      { question: 'Which metadata fields can I edit?', answer: 'Common editable fields include title, author, subject, and keywords, and sometimes creation and modification dates.' },
      { question: 'Is my document uploaded to change its metadata?', answer: 'No, metadata is read and rewritten entirely within your browser.' },
      { question: 'Will editing metadata change the visible page content?', answer: 'No, metadata is separate from page content, so editing it does not alter what appears on the pages.' },
      { question: 'Can I remove metadata entirely for privacy reasons?', answer: 'Yes, you can clear fields like author or keywords if you want to strip identifying information before sharing a file.' },
      { question: 'Why is metadata useful for a PDF?', answer: 'Accurate metadata improves searchability in document management systems and provides context like authorship without opening the file.' },
      { question: 'Does changing metadata affect the file size significantly?', answer: 'No, metadata changes are typically tiny compared to the overall page content and have negligible impact on file size.' },
    ],
    useCases: [
      'Correcting the title and author fields before officially publishing an ebook',
      'Standardizing metadata across a company report library for consistent search results',
      'Stripping identifying author or keyword information before sharing a file publicly',
      'Fixing incorrect subject or keyword tags on an old scanned document',
    ],
    tips: [
      'Clear author and keyword fields if you want to remove identifying details before distributing a sensitive file.',
      'Accurate metadata improves discoverability in document management systems, so it is worth filling in title, subject, and keywords consistently.',
      'Editing metadata never touches the visible page content, so it is a safe change to make without risking the document layout.',
    ],
  },
  'pdf-viewer': {
    intro:
      'PDF Viewer lets you open and page through a PDF directly in your browser without installing a dedicated reader app or plugin, which is convenient for quickly checking a document you just downloaded or received as an attachment. It supports zooming and page navigation so you can read reports, manuals, or contracts comfortably on any device. Because the file is rendered locally, nothing about the document you are viewing is ever transmitted to an external server.',
    steps: [
      { title: 'Upload or open your PDF', description: 'Select the PDF file you want to view.' },
      { title: 'Navigate between pages', description: 'Use the page controls or scroll to move through the document.' },
      { title: 'Zoom as needed', description: 'Adjust zoom level for comfortable reading of small text or detailed images.' },
      { title: 'Close or open another file', description: 'Switch to a different PDF at any time without leaving the page.' },
    ],
    faqs: [
      { question: 'Do I need Adobe Reader or another app to use this?', answer: 'No, the viewer renders PDFs entirely in your browser, so no external reader software or plugin is required.' },
      { question: 'Is my PDF uploaded to a server just to view it?', answer: 'No, the file is rendered locally using your browser, keeping the document private to your device.' },
      { question: 'Can I view password-protected PDFs?', answer: 'You will need to enter the correct password if the file is encrypted, since the viewer cannot bypass PDF encryption.' },
      { question: 'Does it work well on mobile browsers?', answer: 'Yes, the viewer adapts to smaller screens with touch-friendly zoom and page navigation.' },
      { question: 'Can I print directly from the viewer?', answer: 'Yes, you can use your browser print function while the PDF is open to send it to a printer or save it as a new file.' },
      { question: 'Will large PDFs load slowly in the viewer?', answer: 'Very large files may take a bit longer to render initial pages, but performance is generally smooth for typical document sizes.' },
    ],
    useCases: [
      'Quickly checking a PDF attachment right after downloading it without installing a reader app',
      'Reading a manual or contract comfortably on a phone or tablet',
      'Previewing a document before deciding whether to download or share it',
      'Viewing a PDF on a locked-down machine where installing software is not allowed',
    ],
    tips: [
      'Use your browser print function directly from the viewer if you need a paper copy or a new saved file.',
      'Zoom in for detailed images or small text rather than squinting at the default view.',
      'Have the correct password ready for encrypted files, since the viewer cannot bypass PDF encryption.',
    ],
  },
  'pdf-page-extractor': {
    intro:
      'PDF Page Extractor pulls a specific range of pages out of a larger PDF and saves them as a brand-new, standalone document, which is ideal for sharing just the relevant section of a lengthy report or textbook chapter. Researchers citing a single study from a large collection and employees forwarding only the relevant clause of a contract both use it instead of manually recreating a shorter file. Extraction happens entirely within your browser, so the source document is never uploaded during the process.',
    steps: [
      { title: 'Upload your PDF', description: 'Select the PDF file you want to extract pages from.' },
      { title: 'Specify the page range', description: 'Enter the start and end pages, or a custom range, that you want to pull out.' },
      { title: 'Preview the selected pages', description: 'Confirm the correct pages are included before extracting.' },
      { title: 'Download the new PDF', description: 'Save the extracted page range as its own separate document.' },
    ],
    faqs: [
      { question: 'How is this different from the Split PDF tool?', answer: 'Page Extractor is focused on pulling out one specific range as a single new document, while Split can break a file into several separate pieces at once.' },
      { question: 'Can I extract a non-contiguous set of pages, like 2, 5, and 9?', answer: 'Yes, most configurations let you specify individual pages and ranges together, not just one continuous block.' },
      { question: 'Is my PDF uploaded to extract the pages?', answer: 'No, extraction is performed locally in your browser without sending the file to a server.' },
      { question: 'Will the extracted pages keep their original quality?', answer: 'Yes, extracted pages retain their original resolution and content since they are copied directly rather than re-rendered.' },
      { question: 'Can I extract pages from a scanned PDF?', answer: 'Yes, extraction works the same way regardless of whether pages contain scanned images or selectable text.' },
      { question: 'What happens to page numbering in the new file?', answer: 'The new file starts fresh with the extracted pages in order, though any printed page numbers within the content itself remain as originally printed.' },
    ],
    useCases: [
      'Sharing just the relevant chapter of a textbook instead of the entire book',
      'Citing a single study by pulling it out of a large collection of papers',
      'Forwarding only the relevant clause of a contract to a colleague',
      'Creating a standalone excerpt from a long report for a specific audience',
    ],
    tips: [
      'Use non-contiguous ranges like 2,5,9-11 when you need scattered pages rather than one continuous block.',
      'Reach for Split PDF instead if you need to break a file into several separate pieces at once, not just pull out one range.',
      'Extracted pages keep their original resolution since they are copied directly rather than re-rendered.',
    ],
  },
};
