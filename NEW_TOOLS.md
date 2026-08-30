# New Tools Overview

The tools below were recently built and fully wired into NextTool. All of them are **100% browser-based** — files are processed locally on your device and are never uploaded to any server.

---

<details open>
  <summary><strong>📋 Copy option — plain-text tool list</strong></summary>

  <p>Open the box below, select all (<code>Ctrl/Cmd + A</code>) and copy (<code>Ctrl/Cmd + C</code>):</p>

  <textarea rows="24" readonly style="width:100%; font-family:monospace; font-size:12px; padding:10px; border:1px solid #ccc; border-radius:8px; background:#fafafa; color:#111; box-sizing:border-box;" onclick="this.select()">
New Tools Overview — 100% browser-based, no uploads, no accounts

🎨 Drawing Board — drawing
  Full-screen drawing app: blank canvas or draw over a photo.
  Canvas presets, background options, Move/Select, Brush, Highlighter,
  Eraser, Line, Arrow, Rectangle, Ellipse, Star, Heart, Text.
  Editable objects & layers, undo/redo, zoom, export PNG / JPG / WebP.

🖊️ Draw on Image — image-draw
  Annotate any uploaded image with pen, eraser, shapes, arrow and text.
  Color presets, brush size & opacity. Download the annotated image.

📄 PDF Tools (20)
  pdf-merge               PDF Merge               — combine PDFs with drag-drop reorder
  pdf-split               PDF Split               — split into pages or ranges
  pdf-compress            Compress PDF            — shrink size, strip metadata
  pdf-to-jpg              PDF to JPG              — pages → JPG images
  pdf-to-png              PDF to PNG              — pages → PNG (transparency kept)
  jpg-to-pdf              JPG to PDF              — images → PDF
  png-to-pdf              PNG to PDF              — transparent PNGs → PDF
  text-to-pdf             Text to PDF             — plain text → formatted PDF
  pdf-ocr                 PDF OCR                 — OCR scanned PDFs, multi-language
  pdf-extract-text        Extract Text from PDF   — all text → .txt
  pdf-extract-images      Extract Images from PDF — export embedded images
  pdf-rotate              Rotate PDF              — rotate pages 90/180/270
  pdf-reorder             Reorder PDF Pages       — drag-and-drop reorder
  pdf-delete-pages        Delete PDF Pages        — remove unwanted pages
  pdf-watermark           Add Watermark           — stamp text with full control
  pdf-page-numbers        Add Page Numbers        — "Page X of Y" numbering
  pdf-sign                Sign PDF                — draw, type or upload signature
  pdf-redact              Redact PDF              — black out sensitive words
  pdf-metadata            PDF Metadata Editor     — edit title, author, keywords
  pdf-page-extractor      PDF Page Extractor      — extract a page range

🔒 Privacy
  Everything runs client-side on your device. Zero uploads, zero accounts.
</textarea>
</details>

---

## 🎨 Drawing Board — `drawing`

A full-screen drawing app where you can sketch on a blank canvas or draw over a photo.

### Functionality
- **Canvas setup** — create a blank canvas from presets (Landscape 16:9, Square 1:1, Portrait 4:5, HD Video, A4 Print, Story 9:16) or upload an image to draw over.
- **Background options** — White, Transparent (checkerboard preview), Dark, Gray.
- **Tools** — Move/Select, Brush, Highlighter, Eraser, Line, Arrow, Rectangle, Ellipse, Star, Heart, Text.
- **Object model** — every stroke/shape/text is an editable object that can be selected, moved, resized, duplicated, rotated, re-ordered (layers) and deleted.
- **Colors & sizes** — 14 color presets + free color picker, brush sizes from 2px to 64px, adjustable opacity.
- **History** — full undo / redo (up to 30 steps).
- **View controls** — zoom in/out, fit, fullscreen, pan.
- **Shortcuts** — V move, B brush, M marker, E eraser, L line, A arrow, R rect, O ellipse, S star, H heart, T text.
- **Export** — download the finished drawing as PNG (lossless), JPG, or WebP.

