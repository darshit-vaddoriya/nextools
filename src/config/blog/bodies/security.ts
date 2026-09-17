// Article bodies for the "security" topic, split out of posts/security.ts.
//
// Bodies are only needed when an article is actually rendered, so they live in
// their own chunk. Keeping them beside the post metadata put every article on
// the site into the entry bundle — downloaded by the homepage and every tool
// page, which never display an article body.
export const SECURITY_BODIES: Record<string, string> = {
  'what-makes-a-password-strong': `Password strength has a precise definition: how many guesses an attacker needs to try, on average, before finding yours. That number is usually expressed in bits of entropy, where each extra bit doubles the work.

## The formula

For a password drawn randomly from a set of possible characters:

\`\`\`
entropy = length × log₂(charset size)
\`\`\`

- Lowercase only (26 chars): 4.7 bits per character
- Lowercase + uppercase + digits (62): 5.95 bits per character
- Full printable ASCII (95): 6.55 bits per character

So a random 8-character password from the full ASCII set is about 52 bits. A random 16-character lowercase password is about 75 bits, **dramatically stronger despite using a smaller alphabet**, because length multiplies while charset size only adds logarithmically.

**Length beats complexity, and it is not close.**

## The word "randomly" is doing all the work

That formula only applies if the password was chosen uniformly at random. Human-chosen passwords are nothing of the sort.

\`P@ssw0rd!\` has 9 characters from a 95-character set, nominally 59 bits. Its real strength is close to zero, because it is a dictionary word with the four most predictable substitutions applied, and every cracking tool applies exactly those rules first. Password crackers do not brute-force; they use wordlists from previous breaches, then apply mangling rules.

Similarly, the requirement to include one uppercase, one digit and one symbol reliably produces passwords of the shape \`Capital + word + digits + !\`. The rule intended to add unpredictability instead narrowed the search space.

## Passphrases

Pick four words at random from a list of 7,776 (the standard Diceware wordlist):

\`\`\`
7776⁴ ≈ 3.7 × 10¹⁵ combinations ≈ 51.7 bits
\`\`\`

Five words gives about 64.6 bits, six about 77.5 bits. A six-word passphrase is stronger than most random 12-character passwords and is genuinely memorable.

The critical condition again: **the words must be selected randomly, not chosen by you.** A phrase you thought of is a phrase a language model can generate. Roll dice, or use a generator.

## What the standards now say

NIST's SP 800-63B guidance, which most modern policy follows, reversed decades of conventional advice:

- **No mandatory periodic rotation.** Forcing a change every 90 days produces \`Summer2024!\` → \`Summer2025!\`. Change passwords when there is evidence of compromise.
- **No composition rules.** Do not require particular character classes.
- **Do require length**, a minimum of 8, and support for at least 64 so passphrases are usable.
- **Do check against breach lists.** Rejecting known-compromised passwords is far more effective than any complexity rule.
- **Allow paste.** Blocking it actively breaks password managers, which are the single best thing a user can do.

## Reuse is the real problem

The most likely way your account gets taken over is not brute force. It is credential stuffing: an attacker takes email/password pairs from a breach at one site and tries them everywhere else, automatically.

Which means a perfect 20-character password used on two sites is weaker in practice than two mediocre ones used on one site each. **Uniqueness matters more than strength.**

This is the argument for a password manager, and it is decisive: it is the only way to have a different high-entropy password on several hundred services without a heroic memory.

## Sensible targets

| Account type | Target |
|---|---|
| Throwaway / low value | 12+ random characters, manager-generated |
| Ordinary account | 16+ random characters |
| Email, banking, password manager | 20+ characters or a 6-word passphrase, plus 2FA |

Your email account deserves the strongest password you have. Everything else can be reset through it, which makes it the master key to your online life whether you designed it that way or not.

## Generating properly

A generator is only as good as its randomness source. \`Math.random()\` is not cryptographically secure, its output is predictable from a modest number of samples. A password generator should use the platform CSPRNG (\`crypto.getRandomValues\`).

That is what the [password generator](/tool/password-generator) and [passphrase generator](/tool/passphrase-gen) here do, and because they run in your browser, the generated password is never transmitted to anyone, which is an obvious requirement that online generators do not all meet.

You can also check an existing password's entropy with the [strength checker](/tool/password-strength) without sending it anywhere.`,
  'hashing-vs-encryption-vs-encoding': `Three operations, constantly used as synonyms, with completely different guarantees.

## Encoding: reversible by anyone

Base64, URL encoding, hex. These change the *representation* of data so it survives a particular channel. There is no key and no secret. Anyone can reverse them instantly.

**Purpose:** compatibility. **Security value:** none.

## Encryption: reversible with a key

AES, RSA, ChaCha20. Encryption transforms data so that only someone with the correct key can recover it. It is designed to be reversed, that is the point.

**Purpose:** confidentiality. **Requires:** key management, which is the hard part.

## Hashing: not reversible at all

SHA-256, bcrypt, Argon2. A hash function maps input of any length to a fixed-size output, deterministically, with no way back. There is no "dehashing", because the function discards information, infinitely many inputs map to each output.

**Purpose:** verifying that something is what you expect, without storing the thing itself.

## What makes a hash function good

- **Deterministic**, same input, same output, always.
- **Fast to compute** (for integrity uses) or **deliberately slow** (for passwords, see below).
- **Avalanche effect**, flipping one input bit changes about half the output bits.
- **Preimage resistance**, given a hash, you cannot find an input producing it.
- **Collision resistance**, you cannot find two different inputs with the same hash.

## Which functions are still safe

**MD5**, broken. Collisions have been practical since 2004 and can be produced in seconds. Acceptable only as a non-security checksum against accidental corruption. Never for anything an attacker touches.

**SHA-1**, broken. Google demonstrated a practical collision (SHAttered) in 2017. Git still uses it for object identity for historical reasons, with hardening; do not choose it for anything new.

**SHA-256 / SHA-3**, current standards for integrity, signatures and general-purpose hashing.

**bcrypt, scrypt, Argon2**, password hashing specifically. Different job, see below.

## Passwords need a different kind of hash

This is the distinction that causes the most damage in practice.

SHA-256 is *fast*, that is a feature for verifying a file and a catastrophe for passwords. A modern GPU computes billions of SHA-256 hashes per second. Against a leaked database of SHA-256 password hashes, an attacker recovers every common password essentially immediately.

Password hashing functions are built to be **slow and memory-hard**:

- **Argon2id**, the current recommendation, winner of the Password Hashing Competition. Tunable in time, memory and parallelism.
- **bcrypt**, older, extremely well-tested, still perfectly acceptable. Note its 72-byte input limit.
- **scrypt**, memory-hard, also fine.

They also **salt** automatically: a unique random value per password, stored alongside the hash. Salting means two users with the same password get different hashes, and it destroys the economics of precomputed rainbow tables.

**Never store passwords with SHA-256, MD5, or any general-purpose hash, salted or not.**

## The email test

If a service can email you your existing password, it is storing it either in plaintext or reversibly encrypted. A correctly built system cannot do this, because it does not have your password, only a hash of it. That is why real password recovery always means resetting, never retrieving.

It is a two-second assessment of how seriously a service takes this.

## Where each belongs

| Task | Use |
|---|---|
| Store user passwords | Argon2id or bcrypt |
| Verify a downloaded file | SHA-256 |
| Detect duplicate files | SHA-256 (or MD5 if only accidental corruption matters) |
| Protect data at rest | AES-256 encryption |
| Send binary through a text channel | Base64 encoding |
| API request signing | HMAC-SHA256 |

## Computing hashes locally

Hashing a file means reading every byte of it, which is exactly the operation you do not want to perform by uploading the file somewhere. Browsers expose SHA-256 through the Web Crypto API, so [hash generation](/tool/hash-generator) and [file checksums](/tool/file-checksum) run on your own machine, the file is read from disk into memory and never transmitted.`,
  'verify-a-download-with-checksums': `Download an operating system image, a database installer or a signed PDF and you will often find a long hexadecimal string published next to the link. That is a checksum, and comparing it against your copy is a fast, worthwhile habit.

## What you are checking

The publisher computed a cryptographic hash, usually SHA-256, of the exact file they intended to distribute. You compute the same hash of the file you received. If the strings match character for character, your copy is byte-identical to theirs.

Because good hash functions have an avalanche property, a single flipped bit anywhere in a 4 GB file produces a completely different hash. There is no "close enough".

## Doing it

**On Linux:**
\`\`\`bash
sha256sum ubuntu-24.04.iso
\`\`\`

**On macOS:**
\`\`\`bash
shasum -a 256 installer.dmg
\`\`\`

**On Windows (PowerShell):**
\`\`\`powershell
Get-FileHash installer.exe -Algorithm SHA256
\`\`\`

Then compare to the published value. Compare the whole string, checking the first and last six characters is a habit worth avoiding, because a targeted attack can afford to search for a partial match.

## What it catches

- **Incomplete or corrupted downloads.** Common on flaky connections, and the most frequent real cause of a mismatch.
- **A compromised mirror.** Large projects distribute through many mirrors; a mirror serving a modified installer is a genuine attack pattern with real historical examples.
- **Bit rot** on old storage.
- **The wrong file entirely**, a different version than you thought.

## What it does not catch

Here is the important limitation. **If the checksum and the file come from the same place, an attacker who controls that place controls both.** Someone who compromises a project's website can replace the installer *and* update the published hash. Your verification then passes perfectly against a malicious file.

Checksums protect against a compromised *distribution channel*, not a compromised *source*.

Stronger options, in increasing order:

1. **Fetch the checksum over HTTPS from the canonical domain**, not from the mirror serving the file. This is the minimum that makes the exercise meaningful.
2. **Use a GPG signature** where the project publishes one. A signature proves the file was signed by a specific private key, which an attacker who defaces a website does not have. This requires having the project's public key from a trusted source, which is the part people skip.
3. **Check the hash against a second independent source**, such as the project's GitHub releases page versus their website.

## MD5 checksums are still everywhere

Plenty of projects still publish MD5 sums. MD5 collisions are practical, so an attacker can in principle construct a malicious file matching a published MD5.

An MD5 sum is still useful for detecting *accidental* corruption. It is not useful against a deliberate attacker. If a project offers both, use the SHA-256.

## Where else this matters

- **Backups.** Hash a file when you archive it, hash it again on restore. This is how you find out that a backup went bad before you need it.
- **Deduplication.** Files with identical hashes are identical files. This is how deduplicating storage systems work.
- **Evidence and record-keeping.** Recording a hash at a point in time proves a document has not been altered since, provided the hash was recorded somewhere the document's holder cannot change.
- **Confirming a transfer.** Hash before sending and after receiving to prove the transfer was clean.

## Checking a file without handing it over

Hashing requires reading every byte, so an online checksum tool that uploads your file has just received a complete copy of whatever you were verifying, often a large installer, sometimes a private archive.

Browsers implement SHA-256 natively through the Web Crypto API, so there is no reason for that. NextTool's [file checksum tool](/tool/file-checksum) reads the file locally and streams it through the browser's hash implementation; nothing is transmitted, and there is no practical size limit beyond available memory.`,
  'password-manager-and-2fa-setup': `Most account compromises do not involve anyone attacking you personally. They involve a password leaked from some unrelated service being tried, automatically, against every other service you use. Two changes address the bulk of that.

## Why a password manager is not optional

The advice to use a different password everywhere is correct and, without tooling, impossible. Nobody remembers 200 unique high-entropy strings, so people reuse, and reuse is what credential stuffing exploits.

A manager makes uniqueness free. You remember one strong passphrase; it remembers everything else.

The objection is that it becomes a single point of failure. That is true, and it is still overwhelmingly the right trade. A well-built manager encrypts your vault locally with a key derived from your master password, so the provider stores ciphertext they cannot read. The realistic alternative, reused passwords across dozens of services, fails far more often.

Practical points:

- **The master password should be a long random passphrase**, five or six words. It is the one you actually have to remember.
- **Turn on 2FA for the manager itself.**
- **Write the master password and recovery code on paper** and store them somewhere physically safe. Losing access to the vault is the realistic failure mode, not it being cracked.
- **Use the autofill.** Beyond convenience, it is a phishing defence: a manager will not fill a password on \`paypa1.com\`, because the domain does not match.

## Second factors, ranked

**Passkeys / WebAuthn, best.** A key pair, with the private key held by your device or security key. The signature is bound to the site's actual domain, so a phishing site cannot obtain anything usable even if you are completely fooled. There is no shared secret to steal, and nothing to type. Where a service offers passkeys, use them.

**Hardware security keys (YubiKey and similar), excellent.** The same phishing resistance in a physical form. Worth it for email and financial accounts. Buy two and register both, so losing one is not an account-recovery crisis.

**TOTP authenticator apps, good.** The six-digit rotating codes. The app and the server share a secret and both compute a code from it and the current time (RFC 6238, 30-second window). No network needed, so no SMS interception.

Its weakness: the code is typed, so a convincing phishing page can capture it and relay it within the 30-second window. That is real-time phishing, which is more effort than credential stuffing but well within the reach of off-the-shelf kits.

**SMS, weak, but better than nothing.** Vulnerable to SIM swapping, where an attacker persuades a mobile operator to move your number to their SIM. This is not theoretical; it is the standard technique behind high-value account and cryptocurrency thefts. Use SMS only where nothing better is offered, and never as the recovery method for a critical account.

**Email codes, weakest.** If your email is compromised, every second factor delivered to it is compromised too.

## Set it up in this order

1. **Secure your email account first.** Everything else resets through it. Strongest password you have, plus the strongest second factor available.
2. **Install a password manager**, set a memorable six-word master passphrase, enable 2FA on it.
3. **Change the passwords that matter**: email, banking, the password manager, work accounts, anything with payment details. Generate new random ones.
4. **Enable 2FA on those same accounts**, preferring passkeys, then hardware keys, then TOTP.
5. **Save every backup code.** Put them in the manager's secure notes, and put the email and manager codes on paper.
6. **Migrate everything else gradually.** Each time you log in somewhere, let the manager replace the old password.

## Recovery is the part people skip

More accounts are permanently lost to failed recovery than to attackers. Before you rely on any of this:

- Store backup codes somewhere you will still have them if your phone is lost or stolen.
- Register a second hardware key, or a second device for TOTP.
- Keep printed copies of the master password and the email recovery codes somewhere physically secure.
- Check that your recovery email and phone number are current.

## Generating the credentials

Password generation is arithmetic on random bytes and needs no server. The [password generator](/tool/password-generator) and [passphrase generator](/tool/passphrase-gen) here use the browser's cryptographic RNG and never transmit what they produce, worth verifying about any generator before you use its output for an account that matters.`,
  'web-crypto-in-plain-english': `A decade ago, "do the crypto in the browser" was a warning sign, because it meant a hand-rolled JavaScript implementation of AES with unpredictable side channels and a random number generator based on \`Math.random()\`. That objection no longer holds. Browsers now ship a native cryptographic library, and the JavaScript is only calling into it.

## What is available

The Web Crypto API lives at \`window.crypto\`, with two distinct parts.

**\`crypto.getRandomValues()\`** fills a typed array with cryptographically secure random bytes, sourced from the operating system's entropy pool. This is the correct primitive for keys, tokens, salts, initialisation vectors and passwords.

It is completely different from \`Math.random()\`, which is a fast non-cryptographic PRNG whose internal state can be recovered from a few outputs. Using \`Math.random()\` for anything security-relevant is a real, exploitable bug.

**\`crypto.subtle\`** provides the algorithms:

- **AES-GCM, AES-CBC, AES-CTR**, symmetric encryption. GCM is the sensible default because it is authenticated, meaning tampering is detected rather than silently decrypted into garbage.
- **RSA-OAEP, RSA-PSS, ECDSA, ECDH**, public key encryption, signatures and key agreement.
- **SHA-256, SHA-384, SHA-512**, hashing.
- **HMAC**, keyed authentication.
- **PBKDF2, HKDF**, key derivation, for turning a password into a key.

Notably absent: **MD5 and SHA-1 are not offered for new use.** The API declines to make broken primitives convenient, which is a deliberate and good design decision.

## Why "subtle"

The name is a warning. Cryptography fails quietly: code that produces plausible-looking ciphertext can be completely insecure. The API gives you correct primitives; it does not stop you combining them badly.

The common mistakes it cannot prevent:

- **Reusing an initialisation vector** with AES-GCM. Reuse the same key and IV for two messages and the security collapses. Generate a fresh random IV every time.
- **Too few PBKDF2 iterations.** The point is to be slow. Current guidance is in the hundreds of thousands of iterations; a value copied from a 2013 tutorial is worth very little today.
- **Confusing encryption with authentication.** Unauthenticated modes let an attacker modify ciphertext in meaningful ways. Use GCM, or add an HMAC.
- **Storing the key next to the ciphertext.** Encryption moves the problem to key management; it does not remove it.

## Some real constraints

**Secure context only.** \`crypto.subtle\` is unavailable on plain HTTP. It requires HTTPS or localhost, a sensible restriction, since delivering crypto code over an interceptable channel is pointless.

**Asynchronous.** Everything returns a Promise, so operations do not block the main thread.

**Keys can be non-extractable.** Generate a key with \`extractable: false\` and JavaScript can use it but never read its bytes. That is a genuinely useful property for limiting the blast radius of an XSS bug.

**No format opinions.** The API gives you bytes. Deciding how to package a ciphertext, its IV and its salt into a storable blob is your problem, and getting that wrong is a common source of "it worked in testing" failures.

## What this makes possible

Because these primitives are native and fast, a browser tab can do work that genuinely used to require a server:

- Hash a multi-gigabyte file to verify a download, at close to disk speed.
- Encrypt a note with a password, using PBKDF2 to derive the key and AES-GCM to seal it, such that the plaintext never exists outside the tab.
- Generate keys and tokens with real entropy.
- Verify signatures locally.

Combined with WebAssembly for heavier work, PDF manipulation, image codecs, OCR, this is the reason a whole category of tools that used to be inherently server-side no longer has to be.

## The honest limitation

Client-side crypto protects data in transit and at rest. It does not protect you from the page itself. If the site serving the JavaScript is compromised, it can serve code that captures your input before encryption ever happens.

The mitigations are the ordinary web ones: HTTPS, a strict Content Security Policy, subresource integrity, and a small dependency surface. Nothing removes the requirement to trust the code you run.

What client-side crypto *does* remove is the need to trust a server with your plaintext, which is the larger and more commonly abused trust. NextTool's [secure notes](/tool/secure-notes), [hash generator](/tool/hash-generator) and [checksum tool](/tool/file-checksum) all build on these primitives, which is why none of them need an upload endpoint.`,
  'signing-a-pdf-what-it-proves': `You are sent a contract, you draw your name with a trackpad, you place it above the line, you send it back. The document is now signed in the sense everyone means in day-to-day work. It is also, technically, a PDF with a small picture of some handwriting in it, and nothing about the file itself resists anyone moving that picture to a different page of a different document.

Whether that matters depends on what you are signing. Knowing the difference is what lets you decide.

## Three different things, all called signing

**A signature image.** A drawn, typed or photographed likeness of your name, placed on the page as an image. It changes how the document looks. It carries no information about who put it there or whether the text above it changed afterwards.

**An electronic signature with an audit trail.** What DocuSign, Adobe Sign and similar services provide. The visible mark is still a picture, but the service records who accessed the document, from which IP address, at what time, with what email verification, and keeps that record. The evidence lives in the service's logs, not in the file.

**A digital signature.** A cryptographic operation. The signing software hashes the exact byte range of the document, encrypts that hash with a private key held by the signer, and embeds the result along with a certificate identifying the key holder. A viewer can recompute the hash and check it against the signature.

Only the third one is verifiable from the file alone, with no third party to ask.

## What a digital signature actually proves

Two things, and it is worth being precise about both.

**Integrity.** The bytes covered by the signature have not changed since it was applied. Change one character and the recomputed hash no longer matches, so the viewer reports the signature as invalid. This is the same mechanism behind [checksums](/tool/file-checksum), applied to a byte range inside a document rather than a whole file.

**Authenticity, conditionally.** The signature was produced by whoever holds the private key matching the certificate. Whether that person is who the certificate claims depends entirely on the certificate authority that issued it and on the key not having leaked. A self-signed certificate proves the same key signed twice; it proves nothing about identity.

Note what is missing from both. Neither proves the signer read the document, agreed with it, or had authority to commit anyone to it. Those are legal questions and cryptography does not touch them.

## Why editing invalidates a signature

People report this as a bug. It is the feature working.

The signature covers a byte range. Rotating a page, adding a page number, [merging](/tool/pdf-merge) the file with another, or running it through a compressor all rewrite the file's objects and cross-reference table. The bytes change, the hash changes, the check fails. A signature that survived editing would tell you nothing, because anyone could edit the document and keep the signature attached.

PDF does allow legitimate additions through **incremental updates**, where new content is appended and the original byte range is left untouched. That is how a second person signs a document the first person already signed, and how form fields get filled after signing if the signer permitted it. Whether such changes are allowed is recorded at signing time. This is also why signing should be the last operation: compress, merge, add page numbers and redact first, then sign the finished article.

## The redaction trap

This one causes real harm, so it is worth stating plainly.

Drawing a black rectangle over text in a PDF is the same category of action as pasting a signature image: you have added a graphic on top. The text is still in the content stream underneath. Select it, copy it, paste it into a text editor, and there it is. The same applies to hidden layers and to cropping, which only changes the visible box, not the content outside it.

Proper [redaction](/tool/pdf-redact) removes the underlying characters, not just the view of them, and the [full explanation](/blog/how-to-redact-a-pdf-properly) is worth reading if you do this often. If you are signing a document you have also redacted, get the redaction right first, because signing a file whose secrets are still in it simply certifies that the secrets are unchanged.

## Flatten before you send

If you filled in form fields, the values live in interactive field objects rather than in the page content. They can be edited by the recipient, they can be cleared by a viewer that mishandles forms, and they can collide with field names if the document is merged into another.

[Flattening](/tool/pdf-flatten) converts those values into ordinary page content. After flattening, what the recipient sees is what the file contains, with no separate layer that can disagree with it. Flatten, then sign, in that order, because flattening after signing changes the bytes and breaks the signature.

## Choosing what you actually need

| Situation | What is appropriate |
|---|---|
| Internal approval, delivery note, permission slip | A signature image is fine |
| Freelance contract, NDA, rental agreement | Image plus an emailed audit trail is the norm |
| Anything a regulator, court or bank will examine | A digital signature from a recognised CA |
| A document you will send onward or merge | Flatten first, then decide |

Most of daily life sits in the first two rows. The mistake is not using a signature image, it is believing a signature image is doing something it is not, and skipping the audit trail because the document "is signed".

## Doing it without handing the document over

The awkward part of signing online is that the documents involved are the sensitive ones by definition. Offer letters, tenancy agreements, medical consent forms and anything with a bank detail on it are exactly the files people drop into whichever free signing site is top of the results.

Placing a signature on a page is drawing an image at coordinates, and flattening is rewriting content streams. Neither needs a server. NextTool's [PDF signing](/tool/pdf-sign) and [flatten](/tool/pdf-flatten) tools do both in the browser tab, so the contract stays on your machine.

What that cannot give you is the audit trail, because there is no third party observing. If you need a record that a specific person opened and signed at a specific time, you need a service that keeps one, and you are choosing to trade the document's privacy for that evidence. That is a reasonable trade when the evidence is the point. It is worth making it knowingly rather than by default.`,
  'random-strings-and-tokens': `You need a token: an API key, a password reset link, a share URL, a filename that nobody should be able to guess. You generate a random string, it looks like nonsense, and you ship it.

Whether that was safe depends entirely on which generator produced it, and the two kinds are indistinguishable by eye.

## Two different meanings of random

**A pseudo-random number generator** is a deterministic algorithm. It holds an internal state, and each call transforms that state and returns part of it. The output passes statistical tests for randomness, which is what it was designed for: simulations, shuffling a playlist, jittering an animation.

It is not designed to be unpredictable to an adversary. Given enough consecutive outputs, the internal state can be recovered, and once it is, every future value is known. This has been demonstrated against \`Math.random\` in every major JavaScript engine.

**A cryptographically secure PRNG** is built so that observing output tells you nothing useful about the state or about future output. It draws from the operating system's entropy pool, which collects unpredictable physical signals: interrupt timings, device noise, hardware random instructions.

In a browser that is \`crypto.getRandomValues()\`. On a server it is \`/dev/urandom\` or the platform equivalent.

> [!WARNING]
> The rule is short: if a value is a secret, or if guessing it grants access to anything, it must come from a CSPRNG. Session tokens, password reset links, API keys, unguessable URLs, salts and initialisation vectors are all in this category. A shuffled quiz order is not.

## Entropy is the number that matters

Entropy measures how many guesses an attacker needs. For a random string:

\`\`\`
bits = length x log2(alphabet size)
\`\`\`

| Alphabet | Bits per character | Length for 128 bits |
|---|---|---|
| Digits (10) | 3.32 | 39 |
| Lowercase (26) | 4.70 | 28 |
| Alphanumeric (62) | 5.95 | 22 |
| Base64url (64) | 6.00 | 22 |
| Full ASCII printable (94) | 6.55 | 20 |

The useful thresholds: 128 bits is the standard target for anything security-relevant, and is far beyond brute force. Around 64 bits is adequate for a short-lived value that also has rate limiting behind it. Below about 40 bits is guessable by anyone motivated.

Note what this says about length versus alphabet. A 16-character alphanumeric token is 95 bits. A 22-character one is 131. Adding six characters did more than any amount of adding exotic symbols would, which is the same lesson as [what makes a password strong](/blog/what-makes-a-password-strong).

## The modulo bias

There is a subtle failure in how random bytes get turned into characters.

The obvious approach is to take a random byte, 0 to 255, and take it modulo the alphabet size. With a 62-character alphabet, 256 is not divisible by 62: values 0 to 61 can be produced by five different bytes, while 62 to 65 can be produced by only four. The first few characters of your alphabet come up about 25% more often than the rest.

For a shuffled list this is invisible. For a token it reduces entropy, and a generator that is systematically biased is a generator an attacker can exploit.

The correct approach is rejection sampling: discard bytes that fall in the uneven tail and draw again. A [random string generator](/tool/random-string) that gets this right produces a uniform distribution; one that does not produces something subtly weaker than its length suggests.

## Choosing what to generate

**A [random string](/tool/random-string)** when you control both ends and want a specific length and alphabet. Avoid ambiguous characters (\`0\`/\`O\`, \`1\`/\`l\`/\`I\`) if a human will ever retype it.

**A [UUID](/tool/uuid-generator)** when you want a standard format other systems will recognise. A v4 UUID has 122 random bits, which is plenty. Note that it is 36 characters to carry 122 bits, which is less dense than base64url, and that a v7 UUID deliberately embeds a timestamp and is therefore partly predictable by design.

**A [passphrase](/tool/passphrase-gen)** when a human has to remember or read it aloud.

**A [password](/tool/password-generator)** when it goes into a password manager and nobody types it.

## Two things a random string is not

It is not a hash. A [hash](/tool/hash-generator) is deterministic: the same input always gives the same output. That is the point of a checksum and the opposite of the point of a token.

And it is not secret once it is in a URL. Values in a URL end up in browser history, server access logs, Referer headers and anything that scans links in messages. An unguessable URL is a reasonable pattern for a share link with an expiry; it is not a substitute for authentication on anything that matters.

Generating random values is one of the few things a browser does better than a server for your purposes, because \`crypto.getRandomValues()\` runs locally and the value never crosses a network. A token generated on someone else's server has, by definition, been seen by someone else before it reached you.`,
  'spotting-a-dangerous-link': `A message says your account is on hold and gives you a link. The link says \`https://secure.paypal.com.account-verify.co/login\`. It has a padlock, it starts with the right words, and it is not PayPal.

## Read right to left

The only part of a URL that decides where you actually go is the hostname, and within it the important piece is at the **end**, not the beginning.

\`\`\`
https://secure.paypal.com.account-verify.co/login
        |___________________________| |________|
             all decoration            real domain
\`\`\`

The rule: find the first single slash after the scheme, then read backwards. The last two labels before that slash are the registered domain. Everything to the left is a subdomain, and **a subdomain can say anything**, because whoever owns \`account-verify.co\` controls every name under it.

So \`paypal.com.account-verify.co\` is \`account-verify.co\`, and \`google.com.evil.net\` is \`evil.net\`. The familiar brand is there precisely because it is the part people read first and the part that means nothing.

Three variations on the same trick:

- **Hyphenated.** \`paypal-secure-login.com\` is not PayPal. Hyphens do not link a name to a brand.
- **Different suffix.** \`paypal.co\` is a completely different registration from \`paypal.com\`.
- **Path pretending to be a host.** \`https://evil.net/paypal.com/login\` puts the brand after the slash, where it is just a folder name.

A [URL parser](/tool/url-parser) that splits a link into scheme, host, path and query is the fastest way to settle this, because it shows you the host as its own field instead of a string you have to read carefully under time pressure.

## The padlock does not mean safe

This is the misconception that does the most damage, and it is partly the industry's fault for two decades of "look for the padlock" advice.

HTTPS means **the connection to that server is encrypted and nobody in between can read it.** It says nothing about who runs the server or what they intend. Certificates are free and issued automatically, so the overwhelming majority of phishing sites have valid ones.

An encrypted connection to a criminal is still a connection to a criminal.

## Characters that are not what they look like

Domains can contain non-Latin characters, encoded as punycode and displayed as the real letters. That allows homograph attacks, where Cyrillic \`а\` stands in for Latin \`a\` and the two are visually identical in most fonts.

Even without other alphabets, a capital \`I\` and a lowercase \`l\` are indistinguishable in many sans-serif fonts, so \`paypaI.com\` passes a glance.

> [!TIP]
> Browsers defend against this by showing the punycode form, \`xn--pypal-4ve.com\`, when a domain mixes scripts. If you ever see a hostname beginning \`xn--\`, that is your browser telling you the name contains characters that are not what they appear to be. Treat it as a stop sign.

## The shortened-link problem

A shortener hides the destination completely, which is the entire point of it and also the problem. There is no way to read \`bit.ly/3xK9mQ\` because the information is not there.

Most shorteners will show you the target if you append \`+\` to the URL, and various expander services do the same. The more useful habit is simply to distrust a shortened link in any message you were not expecting, because there is no legitimate reason to obscure a destination in a security email.

## What the query string gives away

Everything after \`?\` is parameters. Two things worth noticing:

**Your email address in the link.** A parameter like \`?u=you@example.com\` means the sender already knows who you are and will know you clicked, which confirms a live address to a spammer.

**A pre-filled redirect.** A parameter such as \`?next=https://elsewhere.tld\` on a legitimate-looking domain is an open-redirect attempt: the real domain is genuine and it forwards you somewhere else. Worth checking with a [URL parser](/tool/url-parser) rather than assuming the visible host settles it.

## Downloads

If a link produces a file rather than a page, two checks apply.

The extension is not the file type. A [MIME checker](/tool/mime-checker) reads the magic bytes and will tell you the \`invoice.pdf\` you just received is actually an executable or an HTML page. Double extensions like \`invoice.pdf.exe\` exploit the fact that many systems hide the known extension by default, so the user sees only \`invoice.pdf\`.

And if the publisher gives a checksum, verify it. Comparing a [file checksum](/tool/file-checksum) against the published one proves you received the same bytes the author released. What it cannot prove is that the author is trustworthy, or that the page listing the checksum was not itself tampered with, which is why the checksum should come from a different source than the download where possible.

## The rule that removes most of the risk

> [!WARNING]
> If you did not initiate the interaction, do not use the link at all. Open a new tab, type the address yourself, and log in there. A genuine notice will be waiting in your account; a fraudulent one will not exist.

This costs ten seconds and defeats essentially every variation above, including the ones that are too well made to spot by reading. The link inspection is useful for the times you are curious or need to explain to somebody else why something is wrong, but navigating yourself is what actually protects the account.`,
  'keeping-secrets-out-of-git': `A developer commits a config file with a live API key, notices within the hour, deletes the line and pushes again. The repository now looks clean.

The key is still there, in the previous commit, readable by anyone who clones the repository and runs one command.

## Git does not forget

Git stores a complete snapshot of every commit. A later commit that removes a line does not alter the earlier one, it adds a new state in which that line is absent. Both remain.

So \`git log -p\`, or the web interface history view, shows the key perfectly. So does any fork, any clone taken in between, and any CI cache.

> [!WARNING]
> Once a secret has been pushed to anywhere public, it is compromised. Automated scanners watch public repositories continuously and act within minutes, not days. Rewriting history with filter-repo or BFG removes it from your copy and does nothing about the clones already taken. **Rotate the key. That is the only fix that works.**

Rewriting history is still worth doing afterwards, to stop the value spreading further. It is a cleanup, not a remedy.

## What to do in order

1. **Revoke or rotate the key at the provider.** Immediately, before anything else.
2. **Check the provider's access logs** for use you do not recognise.
3. **Work out the blast radius.** What did that key have access to, and does anything else share it?
4. **Rewrite history** to remove the value, and force-push.
5. **Tell anyone with a clone** to re-clone rather than pull.
6. **Add a scanner** so the next one is caught before it is pushed.

Step one is the whole thing. Steps four and five feel like the fix and are the least important.

## Keeping them out in the first place

**Environment variables** are the baseline. The secret lives outside source control, and the application reads it at run time.

They are not a security boundary, which is worth being clear about. Any process running as the same user can read them, they show up in crash dumps and process listings, and they end up in logs whenever something prints its environment while debugging. They solve the source-control problem specifically.

**A .env file, ignored by git.** Convenient locally. Two conditions: \`.env\` must be in \`.gitignore\` **before** the first commit, and you should commit a \`.env.example\` alongside it with the keys present and the values replaced by placeholders, so the next person knows what to set without asking.

Adding \`.env\` to \`.gitignore\` after it has been committed does nothing, because git is already tracking it.

**A secrets manager** for anything production. Access is authenticated and audited, rotation is supported, and the value never sits in a file.

## Generating keys properly

When you are producing the secret rather than consuming one, the source of randomness is what decides its strength.

A token needs to come from a cryptographically secure generator, not from \`Math.random\`, for the reasons set out in [random strings and tokens](/blog/random-strings-and-tokens). Aim for 128 bits, which is 22 characters of base64url or 32 hex characters, and generate it with a [random string generator](/tool/random-string) using rejection sampling rather than a modulo.

For anything a human has to type or remember, a [password generator](/tool/password-generator) or a passphrase is the right shape instead.

## Storing what cannot be in a manager

Some things genuinely have to be written down: a recovery code, a root credential, a break-glass password. These are the ones that need to survive the loss of the systems that would normally hold them.

Paper, somewhere physically secure, is the right answer for the small number of credentials in that category. [Encrypted notes](/tool/secure-notes) that stay in your own browser are reasonable for working notes, with the caveat noted in [a backup that actually works](/blog/a-backup-that-actually-works): anything stored on the machine you are recovering is unavailable during the recovery.

## Checking before you commit

**A pre-commit hook** that scans staged changes for key-shaped strings. It costs one second per commit and catches the accident before it becomes history.

**Server-side push protection**, which several hosting providers now offer, blocking a push that contains a recognised credential format.

**Search your own history once.** Most repositories that have existed for a few years contain something. Finding it while you are calm is better than finding it during an incident.

And one habit that removes a whole category of this: **never paste a key into a web page to check it.** A [hash generator](/tool/hash-generator) or decoder running locally never transmits what you paste, which is not true of most online equivalents, and a JWT or API key pasted into an unknown site has been disclosed by the act of checking it.`,
  'public-wifi-and-vpns': `The advice to avoid public Wi-Fi comes from an era when most websites were unencrypted and anyone on the same network could read your session cookie with a browser extension. That era ended when HTTPS became the default rather than the exception.

What is left is narrower and worth stating precisely, because it determines whether a VPN helps.

## What HTTPS already handles

When you connect to an HTTPS site, the connection is encrypted end to end. Somebody on the same network sees ciphertext.

They **cannot** read the page contents, your form submissions, your passwords, or your session cookies. They cannot modify the page in transit, because the integrity check would fail.

That covers the classic coffee-shop attack entirely. It is why the old advice is largely obsolete.

## What they can still see

Encryption hides content, not the fact of the connection.

**The domain you are visiting.** DNS lookups are plaintext unless you have enabled encrypted DNS, and the server name appears in the TLS handshake unless Encrypted Client Hello is in use, which is still not universal.

**Traffic patterns.** Timing and volume can suggest what you are doing even without content.

**Anything not using HTTPS.** Rare on the web now, and still common for some apps and update checks.

So an observer on the network knows you visited a particular bank, not what you did there. Whether that matters depends on the domain.

## What a VPN actually changes

A VPN encrypts everything from your device to the VPN server, and your traffic emerges from there.

That means the local network and its operator now see only an encrypted tunnel to one address. It also means **the VPN provider sees everything the local network used to see.**

> [!NOTE]
> A VPN does not remove the observer. It replaces the coffee shop and your internet provider with a company you are paying, whose logging policy you cannot verify and whose jurisdiction may differ from yours. That is sometimes a good trade and it is a trade.

The cases where it is clearly worth it: a genuinely untrusted network, a network that inspects or blocks traffic, hiding your IP address from the sites you visit, and accessing a corporate network remotely.

The case where it is oversold is privacy from tracking. A VPN changes your IP address and nothing else. Cookies still work, logins still identify you, and fingerprinting is unaffected because it measures your device rather than your network, as covered in [what your browser announces](/blog/what-your-browser-announces). A logged-in session is still a logged-in session on the other side of a tunnel.

## The threat that did not go away

Not the eavesdropper. The fake network.

An access point named \`Airport_Free_WiFi\` is trivial to create, and a device that has connected to that name before may join it automatically. Once you are on it, the operator controls DNS and can redirect you.

HTTPS still protects the content, and the failure mode is a certificate warning rather than silent interception. Which leads to the single most important habit on any unfamiliar network:

> [!WARNING]
> Never click through a certificate warning. On a normal network it is usually a misconfiguration. On an unfamiliar one it is the only signal you get that something is intercepting the connection.

The related trap is the captive portal, the login page a hotel or airport shows before granting access. It is a legitimate mechanism and it is also exactly what a hostile network would imitate. Do not enter an email password into one, and do not install any certificate or profile it offers.

## What is worth doing

**Verify the network name** with staff rather than guessing. \`Starbucks\` and \`Starbucks WiFi\` are different networks and one of them may not be theirs.

**Turn off auto-connect** for open networks, which removes the automatic-join problem entirely.

**Enable encrypted DNS** in your browser or operating system, which closes the most visible remaining leak.

**Keep two-factor authentication on**, because it is what protects the account even if a credential is exposed. The ranking in [password managers and 2FA](/blog/password-manager-and-2fa-setup) applies.

**Check a link before clicking it** if anything about the page seems off, using the right-to-left reading described in [reading a link before you click it](/blog/spotting-a-dangerous-link). A [URL parser](/tool/url-parser) settles what host you are actually on.

**Verify downloads** with a [checksum](/tool/file-checksum) when the network is one you do not control, since an intercepted download is one of the few remaining ways a hostile network causes real damage.

The honest summary: public Wi-Fi is much safer than its reputation, a VPN is a reasonable tool for a specific set of problems, and neither has anything to do with the tracking most of the advertising implies it solves.`,
  'after-a-data-breach': `An email says your details "may have been involved in a security incident". It does not say what was taken, and it recommends changing your password on that service.

That advice is incomplete in a way that matters, because the breached service is usually not where the damage happens.

## Credential stuffing is the mechanism

Attackers do not hand-target your account on the breached site. They take the whole list of email and password pairs and replay it automatically against hundreds of other services.

The reason it works is reuse. A password from a breached forum is tried against your email provider, your bank, your shopping accounts. Anywhere the pair matches, they are in, and no security flaw was needed at the second site.

Which means **the important question is not what the breached site does next. It is where else that password was used.** This is the same argument as in [what makes a password strong](/blog/what-makes-a-password-strong), where uniqueness matters more than strength for exactly this reason.

## What was actually taken

Breach notifications are deliberately vague, and the categories differ enormously in consequence.

| Taken | What it means |
|---|---|
| Email addresses only | Expect targeted phishing referencing that service |
| Passwords, properly hashed | Lower risk, still rotate |
| Passwords, weakly hashed or plaintext | Treat as fully exposed |
| Payment card numbers | Bank will usually reissue; watch statements |
| Identity documents | The serious one, and not resettable |

"Hashed" is doing a lot of work in that table, and it is worth knowing why.

> [!NOTE]
> Unsalted MD5 or SHA-1 hashes are cracked in bulk, because they are fast to compute and rainbow tables exist. Properly salted bcrypt, scrypt or Argon2 is genuinely slow to attack. Those are different situations described by the same word, which is the distinction drawn in [hashing, encryption and encoding](/blog/hashing-vs-encryption-vs-encoding).

Identity documents are the category with no remedy. A password is rotatable; a passport scan is not. This is the concrete reason for the caution about where identity documents get uploaded in [what happens to a file you upload](/blog/what-happens-when-you-upload-a-file).

## The order that matters

**1. Change the password on the breached service.** Obvious, and the least important step.

**2. Change it everywhere you reused it.** This is the actual fix. If you cannot remember where, start with email, banking, cloud storage and anything holding payment details.

**3. Turn on two-factor authentication, email first.** Email is the master key: everything else can be reset through it. The ranking of second factors is in [password managers and 2FA](/blog/password-manager-and-2fa-setup), and the short version is that passkeys and hardware keys resist phishing while SMS does not.

**4. Check active sessions.** Most services list logged-in devices. Sign out everything you do not recognise, which invalidates a stolen session even if the password was already changed.

**5. Check your recovery settings.** Attackers add a recovery email or phone number so they can return later. A changed password does not remove one.

**6. Watch for the phishing that follows.** Breach lists are sold, and a convincing message referencing the real service arrives within weeks. The reading in [reading a link before you click it](/blog/spotting-a-dangerous-link) applies, and the standing rule holds: if you did not initiate it, navigate to the site yourself rather than using the link.

Step five is the one almost everyone skips, and it is how accounts get retaken a month later.

## Generating the replacements

A unique password per service is only practical with a manager, which is why that is the recommendation rather than a suggestion.

For the ones you have to type or remember, a [passphrase](/tool/passphrase-gen) of five or six randomly selected words is both stronger and more usable than a short complex string. For everything else, a [generated password](/tool/password-generator) of 16 characters or more, stored in the manager, is the right shape.

Before reusing anything you already have, run it through a [strength checker](/tool/password-strength). It reports entropy without transmitting the password anywhere, which is a requirement that online equivalents do not universally meet.

## What to do beforehand

The response is much shorter when the preparation is done, and it is the same short list every time:

- A unique password on every account, which contains the damage to one service.
- 2FA on email, banking and the password manager itself.
- Recovery codes on paper somewhere other than your desk.
- A card with a spending limit for online purchases.

None of that prevents a breach, because the breach happens at their end. It changes a breach from an afternoon of work into changing one password.`,
};
