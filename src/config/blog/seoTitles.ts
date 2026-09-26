/**
 * Shorter <title>s for posts whose headline runs past ~60 characters, where
 * results pages cut it off. The headline stays the H1 and the og:title; only
 * the search result title changes, keyword first.
 */
export const BLOG_SEO_TITLES: Record<string, string> = {
  'page-numbers-headers-and-margins': 'Add page numbers, headers and margins to a PDF',
  'web-crypto-in-plain-english': 'The Web Crypto API in plain English: what browsers encrypt',
  'ocr-scanned-pdf-explained': 'OCR on scanned PDFs: what it can read and why DPI matters',
  'what-makes-a-password-strong': 'What makes a password strong (not special characters)',
  'images-to-pdf-and-comparing-versions': 'Photos to PDF, and comparing two versions of a PDF',
  'how-pdf-compression-actually-works': "How PDF compression works, and why some files won't shrink",
  'csv-delimiters-quoting-and-encoding': 'CSV delimiters, quoting and encoding: what breaks files',
  'verify-a-download-with-checksums': 'How to verify a download with a checksum (SHA-256)',
  'three-kinds-of-escaping': 'URL encoding vs HTML entities vs MIME types, explained',
  'rotate-flip-and-sharpen': 'Rotate, flip and sharpen images: which fixes cost quality',
  'password-manager-and-2fa-setup': 'Password manager and 2FA setup that protects an account',
  'keeping-secrets-out-of-git': 'Keep API keys out of Git, and what to do when one leaks',
  'taking-pages-out-of-a-pdf': 'Split, delete or extract PDF pages: which one you want',
  'find-replace-and-extraction': 'Find, replace and extract data from unstructured text',
  'dates-numbers-across-locales': 'Date and number formats across locales, explained',
  'trimming-and-cropping-video': 'Trim, crop and rotate video without re-encoding',
  'screenshots-for-bug-reports': 'Screenshots for bug reports: annotation and redaction',
  'how-image-compression-works': 'How image compression works: lossy vs lossless',
  'alt-text-and-accessible-documents': 'Alt text, headings and accessible documents',
  'optimise-images-for-web-performance': 'Image optimisation for web performance: what matters',
  'mp4-is-not-a-codec': 'MP4 is not a codec: containers vs codecs explained',
  'gst-invoices-and-rounding': 'GST on invoices: inclusive, exclusive and rounding',
  'cropping-well': 'How to crop photos well: aspect ratios and safe areas',
  'unicode-utf8-and-mojibake': 'Why text turns into Ã©: UTF-8 and mojibake explained',
  'the-maths-behind-the-calculators': 'EMI, GST and percentage formulas explained',
  'signing-a-pdf-what-it-proves': "Signing a PDF: what a signature image does and doesn't prove",
  'qr-codes-what-is-encoded': 'QR codes: what is encoded and how to make one that scans',
};
