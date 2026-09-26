import { ToolSeoMap } from './types';

/**
 * Copy for the second batch of converter pages: Photoshop and RAW images,
 * video, structured data, presentations, e-books, fonts and archives. As with
 * the first batch, each entry is about what is specific to that conversion —
 * what survives it, what does not, and why someone makes it.
 */
export const CONVERTER_SEO_CONTENT_2: ToolSeoMap = {
  'psd-to-png': {
    intro:
      'A PSD is Photoshop\'s working file: layers, masks, adjustment layers and text that stays editable. Most people who receive one only need to see or use the finished picture, and without Photoshop that is surprisingly hard — Windows and most phones show a blank icon. This converter reads the PSD in your browser and saves the flattened image as PNG (keeping transparency), JPG or WebP, so a client\'s mock-up or a designer\'s export can be viewed, shared or dropped into a document without any Adobe software.',
    steps: [
      { title: 'Add the PSD', description: 'Drop one or more .psd files. Large Photoshop Big (.psb) files are accepted too.' },
      { title: 'Pick PNG, JPG or WebP', description: 'PNG keeps transparent areas; JPG is smallest for photographic designs; WebP is for the web.' },
      { title: 'Optionally resize', description: 'A 4000 px artboard can be scaled down to the size you actually need.' },
      { title: 'Convert and download', description: 'The flattened image downloads; several PSDs arrive as one ZIP.' },
    ],
    faqs: [
      { question: 'Does it keep the layers?', answer: 'No — PNG, JPG and WebP are single flat images, so the result is what the design looks like with all visible layers combined. Keep the PSD if you need to edit layers later.' },
      { question: 'Why does my PSD look different from Photoshop?', answer: 'The converter uses the flattened preview Photoshop stores inside the file when "Maximize PSD and PSB File Compatibility" is on, which is exact. If that preview is missing, visible layers are stacked in order, and blend modes, layer effects and adjustment layers are not reproduced. Re-saving the PSD with Maximize Compatibility turned on fixes it.' },
      { question: 'Is my design uploaded anywhere?', answer: 'No. The PSD is parsed with a JavaScript reader inside this tab, which matters for unreleased artwork and client work under NDA.' },
      { question: 'Can it open very large PSD files?', answer: 'Files of a few hundred megabytes work on a laptop. The whole file has to fit in the browser\'s memory, so a phone may struggle with the largest ones.' },
      { question: 'Will CMYK PSDs convert correctly?', answer: 'They convert, but colours are shown in RGB for the screen. For print work, export from Photoshop with your colour profile instead.' },
    ],
    useCases: [
      'Viewing a PSD mock-up a designer sent when you do not have Photoshop',
      'Dropping a design into a slide deck, document or email as PNG',
      'Exporting web-ready WebP images from a folder of PSD files in one batch',
      'Checking what a stock template looks like before buying software to edit it',
    ],
    tips: [
      'Choose PNG when the design has a transparent background you want to keep',
      'Ask designers to save with Maximize Compatibility on — it makes every viewer, including this one, show the file exactly',
      'Resize during conversion; full-size PSD exports are often far larger than any screen needs',
    ],
  },

  'raw-to-jpg': {
    intro:
      'Camera RAW files — DNG, NEF, CR2, CR3, ARW, RAF, ORF and others — store the sensor data before any processing, which is why they are large and why most apps and websites cannot open them. Every camera also writes a full-size JPEG preview inside the RAW, processed with the camera\'s own settings: it is the image you saw on the camera\'s screen. This tool finds that embedded preview and saves it as JPG, PNG or TIFF, losslessly and in seconds, so you can share or check a shoot without a RAW editor.',
    steps: [
      { title: 'Add RAW files', description: 'Drop files from any camera brand; a whole card\'s worth at once is fine.' },
      { title: 'Choose the output', description: 'JPG for sharing, PNG or TIFF if you want to edit without further compression.' },
      { title: 'Resize if needed', description: 'Previews are usually full resolution; shrink them for email or social media.' },
      { title: 'Convert and download', description: 'Each file converts in a second or two; batches arrive as a ZIP.' },
    ],
    faqs: [
      { question: 'Is this the same as developing the RAW in Lightroom?', answer: 'No. RAW development — choosing white balance, recovering highlights, demosaicing the sensor data — needs a full RAW processor. This extracts the JPEG the camera already produced, with the camera\'s picture style applied. It looks like the photo did on the back of the camera.' },
      { question: 'Is the extracted image full resolution?', answer: 'For almost all modern cameras, yes — Canon, Nikon, Sony, Fujifilm, Olympus and Panasonic embed a full-size preview. Some older models and some phone DNGs store only a smaller preview, and the output will be that size.' },
      { question: 'Why did a DNG file fail?', answer: 'Some DNGs from phones and scanners contain only raw sensor data and no preview at all. Those need a RAW editor such as Lightroom, darktable or RawTherapee.' },
      { question: 'Is the preview re-compressed?', answer: 'Choosing JPG re-encodes it once at the quality you set; PNG and TIFF keep every pixel of the decoded preview exactly.' },
      { question: 'Are my photos uploaded?', answer: 'No. The RAW file is scanned for its preview inside your browser.' },
    ],
    useCases: [
      'Sending quick previews from a shoot to a client before editing',
      'Culling a memory card on a laptop without RAW software installed',
      'Getting a usable JPG from a camera that was accidentally set to RAW only',
      'Viewing RAW files on a Chromebook or tablet',
    ],
    tips: [
      'For prints or serious editing, develop the RAW in a proper editor; this is for fast, faithful previews',
      'Choose PNG if you plan to edit the result, to avoid a second JPEG compression',
      'If the output is smaller than expected, your camera stores a reduced preview — that is the largest image the file contains without development',
    ],
  },

  'svg-to-pdf': {
    intro:
      'An SVG is a vector drawing — shapes and text described mathematically rather than as pixels — and a PDF can hold exactly the same kind of vector content. Converting SVG to PDF this way keeps logos, diagrams and illustrations perfectly sharp at any zoom and any print size, unlike rasterising them to PNG first. It is how printers, sign makers and document systems usually want vector artwork delivered.',
    steps: [
      { title: 'Add SVG files', description: 'Drop one or several .svg files.' },
      { title: 'Convert', description: 'Each SVG becomes a one-page PDF sized to the drawing.' },
      { title: 'Check the result', description: 'Zoom in: lines and text stay crisp because they are still vectors.' },
      { title: 'Download', description: 'Several SVGs download together as a ZIP of PDFs.' },
    ],
    faqs: [
      { question: 'Is the PDF vector or an image?', answer: 'Vector. Paths, fills, strokes and text are translated into PDF drawing commands, so the file stays sharp at any scale and is usually small.' },
      { question: 'What page size is used?', answer: 'The page matches the SVG\'s own width and height (or its viewBox when no size is set), converted from CSS pixels to points at 96 per inch.' },
      { question: 'Will my fonts look right?', answer: 'Text is drawn with the fonts available to the PDF. If the SVG relies on an unusual web font, convert text to outlines in your design tool first for an exact result.' },
      { question: 'Are filters and effects supported?', answer: 'Common SVG features — gradients, clipping, masks, transforms, dashed strokes — convert well. Complex filter effects such as blurs have no PDF equivalent and may be simplified.' },
      { question: 'Is anything uploaded?', answer: 'No, the SVG is converted by a JavaScript library inside the page.' },
    ],
    useCases: [
      'Sending a logo to a printer who asks for a vector PDF',
      'Attaching a diagram to a report where SVG is not accepted',
      'Archiving icons and illustrations in a universally viewable format',
      'Preparing artwork for a sign, sticker or embroidery shop',
    ],
    tips: [
      'Outline text in Figma, Illustrator or Inkscape before converting if exact typography matters',
      'Set an explicit width and height on the SVG to control the PDF page size',
      'For a raster copy instead, use the SVG Converter to make PNG at any resolution',
    ],
  },

  'video-converter': {
    intro:
      'Video formats are containers — MP4, WebM, MOV, MKV — holding video and audio encoded with codecs such as H.264, VP9 or Opus. This converter changes the container and, only when it has to, the codecs, using the video encoder built into your device. When the streams inside are already compatible with the target (an H.264 MOV from an iPhone going to MP4, for example), they are copied across without re-encoding, which is lossless and takes seconds even for long videos.',
    steps: [
      { title: 'Add a video', description: 'Drop an MP4, MOV, WebM or MKV file.' },
      { title: 'Pick the output format', description: 'MP4 plays almost everywhere; WebM is for web pages; MOV for Apple editing apps; MKV holds anything.' },
      { title: 'Adjust resolution and quality', description: 'Keep the original for a straight conversion, or scale down while you are at it.' },
      { title: 'Convert and download', description: 'Progress is shown as the video is processed on your device.' },
    ],
    faqs: [
      { question: 'Why is this so much faster than other online converters?', answer: 'There is no upload or download, and the work is done by WebCodecs — the browser\'s interface to your device\'s hardware video encoder. When codecs can be copied instead of re-encoded, only the container is rewritten.' },
      { question: 'Can it convert AVI or WMV?', answer: 'No. Those older formats use codecs browsers cannot decode. Convert them with a desktop tool such as HandBrake or VLC.' },
      { question: 'Why did my iPhone video fail?', answer: 'Recent iPhones record HEVC (H.265). Browsers can only decode HEVC where the operating system provides a decoder — Safari on Apple devices, and Chrome or Edge on hardware that supports it. Setting the iPhone camera to "Most Compatible" records H.264 instead.' },
      { question: 'Which audio codec does MP4 get?', answer: 'AAC where the browser can encode it (Chrome and Edge on Windows and macOS, Safari). Where it cannot, such as Chrome on Linux, Opus is used, which plays in every modern browser but not in some older TV and car players.' },
      { question: 'Is there a size limit?', answer: 'The converted video is held in memory before download, so very long 4K videos need a machine with plenty of RAM. Several gigabytes is fine on most laptops.' },
    ],
    useCases: [
      'Turning a WebM screen recording into MP4 for a presentation or WhatsApp',
      'Converting MKV downloads of your own recordings to MP4 for a phone or TV',
      'Producing a WebM version of a clip for a web page',
      'Converting video privately, without handing footage to an upload service',
    ],
    tips: [
      'Leave quality on High for a container-only change — that is what allows the lossless copy',
      'Choose MP4 unless you have a specific reason not to; it has the widest playback support',
      'Keep the tab open while converting large files; the work happens in this page',
    ],
  },

  'video-compressor': {
    intro:
      'Phone videos are recorded at bitrates far higher than most uses need, so a two-minute clip can easily exceed email limits and messaging caps. Compressing re-encodes the video at a lower bitrate and, if you choose, a lower resolution — 720p is plenty for phones, chat apps and most websites. This runs entirely on your device with its hardware encoder, so private footage never leaves it and there are no file-size tiers or watermarks.',
    steps: [
      { title: 'Add the video', description: 'Drop an MP4, MOV, WebM or MKV file.' },
      { title: 'Choose resolution', description: '720p is the default; 480p for very small files; Original to keep full size.' },
      { title: 'Choose quality', description: 'Medium roughly halves a typical phone video; Low is for slow connections.' },
      { title: 'Compress and download', description: 'The result is an MP4 or WebM, ready to send.' },
    ],
    faqs: [
      { question: 'How much smaller will my video be?', answer: 'It depends on the source. A 1080p phone video at 720p, Medium quality is typically 50–75% smaller. Screen recordings with little motion shrink the most; fast action the least.' },
      { question: 'Will the quality drop noticeably?', answer: 'At Medium and 720p, most people cannot tell the difference on a phone screen. On a large TV, 1080p at High looks better — compress as much as the destination needs, not more.' },
      { question: 'Can I remove the sound to save space?', answer: 'Yes, choose Remove audio. Audio is usually a small part of the size, though, so resolution and quality matter more.' },
      { question: 'Does it compress to a target size, like 25 MB?', answer: 'Not directly; it uses quality levels rather than a size target. Start with 720p Medium and step down to 480p or Low if the result is still too large.' },
      { question: 'Is my video uploaded?', answer: 'No. Compression uses your device\'s video encoder inside this page.' },
    ],
    useCases: [
      'Getting a phone video under an email attachment limit',
      'Shrinking screen recordings before sharing them in Slack or Teams',
      'Reducing a video for upload over a slow or metered connection',
      'Freeing up phone storage by compressing old clips',
    ],
    tips: [
      'Compress once from the original; compressing an already-compressed video loses more quality',
      'Screen recordings compress very well at 720p Low with little visible loss',
      'Use MP4 output for the widest compatibility with phones and messaging apps',
    ],
  },

  'mov-to-mp4': {
    intro:
      'MOV is Apple\'s QuickTime container, used by iPhones, Macs and many cameras. Windows, Android, smart TVs and a lot of upload forms prefer MP4. The two containers are close relatives and usually hold the same H.264 or HEVC video and AAC audio, so converting MOV to MP4 is most often a lossless rewrap — the video data is copied, not re-encoded, and a long clip converts in seconds.',
    steps: [
      { title: 'Add the MOV file', description: 'Drop videos from an iPhone, Mac screen recording or camera. MKV works too.' },
      { title: 'Keep quality on High', description: 'That lets compatible streams be copied without any quality loss.' },
      { title: 'Optionally scale down', description: 'Choose 1080p or 720p if the file also needs to be smaller.' },
      { title: 'Convert and download', description: 'You get a standard MP4 that plays almost everywhere.' },
    ],
    faqs: [
      { question: 'Is MOV to MP4 lossless?', answer: 'When the MOV holds H.264 or HEVC video that the MP4 can carry, yes — the video is copied untouched. It is only re-encoded if you change resolution or quality, or the codec cannot go into MP4.' },
      { question: 'Why does my iPhone MOV fail in Chrome?', answer: 'Recent iPhones record HEVC. Copying HEVC into MP4 needs no decoding, but resizing or re-encoding it does, and Chrome can only decode HEVC on supported hardware. Keep settings at Original/High, or use Safari.' },
      { question: 'Will the MP4 play on Windows and Android?', answer: 'H.264 MP4 plays everywhere. HEVC MP4 plays on most recent devices, but some older Windows PCs need the HEVC extension from the Microsoft Store.' },
      { question: 'Are Live Photo or slow-motion clips supported?', answer: 'Slow-motion videos convert as recorded at their high frame rate. The video part of a Live Photo is a short MOV and converts like any other.' },
      { question: 'Is anything uploaded?', answer: 'No. The rewrap happens inside your browser.' },
    ],
    useCases: [
      'Sharing iPhone videos with Android and Windows users',
      'Uploading Mac screen recordings to sites that reject MOV',
      'Playing camera footage on a smart TV that does not read MOV',
      'Importing clips into editors that prefer MP4',
    ],
    tips: [
      'Set the iPhone camera to Most Compatible if you regularly need MP4 on non-Apple devices',
      'A container-only conversion keeps full quality — only lower resolution if you also need a smaller file',
      'For a very large recording, keep the tab in view until it finishes',
    ],
  },

  'webm-to-mp4': {
    intro:
      'WebM is what browsers produce when they record — screen recorders, Loom-style tools, Google Meet downloads and many web apps save WebM with VP8 or VP9 video. iPhones, older Windows players, PowerPoint and many upload forms want MP4 instead. Because those codecs cannot go inside a standard MP4, the video is re-encoded to H.264 with your device\'s hardware encoder, which is fast and keeps the picture visually the same at High quality.',
    steps: [
      { title: 'Add the WebM file', description: 'Drop a screen recording or downloaded WebM. MKV is accepted too.' },
      { title: 'Choose quality', description: 'High keeps it visually identical; Medium makes it smaller.' },
      { title: 'Optionally resize', description: '720p is ideal for screen recordings you will share in chat.' },
      { title: 'Convert and download', description: 'You get an H.264 MP4 that opens on any phone or computer.' },
    ],
    faqs: [
      { question: 'Why does WebM need re-encoding but MOV does not?', answer: 'WebM usually carries VP8 or VP9 video, which standard MP4 players do not expect, so it is converted to H.264. MOV usually already holds H.264, so it can simply be rewrapped.' },
      { question: 'Will I lose quality?', answer: 'Any re-encode loses a little, but at High quality it is not visible. Screen recordings in particular convert cleanly.' },
      { question: 'Why does the WebM play in my browser but not in PowerPoint?', answer: 'Browsers ship VP8/VP9 decoders; PowerPoint, QuickTime and many TVs do not. MP4 with H.264 is the format they all share.' },
      { question: 'What happens to the audio?', answer: 'Opus audio is kept where the MP4 player can handle it, or converted to AAC when the browser can encode AAC.' },
      { question: 'Is the recording uploaded?', answer: 'No. It is converted on your device.' },
    ],
    useCases: [
      'Making a browser screen recording playable on an iPhone',
      'Embedding a WebM recording in a PowerPoint or Keynote deck',
      'Uploading a recording to a site that only accepts MP4',
      'Sending a meeting recording to someone on an older computer',
    ],
    tips: [
      'Choose 720p for screen recordings shared in chat; text stays readable and the file is much smaller',
      'If you only need the sound, use MP4 to MP3 — it accepts WebM too',
      'Keep the tab open while it converts; long recordings take a little while',
    ],
  },

  'gif-to-mp4': {
    intro:
      'Animated GIFs are an old, inefficient format: every frame is stored as a separate 256-colour image, so a few seconds of motion can weigh several megabytes. The same animation as an MP4 or WebM video is typically 5 to 20 times smaller and has full colour — which is why Twitter, Reddit and Giphy quietly convert every GIF to video on upload. This tool does that conversion in your browser, frame by frame, keeping each frame\'s original timing.',
    steps: [
      { title: 'Add an animated GIF', description: 'Drop one or several GIF files.' },
      { title: 'Choose MP4 or WebM', description: 'MP4 for chat apps and phones; WebM for your own web pages.' },
      { title: 'Convert', description: 'Each frame is decoded and encoded as video with its original delay.' },
      { title: 'Download', description: 'Use the video anywhere a GIF would have gone.' },
    ],
    faqs: [
      { question: 'How much smaller will the video be?', answer: 'For real-world GIFs with motion, usually 80–95% smaller. Tiny GIFs with a few flat-colour frames may not shrink much, because a video file has a small fixed overhead.' },
      { question: 'Does the video loop like a GIF?', answer: 'Looping is a property of the player, not the file. On a web page use the loop, autoplay, muted and playsinline attributes on the video tag; most chat apps loop short videos automatically.' },
      { question: 'What about transparent GIFs?', answer: 'MP4 has no transparency, so transparent areas become white. Keep the GIF, or use WebP, if the animation must sit over a background.' },
      { question: 'Why are the dimensions one pixel larger?', answer: 'H.264 and VP9 need even width and height, so an odd-sized GIF gets a one-pixel border to make them even.' },
      { question: 'Which browsers support this?', answer: 'It needs the ImageDecoder API: current Chrome, Edge and Firefox. Safari support is still limited.' },
    ],
    useCases: [
      'Cutting page weight by replacing GIFs on a website with video',
      'Getting a large GIF under a chat app\'s upload limit',
      'Converting reaction GIFs for platforms that prefer video',
      'Improving Core Web Vitals scores flagged for "use video formats for animated content"',
    ],
    tips: [
      'On a web page, use <video autoplay loop muted playsinline> for GIF-like behaviour',
      'Choose WebM for web pages when you can serve both formats, MP4 for everything else',
      'For the reverse direction, Video to GIF makes a GIF from a clip',
    ],
  },

  'excel-to-pdf': {
    intro:
      'Printing a spreadsheet to PDF from Excel is a fight with page breaks, scaling and headers that only appear on the first page. This converter lays a sheet out as a clean, readable table instead: the header row repeats on every page, columns are sized to their contents, wide sheets switch to landscape, rows are lightly striped for reading, and pages are numbered. It works with XLSX, old XLS, ODS and CSV files, without Excel installed.',
    steps: [
      { title: 'Add a spreadsheet', description: 'Drop an XLSX, XLS, ODS, CSV or TSV file.' },
      { title: 'Choose sheets', description: 'Export the first sheet, or every sheet one after another in the same PDF.' },
      { title: 'Convert', description: 'The table is paginated with the header row repeated on each page.' },
      { title: 'Download the PDF', description: 'Ready to email, print or attach to a report.' },
    ],
    faqs: [
      { question: 'Is the Excel formatting kept?', answer: 'No — fonts, colours, merged cells and charts are not reproduced. The PDF shows the values as a consistent, readable table, which is what most printed spreadsheets need.' },
      { question: 'What happens with very wide sheets?', answer: 'More than six columns switches the page to landscape, and columns are scaled to fit the page width. Very long cell contents are shortened with an ellipsis rather than overflowing.' },
      { question: 'Do formulas show their results?', answer: 'Yes. The PDF shows the value Excel last calculated and saved for each formula cell.' },
      { question: 'Are non-English characters supported?', answer: 'Western European accented letters print correctly. Characters outside that set, such as Devanagari or Chinese, appear as "?" because the PDF uses the standard built-in fonts.' },
      { question: 'Is my spreadsheet uploaded?', answer: 'No. It is read and laid out as a PDF inside your browser.' },
    ],
    useCases: [
      'Sending a price list or inventory to someone who does not use Excel',
      'Attaching a data table to a report or proposal',
      'Printing a CSV export from a bank or shop in a readable layout',
      'Archiving a spreadsheet snapshot that cannot be edited',
    ],
    tips: [
      'Delete helper columns before converting so the table fits the page better',
      'Put the most important columns first; they get space before wide text columns are shortened',
      'For an exact replica of Excel formatting, print to PDF from Excel itself',
    ],
  },

  'xls-to-xlsx': {
    intro:
      'The .xls format is Excel 97–2003\'s binary workbook, and it is still everywhere: exports from old accounting and ERP systems, government downloads, email attachments from 2005. Modern tools increasingly refuse it — Google Sheets imports it grudgingly, many web apps and Python scripts want .xlsx, and .xls has a 65,536-row limit. This converter reads the legacy file and writes a modern XLSX (or CSV) with every sheet, value and date intact.',
    steps: [
      { title: 'Add the .xls file', description: 'Drop one or more Excel 97–2003 workbooks.' },
      { title: 'Choose sheets', description: 'Keep every sheet, or only the first.' },
      { title: 'Pick XLSX or CSV', description: 'XLSX for Excel users; CSV for imports into other systems.' },
      { title: 'Convert and download', description: 'The workbook is rebuilt in the modern format.' },
    ],
    faqs: [
      { question: 'What is preserved?', answer: 'Sheet names, cell values, text, numbers, dates and the results of formulas. Formatting, macros, charts and the formulas themselves are not carried over.' },
      { question: 'Why convert instead of just opening it in Excel?', answer: 'If you have Excel, "Save As .xlsx" works too. This is for when you do not, or need .xlsx for a web app, script or system that rejects the old format.' },
      { question: 'Can it open password-protected .xls files?', answer: 'No. Remove the password in Excel or LibreOffice first.' },
      { question: 'Are macros kept?', answer: 'No, and that is usually safer: legacy VBA macros are a common way malware spreads. Keep the original if you need them.' },
      { question: 'Is the file uploaded?', answer: 'No. The binary format is decoded by a JavaScript library in your browser, which loads only when you add an .xls file.' },
    ],
    useCases: [
      'Importing an old ERP or accounting export into a modern tool',
      'Getting a legacy government or bank .xls into Google Sheets cleanly',
      'Preparing old workbooks for Python, R or database imports',
      'Modernising an archive of .xls files',
    ],
    tips: [
      'Check that dates came across as dates — they are converted from Excel\'s internal serial numbers',
      'Choose CSV if the data is going straight into another program',
      'Keep the original .xls if it contains macros or formatting you rely on',
    ],
  },

  'ods-to-xlsx': {
    intro:
      'ODS is the OpenDocument spreadsheet format used by LibreOffice Calc, OpenOffice and many government bodies that standardise on open formats. Excel can open ODS, but not always cleanly, and many web services and scripts accept only XLSX or CSV. This converter reads the ODS file in your browser and writes an Excel workbook or CSV, keeping every sheet, value and date.',
    steps: [
      { title: 'Add the .ods file', description: 'Drop spreadsheets from LibreOffice, OpenOffice or an official open-data download.' },
      { title: 'Choose sheets', description: 'All sheets, or only the first.' },
      { title: 'Pick XLSX or CSV', description: 'XLSX keeps multiple sheets; CSV gives one flat file per sheet.' },
      { title: 'Convert and download', description: 'Open the result in Excel, Google Sheets or Numbers.' },
    ],
    faqs: [
      { question: 'What carries over from ODS?', answer: 'Sheet names, values, text, numbers, dates and calculated formula results. Styles, charts and the formulas themselves do not.' },
      { question: 'Why not just open the ODS in Excel?', answer: 'You can, but Excel sometimes mis-reads ODS formulas and formatting, and many web apps and data tools do not accept ODS at all.' },
      { question: 'Does it handle repeated rows and columns?', answer: 'Yes. ODS compresses runs of identical cells, and these are expanded back into ordinary rows and columns.' },
      { question: 'Can I go the other way, XLSX to ODS?', answer: 'Not here yet. LibreOffice opens XLSX directly and can save it as ODS.' },
      { question: 'Is it private?', answer: 'Yes. The spreadsheet is read inside your browser and never uploaded.' },
    ],
    useCases: [
      'Opening open-data ODS downloads from a government portal in Excel',
      'Sending a LibreOffice spreadsheet to colleagues who use Microsoft Office',
      'Importing ODS data into a tool that accepts only XLSX or CSV',
      'Converting a batch of ODS files at once',
    ],
    tips: [
      'Choose CSV for data you will import elsewhere; XLSX for people who will read it',
      'Check number columns that use a comma as the decimal mark after converting',
      'For the reverse direction, save from LibreOffice as .ods',
    ],
  },

  'xml-to-json': {
    intro:
      'XML is still the format of RSS feeds, SOAP APIs, sitemaps, Android resources and countless enterprise exports, while most modern code expects JSON. This converter maps XML to JSON using the widely used convention: attributes become "@name" keys, repeated elements become arrays, and element text sits under "#text" when it shares an element with attributes. Numbers and true/false are typed, and the mapping round-trips — JSON produced here converts back to the same XML.',
    steps: [
      { title: 'Add an XML file', description: 'Drop any well-formed XML: a feed, sitemap, config or export.' },
      { title: 'Choose JSON or YAML', description: 'YAML is easier to read by eye; JSON is what code consumes.' },
      { title: 'Set indentation', description: '2 or 4 spaces for reading, Minified for the smallest file.' },
      { title: 'Convert and download', description: 'Malformed XML produces an error naming the problem line.' },
    ],
    faqs: [
      { question: 'How are attributes represented?', answer: 'As keys prefixed with @, so <book id="7"> becomes {"book": {"@id": 7}}. The prefix keeps attributes distinct from child elements with the same name.' },
      { question: 'Why is one element an object and another an array?', answer: 'An element that appears once becomes an object; one that repeats becomes an array. If your code needs a consistent shape, normalise single items to arrays after converting.' },
      { question: 'Are namespaces kept?', answer: 'Element and attribute names keep their prefixes, such as "dc:title", so no information is lost.' },
      { question: 'Are numbers converted?', answer: 'Plain integers and decimals become JSON numbers and "true"/"false" become booleans. Anything that could lose meaning — "007", long IDs — stays a string.' },
      { question: 'Is my XML uploaded?', answer: 'No. It is parsed by the browser\'s own XML parser on your device.' },
    ],
    useCases: [
      'Turning an RSS or Atom feed into JSON for a web app',
      'Converting a SOAP or legacy API response for a modern service',
      'Reading an XML sitemap or config file in a JavaScript project',
      'Migrating enterprise XML exports to JSON-based tools',
    ],
    tips: [
      'Validate large XML in the XML Formatter first if conversion reports an error',
      'Use YAML output to review deeply nested XML more comfortably',
      'Converting back with JSON to XML restores attributes from the @ keys',
    ],
  },

  'json-to-xml': {
    intro:
      'Plenty of systems still speak XML — SOAP services, government filing portals, payment gateways, older ERPs and configuration formats. This converter turns JSON into well-formed, indented XML: object keys become elements, arrays become repeated elements, and keys starting with "@" become attributes, so JSON that came from XML converts back to the original structure. Characters are escaped correctly and invalid element names are made safe rather than rejected.',
    steps: [
      { title: 'Add a JSON file', description: 'Drop any JSON object or array.' },
      { title: 'Set indentation', description: 'Indented for reading, minified for transmission.' },
      { title: 'Convert', description: 'A single top-level key becomes the root element; otherwise everything is wrapped in <root>.' },
      { title: 'Download the XML', description: 'It starts with a standard UTF-8 XML declaration.' },
    ],
    faqs: [
      { question: 'How are arrays converted?', answer: 'Each item becomes a repeated element with the array\'s key as its name: {"tag": ["a", "b"]} gives <tag>a</tag><tag>b</tag>. A top-level array is wrapped as <root><item>…</item></root>.' },
      { question: 'Can I create attributes?', answer: 'Yes. Keys beginning with @ become attributes and "#text" becomes the element\'s text, the same convention XML to JSON uses.' },
      { question: 'What happens to keys that are not valid XML names?', answer: 'Spaces and symbols are replaced with underscores, and names starting with a digit get a leading underscore, so the output is always well-formed.' },
      { question: 'How is null represented?', answer: 'As an empty element, such as <middleName/>.' },
      { question: 'Is my data uploaded?', answer: 'No, the conversion happens in your browser.' },
    ],
    useCases: [
      'Preparing a payload for a SOAP or XML-only API',
      'Generating XML for a government or tax filing system from JSON data',
      'Converting app data for a legacy system import',
      'Producing XML test fixtures from JSON',
    ],
    tips: [
      'If the target system has a schema (XSD), check element names and order against it after converting',
      'Wrap your data in a single top-level key to control the root element name',
      'Use @ keys when the system expects attributes rather than child elements',
    ],
  },

  'yaml-to-json': {
    intro:
      'YAML is the configuration language of Kubernetes, Docker Compose, GitHub Actions, Ansible and OpenAPI specs — pleasant to write, but whitespace-sensitive and easy to get subtly wrong. Converting it to JSON shows exactly how a parser reads it, catches indentation mistakes, and produces the format that APIs, validators and many tools require. This uses a full YAML 1.2 parser, so anchors, multi-line strings and flow syntax are all handled.',
    steps: [
      { title: 'Add a YAML file', description: 'Drop a .yaml or .yml file such as a workflow, manifest or spec.' },
      { title: 'Choose JSON or XML', description: 'JSON for tools and APIs; XML if a system needs it.' },
      { title: 'Set indentation', description: '2 spaces matches most style guides.' },
      { title: 'Convert and download', description: 'Syntax errors are reported with the line and column.' },
    ],
    faqs: [
      { question: 'Are anchors and aliases supported?', answer: 'Yes. &anchors and *aliases are resolved, so the JSON contains the full expanded values.' },
      { question: 'Why did "no" or "on" become a string?', answer: 'The parser follows YAML 1.2, where only true and false are booleans. The older YAML 1.1 treated yes/no/on/off as booleans — the famous "Norway problem" — which is a common source of surprises.' },
      { question: 'What about files with several documents separated by ---?', answer: 'Only single-document files are converted. Split multi-document files, such as combined Kubernetes manifests, first.' },
      { question: 'Are comments kept?', answer: 'No. JSON has no comments, so YAML comments are dropped.' },
      { question: 'Is the config uploaded?', answer: 'No. Configs often contain secrets, which is exactly why this runs locally.' },
    ],
    useCases: [
      'Debugging a GitHub Actions workflow or Kubernetes manifest by seeing how it parses',
      'Converting an OpenAPI spec from YAML to JSON for a tool that needs JSON',
      'Feeding YAML config into a JSON Schema validator',
      'Moving Docker Compose settings into a JSON-based system',
    ],
    tips: [
      'Unexpected nesting in the JSON almost always means an indentation mistake in the YAML',
      'Quote values like "no", "0755" or "1e3" in YAML when you mean them as strings',
      'Remove secrets before sharing converted configs',
    ],
  },

  'json-to-yaml': {
    intro:
      'JSON is ideal for machines and tiring for people: quotes on every key, braces everywhere, no comments. YAML expresses the same data with indentation alone, which is why configuration files for Kubernetes, CI pipelines and OpenAPI are usually written in it. This converter turns JSON into clean, readable YAML, quoting only the values that would otherwise be misread, so the result parses back to exactly the same data.',
    steps: [
      { title: 'Add a JSON file', description: 'Drop an API response, config or spec in JSON.' },
      { title: 'Choose indentation', description: '2 spaces is the convention for most YAML files.' },
      { title: 'Convert', description: 'Strings that look like numbers, booleans or dates are quoted to keep their meaning.' },
      { title: 'Download the YAML', description: 'Ready to paste into a config or add comments to.' },
    ],
    faqs: [
      { question: 'Will the YAML convert back to the same JSON?', answer: 'Yes. Values such as "true", "007" or "2024-01-01" that are strings in the JSON are quoted in the YAML, so a round trip returns identical data.' },
      { question: 'Are long strings wrapped?', answer: 'No. Lines are never folded, so long URLs and keys stay on one line and copy cleanly.' },
      { question: 'Can I add comments afterwards?', answer: 'Yes — that is one of the main reasons to switch to YAML. Add # comments anywhere in the output.' },
      { question: 'What if my JSON is invalid?', answer: 'You will see the parser\'s error message. The JSON Formatter can help locate and fix the problem.' },
      { question: 'Is the data uploaded?', answer: 'No, it is converted in your browser.' },
    ],
    useCases: [
      'Turning a JSON config into a commented YAML file',
      'Converting an OpenAPI or Swagger spec to YAML for easier editing',
      'Writing Kubernetes or Docker Compose files from JSON output',
      'Making API responses easier to read in documentation',
    ],
    tips: [
      'Review keys with special characters; they are quoted automatically but may look unusual',
      'Keep the JSON if another program consumes it; YAML is for people',
      'Use 2-space indentation to match most linters and style guides',
    ],
  },

  'images-to-pptx': {
    intro:
      'Turning a folder of photos, screenshots or scanned pages into a presentation usually means inserting them into PowerPoint one at a time. This tool builds the whole deck at once: each image becomes its own slide, in the order you arrange them, fitted inside the slide without cropping or stretching. The result is a genuine .pptx file you can open and edit in PowerPoint, Keynote or Google Slides — add titles, notes or transitions afterwards.',
    steps: [
      { title: 'Add your images', description: 'Drop JPG, PNG, WebP, HEIC, PSD or RAW images — as many as you like.' },
      { title: 'Arrange the order', description: 'Slides follow the order of the file list; move files up or down to change it.' },
      { title: 'Choose slide shape and background', description: '16:9 widescreen, 4:3 classic, or matched to your first image; white or black around the picture.' },
      { title: 'Create the deck', description: 'Download one .pptx with a slide for every image.' },
    ],
    faqs: [
      { question: 'Are images cropped to fit the slide?', answer: 'No. Each image is scaled to fit entirely inside the slide and centred; any remaining space shows the background colour you chose.' },
      { question: 'Can I edit the presentation afterwards?', answer: 'Yes. It is a standard PowerPoint file; every picture is an ordinary image object you can move, resize or replace.' },
      { question: 'Does it work with iPhone HEIC photos?', answer: 'Yes. HEIC, PSD, RAW, WebP and other formats are converted to JPG or PNG first, because PowerPoint only embeds common formats reliably.' },
      { question: 'How big will the file be?', answer: 'Roughly the total size of your images. Resize very large photos first if the deck needs to be emailed.' },
      { question: 'Are my images uploaded?', answer: 'No. The presentation is assembled in your browser.' },
    ],
    useCases: [
      'Making a slideshow of event or holiday photos',
      'Turning product screenshots into a demo deck',
      'Presenting scanned pages or whiteboard photos in a meeting',
      'Building a portfolio presentation from exported artwork',
    ],
    tips: [
      'Choose "Match first image" for portrait photos so they fill the slide',
      'A black background suits photo slideshows; white suits screenshots and documents',
      'Rename files beforehand if you want to sort them quickly into order',
    ],
  },

  'pdf-to-pptx': {
    intro:
      'Slides are often shared as PDF — conference decks, lecture notes, exported Keynote files — and then someone needs them back in PowerPoint to present, rearrange or reuse. This converter turns each PDF page into a slide that keeps the page\'s exact appearance, sized to the page\'s own shape. The text of every page is also placed in that slide\'s speaker notes, so the words are searchable and easy to copy while the design stays pixel-perfect.',
    steps: [
      { title: 'Add a PDF', description: 'Drop a slide deck, handout or any multi-page PDF.' },
      { title: 'Choose the background', description: 'Only visible if a page has transparent areas; white suits most documents.' },
      { title: 'Convert', description: 'Every page is rendered at high resolution onto its own slide.' },
      { title: 'Download the PPTX', description: 'Open it in PowerPoint, Keynote or Google Slides to present or rearrange.' },
    ],
    faqs: [
      { question: 'Is the text on the slides editable?', answer: 'The slide shows each page as a high-resolution picture, so text on the slide itself is not editable. The page\'s text is in the speaker notes, ready to copy into new text boxes. Rebuilding fully editable slides from a PDF is guesswork that usually breaks the layout, which is why this approach keeps the design exact.' },
      { question: 'Why use this instead of just presenting the PDF?', answer: 'In PowerPoint you can reorder, delete and combine slides with your own deck, add transitions, and use presenter view with the notes.' },
      { question: 'What slide size is used?', answer: 'The slide matches the shape of the first page, so a 16:9 deck stays 16:9 and an A4 handout stays portrait.' },
      { question: 'Does it work with scanned PDFs?', answer: 'Yes, the pages convert as images. Scanned pages have no text layer, so the notes will be empty unless you run PDF OCR first.' },
      { question: 'Is the PDF uploaded?', answer: 'No. Pages are rendered by pdf.js in your browser.' },
    ],
    useCases: [
      'Presenting a deck someone sent only as PDF',
      'Combining slides from a PDF into your own PowerPoint presentation',
      'Using presenter view with notes for a PDF lecture',
      'Reusing figures and pages from a report in a talk',
    ],
    tips: [
      'Copy text from the speaker notes when you need to rebuild a slide\'s content',
      'Run PDF OCR first on scanned decks to get searchable notes',
      'Delete unwanted pages in PowerPoint afterwards, or trim the PDF first with Delete PDF Pages',
    ],
  },

  'epub-to-pdf': {
    intro:
      'EPUB is the standard e-book format: a bundle of web pages that reflows to fit any screen. That flexibility is also its limit — it does not print, many devices and apps do not open it, and it is awkward to annotate or quote. This converter reads a DRM-free EPUB in your browser and produces a paginated PDF in book proportions, a plain text file, or a single self-contained HTML page with the images included.',
    steps: [
      { title: 'Add an EPUB', description: 'Drop a DRM-free .epub file — from Project Gutenberg, a publisher\'s direct download or your own writing.' },
      { title: 'Choose PDF, TXT or HTML', description: 'PDF for reading and printing, TXT for text analysis, HTML to open in any browser with images.' },
      { title: 'Convert', description: 'Chapters are read in the book\'s reading order.' },
      { title: 'Download', description: 'The file is named after the book.' },
    ],
    faqs: [
      { question: 'Why does it say my book has DRM?', answer: 'Books bought from Kindle, Apple Books, Kobo or Google Play are usually encrypted so that only their apps can read them. Their text cannot be converted by any honest tool. DRM-free EPUBs convert normally.' },
      { question: 'Are images included in the PDF?', answer: 'The PDF keeps the text, headings and lists, but not images. Choose HTML output for a version that includes every picture.' },
      { question: 'What about books in Hindi, Arabic or Chinese?', answer: 'The PDF uses standard built-in fonts that cover Western European text only. For other scripts, convert to HTML and use your browser\'s Print → Save as PDF, which uses your system fonts.' },
      { question: 'Is the layout the same as in my e-reader?', answer: 'E-books have no fixed layout, so the PDF uses its own clean book layout: headings, paragraphs and lists on a 6 × 9 inch page.' },
      { question: 'Is the book uploaded?', answer: 'No. The EPUB is unzipped and read inside your browser.' },
    ],
    useCases: [
      'Printing a public-domain book or a DRM-free publisher download',
      'Reading an EPUB on a device that only opens PDF',
      'Extracting plain text from a book for search, analysis or accessibility tools',
      'Checking how your own self-published EPUB reads as a continuous document',
    ],
    tips: [
      'Choose HTML for illustrated books, then print from the browser if you need a PDF with images',
      'Choose TXT to feed a book into a word counter, text-to-speech or search tool',
      'Project Gutenberg and Standard Ebooks offer thousands of DRM-free EPUBs to convert',
    ],
  },

  'font-converter': {
    intro:
      'Fonts come in desktop formats — TrueType (TTF) and OpenType (OTF) — and web formats: WOFF and WOFF2, which are the same font tables compressed for faster downloads. Web developers need WOFF2 to self-host fonts; designers who download a web font need TTF or OTF to install it. This converter moves between all four in your browser, and the conversion is lossless: every glyph, kerning pair, hinting instruction and name table comes out exactly as it went in.',
    steps: [
      { title: 'Add font files', description: 'Drop TTF, OTF, WOFF or WOFF2 files — a whole family at once is fine.' },
      { title: 'Pick the output format', description: 'WOFF2 for websites, WOFF for older browsers, TTF/OTF to install on a computer.' },
      { title: 'Convert', description: 'Tables are decompressed and recompressed without being modified.' },
      { title: 'Download', description: 'A family arrives as a ZIP with one file per weight or style.' },
    ],
    faqs: [
      { question: 'Why did my WOFF2 become an .otf, not a .ttf?', answer: 'Fonts with PostScript (CFF) outlines are OpenType files and carry the .otf extension; fonts with TrueType outlines get .ttf. The converter names the output after what the font actually contains.' },
      { question: 'Is anything lost in conversion?', answer: 'No. The font tables are byte-for-byte identical after conversion; only the container and compression change.' },
      { question: 'How much smaller is WOFF2?', answer: 'Typically 30–50% smaller than TTF, and 20–30% smaller than WOFF, thanks to Brotli compression and glyph-table transforms.' },
      { question: 'Can I convert a .ttc font collection?', answer: 'Not yet — a collection holds several fonts in one file. Extract the one you need with a font editor such as FontForge first.' },
      { question: 'Am I allowed to convert any font?', answer: 'Conversion is technically lossless, but font licences often restrict web embedding or redistribution. Check the licence of commercial fonts before self-hosting them.' },
    ],
    useCases: [
      'Self-hosting a font on a website in WOFF2',
      'Installing a web font on your computer to use in design software',
      'Replacing old WOFF files with smaller WOFF2 versions',
      'Converting a whole type family in one go',
    ],
    tips: [
      'Serve only WOFF2 on modern sites — every current browser supports it',
      'Check the font\'s licence covers web use before self-hosting',
      'Subsetting a font to the characters you need saves even more than WOFF2 alone',
    ],
  },

  'ttf-to-woff2': {
    intro:
      'Self-hosting fonts is one of the easiest ways to speed up a website and stop sending visitor data to a third-party font CDN, and WOFF2 is the format to serve: it is supported by every current browser and is usually 30–50% smaller than the TTF or OTF you started with. This converter compresses desktop fonts to WOFF2 (or WOFF) using Google\'s reference woff2 encoder, compiled to run in your browser.',
    steps: [
      { title: 'Add TTF or OTF files', description: 'Drop every weight and style of the family you want to host.' },
      { title: 'Choose WOFF2', description: 'WOFF is also available for very old browsers, but is rarely needed now.' },
      { title: 'Convert', description: 'Each font is compressed without changing any glyph or metric.' },
      { title: 'Add them to your site', description: 'Reference the files with @font-face and font-display: swap.' },
    ],
    faqs: [
      { question: 'Do I still need WOFF or TTF fallbacks?', answer: 'Not for current browsers — WOFF2 is supported by Chrome, Edge, Firefox and Safari 12 and later. Only very old browsers need WOFF.' },
      { question: 'Will the font look any different?', answer: 'No. WOFF2 is lossless: hinting, kerning and OpenType features are all preserved.' },
      { question: 'How do I use the file in CSS?', answer: 'Add an @font-face rule with src: url("/fonts/name.woff2") format("woff2"), a font-family name, and font-display: swap so text is visible while the font loads.' },
      { question: 'Can I make the file even smaller?', answer: 'Yes, by subsetting — removing characters you do not use, such as Cyrillic or Vietnamese glyphs. That is a separate step from format conversion.' },
      { question: 'Is the font uploaded?', answer: 'No. The encoder runs as WebAssembly in your browser.' },
    ],
    useCases: [
      'Self-hosting a font instead of loading it from Google Fonts',
      'Preparing a brand font for a website or web app',
      'Reducing font download size flagged by PageSpeed Insights',
      'Converting a licensed desktop font for web use, where the licence allows it',
    ],
    tips: [
      'Preload the one or two fonts used above the fold with <link rel="preload" as="font" crossorigin>',
      'Convert only the weights you actually use; every extra file is another download',
      'Check your font licence permits web embedding',
    ],
  },

  'woff2-to-ttf': {
    intro:
      'Web fonts are delivered as WOFF2 or WOFF, and operating systems will not install them: Windows, macOS and design apps such as Photoshop, Figma desktop and Word need TTF or OTF. This converter unpacks WOFF2 and WOFF files back to the desktop format they were made from, losslessly, so you can install a font you have the rights to and use it in your own documents and designs.',
    steps: [
      { title: 'Add WOFF2 or WOFF files', description: 'Drop the web font files for each weight and style.' },
      { title: 'Convert', description: 'The compressed tables are unpacked into a standard sfnt font.' },
      { title: 'Download', description: 'You get .ttf or .otf, depending on the outlines the font uses.' },
      { title: 'Install', description: 'Double-click the file on Windows or macOS and choose Install.' },
    ],
    faqs: [
      { question: 'Why did I get an .otf file?', answer: 'Fonts with PostScript (CFF) outlines are OpenType and use .otf; the converter keeps the correct extension so the operating system recognises it.' },
      { question: 'Is the converted font identical to the original?', answer: 'Yes. Every table is restored byte for byte. If you convert back to WOFF2 you get a file of the same size.' },
      { question: 'Can I install fonts downloaded from any website?', answer: 'Technically yes, legally not always. Fonts are software with licences; many free fonts (such as those on Google Fonts) allow desktop use, while commercial web licences often do not.' },
      { question: 'Why does the installed font show a different name?', answer: 'The name comes from the font\'s own name table, which may differ from the file name on the website.' },
      { question: 'Is the font uploaded?', answer: 'No. Decompression happens in your browser.' },
    ],
    useCases: [
      'Installing an open-licence web font to use in design mock-ups',
      'Using a brand\'s web font in Word or PowerPoint documents, where licensed',
      'Opening a web font in a font editor',
      'Recovering a desktop font when only the website files remain',
    ],
    tips: [
      'Check the licence before installing a commercial web font',
      'Convert every weight you need; each style is a separate file',
      'Google Fonts offers desktop TTF downloads directly for its fonts',
    ],
  },

  'rar-to-zip': {
    intro:
      'RAR is a proprietary archive format: Windows has only recently gained built-in support, many phones and older systems cannot open it, and creating RAR files requires paid software. ZIP opens everywhere with no extra software. This converter extracts a RAR archive in your browser using libarchive — the library behind bsdtar and macOS Archive Utility — and repacks every file into a standard ZIP with the same folders and names.',
    steps: [
      { title: 'Add the RAR file', description: 'Drop a .rar archive (RAR 4 and RAR 5 are both supported).' },
      { title: 'Convert', description: 'Every file is extracted and repacked into a ZIP.' },
      { title: 'Check the contents', description: 'Folders and file names are kept exactly as they were.' },
      { title: 'Download the ZIP', description: 'Open it with the built-in tools on any computer or phone.' },
    ],
    faqs: [
      { question: 'Are the files changed in any way?', answer: 'No. Each file is extracted and stored in the ZIP with identical contents; only the archive format around them changes.' },
      { question: 'Can it open password-protected RAR files?', answer: 'No. Extract encrypted archives with the password in 7-Zip, WinRAR or The Unarchiver, then zip the files.' },
      { question: 'What about multi-part archives (.part1.rar, .r00)?', answer: 'Split archives need all their parts together and are not supported here. Join or extract them with 7-Zip or WinRAR.' },
      { question: 'Why is the ZIP a different size?', answer: 'RAR and ZIP compress differently; RAR is often a little smaller. The files inside are the same.' },
      { question: 'Is the archive uploaded?', answer: 'No. libarchive runs as WebAssembly in a background worker in your browser.' },
    ],
    useCases: [
      'Opening a RAR download on a computer without WinRAR or 7-Zip',
      'Sending files to someone who cannot open RAR archives',
      'Converting RAR archives for systems and upload forms that only accept ZIP',
      'Repacking archives on a Chromebook or locked-down work computer',
    ],
    tips: [
      'Scan extracted files from unknown sources with antivirus software, as with any download',
      'If you only need one file, the ZIP Extractor can open the resulting ZIP in the browser',
      'Keep the original RAR if it carries recovery records you might need',
    ],
  },

  '7z-to-zip': {
    intro:
      '7-Zip\'s .7z format compresses very well, which is why software, game mods and large datasets are often distributed in it — but neither Windows (before recent versions), macOS nor most phones open it without extra software. This converter extracts a .7z archive in your browser and repacks the contents as a standard ZIP, keeping folder structure and file names, so it opens anywhere.',
    steps: [
      { title: 'Add the .7z file', description: 'Drop a 7-Zip archive; LZMA and LZMA2 compression are both supported.' },
      { title: 'Convert', description: 'Contents are extracted and repacked as ZIP.' },
      { title: 'Review', description: 'The folder tree is preserved exactly.' },
      { title: 'Download the ZIP', description: 'Open it with your system\'s built-in archive support.' },
    ],
    faqs: [
      { question: 'Will the ZIP be bigger than the 7z?', answer: 'Often, yes. 7z\'s LZMA compression is stronger than ZIP\'s Deflate, so the ZIP may be noticeably larger. The files inside are identical.' },
      { question: 'Can I create .7z files here?', answer: 'Not reliably in the browser, so 7z is offered as an input only. Convert to ZIP or TAR.GZ instead.' },
      { question: 'Are encrypted 7z archives supported?', answer: 'No. Extract password-protected archives in 7-Zip with the password first.' },
      { question: 'What about very large archives?', answer: 'Everything is extracted into memory before repacking, so a laptop handles archives of a few gigabytes; phones are better with smaller ones.' },
      { question: 'Is the archive uploaded?', answer: 'No, it is processed by libarchive running in your browser.' },
    ],
    useCases: [
      'Opening a .7z download on a Mac or Chromebook',
      'Sharing the contents of a 7z archive with people who only have ZIP support',
      'Converting archives for an upload form that accepts only ZIP',
      'Repacking datasets for tools that read ZIP files directly',
    ],
    tips: [
      'Keep the original .7z for archiving — it is smaller',
      'Split archives (.7z.001, .002) need to be joined in 7-Zip first',
      'For Linux servers, ZIP to TAR.GZ is often the better final format',
    ],
  },

  'tar-to-zip': {
    intro:
      'TAR archives — often compressed as .tar.gz, .tgz, .tar.bz2 or .tar.xz — are the standard on Linux and for source-code releases, but Windows users frequently cannot open them without extra tools, and a .tar.gz needs two steps to extract. This converter unpacks any TAR variant in your browser and repacks the contents as a single ZIP that every operating system opens natively.',
    steps: [
      { title: 'Add the TAR archive', description: 'Drop a .tar, .tar.gz, .tgz, .tar.bz2 or .tar.xz file.' },
      { title: 'Convert', description: 'The compression layer and the TAR are both unpacked.' },
      { title: 'Review', description: 'Paths, including long nested ones, are preserved.' },
      { title: 'Download the ZIP', description: 'Double-click to open on Windows or macOS.' },
    ],
    faqs: [
      { question: 'Are Unix permissions and symlinks kept?', answer: 'No. ZIP files made here store regular files and folders; executable bits and symbolic links from the TAR are not carried over. Keep the TAR for software you will install on Linux.' },
      { question: 'Which compressions are supported?', answer: 'gzip (.tar.gz, .tgz), bzip2 (.tar.bz2) and xz (.tar.xz), plus uncompressed .tar.' },
      { question: 'Can it convert a single .gz file that is not a TAR?', answer: 'Files named .gz are treated as .tar.gz. A lone gzipped file (such as log.txt.gz) is not a TAR archive and may not convert.' },
      { question: 'Why is the ZIP larger than the .tar.xz?', answer: 'xz and bzip2 compress better than ZIP\'s Deflate. The files inside are identical.' },
      { question: 'Is anything uploaded?', answer: 'No, the archive is read by libarchive in your browser.' },
    ],
    useCases: [
      'Opening a source-code release on Windows',
      'Sharing Linux server backups with colleagues on Windows or macOS',
      'Converting data downloads distributed as .tar.gz',
      'Repacking archives for tools that only accept ZIP',
    ],
    tips: [
      'Keep the original TAR for anything you will deploy or install on Linux, to preserve permissions',
      'Use ZIP to TAR.GZ for the reverse direction',
      'Very large archives are extracted in memory, so close other heavy tabs first',
    ],
  },

  'zip-to-tar': {
    intro:
      'On Linux servers, in Docker builds and in most open-source release workflows, TAR — usually gzipped as .tar.gz — is the expected archive format, and tools like tar, curl pipelines and package managers handle it natively. This converter repacks a ZIP (or a 7z or RAR archive) as TAR.GZ or plain TAR in your browser, preserving folder structure and long path names.',
    steps: [
      { title: 'Add the archive', description: 'Drop a ZIP, 7z or RAR file.' },
      { title: 'Choose TAR.GZ or TAR', description: 'TAR.GZ is compressed and the usual choice; plain TAR is uncompressed.' },
      { title: 'Convert', description: 'Files are extracted and written into a POSIX ustar archive.' },
      { title: 'Download', description: 'Extract on any Linux or macOS machine with tar -xzf.' },
    ],
    faqs: [
      { question: 'Which TAR format is produced?', answer: 'POSIX ustar, which every tar implementation reads. Paths up to 255 bytes are supported through the ustar prefix field.' },
      { question: 'What file permissions do extracted files get?', answer: 'Files are stored with standard read/write permissions (644). ZIP archives do not reliably carry Unix permissions, so set executable bits after extracting if needed.' },
      { question: 'Why .tar.gz rather than .zip on Linux?', answer: 'tar is installed everywhere, streams well over pipes, and is what most deployment scripts, Dockerfiles and package tools expect.' },
      { question: 'Is compression the same as ZIP?', answer: 'Both use Deflate-family compression, but gzip compresses the whole archive as one stream, which is often slightly smaller for many small files.' },
      { question: 'Is the archive uploaded?', answer: 'No. Extraction and the new TAR are both handled in your browser.' },
    ],
    useCases: [
      'Preparing files for upload to a Linux server',
      'Creating a .tar.gz for a Docker build context or deployment script',
      'Converting a Windows ZIP for a colleague\'s Linux workflow',
      'Repacking a RAR or 7z archive in a format tar can read',
    ],
    tips: [
      'Extract with tar -xzf archive.tar.gz on Linux or macOS',
      'Set executable permissions on scripts after extracting, since ZIP did not carry them',
      'Paths longer than 255 bytes need ZIP instead of TAR',
    ],
  },
};
