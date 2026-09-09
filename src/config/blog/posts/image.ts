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
    body: `Image formats are not interchangeable containers for the same thing. Each one made a different bet about what kind of picture it would hold, and using the wrong one costs you either file size or visual quality — sometimes both.

## The short version

| Format | Compression | Transparency | Best for | Avoid for |
|---|---|---|---|---|
| JPEG | Lossy | No | Photographs | Text, screenshots, line art |
| PNG | Lossless | Yes | Screenshots, logos, UI, line art | Photographs |
| WebP | Both | Yes | Almost everything on the web | Print handoff, archival masters |
| AVIF | Both | Yes | Web photos where size matters most | Fast batch encoding, older software |
| SVG | Vector | Yes | Logos, icons, diagrams | Photographs |

## JPEG: built for photographs, hostile to edges

JPEG splits the image into 8×8 pixel blocks, converts each to frequency information, and discards the high-frequency detail your eye is least likely to miss. It also usually throws away three-quarters of the colour resolution — a technique called chroma subsampling — because human vision is far more sensitive to brightness than to colour.

That set of assumptions is excellent for a photograph of a face or a landscape, where colour changes gradually. It is actively bad for a screenshot, where a hard black-on-white edge is exactly the high-frequency detail JPEG is designed to throw away. The result is the coloured fringing and mosquito noise you see around text in a JPEG screenshot.

JPEG also has no transparency. Ever. If something must sit on a coloured background, JPEG cannot do it.

## PNG: lossless, transparent, and heavy on photos

PNG predicts each pixel from its neighbours, stores the difference, and compresses the result with DEFLATE. Nothing is discarded — decode a PNG and you get the exact original pixels back.

That is perfect for content with large flat areas and sharp edges: screenshots, logos, icons, charts, anything with text. It is a poor fit for photographs, where no two adjacent pixels are alike and the prediction has nothing to work with. A photo saved as PNG is routinely five to ten times larger than the same photo as a good-quality JPEG, with no visible benefit.

PNG also supports a full 8-bit alpha channel, which is why it remains the safe choice for a logo that has to sit on an unknown background.

One nuance: PNG-8 uses a 256-colour palette and can be dramatically smaller than PNG-24 for simple graphics. For a flat-colour logo, it is often the right answer.

## WebP: the sensible default for the web

WebP does both lossy and lossless, supports alpha transparency in both modes, and typically produces files around 25–35% smaller than JPEG at comparable perceptual quality. Crucially, it supports transparency *with* lossy compression — something neither JPEG nor PNG can do — which makes it excellent for a photographic image with a cut-out background.

Browser support stopped being a concern years ago; every current browser handles it, including Safari. The remaining friction is outside the browser: some older desktop software, printers and corporate document systems still do not accept it.

**Use WebP for images on your website. Do not use it as the file you email to a client or send to a printer.**

## AVIF: smaller still, at a cost

AVIF uses the intra-frame coding from the AV1 video codec. At low-to-medium quality settings it is meaningfully smaller than WebP — often another 20% or more — and it degrades more gracefully, producing soft blur rather than blocky artefacts. It also handles 10- and 12-bit colour and wide gamut, which matters for HDR content.

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
    body: `Compression is the art of storing the same picture in fewer bytes. There are two fundamentally different ways of doing it, and mixing them up is where most confusion begins.

## Lossless: nothing is thrown away

Lossless compression finds redundancy and encodes it more efficiently. PNG, for example, predicts each pixel from the ones above and to the left, stores only the difference, and then runs DEFLATE over the result. Decode it and you get back the exact original pixel values, bit for bit.

The catch is that the amount of redundancy in a photograph is small. A gradient sky has no repeated runs and poor prediction accuracy, so lossless compression can only do so much. Typical savings on photographic content are modest — often 10–30%.

Lossless shines on synthetic images: screenshots, diagrams, logos, anything with large uniform regions.

## Lossy: throw away what you will not miss

Lossy compression exploits the limits of human vision. JPEG's approach, still the clearest example:

1. **Convert colour space.** Separate brightness (luma) from colour (chroma), because the eye is much more sensitive to the former.
2. **Subsample chroma.** Typically store colour at half resolution in each direction — a 75% reduction in colour data that is nearly invisible on photographic content.
3. **Transform in 8×8 blocks.** Each block is converted from pixel values into frequency coefficients: a few coefficients describe the broad tone of the block, many describe fine detail.
4. **Quantise.** Divide those coefficients by a table of numbers and round. Fine-detail coefficients get divided by larger numbers, so most of them round to zero. **This is the lossy step, and this is what the quality slider controls.**
5. **Entropy-code** the remaining values losslessly.

## What the quality number really means

The quality slider scales the quantisation table. Lower quality means larger divisors, means more coefficients rounded to zero, means fewer bytes and less detail.

