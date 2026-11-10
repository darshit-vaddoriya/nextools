# Launch post drafts for nexttool.click

Post these from your own accounts, one platform every 2 to 3 days, not all on one day.
Reply to every comment in the first few hours; that matters more than the post text.
Every claim below matches what the site does today (175 tools, processing in the browser tab).
Text in [brackets] is for you to fill in.

---

## 1. Product Hunt

**Name:** NextTool

**Tagline (60 characters max):**
175 file and text tools that run in your browser tab

**Description (260 characters max):**
PDF, image, video, document and developer tools in one place. Files are processed inside your browser tab instead of being uploaded to a server, so a merge, a compress or a convert works on documents you would not want to send anywhere. Free, no account.

**Topics:** Productivity, Developer Tools, Privacy

**First comment (maker comment):**

Hi, I'm [your name], and I built NextTool on my own over the last few months.

It started because I kept needing small jobs done on personal files: merge the PDFs for an application form, shrink a scan under a portal's upload limit, turn HEIC photos into JPG. Most sites that do this upload the file first. I wanted the same jobs done locally, so every tool here runs in the browser tab using WebAssembly and the browser's own APIs.

A few that took the most work:

- PDF compress has two methods: rebuild the structure and keep text selectable, or re-encode the page images at 150, 110 or 80 DPI for scans. If the result is not meaningfully smaller, it tells you instead of giving you a bigger file.
- PDF redact removes the text under the box, it does not only draw a black rectangle over it.
- Background remover runs a segmentation model on your GPU through WebGPU, with a WASM fallback. The model downloads once, the photo stays on your machine.
- QR generator has a UPI payment type, and number to words handles lakh and crore, because a lot of my own use is Indian paperwork.

Limits I know about: very large videos are slow because everything runs on your device, and PDF to Word recovers text, not layout.

I would like to hear which tool breaks on your files. That is the feedback I can act on fastest.

---

## 2. AlternativeTo

**Name:** NextTool

**Short description:**
Browser-based PDF, image, video, document and developer tools. Files are processed in the browser tab, not uploaded.

**Full description:**
NextTool is a collection of 175 free tools for everyday file and text jobs: merging, compressing and redacting PDFs, resizing and converting images, converting video and audio, converting documents and spreadsheets, and developer utilities such as a JSON formatter, a diff viewer and a cron parser.

The tools run inside the browser tab with WebAssembly, so the files you open are not sent to a server for processing. There is no account and no install. It also works as an installable web app.

Each tool page says what the tool does and where it stops, for example that PDF to Word recovers text and not page layout.

**Licence:** Free
**Platforms:** Web, plus "Self-hosted: no"
**Tags:** pdf-tools, image-converter, file-converter, privacy-focused, browser-based, no-registration, developer-tools
**Alternative to:** [choose the 3 to 5 apps you see it replacing; AlternativeTo requires this field]

---

## 3. Show HN (Hacker News)

**Title (80 characters max):**
Show HN: 175 file tools that run client-side, including PDF redaction and bg removal

**URL:** https://nexttool.click

**First comment:**

I built this as a solo project. Everything runs in the tab: pdf-lib and pdf.js for PDFs, mediabunny for video and audio, onnxruntime-web for the background remover.

Things that were harder than I expected:

- Redaction. Drawing a rectangle is easy and wrong, because the text under it can still be copied. Removing the text operators from the content stream without breaking the rest of the page took several attempts.
- Background removal. BiRefNet lite in fp16 runs on WebGPU with shader-f16, but has no fp16 kernels on WASM and runs out of memory in fp32, so the fallback is a different model (IS-Net).
- PDF compression. Re-saving the structure does nothing for scans. The only thing that helps a scan is re-encoding the page images, so that became a separate mode with a DPI choice.

The site is static (Astro, React islands per tool) and works offline once installed.

Known limits: large video files are slow, and OCR quality depends on the scan.

I would value criticism of the tools more than of the landing page.

Note for you: HN removes posts that read as marketing. Post between 6 and 9 pm IST on a weekday, and do not ask anyone to upvote.

---

## 4. Reddit

Read each subreddit's rules first. Most ban plain promotion, so each post below leads with something useful and mentions the site once. Use an account that has some history; a new account posting a link gets filtered.

### r/webdev (use the weekly "Showoff Saturday" thread only)

**Title:** Showoff Saturday: I moved PDF redaction, video conversion and background removal fully client-side. Notes on what was hard.

**Body:**
Solo project, 175 small tools, all running in the tab (Astro static pages, a React island per tool).

Three things I learned that may save someone time:

1. PDF "redaction" with pdf-lib's drawRectangle leaves the text selectable underneath. You have to edit the content stream and drop the text-showing operators inside the box.
2. For in-browser background removal, fp16 models need WebGPU with the shader-f16 feature. On WASM there are no fp16 kernels, so I ship a second, fp32 model as the fallback.
3. Loading analytics on first interaction instead of on load cut desktop TBT by roughly half on my pages.

Site is https://nexttool.click if you want to try to break something. Happy to answer questions about any of the three.

### r/InternetIsBeautiful (check the rules: no sign-up walls, must be free; this qualifies)

**Title:** A set of 175 PDF, image and video tools that process the file in your browser tab instead of uploading it

**Body:** (link post, no body. URL: https://nexttool.click)

### r/india or r/IndiaTech (check the self-promotion rule; some allow it only in a weekly thread)

**Title:** Made a free tool set for form paperwork: resize photo and signature to a KB limit, merge documents into one PDF, UPI QR

**Body:**
Every government or exam form I filled this year wanted a photo under some KB limit, a signature under another, and all documents as a single PDF under 2 MB. I built tools for exactly those jobs, and they run in the browser tab, so Aadhaar and marksheet scans are not uploaded to a server for processing.

- Compress a scanned PDF by re-encoding pages at 150, 110 or 80 DPI
- Merge ID proof, certificates and the form into one PDF
- Number to words in lakh and crore, with a cheque format
- UPI payment QR generator

https://nexttool.click

Tell me which portal's requirement it fails on and I will fix it.

---

## 5. GitHub awesome lists

Open a pull request that adds one line, in the list's own format and alphabetical order. Suitable lists to search for: "awesome-privacy", "awesome-webassembly" (projects section), "awesome-pwa", "awesome-free-tools" / "awesome-no-login-web-apps".

**Line to add:**
```
- [NextTool](https://nexttool.click) - 175 PDF, image, video and developer tools that process files in the browser tab. No account.
```

Note: "awesome-no-login-web-apps" is the best fit, since it lists sites that work without sign-up.

---

## 6. dev.to

You already have `marketing/devto-browser-background-removal.md`. Publish it with the canonical URL left empty (it is original to dev.to) and one link to the tool. Two follow-up articles that would earn links, each from work already done:

1. "Redacting a PDF in the browser: why a black box is not enough"
2. "Compressing scanned PDFs client-side: structure rebuild versus image re-encoding"
