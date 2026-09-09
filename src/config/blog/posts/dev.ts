import { BlogPost } from '../types';

export const DEV_POSTS: BlogPost[] = [
  {
    slug: 'unicode-utf8-and-mojibake',
    title: 'Why your text turns into Ã©: Unicode, UTF-8 and mojibake explained',
    description: 'Encoding bugs produce a small, recognisable set of symptoms. Learning to read them tells you exactly where the pipeline went wrong.',
    excerpt: 'When "café" arrives as "cafÃ©", the bytes are fine — something decoded them with the wrong assumption. The garbled output tells you which assumption.',
    category: 'dev',
    tags: ['unicode', 'utf-8', 'encoding'],
    published: '2026-08-05',
    relatedTools: ['unicode-converter', 'ascii-converter', 'text-cleaner', 'binary-converter'],
    body: `Text is not characters. Text is bytes, plus an agreement about what those bytes mean. Almost every encoding bug is a place where two pieces of software disagreed about that agreement.

## Two separate things

**Unicode** is a catalogue. It assigns every character a number called a code point: \`A\` is U+0041, \`é\` is U+00E9, \`अ\` is U+0905, \`🙂\` is U+1F642. That is all Unicode is — a very large numbered list.

**An encoding** is a rule for turning those numbers into bytes. UTF-8, UTF-16 and UTF-32 are different rules for the same catalogue.

UTF-8 won, and deservedly. It uses one byte for the ASCII range, so every plain-English ASCII file is already valid UTF-8, and two to four bytes for everything else. It is self-synchronising and has no byte-order ambiguity.

## Reading the symptoms

**\`café\` → \`cafÃ©\`**: The text was encoded as UTF-8 and decoded as Latin-1 (or Windows-1252). In UTF-8, \`é\` is the two bytes \`C3 A9\`. Latin-1 has a character for every byte, so it renders them as two characters: \`Ã\` and \`©\`. This is the single most common encoding bug in existence.

**\`café\` → \`caf?\` or \`caf□\`**: The opposite direction — the character could not be represented in the target encoding and was replaced. This is lossy. The information is gone, not merely displayed wrongly.

**\`café\` → \`caf\`**: Silent truncation at a byte that could not be decoded.

**An invisible character at the very start of a file**: A UTF-8 byte order mark (\`EF BB BF\`), which some editors show as \`\\ufeff\`. Harmless in a text editor, and a real problem in a CSV header row or a JSON file, where the parser sees an unexpected character before the first field name.

The important insight: **in the first case the underlying bytes are still correct.** Re-decoding them properly recovers the text. In the second, the data is destroyed.

## The two-byte rule of thumb

If one accented character becomes exactly two garbled characters, you are looking at a UTF-8/Latin-1 mismatch and the data is recoverable. If it becomes one replacement character, it is not.

## Normalisation: two ways to write the same thing

Unicode sometimes offers more than one way to encode the same visible character. \`é\` can be a single code point U+00E9, or it can be \`e\` (U+0065) followed by a combining acute accent (U+0301).

They look identical. They are not equal as strings. \`"café" === "café"\` can be false.

This causes real problems: macOS traditionally stores filenames in decomposed form (NFD) while Linux and Windows use composed form (NFC), so the same filename can fail to match across systems. Database lookups miss. Deduplication misses.

The fix is normalisation — convert to a canonical form before comparing. NFC (composed) is the right default for storage and comparison on the web.

## String length lies

\`"🙂".length\` is 2 in JavaScript, because JS strings are UTF-16 and characters outside the Basic Multilingual Plane are stored as surrogate pairs.

It gets worse. A family emoji like 👨‍👩‍👧 is several code points joined by zero-width joiners. A flag is two regional indicator symbols. \`"👨‍👩‍👧".length\` is 8.

If you are counting characters for a limit — a bio field, an SMS, a database column — decide which unit you actually mean:

- **Bytes** for storage limits.
- **Code points** for most technical purposes.
- **Grapheme clusters** for anything a human would call "characters".

Naively slicing a string at a byte or code-unit boundary will split a character in half and produce a replacement character.

## Rules that prevent all of this

1. **UTF-8 everywhere.** Files, databases, HTTP headers, HTML meta tags, connection strings. Every mismatch is a bug waiting to happen.
2. **Declare it explicitly.** \`<meta charset="utf-8">\` as the first thing in \`<head>\`; \`Content-Type: text/html; charset=utf-8\` on responses.
3. **Never guess an encoding** in your own code paths. Decide it and enforce it at the boundary.
4. **Normalise to NFC** before comparing or storing user-supplied text.
5. **Do not add a BOM** to UTF-8 files. It solves nothing and breaks parsers.
6. **In MySQL, use \`utf8mb4\`, not \`utf8\`.** The latter is a three-byte subset that cannot store emoji — a famous and still-common footgun.

## Inspecting the bytes

When text looks wrong, look at the actual bytes rather than guessing. NextTool's [Unicode converter](/tool/unicode-converter) shows code points for any string, and the [binary](/tool/binary-converter) and [ASCII](/tool/ascii-converter) converters show the byte-level view — usually enough to identify which of the failures above you are looking at.`,
  },

  {
    slug: 'json-errors-and-how-to-fix-them',
    title: 'The JSON errors everyone hits, and what the spec actually says',
    description: 'Trailing commas, single quotes, comments and big numbers. The five JSON mistakes that account for most parse failures, and how to spot them fast.',
    excerpt: 'JSON is a deliberately tiny format. Most parse errors come from writing JavaScript object syntax and expecting a JSON parser to accept it.',
    category: 'dev',
    tags: ['json', 'parsing', 'api'],
    published: '2026-08-08',
    relatedTools: ['json-formatter', 'json-to-csv', 'csv-to-json', 'yaml-formatter'],
    body: `JSON's whole design goal was to be small enough to specify on a business card. That minimalism is why it won, and also why people constantly write things it does not allow — because those things are legal in JavaScript, which JSON only superficially resembles.

## The five that account for most failures

**1. Trailing commas.**

\`\`\`json
{ "a": 1, "b": 2, }
\`\`\`

Legal in modern JavaScript, illegal in JSON. The error message usually points at the closing brace, one position after the actual problem — which is why people stare at the wrong line.

**2. Single quotes.** JSON strings must use double quotes. \`{'name': 'value'}\` is a JavaScript object literal, not JSON.

**3. Unquoted keys.** \`{name: "value"}\` is likewise JavaScript. Every key in JSON is a double-quoted string.

**4. Comments.** There is no comment syntax in JSON. Not \`//\`, not \`/* */\`, not \`#\`. If you need commented configuration, use YAML, TOML, or JSON5 — but know that you are no longer writing JSON.

**5. Unescaped characters inside strings.** Literal newlines, tabs and unescaped double quotes inside a string value all break parsing. They must be written as \`\\n\`, \`\\t\` and \`\\"\`. This one shows up constantly when someone pastes multi-line text into a JSON field by hand.

Also not allowed: \`NaN\`, \`Infinity\`, \`undefined\`, hexadecimal numbers, leading \`+\` on numbers, and leading zeros like \`012\`.

## The number problem nobody warns you about

JSON numbers have no defined precision limit. JavaScript's \`Number\` is a 64-bit float, which can represent integers exactly only up to 2⁵³−1 (9,007,199,254,740,991).

So this happens:

\`\`\`js
JSON.parse('{"id": 9007199254740993}').id
// → 9007199254740992
\`\`\`

The value changed silently. No error, no warning.

This bites hard with large database IDs, Twitter/X-style snowflake IDs, and financial values in the smallest currency unit. The standard fix is for the API to send those values **as strings**. If you control the parser, \`JSON.parse\` accepts a reviver function, and \`BigInt\` can hold the value once you have it as a string.

Related: never store money as a JSON float. \`0.1 + 0.2\` is not \`0.3\` in binary floating point, and rounding errors in currency have a way of becoming someone's problem later.

## Duplicate keys are undefined behaviour

\`{"a": 1, "a": 2}\` is not an error by the letter of the spec, and different parsers do different things — most take the last occurrence, some take the first, some raise. Never rely on it.

## Reading a parse error efficiently

Parse errors report the position where the parser gave up, which is usually *after* the mistake. A missing comma between two objects is reported at the start of the second object; a missing closing brace is reported at the end of the file.

The fastest way to locate a structural error in a large document is to format it. Pretty-printing with consistent indentation makes an unbalanced bracket visible immediately, because the indentation stops lining up. Collapsing sections narrows it down further.

## A short checklist

1. Format the document to see its structure.
2. Check the ending: unbalanced braces or brackets are the most common structural fault.
3. Search for \`'\` — single quotes should not appear outside string content.
4. Search for \`,]\` and \`,}\` to find trailing commas.
5. Look for large integers that might be silently truncated.
6. Confirm the file is UTF-8 without a byte order mark — a BOM before the opening brace fails many parsers.

## JSON vs the alternatives

**JSON5 / JSONC** allow comments, trailing commas and unquoted keys. Fine for config files you control; not something to send over an API.

**YAML** is far more readable for configuration and far more dangerous — significant whitespace, and the classic surprise where an unquoted \`no\` becomes boolean false and \`3.10\` becomes the number 3.1.

**NDJSON** (one JSON object per line) is the right choice for logs and streams, because a broken line does not invalidate the whole file.

Formatting, validating and converting JSON is pure string work — no server needed. NextTool's [JSON formatter](/tool/json-formatter) validates and pretty-prints in the browser, which matters when the document is an API response containing real customer data.`,
  },

  {
    slug: 'base64-encoding-explained',
    title: 'Base64, explained properly: what it is for and what it is not',
    description: 'Base64 turns binary into text at a 33% size cost. It is an encoding, not encryption, and using it as the latter is a recurring security mistake.',
    excerpt: 'Base64 shows up in data URIs, email attachments, JWTs and API payloads. It also shows up in security incident reports, because people mistake it for protection.',
    category: 'dev',
    tags: ['base64', 'encoding', 'binary'],
    published: '2026-08-15',
    relatedTools: ['base64', 'image-to-base64', 'base64-to-image', 'jwt-decoder'],
    body: `Base64 solves one narrow problem: moving binary data through a channel that only reliably carries text.

Email bodies, JSON string values, URLs, XML documents and HTML attributes all expect text. Hand them raw binary — a PNG, a zip file, an encryption key — and bytes get mangled: a \`0x00\` truncates a C string, \`0x0A\` becomes a line break, high bytes get reinterpreted by whatever encoding is in play. Base64 sidesteps all of it by re-expressing arbitrary bytes using 64 characters that survive any text pipeline.

## How it works

Take three bytes — 24 bits. Split them into four groups of 6 bits. Each 6-bit group is a number from 0 to 63, which indexes into the alphabet \`A–Z\`, \`a–z\`, \`0–9\`, \`+\`, \`/\`.

So three input bytes always become four output characters. When the input length is not a multiple of three, the encoder pads with \`=\` to keep the output length a multiple of four. One \`=\` means the last group had two bytes; two \`=\` means it had one.

\`\`\`
Input:   M      a      n
Bits:    01001101 01100001 01101110
Regroup: 010011 010110 000101 101110
Index:   19     22     5      46
Output:  T      W      F      u
\`\`\`

## The 33% tax

Four characters for every three bytes is a **33% size increase**, before any transport overhead. A 3 MB image becomes about 4 MB of Base64.

This is the single most important practical fact about it, and the reason for most of the guidance below.

## The URL-safe variant

\`+\` and \`/\` are not safe in URLs or filenames — \`/\` is a path separator and \`+\` means a space in query strings. Base64url (RFC 4648 §5) replaces them with \`-\` and \`_\`, and usually drops the \`=\` padding.

This is what JWTs use, and it is why a JWT never contains \`+\`, \`/\` or \`=\`. If you are decoding one by hand and it fails, check that your decoder handles the URL-safe alphabet.

## Base64 is not encryption

This needs saying plainly, because it keeps appearing in real systems:

**Base64 provides no confidentiality whatsoever.** It is a public, reversible transformation with no key. Anyone can decode it instantly. A password, an API key or a token stored "encoded in Base64" is stored in plaintext with an extra step.

The recurring failure mode is HTTP Basic authentication, which sends \`base64(username:password)\` in a header. That is not protection — it is why Basic auth is only acceptable over TLS, which is what actually provides the confidentiality.

Related: a JWT payload is Base64url, not encrypted. Anyone holding the token can read every claim inside it. The signature prevents *modification*, not *reading*. Do not put anything private in a JWT payload.

## When to use it, and when not to

**Reasonable:**

- Embedding a small icon or SVG as a data URI to avoid a network round-trip.
- Attaching binary to email (MIME has done this since the beginning).
- Putting a small binary blob inside a JSON field.
- Encoding binary keys, hashes and signatures for text-based config.

**Not reasonable:**

- **Large images in HTML or CSS.** You pay the 33% overhead, the asset cannot be cached independently, and inline data blocks the parser. A separate file that the browser caches is better in almost every case. The rough threshold is a few kilobytes.
- **Large file uploads.** Multipart form data sends bytes directly, with no overhead.
- **Anything you want to keep secret.** Encrypt it.
- **"Compressing" data.** It makes data 33% larger, never smaller.

## A note on encoding order

If you need both compression and Base64, **compress first, then encode.** Base64 output is high-entropy text that compresses poorly, so doing it the other way round wastes most of the compression.

## Decoding safely

Decoding is a pure transformation with no server involvement required, which matters because the things people decode — tokens, config blobs, API payloads — are frequently sensitive. NextTool's [Base64 tool](/tool/base64) and [JWT decoder](/tool/jwt-decoder) run entirely in the browser, so pasting a live session token into them does not transmit it anywhere.

Which is worth caring about, given that a leaked token is usable by whoever finds it until it expires.`,
  },

  {
    slug: 'how-diff-tools-find-changes',
    title: 'How diff tools work, and why they sometimes show the wrong change',
    description: 'Diff algorithms find the longest common subsequence between two texts. Knowing that explains misaligned hunks, and how to get a more useful comparison.',
    excerpt: 'A diff tool has no idea what your code means. It is solving a sequence-matching problem — which is why moved blocks look like a delete plus an unrelated insert.',
    category: 'dev',
    tags: ['diff', 'git', 'algorithms'],
    published: '2026-08-16',
    relatedTools: ['diff-checker', 'diff-text', 'word-compare', 'pdf-compare'],
    body: `A diff tool takes two versions of a text and reports what changed. That sounds like it needs to understand the content. It does not — it is solving a pure sequence problem, and every quirk in diff output follows from that.

## The underlying problem

Given two sequences, find the **longest common subsequence**: the longest ordered set of elements appearing in both, not necessarily contiguously. Everything in the first sequence not in the LCS is a deletion; everything in the second not in the LCS is an insertion.

For:

\`\`\`
A: the quick brown fox
B: the slow brown fox
\`\`\`

The LCS is \`the … brown fox\`. So \`quick\` was deleted and \`slow\` was inserted. The tool has no concept of "the word was replaced" — replacement is just a deletion adjacent to an insertion.

## The Myers algorithm

Computing an LCS naively is O(N×M), which is unworkable on large files. Eugene Myers' 1986 algorithm reframes it as finding the shortest path through an edit graph and runs in O(ND), where D is the size of the difference.

The practical consequence is important: **diff is fast when files are similar and slow when they are not.** Comparing two versions of a file with three changed lines is nearly instantaneous. Comparing two unrelated files of the same size is much slower, because D is enormous.

This is why diffing minified JavaScript — one long line, everything different — can hang a tool that handles a 10,000-line source file instantly.

## Granularity changes everything

The same algorithm produces very different output depending on what counts as an "element".

**Line-based** is what Git uses. Fast, and the right unit for code, where a line is a meaningful statement. Its weakness is prose: change one word in a paragraph and the whole paragraph shows as deleted and re-added.

**Word-based** is right for prose and documents, showing the actual words that changed within a sentence.

**Character-based** gives the finest detail and produces noisy, hard-to-read output on anything longer than a short string.

Many tools do both: line-level to find the changed regions, then word-level within those regions to highlight precisely what moved. That hybrid is what makes a good side-by-side view readable.

## Why moved blocks look wrong

Move a function from the top of a file to the bottom. A standard diff shows a large deletion at the top and a large insertion at the bottom, with no indication that they are the same code.

That is correct output for the algorithm — an LCS is by definition order-preserving, so a reordering cannot be expressed as anything else. Some tools add move detection as a separate post-processing pass, comparing deleted and inserted blocks for similarity. It is a heuristic layered on top, not part of the core algorithm.

Similarly, reindenting a whole file produces a diff where every line changed. Most tools offer an "ignore whitespace" option that normalises before comparing — the first thing to reach for when a diff looks absurdly large.

## Making diffs more useful

1. **Ignore whitespace** when the change is a reformat, not a rewrite.
2. **Choose the granularity that matches the content.** Line diff for code, word diff for a contract.
3. **Normalise line endings first.** A file saved on Windows (CRLF) compared against the same file saved on Linux (LF) shows every single line as changed. This is a top-three cause of nonsense diffs.
4. **Diff the source, not the output.** Comparing two PDFs or two Word documents means comparing rendered artefacts; comparing the text they contain is far more informative.
5. **Split unrelated changes.** A diff containing a rename, a refactor and a bug fix is unreadable. This is a discipline point, not a tooling one.

## Comparing documents rather than code

Diffing is also how you check whether a contract came back modified, or whether a supplier changed a clause in a specification. For those, [text comparison](/tool/diff-checker) and [document comparison](/tool/word-compare) are the relevant tools — and since the documents in question are often confidential, running the comparison locally rather than pasting both versions into a web service is the sensible default.`,
  },

  {
    slug: 'jwt-structure-and-verification',
    title: 'JWTs: what is inside one, and why decoding is not verifying',
    description: 'A JSON Web Token is three Base64url segments. Reading them is trivial and proves nothing — the signature is what carries the security.',
    excerpt: 'Anyone holding a JWT can read every claim in it. That is by design, and it is the single most misunderstood thing about the format.',
    category: 'dev',
    tags: ['jwt', 'auth', 'security'],
    published: '2026-08-23',
    relatedTools: ['jwt-decoder', 'base64', 'hash-generator'],
    body: `A JSON Web Token is three Base64url-encoded segments separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE3MzAwMDAwMDB9.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
   header                                payload                                  signature
\`\`\`

## The three parts

**Header** — a small JSON object naming the signing algorithm, e.g. \`{"alg":"HS256","typ":"JWT"}\`.

**Payload** — the claims. Registered claim names are short by convention: \`sub\` (subject), \`iss\` (issuer), \`aud\` (audience), \`exp\` (expiry, as a Unix timestamp), \`iat\` (issued at), \`nbf\` (not before). You can add your own.

**Signature** — computed over \`base64url(header) + "." + base64url(payload)\` using the algorithm from the header and a key.

## The part people get wrong

**Base64url is encoding, not encryption.** The payload is readable by anyone who has the token — paste it into any decoder, or run it through \`atob\` in a browser console.

So:

- **Never put anything confidential in a JWT payload.** No passwords, no personal data you would not put in a URL, no internal identifiers you would rather not leak.
- The signature guarantees the token has not been *modified*. It does nothing to stop it being *read*.

If you genuinely need an encrypted token, that is JWE, a different specification. JWT alone is signed, not encrypted.

## Decoding versus verifying

Decoding splits on dots and Base64url-decodes. It requires no key and proves nothing.

Verifying recomputes the signature using the key and compares. Only that step establishes the token is authentic.

A decoder — including [ours](/tool/jwt-decoder) — shows you what is inside a token. It cannot tell you the token is valid, because it does not have your signing key. That is expected behaviour, not a limitation to work around.

## The \`alg: none\` problem

Early JWT libraries trusted the \`alg\` field in the header. An attacker could set \`"alg":"none"\`, strip the signature, and some libraries would accept it as valid.

A related attack: a server expecting RS256 (asymmetric) receives a token claiming HS256 (symmetric), and a naive library verifies the HMAC using the *public* key as the shared secret — a key the attacker also has.

Both are fixed in maintained libraries, and both are still worth knowing, because the underlying lesson generalises: **the server must decide which algorithm it accepts. Never take that instruction from the token itself.**

## Checking a token properly

A verifier should confirm all of the following:

1. The signature is valid, using an algorithm the server chose in advance.
2. \`exp\` is in the future.
3. \`nbf\`, if present, is in the past.
4. \`iss\` matches the expected issuer.
5. \`aud\` includes this service.

Skipping the expiry check is depressingly common and turns a short-lived token into a permanent credential.

## The revocation problem

JWTs are stateless — that is their appeal. The server validates the signature without a database lookup, which scales beautifully.

It also means **you cannot revoke one.** A stolen token is valid until it expires, full stop. Logging out clears it from the client, and does nothing about a copy an attacker took.

Practical mitigations: keep access tokens short-lived (minutes, not days), use refresh tokens that *are* stored server-side and can be revoked, and maintain a deny-list for emergencies — accepting that you have reintroduced the state you were trying to avoid.

## Where to store one

- **localStorage**: readable by any JavaScript on the page. One XSS vulnerability and the token is exfiltrated.
- **httpOnly cookie**: unreadable by JavaScript, so XSS cannot steal it directly. Requires CSRF protection, and \`SameSite\` handles most of that.

The general recommendation is an httpOnly, Secure, SameSite cookie.

## Inspecting tokens safely

Session tokens end up pasted into online decoders during debugging all the time. A live token is a live credential — if the decoder's server logs it, that log is now a set of working keys to someone's account.

Decoding is pure string manipulation, so there is no reason for it to happen anywhere but your own browser. That is how the [JWT decoder](/tool/jwt-decoder) here works. Whatever tool you use, check that before pasting a production token into it.`,
  },

  {
    slug: 'regex-patterns-that-actually-come-up',
    title: 'Regex without the mystique: the patterns that actually come up',
    description: 'Anchors, greedy versus lazy matching, groups and the backtracking trap. The regex knowledge that covers most real tasks.',
    excerpt: 'Most regex frustration comes from three things: forgetting anchors, not knowing greedy matching exists, and trying to validate email addresses.',
    category: 'dev',
    tags: ['regex', 'text-processing', 'validation'],
    published: '2026-08-27',
    relatedTools: ['regex-tester', 'find-replace', 'extract-emails', 'extract-urls', 'text-cleaner'],
    body: `Regular expressions have a reputation for being write-only. In practice a small subset covers the overwhelming majority of real tasks, and three specific misunderstandings cause most of the pain.

## Anchors: the most common omission

\`\\d{4}\` matches four digits **anywhere** in the string. It happily matches inside \`abc1234xyz\`.

\`^\\d{4}$\` matches a string that is *exactly* four digits and nothing else.

If you are validating rather than searching, you almost always want anchors. A validation regex without them will accept input with arbitrary junk on either side, which is a genuine security issue when the value ends up in a query or a filename.

\`\\b\` is the word-boundary anchor: \`\\bcat\\b\` matches \`cat\` in "the cat sat" but not in "concatenate".

## Greedy versus lazy

This is the behaviour that surprises people most.

\`\`\`
Input:   <b>bold</b> and <i>italic</i>
Pattern: <.+>
Match:   <b>bold</b> and <i>italic</i>     ← the whole thing
\`\`\`

\`+\` is **greedy**: it takes as much as possible, then backtracks only enough to let the rest of the pattern succeed. Since the string ends with \`>\`, the greedy match swallows everything.

Adding \`?\` makes it **lazy** — take as little as possible:

\`\`\`
Pattern: <.+?>
Matches: <b>, </b>, <i>, </i>
\`\`\`

A more precise approach avoids the question entirely: \`<[^>]+>\` — "angle bracket, then characters that are not a closing bracket". Negated character classes are usually clearer and faster than lazy quantifiers.

## Groups

\`(...)\` captures — the matched text is available as \`$1\`, \`$2\` and so on, which is what makes find-and-replace powerful:

\`\`\`
Find:    (\\w+)@(\\w+)\\.com
Replace: $2 contact: $1
\`\`\`

\`(?:...)\` groups without capturing, for when you only need the grouping for alternation or repetition.

\`(?<name>...)\` captures by name, which is worth the extra characters in any pattern you will read again.

## Catastrophic backtracking

This is where regex stops being a convenience and becomes an outage.

\`\`\`
Pattern: (a+)+b
Input:   aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
\`\`\`

There is no \`b\`, so the match must fail — but the engine tries every way of dividing those \`a\`s between the inner and outer quantifier before concluding that. The number of combinations grows exponentially, and a 30-character input can hang a thread.

This is a real denial-of-service vector, known as ReDoS, and it has taken down production systems. The pattern to watch for is **nested quantifiers with overlapping alternatives**: \`(a+)+\`, \`(a|a)*\`, \`(\\s*\\w+)*\`.

Avoid it by making sure each part of the pattern can only match in one way, and by testing patterns against long non-matching inputs rather than only against the input you expect.

## Do not validate email addresses with regex

The RFC 5322 grammar for a valid email address permits quoted strings, comments, and IP-literal domains. A regex that fully implements it is several thousand characters long and still cannot tell you whether the address exists.

Use a sanity check — "has one \`@\`, has something before it, has a dot after it" — and then **send a confirmation email**. That is the only test that answers the question you actually care about.

The same reasoning applies to URLs, phone numbers and postal addresses. Regex validation on these rejects legitimate real-world input constantly.

## Patterns worth keeping

\`\`\`
^\\s+|\\s+$              trim whitespace
\\s{2,}                 runs of whitespace (replace with one space)
^\\s*$\\n                blank lines
\\d{4}-\\d{2}-\\d{2}      ISO-style date
#?([0-9a-fA-F]{6})     hex colour
^(?=.*[a-z])(?=.*\\d)   lookahead: contains a lowercase letter and a digit
\`\`\`

Lookahead \`(?=...)\` asserts something follows without consuming it — the standard tool for "must contain all of these" rules.

## Test before you ship

Regex is dense and easy to get subtly wrong in ways that only appear on real data. Build patterns against actual sample text, including the cases you expect to *fail*. A [regex tester](/tool/regex-tester) with live highlighting turns a guessing game into a two-minute job.

For common extraction tasks — [emails](/tool/extract-emails), [URLs](/tool/extract-urls), [phone numbers](/tool/extract-phones) — a dedicated tool with a battle-tested pattern will do better than one you write in a hurry.`,
  },

  {
    slug: 'uuid-v4-vs-v7-which-one',
    title: 'UUID v4 or v7? What changed and which to use for database keys',
    description: 'Random UUIDs fragment database indexes. Version 7 puts a timestamp in front, making identifiers sortable while staying unpredictable enough.',
    excerpt: 'v4 is 122 random bits and has served well for twenty years. v7 fixes the one place it hurts: as a primary key in a B-tree index.',
    category: 'dev',
    tags: ['uuid', 'databases', 'identifiers'],
    published: '2026-09-03',
    relatedTools: ['uuid-generator', 'random-string', 'timestamp-converter'],
    body: `A UUID is a 128-bit identifier you can generate anywhere without coordinating with anyone. The version number, encoded in the identifier itself, says how those bits were chosen.

## The versions that matter

**v1** — timestamp plus the machine's MAC address. Sortable, and it leaks both when and where it was created. The MAC address disclosure is why it fell out of favour; it was used to trace the author of the Melissa virus in 1999.

**v4** — 122 random bits (6 are fixed for version and variant). The default nearly everywhere for two decades. No information leakage, no coordination needed.

**v7** — a 48-bit Unix millisecond timestamp followed by random bits. Standardised in RFC 9562, which replaced the old RFC 4122 in 2024. Time-ordered while still unpredictable.

## Why v4 hurts as a primary key

Most relational databases store rows in a B-tree ordered by primary key. Insert sequential keys and every new row goes at the right-hand edge of the tree — the same few pages stay hot in memory and writes are cheap.

Insert random keys and each one lands in an arbitrary position. The database must read the target page from disk, split pages that are full, and keep effectively the entire index hot to avoid thrashing. Index fragmentation grows and write throughput degrades as the table gets large.

The effect is negligible on a table with 10,000 rows and very real on one with 100 million. This is why teams reach a scale where "we should not have used random UUIDs" becomes a migration project.

MySQL's InnoDB clusters the table data itself on the primary key, so the penalty is particularly sharp there.

## What v7 fixes

Because the leading 48 bits are a millisecond timestamp, v7 values generated over time are broadly increasing. Inserts cluster at the end of the index, restoring the locality that makes sequential keys fast, while keeping the "generate anywhere without coordination" property that made UUIDs attractive.

You also get a free creation timestamp embedded in the identifier, and natural sort order for free.

The cost is that a v7 UUID reveals roughly when it was created. For a database primary key that is almost never a problem. For a password-reset token it might be.

## Choosing

| Use case | Choose |
|---|---|
| Database primary key | v7 |
| Public-facing resource ID | v4 or v7 |
| Session token, reset token, API key | **Neither** — use a CSPRNG |
| Correlation / trace ID | v7 (sortable logs are useful) |
| Existing system already on v4 | Stay on v4 unless you have measured a problem |

## Do not use UUIDs as secrets

A v4 UUID has 122 bits of randomness, which is plenty of entropy — **if** it came from a cryptographically secure generator. Many older libraries used \`Math.random()\` or a similar non-cryptographic PRNG, whose internal state can be recovered from a handful of outputs, making subsequent values predictable.

For anything security-sensitive, generate bytes from a CSPRNG directly (\`crypto.getRandomValues\` in the browser, \`crypto.randomBytes\` in Node) rather than relying on a UUID library's implementation choices.

Also: a v7 UUID's timestamp portion is not random at all. Never use one as a secret.

## Collisions, briefly

For v4, the probability of a collision is negligible at any realistic scale. Generating a billion UUIDs a second for a century leaves the chance of a single collision far below the chance of a hardware fault silently corrupting the data instead.

Collisions are not the thing to worry about. Weak randomness sources are.

## Storage

A UUID is 128 bits — 16 bytes. Stored as a hyphenated string it is 36 bytes, more than twice the size, and every index entry pays for it.

Use a native \`uuid\` type where the database has one (PostgreSQL does), or \`BINARY(16)\` where it does not. On a large table with several UUID columns and indexes, the difference is measured in gigabytes.

## Generating them

Both versions are cheap to generate client-side; there is no reason to ask a server for an identifier. The [UUID generator](/tool/uuid-generator) here produces them in the browser using the platform's crypto API, and the [timestamp converter](/tool/timestamp-converter) is handy for reading the embedded time out of a v7 value when you are debugging.`,
  },

  {
    slug: 'colour-contrast-and-wcag',
    title: 'Colour contrast: what the WCAG numbers mean and how to hit them',
    description: 'The 4.5:1 ratio comes from a specific luminance formula. Understanding it explains why light grey on white fails and how to fix a palette without redesigning it.',
    excerpt: 'Low-contrast text is the most common accessibility failure on the web, and one of the easiest to fix — once you know which number you are aiming at and why.',
    category: 'dev',
    tags: ['accessibility', 'wcag', 'colour', 'css'],
    published: '2026-09-08',
    relatedTools: ['contrast-checker', 'color-converter', 'palette-color', 'gradient-generator'],
    body: `Light grey text on a white background is the signature look of a certain kind of modern web design, and it is the single most common accessibility failure measured on real websites. It is also trivially fixable.

## What the ratio measures

WCAG defines a contrast ratio between two colours based on their **relative luminance** — a measure of perceived brightness that weights the colour channels according to how sensitive human vision is to each:

\`\`\`
L = 0.2126 R + 0.7152 G + 0.0722 B
\`\`\`

(with each channel first linearised from its sRGB value)

Green contributes over 70% of perceived brightness; blue contributes about 7%. This is why pure blue text on black is hard to read despite looking like a strong colour difference — there is almost no luminance difference.

The ratio is then:

\`\`\`
(L_lighter + 0.05) / (L_darker + 0.05)
\`\`\`

It ranges from **1:1** (identical colours) to **21:1** (pure black on pure white).

## The thresholds

| Content | AA | AAA |
|---|---|---|
| Normal text | 4.5:1 | 7:1 |
| Large text (≥18.66px bold, or ≥24px) | 3:1 | 4.5:1 |
| UI components, graphics, focus indicators | 3:1 | — |

AA is the level referenced by most accessibility legislation, including the European Accessibility Act and the standards used for public sector procurement in many countries. AAA is a goal, not usually a requirement.

Note the third row: it was added in WCAG 2.1 and is widely missed. Input borders, toggle states, icons that convey meaning and focus rings all need 3:1 against their surroundings. A form field with a barely-visible border technically fails even if its label is perfectly readable.

## What is exempt

- **Disabled controls.** No requirement, though a disabled control nobody can see is still poor design.
- **Purely decorative graphics** that convey no information.
- **Logos and brand names** as they appear.
- **Text that is part of a photograph.**

## Fixing a palette without redesigning it

**Adjust lightness, not hue.** Contrast is a luminance relationship. Take your brand colour and darken it for text use while keeping the same hue and saturation — the palette still reads as the same brand, and the text passes. Working in HSL or LCH makes this a one-value change.

**Body text at #767676 or darker on white.** That is roughly the lightest neutral grey that reaches 4.5:1 against pure white. Anything lighter fails for body copy. \`#999999\` — a very popular choice for "secondary" text — comes in at about 2.8:1 and fails clearly.

**Do not rely on colour alone.** A red border on an invalid field is invisible to a substantial number of users. Add an icon or text. This is a separate WCAG criterion from contrast and is failed just as often.

**Check both themes.** A palette tuned for a light theme frequently fails in dark mode, where the relationship inverts and mid-greys that worked against white are now too close to a dark background.

**Test text over images.** A caption over a photograph passes or fails depending on the pixels behind it. Use a scrim — a semi-transparent overlay — rather than hoping.

## Where automated checking stops

An automated checker reliably catches contrast failures. It cannot tell you whether your alt text is meaningful, whether the tab order makes sense, or whether a control is operable by keyboard. Contrast is the part of accessibility that is genuinely measurable, which is precisely why there is no excuse for failing it.

## Checking as you design

Pick colours and see the ratio immediately rather than auditing at the end, when changing a palette means changing a design system. The [contrast checker](/tool/contrast-checker) shows the ratio and the AA/AAA verdict for any pair, and the [colour converter](/tool/color-converter) moves between HEX, RGB and HSL so you can adjust lightness without disturbing the hue you actually chose.`,
  },
];