It is not a percentage of anything, and — this trips people up constantly — **it is not comparable between encoders.** Quality 80 in one library does not mean quality 80 in another. Different software uses different tables.

What is broadly true across encoders:

- **90–100**: near-transparent quality, files much larger than necessary. Worth it for a master copy, wasteful for the web.
- **75–85**: the practical sweet spot. Most people cannot see the difference from the original at normal viewing size, and the file is a fraction of the size.
- **60–75**: visible on close inspection, fine for thumbnails and secondary images.
- **Below 50**: blocking and colour banding become obvious, particularly in smooth gradients like skies and skin.

If you need one number: **80**. Then check the result on the content you actually have — a photo with fine texture tolerates more compression than one with large smooth areas, where banding shows up first.

## Generation loss is real

Every lossy save re-runs quantisation on data that has already been quantised. The errors compound. Open a JPEG, crop it, save it, open it again, adjust it, save it again — after a few rounds you get visible blocking that no amount of care recovers.

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
4. **Strip metadata** if you do not need it — EXIF blocks can carry hundreds of kilobytes of embedded thumbnails and colour profiles.

## Compressing without uploading

Canvas encoding in the browser handles all of this natively — JPEG, PNG and WebP encoding are built into every modern browser. NextTool's [image compressor](/tool/image-compressor) uses exactly that, so a folder of family photos or unreleased product shots is processed on your machine and never transmitted.

For a batch, [bulk resizing](/tool/batch-resize) before compressing usually gets you further than any quality setting alone.`,
  },

  {
    slug: 'resize-vs-compress-images',
    title: 'Resize or compress? The difference that decides your file size',
    description: 'Resizing changes pixel dimensions, compressing changes how those pixels are stored. Reaching for the wrong one is why images end up blurry and still too big.',
    excerpt: 'A 300 DPI setting does nothing for an image on a website. Pixels are the only unit the screen understands — and understanding that fixes a lot of frustration.',
    category: 'image',
    tags: ['resize', 'compression', 'dpi'],
    published: '2026-08-21',
    relatedTools: ['image-resize', 'image-compressor', 'batch-resize', 'image-crop'],
    body: `Two operations, constantly confused, with completely different effects on a file.

**Resizing** changes how many pixels the image contains. A 4000×3000 photo resized to 1000×750 has one-sixteenth the pixels — and roughly one-sixteenth the data before any compression is applied.

**Compressing** keeps the pixel count and changes how efficiently those pixels are stored, discarding detail your eye is unlikely to notice.

Almost everyone reaches for compression first. For a modern phone photo, resizing is usually the bigger lever by an enormous margin.

## The arithmetic

A 12-megapixel phone photo is 4000×3000. If it is going into a blog post displayed 800 pixels wide, you are storing 15 times more pixel data than the page will ever show. The browser downsamples it on the fly, every time, for every visitor.

Resize it to 1600 pixels wide — twice the display width, which covers high-density screens — and you have removed 84% of the data before touching the quality slider. The visible result on the page is identical.

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

AI upscalers are genuinely different — they hallucinate plausible detail based on training data — and they are useful. But it is invention, not recovery. For anything where accuracy matters (a document, a product photo, evidence), do not upscale; go back to the source.

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

If you are preparing a gallery or a product catalogue, doing this by hand for sixty images is how it stops getting done. [Batch resizing](/tool/batch-resize) applies a single width to a whole folder in one pass, in the browser, without uploading any of them — which matters when the folder is client work or unpublished product photography.`,
  },

  {
    slug: 'remove-image-background-in-browser',
    title: 'How AI background removal works, and where it still fails',
    description: 'Segmentation models can cut a subject out of a photo in seconds. Understanding what the model is doing tells you which photos will work and which will not.',
    excerpt: 'The model is not "finding the person". It is assigning every pixel a probability of being foreground — which explains exactly why hair and glass give it trouble.',
    category: 'image',
    tags: ['ai', 'background-removal', 'segmentation'],
    published: '2026-08-29',
    relatedTools: ['ai-bg-remover', 'image-convert', 'image-crop', 'image-editor'],
    body: `Cutting a subject out of a photograph used to be twenty minutes of careful path work. A segmentation model now does a credible job in a few seconds. It is worth knowing what it is actually doing, because that explains its failure modes precisely.

## What the model produces

A background-removal model does not identify objects and draw an outline around them. It performs **semantic segmentation**: for every pixel in the image, it outputs a value between 0 and 1 representing confidence that the pixel belongs to the foreground.

The result is a greyscale mask the same size as the image — white where the model is confident it is subject, black where it is confident it is background, grey where it is unsure. That mask becomes the alpha channel of the output PNG.

Architectures like U²-Net are built for exactly this: an encoder progressively downsamples the image to understand global context ("this is a person standing in a room"), and a decoder upsamples back to full resolution while pulling in fine detail from earlier layers via skip connections. The two-scale design is why these models get both the overall shape and the edges reasonably right.

