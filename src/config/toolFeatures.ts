import { TOOLS } from './tools';

export const PLANNED_FEATURES: Record<string, string[]> = {
  // ─── PDF ─────────────────────────────────────────────────────────
  'pdf-to-word':          ['Reconstruct editable paragraphs and lists', 'Detect headings and apply Word styles', 'Extract tables with cell alignment', 'Download as .docx instantly'],
  'word-to-pdf':          ['Convert DOCX to PDF with layout preserved', 'Keep fonts, images and tables intact', 'Drag-and-drop multiple files', 'Batch convert and download'],
  'pdf-to-excel':         ['Detect and extract tables automatically', 'Keep number and date formatting', 'Multi-sheet output for long PDFs', 'Download as .xlsx'],
  'excel-to-pdf':         ['Turn worksheets into print-ready PDFs', 'Page-break and orientation control', 'Fit-to-width scaling options', 'Preserve cell formatting'],
  'pdf-to-ppt':           ['Rebuild slides from PDF pages', 'Extract text and images into placeholders', 'Editable PowerPoint output', 'Keep slide aspect ratio'],
  'ppt-to-pdf':           ['Convert slides to PDF with layout intact', 'Preserve fonts and embedded media', 'Portrait or landscape output', 'Fast in-browser conversion'],
  'pdf-to-svg':           ['Vector SVG output from PDF pages', 'Crisp rendering at any zoom', 'Preserve text as editable paths', 'Download page by page'],
  'html-to-pdf':          ['Convert HTML markup to PDF', 'Handle CSS, tables and images', 'Custom page size and margins', 'Print-ready A4 / Letter output'],
  'pdf-crop':             ['Crop margins to custom sizes', 'Interactive crop box on page preview', 'Apply to all or selected pages', 'Preset sizes for common documents'],
  'pdf-remove-watermark': ['Detect and remove common watermarks', 'Smart region selection for removal', 'Repair page content after removal', 'Keep document structure intact'],
  'pdf-header-footer':    ['Insert custom header and footer text', 'Add logos and dates', 'Different first page support', 'Apply across all pages'],
  'pdf-protect':          ['Encrypt with owner and user passwords', 'Restrict printing, copying and editing', 'Set permissions granularly', '128/256-bit AES encryption'],
  'pdf-unlock':           ['Remove password protection you own', 'Strip editing restrictions', 'Keep content and layout unchanged', 'Quick in-browser decryption'],
  'pdf-fill-forms':       ['Fill interactive form fields', 'Text, checkbox and dropdown support', 'Save filled PDF for submission', 'Preview before download'],
  'pdf-flatten':          ['Merge form fields into page content', 'Remove editable fields and annotations', 'Lock the document state', 'Smaller, stable file output'],
  'pdf-repair':           ['Fix corrupted PDF structures', 'Rebuild broken cross-reference tables', 'Recover recoverable pages', 'Restore readable content'],
  'pdf-compare':          ['Side-by-side document comparison', 'Highlight added, removed and changed text', 'Per-page diff navigation', 'Export a comparison report'],
  'pdf-viewer':           ['Fast page-by-page viewing', 'Zoom, rotate and search inside PDFs', 'Thumbnail sidebar navigation', 'Print-ready rendering'],

  // ─── EXCEL & CSV ─────────────────────────────────────────────────
  'excel-to-csv':         ['Convert worksheets to CSV', 'Choose delimiter and encoding', 'Preserve number formatting', 'Batch export all sheets'],
  'csv-to-excel':         ['CSV to formatted XLSX', 'Detect delimiters automatically', 'First-row header detection', 'Download instantly'],
  'csv-viewer':           ['Clean table view of CSV data', 'Large-file handling', 'Sort columns on click', 'Search within rows'],
  'csv-editor':           ['Spreadsheet-style editing', 'Add, delete and reorder columns', 'Cell-level edits with undo', 'Export back to CSV'],
  'csv-cleaner':          ['Trim extra whitespace', 'Fix broken encodings', 'Remove malformed rows', 'Normalize date and number formats'],
  'csv-to-json':          ['Convert CSV to JSON arrays', 'Custom key mapping per column', 'Nested object support', 'Preview output in real time'],
  'json-to-csv':          ['Flatten nested JSON to CSV', 'Automatic header detection', 'Configurable value mapping', 'Handle large arrays'],
  'excel-to-json':        ['Convert worksheets to JSON', 'Row/object array formats', 'Skip empty rows option', 'Pretty-printed output'],
  'json-to-excel':        ['JSON arrays into XLSX', 'Type inference for cells', 'Column ordering control', 'Large dataset support'],
  'tsv-converter':        ['TSV ↔ CSV conversion', 'TSV to JSON output', 'Tab and delimiter handling', 'Encoding-aware parsing'],
  'delimiter-converter':  ['Change comma/tab/pipe/semicolon delimiters', 'Auto-detect current delimiter', 'Quote-aware parsing', 'Preview converted output'],
  'spreadsheet-viewer':   ['View XLSX and CSV in a table', 'No Excel installation needed', 'Formula-safe read-only mode', 'Print-friendly layout'],
  'remove-duplicates':    ['Find and delete duplicate rows', 'Match by whole row or key column', 'Keep first or last occurrence', 'Preview before removal'],
  'merge-csv':            ['Append multiple CSV files', 'Join on a key column', 'Header alignment across files', 'Download combined result'],

  // ─── POWERPOINT ─────────────────────────────────────────────────
  'pptx-to-pdf':          ['Convert slides to PDF', 'Preserve slide layout and design', '16:9 and 4:3 aspect support', 'Batch convert multiple files'],
  'pdf-to-pptx':          ['Rebuild slides from a PDF', 'Extract text into editable boxes', 'Keep images and shapes', 'Editable PowerPoint output'],
  'pptx-viewer':          ['View PPTX without Office', 'Full-slide preview and navigation', 'Zoom and fullscreen mode', 'Fast local rendering'],
  'pptx-to-images':       ['Export slides as PNG or JPG', 'Choose output resolution', 'Select a range of slides', 'Download all as ZIP'],
  'images-to-ppt':        ['Create a PPTX from images', 'One slide per image', 'Custom slide dimensions', 'Automatic image fit'],
  'merge-ppt':            ['Combine multiple presentations', 'Reorder the merged slide deck', 'Keep slide masters and layouts', 'Download single PPTX'],
  'split-ppt':            ['Split slides into separate files', 'Custom range splitting', 'Extract selected slides only', 'Download as ZIP'],

  // ─── IMAGE ───────────────────────────────────────────────────────
  'image-compressor':     ['Compress JPG, PNG, WebP and AVIF', 'Quality slider with live preview', 'Batch compress multiple images', 'Compare original vs compressed size'],
  'ai-bg-remover':        ['Auto subject detection with one click', 'Feather and refine edge control', 'Transparent or solid background output', 'Replace with a custom color'],
  'image-resize':         ['Resize by pixels or percentage', 'Lock aspect ratio option', 'Presets for social media sizes', 'Maintain quality with resampling'],
  'image-crop':           ['Free-form crop selection', 'Aspect-ratio lock (1:1, 16:9…)', 'Rotate within crop', 'High-quality export'],
  'image-rotate':         ['Rotate by any angle', '90° increments with quick buttons', 'Flip horizontal and vertical', 'Auto-rotate by EXIF orientation'],
  'image-flip':           ['Mirror horizontally', 'Mirror vertically', 'Live preview before saving', 'Keep original quality'],
  'image-convert':        ['Convert between JPG, PNG, WebP, AVIF and more', 'Batch format conversion', 'Quality control for lossy formats', 'Preserve transparency where possible'],
  'gif-converter':        ['Images or video to GIF', 'GIF to video or images', 'Frame rate and size control', 'Optimize GIF file size'],
  'svg-converter':        ['SVG to PNG/JPG at any resolution', 'Rasterize with scale factor', 'Transparent background option', 'Download high-res export'],
  'ico-generator':        ['Generate multi-size ICO files', '16×16 to 256×256 presets', 'Favicon-ready output', 'Preview all sizes before download'],
  'ai-upscaler':          ['Upscale up to 4x resolution', 'AI super-resolution models', 'Denoise while upscaling', 'Runs on-device, no upload'],
  'blur-background':      ['Auto subject detection', 'Adjustable blur strength', 'Real-time preview', 'Export transparent or blurred BG'],
  'image-sharpen':        ['Sharpen with adjustable radius', 'Unsharp mask controls', 'Enhance edge details', 'Compare before/after'],
  'noise-reduction':      ['Reduce grain and sensor noise', 'Adjustable denoise strength', 'Preserve fine details', 'Before/after comparison'],
  'image-adjust':         ['Brightness and contrast sliders', 'Saturation and hue control', 'Sharpness adjustment', 'Live preview and reset'],
  'palette-generator':    ['Extract dominant colors from images', 'Generate a harmonious palette', 'Copy HEX codes in one click', 'Export as CSS variables'],
  'image-to-base64':      ['Encode images to Base64 data URLs', 'Copy or download the string', 'Support all common formats', 'Instant client-side encoding'],
  'base64-to-image':      ['Decode Base64 strings to images', 'Preview before download', 'Paste-friendly input', 'Supports data URLs'],
  'ocr-image':            ['Extract text from any image', 'Multi-language OCR support', 'Layout-aware text detection', 'Copy or download as TXT'],
  'image-watermark':      ['Add text or logo watermarks', 'Opacity, size and position control', 'Tile or single placement', 'Batch watermark images'],
  'image-metadata':       ['Strip EXIF and GPS data', 'Remove all hidden metadata', 'Protect privacy before sharing', 'Preview metadata found'],
  'batch-resize':         ['Resize hundreds of images at once', 'Uniform output dimensions', 'Quality setting per batch', 'Download as ZIP'],
  'batch-rename':         ['Rename files with patterns', 'Add sequence numbers and dates', 'Find-and-replace renaming', 'Preview new names before applying'],
  'batch-convert':        ['Convert a folder of images', 'Choose target format and quality', 'Maintain folder structure', 'Download all results as ZIP'],
  'image-collage':        ['Arrange images into a grid collage', 'Custom spacing and background', 'Multiple layout templates', 'Export as one high-res image'],
  'meme-generator':       ['Add top and bottom text', 'Custom font, size and color', 'Drag text into position', 'Export shareable meme image'],
  'qr-generator':         ['Generate high-res QR codes', 'URL, text, Wi-Fi and vCard support', 'Custom colors and logo', 'SVG or PNG export'],

  // ─── VIDEO ───────────────────────────────────────────────────────
  'video-converter':      ['Convert MP4, WebM, MKV, AVI and more', 'FFmpeg WebAssembly engine', 'Preset output profiles', 'Batch conversion support'],
  'video-compressor':     ['Reduce file size with quality control', 'CRF and bitrate options', 'Live size estimate', 'Runs on your device'],
  'video-trim':           ['Precise start/end trimming', 'Frame-accurate cuts', 'Preview before exporting', 'Keep original quality'],
  'video-crop':           ['Crop the video frame', 'Preset aspect ratios', 'Interactive crop preview', 'Remove letterbox bars'],
  'video-rotate':         ['Rotate by 90°, 180° or 270°', 'Fix portrait/landscape orientation', 'Flip horizontal or vertical', 'Preserve audio track'],
  'video-flip':           ['Mirror video horizontally', 'Mirror vertically', 'Live preview', 'Keep audio in sync'],
  'video-merge':          ['Concatenate video clips seamlessly', 'Reorder clips before merging', 'Cross-fade transition option', 'Single output file'],
  'video-extract-audio':  ['Extract audio as MP3, WAV or AAC', 'Choose audio bitrate', 'Multiple video inputs', 'Download audio instantly'],
  'video-remove-audio':   ['Strip the audio track', 'Keep video quality intact', 'Fast processing', 'Output silent MP4/WebM'],
  'video-add-audio':      ['Replace or overlay an audio track', 'Offset and volume control', 'Mute original audio option', 'Mux into the final video'],
  'video-speed':          ['Speed from 0.25x to 4x', 'Preserve audio pitch option', 'Timelapse presets', 'Frame-rate aware processing'],
  'video-reverse':        ['Play video in reverse', 'Reverse audio too', 'Preview the effect', 'Export a reversed copy'],
  'gif-maker':            ['Create GIFs from video clips', 'Choose start, end and FPS', 'Size and quality control', 'Preview animation before saving'],
  'video-to-images':      ['Extract frames at intervals', 'Capture specific timestamps', 'PNG or JPG output', 'Download all frames as ZIP'],
  'images-to-video':      ['Turn images into a slideshow video', 'Custom frame duration', 'Cross-fade between images', 'MP4 or WebM export'],
  'video-watermark':      ['Overlay text or logo on video', 'Position, size and opacity control', 'Apply across the whole clip', 'Export watermarked video'],
  'video-subtitles':      ['Embed SRT subtitle files', 'Custom font and position', 'Extract existing subtitle tracks', 'Soft and hard subtitle modes'],
  'video-metadata':       ['View codec, resolution and duration', 'Frame rate and bitrate info', 'Audio track details', 'Copy metadata as JSON'],

  // ─── AUDIO ───────────────────────────────────────────────────────
  'audio-converter':      ['Convert MP3, WAV, OGG, FLAC, AAC and M4A', 'Adjustable bitrate and sample rate', 'Batch conversion', 'High-fidelity output'],
  'audio-compressor':     ['Reduce size with bitrate control', 'VBR and CBR modes', 'Live file-size comparison', 'Preserve audio clarity'],
  'audio-cutter':         ['Trim with waveform visualization', 'Frame-precise start/end points', 'Split into multiple segments', 'Fade in/out transitions'],
  'audio-merge':          ['Concatenate audio files', 'Reorder clips before merging', 'Optional crossfade between tracks', 'Single output file'],
  'audio-speed':          ['Adjust speed and pitch independently', 'Tempo presets (0.5x – 2x)', 'Pitch preservation option', 'High-quality resampling'],
  'audio-booster':        ['Amplify volume safely', 'Prevent clipping distortion', 'Adjustable gain level', 'Live preview'],
  'audio-noise':          ['Remove background noise and hiss', 'Adjustable reduction strength', 'Voice-preserving algorithm', 'Before/after preview'],
  'voice-recorder':       ['Record from your microphone', 'Export as MP3 or WAV', 'Pause and resume recording', 'Real-time waveform display'],
  'audio-metadata':       ['View and edit ID3 tags', 'Change title, artist and album', 'Add or remove cover art', 'Save updated MP3 file'],
  'speech-to-text':       ['Transcribe audio and video', 'Browser speech recognition', 'Timestamped transcript', 'Copy or download as TXT'],

  // ─── ARCHIVE ─────────────────────────────────────────────────────
  'zip-extractor':        ['Extract files from ZIP archives', 'Encrypted ZIP support', 'Preview contents before extracting', 'Download files individually or all'],
  'zip-creator':          ['Compress multiple files into ZIP', 'Choose compression level', 'Drag-and-drop file ordering', 'Password-protected archives'],
  'tar-extractor':        ['Extract .tar and .tar.gz files', 'Handle .tgz archives', 'Preserve folder structure', 'Download extracted files'],
  '7z-extractor':         ['Extract .7z archives via WASM', 'Password-protected 7z support', 'Browse contents first', 'Selective file extraction'],
  'batch-zip':            ['Zip each file individually', 'Create archives in bulk', 'Custom per-file names', 'Download all archives as one ZIP'],

  // ─── TEXT ────────────────────────────────────────────────────────
  'remove-duplicates-text':['Remove duplicate lines', 'Case-sensitive matching option', 'Optional sorting after dedupe', 'Copy or download clean text'],
  'sort-lines':           ['Sort alphabetically and reverse', 'Numeric and natural sorting', 'Sort by line length', 'Remove blanks while sorting'],
  'reverse-text':         ['Reverse the whole string', 'Reverse word order only', 'Reverse each word in place', 'Preserve line structure'],
  'lorem-ipsum':          ['Generate by paragraphs, sentences or words', 'Custom starting text option', 'Copy or download output', 'One-click word and line counts'],
  'slug-generator':       ['Convert text to URL-friendly slugs', 'Choose dash or underscore separator', 'Lowercase and accent handling', 'Copy instantly'],
  'text-cleaner':         ['Remove extra whitespace', 'Strip HTML tags', 'Fix common encoding issues', 'Normalize quotes and dashes'],
  'find-replace':         ['Find and replace with regex support', 'Case-sensitive toggle', 'Live match count', 'Replace all or one at a time'],
  'remove-empty-lines':   ['Strip blank and whitespace-only lines', 'Collapse multiple blanks', 'Preserve line numbering', 'Instant result'],
  'extract-emails':       ['Pull all email addresses from text', 'Deduplicate extracted emails', 'Copy as comma-separated list', 'Download as TXT'],
  'extract-urls':         ['Extract URLs and links from text/HTML', 'Sort and deduplicate results', 'Copy list instantly', 'Export to file'],
  'extract-phones':       ['Find phone numbers in any format', 'International number support', 'Deduplicate and sort', 'Copy or download the list'],
  'extract-hashtags':     ['Extract #hashtags and @mentions', 'Count frequency of each tag', 'Sort by popularity', 'Copy or download results'],
  'diff-text':            ['Compare two blocks of text', 'Highlight additions and deletions', 'Inline and side-by-side modes', 'Copy the merged result'],

  // ─── DEVELOPER ───────────────────────────────────────────────────
  'xml-formatter':        ['Pretty-print and indent XML', 'Minify XML output', 'Validate well-formedness', 'Syntax error highlighting'],
  'yaml-formatter':       ['Format and validate YAML', 'Convert YAML ↔ JSON', 'Indentation-aware parsing', 'Copy output instantly'],
  'sql-formatter':        ['Beautify SQL queries', 'Multiple SQL dialects', 'Configurable indentation', 'Keyword case control'],
  'html-formatter':       ['Prettify HTML markup', 'Minify for production', 'Adjustable indent size', 'Preserve inline scripts'],
  'css-formatter':        ['Format and indent CSS', 'Minify stylesheets', 'SCSS/LESS snippet support', 'Colorize properties'],
  'js-formatter':         ['Prettify JavaScript and TypeScript', 'Minify for production', 'Configurable options', 'Syntax highlighting'],
  'url-encoder':          ['Encode and decode URI components', 'Full URL encoding mode', 'Character-level breakdown', 'Copy or download output'],
  'diff-checker':         ['Compare code and text files', 'Colour-coded side-by-side diff', 'Ignore whitespace option', 'Export diff report'],
  'markdown-preview':     ['Live Markdown editor', 'Real-time HTML preview', 'CommonMark and GFM support', 'Copy rendered HTML'],
  'html-markdown':        ['Convert HTML to Markdown', 'Markdown to HTML conversion', 'Preserve links and images', 'Instant bidirectional toggle'],

  // ─── SECURITY ────────────────────────────────────────────────────
  'passphrase-gen':       ['Generate memorable word passphrases', 'EFF-approved wordlist', 'Custom word count and separator', 'Entropy estimate per phrase'],
  'password-strength':    ['Score strength from weak to strong', 'Entropy bits calculation', 'Estimated crack time', 'Actionable improvement tips'],
  'file-checksum':        ['Compute SHA-256, SHA-1 and MD5', 'Compare two checksums', 'Verify file integrity', 'Copy hash instantly'],
  'random-string':        ['Custom length and character set', 'Generate multiple strings at once', 'Exclude ambiguous characters', 'Copy results in one click'],
  'secure-notes':         ['Encrypt notes with a password', 'Store only in browser storage', 'Copy encrypted text anywhere', 'Decrypt on any device'],

  // ─── COLOR ───────────────────────────────────────────────────────
  'gradient-generator':   ['Linear and radial gradients', 'Drag-and-drop color stops', 'Angle and position control', 'Copy ready-to-use CSS'],
  'palette-color':        ['Generate harmonious palettes', 'Complementary, analogous, triadic rules', 'Lock and tweak seed colors', 'Export as CSS variables'],
  'contrast-checker':     ['WCAG AA/AAA ratio checking', 'Live text/background pickers', 'Accessibility pass/fail badges', 'Large-text and normal-text modes'],

  // ─── UTILITY ─────────────────────────────────────────────────────
  'unit-converter':       ['Length, weight, temperature and more', 'Instant conversion as you type', 'Common unit presets', 'Copy results with one click'],
  'currency-converter':   ['170+ world currencies', 'Configurable exchange rate source', 'Amount and rate precision control', 'Offline-capable base rates'],
  'timezone-converter':   ['Convert between any two time zones', 'World clock comparison', 'DST-aware calculation', 'Copy formatted time'],
  'timestamp-converter':  ['Unix timestamp to readable date', 'Date back to timestamp', 'Milliseconds and seconds modes', 'Local and UTC display'],
  'age-calculator':       ['Exact age in years, months and days', 'Total days, hours and minutes', 'Countdown to next birthday', 'Date-of-birth input presets'],
  'percentage-calc':      ['What percent of X is Y', 'Percentage increase and decrease', 'Reverse percentage problems', 'Copy answers instantly'],
  'bmi-calculator':       ['Metric and imperial units', 'Instant BMI score', 'Category classification', 'Healthy weight range guidance'],
  'emi-calculator':       ['Monthly EMI for any loan', 'Principal and interest breakdown', 'Payment schedule table', 'Adjustable tenure and rate'],
  'scientific-calc':      ['Trig, log and exponential functions', 'Factorial and memory functions', 'Degree/radian toggle', 'Expression history'],
  'gst-calculator':       ['GST inclusive and exclusive amounts', 'Configurable tax slabs', 'Breakdown by CGST/SGST/IGST', 'Quick state-preset selector'],
  'number-to-words':      ['Convert numbers to English words', 'Indian and Western numbering support', 'Currency formatting option', 'Copy result instantly'],
  'roman-numerals':       ['Arabic to Roman numerals', 'Roman back to Arabic', 'Validate correct Roman input', 'Copy conversion result'],

  // ─── WEB ─────────────────────────────────────────────────────────
  'url-parser':           ['Break URLs into protocol, host and path', 'Extract query parameters', 'Fragment and port detection', 'Copy any component'],
  'user-agent-parser':    ['Parse browser, OS and device', 'Engine and version detection', 'Bot and crawler identification', 'Copy structured JSON'],
  'mime-checker':         ['Detect MIME from magic bytes', 'Read file headers locally', 'Verify file-type spoofing', 'Show both MIME and extension'],
  'html-entity':          ['Encode text to HTML entities', 'Decode entities back to text', 'Named and numeric entity modes', 'Copy encoded output'],
  'unicode-converter':    ['Convert characters to code points', 'Support emoji and scripts', 'Escape sequences output', 'Reverse conversion'],
  'ascii-converter':      ['Text to ASCII codes', 'ASCII codes back to characters', 'Decimal and hex modes', 'Copy converted output'],
  'binary-converter':     ['Binary ↔ decimal ↔ hex ↔ octal', 'Signed and unsigned support', 'Bit-length display', 'Instant multi-base conversion'],

  // ─── AI ──────────────────────────────────────────────────────────
  'ai-ocr':               ['Extract text from scans and photos', 'Multi-language OCR', 'Preserve reading order', 'Export as TXT or PDF text layer'],
  'ai-face-blur':         ['Auto face detection', 'Adjustable blur intensity', 'Blur all faces in one click', 'Runs on-device with local models'],
  'ai-object-detect':     ['Detect and label objects', 'YOLO models via WebAssembly', 'Bounding-box visualization', 'Download annotated image'],
  'ai-caption':           ['Describe any image automatically', 'On-device vision model', 'Copy or download captions', 'Private on-device processing'],
  'ai-speech-to-text':    ['Transcribe speech in real time', 'Whisper.js on-device model', 'Timestamped output', 'Multiple language support'],
  'ai-translator':        ['Translate between 100+ languages', 'Local neural machine translation', 'Detect source language', 'No data ever sent to servers'],
  'ai-grammar':           ['Fix grammar, spelling and style', 'On-device language model', 'Inline suggested corrections', 'Rewrite paragraph improvements'],
  'ai-summarizer':        ['Summarize long documents', 'Configurable summary length', 'Key-point bullet extraction', 'Local AI model processing'],
  'ai-keyword':           ['Extract relevant keywords and phrases', 'NLP analysis in browser', 'Frequency and relevance ranking', 'Copy extracted terms'],
};

