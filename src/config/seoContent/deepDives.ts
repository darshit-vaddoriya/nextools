import { ToolSeoContent } from './types';

type DeepDiveMap = Record<string, NonNullable<ToolSeoContent['deepDive']>>;

/**
 * Long-form sections for the tools with the least interface.
 *
 * A PDF merge page explains itself: there is a drop zone, a list of pages and a
 * button. A checksum tool is one input and one string of hex, and a page built
 * around it is mostly navigation unless something on it is worth reading. These
 * sections carry that part — the standard a conversion follows, the edge case
 * that produces a surprising answer, what a result actually proves — and they
 * are written per tool because a templated paragraph would defeat the purpose.
 */
export const TOOL_DEEP_DIVES: DeepDiveMap = {
  'ascii-converter': {
    heading: 'What ASCII actually is, and where it stops',
    paragraphs: [
      'ASCII is a 7-bit encoding standardised in 1963: 128 code points, of which the first 33 are control characters that were originally instructions to a teleprinter rather than anything printable. Code 7 rang a physical bell. Code 13 returned the carriage to the left margin and code 10 advanced the paper by one line, which is why Windows still ends a line with both and Unix with only the second. When you convert text here and see numbers below 32 appear, those are what you are looking at — not characters that failed to display, but instructions that were never meant to be shown.',
      'The printable range runs from 32 (space) to 126 (tilde), and the layout inside it is deliberate rather than arbitrary. Digits start at 48, so subtracting 48 from a digit\'s code gives its value — the trick every introductory parsing exercise relies on. Uppercase A is 65 and lowercase a is 97, exactly 32 apart, which means the difference between cases is a single bit. Flipping bit 5 changes case, and that is the actual mechanism behind the case-conversion routines in most low-level code.',
      'Everything above 127 is where ASCII ends and the trouble begins. For decades each vendor filled the upper 128 slots differently — Latin-1, Windows-1252, dozens of regional code pages — which is why a document written in one and read in another turns accented letters into garbage. Unicode resolved this by defining a single code point for every character, and UTF-8 encodes those code points so that the first 128 are byte-identical to ASCII. That backwards compatibility is the reason ASCII still matters: valid ASCII is valid UTF-8, and always will be. For anything outside the 128, use the Unicode converter, which reports code points rather than pretending a byte value is a character.',
    ],
  },

  'age-calculator': {
    heading: 'Why two correct age calculations can disagree',
    paragraphs: [
      'Age looks like subtraction and is not. The question "how many years old is someone born on 29 February 2000, on 28 February 2025" has no single right answer, and different legal systems genuinely disagree. Most jurisdictions treat the birthday as occurring on 28 February in common years, but some treat it as 1 March. This calculator uses calendar-month arithmetic — it advances the year, then checks whether the month and day have been reached — which matches the common convention and the one almost every form and database uses.',
      'The second source of disagreement is time zones. A birth at 23:30 on 5 June in Mumbai happened at 18:00 on 5 June in London but 13:00 on the same day in New York — and a birth at 00:30 crosses the date line entirely, so the recorded birth date depends on where it was recorded. This tool works in your device\'s local time zone with whole dates, which is the right behaviour for the question people actually ask. If you need an exact elapsed duration across zones rather than an age, the timestamp converter is the tool for that, because it deals in instants rather than calendar days.',
      'Duration in days is the one figure that is unambiguous, and it is often more useful than years and months. Notice periods, medical intervals and contractual deadlines are almost always specified in days precisely because months vary in length: "three months from 31 January" has no obvious meaning, while "ninety days" has exactly one. When a date calculation carries legal or financial weight, check which convention the other party is applying before you rely on any tool\'s answer, including this one.',
    ],
  },

  'roman-numerals': {
    heading: 'The rules this converter follows, and the ones it does not',
    paragraphs: [
      'Roman numerals have no zero, no negative numbers and no digit for anything above 1,000 in their standard form, which bounds this converter at 1 to 3,999. Beyond that, Roman practice used a vinculum — a bar over a numeral to multiply it by a thousand — but the notation was never consistent enough to be worth implementing, and a result nobody can reliably read back is not a result. MMMCMXCIX is the largest value expressible in the standard seven symbols, and that is where the tool stops.',
      'Subtractive notation is the part that trips people up. The rule is that only I, X and C may be subtracted, and only from the next two larger symbols: IV and IX are valid, IL and IC are not. Forty is XL, not XXXX; ninety is XC, not LXXXX. Roman inscriptions themselves were far less consistent than this — the Colosseum carries additive forms that a modern converter would reject — but the subtractive rules are what every modern usage, from copyright dates to book chapters, follows. This converter produces strictly canonical output, so each number has exactly one representation.',
      'Parsing in the other direction is more forgiving than generating, because real-world numerals are not always canonical. IIII appears on clock faces to this day, for reasons that are decorative rather than mathematical, and reading it as four is obviously correct even though the tool would never write it that way. Where a numeral is ambiguous or malformed the conversion reports the problem rather than guessing, since a silently wrong year on a document is worse than no answer at all.',
    ],
  },

  'unit-converter': {
    heading: 'Exact conversions, defined conversions, and the ones that are neither',
    paragraphs: [
      'Some conversions carry no error whatsoever because the relationship is a definition rather than a measurement. An inch has been exactly 25.4 millimetres since the international yard and pound agreement of 1959; a pound is exactly 0.45359237 kilograms by the same agreement. Those are not approximations that happen to be very good — they are exact by fiat, and any rounding you see is your own, not the conversion\'s. Temperature between Celsius and Fahrenheit is likewise exact, since both scales are now defined against the kelvin.',
      'Other conversions look identical in the interface and are not the same kind of thing. A nautical mile is exactly 1,852 metres by definition, but the survey foot used in older US land records differs from the international foot by two parts per million — invisible on a room measurement and significant across a county boundary. Fluid measures are worse: a US fluid ounce and an imperial fluid ounce differ by about four percent, and a US gallon and an imperial gallon by about twenty. A recipe or a fuel figure converted with the wrong one is wrong by an amount large enough to matter.',
      'Weight and mass are the distinction people most often collapse. A kilogram is a mass and a pound-force is a force, and converting between them silently assumes standard Earth gravity. For everyday use that assumption is fine and universal. For engineering work it is the assumption that has to be stated, because it is the one that stops being true the moment anything accelerates. Where this tool converts between units in different physical dimensions, it is applying a convention rather than a mathematical identity, and it is worth knowing which of the two you are relying on.',
    ],
  },

  'bmi-calculator': {
    heading: 'What BMI measures, and what it was never designed to measure',
    paragraphs: [
      'Body mass index is weight in kilograms divided by height in metres squared. It was devised in the 1830s by Adolphe Quetelet, a Belgian statistician studying the distribution of measurements across populations — not a physician, and not studying individuals. That origin explains both its usefulness and its limits: it is a good instrument for comparing groups and a blunt one for describing a person. The World Health Organization thresholds in wide use today (under 18.5, 18.5 to 24.9, 25 to 29.9, 30 and above) are population reference ranges, not individual diagnoses.',
      'The formula\'s central weakness is that it cannot distinguish what the mass is made of. Muscle is considerably denser than fat, so a trained athlete routinely lands in the "overweight" band while carrying very little body fat, and an inactive person of the same height and weight can sit in the same band for entirely different reasons. It also ignores where fat is distributed, which is the part with the clearest link to metabolic risk — waist circumference and waist-to-height ratio both track that better than BMI does.',
      'The thresholds are also not universal. Research on South Asian, Chinese and other populations has found elevated metabolic risk at lower BMI values than the WHO cut-offs imply, and several health authorities publish lower action points for those groups as a result. BMI remains widely used because it needs only a scale and a tape measure, which is genuinely valuable at population scale. Read the number here as one input among several, and take any question about your own health to someone who can measure more than two things.',
    ],
  },

  'percentage-calc': {
    heading: 'The three percentage questions, and why two of them get confused',
    paragraphs: [
      'Almost every percentage problem is one of three: what is X percent of Y, X is what percent of Y, and what is the percentage change from X to Y. The first two are straightforward. The third is where errors cluster, because percentage change is always relative to the starting value, and people routinely compute it against the wrong one. A rise from 40 to 50 is a 25 percent increase; a fall from 50 to 40 is a 20 percent decrease. Same ten units, different denominators, different answers — and neither is a rounding artefact.',
      'That asymmetry is why percentage changes do not cancel out. A 20 percent fall followed by a 20 percent rise does not return to the starting value: 100 becomes 80, and 80 plus 20 percent is 96. The gap widens as the percentages grow, which is the arithmetic behind why a portfolio that halves needs to double to recover rather than gaining another fifty percent. Any time two percentage changes are applied in sequence, they multiply rather than add.',
      'The last distinction worth holding onto is percent versus percentage point. If an interest rate moves from 4 percent to 5 percent, that is a one percentage point rise and a twenty-five percent increase, and both statements are true. Reporting mixes them constantly, usually in whichever direction makes the number sound larger. When a figure matters, check which of the two is being quoted before drawing a conclusion from its size.',
    ],
  },

  'emi-calculator': {
    heading: 'Where the EMI formula comes from, and what it leaves out',
    paragraphs: [
      'An equated monthly instalment is the fixed payment that reduces a loan to exactly zero over its term, given a constant interest rate. The formula — P × r × (1+r)^n ÷ ((1+r)^n − 1), where r is the monthly rate and n the number of months — comes from setting the present value of all future payments equal to the amount borrowed. Every instalment is the same size, but its composition is not: early payments are mostly interest and late payments are mostly principal, because interest is charged on the balance still outstanding.',
      'That composition is the practically important part. On a twenty-year home loan at a typical rate, roughly half of the total interest is paid in the first third of the term. It is also why prepayment early in a loan is worth so much more than the same amount later — it removes principal that would otherwise have accrued interest for the remaining years — and why refinancing late in a term often saves far less than the headline rate difference suggests.',
      'What the formula does not include is most of what a loan actually costs. Processing fees, insurance bundled into the disbursal, prepayment penalties and the difference between a fixed and a floating rate all sit outside it. A floating-rate loan\'s EMI is recalculated whenever the benchmark moves, or the term is extended instead — lenders differ on which, and the difference is substantial over twenty years. Treat the figure here as the arithmetic core of the payment, and read the sanction letter for the rest.',
    ],
  },

  'scientific-calc': {
    heading: 'Floating point, angle modes, and why a calculator can be "wrong"',
    paragraphs: [
      'This calculator works in IEEE 754 double precision, the same arithmetic every JavaScript engine and most programming languages use. It represents numbers in binary, and a great many decimal fractions have no exact binary representation — 0.1 is an infinitely repeating binary fraction in the same way that one third is an infinitely repeating decimal. That is why 0.1 plus 0.2 can display as 0.30000000000000004 in a raw calculation. It is not a bug in the calculator; it is the arithmetic that essentially all computers do, and results here are rounded for display so you rarely have to see it.',
      'Angle mode is the single most common source of a wrong trigonometric answer. sin(90) is 1 in degrees and about 0.894 in radians, and both are correct for their mode. Programming languages almost universally use radians, while physical calculators usually default to degrees, so a result copied from one context into another can be silently wrong. Check the mode before trusting any trigonometric output, especially when the answer is plausible rather than obviously absurd.',
      'The memory keys behave the way a physical calculator\'s do, and they are more useful than their obscurity suggests. M+ adds the displayed value to the stored one rather than replacing it, which makes running totals across a series of separate calculations straightforward — summing a column of products, for instance, without writing down intermediate results. MC clears the store, MR recalls it. Everything happens in this tab: nothing you calculate is sent anywhere, which matters more than it sounds when the figures are a salary model or a medical dose.',
    ],
  },

  'number-to-words': {
    heading: 'Two numbering systems, and why a cheque needs words at all',
    paragraphs: [
      'English has two incompatible ways of naming large numbers, and which one you want depends on where the document will be read. The international system groups digits in threes — thousand, million, billion, trillion — and 10,000,000 is ten million. The Indian system groups differently after the thousands, using lakh (100,000) and crore (10,000,000), and writes the same figure as 1,00,00,000, one crore. Indian banking, legal and government documents use the second throughout, so converting an amount for an Indian cheque with the international system produces a technically readable but conventionally wrong result.',
      'The reason amounts are written in words at all is that words are far harder to alter than digits. A figure can have a zero appended or a decimal point shifted with a pen stroke; "forty-two thousand five hundred only" cannot. This is why cheques, contracts and promissory notes carry both, and why the words legally prevail over the figures in most jurisdictions when the two disagree. The word "only" at the end is part of the same defence: it marks the end of the amount so nothing can be added after it.',
      'The details that make written amounts look right are conventions rather than rules, but they are consistent ones. Compound numbers from twenty-one to ninety-nine are hyphenated. "And" appears before the tens and units in British usage and is generally omitted in American. Currency subunits are usually written separately — "and fifty paise", "and twenty-five cents" — rather than as a decimal fraction of the main unit. This converter follows the common banking conventions for each system, which is the form a teller expects to see.',
    ],
  },

  'unicode-converter': {
    heading: 'Code points, bytes, and why one emoji can be several characters',
    paragraphs: [
      'A Unicode code point is a number assigned to a character — U+0041 is A, U+20B9 is the rupee sign, U+1F600 is a grinning face. An encoding is a separate question: it decides how that number becomes bytes. UTF-8 uses one byte for the ASCII range, two for most European and Middle Eastern scripts, three for most of Asia and four for emoji and historic scripts. So a string of ten characters can be ten bytes or forty depending entirely on what those characters are, which is why a database column sized in bytes and a form validated in characters disagree so reliably.',
      'The count gets stranger with emoji. Many are not one code point but several joined by a zero-width joiner, U+200D. A family emoji can be built from four person emoji plus three joiners — seven code points, rendered as one glyph, and counted as anything from one to eleven depending on what is doing the counting. Skin tone modifiers work the same way, appending a separate code point to a base character. This is why deleting an emoji sometimes takes several backspaces and why truncating a string by byte length can split a character in half and produce a replacement glyph.',
      'Two other categories are worth recognising when they appear in output. Combining characters modify the character before them, so an accented letter can exist either as a single precomposed code point or as a base letter plus a combining accent — visually identical, different data, and not equal in a string comparison unless both sides are normalised first. And the invisible characters — zero-width spaces, non-breaking spaces, directional marks — are the usual explanation for text that looks correct and refuses to match, sort or import. Converting to code points is the fastest way to see them, because nothing else makes them visible.',
    ],
  },

  'html-entity': {
    heading: 'Which characters have to be escaped, and which only sometimes',
    paragraphs: [
      'Only a handful of characters genuinely must be escaped in HTML, and knowing which ones turns a vague habit into a rule. In ordinary text content, the ampersand and the less-than sign are the two that change meaning — the first starts an entity, the second starts a tag. Inside an attribute value, whichever quote character delimits the value must also be escaped, because otherwise it ends the attribute early. The greater-than sign is conventionally escaped as well, though it is rarely required. Everything else is a display or transport concern, not a parsing one.',
      'That distinction matters because over-escaping causes its own bugs. Running an already-escaped string through an escaper again turns &amp; into &amp;amp;, which renders visibly as &amp; on the page — the double-encoding artefact that appears in page titles across the web. When output looks wrong in that specific way, the fix is upstream: find the second escape and remove it, rather than adding a decode to compensate.',
      'Escaping is also a security boundary, not just a rendering one. Cross-site scripting is precisely the failure of untrusted text reaching a page without being escaped for the context it lands in, and the context matters: escaping for HTML text does not make a string safe inside a script block, a URL attribute or a CSS value, each of which has its own rules. Use this tool to understand and inspect what an encoding does; in application code, use the framework\'s context-aware escaping rather than a manual pass, because the framework knows which context it is writing into and a manual pass does not.',
    ],
  },

  'binary-converter': {
    heading: 'Why base 2, base 8 and base 16 keep appearing together',
    paragraphs: [
      'Hexadecimal is ubiquitous in computing for one structural reason: 16 is 2 to the fourth power, so every hex digit maps to exactly four binary digits with no carrying between them. FF is 11111111 and always will be, regardless of what surrounds it. That clean alignment is why a byte is written as two hex digits, why colours are #RRGGBB, and why memory addresses and hashes are printed in hex rather than decimal — the conversion is mechanical and the grouping matches the hardware. Octal has the same property with three bits per digit, which is why Unix file permissions are written as 755 rather than 493.',
      'Decimal has no such alignment, which is exactly why converting to it is useful for reasoning and useless for inspection. 255 tells you the value; FF tells you that every bit is set. When debugging a bitmask, a flags field or a protocol header, hex or binary shows the structure and decimal hides it. That is the practical rule for choosing a base: decimal for quantities a person will compare, hex or binary for values whose individual bits carry meaning.',
      'Two details cause most conversion confusion. Signed numbers are stored in two\'s complement, so the same 32 bits read as unsigned are 4,294,967,295 and read as signed are −1; a converter has to be told which interpretation you mean, and mismatched assumptions are the usual source of a wildly wrong result. And byte order — whether the least significant byte comes first — changes how a multi-byte value reads when it is copied out of a file or a packet. Converting the bytes correctly and assembling them in the wrong order produces a number that is valid, plausible and wrong.',
    ],
  },

  'timestamp-converter': {
    heading: 'What a Unix timestamp counts, and what it deliberately ignores',
    paragraphs: [
      'A Unix timestamp is the number of seconds since 00:00:00 UTC on 1 January 1970. It carries no time zone, because it is not a time of day — it is an instant, and the same instant has a different local time everywhere. That property is exactly why timestamps are the right thing to store: converting an instant to a local time is always possible, while recovering an instant from a local time requires knowing the zone and the daylight-saving rules that applied on that date, which is information most systems throw away.',
      'The count deliberately ignores leap seconds. Since 1972, twenty-seven leap seconds have been inserted into UTC to keep clock time aligned with the Earth\'s rotation, and Unix time skips them — a day is always exactly 86,400 seconds in this representation. This keeps arithmetic simple at the cost of a small, accumulating divergence from true elapsed time. For everything short of satellite navigation and high-frequency trading, that trade is the right one and the divergence never matters.',
      'The two practical traps are magnitude and range. Unix time is defined in seconds, while JavaScript, Java and several databases work in milliseconds — feeding one into something expecting the other lands you in 1970 or in the year 56000, which is at least an obvious failure. Less obvious is the 2038 problem: a signed 32-bit timestamp overflows on 19 January 2038, and any system still storing one will wrap to 1901. Modern platforms use 64-bit values and are fine, but embedded devices, old file formats and legacy database columns are where the remaining exposure sits.',
    ],
  },

  'file-checksum': {
    heading: 'What a matching hash proves, and what it does not',
    paragraphs: [
      'A cryptographic hash reduces a file of any size to a fixed-length fingerprint, and changing a single bit anywhere in the file changes roughly half the output bits. That is what makes comparison useful: if the hash you compute matches the one the publisher listed, the bytes you hold are the bytes they hashed. A truncated download, a corrupted transfer or a silently failing disk all change the hash, and all become immediately visible.',
      'What a match does not establish is who produced the file. If an attacker controls the page serving both the download and the published hash, they can replace both and the check passes perfectly. The checksum proves integrity — the file was not damaged in transit — and says nothing about authenticity. Answering "did the right party publish this" requires a cryptographic signature verified against a key you obtained independently, which is why distributions publish signed hash files rather than bare hashes on a web page.',
      'Choice of algorithm follows from that distinction. MD5 and SHA-1 remain perfectly good at detecting accidental corruption and are fast, but both have practical collision attacks: an adversary can construct two different files with the same hash, so neither should be relied on where someone might deliberately try. SHA-256 is the correct default and the one publishers overwhelmingly list. Hashing here happens through the browser\'s own Web Crypto implementation, reading the file from your disk — the file is never uploaded, which is the whole reason it is reasonable to check a confidential archive this way.',
    ],
  },

  'password-generator': {
    heading: 'Where the randomness comes from, and what length buys you',
    paragraphs: [
      'This generator draws from the Web Crypto API, which is backed by the operating system\'s cryptographically secure random source — the same one used to generate TLS session keys. That distinction matters more than any option in the interface. The obvious alternative, Math.random, is a fast pseudo-random generator designed for simulations and shuffling; its output is predictable from a small amount of observed data, and a password generated with it is not a secret. You can verify the character of this tool directly: generate a password with the network disconnected, and it still works, because nothing is fetched and nothing is sent.',
      'Strength is measured in entropy, which is length multiplied by the bits contributed per character. A character drawn from a 95-symbol keyboard set carries about 6.6 bits, so a 12-character password holds roughly 79 bits and a 16-character one roughly 105. Each additional character multiplies the search space; substituting "@" for "a" in a dictionary word adds almost nothing, because every cracking tool has tried that substitution since the 1990s. Length is the lever that actually moves the number.',
      'Composition rules — one uppercase, one digit, one symbol — were written for humans choosing their own passwords, and they make a random password marginally weaker by constraining the space it is drawn from. The effect is small enough to ignore, and the rules are usually mandatory anyway, which is why the option exists here. The genuine risk with a strong random password is not that it will be guessed but that it will be reused or written somewhere insecure. Generate a different one per account and keep them in a password manager; that combination, rather than any particular character set, is what stops one breach from becoming several.',
    ],
  },

  'passphrase-gen': {
    heading: 'Why a sequence of ordinary words can be stronger than a dense one',
    paragraphs: [
      'A passphrase built from randomly chosen words gets its strength from the size of the word list and the number of words drawn, not from looking complicated. Selecting from a 7,776-word list — the standard Diceware size — contributes about 12.9 bits per word, so a six-word passphrase carries roughly 77 bits of entropy. That is comparable to a twelve-character random string from a full keyboard set, and vastly easier to type on a phone, read aloud over a phone call, or remember well enough to survive a password manager being unavailable.',
      'The critical condition is that the words must be chosen randomly by the generator, not by you. Human-chosen word sequences cluster hard around phrases, song lyrics and semantically related groups, and attack tools model that clustering directly. "correct horse battery staple" is strong as a randomly generated example and worthless as a password, because it has been published millions of times. The entropy figure only holds if each word was drawn independently from the full list.',
      'Length requirements shape the trade-off. Where a system accepts long inputs, a passphrase is the better choice for anything you must type by hand — a disk encryption key, a password manager\'s own master password, a machine you log into before a manager is available. Where a system caps length at ten or twelve characters, a passphrase cannot reach useful entropy and a dense random string is the right tool. Check the field\'s limit before deciding which to generate.',
    ],
  },

  'password-strength': {
    heading: 'What this estimate measures, and why it disagrees with website meters',
    paragraphs: [
      'Strength here is estimated as entropy: how large a space an attacker would have to search, expressed in bits. Each additional bit doubles that space. The estimate accounts for length, the variety of character classes present, and detectable patterns — dictionary words, keyboard runs, repeated characters, dates, and the common substitutions that replace letters with lookalike symbols. A password that scores poorly despite containing every character class is usually one where those patterns collapse most of the apparent search space.',
      'This is why the result often disagrees with the meter on a signup form. Most of those meters score composition rules: one uppercase, one digit, one symbol, minimum eight characters, green tick. "P@ssw0rd1" satisfies every one of them and is among the first few thousand candidates any cracking tool tries. Meanwhile a long string of ordinary lowercase words fails every rule and would take an infeasible amount of computation to guess. The rules were written to stop people choosing "password", and they succeeded at exactly that and nothing more.',
      'An entropy figure is still an upper bound on difficulty, not a guarantee. It assumes the attacker has no information you have not accounted for, and it cannot know that your strong, unique password was reused on a site that was breached last year — at which point its entropy is irrelevant, because it is on a list. The practical implications are that reuse defeats any amount of strength, that a password manager solves the reuse problem, and that multi-factor authentication protects the accounts where all of this fails anyway. Nothing you type here is transmitted; the analysis runs in this tab.',
    ],
  },

  'random-string': {
    heading: 'Random for convenience and random for secrets are different requirements',
    paragraphs: [
      'The first question to settle about any generated string is whether it needs to be unpredictable or merely unlikely to collide. A test fixture, a placeholder filename or a sample identifier only needs to be different from its neighbours. A session token, a password reset link or an API key must be unguessable by someone who has already seen a thousand previous outputs. Those are different requirements, and the difference is the random source rather than the length or the alphabet.',
      'This tool uses the browser\'s cryptographically secure source, so its output is suitable for the second case as well as the first. That is a deliberate choice: it costs nothing here, and a generator that quietly used a weak source would be dangerous precisely because its output looks identical. Predictability is not visible by inspection, which is why the source matters more than anything you can observe about the result.',
      'Alphabet and length together determine both collision resistance and unguessability. A 32-character string from a 62-symbol alphanumeric set carries around 190 bits, far beyond what any brute-force search reaches. Excluding visually ambiguous characters — 0 and O, 1 and l and I — costs a fraction of a bit per character and is worth it for anything a person will read off a screen or dictate. Where the string will end up in a URL, restrict the alphabet to characters that need no percent-encoding, or the value that arrives will not be the value that was generated.',
    ],
  },

  'secure-notes': {
    heading: 'What "encrypted in the browser" means here, precisely',
    paragraphs: [
      'Encryption in this tool uses AES-GCM through the Web Crypto API, with a key derived from your passphrase by PBKDF2. Both are standard, well-reviewed primitives implemented by the browser itself rather than by hand-written JavaScript. The key derivation step exists because a passphrase is not a key: PBKDF2 stretches it through many iterations so that guessing candidates is deliberately slow, which is what makes a short passphrase less catastrophic than it would otherwise be.',
      'AES-GCM is an authenticated mode, and that property is worth understanding rather than taking on trust. It does not merely hide the content; it detects modification. Altering a single byte of the ciphertext causes decryption to fail outright rather than producing plausible-looking wrong plaintext. Without authentication, an attacker who cannot read a message can still sometimes change it in predictable ways, which is why modern designs treat confidentiality and integrity as one requirement rather than two.',
      'The limits are the part to be clear about. Everything happens in this tab, so nothing is recoverable if you lose the passphrase — there is no reset, because there is no server holding anything to reset. Content is only as safe as the device it is decrypted on: a compromised machine sees the plaintext at the moment you view it, and no browser-side encryption changes that. This is a good tool for protecting a note in transit or at rest on shared storage. It is not a replacement for a password manager, which additionally handles synchronisation, autofill and recovery.',
    ],
  },

  'url-parser': {
    heading: 'The parts of a URL, and which ones the server never sees',
    paragraphs: [
      'A URL decomposes into scheme, optional credentials, host, optional port, path, query and fragment, and each part has its own escaping rules. The single most common encoding bug follows from ignoring that: encoding an entire URL rather than one component escapes the separators that give it structure, turning a working address into one opaque string. Encode the component, then assemble — never the reverse.',
      'The fragment — everything after the hash — is the part that never reaches the server. It is stripped by the browser before the request is sent, which is why single-page applications historically used it for routing and why putting anything sensitive there is both safer and less useful than it looks: server logs will not have it, but browser history and any JavaScript on the page will. Query parameters, by contrast, travel in the request line and appear in access logs, proxy logs and referrer headers, which is why access tokens do not belong in them.',
      'Two structural details cause disproportionate trouble. Query strings have no specification for repeated keys, so whether ?a=1&a=2 yields the first value, the last, or an array depends entirely on the framework parsing it — and two services in the same system can disagree. And a plus sign means a space in form-encoded data but is a literal plus in a path segment, so the same character decodes differently depending on where it sits. Parsing a URL into its parts, rather than reading it as a string, is what makes both of these visible before they become bugs.',
    ],
  },

  'mime-checker': {
    heading: 'Declared type, actual bytes, and why browsers stopped guessing',
    paragraphs: [
      'A MIME type is a claim a server makes in the Content-Type header about what it is sending. Nothing enforces that the claim matches the bytes. A file with a .png extension can contain a ZIP archive, and a server will cheerfully label it image/png because it looked at the name. Checking the actual signature — the magic bytes at the start of the file, 89 50 4E 47 for PNG, 25 50 44 46 for PDF, 50 4B 03 04 for ZIP and every format built on it — is what tells you what you really have.',
      'Browsers used to resolve mismatches by sniffing the content and acting on what they found. That behaviour became a security problem: a file uploaded as a harmless image and sniffed as HTML would execute as HTML, which is a direct path to cross-site scripting on any site accepting uploads. The X-Content-Type-Options: nosniff header exists to switch sniffing off, and modern browsers increasingly refuse to guess at all. The practical consequence is that a wrong Content-Type no longer degrades gracefully — it fails, and the failure is usually a blank page or a download prompt where content was expected.',
      'This is also why extension-based validation is not validation. Anything accepting uploads should check the signature rather than the filename, and should serve user-supplied files from a separate origin with an explicit, restrictive Content-Type. Note that signature checking identifies a container, not its contents: .docx, .xlsx, .jar and .apk all begin with the ZIP signature, because all of them are ZIP archives with particular structures inside.',
    ],
  },

  'user-agent-parser': {
    heading: 'Why every browser claims to be several others',
    paragraphs: [
      'A modern user agent string is a fossil record of compatibility workarounds. Chrome on Windows identifies itself as Mozilla, then as AppleWebKit, then as KHTML "like Gecko", then as Chrome, then as Safari. Each of those was added so that servers sniffing for a competitor would serve the good version of a page. Netscape used "Mozilla"; Internet Explorer claimed to be Mozilla to receive frames-capable pages; Safari claimed WebKit lineage; Chrome claimed Safari. None of it can be removed now, because somewhere a server still checks for each token.',
      'That history is why parsing a user agent string is guesswork rather than lookup, and why the results should be treated as a hint. The string is set by the client and can be anything at all — privacy tools rotate it, bots imitate browsers, and enterprise software appends its own tokens. It is fine for analytics aggregates and for logging. It is not fine as a security control or as the basis for serving different functionality, because anything relying on it can be trivially told whatever it wants to hear.',
      'The direction of travel is toward less information, not more. Browsers have been freezing and reducing user agent strings for years, and Chrome\'s Client Hints replace the guessing game with an explicit request: the server asks for the specific facts it needs and the browser decides what to reveal. For feature decisions, the correct approach has always been to test for the capability rather than infer it from an identity — the string tells you what a client claims to be, and feature detection tells you what it can actually do.',
    ],
  },

  'css-formatter': {
    heading: 'What formatting can safely change, and what it must not',
    paragraphs: [
      'Formatting CSS is a whitespace transformation, with one important exception: order within a rule is meaningful. Later declarations override earlier ones of the same property, so a formatter that sorted properties alphabetically would silently change which value wins. This tool reorders nothing. It normalises indentation, spacing around braces and colons, and line breaks between rules — the things that make a stylesheet readable without altering what the browser computes.',
      'Minification is the same transformation aimed the other way: strip every byte that does not change behaviour. Whitespace between tokens goes, the last semicolon in a block goes, comments go. What must survive is anything inside a string or a url() — whitespace there is data, not formatting — and any comment marked as legally required. Over-aggressive minification that ignores those cases produces a stylesheet that is smaller and broken, usually in a way that only shows up on one page.',
      'Because formatting requires parsing, the formatter doubles as a syntax check. A missing closing brace, an unterminated string or a stray character typically produces output that stops or goes visibly wrong at the point of the problem, which is often faster than hunting for it by eye. What it cannot tell you is whether a property name is real or a value is valid for it — `colour: red` is syntactically perfect CSS and does nothing at all. For that, a linter such as stylelint is the right tool; this one answers the structural question.',
    ],
  },

  'xml-formatter': {
    heading: 'Where XML whitespace is decoration and where it is content',
    paragraphs: [
      'Reformatting XML is not always safe, and the reason is that XML has no general rule about whitespace being insignificant. In mixed content — an element containing both text and child elements — the spaces between them are part of the document, and adding indentation changes the data. Whether whitespace matters is decided by the schema, not by the parser, which is why an XML formatter should be applied to configuration and data documents and treated carefully around anything document-oriented, such as XHTML fragments or DocBook.',
      'The xml:space="preserve" attribute exists to mark the regions where this matters explicitly, and content inside a CDATA section is likewise off-limits — it is verbatim by definition. A formatter that ignores either will produce a well-formed document that means something different from the one it was given. That failure is quiet, which is what makes it worth knowing about before reformatting a file you did not write.',
      'Formatting also serves as a well-formedness check, and the distinction between well-formed and valid is worth keeping. Well-formed means the syntax parses: every tag closed, attributes quoted, one root element, entities properly escaped. Valid means it also conforms to a schema — the right elements in the right order with the right types. A formatter answers the first question and reports precisely where parsing failed. Only a schema validator answers the second, and a document can be flawlessly well-formed and completely wrong for its purpose.',
    ],
  },

  'sort-lines': {
    heading: 'Why sorted output sometimes looks unsorted',
    paragraphs: [
      'The most common surprise is that "10" sorts before "9". Plain sorting compares text character by character, and the character "1" precedes "9", so every string beginning with 1 comes before every string beginning with 9 regardless of numeric value. Natural sorting — which detects digit runs and compares them as numbers — is what produces the order people expect for version strings, filenames and anything with an embedded index. Neither is wrong; they answer different questions, and mixing them up is why file listings sometimes look scrambled.',
      'Case is the second surprise. In a plain byte or code-unit comparison, all uppercase letters sort before all lowercase ones, so "Zebra" comes before "apple". Case-insensitive sorting fixes the appearance, but it also means two entries differing only in case compare as equal, and which one ends up first then depends on whether the sort is stable. A stable sort preserves the original relative order of equal elements, which is what makes it safe to sort by one field and then another to get a compound ordering.',
      'Locale is the third, and it matters more than its obscurity suggests. Accented characters, the Turkish dotless i, and the treatment of digraphs all vary by language, and a "correct" alphabetical order genuinely differs between them. Before sorting a list of names or terms that will be read by people, decide which locale\'s rules apply. And whatever the settings, trim trailing whitespace first — an invisible trailing space changes a comparison, which is the usual explanation for two apparently identical lines refusing to group together.',
    ],
  },

  'remove-empty-lines': {
    heading: 'Blank is not the same as empty',
    paragraphs: [
      'A line that looks empty and a line that is empty are frequently different things. A truly empty line has zero characters before its terminator. A blank line may contain spaces, tabs, a non-breaking space pasted from a web page, or a zero-width character that no editor will show you. Removing "empty" lines with a naive match leaves the blank ones behind, which is why text that has clearly been cleaned still imports with gaps. Trimming whitespace before testing is what makes the operation do what was intended.',
      'Line endings are the second complication. Windows terminates lines with a carriage return and a line feed, Unix with a line feed alone, and a file that has passed through both conventions contains a mixture. A stray carriage return left at the end of a line is invisible in most editors and is a real character to every program that reads the file — the usual cause of a configuration value that is correct on screen and rejected by the parser, or a CSV column whose last field never matches. Normalising line endings and removing blank lines belong to the same cleanup pass.',
      'Whether to remove every blank line or collapse runs into one depends on what the text is for. Prose and Markdown need a single blank line between paragraphs to keep their structure, so collapsing runs is right and stripping all of them destroys the formatting. A data list or an import file usually wants no blank lines at all. Decide which of the two the text is before running anything, and keep the original until the result is checked — blank lines are trivial to remove and tedious to put back in the right places.',
    ],
  },

  'image-flip': {
    heading: 'Mirroring, rotation, and the metadata that undoes both',
    paragraphs: [
      'Flipping and rotating are different operations that are easy to conflate. A horizontal flip mirrors the image across a vertical axis, so text reads backwards and a face changes which way it looks. A 180-degree rotation turns the image upside down. On a symmetrical subject the two can look similar, but they are not interchangeable: a flip is a reflection and cannot be produced by any rotation, which is why a flipped photograph of anything with writing in it is immediately, unmistakably wrong.',
      'The operation itself is lossless at the pixel level — every pixel is preserved and moved — but the file it is saved into may not be. Re-encoding a JPEG applies its lossy compression a second time, so a flip, save, flip back and save again leaves the image slightly degraded even though it is visually identical to where it started. Saving to PNG or WebP lossless avoids that entirely, at the cost of a larger file for photographic content.',
      'The detail that catches people is EXIF orientation. Cameras and phones usually record the sensor image in one fixed orientation and store a tag saying how to rotate it for display. Viewers that honour the tag show the photo correctly; viewers that ignore it show it sideways — which is why the same file looks right in one application and wrong in another. Flipping through the canvas here resolves the tag into the actual pixels and drops it, so the result is oriented identically everywhere. That also removes the rest of the EXIF block, including any GPS coordinates the photo carried.',
    ],
  },

  'zip-creator': {
    heading: 'What ZIP does well, and what it was never built for',
    paragraphs: [
      'A ZIP archive compresses each entry independently and records them all in a directory written at the end of the file. That structure is why a single file can be extracted without decompressing everything before it, and why a ZIP can be built incrementally. The trade-off is that per-file compression cannot exploit similarity between files: a hundred near-identical documents compress no better together in a ZIP than separately, whereas a solid archive format such as tar.xz compresses the concatenated stream and does dramatically better on exactly that case.',
      'Compression only helps where there is redundancy left to remove. JPEG, PNG, MP4, MP3 and PDF are already compressed, and zipping them yields a file within a percent or two of the original size — occasionally slightly larger, once the archive overhead is counted. Text, CSV, JSON, XML, source code and uncompressed bitmaps compress enormously, often to a fifth of their size or less. If the goal is a smaller download, the composition of the input decides whether ZIP can help at all; if the goal is bundling many files into one, it helps regardless.',
      'ZIP provides no meaningful confidentiality and should not be used for it. Entry names, sizes and timestamps sit in the directory in plain text even when the contents are encrypted, so the archive reveals its own structure to anyone holding it. The original ZipCrypto encryption is broken well enough to be treated as absent. If contents need protecting, encrypt them before archiving with a tool built for it. Archives are created here in your browser, so the files being bundled are never uploaded — which is the property worth having when they are documents you were sent rather than ones you published.',
    ],
  },

  'docx-to-txt': {
    heading: 'What is lost when a document becomes plain text, and why that is often the point',
    paragraphs: [
      'Extracting text from a .docx discards everything that made it a document: fonts, sizes, colours, alignment, page geometry, headers, footers and images. What survives is the character content of the body in reading order, with paragraph breaks preserved. For a large class of tasks that is precisely what you want — a word count that is not confused by hidden formatting, content for a system that accepts only text, a diff that reports what changed rather than how it was styled.',
      'Tables are the case where the loss is real rather than incidental. A table is a two-dimensional structure and plain text is one-dimensional, so cell contents are flattened into lines and the relationship between columns is gone. If the table matters, convert to Markdown or HTML instead: both can represent rows and cells, and both are still readable as text. The same applies to nested lists, where indentation carried meaning that a flat extraction does not preserve.',
      'Two details are worth knowing before relying on the output. Tracked changes are read as their accepted state — you get the text as it would appear if every revision were accepted, not the revision marks. And Word\'s smart punctuation comes through as it was stored: curly quotes, en and em dashes, ellipsis characters and non-breaking spaces are all real Unicode characters, not ASCII lookalikes, and they are the usual reason text extracted from Word breaks a downstream parser. The Remove Formatting tool converts them to ASCII equivalents when that matters.',
    ],
  },

  'docx-to-markdown': {
    heading: 'How Word structure maps onto Markdown, and where the mapping runs out',
    paragraphs: [
      'The conversion works from Word\'s semantic styles, not from appearance. A paragraph styled "Heading 2" becomes a level-two heading; a paragraph that merely looks like a heading because someone made it large and bold becomes an ordinary paragraph with bold text. That distinction decides the quality of the output entirely, and it is worth checking in the source document before converting: applying real heading styles in Word takes a moment and produces a clean document structure rather than a flat wall of emphasised text.',
      'Most inline formatting maps cleanly. Bold, italic, inline code, hyperlinks, bulleted and numbered lists and blockquotes all have direct Markdown equivalents and survive the conversion intact. Simple tables convert to Markdown table syntax. What has no equivalent is anything positional or decorative — text colour, font choice, alignment, page breaks, columns, text boxes and footnotes. Markdown deliberately has no way to express those, which is the reason to use it and the reason some things do not arrive.',
      'Two areas reliably need a manual pass. Merged table cells cannot be represented in Markdown table syntax at all, so a table using them will need restructuring or converting to HTML. And images are extracted as references rather than embedded, since Markdown links to image files rather than carrying them — so the files have to be saved alongside the document and the paths corrected. If the destination is GitHub, a static site generator or an app like Obsidian, running the output through a Markdown linter afterwards will catch the remaining flavour differences quickly.',
    ],
  },
  'rar-to-zip': {
    heading: 'Why a RAR has to be unpacked before it can become a ZIP',
    paragraphs: [
      'RAR and ZIP both bundle files and compress them, but they do it with different algorithms and different on-disk layouts, so there is no way to rename or re-label one as the other. Conversion is two separate steps: every file is extracted from the RAR, then the extracted files are packed into a new ZIP. The files themselves come out byte-for-byte identical to what went into the RAR; only the wrapper around them changes. The folder structure and file names are carried across as they were.',
      'Reading happens with libarchive, the open-source library behind the bsdtar command and the archive handling in macOS, compiled to WebAssembly so it runs in the page. Writing the ZIP uses the standard Deflate method at a middle compression level, which every operating system can open without extra software. That is the whole reason to convert: Windows, macOS, Android and iOS all open ZIP natively, while RAR still needs a separate app on most of them.',
      'The ZIP usually ends up a little larger than the RAR it came from. RAR can compress a whole archive as one continuous stream, which finds repetition across files, while ZIP compresses each file on its own. For photos, videos and PDFs, which are already compressed, the difference is small. For folders of text or source code it can be noticeable, and that is the trade for a format anyone can open.',
    ],
  },

  'images-to-pptx': {
    heading: 'How the photos are placed on each slide',
    paragraphs: [
      'Every image becomes its own slide, in the order you added them, and is scaled to fit inside the slide without cropping or stretching. A photo whose shape differs from the slide gets white or black bars at the sides or top, whichever background you picked, rather than losing its edges. That is the same "contain" rule a photo viewer uses, and it is the safe default for slides, because a cropped face or a cut-off chart label is a worse outcome than a margin.',
      'The slide shape is the main decision. 16:9 matches modern projectors, laptops and video calls. 4:3 matches older projectors and printed handouts. "Match" sizes the deck to the first image, which suits a set of photos that all share one shape, such as screenshots from the same device, where any fixed slide shape would add bars to every one.',
      'JPG and PNG images are placed in the deck exactly as they are, with no re-compression. Other formats are converted first, because PowerPoint cannot display them: GIF, SVG and PSD files become PNG, and everything else, including iPhone HEIC photos and WebP, becomes a high-quality JPG. The deck opens in PowerPoint, Keynote, Google Slides and LibreOffice, and each picture remains a normal image object you can move, crop or replace.',
    ],
  },

  'csv-editor': {
    heading: 'What happens to your data between opening and exporting',
    paragraphs: [
      'A CSV file has no types, no formatting and no formulas, only text split into cells. This editor shows it exactly that way: every cell is plain text, and nothing is converted to a number or a date behind your back. That matters more than it sounds. A spreadsheet application opening the same file might strip the leading zeros from a postcode or turn "3-4" into a date. Here, what you see in a cell is the exact text that will be written back.',
      'The delimiter setting controls both how the file is read and how it is written. Comma is the default. Semicolon is what Excel produces in most of Europe, where the comma is the decimal mark. Choose the one your file uses before editing, or every row will appear as one long cell. On export, any value that contains the delimiter, a quote or a line break is wrapped in quotes and inner quotes are doubled, following the RFC 4180 convention, so the file reads back correctly in any tool.',
      'Everything is held in this browser tab while you work. There is no automatic save, so export before closing the page. For files with many thousands of rows, a spreadsheet application or the CSV viewer is more comfortable. This editor suits the common job of opening a file, fixing some cells, adding or removing a column, and saving a clean copy.',
    ],
  },

  'excel-to-pdf': {
    heading: 'How a spreadsheet is laid out as pages',
    paragraphs: [
      'A worksheet has no pages; it is a grid that runs as far right and as far down as the data goes. Turning it into a PDF means deciding where the page breaks fall, and this converter does that automatically. Each column is sized by its content, the header row is repeated at the top of every page so a long table stays readable, and a sheet with more than six columns is printed in landscape to give it room.',
      'What reaches the PDF is the value in each cell, not its formatting. A formula shows the result Excel last calculated and saved in the file, so if a workbook was never recalculated after its inputs changed, the PDF shows the stale result, exactly as Excel would until you pressed recalculate. Dates stored as Excel serial numbers are recognised from their number format and printed as dates rather than as five-digit numbers.',
      'The PDF uses the standard Helvetica font, which covers English and most Western European languages. Characters outside that set, such as Hindi, Arabic or Chinese text, are printed as a question mark, and the converter says so rather than failing silently. For a workbook in those scripts, printing to PDF from Excel, LibreOffice or Google Sheets, which have the right fonts installed, gives a better result.',
    ],
  },

  'mov-to-mp4': {
    heading: 'Container versus codec: why most MOV files convert in seconds',
    paragraphs: [
      'MOV and MP4 are both containers, boxes that hold a video stream, an audio stream and some timing information. The streams inside are what actually determine quality, and an iPhone or QuickTime MOV very often already contains H.264 video and AAC audio, which MP4 supports directly. When that is the case, the converter copies the streams into an MP4 box without decoding or re-encoding a single frame. The result is identical in quality, and the conversion takes about as long as copying the file.',
      'Newer iPhones record in HEVC, also called H.265, by default. MP4 can hold HEVC too, but not every browser can decode it: Safari usually can, while Chrome on Windows often needs hardware support to do so. If the browser cannot read the video stream, the conversion stops with a message saying so, rather than producing a broken file.',
      'Re-encoding only happens when you ask for it, by choosing a lower resolution or quality. It then uses the video encoder built into your browser, which is usually hardware accelerated, so a minute of 1080p video takes seconds rather than minutes. The clip stays on your device throughout, which matters for family videos and for recordings of work meetings alike.',
    ],
  },

  'video-compressor': {
    heading: 'The two settings that decide the file size',
    paragraphs: [
      'A video file\'s size is roughly its bit rate multiplied by its length, so there are only two ways to make it smaller without cutting it: spend fewer bits per second, or give those bits fewer pixels to describe. The compressor exposes both. Resolution scales the picture down, never up, to 1080p, 720p, 480p or 360p. The quality setting tells the encoder how much detail to keep in each frame. It starts at 720p and medium quality, because that combination reliably shrinks a phone recording while keeping it comfortable to watch on a phone or laptop.',
      'Resolution usually gives the biggest saving with the least visible cost. Halving the width and height leaves a quarter of the pixels, and on a phone screen or in a chat window 720p is hard to tell apart from 1080p. Lowering quality at full resolution instead tends to show as blockiness on movement and smearing in dark areas, which people notice sooner than softness.',
      'The encoding runs on your device with the browser\'s own encoder, which is usually hardware accelerated. The compressor cannot aim at an exact target size such as 25 MB, because the final size depends on how much motion the clip contains. A talking-head recording compresses far more than a football match at the same settings. If the first attempt is still too large, step the resolution down once more before lowering the quality.',
    ],
  },

  'pdf-to-pptx': {
    heading: 'Why each slide is a picture of the page',
    paragraphs: [
      'A PDF records where marks go on a page, not which of them form a title, a bullet list or a chart. PowerPoint needs exactly that structure to make text editable. Rebuilding it from a PDF means guessing, and the guesses go wrong in ways that are worse than useless: text boxes that overlap, fonts substituted, lines broken in the middle of sentences. So this converter makes the other choice. Each page is rendered as a sharp image, about 1600 pixels wide at typical page sizes, and placed on its own slide, so every slide looks exactly like the page it came from.',
      'The text is not lost. For each page that contains real text, the text is also copied into that slide\'s speaker notes. You can present from the images, read from the notes, and copy any sentence you need into a new text box. A scanned PDF has no text layer, so its slides have no notes until the PDF has been through OCR first.',
      'Slides take the shape of the page itself, so an A4 portrait document produces tall slides and a landscape deck exported to PDF produces widescreen ones, with nothing cropped or letterboxed. This is the conversion you want when the goal is to present a PDF inside PowerPoint or Google Slides, or to add your own slides around it. If you need to edit the original content, go back to the file the PDF was made from.',
    ],
  },

  'epub-to-pdf': {
    heading: 'Reflowable text becomes fixed pages',
    paragraphs: [
      'An EPUB does not have pages. It is a ZIP of XHTML chapters that an e-reader reflows to fit whatever screen and font size you choose, which is why the same book shows a different page count on a phone and on a tablet. A PDF is the opposite: every line sits at a fixed position on a fixed page. Converting means choosing a page size and laying the text out once. This converter uses 6 × 9 inches, a common paperback trim size, with the book\'s title and author on the first page and each chapter following in reading order.',
      'Structure is carried across: headings, paragraphs, bold and italic. Visual styling from the e-book\'s own stylesheet is not, because it was written for reflowing screens rather than fixed pages. The result reads like a plainly typeset book, which suits printing, annotating on a tablet or sending to someone without an e-reader.',
      'Two limits come from the source rather than the converter. Books bought from a store are usually protected with DRM, which encrypts the text, and this tool cannot and will not remove that protection. DRM-free EPUBs, such as those from Project Gutenberg or your own exported manuscripts, convert normally. And the PDF uses standard Latin fonts, so a book mostly in Hindi, Arabic or Chinese is refused with an explanation instead of being printed as question marks.',
    ],
  },

  'webp-to-jpg': {
    heading: 'Why WebP exists, and when JPG is still the better file',
    paragraphs: [
      'Google introduced WebP in 2010 to make web pages lighter. At the same visual quality, a WebP photo is typically noticeably smaller than a JPG, which is why most large sites now serve WebP automatically, and why an image you save from a browser so often arrives as .webp even if the site uploaded a JPG. Browsers all display it, but plenty of other software does not: older photo editors, some print shops, government upload forms and many email and document workflows still expect JPG.',
      'Converting decodes the WebP and encodes a new JPG at the quality you choose. That is a second round of lossy compression, so for the cleanest result keep the quality high, around 90%, which is visually indistinguishable from the WebP for photographs. JPG has no transparency, so any see-through areas in the WebP are filled with the background colour you pick, white by default.',
      'Do not be surprised if the JPG is larger than the WebP you started with. That is WebP doing its job, not the converter doing something wrong. If the image is going back onto a website, keep the WebP. Convert when the destination demands JPG, which is exactly what this tool is for.',
    ],
  },

  'excel-to-csv': {
    heading: 'What a workbook loses on its way to CSV, and why',
    paragraphs: [
      'An XLSX file is a ZIP of XML parts: sheet data, shared strings, styles, formulas and sometimes charts. CSV can hold exactly one thing, a single grid of text. So converting keeps each cell\'s value and drops everything else. Formulas become the result Excel last saved, colours and number formatting disappear, and merged cells become one value followed by empty cells. None of that is a flaw in the converter; CSV simply has nowhere to put it.',
      'Dates need special care, because Excel stores them as numbers: 1 January 2024 is 45292, a count of days from a starting point in 1899. Written to CSV naively, a date column becomes a column of five-digit numbers. This converter reads each cell\'s number format, recognises which ones Excel displays as dates, and writes those as ISO dates such as 2024-01-01, which every database and programming language reads unambiguously. Workbooks created on older Macs, which count from 1904 instead, are detected and handled too.',
      'A workbook with several sheets produces one CSV per sheet, or just the first sheet if that is all you need. The file is written as UTF-8 with a byte order mark, which is what makes Excel reopen accented and non-Latin characters correctly. Choose semicolons instead of commas if the file is going to someone whose Excel uses a comma as the decimal separator, as it does in much of Europe.',
    ],
  },

  'ocr-image': {
    heading: 'What happens to the image before the text is read',
    paragraphs: [
      'The recognition runs on Tesseract, an open-source OCR engine originally developed at HP and later maintained with Google\'s support, compiled to WebAssembly so it works inside the page. Before recognition, the image is prepared the way OCR engines prefer. It is converted to greyscale and its contrast is raised, so faint text separates from the background. Small images, where the shorter side is under 900 pixels, are enlarged up to twice their size, because Tesseract reads characters much more reliably when each one is at least a couple of dozen pixels tall. Very large images are scaled down to keep recognition fast.',
      'The layout setting tells Tesseract what kind of page it is looking at, and it changes results more than most people expect. Auto suits a normal document page. Single block suits one paragraph. Single line suits a caption or a number plate. Sparse suits screenshots of apps and websites, where short labels are scattered around the screen, and it recovers text that the document modes skip.',
      'Language matters because the engine recognises words, not just shapes. English, Hindi, Spanish, French and German are available, as is combined English and Hindi for mixed documents. The first time you use a language its model is downloaded; after that it is cached and works offline. Printed text in a clear photo usually comes out close to perfect; handwriting, heavy stylised fonts and text on busy backgrounds are where every OCR engine struggles.',
    ],
  },

  'gradient-generator': {
    heading: 'How a CSS gradient is built, and why some go grey in the middle',
    paragraphs: [
      'A CSS gradient is a list of colour stops, each a colour at a position from 0 to 100%, and the browser blends between neighbouring stops. A linear gradient blends along a line at the angle you set: 90° runs left to right, 180° top to bottom. A radial gradient blends outwards from the centre in a circle. The generator writes exactly that as one background declaration you can paste into any stylesheet, and every current browser supports it without prefixes.',
      'Browsers blend gradients in the sRGB colour space by default, and that is why a gradient between two saturated opposites, such as blue and yellow or red and green, often passes through a dull grey in the middle. Halfway between the two in sRGB numbers is a colour that looks muddy to the eye. The practical fix is to add a third stop in the middle with a bright colour that sits between them in hue, for example a teal between blue and yellow. The result reads as a smooth, vivid transition.',
      'Stop positions control where a transition happens, not just which colours appear. Two stops close together make a sharp band. Stops spread evenly make a gentle wash. Placing the same colour at two neighbouring positions creates a solid stripe with no blending at all. The generator sorts stops by position before writing the CSS, so you can add them in any order.',
    ],
  },
  'ai-to-pdf': {
    heading: 'Why an Illustrator file can open without Illustrator',
    paragraphs: [
      'An .ai file saved by Illustrator 9 or later usually contains two things side by side: Illustrator\'s own private editing data, which only Illustrator understands, and a complete PDF rendering of the artwork. The PDF part is there because the "Create PDF Compatible File" option is switched on by default when saving. It lets other applications preview and place the file, and it is what this tool reads.',
      'Getting a PDF out is therefore not really a conversion at all. The tool checks the start of the file for the PDF signature and, if it is present, hands you the file as a .pdf. Nothing is redrawn, so vectors stay vectors, colours are exactly as saved and the result is safe to send to a printer. PNG and JPG output renders that same PDF to pixels, one image per page, which is what you want for a slide, a document or a website.',
      'If the check fails, the file was saved with PDF compatibility turned off, or by Illustrator 8 or older, and it is PostScript rather than PDF. No browser can render that, so the tool says so instead of producing a blank page. The fix is on the designer\'s side: re-save from Illustrator with the option ticked. That is also worth asking for whenever you receive .ai files, since it is what lets anyone without Adobe software view them.',
    ],
  },

  'jpg-to-avif': {
    heading: 'Where AVIF\'s smaller files come from',
    paragraphs: [
      'AVIF stores a single frame of AV1, a video codec developed by the Alliance for Open Media, whose members include Google, Mozilla, Microsoft, Apple and Netflix. Video codecs are built to describe images far more efficiently than JPEG, which dates from 1992. AV1 predicts each block of the picture from its neighbours, can use large and irregular block sizes on smooth areas such as sky, and filters out the blocky edges JPEG is known for. The practical effect is that AVIF holds more detail in fewer bytes, especially at the smaller sizes websites care about.',
      'The trade-off is encoding time. Finding that efficient description takes a lot of searching, so AVIF encodes much more slowly than JPG. This converter uses a middle speed setting, which is the usual balance between file size and waiting time. Decoding is fast, so visitors to a site never pay that cost; only the person converting does, once.',
      'AVIF also supports transparency and higher bit depths, so it can replace both JPG photos and PNG graphics on a website. For a site that still needs to support very old browsers, serve AVIF inside a <picture> element with a JPG fallback, and every browser will pick the best format it understands.',
    ],
  },

  'png-to-svg': {
    heading: 'How tracing turns pixels into shapes',
    paragraphs: [
      'Tracing works in three stages, and knowing them explains every result the tool produces. First, the image is reduced to the number of colours you choose, so every pixel belongs to one of, say, four flat colours. Second, the edge of each coloured region is followed around its boundary, producing an outline made of tiny pixel steps. Third, straight lines and curves are fitted to those steps, turning a staircase of pixels into smooth vector paths.',
      'The two settings map onto those stages. Colours controls the first: too few and details merge together, too many and gentle shading splits into dozens of separate blobs. Detail controls the third: Smooth ignores tiny specks and rounds corners, which suits logos and scanned signatures, while Detailed follows every corner, which suits sharp icons and pixel art. The engine is ImageTracer, an open-source tracing library that runs entirely in the page.',
      'The source matters more than any setting. Tracing can only follow the edges it is given, so a small, blurry or heavily compressed image produces wobbly outlines no matter what. Start from the largest, cleanest version available, ideally one with a plain background, and a logo usually traces into a clean SVG in a few seconds.',
    ],
  },
};
