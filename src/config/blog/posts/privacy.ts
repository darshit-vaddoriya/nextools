import { BlogPost } from '../types';

export const PRIVACY_POSTS: BlogPost[] = [
  {
    slug: 'why-client-side-tools-are-safer',
    title: 'Why browser-based tools are safer than upload-based ones',
    description: 'The difference is not a privacy policy. It is whether a copy of your file exists on someone else\'s hardware at all.',
    excerpt: 'A promise to delete your file after an hour is only as good as the company making it. Never sending the file removes the question entirely.',
    category: 'privacy',
    tags: ['privacy', 'client-side', 'wasm'],
    published: '2026-08-11',
    relatedTools: ['pdf-merge', 'image-compressor', 'ai-bg-remover', 'json-formatter'],
    body: `Search for any file conversion task and you will find a dozen sites offering it. Nearly all of them work the same way: you upload the file, a server processes it, you download the result. Somewhere in the footer, a line promises the file is deleted after an hour.

There is a category of tool that does not work that way, and the difference is structural rather than a matter of policy.

## What "uploading" actually involves

When you upload a document, it does not sit in one place. In a typical deployment it passes through:

- A **CDN or reverse proxy** at the edge
- A **load balancer**
- One or more **application servers**
- Possibly an **object store** (S3 or equivalent) for the working copy
- **Log files** recording the request, often on several of the above
- **Backup snapshots** of any of that storage
- Whatever **subprocessors** the service uses for compute or storage

A deletion policy usually covers the first copy. Whether it covers cached copies at the edge, entries in access logs, or a nightly backup snapshot taken twenty minutes after your upload is a question most policies do not answer.

None of this requires bad intent. It is the ordinary architecture of a web service.

## The things that can go wrong without malice

- **A misconfigured storage bucket.** Publicly readable object stores have exposed millions of documents across many well-documented incidents.
- **A breach.** If a copy exists, it can be stolen.
- **A subpoena or legal request** to the service operator.
- **An acquisition.** The company you trusted is bought, and the data goes with it.
- **A policy change.** Terms are updated; your file was uploaded under the old ones.
- **Training data.** "We may use uploaded content to improve our services" appears in a lot of terms of service.
- **An employee** with database access and curiosity.

Each is individually unlikely. In aggregate, over thousands of documents and dozens of services, they are not.

## What changed technically

The reason server-side processing was standard is that browsers used to be too weak for the work. That stopped being true:

- **WebAssembly** runs compiled C and Rust at near-native speed, so libraries like PDF renderers, image codecs, video tools and OCR engines run in a tab.
- **The Web Crypto API** provides native AES, SHA-2 and a secure random source.
- **Canvas and OffscreenCanvas** encode and decode JPEG, PNG and WebP natively.
- **Web Workers** keep heavy work off the main thread so the interface stays responsive.
- **WebGPU** gives access to the graphics card, which is what makes on-device machine-learning models practical.
- **The File System Access API** reads large files without loading them entirely into memory.

Put together, a browser tab is now a capable computing environment. The tasks people most commonly hand to a server, merging PDFs, compressing images, formatting JSON, hashing a file, removing a background, are all comfortably within reach.

## The honest limitations

Client-side is not a magic property, and it is worth being precise about what it does not give you.

- **You still run the site's code.** A compromised or malicious site could exfiltrate data before processing it. Client-side removes the need to trust a server with your file; it does not remove the need to trust the code.
- **It is slower for heavy work.** A datacentre GPU beats a laptop. On-device AI takes seconds where a server takes a fraction of one.
- **Your device sets the ceiling.** A 2 GB video will strain a phone.
- **Some things genuinely need a server.** Anything requiring a licensed database, a third-party API, or coordination between users cannot be done locally.

## How to tell which kind you are using

- **Watch the network tab.** A client-side tool shows no upload request when you select a file. This is the definitive test and it takes ten seconds.
- **Try it offline.** Load the page, disconnect, then use the tool. If it works, the file is not going anywhere.
- **Look for an upload progress bar.** Its presence means a transfer; its absence is a good sign.
- **Check for size limits.** Server-side services cap file sizes to control bandwidth costs. Client-side tools are limited by your own memory, not by policy.

## The reasonable default

Not everything needs this level of care. A meme does not.

A lease, a medical report, a passport scan, an unreleased product photo, a customer export, a production API token, these do. For that category, the question "is a copy of this on someone else's hardware?" has a much better answer than "for how long?".

Every tool on NextTool is built the second way, which is why there are no size limits, no accounts, and no upload progress bars.`,
  },

  {
    slug: 'exif-metadata-in-your-photos',
    title: 'What your photos reveal: EXIF metadata and how to remove it',
    description: 'Photos carry GPS coordinates, timestamps, device serial numbers and more. What is stored, which platforms strip it, and how to check your own files.',
    excerpt: 'A photo posted from home can contain the coordinates of the room it was taken in, accurate to a few metres, in a field nobody thinks to look at.',
    category: 'privacy',
    tags: ['exif', 'metadata', 'photos', 'gps'],
    published: '2026-08-19',
    relatedTools: ['image-metadata', 'image-convert', 'image-compressor', 'pdf-metadata'],
    body: `Every photo your phone or camera takes is accompanied by a block of metadata called EXIF, written into the file alongside the pixels. It is invisible in normal viewing and often more revealing than the image.

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
  },

  {
    slug: 'what-happens-when-you-upload-a-file',
    title: 'What actually happens to a file you upload to a free online tool',
    description: 'A walk through the infrastructure an uploaded document passes through, and which parts a "deleted after 1 hour" policy typically does not cover.',
    excerpt: 'The file does not go to one computer. Following its actual path explains why deletion promises are harder to keep than they sound.',
    category: 'privacy',
    tags: ['privacy', 'uploads', 'data-retention'],
    published: '2026-08-26',
    relatedTools: ['pdf-compress', 'pdf-merge', 'image-compressor', 'pdf-redact'],
    body: `Free online converters are useful and enormously popular. It is worth understanding what happens after you click upload, not because these services are malicious, but because the ordinary architecture of a web service creates more copies than most people picture.

## The journey

**1. Your browser sends the bytes.** Over HTTPS, so the network path is encrypted. Encryption in transit protects against interception; it says nothing about what the destination does.

**2. A CDN or edge proxy receives it.** Large sites sit behind Cloudflare, Fastly or similar. The request terminates there, is decrypted, and is forwarded on. The edge provider handled your file in plaintext, and its logs record the transaction.

**3. A load balancer routes it** to an available application server.

**4. The application server writes it to disk.** Processing libraries generally need a file path, so the upload is written to temporary storage, commonly \`/tmp\`.

**5. It may be copied to object storage.** In a horizontally scaled deployment, the machine that processed the file may not be the one that serves the download, so the input and output are placed in shared storage such as S3.

**6. Logs are written at several layers.** Web server access logs, application logs, error logs. If processing failed, the error log may contain a stack trace including file contents or metadata. Logs are frequently shipped to a third-party aggregation service.

**7. Backups run on schedule.** If a nightly snapshot of the storage volume runs while your file is present, it is in that backup, and backups are typically retained for weeks or months, on a schedule that has nothing to do with the one-hour deletion policy.

## What "deleted after 1 hour" usually means

In good faith, it means a scheduled job removes the primary copy from working storage after an hour. That is a real and meaningful commitment.

What it typically does not cover:

- **Backup snapshots**, retained on their own schedule
- **Log entries** referencing or containing the file
- **CDN caches** of the output file, which can persist independently
- **Copies in a subprocessor's infrastructure**
- **Whether "deleted" means overwritten** or merely unlinked from the filesystem

None of this implies dishonesty. It reflects the fact that deleting every trace of a file from a distributed system is genuinely hard, and most policies are written about the part the operator directly controls.

## Read the terms, specifically

Some free tools reserve broad rights in their terms of service. Clauses worth looking for:

- A licence to **store, reproduce or modify** uploaded content
- Permission to use uploaded content **to improve services**, which now often means training models
- **Sharing with partners or affiliates**
- **No stated retention period** at all
- Jurisdiction and applicable law, which affects what recourse you have

A free service has costs. If the funding model is not obvious from advertising, it is worth asking what it is.

## A proportionate approach

Not every file warrants this analysis. Sort by consequence:

**Low.** Memes, public documents, stock photos, sample data. Upload freely.

**Medium.** Internal drafts, non-sensitive work documents, personal photos without location data. Prefer a tool that does not upload; not a crisis if you use one that does.

**High.** ID documents, contracts, medical records, financial statements, anything containing other people's personal data, credentials, unreleased commercial material. **Do not upload these to a free tool.** Use software that runs locally.

That last category is, awkwardly, the one people upload most, because it is exactly the sort of document that needs merging, compressing and redacting.

## Regulatory dimension

If the file contains other people's personal data, uploading it to a third-party service is a **data transfer to a processor**. Under GDPR and similar regimes, that requires a lawful basis, an agreement with the processor, and consideration of where the data is stored geographically.

Uploading a customer list to a free converter to reformat it is, in strict terms, a disclosure to a party you have no agreement with. Most organisations that would be alarmed by this have no policy addressing it.

## Checking for yourself

Open your browser's developer tools, go to the Network tab, and select a file in whichever tool you use. If a request appears carrying your file, it was uploaded. If nothing does, it was not.

That is the whole test, and it is worth doing once for any tool you use regularly. Every tool on NextTool, [compression](/tool/pdf-compress), [merging](/tool/pdf-merge), [redaction](/tool/pdf-redact), will show you nothing in that tab, because there is no endpoint to send anything to.`,
  },

  {
    slug: 'cookies-tracking-and-what-you-can-control',
    title: 'Cookies, tracking and what you can actually control',
    description: 'First-party versus third-party cookies, fingerprinting, and which browser settings genuinely change what is collected about you.',
    excerpt: 'Clicking "reject all" on a consent banner does less than most people assume, and there are a handful of settings that do considerably more.',
    category: 'privacy',
    tags: ['cookies', 'tracking', 'fingerprinting', 'gdpr'],
    published: '2026-09-02',
    relatedTools: ['user-agent-parser', 'url-parser', 'secure-notes'],
    body: `Cookies are small pieces of text a site asks your browser to store and send back on later requests. HTTP is stateless, so without them a site could not keep you logged in between two clicks. They are infrastructure, not surveillance, the surveillance comes from how some of them are used.

## First-party and third-party

**First-party cookies** are set by the site you are visiting. Session cookies, your theme preference, items in a cart. These are what make a website work.

**Third-party cookies** are set by a different domain whose content is embedded in the page, an ad network, an analytics provider, a social widget. Because the same third party is embedded across many sites, it can recognise the same browser on each of them and build a profile of the pages you visit.

This is the distinction that matters, and it is the one consent banners are ultimately about.

## The state of third-party cookies

They have been blocked by default in Safari since 2020 and in Firefox since 2019. Chrome's plans have shifted repeatedly, but the direction across the industry is clear.

This has not ended tracking. It has moved it:

- **Server-side tagging**, where tracking requests are proxied through the publisher's own domain and therefore look first-party.
- **First-party identifiers** shared between sites via other channels.
- **Fingerprinting**, which needs no storage at all.

## Fingerprinting

Rather than storing an identifier, fingerprinting derives one from the characteristics your browser reveals in the course of ordinary operation: user agent string, screen resolution, time zone, installed fonts, language, hardware concurrency, and the precise way your graphics stack renders a test image on a canvas.

Individually these are unremarkable. Combined, they are often unique among millions of browsers. And because nothing is stored, **clearing cookies does not reset a fingerprint.**

Defences are partial. Firefox and Safari actively resist fingerprinting by normalising or restricting some of these signals. The Tor Browser goes furthest by making everyone look identical, at a real cost to usability.

## What consent banners actually do

Under GDPR and the ePrivacy Directive, consent is required before setting non-essential cookies. Strictly necessary ones, session, security, load balancing, do not need consent.

In practice, banner quality varies enormously. Some genuinely gate all non-essential storage behind your choice. Others set tracking cookies before you interact at all, which regulators across Europe have repeatedly fined organisations for.

"Reject all" is worth clicking. It is not a guarantee, and it does nothing about fingerprinting.

## Settings that genuinely help

**Block third-party cookies.** Available in every major browser. The single highest-value setting, and it breaks very little.

**Use a content blocker.** Blocking tracker requests at the network level stops them running at all, which is more effective than declining the cookie they would have set. uBlock Origin is the standard recommendation.

**Turn on the browser's tracking protection.** Firefox's Enhanced Tracking Protection and Safari's Intelligent Tracking Prevention are on by default and worth leaving on.

**Use container tabs or separate profiles** for accounts you want kept apart.

**Clear cookies on close** for sites you do not need to stay logged into.

**Prefer a search engine that does not build a profile.** Search history is among the most revealing data anyone holds about you.

## What does not help as much as advertised

- **Private/incognito mode.** It stops your browser storing history and cookies locally after the session. Sites, your employer and your ISP see exactly the same traffic. It is not anonymity.
- **A VPN.** It hides your IP address from sites and your traffic from your ISP. It does not stop cookies, fingerprinting, or a logged-in account identifying you. You are also transferring trust from your ISP to the VPN operator.
- **"Do Not Track".** A header that asked sites politely to stop. Almost universally ignored, and now removed from most browsers. Global Privacy Control is a successor with actual legal weight in some jurisdictions.

## Being realistic

Total avoidance of tracking on the web is not achievable without giving up most of its usefulness. What is achievable is materially reducing the number of parties collecting data about you, and the amount they get.

Blocking third-party cookies and running a content blocker takes five minutes and removes the large majority of routine cross-site tracking. That is a good return.

And for the narrower question of what a *tool* does with your data, the strongest answer is not a policy but an architecture: if a tool never receives your file, there is no retention question to ask. That is the standard the rest of this site is built to.`,
  },
];
