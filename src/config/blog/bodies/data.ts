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
