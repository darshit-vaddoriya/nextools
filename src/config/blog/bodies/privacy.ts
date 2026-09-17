// Article bodies for the "privacy" topic, split out of posts/privacy.ts.
//
// Bodies are only needed when an article is actually rendered, so they live in
// their own chunk. Keeping them beside the post metadata put every article on
// the site into the entry bundle — downloaded by the homepage and every tool
// page, which never display an article body.
export const PRIVACY_BODIES: Record<string, string> = {
  'why-client-side-tools-are-safer': `Search for any file conversion task and you will find a dozen sites offering it. Nearly all of them work the same way: you upload the file, a server processes it, you download the result. Somewhere in the footer, a line promises the file is deleted after an hour.

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

Every tool on NextTool is built the second way, which is why there are no size limits, no accounts, and no upload progress bars. Whether it is [compressing a PDF](/tool/pdf-compress), [stripping image metadata](/tool/image-metadata) or [generating a password](/tool/password-generator), the file and the secret stay on your machine.`,
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
  'what-happens-when-you-upload-a-file': `Free online converters are useful and enormously popular. It is worth understanding what happens after you click upload, not because these services are malicious, but because the ordinary architecture of a web service creates more copies than most people picture.

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
  'cookies-tracking-and-what-you-can-control': `Cookies are small pieces of text a site asks your browser to store and send back on later requests. HTTP is stateless, so without them a site could not keep you logged in between two clicks. They are infrastructure, not surveillance, the surveillance comes from how some of them are used.

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

And for the narrower question of what a *tool* does with your data, the strongest answer is not a policy but an architecture: if a tool never receives your file, there is no retention question to ask. That is the standard the rest of this site is built to. For the narrower thing you can do today, a [URL parser](/tool/url-parser) shows you which tracking parameters a link is carrying before you share it, and [secure notes](/tool/secure-notes) keep their contents in your own browser rather than in an account.`,
  'what-your-browser-announces': `Here is what Chrome on Windows sends on every single request:

\`\`\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
\`\`\`

It claims to be Mozilla, and AppleWebKit, and like Gecko, and Safari. Only one of those words is accurate, and the string is a fossil record of thirty years of browsers lying to websites that were checking the wrong thing.

## Why it is nonsense

Netscape shipped as Mozilla/2.0 and supported frames. Sites started checking for "Mozilla" before serving framed pages. When Internet Explorer arrived supporting frames too, sites served it the degraded version, so IE added "Mozilla" to its own string.

The same thing happened repeatedly. Safari claimed KHTML compatibility. Chrome claimed both WebKit and Safari. Every browser accumulated the tokens of its predecessors, because sniffing code kept excluding anything it did not recognise.

The lesson generalises: **detecting a browser by name has always been a bad idea, and the string is unreliable precisely because so many people did it.**

A [user agent parser](/tool/user-agent-parser) is genuinely useful for reading a log entry and working out what a visitor was running. It is the wrong basis for deciding what code to serve them. For that, test for the feature you actually need, because the answer is then correct by construction and does not need updating when a new browser appears.

## It is also a fingerprint

The user agent on its own is weak identification. Millions of people share the exact same string.

The problem is that it does not travel alone. Every request carries headers, and every page can query dozens of properties: screen resolution, colour depth, timezone, installed fonts, language preferences, hardware concurrency, the precise way your GPU renders a test image, the way your audio stack processes a waveform.

None of these identifies you. Combined, they very often do. The Electronic Frontier Foundation's Panopticlick work demonstrated years ago that a browser configuration is frequently unique across very large populations.

> [!WARNING]
> This is why fingerprinting is harder to escape than cookies. There is nothing to delete. The identifiers are emergent properties of your device, and clearing your browsing data changes none of them.

There is a genuine irony here: a rare browser configuration, or a heavily customised privacy setup, can make you *more* identifiable than a default one, because uniqueness is the thing being measured.

## What browsers are doing about it

Because the user agent became a tracking vector with little legitimate use, vendors are actively reducing it.

Chrome has frozen most of the string: the operating system version is reported as a fixed value, and the minor version digits are always zeros. Safari has reported an essentially static string for years. Firefox rounds and freezes several values, and in stricter modes reports a generic platform.

The replacement is User-Agent Client Hints, where the browser sends only low-entropy basics by default and a site must explicitly request more. That request is visible and can be refused, which is the meaningful difference.

The practical consequence for anyone parsing these: **the precise OS version you see in a log is increasingly fictional.** Analytics broken down by minor browser version is measuring an artefact.

## The other things a request carries

Beyond the user agent, every request includes headers worth knowing about.

\`Accept-Language\` sends your language preferences in order, which is a surprisingly strong signal. A preference list of English, Gujarati, Hindi narrows a population considerably.

\`Referer\` tells the destination which page you came from, including the full URL unless a referrer policy limits it. This is why putting a secret in a URL leaks it: the next site you click through to receives that URL in a header.

\`Accept\` lists the content types the browser will take, which is where [MIME types](/tool/mime-checker) come back in. The server uses it to decide what to send, and it differs enough between browsers to be another fingerprint component.

And the URL itself carries more than people expect. Tracking parameters like \`utm_source\`, \`fbclid\` and \`gclid\` are appended by the sites you came from and travel with the link when you share it. A [URL parser](/tool/url-parser) that breaks a link into components is the quickest way to see what you would actually be forwarding, and most of those parameters can be deleted without breaking the link.

## What actually helps

Given that fingerprinting resists the usual countermeasures, the honest list is short.

**Use a mainstream browser in a mainstream configuration.** Blending in beats standing out.

**Use a browser that actively resists fingerprinting.** Firefox with resist-fingerprinting, Safari, or Tor Browser, all of which deliberately return generic values so that many users look identical.

**Reduce the number of parties asking.** A content blocker does not change your fingerprint, and it does cut how many third parties get to collect it.

**Strip tracking parameters before sharing a link.** This one is entirely within your control and takes seconds.

What does not help is randomising values with an extension, which usually makes you more distinctive rather than less, in the same way that a disguise nobody else is wearing is not camouflage.

Parsing a user agent or a URL is string manipulation, so the [parser](/tool/user-agent-parser) and [URL parser](/tool/url-parser) here run in your own browser. Given that the strings people paste into online parsers come from their own server logs, complete with visitor IPs and session identifiers, that is not a trivial distinction.`,
  'a-backup-that-actually-works': `Someone deletes a folder on Monday. On Tuesday they discover it, open their cloud drive, and find the folder deleted there too. The sync worked perfectly. That was the problem.

## Sync is not backup

This is the misunderstanding that costs the most data, and it is easy to hold because the two look identical day to day.

**Sync** makes every device match. It is a mirror. Delete a file, corrupt a file, or have ransomware encrypt a file, and that change is faithfully propagated everywhere within seconds. The mirror is doing its job.

**Backup** keeps a copy of how things were at a point in the past, independent of what happens to the original.

Most consumer sync services do keep version history, typically 30 days, which covers accidental deletion if you notice quickly. It does not cover the folder you deleted eight months ago, the corruption you did not spot, or an account you lose access to.

## What 3-2-1 is actually for

**Three copies.** The original plus two backups. Two copies means one failure away from one copy, and drives fail in pairs more often than intuition suggests, especially if they were bought together and have run the same hours.

**Two different media.** An external drive and cloud storage, or a drive and a NAS. The point is uncorrelated failure modes: a power surge, a bad firmware update or a filesystem bug will not hit two unlike systems the same way.

**One off-site.** This is the one people skip, and it is the one that covers fire, flood and theft. An external drive sitting next to the laptop is in the same building as the thing it is protecting against.

Each number answers a distinct failure. Dropping any one leaves that failure uncovered.

## Ransomware changes one rule

Ransomware encrypts everything it can reach, including attached drives and mapped network shares. A backup drive that is permanently plugged in is not a backup against it.

So the useful addition is **one copy that is offline or immutable**: a drive that is unplugged between backups, or cloud storage with object-lock or versioning that the client credentials cannot override.

> [!WARNING]
> If your backup is reachable and writable from the machine being backed up, at all times, it shares that machine's fate. Rotation between two drives, with one always disconnected, costs nothing and solves it.

## Archiving before you copy

For a set of files going into cold storage, bundling them is worth doing for reasons that are not about size.

A [zip archive](/tool/zip-creator) preserves the folder structure, keeps filenames and text encodings intact, and gives every entry a CRC-32 checksum so a damaged archive fails loudly on extraction instead of yielding quietly corrupt files.

Just do not expect it to save space. Photographs, video and Office documents are already compressed and will not shrink; [text, CSV and logs](/blog/what-actually-compresses-in-a-zip) genuinely will.

If you would rather keep files individually restorable, [batch zipping](/tool/batch-zip) produces one archive per item, which means a single corrupt archive costs you one document rather than the set.

## Verifying, which is the part that gets skipped

A copy that completed without an error message is not the same as a copy that is correct. Media degrades, transfers truncate, and filesystems occasionally lie.

A [checksum](/tool/file-checksum) settles it. Hash the original, hash the restored copy, compare. Identical hashes mean identical bytes, with certainty rather than optimism. This is the same mechanism as [verifying a download](/blog/verify-a-download-with-checksums), applied to your own files.

> [!TIP]
> Store a plain text file of checksums alongside the archive. Years later that file is what tells you whether the data is still intact, and it costs a few kilobytes.

## Restore, or it is not a backup

The single most common discovery during a real incident is that the backup has been silently failing for months, or that nobody knows the passphrase, or that the archive needs software no longer installed.

A restore test is not elaborate. Twice a year, pick a few files at random, restore them somewhere else, open them, and checksum them against the originals. That is the entire exercise, and it converts a backup from an assumption into a fact.

While you are there, check that you can still get in. Encryption passphrases, recovery codes and account credentials all need to be recoverable **without** access to the machine you are restoring. A password manager on the dead laptop is not available; [encrypted notes](/tool/secure-notes) stored in your browser are on that machine too. Recovery codes belong on paper, somewhere else.

## A plan that fits an evening

1. Decide what genuinely matters. Documents, photos, tax records, keys. Not the operating system, which is reinstallable.
2. Turn on version history in whatever cloud storage you already use. That is copy one.
3. Get an external drive, copy everything, unplug it. That is copy two, offline.
4. Archive anything historical with [zip](/tool/zip-creator) and write a [checksum](/tool/file-checksum) list next to it.
5. Put recovery codes and passphrases on paper, somewhere other than your desk.
6. Diary a restore test for six months from now.

Step six is the one that decides whether any of the rest was worth doing.`,
  'browser-permissions-and-extensions': `You install an extension and a dialog says it can "read and change all your data on all websites". You click Add, because everything says that.

It is not boilerplate. It is an accurate description, and it includes the tab where you are logged into your bank.

## Where extension code runs

An extension with broad host permissions injects content scripts into pages as they load. That script sits inside the page, with the page's DOM and the page's session.

Concretely, it can read anything rendered on screen, including account balances, message contents and personal details; read form fields as you type, including passwords before submission; see every URL you visit, which is a complete browsing history; and modify the page, which means inserting or altering links and content.

The session cookie does not need to be stolen for any of this. The extension is already inside a page you have authenticated.

## Permissions, roughly ranked

| Permission | What it allows |
|---|---|
| \`<all_urls>\` / all sites | Everything above, everywhere |
| \`tabs\` | URLs and titles of every open tab |
| \`webRequest\` | Observe and modify network traffic |
| \`cookies\` | Read cookies, including session tokens |
| \`downloads\` | See and initiate downloads |
| \`storage\` | Local storage only, low risk |
| \`activeTab\` | The current tab, only after you click the icon |

\`activeTab\` is the one worth knowing about, because it is what a well-built extension asks for. It grants access only to the tab you are on, only when you have explicitly invoked the extension. An extension that needs to act on demand does not need standing access to everything.

## The part that makes it a supply-chain problem

An extension you audited on the day you installed it is not the code running now.

**Updates are silent and automatic.** A new version ships with the same permissions and no prompt.

**Extensions get sold.** A developer with a few hundred thousand users receives an offer; the buyer inherits the install base, the permissions and the update channel. This has repeatedly produced extensions that were genuinely useful for years and then began injecting affiliate links, or exfiltrating browsing history, or worse.

**Developer accounts get phished.** A compromised account pushes a malicious update through the legitimate channel.

> [!WARNING]
> The install decision is not a one-time judgement about today's code. It is standing trust in whoever controls that extension for as long as it stays installed. Treat a large install count as a reason for more caution rather than less, because it is what makes an extension worth buying or attacking.

## Reducing the exposure without giving up extensions

**Narrow the site access.** Both Chrome and Firefox let you change an extension from "on all sites" to "on click" or to a specific list, in the extension's own settings. A grammar checker does not need access to your bank. This one change removes most of the risk and usually costs nothing in functionality.

**Audit what is installed, twice a year.** Remove anything you have not deliberately used. Every installed extension is a standing permission grant, whether you use it or not.

**Check before installing.** When it was last updated, whether the developer is identifiable, whether the permissions match what it claims to do. A "dark mode" extension requesting \`webRequest\` and \`cookies\` is asking for things dark mode does not need.

**Prefer a page you visit over code that watches every page.** This is the honest argument for doing one-off jobs on a site rather than installing a utility extension for them: a page you open has no access to anything except itself, and none when you close the tab.

## The page permissions, separately

Beyond extensions, individual sites request camera, microphone, location, notifications and clipboard access. These are per-site, revocable, and worth reviewing occasionally in your browser's site settings, where you will usually find a handful of grants you made once and forgot.

Location is the one to look at hardest. Precise location is rarely needed by anything that is not a map, and browsers will let you deny it permanently per site rather than being asked each visit.

## What files still give away

None of the above changes what is inside the files you share, which is a separate and often larger leak. Photographs carry [EXIF metadata](/blog/exif-metadata-in-your-photos) including GPS coordinates and device identifiers; documents carry author names and revision history. [Stripping image metadata](/tool/image-metadata) before posting is a habit worth having regardless of how locked down your browser is, because that information travels with the file rather than with the session.

And when you are checking where a link actually goes before granting it anything, a [URL parser](/tool/url-parser) shows you the real host rather than the one the text claims.`,
  'what-incognito-mode-does-not-do': `Private browsing is one of the most misunderstood features in any browser, to the point that Google was sued over the wording of Chrome's own disclaimer and changed it.

The feature itself is simple and narrow. The misunderstanding is about who it protects you from.

## What it actually does

Open a private window and the browser stops writing certain things to disk for that session:

- **Browsing history**, not recorded.
- **Cookies and site data**, kept in memory and discarded when the window closes.
- **Form entries and search bar suggestions**, not saved.
- **Cached files**, not retained.

You also start logged out of everything, because the session begins with an empty cookie jar.

That is the entire feature. It is **local amnesia**: your device forgets. Nothing about the network changes.

## Who still sees everything

| Who | Sees what |
|---|---|
| The websites you visit | Everything, exactly as normal |
| Your internet provider | Every domain you connect to |
| Your employer or school on their network | The same |
| A network administrator | The same |
| Anyone with a device management profile | Potentially everything |

The point is worth repeating because it is the whole misconception: **private browsing hides your activity from other people using the same device, and from nobody else.**

Which makes it genuinely useful for buying a present on a shared laptop, testing whether a site behaves differently for a logged-out visitor, or signing into a second account without disturbing the first. Those are real uses and they are all local.

## The self-defeating part

The moment you log into an account in a private window, you have identified yourself to that service completely. The session is anonymous to your browser history and not to the site.

Searching while signed into a search account, or visiting a site where you then log in, associates the entire session with you. People frequently do this and believe the mode is still protecting something.

## Fingerprinting is unaffected

Private mode gives you a fresh cookie jar. It does not give you a fresh device.

Screen resolution, installed fonts, time zone, language preferences, graphics rendering behaviour and hardware details are all the same in a private window as in a normal one, and the combination is frequently unique. This is the mechanism described in [what your browser announces](/blog/what-your-browser-announces), and clearing cookies does nothing about it.

So a site that fingerprints can often recognise a private-window visitor as the same device that visited yesterday.

> [!NOTE]
> A VPN does not fix this either, for the same reason. It changes your IP address and leaves every device property intact, which is the trade-off set out in [public Wi-Fi and VPNs](/blog/public-wifi-and-vpns).

## Things that survive the session

Two categories persist and surprise people.

**Downloads.** The file stays on your device. The download entry may not appear in the browser's list, but the file is in your downloads folder.

**Bookmarks.** Anything you bookmark during a private session is saved normally.

And a third, less obvious one: if the machine is managed by an employer or school, a device management profile or a monitoring agent can record activity regardless of what mode the browser is in. Private mode is a browser feature and cannot override software sitting underneath it.

## What actually helps, by threat

**Hiding activity from others on your device.** Private mode is exactly right for this.

**Reducing tracking across sites.** A content blocker plus blocking third-party cookies, per [cookies, tracking and what you can control](/blog/cookies-tracking-and-what-you-can-control). Private mode helps only within a single session.

**Hiding which sites you visit from your network.** Encrypted DNS, or a VPN if you accept moving the visibility to the provider.

**Keeping what you send private.** HTTPS already does this, in every mode.

**Not being identified by a file you send.** Nothing about browsing mode touches this. A photograph still carries [its metadata](/blog/exif-metadata-in-your-photos), which is why [stripping it](/tool/image-metadata) is a separate habit worth having.

**Checking where a link goes before clicking.** A [URL parser](/tool/url-parser) reads the real host, which is unaffected by browsing mode either way.

The honest summary: private browsing does one thing well, that thing is local, and almost every privacy concern people open it for is somewhere else entirely.`,
  'email-tracking-pixels': `You open an email and do nothing else. The sender now knows you opened it, approximately when, roughly where you were, and what you read it on.

There was no script involved. Email clients do not run JavaScript. It was an image.

## The pixel

Buried in the message is an image tag like this:

\`\`\`html
<img src="https://track.example.com/o/a8f3d2c1b9.gif" width="1" height="1">
\`\`\`

The image is a transparent 1x1 pixel, invisible in the message. The interesting part is the filename, which is unique to you and this campaign.

When your client fetches that image, the sender's server records the request. From it they learn that recipient \`a8f3d2c1b9\` opened the message, the timestamp, the IP address which gives approximate location, and the user agent, which gives client and platform, as parsed in [what your browser announces](/blog/what-your-browser-announces).

Some senders go further and fire the pixel on every open, which gives them a re-read count, and some embed it in a CSS background rather than an image tag to survive naive blocking.

## Link tracking is separate and harder to avoid

Blocking images stops the pixel. It does not stop the other half.

Almost every link in a commercial email is rewritten to point at the sender's own domain first:

\`\`\`
You see:  Read the article
It is:    https://click.example.com/r/a8f3d2c1b9?u=https%3A%2F%2Freal-site.com%2Farticle
\`\`\`

Clicking hits the sender's server, which records the click against your identifier and then redirects you to the real destination. It happens in a fraction of a second and you land where you expected.

The destination URL is usually sitting right there in the query string, percent-encoded. A [URL parser](/tool/url-parser) will show you both the tracking host and the real target, which is the same reading exercise as in [what you are actually sharing when you paste a link](/blog/cleaning-a-url-before-sharing).

And the URL you arrive at typically carries campaign parameters, often including one that identifies you individually, such as Mailchimp's \`mc_eid\`. Forwarding that link passes your identity along with it.

## What blocks what

| Defence | Stops pixels | Stops link tracking |
|---|---|---|
| Block remote images | Yes | No |
| Apple Mail Privacy Protection | Effectively | No |
| Plain text view | Yes | No |
| Copy the link and strip parameters | n/a | Yes |
| A content blocker in a webmail tab | Partly | Partly |

Blocking remote images is the single most effective setting, and most clients now default to it. The cost is that legitimate images do not load until you allow them, which is a small and visible cost.

> [!NOTE]
> Apple's Mail Privacy Protection takes a different approach: it preloads **every** image through a proxy for **every** message, whether you open it or not. The sender sees an open from a generic Apple address either way, which makes the signal worthless rather than hidden. Since Apple Mail is a large share of the market, reported open rates across the industry are now substantially fiction.

## Checking a message yourself

If you want to know what a particular email is doing, the answer is in its source. Most clients offer "view source" or "show original".

Two things to look for. Any \`<img>\` with a width and height of 1, or with a long random string in the filename, is a pixel. And every link whose host is not the host you would expect is a redirect.

Pulling all of them out at once is what [URL extraction](/tool/extract-urls) is for, and converting the HTML to [Markdown](/tool/html-markdown) is a quick way to see the link targets as plain text rather than reading raw markup.

## Read receipts are a different thing

A read receipt is a formal request, defined in the mail standards, asking your client to send a confirmation. Your client asks you first, and you can say no.

The distinction is consent. A read receipt requests permission. A tracking pixel takes the measurement without asking, and there is no prompt because there is nothing to prompt about: from your client's point of view it is loading an image.

## A proportionate response

- **Turn off automatic image loading.** One setting, most of the benefit.
- **Use the web version of a newsletter** when you actually want the images, rather than allowing them in the message.
- **Copy and clean links** before sharing them onward, so you do not pass your own identifier to other people.
- **Unsubscribe rather than delete.** A sender who knows you never open anything is a sender who eventually stops, and the unsubscribe link in a legitimate email is genuine.

None of this is worth being anxious about for a newsletter you signed up for. It is worth knowing about for the message you were not expecting, because in that case the open itself confirms a live address, which is the same reasoning as in [reading a link before you click it](/blog/spotting-a-dangerous-link).`,
  'saving-a-web-page-properly': `You bookmark a page with terms you will need later. Eight months on the link resolves to a redesigned page with different terms, or to a 404.

A bookmark stores an address. If you needed the content, you did not save it.

## Four ways to keep a page, and what each preserves

| Method | Appearance | Searchable text | Survives redesign | Size |
|---|---|---|---|---|
| Bookmark | No | No | No | Nothing |
| Screenshot | Yes, partially | No | Yes | Large |
| PDF | Yes | Yes | Yes | Moderate |
| Markdown | No | Yes | Yes | Tiny |

The two that are actually worth using are PDF and Markdown, and which one depends on whether you need the page to look like itself.

## PDF, when the appearance is part of the point

Printing to PDF captures layout, images and text in one file that opens anywhere and stays searchable. For a receipt, a price, a policy or anything you might need to show somebody, this is the right choice.

Converting a web page to PDF has a few known rough edges, covered in [making a PDF out of HTML](/blog/making-a-pdf-from-something-else). The short version: a web page has no page breaks, so they get invented, and tables and headings land badly across the boundaries. Backgrounds are usually dropped, and sticky headers either repeat on every page or appear once.

Two things that help. Use the reader view before converting, if the browser has one, because fewer elements means fewer things to break across a page boundary. And set the page size deliberately, since A4 and Letter differ enough to move every break.

For a page you have as HTML rather than as a live URL, [HTML to PDF](/tool/html-to-pdf) does the same conversion locally.

> [!TIP]
> If the archive is a screenshot or a photograph of a screen rather than a real page, it contains no text at all. [Running OCR](/tool/pdf-ocr) adds a searchable layer underneath, which is the difference between a file you can find again and one you have to remember the existence of.

## Markdown, when you want the words to last

Converting a page to [Markdown](/tool/html-markdown) throws away the design and keeps the headings, lists, links and emphasis as plain text.

The result is a few kilobytes, opens in any editor, and will still open in thirty years. It is also diffable, so you can compare the version you saved against the page as it stands now and see exactly what changed, which is the argument made in [writing in Markdown](/blog/markdown-as-a-document-source).

That is the right format for reference material, documentation and anything going into a notes system. It is the wrong format for a receipt, because a receipt is partly its appearance.

For something already in plain text, such as a terms document you copied, [text to PDF](/tool/text-to-pdf) produces a paginated file that prints predictably.

## What the browser's own Save As does

Complete Web Page saves an HTML file plus a folder of assets. It is fragile: the folder and the file must stay together, absolute URLs still point outward, and a page that builds itself with JavaScript saves as an empty shell.

MHTML bundles everything into one file, which solves the folder problem and is not portable across browsers.

Neither is a good archive format. Both are fine for reading something offline tomorrow.

## The habit that matters more than the format

**Save the content at the moment you decide it matters**, not later.

Pages are edited without notice, paywalls appear, domains lapse, and an address that resolves today may not next year. The cost of saving is a few seconds; the cost of not saving is that the thing you needed is gone and you have a bookmark proving you once had it.

A file naming convention makes the archive usable rather than a folder of \`document (3).pdf\`. As set out in [file names that survive](/blog/naming-files-that-survive), an ISO date at the front plus a hyphenated description sorts chronologically everywhere:

\`\`\`
2026-09-14-supplier-terms-and-conditions.pdf
\`\`\`

And for anything you may need to rely on, record the URL and the date you captured it inside the document itself. A PDF of a page with no address and no date proves very little about where it came from.

For genuinely important pages, a public web archive gives you a third-party timestamped copy, which is worth more as evidence than your own file. Doing both costs nothing: theirs for the timestamp, yours for the certainty that it still exists.`,
};
