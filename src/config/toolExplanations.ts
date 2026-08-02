// Easy-English explanations for every working tool.
// Each entry explains in simple words what the tool does and how to use it.

export const TOOL_EXPLANATIONS: Record<string, string> = {
  'json-formatter':
    'Makes messy JSON easy to read by adding proper spacing and indentation. You can also shrink it to save space, check if it is valid, and explore it as a tree. Paste your JSON in the box and the formatted version appears instantly. Use the buttons to copy, download, or switch between tree and code view.',

  'base64':
    'Converts text or files into Base64, and converts Base64 back into the original data. Base64 is commonly used to send data safely inside emails, URLs, or JSON. Type your text or pick a file, then choose Encode or Decode. The result can be copied with one click.',

  'hash-generator':
    'Turns any text into a fixed-length fingerprint using MD5, SHA-1, SHA-256 or SHA-512. Hashes help you check that data has not been changed, or store passwords safely. Type or paste your text, choose a hash type, and the result appears instantly. Hashes are one-way, so they cannot be converted back to the original text.',

  'uuid-generator':
    'Creates random unique IDs (UUID v4) that are used to identify records, files, or users. Every generated ID is different, so you can use them without worrying about duplicates. Choose how many IDs you need and any formatting options, then copy the list or download it.',

  'password-generator':
    'Creates strong random passwords that are hard to guess. You can control the length and choose which characters to include, such as uppercase letters, lowercase letters, numbers and symbols. Tick the options you want, adjust the length, and generate. The strength meter shows how secure the password is, and you can copy it in one click.',

  'regex-tester':
    'Lets you test regular expressions against sample text and see matches highlighted instantly. It is great for validating emails or phone numbers, and for extracting parts of text. Type your pattern in the pattern box and your test text in the other box, pick the flags you need, and watch the matches update live.',

  'case-converter':
    'Changes text between different naming styles such as camelCase, snake_case, kebab-case, PascalCase, UPPERCASE and lowercase. This is handy for programming variable names or cleaning up text. Paste your text, click the style you want, and copy the result.',

  'jwt-decoder':
    'Decodes JWT tokens, the tokens used for logins and APIs, so you can see what is inside them. It splits the token into its header, payload and signature and shows them separately. Paste your JWT and it is decoded instantly, letting you inspect the claims and check the expiry time.',

  'word-counter':
    'Counts words, characters, sentences, paragraphs and the estimated reading time for any text. It is useful for essays, articles, tweets and social media posts. Paste or type your text and the counts update live as you write.',

  'text-counter':
    'Gives detailed statistics about your text, such as word frequency, sentence stats and readability scores. It helps writers understand and improve their writing. Paste your text and explore the numbers to see how readable your content is.',

  'color-picker':
    'Lets you pick any color from an image or a color input and get its HEX, RGB and HSL values instantly. Upload an image and click on any pixel, or use the color input to choose a shade. Then copy the value in whichever format you need.',

  'color-converter':
    'Converts colors between HEX, RGB, HSL, HSV and CMYK formats. It is useful for designers and developers who work across different color systems. Enter a color in any format and all the other formats are shown at once, so you can copy the one you need.',

  'pdf-merge':
    'Combines multiple PDF files into one single document. You can drag the files to reorder them before merging. Select or drop your PDF files, arrange them in the order you want, then click Merge. The combined file downloads straight to your device.',

  'ai-bg-remover':
    'Removes the background from any image automatically using an AI model. The result is a cutout with a transparent background that you can use in designs. Drop in an image, wait a few seconds while it processes, and download the result. Everything runs on your device.',

  'image-resize':
    'Changes an image to exact pixel dimensions or by a percentage. It is useful for making images fit websites, social media or email. Upload your image, enter the new size or a percentage, keep the aspect ratio if you want, and download the resized file.',

  'image-crop':
    'Cuts an image down to a selected area and can lock the aspect ratio, for example 1:1 or 16:9. Upload your image, drag the crop box over the part you want to keep, choose an aspect ratio if you need one, and download the result.',

  'image-rotate':
    'Rotates or flips an image by any angle. You can fix a sideways photo or flip it horizontally and vertically. Upload your image, use the rotate and flip buttons to get the orientation right, then download the result.',

  'image-flip':
    'Mirrors an image horizontally or vertically, like looking at it in a reflection. Upload your image, choose flip horizontal or flip vertical, and download the mirrored version.',

  'image-convert':
    'Changes images from one file format to another, for example JPG to PNG, WebP or BMP. You can convert several images at once, or convert and download each one on its own. Upload your images, pick the target format, then click Convert on any file to convert just that one, or Convert All to do the whole batch.',

  'image-compressor':
    'Reduces the file size of images without a visible drop in quality. This helps photos load faster on websites and fit within email limits. Drop your images, adjust the quality slider, and download the smaller versions. You can compare the before and after sizes.',

  'image-adjust':
    'Adjusts the brightness, contrast, saturation, hue and sharpness of an image using simple sliders. Upload your image and move the sliders until it looks the way you want, then download the result.',

  'image-sharpen':
    'Makes blurry photos look crisper by increasing the detail at edges. Upload your image and adjust the sharpening strength until you are happy with the result, then download it.',

  'svg-converter':
    'Converts SVG vector images into PNG or JPG at any size. It is useful for turning logos and icons into image formats that work everywhere. Upload your SVG, set the resolution or scale you need, and download the converted image.',

  'image-metadata':
    'Removes hidden data from images, such as camera details, GPS location and editing history, to protect your privacy before sharing. Upload your image and it is cleaned automatically. Download the version with the metadata removed.',

  'image-watermark':
    'Adds a text or logo watermark to your images with control over size, opacity and position. It is useful for protecting your photos from being reused without permission. Upload your image, enter your text or logo, adjust the settings, and download the watermarked image.',

  'qr-generator':
    'Creates QR codes for URLs, Wi-Fi networks, vCards, plain text and more. Anyone can scan them with a phone camera. Choose the QR type, fill in the details, customize the colors if you like, and download the code as PNG or SVG.',

  'ocr-image':
    'Extracts written text from an image or scanned document so you can copy, edit or search it. Upload a clear image that contains text and wait while the tool reads it. Then copy or download the extracted text.',

  'ai-upscaler':
    'Increases the resolution of an image by up to 4x using AI, making small or blurry images larger and sharper. Upload your image, choose the scale such as 2x or 4x, and wait while it processes. Download the enlarged version when it is done.',
};
