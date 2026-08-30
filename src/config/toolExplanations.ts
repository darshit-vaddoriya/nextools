// Easy-English explanations for every working tool.
// Each entry explains in simple words what the tool does and how to use it.

export const TOOL_EXPLANATIONS: Record<string, string> = {
  'json-formatter':
    'Makes messy JSON easy to read by adding proper spacing and indentation. You can also shrink it to save space, check if it is valid, and explore it as a tree. Paste your JSON in the box and the formatted version appears instantly. Use the buttons to copy, download, or switch between tree and code view.',

  'base64':
    'Converts text or files into Base64, and converts Base64 back into the original data. Base64 is commonly used to send data safely inside emails, URLs, or JSON. Type your text or pick a file, then choose Encode or Decode. The result can be copied with one click.',

  'xml-formatter':
    'Cleans up messy XML by adding proper indentation, or shrinks it into a single line to save space. It also checks whether the XML is well-formed and points out parsing errors. Paste your XML, choose Format or Minify, and copy the result.',

  'yaml-formatter':
    'Reformats YAML with consistent indentation, and converts between YAML and JSON in either direction. Handy for editing config files like docker-compose or CI pipelines. Paste your YAML or JSON, pick the direction you need, and copy the output. Anchors, tags and multi-document files are not supported.',

  'sql-formatter':
    'Beautifies SQL queries by capitalizing keywords and putting each major clause — SELECT, FROM, WHERE, JOIN, GROUP BY — on its own indented line, so long queries are easier to read and review. Paste your query and the formatted version appears instantly.',

  'html-formatter':
    'Prettifies HTML with clean, consistent indentation, or minifies it into a single compact line to shrink file size. Useful for tidying up scraped markup or shrinking a page before deploying it. Paste your HTML, choose Format or Minify, and copy the result.',

  'css-formatter':
    'Prettifies CSS (and basic SCSS/LESS) with consistent indentation and line breaks, or minifies it into a compact single line. Paste your stylesheet, pick Format or Minify, and copy the result straight into your project.',

  'js-formatter':
    'A lightweight JavaScript/TypeScript helper that strips comments and extra whitespace to minify code, or re-indents it based on bracket depth to make it readable again. It is not a full parser like Prettier, so treat it as a quick cleanup tool rather than a replacement for a proper build pipeline.',

  'url-encoder':
    'Encodes special characters in text so they are safe to use inside a URL, or decodes an already-encoded string back to plain text. Switch between encoding a single URL component (like a query value) or a whole URL, paste your text, and copy the result.',

  'diff-checker':
    'Compares two blocks of code or text line by line and highlights exactly what was added, removed or left unchanged — handy for reviewing edits before you commit them. Paste the original in one box and the changed version in the other, and the differences are marked automatically.',

  'markdown-preview':
    'A live Markdown editor with the rendered HTML shown side by side, so you can see exactly how your headings, lists, links and code blocks will look as you type. Write or paste Markdown on one side and watch the formatted preview update instantly on the other.',

  'html-markdown':
    'Converts HTML into clean Markdown, or Markdown into HTML, in either direction. Useful for pulling content out of a web page to paste into a README, or turning written Markdown notes into HTML for a page. Paste your source, pick the direction, and copy the converted result.',

  'hash-generator':
    'Turns any text into a fixed-length fingerprint using MD5, SHA-1, SHA-256 or SHA-512. Hashes help you check that data has not been changed, or store passwords safely. Type or paste your text, choose a hash type, and the result appears instantly. Hashes are one-way, so they cannot be converted back to the original text.',

  'uuid-generator':
    'Creates random unique IDs (UUID v4) that are used to identify records, files, or users. Every generated ID is different, so you can use them without worrying about duplicates. Choose how many IDs you need and any formatting options, then copy the list or download it.',

  'password-generator':
    'Creates strong random passwords that are hard to guess. You can control the length and choose which characters to include, such as uppercase letters, lowercase letters, numbers and symbols. Tick the options you want, adjust the length, and generate. The strength meter shows how secure the password is, and you can copy it in one click.',

  'regex-tester':
    'Lets you test regular expressions against sample text and see matches highlighted instantly. It is great for validating emails or phone numbers, and for extracting parts of text. Type your pattern in the pattern box and your test text in the other box, pick the flags you need, and watch the matches update live.',

  'case-converter':
    'Changes text between different naming styles such as camelCase, snake_case, kebab-case, PascalCase, UPPERCASE and lowercase. This is handy for programming variable names or cleaning up text. Paste your text, click the style you want, and copy the result.',

  'jwt-decoder':
    'Decodes JWT tokens, the tokens used for logins and APIs, so you can see what is inside them. It splits the token into its header, payload and signature and shows them separately. Paste your JWT and it is decoded instantly, letting you inspect the claims and check the expiry time.',

  'word-counter':
    'Counts words, characters, sentences and paragraphs, plus estimated reading time, word frequency and readability scores for any text. Useful for essays, articles, tweets and social media posts. Paste or type your text and the stats update live as you write.',

  'color-converter':
    'Converts colors between HEX, RGB and HSL formats. It is useful for designers and developers who work across different color systems. Enter a color in any format and all the other formats are shown at once, so you can copy the one you need.',

  'pdf-merge':
    'Combines multiple PDF files into one single document. You can drag the files to reorder them before merging. Select or drop your PDF files, arrange them in the order you want, then click Merge. The combined file downloads straight to your device.',

  'ai-bg-remover':
    'Removes the background from any image automatically using an AI model. The result is a cutout with a transparent background that you can use in designs. Drop in an image, wait a few seconds while it processes, and download the result. Everything runs on your device.',

  'image-resize':
    'Changes an image to exact pixel dimensions or by a percentage. It is useful for making images fit websites, social media or email. Upload your image, enter the new size or a percentage, keep the aspect ratio if you want, and download the resized file.',

  'image-crop':
    'Cuts an image down to a selected area and can lock the aspect ratio, for example 1:1 or 16:9. Upload your image, drag the crop box over the part you want to keep, choose an aspect ratio if you need one, and download the result.',

  'image-rotate':
    'Rotates or flips an image by any angle. You can fix a sideways photo or flip it horizontally and vertically. Upload your image, use the rotate and flip buttons to get the orientation right, then download the result.',

  'image-flip':
    'Mirrors an image horizontally or vertically, like looking at it in a reflection. Upload your image, choose flip horizontal or flip vertical, and download the mirrored version.',

  'image-convert':
    'Changes images from one file format to another, for example JPG to PNG, WebP or BMP. You can convert several images at once, or convert and download each one on its own. Upload your images, pick the target format, then click Convert on any file to convert just that one, or Convert All to do the whole batch.',

  'image-compressor':
    'Reduces the file size of images without a visible drop in quality. This helps photos load faster on websites and fit within email limits. Drop your images, adjust the quality slider, and download the smaller versions. You can compare the before and after sizes.',

  'image-adjust':
    'Adjusts the brightness, contrast, saturation, hue and sharpness of an image using simple sliders. Upload your image and move the sliders until it looks the way you want, then download the result.',

  'image-sharpen':
    'Makes blurry photos look crisper by increasing the detail at edges. Upload your image and adjust the sharpening strength until you are happy with the result, then download it.',

  'svg-converter':
    'Converts SVG vector images into PNG or JPG at any size. It is useful for turning logos and icons into image formats that work everywhere. Upload your SVG, set the resolution or scale you need, and download the converted image.',

  'image-metadata':
    'Removes hidden data from images, such as camera details, GPS location and editing history, to protect your privacy before sharing. Upload your image and it is cleaned automatically. Download the version with the metadata removed.',

  'image-watermark':
    'Adds a text or logo watermark to your images with control over size, opacity and position. It is useful for protecting your photos from being reused without permission. Upload your image, enter your text or logo, adjust the settings, and download the watermarked image.',

  'qr-generator':
    'Creates QR codes for URLs, Wi-Fi networks, vCards, plain text and more. Anyone can scan them with a phone camera. Choose the QR type, fill in the details, customize the colors if you like, and download the code as PNG or SVG.',

  'ocr-image':
    'Extracts written text from an image or scanned document so you can copy, edit or search it. Upload a clear image that contains text and wait while the tool reads it. Then copy or download the extracted text.',

  'ai-upscaler':
    'Increases the resolution of an image by up to 4x using AI, making small or blurry images larger and sharper. Upload your image, choose the scale such as 2x or 4x, and wait while it processes. Download the enlarged version when it is done.',

  'pdf-split':
    'Divides one PDF into several smaller files. You can split it into individual pages, or group pages together using ranges such as 1-2,4. Select your PDF, choose either Every page or Custom ranges, type the ranges you want as separate files, and click Split. Each group downloads as its own PDF.',

  'pdf-compress':
    'Shrinks the file size of a PDF so it is easier to email or store. It rebuilds the document structure and can strip hidden metadata, usually with no visible change to the content. Select your PDF, tick Strip metadata if you want a smaller, cleaner file, and click Compress. The new size is compared to the original.',

  'pdf-to-jpg':
    'Turns each page of a PDF into a separate image. It is useful when you need a photo of a page or want to post pages as images. Select your PDF, choose the image format (JPG or PNG), and click Convert. Every page is downloaded as its own image file.',

  'jpg-to-pdf':
    'Combines one or more images, such as JPGs or PNGs, into a single PDF document. This is handy for scanning documents or turning photos into a PDF. Select your images, choose a page size (Auto fits each image), and click Create PDF. Each image becomes one page.',

  'text-to-pdf':
    'Turns plain text into a neat PDF document with automatic page breaks. Type or paste your text (or paste it with Ctrl+V), choose a page size such as A4, and click Create PDF. Each page is filled before a new one is started.',

  'pdf-ocr':
    'Reads text out of scanned or image-based PDFs by recognizing the letters in the picture. It adds a searchable, selectable text layer on top of the page, so you can copy text or search the document. Select your scanned PDF, choose the language, and click Recognize text. The first run downloads a language pack for that language.',

  'pdf-extract-text':
    'Pulls all the text out of a PDF and saves it as a plain .txt file, with a marker at the start of each page. It is useful when you want to reuse or search the text of a document. Select your PDF and click Extract text, then download the .txt file.',

  'pdf-extract-images':
    'Finds every embedded image inside a PDF and exports each one as a PNG file. It is useful for pulling logos, diagrams or photos out of a document. Select your PDF and click Extract images. Each found image downloads individually.',

  'pdf-rotate':
    'Changes the orientation of PDF pages by 90, 180 or 270 degrees. You can rotate every page or just selected ones. Select your PDF, use the rotate buttons under each page thumbnail (or Rotate all), and download the rotated document.',

  'pdf-reorder':
    'Lets you rearrange the pages of a PDF into a new order using arrows or drag and drop, and optionally rotate individual pages at the same time. Select your PDF, move the pages around using the arrows and drag handles, and download the rearranged document.',

  'pdf-delete-pages':
    'Removes unwanted pages from a PDF. Tick the boxes of the pages you want to keep, or use the Quick select buttons, then download a PDF that contains only the pages you kept.',

  'pdf-watermark':
    'Stamps text onto every page of a PDF, like a logo, name or "CONFIDENTIAL" label. You can choose the text, position, size, rotation, opacity and color. Type your watermark text, adjust the settings, and click Add watermark. It is placed across every page.',

  'pdf-page-numbers':
    'Adds page numbers to every page of a PDF in a position and format you choose. Pick a style such as "Page X of Y", choose the position (top or bottom, left, center or right), and click Add page numbers.',

  'pdf-sign':
    'Puts your signature on a PDF page. You can draw it with your mouse or finger, type your name in a handwriting-style font, or upload a signature image. Choose the page and position, then click Sign PDF to download the signed document.',

  'pdf-redact':
    'Permanently blacks out words or sections that contain sensitive information, so the text underneath cannot be recovered. Enter keywords (comma separated) to black out matching text automatically, then download the redacted PDF.',

  'pdf-metadata':
    'Shows and lets you edit the hidden properties of a PDF, such as title, author, subject and keywords. Select your PDF to see its current metadata, change the fields you want, and click Save metadata to download a copy with the new properties.',

  'pdf-page-extractor':
    'Pulls out a specific range of pages from a PDF and saves them as a new document, leaving the original untouched. Type a range such as 1-3,5 or select pages from the grid, then click Extract. The extracted pages download as a new PDF.',

  'image-draw':
    'Lets you draw directly on top of an image you upload, using a pen, eraser, shapes, arrows and text. It is great for annotating screenshots, photos or designs. Upload your image, pick a tool and color from the panels, and draw on the image. Then download the annotated version.',

  'image-editor':
    'A full in-browser image editor that never uploads your photos. Open an image and use the left toolbar to draw, highlight, erase, add shapes, arrows and text, blur or pixelate regions, or sample colors. The Adjust tab lets you tweak brightness, contrast, saturation, hue and sharpness, the Resize tab changes dimensions, and the Rotate tab rotates or flips the canvas. Use the crop tool to trim edges with a resizable selection box. Every edit is undoable, layers stay editable, and you can export the result as PNG, JPG or WebP at current, original or custom size.',

  'drawing':
    'A full-screen drawing board where you can sketch from a blank canvas or draw over a photo. Pick a canvas size or upload an image, then use the brush, highlighter, eraser, shapes, arrows and text tools to create your artwork. Every stroke is editable, undoable and arranged in layers, so you can move, duplicate, resize and delete objects before exporting the finished drawing as PNG, JPG or WebP.',

  'pdf-to-word':
    'Pulls the text out of a PDF and rebuilds it as an editable Word DOCX file, so you can fix typos, reuse content or reformat it without retyping anything. Upload your PDF, wait a few seconds while it converts, then download the DOCX file straight to your device.',

  'html-to-pdf':
    'Turns HTML markup or a live webpage layout into a clean, paginated PDF you can save or print. Paste your HTML or upload an .html file, preview how it will look, then click Convert to download a properly paginated PDF.',

  'pdf-crop':
    'Trims empty margins or unwanted edges from every page of a PDF. Drag the crop box to the area you want to keep, apply it to one page or all pages, and download the cropped PDF with tighter, cleaner margins.',

  'pdf-header-footer':
    'Adds a custom header and footer, such as a company name, date or page title, to every page of a PDF at once. Type the header and footer text, choose the font size and alignment, then click Apply to download the updated PDF.',

  'pdf-fill-forms':
    'Opens a fillable PDF form so you can type directly into its text fields, checkboxes and dropdowns without printing it. Upload the form, fill in each field on screen, and download a completed copy ready to sign or submit.',

  'pdf-flatten':
    'Locks in form field values and annotations by merging them permanently into the page content, so the PDF can no longer be edited as a form. Upload the filled form and click Flatten to get a final, non-editable PDF.',

  'pdf-repair':
    'Attempts to fix a PDF that will not open properly, is missing pages, or shows as corrupted. Upload the damaged file and the tool rebuilds its internal structure where possible, letting you download a working copy.',

  'pdf-compare':
    'Compares two versions of a PDF side by side and highlights the text that was added, removed or changed between them. Upload both files and the differences are marked clearly, making it easy to spot edits in contracts or reports.',

  'pdf-viewer':
    'Opens and displays PDF files directly in your browser, with page navigation, zoom and search, no PDF reader software required. Drop in a file to start reading immediately, entirely on your own device.',

  'docx-to-pdf':
    'Converts a Microsoft Word DOCX file into a PDF while keeping the original formatting, fonts and layout intact. Upload your DOCX file and download a ready-to-share PDF in seconds.',

  'docx-to-html':
    'Extracts the formatted content of a Word document and converts it into clean HTML markup you can paste into a website or blog. Upload the DOCX file and copy or download the generated HTML.',

  'docx-to-markdown':
    'Converts a Word document into Markdown syntax, keeping headings, lists, bold and italic text intact, so it is ready for GitHub, blogs or note-taking apps. Upload your DOCX file and download the .md file.',

  'docx-to-txt':
    'Strips all formatting, styles and images from a Word document and leaves just the plain text. Upload your DOCX file and download or copy the clean text output.',

  'html-to-docx':
    'Converts HTML markup into a formatted Word DOCX document, preserving headings, lists and basic styling. Paste your HTML, preview the result, and download it as a ready-to-edit Word file.',

  'markdown-to-docx':
    'Converts Markdown text into a properly formatted Word DOCX document, turning headings, lists and emphasis into native Word styles. Paste or upload your Markdown file and download the generated DOCX.',

  'word-viewer':
    'Opens and displays DOCX files directly in your browser so you can read a Word document without installing Microsoft Word. Upload the file to view it instantly on any device.',

  'word-metadata':
    'Shows the hidden properties stored inside a DOCX file, including author, creation and modification dates, and revision count. Upload a Word document to inspect its metadata at a glance.',

  'word-compare':
    'Compares two Word documents and highlights exactly which sentences, words or formatting changed between them. Upload both versions and the differences are shown clearly side by side.',

  'word-remove-format':
    'Strips fonts, colors, styles and other formatting from a Word document, leaving clean plain text you can paste anywhere without carrying over unwanted styling. Upload your DOCX file and download the cleaned version.',

  // ─── Text tools ───────────────────────────────────────────────
  'remove-duplicates-text':
    'Removes repeated lines from a block of text, keeping only the first occurrence of each one. You can match case-sensitively or not, and sort the result afterward. Paste your text and the cleaned list appears instantly.',

  'sort-lines':
    'Sorts the lines of any text alphabetically, numerically, by length, or in reverse order. Useful for tidying up lists, CSV columns pasted as text, or code. Paste your lines, pick a sort mode, and copy the result.',

  'reverse-text':
    'Reverses a string of text, either flipping every character or just reversing the order of the words. Paste your text, pick a mode, and copy the reversed result.',

  'lorem-ipsum':
    'Generates placeholder Lorem Ipsum text for mockups, designs and layout testing. Choose how many paragraphs, sentences or words you need and copy the generated text straight into your design.',

  'slug-generator':
    'Converts any text into a clean, URL-friendly slug — lowercase, with spaces and symbols replaced by a separator of your choice. Handy for blog post URLs, file names and SEO-friendly links.',

  'text-cleaner':
    'Cleans up messy text by collapsing extra whitespace, stripping HTML tags, and normalizing line endings — pick which fixes to apply. Paste your text and copy the cleaned result.',

  'find-replace':
    'Finds every match of a word, phrase or regular expression in your text and replaces it with something else, showing how many replacements were made. Great for quick bulk edits without opening a code editor.',

  'remove-empty-lines':
    'Strips out blank or whitespace-only lines from a block of text, leaving only the lines that actually contain content. Paste your text and the cleaned version appears instantly.',

  'extract-emails':
    'Scans a block of text and pulls out every email address it can find, so you do not have to search manually. Paste text from an inbox, document or webpage and copy the list of addresses found.',

  'extract-urls':
    'Scans a block of text or HTML and pulls out every web link it can find. Useful for collecting sources from an article or checking what links are embedded in a document.',

  'extract-phones':
    'Scans a block of text and finds phone-number-like patterns, including common international formats. Paste your text and get a clean list of the numbers found.',

  'extract-hashtags':
    'Pulls all #hashtags and @mentions out of social media text or captions, listing them separately so you can reuse or analyze them. Paste your post text and copy the extracted list.',

  'diff-text':
    'Compares two blocks of text word by word and highlights exactly what was added or removed between them. Paste the original in one box and the edited version in the other to see the changes.',

  // ─── Web tools ────────────────────────────────────────────────
  'url-parser':
    'Breaks any URL down into its parts — protocol, host, port, path, query parameters and hash — displayed in an easy-to-read table. Paste a URL to instantly see everything it contains.',

  'user-agent-parser':
    'Reads a browser User-Agent string and tells you the browser, version, operating system, rendering engine and device type behind it. Defaults to your own browser, or paste any User-Agent string to inspect it.',

  'mime-checker':
    'Detects a file\'s real type by reading its first bytes (its "magic number"), then compares that against what the browser reports, catching files with misleading extensions. Upload any file to check it.',

  'html-entity':
    'Encodes special characters into HTML entities like &amp;amp;, &amp;lt; and &amp;gt;, or decodes entities back into normal characters. Useful when embedding text safely inside HTML. Paste your text, pick a direction, and copy the result.',

  'unicode-converter':
    'Converts text into its Unicode code points (like U+1F600) and back again, correctly handling emoji and characters from any script. Paste text or code points and copy the converted result.',

  'ascii-converter':
    'Converts text into space-separated ASCII/decimal character codes, or turns a list of codes back into readable text. Paste either format and copy the conversion.',

  'binary-converter':
    'Converts a number between binary, decimal, hexadecimal and octal, updating all four fields together as you type any one of them. Handy for quick number-base conversions while coding.',

  // ─── Utility / calculator tools ────────────────────────────────
  'unit-converter':
    'Converts values between units of length, weight, temperature, area, volume and speed. Pick a category, choose the units you are converting between, and the result updates instantly as you type.',

  'timezone-converter':
    'Shows what a chosen date and time looks like across a list of common time zones around the world, using your browser\'s built-in time zone data. Pick a date/time and source zone to see the equivalent everywhere else.',

  'timestamp-converter':
    'Converts a Unix timestamp (in seconds or milliseconds) into a human-readable date, or converts any date back into a timestamp. Includes a "now" button to grab the current timestamp instantly.',

  'age-calculator':
    'Calculates exact age in years, months and days (plus total days) from a birthdate to today. Enter a birthdate and the full breakdown appears instantly.',

  'percentage-calc':
    'Handles the three most common percentage questions: what is X% of Y, what percent X is of Y, and the percentage change between two numbers. Pick a calculator, enter your numbers, and get the answer instantly.',

  'bmi-calculator':
    'Calculates Body Mass Index from height and weight, in either metric or imperial units, along with the standard BMI category (underweight, normal, overweight, obese). Enter your measurements to see your result.',

  'emi-calculator':
    'Calculates the monthly EMI for a loan from the principal, interest rate and tenure, along with the total interest and total amount payable over the loan\'s life, using the standard reducing-balance formula.',

  'scientific-calc':
    'A full scientific calculator supporting trigonometry, logarithms, powers, roots, factorials and memory functions (M+/M-/MR/MC) — usable entirely with button clicks, just like a physical calculator.',

  'gst-calculator':
    'Calculates GST-inclusive and GST-exclusive amounts for an entered value, with quick presets for the common Indian GST slabs (5%, 12%, 18%, 28%). Enter an amount and rate to see the full breakdown.',

  'number-to-words':
    'Spells out any integer — including negative numbers and numbers into the billions — as English words, the way you would write it on a cheque. Type a number and see it converted instantly.',

  'roman-numerals':
    'Converts numbers to Roman numerals and Roman numerals back to numbers, both directions, with validation to catch invalid input. Type either format to see the conversion.',

  // ─── Security tools ─────────────────────────────────────────────
  'passphrase-gen':
    'Generates memorable multi-word passphrases (like the "correct-horse-battery-staple" style) instead of random character strings, which are easier to remember and type while remaining hard to guess. Choose the word count, separator and casing options, then copy the result.',

  'password-strength':
    'Analyzes a password and estimates its entropy in bits, how long it would take an offline attacker to crack it, and gives it an overall strength rating with a visual meter. Type a password to see the live analysis — nothing is sent anywhere.',

  'file-checksum':
    'Computes the SHA-256 and SHA-1 checksums of any file directly in your browser, so you can verify a download has not been corrupted or tampered with. Upload a file and optionally paste a checksum to compare against for an instant match/mismatch check.',

  'random-string':
    'Generates cryptographically secure random strings using your browser\'s crypto API, with configurable length, character set (letters, digits, symbols) and output count. Useful for API keys, tokens or temporary secrets.',

  'secure-notes':
    'Lets you write notes that are encrypted with a passphrase you choose (AES-GCM with PBKDF2 key derivation) before being saved in your browser\'s local storage — nothing is ever sent to a server. Losing the passphrase means losing the note, so keep it somewhere safe.',

  // ─── Color tools ──────────────────────────────────────────────
  'gradient-generator':
    'Visually builds CSS linear or radial gradients with multiple color stops and an adjustable angle, showing a live preview as you design it. Copy the generated CSS straight into your stylesheet.',

  'palette-color':
    'Generates a set of matching colors from a single seed color using classic color-harmony rules — complementary, analogous, triadic, tetradic or monochromatic. Pick a color and a harmony rule to get a ready-to-use palette with hex codes.',

  'contrast-checker':
    'Checks the contrast ratio between a foreground and background color against WCAG accessibility guidelines, showing pass/fail for AA and AAA levels on both normal and large text, with a live text preview.',

  'glassmorphism':
    'Visually designs a frosted-glass ("glassmorphism") UI panel — blur, transparency, border and shadow — with a live preview, then gives you the ready-to-use CSS to copy into your project.',

  // ─── Archive tools ──────────────────────────────────────────────
  'zip-extractor':
    'Opens a ZIP archive in your browser and lists every file inside it with its size, letting you download individual files or everything at once — no upload, the archive never leaves your device.',

  'zip-creator':
    'Bundles multiple files you select or drag in into a single downloadable ZIP archive, built entirely in your browser.',

  'batch-zip':
    'Zips each of several uploaded files individually rather than combining them into one archive, then bundles those individual zips together for a single download — handy when you need separate archives per file.',

  // ─── Excel / CSV tools ───────────────────────────────────────────
  'csv-viewer':
    'Displays pasted or uploaded CSV/TSV data as a clean, readable table with automatic header detection — no spreadsheet software required.',

  'csv-editor':
    'An editable spreadsheet-style table for CSV data: click any cell to edit it, add or remove rows and columns, then export your changes back to a CSV file.',

  'csv-cleaner':
    'Cleans up messy CSV data by trimming whitespace from every cell, removing fully empty rows, and normalizing line endings — pick which fixes to apply and download the cleaned file.',

  'csv-to-json':
    'Converts CSV or TSV rows into a JSON array of objects, using the first row as the object keys. Paste or upload your data and copy or download the resulting JSON.',

  'json-to-csv':
    'Flattens a JSON array of objects into CSV rows, automatically building a header from the union of every object\'s keys. Paste your JSON array and download the resulting CSV.',

  'tsv-converter':
    'Converts freely between CSV, TSV and JSON in any direction, so you can move tabular data between formats without opening a spreadsheet app.',

  'delimiter-converter':
    'Changes the delimiter of any delimited text file — for example turning comma-separated values into pipe- or semicolon-separated values. Pick the source and target delimiter and convert instantly.',

  'remove-duplicates':
    'Scans CSV data for exact-match duplicate rows and removes them, telling you how many were found and removed. Paste or upload your CSV and download the de-duplicated version.',

  'merge-csv':
    'Combines multiple CSV files into one by appending all their rows together, checking that the headers match across files and warning you if they do not. Upload your files and download the merged CSV.',

  // ─── Image tools ──────────────────────────────────────────────
  'ico-generator':
    'Creates a multi-size Windows .ico favicon file (16, 32, 48 and 64px) from any image you upload, so one file works everywhere a favicon is needed.',

  'image-to-base64':
    'Converts an uploaded image into a Base64 data URL string that you can paste directly into HTML, CSS or JSON without hosting a separate image file.',

  'base64-to-image':
    'Decodes a Base64 data URL or raw Base64 string back into a viewable image, with a download button for the result. Paste your Base64 string to preview and save the image.',

  'image-collage':
    'Arranges 2 to 9 uploaded images into a single grid collage, automatically choosing a sensible layout based on how many images you add, then lets you download the combined result.',

  'meme-generator':
    'Adds classic bold, white, black-outlined caption text to the top and bottom of any image — the familiar meme style — right in your browser. Upload an image, type your captions, and download the result.',

  'batch-resize':
    'Resizes many images at once to the same exact dimensions or the same percentage scale, then bundles all the results into a single downloadable ZIP file.',
};
