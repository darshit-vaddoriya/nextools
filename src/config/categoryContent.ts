import { ToolCategory } from '../types';

export interface CategoryGuidePoint {
  title: string;
  body: string;
}

export interface CategoryFaq {
  question: string;
  answer: string;
}

export interface CategoryContent {
  /** One-line summary under the H1, more specific than the nav description. */
  tagline: string;
  /** 2-3 sentence opening that says what this group of tools is actually for. */
  intro: string;
  /** How to choose between the tools in this category, or what to know first. */
  guide: CategoryGuidePoint[];
  faqs: CategoryFaq[];
}

/**
 * Editorial content for each category landing page.
 *
 * These pages used to be a heading and a grid of cards — around two hundred
 * words, most of them tool names. That is a listing, not a page: there is
 * nothing on it that a reader could not get from the directory, and nothing a
 * search engine can use to tell one category from another. What follows is the
 * part that only makes sense for this specific group of tools: what they share,
 * which one to reach for, and the questions people ask before using them.
 */
export const CATEGORY_CONTENT: Partial<Record<ToolCategory, CategoryContent>> = {
  pdf: {
    tagline: 'Merge, split, compress, sign, convert and extract — without a PDF becoming an upload.',
    intro:
      'PDF is a layout format, not a document format: it stores where each glyph sits on the page rather than what the text means. That single fact explains most of what surprises people here — why extracted text arrives with odd line breaks, why a scanned page needs OCR before any tool can read it, and why "editing" a PDF is usually a rebuild rather than a change. The tools in this category work on the real structure of the file, in your browser, so a contract or a payslip never becomes an upload to somebody else\'s server.',
    guide: [
      {
        title: 'Start by asking whether the PDF has text or pictures of text',
        body: 'A PDF exported from Word contains selectable text; a PDF from a scanner or a phone camera contains images. Text extraction, search and compare only work on the first kind. If selecting text in a viewer gives you nothing, run PDF OCR first — every other tool will behave better afterwards.',
      },
      {
        title: 'Compression trades against the thing you care about',
        body: 'Most PDF size comes from embedded images, so compression means re-encoding them. If the document is a scanned form you need to read, keep quality high and accept a larger file. If it is a slide deck going into an email, a much smaller file is usually indistinguishable on screen.',
      },
      {
        title: 'Page operations are lossless, content operations are not',
        body: 'Merging, splitting, rotating, reordering and deleting pages copy page objects untouched — the text and images are bit-for-bit what they were. Converting to Word or images, compressing, or flattening forms all rewrite content. Do the lossless steps first and the lossy step once, at the end.',
      },
      {
        title: 'Redaction is not the same as drawing a black box',
        body: 'A rectangle drawn over text in most editors sits above the text, which is still in the file and still copyable. Redaction has to remove the underlying content. If the goal is that nobody can recover a name or an account number, that distinction is the whole job.',
      },
    ],
    faqs: [
      {
        question: 'Are my PDFs uploaded anywhere?',
        answer: 'No. Every PDF tool here parses the file with JavaScript and WebAssembly inside the browser tab. The file is read from your disk into memory and the result is written back to your downloads folder; nothing is transmitted, which is why these tools also work with the network disconnected.',
      },
      {
        question: 'Why does my converted Word document lose the layout?',
        answer: 'Because a PDF does not record paragraphs, headings or tables — only positioned text. Converting to DOCX means inferring that structure back from coordinates, and the inference is imperfect for multi-column layouts and complex tables. Text and reading order convert reliably; exact visual layout does not.',
      },
      {
        question: 'How large a PDF can these tools handle?',
        answer: 'There is no imposed limit, but the whole file has to fit in your browser tab\'s memory alongside the working copy. Documents up to roughly a hundred megabytes are routine on a desktop; on a phone, expect that ceiling to be much lower, and expect page rendering to be the slowest step.',
      },
      {
        question: 'Can I remove a password from a PDF here?',
        answer: 'No. Decrypting a protected PDF requires the password, and a tool that claims to remove one without it is either wrong or describing an owner password, which was never a security measure. If you hold the password, a desktop PDF editor is the right place to re-save the file without encryption.',
      },
    ],
  },

  image: {
    tagline: 'Compress, convert, resize, crop and edit images on the canvas in your own browser.',
    intro:
      'Almost every image problem is one of three questions: which format, how many pixels, and how much quality to throw away. Getting those three right is what separates a 180 KB hero image from a 4 MB one that looks identical. These tools run on the browser\'s own canvas and codecs, which means the picture — a passport scan, a photograph of a person, an internal dashboard — is decoded and re-encoded on your machine and nowhere else.',
    guide: [
      {
        title: 'Resize before you compress, never after',
        body: 'A 4000-pixel-wide photo displayed in a 800-pixel column is carrying five times the pixels anyone will see. Cutting dimensions removes data that compression then does not have to encode at all. Doing it the other way round means compressing detail you are about to discard.',
      },
      {
        title: 'Format follows content, not preference',
        body: 'Photographs belong in JPEG, WebP or AVIF, where lossy compression works with continuous tone. Screenshots, logos and anything with flat colour and sharp edges belong in PNG or WebP, where JPEG artefacts around text are immediately visible. Transparency rules out plain JPEG entirely.',
      },
      {
        title: 'Every re-encode is permanent',
        body: 'Lossy formats do not remember what they discarded. Opening a JPEG, editing it and saving it again applies the loss a second time, and it compounds. Keep an original, work from it, and export once — rather than repeatedly editing the export.',
      },
      {
        title: 'Background removal is a model, not a measurement',
        body: 'The AI background remover runs a segmentation model with WebGPU or WebAssembly on your device. It is genuinely good on clear subject-background separation and genuinely imperfect on hair, glass and motion blur. Check the edges before you use the result somewhere that matters.',
      },
    ],
    faqs: [
      {
        question: 'Does the AI background remover send my photo to a server?',
        answer: 'No. The model weights are downloaded to your browser once, and inference runs locally using WebGPU where it is available and WebAssembly where it is not. That is why the first run takes longer than the second, and why the tool keeps working offline afterwards.',
      },
      {
        question: 'Which format gives the smallest file?',
        answer: 'For photographs, AVIF is usually smallest, WebP close behind, and JPEG largest of the three at equal visual quality — but support and encode time run in the opposite order. WebP is the safe default in 2026: it is supported everywhere that matters and is meaningfully smaller than JPEG.',
      },
      {
        question: 'Is image metadata removed when I convert a file?',
        answer: 'Re-encoding through the canvas drops EXIF data, which includes the camera model and, on phone photos, often the GPS coordinates where the picture was taken. That is a side effect worth knowing about in both directions: it protects you when sharing, and it loses data you may have wanted to keep.',
      },
      {
        question: 'Can I process several images at once?',
        answer: 'The batch tools accept multiple files and apply the same operation to each, which is the right approach for a folder of photos that all need the same resize or the same format. Processing happens one image at a time in the tab, so a large batch is bounded by your device rather than by a queue.',
      },
    ],
  },

  dev: {
    tagline: 'Formatters, encoders, decoders and inspectors for the data developers paste all day.',
    intro:
      'The strings a developer pastes into an online tool are disproportionately production data: an API response, a signed URL, a JWT from a real session, a config file with credentials in it. That is the argument for these tools running in the tab rather than on a server — not convenience, but the fact that a formatter has no business seeing your bearer token. Everything here is parsing and printing, which is exactly the class of work a browser does well.',
    guide: [
      {
        title: 'A formatter that reformats is also a validator',
        body: 'JSON, XML, YAML and SQL formatters have to parse the input before they can print it. If the output looks right, the syntax is valid; if it errors, the message points at the first thing the parser could not reconcile. Reaching for the formatter is often the fastest way to find a missing comma.',
      },
      {
        title: 'Decoding is not decrypting',
        body: 'Base64 and URL encoding are reversible transformations with no key and no secret. A JWT\'s payload is Base64, which means anyone holding the token can read every claim in it. The signature is what makes a JWT trustworthy, and verifying it needs the key — decoding it does not.',
      },
      {
        title: 'Generated values differ in what they guarantee',
        body: 'A UUID v4 is random and effectively unique; a password generator is aiming at entropy against guessing; a hash is deterministic and will give the same output for the same input forever. Picking the wrong one — a hash where you wanted a random token — is a real and common bug.',
      },
      {
        title: 'Diff on structure when structure is what changed',
        body: 'Comparing two formatted JSON documents line by line reports noise whenever key order differs. Format both sides first so the comparison is between contents rather than between styles of writing the same content.',
      },
    ],
    faqs: [
      {
        question: 'Is the data I paste here logged or sent anywhere?',
        answer: 'No. These tools are JavaScript running in your tab; the text you paste stays in the page\'s memory and is discarded when you close it. There is no request carrying it, which you can confirm in your browser\'s network panel while using any tool on this site.',
      },
      {
        question: 'Can the JWT decoder tell me if a token is valid?',
        answer: 'It shows you the header, the payload and the claims, including expiry — enough to answer "why is this request being rejected" most of the time. It does not verify the signature, because that requires the signing key, and pasting a signing key into a web page is the thing you should never do.',
      },
      {
        question: 'Which hash should I use?',
        answer: 'For checking that a download arrived intact, SHA-256 is the standard answer. MD5 and SHA-1 are still fine for detecting accidental corruption and are broken for anything adversarial. For storing passwords, none of these are appropriate — that needs a deliberately slow function such as bcrypt or Argon2, on a server.',
      },
      {
        question: 'Do these tools work offline?',
        answer: 'Once the page has loaded, yes. Nothing in a formatter, encoder or generator needs the network, so they continue to work on a plane or behind a firewall that blocks everything interesting.',
      },
    ],
  },

  text: {
    tagline: 'Count, clean, convert, sort and compare text without pasting it into somebody else\'s server.',
    intro:
      'Text tools look trivial until you need one at the exact moment you cannot use one — a paragraph that has to fit a character limit, a list that needs deduplicating before an import, a block of copy that carries invisible formatting from a Word document. These run locally, which matters more than it sounds: the text people paste into online converters is often a draft contract, a customer list or an unpublished announcement.',
    guide: [
      {
        title: 'Character counts depend on what you are counting for',
        body: 'A tweet, an SMS and a database column each count differently: emoji and accented characters can be one character to a reader, several bytes in UTF-8, and two units in the UTF-16 length that many APIs report. When a limit matters, check the count that the system enforcing it actually uses.',
      },
      {
        title: 'Clean before you transform',
        body: 'Most failed imports come from invisible characters — non-breaking spaces, smart quotes, zero-width joiners and stray carriage returns pasted out of a document or a web page. Stripping those first is what makes the sort, the deduplication or the CSV conversion behave.',
      },
      {
        title: 'Case conversion is not one operation',
        body: 'Title case, sentence case, camelCase, snake_case and kebab-case all mean different things to different systems, and converting between them is not reversible once word boundaries are lost. Convert from the most structured form you have, not from an already-converted one.',
      },
    ],
    faqs: [
      {
        question: 'Does the word count match Microsoft Word?',
        answer: 'Very close, but not always identical: Word counts hyphenated compounds and numbers with its own rules, and it includes or excludes footnotes and text boxes depending on settings. For a limit expressed as an approximate word count, the difference never matters; for a hard contractual limit, check in the tool that will be used to judge it.',
      },
      {
        question: 'Can I sort or deduplicate a very long list?',
        answer: 'Yes. Sorting and deduplication happen in memory in your browser, so lists of tens of thousands of lines are handled without trouble. What limits you is the size your browser is willing to hold in a textarea, not any server-side quota.',
      },
      {
        question: 'Is the text I paste kept after I close the tab?',
        answer: 'No. It lives in the page\'s memory only. Nothing is written to a server, and nothing is stored between sessions unless you explicitly use a feature that saves to your own browser storage.',
      },
    ],
  },

  utility: {
    tagline: 'Unit, date, finance and health calculators that show the assumption behind the number.',
    intro:
      'A calculator is only as honest as the assumptions it hides. Unit conversion is exact because the factors are defined; currency conversion is not, because there is no fixed rate between two currencies, only a rate at a moment and a spread that depends on who is doing the converting. Loan and tax calculators sit in between: the arithmetic is exact, but the result depends entirely on inputs that are rarely as fixed as they look.',
    guide: [
      {
        title: 'Exact conversions and estimated ones are different things',
        body: 'An inch is exactly 25.4 millimetres by definition, so that conversion has no error. A BMI figure, an EMI schedule or a tax estimate is a model with inputs, and changing one input meaningfully changes the answer. Treat the first kind as fact and the second kind as a starting point.',
      },
      {
        title: 'Dates are harder than they look',
        body: 'Age, duration and deadline calculations run into leap years, month lengths that vary, and time zones where "the same day" starts at different moments. When a date calculation matters legally or financially, check which convention the other party is using before trusting any tool\'s answer.',
      },
      {
        title: 'Percentages compound differently than people expect',
        body: 'A 20% fall followed by a 20% rise does not return to the starting value, and an annual rate applied monthly is not one twelfth of it. Where a calculator here deals in rates, the compounding basis is stated, because it is the input people most often get wrong.',
      },
    ],
    faqs: [
      {
        question: 'Are these calculators accurate enough to rely on?',
        answer: 'For unit conversion, yes — the factors are the internationally defined ones and the arithmetic is done in double precision. For financial and health calculators, the arithmetic is exact but the result is a model: an EMI figure ignores fees your lender may charge, and BMI is a population-level statistic that says little about an individual.',
      },
      {
        question: 'Why is there no live currency conversion?',
        answer: 'Because an honest currency converter needs a live rate from a source that updates continuously, which is a server-side dependency this site deliberately does not have. A converter showing a rate cached days ago is worse than no converter, since it looks authoritative and is wrong.',
      },
      {
        question: 'Do these work offline?',
        answer: 'Yes. Everything here is arithmetic running in the page, so once it has loaded, no calculator on this list needs the network again.',
      },
    ],
  },

  word: {
    tagline: 'Read, convert and inspect .docx documents without Microsoft Word and without uploading them.',
    intro:
      'A .docx file is a ZIP archive of XML — which is why it can be read in a browser at all, and why converting one is a question of mapping Word\'s structure onto something else rather than rendering a picture of a page. These tools read that structure directly: headings, emphasis, lists, tables and links come through, and everything that exists only as page furniture does not. The document is parsed in your tab, which is the property that matters when the file is a contract, a review or an unsigned offer.',
    guide: [
      {
        title: 'Convert to the format that keeps what you need',
        body: 'Markdown keeps structure and throws away styling, which is right for documentation. HTML keeps structure and some styling, which is right for a CMS. Plain text keeps only the words, which is right when something downstream only accepts text. PDF keeps the appearance and gives up editability.',
      },
      {
        title: 'Only .docx, deliberately',
        body: 'The modern Office Open XML format is an open, documented ZIP archive. The legacy binary .doc format is a different thing entirely and cannot be read reliably in a browser. Re-saving as .docx in Word or LibreOffice takes a moment and makes every tool here work.',
      },
      {
        title: 'Check what the document says about you before you send it',
        body: 'Word stores the author name, the last person to edit, the company, the total editing time and the revision count inside every file. The metadata viewer shows exactly what a recipient can read, which is worth doing once before a document leaves your organisation.',
      },
      {
        title: 'Comparison is on text, not formatting',
        body: 'The document compare tool reports paragraphs that were added, removed or changed. A font swap or a margin change is not a difference in this sense — which is usually what you want when the question is "what actually changed in this draft".',
      },
    ],
    faqs: [
      {
        question: 'Is my Word document uploaded to convert it?',
        answer: 'No. The .docx archive is unzipped and its XML parsed by JavaScript inside your browser tab. Nothing is transmitted, which is the point: a document worth converting is often a document not worth uploading.',
      },
      {
        question: 'Why does the PDF export not look exactly like Word?',
        answer: 'Because it is rendered from the document\'s structure in a browser, not by Word\'s own layout engine. Headings, emphasis, lists, tables and images carry across faithfully. Page headers and footers, field codes, section breaks and exact pagination are Word-specific and do not.',
      },
      {
        question: 'Will images in my document survive the conversion?',
        answer: 'Images embedded in the document are extracted and included in the HTML, viewer and PDF outputs. Markdown and plain text conversions drop them, because those formats reference images rather than carrying them.',
      },
      {
        question: 'Can I convert a document with tracked changes?',
        answer: 'Tracked changes are read as their accepted state — you get the text as it would look if every revision were accepted. If you need to see the revisions themselves, compare the two versions as separate documents instead.',
      },
    ],
  },

  excel: {
    tagline: 'View, edit, clean, merge and convert CSV data in a table rather than in a text editor.',
    intro:
      'CSV is the format everything can read and nothing agrees on: delimiters vary, quoting rules vary, encodings vary, and a spreadsheet application will happily mangle a column of long numbers or leading zeros the moment it opens one. Working on the raw data in a table view avoids that entire category of damage. These tools parse the file in your browser, which matters because the CSVs people need to clean are usually exports containing customer records.',
    guide: [
      {
        title: 'Open a CSV as data before opening it in a spreadsheet',
        body: 'Spreadsheet applications guess at types on import: phone numbers lose leading zeros, long IDs become scientific notation, and anything that looks like a date becomes one. Viewing and editing the file as text-typed columns first means those conversions never happen.',
      },
      {
        title: 'Clean before you merge',
        body: 'Merging files with inconsistent headers, trailing whitespace or mixed line endings produces a file with subtly duplicated columns. Normalising each input first — trim, fix encoding, align headers — turns the merge into a trivial step.',
      },
      {
        title: 'Deduplication needs a definition of duplicate',
        body: 'Two rows that differ only in whitespace, capitalisation or a trailing empty column are duplicates to a person and distinct to a program. Decide which columns define identity before removing anything, and keep the original file until you have checked the result.',
      },
      {
        title: 'JSON and CSV are not the same shape',
        body: 'CSV is strictly rectangular; JSON is a tree. Converting JSON to CSV means flattening nested objects into dotted column names, and converting back does not necessarily reconstruct the original nesting. Round trips are lossy in a way that is easy to miss until it matters.',
      },
    ],
    faqs: [
      {
        question: 'Is my spreadsheet data uploaded?',
        answer: 'No. The file is read and parsed in the browser tab, and any export is generated there too. This is the relevant property for CSV work specifically, because CSV exports are disproportionately customer lists, order histories and payroll data.',
      },
      {
        question: 'Which delimiters are supported?',
        answer: 'Comma, semicolon, tab and pipe are all handled, and the delimiter converter exists precisely because European exports frequently use semicolons while the receiving system expects commas. Quoted fields containing the delimiter are parsed correctly rather than split.',
      },
      {
        question: 'How big a CSV can I open?',
        answer: 'Files in the tens of megabytes open comfortably on a desktop. The whole file is held in memory and rendered into a virtualised table, so the practical ceiling is your device\'s memory rather than a limit imposed here.',
      },
      {
        question: 'Can these tools read .xlsx files?',
        answer: 'These tools work on delimited text formats — CSV and TSV. For an Excel workbook, export the sheet you need as CSV from Excel, Google Sheets or LibreOffice first; that also forces you to decide which sheet and which range you actually mean.',
      },
    ],
  },

  web: {
    tagline: 'Encoders, decoders and inspectors for the plumbing between a browser and a server.',
    intro:
      'Most of what breaks between a form and a server is an encoding question: a character that meant one thing in a URL and another in a query string, a MIME type that does not match the bytes, a string that was encoded twice. These tools do the small, exact transformations that make those problems visible, and they do them in the tab — which matters because the URLs people debug tend to carry tokens.',
    guide: [
      {
        title: 'Encode for the position, not for the string',
        body: 'The same character needs different escaping in a path segment, a query parameter value and a form body. Encoding a whole URL at once is the classic mistake: it escapes the separators that make it a URL. Encode the component, then assemble.',
      },
      {
        title: 'Double encoding is the most common bug here',
        body: 'A value that arrives already encoded and is encoded again produces %2520 where %20 was meant. If a decoded string still contains percent signs followed by hex digits, it was encoded more than once, and the fix is upstream rather than another decode.',
      },
      {
        title: 'MIME type is a claim, not a fact',
        body: 'The type a server declares and the bytes it sends can disagree, and browsers increasingly refuse to guess. Checking a file\'s actual signature against its declared type is usually the fastest way to explain a download that opens as gibberish.',
      },
    ],
    faqs: [
      {
        question: 'Why does my URL break after encoding it?',
        answer: 'Almost always because the whole URL was encoded rather than one component of it. The colon after the scheme, the slashes in the path and the ampersands between parameters are structural — escaping them turns a URL into a single opaque string.',
      },
      {
        question: 'Is Base64 a way to hide data?',
        answer: 'No. Base64 is an encoding that makes binary data safe to put in text, and reversing it requires nothing but the decoder. Anyone who can see the encoded value can read the original. It provides no confidentiality whatsoever.',
      },
      {
        question: 'Do these tools send anything to a server?',
        answer: 'No. Encoding, decoding and type detection are all local string and byte operations. The values people paste into web encoders are disproportionately signed URLs and API responses, which is a good reason for the tool not to be somebody else\'s server.',
      },
    ],
  },

  security: {
    tagline: 'Passwords, hashes and checksums generated and computed on your own machine.',
    intro:
      'A security tool that runs on somebody else\'s server has a problem no feature list can fix: the server sees the secret. A generated password that was transmitted is a password that existed somewhere else first. Everything in this category uses the browser\'s own Web Crypto implementation, which means the randomness comes from your operating system and the result never leaves the tab.',
    guide: [
      {
        title: 'Length beats complexity',
        body: 'Adding a character to a password multiplies the search space; swapping an "a" for an "@" barely changes it, and the substitution is in every cracking dictionary. A long passphrase of ordinary words is both stronger and easier to type than a short string of symbols.',
      },
      {
        title: 'Hashing, encoding and encryption answer different questions',
        body: 'A hash is one-way and proves a file has not changed. Encoding is reversible and provides no protection. Encryption is reversible with a key and provides confidentiality. Reaching for the wrong one is a design bug, not a configuration detail.',
      },
      {
        title: 'Checksums verify integrity, signatures verify origin',
        body: 'Comparing a download\'s SHA-256 against the published value proves the bytes arrived intact. It proves nothing about who published them if the same compromised page supplied both file and hash. A cryptographic signature is what answers the second question.',
      },
    ],
    faqs: [
      {
        question: 'Is a password generated in a browser actually random?',
        answer: 'Yes, when it uses the Web Crypto API, which is what these tools use. It draws from the operating system\'s cryptographically secure random source — the same one used for TLS keys — rather than from Math.random, which is predictable and unsuitable for anything secret.',
      },
      {
        question: 'Could the generated password be logged or recovered?',
        answer: 'It is created in your tab\'s memory and shown to you; there is no request that carries it, and nothing is stored. You can verify that by generating a password with your browser\'s network panel open, or with the network disconnected entirely.',
      },
      {
        question: 'Is MD5 still usable?',
        answer: 'For detecting accidental corruption — a truncated download, a bad copy — yes, and it is fast. For anything where someone might deliberately construct a colliding file, no: MD5 and SHA-1 are both broken in that sense, and SHA-256 is the correct default.',
      },
    ],
  },

  color: {
    tagline: 'Convert colour formats, build gradients and check contrast before shipping a palette.',
    intro:
      'Colour on the web is several different models wearing the same clothes. Hex, RGB, HSL and OKLCH all describe the same pixel, but they make different operations easy: HSL makes "slightly lighter" obvious, hex makes nothing obvious but is what design tools hand you. Converting between them is exact arithmetic — which is why it belongs in the browser, next to the page you are styling.',
    guide: [
      {
        title: 'Pick the model that matches the change you want',
        body: 'Adjusting lightness or saturation is trivial in HSL and awkward in hex. Building a palette where every step looks equally different needs a perceptual model such as OKLCH, because equal numeric steps in HSL are not equal steps to the eye.',
      },
      {
        title: 'Contrast is a requirement, not a preference',
        body: 'WCAG asks for a 4.5:1 ratio for body text and 3:1 for large text. The ratio depends on relative luminance, not on how different two colours look side by side — which is why a mid-grey on white can fail while a colour pairing that looks bolder passes.',
      },
      {
        title: 'Check both themes before committing',
        body: 'A palette tuned on a light background frequently fails on a dark one, because contrast is not symmetric: inverting a design does not preserve its ratios. Every colour that carries meaning needs a value defined for each theme.',
      },
    ],
    faqs: [
      {
        question: 'Is hex or HSL better for CSS?',
        answer: 'Neither is better as output — browsers treat them identically. HSL is better as a source of truth, because a designer changing "the brand colour, ten percent lighter" can express that directly, while the same change in hex means recomputing three channels by hand.',
      },
      {
        question: 'What contrast ratio do I actually need?',
        answer: 'WCAG AA requires 4.5:1 for normal text and 3:1 for text at 18pt or 14pt bold. AAA raises those to 7:1 and 4.5:1. Interface elements such as icons and input borders need 3:1 against their background to meet AA, which is the rule most often missed.',
      },
      {
        question: 'Why does my gradient look muddy in the middle?',
        answer: 'Because it is being interpolated in sRGB, where the midpoint between two saturated colours passes through a desaturated grey. Interpolating in a perceptual space such as OKLCH keeps the middle as vivid as the ends, and CSS now lets you ask for that explicitly.',
      },
    ],
  },

  archive: {
    tagline: 'Create and extract ZIP archives in the browser, one file or a whole batch.',
    intro:
      'A ZIP file is a container with an index: each entry is compressed independently and listed in a directory at the end of the file. That design is why an archive can be inspected without decompressing all of it, and why a single ZIP can be built in a browser from files that never leave your disk. Extraction and creation both happen in the tab here, which is the relevant property when the archive is a set of documents you were emailed.',
    guide: [
      {
        title: 'Already-compressed files do not compress again',
        body: 'JPEG, PNG, MP4, MP3 and PDF are all compressed formats. Zipping them produces a file roughly the same size, because the entropy has already been squeezed out. ZIP is still worth it there for bundling many files into one, just not for size.',
      },
      {
        title: 'Zipping is not protecting',
        body: 'A plain ZIP offers no confidentiality: every entry name is visible in the directory and every file is recoverable. Legacy ZIP encryption is weak enough to be treated as broken. If the contents need protecting, encrypt them before archiving.',
      },
      {
        title: 'Check the archive\'s structure before extracting',
        body: 'Some archives contain a single top-level folder; others scatter dozens of files into whatever directory you extract to. Listing the entries first tells you which kind you have, and saves cleaning up a download folder afterwards.',
      },
    ],
    faqs: [
      {
        question: 'Are my archives uploaded to extract them?',
        answer: 'No. The ZIP is read and decompressed in your browser, and files are written straight to your downloads. Nothing is transmitted, which is worth having given how often an emailed archive contains documents that should not be handed to a third party.',
      },
      {
        question: 'Can these tools open RAR or 7z files?',
        answer: 'ZIP is the format supported here, because it is the one with an open specification and a well-tested browser implementation. RAR in particular is a proprietary format whose decompressor is not freely redistributable, so a browser tool cannot honestly claim to handle it.',
      },
      {
        question: 'Is a password-protected ZIP supported?',
        answer: 'Encrypted entries cannot be extracted here. That is a limitation worth stating plainly rather than working around, and in practice it points at the better answer: use a modern encrypted container rather than ZIP\'s own encryption, which was never strong.',
      },
    ],
  },
};

export const getCategoryContent = (cat: ToolCategory): CategoryContent | undefined =>
  CATEGORY_CONTENT[cat];
