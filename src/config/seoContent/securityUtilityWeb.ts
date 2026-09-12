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
      { question: 'Is the password generated locally or sent anywhere?', answer: 'It is generated entirely in your browser using a secure random source, nothing is transmitted anywhere.' },
      { question: 'Should I use the same generated password everywhere?', answer: 'No, generate a unique password for every account and store them in a password manager to avoid reuse risk.' },
    ],
    useCases: [
      'Generating a strong Wi-Fi or admin password on the spot',
      'Replacing a password that may have been exposed in a data breach',
      'Creating unique passwords for every new account you sign up for',
      'Satisfying a site\'s complexity requirements without inventing something yourself',
    ],
    tips: [
      'Avoid excluding symbols just to make typing easier, a password manager fills it in for you anyway.',
      'Aim for 16+ characters for anything protecting financial or email accounts.',
      'Never reuse a generated password across multiple sites, even if it feels wasteful to generate a new one each time.',
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
    useCases: [
      'Creating a master password for a password manager that you\'ll need to type from memory',
      'Setting a passphrase for full-disk encryption or a hardware wallet',
      'Choosing a Wi-Fi password that guests can actually read and type correctly',
      'Picking a memorable but strong password for a shared family or team account',
    ],
    tips: [
      'Use at least 5-6 words for anything security-critical, shorter passphrases are easier to brute-force than they feel.',
      'Adding a random number or symbol to one word meaningfully boosts strength without hurting memorability.',
      'Avoid picking a well-known quote or lyric instead of the randomly generated words, that defeats the entropy benefit.',
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
      { question: 'Is my password sent anywhere to be checked?', answer: 'No, the analysis runs entirely in your browser, nothing is ever transmitted.' },
      { question: 'What does "crack time" actually mean?', answer: 'It is an estimate of how long an offline attacker with significant computing power would take to guess the password through brute force.' },
      { question: 'Why did a long password still get a low score?', answer: 'Predictable patterns like dictionary words or keyboard sequences reduce effective entropy even in long passwords, true randomness matters more than length alone.' },
    ],
    useCases: [
      'Checking whether an existing account password is due for an upgrade',
      'Testing a new password idea before committing to it',
      'Evaluating whether a company password policy actually produces strong passwords',
      'Learning what makes a password weak, like reused patterns or predictable substitutions',
    ],
    tips: [
      'Test the actual password you plan to use, not a placeholder, entropy estimates depend on real character choices.',
      'Watch for "strong" scores that come from length alone; predictable patterns still lower real-world security.',
      'If a password reuses part of your name, birthdate, or a common word, treat a high score with skepticism regardless of the meter.',
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
      { question: 'Why would a checksum not match?', answer: 'A mismatch usually means the file was corrupted during download, or in rare cases, tampered with, always re-download from the original source if checksums don\'t match.' },
      { question: 'Is my file uploaded anywhere to compute the checksum?', answer: 'No, hashing happens locally in your browser using the file you selected.' },
      { question: 'Which checksum type should I trust more, SHA-256 or SHA-1?', answer: 'SHA-256 is stronger and preferred when available; SHA-1 is still commonly published by some sources but is considered weaker for security-critical verification.' },
    ],
    useCases: [
      'Verifying an OS ISO or software installer against the publisher\'s posted checksum before running it',
      'Confirming a large file transfer completed without corruption',
      'Checking that a file hasn\'t been modified since it was originally shared',
      'Comparing two copies of the same file to confirm they are byte-for-byte identical',
    ],
    tips: [
      'Always compare against a checksum published on the vendor\'s official site, not one bundled with the file itself.',
      'Prefer SHA-256 over SHA-1 whenever the publisher offers both.',
      'A checksum match confirms integrity, not safety, a corrupted-but-malicious file can still have a valid published hash if the source itself was compromised.',
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
    useCases: [
      'Generating a placeholder API key or secret for local development',
      'Creating session tokens or CSRF tokens while prototyping an app',
      'Producing unique IDs or test fixtures in bulk for QA scripts',
      'Generating a random string to use as a temporary invite or reset code',
    ],
    tips: [
      'Use an alphanumeric-only character set when the target field doesn\'t accept symbols, like URL slugs or filenames.',
      'Generate a batch at once if you need multiple unique tokens rather than running the tool repeatedly.',
      'For anything used as a real production secret, treat it as sensitive the moment it\'s generated and avoid pasting it into chat logs or tickets.',
    ],
  },
  'secure-notes': {
    intro: 'Sometimes you need to jot down something sensitive without any cloud service seeing it. This tool encrypts notes with a passphrase you choose before saving them only in your browser\'s local storage.',
    steps: [
      { title: 'Write your note', description: 'Type the sensitive content you want to store.' },
      { title: 'Set a passphrase', description: 'Choose a strong passphrase to encrypt the note with AES-GCM.' },
      { title: 'Save locally', description: 'The encrypted note is stored only in your browser, never sent to a server.' },
    ],
    faqs: [
      { question: 'What happens if I forget my passphrase?', answer: 'The note cannot be recovered, encryption is designed so only someone with the correct passphrase can decrypt it, so keep it somewhere safe.' },
      { question: 'Is the note synced across my devices?', answer: 'No, notes are stored in this browser\'s local storage only and will not appear on other devices or browsers.' },
      { question: 'What encryption method is used?', answer: 'AES-GCM with PBKDF2 key derivation from your passphrase, a widely trusted modern encryption standard.' },
    ],
    useCases: [
      'Jotting down a recovery seed phrase or license key temporarily on a personal device',
      'Keeping a private draft or sensitive reminder off of cloud note apps',
      'Storing a one-off secret you need to reference later on the same machine',
      'Taking quick encrypted notes while researching something sensitive without creating an account anywhere',
    ],
    tips: [
      'Use a passphrase you\'ll actually remember, there is no recovery mechanism if you lose it.',
      'Remember these notes live in this browser\'s local storage only; clearing browser data or switching devices means losing access.',
      'Don\'t use this for anything you need long-term or cross-device, pair it with a proper password manager for that.',
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
      { question: 'Can I convert temperature the same way as length?', answer: 'Yes, temperature uses a different formula internally (not a simple multiplier) but works the same way from your side, just pick your units.' },
      { question: 'Does it support less common units?', answer: 'A wide range of common and several less common units are included per category; check the dropdown list for your specific unit.' },
    ],
    useCases: [
      'Converting a recipe\'s measurements between metric and imperial units',
      'Checking a shipping package\'s weight or dimensions against a carrier\'s unit requirements',
      'Converting a temperature reading between Celsius and Fahrenheit while traveling',
      'Translating a product spec sheet between unit systems for an international audience',
    ],
    tips: [
      'Double-check whether a "ton" is metric, US short, or UK long, they differ and it\'s a common source of errors.',
      'For area and volume conversions, watch the exponent, converting length units directly won\'t give you the right area factor.',
      'Round results only at the end of a calculation chain to avoid compounding small rounding errors.',
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
    useCases: [
      'Scheduling a meeting or call with participants across multiple countries',
      'Figuring out the local time of a livestream, launch, or event in another region',
      'Double-checking a flight arrival time when crossing time zones',
      'Coordinating on-call handoffs for a distributed engineering team',
    ],
    tips: [
      'Double-check the date near daylight saving transitions, a time an hour before or after the switch can shift the offset unexpectedly.',
      'When sharing a converted time with others, include the time zone abbreviation or city name to avoid ambiguity.',
      'For recurring meetings, re-verify the conversion periodically since some regions change DST rules over time.',
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
      { question: 'How do I know if a timestamp is in seconds or milliseconds?', answer: 'Seconds-based timestamps are 10 digits for current dates, while millisecond timestamps are 13 digits, the toggle lets you pick the right one.' },
      { question: 'Is there a quick way to get the current timestamp?', answer: 'Yes, a "now" button fills in the current timestamp instantly for testing or reference.' },
      { question: 'Does the conversion account for my local time zone?', answer: 'Dates display using your browser\'s local time zone by default, since Unix timestamps themselves are always UTC-based under the hood.' },
    ],
    useCases: [
      'Decoding a Unix timestamp found in an API response or log file while debugging',
      'Generating a timestamp to hardcode into a test fixture or database seed',
      'Checking exactly when a JWT token was issued or will expire',
      'Converting a database record\'s created_at value into a readable date for a report',
    ],
    tips: [
      'Count the digits first, 10 digits means seconds, 13 means milliseconds, mixing them up gives a date decades off.',
      'Use the "now" button to quickly grab a fresh timestamp for testing expiry logic.',
      'Remember the display uses your local time zone, convert to UTC explicitly if you need to compare timestamps across regions.',
    ],
  },
  'age-calculator': {
    intro: 'Figuring out someone\'s exact age in years, months and days, not just years, comes up more often than you\'d expect, from forms to eligibility checks. This tool calculates it instantly.',
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
    useCases: [
      'Checking eligibility for an age-restricted service, license, or scholarship',
      'Calculating a child\'s exact age in months for pediatric or developmental milestones',
      'Filling out a form that requires precise age rather than just birth year',
      'Finding out exactly how many days old you or someone else is',
    ],
    tips: [
      'Use the exact total-days figure, not just years, when a form or eligibility rule specifies a precise cutoff.',
      'Double check the reference date if you need age as of a past or future date rather than today.',
      'For legal or medical eligibility checks, verify the result against the specific authority\'s own date rules, since some count age differently around birthdays.',
    ],
  },
  'percentage-calc': {
    intro: 'Percentage math is simple in theory but easy to fumble under pressure, what is 15% of 340, or what percent did sales grow? This tool handles the three most common percentage questions instantly.',
    steps: [
      { title: 'Pick a calculator', description: 'Choose "X% of Y", "X is what % of Y", or percentage change.' },
      { title: 'Enter your numbers', description: 'Type the values relevant to your chosen calculation.' },
      { title: 'Read the answer', description: 'The result updates instantly.' },
    ],
    faqs: [
      { question: 'What is the difference between percentage and percentage point change?', answer: 'A change from 10% to 15% is a 5 percentage point increase, but a 50% relative increase, this tool\'s percentage change calculator shows the relative percentage change.' },
      { question: 'Can I calculate a percentage decrease as well as increase?', answer: 'Yes, the percentage change calculator handles both increases and decreases, showing negative values for decreases.' },
      { question: 'Which calculator do I use to find a discount price?', answer: 'Use "X% of Y" to find the discount amount, then subtract it from the original price.' },
    ],
    useCases: [
      'Calculating a discount amount while shopping',
      'Working out what percentage a tip, tax, or fee adds to a bill',
      'Measuring the percentage growth or decline between two sales or revenue figures',
      'Checking what percentage one number represents of another for a report or grade',
    ],
    tips: [
      'Don\'t confuse a percentage point change with a relative percentage change, they can tell very different stories about the same numbers.',
      'For a discount, calculate the discount amount first, then subtract it, rather than trying to compute the final price in one step.',
      'When comparing growth over multiple periods, recalculate from the original baseline each time rather than chaining percentage changes.',
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
      { question: 'Is BMI an accurate measure of health for everyone?', answer: 'BMI is a useful general screening tool but does not account for muscle mass, body composition, age or sex, it should not replace a full medical assessment.' },
      { question: 'Can I switch between metric and imperial mid-calculation?', answer: 'Yes, switching units recalculates automatically based on your entered values.' },
    ],
    useCases: [
      'Getting a quick general health screening number before a doctor\'s visit',
      'Tracking BMI changes over time alongside a fitness or weight goal',
      'Checking BMI in whichever unit system you\'re used to, metric or imperial',
      'Understanding which standard weight category a given height and weight falls into',
    ],
    tips: [
      'Treat BMI as a screening indicator, not a diagnosis, it doesn\'t distinguish muscle mass from fat.',
      'Athletes and very muscular individuals often show as "overweight" on BMI despite low body fat, so interpret results in context.',
      'Track the trend over time rather than fixating on a single reading for a more useful health picture.',
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
    useCases: [
      'Comparing monthly payments across different home or car loan offers before choosing one',
      'Deciding between a shorter tenure with higher EMI or a longer tenure with lower EMI',
      'Estimating total interest cost over the life of a loan before signing',
      'Checking affordability of a personal loan against your monthly budget',
    ],
    tips: [
      'Compare total interest paid, not just the monthly EMI, when weighing a longer tenure against a shorter one.',
      'Small differences in interest rate compound significantly over long tenures like 20-year home loans, always run the exact rate you\'re quoted.',
      'Factor in processing fees and other charges separately, since EMI calculators typically only model principal and interest.',
    ],
  },
  'scientific-calc': {
    intro: 'For calculations beyond basic arithmetic, trigonometry, logarithms, factorials, this full scientific calculator handles it all with a familiar button-based interface.',
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
    useCases: [
      'Solving trigonometry, logarithm, or exponent problems for homework or coursework',
      'Running a quick engineering calculation without opening a full spreadsheet',
      'Using memory functions to carry a running total across a multi-step calculation',
      'Checking a calculation on any device without needing a physical calculator',
    ],
    tips: [
      'Check the degrees/radians mode before running trig functions, it\'s the most common source of wrong answers.',
      'Use the memory keys (M+, MR, MC) to hold intermediate results instead of manually re-typing them.',
      'For very large or very small results, watch for scientific notation in the output rather than expecting a long decimal.',
    ],
  },
  'gst-calculator': {
    intro: 'Working out GST-inclusive or exclusive amounts across India\'s standard tax slabs is a routine task for shopping, billing and accounting. This calculator handles it instantly using the common 5%, 12%, 18% and 28% slab rates.',
    steps: [
      { title: 'Choose Add GST or Remove GST', description: 'Pick "Add GST" to calculate tax on top of a base amount, or "Remove GST" to extract tax from a total that already includes it.' },
      { title: 'Enter the amount', description: 'Type the base amount or tax-inclusive total, depending on the mode you chose.' },
      { title: 'Select the GST rate', description: 'Pick the applicable slab, 5%, 12%, 18% or 28%, from the rate dropdown.' },
      { title: 'View the breakdown', description: 'See the base amount, GST amount and total amount calculated instantly.' },
    ],
    faqs: [
      { question: 'What is the difference between GST-inclusive and exclusive calculation?', answer: 'Exclusive (Add GST) calculation adds GST on top of a base amount you enter; inclusive (Remove GST) calculation extracts the GST portion from a total that already includes tax.' },
      { question: 'Which GST rates are supported?', answer: 'The calculator offers the four standard Indian GST slabs, 5%, 12%, 18% and 28%, selectable from a dropdown; it does not currently accept an arbitrary custom percentage.' },
      { question: 'Which GST slab should I use for my product or service?', answer: 'The applicable slab depends on the specific goods or services involved, check current government GST rate schedules for your category if you are unsure which of the four rates applies.' },
      { question: 'Is my amount data sent anywhere to calculate GST?', answer: 'No, the calculation is simple percentage arithmetic performed locally in your browser.' },
    ],
    useCases: [
      'Working out the GST amount to add to an invoice before billing a customer',
      'Extracting the GST portion from a tax-inclusive price shown on a receipt',
      'Checking how much tax is embedded in an MRP-labeled product price',
      'Quickly cross-checking a vendor\'s or accountant\'s GST calculation on a bill',
    ],
    tips: [
      'Make sure you\'ve picked the correct mode, Add GST for exclusive amounts, Remove GST for inclusive totals, mixing these up gives a wrong result even with the right rate.',
      'Confirm the applicable slab for your specific goods or service against current government rate schedules, since the calculator only offers the four standard rates.',
      'When reconciling accounts, extract GST from inclusive totals rather than re-adding it to avoid double-counting tax.',
    ],
  },
  'number-to-words': {
    intro: 'Writing out an amount in words, like on a cheque or legal document, is easy to get wrong for large numbers. This tool spells out any integer as English words instantly.',
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
    useCases: [
      'Writing out the amount in words when filling out a cheque',
      'Spelling out a figure in words for a legal contract or affidavit',
      'Double-checking the word form of a large invoice or payment amount',
      'Converting a number to words for accounting or audit documentation',
    ],
    tips: [
      'For amounts with cents or decimals, convert the whole and fractional parts separately since the tool is built for integers.',
      'Double-check large numbers with many digit groups, it\'s easy to misread the source number before conversion.',
      'For legal documents, always cross-verify the generated words against the numeric figure before finalizing.',
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
    useCases: [
      'Figuring out the correct Roman numeral for a movie sequel, Super Bowl, or event edition number',
      'Decoding a Roman numeral date engraved on a building or document',
      'Formatting chapter or section numbers in a formal document using Roman numerals',
      'Checking whether a Roman numeral you\'ve written follows standard subtractive notation',
    ],
    tips: [
      'Remember standard Roman numerals only go up to 3999, larger numbers need special notation not covered here.',
      'Watch for non-standard forms like "IIII" instead of "IV", the validator will flag them as invalid even though you may see them on some clock faces.',
      'When decoding an inscribed date, read left to right and watch for subtractive pairs like IV or IX rather than adding every symbol.',
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
    useCases: [
      'Debugging a long tracking or campaign URL to see exactly what parameters it carries',
      'Extracting a specific query parameter value from a shared link',
      'Checking what an unfamiliar or suspicious-looking URL actually points to before clicking it',
      'Inspecting a redirect URL\'s structure while debugging an integration',
    ],
    tips: [
      'Paste the full absolute URL, including protocol, relative paths without a host won\'t parse completely.',
      'Use the decoded query parameter view to quickly spot exactly what data a link is carrying, like UTM tags or tokens.',
      'Check the fragment/hash separately from query parameters, some apps store routing state there instead of in the query string.',
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
    useCases: [
      'Identifying the exact browser and version behind a bug reported in server logs',
      'Checking what device type or OS a visitor\'s User-Agent claims to be',
      'Confirming your own browser\'s reported User-Agent while testing device-specific behavior',
      'Investigating an unfamiliar User-Agent string flagged in analytics or access logs',
    ],
    tips: [
      'Don\'t rely on User-Agent parsing alone for security decisions, the string can be freely spoofed by the client.',
      'When debugging a browser-specific bug, compare the parsed engine (not just browser name) since some browsers share the same underlying engine.',
      'Older or unusual User-Agent strings from bots and crawlers may parse incompletely, treat missing fields as expected in those cases.',
    ],
  },
  'mime-checker': {
    intro: 'File extensions can lie, a renamed .exe with a .jpg extension will still open as an executable. This tool detects a file\'s real type by reading its actual first bytes, not just its name.',
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
    useCases: [
      'Verifying a downloaded file is actually what its extension claims before opening it',
      'Investigating a suspicious email attachment with a mismatched icon or extension',
      'Confirming an uploaded file\'s real format before processing it in an app or pipeline',
      'Checking whether a file was renamed accidentally and now has the wrong extension',
    ],
    tips: [
      'A mismatch between reported and detected type is a strong warning sign, don\'t open the file until you know why.',
      'Some legitimate files (like certain container formats) can show unexpected magic bytes; check the specific format\'s spec if unsure.',
      'Combine this with a checksum check when verifying a file from an untrusted source, since magic bytes confirm format but not integrity.',
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
      { question: 'Why do I need to encode characters like < and & for HTML?', answer: 'Unencoded, these characters can be misinterpreted as HTML syntax, breaking the page or creating security issues, encoding them as entities keeps them safely displayed as literal text.' },
      { question: 'What entities does it support?', answer: 'Common named entities like &amp;, &lt;, &gt; as well as numeric character references are supported.' },
      { question: 'Can I decode entities back to readable text?', answer: 'Yes, switch the direction to decode entity syntax back into normal characters.' },
    ],
    useCases: [
      'Safely embedding user-generated text containing < or & into an HTML page',
      'Decoding entity-encoded text copied from a CMS or email HTML source',
      'Preparing code snippets containing angle brackets for display inside a web page',
      'Debugging why raw text is rendering as broken HTML instead of literal characters',
    ],
    tips: [
      'Always encode user-supplied text before injecting it into HTML to avoid it being interpreted as markup.',
      'Watch for double-encoding, running already-encoded text through the encoder again produces garbled entities like &amp;amp;.',
      'Use numeric character references for characters without a common named entity, like less-common symbols.',
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
      { question: 'Can it convert characters from any script, not just Latin?', answer: 'Yes, any valid Unicode character from any script, Cyrillic, Arabic, CJK and more, converts correctly.' },
    ],
    useCases: [
      'Looking up the exact code point for an emoji to use in code or documentation',
      'Debugging a text rendering issue involving unfamiliar or non-Latin characters',
      'Converting a code point reference from a Unicode chart back into the actual character',
      'Verifying which character a mysterious code point in a data file represents',
    ],
    tips: [
      'Remember some emoji are composed of multiple code points (like skin-tone modifiers or ZWJ sequences), check for more than one U+ value.',
      'Use the standard U+XXXX notation when referencing characters in bug reports or documentation for clarity.',
      'When debugging mojibake or garbled text, converting to code points first can reveal whether the issue is encoding-related.',
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
    useCases: [
      'Solving a programming puzzle or CTF challenge that encodes a message as ASCII codes',
      'Converting plain text into ASCII codes for a low-level programming assignment',
      'Decoding a list of ASCII codes back into readable text',
      'Teaching or learning how characters map to their underlying numeric values',
    ],
    tips: [
      'Remember ASCII only covers the basic 128-character set, for accented letters, emoji, or non-Latin scripts, use the Unicode Converter instead.',
      'Keep codes space-separated when pasting a list in, since that\'s the expected delimiter format.',
      'Case matters, uppercase and lowercase letters have different ASCII codes, so double-check casing when decoding.',
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
    useCases: [
      'Converting a memory address or byte value between hex and binary while debugging low-level code',
      'Translating a decimal value into binary for a computer science assignment',
      'Checking an octal file permission value (like chmod 755) against its binary or decimal form',
      'Verifying a hex color or bitmask value by seeing its binary breakdown',
    ],
    tips: [
      'Use hexadecimal rather than binary when working with memory addresses or byte data, it maps more compactly and is easier to read.',
      'Watch for leading-zero conventions in binary/octal fields, since they don\'t change the value but affect readability.',
      'Be cautious with negative numbers, behavior across bases can vary, so verify against your specific use case (like two\'s complement) if it matters.',
    ],
  },
};
