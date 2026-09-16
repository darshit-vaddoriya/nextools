import { BlogPost } from '../types';

export const IMAGE_POSTS: BlogPost[] = [
  {
    slug: 'jpeg-png-webp-avif-which-format',
    title: 'JPEG, PNG, WebP or AVIF: picking the right image format',
    description: 'Four formats, four different jobs. A practical comparison of compression, transparency, browser support and when each one is the wrong choice.',
    excerpt: 'Saving a screenshot as JPEG makes the text fuzzy. Saving a photo as PNG makes the file eight times larger. Both mistakes come from the same gap in knowledge.',
    category: 'image',
    tags: ['formats', 'jpeg', 'png', 'webp', 'avif'],
    published: '2026-08-07',
    relatedTools: ['image-convert', 'image-compressor', 'svg-converter', 'image-metadata'],
    takeaways: [
      'Text, sharp edges and flat colour want PNG. Photographs want JPEG or WebP. The mismatch costs either size or quality.',
      'WebP is the sensible default for your own website and the wrong thing to email a client or send to a printer.',
      'JPEG has no transparency at all, which decides the question whenever a cut-out background is involved.',
      'Always convert from the highest-quality original, because each conversion inherits the previous one artefacts.',
    ],
    body: `Image formats are not interchangeable containers for the same thing. Each one made a different bet about what kind of picture it would hold, and using the wrong one costs you either file size or visual quality, sometimes both.

## The short version

| Format | Compression | Transparency | Best for | Avoid for |
|---|---|---|---|---|
| JPEG | Lossy | No | Photographs | Text, screenshots, line art |
| PNG | Lossless | Yes | Screenshots, logos, UI, line art | Photographs |
| WebP | Both | Yes | Almost everything on the web | Print handoff, archival masters |
| AVIF | Both | Yes | Web photos where size matters most | Fast batch encoding, older software |
| SVG | Vector | Yes | Logos, icons, diagrams | Photographs |

## JPEG: built for photographs, hostile to edges

JPEG splits the image into 8×8 pixel blocks, converts each to frequency information, and discards the high-frequency detail your eye is least likely to miss. It also usually throws away three-quarters of the colour resolution, a technique called chroma subsampling, because human vision is far more sensitive to brightness than to colour.

That set of assumptions is excellent for a photograph of a face or a landscape, where colour changes gradually. It is actively bad for a screenshot, where a hard black-on-white edge is exactly the high-frequency detail JPEG is designed to throw away. The result is the coloured fringing and mosquito noise you see around text in a JPEG screenshot.

JPEG also has no transparency. Ever. If something must sit on a coloured background, JPEG cannot do it.

## PNG: lossless, transparent, and heavy on photos

PNG predicts each pixel from its neighbours, stores the difference, and compresses the result with DEFLATE. Nothing is discarded, decode a PNG and you get the exact original pixels back.

That is perfect for content with large flat areas and sharp edges: screenshots, logos, icons, charts, anything with text. It is a poor fit for photographs, where no two adjacent pixels are alike and the prediction has nothing to work with. A photo saved as PNG is routinely five to ten times larger than the same photo as a good-quality JPEG, with no visible benefit.

PNG also supports a full 8-bit alpha channel, which is why it remains the safe choice for a logo that has to sit on an unknown background.

One nuance: PNG-8 uses a 256-colour palette and can be dramatically smaller than PNG-24 for simple graphics. For a flat-colour logo, it is often the right answer.

## WebP: the sensible default for the web

WebP does both lossy and lossless, supports alpha transparency in both modes, and typically produces files around 25–35% smaller than JPEG at comparable perceptual quality. Crucially, it supports transparency *with* lossy compression, something neither JPEG nor PNG can do, which makes it excellent for a photographic image with a cut-out background.

Browser support stopped being a concern years ago; every current browser handles it, including Safari. The remaining friction is outside the browser: some older desktop software, printers and corporate document systems still do not accept it.

**Use WebP for images on your website. Do not use it as the file you email to a client or send to a printer.**

## AVIF: smaller still, at a cost

AVIF uses the intra-frame coding from the AV1 video codec. At low-to-medium quality settings it is meaningfully smaller than WebP, often another 20% or more, and it degrades more gracefully, producing soft blur rather than blocky artefacts. It also handles 10- and 12-bit colour and wide gamut, which matters for HDR content.

The trade-offs are real: encoding is significantly slower than JPEG or WebP, support in non-browser software is patchier, and at very high quality settings the size advantage narrows.

Use it for hero images and large photographs on a site where bandwidth matters, and serve a WebP or JPEG fallback.

## Choosing, in practice

**Does it have text, sharp edges or flat colour?** → PNG (or SVG if it started as vector).

**Is it a photograph?** → WebP for the web, JPEG for anything that has to be opened by arbitrary software.

**Does it need a transparent background?** → PNG for compatibility, WebP if it is photographic and web-only.

**Is it a logo, icon or diagram you have the vector source for?** → SVG. It stays sharp at any size and is usually a few kilobytes.

**Is it going to a printer or a client's design team?** → Whatever they asked for, at the highest quality you have. Do not optimise files you are handing over as source material.

## Converting without a round trip

Format conversion is decode-then-re-encode, which browsers do natively with the Canvas API and modern codecs. NextTool's [image converter](/tool/image-convert) and [compressor](/tool/image-compressor) run entirely on your device, so a batch of holiday photos or client mockups never gets uploaded anywhere.

One rule regardless of tool: **always convert from the highest-quality original you have.** Converting a JPEG to WebP inherits every artefact the JPEG already had, then adds its own.`,
  },

  {
    slug: 'how-image-compression-works',
    title: 'How image compression works: lossy, lossless, and the quality slider',
    description: 'What the quality slider actually changes, why 80 is usually the sweet spot, and why re-saving the same image twice makes it worse.',
    excerpt: 'The number in the quality box is not a percentage of anything. Knowing what it really controls explains most of the odd results people get.',
    category: 'image',
    tags: ['compression', 'quality', 'jpeg'],
    published: '2026-08-14',
    relatedTools: ['image-compressor', 'image-convert', 'batch-resize'],
    takeaways: [
      'Lossless finds redundancy and keeps every pixel. Lossy discards detail the eye is least likely to miss.',
      'The quality number is not a percentage. It selects a quantisation table, and the scale is not linear or comparable between encoders.',
      'Quality 80 is the usual sweet spot, with most of the saving and little visible cost.',
      'Generation loss is real: every re-save of a JPEG compounds the damage, so always work from the original.',
    ],
    body: `Compression is the art of storing the same picture in fewer bytes. There are two fundamentally different ways of doing it, and mixing them up is where most confusion begins.

## Lossless: nothing is thrown away

Lossless compression finds redundancy and encodes it more efficiently. PNG, for example, predicts each pixel from the ones above and to the left, stores only the difference, and then runs DEFLATE over the result. Decode it and you get back the exact original pixel values, bit for bit.

The catch is that the amount of redundancy in a photograph is small. A gradient sky has no repeated runs and poor prediction accuracy, so lossless compression can only do so much. Typical savings on photographic content are modest, often 10–30%.

Lossless shines on synthetic images: screenshots, diagrams, logos, anything with large uniform regions.

## Lossy: throw away what you will not miss

Lossy compression exploits the limits of human vision. JPEG's approach, still the clearest example:

1. **Convert colour space.** Separate brightness (luma) from colour (chroma), because the eye is much more sensitive to the former.
2. **Subsample chroma.** Typically store colour at half resolution in each direction, a 75% reduction in colour data that is nearly invisible on photographic content.
3. **Transform in 8×8 blocks.** Each block is converted from pixel values into frequency coefficients: a few coefficients describe the broad tone of the block, many describe fine detail.
4. **Quantise.** Divide those coefficients by a table of numbers and round. Fine-detail coefficients get divided by larger numbers, so most of them round to zero. **This is the lossy step, and this is what the quality slider controls.**
5. **Entropy-code** the remaining values losslessly.

## What the quality number really means

The quality slider scales the quantisation table. Lower quality means larger divisors, means more coefficients rounded to zero, means fewer bytes and less detail.

It is not a percentage of anything, and, this trips people up constantly, **it is not comparable between encoders.** Quality 80 in one library does not mean quality 80 in another. Different software uses different tables.

What is broadly true across encoders:

- **90–100**: near-transparent quality, files much larger than necessary. Worth it for a master copy, wasteful for the web.
- **75–85**: the practical sweet spot. Most people cannot see the difference from the original at normal viewing size, and the file is a fraction of the size.
- **60–75**: visible on close inspection, fine for thumbnails and secondary images.
- **Below 50**: blocking and colour banding become obvious, particularly in smooth gradients like skies and skin.

If you need one number: **80**. Then check the result on the content you actually have, a photo with fine texture tolerates more compression than one with large smooth areas, where banding shows up first.

## Generation loss is real

Every lossy save re-runs quantisation on data that has already been quantised. The errors compound. Open a JPEG, crop it, save it, open it again, adjust it, save it again, after a few rounds you get visible blocking that no amount of care recovers.

Practical rules:

- **Keep an untouched original.** Edit from it every time, rather than from your last export.
- **Do all your edits, then compress once at the end.** Never compress as an intermediate step.
- **Never re-compress a file someone sent you** if you can ask for the original.

Lossless formats do not have this problem. You can open and re-save a PNG a thousand times with no degradation.

## Where the bytes actually go

For most photographs, size is dominated by resolution before it is dominated by quality. A 4000×3000 image at quality 60 will usually be larger and look worse than the same image resized to 1600×1200 at quality 85.

The general order of operations for getting a file small:

1. **Resize to the dimensions you will actually display.** This is the biggest lever by a wide margin.
2. **Choose the right format** for the content type.
3. **Then** set quality, starting around 80 and checking the result.
4. **Strip metadata** if you do not need it, EXIF blocks can carry hundreds of kilobytes of embedded thumbnails and colour profiles.

## Compressing without uploading

Canvas encoding in the browser handles all of this natively, JPEG, PNG and WebP encoding are built into every modern browser. NextTool's [image compressor](/tool/image-compressor) uses exactly that, so a folder of family photos or unreleased product shots is processed on your machine and never transmitted.

For a batch, [bulk resizing](/tool/batch-resize) before compressing usually gets you further than any quality setting alone.`,
  },

  {
    slug: 'resize-vs-compress-images',
    title: 'Resize or compress? The difference that decides your file size',
    description: 'Resizing changes pixel dimensions, compressing changes how those pixels are stored. Reaching for the wrong one is why images end up blurry and still too big.',
    excerpt: 'A 300 DPI setting does nothing for an image on a website. Pixels are the only unit the screen understands, and understanding that fixes a lot of frustration.',
    category: 'image',
    tags: ['resize', 'compression', 'dpi'],
    published: '2026-08-21',
    relatedTools: ['image-resize', 'image-compressor', 'batch-resize', 'image-crop'],
    takeaways: [
      'File size scales with pixel count, so halving both dimensions removes about three quarters of the data before any compression.',
      'DPI is metadata and means nothing on a screen. Only pixel dimensions matter for web use.',
      'Upscaling interpolates and adds no detail. If the pixels were never captured, no tool recovers them.',
      'Resize first, then compress. Doing it the other way wastes the compression on pixels you are about to discard.',
    ],
    body: `Two operations, constantly confused, with completely different effects on a file.

**Resizing** changes how many pixels the image contains. A 4000×3000 photo resized to 1000×750 has one-sixteenth the pixels, and roughly one-sixteenth the data before any compression is applied.

**Compressing** keeps the pixel count and changes how efficiently those pixels are stored, discarding detail your eye is unlikely to notice.

Almost everyone reaches for compression first. For a modern phone photo, resizing is usually the bigger lever by an enormous margin.

## The arithmetic

A 12-megapixel phone photo is 4000×3000. If it is going into a blog post displayed 800 pixels wide, you are storing 15 times more pixel data than the page will ever show. The browser downsamples it on the fly, every time, for every visitor.

Resize it to 1600 pixels wide, twice the display width, which covers high-density screens, and you have removed 84% of the data before touching the quality slider. The visible result on the page is identical.

Compressing the full-size original to reach the same file size means quality settings low enough to introduce visible artefacts. You end up with a large, ugly image instead of a small, clean one.

## The DPI misunderstanding

DPI (or PPI) is a number stored in the file's metadata that says how large the image should be *when printed*. A 1000×1000 image tagged at 300 DPI prints at 3.33 inches square. The same image tagged at 72 DPI prints at 13.9 inches square.

The pixels are identical in both cases. The file size is identical. **Changing the DPI value changes nothing about the image data.**

On screen, DPI is ignored entirely. Browsers, phones and monitors work in pixels. So:

- "Save this at 300 DPI for the website" is a meaningless instruction. What matters is pixel dimensions.
- "Save this at 300 DPI for print" is meaningful, and what it really means is: *make sure the pixel dimensions are at least 300 × the physical size in inches.* An A4 page at 300 DPI needs roughly 2480×3508 pixels.
- Increasing the DPI number in software without resampling gives you a smaller print at higher density, not more detail.

## Never upscale to gain quality

Enlarging an image cannot add detail that was not captured. Traditional upscaling interpolates between existing pixels, producing a larger, softer version of the same picture with a bigger file size.

AI upscalers are genuinely different, they hallucinate plausible detail based on training data, and they are useful. But it is invention, not recovery. For anything where accuracy matters (a document, a product photo, evidence), do not upscale; go back to the source.

## Sizing guidelines that hold up

| Use | Sensible width |
|---|---|
| Full-width hero on a website | 1920–2560 px |
| In-article image | 1200–1600 px |
| Thumbnail / card | 400–600 px |
| Email attachment | 1600 px is plenty |
| Social media post | 1080–1440 px |
| Print, A4 full page | ~2480 px (300 DPI) |

The rule for screens: **target roughly twice your display width**, which handles high-density displays without going further.

## The correct order

1. **Crop** to the composition you want. Removing what you do not need is free.
2. **Resize** to the target pixel dimensions.
3. **Choose the format** appropriate to the content.
4. **Compress**, starting around quality 80.
5. **Strip metadata** if it is not needed.

Doing it in this order means each step operates on the smallest data possible, and you only apply lossy compression once, at the end.

## Batches

If you are preparing a gallery or a product catalogue, doing this by hand for sixty images is how it stops getting done. [Batch resizing](/tool/batch-resize) applies a single width to a whole folder in one pass, in the browser, without uploading any of them, which matters when the folder is client work or unpublished product photography.`,
  },

  {
    slug: 'remove-image-background-in-browser',
    title: 'How AI background removal works, and where it still fails',
    description: 'Segmentation models can cut a subject out of a photo in seconds. Understanding what the model is doing tells you which photos will work and which will not.',
    excerpt: 'The model is not "finding the person". It is assigning every pixel a probability of being foreground, which explains exactly why hair and glass give it trouble.',
    category: 'image',
    tags: ['ai', 'background-removal', 'segmentation'],
    published: '2026-08-29',
    relatedTools: ['ai-bg-remover', 'image-convert', 'image-crop', 'image-editor'],
    takeaways: [
      'The model predicts an alpha value per pixel, so the output is a soft mask rather than a yes-or-no cutout.',
      'Edges are the hard part, and hair, fur, glass and motion blur are where results fall apart.',
      'A clear subject against a contrasting, evenly lit background predicts a good result better than any setting.',
      'Expect to touch up the edges on anything that will be seen at full size.',
    ],
    body: `Cutting a subject out of a photograph used to be twenty minutes of careful path work. A segmentation model now does a credible job in a few seconds. It is worth knowing what it is actually doing, because that explains its failure modes precisely.

## What the model produces

A background-removal model does not identify objects and draw an outline around them. It performs **semantic segmentation**: for every pixel in the image, it outputs a value between 0 and 1 representing confidence that the pixel belongs to the foreground.

The result is a greyscale mask the same size as the image, white where the model is confident it is subject, black where it is confident it is background, grey where it is unsure. That mask becomes the alpha channel of the output PNG.

Architectures like U²-Net are built for exactly this: an encoder progressively downsamples the image to understand global context ("this is a person standing in a room"), and a decoder upsamples back to full resolution while pulling in fine detail from earlier layers via skip connections. The two-scale design is why these models get both the overall shape and the edges reasonably right.

## Why edges are the hard part

For most pixels the answer is obvious. The interesting pixels are the boundary ones, where a single pixel genuinely contains both subject and background, this is a real physical property of how cameras sample light, not a modelling shortcut.

Getting those pixels right is a separate problem called **alpha matting**, and it is where quality differences between tools show up:

- **Hair.** Thousands of strands thinner than one pixel each. A hard mask cuts them off and leaves a helmet-like silhouette; a good soft mask preserves partial transparency and keeps them looking like hair.
- **Fur and feathers.** Same problem, more of it.
- **Glass, smoke, water, veils.** Genuinely semi-transparent, the "correct" alpha is somewhere in the middle, and models trained mostly on opaque subjects tend to guess wrong.
- **Motion blur.** A blurred hand has no defined edge to find.

## What predicts a good result

**Contrast between subject and background.** A dark jacket against a dark wall is hard for the same reason it is hard for you, there is little signal to separate them.

**A single, clear subject.** Models are typically trained on images with one salient foreground object. A group photo, or a person holding a bicycle, produces inconsistent decisions about what counts as subject.

**In-focus edges.** Shallow depth of field that blurs the subject's outline removes the information the model needs.

**Ordinary subject matter.** These models are trained heavily on people, animals, products and vehicles. Unusual subjects, machinery, abstract objects, cluttered scenes, fall outside the distribution and results degrade.

**Reasonable resolution.** Most models process at a fixed internal resolution (often around 320–1024 px) and the mask is scaled back up. Very fine detail in a huge image can be lost simply because it never survived the downscale.

## Getting better output

1. **Crop before removing.** Less background clutter means fewer chances to be wrong, and the subject occupies more of the model's internal resolution.
2. **Improve contrast first** if the subject is poorly separated from its surroundings.
3. **Always save as PNG or WebP.** JPEG has no alpha channel, export a cut-out as JPEG and the transparency is flattened to white or black, and the work is lost.
4. **Check on both light and dark backgrounds.** Fringing from the original background colour is invisible against white and glaring against black.
5. **Retouch rather than re-run.** If 95% is right, fixing the remaining edge by hand is faster than hunting for a better model.

## Running it on your own device

This is the part that has genuinely changed. These models are a few tens of megabytes and can be exported to ONNX and run in a browser through WebAssembly or WebGPU, using your own CPU or graphics card rather than a rented one.

That is what NextTool's [AI background remover](/tool/ai-bg-remover) does. The first run downloads the model, then every image is processed locally. It is slower than a datacentre GPU and it means your product photography, portraits and personal pictures never get uploaded to a service that may retain them for training.

Expect a few seconds per image after the model loads, and expect a modern browser to be required, WebGPU support makes a substantial difference to speed.`,
  },

  {
    slug: 'optimise-images-for-web-performance',
    title: 'Image optimisation for web performance: the four things that matter',
    description: 'Images are usually the largest thing on a page. Format, dimensions, layout stability and loading strategy account for nearly all of the gain.',
    excerpt: 'Most pages ship images several times larger than they display, in a format from 1992, with no dimensions set. Fixing those three things is most of the work.',
    category: 'image',
    tags: ['performance', 'web', 'core-web-vitals'],
    published: '2026-09-05',
    relatedTools: ['image-compressor', 'batch-resize', 'image-convert', 'svg-converter'],
    takeaways: [
      'Serving an image far larger than it is displayed is the single biggest waste, and the most common one.',
      'Always set width and height, because without them the page reflows as images load and that is a layout shift penalty.',
      'Load the hero image eagerly and lazy-load everything below the fold. Lazy-loading the hero makes the page measurably slower.',
      'Modern formats save real bytes, but only after the dimensions are already right.',
    ],
    body: `On a typical content page, images account for the majority of transferred bytes. They are also the element most likely to be the Largest Contentful Paint, the metric that decides whether a page feels fast. Four decisions cover almost all of the available improvement.

## 1. Serve the right dimensions

The most common waste in web images is enormous by percentage and trivial to fix: shipping a 3000-pixel-wide image into a 700-pixel-wide slot.

The browser has to download all of it, decode all of it, and then throw most of it away. On a phone connection that is seconds of waiting for pixels that are never displayed.

Target roughly **twice the CSS display width** to look sharp on high-density screens, and no more. An image displayed at 700 px should be around 1400 px wide. Beyond 2× the returns are effectively zero and the cost is linear.

For images that display at different sizes on different screens, \`srcset\` and \`sizes\` let the browser choose:

\`\`\`html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1600.jpg 1600w"
  sizes="(max-width: 700px) 100vw, 700px"
  width="800" height="533"
  alt="Description of the image"
>
\`\`\`

## 2. Serve a modern format

At equivalent perceptual quality, WebP is typically 25–35% smaller than JPEG, and AVIF is smaller still. On an image-heavy page this is the difference between a 4 MB and a 1.5 MB page.

Serve modern formats with a fallback so nothing breaks:

\`\`\`html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" width="800" height="533" alt="Description">
</picture>
\`\`\`

The browser takes the first format it understands. Older clients get the JPEG.

And for anything that is a logo, icon, chart or diagram: **use SVG**. It is usually a couple of kilobytes, stays sharp at every zoom level, and can be styled with CSS.

## 3. Always set width and height

An image without dimensions has no reserved space in the layout. When it loads, everything below it jumps down. That is Cumulative Layout Shift, it is measurably annoying, and it is the reason you sometimes tap the wrong link on a page that is still loading.

Setting the \`width\` and \`height\` attributes lets the browser compute the aspect ratio and reserve the correct box before a single byte of image data arrives. Your CSS can still size the element responsively, the attributes are used for the ratio, not as a fixed size.

This costs nothing and is one of the highest-value one-line fixes available.

## 4. Load the right images at the right time

- **Lazy-load below-the-fold images** with \`loading="lazy"\`. The browser defers them until the user scrolls near them.
- **Do not lazy-load the hero image.** It is the LCP element; deferring it directly delays the metric you are trying to improve. Mark it \`fetchpriority="high"\` instead.
- **Preload the LCP image** if it is discovered late, for example, if it is set as a CSS background.
- **Avoid CSS background images for meaningful content.** They are discovered later in the parse, they cannot be lazy-loaded intelligently, and they carry no alt text.

## The things that are not worth the effort

- **Shaving the last 5% with an exotic encoder** while shipping a 3000 px image into a 700 px slot. Fix the big thing first.
- **Quality 95.** Nobody can see it, and it can double the file size versus quality 80.
- **Base64-inlining large images.** It adds roughly 33% overhead, cannot be cached separately, and blocks the document. Reasonable for a 200-byte icon, harmful for a photograph.

## A workable pipeline

1. Start from the highest-quality original.
2. Resize to the largest size you will actually serve, and generate two or three smaller variants for \`srcset\`.
3. Export AVIF or WebP, plus a JPEG fallback, at quality ~80.
4. Strip metadata, EXIF blocks and embedded colour profiles can be hundreds of kilobytes.
5. Set \`width\`, \`height\` and \`alt\` on every image.
6. Lazy-load everything except the hero.

Steps 2 to 4 are batch work. [Bulk resizing](/tool/batch-resize), [format conversion](/tool/image-convert) and [compression](/tool/image-compressor) all run locally in the browser, which for unreleased design work or client photography is the difference between a routine task and a data-handling decision.`,
  },

  {
    slug: 'favicon-sizes-and-formats',
    title: 'Favicons: the sizes that still matter and the ones that do not',
    description: 'Browsers, phones and search results all want a different icon. Here is the short list that actually covers them without shipping fourteen files.',
    excerpt: 'The advice online still lists a dozen icon sizes from 2014. Four files cover essentially everything today, and one of them is not an icon at all.',
    category: 'image',
    tags: ['favicon', 'icons', 'svg'],
    published: '2026-09-10',
    relatedTools: ['ico-generator', 'svg-converter', 'image-resize', 'image-convert'],
    takeaways: [
      'Four files cover modern browsers: an SVG, a 32px PNG, a 180px Apple touch icon and a 512px PNG for installs.',
      'favicon.ico is still worth shipping because bare requests for /favicon.ico happen with no HTML involved.',
      'A .ico is a container holding several sizes, which is why it is not simply a renamed PNG.',
      'Design the 16px version separately. A detailed logo shrunk to 16px becomes a smudge.',
    ],
    body: `Search for favicon sizes and you will find checklists of fourteen files, most of which exist for devices discontinued a decade ago. The real list is much shorter, and one entry on it is a vector.

## What you actually need

| File | Size | What it is for |
|---|---|---|
| \`favicon.svg\` | vector | Modern browsers, scales to any tab size, can adapt to dark mode |
| \`favicon.ico\` | 16 and 32 | Requested directly by browsers and crawlers, no HTML needed |
| \`apple-touch-icon.png\` | 180×180 | iOS home screen |
| \`icon-512.png\` | 512×512 | Android install prompts, PWA manifests, and what search results use |

That is it. The long lists are legacy.

## Why .ico is not just a renamed PNG

An ICO file is a container. It holds several images at different sizes, and the browser picks the one it needs. That is why you cannot rename \`icon.png\` to \`favicon.ico\` and expect it to work reliably, and why an [ICO generator](/tool/ico-generator) takes one image and produces a multi-size file rather than simply changing the extension.

It is also still worth shipping in 2026 for one specific reason: browsers and crawlers request \`/favicon.ico\` at the site root directly, with no HTML link tag involved. If the file is absent you get a 404 in your logs on every cold visit, and some contexts will show a blank icon even though your SVG is declared perfectly.

## The SVG is the one doing most of the work

A single SVG covers every size a browser tab needs, because it is drawn at whatever resolution is asked for. It is usually the smallest file of the set.

It has one property the raster icons cannot match:

\`\`\`html
<style>
  @media (prefers-color-scheme: dark) {
    .logo-mark { fill: #fff; }
  }
</style>
\`\`\`

Media queries inside the SVG let the icon respond to the browser's theme, so a dark logo stops disappearing against a dark tab strip. This is worth doing and almost nobody does it.

The catch is that the SVG must be self-contained. No external stylesheet, no remote font, no linked image. If the icon uses text, convert it to paths, because the font will not be available.

> [!TIP]
> If your logo exists only as a raster image, [SVG conversion](/tool/svg-converter) goes the other way, rasterising a vector at a chosen resolution. That is how you produce the 180px and 512px PNGs from one source rather than resizing a JPEG four times and compounding artefacts at each step.

## Design the small one separately

This is the part that gets skipped, and it is the part that decides whether the icon is any good.

At 16 pixels you have 256 pixels in total. A logo with a wordmark, a gradient and a thin outline turns into a grey smudge. Every recognisable favicon solves this the same way: a single bold shape, high contrast, no text beyond perhaps one letter.

So do not resize your logo to 16px and accept the result. Look at it at actual size, and if it is unreadable, draw a simplified mark for the small sizes. The SVG can carry the detailed version for large rendering while the ICO carries the simplified one.

Two practical points while you are there. Keep some padding inside the canvas, because browsers crop tight to the edges and a shape touching the boundary looks cramped. And use a transparent background rather than white, unless the mark genuinely needs a plate behind it.

## Wiring it up

\`\`\`html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
\`\`\`

Browsers that understand SVG use it; the rest fall back to the ICO. The 512px PNG is referenced from the manifest rather than from a link tag.

> [!WARNING]
> Favicons are cached aggressively and often outside the normal page cache, so a changed icon can persist for days. If you need to force it, change the filename rather than the file.

## Producing the set

From one high-resolution square source:

1. Export or convert to SVG, and make sure it has no external dependencies.
2. Produce 180×180 and 512×512 PNGs by [resizing](/tool/image-resize) the source, not by upscaling a small file.
3. Build the [ICO](/tool/ico-generator) with 16 and 32 included, from the simplified mark if you drew one.
4. Look at the 16px version at 16px on both a light and a dark tab strip.

Step four is the only one that is not mechanical, and it is the one that matters. All the mechanical parts run in the browser here, which for an unreleased brand is the difference between a build step and uploading your logo to a stranger's server before launch.`,
  },

  {
    slug: 'putting-things-on-top-of-images',
    title: 'Watermarks, annotations, memes and collages: drawing on an image',
    description: 'Four tools that all composite something onto a picture, and the surprisingly different things they are each good for.',
    excerpt: 'Whether you are marking a proof, redacting a screenshot or building a comparison, you are doing the same operation with very different stakes.',
    category: 'image',
    tags: ['watermark', 'annotation', 'collage'],
    published: '2026-09-11',
    relatedTools: ['image-watermark', 'image-draw', 'image-collage', 'meme-generator', 'drawing'],
    takeaways: [
      'Compositing is destructive. The output is a flat picture, so keep the original separately.',
      'Drawing a black box over a screenshot is real removal, unlike the same action in a PDF, because the pixels are replaced.',
      'A watermark at the edge is cropped off in seconds. Across the middle at low opacity is the version that survives.',
      'For a collage, resize the inputs to a common dimension first, or the layout engine will do it for you and badly.',
    ],
    body: `Adding a watermark, annotating a screenshot, making a meme and assembling a collage are the same operation underneath: draw something on top of an image and flatten the result to new pixels. What separates them is what happens if you get it wrong.

## Compositing is one-way

Every one of these produces a flat raster. There are no layers in a JPEG or a PNG. Once the text is drawn, those pixels are the text, and there is no undo beyond starting again from the original.

So the rule that covers all four: **keep the original.** Export the annotated version under a new name. This sounds obvious and is the single most common regret, usually discovered when someone asks for the same screenshot without the red circle.

## Watermarks, and what they are worth

A [watermark](/tool/image-watermark) is a claim of provenance, not a protection. Anyone determined can remove one, and modern inpainting makes it easier than it used to be. What a watermark reliably does is stop casual reuse and make the source obvious when an image travels without its caption.

Given that, placement is the whole decision.

- **A corner mark** is tidy and removed by cropping in about three seconds.
- **Across the middle at 10 to 20% opacity** is intrusive and actually survives, which is why proofing and stock-preview watermarks all look like that.
- **Tiled across the whole image** is the most resistant and the least pleasant to look at.

Pick based on whether the image is a portfolio piece you want seen, or a proof you do not want used before payment. Those want opposite answers.

For a logo watermark, use a PNG with real transparency. A logo on a white rectangle looks like a sticker.

## Annotating, and the redaction difference

[Drawing on an image](/tool/image-draw) is for showing someone where to look: an arrow at the broken button, a box around the error, a highlight on the clause that matters.

There is one important difference from doing the same thing in a document.

> [!NOTE]
> Drawing a filled black rectangle over text in an image genuinely removes it. The pixels are replaced and the original values are gone. This is the opposite of a PDF, where a black rectangle is drawn over text that remains selectable underneath.

So a screenshot is one of the few places where a black box is real redaction. Two caveats still apply. Blurring and pixellation are not the same as a solid fill, and both have been reversed on text in practice, so use an opaque block rather than a blur for anything that matters. And check the rest of the frame: browser tabs, notification banners, bookmark bars and the taskbar clock leak more than people expect.

If you need a blank canvas rather than an image to mark up, the [drawing board](/tool/drawing) is the same idea without a photograph underneath, which is often the faster way to sketch a layout or an architecture diagram for someone.

## Memes are a format, not a joke

The [meme generator](/tool/meme-generator) exists because the Impact-white-with-black-outline convention is a genuine legibility solution. Heavy condensed type with a thick stroke stays readable over any background, at any size, at any compression level. That is why it survived.

The practical points are the same ones that apply to any text over an image: keep the stroke, do not go below about 24px at output size, and remember that the image will be recompressed by whatever platform it lands on, so export at a generous quality.

## Collages want equal inputs

A [collage](/tool/image-collage) is a grid of images composited onto one canvas, and the single thing that decides whether it looks deliberate is consistency of the inputs.

Mixed aspect ratios are the usual problem. Given a 4:3 photo, a 16:9 screenshot and a square crop, any layout engine has to either letterbox, stretch or crop, and it will choose without asking.

> [!TIP]
> [Resize or crop the inputs to a common aspect ratio first](/tool/image-resize). Ten seconds of preparation removes the entire class of "why is that one squashed" problems.

Two other things worth setting deliberately: the gap between cells, because zero gap reads as one confusing image, and the output resolution, because a collage of six 4000px photos produces an enormous file unless you say otherwise. A comparison grid for a document or an email rarely needs more than about 2000px on its long edge.

## What they share

All five are canvas operations: load pixels, draw on top, export. That is something a browser does natively and quickly, with no server involved.

Which matters more than it sounds, because the images people annotate are disproportionately screenshots of things that should not be public, and the images people watermark are disproportionately unpublished work. Both are poor candidates for uploading to a free editor in exchange for a download link.`,
  },

  {
    slug: 'rotate-flip-and-sharpen',
    title: 'Rotate, flip and sharpen: the small fixes, and which ones cost quality',
    description: 'Three corrections that look equally trivial. One is free, one is free, and one permanently alters your image and cannot be undone.',
    excerpt: 'Your phone photo appears sideways on the web but upright in the gallery. Nothing is broken, and the fix is one byte.',
    category: 'image',
    tags: ['rotate', 'exif', 'sharpen'],
    published: '2026-09-12',
    relatedTools: ['image-rotate', 'image-flip', 'image-sharpen', 'image-adjust'],
    takeaways: [
      'A photo that looks sideways on the web is usually upright with an EXIF orientation tag that something ignored.',
      'Rotating by 90 degree steps is lossless. Rotating by an arbitrary angle resamples every pixel.',
      'Sharpening adds contrast at edges. It cannot recover detail that was never captured, and it is not reversible.',
      'Sharpen last, after resizing, and only enough to counteract what the resize softened.',
    ],
    body: `A photo that looks perfectly upright in your gallery appears rotated 90 degrees when you put it on a web page. The file is not corrupt and nothing resized it. It has an orientation tag, and something along the way ignored it.

## The EXIF orientation tag

Phone cameras do not rotate the sensor data when you turn the phone. They record the pixels in whatever order the sensor produced them and write an EXIF tag saying which way up the result should be displayed. There are eight possible values covering rotation and mirroring.

Well-behaved software reads the tag and displays accordingly. Your gallery app does. Some image libraries, older CMS uploaders and some canvas code do not, and they show the raw pixel order.

This produces the familiar situation where an image is upright everywhere except the one place it needs to be.

> [!NOTE]
> The fix is to bake the rotation in: physically reorder the pixels and reset the tag to 1. After that the image looks the same everywhere, because there is no longer a tag for anything to disagree about.

Stripping EXIF without rotating first is the trap. It removes the orientation tag and leaves the raw pixels, so an image that looked fine in a viewer that honoured the tag is now permanently sideways for everyone. If you are removing [metadata for privacy](/tool/image-metadata), rotate first.

## What rotation costs

[Rotating](/tool/image-rotate) by 90, 180 or 270 degrees is lossless. Pixels are moved to new coordinates and none are invented or discarded. For JPEG specifically this can be done without re-encoding at all, so there is no generation loss. Rotate a photo a hundred times in right angles and the pixel data is identical.

Rotating by an arbitrary angle, say 3 degrees to straighten a horizon, is a completely different operation. There is no one-to-one mapping between source and destination pixels, so every output pixel is interpolated from several input pixels. The image is softened everywhere, and the corners have to be either cropped or filled. Do it once, from the original, and not repeatedly.

[Flipping](/tool/image-flip) is always lossless in both directions. It is worth remembering that a flip is not a rotation: a mirrored image is a genuinely different image, which matters for anything containing text, a clock face, a road sign or a person's parting.

## Sharpening does not add detail

This is the one that costs something, and it is worth being precise about what it does.

Sharpening finds edges, places where adjacent pixels differ in brightness, and exaggerates the difference by making the light side lighter and the dark side darker. The eye reads increased local contrast as increased detail.

No information is added. A blurred photograph has lost detail that is not in the file, and no amount of sharpening recovers it. What sharpening does is make the detail that survived more visible, at the cost of also amplifying noise and compression artefacts, which live at exactly the same scale.

Push it too far and you get the telltale halo, a bright outline tracing every edge, which is unmistakable and cannot be removed afterwards.

So the useful cases are narrow and real:

- **After resizing down.** Downscaling averages pixels together and softens edges. A light sharpen restores the apparent crispness the resize removed. This is the single most legitimate use.
- **Counteracting a soft lens or a slight focus miss.** Modest improvement.
- **Scanned documents.** Increasing edge contrast genuinely helps OCR read the characters.

And the case it does not fix: motion blur or significant missed focus. That detail was never recorded.

## The order that matters

Sharpening last is not a preference, it is a consequence of how the operations interact.

1. Rotate and flip, since these are free.
2. Crop.
3. [Adjust brightness and contrast](/tool/image-adjust) if the exposure needs it.
4. Resize to the final dimensions.
5. [Sharpen](/tool/image-sharpen), lightly, to taste.
6. Export and compress.

Sharpening before resizing means the resize averages away the effect while keeping the amplified noise, which is the worst of both. Sharpening before compression is correct, because the sharpened edges are what you want the encoder to preserve.

> [!WARNING]
> Sharpening is not reversible and it compounds. Sharpening an already-sharpened image is how photographs end up with white outlines around every object. Always work from the original rather than from a previously exported copy.

All of these are pixel operations on data your browser already has in memory, which is why none of them here require an upload. For a photograph of a document, a child, or an unreleased product, that is the whole argument.`,
  },

  {
    slug: 'data-uris-when-to-inline-an-image',
    title: 'Base64 images: when inlining helps and when it costs you',
    description: 'Turning an image into a data URI removes a request and adds 33% to its size. Knowing which trade matters tells you when to do it.',
    excerpt: 'A data URI embeds the picture in the markup. That is occasionally the right call and usually a way to make a page slower.',
    category: 'image',
    tags: ['base64', 'data-uri', 'performance'],
    published: '2026-09-12',
    relatedTools: ['image-to-base64', 'base64-to-image', 'image-compressor', 'svg-converter'],
    takeaways: [
      'Base64 encodes 3 bytes as 4 characters, so an inlined image is always about 33% larger than the file.',
      'Inlined images cannot be cached separately, so a data URI in a stylesheet is re-downloaded whenever that stylesheet changes.',
      'Worth it for tiny icons, single-file documents and email signatures. Not worth it for photographs.',
      'An SVG inlined as plain markup beats the same SVG base64-encoded, because it compresses and does not pay the 33%.',
    ],
    body: `A data URI puts the image inside the document:

\`\`\`html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...">
\`\`\`

There is no separate file and no second request. The picture is part of the markup. That sounds like a straightforward win and it is a trade, so it is worth knowing what is on each side.

## The 33% is not negotiable

Base64 represents binary data using 64 safe ASCII characters. Each character carries 6 bits, so three bytes of input become four characters of output. That is a fixed 33% expansion, plus padding, plus the \`data:image/png;base64,\` prefix.

A 40 KB PNG becomes about 54 KB of text. This is not a quality setting or an implementation detail, it is arithmetic, and no encoder avoids it.

Gzip claws some of it back, because base64 text is more compressible than the binary was, but not all of it. Assume you are paying real weight.

## What you get for it

**One fewer request.** This mattered enormously under HTTP/1.1, where browsers allowed about six connections per host and every request queued. It matters far less under HTTP/2 and HTTP/3, where requests are multiplexed over one connection. A lot of "inline your images" advice is from the earlier era and has not been revisited.

**No flash of missing image.** The picture is present the moment the markup is parsed. For a logo above the fold, that can be the difference between a clean first paint and a visible pop-in.

**A genuinely self-contained file.** This is the strongest argument and the one that survives. An HTML file, an email signature or an exported report with inlined images is one file that works with no network, no relative paths and no broken-image icons.

## What it costs

**Caching stops working properly.** This is the big one. A separate image file is cached once and reused across every page and every deploy. An image inlined into a stylesheet or a page is cached only as part of that file, so changing one line of CSS re-downloads every image in it.

**It blocks rendering.** A data URI in your CSS makes the stylesheet bigger, and the stylesheet is render-blocking. You have moved bytes from a resource the browser could fetch in parallel into one it must finish before painting.

**No lazy loading.** \`loading="lazy"\` cannot defer something that is already in the markup. Inline twelve product images and you have downloaded all twelve, including the ones nobody scrolls to.

**The markup becomes unreadable.** A few thousand characters of base64 in the middle of a template is a real cost to whoever maintains it.

## A usable rule

| Case | Inline? |
|---|---|
| Icon under about 2 KB, used once | Yes |
| Logo above the fold | Maybe, measure it |
| Email signature image | Yes, remote images are blocked by default |
| Single-file HTML report or export | Yes, that is the point |
| Photograph | No |
| Anything repeated across pages | No, let it cache |
| Anything below the fold | No, let it lazy load |

The rough threshold people settle on is a couple of kilobytes. Above that, the caching loss outweighs the saved request.

> [!TIP]
> For SVG specifically, do not base64 it. Paste the \`<svg>\` element straight into the markup. It is smaller than the encoded version, it compresses well because it is text, it inherits \`currentColor\`, and it can be styled with CSS. If you only have a raster logo, an [SVG converter](/tool/svg-converter) handles the rasterising direction when you need PNG output instead.

## Going the other way

Decoding is the more common everyday need. You are reading an API response, a saved email, a CSS file or a JSON payload and there is a wall of base64 that is supposedly an image. Running it through a [Base64 to image](/tool/base64-to-image) decoder tells you immediately whether it is a valid image and what it actually depicts.

Two things that trip people up when decoding. The \`data:image/png;base64,\` prefix is part of the URI, not part of the base64, so a decoder expecting raw base64 needs it removed. And base64 from a URL or a JWT is often **base64url**, which uses \`-\` and \`_\` in place of \`+\` and \`/\`; a standard decoder will reject it until those are swapped back.

## Before you encode anything

Compress the image first. Encoding is the last step, not the first.

Inlining a 200 KB unoptimised PNG produces 270 KB of markup. [Compressing it](/tool/image-compressor) to 20 KB first produces 27 KB. The 33% penalty applies to whatever you hand it, so every byte you remove beforehand is removed with interest.

Both [encoding](/tool/image-to-base64) and [decoding](/tool/base64-to-image) are pure string operations on data the browser already holds, which is why neither needs an upload here. That is the useful property when the image in question is an unreleased logo or a screenshot pulled out of an internal API response.`,
  },

  {
    slug: 'cropping-well',
    title: 'Cropping well: aspect ratios, the rule nobody needs, and safe areas',
    description: 'Cropping is the cheapest way to improve a photograph and the easiest way to have it mangled by a platform that crops it again.',
    excerpt: 'Every platform re-crops your image to its own ratio. If you do not decide where the subject sits, an algorithm will decide for you.',
    category: 'image',
    tags: ['crop', 'aspect-ratio', 'editing'],
    published: '2026-09-13',
    relatedTools: ['image-crop', 'image-editor', 'image-resize', 'batch-resize'],
    takeaways: [
      'Cropping discards pixels permanently. Resizing rescales them. Doing both in the wrong order loses resolution you needed.',
      'Crop to the aspect ratio the destination uses, or the destination will crop it for you and probably badly.',
      'Keep the subject away from the edges so a re-crop to a different ratio still works.',
      'Crop before resizing, because the crop decides how many pixels you are scaling from.',
    ],
    body: `You upload a carefully composed photo. The site shows a square thumbnail with the top of someone's head missing. Nothing malfunctioned: the platform needed a square, your image was not one, and something had to choose what to throw away.

## Cropping and resizing are different operations

**Cropping** selects a rectangle and discards everything outside it. The pixels inside are untouched. A 4000×3000 image cropped to the middle half is 2000×1500 of the original pixels, at full quality.

**Resizing** keeps the whole frame and changes the pixel dimensions, interpolating new values from the old ones.

The order matters, and it is the source of a common mistake. Crop first, then resize. If you resize a 4000px image down to 1000px and then crop to a quarter of it, you have 250px of usable image. Cropping first gives you 1000px from the same region.

> [!WARNING]
> Both are destructive on export. Once you save the cropped file, the discarded pixels are gone. Keep the original and export crops under new names, because "can we see a bit more to the left" is the most predictable request there is.

## Aspect ratio is the decision that matters

The ratio is what every platform actually cares about, because each one re-crops to fit its layout.

| Where | Ratio |
|---|---|
| Instagram feed | 1:1 or 4:5 |
| Stories and Reels | 9:16 |
| X / Twitter timeline | 16:9 |
| LinkedIn share | 1.91:1 |
| Open Graph preview | 1.91:1 |
| YouTube thumbnail | 16:9 |
| Most print photos | 3:2 |

If you supply the right ratio, the platform displays your framing. If you do not, it crops, usually from the centre or using a saliency model that guesses where the subject is. Those guesses are the reason for the decapitated thumbnails.

This has a practical consequence for anything going to more than one destination: **leave margin around the subject.** An image where the face fills the frame edge to edge cannot survive being re-cropped to a different ratio. One with breathing room can be cropped to square, portrait or landscape and still work. Design for the crop you did not choose.

For Open Graph images specifically, keep text well inside the middle, because previews get cropped differently on every platform and the corners are the first thing to go.

## Composition, briefly

The rule of thirds gets taught as though it were a law. It is a starting heuristic: putting the subject a third of the way across often looks more considered than dead centre, and centring is frequently better for symmetry, portraits and product shots.

The things that reliably matter more:

- **Straighten the horizon.** A tilted horizon reads as a mistake in a way that unconventional framing does not.
- **Watch what is behind the subject.** Cropping can remove the pole apparently growing out of someone's head.
- **Cut away dead space.** Most amateur photographs improve from a tighter crop, because the subject is smaller in the frame than the photographer remembers it being.
- **Do not cut at a joint.** Cropping a person at the wrist, ankle or neck looks amputated. Crop mid-forearm, mid-shin.

## Resolution after cropping

Cropping reduces pixel dimensions, and that is where a crop quietly becomes unusable.

A 12 megapixel phone photo is about 4000×3000. Crop to 25% of the area and you have 2000×1500, which is still fine for the web and marginal for print at A4. Crop to 5% and you have a 900×675 image that looks soft the moment it is displayed at any size.

The rough guides: 1000 to 2000px on the long edge for web use, and around 300 DPI at final print size for print, which for a 6×4 inch print means about 1800×1200.

Upscaling afterwards does not recover anything. It interpolates, which makes the image bigger and no more detailed.

## Doing it in one pass

For a single image where you also want to adjust exposure or straighten, the [image editor](/tool/image-editor) keeps crop, rotate and adjustment in one place, which avoids the export-reimport-export cycle that costs quality each time with JPEG.

For a set, the sequence that works is:

1. Crop each one individually, because framing is the part that cannot be automated.
2. [Batch resize](/tool/batch-resize) them to a common dimension.
3. Compress once, at the end.

Step one is unavoidably manual. Steps two and three are exactly the kind of repetitive work worth batching.

[Cropping](/tool/image-crop), [resizing](/tool/image-resize) and [batch resizing](/tool/batch-resize) here all run on the canvas in your own browser. For photographs of people, which is most of what gets cropped, not uploading them to an editing service in order to trim 200 pixels off the top is the sensible default.`,
  },

  {
    slug: 'passport-and-id-photo-specs',
    title: 'Getting a passport or visa photo to pass the checker',
    description: 'Photo rejections are nearly always dimensions, head ratio or background. Each one is measurable before you submit.',
    excerpt: 'Portals reject photos for reasons they rarely explain. Four measurements account for almost all of it, and you can check every one yourself.',
    category: 'image',
    tags: ['photo', 'resize', 'crop', 'passport'],
    published: '2026-09-09',
    relatedTools: ['image-crop', 'image-resize', 'image-convert', 'image-compressor'],
    takeaways: [
      'Head height as a proportion of the frame is the specification people miss, and it is the most common rejection.',
      'Crop to the required aspect ratio first, then resize to the pixel dimensions. The other order wastes resolution.',
      'A file-size cap is met by lowering JPEG quality, not by shrinking dimensions below the stated minimum.',
      'Never upscale. If the source is smaller than the required dimensions, retake the photo.',
    ],
    body: `You upload a photo to a visa portal and it comes back rejected, with a message that says the photo does not meet requirements and nothing else. The photo looks fine. It probably is fine as a photograph and wrong as a document.

Almost every rejection comes down to four measurable things, and all four can be checked before you submit.

## The four that matter

**Aspect ratio and physical size.** Most schemes specify millimetres: 35x45mm is common across the UK, EU and India, while the US uses a square 51x51mm. Get this wrong and nothing else matters, because the checker rejects on shape before it looks at anything else.

**Head height as a proportion of the frame.** This is the one people miss. A typical requirement is that the head, from chin to the top of the hair, occupies 70 to 80 percent of the image height, with a specific gap above it. A photo taken from too far away fails even at perfect pixel dimensions, and a selfie at arm's length usually fails the other way.

**Pixel dimensions.** Portals set a minimum and often a maximum. 600x750 is a common floor for 35x45mm.

**File size.** Frequently capped at something like 240KB or 1MB, and occasionally given a minimum as well.

| Scheme | Physical | Typical pixels | Head height |
|---|---|---|---|
| UK / EU / India | 35 x 45 mm | 600 x 750 | 70-80% |
| United States | 51 x 51 mm | 600 x 600 | 50-69% |
| Schengen visa | 35 x 45 mm | 600 x 750 | 70-80% |

Always read the specific scheme's own page. These vary and they change.

## The order to do it in

This sequence matters, because the other way round throws away resolution you cannot get back.

1. **Start from the largest original you have.** Not a copy already resized for a messaging app.
2. **[Crop](/tool/image-crop) to the aspect ratio first**, positioning the head so the proportions are right. Cropping is lossless, so every pixel inside the selection survives.
3. **[Resize](/tool/image-resize) to the required pixel dimensions.** You are now scaling from the largest possible source.
4. **[Convert](/tool/image-convert) to JPEG** if it is not already. Most portals accept only JPEG.
5. **[Compress](/tool/image-compressor) to fit the file-size cap**, by lowering quality rather than dimensions.

> [!WARNING]
> Never upscale. If the original is 400x500 and the requirement is 600x750, enlarging adds no detail and many checkers detect the interpolation. Retake the photo instead.

## Meeting a size cap without failing the dimension check

This is where people get stuck in a loop. The photo is 600x750 as required, the file is 900KB against a 240KB cap, so they shrink the dimensions, and now it fails the minimum.

File size and pixel dimensions are separate levers. Keep the dimensions exactly as specified and reduce **JPEG quality** instead. Dropping from quality 95 to 75 typically takes a photo to a third of its size with no visible change here, because a passport photo is flat and evenly lit with very little fine detail for the encoder to lose.

If quality 70 still will not fit, the original is probably a very large phone photo carrying a lot of sensor noise. Resizing to the required dimensions **before** compressing usually solves it, because you are then compressing 450,000 pixels rather than twelve million.

## The things no tool can fix

Worth knowing before you spend twenty minutes cropping:

- **Background.** Plain, light, uniform, no shadow. A shadow cast on the wall behind you is a rejection, and it is the most common one after head ratio.
- **Expression and eyes.** Neutral, mouth closed, both eyes open and visible, looking straight at the camera.
- **Glasses.** Many schemes now prohibit them outright. Where allowed, no glare and no frame crossing the eyes.
- **Lighting.** Even on the face, no hotspot, no red-eye.
- **Recency.** Usually within the last six months.

Resizing does not change any of these. If the background has a shadow, take the photo again facing a plain wall with the light coming from in front of you rather than above.

> [!TIP]
> Stand about a metre away from a plain wall in daylight so no shadow falls on it, with the camera at eye level roughly two metres back. Zoom in rather than stepping closer: a close-up lens distorts facial proportions, which is why arm's-length selfies look wrong even when every measurement passes.

## Check before you upload

Confirm the pixel dimensions, file size and format match what the portal asked for, then measure the head height against the frame height and compare it to the stated percentage.

Every step above is a pixel operation your browser can do. That is worth having here for an obvious reason: a passport photo is an identity document, and uploading one to a free resizing service in order to make it smaller hands your face, and your intent, to an unknown party before the official portal ever sees it.`,
  },

  {
    slug: 'social-preview-images',
    title: 'Why your link preview looks wrong when you share it',
    description: 'Open Graph images get cropped differently by every platform. Designing for the safe area is what stops your title being cut in half.',
    excerpt: 'You set an image, share the link, and the preview crops your logo off. The image was right; the safe area was not.',
    category: 'image',
    tags: ['open-graph', 'social', 'images'],
    published: '2026-09-09',
    relatedTools: ['image-resize', 'image-crop', 'image-convert', 'image-compressor'],
    takeaways: [
      '1200x630 is the right default, but every platform re-crops it, so keep text well inside the middle.',
      'og:image needs an absolute URL. A relative path silently produces no preview at all.',
      'Previews are cached hard, so a corrected image usually needs a new filename before it shows up.',
      'Use JPEG or PNG rather than WebP here, because social scrapers are less consistent about it than browsers.',
    ],
    body: `You share a link in a group chat. The preview shows the middle third of your carefully composed image, the headline cut off at both ends, and a logo half out of frame. The same link on another platform looks fine.

Nothing is broken. Each platform crops your image to its own shape, and they do not agree on what that shape is.

## One image, several crops

The usual advice is to supply a 1200x630 image, roughly 1.91:1, and that is the right default. What the advice leaves out is that almost nothing displays it at that ratio.

| Where | Effective shape |
|---|---|
| Facebook / LinkedIn feed | Close to 1.91:1, as supplied |
| X large card | 2:1, so top and bottom are trimmed |
| X summary card | Square, so most of the sides go |
| WhatsApp, Telegram, Slack | Small, often near-square thumbnail |
| Discord | Varies by layout |

So **your image has a safe area, and it is the middle.** Anything near an edge should be decorative. Text, logos and faces need to sit inside a central region of roughly 1000x500 within your 1200x630, leaving a margin on every side that any platform can trim without taking something you needed.

This one change fixes most bad previews and costs nothing.

## The tags, and the mistake that kills them

\`\`\`html
<meta property="og:title" content="Page title" />
<meta property="og:description" content="One or two sentences." />
<meta property="og:image" content="https://example.com/og.jpg" />
<meta property="og:url" content="https://example.com/page" />
<meta name="twitter:card" content="summary_large_image" />
\`\`\`

> [!WARNING]
> \`og:image\` must be an absolute URL, with scheme and domain. A relative path like \`/og.jpg\` is the most common reason a preview shows no image, and it will look correct in your own browser while failing for every scraper.

Two more that catch people. The image must be reachable without a login or a cookie, because the scraper is an anonymous request. And if the site is behind a staging password, no preview will ever generate, which is worth remembering before you start debugging the tags.

## Caching is why your fix does not appear

Every platform caches previews aggressively, some for weeks. You fix the image, reshare, and the old preview comes back.

The reliable fix is to **change the filename**, so \`og.jpg\` becomes \`og-v2.jpg\`, and update the tag. A new URL has no cache entry. Facebook and LinkedIn both publish debuggers that force a re-scrape and those work, but a filename change works everywhere, including the chat apps that have no debugger at all.

## Format and weight

Use JPEG for photographic cards and PNG when there is text or flat colour, which for a typical preview with a headline on it usually means PNG.

Avoid WebP and AVIF here specifically. Browsers handle them fine; social scrapers are less consistent, and a preview that fails on one platform is worse than a file that is 40KB larger everywhere.

Keep it under about a megabyte. Some scrapers give up on large images and fall back to whatever else they can find on the page, which is frequently your favicon.

> [!TIP]
> Build the card at 2400x1260 and [resize](/tool/image-resize) down to 1200x630 for export. Text rendered large and scaled down is noticeably crisper than text rendered directly at the smaller size, and the downscale hides any rough edges.

## A repeatable setup

1. Design at 2400x1260, keeping everything that matters inside the central 2000x1000.
2. [Crop](/tool/image-crop) to exactly 1.91:1 so no platform has to guess at the edges.
3. [Resize](/tool/image-resize) to 1200x630.
4. [Convert](/tool/image-convert) to PNG for text-heavy cards, JPEG for photographs.
5. [Compress](/tool/image-compressor) to under a megabyte.
6. Put a version number in the filename.
7. Share the link to yourself in one chat app and one social platform before announcing it anywhere.

Step seven catches whatever is left, and it takes thirty seconds.

Every step runs in this browser tab. That matters less for a public marketing image than for the ones built from unreleased product screenshots, which is what most preview cards actually contain in the week before a launch.`,
  },

  {
    slug: 'why-colours-look-different-on-each-screen',
    title: 'Why the same image looks different on every screen',
    description: 'Colour profiles decide how stored numbers become visible colour. Strip one and your careful red becomes somebody else orange.',
    excerpt: 'The photo that looked right on your laptop is washed out on the client phone. The pixels are identical; the interpretation is not.',
    category: 'image',
    tags: ['colour', 'srgb', 'profiles', 'display'],
    published: '2026-09-11',
    relatedTools: ['image-convert', 'color-converter', 'image-metadata', 'image-compressor'],
    takeaways: [
      'A pixel value is a coordinate, not a colour. The profile is what says which colour that coordinate means.',
      'Stripping the profile from a wide-gamut image makes it look dull or oversaturated, because it is then read as sRGB.',
      'Export to sRGB for the web. It is the one profile every browser and device agrees about.',
      'Editing metadata is not the same as converting. Assigning a profile relabels; converting recalculates the pixels.',
    ],
    body: `You export a photo, it looks right, and the client says the reds are orange. You open it again and it still looks right. Both of you are looking at the same file.

The bytes have not changed. What changed is the rule being used to turn those bytes into light.

## A pixel value is not a colour

\`rgb(220, 30, 60)\` is three numbers. On its own it means "220 units along the red axis" of some colour space, and which colour that actually is depends entirely on which space.

A **colour profile** is the definition of that space: the exact colours of the red, green and blue primaries, the white point, and the tone curve. Same numbers, different profile, different visible colour.

| Profile | Range | Where it is used |
|---|---|---|
| sRGB | Smallest | The web, most screens, the safe default |
| Display P3 | About 25% wider | Apple displays, modern phones |
| Adobe RGB | Wider in greens | Print and photography workflows |
| ProPhoto RGB | Very wide | Editing masters only |

So a photo tagged Display P3 opened by something that assumes sRGB is interpreted with the wrong primaries, and every saturated colour shifts. That is your orange red.

## The stripped-profile problem

This is the most common version, and it is easy to cause by accident.

Many optimisation steps remove metadata to save bytes, and the colour profile is metadata. Removing it from an sRGB image is harmless, because sRGB is what everything assumes anyway. Removing it from a Display P3 or Adobe RGB image is destructive: the wide-gamut numbers are now read as sRGB numbers, and the image comes out looking flat or garish depending on the direction.

> [!WARNING]
> Convert to sRGB before stripping metadata, not after. Converting recalculates the pixel values so they mean the same colour in the new space. Stripping alone just removes the label and leaves the old numbers behind.

That distinction is worth stating plainly because the two operations sound similar:

- **Assigning** a profile changes the label and leaves the pixels alone. The image looks different.
- **Converting** to a profile recalculates the pixels so the appearance is preserved as closely as the new space allows.

You almost always want converting. [Image conversion](/tool/image-convert) does this as part of changing format, and an [image metadata tool](/tool/image-metadata) is what shows you which profile a file is actually carrying.

## What else moves the colour

Profiles explain the big shifts. Several other things explain the rest.

**Screens differ.** Panel type, age, brightness and the manufacturer factory calibration all change what a given signal looks like. A cheap laptop panel may only cover 60% of sRGB, so it physically cannot show colours you can see on a better one.

**Ambient light.** The same screen looks different in daylight and under a warm bulb. This is why print proofing is done under standardised lighting.

**Night-shift modes.** Every phone and laptop now warms the display after dark, by default. Colour decisions made at 11pm are made through a filter.

**Auto-brightness.** Contrast perception changes with backlight level, so the same image looks flatter at low brightness.

None of these are fixable from the file. They are the reason a colour decision should be checked on more than one device before it ships.

## The rules that avoid most of it

**Export to sRGB for anything going on the web.** Not because it is the best space, but because it is the one every browser, phone and email client agrees about. The wider spaces are for editing and for print, where a colour-managed pipeline exists.

**Embed the profile.** It is a few hundred bytes and it removes all ambiguity. Browsers honour embedded profiles.

**Keep the master in a wide space.** Edit in Adobe RGB or ProPhoto if that is your workflow, and export a converted sRGB copy for delivery. Converting down is fine; converting up recovers nothing.

**Do the conversion before the compression.** Compress last, always, for the same reason as in [optimising images for web performance](/blog/optimise-images-for-web-performance): every step after compression works on degraded data.

> [!TIP]
> For interface colours rather than photographs, this is much simpler: CSS hex values are sRGB by definition, so a [colour converter](/tool/color-converter) moving between HEX, RGB and HSL is working in one space throughout and nothing shifts. The profile problem is specific to images carrying their own colour space.

## Print is a separate conversation

Everything above is about screens, which emit light additively. Ink absorbs light subtractively and has a smaller gamut, so a vivid screen blue has no ink equivalent at all.

That conversion is covered in [sending a file to a printer](/blog/preparing-files-for-print), and the summary is that the shift is unavoidable and worth anticipating rather than discovering on the proof.

The pipeline that works: edit wide, convert to sRGB and embed the profile for the web, convert to the printer profile for print, and check the result on a second device before anyone else sees it.`,
  },

  {
    slug: 'product-photos-for-listings',
    title: 'Product photos that pass a marketplace listing check',
    description: 'Amazon, Etsy and Shopify each impose minimum pixels, background rules and aspect ratios. The overlap between them is a single workable spec.',
    excerpt: 'Listings get rejected for three things: too few pixels, the wrong background, and a product that fills too little of the frame.',
    category: 'image',
    tags: ['ecommerce', 'product-photos', 'resize', 'background'],
    published: '2026-09-11',
    relatedTools: ['ai-bg-remover', 'image-crop', 'image-resize', 'image-compressor'],
    takeaways: [
      'Most marketplaces want at least 1600px on the long edge so their zoom feature works; some accept 1000px without zoom.',
      'A pure white background is a hard requirement on main images for several platforms, not a style preference.',
      'The product should fill about 85% of the frame. Too much empty space is a common rejection.',
      'Shoot on white, remove the background, then crop and resize. Doing it in that order avoids halo edges.',
    ],
    body: `A listing is rejected for "image does not meet requirements". The photo is sharp, well lit and looks professional. It is also 900 pixels wide on a platform that wants 1600, on a background that is very slightly grey.

Marketplace image rules are mechanical, and they overlap enough that one export can satisfy most of them.

## What the platforms actually ask for

| Platform | Minimum long edge | Main image background | Shape |
|---|---|---|---|
| Amazon | 1600px for zoom, 1000px minimum | Pure white required | Square preferred |
| Etsy | 2000px recommended | Any, consistency matters | 4:5 or square |
| Shopify | 2048px recommended | Any, yours to choose | Square common |
| eBay | 1600px for zoom, 500px minimum | Plain preferred | Any |

Always check the current policy for the platform you are on, because these change. But the overlap gives a workable target: **2000 x 2000 pixels, square, on pure white.** That satisfies the strictest requirement in each column and downscales cleanly for anywhere more relaxed.

## The three rejections

**Too few pixels.** Zoom is the reason for the high minimums. A platform offering a magnifier needs source detail to magnify, so it enforces a floor. A 900px image is not slightly under; it disables a feature the listing depends on.

And the fix is not to enlarge it. [Upscaling](/tool/image-resize) interpolates and adds no detail, which is the same point made in [resize or compress](/blog/resize-vs-compress-images). If the pixels were never captured, reshoot.

**Background not white enough.** "Pure white" means RGB 255,255,255, and a white sheet photographed under normal light is nothing of the sort. It is usually a light grey with a colour cast, somewhere around 240 with a blue tint, and automated checks measure rather than eyeball it.

**Product too small in the frame.** Roughly 85% fill is the usual guidance. A product floating in the middle of a large white field reads as an amateur listing and sometimes fails the check outright.

## The order that avoids halos

This sequence matters more than it looks.

**1. Shoot on white, or as close as you can get.** Background removal works far better when there is genuine contrast between subject and backdrop. This is the single biggest predictor of a clean result, as covered in [how AI background removal works](/blog/remove-image-background-in-browser).

**2. [Remove the background](/tool/ai-bg-remover).** The model produces an alpha mask, so the output has real transparency rather than a white rectangle.

**3. Composite onto pure white.** Now the background is exactly 255,255,255 by construction rather than by hoping the lighting was even.

**4. [Crop](/tool/image-crop) to square with the product filling about 85%.** Crop before resizing so you scale from the largest available source.

**5. [Resize](/tool/image-resize) to 2000 x 2000.**

**6. [Compress](/tool/image-compressor)** to meet any file size cap.

> [!WARNING]
> Removing the background and then sharpening is how you get a visible halo. The mask edge already has a soft transition; sharpening amplifies it into an outline. If the image needs sharpening, do it before the removal, not after.

## Consistency across a catalogue

For a shop rather than a single listing, consistency matters more than any individual image being perfect. Shoppers read a grid, and one photo at a different crop or a different white breaks it.

The workable approach: fix the specification once, then treat it as a batch job. Same square crop, same 85% fill, same background, same output size. Steps 4 to 6 above are the mechanical part, and [batch resizing](/tool/batch-resize) handles the volume once the individual crops are done.

The crop is the part that cannot be automated, because the product occupies a different part of every frame.

## Beyond the main image

The main image is the constrained one. The secondary slots are where a listing is actually won, and they are far less restricted: the product in use, a scale reference, the detail that differentiates it, and the packaging as it will arrive.

Two things worth knowing there. Text burned into an image is not readable by screen readers and not indexed, so anything important should also appear in the listing copy. And [stripping metadata](/tool/image-metadata) before upload is a reasonable habit, since product photos shot at home carry GPS coordinates by default, which is the issue described in [what your photos reveal](/blog/exif-metadata-in-your-photos).

Every step here runs in the browser, which for unreleased product photography is the difference between a routine export and publishing your catalogue to a third party before launch.`,
  },

  {
    slug: 'screenshots-for-bug-reports',
    title: 'Screenshots that actually help: annotation, redaction and what leaks',
    description: 'A screenshot sent for support often contains more than the bug. Browser tabs, notifications and the clipboard all end up in frame.',
    excerpt: 'A black box over text in a screenshot really does delete it, unlike in a PDF. Blurring, on the other hand, has been reversed.',
    category: 'image',
    tags: ['screenshots', 'annotation', 'redaction', 'privacy'],
    published: '2026-09-12',
    relatedTools: ['image-draw', 'image-crop', 'image-metadata', 'image-compressor'],
    takeaways: [
      'A solid black box over pixels is genuine removal, because the original values are overwritten.',
      'Blur and pixellation are reversible on text and have been broken in practice. Use an opaque fill.',
      'Crop first. The fastest way to remove a notification banner or a browser tab is to not include it.',
      'A useful bug screenshot shows the error, the URL and enough context to locate the page.',
    ],
    body: `Someone sends a screenshot of an error. It is a full-desktop capture at 3840 pixels wide, the error is a small grey box in the corner, and the top of the frame shows an email notification containing a customer name.

Both problems are the same problem: the capture included everything, and nothing was done to it afterwards.

## Crop first, redact second

The quickest way to remove something sensitive is not to include it.

Cropping is lossless and immediate. A full-screen capture cropped to the dialog and its surrounding context removes the notification banner, the bookmark bar, the taskbar clock and the other open tabs in one action, without any decision about what to black out.

> [!TIP]
> Capture the window rather than the screen where you can. Most systems have a shortcut for it, and it skips the cropping step entirely while also removing the desktop background and everything docked around the edges.

What to keep: the error itself, the URL bar if it is a web page, and enough surrounding interface for someone to find the same screen. What to drop: everything else.

## Redaction in an image is real

This is one place where the intuitive action is actually correct, and it is worth being explicit because the opposite is true elsewhere.

Drawing an opaque filled rectangle over text in an image **overwrites those pixels**. The original values are gone from the exported file. There is no layer underneath and nothing to recover.

That is the reverse of the situation in a document, where [a black rectangle is not redaction](/blog/how-to-redact-a-pdf-properly) because the text remains in the content stream beneath the drawing.

Two conditions on that, though.

> [!WARNING]
> Blur and pixellation are not removal. Both are reversible transformations, and recovering pixellated text has been demonstrated repeatedly, because the search space for a known font and a known character set is small. For anything that matters, use a solid opaque fill.

And export a new file rather than saving over the original, because the flattening is what makes it permanent and you may want the unredacted version later.

## Annotation that helps

An arrow pointing at the problem beats a paragraph describing where to look. [Drawing on the image](/tool/image-draw) covers the useful set: a box around the affected region, an arrow to the specific control, and a highlight on the value that is wrong.

The practical guidance is short. Use a colour that does not appear in the interface, which usually means red or magenta over a typical grey application. Keep the stroke thick enough to survive being viewed at half size in a chat window. And annotate sparingly, because five arrows communicate less than one.

If the report needs a diagram rather than a marked-up capture, the [drawing board](/tool/drawing) is the same idea with no image underneath.

## What a good bug screenshot contains

The most common failure is not a leak, it is a screenshot that does not contain enough to act on.

- **The error message in full**, not truncated by the crop.
- **The URL**, if it is a web page. This is the single most useful element and the one most often cropped out.
- **The timestamp**, which is why the system clock is sometimes worth keeping.
- **Enough interface** to identify which screen this is.

For anything involving a web page, a browser console screenshot is worth more than the visual one, because that is where the actual error text lives. The visual capture says something is wrong; the console says what.

## Before you send it

Two final steps that take seconds.

**[Strip the metadata](/tool/image-metadata).** Screenshots carry less than photographs, and they do carry the capture timestamp and often the device and software. A photo of a screen taken with a phone carries [GPS coordinates](/blog/exif-metadata-in-your-photos), which is a real disclosure when the screen is at your home.

**[Compress it](/tool/image-compressor).** A 3840px PNG of a dialog is several megabytes for no benefit. PNG is the right format here, since a screenshot is text and flat colour, which is exactly the content [JPEG handles badly](/blog/jpeg-png-webp-avif-which-format). Reducing the dimensions to what is readable is usually enough.

All of it runs in this browser tab, which is the relevant property when the screenshot is of an internal admin panel with real customer records on it, which is what support screenshots very often are.`,
  },
];
