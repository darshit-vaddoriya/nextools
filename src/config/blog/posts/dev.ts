import { BlogPost } from '../types';

export const DEV_POSTS: BlogPost[] = [
  {
    slug: 'unicode-utf8-and-mojibake',
    title: 'Why your text turns into Ã©: Unicode, UTF-8 and mojibake explained',
    description: 'Encoding bugs produce a small, recognisable set of symptoms. Learning to read them tells you exactly where the pipeline went wrong.',
    excerpt: 'When "café" arrives as "cafÃ©", the bytes are fine, something decoded them with the wrong assumption. The garbled output tells you which assumption.',
    category: 'dev',
    tags: ['unicode', 'utf-8', 'encoding'],
    published: '2026-08-05',
    relatedTools: ['unicode-converter', 'ascii-converter', 'text-cleaner', 'binary-converter'],
    takeaways: [
      'Unicode is a catalogue of characters; an encoding is a rule for turning them into bytes. Most bugs are two systems disagreeing about the rule.',
      'One accented character becoming exactly two garbled ones is a UTF-8 read as Latin-1, and the data is still recoverable.',
      'One character becoming a single replacement symbol means the information is already gone.',
      'Normalise to NFC before comparing or storing, because the same visible character has more than one valid encoding.',
    ],
    body: `Text is not characters. Text is bytes, plus an agreement about what those bytes mean. Almost every encoding bug is a place where two pieces of software disagreed about that agreement.

## Two separate things

**Unicode** is a catalogue. It assigns every character a number called a code point: \`A\` is U+0041, \`é\` is U+00E9, \`अ\` is U+0905, \`🙂\` is U+1F642. That is all Unicode is, a very large numbered list.

**An encoding** is a rule for turning those numbers into bytes. UTF-8, UTF-16 and UTF-32 are different rules for the same catalogue.

UTF-8 won, and deservedly. It uses one byte for the ASCII range, so every plain-English ASCII file is already valid UTF-8, and two to four bytes for everything else. It is self-synchronising and has no byte-order ambiguity.

## Reading the symptoms

**\`café\` → \`cafÃ©\`**: The text was encoded as UTF-8 and decoded as Latin-1 (or Windows-1252). In UTF-8, \`é\` is the two bytes \`C3 A9\`. Latin-1 has a character for every byte, so it renders them as two characters: \`Ã\` and \`©\`. This is the single most common encoding bug in existence.

**\`café\` → \`caf?\` or \`caf□\`**: The opposite direction, the character could not be represented in the target encoding and was replaced. This is lossy. The information is gone, not merely displayed wrongly.

**\`café\` → \`caf\`**: Silent truncation at a byte that could not be decoded.

**An invisible character at the very start of a file**: A UTF-8 byte order mark (\`EF BB BF\`), which some editors show as \`\\ufeff\`. Harmless in a text editor, and a real problem in a CSV header row or a JSON file, where the parser sees an unexpected character before the first field name.

The important insight: **in the first case the underlying bytes are still correct.** Re-decoding them properly recovers the text. In the second, the data is destroyed.

## The two-byte rule of thumb

If one accented character becomes exactly two garbled characters, you are looking at a UTF-8/Latin-1 mismatch and the data is recoverable. If it becomes one replacement character, it is not.

## Normalisation: two ways to write the same thing

Unicode sometimes offers more than one way to encode the same visible character. \`é\` can be a single code point U+00E9, or it can be \`e\` (U+0065) followed by a combining acute accent (U+0301).

They look identical. They are not equal as strings. \`"café" === "café"\` can be false.

This causes real problems: macOS traditionally stores filenames in decomposed form (NFD) while Linux and Windows use composed form (NFC), so the same filename can fail to match across systems. Database lookups miss. Deduplication misses.

The fix is normalisation, convert to a canonical form before comparing. NFC (composed) is the right default for storage and comparison on the web.

## String length lies

\`"🙂".length\` is 2 in JavaScript, because JS strings are UTF-16 and characters outside the Basic Multilingual Plane are stored as surrogate pairs.

It gets worse. A family emoji like 👨‍👩‍👧 is several code points joined by zero-width joiners. A flag is two regional indicator symbols. \`"👨‍👩‍👧".length\` is 8.

If you are counting characters for a limit, a bio field, an SMS, a database column, decide which unit you actually mean:

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
6. **In MySQL, use \`utf8mb4\`, not \`utf8\`.** The latter is a three-byte subset that cannot store emoji, a famous and still-common footgun.

## Inspecting the bytes

When text looks wrong, look at the actual bytes rather than guessing. NextTool's [Unicode converter](/tool/unicode-converter) shows code points for any string, and the [binary](/tool/binary-converter) and [ASCII](/tool/ascii-converter) converters show the byte-level view, usually enough to identify which of the failures above you are looking at.`,
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
    takeaways: [
      'Trailing commas, single quotes, unquoted keys and comments are all legal JavaScript and all illegal JSON.',
      'The error position usually points one character past the real problem, which is why people stare at the wrong line.',
      'Integers beyond 2^53 are silently rounded when parsed, so large IDs must be transported as strings.',
      'Duplicate keys are undefined behaviour in the specification, so different parsers legitimately disagree.',
    ],
    body: `JSON's whole design goal was to be small enough to specify on a business card. That minimalism is why it won, and also why people constantly write things it does not allow, because those things are legal in JavaScript, which JSON only superficially resembles.

## The five that account for most failures

**1. Trailing commas.**

\`\`\`json
{ "a": 1, "b": 2, }
\`\`\`

Legal in modern JavaScript, illegal in JSON. The error message usually points at the closing brace, one position after the actual problem, which is why people stare at the wrong line.

**2. Single quotes.** JSON strings must use double quotes. \`{'name': 'value'}\` is a JavaScript object literal, not JSON.

**3. Unquoted keys.** \`{name: "value"}\` is likewise JavaScript. Every key in JSON is a double-quoted string.

**4. Comments.** There is no comment syntax in JSON. Not \`//\`, not \`/* */\`, not \`#\`. If you need commented configuration, use YAML, TOML, or JSON5, but know that you are no longer writing JSON.

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

\`{"a": 1, "a": 2}\` is not an error by the letter of the spec, and different parsers do different things, most take the last occurrence, some take the first, some raise. Never rely on it.

## Reading a parse error efficiently

Parse errors report the position where the parser gave up, which is usually *after* the mistake. A missing comma between two objects is reported at the start of the second object; a missing closing brace is reported at the end of the file.

The fastest way to locate a structural error in a large document is to format it. Pretty-printing with consistent indentation makes an unbalanced bracket visible immediately, because the indentation stops lining up. Collapsing sections narrows it down further.

## A short checklist

1. Format the document to see its structure.
2. Check the ending: unbalanced braces or brackets are the most common structural fault.
3. Search for \`'\`, single quotes should not appear outside string content.
4. Search for \`,]\` and \`,}\` to find trailing commas.
5. Look for large integers that might be silently truncated.
6. Confirm the file is UTF-8 without a byte order mark, a BOM before the opening brace fails many parsers.

## JSON vs the alternatives

**JSON5 / JSONC** allow comments, trailing commas and unquoted keys. Fine for config files you control; not something to send over an API.

**YAML** is far more readable for configuration and far more dangerous, significant whitespace, and the classic surprise where an unquoted \`no\` becomes boolean false and \`3.10\` becomes the number 3.1.

**NDJSON** (one JSON object per line) is the right choice for logs and streams, because a broken line does not invalidate the whole file.

Formatting, validating and converting JSON is pure string work, no server needed. NextTool's [JSON formatter](/tool/json-formatter) validates and pretty-prints in the browser, which matters when the document is an API response containing real customer data.`,
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
    takeaways: [
      'Base64 turns three bytes into four characters, a fixed 33% increase that no implementation avoids.',
      'It provides no confidentiality at all. Anyone can decode it instantly, with no key involved.',
      'Compress before encoding, never after, because base64 output compresses far worse than the original bytes.',
      'URLs and JWTs use base64url, which swaps two characters, so a standard decoder will reject it until they are swapped back.',
    ],
    body: `Base64 solves one narrow problem: moving binary data through a channel that only reliably carries text.

Email bodies, JSON string values, URLs, XML documents and HTML attributes all expect text. Hand them raw binary, a PNG, a zip file, an encryption key, and bytes get mangled: a \`0x00\` truncates a C string, \`0x0A\` becomes a line break, high bytes get reinterpreted by whatever encoding is in play. Base64 sidesteps all of it by re-expressing arbitrary bytes using 64 characters that survive any text pipeline.

## How it works

Take three bytes, 24 bits. Split them into four groups of 6 bits. Each 6-bit group is a number from 0 to 63, which indexes into the alphabet \`A–Z\`, \`a–z\`, \`0–9\`, \`+\`, \`/\`.

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

\`+\` and \`/\` are not safe in URLs or filenames, \`/\` is a path separator and \`+\` means a space in query strings. Base64url (RFC 4648 §5) replaces them with \`-\` and \`_\`, and usually drops the \`=\` padding.

This is what JWTs use, and it is why a JWT never contains \`+\`, \`/\` or \`=\`. If you are decoding one by hand and it fails, check that your decoder handles the URL-safe alphabet.

## Base64 is not encryption

This needs saying plainly, because it keeps appearing in real systems:

**Base64 provides no confidentiality whatsoever.** It is a public, reversible transformation with no key. Anyone can decode it instantly. A password, an API key or a token stored "encoded in Base64" is stored in plaintext with an extra step.

The recurring failure mode is HTTP Basic authentication, which sends \`base64(username:password)\` in a header. That is not protection, it is why Basic auth is only acceptable over TLS, which is what actually provides the confidentiality.

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

Decoding is a pure transformation with no server involvement required, which matters because the things people decode, tokens, config blobs, API payloads, are frequently sensitive. NextTool's [Base64 tool](/tool/base64) and [JWT decoder](/tool/jwt-decoder) run entirely in the browser, so pasting a live session token into them does not transmit it anywhere.

Which is worth caring about, given that a leaked token is usable by whoever finds it until it expires.`,
  },

  {
    slug: 'how-diff-tools-find-changes',
    title: 'How diff tools work, and why they sometimes show the wrong change',
    description: 'Diff algorithms find the longest common subsequence between two texts. Knowing that explains misaligned hunks, and how to get a more useful comparison.',
    excerpt: 'A diff tool has no idea what your code means. It is solving a sequence-matching problem, which is why moved blocks look like a delete plus an unrelated insert.',
    category: 'dev',
    tags: ['diff', 'git', 'algorithms'],
    published: '2026-08-16',
    relatedTools: ['diff-checker', 'diff-text', 'word-compare', 'pdf-compare'],
    takeaways: [
      'A diff finds the longest common subsequence, so it is fast on similar files and slow on dissimilar ones.',
      'Granularity decides what you see: line-based is right for code, word-based for prose.',
      'Moved blocks show as a delete plus an insert, because the algorithm has no concept of a move.',
      'Normalise line endings and formatting first, or the real change disappears into whitespace noise.',
    ],
    body: `A diff tool takes two versions of a text and reports what changed. That sounds like it needs to understand the content. It does not, it is solving a pure sequence problem, and every quirk in diff output follows from that.

## The underlying problem

Given two sequences, find the **longest common subsequence**: the longest ordered set of elements appearing in both, not necessarily contiguously. Everything in the first sequence not in the LCS is a deletion; everything in the second not in the LCS is an insertion.

For:

\`\`\`
A: the quick brown fox
B: the slow brown fox
\`\`\`

The LCS is \`the … brown fox\`. So \`quick\` was deleted and \`slow\` was inserted. The tool has no concept of "the word was replaced", replacement is just a deletion adjacent to an insertion.

## The Myers algorithm

Computing an LCS naively is O(N×M), which is unworkable on large files. Eugene Myers' 1986 algorithm reframes it as finding the shortest path through an edit graph and runs in O(ND), where D is the size of the difference.

The practical consequence is important: **diff is fast when files are similar and slow when they are not.** Comparing two versions of a file with three changed lines is nearly instantaneous. Comparing two unrelated files of the same size is much slower, because D is enormous.

This is why diffing minified JavaScript, one long line, everything different, can hang a tool that handles a 10,000-line source file instantly.

## Granularity changes everything

The same algorithm produces very different output depending on what counts as an "element".

**Line-based** is what Git uses. Fast, and the right unit for code, where a line is a meaningful statement. Its weakness is prose: change one word in a paragraph and the whole paragraph shows as deleted and re-added.

**Word-based** is right for prose and documents, showing the actual words that changed within a sentence.

**Character-based** gives the finest detail and produces noisy, hard-to-read output on anything longer than a short string.

Many tools do both: line-level to find the changed regions, then word-level within those regions to highlight precisely what moved. That hybrid is what makes a good side-by-side view readable.

## Why moved blocks look wrong

Move a function from the top of a file to the bottom. A standard diff shows a large deletion at the top and a large insertion at the bottom, with no indication that they are the same code.

That is correct output for the algorithm, an LCS is by definition order-preserving, so a reordering cannot be expressed as anything else. Some tools add move detection as a separate post-processing pass, comparing deleted and inserted blocks for similarity. It is a heuristic layered on top, not part of the core algorithm.

Similarly, reindenting a whole file produces a diff where every line changed. Most tools offer an "ignore whitespace" option that normalises before comparing, the first thing to reach for when a diff looks absurdly large.

## Making diffs more useful

1. **Ignore whitespace** when the change is a reformat, not a rewrite.
2. **Choose the granularity that matches the content.** Line diff for code, word diff for a contract.
3. **Normalise line endings first.** A file saved on Windows (CRLF) compared against the same file saved on Linux (LF) shows every single line as changed. This is a top-three cause of nonsense diffs.
4. **Diff the source, not the output.** Comparing two PDFs or two Word documents means comparing rendered artefacts; comparing the text they contain is far more informative.
5. **Split unrelated changes.** A diff containing a rename, a refactor and a bug fix is unreadable. This is a discipline point, not a tooling one.

## Comparing documents rather than code

Diffing is also how you check whether a contract came back modified, or whether a supplier changed a clause in a specification. For those, [text comparison](/tool/diff-checker) and [document comparison](/tool/word-compare) are the relevant tools, and since the documents in question are often confidential, running the comparison locally rather than pasting both versions into a web service is the sensible default.`,
  },

  {
    slug: 'jwt-structure-and-verification',
    title: 'JWTs: what is inside one, and why decoding is not verifying',
    description: 'A JSON Web Token is three Base64url segments. Reading them is trivial and proves nothing, the signature is what carries the security.',
    excerpt: 'Anyone holding a JWT can read every claim in it. That is by design, and it is the single most misunderstood thing about the format.',
    category: 'dev',
    tags: ['jwt', 'auth', 'security'],
    published: '2026-08-23',
    relatedTools: ['jwt-decoder', 'base64', 'hash-generator'],
    takeaways: [
      'A JWT is base64url encoded, not encrypted. Anyone holding one can read the payload.',
      'Decoding is not verifying. Reading the claims proves nothing until the signature is checked against a key you trust.',
      'The server must decide which algorithm it accepts. Taking that instruction from the token itself is the alg none vulnerability.',
      'A signed token cannot be revoked before it expires, which is why short lifetimes matter.',
    ],
    body: `A JSON Web Token is three Base64url-encoded segments separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE3MzAwMDAwMDB9.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
   header                                payload                                  signature
\`\`\`

## The three parts

**Header**, a small JSON object naming the signing algorithm, e.g. \`{"alg":"HS256","typ":"JWT"}\`.

**Payload**, the claims. Registered claim names are short by convention: \`sub\` (subject), \`iss\` (issuer), \`aud\` (audience), \`exp\` (expiry, as a Unix timestamp), \`iat\` (issued at), \`nbf\` (not before). You can add your own.

**Signature**, computed over \`base64url(header) + "." + base64url(payload)\` using the algorithm from the header and a key.

## The part people get wrong

**Base64url is encoding, not encryption.** The payload is readable by anyone who has the token, paste it into any decoder, or run it through \`atob\` in a browser console.

So:

- **Never put anything confidential in a JWT payload.** No passwords, no personal data you would not put in a URL, no internal identifiers you would rather not leak.
- The signature guarantees the token has not been *modified*. It does nothing to stop it being *read*.

If you genuinely need an encrypted token, that is JWE, a different specification. JWT alone is signed, not encrypted.

## Decoding versus verifying

Decoding splits on dots and Base64url-decodes. It requires no key and proves nothing.

Verifying recomputes the signature using the key and compares. Only that step establishes the token is authentic.

A decoder, including [ours](/tool/jwt-decoder), shows you what is inside a token. It cannot tell you the token is valid, because it does not have your signing key. That is expected behaviour, not a limitation to work around.

## The \`alg: none\` problem

Early JWT libraries trusted the \`alg\` field in the header. An attacker could set \`"alg":"none"\`, strip the signature, and some libraries would accept it as valid.

A related attack: a server expecting RS256 (asymmetric) receives a token claiming HS256 (symmetric), and a naive library verifies the HMAC using the *public* key as the shared secret, a key the attacker also has.

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

JWTs are stateless, that is their appeal. The server validates the signature without a database lookup, which scales beautifully.

It also means **you cannot revoke one.** A stolen token is valid until it expires, full stop. Logging out clears it from the client, and does nothing about a copy an attacker took.

Practical mitigations: keep access tokens short-lived (minutes, not days), use refresh tokens that *are* stored server-side and can be revoked, and maintain a deny-list for emergencies, accepting that you have reintroduced the state you were trying to avoid.

## Where to store one

- **localStorage**: readable by any JavaScript on the page. One XSS vulnerability and the token is exfiltrated.
- **httpOnly cookie**: unreadable by JavaScript, so XSS cannot steal it directly. Requires CSRF protection, and \`SameSite\` handles most of that.

The general recommendation is an httpOnly, Secure, SameSite cookie.

## Inspecting tokens safely

Session tokens end up pasted into online decoders during debugging all the time. A live token is a live credential, if the decoder's server logs it, that log is now a set of working keys to someone's account.

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
    takeaways: [
      'Without anchors a pattern matches anywhere in the string, which is the most common reason a validation passes when it should not.',
      'Quantifiers are greedy by default, so add ? to make them lazy when a match swallows more than intended.',
      'Nested quantifiers over overlapping alternatives cause catastrophic backtracking and can hang a process on one input.',
      'No regex validates an email address. The only real check is sending a message to it.',
    ],
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

Adding \`?\` makes it **lazy**, take as little as possible:

\`\`\`
Pattern: <.+?>
Matches: <b>, </b>, <i>, </i>
\`\`\`

A more precise approach avoids the question entirely: \`<[^>]+>\`, "angle bracket, then characters that are not a closing bracket". Negated character classes are usually clearer and faster than lazy quantifiers.

## Groups

\`(...)\` captures, the matched text is available as \`$1\`, \`$2\` and so on, which is what makes find-and-replace powerful:

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

There is no \`b\`, so the match must fail, but the engine tries every way of dividing those \`a\`s between the inner and outer quantifier before concluding that. The number of combinations grows exponentially, and a 30-character input can hang a thread.

This is a real denial-of-service vector, known as ReDoS, and it has taken down production systems. The pattern to watch for is **nested quantifiers with overlapping alternatives**: \`(a+)+\`, \`(a|a)*\`, \`(\\s*\\w+)*\`.

Avoid it by making sure each part of the pattern can only match in one way, and by testing patterns against long non-matching inputs rather than only against the input you expect.

## Do not validate email addresses with regex

The RFC 5322 grammar for a valid email address permits quoted strings, comments, and IP-literal domains. A regex that fully implements it is several thousand characters long and still cannot tell you whether the address exists.

Use a sanity check, "has one \`@\`, has something before it, has a dot after it", and then **send a confirmation email**. That is the only test that answers the question you actually care about.

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

Lookahead \`(?=...)\` asserts something follows without consuming it, the standard tool for "must contain all of these" rules.

## Test before you ship

Regex is dense and easy to get subtly wrong in ways that only appear on real data. Build patterns against actual sample text, including the cases you expect to *fail*. A [regex tester](/tool/regex-tester) with live highlighting turns a guessing game into a two-minute job.

For common extraction tasks, [emails](/tool/extract-emails), [URLs](/tool/extract-urls), [phone numbers](/tool/extract-phones), a dedicated tool with a battle-tested pattern will do better than one you write in a hurry.`,
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
    takeaways: [
      'A v4 UUID is entirely random, so inserts land all over a B-tree index and the write path suffers as the table grows.',
      'A v7 UUID puts a timestamp in the leading bits, so new rows are appended and locality is restored.',
      'Neither is a secret. A v7 leaks its creation time by design, and a v4 is not an authorisation token.',
      'Store them as 16 binary bytes rather than as 36-character text if the table is large.',
    ],
    body: `A UUID is a 128-bit identifier you can generate anywhere without coordinating with anyone. The version number, encoded in the identifier itself, says how those bits were chosen.

## The versions that matter

**v1**, timestamp plus the machine's MAC address. Sortable, and it leaks both when and where it was created. The MAC address disclosure is why it fell out of favour; it was used to trace the author of the Melissa virus in 1999.

**v4**, 122 random bits (6 are fixed for version and variant). The default nearly everywhere for two decades. No information leakage, no coordination needed.

**v7**, a 48-bit Unix millisecond timestamp followed by random bits. Standardised in RFC 9562, which replaced the old RFC 4122 in 2024. Time-ordered while still unpredictable.

## Why v4 hurts as a primary key

Most relational databases store rows in a B-tree ordered by primary key. Insert sequential keys and every new row goes at the right-hand edge of the tree, the same few pages stay hot in memory and writes are cheap.

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
| Session token, reset token, API key | **Neither**, use a CSPRNG |
| Correlation / trace ID | v7 (sortable logs are useful) |
| Existing system already on v4 | Stay on v4 unless you have measured a problem |

## Do not use UUIDs as secrets

A v4 UUID has 122 bits of randomness, which is plenty of entropy, **if** it came from a cryptographically secure generator. Many older libraries used \`Math.random()\` or a similar non-cryptographic PRNG, whose internal state can be recovered from a handful of outputs, making subsequent values predictable.

For anything security-sensitive, generate bytes from a CSPRNG directly (\`crypto.getRandomValues\` in the browser, \`crypto.randomBytes\` in Node) rather than relying on a UUID library's implementation choices.

Also: a v7 UUID's timestamp portion is not random at all. Never use one as a secret.

## Collisions, briefly

For v4, the probability of a collision is negligible at any realistic scale. Generating a billion UUIDs a second for a century leaves the chance of a single collision far below the chance of a hardware fault silently corrupting the data instead.

Collisions are not the thing to worry about. Weak randomness sources are.

## Storage

A UUID is 128 bits, 16 bytes. Stored as a hyphenated string it is 36 bytes, more than twice the size, and every index entry pays for it.

Use a native \`uuid\` type where the database has one (PostgreSQL does), or \`BINARY(16)\` where it does not. On a large table with several UUID columns and indexes, the difference is measured in gigabytes.

## Generating them

Both versions are cheap to generate client-side; there is no reason to ask a server for an identifier. The [UUID generator](/tool/uuid-generator) here produces them in the browser using the platform's crypto API, and the [timestamp converter](/tool/timestamp-converter) is handy for reading the embedded time out of a v7 value when you are debugging.`,
  },

  {
    slug: 'colour-contrast-and-wcag',
    title: 'Colour contrast: what the WCAG numbers mean and how to hit them',
    description: 'The 4.5:1 ratio comes from a luminance formula. Understanding it explains why light grey on white fails and how to fix a palette that does.',
    excerpt: 'Low-contrast text is the most common accessibility failure on the web, and one of the easiest to fix, once you know which number you are aiming at and why.',
    category: 'dev',
    tags: ['accessibility', 'wcag', 'colour', 'css'],
    published: '2026-09-08',
    relatedTools: ['contrast-checker', 'color-converter', 'palette-color', 'gradient-generator', 'glassmorphism'],
    takeaways: [
      'The ratio compares relative luminance, not perceived brightness, so two colours can look distinct and still fail.',
      'The thresholds are 4.5:1 for body text and 3:1 for large text and interface components.',
      'Fix contrast by adjusting lightness rather than hue, so the palette keeps its character.',
      'An automated pass does not mean readable. Placeholder text, disabled states and text over images are where it breaks.',
    ],
    body: `Light grey text on a white background is the signature look of a certain kind of modern web design, and it is the single most common accessibility failure measured on real websites. It is also trivially fixable.

## What the ratio measures

WCAG defines a contrast ratio between two colours based on their **relative luminance**, a measure of perceived brightness that weights the colour channels according to how sensitive human vision is to each:

\`\`\`
L = 0.2126 R + 0.7152 G + 0.0722 B
\`\`\`

(with each channel first linearised from its sRGB value)

Green contributes over 70% of perceived brightness; blue contributes about 7%. This is why pure blue text on black is hard to read despite looking like a strong colour difference, there is almost no luminance difference.

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
| UI components, graphics, focus indicators | 3:1 |, |

AA is the level referenced by most accessibility legislation, including the European Accessibility Act and the standards used for public sector procurement in many countries. AAA is a goal, not usually a requirement.

Note the third row: it was added in WCAG 2.1 and is widely missed. Input borders, toggle states, icons that convey meaning and focus rings all need 3:1 against their surroundings. A form field with a barely-visible border technically fails even if its label is perfectly readable.

## What is exempt

- **Disabled controls.** No requirement, though a disabled control nobody can see is still poor design.
- **Purely decorative graphics** that convey no information.
- **Logos and brand names** as they appear.
- **Text that is part of a photograph.**

## Fixing a palette without redesigning it

**Adjust lightness, not hue.** Contrast is a luminance relationship. Take your brand colour and darken it for text use while keeping the same hue and saturation, the palette still reads as the same brand, and the text passes. Working in HSL or LCH makes this a one-value change.

**Body text at #767676 or darker on white.** That is roughly the lightest neutral grey that reaches 4.5:1 against pure white. Anything lighter fails for body copy. \`#999999\`, a very popular choice for "secondary" text, comes in at about 2.8:1 and fails clearly.

**Do not rely on colour alone.** A red border on an invalid field is invisible to a substantial number of users. Add an icon or text. This is a separate WCAG criterion from contrast and is failed just as often.

**Check both themes.** A palette tuned for a light theme frequently fails in dark mode, where the relationship inverts and mid-greys that worked against white are now too close to a dark background.

**Test text over images.** A caption over a photograph passes or fails depending on the pixels behind it. Use a scrim, a semi-transparent overlay, rather than hoping.

## Where automated checking stops

An automated checker reliably catches contrast failures. It cannot tell you whether your alt text is meaningful, whether the tab order makes sense, or whether a control is operable by keyboard. Contrast is the part of accessibility that is genuinely measurable, which is precisely why there is no excuse for failing it.

## Checking as you design

Pick colours and see the ratio immediately rather than auditing at the end, when changing a palette means changing a design system. The [contrast checker](/tool/contrast-checker) shows the ratio and the AA/AAA verdict for any pair, and the [colour converter](/tool/color-converter) moves between HEX, RGB and HSL so you can adjust lightness without disturbing the hue you actually chose. The [glassmorphism builder](/tool/glassmorphism) is worth a look for the same reason in reverse: frosted panels are where contrast quietly fails, because the text sits on whatever happens to be behind it.`,
  },

  {
    slug: 'qr-codes-what-is-encoded',
    title: 'QR codes: what is actually encoded, and how to make one that scans',
    description: 'A QR code is just text with error correction. Knowing that explains why some codes are dense, why some fail to scan, and why the logo in the middle works.',
    excerpt: 'There is no database behind a QR code. Everything it knows is printed in the squares, which is why a long URL makes a code nobody can scan.',
    category: 'dev',
    tags: ['qr', 'encoding', 'url'],
    published: '2026-09-10',
    relatedTools: ['qr-generator', 'url-parser', 'url-encoder', 'slug-generator'],
    takeaways: [
      'A QR code contains the text itself, not a lookup key. Shorter text means fewer modules and an easier scan.',
      'Error correction is why a logo in the middle still works, and at level H up to 30% of the code can be obscured.',
      'The quiet zone, four modules of blank margin, is part of the specification. Codes fail without it.',
      'Numeric and uppercase-only content packs far more densely, which is why upper-casing a URL path shortens the code.',
    ],
    body: `A QR code is not a link to a record somewhere. It is the text itself, encoded as black and white squares with enough redundancy to survive being scuffed. Nothing is looked up, nothing phones home, and the code works forever offline. That one fact explains most of what follows.

## Size is driven by content length

The grid is made of **modules**, the individual squares. QR codes come in 40 versions, from 21×21 modules up to 177×177. The more characters you encode, the higher the version, the more modules, and the smaller each module becomes at a fixed print size.

Small modules are harder for a camera to resolve. So a code encoding a 200-character URL printed on a business card is genuinely harder to scan than one encoding 30 characters at the same physical size. This is not a quality setting, it is geometry.

Encoding mode matters too, because the specification packs different character sets differently:

| Mode | Characters allowed | Bits per character |
|---|---|---|
| Numeric | 0-9 | about 3.3 |
| Alphanumeric | 0-9, A-Z, space, \`$%*+-./:\` | about 5.5 |
| Byte | Anything, including lowercase | 8 |

Alphanumeric mode has no lowercase. So \`HTTPS://EXAMPLE.COM/OFFER\` encodes in alphanumeric mode at 5.5 bits per character, while \`https://example.com/offer\` falls into byte mode at 8. The same URL, a meaningfully smaller code.

> [!TIP]
> Hostnames are case-insensitive, so upper-casing the scheme and domain is free. Paths usually are not, so only upper-case the path if the server treats it as case-insensitive. The reliable way to shorten a code is to shorten the URL: drop tracking parameters, use a [short slug](/tool/slug-generator), and check with a [URL parser](/tool/url-parser) that you have not left a session token on the end.

## Error correction and the logo in the middle

Every QR code carries Reed-Solomon error correction, at one of four levels.

| Level | Recoverable | Cost |
|---|---|---|
| L | about 7% | Smallest code |
| M | about 15% | The usual default |
| Q | about 25% | |
| H | about 30% | Largest code |

This is why a code still scans with a coffee ring on it, and it is why you can put a logo in the centre. The logo is damage, and the error correction repairs it.

The rule of thumb is to use level H if you are covering the middle, and keep the logo under about 20% of the code area even though H tolerates 30%. Leave headroom for real-world damage on top of the damage you added deliberately.

> [!WARNING]
> Higher error correction makes the code physically denser, because the redundancy has to go somewhere. Combining a long URL with level H produces a very dense code that is harder to scan even before the logo covers part of it. If you need a logo, shorten the URL first.

## The quiet zone is not optional

The specification requires a blank margin of four modules on all sides. Scanners use it to find where the code ends.

Placing a code flush against a coloured background, a border, or the edge of a card is one of the most common reasons a code fails to scan, and it looks like nothing is wrong. Leave the margin.

Two related points. Contrast must be dark-on-light, and inverting to light-on-dark breaks many scanners. And the dark modules should be genuinely dark: a mid-grey code on a cream background may pass a designer's eye and fail a phone camera in a dim restaurant.

## Beyond URLs

The content is just text, so the meaning comes from conventions the scanning app recognises.

\`\`\`
WIFI:T:WPA;S:NetworkName;P:password123;;
\`\`\`

That is the Wi-Fi format, and it is why a café can put a card on the table that joins you to the network. It also means the password is printed in plain text on the wall, readable by anyone who scans it, which is fine for a guest network and not for anything else.

The same pattern covers contact cards, calendar events, phone numbers and plain text. [QR generators](/tool/qr-generator) offer these as presets, but underneath they are all just strings.

## Practical sizing

The working guideline is that the code should be about one tenth of the scanning distance. Scanned from 30cm, a 3cm code is comfortable. On a poster read from 3 metres, you need 30cm.

And the rest of the checklist:

1. Shorten the URL before generating anything.
2. Choose error correction based on whether a logo is going on it.
3. Keep the four-module quiet zone.
4. Print it and scan it, from the actual distance, on a cheap phone, in poor light.

Step four catches almost everything. A code that scans on your screen at arm's length tells you very little about a code on matte card under a restaurant's lighting.

Generating a QR code is pure computation with no network involved, which is why the [generator here](/tool/qr-generator) runs in the tab. That matters for the Wi-Fi case in particular: there is no good reason for your network password to travel to someone else's server on its way to becoming a picture.`,
  },

  {
    slug: 'what-a-formatter-actually-does',
    title: 'Prettify or minify: what formatters actually do to your code',
    description: 'Formatting and minifying are the same parse-and-print operation with opposite goals. Knowing what each one is allowed to change explains the edge cases.',
    excerpt: 'A formatter throws your whitespace away and prints the syntax tree again. Everything surprising about formatters follows from that.',
    category: 'dev',
    tags: ['formatting', 'minify', 'tooling'],
    published: '2026-09-11',
    relatedTools: ['html-formatter', 'css-formatter', 'js-formatter', 'sql-formatter', 'xml-formatter'],
    takeaways: [
      'A formatter parses the code to a syntax tree and prints it fresh. Your original whitespace is discarded, not adjusted.',
      'That is why a formatter refuses to run on a syntax error: it cannot print a tree it could not build.',
      'Minifying HTML is riskier than minifying CSS or JS, because whitespace between inline elements is significant.',
      'Never minify SQL to send to a database. Formatting SQL is for reading it; the engine does not care.',
    ],
    body: `Prettifying and minifying feel like opposite tools. They are the same operation: parse the input into a syntax tree, discard the original formatting entirely, and print the tree back out. Only the printing rules differ, one optimising for a human reading it and the other for bytes on the wire.

Almost every surprising formatter behaviour follows from that sentence.

## Why a formatter refuses broken code

If the parser cannot build a tree, there is nothing to print. That is why a formatter reports an error and changes nothing rather than doing its best on the parts it understood.

This turns out to be useful. Running a [formatter](/tool/js-formatter) on a file is a fast syntax check, and the error location is usually within a line or two of the real problem. The same applies to [XML](/tool/xml-formatter), where a formatter that refuses to run has told you the document is not well-formed, which is often the actual question you had.

It also explains why formatted output sometimes differs from what you wrote in ways you did not ask for. You did not ask for your single quotes to become double quotes; the formatter is printing string literals according to its own rule, because your original quoting was not preserved anywhere.

## What each language lets a formatter change

**[CSS](/tool/css-formatter)** is the safest. Whitespace between tokens is never significant. Minifying can remove all of it, shorten \`#ffffff\` to \`#fff\`, collapse \`margin: 0px\` to \`margin: 0\`, and drop the final semicolon in a block. The only real hazard is that CSS is order-dependent, so a minifier that reorders declarations can change specificity outcomes. Most do not, for that reason.

**[JavaScript](/tool/js-formatter)** is mostly safe with one famous exception. Automatic semicolon insertion means line breaks can be syntactically significant, so a minifier joining lines has to insert semicolons correctly. Modern minifiers get this right. Beyond formatting, real minifiers also rename local variables to single letters and remove dead branches, which is where most of the size saving comes from.

**[HTML](/tool/html-formatter)** is where it gets genuinely risky.

> [!WARNING]
> Whitespace between inline elements is rendered. \`<span>a</span> <span>b</span>\` shows a space between the words and \`<span>a</span><span>b</span>\` does not. An HTML minifier that collapses all whitespace will change how the page looks. This is why HTML minifiers have a conservative mode, and why the saving is smaller than you might expect once compression is already in play.

Also worth knowing: the contents of \`<pre>\` and \`<textarea>\` are significant and must be left alone, which good formatters handle and quick regex-based ones do not.

**[SQL](/tool/sql-formatter)** is a special case, because the database does not care at all. Formatting SQL is purely for humans: consistent keyword casing, aligned clauses, indented joins, so a 40-line query can be read. There is no performance reason to minify it, and doing so makes the query log unreadable. Format it for the repository, and never think about minifying it.

**[XML](/tool/xml-formatter)** has the same whitespace hazard as HTML, formalised. Whether whitespace inside an element is significant depends on \`xml:space\` and on the schema. Pretty-printing an XML document that is about to be digitally signed will invalidate the signature, because the bytes changed.

## Minifying is largely obsolete for delivery

This is worth saying because a lot of advice has not caught up.

Every HTTP server worth using compresses responses with gzip or Brotli. Those algorithms are extremely good at repeated patterns, and indentation is the most repetitive content in a file. Minifying before compressing therefore saves far less than the uncompressed numbers suggest, often in the low single-digit percentages for CSS and HTML.

Where minification still earns its place is JavaScript, and not because of whitespace: it is the variable renaming, dead code elimination and tree shaking that a bundler does, which compression cannot replicate because those change the code rather than its representation.

So the honest position is that your build tool already does this, and manually minifying files is rarely the win it appears to be.

## Where these tools actually help

Formatters are most useful away from the build pipeline:

- **Reading someone else's minified output.** Prettifying a vendor bundle to work out what it does.
- **Inspecting an API response.** A wall of single-line JSON or XML becomes legible.
- **Checking syntax fast.** A formatter that refuses to run has found your unclosed brace.
- **Normalising before a diff.** Two files that differ only in indentation produce an enormous diff. Formatting both with the same rules first reduces it to the real changes, which pairs well with a [diff checker](/tool/diff-checker).

That last one is the underrated one, and it is worth reaching for before spending twenty minutes reading a diff that is mostly whitespace.

All five formatters here parse and print in the tab, with nothing sent anywhere. That is worth having for the everyday reason that the code and API responses people paste into online formatters routinely contain keys, tokens, customer records and internal endpoints, pasted without much thought because the tool looked like a text box.`,
  },

  {
    slug: 'three-kinds-of-escaping',
    title: 'URL encoding, HTML entities and MIME types: three things people mix up',
    description: 'Percent-encoding, entity encoding and content types solve different problems. Using the wrong one produces bugs that look identical.',
    excerpt: 'The same ampersand needs three different treatments depending on where it is going. Getting them confused is how &amp;amp;amp; ends up on a page.',
    category: 'dev',
    tags: ['encoding', 'url', 'html', 'mime'],
    published: '2026-09-13',
    relatedTools: ['url-encoder', 'html-entity', 'mime-checker', 'url-parser'],
    takeaways: [
      'Percent-encoding protects characters from a URL parser. Entity encoding protects them from an HTML parser. They are not interchangeable.',
      'encodeURI is for a whole URL, encodeURIComponent is for one piece of one. Using the wrong one is the classic query-string bug.',
      'Double encoding shows up as %2520 or &amp;amp;. Both mean something encoded an already-encoded string.',
      'A file extension is a naming convention; the MIME type from the magic bytes is what a program actually acts on.',
    ],
    body: `A user is called \`Ben & Co\`. Putting that name in a URL, on a page, and in a downloaded file all require doing something to the ampersand, and the three somethings are different. Mixing them up produces bugs that look the same from the outside and have unrelated causes.

## Percent-encoding is for URL parsers

A URL has a grammar. \`?\` starts the query, \`&\` separates parameters, \`#\` starts the fragment, \`/\` separates path segments. If your *data* contains one of those characters, the parser will read it as structure.

Percent-encoding replaces the character with \`%\` and its byte value in hex. A space becomes \`%20\`, an ampersand \`%26\`, a slash \`%2F\`. Non-ASCII characters are encoded as UTF-8 first, so \`é\` becomes \`%C3%A9\`, which is why it takes six characters.

The part that trips people is that JavaScript has two functions and they are not interchangeable:

\`\`\`js
encodeURI('https://x.com/a b?q=1&r=2')
// https://x.com/a%20b?q=1&r=2      structure preserved

encodeURIComponent('Ben & Co')
// Ben%20%26%20Co                   everything escaped
\`\`\`

\`encodeURI\` is for an entire URL and deliberately leaves \`? & / : #\` alone, because it assumes they are structure. \`encodeURIComponent\` is for **one value going into one slot** and escapes them, because it assumes they are data.

> [!WARNING]
> Using \`encodeURI\` on a query parameter value is the classic bug. A value containing \`&\` passes through unescaped, the server splits on it, and one parameter silently becomes two. Any user-supplied string going into a URL needs \`encodeURIComponent\`.

The \`+\` character deserves its own warning. In a query string, historically, \`+\` means a space. In a path it means a literal plus. So \`a+b\` in a query reads as \`a b\`, which is why a phone number like \`+44...\` must be encoded as \`%2B44\` or it arrives with a leading space.

When a URL is behaving strangely, a [URL parser](/tool/url-parser) that shows the decoded components separately is usually faster than staring at the string, and an [encoder](/tool/url-encoder) tells you what a value should look like.

## Entity encoding is for HTML parsers

An HTML parser has a different grammar with different dangerous characters: \`<\` starts a tag, \`&\` starts an entity, and inside an attribute the quote character ends the attribute.

Entity encoding replaces these with named or numeric references: \`&amp;\` \`&lt;\` \`&gt;\` \`&quot;\` \`&#39;\`.

This is the same problem as percent-encoding and a completely separate solution. Percent-encoding text before putting it on a page does not make it safe, and a browser will display \`%3Cscript%3E\` as literal text rather than treating it as escaped markup.

The two genuinely stack. A URL inside an HTML attribute needs both, applied in order:

\`\`\`html
<!-- value: Ben & Co -->
<a href="/search?q=Ben%20%26%20Co">Ben &amp; Co</a>
\`\`\`

Percent-encoding for the URL grammar, entity encoding for the HTML grammar, each doing its own job.

## Double encoding

If you have ever seen \`%2520\` or \`&amp;amp;\` in production, that is double encoding: something encoded a string that was already encoded.

\`%2520\` decodes once to \`%20\` and twice to a space. \`&amp;amp;\` renders as \`&amp;\` and then as \`&\`. The fix is never to decode twice at the end, it is to find the layer doing the extra encode. Usually a framework is already escaping output and application code is escaping it again on the way in.

An [HTML entity encoder](/tool/html-entity) is useful here precisely because it lets you decode a suspicious string step by step and see how many layers deep it goes.

## MIME types are about content, not names

The third confusion is different in kind. A MIME type such as \`image/png\` or \`application/pdf\` tells a program what a stream of bytes *is*.

The critical point is that the file extension is not the MIME type. An extension is a naming convention that anyone can change. The real type is determined by the **magic bytes** at the start of the file: a PNG begins with \`89 50 4E 47\`, a PDF with \`%PDF-\`, a ZIP with \`PK\`.

This has two practical consequences.

For debugging, a file that will not open is often a file that is not what its name claims. A [MIME checker](/tool/mime-checker) reading the magic bytes will tell you that the \`.xlsx\` your system produced is actually an HTML error page, which is a surprisingly common outcome of a failed export.

For security, never trust an uploaded file's extension or its client-supplied \`Content-Type\` header. Both are set by whoever is uploading. Check the magic bytes server-side.

> [!NOTE]
> Because \`.docx\` and \`.xlsx\` are zip archives, their magic bytes are \`PK\`, the same as any zip. Distinguishing them requires looking inside the archive, which is why a checker sometimes reports a Word file as a zip and is not wrong.

## The short version

| Going into | Use |
|---|---|
| A URL path or query value | Percent-encoding, \`encodeURIComponent\` for values |
| HTML text or an attribute | Entity encoding |
| A URL inside an HTML attribute | Both, in that order |
| Deciding what a file is | Magic bytes, not the extension |

Each of these is a pure string or byte operation with no server involved, which is why the [URL encoder](/tool/url-encoder), [entity encoder](/tool/html-entity) and [MIME checker](/tool/mime-checker) here all run locally. The strings people paste into online encoders are disproportionately tokens, signed URLs and API responses, which is a good reason for the tool not to be somebody else's server.`,
  },

  {
    slug: 'cleaning-a-block-of-text',
    title: 'Cleaning a block of text: the operations worth doing in order',
    description: 'Deduplicating, sorting, trimming and case conversion are trivial individually. The order you run them in decides whether the result is right.',
    excerpt: 'Removing duplicates before trimming whitespace leaves you with duplicates. Most text-cleaning frustration is an ordering problem, not a tool problem.',
    category: 'dev',
    tags: ['text', 'cleanup', 'case'],
    published: '2026-09-14',
    relatedTools: ['text-cleaner', 'remove-duplicates-text', 'sort-lines', 'remove-empty-lines', 'case-converter', 'word-counter', 'lorem-ipsum', 'reverse-text', 'extract-phones', 'extract-hashtags'],
    takeaways: [
      'Trim whitespace before deduplicating, or two identical lines with different trailing spaces both survive.',
      'Case conversion is not symmetric: going to a flat case loses word boundaries you cannot always recover.',
      'Sorting a CSV by lines will sort the header row into the middle of the data.',
      'Word counts differ between tools because "word" is not defined. Find out which definition your limit uses.',
    ],
    body: `You have 4,000 email addresses pasted out of six spreadsheets. They need deduplicating, and afterwards the count is suspiciously high. The problem is almost never the deduplicator. It is that \`ben@x.com\` and \`ben@x.com \` are genuinely different strings, and you removed duplicates before removing the trailing spaces.

Most text-cleaning frustration is this: the operations are trivial, and the order is not.

## The order that works

1. **Normalise whitespace.** Trim leading and trailing spaces on every line, collapse runs of spaces, normalise line endings.
2. **Remove empty lines.** After trimming, because a line containing three spaces is not empty until you trim it.
3. **Normalise case**, but only if case genuinely does not matter for your data.
4. **Deduplicate.** Now identical things are actually identical strings.
5. **Sort.** Last, because everything above changes what sorts where.
6. **Count**, to check the result is plausible.

Running [whitespace cleanup](/tool/text-cleaner) first is what makes steps 2 and 4 behave. Running [empty line removal](/tool/remove-empty-lines) before trimming misses every line made of spaces or tabs.

Step 3 is the one that needs judgement. Email addresses are case-insensitive in the domain and, in practice, in the local part too, so lower-casing before [deduplicating](/tool/remove-duplicates-text) is correct and catches \`Ben@X.com\`. Usernames, passwords, product codes and file paths are frequently case-sensitive, and flattening them merges records that were not duplicates.

## Sorting has one common trap

[Sorting lines](/tool/sort-lines) is straightforward except when the text is tabular.

> [!WARNING]
> Sorting a CSV by lines sorts the header row along with the data, usually into the middle. Remove the header, sort, put it back. The same applies to any block with a title line or a trailing total.

The other surprise is that alphabetical sorting is not numeric sorting. Sorted as text, \`10\` comes before \`9\`, because \`1\` precedes \`9\`. If the lines start with numbers of varying length, you need a numeric sort or zero-padded values.

And sorting is not stable across locales. Accented characters, uppercase letters and digits order differently depending on the collation rules being applied, which is why the same list sorted in two tools can differ.

## Case conversion loses information in one direction

Converting between \`camelCase\`, \`snake_case\`, \`kebab-case\` and \`PascalCase\` is mechanical in both directions, because each one marks word boundaries explicitly: a capital letter, an underscore, a hyphen.

Converting *to* a flat lowercase string discards those boundaries permanently. \`parseHTTPResponse\` becomes \`parsehttpresponse\`, and nothing can reliably split it again.

Acronyms are where converters disagree even in the good direction. \`parseHTTPResponse\` could reasonably become \`parse_http_response\` or \`parse_h_t_t_p_response\`, and different tools choose differently. If you are converting a list of identifiers, check the ones with acronyms in them rather than assuming the whole list is fine.

A [case converter](/tool/case-converter) handles the mechanical part; the acronyms are the part to eyeball.

## Counting is less defined than it looks

Paste the same paragraph into three tools and you may get three word counts. None of them is wrong, because "word" is not a defined term.

The disagreements are over hyphenated compounds (one word or two), numbers and standalone symbols, URLs and email addresses, and contractions. Different tools split on different boundaries.

This matters when a limit is involved. A 500-word essay limit, a 160-character SMS, a 2,200-character Instagram caption or a 60-character page title are all enforced by a specific implementation, and the only count that matters is that one.

> [!NOTE]
> Character counts have their own subtlety. An emoji is often two UTF-16 code units, and a flag or a family emoji can be several. A [word counter](/tool/word-counter) that reports characters may report 4 for something the user sees as one symbol, and a platform limit may count either way.

## Placeholder text is not filler

[Lorem ipsum](/tool/lorem-ipsum) survives for a reason that is easy to dismiss. Latin-looking text has roughly the word-length distribution of English without being readable, so reviewers evaluate the layout instead of the copy. Type real English into a mockup and every review meeting becomes about the wording.

Two things to be careful about. Lorem ipsum has no long words, no numbers and no unusual characters, so a layout that fits it may break on a real German compound noun or a long product name. And it must never reach production, which it does more often than anyone admits, usually in an error state or an empty-list message nobody tested.

## Doing it on real data

The reason this matters more than it sounds: the text people clean is mailing lists, exported user records, support transcripts and log extracts. A mailing list pasted into a random online deduplicator has been disclosed to whoever runs it, whatever the page says.

Every operation here is string manipulation on data already in the page. [Whitespace cleanup](/tool/text-cleaner), [deduplication](/tool/remove-duplicates-text), [sorting](/tool/sort-lines) and [counting](/tool/word-counter) all run in the tab, so the list of 4,000 addresses stays where it started.`,
  },

  {
    slug: 'yaml-json-and-tabular-interchange',
    title: 'YAML, JSON and TSV: picking a format for config and interchange',
    description: 'JSON has no comments, YAML has the Norway problem, and TSV avoids the quoting mess CSV is famous for. Each trade matters somewhere.',
    excerpt: 'YAML turns the country code NO into the boolean false. That is not a bug report, it is in the specification, and it is why config formats need choosing carefully.',
    category: 'dev',
    tags: ['yaml', 'json', 'tsv', 'config'],
    published: '2026-09-12',
    relatedTools: ['yaml-formatter', 'json-to-csv', 'tsv-converter', 'json-formatter'],
    takeaways: [
      'YAML 1.1 reads unquoted no, off and n as false, which silently corrupts country codes and short answers.',
      'JSON has no comments and no trailing commas, which is exactly why it is a poor configuration format and a good wire format.',
      'Indentation in YAML must be spaces. A tab is a parse error, and it is invisible.',
      'TSV avoids CSVs quoting problems because tabs almost never appear inside data, but it cannot represent a value containing a tab.',
    ],
    body: `Three formats, all used for "structured data in a text file", all with a failure mode that only shows up once real data hits them.

## JSON is a wire format wearing a config format's clothes

JSON is excellent at what it was designed for: unambiguous machine-to-machine interchange. Every parser agrees on what it means, it maps cleanly onto the types most languages have, and there is nothing to argue about.

It is a poor configuration format for exactly the reasons that make it a good wire format. No comments, so you cannot explain why a value is what it is. No trailing commas, so adding a line means editing the line above. No multi-line strings, so a long value becomes an unreadable single line with \\n escapes in it.

Those are not oversights. Douglas Crockford removed comments deliberately, because people were using them to carry parsing directives. The result is a format that is exactly specified and unpleasant to maintain by hand.

Where it is unbeatable: API payloads, anything generated and consumed by code, and anything that has to be parsed identically everywhere.

## YAML is readable and has sharp edges

YAML fixes the human-editing problems: comments, multi-line strings, no brackets, references to avoid repetition. It is a superset of JSON, so any JSON document is valid YAML.

The cost is that it guesses types, and its guesses are occasionally alarming.

The famous one is the Norway problem. In YAML 1.1, these unquoted values are booleans: \`yes\`, \`no\`, \`on\`, \`off\`, \`y\`, \`n\`, \`true\`, \`false\`. So a list of country codes containing \`NO\` yields \`false\` where Norway should be. A spreadsheet column of yes/no answers becomes booleans, which is usually what you wanted and occasionally destroys the value \`N\` meaning something else entirely.

Version numbers suffer too. Unquoted \`1.20\` parses as the number 1.2, and \`1.2.3\` stays a string because it is not a valid number, so two adjacent lines get different types.

And sexagesimal notation: in YAML 1.1, \`22:30\` can parse as 1350, because colons were interpreted as base-60 digits. YAML 1.2 removed this, but which version your parser implements is not always obvious.

> [!TIP]
> The defence is simple and worth applying unconditionally: quote anything that is not obviously a number you want as a number. Country codes, version strings, times, IDs and single letters all belong in quotes.

Two more YAML gotchas. **Indentation must be spaces**, never tabs, and a tab is an invisible parse error. And YAML is whitespace-significant to a degree that makes a misplaced two-space indent change the structure rather than fail, which is worse.

A [YAML formatter](/tool/yaml-formatter) that round-trips to JSON is the fastest way to check what your file actually means, because the JSON output shows you the types the parser inferred. If \`NO\` comes back as \`false\`, you have found it.

## TSV is CSV with the hard part removed

CSV's real problem is quoting. A comma inside a value means the field must be quoted, a quote inside a quoted field must be doubled, and every producer implements this slightly differently. Add locales where the list separator is a semicolon and the format stops being one format.

TSV separates on tabs, and tabs essentially never appear inside ordinary data. Names, addresses and descriptions contain commas constantly and tabs almost never. So the quoting problem largely evaporates, parsing is a split on \\t, and files are unambiguous.

The trade-off is the mirror image: **TSV has no standard way to represent a value that contains a tab.** There is no escaping mechanism in common use. If your data genuinely contains tabs or newlines inside fields, TSV cannot carry it and CSV with proper quoting can.

Tabs are also invisible, so a TSV file that has been through an editor that converts tabs to spaces is silently destroyed. Never open one in something that reformats whitespace.

A [TSV converter](/tool/tsv-converter) is most useful in the moment where something produced tab-separated output and the next tool wants commas, which happens constantly when moving between database clients, spreadsheets and scripts.

## Flattening JSON into rows

The other common conversion is going from nested JSON to something tabular, which is what a spreadsheet or a BI tool wants.

The difficulty is that JSON is a tree and a table is a rectangle, so nesting has to be flattened. The usual convention is dotted paths: \`{"user": {"name": "Asha"}}\` becomes a column called \`user.name\`.

Arrays are where it gets genuinely ambiguous, and there is no right answer, only choices:

- **Join into one cell.** \`"tags": ["a","b"]\` becomes \`a;b\`. Compact, loses structure.
- **One column per index.** \`tags.0\`, \`tags.1\`. Breaks when rows have different lengths.
- **One row per element.** Duplicates every other field. Correct for analysis, larger.

A [JSON to CSV](/tool/json-to-csv) conversion has to pick one, so check which it used before trusting the output. Also watch for rows with different keys: the header must be the union of all keys, and a converter that reads only the first object will silently drop columns that appear later.

## Choosing

| Use | Format |
|---|---|
| API request and response bodies | JSON |
| Config a human edits | YAML, with things quoted |
| Config generated by a tool | JSON |
| Data going into a spreadsheet | CSV, or TSV if values contain commas |
| Pasting between database clients | TSV |

All of these conversions are parsing and printing, which is why the [YAML](/tool/yaml-formatter), [JSON](/tool/json-formatter) and [TSV](/tool/tsv-converter) tools here run in the tab. The files people paste into online converters are disproportionately deployment configs and database exports, which is to say credentials and customer records.`,
  },

  {
    slug: 'gradients-and-palettes',
    title: 'Gradients and palettes: why yours goes grey in the middle',
    description: 'Interpolating between two colours in sRGB passes through a dead zone. Understanding why explains most disappointing gradients and palettes.',
    excerpt: 'Blend blue into yellow and you get a muddy grey halfway. That is not your eye, it is the colour space doing arithmetic that does not match perception.',
    category: 'dev',
    tags: ['colour', 'gradients', 'css'],
    published: '2026-09-13',
    relatedTools: ['gradient-generator', 'palette-color', 'color-converter', 'contrast-checker'],
    takeaways: [
      'Interpolating in sRGB passes through desaturated grey. Interpolating in OKLCH stays vivid.',
      'A gradient between complementary hues will always cross a dull midpoint unless you add a stop or change colour space.',
      'Harmony rules generate candidate hues; they do not produce a usable palette until lightness is adjusted per hue.',
      'Yellow at the same lightness value as blue looks much brighter, so never derive a palette by rotating hue alone.',
    ],
    body: `You build a gradient from a strong blue to a warm yellow. The ends look right and the middle is a dull grey-green that belongs to neither. Adding more stops does not fix it, and picking different blues does not either.

The cause is that the browser is doing arithmetic in the wrong space.

## Why the middle goes grey

A CSS gradient interpolates between two colours. By default it does this in sRGB, averaging the red, green and blue channels independently.

Blue is roughly \`rgb(0, 80, 220)\` and yellow is roughly \`rgb(250, 210, 0)\`. Average them channel by channel and you get \`rgb(125, 145, 110)\`, which is a muted olive. Arithmetically correct, perceptually a dead spot.

The problem is that sRGB is a description of what a monitor does, not of how vision works. Equal steps in sRGB are not equal steps in perceived colour, and the straight line between two saturated colours passes near the desaturated centre of the space.

Perceptual colour spaces are built to fix this. OKLCH describes a colour as lightness, chroma (saturation) and hue. Interpolating in it moves the hue around the colour wheel while holding chroma, so the midpoint stays saturated:

\`\`\`css
background: linear-gradient(in oklch, #0050dc, #fad200);
\`\`\`

That one \`in oklch\` is usually the entire fix. Modern browsers support it, and the fallback in older ones is the sRGB behaviour you already have, so it degrades harmlessly.

> [!TIP]
> If you cannot use a colour space keyword, add a midpoint stop by hand. Pick a colour that looks right between the two rather than one you calculated, and the gradient will pass through it instead of through grey.

A [gradient generator](/tool/gradient-generator) is worth using precisely because this is a case where looking at the result beats reasoning about it. Two gradients with identical endpoints can look completely different depending on the interpolation, and no amount of thinking about hex values tells you that.

## Banding, and the other reason gradients look cheap

The second common complaint is visible stripes across a large gradient.

A gradient across 1000 pixels from one colour to another that differs by 40 steps in a channel has to hold each step for 25 pixels. The eye is very good at spotting those edges, especially in dark areas and in smooth blue-to-black fades.

Three things help. Keep the endpoints closer in lightness, so there are fewer steps to spread. Add a very slight noise texture over the top, which is what design software does when it dithers. Or use a subtle multi-stop gradient rather than a two-stop one, which spreads the transition unevenly and hides the boundaries.

## Harmony rules are a starting point, not a palette

Palette generators offer complementary, analogous, triadic and so on. These are hue relationships: complementary is 180 degrees around the wheel, triadic is three colours 120 degrees apart, analogous is a few neighbouring hues.

They are genuinely useful for generating candidates. They do not produce a usable palette on their own, because **hue is only one of three dimensions and the other two matter more.**

The trap is deriving a palette by rotating hue and keeping lightness and saturation fixed. Do that and you get a set of colours that are mathematically related and visually unbalanced, because perceived brightness varies enormously by hue. Yellow at 60% lightness looks far brighter than blue at 60% lightness. Pure yellow text is unreadable on white while pure blue is fine, at the same nominal lightness.

So the working process is:

1. Generate candidates with a [palette generator](/tool/palette-color) to get the hue relationships.
2. Adjust each colour's lightness individually until they look balanced, not until the numbers match.
3. Check every foreground and background pair you intend to use with a [contrast checker](/tool/contrast-checker).
4. Convert to whatever format your codebase uses with a [colour converter](/tool/color-converter).

Step two is the one that separates a palette that works from a set of related hex codes.

## Build the scale, not the colours

One practical structure that survives contact with a real interface: for each hue you keep, generate a scale of about nine steps from very light to very dark, and use positions rather than individual colours in your CSS.

That way \`--blue-100\` is always a background tint and \`--blue-700\` is always readable text, across every hue in the system. Swapping the brand colour becomes changing one hue value rather than auditing every usage.

Working in OKLCH makes this far easier, because holding lightness constant across hues actually produces colours that look equally light, which is the thing sRGB cannot give you.

Everything here is arithmetic on colour values with no server involved, so the [gradient builder](/tool/gradient-generator), [palette generator](/tool/palette-color) and [converter](/tool/color-converter) all run in the tab. For unreleased brand work that is a reasonable default.`,
  },

  {
    slug: 'find-replace-and-extraction',
    title: 'Find, replace and extract: getting structure out of unstructured text',
    description: 'Bulk editing and pattern extraction solve the same problem from opposite ends, and both have the same failure mode.',
    excerpt: 'Replace all instances of "cat" and you have just changed "category", "concatenate" and "location". Word boundaries exist for a reason.',
    category: 'dev',
    tags: ['regex', 'text', 'extraction'],
    published: '2026-09-14',
    relatedTools: ['find-replace', 'regex-tester', 'extract-hashtags', 'extract-emails', 'extract-urls', 'reverse-text'],
    takeaways: [
      'Plain find and replace matches inside words. Use word boundaries unless you want to change "category" while replacing "cat".',
      'Replace-all is unrecoverable once you close the tab. Check the match count before committing.',
      'No regex fully validates an email address. Extraction is for finding candidates, not for deciding they are real.',
      'Test the pattern on the awkward cases first, not the obvious ones.',
    ],
    body: `You have 2,000 lines of exported text and you need every email address out of it. Or you need to change one field name throughout. These are the same operation, pattern matching over text, approached from opposite ends, and they share one way of going wrong.

## The substring trap

The default behaviour of find and replace is substring matching. Replacing \`cat\` with \`dog\` turns \`category\` into \`dogegory\`, \`concatenate\` into \`condogenate\` and \`location\` into \`lodogion\`.

This is the single most common way a bulk edit goes wrong, and it is silent. The replacement succeeds, the count looks plausible, and the damage is scattered through the file.

The fix is word boundaries. In regex, \\b matches the position between a word character and a non-word character:

\`\`\`
\\bcat\\b    matches: cat, "cat", (cat)
           does not match: category, concatenate
\`\`\`

Most [find and replace](/tool/find-replace) tools offer a "whole word" checkbox that does exactly this. Use it by default and turn it off deliberately, rather than the other way round.

> [!WARNING]
> Replace-all is not undoable once the page is closed. Before committing a bulk change, search first and look at the match count. If you expect 12 replacements and the tool reports 340, stop. That gap is the warning you get.

## Capture groups are the useful part

Plain replacement swaps one fixed string for another. Capture groups let you rearrange what you matched, which is where the real time saving is.

\`\`\`
Find:    (\\w+)@(\\w+)\\.com
Replace: $2 contact: $1
\`\`\`

Parentheses capture, and \`$1\`, \`$2\` refer back to them. This turns reformatting tasks that look like manual work into one operation: swapping date components, reordering columns, converting one log format to another.

A [regex tester](/tool/regex-tester) with live highlighting is worth using before running anything destructive, because you can see what matches while you build the pattern rather than discovering it afterwards.

## Extraction is find without replace

Pulling every email, URL or hashtag out of a block of text is the same matching operation, collecting results instead of substituting them. The patterns are well understood and each has a known limitation worth knowing.

**[Emails](/tool/extract-emails).** No regex validates an email address correctly. The actual specification permits quoted strings, comments and characters almost nobody uses, and a pattern that accepts all of it also accepts nonsense. Practical extraction uses a deliberately loose pattern and accepts that some results will not be deliverable. The only real validation is sending mail to it.

**[URLs](/tool/extract-urls).** The hard part is the end, not the start. A URL at the end of a sentence collides with the full stop, and trailing brackets are ambiguous because parentheses are legal inside URLs. Extractors apply heuristics, so check the last character of anything you extract from prose.

**[Hashtags and mentions](/tool/extract-hashtags).** Straightforward in structure and awkward in Unicode. Hashtags can contain accented characters, non-Latin scripts and emoji, so a pattern restricted to \`[A-Za-z0-9_]\` will truncate a tag at the first accented letter rather than failing visibly.

**[Phone numbers](/tool/extract-phones).** The loosest of all, because formatting varies by country, and a long digit sequence might be an order number, an account reference or a date.

The honest framing for all of these: extraction finds **candidates**. Verification is a separate step and usually not a text-processing problem.

## Greedy matching, the other classic

Quantifiers are greedy by default, meaning they match as much as possible and then backtrack.

\`\`\`
<.+>     on  <b>bold</b>   matches the whole string
<.+?>    on  <b>bold</b>   matches <b>
\`\`\`

The \`?\` makes it lazy. This one character accounts for a large share of patterns that "work on my test string" and then swallow entire lines of real data. When a pattern matches far more than expected, greediness is the first thing to check.

And the standing advice: do not parse HTML with regex. Extracting all URLs from a page's text is fine. Trying to match nested tags is not, because HTML is not a regular language and the pattern will be wrong on input you have not seen.

## One small tool that is not what it looks like

[Reversing text](/tool/reverse-text) appears to be a novelty, and it has two real uses. Reversing word order is occasionally the fastest way to re-sort a list built in the wrong direction. And reversing characters is a quick way to see how a string behaves with bidirectional text, which matters if your interface handles Arabic or Hebrew and you want to check nothing breaks.

It is also a decent demonstration of the grapheme problem: reversing a string by code unit splits emoji and combining characters apart, which is why a naive reverse of text containing a flag produces two unrelated letters.

## Before any bulk edit

1. Search first, and read the match count.
2. Test the pattern on the awkward cases, not the obvious ones.
3. Turn on whole-word matching unless you have a reason not to.
4. Keep the original.

All of this is string processing on text already in the page, which is why [find and replace](/tool/find-replace), the [regex tester](/tool/regex-tester) and every extractor here run locally. The text people paste into online tools to pull addresses out of is, almost by definition, a list of other people's contact details.`,
  },

  {
    slug: 'alt-text-and-accessible-documents',
    title: 'Alt text, headings and the accessibility work that also helps search',
    description: 'The things that make a page or a document usable with a screen reader are largely the same things that make it legible to a crawler.',
    excerpt: 'Alt text is not a caption and not a keyword bin. Getting it right takes one question: what would a sighted reader lose if the image vanished?',
    category: 'dev',
    tags: ['accessibility', 'alt-text', 'headings'],
    published: '2026-09-11',
    relatedTools: ['pdf-ocr', 'docx-to-html', 'contrast-checker', 'html-formatter'],
    takeaways: [
      'Alt text answers what a reader would lose if the image failed to load, not what the image contains.',
      'A purely decorative image needs alt="" so screen readers skip it. Omitting the attribute reads the filename instead.',
      'Heading levels are an outline, not sizes. Skipping from h2 to h4 breaks navigation for screen reader users.',
      'A scanned PDF is unreadable to a screen reader and to a crawler for exactly the same reason: it has no text.',
    ],
    body: `A screen reader encounters an image with no \`alt\` attribute. Having nothing else to work with, it reads the filename: "I M G underscore two zero two six zero nine one one underscore final two dot j p g".

That is the actual experience of a missing attribute, and it is worse than useless. The fix is small, and it happens to be the same work that makes a page legible to a crawler.

## Alt text is not a description

The common instruction, "describe the image", produces bad alt text, because it invites an inventory of what is in the picture.

The better question is: **if this image failed to load, what would a sighted reader lose?** The answer depends entirely on the image's job.

| The image is | Alt text should be |
|---|---|
| A photo illustrating an article | The information it carries, briefly |
| A chart | The conclusion, not the axis labels |
| A logo linking home | The destination, e.g. "NextTool home" |
| A button or icon | The action, e.g. "Close dialog" |
| Purely decorative | Empty: \`alt=""\` |

That last row is the one people get wrong in the other direction. A decorative flourish with descriptive alt text forces a screen reader user to listen to something that adds nothing. \`alt=""\` tells the reader to skip it entirely, which is different from omitting the attribute, which makes it fall back to the filename.

A chart is worth dwelling on. Alt text reading "bar chart showing quarterly revenue" tells the reader there is a chart and nothing else. "Revenue grew 40% in Q3, the largest quarterly rise of the year" gives them what the chart was for. If the underlying numbers matter, put them in a table near the image rather than trying to fit them into an attribute.

Two things to leave out: the phrase "image of" or "photo of", because the reader already announced it is an image, and keyword stuffing, which was pointless for ranking long before it became an accessibility problem.

## Headings are an outline, not a type scale

\`<h1>\` through \`<h6>\` describe document structure. They are not sizes, and using an \`<h4>\` because the text should be small is the most common structural mistake there is. Screen reader users navigate by jumping between headings, so the levels are a table of contents they are stepping through.

The rules are short:

- **One \`<h1>\` per page**, the page's actual title.
- **Do not skip levels.** \`h2\` to \`h4\` leaves a hole in the outline.
- **Style with CSS**, so a heading's level reflects its place in the structure and its size reflects the design.

Running a page through an [HTML formatter](/tool/html-formatter) makes the nesting visible, which is often enough to spot a section that has drifted a level.

## Links and buttons

"Click here" and "read more" are meaningless out of context, and out of context is exactly how they are encountered, because screen readers can list all links on a page as a set. Twelve entries saying "read more" is a dead end.

Make the link text say where it goes. This is the same reason descriptive anchor text helps search: the text of a link is the clearest signal available about what is on the other end of it.

## Contrast

The WCAG minimum for body text is a 4.5:1 ratio against its background, and 3:1 for large text. This is not only a disability issue: it is what makes a screen readable in sunlight, on a cheap laptop panel, or by anyone over about forty.

A [contrast checker](/tool/contrast-checker) gives the ratio and the AA/AAA verdict for any pair. Check the states people forget, which are placeholder text, disabled controls, text over images, and anything on a tinted or frosted panel where the background is not a fixed colour.

## Documents, not just web pages

The same ideas apply to files, and the failures are starker.

> [!WARNING]
> A scanned PDF is an image of a page. It contains no text, so a screen reader can read nothing at all from it, and a search engine can index nothing. This is one condition with two consequences, and it is why so many published reports are effectively invisible.

[Running OCR](/tool/pdf-ocr) generates a text layer under the image, which makes the document readable, searchable and quotable. It is the single highest-value accessibility fix available for an archive of scanned material.

For Word documents, use the real heading styles rather than bold text at a larger size, because those styles are what exports into a tagged PDF and what [converting to HTML](/tool/docx-to-html) turns into actual \`<h2>\` elements. A document formatted by hand looks identical and converts into a flat wall of paragraphs.

> [!TIP]
> There is a fast sanity check for any of this. Disable images in the browser and read the page. Then navigate it with the Tab key alone. Whatever is confusing or unreachable in those two passes is what needs fixing, and you will find more in five minutes than most checklists surface.`,
  },

  {
    slug: 'http-status-codes-that-matter',
    title: 'HTTP status codes: the handful that decide what search engines do',
    description: 'A 301 and a 302 look the same to a visitor and mean opposite things to a crawler. So do a 404 and a soft 404.',
    excerpt: 'Moving a page with the wrong redirect code throws away everything that page had earned. The difference is one digit.',
    category: 'dev',
    tags: ['http', 'status-codes', 'redirects', 'seo'],
    published: '2026-09-12',
    relatedTools: ['url-parser', 'mime-checker', 'user-agent-parser', 'url-encoder'],
    takeaways: [
      'A 301 is permanent and passes ranking to the new URL. A 302 is temporary and keeps the old one indexed.',
      'A soft 404 is a missing page that returns 200 with a friendly message, and it keeps dead URLs in the index.',
      'Chained redirects lose value at each hop, so point old URLs directly at the final destination.',
      'A 410 tells a crawler the page is deliberately gone, which removes it faster than a 404.',
    ],
    body: `You restructure a site, set up redirects, and traffic drops. The pages all load, the redirects all work, and a visitor would notice nothing. A crawler noticed a digit.

## The redirects

**301 Moved Permanently.** This URL is gone and this other one replaces it, forever. Search engines transfer the accumulated ranking signals to the target and eventually drop the old URL from the index. This is what you want for a restructure, a domain change, or consolidating duplicate pages.

**302 Found** and **307 Temporary Redirect.** This URL is fine, go here for now. The original stays indexed and keeps its signals, because you have said it is coming back.

Using a 302 for a permanent move is the mistake, and it is easy to make because many frameworks and hosting panels default to it. The redirect works, the visitor arrives, and the ranking never transfers.

**308** is to 307 what 301 is to 302: permanent, and it additionally guarantees the request method is preserved, which matters for POST.

> [!WARNING]
> Redirect chains dilute. A to B to C loses a little at each hop and costs an extra round trip for every visitor. When you add a new redirect, update the old ones to point straight at the final URL rather than at the intermediate.

## The missing pages

**404 Not Found.** There is nothing here. A crawler will retry occasionally before dropping it.

**410 Gone.** There is nothing here and that is deliberate. Crawlers treat this as more final and drop the URL faster. Worth using when you have genuinely retired content rather than lost it.

**The soft 404** is the one that causes real trouble. A page that does not exist returns a friendly "sorry, we could not find that" message with a **200 OK** status. To a visitor it reads as a missing page. To a crawler it is a page that exists and contains that text, so it stays indexed, and a site can accumulate thousands of near-identical thin pages that way.

If it is missing, the status must say so. The visible message is separate from the code.

## The ones that mean something is wrong

**403 Forbidden.** The server understood and refuses. If a crawler sees this on pages that should be public, check whether a firewall or bot rule is blocking it by user agent, which is worth confirming with a [user agent parser](/tool/user-agent-parser) against your access logs.

**500 Internal Server Error.** Something broke. Persistent 500s on indexed URLs will eventually cost you those URLs.

**503 Service Unavailable.** Temporarily down, and the correct code for planned maintenance. Paired with a \`Retry-After\` header it tells crawlers to come back rather than to conclude the page is broken.

**429 Too Many Requests.** Rate limited. Returning this to a crawler slows crawling, which is sometimes intentional and often not.

## The quieter ones

**304 Not Modified** is a success. The client asked whether its cached copy is still current, the server said yes, and no body was sent. A lot of 304s in your logs means caching is working.

**204 No Content** succeeded with nothing to return, which is the right answer to a delete.

**206 Partial Content** is a range request, which is what makes resumable downloads and video seeking work.

## The content type matters too

A correct status with the wrong \`Content-Type\` still fails. A JSON endpoint serving \`text/html\` will be parsed as a page; a PDF served as \`application/octet-stream\` downloads instead of opening.

And the header can be wrong about the file itself. As covered in [three kinds of escaping](/blog/three-kinds-of-escaping), the real type is determined by the magic bytes rather than by the header or the extension, so a [MIME checker](/tool/mime-checker) is what settles an argument about what a server actually sent.

## Checking a URL before you debug it

Before assuming a status code is wrong, confirm you are requesting what you think you are. Trailing slashes, query parameters, protocol and subdomain all produce different URLs that redirect differently, and a [URL parser](/tool/url-parser) showing the components separately resolves that faster than reading the string.

Two habits that prevent most of this:

1. **When moving a page, use 301 and point it at the final destination**, not at another redirect.
2. **When retiring a page, return 404 or 410**, and make sure the friendly message is not returning 200.

Both are one-line changes that are invisible if you get them wrong and expensive for months afterwards.`,
  },

  {
    slug: 'cron-expressions-explained',
    title: 'Cron expressions: reading the five fields without guessing',
    description: 'Five numbers decide when a job runs. Day-of-month and day-of-week interact in a way that surprises almost everyone.',
    excerpt: 'A schedule that should fire monthly fires every Monday as well. The two day fields are combined with OR, not AND.',
    category: 'dev',
    tags: ['cron', 'scheduling', 'timezones', 'automation'],
    published: '2026-09-12',
    relatedTools: ['timestamp-converter', 'timezone-converter', 'regex-tester', 'unit-converter'],
    takeaways: [
      'The five fields are minute, hour, day of month, month, day of week, in that order.',
      'If both day fields are restricted, most implementations run when either matches, not when both do.',
      'Cron runs in the server time zone, so daylight saving can skip a run or fire it twice.',
      'Step values like */15 divide the range, but */7 on days does not mean weekly.',
    ],
    body: `You set a job to run on the first of the month. It also runs every Monday. The expression is correct by the specification and does not mean what you intended.

## The five fields

\`\`\`
 minute  hour  day-of-month  month  day-of-week
   0-59  0-23      1-31       1-12      0-6
\`\`\`

\`\`\`
30 2 * * *      02:30 every day
0 9 * * 1-5     09:00 Monday to Friday
*/15 * * * *    every 15 minutes
0 0 1 * *       midnight on the 1st
0 4 * * 0       04:00 on Sunday
\`\`\`

The operators are few: \`*\` for every value, \`,\` for a list, \`-\` for a range, and \`/\` for a step. Day-of-week counts Sunday as 0, and many implementations also accept 7 for Sunday, which is a common source of confusion when copying an expression between systems.

## The two day fields

This is the trap, and it is in the original specification rather than being a bug.

**If both day-of-month and day-of-week are restricted, the job runs when EITHER matches.** Not both.

\`\`\`
0 0 1 * 1     midnight on the 1st, AND every Monday
\`\`\`

That is almost never what somebody means when they write it. If one of the two fields is \`*\`, the other behaves normally and the surprise does not arise, which is why most expressions work fine and this one case catches people.

There is no way to express "the first Monday of the month" in standard cron. You schedule it for every Monday and check the date inside the job.

## Step values are not intervals

\`*/15\` in the minute field means "every value in 0-59 divisible by 15", so 0, 15, 30, 45. That happens to be every fifteen minutes, which is why the mental model of "interval" usually works.

It stops working where the range does not divide evenly.

> [!WARNING]
> \`*/7\` in the day-of-month field gives days 1, 8, 15, 22, 29, and then the count restarts on the 1st of the next month. The gap between the 29th and the 1st is two or three days, not seven. Cron has no concept of an interval that crosses a field boundary.

The same applies to \`*/45\` in minutes, which fires at 0 and 45 and then at 0 again fifteen minutes later.

## Time zones and the twice-yearly failure

Cron evaluates against the server clock. If that clock observes daylight saving, two things happen every year.

**In spring**, the hour between 02:00 and 03:00 does not exist. A job scheduled at 02:30 does not run at all that day, on most implementations.

**In autumn**, that hour happens twice. A job scheduled at 02:30 may run twice.

This is the same mechanism described in [Unix timestamps and the off-by-one-hour bug](/blog/timestamps-time-zones-and-the-missing-hour), and the same fix applies: **run scheduled jobs on a server set to UTC.** UTC has no transitions, so the problem cannot occur. If the job must fire at a local wall-clock time, that conversion belongs inside the job, where a [time zone converter](/tool/timezone-converter) logic can apply the rules for the actual date.

Avoid scheduling anything between 01:00 and 03:00 local time if you cannot use UTC. It is the window where all of this happens.

## The other things that go wrong

**A missing trailing newline** in a crontab file causes some implementations to ignore the last line entirely.

**The environment is minimal.** Cron does not load your shell profile, so \`PATH\` is short and your interpreter may not be found. Use absolute paths for both the command and any file it touches.

**The percent sign is special** in crontab and must be escaped as \`%\`, which bites anyone using \`date\` format strings in a command.

**Overlapping runs.** Cron does not check whether the previous run finished. A job scheduled every five minutes that takes six will accumulate processes until something falls over. Use a lock file.

**Output goes to mail.** Anything a job writes to stdout is mailed to the user, and on a server with no mail configured it vanishes. Redirect to a log file you can actually read.

## Reading an expression you inherited

The reliable method is to go field by field, left to right, and say each one out loud. Minute, hour, day of month, month, day of week.

Then check the two questions that catch people: are both day fields restricted, and does the step value divide its range evenly? If the answer to either is yes, the expression probably does not mean what its author thought.

And for anything that runs infrequently, check the [timestamps](/tool/timestamp-converter) in your job logs against what you expected rather than trusting the expression. A monthly job has eleven chances a year to be wrong before anyone notices.`,
  },

  {
    slug: 'cleaning-a-url-before-sharing',
    title: 'What you are actually sharing when you paste a link',
    description: 'Most shared links carry tracking parameters, and some carry a session token. Both survive being forwarded.',
    excerpt: 'The link you copied from your address bar may identify you to everyone you send it to, and occasionally log them in as you.',
    category: 'dev',
    tags: ['urls', 'tracking', 'privacy', 'sharing'],
    published: '2026-09-13',
    relatedTools: ['url-parser', 'url-encoder', 'extract-urls', 'slug-generator'],
    takeaways: [
      'Everything after ? is parameters, and utm_, fbclid and gclid can all be deleted without breaking the link.',
      'Some links carry a session or invite token that grants access to whoever holds it.',
      'URLs leak through the Referer header to the next site you visit, so a secret in a URL is not private.',
      'Shortened links hide the destination entirely, which is the point of them and the problem with them.',
    ],
    body: `You copy a link from your address bar and paste it into a group chat. What you pasted is 180 characters long, about 90 of which describe where you came from, which campaign brought you there, and a session identifier.

## Reading a URL in parts

\`\`\`
https://shop.example.com/products/kettle?utm_source=newsletter&fbclid=IwAR2x&ref=user_8842
|_____| |______________| |_____________| |_______________________________________________|
 scheme        host                path                            query
\`\`\`

The path identifies the page. Everything after the \`?\` is parameters, and a good proportion of them are usually removable.

A [URL parser](/tool/url-parser) that splits a link into these components is the fastest way to see what you have, particularly for the long ones where the interesting parameter is in the middle.

## The three kinds of parameter

**Functional.** The page needs them. A search query, a page number, a product variant. Remove these and the link breaks.

**Tracking.** Added by whoever sent you there, describing the campaign. These are safe to delete:

| Parameter | Added by |
|---|---|
| \`utm_source\`, \`utm_medium\`, \`utm_campaign\`, \`utm_term\`, \`utm_content\` | Analytics, usually from an email or ad |
| \`fbclid\` | Facebook |
| \`gclid\`, \`dclid\` | Google Ads |
| \`msclkid\` | Microsoft Ads |
| \`mc_cid\`, \`mc_eid\` | Mailchimp, and \`mc_eid\` identifies the individual recipient |
| \`igshid\` | Instagram |

That \`mc_eid\` is worth singling out. It identifies **you** as a specific newsletter subscriber. Forwarding a link containing it attributes every subsequent click to your email address.

**Identifying.** Referral codes, invite tokens, session parameters. These are the ones that matter.

> [!WARNING]
> Some services put an access token in the URL, which is how "anyone with the link can view" sharing works. Forwarding such a link grants that access to the recipient. A handful of systems have historically put session identifiers in URLs, where sharing the link shares the session. If a parameter looks like a long random string and you did not put it there, do not share it.

## URLs leak sideways

Even without sharing, a URL does not stay between you and the site.

The **Referer** header sends the URL of the page you were on to the page you click through to. So a secret in a URL is disclosed to the next site you visit, and this is the specific reason not to put credentials or tokens in query strings, as noted in [random strings and tokens](/blog/random-strings-and-tokens).

URLs are also written to server access logs at every hop, stored in browser history, scanned by link previewers in messaging apps, and often indexed if a page linking to them is public.

The rule that follows: **an unguessable URL is a reasonable pattern for a share link with an expiry. It is not authentication.**

## Shortened links

A shortener replaces the destination with an opaque code, which removes your ability to read any of the above. That is the entire point of it, and it is why an unexpected shortened link deserves suspicion, as covered in [reading a link before you click it](/blog/spotting-a-dangerous-link).

Most shorteners will reveal the target if you append \`+\` to the URL. The habit worth having is expanding before clicking rather than after.

## Cleaning before you share

1. **Cut everything from the \`?\` onwards** and test the link. If it still lands on the right page, you are done, and this handles the majority of cases.
2. **If it breaks**, add back only the parameters the page needs.
3. **Look for anything that looks like a token** before sharing more widely.
4. **Expand shortened links** so you know what you are passing on.

Browsers are starting to do some of this. Firefox strips known tracking parameters in strict mode, and Safari removes some when copying. Neither is complete, and neither knows about the referral code specific to the service you are on.

## The other direction

When you are producing links rather than consuming them, two things make them worth sharing.

Keep the path readable. A [slug](/tool/slug-generator) made of lowercase words and hyphens survives being pasted into a chat, an email and a document without becoming percent-encoded noise, for the same reasons that apply to [file names](/blog/naming-files-that-survive).

And encode parameter values properly. A value containing an ampersand silently splits into two parameters unless it is percent-encoded, which is the distinction between the two JavaScript encoding functions covered in [three kinds of escaping](/blog/three-kinds-of-escaping). A [URL encoder](/tool/url-encoder) settles what a value should look like before it goes into a link you publish.

Pulling every link out of a block of text, which is the usual first step when auditing an email template or a page of content, is what [URL extraction](/tool/extract-urls) is for. All of these run in the tab, which matters because the links people paste into online parsers are frequently the ones carrying a token.`,
  },
  {
    slug: 'mime-types-and-file-signatures',
    title: 'MIME types, magic bytes and why a file opens as the wrong thing',
    description: 'The extension, the declared MIME type and the actual bytes are three separate claims about a file, and any of them can be wrong.',
    excerpt: 'An upload rejects your PNG for not being a PNG. The extension says one thing, the first eight bytes say another, and the server believes the bytes.',
    category: 'dev',
    tags: ['mime', 'file-formats', 'uploads'],
    published: '2026-09-16',
    relatedTools: ['mime-checker', 'image-convert', 'zip-extractor'],
    takeaways: [
      'A file extension is a naming convention, not a fact about the contents. Renaming .webp to .png converts nothing.',
      'Most formats start with a signature — magic bytes — that identifies them regardless of name. That is what strict uploaders check.',
      'Browsers decide what to do with a response from the Content-Type header, not the URL, which is why a served file can download instead of displaying.',
      'Never trust a client-supplied MIME type on the server. It is chosen by whoever uploaded the file.',
    ],
    body: `You rename a photo from \`.webp\` to \`.png\` and the upload still refuses it. Or a download that should open in the browser saves to disk instead. Or a CSV opens in a text editor as gibberish. All three are the same confusion: there are several independent claims about what a file is, and they disagree.

## Three claims, not one

**The extension.** Characters after the last dot in the name. It is a hint for the operating system about which program to launch, and it is trivially wrong because anyone can rename anything.

**The MIME type.** A label like \`image/png\` or \`text/csv\` transmitted alongside the file — in an HTTP \`Content-Type\` header, in a multipart upload, in an email part. It describes intent and it is also just a claim.

**The magic bytes.** The first few bytes of the file itself, which most formats define as a fixed signature. This is the only one of the three derived from the actual contents.

When they conflict, different systems believe different ones, which is exactly why the same file behaves differently in three places.

## Signatures worth recognising

\`\`\`
PNG    89 50 4E 47 0D 0A 1A 0A      .PNG....
JPEG   FF D8 FF                     ....
GIF    47 49 46 38                  GIF8
PDF    25 50 44 46 2D               %PDF-
ZIP    50 4B 03 04                  PK..
RIFF   52 49 46 46 .... 57 45 42 50 RIFF....WEBP
\`\`\`

Two of those explain a lot of everyday confusion.

\`PK\` at the start of a ZIP is the initials of Phil Katz, and it appears at the start of DOCX, XLSX, PPTX, ODT, EPUB, JAR and APK files — because all of those *are* ZIP archives with a prescribed internal structure. That is why [a ZIP extractor can open a DOCX](/tool/zip-extractor) and show you the XML inside, and why a corrupt Office file is often a corrupt ZIP.

\`%PDF-\` is ASCII, which is why a PDF header is readable in a text editor and why a truncated PDF can sometimes be diagnosed by eye.

> [!NOTE]
> Checking the signature is how you find out what a file really is. A [MIME checker](/tool/mime-checker) reads the leading bytes and reports the format, which settles the "but it is a PNG" argument in one step — and confirms that renaming changed nothing.

## Why the browser downloads instead of displaying

When a browser fetches a URL, what it does with the response is decided by the \`Content-Type\` header, not by the path. A PDF served as \`application/octet-stream\` downloads. The same file served as \`application/pdf\` opens in the viewer.

Two related headers finish the story. \`Content-Disposition: attachment\` forces a download regardless of type, and \`X-Content-Type-Options: nosniff\` tells the browser not to second-guess the declared type by inspecting the bytes.

That sniffing is the historical behaviour: browsers used to examine content when the declared type looked wrong, which was convenient and also a security hole, because a file uploaded as text and sniffed as HTML could execute script on the site's own origin. Hence \`nosniff\` on anything user-supplied.

> [!WARNING]
> On a server, the MIME type in an upload is supplied by the client and can say anything. Validate by reading the signature yourself, re-encode images rather than storing them as received, and serve user content from a separate origin with \`nosniff\`. A file named \`avatar.png\` with a \`PK\` header is not an image.

## Text files have no signature

Plain text formats — CSV, JSON, Markdown, YAML, SQL — have no magic bytes, which is why detection for them is guesswork and why a CSV can be opened as anything.

The one marker that does appear is a byte order mark: \`EF BB BF\` for UTF-8. It is invisible in most editors and is a recurring cause of a first column header arriving with three strange characters in front of it, or a JSON parser rejecting a file that looks perfectly valid. See [mojibake and UTF-8](/blog/unicode-utf8-and-mojibake) for why that happens and what to do about it.

## Converting versus renaming

The distinction that started this: renaming changes the label, converting rewrites the bytes.

To make a WebP into a real PNG you have to decode the image and re-encode it in PNG, which an [image converter](/tool/image-convert) does. The file that comes out has \`89 50 4E 47\` at the front and will pass any check. The renamed one never will, and the failure message will usually be unhelpful about why.

## A short diagnostic

1. Read the signature. That tells you what the file is.
2. Compare it to the extension. Mismatch → rename or convert, depending on which one is wrong.
3. Behaving oddly over HTTP → check \`Content-Type\` and \`Content-Disposition\`.
4. Rejected by an upload → the server almost certainly checked the bytes, not the name.

Checking a file's type is pure local inspection, so the [MIME checker](/tool/mime-checker) here reads it in the tab without the file going anywhere.`,
  },
  {
    slug: 'what-a-user-agent-string-says',
    title: 'What a user agent string actually says about you',
    description: 'The user agent is a browser identifying itself in a format shaped by decades of compatibility hacks, and it is losing detail on purpose.',
    excerpt: 'Every browser claims to be Mozilla. The string is part identification, part historical fiction, and it is a weaker signal every year.',
    category: 'dev',
    tags: ['user-agent', 'browsers', 'privacy'],
    published: '2026-09-15',
    relatedTools: ['user-agent-parser', 'url-parser'],
    takeaways: [
      'Every mainstream browser begins its user agent with "Mozilla/5.0" for compatibility with 1990s server sniffing. It carries no information.',
      'Browsers are freezing and reducing the string on purpose, so version and platform detail is deliberately less precise than it used to be.',
      'Detect capabilities, not browsers. Feature detection stays correct when the string changes; version comparisons do not.',
      'A user agent is trivially spoofed, so it is never a security control — but combined with other signals it still contributes to fingerprinting.',
    ],
    body: `Every HTTP request your browser makes carries a \`User-Agent\` header. It looks like a specification and reads like an archaeology site:

\`\`\`
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36
\`\`\`

That is Chrome on Windows. It claims to be Mozilla, mentions Apple's rendering engine, claims to be like Gecko, and ends by claiming to be Safari. Only one token in it is true in the obvious sense.

## Why it reads like that

In the 1990s, servers checked the user agent to decide whether to send frames-capable HTML. Netscape ("Mozilla") supported frames, so servers looked for that token. Internet Explorer supported frames too, and to avoid being served the stripped-down page it claimed to be "Mozilla (compatible; MSIE …)".

Every browser since has inherited the problem. Safari added \`AppleWebKit\` and also claimed \`like Gecko\` so that Gecko-targeting code would work. Chrome added \`Chrome/\` and kept \`Safari/\` so WebKit-targeting code would work. Edge added \`Edg/\` and kept everything else.

The string is therefore a stack of compatibility claims in rough historical order, and the only reliable way to read it is to look for the most specific token present — \`Edg/\` before \`Chrome/\`, \`Chrome/\` before \`Safari/\` — which is exactly what a [user agent parser](/tool/user-agent-parser) does.

## What it is legitimately used for

**Analytics.** Aggregate browser and platform share, to decide what to test and what to stop supporting.

**Serving the right asset.** Offering an APK to Android and an IPA to iOS from the same download page.

**Bug reproduction.** A bug report is much more actionable with the exact browser and version attached.

**Crawler identification.** Bots identify themselves in the user agent, which is how a server distinguishes a search crawler from a person.

## What it should not be used for

**Feature detection.** "Is this Safari 14" is a proxy for "does this support the API I want", and a bad one. Ask about the API directly; the answer stays correct across versions, forks and embedded webviews you have never heard of.

**Security decisions.** The header is set by the client. Anyone can change it in a devtools panel or a one-line curl flag. Nothing that matters should depend on its value.

**Blocking.** Blocking by user agent blocks polite bots and courteous users, and does nothing to anything hostile, which will send whatever string gets through.

> [!NOTE]
> Parsing a user agent is a string-matching exercise, so a [parser](/tool/user-agent-parser) that runs in the tab is enough — there is nothing to look up remotely. That also means you can paste a string from a production log without it travelling anywhere.

## The string is shrinking on purpose

The user agent is a fingerprinting surface: precise OS version, exact browser build and device model combine with other signals to identify a specific person across sites without any cookie.

So browsers have been reducing it. Chrome freezes parts of the string and reports minor versions as zeros. Safari has reported a near-static string for years. Platform detail on mobile has been generalised — many Android devices now report a single generic model rather than their own.

The replacement is Client Hints: the browser sends a low-entropy set by default (rough platform, rough browser) and a site must explicitly request more detail, which makes the request visible rather than automatic.

The practical consequence is that user-agent-derived analytics get vaguer every year, and code that compares version numbers gets more fragile. Both arguments point the same way: detect capabilities.

> [!WARNING]
> Changing your user agent does not make you anonymous. An unusual string is *more* identifying, not less, because very few people have it. Fingerprinting works on the combination of signals — fonts, screen size, timezone, GPU — and a mismatched user agent adds one more distinguishing feature. See [what your browser announces](/blog/what-your-browser-announces) for the rest of the surface.

## Reading one quickly

1. Ignore \`Mozilla/5.0\`. Every browser says it.
2. Find the most specific browser token: \`Edg/\`, \`OPR/\`, \`SamsungBrowser/\`, then \`Chrome/\`, then \`Firefox/\`, then \`Safari/\`.
3. Read the platform from the parenthesised section.
4. Treat the numbers as approximate, because increasingly they are.`,
  },
];
