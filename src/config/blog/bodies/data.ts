// Article bodies for the "data" topic, split out of posts/data.ts.
//
// Bodies are only needed when an article is actually rendered, so they live in
// their own chunk. Keeping them beside the post metadata put every article on
// the site into the entry bundle — downloaded by the homepage and every tool
// page, which never display an article body.
export const DATA_BODIES: Record<string, string> = {
  'why-csv-files-break-in-excel': `A CSV file is plain text. It has no types, no formatting and no metadata, just characters separated by commas. When Excel opens one, it must *guess* what each value is meant to be, and its guesses are aggressive and irreversible.

## The four classic corruptions

**Leading zeros disappear.** \`00745\` becomes \`745\`. Excel decides it is a number, and numbers do not have leading zeros. This destroys postcodes, product SKUs, employee IDs, bank sort codes and any zero-padded identifier.

**Long numbers become scientific notation.** \`4532015112830366\` displays as \`4.53202E+15\`. Worse, Excel stores numbers with only **15 significant digits**, so a 16-digit credit card or IMEI number is not merely displayed oddly, the final digits are permanently replaced with zeros. Save the file and the original value is gone.

**Text becomes dates.** \`3-4\` becomes 3 April. \`1/2\` becomes 1 February or 2 January depending on locale. This is not a hypothetical edge case: in 2020 the HUGO Gene Nomenclature Committee formally renamed several human genes because Excel kept converting symbols like \`SEPT1\` and \`MARCH1\` into dates, and the errors had contaminated a significant fraction of published genomics supplementary data.

**Accented characters turn to gibberish.** \`José\` becomes \`JosÃ©\`. Excel does not reliably detect UTF-8 in a \`.csv\` file and falls back to the system's legacy code page.

## Why the encoding one is so persistent

Excel will detect UTF-8 if the file begins with a byte order mark, the three bytes \`EF BB BF\`. Without it, it assumes the local ANSI code page.

So the fix for Excel is to write the BOM. The complication is that a BOM is unwelcome almost everywhere else: many parsers include it in the first column's header name, so \`id\` silently becomes \`\\ufeffid\` and every lookup by that name fails.

This is a genuine incompatibility, not a bug you can fix once. If a file is for Excel, write the BOM. If it is for a data pipeline, do not.

## The delimiter is not always a comma

Excel does not use a comma when opening CSVs. It uses the **list separator from your operating system's regional settings**. In locales where the decimal separator is a comma, much of Europe and Latin America, that list separator is a semicolon.

The consequence is that a comma-separated file opens correctly on one colleague's machine and lands entirely in column A on another's. Nothing is wrong with the file; the two machines disagree about what CSV means.

## Getting data in safely

**Never double-click a CSV you care about.** Double-clicking gives Excel free rein to guess. Instead, use Data → From Text/CSV, which opens the import dialog where you can set the encoding, the delimiter, and, crucially, the type of each column. Set identifier columns to **Text** and Excel leaves them alone.

**Or defend in the file itself.** Prefixing a value with an apostrophe (\`'00745\`) forces text, though the apostrophe is an Excel convention that other tools will treat as part of the data.

**Or avoid the round trip.** If the data is going to a database or a script, do not open it in Excel at all. Every trip through a spreadsheet is a chance for a silent type conversion.

## Rules for producing CSVs others will open

1. **Quote every field** that could contain a comma, a quote, or a line break. Escape embedded quotes by doubling them (\`""\`), per RFC 4180.
2. **Use ISO dates**, \`2026-06-19\`. Unambiguous everywhere, sorts correctly as text, and resistant to locale reinterpretation.
3. **Write UTF-8**, with a BOM if and only if Excel is the intended consumer.
4. **Keep identifiers as text** and say so in the documentation, because CSV cannot say it in the file.
5. **State the delimiter** in whatever accompanies the file.
6. **Do not put commas in numbers.** \`1,234.56\` is two fields, not one.

## Checking before you trust it

The fastest way to find out what a file actually contains is to look at it in something that does not reinterpret it. A [CSV viewer](/tool/csv-viewer) shows the parsed rows as they really are, and a [CSV cleaner](/tool/csv-cleaner) normalises delimiters, quoting and encoding before the file reaches a spreadsheet. Both run locally, which matters when the file is a customer export.`,
  'csv-to-json-conversion-guide': `CSV and JSON describe data differently enough that converting between them requires choices. Making those choices deliberately avoids a set of failures that are easy to miss until much later.

## The shape mismatch

A CSV is a rectangle: rows and columns, all values flat strings.

JSON is a tree: nested objects, arrays, and four scalar types (string, number, boolean, null).

The natural mapping is one CSV row to one JSON object, with column headers as keys:

\`\`\`csv
id,name,active
1,Asha,true
2,Ben,false
\`\`\`

\`\`\`json
[
  { "id": 1, "name": "Asha", "active": true },
  { "id": 2, "name": "Ben", "active": false }
]
\`\`\`

Straightforward, but notice that \`1\` became a number and \`true\` became a boolean. Those were decisions, and they are where things go wrong.

## Type inference is the main hazard

Every value in a CSV is a string. A converter that infers types is guessing, and the guesses are frequently wrong in ways that destroy data:

- **\`00745\`** → the number \`745\`. Leading zeros gone. Postcodes, SKUs and account numbers ruined.
- **\`+91 98765 43210\`** → possibly a number, possibly mangled.
- **\`4532015112830366\`** → exceeds JavaScript's safe integer range (2⁵³−1) and is silently rounded.
- **\`0123\`** → \`123\`, breaking any identifier that depends on its exact form.
- **\`TRUE\`, \`yes\`, \`Y\`, \`1\`** → treated as booleans by some converters and not others.
- **\`2026-07-08\`** → a string in JSON (there is no date type), but some converters reformat it anyway.

The safe default is **keep everything as a string**, then explicitly cast the specific fields you know should be numeric. Losing the number type is recoverable; losing the leading zeros is not.

## Empty values are ambiguous

An empty CSV field could mean an empty string, a missing value, or a genuine null. CSV cannot distinguish them.

Pick a convention and apply it consistently, usually empty string becomes \`null\` for numeric columns and \`""\` for text columns. What matters is that consumers know which rule you used.

Watch for literal \`NULL\`, \`N/A\`, \`-\` and \`#N/A\` strings, which are common in exported data and mean "missing" to a human but are ordinary text to a parser.

## Nesting

CSV is flat, so representing structure requires a convention. The common one is dotted headers:

\`\`\`csv
id,address.city,address.pin
1,Ahmedabad,380001
\`\`\`

\`\`\`json
[{ "id": "1", "address": { "city": "Ahmedabad", "pin": "380001" } }]
\`\`\`

Arrays are harder: either repeat a column with an index (\`tags.0\`, \`tags.1\`) or put a delimited list inside one field (\`"red;green;blue"\`), which requires a second delimiter that does not appear in the data.

Going the other way, JSON to CSV, you must flatten, and any array of variable length forces either a column per possible position or a joined string. There is no clean answer; decide based on what the consumer needs.

## Headers need cleaning

CSV headers from real exports contain spaces, punctuation, currency symbols and trailing whitespace. \`Total (₹)\` is a valid JSON key but awkward to use in most languages.

Normalise to something predictable, \`total_inr\`, and keep a mapping if the original labels matter for display.

Also check for duplicate headers. Two columns named \`name\` produce a JSON object where one silently overwrites the other.

## When output size matters

JSON repeats every key in every record. For a 100,000-row file, that is the column names written 100,000 times. JSON is typically two to three times larger than the equivalent CSV.

For large exports, consider **NDJSON**, one JSON object per line. It streams, it can be processed line by line without loading everything into memory, and a single malformed line does not invalidate the file.

## A conversion checklist

1. Confirm the delimiter and encoding before parsing anything.
2. Decide the type policy, strings by default, cast explicitly.
3. Normalise headers; check for duplicates.
4. Decide how empty values are represented.
5. Validate the output parses as JSON.
6. Spot-check the first, last and a middle record against the source, paying attention to any identifier column.

Steps 1 and 6 catch most problems. A [CSV to JSON converter](/tool/csv-to-json) that lets you preview the parsed result before committing makes both quick, and running it in the browser means a customer export never leaves your machine on the way.`,
  'cleaning-messy-spreadsheet-data': `Data arriving from a form, an export or a colleague's spreadsheet is rarely clean. The defects are predictable, and there is a sensible order for fixing them, because doing it out of order hides problems rather than solving them.

## Step 1: whitespace, before anything else

Trailing spaces are invisible and break everything downstream. \`"Mumbai "\` and \`"Mumbai"\` are different strings, so they group separately, join separately and deduplicate separately.

Trim leading and trailing whitespace on every text field, and collapse internal runs of spaces to one.

Watch for the ones you cannot see: the non-breaking space (U+00A0) is extremely common in data copied from web pages or Word, and it does not match a regular space. A generic "trim whitespace" that only handles ASCII space and tab will leave it behind, and you will spend an hour wondering why two identical-looking values will not match.

**Do this first**, because every subsequent comparison depends on it.

## Step 2: normalise casing and formats

- **Case.** Decide a rule per column: names in title case, emails in lowercase, country codes in uppercase. Emails in particular should be lowercased, since the domain part is case-insensitive and most providers treat the local part that way too.
- **Dates.** Convert everything to ISO 8601 (\`2026-07-25\`). The trap is ambiguity: \`03/04/2026\` is 3 April or 4 March depending on origin, and there is no way to tell from the value alone. If the source mixes conventions, you need to know the origin of each row, guessing produces plausible, wrong dates.
- **Numbers.** Strip thousands separators, currency symbols and percentage signs. Be careful with locales where the decimal separator is a comma: \`1.234,56\` and \`1,234.56\` are the same number written two ways.
- **Phone numbers.** Pick one format. Store the country code.

## Step 3: handle empty values consistently

Real exports contain \`\`, \`NULL\`, \`N/A\`, \`-\`, \`n/a\`, \`#N/A\`, \`unknown\` and \`TBD\`, often in the same column. To a person these all mean "missing". To a tool they are six distinct values.

Map them all to one representation before doing anything else with the column.

## Step 4: deduplicate, but define "duplicate" first

This is where most cleaning goes wrong. Exact-match deduplication only removes rows that are byte-identical, which will miss:

- \`john@example.com\` vs \`John@Example.com\`
- \`Acme Ltd\` vs \`Acme Ltd.\` vs \`ACME LIMITED\`
- The same person entered twice with different phone formats

Deduplicating **after** steps 1–3 catches far more, which is exactly why order matters.

Then decide the key. Duplicate on the whole row? On email alone? On name plus date of birth? These give different answers, and the right one depends on what the data means.

And decide which copy to keep, usually the most recently updated, or the most complete.

## Step 5: validate rather than assume

Before using the data, check the assumptions you are about to rely on:

- Do all emails contain exactly one \`@\` with something either side?
- Are all dates within a plausible range? (Birthdates in 1900 or 2087 usually mean a parsing error, not a data-entry error.)
- Do numeric columns contain only numbers?
- Do required fields have values?
- Are there rows with the wrong number of columns, a strong sign of an unescaped delimiter inside a field?

## Step 6: check the structure itself

- **Merged cells** from Excel export as a value in the first cell and blanks in the rest. This silently destroys row alignment.
- **Multiple header rows**, or a title row above the headers, shift everything by one.
- **Totals rows at the bottom** get treated as data and pollute every aggregation.
- **Blank rows** used as visual separators break naive parsers.

## Keep the original

Always work on a copy and keep the raw export untouched. When you discover in three weeks that a transformation was wrong, you need the source to redo it from.

If the cleaning is something you will do again, a monthly export, a recurring import, write the steps down. Cleaning that only exists as a sequence of manual actions someone once performed is cleaning that will be done differently next time.

## Tooling

For one-off work, a [CSV cleaner](/tool/csv-cleaner) that handles trimming, casing and delimiter normalisation in a pass covers steps 1–3, [duplicate removal](/tool/remove-duplicates) covers step 4, and a [CSV editor](/tool/csv-editor) is useful for the structural inspection in step 6. All of it runs in the browser, which is the relevant property when the file is a customer or employee list.`,
  'csv-vs-excel-when-to-use-which': `Both hold tabular data and both open in a spreadsheet, which is where the similarity ends.

## What each one actually is

**CSV** is a plain text file. One line per row, values separated by a delimiter. That is the entire specification. No types, no formulas, no formatting, no multiple sheets, no column widths. Any text editor can read it, any language can parse it in a few lines, and it will still open in fifty years.

**XLSX** is a ZIP archive containing XML files. It stores cell types, formulas and their cached results, number and date formatting, multiple worksheets, charts, conditional formatting, pivot tables, data validation rules, and macros in the \`.xlsm\` variant.

The trade is legibility versus capability, and it is a genuine trade in both directions.

## Where CSV wins

- **Interoperability.** Every database import, every data pipeline, every programming language reads it without a library.
- **Streaming.** You can process a 20 GB CSV line by line without loading it into memory. You cannot do that with an XLSX.
- **Version control.** A CSV diffs meaningfully in Git. An XLSX is a binary blob that shows as "changed" with no detail.
- **Longevity.** Nothing about it can become unreadable.
- **Size.** For raw data, CSV is smaller than XLSX before compression and comparable after.

## Where XLSX wins

- **Types survive.** A column marked as text stays text. Leading zeros are preserved. Dates are dates, not strings that get reinterpreted on the next machine.
- **Formulas.** CSV can only hold a formula's result, never the formula.
- **Multiple sheets** in one file.
- **Formatting** that carries meaning, highlighted exceptions, conditional colour scales.
- **Data validation**, which stops bad input at entry rather than catching it later.
- **No delimiter or encoding ambiguity.** The format specifies both, so a file that opens correctly for you opens correctly for everyone.

## The limits worth knowing

Excel caps a worksheet at **1,048,576 rows and 16,384 columns**. Hit that limit, which large exports routinely do, and Excel truncates, sometimes with a warning that is easy to click past.

Excel also stores numbers with **15 significant digits**. Any longer identifier is silently altered.

Neither limit applies to CSV, which is one reason large data is distributed as CSV even when the recipient will open it in a spreadsheet.

## Choosing

**Use CSV when:**
- Feeding a database, script or data pipeline
- The file is large, or unbounded in size
- It goes into version control
- Long-term archival matters
- The recipient's software is unknown

**Use XLSX when:**
- A person will read and work in it
- Column types must be preserved exactly (IDs, postcodes, phone numbers)
- You need formulas, multiple sheets or formatting
- You are sending it to a colleague rather than a system

**The rule of thumb:** CSV for machines, XLSX for humans.

## Converting between them

**XLSX → CSV** loses formulas (you keep their last calculated values), formatting, and every sheet except the one you export. If cached values are stale because the file was saved without recalculating, you export stale numbers.

**CSV → XLSX** is where the type guessing described earlier does its damage, leading zeros, long numbers, date-like strings. Set column types during import rather than after.

Either way: check identifier columns in the output before sending it anywhere.

## A practical middle path

For a recurring report, keep the source data as CSV and generate the XLSX presentation layer from it. The CSV is the record, diffable, streamable, durable, and the spreadsheet is a view.

For one-off work, the [CSV viewer](/tool/csv-viewer) opens a file without Excel touching it, the [CSV editor](/tool/csv-editor) gives you a grid to fix cells in, and the [delimiter converter](/tool/delimiter-converter) handles the semicolon and tab variants. All three run in the browser, so a payroll or customer file is not uploaded to a converter service on its way between two formats.`,
  'csv-delimiters-quoting-and-encoding': `There is a specification for CSV, RFC 4180, published in 2005, and it is barely two pages. It is also descriptive rather than authoritative: it documented common practice years after the format was in universal use. Real files depart from it constantly, in three specific dimensions.

## 1. The delimiter

The name says comma. Practice says otherwise.

In locales where the decimal separator is a comma, Germany, France, Spain, Brazil, most of continental Europe and Latin America, putting commas between fields is ambiguous, so **semicolons** are used instead. Excel follows the operating system's list separator setting, which is why the same file behaves differently on two machines.

**Tabs** (TSV) are also common, and arguably better: tabs almost never appear inside data fields, so quoting is rarely needed. The **pipe** \`|\` is used for the same reason.

Detection heuristics work by counting candidate delimiters per line and picking the one that yields a consistent column count. This is reliable most of the time and fails on files where a field contains many instances of another candidate.

**Always state the delimiter** when you hand a file to someone. It cannot be recorded inside the file.

## 2. Quoting

The rules from RFC 4180:

- A field **must** be quoted if it contains the delimiter, a double quote, or a line break.
- A double quote inside a quoted field is escaped by **doubling it**: \`""\`.
- Quoting a field that does not need it is allowed.

\`\`\`csv
id,description
1,"Contains, a comma"
2,"She said ""hello"""
3,"Line one
Line two"
\`\`\`

Row 3 is worth dwelling on: **a single CSV record can span multiple physical lines.** Any parser that splits the file on newlines before handling quotes will corrupt it. This is the most common flaw in hand-written CSV parsing, and the reason "just split on commas" fails on real data.

Departures you will meet in the wild: backslash escaping (\`\\"\`) instead of doubling, which is a MySQL export convention; single quotes used as the quote character; and unescaped quotes inside unquoted fields, which is simply broken and requires guessing.

## 3. Encoding

CSV has no way to declare its own encoding. The bytes are just bytes.

- **UTF-8** is the correct modern choice.
- **UTF-8 with BOM** is what Excel needs to detect UTF-8 in a \`.csv\`. Without it, Excel falls back to the system code page and non-ASCII characters become mojibake.
- **Windows-1252 / Latin-1** appears constantly in older exports.

The BOM is a genuine dilemma rather than a solved problem: Excel wants it, and many parsers include it in the first header name, so \`id\` becomes \`\\ufeffid\` and every lookup by that name fails. Choose based on the consumer, and strip the BOM on ingest if you are the consumer.

## Line endings

RFC 4180 specifies CRLF. Unix tooling produces LF. Most parsers accept both, but a parser that splits strictly on \`\\n\` will leave a trailing \`\\r\` on the last field of every row, which then fails to match anything, invisibly. This is a frequent cause of "the last column never matches".

Old Mac files using CR alone still occasionally appear.

## Headers

Not required by the specification, and universally expected in practice. Problems worth checking for:

- **Duplicate names.** Two columns called \`name\`, one silently wins.
- **Empty names**, from a trailing delimiter on the header row.
- **Trailing whitespace** in header names, which breaks lookups invisibly.
- **A title row above the headers**, which shifts everything.

## Diagnosing a broken file

1. **Open it in a plain text editor**, not a spreadsheet. Look at the raw first three lines. Most problems are visible immediately.
2. **Count the delimiters** on the first few lines. Inconsistent counts mean unescaped delimiters inside fields.
3. **Check the first bytes** for a BOM.
4. **Look for lone \`\\r\`** at the end of fields.
5. **Look for an unbalanced quote**, which makes the parser swallow the rest of the file into one field, the signature is a file that parses as a handful of enormous rows.

## Producing files that do not break

- Quote every field that could possibly need it. Over-quoting is harmless.
- Double internal quotes; do not use backslashes.
- Write UTF-8, with a BOM only for Excel.
- Use CRLF if you want strict conformance; LF is fine in practice.
- Use ISO dates and unformatted numbers.
- Document the delimiter and encoding alongside the file.

For files you receive, a [delimiter converter](/tool/delimiter-converter) and [CSV cleaner](/tool/csv-cleaner) will normalise most of this in one pass, locally, which matters given how often these files contain personal data.`,
  'what-actually-compresses-in-a-zip': `You select 200 holiday photos totalling 800 MB, compress them, and get a 797 MB zip. Nothing malfunctioned. ZIP did exactly what it does, and there was nothing there for it to do.

## What compression actually removes

Lossless compression works by finding **repetition**. The Deflate algorithm that ZIP uses does two things: it replaces repeated byte sequences with a reference to the earlier occurrence, and it gives the most frequent bytes shorter codes.

Both need patterns. Feed it English text, where \`the\` appears constantly and only a few dozen byte values are ever used, and it has enormous room to work. Feed it data that has already had its patterns removed, and there is nothing to find.

That is the whole explanation, and it predicts everything:

| File type | Typical saving | Why |
|---|---|---|
| Text, CSV, logs, code | 70-90% | Hugely repetitive |
| XML, JSON, SVG | 70-85% | Repeated tags and keys |
| BMP, WAV, uncompressed TIFF | 50-80% | Raw, no compression yet |
| PDF with text | 5-20% | Streams already deflated |
| DOCX, XLSX, PPTX | 0-3% | Already zip files |
| JPEG, PNG, GIF, WebP | 0-3% | Already compressed |
| MP3, MP4, AAC | 0-2% | Already compressed |

A \`.docx\` compressing by nothing surprises people until you remember it already is a zip archive. Zipping it is asking Deflate to compress its own output.

## So why zip photos at all

Because size is not the only reason, and for photos it is not the reason at all.

**One thing instead of many.** A single 200 MB attachment is manageable. Two hundred separate files is not, for you or the recipient.

**Structure survives.** Folder hierarchy and filenames are preserved. Email attachments and many upload forms flatten everything otherwise.

**Integrity checking.** Every entry carries a CRC-32 checksum, so extraction fails loudly if the archive was damaged in transit rather than producing quietly corrupt files.

**Encoding is preserved.** Text files keep their bytes exactly, instead of being helpfully converted by something in the middle.

So [creating a zip](/tool/zip-creator) of a photo set is still the right move. Just do not expect the size to change, and do not waste time trying "maximum" compression on it.

> [!TIP]
> If the actual goal is smaller photos, compression is the wrong lever entirely. [Resize and re-encode the images](/tool/image-compressor) first. Reducing 4000px photos to 2000px and saving at quality 80 typically takes 800 MB to under 100 MB, which is a real reduction rather than a repackaging.

## When you want many archives, not one

The default assumption is one archive containing everything. Sometimes the requirement is the opposite: one archive per file, because a portal accepts submissions individually, or because each recipient should get only their own document.

That is what [batch zipping](/tool/batch-zip) does, producing a separate archive per input and handing you all of them together. It is a small thing that saves a genuinely tedious afternoon when there are forty of them.

## The encryption is two different things

ZIP supports encryption, and the format has two schemes with very different properties.

**ZipCrypto**, the original, is cryptographically broken. It is vulnerable to a known-plaintext attack, which is easy to mount because archives often contain predictable content. Treat it as no protection at all.

**AES-256**, added later, is genuinely strong. But support is inconsistent: Windows Explorer's built-in zip handling cannot open AES-encrypted archives, so your recipient may need a separate tool.

> [!WARNING]
> Neither scheme encrypts the file list. Filenames, sizes and timestamps stay readable without the password. An archive called \`redundancies-march.zip\` containing \`smith-j-termination.pdf\` has told the story before anyone tries the password.

If the contents are sensitive, name the files neutrally, use AES-256, and send the password through a different channel than the archive.

## A sensible default

1. **Ask what you are optimising.** Fewer files, or fewer bytes? They need different actions.
2. **If it is bytes and the content is media,** resize and re-encode rather than zip.
3. **If it is bytes and the content is text,** zip it and enjoy the 80%.
4. **If it is convenience,** zip it regardless of what happens to the size.
5. **If the folder is mostly CSV exports,** consider whether [merging them into one file](/tool/merge-csv) is what the recipient actually wants. Twelve monthly exports in an archive is usually a worse answer than one file with a month column.

Point five is the one worth pausing on, because sending an archive is frequently a way of passing an unfinished job along.

Both [zipping](/tool/zip-creator) and [unzipping](/tool/zip-extractor) here happen in the browser, which is the useful property when the archive is a set of client documents, HR records or ID scans. Those are exactly the files people zip in order to send somewhere, and exactly the ones you would rather not upload to a converter first.`,
  'email-attachment-size-limits': `You have a 24MB PDF and a 25MB limit. The email bounces. The number in the error does not match the number on your file, and both are correct.

## The 33% nobody mentions

Email was designed to carry text, specifically seven-bit ASCII. Binary files, which is every PDF, image and spreadsheet, cannot travel through it unchanged.

So attachments are encoded, almost always with base64, which represents three bytes of binary as four characters of text. That is a fixed 33% expansion, the same arithmetic as [inlining an image as a data URI](/blog/data-uris-when-to-inline-an-image).

The limit applies to the encoded message:

| Your file | After encoding | Fits a 25MB limit |
|---|---|---|
| 10 MB | ~13.3 MB | Yes |
| 18 MB | ~24 MB | Just |
| 20 MB | ~26.6 MB | No |
| 24 MB | ~32 MB | No |

**A 25MB limit is roughly an 18MB file limit.** Add the message body, an inline signature image and the headers, and the working figure is nearer 17MB.

## The limit that applies is not yours

Gmail allows 25MB. Outlook allows 20MB by default. Plenty of corporate servers are set to 10MB, and some healthcare and government systems to 5MB.

The message has to be accepted at every hop, so **the smallest limit anywhere on the path wins.** Your provider accepting a 24MB message tells you nothing about the recipient's server.

This is why a file that reached one colleague bounces for another at the same company, if the two are on different mail systems.

## Making it smaller, in order of what works

**PDFs.** [Compress it](/tool/pdf-compress), but know in advance whether that will help. A scanned document is mostly images and often drops 60 to 90 percent. A text-only contract is already deflated and will barely move. If the recipient needs three pages of a long report, [extract those pages](/tool/pdf-page-extractor) instead, which is lossless and far more effective than degrading the whole file.

**Photographs.** This is usually where the size actually is. Twelve phone photos at 4MB each is 48MB before encoding. [Resizing](/tool/image-resize) to 2000px on the long edge and [compressing](/tool/image-compressor) at quality 80 typically takes that under 5MB with no visible difference on screen.

**Do not reach for zip first.**

> [!WARNING]
> Zipping a folder of JPEGs, PNGs, MP4s or Office documents saves essentially nothing, because all of those are already compressed. A 48MB folder of photos zips to about 47MB. Zipping is for tidiness and structure, not size. The full explanation is in [what actually compresses in a zip](/blog/what-actually-compresses-in-a-zip).

Where [zipping](/tool/zip-creator) does pay is text: CSV exports, logs, code and XML routinely drop by 80 percent or more.

## Splitting, and why it backfires

Sending five emails labelled part 1 of 5 seems reasonable and tends to go wrong. Spam filters dislike bursts of near-identical messages with attachments, one part arrives out of order or not at all, and the recipient now has a reassembly job. Multi-part archives are worse, because a single missing part makes the rest unopenable.

If you genuinely must split, [batch zipping](/tool/batch-zip) into independent archives, one per document, at least means a missing one does not destroy the others.

## When to stop fighting it

Above roughly 15MB a link is simply more reliable, and not because of your file:

- No encoding overhead and no per-hop limit.
- The recipient's mailbox quota is not consumed.
- You can replace the file after sending.
- Large attachments are themselves a spam signal.

The trade is that a link is a different privacy decision. The file now sits on a third party's storage, usually readable by anyone who has the URL, often for longer than you expect. For a marketing deck that is fine. For medical records or identity documents, compressing properly and attaching is the better answer, which is the whole reason the steps above are worth doing on your own machine rather than on whichever converter is top of the results.

## The order that works

1. Work out what is actually heavy. Photos and scans, nearly always.
2. Resize and re-encode images before anything else.
3. Compress the PDF, or extract only the pages needed.
4. Zip only if it is text, or if you want one attachment instead of twenty.
5. Assume the real ceiling is about 70 percent of the stated limit.
6. Above 15MB, send a link and think about who else can read it.`,
  'naming-files-that-survive': `Someone sends you \`Q3 Report (final) 50% v2.xlsx\`. It opens fine. Then it goes into a zip, onto a shared drive, through a script, and somewhere in there it becomes \`Q3%20Report%20(final)%2050%25%20v2.xlsx\`, or it fails to extract, or a command line eats half of it.

Filenames look like free text and are not. Several systems have to agree about them.

## The characters that are genuinely forbidden

Windows rejects nine outright: \`< > : " / \\ | ? *\`

The colon catches people, because \`Report: Final.pdf\` is a natural thing to type on a Mac and cannot exist on Windows. A zip made on macOS containing such a file fails to extract cleanly there.

Windows also reserves a set of device names inherited from DOS, which still cannot be filenames even with an extension: \`CON\`, \`PRN\`, \`AUX\`, \`NUL\`, \`COM1\` to \`COM9\`, \`LPT1\` to \`LPT9\`. A file called \`con.txt\` cannot be created. And a name cannot end in a space or a full stop, because Windows silently strips them, so \`report .pdf\` quietly stops matching what you asked for.

Linux and macOS only forbid \`/\` and the null byte. That asymmetry is the problem: files created on Unix systems routinely cannot exist on Windows.

## The ones that are allowed and still cause trouble

**Spaces.** Legal everywhere, and they require quoting in every shell. \`rm my file.txt\` tries to delete two files. In a URL a space becomes \`%20\`, which is why filenames come back full of percent signs after a round trip through a web server.

**Accented and non-Latin characters.** These work, with one real hazard. macOS traditionally stores filenames in Unicode's decomposed form, where \`é\` is \`e\` plus a combining accent, while Linux and Windows use the composed form where it is a single character. They look identical and are different strings, so a lookup, a sync or a deduplication can miss. It is the same [normalisation problem](/blog/unicode-utf8-and-mojibake) surfacing where you least expect it.

**Ampersands, percent signs, hashes and plus signs.** All legal, all meaningful in a URL or a shell. A \`#\` truncates a URL at that point, so \`notes#2.pdf\` served over the web resolves to \`notes\`.

**Emoji.** Fine on modern systems, broken in older archive tools and many corporate document systems.

**Case.** Windows and macOS are usually case-insensitive; Linux is not. \`Report.pdf\` and \`report.pdf\` are one file on a laptop and two on the server, which is a genuinely confusing bug to chase.

> [!TIP]
> A [slug generator](/tool/slug-generator) does exactly the transformation you want: lowercase, accents folded to ASCII, spaces to hyphens, punctuation dropped. It is built for URLs, and URLs and filenames have almost the same constraints.

## Dates at the front, in ISO form

\`\`\`
2026-09-11-quarterly-report-v2.pdf
\`\`\`

The reason is narrow and decisive: **ISO dates are the only format that sorts correctly as plain text.** \`11-09-2026\` sorts by day, \`Sept 11 2026\` sorts alphabetically by month name, and both scatter a chronological set into a meaningless order in every file browser there is.

Date first means the default sort is chronological, everywhere, with no configuration.

## Rules that avoid all of it

1. **Lowercase.** Removes the case-sensitivity mismatch entirely.
2. **Hyphens, not spaces or underscores.** No quoting needed, and they read as word separators everywhere.
3. **ASCII letters, digits and hyphens only.** No accents, no emoji, no punctuation.
4. **ISO date first** when the file is one of a series.
5. **Zero-pad numbers.** \`part-02\` sorts before \`part-10\`; \`part-2\` does not.
6. **Under about 100 characters.** Path length limits are still real, and a deep folder tree plus a long name still hits them.
7. **Never rely on the extension to mean anything.**

That last one is worth stating plainly. The extension is a naming convention anyone can change. What determines how a program treats a file is its magic bytes, which is why a [MIME checker](/tool/mime-checker) will tell you the \`.xlsx\` your system produced is really an HTML error page, a surprisingly common outcome of a failed export.

## Fixing a folder you inherited

For a batch of badly named files the sequence is the one that applies to any messy text: normalise whitespace with a [text cleaner](/tool/text-cleaner), settle on a consistent [case](/tool/case-converter), then convert each name to a [slug](/tool/slug-generator).

> [!WARNING]
> Renaming breaks anything pointing at the old name: links inside documents, scripts, bookmarks and sync histories. Rename early, while a set of files is still yours, rather than after it has been shared.

All three run on text you paste in, in your own browser, which matters more than it sounds given that a list of filenames is frequently a list of client names, case numbers and internal project codes.`,
  'aggregating-without-a-pivot-table': `You group a sales export by city and the report shows London three times with different totals. Nothing is broken. The column contains \`London\`, \`london\` and \`London \` with a trailing space, and those are three distinct strings.

Almost every aggregation problem is a data problem that only becomes visible when you group.

## Clean before you group

Grouping compares values exactly. Every difference that a human ignores creates a separate group:

- **Trailing and leading whitespace**, the most common and the most invisible.
- **Casing**, unless the tool folds it.
- **Non-breaking spaces**, which arrive from copied web content and are not the space character.
- **Alternative spellings**, like \`UK\` against \`U.K.\` against \`United Kingdom\`.

So the order is: [clean](/tool/csv-cleaner) first, then group. That is the same sequence as in [cleaning messy spreadsheet data](/blog/cleaning-messy-spreadsheet-data), and it exists because every later step compares strings.

A quick diagnostic before trusting any summary: count the distinct values in the column you are grouping by. If you expected 20 cities and there are 34, you have a cleaning problem rather than a reporting one.

## The three questions people confuse

| Question | Operation |
|---|---|
| How many rows in this group | COUNT |
| How many different values appear | COUNT DISTINCT |
| What do these numbers add up to | SUM |

"How many customers do we have in London" is usually count distinct on customer ID, not count of rows, because one customer can have several orders. Getting this wrong inflates the figure by the number of repeat purchases, and the result looks entirely plausible.

## The rows that are not data

Spreadsheets accumulate things that look like data and are not.

> [!WARNING]
> A totals row at the bottom gets included in your aggregation, which doubles every figure. So does a repeated header in the middle of a file that was assembled by pasting several exports together.

Both are structural problems, and neither is visible once the data is grouped, because the result is simply larger than it should be.

The check that catches them: the sum of your group totals should equal the sum of the whole column. If it does not, something is being counted twice or not at all.

The same applies to duplicate rows. Whether a duplicate is a genuine repeat transaction or an import artefact is a judgement about the data, not something [deduplication](/tool/remove-duplicates) can decide for you, which is why the question of what counts as a duplicate has to be answered first.

## Combining files before summarising

Monthly exports are the usual case: twelve files with the same columns, and a question that spans the year.

[Merging CSV files](/tool/merge-csv) appends them into one, with two things to watch. The header row from files two onwards must not become data, and if the files do not carry a period column you should add one before merging, or every row becomes indistinguishable from every other month.

That second point is the one people discover after the merge, when they can no longer tell March from November.

## Averages hide things

A mean is one number standing in for a distribution, and it conceals whatever shape that distribution has.

The classic case is a support response time with a mean of four hours, where most tickets are answered in twenty minutes and a handful took three days. The mean describes neither group. The median, as covered in [mean, median and percentiles](/blog/mean-median-and-percentiles), describes the typical case, and a percentile describes the bad one.

Two habits that make a summary honest:

**Always show the count next to the average.** An average of 4.8 from six responses is not the same claim as 4.8 from six hundred, and presented without the count they look identical.

**Check the minimum and maximum.** A maximum that is impossible, like a 400% completion rate, tells you there is bad data upstream before anyone acts on the report.

## Doing it without a pivot table

A pivot table is a user interface over group-by plus aggregate. The same result comes from sorting by the grouping column and summing the runs, which is what a [CSV editor](/tool/csv-editor) with sorting makes straightforward for a one-off question.

For something you will run every month, the pivot is worth building. For a question you have once, sorting and summing is faster than configuring anything.

Either way the preparation is the same, and it is where the correctness lives:

1. [Clean](/tool/csv-cleaner) whitespace, casing and encoding.
2. Remove totals rows, repeated headers and blank rows.
3. Decide what a duplicate is, then [remove them](/tool/remove-duplicates).
4. [Merge](/tool/merge-csv) the periods you need, with a period column.
5. Group, and reconcile the total against the whole column.

Step five is the one that catches the mistakes in steps one to four, and it takes a few seconds.`,
  'validating-data-on-the-way-in': `A customer record has the email \`jane@exmaple.com\`. It passed validation, because it is a perfectly well-formed address. It is also undeliverable, and nothing about its shape says so.

That gap is the thing to understand about validation: it can reject what is definitely wrong and it cannot confirm what is right.

## Normalise first, then validate

Running validation on raw input produces false rejections, because most invalid-looking input is a formatting artefact rather than a wrong value.

\`\`\`
"  Jane@Example.COM  "   -> fails a strict pattern
"jane@example.com"       -> passes, and is the same address
\`\`\`

So trim whitespace, fold case where the field is case-insensitive, strip formatting characters from numbers, and normalise Unicode to NFC before any pattern runs. That last one matters because, as covered in [Unicode and mojibake](/blog/unicode-utf8-and-mojibake), the same visible character has more than one valid encoding and two of them will not compare equal.

The same order applies to a file arriving in bulk: [clean it](/tool/csv-cleaner) first, then check it, or you will be investigating problems that were only trailing spaces.

## Strict about format, permissive about content

Most validation bugs are rules that were written from one person's assumptions about their own data.

**Names.** No minimum length, because people are called Ng and O. No alphabet restriction. Apostrophes and hyphens are ordinary. There is no reliable split into first and last.

**Addresses.** Postcodes are not all numeric and not all the same length. Not every country has states. House numbers contain letters.

**Phone numbers.** Store the digits and the country code; display them formatted. A regex that assumes ten digits fails most of the world.

**Email.** The specification permits far more than anyone uses, and every attempt to match it exactly ends up accepting nonsense. A loose check for one \`@\` with something either side is the honest approach, which is the same conclusion reached in [regex without the mystique](/blog/regex-patterns-that-actually-come-up).

> [!NOTE]
> The only real validation of an email address is sending a message to it and having someone act on the link. Everything before that is a plausibility check. The same is true of a phone number and a postal address.

## Where to check

**At the form**, for the user's benefit. Fast, specific and next to the field. This is a convenience and nothing more, because anything running in a browser can be bypassed.

**At the server**, because this is the check that counts. Every field, every time, regardless of what the client already said.

**At the database**, as the last line: types, not-null constraints, uniqueness, foreign keys. These catch the path nobody thought about, which is usually a migration or an admin script rather than the application.

**At import**, for files. This is the one most often skipped, and a bulk import is exactly where a thousand bad rows enter at once.

## Building a pattern that works

Where a regex is the right tool, a [regex tester](/tool/regex-tester) with live highlighting beats reasoning about it, for two reasons.

The first is anchors. Without \`^\` and \`$\` a pattern matches anywhere in the string, so a check for a five-digit postcode will happily accept \`abc12345xyz\`. This is the most common validation bug there is.

The second is catastrophic backtracking. Nested quantifiers over overlapping alternatives can take exponential time on an input that nearly matches, which turns a validation rule into a denial of service. Test any pattern against a long string that almost matches, not just against valid and obviously invalid ones.

## Checking a file before you import it

For a CSV arriving from elsewhere, a few minutes of checking prevents a reconciliation later.

1. **Row count.** Does it match what the sender said?
2. **Column count per row.** A row with the wrong number of fields means a quoting problem, which is where [delimiters and quoting](/blog/csv-delimiters-quoting-and-encoding) go wrong.
3. **Distinct values in categorical columns.** Twelve statuses where you expected four means something upstream changed.
4. **Ranges on numbers and dates.** A date in 1900 or 2087 is a parsing failure.
5. **Identifier formats.** Leading zeros intact, no scientific notation, which is the damage described in [why CSVs break in Excel](/blog/why-csv-files-break-in-excel).
6. **Pull the emails out** with [extraction](/tool/extract-emails) and look at the domains. A cluster of typos in one domain usually means a form with no confirmation step.

A [CSV editor](/tool/csv-editor) is the fastest way to do most of this, because sorting a column immediately surfaces the extremes at both ends.

## Reject, warn, or accept

Not everything invalid should be rejected, and this is worth deciding deliberately.

**Reject** what makes the record meaningless: a missing required field, an unparseable date.

**Warn** on what is suspicious but possible: an unusual domain, an age of 105, an order value ten times the median.

**Accept** what is merely unusual. A name with three characters and no vowels is a name.

The cost of rejecting valid data is a customer who cannot complete a form and does not tell you. That failure is silent, which makes it easy to under-weight against the visible cost of a bad record.`,
  'merging-csv-files-that-do-not-line-up': `You have twelve monthly exports and you need one file. It looks like a job for concatenation, and for about eight of the twelve it is. The other four are why combined datasets quietly go wrong.

## Check the headers first

Before merging anything, list the header row of every file and compare the sets. Four situations, four different consequences:

**Identical headers, same order.** Safe. Stack the rows.

**Identical headers, different order.** Safe only if the merge is header-aware. A tool that concatenates lines positionally will put July's email addresses into the phone column, and nothing about the result looks wrong until someone reads a row.

**Extra columns in some files.** The merged file needs the union of columns, with blanks where a file did not have that field. What you must not do is drop the column, which is what "keep only common columns" silently does.

**Renamed columns.** \`customer_id\` in one export and \`CustomerID\` in the next produce two separate columns, each half empty. This one is easy to spot in the merged header and very hard to spot in a summary figure later.

> [!NOTE]
> A [CSV merger](/tool/merge-csv) that matches on header names rather than position handles the first three correctly. The renamed-column case cannot be solved automatically — only you know that those two names mean the same thing.

## Stacking is not joining

These get conflated and they are different shapes of operation.

**Stacking (union / append).** Files have the same kind of rows. January's orders plus February's orders. The result has the rows of both and the columns of the union.

**Joining (lookup).** Files have different kinds of rows related by a key. Orders plus a customer table, matched on customer ID. The result has the columns of both and — critically — a row count that depends on the matching.

A join against a key that is not unique multiplies rows. Two customer records with the same ID and 500 orders gives you 1,000 rows and every total doubles. Before joining, confirm the key is unique on at least one side; if it is not, deduplicate that side first.

## Add a source column

Before merging, add a column to each file holding its filename or period. It costs nothing and it is the difference between "the total is 4% too high" being a five-minute check and a two-hour one.

It also catches the most common merge error of all — including the same file twice, which is easy when the exports are named \`export.csv\`, \`export (1).csv\` and \`export (2).csv\`.

## Deduplicate deliberately

After merging, duplicates fall into three categories:

**Exact duplicates.** The same row twice, usually from merging a file twice. Safe to remove on whole-row equality.

**Key duplicates with identical data.** Same record exported in two overlapping periods. Remove on the key.

**Key duplicates with different data.** The record changed between exports. This is not a duplicate; it is two versions, and only you can decide whether you want the latest, the earliest, or both. Removing them automatically destroys information.

The trap is whitespace. \`"Acme Ltd "\` and \`"Acme Ltd"\` are different strings, so whole-row deduplication keeps both. [Trim and normalise](/tool/csv-cleaner) before [removing duplicates](/tool/remove-duplicates), in that order, or the deduplication will do almost nothing.

> [!WARNING]
> Watch encodings across files. If eleven exports are UTF-8 and one is Windows-1252, the merged file has two encodings in it and every accented name in that twelfth file is broken — often only visible in a handful of rows. Convert everything to UTF-8 before merging, not after.

## An order that works

1. Open each file and compare headers. Resolve renames by hand.
2. Normalise encoding to UTF-8 across all files.
3. Add a source column to each.
4. Stack header-aware, taking the union of columns.
5. Trim whitespace and normalise case in key fields.
6. Deduplicate on the real key, deciding explicitly what to do with changed records.
7. Check the row count against the sum of the inputs and account for any difference.

Step seven is the one that catches everything else. If 12 files totalling 48,210 rows produce 47,980, something dropped rows, and finding out what before you build a report on it is considerably cheaper than afterwards.

The [merge](/tool/merge-csv), [clean](/tool/csv-cleaner) and [deduplicate](/tool/remove-duplicates) tools here work on the files in the browser, which is the right property for exports that contain customer records.`,
};
