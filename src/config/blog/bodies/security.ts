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
};
