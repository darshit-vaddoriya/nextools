import { ToolSeoMap } from './types';

/**
 * Copy for the file-converter pages. Every page runs the same engine, so the
 * writing is the only thing that can make "WebP to JPG" and "WebP to PNG"
 * different pages rather than one page twice — each entry is about what is
 * specific to that pair of formats: what is lost, what is kept, and why
 * someone would make that conversion in the first place.
 */
export const CONVERTER_SEO_CONTENT: ToolSeoMap = {
  'file-converter': {
    intro:
      'This is the open-ended converter: drop a file and it works out what that file can become. Images move between JPG, PNG, WebP, GIF, BMP, TIFF, ICO and PDF; audio and the soundtrack of a video become MP3 or WAV; a short video clip becomes an animated GIF; Excel, CSV, TSV and JSON convert into each other; and tables in a text-based PDF come out as a spreadsheet. Unlike upload-based converters, the work happens inside this browser tab — the file is read from your disk, converted in memory and saved back, so it never touches a server and there is no queue, size tier or daily limit.',
    steps: [
      { title: 'Drop one or more files', description: 'Add any supported file. Several files at once are fine, and they can even be different formats.' },
      { title: 'Pick the output format', description: 'Only formats that every selected file can be converted into are offered, so you never choose a target that will fail.' },
      { title: 'Adjust the settings', description: 'Quality for photos, bitrate for MP3, frame rate for GIFs, separator for CSV — the panel shows only what applies to your conversion.' },
      { title: 'Convert and download', description: 'One file downloads directly. Several are bundled into a single ZIP so nothing overwrites anything else.' },
    ],
    faqs: [
      { question: 'Which formats can this converter read?', answer: 'Images: JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, ICO, SVG and HEIC. Audio: MP3, WAV, M4A, AAC, OGG, Opus and FLAC. Video: MP4, WebM, MOV and MKV (for audio extraction and GIFs). Data: XLSX, CSV, TSV and JSON. Documents: PDF, for tables and page images.' },
      { question: 'Why can it read AVIF, OGG and MP4 but not write them?', answer: 'Writing a format needs an encoder. Browsers ship decoders for far more formats than they ship encoders for, and a converter that runs locally can only produce what can be encoded locally. Rather than fake it, those formats are offered only as inputs.' },
      { question: 'What happens with a DOCX or Markdown file?', answer: 'Word, Markdown and HTML have their own dedicated tools on this site, because converting documents is a different job from converting media. Drop one here and you get direct links to the tools that handle it.' },
      { question: 'Is there a file size limit?', answer: 'No fixed limit. The practical ceiling is your device memory: a phone may struggle with a 500 MB video, while a laptop handles it. Audio is decoded to raw samples first, so a very long recording needs several hundred megabytes of free memory.' },
      { question: 'Are my files uploaded?', answer: 'No. Every conversion runs in JavaScript and WebAssembly inside the page. You can disconnect from the internet after the page loads and conversions keep working.' },
    ],
    useCases: [
      'Converting a folder of mixed PNG, WebP and HEIC images into JPG in one pass',
      'Pulling the audio out of a screen recording to send as a voice note',
      'Turning an Excel export into JSON for a script, or a JSON API response into a spreadsheet for a colleague',
      'Converting files that are too sensitive for an upload-based service, such as payslips, ID photos or client data',
    ],
    tips: [
      'Drop files of one family at a time (all images, or all audio) — mixing families leaves no common output format',
      'When a conversion needs a tool this page does not cover, the warning under the file list links straight to it',
      'Batch output is a ZIP stored without recompression, so extracting it is instant',
    ],
  },

  'png-to-jpg': {
    intro:
      'PNG is lossless, which is ideal for screenshots and graphics but wasteful for photographs: a phone photo saved as PNG is often five to ten times larger than the same photo as JPG, with no visible difference. Converting to JPG makes those files small enough for email, upload forms with a size cap, and websites. The one thing JPG cannot hold is transparency, so this converter lets you choose the colour that fills see-through areas instead of leaving them to turn black.',
    steps: [
      { title: 'Add your PNG files', description: 'Drop one PNG or a whole batch. WebP, BMP, GIF and TIFF files are accepted too.' },
      { title: 'Set the quality', description: 'The default of 90 is visually indistinguishable from the original for photos. Lower it for smaller files.' },
      { title: 'Choose a background colour', description: 'Transparent pixels need a fill, since JPG has no alpha channel. White suits documents; match your page colour for web graphics.' },
      { title: 'Convert and download', description: 'A single file downloads as JPG; a batch arrives as one ZIP.' },
    ],
    faqs: [
      { question: 'Why did my transparent PNG get a white background?', answer: 'JPG does not support transparency at all, so every pixel has to be a solid colour. The background setting controls which colour replaces the transparent areas. If you need to keep transparency, convert to WebP instead, or keep the PNG.' },
      { question: 'Will converting PNG to JPG reduce quality?', answer: 'JPG is lossy, so some information is discarded. At quality 85–95 the loss is invisible in photographs. It is noticeable on sharp-edged graphics such as text, logos and UI screenshots, which show faint halos — those are better left as PNG.' },
      { question: 'How much smaller will the JPG be?', answer: 'For photographs, typically 70–90% smaller. For flat graphics with few colours the saving is much less, and occasionally the JPG ends up larger than a well-optimised PNG.' },
      { question: 'Can I resize at the same time?', answer: 'Yes. Enter a width in pixels and the height follows the aspect ratio. Shrinking a 4000 px photo to 1600 px before converting saves far more space than lowering the quality.' },
      { question: 'Is the conversion done on a server?', answer: 'No. The PNG is decoded and re-encoded by your browser\'s own canvas engine, on your device.' },
    ],
    useCases: [
      'Shrinking photos that a phone or editing app exported as PNG before emailing them',
      'Meeting an upload form that only accepts JPG, such as a visa, exam or job application portal',
      'Converting product photos to JPG for a marketplace listing with a file size cap',
      'Flattening a transparent logo onto a white background for a document or slide',
    ],
    tips: [
      'Keep screenshots containing text as PNG — JPG blurs the edges of letters',
      'Resize first, then compress: pixel count affects file size far more than the quality slider',
      'Batch-converting applies one quality setting to every file, so group photos and graphics separately',
    ],
  },

  'jpg-to-png': {
    intro:
      'Converting a JPG to PNG does not restore detail the JPG already threw away, and it will make the file larger — so the reasons to do it are specific. PNG is lossless, which means repeated editing and saving no longer adds new compression artefacts each time. Many design tools, icon pipelines and older upload forms also insist on PNG. This converter decodes the JPG once and writes an exact, lossless PNG of what is there.',
    steps: [
      { title: 'Add JPG files', description: 'Drop one or many JPG or JPEG files. WebP, BMP and TIFF are accepted too.' },
      { title: 'Optionally resize', description: 'Set a width in pixels if the PNG is for a specific slot, such as an avatar or thumbnail.' },
      { title: 'Convert', description: 'There is no quality setting: PNG is lossless, so the output is an exact copy of the decoded pixels.' },
      { title: 'Download', description: 'A single PNG downloads directly; several are zipped together.' },
    ],
    faqs: [
      { question: 'Does JPG to PNG improve image quality?', answer: 'No. The JPG compression artefacts are baked into the pixels, and PNG preserves them exactly. What PNG gives you is protection from further loss: editing and re-saving a PNG does not degrade it, whereas every JPG save compresses again.' },
      { question: 'Why is my PNG so much bigger than the JPG?', answer: 'Lossless compression cannot discard the fine noise in a photograph, and JPG artefacts add even more noise. Three to eight times larger is normal for photos. That is the cost of lossless storage.' },
      { question: 'Will the PNG have a transparent background?', answer: 'No. A JPG has no transparency, so the PNG is fully opaque. To cut out a subject, use the Background Remover after converting.' },
      { question: 'Is the colour kept accurate?', answer: 'Colours are decoded by your browser into standard sRGB. Photos with an embedded wide-gamut profile (such as Display P3) are converted to sRGB, which is what virtually every screen and website expects.' },
      { question: 'Can I convert many JPGs at once?', answer: 'Yes, drop as many as you like. They are converted one after another and downloaded as a single ZIP.' },
    ],
    useCases: [
      'Preparing a photo for multiple rounds of editing without stacking compression artefacts',
      'Supplying PNG artwork to a print shop, icon generator or app store that requires it',
      'Creating a lossless master before adding text or annotations that must stay crisp',
      'Meeting an upload field that rejects JPG files',
    ],
    tips: [
      'If the goal is a smaller file, this is the wrong direction — use JPG to WebP instead',
      'Convert once from the original JPG; converting an already-recompressed copy keeps its extra artefacts',
      'For icons, resize to the exact target size during conversion so the PNG is not scaled again later',
    ],
  },

  'webp-to-jpg': {
    intro:
      'WebP is what most websites now serve, so an image saved from a browser often arrives as a .webp file that older photo viewers, Windows Photo Gallery, some email clients and many upload forms refuse to open. Converting it to JPG makes it universally readable. Because WebP is already compressed, the aim is to lose as little as possible in the second encoding, which is why the quality defaults high.',
    steps: [
      { title: 'Add WebP images', description: 'Drop the .webp files you saved. AVIF, PNG and GIF are accepted as well.' },
      { title: 'Keep quality high', description: 'The source is already lossy, so a second lossy pass should stay around 90 to avoid stacking artefacts.' },
      { title: 'Choose a fill colour', description: 'Transparent WebP images need a solid background in JPG. White is the default.' },
      { title: 'Convert and download', description: 'Save the JPG, or a ZIP if you converted several.' },
    ],
    faqs: [
      { question: 'Why do images I save from websites end up as WebP?', answer: 'Sites serve WebP because it is 25–35% smaller than JPG at the same visual quality. When you right-click and save, you get the file the site served, not the original upload.' },
      { question: 'Will I lose quality converting WebP to JPG?', answer: 'Slightly, because it is a second lossy encoding. At quality 90 or above the difference is not visible. Avoid converting back and forth repeatedly, since each round adds loss.' },
      { question: 'What about animated WebP?', answer: 'JPG holds a single image, so an animated WebP converts to its first frame only.' },
      { question: 'Why is the JPG larger than the WebP?', answer: 'WebP compresses more efficiently than JPG, so the same image at the same quality needs more bytes as JPG. That is expected, and the price of compatibility.' },
      { question: 'Does it work on a phone?', answer: 'Yes. Every current mobile browser can decode WebP, which is all this conversion needs.' },
    ],
    useCases: [
      'Opening images saved from websites in software that does not support WebP',
      'Attaching web images to a document, slide deck or email where WebP will not display',
      'Uploading a saved image to a form or service that accepts only JPG and PNG',
      'Printing images downloaded from a site through a printer app that rejects WebP',
    ],
    tips: [
      'If the WebP has a transparent background you want to keep, use WebP to PNG instead',
      'Check whether the site offers a "download original" option first — it avoids a second lossy encode entirely',
      'Quality 90–95 is the sensible range here; going lower mainly compounds artefacts',
    ],
  },

  'webp-to-png': {
    intro:
      'WebP images often carry a transparent background — cut-out product shots, stickers, logos — and PNG is the widely supported format that can keep that transparency intact. Converting to PNG gives you a lossless copy that opens in every image editor, presentation tool and design app, with the see-through areas still see-through. It is the right choice whenever you plan to edit the image further or place it over another background.',
    steps: [
      { title: 'Add WebP files', description: 'Drop one or more .webp images. AVIF, JPG and GIF also work.' },
      { title: 'Optionally set a width', description: 'Resize while converting if the image is destined for a fixed-size slot.' },
      { title: 'Convert', description: 'PNG is lossless, so there is nothing to tune — transparency is kept automatically.' },
      { title: 'Download', description: 'Get the PNG, or a ZIP for a batch.' },
    ],
    faqs: [
      { question: 'Is the transparent background preserved?', answer: 'Yes. PNG supports a full alpha channel, so partially transparent edges — soft shadows, anti-aliased outlines — are kept exactly as they were in the WebP.' },
      { question: 'Why is the PNG several times larger?', answer: 'The WebP was lossy-compressed; the PNG stores every decoded pixel losslessly. For photographic content that is typically three to six times the size. For flat graphics the difference is smaller.' },
      { question: 'Should I pick PNG or JPG for a WebP I saved?', answer: 'PNG if it has transparency or you will keep editing it. JPG if it is a photo you just need to open or share, since the file will be far smaller.' },
      { question: 'Does it handle animated WebP?', answer: 'Only the first frame is converted, because a standard PNG holds a single image.' },
      { question: 'Can I use this for stickers from messaging apps?', answer: 'Yes. Many chat stickers are WebP with transparency, and converting to PNG makes them usable in editors and documents.' },
    ],
    useCases: [
      'Placing a transparent WebP logo or product cut-out into a presentation or design file',
      'Converting chat stickers to PNG to edit or reuse them',
      'Getting a lossless editing copy of a web image before retouching',
      'Supplying transparent artwork to software that does not import WebP',
    ],
    tips: [
      'Choose WebP to JPG instead when there is no transparency and file size matters',
      'PNG will not remove the WebP compression artefacts already in the image, it only stops new ones',
      'Resize down during conversion to offset the size increase of lossless storage',
    ],
  },

  'jpg-to-webp': {
    intro:
      'WebP produces files roughly a quarter to a third smaller than JPG at the same visual quality, which is why page-speed audits keep recommending it. Converting a site\'s JPG photos to WebP is one of the cheapest performance gains there is: pages load faster, mobile visitors use less data, and Core Web Vitals improve without changing a single pixel of layout. Every current browser displays WebP.',
    steps: [
      { title: 'Add JPG photos', description: 'Drop the images you serve on your site. PNG, BMP and TIFF are accepted too.' },
      { title: 'Set the quality', description: 'Around 80 is the usual web setting — visibly identical to the JPG and much smaller.' },
      { title: 'Resize for the layout', description: 'Enter the widest size the image is actually displayed at. Serving a 4000 px photo in a 1200 px slot wastes more than any format change saves.' },
      { title: 'Convert and download', description: 'Batch results come as a ZIP, ready to upload to your CMS or asset folder.' },
    ],
    faqs: [
      { question: 'How much smaller is WebP than JPG?', answer: 'Typically 25–35% at matched visual quality. Heavily detailed photos save a little less, smooth images such as skies and portraits a little more.' },
      { question: 'Do all browsers support WebP?', answer: 'Yes — Chrome, Edge, Firefox and Safari 14 and later all display it. The remaining concern is older desktop software and some email clients, which is why WebP is best for websites rather than attachments.' },
      { question: 'Why does the converter say my browser cannot encode WebP?', answer: 'Displaying WebP and creating it are separate features. Safari shows WebP but its canvas cannot write it, so the conversion needs Chrome, Edge or Firefox — on any operating system, including macOS.' },
      { question: 'Is quality 100 lossless?', answer: 'No. The browser WebP encoder is lossy at every quality level; 100 is simply the least compression. For a lossless master keep PNG.' },
      { question: 'Will EXIF data such as location be kept?', answer: 'No. Converting through the canvas writes pixels only, so camera details and GPS coordinates are stripped — usually desirable for images you publish.' },
    ],
    useCases: [
      'Cutting the page weight of a blog, portfolio or shop by converting its photos',
      'Fixing the "serve images in next-gen formats" warning in PageSpeed Insights or Lighthouse',
      'Reducing storage and bandwidth for a large image library',
      'Preparing lighter hero images for a landing page',
    ],
    tips: [
      'Keep the original JPGs — WebP is for delivery, not archiving',
      'Use a <picture> element with a JPG fallback if you still support very old browsers',
      'Resizing to the displayed width usually saves more than the format switch itself',
    ],
  },

  'png-to-webp': {
    intro:
      'PNG screenshots, illustrations and UI graphics are frequently the heaviest assets on a web page, and WebP can shrink them dramatically while keeping transparency — something JPG cannot do. A transparent PNG logo or a product cut-out converts to a WebP that is still see-through but often a fraction of the size. That makes WebP the natural web replacement for PNG in a way JPG never was.',
    steps: [
      { title: 'Add PNG images', description: 'Drop screenshots, graphics or transparent cut-outs. JPG, GIF and BMP work too.' },
      { title: 'Pick a quality', description: 'For graphics with text and sharp edges, stay at 90 or higher to keep them crisp.' },
      { title: 'Resize if needed', description: 'Set the width the image is displayed at to avoid shipping unnecessary pixels.' },
      { title: 'Convert and download', description: 'Save the WebP, or a ZIP of the whole batch.' },
    ],
    faqs: [
      { question: 'Does WebP keep PNG transparency?', answer: 'Yes. WebP supports a full alpha channel, including semi-transparent edges and shadows, so a transparent PNG stays transparent.' },
      { question: 'How much smaller will my PNG get?', answer: 'Photographic PNGs often shrink by 80–90%. Screenshots and graphics usually shrink by 50–80%. A tiny PNG that is already highly optimised may barely change.' },
      { question: 'Will text in screenshots stay sharp?', answer: 'At quality 90 and above, yes. Lower settings can soften fine text and one-pixel lines, which is more noticeable in UI screenshots than in photos.' },
      { question: 'Why not just convert PNG to JPG?', answer: 'JPG removes transparency and smears sharp edges. WebP keeps transparency and handles graphics better, while still being much smaller than PNG.' },
      { question: 'Can I convert animated PNG?', answer: 'Only the first frame is converted; animation is not carried over.' },
    ],
    useCases: [
      'Shrinking documentation screenshots and diagrams on a docs site',
      'Converting transparent product images for an online shop',
      'Reducing the weight of illustration-heavy landing pages',
      'Optimising app store or marketing graphics before hosting them on the web',
    ],
    tips: [
      'Compare the output size — for tiny icons, an optimised PNG or SVG can beat WebP',
      'Keep PNG originals for editing; treat the WebP as the published copy',
      'Use 90+ quality for anything containing text',
    ],
  },

  'heic-to-jpg': {
    intro:
      'iPhones save photos as HEIC by default because it takes about half the space of JPG. The catch appears the moment the photo leaves Apple\'s ecosystem: Windows often needs an extra codec, many websites and government portals reject .heic uploads, and Android apps may not open it at all. This converter decodes HEIC in your browser and writes a JPG (or PNG) that works everywhere — and because it runs locally, personal photos never go to a conversion server.',
    steps: [
      { title: 'Add HEIC photos', description: 'Drop .heic or .heif files from your iPhone, AirDrop or iCloud download. Batches are fine.' },
      { title: 'Pick JPG or PNG', description: 'JPG for sharing and uploads; PNG if you want a lossless copy for editing.' },
      { title: 'Set quality', description: 'Quality 90 keeps the photo visually identical to the original.' },
      { title: 'Convert and download', description: 'The HEIC decoder loads on first use, then each photo converts in a second or two.' },
    ],
    faqs: [
      { question: 'Why can\'t my Windows PC open HEIC files?', answer: 'HEIC uses HEVC compression, which is covered by patents, so Windows does not include the decoder by default. Converting to JPG removes the dependency entirely.' },
      { question: 'Is it safe to convert personal photos here?', answer: 'The photo is decoded inside your browser using a WebAssembly build of libheif. It is never uploaded, which is the main reason to use a local converter for private pictures.' },
      { question: 'Why is the first conversion slower?', answer: 'Browsers other than Safari cannot read HEIC natively, so a decoder of about 3 MB is downloaded the first time. After that it is cached and conversions are fast.' },
      { question: 'Are Live Photos converted?', answer: 'The still image is converted. The short video part of a Live Photo is stored separately and is not included.' },
      { question: 'Is the location data kept?', answer: 'No. The JPG contains pixels only, so GPS coordinates and camera metadata are removed — worth knowing before posting photos publicly.' },
      { question: 'How do I stop my iPhone creating HEIC?', answer: 'Settings → Camera → Formats → Most Compatible makes the camera save JPG. You can also set Settings → Photos → Transfer to Mac or PC to Automatic, which converts on transfer.' },
    ],
    useCases: [
      'Uploading iPhone photos to a passport, visa, exam or job portal that accepts only JPG',
      'Opening iPhone pictures on a Windows PC without installing codecs',
      'Sending photos to Android users or into apps that do not read HEIC',
      'Converting private photos without handing them to an online service',
    ],
    tips: [
      'Choose JPG for anything you upload or share; PNG files from photos are very large',
      'Convert a whole AirDrop batch at once — the results arrive in a single ZIP',
      'If a photo fails, try re-exporting it from the Photos app; some edited or burst images use HEIC features the decoder does not support',
    ],
  },

  'avif-to-jpg': {
    intro:
      'AVIF is the newest mainstream image format and compresses even better than WebP, so more and more sites and CDNs serve it. The software on the other end has not all caught up: many image editors, office suites, older operating systems and upload forms still cannot open .avif files. Converting to JPG or PNG makes an AVIF image usable anywhere, using the AVIF decoder already built into your browser.',
    steps: [
      { title: 'Add AVIF files', description: 'Drop .avif images saved from the web or exported from a camera app. WebP works too.' },
      { title: 'Choose JPG or PNG', description: 'JPG for photos and sharing; PNG when the AVIF has transparency or you will edit it.' },
      { title: 'Set quality for JPG', description: 'Keep it at 90 or above, since the source is already compressed.' },
      { title: 'Convert and download', description: 'Get the converted image, or a ZIP for several.' },
    ],
    faqs: [
      { question: 'Why does my browser show AVIF but my editor won\'t open it?', answer: 'Browsers added AVIF support quickly because it saves bandwidth. Desktop software updates more slowly, so many editors and viewers still lack a decoder.' },
      { question: 'Can this tool create AVIF files?', answer: 'No. Browsers can decode AVIF but, apart from a few experimental builds, cannot encode it, so AVIF is supported here as an input only.' },
      { question: 'Does it work in every browser?', answer: 'It needs a browser that can display AVIF: Chrome and Edge 85+, Firefox 93+ and Safari 16+. Anything older will not be able to read the file.' },
      { question: 'Is HDR or wide colour kept?', answer: 'The image is converted to standard 8-bit sRGB, which is what JPG and PNG hold. HDR highlights are tone-mapped by the browser and will look flatter than on an HDR display.' },
      { question: 'Why is the JPG larger than the AVIF?', answer: 'AVIF is roughly twice as efficient as JPG, so the same picture needs more bytes in the older format.' },
    ],
    useCases: [
      'Opening images saved from sites that serve AVIF in an older editor or viewer',
      'Inserting AVIF images into Word, PowerPoint or Google Docs',
      'Uploading to forms and platforms that do not accept AVIF yet',
      'Archiving web images in a format that will open on any device',
    ],
    tips: [
      'Pick PNG if the AVIF has a transparent background you want to keep',
      'For publishing on your own site, keep AVIF or use WebP — converting to JPG is for compatibility, not size',
      'Batch-convert whole downloads to avoid opening each file separately',
    ],
  },

  'tiff-to-jpg': {
    intro:
      'TIFF is the format of scanners, fax software, medical imaging and professional photography: lossless, flexible and enormous. A single scanned page can be 20–50 MB as TIFF, and browsers, phones and most websites cannot display it at all. Converting to JPG shrinks it to something you can email or upload; PNG keeps it lossless in a format everything opens; and PDF wraps the image as a document page for forms that want a PDF.',
    steps: [
      { title: 'Add TIFF files', description: 'Drop .tif or .tiff files from a scanner, camera or archive.' },
      { title: 'Pick an output', description: 'JPG for small shareable files, PNG for a lossless copy, PDF for a document page.' },
      { title: 'Resize large scans', description: 'Scans at 600 DPI are often 5000+ pixels wide; set a width to bring them to a practical size.' },
      { title: 'Convert and download', description: 'The TIFF decoder loads when needed, then each file converts locally.' },
    ],
    faqs: [
      { question: 'What happens with multi-page TIFF files?', answer: 'The largest image in the file is converted, which is the main page in almost every scan. Multi-page fax TIFFs convert their first full-size page.' },
      { question: 'Which TIFF compressions are supported?', answer: 'Uncompressed, LZW, Deflate/ZIP, PackBits, JPEG-in-TIFF and CCITT fax (Group 3 and 4) are all decoded, covering scanners, fax software and photo exports.' },
      { question: 'Why convert TIFF to PDF rather than JPG?', answer: 'Many document portals, e-filing systems and employers ask for PDF. Wrapping the scan in a PDF page keeps it looking like a document while still being much smaller than the TIFF.' },
      { question: 'Will a 16-bit TIFF keep its bit depth?', answer: 'No. JPG, PNG and screen canvases work in 8 bits per channel, so high-bit-depth TIFFs are reduced to 8-bit. For archival editing workflows, keep the original TIFF.' },
      { question: 'Why doesn\'t my browser just open the TIFF?', answer: 'Only Safari displays TIFF natively. Other browsers never added support, which is why a decoder is loaded here.' },
    ],
    useCases: [
      'Emailing scanned documents that are far too large as TIFF',
      'Uploading scans to a portal that accepts only JPG or PDF',
      'Viewing archived TIFF images on a phone or in a browser',
      'Converting fax TIFFs into ordinary images or PDFs',
    ],
    tips: [
      'For text scans, PNG or a high-quality JPG keeps letters sharper than low-quality JPG',
      'Resize 600 DPI scans to around 2000 px wide for on-screen reading',
      'Keep the TIFF originals if they are your archive copy',
    ],
  },

  'audio-converter': {
    intro:
      'Audio arrives in a dozen formats — WAV from recorders, FLAC from music libraries, M4A from phones, OGG and Opus from web apps and messengers — while most destinations want MP3, and audio editors often want WAV. This converter reads all of them, including the soundtrack inside MP4, MOV and WebM video, and writes MP3 at the bitrate you choose or uncompressed 16-bit WAV. Decoding uses your browser\'s own audio engine; MP3 encoding uses LAME compiled to JavaScript.',
    steps: [
      { title: 'Add audio or video files', description: 'Drop MP3, WAV, FLAC, M4A, AAC, OGG, Opus, or a video file for its soundtrack.' },
      { title: 'Choose MP3 or WAV', description: 'MP3 for sharing and playback; WAV for editing, burning or software that needs raw audio.' },
      { title: 'Set bitrate, channels and sample rate', description: 'Defaults of 192 kbps stereo at 44.1 kHz suit music. Voice can go mono at 128 kbps.' },
      { title: 'Convert and download', description: 'Files are converted one by one and bundled into a ZIP for batches.' },
    ],
    faqs: [
      { question: 'Can I convert to FLAC, OGG or AAC?', answer: 'Not yet. Browsers include decoders for those formats but no encoders, and a local converter can only write what it can encode. MP3 and WAV cover the vast majority of needs.' },
      { question: 'Does converting FLAC to MP3 lose quality?', answer: 'Yes, MP3 is lossy. At 256–320 kbps the difference is inaudible to almost everyone; 192 kbps is transparent for most music on most equipment.' },
      { question: 'Which bitrate should I choose?', answer: '320 kbps for music you care about, 192 kbps as a general default, 128 kbps for podcasts and speech, and 96 kbps mono for voice notes where size matters most.' },
      { question: 'Why did my OGG file fail in Safari?', answer: 'Safari cannot decode OGG Vorbis or Opus in some versions. Chrome, Edge and Firefox handle both.' },
      { question: 'How long can the recording be?', answer: 'Audio is decoded into memory first — roughly 10 MB per minute of stereo audio — so hour-long recordings are fine on a laptop but may be too much for an older phone.' },
    ],
    useCases: [
      'Converting a FLAC music library to MP3 for a car stereo or older player',
      'Turning WAV recordings from a field recorder into shareable MP3s',
      'Converting WhatsApp or Telegram voice notes (Opus/OGG) into MP3',
      'Producing WAV files for an audio editor or CD burning software',
    ],
    tips: [
      'Choose mono for speech — it halves the file size with no loss of clarity',
      'Converting an MP3 to a higher-bitrate MP3 does not improve it; keep the original bitrate or lower',
      'Use 48 kHz when the audio is going back into a video project',
    ],
  },

  'mp4-to-mp3': {
    intro:
      'Sometimes the only thing you need from a video is its sound: a lecture to listen to on a commute, a recorded interview to transcribe, a song from your own performance video, or the audio of a meeting recording. This tool pulls the audio track out of MP4, MOV, WebM or MKV and saves it as MP3, discarding the video — which usually makes the file ten to fifty times smaller. The video is demuxed and decoded by your browser, so even large recordings stay on your device.',
    steps: [
      { title: 'Add a video file', description: 'Drop an MP4, MOV, WebM or MKV. Screen recordings and phone videos work.' },
      { title: 'Pick a bitrate', description: '192 kbps for music, 128 kbps or mono for talks and meetings.' },
      { title: 'Convert', description: 'The soundtrack is decoded and re-encoded as MP3; the picture is ignored.' },
      { title: 'Download the MP3', description: 'Several videos come back as a ZIP of MP3s.' },
    ],
    faqs: [
      { question: 'Can I extract audio from YouTube with this?', answer: 'No. This converts video files you already have on your device. It does not download anything from streaming sites.' },
      { question: 'Why did my MOV from an iPhone fail?', answer: 'Browsers can read the audio of most MOV files, but some contain audio codecs or container features a given browser lacks. Chrome and Edge are the most capable here; if one fails, try the file in another browser.' },
      { question: 'Is the audio quality the same as in the video?', answer: 'The soundtrack in a video is already compressed (usually AAC). Re-encoding to MP3 at 192 kbps or above preserves it audibly; choosing a far higher bitrate than the source cannot add quality.' },
      { question: 'How big a video can I convert?', answer: 'The whole file is read into memory, so available RAM is the limit. A 1–2 GB video is fine on most laptops; phones do better with smaller files.' },
      { question: 'Can I extract only part of the audio?', answer: 'The whole soundtrack is exported. Trim the MP3 afterwards in any audio editor if you only need a section.' },
    ],
    useCases: [
      'Listening to recorded lectures, webinars or talks as audio on the move',
      'Extracting an interview soundtrack for transcription',
      'Keeping just the music from a performance or event video you recorded',
      'Archiving meeting recordings as small audio files',
    ],
    tips: [
      'Mono at 96–128 kbps is plenty for speech and makes files tiny',
      'Screen recordings with no microphone produce an error — there is no audio track to extract',
      'For a WAV instead of MP3, use the Audio Converter with the same file',
    ],
  },

  'wav-to-mp3': {
    intro:
      'WAV stores audio uncompressed — about 10 MB for every minute of CD-quality stereo — which is ideal while recording and editing but unwieldy for sharing. MP3 reduces that to roughly 1.4 MB per minute at 192 kbps with no difference most people can hear. This converter takes WAV (and FLAC, OGG or Opus) and encodes it with LAME, the same encoder used by most audio software, at the bitrate you pick.',
    steps: [
      { title: 'Add WAV files', description: 'Drop WAV recordings; FLAC, OGG and Opus files are accepted too.' },
      { title: 'Choose a bitrate', description: '320 kbps for masters of music, 192 kbps general purpose, 128 kbps for speech.' },
      { title: 'Decide on channels', description: 'Keep stereo for music. Switch to mono for voice recordings to halve the size.' },
      { title: 'Convert and download', description: 'Each WAV becomes an MP3; batches are zipped.' },
    ],
    faqs: [
      { question: 'How much smaller is MP3 than WAV?', answer: 'At 192 kbps an MP3 is about one seventh the size of a CD-quality WAV; at 128 kbps about one eleventh. A 50 MB WAV becomes roughly 7 MB or 4.5 MB.' },
      { question: 'Will I hear a difference?', answer: 'At 192 kbps and above, almost nobody can reliably tell MP3 from the WAV on normal equipment. Artefacts start becoming audible at 128 kbps on complex music, but speech sounds fine there.' },
      { question: 'What about 24-bit or 96 kHz WAV files?', answer: 'They are resampled to the sample rate you choose (44.1 kHz by default) and encoded as MP3, which has no bit depth of its own. Keep the original WAV as your master.' },
      { question: 'Is ID3 tag information added?', answer: 'No tags are written. The MP3 contains audio only; add title and artist in your music player or tag editor afterwards.' },
      { question: 'Can I convert a whole album?', answer: 'Yes. Drop every track at once and download them as one ZIP.' },
    ],
    useCases: [
      'Sharing voice recordings, podcasts or rehearsal takes that are too large as WAV',
      'Uploading audio to platforms or email with size limits',
      'Converting studio bounces into MP3 previews for clients',
      'Freeing space on a phone or recorder full of WAV files',
    ],
    tips: [
      'Always keep the WAV if it is a master — MP3 cannot be converted back to the original quality',
      'For podcasts, mono 128 kbps at 44.1 kHz is the widely used standard',
      'Normalise or edit before converting, so you only encode once',
    ],
  },

  'mp3-to-wav': {
    intro:
      'Converting MP3 to WAV does not make it sound better — the detail MP3 discarded is gone — but it does make the audio usable by software and hardware that expect uncompressed PCM. Audio editors cut and process WAV without re-decoding, CD burning tools require it, many samplers, DJ systems and speech-recognition pipelines take only WAV, and some video editors handle it more reliably than MP3. This tool decodes MP3 (or M4A, AAC, OGG, Opus, FLAC) into standard 16-bit WAV.',
    steps: [
      { title: 'Add MP3 files', description: 'Drop MP3s or other compressed audio such as M4A, OGG or FLAC.' },
      { title: 'Pick a sample rate', description: '44.1 kHz for CDs and music software, 48 kHz for video, 16 kHz for speech-recognition models.' },
      { title: 'Choose channels', description: 'Keep stereo, or mix down to mono if the destination expects a single channel.' },
      { title: 'Convert and download', description: 'Expect the WAV to be about ten times the size of the MP3.' },
    ],
    faqs: [
      { question: 'Does converting MP3 to WAV improve quality?', answer: 'No. The WAV is an exact, uncompressed copy of what the MP3 decodes to, including anything MP3 removed. It stops further loss when editing, but cannot restore what was lost.' },
      { question: 'Why is the WAV so large?', answer: 'Uncompressed 16-bit stereo at 44.1 kHz takes about 10 MB per minute. A 5 MB MP3 typically becomes a 45–55 MB WAV.' },
      { question: 'What WAV format is produced?', answer: 'Standard PCM WAV, 16-bit little-endian, at the sample rate and channel count you choose — the most widely compatible WAV variant.' },
      { question: 'Why is there a tiny silence at the start?', answer: 'MP3 encoders add a few milliseconds of padding, and decoders reproduce it. It is typically under 50 ms and is normal.' },
      { question: 'Which sample rate for speech-to-text?', answer: 'Most speech models, including Whisper, work at 16 kHz mono. Converting to that directly avoids resampling later and produces a much smaller file.' },
    ],
    useCases: [
      'Importing audio into an editor, DAW or sampler that prefers WAV',
      'Preparing tracks for CD burning software',
      'Feeding audio into speech-recognition tools that require 16 kHz WAV',
      'Supplying WAV files to a video editor or broadcast system',
    ],
    tips: [
      'Use 16 kHz mono for transcription tools — it is what they resample to anyway',
      'Match the sample rate of your project (usually 48 kHz for video) to avoid another conversion',
      'Keep the MP3 as well; the WAV is a working copy, not a better original',
    ],
  },

  'm4a-to-mp3': {
    intro:
      'M4A is AAC audio in an MP4 container, and it is what iPhone Voice Memos, many Android recorders, iTunes purchases and WhatsApp-exported audio use. It sounds good and is compact, but car stereos, older MP3 players, some web forms and a surprising amount of software still expect MP3. This converter decodes M4A or AAC in your browser and writes a standard MP3 that plays on anything.',
    steps: [
      { title: 'Add M4A files', description: 'Drop voice memos or other .m4a / .aac files. MP4 audio works too.' },
      { title: 'Choose a bitrate', description: 'For voice memos, 128 kbps mono is plenty. For music, 192 kbps or higher.' },
      { title: 'Convert', description: 'The audio is decoded by the browser and re-encoded with LAME.' },
      { title: 'Download', description: 'Get the MP3, or a ZIP of several recordings.' },
    ],
    faqs: [
      { question: 'Can I convert iPhone Voice Memos?', answer: 'Yes. Share the memo from the Voice Memos app to Files or AirDrop it to a computer, then drop the .m4a here.' },
      { question: 'Will songs bought from iTunes convert?', answer: 'Songs purchased after 2009 are DRM-free AAC and convert normally. Older protected .m4p files are encrypted and cannot be decoded by any browser.' },
      { question: 'Does M4A to MP3 lose quality?', answer: 'Both formats are lossy, so there is a small generational loss. Choose a bitrate at or above the source (most M4A files are 128–256 kbps) and it will not be audible.' },
      { question: 'Why is my MP3 bigger than the M4A?', answer: 'AAC is more efficient than MP3, so matching its quality takes a somewhat higher bitrate and therefore a larger file.' },
      { question: 'Is the conversion private?', answer: 'Yes. Recordings are decoded and encoded on your device and never uploaded — relevant for voice memos of meetings or interviews.' },
    ],
    useCases: [
      'Converting iPhone Voice Memos to MP3 for sharing or transcription services',
      'Playing iTunes or phone recordings on a car stereo that reads only MP3',
      'Uploading recordings to a form or LMS that rejects M4A',
      'Standardising a mixed audio collection on MP3',
    ],
    tips: [
      'Switch to mono for voice memos to halve the size without losing clarity',
      'Do not pick a bitrate far above the source — it adds size, not quality',
      'Convert a week of memos at once and download them in one ZIP',
    ],
  },

  'video-to-gif': {
    intro:
      'A GIF plays automatically, loops, needs no player and works in places video does not — chat apps, GitHub READMEs, documentation, email signatures and old forums. This tool takes a short section of an MP4, WebM or MOV file and turns it into an animated GIF, frame by frame. You choose the start, length, frame rate and width; the video is seeked precisely to each frame in your browser, so the result is exact regardless of how fast your device is.',
    steps: [
      { title: 'Add a video', description: 'Drop an MP4, WebM or MOV clip. Screen recordings are ideal.' },
      { title: 'Choose the section', description: 'Set the start time and the length in seconds. Shorter GIFs are much smaller.' },
      { title: 'Set frame rate and width', description: '10 fps at 480 px is a good default. Raise the fps for fast motion.' },
      { title: 'Convert and download', description: 'Frames are captured one by one and encoded into the GIF.' },
    ],
    faqs: [
      { question: 'Why is my GIF so large?', answer: 'GIF compresses poorly compared with video. Size grows with width squared, frame rate and length, so a 10-second, 800 px, 20 fps GIF can exceed 20 MB. Halving the width alone cuts the size by about three quarters.' },
      { question: 'Why do colours look banded?', answer: 'GIF is limited to 256 colours per frame. Each frame gets its own optimised palette, but smooth gradients and skin tones can still show banding — it is a limit of the format.' },
      { question: 'Is the sound kept?', answer: 'No. GIF has no audio. For sound, keep the video or extract the audio with MP4 to MP3.' },
      { question: 'Why did my iPhone video fail?', answer: 'Recent iPhones record HEVC (H.265), which browsers other than Safari often cannot decode. Open the page in Safari, or set the iPhone camera to Most Compatible to record H.264.' },
      { question: 'Is there a limit on length?', answer: 'The GIF stops at 400 frames — 40 seconds at 10 fps — because anything longer becomes too large to be useful.' },
    ],
    useCases: [
      'Adding a short demo of a feature to a GitHub README or pull request',
      'Making a reaction GIF from your own video clip',
      'Showing a UI interaction in documentation or a support article',
      'Embedding motion in an email, where video will not play',
    ],
    tips: [
      'Keep GIFs under about 5 seconds and 480 px for chat apps',
      'Screen recordings with flat colours make far smaller, cleaner GIFs than camera footage',
      'Use 5 fps for slideshows or slow UI changes — it looks fine and cuts size in half',
    ],
  },

  'excel-to-csv': {
    intro:
      'CSV is the lowest common denominator of data: databases, import wizards, analytics tools, CRMs and scripts all read it, while many of them cannot read an Excel workbook. This converter opens an .xlsx file in your browser and writes each worksheet\'s values as CSV (or TSV). Dates come out as ISO dates rather than Excel\'s internal serial numbers, formulas are replaced with their calculated results, and you can export every sheet at once instead of saving them one by one from Excel.',
    steps: [
      { title: 'Add an XLSX workbook', description: 'Drop one or more .xlsx files. Old binary .xls files need saving as .xlsx first.' },
      { title: 'Choose sheets', description: 'Export the first sheet, or every sheet as its own CSV in a ZIP.' },
      { title: 'Pick the separator', description: 'Comma is standard. Choose semicolon if the file is for a European Excel that uses commas as decimal marks, or TSV for tabs.' },
      { title: 'Convert and download', description: 'The CSV is UTF-8 with a byte-order mark so accented characters open correctly in Excel.' },
    ],
    faqs: [
      { question: 'What happens to formulas?', answer: 'CSV stores values, not formulas, so each formula cell is exported as the result Excel last calculated and saved in the file.' },
      { question: 'Why did my dates look like 45123 before?', answer: 'Excel stores dates as the number of days since 1900. This converter reads the cell\'s number format and writes recognised dates as YYYY-MM-DD, which every system parses unambiguously.' },
      { question: 'Is formatting kept?', answer: 'No — CSV is plain text. Colours, fonts, merged cells, charts and column widths are not part of the format and are dropped.' },
      { question: 'Can it convert .xls files?', answer: 'Not the old binary .xls format from Excel 97–2003. Open it in Excel, LibreOffice or Google Sheets, save as .xlsx, then convert.' },
      { question: 'Why use semicolons?', answer: 'In countries that write decimals as 3,5 Excel expects CSV fields separated by semicolons. Choosing semicolon makes the file open in the right columns there.' },
    ],
    useCases: [
      'Importing spreadsheet data into a database, CRM or mailing tool',
      'Exporting every sheet of a workbook for a data pipeline in one step',
      'Handing data to a script or analytics tool that reads CSV',
      'Converting confidential spreadsheets without uploading them to a service',
    ],
    tips: [
      'Check hidden sheets — "All sheets" exports them too',
      'If a column of IDs lost its leading zeros, it was stored as a number in Excel; format it as text there',
      'Use TSV when your data contains lots of commas, such as addresses',
    ],
  },

  'csv-to-excel': {
    intro:
      'Double-clicking a CSV opens it in Excel, but Excel then guesses at every column — it strips leading zeros from ZIP codes and phone numbers, turns long IDs into scientific notation and reinterprets dates by regional settings. Converting to a proper .xlsx first avoids that guesswork. This converter detects the separator automatically, stores genuine numbers as numbers, keeps codes such as "007" and 16-digit IDs as text, bolds and freezes the header row, and sizes the columns to fit.',
    steps: [
      { title: 'Add CSV or TSV files', description: 'Drop exports from a database, bank, shop or form. Comma, semicolon, tab and pipe separators are detected.' },
      { title: 'Convert', description: 'Each file becomes a workbook with one sheet named after the file.' },
      { title: 'Check the header row', description: 'The first row is bold and frozen, so it stays visible while scrolling.' },
      { title: 'Download', description: 'Open the .xlsx in Excel, Google Sheets, Numbers or LibreOffice.' },
    ],
    faqs: [
      { question: 'Will leading zeros be kept?', answer: 'Yes. A value is stored as a number only if doing so loses nothing, so "007", "0123" and long card or account numbers stay as text exactly as written.' },
      { question: 'Why not just open the CSV in Excel?', answer: 'Excel applies automatic type conversion on open, which silently changes some values — the well-known problem that caused scientists to rename genes Excel kept turning into dates. A converted .xlsx stores exactly what the CSV contained.' },
      { question: 'Are dates converted to Excel dates?', answer: 'Dates are kept as the text in the CSV, so nothing is reinterpreted by locale. Excel can convert a text column to dates with Data → Text to Columns if you need date arithmetic.' },
      { question: 'What encoding should my CSV be in?', answer: 'UTF-8, with or without a byte-order mark. Accented and non-Latin characters come through correctly.' },
      { question: 'Can I merge several CSVs into one workbook?', answer: 'Each CSV becomes its own workbook here. To combine rows first, use the Merge CSV tool, then convert the result.' },
    ],
    useCases: [
      'Sending a database or shop export to a colleague who works in Excel',
      'Opening a bank or payment export without losing leading zeros in account numbers',
      'Turning form responses into a tidy, frozen-header spreadsheet',
      'Preparing a CSV for sharing on a system that only previews .xlsx',
    ],
    tips: [
      'If numbers use commas as decimals (3,5), they stay as text — convert them in Excel with Find & Replace',
      'Clean the CSV first with CSV Cleaner if it has stray whitespace or blank rows',
      'Very wide exports are fine; column widths are set automatically up to a sensible maximum',
    ],
  },

  'excel-to-json': {
    intro:
      'Spreadsheets are where non-developers keep data; JSON is where code wants it. This converter turns each row of a worksheet into a JSON object keyed by the header row, keeping numbers as numbers, TRUE/FALSE as booleans, empty cells as null and dates as ISO strings. It is the fastest way to turn a content sheet, a product list or a config table maintained in Excel into data a web app, API mock or script can consume.',
    steps: [
      { title: 'Add an XLSX file', description: 'Drop a workbook whose first row contains column names.' },
      { title: 'Choose sheets', description: 'One sheet gives an array of records; all sheets give an object keyed by sheet name.' },
      { title: 'Choose the record shape', description: 'Objects keyed by the header row, or plain arrays of cell values.' },
      { title: 'Convert and download', description: 'The JSON is pretty-printed with two-space indentation.' },
    ],
    faqs: [
      { question: 'How are column names used?', answer: 'The first non-empty row becomes the keys. Blank header cells are named column1, column2 and so on so no data is dropped.' },
      { question: 'Are numbers kept as numbers?', answer: 'Yes. Numeric cells become JSON numbers, text stays as strings — including numbers Excel stored as text, such as ZIP codes with leading zeros.' },
      { question: 'What about dates?', answer: 'Cells formatted as dates become ISO strings such as "2024-03-15", or "2024-03-15 09:30:00" with a time, which JavaScript and every JSON consumer can parse.' },
      { question: 'Are empty rows included?', answer: 'Completely empty rows are skipped. Empty cells inside a row become null.' },
      { question: 'Can I get nested JSON?', answer: 'Rows map to flat objects. If your headers use dots (address.city), you can nest them afterwards in code, or keep the flat form most APIs accept.' },
    ],
    useCases: [
      'Turning a content or translation sheet into JSON for a website',
      'Creating mock API data from a spreadsheet a colleague maintains',
      'Loading a product catalogue from Excel into a script',
      'Converting a configuration table into JSON for an app',
    ],
    tips: [
      'Keep header names short and without spaces if they will become code property names',
      'Use "All sheets" for lookup tables spread across tabs — each tab becomes one key',
      'Validate the output with the JSON Formatter before using it in production',
    ],
  },

  'json-to-excel': {
    intro:
      'API responses, logs and exports often arrive as JSON, which is unreadable for anyone who is not a developer. This converter flattens JSON into an Excel sheet: every object becomes a row, every key a column, nested objects become dotted columns such as address.city, and arrays of simple values are joined into one cell. If the JSON holds several lists — say users and orders — each becomes its own worksheet in the same workbook.',
    steps: [
      { title: 'Add a JSON file', description: 'Drop an array of objects, an object containing arrays, or a single record.' },
      { title: 'Convert', description: 'Keys from every record are collected, so columns missing from some rows are still included.' },
      { title: 'Review the sheet', description: 'Nested fields appear as dotted column names with a bold, frozen header row.' },
      { title: 'Download the XLSX', description: 'Open it in Excel, Google Sheets or Numbers.' },
    ],
    faqs: [
      { question: 'What JSON shapes are supported?', answer: 'An array of objects (the most common), an array of arrays, an object whose values include arrays (one sheet per array), or a single object (one row).' },
      { question: 'How are nested objects handled?', answer: 'They are flattened with dots: {"address":{"city":"Pune"}} becomes a column named address.city. Arrays of plain values become a comma-separated cell; arrays of objects are kept as JSON text in the cell.' },
      { question: 'What if records have different keys?', answer: 'Every key seen in any record becomes a column, in first-seen order, and records without that key get an empty cell.' },
      { question: 'Why did it say my file is not valid JSON?', answer: 'The file must be strict JSON: double-quoted keys, no trailing commas, no comments. The error message includes the position of the problem; the JSON Formatter can help find and fix it.' },
      { question: 'Can it handle newline-delimited JSON (NDJSON)?', answer: 'Not directly. Wrap the lines in [ ] with commas between them to make a JSON array, then convert.' },
    ],
    useCases: [
      'Sharing an API response with a manager or client as a spreadsheet',
      'Reviewing exported app data or logs in Excel with filters and sorting',
      'Converting a JSON database dump into a workbook for auditing',
      'Turning test fixtures into a sheet for a QA team',
    ],
    tips: [
      'For very deep nesting, extract the part you need with the JSONPath Tester first',
      'Keys named in the first record set the column order, so put the important fields first',
      'Use JSON to CSV when the data is going into another system rather than to a person',
    ],
  },

  'pdf-to-excel': {
    intro:
      'Tables in PDFs — bank statements, invoices, price lists, reports — are notoriously hard to reuse, because a PDF stores positioned pieces of text rather than rows and columns. This tool reads the position of every piece of text and rebuilds the grid: runs that share a baseline become a row, and x-positions that recur down the page become columns. The result is an Excel sheet (or CSV) you can sort, filter and calculate with, produced without uploading the document anywhere.',
    steps: [
      { title: 'Add a PDF', description: 'Drop a PDF that has selectable text — exported from software rather than scanned.' },
      { title: 'Choose a layout', description: 'One sheet per page keeps page boundaries; one combined sheet stacks all rows for multi-page tables.' },
      { title: 'Pick XLSX or CSV', description: 'XLSX for Excel users, CSV for importing into other systems.' },
      { title: 'Convert and check', description: 'Review the columns; complex layouts may need a little clean-up.' },
    ],
    faqs: [
      { question: 'Does it work with scanned PDFs?', answer: 'No. A scan is a picture of a table with no text in it. Run the file through PDF OCR first to add a text layer, then convert.' },
      { question: 'How accurate is the table detection?', answer: 'Very good for clean, single-table layouts such as statements, invoices and reports exported from software. Multi-column page designs, rotated text and cells that wrap over several lines can need manual fixing, because the PDF contains no record of the original table.' },
      { question: 'Why are numbers like 1,200 stored as text?', answer: 'Thousand separators are kept exactly as they appear in the PDF, so nothing is misread across number formats. Excel\'s Text to Columns or VALUE() converts them in one step.' },
      { question: 'Are headings and paragraphs included?', answer: 'Yes, all text on the page is exported, so titles and notes appear as rows above or below the table. Delete them in Excel if you only need the table.' },
      { question: 'Are my statements uploaded?', answer: 'No. The PDF is parsed by pdf.js inside your browser — useful for bank and payroll documents you should not upload.' },
    ],
    useCases: [
      'Analysing bank or credit card statements in a spreadsheet',
      'Extracting line items from invoices for bookkeeping',
      'Reusing price lists or product tables published as PDF',
      'Pulling figures from a report into Excel for charts',
    ],
    tips: [
      'Use "One sheet" for statements that continue across pages, then delete repeated headers',
      'If columns merge, the PDF likely uses very tight spacing — CSV output makes quick fixes easy',
      'For text rather than tables, PDF to Word or Extract Text gives a better result',
    ],
  },
};