---

## 🖊️ Draw on Image — `image-draw`

Annotate an uploaded image directly in the browser.

### Functionality
- Upload any image (drag-and-drop or file picker).
- Tools to mark up the image: **Pen**, **Eraser**, **Shapes**, **Arrow**, and **Text**.
- Color presets + free color selection and adjustable brush size / opacity.
- Draw on top of the image while the original stays untouched underneath.
- Download the annotated version as a high-quality image.

---

## 📄 PDF Tools (20)

All PDF tools run locally using `pdf-lib` and `pdfjs-dist` — no file ever leaves your device.

| Tool | id | Functionality |
|------|----|---------------|
| **PDF Merge** | `pdf-merge` | Combine multiple PDFs into one document with drag-and-drop reordering. |
| **PDF Split** | `pdf-split` | Split into individual pages or custom ranges (e.g. `1-2,4`). |
| **Compress PDF** | `pdf-compress` | Shrink file size, optionally strip metadata, compare before/after sizes. |
| **PDF to JPG** | `pdf-to-jpg` | Render each page to a high-quality JPG image. |
| **PDF to PNG** | `pdf-to-png` | Render pages as PNG, preserving transparent areas. |
| **JPG to PDF** | `jpg-to-pdf` | Combine one or more JPG images into a single PDF. |
| **PNG to PDF** | `png-to-pdf` | Merge PNG images (transparency supported) into a PDF. |
| **Text to PDF** | `text-to-pdf` | Turn plain text into a formatted PDF with automatic page breaks and A4/Letter sizing. |
| **PDF OCR** | `pdf-ocr` | Recognize text in scanned/image-based PDFs (Tesseract.js, multi-language) and add a searchable text layer. |
| **Extract Text from PDF** | `pdf-extract-text` | Pull all text out of a PDF, page markers included, export as `.txt`. |
| **Extract Images from PDF** | `pdf-extract-images` | Find and export every embedded image (logos, diagrams, photos) as PNG. |
| **Rotate PDF** | `pdf-rotate` | Rotate all or selected pages by 90°, 180°, 270°. |
| **Reorder PDF Pages** | `pdf-reorder` | Rearrange pages via arrows or drag-and-drop, optionally rotate while reordering. |
| **Delete PDF Pages** | `pdf-delete-pages` | Tick the pages to keep (or use quick-select) and download the cleaned PDF. |
| **Add Watermark** | `pdf-watermark` | Stamp text ("CONFIDENTIAL", logo, name) with position, size, rotation, opacity and color control. |
| **Add Page Numbers** | `pdf-page-numbers` | Add numbers in styles like "Page X of Y" at any top/bottom position. |
| **Sign PDF** | `pdf-sign` | Draw a signature with mouse/touch, type it, or upload an image; place it on any page. |
| **Redact PDF** | `pdf-redact` | Permanently black out sensitive words via keyword search. |
| **PDF Metadata Editor** | `pdf-metadata` | View and edit title, author, subject and keywords. |
| **PDF Page Extractor** | `pdf-page-extractor` | Pull a page range (e.g. `1-3,5`) into a brand-new PDF. |

---

## 🔒 Privacy

- Every tool above is **client-side only** — zero uploads, zero accounts, zero limits.
- Image/PDF data never leaves the browser tab.
- Lazy-loaded libraries (PDF.js, Tesseract.js) keep the main bundle small.

## 📁 Source files

```
src/tools/DrawingTool.tsx            → Drawing Board
src/tools/image/ImageDrawTool.tsx    → Draw on Image
src/tools/pdf/PdfPageTools.tsx       → split, rotate, reorder, delete pages, page extractor
src/tools/pdf/PdfEditTools.tsx       → compress, watermark, page numbers, sign, redact
src/tools/pdf/PdfExtractTools.tsx    → to/from images, OCR, text/image extraction, metadata, text→pdf
src/tools/pdf/PdfShared.tsx          → shared PDF UI helpers
```

> Live at: [nexttool.app](https://nexttool.app) — Local dev: `npm run dev` → http://localhost:5173
