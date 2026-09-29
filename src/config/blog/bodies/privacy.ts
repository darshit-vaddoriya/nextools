// Article bodies for the "privacy" topic, split out of posts/privacy.ts.
//
// Bodies are only needed when an article is actually rendered, so they live in
// their own chunk. Keeping them beside the post metadata put every article on
// the site into the entry bundle — downloaded by the homepage and every tool
// page, which never display an article body.
export const PRIVACY_BODIES: Record<string, string> = {
  'exif-metadata-in-your-photos': `Every photo your phone or camera takes is accompanied by a block of metadata called EXIF, written into the file alongside the pixels. It is invisible in normal viewing and often more revealing than the image.

## What is in there

**Location.** If location services were enabled for the camera, the file contains GPS latitude and longitude, typically accurate to a handful of metres, plus altitude and sometimes compass bearing. A photo taken in your living room contains your home address in a form any mapping tool can read directly.

**Time.** Original capture timestamp, often with time zone.

**Device.** Make, model, lens, and on many cameras a **body serial number**. That serial number links every photo taken with that camera, across accounts and platforms, which is a stronger identifier than most people realise.

**Camera settings.** Aperture, shutter speed, ISO, focal length, flash. Harmless, and genuinely useful for photographers.

**Software history.** Which editor touched the file and when. XMP records can retain an edit history.

**Embedded thumbnail.** A small preview image. Critically, **this is not always regenerated when the main image is edited**. There are documented cases of a cropped photo retaining a thumbnail showing the uncropped original, including the part that was cropped out precisely because it was sensitive.

**Author and copyright**, where set, often the photographer's real name.

## The realistic risks

- **Home and workplace location** from personal photos.
- **Pattern of life.** A set of timestamped, geotagged photos reconstructs where someone was and when.
- **Device linking.** The serial number connects a pseudonymous account to a named one.
- **Marketplace listings.** Selling furniture with a photo geotagged to your home advertises where the item, and you, can be found.
- **Sources and safety.** For journalists, activists and anyone in a domestic-abuse situation, location metadata is a concrete physical risk.

## Which platforms strip it

Most large social platforms strip EXIF on upload, partly for privacy, mostly because re-encoding images saves them bandwidth. Facebook, Instagram, X and WhatsApp generally remove it from images shared in-app.

But this is unreliable as a general defence:

- **Email attachments keep everything.** Nothing strips EXIF from a photo attached to an email.
- **Cloud storage links keep everything.** Sharing a Drive or Dropbox link shares the original file.
- **Messaging apps sending "as a document"** rather than as a photo preserve the original, including metadata.
- **Your own website or blog** keeps whatever you uploaded.
- **Platforms strip it from the copy they display, while retaining the original.** The metadata is removed from your viewers, not from the company.

The rule: metadata is stripped only when a platform re-encodes the image, and only for the copy other people see.

## Removing it

**The reliable method: re-encode the image.** Converting a JPEG to a new JPEG, PNG or WebP writes fresh pixel data with no metadata block. This removes everything, including the embedded thumbnail. Resizing does the same thing as a side effect.

**Selective removal** is better when some metadata is wanted, a photographer may want camera settings and copyright retained while stripping GPS. This needs a tool that edits specific EXIF tags rather than dropping the whole block.

**Screenshotting a photo** removes all metadata, at the cost of quality and resolution.

Note that **a screenshot has its own metadata**, and on some systems includes the device model and the time.

## PDFs and documents too

This is not only a photo issue. PDFs carry author, title, producing software, and creation and modification timestamps. Word documents historically carried the author name, the company, the file path, and revision history, which has embarrassed organisations that published documents without checking.

If you are publishing a document anonymously or externally, check its properties before you send it.

## Checking your own files

The only way to know what a file contains is to look. NextTool's [image metadata viewer](/tool/image-metadata) shows every EXIF field in a photo, and the [PDF metadata tool](/tool/pdf-metadata) does the same for documents. Both read the file in your browser, which is the correct behaviour for a tool whose entire purpose is finding out whether a file contains something you did not want to share.

Take a photo with your phone right now and inspect it. Most people are surprised by how precise the coordinates are.`,
};
