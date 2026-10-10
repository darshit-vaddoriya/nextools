/**
 * Shorter <title>s for posts whose headline runs past ~60 characters, where
 * results pages cut it off. The headline stays the H1 and the og:title; only
 * the search result title changes, keyword first.
 */
export const BLOG_SEO_TITLES: Record<string, string> = {
  'page-numbers-headers-and-margins': 'Add page numbers, headers and margins to a PDF',
  'ocr-scanned-pdf-explained': 'OCR on scanned PDFs: what it can read and why DPI matters',
  'what-makes-a-password-strong': 'What makes a password strong (not special characters)',
  'images-to-pdf-and-comparing-versions': 'Photos to PDF, and comparing two versions of a PDF',
  'how-pdf-compression-actually-works': "How PDF compression works, and why some files won't shrink",
  'csv-delimiters-quoting-and-encoding': 'CSV delimiters, quoting and encoding: what breaks files',
  'verify-a-download-with-checksums': 'How to verify a download with a checksum (SHA-256)',
  'three-kinds-of-escaping': 'URL encoding vs HTML entities vs MIME types, explained',
  'rotate-flip-and-sharpen': 'Rotate, flip and sharpen images: which fixes cost quality',
  'taking-pages-out-of-a-pdf': 'Split, delete or extract PDF pages: which one you want',
  'find-replace-and-extraction': 'Find, replace and extract data from unstructured text',
  'screenshots-for-bug-reports': 'Screenshots for bug reports: annotation and redaction',
  'how-image-compression-works': 'How image compression works: lossy vs lossless',
  'optimise-images-for-web-performance': 'Image optimisation for web performance: what matters',
  'mp4-is-not-a-codec': 'MP4 is not a codec: containers vs codecs explained',
  'cropping-well': 'How to crop photos well: aspect ratios and safe areas',
  'unicode-utf8-and-mojibake': 'Why text turns into Ã©: UTF-8 and mojibake explained',
  'the-maths-behind-the-calculators': 'EMI, GST and percentage formulas explained',
  'signing-a-pdf-what-it-proves': "Signing a PDF: what a signature image does and doesn't prove",
  'qr-codes-what-is-encoded': 'QR codes: what is encoded and how to make one that scans',
  'json-to-typescript-types-from-a-sample': 'TypeScript types from JSON, and where they go wrong',
  'loading-a-spreadsheet-into-a-database': 'Load a spreadsheet into a database without an import wizard',
  'ebooks-epub-pdf-and-markdown': 'E-books explained: EPUB, PDF, Kindle and Markdown',
  'upi-qr-codes-explained': 'UPI QR codes: what is inside one, and making your own',
  'photo-and-signature-size-for-online-forms': 'Photo and signature size for online forms (KB, pixels, DPI)',
  'hindi-text-in-files-and-pdfs': 'Hindi text in PDFs: boxes, question marks and broken copy',
};
