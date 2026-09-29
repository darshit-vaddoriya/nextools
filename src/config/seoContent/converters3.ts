import { ToolSeoMap } from './types';

/**
 * Copy for the third batch of converter pages, which shipped with only the
 * one-line card blurb and the upload widget. Each entry describes what the
 * engine in src/tools/convert/engines actually does, including what it drops,
 * because the limits are what someone deciding whether to trust a converter
 * needs to know first.
 */
export const CONVERTER_SEO_CONTENT_3: ToolSeoMap = {
  'srt-to-vtt': {
    intro:
      'SRT and WebVTT carry the same thing, a list of timed captions, but HTML5 video players only accept WebVTT through the <track> element. The formats differ in three small ways: VTT files start with a WEBVTT header, write milliseconds after a full stop instead of a comma, and treat a bare < or & as markup. This converter makes those changes, keeps italic, bold and underline tags, and gives you a .vtt file a browser player will load.',
    steps: [
      { title: 'Add the SRT files', description: 'Drop one or several .srt files. Each converts separately.' },
      { title: 'Convert', description: 'Cues are read, timestamps normalised to HH:MM:SS.mmm and the WEBVTT header added.' },
      { title: 'Download', description: 'One file downloads as .vtt; several arrive together in a ZIP.' },
      { title: 'Attach it to the video', description: 'Reference it from a <track kind="subtitles"> element, or upload it wherever your player asks for captions.' },
    ],
    faqs: [
      { question: 'Why will my video player not load an SRT file?', answer: 'The HTML5 <track> element is specified for WebVTT only. Browsers ignore an SRT file there even though the cue text is nearly identical, which is why a web player needs the VTT version.' },
      { question: 'What happens to the cue numbers?', answer: 'They are dropped. SRT requires a number above every cue; WebVTT does not need one, and the converter identifies cues by their timing line instead.' },
      { question: 'Are positioning codes kept?', answer: 'Some SRT files carry SubStation-style codes such as {\\an8} to move a caption to the top of the frame. VTT has its own cue settings for that, so those codes are removed rather than shown as literal text.' },
      { question: 'My accented characters look wrong in the result. Why?', answer: 'The file is read as UTF-8. An older SRT saved in a Windows code page will show its accented letters as garbage. Open it in a text editor, save it as UTF-8, and convert again.' },
      { question: 'Is the subtitle file uploaded?', answer: 'No. The conversion is plain text processing inside this tab, so an unreleased transcript never leaves your device.' },
    ],
    useCases: [
      'Adding captions to a video on your own website with the <track> element',
      'Moving captions exported from a video editor into a web player',
      'Preparing subtitles for a course platform that asks for WebVTT',
    ],
    tips: [
      'Check the first few cues after converting: a missing WEBVTT header or a comma in a timestamp is the usual reason a player silently shows nothing.',
      'If your source video is going somewhere that burns captions in, you do not need VTT at all; keep the SRT.',
    ],
  },

  'vtt-to-srt': {
    intro:
      'WebVTT is the caption format of the web, but most video editors, desktop players and TV apps still expect SRT. Going this direction loses things, because VTT can do more: cue positions and alignment, NOTE comments, STYLE blocks, speaker voice tags and karaoke-style word timings have no SRT equivalent. This converter keeps the cue text and timing, turns a speaker tag into a "Name:" prefix so the information is not lost, and removes what SRT players would otherwise print as literal text.',
    steps: [
      { title: 'Add the VTT files', description: 'Drop one or several .vtt files, for example captions downloaded from a web player.' },
      { title: 'Convert', description: 'The WEBVTT header, NOTE and STYLE blocks are skipped; cues are numbered and timestamps rewritten with commas.' },
      { title: 'Download', description: 'One file downloads as .srt; several arrive in a ZIP.' },
      { title: 'Load it next to the video', description: 'Give the SRT the same name as the video file and most players pick it up automatically.' },
    ],
    faqs: [
      { question: 'What is removed?', answer: 'Cue settings such as position and alignment, NOTE and STYLE blocks, class and language tags, and inline karaoke timestamps. SRT has no way to express them, and players tend to show them as stray text.' },
      { question: 'What happens to speaker names?', answer: 'A VTT voice tag such as <v Asha> becomes the plain prefix "Asha: " at the start of the line, so who is speaking survives the conversion.' },
      { question: 'Is italic and bold kept?', answer: 'Yes. Both formats understand <i>, <b> and <u>, so those tags are left in place.' },
      { question: 'Why are some captions missing from the result?', answer: 'A cue with a timing line but no text is skipped, as is any block without a valid "start --> end" line. If a large number vanish, the source probably uses a timestamp layout the parser does not recognise.' },
      { question: 'Does the file leave my computer?', answer: 'No. It is read and rewritten as text inside the browser tab.' },
    ],
    useCases: [
      'Importing web captions into Premiere Pro, DaVinci Resolve or another editor',
      'Playing a downloaded lecture with subtitles in VLC or on a TV',
      'Handing captions to a translator whose tools only read SRT',
    ],
    tips: [
      'If the captions relied on positioning, for example to avoid on-screen text, check those scenes after converting, since every cue will now sit in the default position.',
    ],
  },

  'wav-to-flac': {
    intro:
      'FLAC is lossless compression for audio: it makes a file smaller the way ZIP does, and decoding it gives back exactly the samples that went in. A WAV of recorded music typically shrinks to somewhere between half and two thirds of its size, with no change to how it sounds. This converter encodes FLAC in the browser with a WebAssembly build of the reference libFLAC encoder, because no browser ships a FLAC encoder of its own.',
    steps: [
      { title: 'Add audio files', description: 'WAV is the usual source. MP3, M4A, AAC, OGG and Opus files, and the soundtrack of MP4, MOV and WebM videos, are accepted too.' },
      { title: 'Convert', description: 'The encoder loads on first use, then each file is compressed on your device.' },
      { title: 'Download', description: 'One file downloads as .flac; several arrive in a ZIP.' },
    ],
    faqs: [
      { question: 'Does FLAC lose any quality?', answer: 'No. FLAC is lossless: decoding the file reproduces the input samples exactly, bit for bit.' },
      { question: 'Will converting an MP3 to FLAC improve it?', answer: 'No. The MP3 already threw information away when it was made, and FLAC can only preserve what is left. You get a larger file that sounds identical to the MP3. Convert to FLAC from WAV, a CD rip, or another lossless source.' },
      { question: 'How much smaller will the file be?', answer: 'It depends on the audio. Dense, loud music compresses least, often to around 60 to 70 percent of the WAV. Speech, quiet passages and silence compress much further.' },
      { question: 'Why use FLAC instead of WAV?', answer: 'Same sound, smaller files, and FLAC can carry tags such as artist and title that WAV handles poorly. Most music players, phones and editors read it.' },
      { question: 'Is my audio uploaded?', answer: 'No. Decoding and encoding both run in this tab.' },
    ],
    useCases: [
      'Archiving recordings or CD rips without keeping full-size WAV files',
      'Sending lossless masters to a collaborator in half the download size',
      'Freeing disk space from a folder of WAV exports',
    ],
    tips: [
      'Keep the result lossless all the way: edit from the FLAC or WAV, and only export to MP3 or AAC at the very end.',
      'The first conversion takes a moment longer because the encoder has to download; later files start immediately.',
    ],
  },

  'jpg-to-avif': {
    intro:
      'AVIF is an image format built on the AV1 video codec. At the same visual quality it is usually noticeably smaller than JPG and often smaller than WebP, which makes it worth using for images on a website where every kilobyte adds load time. This converter encodes AVIF in the browser with the libavif encoder compiled to WebAssembly, and accepts JPG, PNG, WebP, BMP, TIFF and HEIC as input.',
    steps: [
      { title: 'Add images', description: 'Drop one or many JPG, PNG, WebP, BMP, TIFF or HEIC files.' },
      { title: 'Set quality and size', description: 'The quality slider trades size for detail; a width shrinks large photos before encoding.' },
      { title: 'Convert', description: 'AVIF encoding is slower than JPG, so a large batch takes a little while.' },
      { title: 'Download', description: 'One image downloads directly; several arrive in a ZIP.' },
    ],
    faqs: [
      { question: 'Which browsers can show AVIF?', answer: 'Current Chrome, Edge, Firefox and Safari all display AVIF. For very old browsers, serve it inside a <picture> element with a JPG fallback.' },
      { question: 'Why is encoding slower than other formats?', answer: 'AV1 compression searches much harder for an efficient encoding than JPG does, and that search is what makes the file small. Decoding, which is what visitors do, is fast.' },
      { question: 'Will converting a JPG to AVIF make it look better?', answer: 'No. The artefacts already in the JPG are carried over. AVIF makes the file smaller at similar quality; to get the most out of it, convert from the original PNG or camera image where you have one.' },
      { question: 'Does it keep transparency?', answer: 'Yes. AVIF supports an alpha channel, so transparent areas of a PNG or WebP stay transparent.' },
      { question: 'Are my photos uploaded?', answer: 'No. Decoding and encoding happen in this tab.' },
    ],
    useCases: [
      'Cutting the weight of hero images and product photos on a website',
      'Replacing large PNG screenshots with much smaller files',
      'Converting HEIC photos from an iPhone into a compact web format',
    ],
    tips: [
      'Resize to the largest size the page will actually display before encoding. A 4000 px photo shown at 1200 px wastes bytes in any format.',
      'Compare the result against the original at 100% zoom on the parts with fine texture, such as hair and foliage, since that is where AVIF smooths first at low quality.',
    ],
  },

  'png-to-svg': {
    intro:
      'A PNG is a grid of pixels, so enlarging it makes the edges blocky. An SVG describes shapes, so it stays sharp at any size. This tool traces a raster image into vector shapes: it reduces the picture to a small number of colours, finds the outline of each coloured region, and fits smooth paths to those outlines. That works very well for logos, icons, signatures and flat illustrations, and poorly for photographs.',
    steps: [
      { title: 'Add the image', description: 'PNG, JPG, WebP, BMP and GIF are accepted. Use the largest, cleanest copy you have.' },
      { title: 'Choose colours', description: '2 for a black-and-white logo or signature, 4 to 8 for most logos, 16 for flat illustrations with shading.' },
      { title: 'Choose detail', description: 'Smooth removes speckles and rounds edges; Detailed follows every corner of the source.' },
      { title: 'Convert and check', description: 'Open the SVG and zoom in. If edges wobble or small specks appear, try the other detail setting or fewer colours.' },
    ],
    faqs: [
      { question: 'Can it vectorise a photograph?', answer: 'Technically yes, usefully no. A photo has smooth gradients everywhere, so tracing produces thousands of small blobs, a very large file, and something that looks like a posterised painting. Keep photos as JPG, WebP or AVIF.' },
      { question: 'Why does my logo have jagged or lumpy edges?', answer: 'Tracing can only follow the pixels it is given. A small or blurry source has soft, stepped edges, and those become the outline. Start from the largest version available, and try the Smooth setting.' },
      { question: 'Is there a size limit?', answer: 'The longest side is scaled to at most 1200 pixels before tracing. Beyond that, tracing slows down sharply and the SVG grows without gaining visible detail.' },
      { question: 'Will the text in my logo stay editable?', answer: 'No. Letters are traced as shapes like everything else. If you need editable text, retype it in a vector editor using the original font.' },
      { question: 'Is the image uploaded?', answer: 'No. Tracing runs in this tab.' },
    ],
    useCases: [
      'Turning an old logo, available only as a PNG, into a scalable file for print',
      'Converting a scanned signature into a clean vector for documents',
      'Making icons that stay sharp on high-density screens',
    ],
    tips: [
      'Fewer colours usually give a cleaner result. Pick the smallest number that still keeps every distinct part of the design.',
      'For professional print work, treat the trace as a starting point and tidy the paths in a vector editor.',
    ],
  },

  'tiff-to-pdf': {
    intro:
      'TIFF is still the default output of many scanners and fax systems, and a single .tif file often holds several pages. Most people cannot open that easily, and email clients rarely preview it. This converter reads every page of a multi-page TIFF and puts them in one PDF, in order, with each page sized from the resolution stored in the TIFF so that an A4 scan prints at A4.',
    steps: [
      { title: 'Add the TIFF', description: 'Drop a .tif or .tiff file. Several files each become their own PDF.' },
      { title: 'Convert', description: 'Every page is decoded and placed on a PDF page of the same physical size. Embedded thumbnail images are skipped.' },
      { title: 'Download', description: 'The PDF downloads directly, or several arrive in a ZIP.' },
    ],
    faqs: [
      { question: 'Are all pages of a multi-page TIFF included?', answer: 'Yes, in the order they are stored. Reduced-size thumbnail copies that some scanners add are recognised and left out, so they do not appear as extra pages.' },
      { question: 'Why is my PDF larger than the TIFF?', answer: 'Each page is stored in the PDF as a high-quality JPEG. Black-and-white fax TIFFs use a special two-colour compression that is extremely compact, and a JPEG of the same page is usually larger. For colour and greyscale scans the PDF is often similar in size or smaller.' },
      { question: 'Will the text be searchable?', answer: 'No. A scan is a picture of text. Run the PDF through OCR afterwards if you need to search or copy it.' },
      { question: 'What if the TIFF has no resolution information?', answer: 'The page size is calculated at 96 dots per inch, which may make pages print larger than the original. Most scanners do record their resolution, so this is uncommon.' },
      { question: 'Is the scan uploaded?', answer: 'No. Decoding and PDF creation happen in this tab, which matters because scans are so often contracts, IDs and medical letters.' },
    ],
    useCases: [
      'Emailing a multi-page scan to someone who cannot open TIFF files',
      'Turning received faxes into PDFs for a document system',
      'Uploading scanned documents to a portal that only accepts PDF',
    ],
    tips: [
      'If the PDF is going to a size-limited upload form, compress it after converting.',
      'Check the page count in the PDF against the scanner\'s count; a mismatch usually means the TIFF was saved as separate files.',
    ],
  },

  'csv-to-sql': {
    intro:
      'Getting a spreadsheet into a database usually means either a database-specific import wizard or writing INSERT statements by hand. This converter reads a CSV, TSV or Excel file and writes a plain SQL script: a CREATE TABLE statement with a type chosen for each column, followed by INSERT statements for every row. Paste it into a database console or run it from the command line.',
    steps: [
      { title: 'Add the file', description: 'CSV, TSV, XLSX, XLS and ODS are accepted. The first row must contain the column names.' },
      { title: 'Pick the quoting style', description: 'Double quotes suit PostgreSQL, SQLite and SQL Server; backticks suit MySQL and MariaDB.' },
      { title: 'Convert', description: 'Column types are inferred, names are cleaned, and rows are written in batches of 500.' },
      { title: 'Run the script', description: 'Review the CREATE TABLE line first, adjust any type you disagree with, then execute it.' },
    ],
    faqs: [
      { question: 'How are column types chosen?', answer: 'A column becomes BOOLEAN if every value is true or false, INTEGER if every value is a whole number, REAL if every value is numeric, DATE if every value is written YYYY-MM-DD, and TEXT otherwise. Empty cells become NULL and do not affect the choice.' },
      { question: 'Why did my ID or postcode column become TEXT?', answer: 'Deliberately. A value with a leading zero, such as 00745, would lose the zero as a number, so any column containing one stays TEXT. The same applies to numbers longer than 18 digits.' },
      { question: 'What happens to column names with spaces or symbols?', answer: 'They are lowercased, spaces become underscores, other symbols are removed, and a name that would start with a digit gets a prefix. Duplicate names are numbered so every column is unique.' },
      { question: 'What about Excel files with several sheets?', answer: 'Each non-empty sheet becomes its own table, named after the sheet.' },
      { question: 'Does it work with SQL Server?', answer: 'Mostly. SQL Server has no BOOLEAN type or TRUE and FALSE literals, so change BOOLEAN columns to BIT and the values to 1 and 0 before running the script there.' },
    ],
    useCases: [
      'Loading a spreadsheet export into a development database',
      'Creating seed data for tests from a CSV',
      'Moving a small dataset between systems without an import wizard',
    ],
    tips: [
      'The script has no primary key, indexes or constraints. Add them to the CREATE TABLE line before you run it if the table will be queried.',
      'Rows are batched 500 per INSERT so that each statement stays under default server limits even for large files.',
    ],
  },

  'markdown-to-epub': {
    intro:
      'EPUB is the standard e-book format read by Apple Books, Kobo, Google Play Books, most e-reader apps, and Kindle via Send to Kindle. It is a ZIP of XHTML chapters with a table of contents. This converter builds one from a Markdown, plain text or HTML file: headings become chapters, the table of contents is generated from them, and the result is a valid EPUB 3 file that also carries an EPUB 2 contents file for older readers.',
    steps: [
      { title: 'Prepare the source', description: 'Use a top-level heading (# in Markdown) at the start of each chapter. A document with no # headings is split at ## instead.' },
      { title: 'Add the file', description: '.md, .txt and .html are accepted. In plain text, blank lines separate paragraphs.' },
      { title: 'Convert', description: 'Chapters are split, converted to XHTML and packed with a navigation file and a simple reading stylesheet.' },
      { title: 'Open it in a reader', description: 'Transfer the .epub to your e-reader or app and check the table of contents.' },
    ],
    faqs: [
      { question: 'Where does the book title come from?', answer: 'From the first top-level heading in the document, or the file name if there is none.' },
      { question: 'Are images included?', answer: 'No. A Markdown or HTML file refers to images by paths that cannot be followed from inside the browser, and an EPUB may only contain resources listed in its own manifest, so images are removed rather than left as broken links.' },
      { question: 'Can I read it on a Kindle?', answer: 'Yes. Amazon\'s Send to Kindle service accepts EPUB files and converts them for the device.' },
      { question: 'Is Markdown fully supported?', answer: 'GitHub-flavoured Markdown is: headings, emphasis, lists, block quotes, code blocks, tables and links. Scripts, forms and embedded media are removed because e-readers do not run them.' },
      { question: 'Is my manuscript uploaded?', answer: 'No. The book is assembled in this tab.' },
    ],
    useCases: [
      'Reading your own long notes or drafts on an e-reader',
      'Packaging documentation or a guide as a downloadable e-book',
      'Sharing a manuscript with beta readers in a format their devices handle',
    ],
    tips: [
      'Keep one # heading per chapter and use ## and ### inside chapters; that structure is exactly what the table of contents is built from.',
      'The book language is marked as English. Readers use it for hyphenation and text-to-speech, so for another language, adjust it in an EPUB editor before publishing.',
    ],
  },

  'rtf-to-docx': {
    intro:
      'RTF, Rich Text Format, is what WordPad and older word processors save, and what some legal, medical and accounting systems still export. It is plain text with formatting codes, and while Word opens it, many tools and upload forms want a .docx. This converter reads the RTF itself and rebuilds the text as DOCX, plain text or HTML, keeping paragraphs, line breaks, tabs, bold, italic and underline, and every character whatever code page the file was written in.',
    steps: [
      { title: 'Add the RTF file', description: 'Drop one or more .rtf files.' },
      { title: 'Pick the output', description: 'DOCX for Word and Google Docs, TXT for the bare text, HTML for a web page.' },
      { title: 'Convert and download', description: 'Several files arrive together in a ZIP.' },
    ],
    faqs: [
      { question: 'What formatting is kept?', answer: 'Paragraphs, line breaks, tabs, bold, italic and underline, plus all characters, including accented and non-Latin text written in any code page or as Unicode escapes.' },
      { question: 'What is dropped?', answer: 'Fonts and sizes, colours, style sheets, page layout, headers and footers, footnotes, comments and embedded pictures. The result is the document\'s text and emphasis in clean default formatting.' },
      { question: 'Why not just open the RTF in Word and save as DOCX?', answer: 'If you have Word, that keeps more of the layout. This converter is for when you do not, or when you want clean text without the RTF\'s legacy formatting carried along.' },
      { question: 'Is it safe for confidential documents?', answer: 'The file is parsed in this browser tab and never uploaded, which matters for the legal and medical exports RTF is so often used for.' },
    ],
    useCases: [
      'Converting WordPad documents for someone who needs DOCX',
      'Extracting clean text from RTF exports of case management or medical systems',
      'Turning old RTF archives into files modern tools handle',
    ],
    tips: [
      'If the document relies on tables or images, check the result carefully; this converter is built for text documents.',
    ],
  },

  'ai-to-pdf': {
    intro:
      'An Adobe Illustrator .ai file is, in most cases, already a PDF. Illustrator\'s default "Create PDF Compatible File" option writes a complete PDF copy of the artwork into the file, alongside its own editing data. This tool checks for that PDF, and if it is there, gives it back to you as a .pdf that any viewer opens, or renders it as PNG or JPG images, without needing Illustrator.',
    steps: [
      { title: 'Add the .ai file', description: 'Drop one or more Illustrator files.' },
      { title: 'Pick PDF, PNG or JPG', description: 'PDF keeps the artwork as vectors; PNG and JPG render it as images.' },
      { title: 'Convert and download', description: 'Several files, or a multi-page PDF rendered as images, arrive in a ZIP.' },
    ],
    faqs: [
      { question: 'Is the PDF version exact?', answer: 'Yes. The PDF is the one Illustrator itself wrote into the file, taken as it is. Vectors stay vectors, nothing is re-rendered, and text and colours are as Illustrator saved them.' },
      { question: 'Why does my file fail to convert?', answer: 'It was saved without "Create PDF Compatible File" ticked, or by Illustrator 8 or older. Those files are PostScript rather than PDF and cannot be read in a browser. Re-saving from Illustrator with the option ticked fixes it.' },
      { question: 'Can I edit the layers afterwards?', answer: 'No. Layers and other editing data belong to Illustrator\'s private part of the file. The PDF and images show the finished artwork, which is what a client or printer usually needs.' },
      { question: 'Should I choose PNG or JPG?', answer: 'PNG for logos and anything with transparency or sharp edges; JPG for artwork that is mostly photographic, where it gives a smaller file.' },
      { question: 'Is the artwork uploaded?', answer: 'No. The file is read and rendered in this tab, which matters for unreleased brand work.' },
    ],
    useCases: [
      'Viewing a logo or design a designer sent as .ai, without Illustrator',
      'Sending artwork to a printer or client that wants a PDF',
      'Getting a PNG of a logo for a website or presentation',
    ],
    tips: [
      'For print, send the PDF rather than an image: it stays sharp at any size.',
    ],
  },
};