## Why edges are the hard part

For most pixels the answer is obvious. The interesting pixels are the boundary ones, where a single pixel genuinely contains both subject and background — this is a real physical property of how cameras sample light, not a modelling shortcut.

Getting those pixels right is a separate problem called **alpha matting**, and it is where quality differences between tools show up:

- **Hair.** Thousands of strands thinner than one pixel each. A hard mask cuts them off and leaves a helmet-like silhouette; a good soft mask preserves partial transparency and keeps them looking like hair.
- **Fur and feathers.** Same problem, more of it.
- **Glass, smoke, water, veils.** Genuinely semi-transparent — the "correct" alpha is somewhere in the middle, and models trained mostly on opaque subjects tend to guess wrong.
- **Motion blur.** A blurred hand has no defined edge to find.

## What predicts a good result

**Contrast between subject and background.** A dark jacket against a dark wall is hard for the same reason it is hard for you — there is little signal to separate them.

**A single, clear subject.** Models are typically trained on images with one salient foreground object. A group photo, or a person holding a bicycle, produces inconsistent decisions about what counts as subject.

**In-focus edges.** Shallow depth of field that blurs the subject's outline removes the information the model needs.

**Ordinary subject matter.** These models are trained heavily on people, animals, products and vehicles. Unusual subjects — machinery, abstract objects, cluttered scenes — fall outside the distribution and results degrade.

**Reasonable resolution.** Most models process at a fixed internal resolution (often around 320–1024 px) and the mask is scaled back up. Very fine detail in a huge image can be lost simply because it never survived the downscale.

## Getting better output

1. **Crop before removing.** Less background clutter means fewer chances to be wrong, and the subject occupies more of the model's internal resolution.
2. **Improve contrast first** if the subject is poorly separated from its surroundings.
3. **Always save as PNG or WebP.** JPEG has no alpha channel — export a cut-out as JPEG and the transparency is flattened to white or black, and the work is lost.
4. **Check on both light and dark backgrounds.** Fringing from the original background colour is invisible against white and glaring against black.
5. **Retouch rather than re-run.** If 95% is right, fixing the remaining edge by hand is faster than hunting for a better model.

## Running it on your own device

This is the part that has genuinely changed. These models are a few tens of megabytes and can be exported to ONNX and run in a browser through WebAssembly or WebGPU — using your own CPU or graphics card rather than a rented one.

That is what NextTool's [AI background remover](/tool/ai-bg-remover) does. The first run downloads the model, then every image is processed locally. It is slower than a datacentre GPU and it means your product photography, portraits and personal pictures never get uploaded to a service that may retain them for training.

Expect a few seconds per image after the model loads, and expect a modern browser to be required — WebGPU support makes a substantial difference to speed.`,
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
    body: `On a typical content page, images account for the majority of transferred bytes. They are also the element most likely to be the Largest Contentful Paint — the metric that decides whether a page feels fast. Four decisions cover almost all of the available improvement.

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

Setting the \`width\` and \`height\` attributes lets the browser compute the aspect ratio and reserve the correct box before a single byte of image data arrives. Your CSS can still size the element responsively — the attributes are used for the ratio, not as a fixed size.

This costs nothing and is one of the highest-value one-line fixes available.

## 4. Load the right images at the right time

- **Lazy-load below-the-fold images** with \`loading="lazy"\`. The browser defers them until the user scrolls near them.
- **Do not lazy-load the hero image.** It is the LCP element; deferring it directly delays the metric you are trying to improve. Mark it \`fetchpriority="high"\` instead.
- **Preload the LCP image** if it is discovered late — for example, if it is set as a CSS background.
- **Avoid CSS background images for meaningful content.** They are discovered later in the parse, they cannot be lazy-loaded intelligently, and they carry no alt text.

## The things that are not worth the effort

- **Shaving the last 5% with an exotic encoder** while shipping a 3000 px image into a 700 px slot. Fix the big thing first.
- **Quality 95.** Nobody can see it, and it can double the file size versus quality 80.
- **Base64-inlining large images.** It adds roughly 33% overhead, cannot be cached separately, and blocks the document. Reasonable for a 200-byte icon, harmful for a photograph.

## A workable pipeline

1. Start from the highest-quality original.
2. Resize to the largest size you will actually serve, and generate two or three smaller variants for \`srcset\`.
3. Export AVIF or WebP, plus a JPEG fallback, at quality ~80.
4. Strip metadata — EXIF blocks and embedded colour profiles can be hundreds of kilobytes.
5. Set \`width\`, \`height\` and \`alt\` on every image.
6. Lazy-load everything except the hero.

Steps 2 to 4 are batch work. [Bulk resizing](/tool/batch-resize), [format conversion](/tool/image-convert) and [compression](/tool/image-compressor) all run locally in the browser, which for unreleased design work or client photography is the difference between a routine task and a data-handling decision.`,
  },
];
