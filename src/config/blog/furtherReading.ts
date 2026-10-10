import type { FurtherReading } from './types';

/**
 * Primary sources behind each guide: the specification, standard or official
 * documentation its claims rest on, so a reader can check them. Every URL was
 * fetched and answered 200 when it was added. Guides about plain technique
 * (cropping, annotating a screenshot) have no entry rather than a filler link.
 */
export const FURTHER_READING: Record<string, FurtherReading[]> = {
  'base64-encoding-explained': [
    { title: 'RFC 4648: The Base16, Base32, and Base64 Data Encodings', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4648.html' },
  ],
  'camera-raw-files-and-the-hidden-jpg': [
    { title: 'Adobe Digital Negative (DNG)', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000628.shtml' },
  ],
  'cleaning-a-block-of-text': [
    { title: 'Unicode Frequently Asked Questions: UTF-8, UTF-16, UTF-32 & BOM', publisher: 'Unicode Consortium', url: 'https://www.unicode.org/faq/utf_bom.html' },
  ],
  'cleaning-a-url-before-sharing': [
    { title: 'RFC 3986: Uniform Resource Identifier (URI): Generic Syntax', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc3986.html' },
  ],
  'cleaning-messy-spreadsheet-data': [
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
  ],
  'colour-contrast-and-wcag': [
    { title: 'Understanding Success Criterion 1.4.3: Contrast (Minimum)', publisher: 'W3C', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' },
    { title: 'Web Content Accessibility Guidelines (WCAG) 2.2', publisher: 'W3C', url: 'https://www.w3.org/TR/WCAG22/' },
  ],
  'comparing-two-documents': [
    { title: 'An O(ND) Difference Algorithm and Its Variations (Myers, 1986)', publisher: 'Eugene W. Myers', url: 'http://www.xmailserver.org/diff2.pdf' },
  ],
  'compressing-a-video-without-ruining-it': [
    { title: 'Web video codec guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs' },
    { title: 'H.264 video encoding guide', publisher: 'FFmpeg Wiki', url: 'https://trac.ffmpeg.org/wiki/Encode/H.264' },
  ],
  'cron-expressions-explained': [
    { title: 'crontab(5): tables for driving cron', publisher: 'Linux man-pages', url: 'https://man7.org/linux/man-pages/man5/crontab.5.html' },
  ],
  'csv-delimiters-quoting-and-encoding': [
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
    { title: 'Unicode FAQ: byte order mark', publisher: 'Unicode Consortium', url: 'https://www.unicode.org/faq/utf_bom.html' },
  ],
  'csv-to-json-conversion-guide': [
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
    { title: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
  ],
  'csv-vs-excel-when-to-use-which': [
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
    { title: 'ECMA-376: Office Open XML File Formats', publisher: 'Ecma International', url: 'https://ecma-international.org/publications-and-standards/standards/ecma-376/' },
  ],
  'data-uris-when-to-inline-an-image': [
    { title: 'data: URLs', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data' },
    { title: 'RFC 2397: The "data" URL scheme', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc2397.html' },
  ],
  'ebooks-epub-pdf-and-markdown': [
    { title: 'EPUB 3.3', publisher: 'W3C', url: 'https://www.w3.org/TR/epub-33/' },
    { title: 'CommonMark specification', publisher: 'CommonMark', url: 'https://spec.commonmark.org/' },
  ],
  'exif-metadata-in-your-photos': [
    { title: 'EXIF tag reference', publisher: 'ExifTool', url: 'https://exiftool.org/TagNames/EXIF.html' },
  ],
  'extracting-audio-from-video': [
    { title: 'Web audio codec guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs' },
  ],
  'favicon-sizes-and-formats': [
    { title: 'Define icons and a theme color', publisher: 'web.dev', url: 'https://web.dev/articles/add-manifest' },
  ],
  'find-replace-and-extraction': [
    { title: 'Regular expressions', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions' },
  ],
  'getting-tables-out-of-a-pdf': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'gradients-and-palettes': [
    { title: 'Using CSS gradients', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Images/Using_gradients' },
    { title: 'A perceptual color space for image processing (Oklab)', publisher: 'Björn Ottosson', url: 'https://bottosson.github.io/posts/oklab/' },
  ],
  'hashing-vs-encryption-vs-encoding': [
    { title: 'Password Storage Cheat Sheet', publisher: 'OWASP', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
    { title: 'Hash Functions', publisher: 'NIST', url: 'https://csrc.nist.gov/projects/hash-functions' },
  ],
  'how-diff-tools-find-changes': [
    { title: 'An O(ND) Difference Algorithm and Its Variations (Myers, 1986)', publisher: 'Eugene W. Myers', url: 'http://www.xmailserver.org/diff2.pdf' },
  ],
  'how-image-compression-works': [
    { title: 'Image file type and format guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types' },
    { title: 'JPEG overview', publisher: 'Joint Photographic Experts Group', url: 'https://jpeg.org/jpeg/' },
  ],
  'how-pdf-compression-actually-works': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'http-status-codes-that-matter': [
    { title: 'RFC 9110: HTTP Semantics', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
    { title: 'HTTP response status codes', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status' },
  ],
  'images-to-pdf-and-comparing-versions': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'iphone-heic-photos-explained': [
    { title: 'Using HEIF or HEVC media on Apple devices', publisher: 'Apple Support', url: 'https://support.apple.com/en-us/116944' },
    { title: 'libheif', publisher: 'struktur AG', url: 'https://github.com/strukturag/libheif' },
  ],
  'jpeg-png-webp-avif-which-format': [
    { title: 'Image file type and format guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types' },
    { title: 'An image format for the Web (WebP)', publisher: 'Google for Developers', url: 'https://developers.google.com/speed/webp' },
  ],
  'json-errors-and-how-to-fix-them': [
    { title: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
    { title: 'JSON.parse()', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse' },
  ],
  'json-to-typescript-types-from-a-sample': [
    { title: 'Object types', publisher: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html' },
    { title: 'Zod documentation', publisher: 'Zod', url: 'https://zod.dev/' },
    { title: 'OpenAPI Specification', publisher: 'OpenAPI Initiative', url: 'https://spec.openapis.org/oas/latest.html' },
  ],
  'jwt-structure-and-verification': [
    { title: 'RFC 7519: JSON Web Token (JWT)', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc7519.html' },
    { title: 'RFC 8725: JSON Web Token Best Current Practices', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc8725.html' },
  ],
  'loading-a-spreadsheet-into-a-database': [
    { title: 'COPY', publisher: 'PostgreSQL documentation', url: 'https://www.postgresql.org/docs/current/sql-copy.html' },
    { title: 'Command line shell for SQLite', publisher: 'SQLite', url: 'https://sqlite.org/cli.html' },
  ],
  'making-a-gif-worth-sending': [
    { title: 'Image file type and format guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types' },
  ],
  'making-a-pdf-from-something-else': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'markdown-as-a-document-source': [
    { title: 'CommonMark specification', publisher: 'CommonMark', url: 'https://spec.commonmark.org/' },
    { title: 'GitHub Flavored Markdown Spec', publisher: 'GitHub', url: 'https://github.github.com/gfm/' },
    { title: 'Pandoc', publisher: 'Pandoc', url: 'https://pandoc.org/' },
  ],
  'merge-pdf-files-without-uploading': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'merging-csv-files-that-do-not-line-up': [
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
  ],
  'mime-types-and-file-signatures': [
    { title: 'MIME types (IANA media types)', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types' },
    { title: 'MIME Sniffing Standard', publisher: 'WHATWG', url: 'https://mimesniff.spec.whatwg.org/' },
  ],
  'mp4-is-not-a-codec': [
    { title: 'Media container formats', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers' },
    { title: 'Web video codec guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs' },
  ],
  'ocr-scanned-pdf-explained': [
    { title: 'Improving the quality of the output', publisher: 'Tesseract documentation', url: 'https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html' },
  ],
  'open-a-docx-without-word': [
    { title: 'ECMA-376: Office Open XML File Formats', publisher: 'Ecma International', url: 'https://ecma-international.org/publications-and-standards/standards/ecma-376/' },
  ],
  'opening-psd-and-ai-files-without-adobe': [
    { title: 'Adobe Photoshop Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000523.shtml' },
  ],
  'optimise-images-for-web-performance': [
    { title: 'Serve responsive images', publisher: 'web.dev', url: 'https://web.dev/articles/serve-responsive-images' },
    { title: 'Image file type and format guide', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types' },
  ],
  'page-numbers-headers-and-margins': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'qr-codes-what-is-encoded': [
    { title: 'What is a QR Code?', publisher: 'DENSO WAVE', url: 'https://www.qrcode.com/en/about/' },
    { title: 'Error correction feature', publisher: 'DENSO WAVE', url: 'https://www.qrcode.com/en/about/error_correction.html' },
  ],
  'random-strings-and-tokens': [
    { title: 'Crypto: getRandomValues()', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues' },
  ],
  'rar-7z-and-tar-archives-explained': [
    { title: '.ZIP File Format Specification (APPNOTE)', publisher: 'PKWARE', url: 'https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT' },
    { title: '7z format', publisher: '7-Zip', url: 'https://www.7-zip.org/7z.html' },
    { title: 'libarchive', publisher: 'libarchive', url: 'https://www.libarchive.org/' },
  ],
  'reading-text-off-an-image': [
    { title: 'Improving the quality of the output', publisher: 'Tesseract documentation', url: 'https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html' },
  ],
  'reduce-pdf-file-size-for-upload-limits': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'regex-patterns-that-actually-come-up': [
    { title: 'Regular expressions', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions' },
  ],
  'resize-vs-compress-images': [
    { title: 'Serve responsive images', publisher: 'web.dev', url: 'https://web.dev/articles/serve-responsive-images' },
  ],
  'rotate-flip-and-sharpen': [
    { title: 'EXIF tag reference (Orientation)', publisher: 'ExifTool', url: 'https://exiftool.org/TagNames/EXIF.html' },
  ],
  'sending-a-spreadsheet-without-excel': [
    { title: 'Date systems in Excel', publisher: 'Microsoft Support', url: 'https://support.microsoft.com/en-us/excel/date-systems-in-excel' },
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
  ],
  'signing-a-pdf-what-it-proves': [
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'subtitles-srt-and-burned-in-captions': [
    { title: 'WebVTT: The Web Video Text Tracks Format', publisher: 'W3C', url: 'https://www.w3.org/TR/webvtt1/' },
    { title: 'Web Video Text Tracks Format (WebVTT)', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API' },
  ],
  'the-maths-behind-the-calculators': [
    { title: 'Goods and Services Tax', publisher: 'Central Board of Indirect Taxes and Customs', url: 'https://cbic-gst.gov.in/' },
  ],
  'three-kinds-of-escaping': [
    { title: 'RFC 3986: Uniform Resource Identifier (URI): Generic Syntax', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc3986.html' },
    { title: 'Named character references', publisher: 'WHATWG HTML Standard', url: 'https://html.spec.whatwg.org/multipage/named-characters.html' },
  ],
  'timestamps-time-zones-and-the-missing-hour': [
    { title: 'Time Zone Database', publisher: 'IANA', url: 'https://www.iana.org/time-zones' },
    { title: 'RFC 3339: Date and Time on the Internet: Timestamps', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc3339.html' },
  ],
  'turning-a-pdf-or-photos-into-slides': [
    { title: 'ECMA-376: Office Open XML File Formats', publisher: 'Ecma International', url: 'https://ecma-international.org/publications-and-standards/standards/ecma-376/' },
  ],
  'unicode-utf8-and-mojibake': [
    { title: 'Unicode FAQ: UTF-8, UTF-16, UTF-32 & BOM', publisher: 'Unicode Consortium', url: 'https://www.unicode.org/faq/utf_bom.html' },
    { title: 'RFC 3629: UTF-8, a transformation format of ISO 10646', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc3629.html' },
  ],
  'unit-conversion-and-its-assumptions': [
    { title: 'Unit conversion', publisher: 'NIST', url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion' },
    { title: 'Mars Climate Orbiter', publisher: 'NASA', url: 'https://science.nasa.gov/mission/mars-climate-orbiter/' },
  ],
  'uuid-v4-vs-v7-which-one': [
    { title: 'RFC 9562: Universally Unique IDentifiers (UUIDs)', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc9562.html' },
  ],
  'verify-a-download-with-checksums': [
    { title: 'Hash Functions', publisher: 'NIST', url: 'https://csrc.nist.gov/projects/hash-functions' },
    { title: 'Web Crypto API', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API' },
  ],
  'what-a-formatter-actually-does': [
    { title: 'Rationale', publisher: 'Prettier', url: 'https://prettier.io/docs/rationale' },
  ],
  'what-a-user-agent-string-says': [
    { title: 'User-Agent header', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent' },
    { title: 'User-Agent Client Hints', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Client_hints' },
  ],
  'what-actually-compresses-in-a-zip': [
    { title: 'RFC 1951: DEFLATE Compressed Data Format Specification', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc1951.html' },
    { title: '.ZIP File Format Specification (APPNOTE)', publisher: 'PKWARE', url: 'https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT' },
  ],
  'what-makes-a-password-strong': [
    { title: 'NIST SP 800-63B: Digital Identity Guidelines, Authentication', publisher: 'NIST', url: 'https://pages.nist.gov/800-63-4/sp800-63b.html' },
    { title: 'Dice-generated passphrases', publisher: 'Electronic Frontier Foundation', url: 'https://www.eff.org/dice' },
  ],
  'why-csv-files-break-in-excel': [
    { title: 'Floating-point arithmetic may give inaccurate results in Excel', publisher: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/floating-point-arithmetic-inaccurate-result' },
    { title: 'RFC 4180: Common Format and MIME Type for CSV Files', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc4180.html' },
  ],
  'word-styles-and-templates': [
    { title: 'Customize or create new styles', publisher: 'Microsoft Support', url: 'https://support.microsoft.com/en-us/word/customize-or-create-new-styles' },
  ],
  'word-to-pdf-and-back': [
    { title: 'ECMA-376: Office Open XML File Formats', publisher: 'Ecma International', url: 'https://ecma-international.org/publications-and-standards/standards/ecma-376/' },
    { title: 'PDF (Portable Document Format) Family', publisher: 'Library of Congress', url: 'https://www.loc.gov/preservation/digital/formats/fdd/fdd000030.shtml' },
  ],
  'yaml-json-and-tabular-interchange': [
    { title: 'YAML Ain’t Markup Language version 1.2.2', publisher: 'YAML', url: 'https://yaml.org/spec/1.2.2/' },
    { title: 'RFC 8259: The JavaScript Object Notation (JSON) Data Interchange Format', publisher: 'RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc8259.html' },
  ],
  'hindi-text-in-files-and-pdfs': [
    { title: 'Devanagari code chart (U+0900–U+097F)', publisher: 'Unicode Consortium', url: 'https://www.unicode.org/charts/PDF/U0900.pdf' },
    { title: 'Noto Sans Devanagari', publisher: 'Google Fonts', url: 'https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari' },
    { title: 'Improving the quality of the output', publisher: 'Tesseract documentation', url: 'https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html' },
  ],
  'lakh-crore-and-amounts-in-words': [
    { title: 'Number.prototype.toLocaleString()', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString' },
  ],
};