const IMPLEMENTED = [
  'json-formatter', 'base64', 'hash-generator', 'uuid-generator',
  'password-generator', 'regex-tester', 'case-converter',
  'jwt-decoder', 'word-counter',
  'color-converter', 'pdf-merge', 'ai-bg-remover',
  'image-resize', 'image-resize-image', 'image-crop', 'image-rotate',
  'image-flip', 'image-convert', 'image-converter', 'image-compressor',
  'compress-image', 'compress-images', 'image-adjust', 'image-sharpen',
  'svg-converter', 'svg-to-png', 'image-metadata',
  'image-watermark', 'qr-generator', 'qr-code-generator', 'ocr-image', 'ai-upscaler',
  'image-draw', 'image-editor', 'drawing', 'drawing-board',
  'pdf-split', 'pdf-compress', 'pdf-to-jpg', 'jpg-to-pdf',
  'text-to-pdf', 'pdf-ocr', 'pdf-extract-text', 'pdf-extract-images',
  'pdf-rotate', 'pdf-reorder', 'pdf-delete-pages', 'pdf-watermark',
  'pdf-page-numbers', 'pdf-sign', 'pdf-metadata', 'pdf-redact', 'pdf-page-extractor',
];

const EXEMPT = [
  'docx-to-pdf', 'docx-to-html', 'docx-to-markdown', 'docx-to-txt',
  'html-to-docx', 'markdown-to-docx', 'word-viewer', 'word-metadata',
  'word-compare', 'word-remove-format',
];

const missing = TOOLS
  .filter(t => !IMPLEMENTED.includes(t.id) && !EXEMPT.includes(t.id) && !(t.id in PLANNED_FEATURES))
  .map(t => t.id);

if (missing.length > 0) {
  console.warn('[NextTool] Coming-soon tools missing planned features:', missing.join(', '));
}
