/**
 * The tools behind the jobs people search for most: shrinking and joining PDFs,
 * getting photos to the right size and format, and a few everyday utilities.
 * The home page leads with these, and each one's page carries a "Why use this
 * tool" box.
 *
 * Every line here describes what the tool's code does, checked against it.
 * Keep it that way: a reason that oversells the tool is the quickest way to
 * lose a visitor's trust, and a page that claims a feature the tool lacks is
 * misleading content.
 */
export interface PopularTool {
  id: string;
  /** One line for the home page card: the strongest specific reason to use it. */
  reason: string;
  /** Three specific reasons, shown on the tool's own page. */
  why: [string, string, string];
}

export const POPULAR_TOOLS: PopularTool[] = [
  {
    id: 'pdf-compress',
    reason: 'Two methods: keep text selectable, or shrink scans by up to 90%',
    why: [
      'Two methods for two kinds of PDF: rebuild the structure to keep text selectable, or compress the page images, which is what makes a scan small enough for an upload limit.',
      'Three image qualities, 150, 110 or 80 DPI, so you can go only as far as the limit requires.',
      'If a method would not make your file meaningfully smaller, it says so instead of handing you a bigger copy.',
    ],
  },
  {
    id: 'pdf-merge',
    reason: 'Join any number of PDFs, in the order you set',
    why: [
      'Add as many PDFs as you need and put them in order before merging; every page of each file is kept.',
      'Useful for application forms that accept a single file: ID proof, certificates and the form itself, in one PDF.',
      'The files are combined inside your browser tab, so personal documents are not sent anywhere to be merged.',
    ],
  },
  {
    id: 'jpg-to-pdf',
    reason: 'Turn photos into one PDF, at A4, Letter or each photo\'s own size',
    why: [
      'Combines JPG, PNG and WebP images into a single PDF, one image per page, in the order you add them.',
      'Choose the page size: fit each page to its image, or use A4 (portrait or landscape), US Letter or Legal for printing and portals.',
      'Images are placed with a margin and scaled to fit, never stretched or cropped.',
    ],
  },
  {
    id: 'pdf-to-word',
    reason: 'Get the text out of a PDF into an editable Word file',
    why: [
      'Pulls the text of every page into a .docx file you can edit in Word, Google Docs or LibreOffice instead of retyping it.',
      'Each page is marked with a heading, so you can find your place against the original.',
      'Honest about its limits: it recovers text, not layout or images, and a scanned PDF needs OCR first.',
    ],
  },
  {
    id: 'image-compressor',
    reason: 'Set the quality and see the new file size before you download',
    why: [
      'A quality slider with the before and after file sizes and the percentage saved, so you can stop at exactly the size you need.',
      'Save as JPG for photos, PNG for graphics with transparency, or WebP for the smallest files on a website.',
      'The original stays untouched; you download a new copy.',
    ],
  },
  {
    id: 'image-resize',
    reason: 'Exact pixel sizes for forms, with the aspect ratio locked',
    why: [
      'Type the exact width and height a form or website asks for.',
      'Lock the aspect ratio so a face or a logo never comes out stretched.',
      'Pairs with the compressor when a form also sets a KB limit: resize first, then compress.',
    ],
  },
  {
    id: 'ai-bg-remover',
    reason: 'AI background removal that runs on your own device',
    why: [
      'An AI model separates the subject from the background and gives you a transparent PNG, ready for product photos, profile pictures and designs.',
      'The model runs on your device, so the photo itself is never sent to a server; the model is downloaded the first time you use the tool.',
      'Choose the output size, from small for the web up to the original resolution, and compare before and after with a slider.',
    ],
  },
  {
    id: 'heic-to-jpg',
    reason: 'Open iPhone photos anywhere, in any browser',
    why: [
      'Converts iPhone HEIC photos to JPG or PNG in Chrome, Firefox and Edge as well as Safari, using its own HEIC decoder.',
      'Convert a whole set of photos at once; they download together in a ZIP.',
      'The converted file is drawn fresh from the pixels, so the location stored in the original photo is not copied across.',
    ],
  },
  {
    id: 'qr-generator',
    reason: 'QR codes for links, Wi-Fi, contacts and UPI payments',
    why: [
      'Five kinds of code: a link, plain text, Wi-Fi details, a contact card, or a UPI payment request any UPI app can scan.',
      'Set the size, colours and error-correction level, so a code still scans when printed small or partly covered.',
      'The content is stored in the code itself, so it never expires and needs no account.',
    ],
  },
  {
    id: 'video-compressor',
    reason: 'Shrink phone videos by lowering resolution and quality',
    why: [
      'Scale a video down to 1080p, 720p, 480p or 360p and choose the quality, the two settings that decide the file size.',
      'Uses your device\'s own video encoder, so a minute of video usually takes seconds rather than minutes.',
      'Remove the sound track as well when it is not needed, for an even smaller file.',
    ],
  },
  {
    id: 'mp4-to-mp3',
    reason: 'Save the audio from a video as an MP3',
    why: [
      'Takes the soundtrack from MP4, MOV, WebM or MKV video and saves it as MP3.',
      'Choose the bit rate, mix to mono for speech, and pick the sample rate, so a lecture or meeting recording comes out small.',
      'Useful for listening to talks offline or preparing a recording for transcription.',
    ],
  },
  {
    id: 'word-counter',
    reason: 'Words, characters, reading time and readability as you type',
    why: [
      'Counts words, characters with and without spaces, sentences and paragraphs live, for essays, forms and social posts with limits.',
      'Shows the reading time and a Flesch readability score for English text.',
      'Lists your most used words, which is the quickest way to spot repetition.',
    ],
  },
];

export const POPULAR_BY_ID: Record<string, PopularTool> = Object.fromEntries(POPULAR_TOOLS.map(p => [p.id, p]));
