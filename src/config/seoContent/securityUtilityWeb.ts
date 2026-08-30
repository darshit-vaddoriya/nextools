import { ToolSeoMap } from './types';

export const SECURITY_UTILITY_WEB_SEO_CONTENT: ToolSeoMap = {
  // ─── Security ───────────────────────────────────────────────
  'password-generator': {
    intro: 'Reused or weak passwords are behind most account breaches. This tool generates cryptographically strong random passwords with full control over length and character set.',
    steps: [
      { title: 'Set the length', description: 'Choose how long you want the password to be.' },
      { title: 'Pick character types', description: 'Include uppercase, lowercase, numbers and symbols as needed.' },
      { title: 'Generate and copy', description: 'Check the strength meter, then copy your new password.' },
    ],
    faqs: [
      { question: 'How long should a strong password be?', answer: 'At least 12-16 characters with a mix of character types is generally recommended for strong resistance to modern cracking techniques.' },
      { question: 'Is the password generated locally or sent anywhere?', answer: 'It is generated entirely in your browser using a secure random source — nothing is transmitted anywhere.' },
      { question: 'Should I use the same generated password everywhere?', answer: 'No, generate a unique password for every account and store them in a password manager to avoid reuse risk.' },
    ],
  },
  'passphrase-gen': {
    intro: 'Random character passwords are strong but hard to remember or type. This tool generates memorable multi-word passphrases in the "correct-horse-battery-staple" style instead.',
    steps: [
      { title: 'Set the word count', description: 'Choose how many words to include in the passphrase.' },
      { title: 'Pick separator and casing', description: 'Adjust how words are joined and capitalized.' },
      { title: 'Copy the passphrase', description: 'Grab the generated passphrase to use as your password.' },
    ],
    faqs: [
      { question: 'Are passphrases as secure as random character passwords?', answer: 'With enough words (typically 4-6) drawn from a large wordlist, passphrases can match or exceed the entropy of shorter random passwords while being easier to remember.' },
      { question: 'Where do the words come from?', answer: 'Words are drawn from a curated wordlist designed for passphrase generation, similar to the well-known EFF wordlist approach.' },
      { question: 'Can I make the passphrase harder to guess?', answer: 'Increase the word count or mix in random casing/numbers for extra strength.' },
    ],
  },
  'password-strength': {
    intro: 'Not sure if a password is actually strong enough? This tool analyzes it and estimates entropy in bits, crack time, and gives an overall strength rating.',
    steps: [
      { title: 'Type a password', description: 'Enter the password you want to check.' },
      { title: 'View the live analysis', description: 'See entropy, estimated crack time and a visual strength meter update as you type.' },
      { title: 'Improve if needed', description: 'Adjust the password based on the feedback until it reaches a strong rating.' },
    ],
    faqs: [
      { question: 'Is my password sent anywhere to be checked?', answer: 'No, the analysis runs entirely in your browser — nothing is ever transmitted.' },
      { question: 'What does "crack time" actually mean?', answer: 'It is an estimate of how long an offline attacker with significant computing power would take to guess the password through brute force.' },
      { question: 'Why did a long password still get a low score?', answer: 'Predictable patterns like dictionary words or keyboard sequences reduce effective entropy even in long passwords — true randomness matters more than length alone.' },
    ],
  },
  'file-checksum': {
    intro: 'Verifying a downloaded file has not been corrupted or tampered with requires comparing checksums. This tool computes SHA-256 and SHA-1 checksums of any file directly in your browser.',
    steps: [
      { title: 'Upload your file', description: 'Select the file you want to verify.' },
      { title: 'View the computed checksums', description: 'SHA-256 and SHA-1 hashes are calculated automatically.' },
      { title: 'Compare against the published value', description: 'Paste the checksum you were given to get an instant match/mismatch check.' },
    ],
    faqs: [
      { question: 'Why would a checksum not match?', answer: 'A mismatch usually means the file was corrupted during download, or in rare cases, tampered with — always re-download from the original source if checksums don\'t match.' },
      { question: 'Is my file uploaded anywhere to compute the checksum?', answer: 'No, hashing happens locally in your browser using the file you selected.' },
      { question: 'Which checksum type should I trust more, SHA-256 or SHA-1?', answer: 'SHA-256 is stronger and preferred when available; SHA-1 is still commonly published by some sources but is considered weaker for security-critical verification.' },
    ],
  },
  'random-string': {
    intro: 'API keys, tokens and temporary secrets need genuinely unpredictable random strings. This tool generates them using your browser\'s crypto API with configurable length and character set.',
    steps: [
      { title: 'Set length and character set', description: 'Choose letters, digits, symbols or a combination.' },
      { title: 'Choose how many to generate', description: 'Set the output count if you need multiple strings at once.' },
      { title: 'Copy the results', description: 'Grab the generated strings for use as tokens or keys.' },
    ],
    faqs: [
      { question: 'Are these strings suitable for use as API keys?', answer: 'Yes, they use your browser\'s cryptographically secure random source, making them suitable for tokens, keys and temporary secrets.' },
      { question: 'Can I generate multiple strings at once?', answer: 'Yes, set the output count to generate a batch in one go.' },
      { question: 'Is there a maximum length I can generate?', answer: 'Very long strings are supported; practical limits depend mostly on how much text you actually need for your use case.' },
    ],
  },
  'secure-notes': {
    intro: 'Sometimes you need to jot down something sensitive without any cloud service seeing it. This tool encrypts notes with a passphrase you choose before saving them only in your browser\'s local storage.',
    steps: [
      { title: 'Write your note', description: 'Type the sensitive content you want to store.' },
      { title: 'Set a passphrase', description: 'Choose a strong passphrase to encrypt the note with AES-GCM.' },
      { title: 'Save locally', description: 'The encrypted note is stored only in your browser — never sent to a server.' },
    ],
    faqs: [
      { question: 'What happens if I forget my passphrase?', answer: 'The note cannot be recovered — encryption is designed so only someone with the correct passphrase can decrypt it, so keep it somewhere safe.' },
      { question: 'Is the note synced across my devices?', answer: 'No, notes are stored in this browser\'s local storage only and will not appear on other devices or browsers.' },
      { question: 'What encryption method is used?', answer: 'AES-GCM with PBKDF2 key derivation from your passphrase, a widely trusted modern encryption standard.' },
    ],
  },

  // ─── Utility / Calculators ───────────────────────────────────────────────────
  'unit-converter': {
    intro: 'Converting between metric and imperial units for length, weight, temperature, area, volume or speed is a constant small annoyance. This tool handles them all instantly, updating as you type.',
    steps: [
      { title: 'Pick a category', description: 'Choose length, weight, temperature, area, volume or speed.' },
      { title: 'Choose the units', description: 'Select which units you are converting between.' },
      { title: 'Read the result', description: 'The converted value updates instantly as you type.' },
    ],
    faqs: [
      { question: 'How accurate are the conversions?', answer: 'Conversions use standard, precise conversion factors, so results are accurate to many decimal places.' },
      { question: 'Can I convert temperature the same way as length?', answer: 'Yes, temperature uses a different formula internally (not a simple multiplier) but works the same way from your side — just pick your units.' },
      { question: 'Does it support less common units?', answer: 'A wide range of common and several less common units are included per category; check the dropdown list for your specific unit.' },
    ],
  },
  'timezone-converter': {
    intro: 'Scheduling a call across time zones without a converter almost always leads to confusion. This tool shows what a chosen date and time looks like across common time zones worldwide.',
    steps: [
      { title: 'Pick a date and time', description: 'Enter the date/time you want to convert, and its source time zone.' },
      { title: 'View the world clock', description: 'See the equivalent time across a list of common time zones.' },
      { title: 'Share the result', description: 'Use the converted times to schedule meetings across regions confidently.' },
    ],
    faqs: [
      { question: 'Does it account for daylight saving time?', answer: 'Yes, it uses your browser\'s built-in time zone data, which correctly accounts for daylight saving rules for each region.' },
      { question: 'Can I add a custom time zone not in the default list?', answer: 'The tool covers common time zones worldwide; check the selector for the specific city or region you need.' },
      { question: 'Is this accurate for historical dates?', answer: 'Time zone rules occasionally change over the years, so very old historical dates may not reflect the exact rules in effect at that time.' },
    ],
  },
  'timestamp-converter': {
    intro: 'Debugging an API response or database record often means staring at a Unix timestamp with no idea what date it represents. This tool converts timestamps (seconds or milliseconds) to human-readable dates and back, instantly.',
    steps: [
      { title: 'Paste a timestamp or pick a date', description: 'Enter a Unix timestamp, or use the date picker to go the other direction.' },
      { title: 'Choose seconds or milliseconds', description: 'Match the unit your timestamp is actually in to avoid a wildly wrong date.' },
      { title: 'Copy the converted value', description: 'Grab the human-readable date, or the timestamp, whichever direction you needed.' },
    ],
    faqs: [
      { question: 'How do I know if a timestamp is in seconds or milliseconds?', answer: 'Seconds-based timestamps are 10 digits for current dates, while millisecond timestamps are 13 digits — the toggle lets you pick the right one.' },
      { question: 'Is there a quick way to get the current timestamp?', answer: 'Yes, a "now" button fills in the current timestamp instantly for testing or reference.' },
      { question: 'Does the conversion account for my local time zone?', answer: 'Dates display using your browser\'s local time zone by default, since Unix timestamps themselves are always UTC-based under the hood.' },
    ],
  },
  'age-calculator': {
    intro: 'Figuring out someone\'s exact age in years, months and days — not just years — comes up more often than you\'d expect, from forms to eligibility checks. This tool calculates it instantly.',
    steps: [
      { title: 'Enter a birthdate', description: 'Type or pick the date of birth.' },
      { title: 'View the full breakdown', description: 'See exact age in years, months and days, plus total days.' },
      { title: 'Use the result', description: 'Copy the figures for forms, eligibility checks or curiosity.' },
    ],
    faqs: [
      { question: 'Does it account for leap years correctly?', answer: 'Yes, the calculation correctly handles leap years when computing exact days and the year/month/day breakdown.' },
      { question: 'Can I calculate age as of a specific date, not today?', answer: 'The tool calculates age up to today by default; adjust your "to" date if a specific reference date option is available.' },
      { question: 'Is the total-days figure useful for anything specific?', answer: 'It is commonly used for eligibility rules, milestone tracking, or just satisfying curiosity about exact lifespan in days.' },
    ],
  },
  'percentage-calc': {
    intro: 'Percentage math is simple in theory but easy to fumble under pressure — what is 15% of 340, or what percent did sales grow? This tool handles the three most common percentage questions instantly.',
    steps: [
      { title: 'Pick a calculator', description: 'Choose "X% of Y", "X is what % of Y", or percentage change.' },
      { title: 'Enter your numbers', description: 'Type the values relevant to your chosen calculation.' },
      { title: 'Read the answer', description: 'The result updates instantly.' },
    ],
    faqs: [
      { question: 'What is the difference between percentage and percentage point change?', answer: 'A change from 10% to 15% is a 5 percentage point increase, but a 50% relative increase — this tool\'s percentage change calculator shows the relative percentage change.' },
      { question: 'Can I calculate a percentage decrease as well as increase?', answer: 'Yes, the percentage change calculator handles both increases and decreases, showing negative values for decreases.' },
      { question: 'Which calculator do I use to find a discount price?', answer: 'Use "X% of Y" to find the discount amount, then subtract it from the original price.' },
    ],
  },
  'bmi-calculator': {
    intro: 'Body Mass Index is a quick, standard way to gauge whether weight is in a healthy range relative to height. This calculator works in both metric and imperial units.',
    steps: [
      { title: 'Choose your unit system', description: 'Pick metric (kg/cm) or imperial (lb/ft-in).' },
      { title: 'Enter height and weight', description: 'Type your measurements.' },
      { title: 'View your BMI and category', description: 'See your calculated BMI along with its standard category.' },
    ],
    faqs: [
      { question: 'What are the standard BMI categories?', answer: 'Generally: underweight (below 18.5), normal (18.5–24.9), overweight (25–29.9), and obese (30+), though exact thresholds can vary slightly by health authority.' },
      { question: 'Is BMI an accurate measure of health for everyone?', answer: 'BMI is a useful general screening tool but does not account for muscle mass, body composition, age or sex — it should not replace a full medical assessment.' },
      { question: 'Can I switch between metric and imperial mid-calculation?', answer: 'Yes, switching units recalculates automatically based on your entered values.' },
    ],
  },
  'emi-calculator': {
    intro: 'Understanding what a loan will actually cost each month, including how much goes to interest versus principal, is essential before signing. This calculator computes EMI using the standard reducing-balance formula.',
    steps: [
      { title: 'Enter the loan details', description: 'Input the principal amount, interest rate and tenure.' },
      { title: 'View the EMI breakdown', description: 'See the monthly EMI amount, total interest and total payable.' },
      { title: 'Compare scenarios', description: 'Adjust the tenure or rate to see how the EMI changes.' },
    ],
    faqs: [
      { question: 'What formula does this calculator use?', answer: 'It uses the standard reducing-balance EMI formula, the same method used by most banks and lenders for amortizing loans.' },
      { question: 'Does a longer tenure always mean a lower EMI?', answer: 'Yes, spreading payments over more months lowers the monthly EMI, but increases the total interest paid over the life of the loan.' },
      { question: 'Can I use this for any type of loan?', answer: 'Yes, it works for home loans, car loans, personal loans or any loan using standard equal monthly installments.' },
    ],
  },
  'scientific-calc': {
    intro: 'For calculations beyond basic arithmetic — trigonometry, logarithms, factorials — this full scientific calculator handles it all with a familiar button-based interface.',
    steps: [
      { title: 'Enter your expression', description: 'Use the on-screen buttons for numbers and operations.' },
      { title: 'Use scientific functions', description: 'Access trig, log, powers, roots and factorial functions as needed.' },
      { title: 'Use memory functions', description: 'Store and recall values with M+, M-, MR and MC just like a physical calculator.' },
    ],
    faqs: [
      { question: 'Does it support both degrees and radians for trig functions?', answer: 'Yes, you can switch the angle mode between degrees and radians depending on your calculation.' },
      { question: 'Can I chain multiple operations together?', answer: 'Yes, it works like a standard scientific calculator, supporting sequences of operations in one calculation.' },
      { question: 'Are results shown with full precision?', answer: 'Results are displayed with a practical number of decimal places suitable for most scientific and everyday use.' },
    ],
  },
  'gst-calculator': {
    intro: 'Working out GST-inclusive or exclusive amounts across India\'s standard tax slabs is a routine task for shopping, billing and accounting. This calculator handles it instantly using the common 5%, 12%, 18% and 28% slab rates.',
    steps: [
      { title: 'Choose Add GST or Remove GST', description: 'Pick "Add GST" to calculate tax on top of a base amount, or "Remove GST" to extract tax from a total that already includes it.' },
      { title: 'Enter the amount', description: 'Type the base amount or tax-inclusive total, depending on the mode you chose.' },
      { title: 'Select the GST rate', description: 'Pick the applicable slab — 5%, 12%, 18% or 28% — from the rate dropdown.' },
      { title: 'View the breakdown', description: 'See the base amount, GST amount and total amount calculated instantly.' },
    ],
    faqs: [
      { question: 'What is the difference between GST-inclusive and exclusive calculation?', answer: 'Exclusive (Add GST) calculation adds GST on top of a base amount you enter; inclusive (Remove GST) calculation extracts the GST portion from a total that already includes tax.' },
      { question: 'Which GST rates are supported?', answer: 'The calculator offers the four standard Indian GST slabs — 5%, 12%, 18% and 28% — selectable from a dropdown; it does not currently accept an arbitrary custom percentage.' },
      { question: 'Which GST slab should I use for my product or service?', answer: 'The applicable slab depends on the specific goods or services involved — check current government GST rate schedules for your category if you are unsure which of the four rates applies.' },
      { question: 'Is my amount data sent anywhere to calculate GST?', answer: 'No, the calculation is simple percentage arithmetic performed locally in your browser.' },
    ],
  },
  'number-to-words': {
    intro: 'Writing out an amount in words — like on a cheque or legal document — is easy to get wrong for large numbers. This tool spells out any integer as English words instantly.',
    steps: [
      { title: 'Type a number', description: 'Enter any integer, including negative numbers.' },
      { title: 'View the word form', description: 'See it converted into English words instantly.' },
      { title: 'Copy the result', description: 'Use the words directly on a cheque or document.' },
    ],
    faqs: [
      { question: 'Does it handle very large numbers, into the billions?', answer: 'Yes, numbers up to the billions range convert correctly into their full word form.' },
      { question: 'Can it convert negative numbers?', answer: 'Yes, negative numbers are prefixed with "negative" or "minus" in the word output.' },
      { question: 'Does it support decimal numbers?', answer: 'The tool is built for whole integers, matching typical cheque-writing conventions; decimals may need to be handled separately.' },
    ],
  },
  'roman-numerals': {
    intro: 'Converting between Roman numerals and standard numbers by hand means remembering subtractive notation rules. This tool converts both directions instantly, with validation to catch mistakes.',
    steps: [
      { title: 'Type a number or numeral', description: 'Enter either a standard number or a Roman numeral.' },
      { title: 'View the conversion', description: 'See the equivalent in the other format instantly.' },
      { title: 'Check for validity', description: 'Invalid Roman numeral input is flagged automatically.' },
    ],
    faqs: [
      { question: 'What is the largest number this can convert?', answer: 'Standard Roman numerals typically support numbers up to 3999 using the classic symbol set.' },
      { question: 'Does it validate incorrect Roman numerals, like "IIII"?', answer: 'Yes, invalid or non-standard numeral forms are flagged rather than silently accepted.' },
      { question: 'Why are Roman numerals still used today?', answer: 'They remain common for clock faces, book chapters, movie sequels and formal numbering where a traditional look is wanted.' },
    ],
  },

  // ─── Web ───────────────────────────────────────────────────
  'url-parser': {
    intro: 'Understanding exactly what a long, parameter-heavy URL is made of is much easier with a visual breakdown. This tool splits any URL into its protocol, host, port, path, query parameters and hash.',
    steps: [
      { title: 'Paste a URL', description: 'Enter the full URL you want to break down.' },
      { title: 'View the parsed components', description: 'See protocol, host, port, path, query parameters and hash in a readable table.' },
      { title: 'Inspect query parameters', description: 'Each query key and value is listed separately for easy reading.' },
    ],
    faqs: [
      { question: 'Does it decode URL-encoded query parameters?', answer: 'Yes, percent-encoded characters in query values are decoded for readability in the breakdown.' },
      { question: 'Can I parse relative URLs?', answer: 'The tool is designed for full absolute URLs; relative paths without a host may not parse completely.' },
      { question: 'What is shown for the "hash" or fragment?', answer: 'Anything after a "#" in the URL is shown as the fragment/hash, commonly used for in-page anchors or client-side routing.' },
    ],
  },
  'user-agent-parser': {
    intro: 'A User-Agent string looks like gibberish but actually encodes browser, OS and device details. This tool reads it and tells you exactly what browser, version, engine and device it represents.',
    steps: [
      { title: 'Start with your own browser', description: 'Your current User-Agent is shown by default.' },
      { title: 'Or paste any User-Agent string', description: 'Inspect a string from server logs or another device.' },
      { title: 'View the breakdown', description: 'See browser, version, OS, rendering engine and device type.' },
    ],
    faqs: [
      { question: 'Why would I need to parse a User-Agent string?', answer: 'It is commonly used for debugging browser-specific issues, analyzing server logs, or checking what a particular device reports itself as.' },
      { question: 'Can User-Agent strings be spoofed?', answer: 'Yes, browsers allow overriding the User-Agent string, so it should not be treated as a fully reliable source of truth for security purposes.' },
      { question: 'Does it detect mobile vs desktop devices?', answer: 'Yes, device type (mobile, tablet, desktop) is included in the parsed breakdown where the string indicates it.' },
    ],
  },
  'mime-checker': {
    intro: 'File extensions can lie — a renamed .exe with a .jpg extension will still open as an executable. This tool detects a file\'s real type by reading its actual first bytes, not just its name.',
    steps: [
      { title: 'Upload a file', description: 'Select any file you want to verify.' },
      { title: 'Compare detected vs reported type', description: 'See the real file type based on its magic bytes alongside what the browser reports.' },
      { title: 'Spot mismatches', description: 'A mismatch between the two flags a potentially misleading file extension.' },
    ],
    faqs: [
      { question: 'What are "magic bytes"?', answer: 'They are a distinctive sequence of bytes at the start of a file that reliably identifies its true format, regardless of the file\'s extension.' },
      { question: 'Why might the reported and detected types differ?', answer: 'This usually happens when a file has been deliberately or accidentally renamed with a misleading extension.' },
      { question: 'Is my file uploaded anywhere to check this?', answer: 'No, the file\'s header bytes are read directly in your browser.' },
    ],
  },
  'html-entity': {
    intro: 'Special characters like < and & need to be encoded as HTML entities to display correctly and safely inside HTML. This tool encodes or decodes between raw characters and entity syntax.',
    steps: [
      { title: 'Paste your text', description: 'Enter text containing special characters, or already-encoded entities.' },
      { title: 'Pick a direction', description: 'Choose to encode into entities, or decode entities back to normal characters.' },
      { title: 'Copy the result', description: 'Grab the converted text.' },
    ],
    faqs: [
      { question: 'Why do I need to encode characters like < and & for HTML?', answer: 'Unencoded, these characters can be misinterpreted as HTML syntax, breaking the page or creating security issues — encoding them as entities keeps them safely displayed as literal text.' },
      { question: 'What entities does it support?', answer: 'Common named entities like &amp;, &lt;, &gt; as well as numeric character references are supported.' },
      { question: 'Can I decode entities back to readable text?', answer: 'Yes, switch the direction to decode entity syntax back into normal characters.' },
    ],
  },
  'unicode-converter': {
    intro: 'Working with emoji or characters from non-Latin scripts sometimes requires their exact Unicode code point. This tool converts text to code points like U+1F600 and back again.',
    steps: [
      { title: 'Enter text or code points', description: 'Type text (including emoji) or Unicode code points.' },
      { title: 'Convert', description: 'See the equivalent representation instantly.' },
      { title: 'Copy the result', description: 'Grab the converted output.' },
    ],
    faqs: [
      { question: 'Does it handle emoji correctly?', answer: 'Yes, emoji and other multi-byte characters are correctly handled and converted to their proper code points.' },
      { question: 'What format are code points shown in?', answer: 'Code points are shown in the standard U+XXXX hexadecimal notation used in Unicode documentation.' },
      { question: 'Can it convert characters from any script, not just Latin?', answer: 'Yes, any valid Unicode character from any script — Cyrillic, Arabic, CJK and more — converts correctly.' },
    ],
  },
  'ascii-converter': {
    intro: 'Converting text to its underlying ASCII/decimal character codes is a common need in programming and puzzles. This tool converts in both directions instantly.',
    steps: [
      { title: 'Enter text or codes', description: 'Type plain text, or a list of space-separated ASCII codes.' },
      { title: 'Convert', description: 'See the equivalent representation appear instantly.' },
      { title: 'Copy the result', description: 'Grab the converted output.' },
    ],
    faqs: [
      { question: 'What is the difference between ASCII and Unicode conversion?', answer: 'ASCII covers only the basic 128-character set (English letters, digits, punctuation); use the Unicode Converter for characters and emoji outside that range.' },
      { question: 'How are the codes separated in the output?', answer: 'Codes are space-separated decimal numbers, making them easy to read and copy.' },
      { question: 'Can I convert a code list back to readable text?', answer: 'Yes, paste the space-separated codes and switch direction to get the original text back.' },
    ],
  },
  'binary-converter': {
    intro: 'Switching a number between binary, decimal, hexadecimal and octal is routine when working close to the hardware or debugging low-level code. This tool updates all four fields together live.',
    steps: [
      { title: 'Type a number in any field', description: 'Enter a value in binary, decimal, hex or octal.' },
      { title: 'Watch the others update', description: 'All four representations update together automatically.' },
      { title: 'Copy what you need', description: 'Grab the format your code or documentation requires.' },
    ],
    faqs: [
      { question: 'Does it support negative numbers?', answer: 'Positive integers convert cleanly across all bases; check the specific behavior shown for negative number handling if needed.' },
      { question: 'Is there a maximum number size?', answer: 'Reasonably large integers are supported, well beyond what fits in standard 32-bit or 64-bit representations for typical use.' },
      { question: 'Which base should I use for reading memory addresses?', answer: 'Hexadecimal is the conventional choice for memory addresses and byte-level data since it maps cleanly to binary in a more compact form.' },
    ],
  },
};
