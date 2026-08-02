# NextTool

**Free online tools that run entirely in your browser.** Merge PDFs, convert documents, compress images, remove backgrounds with AI and more — no uploads, no accounts, no limits.

> 🔗 **Live site:** [nexttool.app](https://nexttool.app)

---

## ✨ Why NextTool?

Most "free" tool sites upload your files to a server. NextTool is different:

- **100% client-side** — files are processed on your own device and never leave it
- **Private by default** — no accounts, no tracking of your files, no upload limits
- **Free forever** — no hidden tiers, no watermarks, no paywalls
- **AI tools included** — background removal and image upscaling run on WebGPU/WASM locally, not the cloud

---

## 🧰 Included Tools

### PDF & Documents
| Tool | What it does |
|------|-------------|
| PDF Merge | Combine PDFs with drag-and-drop reordering |
| DOCX ↔ PDF / HTML / Markdown / TXT | Convert Word documents between formats |
| HTML / Markdown → DOCX | Build Word documents from web content |
| Word Viewer & Metadata | Preview DOCX and inspect author/dates |

### Images
| Tool | What it does |
|------|-------------|
| AI Background Remover | WebGPU/WASM models, no upload |
| AI Image Upscaler | Up to 4× super-resolution, runs locally |
| Image Compressor | JPEG/PNG/WebP/AVIF with quality control |
| Resize / Crop / Rotate / Flip | Core editing in-browser |
| Convert Formats | JPG, PNG, WebP, AVIF, HEIC, BMP, TIFF |
| SVG Converter | SVG → PNG/JPG rasterization |
| Sharpen & Adjust | Brightness, contrast, saturation, hue |
| Watermark & Metadata | Add watermarks, strip EXIF for privacy |
| OCR | Image → text with Tesseract.js |
| QR & Barcode Generator | URLs, Wi-Fi, vCards and more |
| Color Picker | HEX / RGB / HSL from any image |

### Developer & Text
| Tool | What it does |
|------|-------------|
| JSON Formatter | Format, validate and collapse |
| Base64 Encoder / Decoder | Text and file support |
| JWT Inspector | Decode header and payload |
| UUID Generator | v4 with bulk mode |
| Hash Generator | MD5, SHA-1, SHA-256, SHA-512 |
| Regex Tester | Live matches with flags |
| Case Converter & Word Counter | Text utilities |
| Password Generator | Strong, configurable passwords |

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 (dark/light modes) |
| PDF | pdf-lib, pdfjs-dist |
| OCR | tesseract.js |
| AI (background removal, upscaling) | @imgly/background-removal, ONNX Runtime WebGPU/WASM |
| Icons | lucide-react |
| QR codes | qrcode |
| Hosting | Netlify (static, with SPA redirects + security headers) |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Type-check + build for production
npm run build

# Preview the production build
npm run preview

# Lint (must pass with zero warnings)
npm run lint
```

### Project structure

```
src/
├── App.tsx                 # Routing, lazy-loading, theme
├── components/             # Shared UI (Header, CommandPalette, etc.)
├── config/                 # Tool registry, SEO data
├── pages/                  # Static pages (privacy policy, etc.)
├── tools/                  # Individual tool implementations
│   └── image/              # Canvas/image processing + heavy AI tools
├── utils/                  # Helpers (SEO, error handling)
└── workers/                # Web workers
```

---

## 📦 Deployment

The site is a static SPA and deploys with any static host. Netlify config is included:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **SPA redirects:** `/* → /index.html`
- **Security headers:** X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy

Heavy libraries (PDF.js, ONNX Runtime) are lazy-loaded and code-split, so the main bundle stays small.

---

## 📄 License

This repository is **not open source**. The code is provided for reference only and may not be copied, modified, or redistributed without permission. All rights reserved. The site itself is free to use, and all processing stays on your device.
