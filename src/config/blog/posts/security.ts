import { BlogPost } from '../types';

export const SECURITY_POSTS: BlogPost[] = [
  {
    slug: 'what-makes-a-password-strong',
    title: 'What actually makes a password strong (it is not the special characters)',
    description: 'Password strength is measured in entropy bits. Length dominates; complexity rules mostly produce predictable passwords people cannot remember.',
    excerpt: 'P@ssw0rd! satisfies every complexity rule ever written and is one of the first things any cracking tool tries. Here is what the maths actually says.',
    category: 'security',
    tags: ['passwords', 'entropy', 'authentication'],
    published: '2026-08-09',
    relatedTools: ['password-generator', 'passphrase-gen', 'password-strength', 'random-string'],
    body: `Password strength has a precise definition: how many guesses an attacker needs to try, on average, before finding yours. That number is usually expressed in bits of entropy, where each extra bit doubles the work.

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
  },

  {
    slug: 'hashing-vs-encryption-vs-encoding',
    title: 'Hashing, encryption and encoding are three different things',
    description: 'One is one-way, one is reversible with a key, one is reversible by anyone. Confusing them is behind a large share of real security failures.',
    excerpt: 'If a system can email you your existing password, it is not hashing them. That single observation tells you a lot about how a service is built.',
    category: 'security',
    tags: ['hashing', 'encryption', 'bcrypt', 'sha-256'],
    published: '2026-08-17',
    relatedTools: ['hash-generator', 'file-checksum', 'base64', 'password-strength'],
    body: `Three operations, constantly used as synonyms, with completely different guarantees.

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
  },

  {
    slug: 'verify-a-download-with-checksums',
    title: 'Verifying a download with a checksum: how, and what it actually proves',
    description: 'Comparing SHA-256 hashes catches corrupted and tampered files. Understanding its limits tells you when you need a signature instead.',
    excerpt: 'Checking a hash takes fifteen seconds and catches both a truncated download and a compromised mirror. It does not catch everything, here is the boundary.',
    category: 'security',
    tags: ['checksum', 'sha-256', 'integrity'],
    published: '2026-08-24',
    relatedTools: ['file-checksum', 'hash-generator', 'zip-extractor'],
    body: `Download an operating system image, a database installer or a signed PDF and you will often find a long hexadecimal string published next to the link. That is a checksum, and comparing it against your copy is a fast, worthwhile habit.

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
  },

  {
    slug: 'password-manager-and-2fa-setup',
    title: 'Password managers and 2FA: the setup that actually protects an account',
    description: 'Unique passwords everywhere and a second factor on the accounts that matter. Which second factors are worth using, and which are close to theatre.',
    excerpt: 'Two changes cover most realistic account-takeover risk. Both take an afternoon, and one of them is far more important than the other.',
    category: 'security',
    tags: ['2fa', 'password-manager', 'passkeys', 'totp'],
    published: '2026-08-30',
    relatedTools: ['password-generator', 'passphrase-gen', 'password-strength', 'secure-notes'],
    body: `Most account compromises do not involve anyone attacking you personally. They involve a password leaked from some unrelated service being tried, automatically, against every other service you use. Two changes address the bulk of that.

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
  },

  {
    slug: 'web-crypto-in-plain-english',
    title: 'What browsers can encrypt on their own: the Web Crypto API in plain English',
    description: 'Modern browsers ship a real cryptographic library. Understanding what it offers explains how tools can encrypt and hash without a server.',
    excerpt: 'Every current browser includes AES, SHA-2, key derivation and a proper random number generator. That is why client-side tools stopped being a compromise.',
    category: 'security',
    tags: ['web-crypto', 'aes', 'browsers', 'encryption'],
    published: '2026-09-06',
    relatedTools: ['secure-notes', 'hash-generator', 'password-generator', 'file-checksum'],
    body: `A decade ago, "do the crypto in the browser" was a warning sign, because it meant a hand-rolled JavaScript implementation of AES with unpredictable side channels and a random number generator based on \`Math.random()\`. That objection no longer holds. Browsers now ship a native cryptographic library, and the JavaScript is only calling into it.

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
  },
];
