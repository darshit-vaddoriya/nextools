import { ToolSeoMap } from './types';

export const IMAGE_SEO_CONTENT: ToolSeoMap = {
  'image-compressor': {
    intro:
      'Large photos slow down websites, bloat email attachments, and eat into mobile data plans, and this compressor shrinks JPEG, PNG, WebP, and AVIF files while letting you preview the quality tradeoff before you commit. Web developers use it to hit Core Web Vitals targets, while sellers and bloggers use it to keep product photos crisp but light. Every pixel is processed in your browser using the Canvas API, so the original file never leaves your device.',
    steps: [
      { title: 'Add your image', description: 'Drag a JPEG, PNG, WebP, or AVIF file onto the drop zone, or click to browse and select one.' },
      { title: 'Adjust the quality slider', description: 'Drag the compression slider and watch the live before/after file size update in real time.' },
      { title: 'Compare visually', description: 'Check the preview to make sure detail loss is acceptable at your chosen quality level.' },
      { title: 'Download the result', description: 'Click download to save the compressed file directly to your device.' },
    ],
    faqs: [
      { question: 'Will compressing my image reduce its quality?', answer: 'Some quality is traded for smaller file size, but the tool uses lossy compression with a live preview so you can pick the point where savings are worthwhile without visible artifacts.' },
      { question: 'Which formats are supported?', answer: 'JPEG, PNG, WebP, and AVIF are all supported for both input and compressed output.' },
      { question: 'Is there a file size limit?', answer: 'The tool runs entirely in your browser, so the practical limit is your device memory rather than a server upload cap, most photos up to tens of megabytes compress instantly.' },
      { question: 'Are my images uploaded anywhere?', answer: 'No. Compression happens locally using your browser Canvas API; the file never leaves your computer or phone.' },
      { question: 'Does it work on mobile browsers?', answer: 'Yes, the compressor works on modern mobile browsers, though very large images may take a moment longer to process than on desktop.' },
    ],
    useCases: [
      'Shrinking product photos before uploading them to a marketplace listing with a file size cap',
      'Reducing image weight on a blog or portfolio site to improve Core Web Vitals scores',
      'Compressing photo attachments so they fit under an email provider size limit',
      'Trimming screenshots down before pasting them into a bug report or ticket',
    ],
    tips: [
      'Push the quality slider down gradually while watching the preview, most photos hold up fine down to 60-70% quality with no visible artifacts',
      'WebP and AVIF typically compress smaller than JPEG at the same visual quality, so switch formats if size matters more than compatibility',
      'PNG compression gains are limited on photos; convert to JPEG or WebP first if you need aggressive size reduction on photographic content',
    ],
  },
  'image-resize': {
    intro:
      'Whether you need a product photo at an exact 1200x1200 pixel square for a marketplace listing or a banner scaled to 50% for a faster-loading blog post, this tool resizes images by exact pixel dimensions or by percentage without installing any software. Designers, students preparing assignments, and social media managers all use it to match platform-specific size requirements. Resizing happens instantly in your browser, so nothing is ever sent to a server.',
    steps: [
      { title: 'Upload an image', description: 'Drop or select the image you want to resize.' },
      { title: 'Choose a resize mode', description: 'Switch between exact pixel width/height or percentage scaling.' },
      { title: 'Set dimensions', description: 'Enter the target width and height, optionally locking the aspect ratio to avoid distortion.' },
      { title: 'Preview and download', description: 'Review the resized preview and click download to save the new file.' },
    ],
    faqs: [
      { question: 'Can I resize without distorting the image?', answer: 'Yes, lock the aspect ratio toggle so width and height scale together proportionally.' },
      { question: 'Can I resize by percentage instead of pixels?', answer: 'Yes, switch to percentage mode to scale the image up or down relative to its original size.' },
      { question: 'What image formats can I resize?', answer: 'Common formats like JPEG, PNG, and WebP are all supported for upload and export.' },
      { question: 'Does resizing reduce image quality?', answer: 'Enlarging an image beyond its original resolution can soften detail, but shrinking it generally preserves visual quality well.' },
      { question: 'Is my photo uploaded to a server?', answer: 'No, resizing is done in-browser using canvas rendering, so your file stays on your device.' },
    ],
    useCases: [
      'Matching an exact 1200x1200 pixel requirement for a marketplace or Amazon product listing',
      'Scaling a banner image down by 50% so a page loads faster',
      'Preparing a profile picture at the precise dimensions a platform requests',
      'Resizing a batch of screenshots to a consistent width for a document or slide deck',
    ],
    tips: [
      'Lock the aspect ratio first, then adjust one dimension, the other updates automatically without distortion',
      'Enlarging past the original resolution will soften detail, so try to resize down rather than up whenever possible',
      'Use percentage mode when you just need a proportionally smaller version rather than an exact pixel target',
    ],
  },
  'image-crop': {
    intro:
      'Photographers cleaning up a shot, sellers isolating a single product from a group photo, and social media users framing a profile picture all need precise cropping, and this tool lets you drag a selection box directly over your image with optional locked aspect ratios like 1:1 or 16:9. The crop preview updates live as you adjust the selection so you can fine-tune the framing before exporting. All cropping happens client-side, so sensitive or personal photos never touch a remote server.',
    steps: [
      { title: 'Upload your image', description: 'Drop in the photo you want to crop.' },
      { title: 'Drag the crop box', description: 'Move and resize the selection handles over the region you want to keep.' },
      { title: 'Lock an aspect ratio (optional)', description: 'Pick a preset ratio like square or widescreen to constrain the crop shape.' },
      { title: 'Export the crop', description: 'Confirm the selection and download the cropped image.' },
    ],
    faqs: [
      { question: 'Can I crop to a specific aspect ratio?', answer: 'Yes, aspect ratio locking is available for common ratios like 1:1, 4:3, and 16:9, or you can crop freely.' },
      { question: 'Does cropping reduce file size?', answer: 'Yes, since the exported image only contains the selected region, the resulting file is typically smaller than the original.' },
      { question: 'Can I undo and reselect the crop area?', answer: 'Yes, you can drag the selection handles as many times as needed before exporting.' },
      { question: 'Is the cropped image saved anywhere online?', answer: 'No, cropping runs locally in your browser and the image is never uploaded.' },
      { question: 'Does it work with PNG images with transparency?', answer: 'Yes, transparency is preserved when cropping PNG files.' },
    ],
    useCases: [
      'Isolating a single product from a group photo before listing it individually',
      'Framing a profile picture to a square 1:1 ratio for a social media avatar',
      'Removing distracting edges from a screenshot before sharing it with a client',
      'Cutting a photo down to a 16:9 crop for a video thumbnail or banner',
    ],
    tips: [
      'Lock a preset aspect ratio first if the destination platform has fixed dimensions, it avoids awkward manual resizing later',
      'Crop tighter than you think you need; you can always add padding back but cannot recover cropped-away pixels',
      'Cropping only reduces file size when the selection is meaningfully smaller than the original, so trivial crops won\'t save much space',
    ],
  },
  'image-rotate': {
    intro:
      'Phone photos that came out sideways, scanned documents at a slight tilt, or images that just need a quick 90-degree turn before posting can all be fixed here by rotating to any degree, not just fixed 90-degree increments. It suits everyone from students straightening scanned notes to photographers correcting a slightly crooked horizon. The rotation is rendered on an HTML canvas in your browser, with an adjustable output quality slider before you export.',
    steps: [
      { title: 'Upload the image', description: 'Select the photo you want to rotate.' },
      { title: 'Set the rotation angle', description: 'Use the angle control to rotate by any degree, including free-form fine adjustments.' },
      { title: 'Adjust output quality', description: 'Move the quality slider to balance sharpness against file size.' },
      { title: 'Download', description: 'Save the rotated image once the preview looks right.' },
    ],
    faqs: [
      { question: 'Can I rotate by exact degrees, not just 90/180?', answer: 'Yes, the rotation control accepts any angle, so you can nudge a crooked photo straight by a few degrees.' },
      { question: 'Will rotating crop off parts of my image?', answer: 'The canvas expands to fit the rotated bounds, so no content is cut off unless you crop it separately afterward.' },
      { question: 'Does rotation reduce quality?', answer: 'A quality slider lets you control the output compression, and rotation itself does not blur the image at standard angles like 90 or 180 degrees.' },
      { question: 'Can I rotate PNG images with transparent backgrounds?', answer: 'Yes, transparent areas remain transparent after rotation.' },
      { question: 'Is this processed in the cloud?', answer: 'No, rotation is done entirely in your browser using canvas transforms.' },
    ],
    useCases: [
      'Straightening a scanned document that was fed into the scanner at a slight tilt',
      'Fixing a phone photo that displays sideways because orientation metadata was lost',
      'Correcting a crooked horizon line in a landscape photo by a few degrees',
      'Turning a landscape photo 90 degrees to fit a portrait-oriented layout',
    ],
    tips: [
      'For crooked horizons, nudge in 1-2 degree increments and use the live preview rather than guessing the exact angle',
      'Rotating by a non-90-degree angle expands the canvas to avoid cropping, so plan to crop the resulting empty corners afterward if needed',
      'Keep the quality slider high for scanned text documents, since compression artifacts make small text harder to read',
    ],
  },
  'image-flip': {
    intro:
      'Mirroring a photo horizontally to correct a reversed selfie, or flipping a graphic vertically for a design mockup, is a one-click job here rather than something that requires opening a full photo editor. It is commonly used by designers building symmetrical layouts and by everyday users fixing camera-flipped selfies before sharing them. The flip transform runs instantly on-device using canvas operations, with no upload step involved.',
    steps: [
      { title: 'Upload an image', description: 'Choose the photo you want to mirror.' },
      { title: 'Pick a flip direction', description: 'Select horizontal flip to mirror left-right, or vertical flip to mirror top-bottom.' },
      { title: 'Preview the result', description: 'Check the flipped preview against the original.' },
      { title: 'Download', description: 'Save the flipped image to your device.' },
    ],
    faqs: [
      { question: 'What is the difference between flip and rotate?', answer: 'Flipping mirrors the image along an axis, while rotating turns the whole image around a point; flip does not change orientation angle, it reverses it.' },
      { question: 'Can I flip both horizontally and vertically at once?', answer: 'Yes, apply one flip, then apply the other flip direction to combine both.' },
      { question: 'Does flipping affect image quality?', answer: 'No, flipping is a lossless pixel-mirroring operation with no resampling.' },
      { question: 'Will text in my image be mirrored too?', answer: 'Yes, any text baked into the image pixels will appear reversed after a horizontal flip, since the whole image is mirrored.' },
      { question: 'Is my image uploaded to process the flip?', answer: 'No, the flip happens locally in your browser.' },
    ],
    useCases: [
      'Correcting a front-camera selfie that appears mirrored compared to how it looked when taken',
      'Mirroring a graphic horizontally to build a symmetrical design mockup',
      'Flipping a scanned image that was fed into a scanner upside down or backwards',
      'Creating a mirrored variant of an icon for a design that needs facing pairs',
    ],
    tips: [
      'Combine a horizontal and vertical flip in sequence if you need a full 180-degree mirror rather than a rotation',
      'Remember any text baked into the image pixels will read backwards after a horizontal flip, use rotate instead if the text needs to stay legible',
      'Flipping is lossless, so it is safe to apply and reverse repeatedly without any quality loss',
    ],
  },
  'image-convert': {
    intro:
      'Different platforms and tools demand different image formats, a CMS might reject HEIC photos straight from an iPhone, or you might need a PNG turned into a lighter WebP for the web, and this converter handles JPG, PNG, WebP, AVIF, HEIC, BMP, TIFF, and more in one place. Web developers use it to modernize legacy image assets, while everyday users use it to make iPhone photos compatible with services that only accept JPG or PNG. Multiple files can be converted in a batch, all processed locally without uploading anything.',
    steps: [
      { title: 'Add one or more images', description: 'Drop in a single file or multiple images at once using the multi-file drop zone.' },
      { title: 'Choose the target format', description: 'Select the output format you need, such as PNG, WebP, AVIF, or JPG.' },
      { title: 'Set quality if applicable', description: 'For lossy formats, adjust the quality level before converting.' },
      { title: 'Convert and download', description: 'Run the conversion and download the converted file or files.' },
    ],
    faqs: [
      { question: 'Can I convert HEIC photos from an iPhone?', answer: 'Yes, HEIC files can be converted to more widely supported formats like JPG or PNG.' },
      { question: 'Can I convert multiple images at once?', answer: 'Yes, the drop zone accepts multiple files and converts them in a batch.' },
      { question: 'Does converting to a lossy format reduce quality?', answer: 'Converting to JPG, WebP, or AVIF uses a quality slider so you can control the compression level and resulting file size.' },
      { question: 'Which format should I use for the web?', answer: 'WebP or AVIF typically produce the smallest files at comparable visual quality, while JPG and PNG offer the broadest compatibility.' },
      { question: 'Are my files uploaded to a server for conversion?', answer: 'No, all conversion happens locally in your browser.' },
    ],
    useCases: [
      'Converting HEIC photos exported from an iPhone into JPG so they open on any device or CMS',
      'Turning a batch of PNG screenshots into WebP to cut page weight on a website',
      'Converting a BMP or TIFF file from an old scanner into a modern, shareable format',
      'Standardizing a mixed folder of image formats into a single format before uploading to a CMS',
    ],
    tips: [
      'Use WebP or AVIF for web delivery when file size matters most, and JPG or PNG when maximum compatibility matters most',
      'Keep PNG as the target when the source has transparency you need to preserve, since JPG will flatten it against a solid background',
      'Batch conversion applies the same quality setting to every file, so separate out images that need different quality levels',
    ],
  },
  'svg-converter': {
    intro:
      'Vector SVG files are great for scaling icons and logos, but many platforms, social posts, and print workflows need a flat raster image instead, and this tool rasterizes SVG files to PNG or JPG at whatever resolution you specify. It is handy for designers exporting an icon set at multiple pixel sizes, or developers who need a static preview image of an SVG asset. Rendering happens in the browser using an SVG-to-canvas pipeline, so your source file stays private.',
    steps: [
      { title: 'Upload your SVG file', description: 'Drop in the vector SVG you want to convert.' },
      { title: 'Choose output format', description: 'Pick PNG for transparency support or JPG for a flattened background.' },
      { title: 'Set the output resolution', description: 'Specify the pixel dimensions you want the rasterized image rendered at.' },
      { title: 'Download the raster image', description: 'Export the converted PNG or JPG file.' },
    ],
    faqs: [
      { question: 'Can I convert SVG to a high resolution PNG?', answer: 'Yes, you can specify a custom pixel resolution so the SVG is rasterized much larger than its default viewBox size, ideal for print or retina displays.' },
      { question: 'Does converting to JPG support transparency?', answer: 'No, JPG does not support transparency, so transparent SVG areas will be filled with a background color; use PNG to preserve transparency.' },
      { question: 'Will fonts and gradients in my SVG render correctly?', answer: 'Standard SVG shapes, gradients, and embedded fonts render correctly, though externally linked fonts not embedded in the SVG may not display.' },
      { question: 'Is my SVG file uploaded anywhere?', answer: 'No, the SVG is rendered and rasterized locally in your browser.' },
      { question: 'Can I batch convert multiple SVGs?', answer: 'This tool is optimized for converting one SVG at a time to a chosen resolution and format.' },
    ],
    useCases: [
      'Exporting a vector logo as a PNG at multiple pixel sizes for an icon set',
      'Producing a static preview image of an SVG asset for a platform that does not render vectors',
      'Rasterizing an SVG illustration to JPG for a print workflow that requires flattened raster images',
      'Generating a high-resolution PNG from a small SVG icon for use on a retina display',
    ],
    tips: [
      'Set the output resolution well above the SVG viewBox size if you need a crisp result on retina or print, since rasterizing is done at your specified pixel dimensions, not the source size',
      'Choose PNG over JPG whenever the SVG has transparent areas you want to keep transparent',
      'Double check that any fonts in the SVG are embedded rather than linked externally, or text may not render correctly',
    ],
  },
  'ico-generator': {
    intro:
      'Website favicons need to support several sizes in a single .ico file so browsers, bookmarks, and taskbars all display the right resolution, and this generator builds a proper multi-size ICO from any source image automatically. It is aimed at web developers and site owners who just have a logo PNG and need a standards-compliant favicon.ico. The packaging into the ICO container format happens entirely client-side.',
    steps: [
      { title: 'Upload a source image', description: 'Choose a square logo or image, ideally at least 256x256 pixels.' },
      { title: 'Select sizes to include', description: 'Pick which icon sizes (such as 16x16, 32x32, 48x48) should be bundled into the ICO.' },
      { title: 'Generate the ICO', description: 'Run the generation to pack the selected sizes into a single file.' },
      { title: 'Download favicon.ico', description: 'Save the resulting multi-size ICO file for use on your site.' },
    ],
    faqs: [
      { question: 'What image size should I start with?', answer: 'A square image of at least 256x256 pixels gives the best results across all bundled icon sizes.' },
      { question: 'Why do I need multiple sizes in one ICO?', answer: 'Browsers, bookmarks, and Windows taskbars each request different icon resolutions, so a multi-size ICO ensures a crisp icon everywhere instead of one blurry scaled version.' },
      { question: 'Does the source image need to be square?', answer: 'Square source images work best since non-square images will be resized or cropped to fit each icon size.' },
      { question: 'Can I use a PNG with transparency as the source?', answer: 'Yes, transparency is preserved in the generated ICO sizes.' },
      { question: 'Is this processed on a server?', answer: 'No, the ICO packaging happens entirely in your browser.' },
    ],
    useCases: [
      'Generating a favicon.ico for a website from an existing logo PNG',
      'Producing a multi-size icon file for a desktop application installer',
      'Refreshing an outdated single-size favicon with a properly bundled multi-resolution one',
      'Building a taskbar-ready icon from a square brand mark for a Windows app',
    ],
    tips: [
      'Start from a source image at least 256x256 pixels so smaller icon sizes can be downsampled cleanly instead of upscaled',
      'Include the standard set of sizes (16x16, 32x32, 48x48) at minimum for the broadest browser and OS compatibility',
      'Use a square, centered source image so nothing important gets cropped when it is resized to each icon dimension',
    ],
  },
  'ai-bg-remover': {
    intro:
      'Cutting a subject out from its background used to require a subscription tool or careful manual masking in Photoshop, but this tool detects the foreground automatically using an AI segmentation model that runs on-device through WebGPU or WASM. E-commerce sellers use it to create clean white-background product shots, and social media users use it to place themselves onto new backgrounds. A before/after slider lets you check the mask quality, and because the model runs locally, your photo never leaves your device even though it is being processed by an AI network.',
    steps: [
      { title: 'Upload your photo', description: 'Drop in the image containing the subject you want to isolate.' },
      { title: 'Let the AI model process it', description: 'Wait while the on-device segmentation model runs and generates a transparency mask.' },
      { title: 'Compare with the slider', description: 'Drag the before/after slider to inspect where the background was removed.' },
      { title: 'Choose an output size', description: 'Pick small, medium, large, or original resolution for the export.' },
      { title: 'Download the result', description: 'Save the image with a transparent background as a PNG.' },
    ],
    faqs: [
      { question: 'Is my photo uploaded to remove the background?', answer: 'No, background removal runs through an AI model executing locally in your browser via WebGPU or WASM, so the photo is never sent to a server, though it is processed by AI compute on your own device.' },
      { question: 'Why is processing slow on my device?', answer: 'Without WebGPU support the model falls back to a slower WASM path; choosing a smaller output size in the size options can speed things up.' },
      { question: 'What file format is the result?', answer: 'The output is a PNG with a transparent background so it can be placed over any new backdrop.' },
      { question: 'Does it work well on complex backgrounds like hair or fur?', answer: 'The AI segmentation handles fine edges like hair reasonably well, but very busy or low-contrast backgrounds can produce a rougher edge that may need manual cleanup.' },
      { question: 'Can I use this on a phone?', answer: 'Yes, though older phones without WASM/WebGPU acceleration will process more slowly than a modern desktop browser.' },
    ],
    useCases: [
      'Isolating a product photo onto a clean white or transparent background for a marketplace listing',
      'Cutting a subject out of a photo to composite them onto a new background for social media',
      'Removing a busy background from a headshot before using it as a profile picture',
      'Preparing transparent PNG assets for a design project without opening Photoshop',
    ],
    tips: [
      'Use the before/after slider to check edge quality around hair or fur, which is where segmentation is most likely to need manual touch-up',
      'Choose a smaller output size if processing feels slow on your device, it reduces the compute load on the segmentation model',
      'Photos with high contrast between subject and background produce cleaner masks than busy or low-contrast scenes',
    ],
  },
  'image-sharpen': {
    intro:
      'A slightly soft or blurry photo, from a shaky phone shot or a resized image that lost some crispness, can often be improved with an edge-enhancement filter, and this tool applies an adjustable sharpening kernel entirely in your browser. It is popular with photographers doing quick touch-ups and sellers wanting product photos to look crisper on a listing page. You control the sharpening strength and preview the effect before exporting.',
    steps: [
      { title: 'Upload the photo', description: 'Select the image you want to sharpen.' },
      { title: 'Adjust the sharpen intensity', description: 'Move the slider to increase or decrease the strength of edge enhancement.' },
      { title: 'Preview the effect', description: 'Compare the sharpened preview against the original to avoid over-sharpening artifacts.' },
      { title: 'Download', description: 'Export the sharpened image once you are happy with the result.' },
    ],
    faqs: [
      { question: 'Can sharpening fix a very blurry photo?', answer: 'Sharpening enhances existing edges and fine detail, but it cannot recover detail that was never captured, so very out-of-focus photos will still look soft, just with more contrast at existing edges.' },
      { question: 'Can I over-sharpen an image?', answer: 'Yes, pushing the intensity too high can introduce visible halos and noise around edges, so it is best adjusted while watching the live preview.' },
      { question: 'What formats can I sharpen?', answer: 'JPEG, PNG, and WebP images are all supported.' },
      { question: 'Is this done with AI?', answer: 'No, sharpening uses a standard convolution filter applied via canvas, so it is fast and works on any device without a GPU.' },
      { question: 'Are my images uploaded anywhere?', answer: 'No, the filter is applied locally in your browser.' },
    ],
    useCases: [
      'Crisping up a slightly soft phone photo before posting it online',
      'Sharpening a product photo so texture and detail read clearly on a listing page',
      'Restoring some perceived detail to an image that lost crispness after resizing',
      'Punching up edge definition on a scanned image before printing it',
    ],
    tips: [
      'Increase intensity gradually and check the preview closely, overshooting introduces visible halos around edges',
      'Apply sharpening as the last step in your workflow, after resizing or compressing, since those operations can soften edges again',
      'Skip heavy sharpening on already-noisy or high-ISO photos, since it tends to amplify grain along with detail',
    ],
  },
  'image-adjust': {
    intro:
      'Fine-tuning brightness, contrast, saturation, hue, and sharpness is often all a photo needs before it is ready to share, and this tool provides live sliders for each so you can see the effect update in real time without opening a full editor. Photographers correcting exposure and social media users punching up color both find this quicker than a desktop app. Every adjustment is rendered with canvas filters directly in your browser.',
    steps: [
      { title: 'Upload an image', description: 'Choose the photo you want to adjust.' },
      { title: 'Move the adjustment sliders', description: 'Tune brightness, contrast, saturation, hue, and sharpness individually.' },
      { title: 'Watch the live preview', description: 'Check the updated image as you drag each slider.' },
      { title: 'Export the edited image', description: 'Download the adjusted photo once it looks right.' },
    ],
    faqs: [
      { question: 'Can I adjust multiple properties at once?', answer: 'Yes, brightness, contrast, saturation, hue, and sharpness can all be combined in a single edit.' },
      { question: 'Can I reset to the original if I go too far?', answer: 'Yes, sliders can be dragged back to their default position to undo an adjustment.' },
      { question: 'Does this work on PNG images with transparency?', answer: 'Yes, transparency is preserved while color and tonal adjustments are applied to the visible pixels.' },
      { question: 'Is there a quality loss from adjusting the image?', answer: 'The adjustments themselves are non-destructive until export, at which point the format and quality setting you choose determine final file size.' },
      { question: 'Is my photo sent to a server?', answer: 'No, all adjustments are rendered locally using canvas filters.' },
    ],
    useCases: [
      'Correcting exposure on a photo that came out too dark or too flat',
      'Boosting saturation on a social media photo to make colors pop before posting',
      'Fixing an off color cast by nudging the hue slider on a photo shot under odd lighting',
      'Giving a batch of listing photos a consistent brightness and contrast look',
    ],
    tips: [
      'Make small adjustments to multiple sliders rather than a large push on one, it usually looks more natural',
      'Increase contrast slightly after boosting saturation, since higher saturation alone can make an image look washed out',
      'Reset a slider to default if an adjustment looks off, rather than trying to correct it with a different slider',
    ],
  },
  'image-to-base64': {
    intro:
      'Developers embedding small icons directly into CSS or HTML, or needing to paste image data into JSON/API payloads, often need a Base64 data URL representation of an image, and this tool converts any image file into that string instantly. It is a common step when inlining images to avoid extra HTTP requests, or when testing an API that expects Base64-encoded image data. The encoding happens locally using the browser FileReader API, so the file is never transmitted anywhere.',
    steps: [
      { title: 'Upload the image', description: 'Select the image file you want to encode.' },
      { title: 'View the generated Base64 string', description: 'The full data URL is generated automatically after upload.' },
      { title: 'Copy the string', description: 'Use the copy button to grab the Base64 output to your clipboard.' },
    ],
    faqs: [
      { question: 'What format is the output?', answer: 'The output is a full data URL string in the form data:image/[type];base64,[data], ready to paste into HTML, CSS, or JSON.' },
      { question: 'Does encoding to Base64 increase file size?', answer: 'Yes, Base64 encoding increases the effective size by roughly 33% compared to the original binary file.' },
      { question: 'Can I encode PNG, JPG, and other formats?', answer: 'Yes, any image format your browser can read can be encoded, including PNG, JPG, WebP, and GIF.' },
      { question: 'Is there a file size limit?', answer: 'Very large images can produce extremely long strings that may be slow to copy or paste, so it works best for icons, logos, and moderately sized photos.' },
      { question: 'Is my image uploaded to generate the Base64 string?', answer: 'No, the FileReader API reads and encodes the file locally in your browser.' },
    ],
    useCases: [
      'Inlining a small icon or logo directly into a CSS background-image to avoid an extra HTTP request',
      'Embedding an image in a JSON payload for testing an API that expects Base64-encoded image data',
      'Pasting an image directly into HTML email markup where external image hosting is unreliable',
      'Generating a data URL to hardcode a placeholder image in source code or documentation',
    ],
    tips: [
      'Remember the encoded string is about 33% larger than the original file, so reserve this for small icons and logos rather than full photos',
      'Copy the full data URL (including the data:image/...;base64, prefix) if you plan to paste it directly into HTML or CSS',
      'For large photos, encoding still works but the resulting string can be unwieldy to copy, paste, or store in version control',
    ],
  },
  'base64-to-image': {
    intro:
      'When you have a Base64 data URL string from an API response, a saved email attachment, or exported code and need to actually view or save it as a real image file, this tool decodes the string back into a downloadable PNG, JPG, or other image format. Developers debugging API responses and anyone recovering an embedded image from source code use it regularly. Decoding happens locally in the browser, so pasted data never leaves your device.',
    steps: [
      { title: 'Paste the Base64 string', description: 'Paste a data URL or raw Base64 string into the input field.' },
      { title: 'Preview the decoded image', description: 'The tool renders the decoded image automatically if the string is valid.' },
      { title: 'Download the file', description: 'Save the decoded image to your device.' },
    ],
    faqs: [
      { question: 'Does the string need the "data:image/..." prefix?', answer: 'The tool accepts full data URLs with the prefix; if you paste raw Base64 without a prefix it will attempt to detect the image type, but including the prefix gives the most reliable results.' },
      { question: 'What happens if the Base64 string is invalid?', answer: 'An error is shown if the string cannot be decoded into a valid image, usually meaning it was truncated or corrupted.' },
      { question: 'What image formats can be decoded?', answer: 'PNG, JPG, WebP, and GIF data URLs are all supported.' },
      { question: 'Is my pasted data sent anywhere?', answer: 'No, decoding happens entirely in your browser using the data URL directly.' },
      { question: 'Can I decode very large Base64 strings?', answer: 'Yes, though extremely long strings may take a brief moment to render depending on your device.' },
    ],
    useCases: [
      'Recovering a viewable image from a Base64 string returned by an API response during debugging',
      'Extracting an embedded image from source code or a saved HTML file to save it as a standalone file',
      'Turning a Base64 string from an email attachment or export into a downloadable PNG or JPG',
      'Verifying that a Base64 payload your application generated actually renders as a valid image',
    ],
    tips: [
      'Include the "data:image/..." prefix when pasting for the most reliable format detection',
      'If decoding fails, check the string wasn\'t truncated when copied, a cut-off Base64 string cannot be decoded into a valid image',
      'Strip any surrounding quotes or whitespace from a string copied out of JSON before pasting it in',
    ],
  },
  'ocr-image': {
    intro:
      'Scanned documents, screenshots of text, photographed whiteboards, or receipts can all be turned into editable, searchable text using Tesseract.js OCR running entirely in your browser. Students digitizing handwritten or printed notes and professionals extracting text from screenshots both rely on this instead of typing everything manually. Because the OCR engine runs client-side via WebAssembly, the image content is never sent to an external OCR API.',
    steps: [
      { title: 'Upload the image', description: 'Select a photo or screenshot containing text.' },
      { title: 'Run text recognition', description: 'Start the OCR process and wait while Tesseract.js analyzes the image locally.' },
      { title: 'Review the extracted text', description: 'Check the recognized text output against the image for accuracy.' },
      { title: 'Copy or download the text', description: 'Copy the result to your clipboard or download it as a text file.' },
    ],
    faqs: [
      { question: 'How accurate is the text extraction?', answer: 'Accuracy is generally high for clear, well-lit printed text but drops for handwriting, low resolution, skewed angles, or busy backgrounds.' },
      { question: 'Does OCR work on handwritten text?', answer: 'It can recognize some neat handwriting but is significantly more reliable on printed or typed text.' },
      { question: 'What languages are supported?', answer: 'Tesseract.js supports many languages depending on the loaded language data; English text generally gives the most reliable results out of the box.' },
      { question: 'Is my image uploaded to an OCR service?', answer: 'No, Tesseract.js runs as a WebAssembly module inside your browser, so the image is analyzed locally.' },
      { question: 'Why is OCR slow on my device?', answer: 'OCR is computationally heavier than simple image edits since it runs a full recognition model in WASM; larger images and older devices will take longer.' },
    ],
    useCases: [
      'Digitizing a scanned printed document into editable, searchable text',
      'Extracting text from a screenshot instead of retyping it manually',
      'Pulling line items and totals off a photographed receipt for expense tracking',
      'Converting a photo of a whiteboard from a meeting into text notes',
    ],
    tips: [
      'Crop the image to just the text region first, a tighter, cleaner input improves recognition accuracy',
      'Straighten skewed or angled photos before running OCR, since tilted text reduces accuracy significantly',
      'Well-lit, high-contrast printed text gives the best results; low light and busy backgrounds hurt accuracy the most',
    ],
  },
  'image-watermark': {
    intro:
      'Protecting photos from unauthorized reuse or branding images before sharing them publicly is easy here, add custom text or a logo watermark with full control over opacity, position, and size before exporting. Photographers protecting portfolio samples and businesses branding marketing images both use this to stamp ownership onto their work quickly. The watermark is composited directly onto the canvas in your browser, so originals stay private until you choose to export.',
    steps: [
      { title: 'Upload the base image', description: 'Select the photo you want to watermark.' },
      { title: 'Add text or upload a logo', description: 'Type a watermark text string or upload a logo image to overlay.' },
      { title: 'Position and set opacity', description: 'Drag the watermark to the desired position and adjust its opacity and size.' },
      { title: 'Export the watermarked image', description: 'Download the final image with the watermark applied.' },
    ],
    faqs: [
      { question: 'Can I use a logo image instead of text?', answer: 'Yes, you can upload a logo or icon image to use as the watermark instead of or alongside text.' },
      { question: 'Can I control how visible the watermark is?', answer: 'Yes, an opacity slider lets you make the watermark subtle or bold.' },
      { question: 'Where can I place the watermark?', answer: 'The watermark can be positioned anywhere on the image, including common presets like corners or center.' },
      { question: 'Does watermarking reduce image quality?', answer: 'The base image quality is preserved except for the watermark overlay itself; export quality settings then determine final file size.' },
      { question: 'Is my photo uploaded to apply the watermark?', answer: 'No, the watermark is composited locally on a canvas in your browser.' },
    ],
    useCases: [
      'Stamping a photography portfolio sample with a copyright notice before posting it publicly',
      'Branding marketing images with a company logo before distribution',
      'Adding a subtle "draft" or "sample" watermark to a proof image sent to a client',
      'Marking ownership on images shared to social media to discourage unauthorized reuse',
    ],
    tips: [
      'Keep opacity low (around 20-40%) for a watermark that deters theft without distracting from the photo',
      'Position the watermark over a busy area of the image, since it is harder to crop out cleanly than one placed in an empty corner',
      'Use a logo watermark for brand consistency across a whole batch of images rather than retyping text each time',
    ],
  },
  'image-draw': {
    intro:
      'Sometimes you need to mark up a screenshot or photo directly, circling a bug in a UI, highlighting a detail for a client, or annotating a diagram, and this tool lets you upload an image and draw over it with a pen, eraser, and color picker. Support teams annotating bug reports and teachers marking up diagrams for students both find this faster than opening a full editor. Everything is drawn onto an in-browser canvas layered over your image, with nothing uploaded to a server.',
    steps: [
      { title: 'Upload the image', description: 'Drop in the photo or screenshot you want to annotate.' },
      { title: 'Pick a tool and color', description: 'Choose the pen or eraser and select a drawing color.' },
      { title: 'Draw on the image', description: 'Click and drag over the canvas to mark up the areas you want to highlight.' },
      { title: 'Save your annotated image', description: 'Export the image with your drawings merged in.' },
    ],
    faqs: [
      { question: 'Can I erase mistakes while drawing?', answer: 'Yes, an eraser tool is available to remove parts of your annotation without affecting the underlying photo.' },
      { question: 'Can I change the pen color and thickness?', answer: 'Yes, color and brush size can both be adjusted before or during drawing.' },
      { question: 'Does the annotation permanently alter the original file?', answer: 'The original upload is untouched in memory; a new merged file is only created when you export, so you can redo the annotation as many times as needed before saving.' },
      { question: 'What file formats can I annotate?', answer: 'JPEG, PNG, and WebP images can all be uploaded and annotated.' },
      { question: 'Is my image uploaded anywhere while I draw?', answer: 'No, drawing happens on a canvas layer in your browser and nothing is sent to a server.' },
    ],
    useCases: [
      'Circling a bug in a UI screenshot before sending it to a developer',
      'Highlighting a specific detail in a photo for a client review',
      'Annotating a diagram with arrows and notes for a classroom lesson',
      'Marking up a floor plan or map image with instructions before sharing it',
    ],
    tips: [
      'Choose a bright, high-contrast pen color like red or yellow so annotations stand out clearly against the photo',
      'Increase brush thickness for annotations meant to be viewed at a glance, and reduce it for precise detail markup',
      'Use the eraser to clean up stray marks before exporting rather than starting the whole annotation over',
    ],
  },
  'image-editor': {
    intro:
      'For times when you need more than a single quick fix, this all-in-one editor combines cropping, resizing, rotating, flipping, color adjustment, blur, and annotation tools in one workspace so you can make several edits and export once. Freelancers preparing final assets and anyone touching up a photo before posting use it as a lightweight alternative to installing a desktop editor. The full editing pipeline runs on canvas in your browser tab, so multi-step edits never require re-uploading between tools.',
    steps: [
      { title: 'Upload your image', description: 'Load the photo you want to edit into the workspace.' },
      { title: 'Apply crop, resize, or rotate as needed', description: 'Use the transform tools to reframe or reorient the image.' },
      { title: 'Adjust colors and blur', description: 'Fine-tune brightness, contrast, saturation, and apply blur where needed.' },
      { title: 'Annotate if needed', description: 'Add drawings, text, or markup using the annotation tools.' },
      { title: 'Export the final image', description: 'Download the fully edited image in one step.' },
    ],
    faqs: [
      { question: 'Can I combine multiple edits in one session?', answer: 'Yes, you can crop, resize, rotate, adjust colors, blur, and annotate all within the same editing session before exporting once.' },
      { question: 'Can I undo an edit I made earlier in the session?', answer: 'The editor keeps your image in an editable state until export, so you can revisit and adjust earlier transforms before saving the final result.' },
      { question: 'What formats can I export to?', answer: 'You can export the edited image as JPEG, PNG, or WebP.' },
      { question: 'Is this a replacement for a full desktop editor?', answer: 'It covers the most common editing needs, crop, resize, rotate, flip, color, blur, and basic annotation, for quick edits, though it does not include layers or advanced retouching found in dedicated desktop software.' },
      { question: 'Is my image uploaded during editing?', answer: 'No, the entire editing pipeline runs locally in your browser using canvas rendering.' },
    ],
    useCases: [
      'Preparing a final asset that needs cropping, color correction, and a logo watermark in one pass',
      'Touching up a photo before posting it, without installing a full desktop editor',
      'Combining a resize, rotate, and brightness fix into a single export for a freelance deliverable',
      'Making several small corrections to a scanned document in one session instead of switching tools repeatedly',
    ],
    tips: [
      'Do transform operations like crop, resize, and rotate before color and blur adjustments, since transforms can affect how filters are applied',
      'Save annotation and text additions for last so they don\'t get distorted by a later crop or resize',
      'Export as PNG if you need to preserve transparency from earlier steps, otherwise JPEG keeps file size down for photos',
    ],
  },
  drawing: {
    intro:
      'This is a full-screen drawing app for sketching freely on a blank canvas or drawing directly over an uploaded photo, complete with brushes, shapes, text, and layer support. Digital artists sketching ideas, teachers illustrating concepts over a diagram, and anyone brainstorming visually use it as a lightweight alternative to a dedicated drawing app. All strokes and layers are rendered and kept in your browser session, with nothing saved or uploaded until you export.',
    steps: [
      { title: 'Start a blank canvas or upload a photo', description: 'Choose to draw on an empty canvas or load a background image to sketch over.' },
      { title: 'Select a brush, shape, or text tool', description: 'Pick from pen, shape, and text tools to build your drawing.' },
      { title: 'Work with layers', description: 'Add multiple layers to separate sketches, backgrounds, and annotations.' },
      { title: 'Adjust colors and sizes', description: 'Change brush color, size, and opacity as you draw.' },
      { title: 'Export your artwork', description: 'Download the finished drawing as an image file.' },
    ],
    faqs: [
      { question: 'Can I draw over an existing photo?', answer: 'Yes, you can load a background image and sketch or annotate directly on top of it.' },
      { question: 'Does it support layers?', answer: 'Yes, you can create multiple layers to keep sketches, backgrounds, and text separate while working.' },
      { question: 'What drawing tools are available?', answer: 'Pen brushes, shape tools, and a text tool are all available alongside adjustable color and brush size.' },
      { question: 'Can I use this on a tablet with a stylus?', answer: 'Yes, it works with touch and stylus input on tablets in addition to mouse input on desktop.' },
      { question: 'Is my drawing saved automatically?', answer: 'No, the canvas exists only in your browser session, so remember to export your work before closing the tab.' },
      { question: 'Is anything uploaded while I draw?', answer: 'No, all drawing and layer rendering happens locally in your browser.' },
    ],
    useCases: [
      'Sketching a quick idea or wireframe from scratch on a blank canvas',
      'Illustrating a concept over an uploaded diagram for a classroom lesson',
      'Brainstorming visually during a planning session using shapes and text',
      'Drawing on a tablet with a stylus for a digital art sketch',
    ],
    tips: [
      'Use separate layers for background, sketch, and text so you can adjust or hide each independently while working',
      'Export your work periodically, since the canvas only exists in your browser session and nothing is saved automatically',
      'Lower brush opacity for shading and layering strokes, and keep it at full opacity for clean line work',
    ],
  },
  'image-metadata': {
    intro:
      'Photos taken on phones and cameras often embed EXIF metadata like GPS coordinates, device model, and timestamps, which can be a privacy risk before sharing online, and this tool strips that metadata while leaving the visible image untouched. Privacy-conscious users posting to social media and journalists protecting source location data both use it before publishing photos. Metadata removal is performed locally by re-encoding the image in your browser, so the stripped data never has a chance to leave your device in the first place.',
    steps: [
      { title: 'Upload the image', description: 'Select the photo you want to clean of metadata.' },
      { title: 'Review detected metadata', description: 'See what EXIF and other metadata fields were found, if shown.' },
      { title: 'Strip the metadata', description: 'Run the removal process to produce a clean version of the image.' },
      { title: 'Download the cleaned file', description: 'Save the image with metadata removed.' },
    ],
    faqs: [
      { question: 'What metadata gets removed?', answer: 'EXIF data such as GPS location, camera model, timestamp, and other embedded fields are stripped from the image.' },
      { question: 'Will removing metadata change how the image looks?', answer: 'No, only the embedded metadata is removed; the visible pixel content is unchanged.' },
      { question: 'Does this protect my location if I share the photo?', answer: 'Yes, GPS coordinates embedded in EXIF data are one of the fields removed, which helps prevent location leaks when sharing photos publicly.' },
      { question: 'Which formats carry metadata that can be stripped?', answer: 'JPEG and TIFF files commonly carry EXIF metadata; PNG files typically carry little to none by comparison.' },
      { question: 'Is my photo uploaded to remove metadata?', answer: 'No, metadata stripping happens locally in your browser by re-encoding the image without the metadata fields.' },
    ],
    useCases: [
      'Stripping GPS location data from a photo before posting it publicly on social media',
      'Removing camera model and timestamp metadata from images before sharing them with strangers online',
      'Protecting a source location by cleaning EXIF data from a journalist\'s photo before publication',
      'Cleaning metadata from photos before uploading them to a platform that displays EXIF details publicly',
    ],
    tips: [
      'Check for GPS metadata specifically before sharing photos taken on a phone, since location is the most sensitive field typically embedded',
      'Run this on JPEG and TIFF files where it matters most, PNG files rarely carry meaningful EXIF data to begin with',
      'Re-strip metadata after any edit made in another tool, since some editors re-add fields like software version or timestamp on save',
    ],
  },
  'batch-resize': {
    intro:
      'Resizing dozens or hundreds of images to the same dimensions one at a time is tedious, and this tool lets you upload a whole batch and apply the same width, height, or scaling rule to every file at once. E-commerce sellers standardizing an entire product catalog and photographers preparing a gallery for the web both save significant time here. Each file is processed and packaged locally in your browser, so no batch of photos ever needs to be uploaded to a remote server.',
    steps: [
      { title: 'Upload multiple images', description: 'Drop in all the images you want resized together.' },
      { title: 'Set the target dimensions', description: 'Enter the width, height, or percentage scale to apply to every image.' },
      { title: 'Run the batch resize', description: 'Process all uploaded images with the same settings in one action.' },
      { title: 'Download the results', description: 'Save the resized images individually or as a bundled download.' },
    ],
    faqs: [
      { question: 'How many images can I batch resize at once?', answer: 'You can process as many images as your browser memory can comfortably handle, from a handful up to a few hundred typical photos.' },
      { question: 'Do all images get resized to the exact same dimensions?', answer: 'Yes, the same width/height or percentage setting is applied uniformly across every image in the batch.' },
      { question: 'Can I mix different image formats in one batch?', answer: 'Yes, you can upload a mix of JPEG, PNG, and WebP files and resize them together.' },
      { question: 'Is there a way to keep aspect ratio consistent across all images?', answer: 'Yes, locking aspect ratio applies proportional scaling to each image individually based on its own original dimensions.' },
      { question: 'Are my images uploaded to a server for batch processing?', answer: 'No, every image is resized locally in your browser, one at a time, without leaving your device.' },
    ],
    useCases: [
      'Standardizing an entire product catalog to one dimension before uploading to an online store',
      'Resizing every photo in a gallery down to a consistent web-friendly size at once',
      'Preparing a set of thumbnails at the same dimensions for a portfolio page',
      'Shrinking a folder of vacation photos before archiving or sharing them as a group',
    ],
    tips: [
      'Lock aspect ratio when your source images have varying orientations, so each one scales proportionally rather than stretching',
      'Process large batches in smaller chunks if your browser starts to feel sluggish, since memory use scales with the number of images',
      'Double check a couple of results from the batch before trusting the whole set, especially if source images have mixed dimensions',
    ],
  },
  'image-collage': {
    intro:
      'Combining several photos into one shareable image, a grid of vacation snapshots, a before/after comparison, or a product collage for a listing, is done here by arranging multiple uploaded images into a collage layout and exporting them as a single file. Social media users creating photo grids and sellers combining multiple product angles into one image both use this instead of a dedicated design app. The layout is composed on canvas locally, so your photos are combined without ever being uploaded.',
    steps: [
      { title: 'Upload multiple images', description: 'Add all the photos you want to include in the collage.' },
      { title: 'Choose a layout', description: 'Pick a grid or arrangement style for how the images will be placed.' },
      { title: 'Adjust spacing and order', description: 'Rearrange images and tweak spacing between them if supported.' },
      { title: 'Export the collage', description: 'Download the combined collage as a single image file.' },
    ],
    faqs: [
      { question: 'How many photos can I combine into one collage?', answer: 'The tool supports combining several images at once into grid-style layouts, generally enough for typical social media or comparison collages.' },
      { question: 'Can I control the order of images in the collage?', answer: 'Yes, you can arrange which image appears in which position within the chosen layout.' },
      { question: 'What file format is the exported collage?', answer: 'The combined collage is exported as a single JPEG or PNG image.' },
      { question: 'Does image quality suffer when combined into a collage?', answer: 'Each source image is placed at the resolution the layout allows, so very small collage cells will show less detail than the original full-size photo.' },
      { question: 'Are my images uploaded to build the collage?', answer: 'No, the collage is composed locally on a canvas in your browser.' },
    ],
    useCases: [
      'Building a grid of vacation photos to share as a single image on social media',
      'Creating a before/after comparison image from two related photos',
      'Combining multiple angles of a product into one collage for a marketplace listing',
      'Putting together a photo grid announcement image for an event or celebration',
    ],
    tips: [
      'Use similarly sized and oriented source photos for the cleanest-looking grid layout',
      'Keep the collage to a handful of images if you want each one to stay large enough to show real detail',
      'Export as PNG if any source images have transparency you want preserved in the final collage',
    ],
  },
  'meme-generator': {
    intro:
      'Adding the classic bold top and bottom caption text to any image for a shareable meme takes seconds here, with control over font size, color, and stroke so the text stays readable over any background. It is a quick tool for anyone reacting to a trending image or making an inside joke for a group chat without opening a design app. The text is rendered onto the image using canvas locally, and the finished meme is exported directly to your device.',
    steps: [
      { title: 'Upload the base image', description: 'Choose the photo or picture you want to turn into a meme.' },
      { title: 'Enter top and bottom text', description: 'Type your caption text for the top and bottom of the image.' },
      { title: 'Style the text', description: 'Adjust font size, color, and outline so the caption stays legible.' },
      { title: 'Download the meme', description: 'Export the finished meme image to share.' },
    ],
    faqs: [
      { question: 'Can I use any image as the meme base?', answer: 'Yes, any JPEG, PNG, or WebP image you upload can be used as the meme background.' },
      { question: 'Can I adjust the font and text size?', answer: 'Yes, font size and text color can be adjusted so captions fit and remain readable over different backgrounds.' },
      { question: 'Does the meme text get baked into the image?', answer: 'Yes, the text is rendered permanently onto the image pixels when you export, so it displays correctly wherever you share it.' },
      { question: 'Is there a limit on how much text I can add?', answer: 'Longer captions will wrap or shrink to fit within the top and bottom caption areas, but very long text can start to look cramped.' },
      { question: 'Is my image uploaded to a meme service?', answer: 'No, the entire meme is generated locally in your browser using canvas text rendering.' },
    ],
    useCases: [
      'Reacting to a trending image with a quick top/bottom caption for a group chat',
      'Making an inside joke image to share with friends without opening a design app',
      'Turning a screenshot into a meme format for a social media post',
      'Adding classic meme-style captions to a reaction image on short notice',
    ],
    tips: [
      'Use a thick text outline/stroke so captions stay readable over busy or light-colored backgrounds',
      'Keep captions short, long text will wrap or shrink and can start to look cramped in the caption area',
      'Bump the font size up for images meant to be viewed small, like in a chat thumbnail, so the text stays legible',
    ],
  },
  'qr-generator': {
    intro:
      'From sharing Wi-Fi credentials at a cafe to printing a vCard on a business card or linking a poster to a website, this tool generates high-resolution QR codes and barcodes for URLs, Wi-Fi networks, vCards, and more, all rendered at print-ready resolution. Event organizers, small business owners, and marketers use it to create scannable codes without relying on a third-party QR service that might expire or track scans. The QR and barcode images are generated entirely client-side, so the encoded data never passes through an external server.',
    steps: [
      { title: 'Choose a data type', description: 'Select what you want to encode: a URL, Wi-Fi network, vCard contact, plain text, or barcode data.' },
      { title: 'Enter the details', description: 'Fill in the relevant fields, such as the URL, Wi-Fi password, or contact info.' },
      { title: 'Customize appearance', description: 'Adjust size, color, or error correction level if available.' },
      { title: 'Download the code', description: 'Export the generated QR code or barcode as a high-resolution image.' },
    ],
    faqs: [
      { question: 'Do QR codes generated here expire?', answer: 'No, since the QR code directly encodes your data rather than pointing to a redirect service, it will never expire or stop working.' },
      { question: 'Can I generate a QR code for Wi-Fi login?', answer: 'Yes, entering the network name, password, and security type produces a QR code that phones can scan to join the network automatically.' },
      { question: 'What is a vCard QR code used for?', answer: 'A vCard QR code encodes contact details so scanning it lets someone save your name, phone, and email directly to their contacts, useful for business cards.' },
      { question: 'Can I print the QR code at large sizes?', answer: 'Yes, the code is generated at high resolution so it stays scannable when printed large, such as on posters or signage.' },
      { question: 'Are barcodes supported too, not just QR codes?', answer: 'Yes, common barcode formats are supported alongside QR codes for encoding data.' },
      { question: 'Is the data I enter sent to any server?', answer: 'No, the QR code or barcode image is generated entirely in your browser from the data you type in.' },
    ],
    useCases: [
      'Sharing Wi-Fi credentials at a cafe or office by printing a scannable QR code near the router',
      'Printing a vCard QR code on a business card so contacts can save your info by scanning',
      'Linking a printed poster or flyer to a website or event registration page',
      'Generating barcodes for inventory or product labeling without a paid service',
    ],
    tips: [
      'Raise the error correction level if the QR code will be printed small or placed somewhere it might get partially obscured, like on packaging',
      'Test scan the generated code with a phone before printing it at scale, especially for posters and signage',
      'Since the data is encoded directly rather than through a redirect link, double-check the entered content is correct before generating, as it cannot be edited after printing',
    ],
  },
};
