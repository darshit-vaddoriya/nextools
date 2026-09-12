import { ToolSeoMap } from './types';

export const TEXT_DEV_SEO_CONTENT: ToolSeoMap = {
  'word-counter': {
    intro:
      'Writers polishing an essay, students hitting a word count target, and marketers trimming a meta description all need a fast way to see how long a piece of text really is. This tool tallies words, characters (with and without spaces), sentences and paragraphs as you type, and adds estimated reading time plus basic readability stats so you know if your writing is easy to follow. Everything is calculated locally in your browser, so drafts never leave your device.',
    steps: [
      { title: 'Paste or type your text', description: 'Drop your draft, essay or article into the text area.' },
      { title: 'Watch the stats update', description: 'Word, character, sentence and paragraph counts refresh live as you edit.' },
      { title: 'Check reading time and readability', description: 'Use the estimated reading time and readability score to gauge how accessible the text is.' },
      { title: 'Copy or clear', description: 'Copy the text back out or clear the box to start a new count.' },
    ],
    faqs: [
      { question: 'Does this tool count words the same way Microsoft Word does?', answer: 'It uses a whitespace-based word split similar to most word processors, so counts should closely match Word or Google Docs, though edge cases like hyphenated words or numbers can vary slightly between tools.' },
      { question: 'Is my text uploaded anywhere?', answer: 'No. All counting happens locally in your browser using JavaScript, nothing is sent to a server.' },
      { question: 'What does the readability score mean?', answer: 'It gives a rough estimate of how easy the text is to read based on sentence length and word complexity, useful as a general guide rather than an exact grade level.' },
      { question: 'Can I count text from a PDF or Word document?', answer: 'Yes, just copy the text out of the document and paste it into the box, formatting like bold or italics is ignored, only the plain text is counted.' },
      { question: 'Does it work on mobile browsers?', answer: 'Yes, the counter works on any modern mobile or desktop browser without needing an app.' },
    ],
    useCases: [
      'Trimming a meta description or ad copy down to a strict character limit',
      'Checking an essay or assignment meets a required word count before submitting',
      'Estimating how long a blog post or script will take to read out loud',
      'Comparing sentence and paragraph length to spot overly dense writing',
    ],
    tips: [
      'Paste the whole document rather than section by section, paragraph and sentence stats need the full context to be accurate.',
      'Use the readability score as a directional signal, not a grade, pair it with a human read-through for tone.',
      'If your word count looks off compared to another tool, check for hyphenated words or numbers, which some counters split differently.',
    ],
  },

  'case-converter': {
    intro:
      'Developers renaming variables to match a language convention, and writers cleaning up text pasted from a spreadsheet, both run into the same problem: text in the wrong case. This tool converts between camelCase, snake_case, kebab-case, PascalCase, Title Case, UPPERCASE and lowercase with a single click, so you can match your codebase style guide or tidy up copy without retyping anything by hand. Conversion happens instantly in your browser.',
    steps: [
      { title: 'Paste your text', description: 'Enter a variable name, sentence or block of text into the input field.' },
      { title: 'Pick a case style', description: 'Click the button for the case you need, such as camelCase or kebab-case.' },
      { title: 'Review the converted output', description: 'The result appears immediately below the input.' },
      { title: 'Copy the result', description: 'Use the copy button to grab the converted text for your code or document.' },
    ],
    faqs: [
      { question: 'How does the tool decide where word boundaries are?', answer: 'It splits on spaces, underscores, hyphens and camelCase capital letters, so mixed-format input like "user_firstName-value" is broken into individual words before converting to the target case.' },
      { question: 'Will it handle multi-line text?', answer: 'Yes, each line is processed independently, which is useful for converting a whole list of variable names at once.' },
      { question: 'Does it support Title Case and Sentence case too?', answer: 'Yes, alongside the common programming cases it also offers Title Case and Sentence case for regular writing.' },
      { question: 'Is anything sent to a server when I convert text?', answer: 'No, all case conversion logic runs client-side in your browser.' },
      { question: 'Can I convert numbers or symbols mixed with words?', answer: 'Numbers and symbols are preserved as-is; only alphabetic word boundaries are used to determine casing.' },
    ],
    useCases: [
      'Renaming a batch of variables to match a new style guide, such as switching from snake_case to camelCase',
      'Converting a spreadsheet column of names from ALL CAPS to Title Case for a report',
      'Turning a page heading into PascalCase for a component or class name',
      'Standardizing inconsistent casing pasted from multiple contributors into one codebase',
    ],
    tips: [
      'Mixed-format input like "user_firstName-value" still converts correctly since the tool splits on underscores, hyphens and camel humps together.',
      'Run multi-line lists through in one pass, each line converts independently, so you can batch-convert dozens of identifiers at once.',
      'Double-check acronyms after conversion (e.g. "userID" to snake_case) since acronym boundaries can split in unexpected ways.',
    ],
  },

  'remove-duplicates-text': {
    intro:
      'Anyone cleaning up a mailing list, a keyword list, or notes copied from multiple sources ends up with repeated lines cluttering the file. This tool scans a block of text line by line and removes exact duplicates, with an option to sort the remaining lines alphabetically afterward, so you end up with a clean, unique list in seconds instead of manually scrolling through hundreds of rows.',
    steps: [
      { title: 'Paste your list', description: 'Add the text with one item per line into the input box.' },
      { title: 'Choose sorting behavior', description: 'Optionally enable sorting of the deduplicated lines.' },
      { title: 'Remove duplicates', description: 'Click the button to strip out repeated lines, keeping the first occurrence of each.' },
      { title: 'Copy the cleaned list', description: 'Copy the deduplicated output for use elsewhere.' },
    ],
    faqs: [
      { question: 'Is duplicate detection case-sensitive?', answer: 'By default lines are compared exactly, so "Apple" and "apple" are treated as different lines unless you lowercase the text first.' },
      { question: 'Does it trim whitespace before comparing lines?', answer: 'Leading and trailing whitespace differences can cause two visually identical lines to be treated as different; trim your text first if you want strict matching.' },
      { question: 'Which duplicate does it keep?', answer: 'The first occurrence of each line is kept and later duplicates are discarded.' },
      { question: 'Can I sort without removing duplicates?', answer: 'The sort option is applied alongside deduplication in this tool; use the dedicated Sort Lines tool if you only want sorting.' },
      { question: 'Is there a limit on how much text I can paste?', answer: 'The tool runs entirely in your browser, so practical limits depend on your device memory rather than any server-imposed cap.' },
    ],
    useCases: [
      'Cleaning a mailing list that has been merged from several exports and now has repeated addresses',
      'Deduplicating a keyword list before importing it into an SEO or ad campaign tool',
      'Removing repeated lines from notes copied from multiple sources during research',
      'Tidying up a list of URLs or IDs before feeding them into another script',
    ],
    tips: [
      'Lowercase your text first if you want "Apple" and "apple" treated as the same line, comparison is case-sensitive by default.',
      'Trim trailing spaces before pasting, since two visually identical lines with different whitespace will not be caught as duplicates.',
      'Remember only the first occurrence of each line is kept, so reorder your list beforehand if you care which version survives.',
    ],
  },

  'sort-lines': {
    intro:
      'Whether you are alphabetizing a reference list, ranking log lines by length, or reversing an ordered export, sorting text by hand is tedious and error-prone. This tool sorts pasted lines alphabetically (A-Z or Z-A), numerically, by line length, or simply reverses their order, giving developers and writers a quick way to reorganize lists without opening a spreadsheet.',
    steps: [
      { title: 'Paste your lines', description: 'Enter text with one item per line.' },
      { title: 'Select a sort mode', description: 'Choose alphabetical, numeric, by length, or reverse order.' },
      { title: 'Apply the sort', description: 'The reordered lines appear in the output area.' },
      { title: 'Copy the result', description: 'Copy the sorted list to paste elsewhere.' },
    ],
    faqs: [
      { question: 'How does numeric sort handle lines that are not numbers?', answer: 'Non-numeric lines are generally treated as having a low or undefined value and pushed to one end; use numeric sort only on lists that are mostly numbers for predictable results.' },
      { question: 'Is alphabetical sort case-sensitive?', answer: 'Sorting uses standard string comparison, so uppercase and lowercase letters can sort differently depending on your browser locale settings.' },
      { question: 'Can I sort by line length shortest to longest?', answer: 'Yes, the by-length option orders lines from shortest to longest, and you can reverse the result if you need the opposite order.' },
      { question: 'Does sorting remove duplicate lines?', answer: 'No, sorting only reorders lines; use the Remove Duplicate Lines tool separately if you also need to deduplicate.' },
      { question: 'Does this tool store my list anywhere?', answer: 'No, sorting happens locally in your browser and nothing is saved or uploaded.' },
    ],
    useCases: [
      'Alphabetizing a glossary, reference list, or set of names before publishing',
      'Ordering log lines or config entries by length to spot outliers quickly',
      'Reversing an exported list that came out newest-first when you need oldest-first',
      'Sorting a list of numeric IDs or scores for a quick visual scan',
    ],
    tips: [
      'Use numeric sort only when the list is mostly numbers, mixed text and numbers can sort unpredictably.',
      'Check your locale-sensitive expectations for alphabetical sort, since case can affect ordering depending on the browser.',
      'Run Remove Duplicate Lines first if you need both a clean and sorted list, sorting alone will not drop repeats.',
    ],
  },

  'reverse-text': {
    intro:
      'From creating novelty mirrored text for social media to reversing word order in a sentence for a puzzle or linguistics exercise, reversing text has plenty of small but real uses. This tool flips an entire string character by character, or reverses the order of words while keeping each word intact, all processed instantly on your own device.',
    steps: [
      { title: 'Enter your text', description: 'Type or paste the text you want to reverse.' },
      { title: 'Choose a reverse mode', description: 'Pick character reversal or word-order reversal.' },
      { title: 'View the reversed output', description: 'The result updates immediately in the output box.' },
      { title: 'Copy the reversed text', description: 'Copy it out for use in a message, puzzle or document.' },
    ],
    faqs: [
      { question: 'What is the difference between character and word reversal?', answer: 'Character reversal flips the entire string letter by letter (so "hello world" becomes "dlrow olleh"), while word reversal keeps each word spelled normally but reverses their order (so it becomes "world hello").' },
      { question: 'Does reversing text handle emoji and special characters correctly?', answer: 'Most emoji and multi-byte characters are handled correctly, but some complex emoji sequences built from multiple code points can occasionally split apart when reversed character by character.' },
      { question: 'Can I reverse multiple lines at once?', answer: 'Yes, you can paste multi-line text and each line is reversed independently.' },
      { question: 'Is this tool useful for anything besides novelty text?', answer: 'It is also handy for quick puzzle creation, testing string-handling code, or checking palindrome-like patterns.' },
      { question: 'Does it process text on a server?', answer: 'No, reversal is a simple client-side JavaScript operation with no network requests involved.' },
    ],
    useCases: [
      'Creating novelty mirrored text for a social media post or username',
      'Building a quick word-order puzzle or riddle for a game or classroom activity',
      'Checking whether a string is a palindrome by comparing it to its reversed form',
      'Testing how a piece of code or UI handles reversed or right-to-left-like text',
    ],
    tips: [
      'Use word-order reversal instead of character reversal if you want each word to stay readable.',
      'Watch for complex emoji made of multiple code points, reversing character by character can occasionally split them apart.',
      'Paste multi-line text if you need each line reversed independently rather than the whole block treated as one string.',
    ],
  },

  'lorem-ipsum': {
    intro:
      'Designers mocking up a landing page and developers filling a template before real copy is ready both reach for placeholder text. This generator produces classic Lorem Ipsum in the amount you need, by paragraphs, sentences or words, so you can drop realistic-looking filler text into a design or prototype without waiting on final content.',
    steps: [
      { title: 'Choose a unit', description: 'Select whether you want paragraphs, sentences, or words.' },
      { title: 'Set the amount', description: 'Enter how many paragraphs, sentences or words to generate.' },
      { title: 'Generate the text', description: 'Click generate to produce the placeholder copy.' },
      { title: 'Copy it into your project', description: 'Copy the output into your design tool, CMS or codebase.' },
    ],
    faqs: [
      { question: 'Is the generated text always the same classic Latin-like Lorem Ipsum?', answer: 'Yes, it draws from the traditional Lorem Ipsum word pool so the output looks like standard placeholder text used across the design industry.' },
      { question: 'Can I generate a huge amount of text for stress-testing a layout?', answer: 'Yes, you can request a large number of paragraphs or words to test how a layout behaves with long content, limited only by your browser performance.' },
      { question: 'Does the output include HTML tags like paragraph tags?', answer: 'The generator outputs plain text; wrap it in your own HTML tags if you need it embedded in markup.' },
      { question: 'Is Lorem Ipsum generated locally?', answer: 'Yes, text is assembled entirely in the browser with no server calls.' },
      { question: 'Can I use this text in a live production site?', answer: 'It is meant for mockups and testing only, replace it with real content before launching to users and search engines.' },
    ],
    useCases: [
      'Filling a design mockup with realistic-looking body copy before real content is ready',
      'Stress-testing a layout with a large volume of text to check wrapping and overflow behavior',
      'Populating a CMS template during development so stakeholders can review the structure',
      'Generating a quick block of filler text for a slide deck or wireframe',
    ],
    tips: [
      'Generate by words instead of paragraphs when you need to fill a small, exact-sized UI element like a card or tooltip.',
      'Request an unusually large amount of text specifically to test how your layout handles overflow and pagination.',
      'Remember the output is plain text, wrap it in your own HTML tags if you are pasting into markup.',
    ],
  },

  'slug-generator': {
    intro:
      'Publishing a blog post, naming a product page, or building clean file names for a CMS all require a URL-friendly slug, lowercase, hyphen-separated, with no special characters. This tool converts any title or phrase into a proper slug automatically, with customizable separators like hyphens or underscores, so your URLs stay consistent and SEO-friendly without manual cleanup.',
    steps: [
      { title: 'Type or paste your title', description: 'Enter the heading or phrase you want turned into a slug.' },
      { title: 'Pick a separator', description: 'Choose a hyphen, underscore or other separator between words.' },
      { title: 'Generate the slug', description: 'The tool strips accents, punctuation and casing, replacing spaces with your chosen separator.' },
      { title: 'Copy the slug', description: 'Copy it into your CMS URL field or routing config.' },
    ],
    faqs: [
      { question: 'Does the slug generator handle accented characters like é or ñ?', answer: 'Yes, accented letters are normalized to their closest plain ASCII equivalent so the resulting slug stays URL-safe.' },
      { question: 'What happens to punctuation and symbols?', answer: 'Punctuation and symbols are stripped out, leaving only letters, numbers and the chosen separator between words.' },
      { question: 'Can I use underscores instead of hyphens?', answer: 'Yes, you can pick your preferred separator character before generating the slug.' },
      { question: 'Will it lowercase everything automatically?', answer: 'Yes, slugs are converted to lowercase since that is the standard convention for URLs.' },
      { question: 'Is this safe to use for non-English titles?', answer: 'It works reasonably well for Latin-script languages with accents, but non-Latin scripts like Chinese or Arabic may need transliteration handled separately.' },
    ],
    useCases: [
      'Turning a blog post title into a clean, SEO-friendly URL slug',
      'Naming a new product page consistently across a large e-commerce catalog',
      'Generating safe file names for a CMS or static site generator from arbitrary headings',
      'Standardizing routing paths across a project that mixes hyphens and underscores',
    ],
    tips: [
      'Pick your separator before generating, switching between hyphens and underscores later means re-running every slug.',
      'Check accented titles carefully; normalization is close to correct but always worth a quick visual review for unusual characters.',
      'For non-Latin scripts, expect to handle transliteration separately since the generator focuses on Latin-based text.',
    ],
  },

  'text-cleaner': {
    intro:
      'Text copied from a PDF, an email, or a web page often arrives full of extra spaces, stray HTML tags, smart quotes and other encoding artifacts. This cleaner strips extra whitespace, removes HTML tags, normalizes special characters and fixes common encoding glitches in one pass, giving writers and developers plain, usable text without manual find-and-replace work.',
    steps: [
      { title: 'Paste the messy text', description: 'Add the text that has extra spaces, tags or odd characters.' },
      { title: 'Select cleanup options', description: 'Toggle which fixes to apply, such as removing HTML tags or collapsing whitespace.' },
      { title: 'Clean the text', description: 'Run the cleanup to produce a tidied version.' },
      { title: 'Copy the result', description: 'Copy the cleaned text for use in your document or CMS.' },
    ],
    faqs: [
      { question: 'Will this strip all HTML tags from pasted web content?', answer: 'Yes, when HTML tag removal is enabled it strips tags like <div> or <span> while keeping the visible text content.' },
      { question: 'Does it fix curly quotes and em dashes?', answer: 'It can normalize common typographic characters like smart quotes and em dashes to their plain ASCII equivalents.' },
      { question: 'Can it remove extra blank lines as well as extra spaces?', answer: 'Yes, whitespace cleanup collapses repeated spaces and can also reduce multiple consecutive blank lines.' },
      { question: 'Is this a substitute for a full HTML sanitizer?', answer: 'No, it is meant for cleaning readable text, not for sanitizing HTML for security purposes, do not rely on it to prevent XSS.' },
      { question: 'Does the tool send my text anywhere to process it?', answer: 'No, all cleaning rules run locally in JavaScript in your browser.' },
    ],
    useCases: [
      'Stripping HTML tags and stray formatting from text copied off a webpage before pasting into an email',
      'Normalizing smart quotes and em dashes from a Word document before pasting into plain-text code or config',
      'Collapsing excess whitespace and blank lines from text extracted out of a PDF',
      'Preparing scraped content for a CMS field that expects clean plain text',
    ],
    tips: [
      'Enable only the cleanup options you need, stripping HTML on already-plain text is harmless but unnecessary.',
      'Do not rely on this for security-sensitive HTML sanitization; it is built for readability, not preventing XSS.',
      'Run text through here before a word counter or diff tool if hidden characters are throwing off your results.',
    ],
  },

  'find-replace': {
    intro:
      'Editing a large document or refactoring repeated strings across a config file often means the same replacement needs to happen dozens of times. This tool lets you find and replace text using either a plain string match or a full regular expression pattern, so developers can do pattern-based bulk edits and writers can quickly swap terminology throughout a document.',
    steps: [
      { title: 'Paste your source text', description: 'Add the document or code block you want to edit.' },
      { title: 'Enter find and replace values', description: 'Type the text or regex pattern to find, and what to replace it with.' },
      { title: 'Toggle regex mode if needed', description: 'Enable regex matching for pattern-based replacements with capture groups.' },
      { title: 'Run replace', description: 'Apply the replacement and review the updated text.' },
      { title: 'Copy the updated text', description: 'Copy the final result back into your file.' },
    ],
    faqs: [
      { question: 'Can I use capture groups in the replacement text?', answer: 'Yes, when regex mode is enabled you can reference capture groups (like $1) in the replacement field, similar to most code editors.' },
      { question: 'Is the plain-text search case-sensitive?', answer: 'Plain string matching is case-sensitive by default; use a regex with the case-insensitive flag if you need to ignore case.' },
      { question: 'What happens if my regex pattern is invalid?', answer: 'The tool shows an error message rather than crashing, so you can fix the pattern before applying it.' },
      { question: 'Does it replace all occurrences or just the first?', answer: 'By default it replaces every match in the text; regex global behavior is applied automatically.' },
      { question: 'Is my text sent anywhere during find and replace?', answer: 'No, matching and replacing run entirely in your browser using JavaScript regex.' },
    ],
    useCases: [
      'Bulk-swapping an old product name or terminology throughout a long document',
      'Using a regex with capture groups to reformat repeated patterns in a config or log file',
      'Refactoring a repeated string across pasted code before committing it back to a file',
      'Cleaning up inconsistent terminology across marketing copy in one pass',
    ],
    tips: [
      'Test your regex in the dedicated Regex Tester first if the pattern is complex, this tool applies it but does not visualize matches.',
      'Reference capture groups like $1 in the replacement field to preserve parts of the matched text.',
      'Remember plain-text search is case-sensitive by default; switch to regex mode with the "i" flag if you need case-insensitive matching.',
    ],
  },

  'remove-empty-lines': {
    intro:
      'Log files, exported CSV-like data, and text copied from PDFs frequently end up riddled with blank lines that make the content harder to read or process. This tool strips every blank or whitespace-only line from a block of text instantly, leaving a compact version ready to paste into code, a spreadsheet, or a document.',
    steps: [
      { title: 'Paste your text', description: 'Add the text containing unwanted blank lines.' },
      { title: 'Remove empty lines', description: 'Click the action to strip out every blank or whitespace-only line.' },
      { title: 'Review the compacted text', description: 'Check the output to confirm the content is intact.' },
      { title: 'Copy the cleaned text', description: 'Copy the result for use elsewhere.' },
    ],
    faqs: [
      { question: 'Does this remove lines that only contain spaces or tabs?', answer: 'Yes, lines that are visually blank because they contain only whitespace are also removed, not just completely empty lines.' },
      { question: 'Will it change the order of the remaining lines?', answer: 'No, the remaining non-empty lines keep their original order; only blank lines are removed.' },
      { question: 'Can I use this to compact a large log file?', answer: 'Yes, it works well for tidying up logs, CSV exports or copied text that has scattered blank lines.' },
      { question: 'Does it merge paragraphs together?', answer: 'It only removes empty lines; it does not merge or reflow the remaining text.' },
      { question: 'Is there a size limit for pasted text?', answer: 'Processing is done in-browser, so very large files are limited by your device memory rather than a server limit.' },
    ],
    useCases: [
      'Compacting a log file riddled with blank lines before scanning it for errors',
      'Cleaning up text copied from a PDF that inserted blank lines between every paragraph',
      'Tidying a CSV-like export before pasting it into a spreadsheet or script',
      'Preparing code or config pasted from multiple sources that left behind stray blank lines',
    ],
    tips: [
      'This also strips whitespace-only lines, not just fully empty ones, so tab- or space-padded blank lines are caught too.',
      'It only removes blank lines, pair it with a paragraph reflow step if you also need to merge broken-up text.',
      'Run this before a word or line counter if blank lines are skewing your stats.',
    ],
  },

  'extract-emails': {
    intro:
      'Sales teams scraping contact info from a webpage, and support staff scanning a mailbox export, often need to pull just the email addresses out of a wall of text. This tool scans any pasted block of text with a regex pattern and lists every valid-looking email address it finds, deduplicated and ready to copy into a spreadsheet or mailing list.',
    steps: [
      { title: 'Paste the source text', description: 'Add the text, HTML or document content you want to scan.' },
      { title: 'Extract emails', description: 'Run the extraction to find all email-like patterns in the text.' },
      { title: 'Review the list', description: 'Check the extracted email addresses shown in the results.' },
      { title: 'Copy or export', description: 'Copy the list or download it for use in your CRM or email client.' },
    ],
    faqs: [
      { question: 'Will it catch every valid email format?', answer: 'It uses a broad regex pattern that catches the vast majority of common email formats, though highly unusual valid addresses per the full email spec could occasionally be missed.' },
      { question: 'Does it remove duplicate emails automatically?', answer: 'Yes, duplicate matches are typically deduplicated so each address appears once in the results.' },
      { question: 'Can I paste raw HTML source and extract emails from it?', answer: 'Yes, the regex looks for the email pattern regardless of surrounding HTML tags, so it works on raw page source too.' },
      { question: 'Is this tool useful for validating a single email address?', answer: 'It is designed for bulk extraction from text rather than strict single-address validation, though a correctly matched result is a good sign the format is valid.' },
      { question: 'Is any of the extracted data sent to a server?', answer: 'No, extraction happens entirely client-side using JavaScript regex matching.' },
    ],
    useCases: [
      'Pulling contact emails out of a scraped webpage or PDF export for a sales list',
      'Scanning a mailbox export or support ticket dump to compile a list of sender addresses',
      'Extracting addresses from raw HTML source without needing to parse the DOM manually',
      'Building a deduplicated mailing list from text copied across multiple documents',
    ],
    tips: [
      'Paste raw HTML directly, the regex matches the email pattern regardless of surrounding tags.',
      'Results are deduplicated automatically, so you do not need to clean the list again before exporting.',
      'For strict validation of a single address, treat a match here as a good sign, not a guarantee, combine with an actual verification service if deliverability matters.',
    ],
  },

  'extract-urls': {
    intro:
      'Researchers compiling a list of sources, and developers auditing links inside an HTML export, both need a fast way to pull every link out of a large block of content. This tool scans pasted text or HTML source for URLs and hyperlinks and lists them all, saving you from manually scrolling through the content looking for http and https references.',
    steps: [
      { title: 'Paste text or HTML', description: 'Add the content that contains links you want to collect.' },
      { title: 'Extract URLs', description: 'Run the extraction to find every URL pattern in the text.' },
      { title: 'Review the results', description: 'Check the list of found links.' },
      { title: 'Copy the list', description: 'Copy the URLs for use in a spreadsheet, report or crawler.' },
    ],
    faqs: [
      { question: 'Does it extract URLs from href attributes in raw HTML?', answer: 'Yes, since the extraction is regex-based on the URL pattern itself, it finds links whether they appear in href attributes or as plain text.' },
      { question: 'Will it include duplicate links if they appear multiple times?', answer: 'The tool generally deduplicates the results so each unique URL appears once.' },
      { question: 'Does it capture URLs without the http:// prefix?', answer: 'It primarily matches URLs that include a recognizable scheme like http:// or https://; bare domains without a protocol may not be matched.' },
      { question: 'Can I extract URLs from a very long article?', answer: 'Yes, there is no artificial limit, performance depends on your browser and device.' },
      { question: 'Is my pasted content stored anywhere?', answer: 'No, everything is processed locally in your browser and discarded when you leave the page.' },
    ],
    useCases: [
      'Compiling a source list from a research article or long report full of inline citations',
      'Auditing every link inside an HTML export before a site migration',
      'Pulling reference URLs out of a document to feed into a link checker or crawler',
      'Collecting external links mentioned across a batch of pasted articles or emails',
    ],
    tips: [
      'Paste raw HTML if you need links from href attributes, the extractor matches the URL pattern itself regardless of markup.',
      'Bare domains without http:// or https:// will not be picked up, so check your source text if you expect protocol-less links.',
      'The output is deduplicated, so run it directly into a spreadsheet without a separate cleanup pass.',
    ],
  },

  'extract-phones': {
    intro:
      'Customer service teams cleaning up support tickets and businesses parsing scanned contact lists often need to pull phone numbers out of unstructured text. This tool searches pasted content for common phone number formats, with area codes, country codes, dashes or parentheses, and extracts them into a clean list you can copy straight into a CRM.',
    steps: [
      { title: 'Paste the text', description: 'Add the text or document content containing phone numbers.' },
      { title: 'Extract phone numbers', description: 'Run extraction to find number patterns in various common formats.' },
      { title: 'Review matches', description: 'Check the extracted list against the source text for accuracy.' },
      { title: 'Copy the results', description: 'Copy the list for use in a spreadsheet or contact database.' },
    ],
    faqs: [
      { question: 'Does it support international phone number formats?', answer: 'It matches a range of common formats including country codes, parentheses and dashes, but extremely unusual regional formats may not always be captured perfectly.' },
      { question: 'Can it distinguish a phone number from a random string of digits?', answer: 'It relies on common phone number patterns like grouped digits and separators, so a coincidental sequence of digits formatted similarly could occasionally be picked up as a false positive.' },
      { question: 'Does it validate that a number is actually reachable?', answer: 'No, it only extracts text matching phone number patterns, it does not verify that the number is real or currently in service.' },
      { question: 'Is this suitable for scanning large customer data exports?', answer: 'Yes, it works well on pasted exports, though very large files are limited by your browser memory rather than a server cap.' },
      { question: 'Where does the extraction happen?', answer: 'Entirely in your browser using JavaScript regex, no data is uploaded.' },
    ],
    useCases: [
      'Pulling phone numbers out of a bulk support ticket export to build a callback list',
      'Parsing a scanned contact list or business directory copied as plain text',
      'Extracting numbers from a mixed-format spreadsheet dump before importing into a CRM',
      'Auditing customer records for missing or malformed phone number entries',
    ],
    tips: [
      'Review extracted matches against the source text, since digit sequences formatted like phone numbers can occasionally be false positives.',
      'Expect very unusual international formats to sometimes be missed, spot-check results for non-US or non-standard number styles.',
      'This only extracts pattern matches, it does not verify a number is real or reachable, pair it with a validation service if that matters.',
    ],
  },

  'extract-hashtags': {
    intro:
      'Social media managers analyzing a batch of posts and researchers studying campaign reach both need to quickly pull every hashtag and mention out of raw text. This tool scans pasted social media content and extracts all #hashtags and @mentions into a clean list, useful for tracking trending tags or compiling a mention report without manual copy-pasting.',
    steps: [
      { title: 'Paste your social text', description: 'Add posts, captions or comments containing hashtags and mentions.' },
      { title: 'Extract tags', description: 'Run extraction to pull out every #hashtag and @mention.' },
      { title: 'Review the results', description: 'Check the separated lists of hashtags and mentions.' },
      { title: 'Copy the list', description: 'Copy the results for reporting or reuse in future posts.' },
    ],
    faqs: [
      { question: 'Does it separate hashtags from @mentions?', answer: 'Yes, the results are typically grouped so you can see hashtags and mentions as distinct lists.' },
      { question: 'Will it remove duplicate hashtags if the same tag is used repeatedly?', answer: 'Duplicates are generally consolidated so each unique tag appears once, which is useful for a frequency-style overview.' },
      { question: 'Does it work on text copied from Twitter/X, Instagram, or LinkedIn?', answer: 'Yes, it works on any plain text you paste, regardless of which platform it originally came from.' },
      { question: 'Can it count how many times each hashtag appears?', answer: 'The tool focuses on extracting the unique tags present; for detailed frequency counts you may want to cross-check with a word frequency tool.' },
      { question: 'Is this data processed locally?', answer: 'Yes, extraction runs entirely in your browser with no upload to any server.' },
    ],
    useCases: [
      'Compiling every hashtag used across a batch of posts for a campaign performance report',
      'Pulling @mentions out of comments to see who engaged with a brand or thread',
      'Building a reusable hashtag set from a top-performing post to reuse in future content',
      'Auditing a large export of social copy for tag consistency before a scheduled campaign',
    ],
    tips: [
      'Results are split into separate hashtag and mention lists, so you do not need to sort them manually afterward.',
      'Duplicate tags are consolidated to one entry each, cross-check with a word frequency tool if you need actual usage counts.',
      'Works on plain text pasted from any platform, so you can mix content from Twitter/X, Instagram and LinkedIn in one pass.',
    ],
  },

  'regex-tester': {
    intro:
      'Debugging a validation pattern for a signup form, or figuring out why a log-parsing regex is not matching, is much faster with instant visual feedback than trial-and-error in code. This live regex tester lets you type a pattern and flags on one side and sample text on the other, highlighting every match, capture group and index in real time so developers can iterate quickly before shipping the pattern into their application.',
    steps: [
      { title: 'Enter your regex pattern', description: 'Type the pattern into the pattern field, without the surrounding slashes.' },
      { title: 'Set flags', description: 'Toggle flags like g, i, m or s depending on the matching behavior you need.' },
      { title: 'Paste sample text', description: 'Add the text you want to test the pattern against.' },
      { title: 'Review highlighted matches', description: 'Matches are highlighted live, with capture groups shown separately.' },
      { title: 'Refine the pattern', description: 'Adjust the regex until it matches exactly what you expect, with no false positives.' },
    ],
    faqs: [
      { question: 'Which regex flavor does this tool use?', answer: 'It uses your browser\'s native JavaScript RegExp engine, so behavior matches exactly what you would get running the same pattern in JavaScript code.' },
      { question: 'Can I see capture groups for each match?', answer: 'Yes, matched capture groups are displayed alongside the full match so you can verify a pattern before using it in code.' },
      { question: 'Does it support named capture groups?', answer: 'Yes, JavaScript-supported named groups using the (?<name>...) syntax work and their names are shown with the match.' },
      { question: 'Will patterns written for Python or PCRE behave identically here?', answer: 'Not always, some syntax differs between regex flavors, so a pattern written for Python\'s re module or PCRE may need small adjustments to work identically in JavaScript.' },
      { question: 'Is my test data sent anywhere?', answer: 'No, matching runs entirely client-side using the browser\'s built-in regex engine.' },
    ],
    useCases: [
      'Debugging why a form validation regex rejects a valid input before shipping it',
      'Validating a log-parsing pattern against real sample log lines before deploying it',
      'Working out the right capture groups for a data extraction script',
      'Checking a regex for catastrophic backtracking risk by testing against tricky sample strings',
    ],
    tips: [
      'Test against edge-case inputs, not just the happy path, the highlighted matches make false positives easy to spot.',
      'Remember this uses JavaScript\'s RegExp engine, so patterns copied from Python or PCRE may need small syntax tweaks.',
      'Named capture groups with (?<name>...) are supported and shown by name, which is worth using for anything you will read back later in code.',
    ],
  },

  'diff-text': {
    intro:
      'Comparing two drafts of an email, two versions of a legal clause, or a translated paragraph against the original is much easier when the differences are highlighted instead of read line by line. This text diff checker compares two blocks of text and visually marks every addition, deletion and change between them, helping writers, editors and reviewers spot exactly what moved without re-reading the whole document.',
    steps: [
      { title: 'Paste the original text', description: 'Add the first version into the left-hand box.' },
      { title: 'Paste the updated text', description: 'Add the revised version into the second box.' },
      { title: 'Run the comparison', description: 'The tool computes the differences between the two versions.' },
      { title: 'Review highlighted changes', description: 'Additions, deletions and modified sections are marked with distinct colors.' },
    ],
    faqs: [
      { question: 'Does the diff compare word by word or character by character?', answer: 'It generally compares at the word or line level to produce a readable diff, rather than a noisy character-by-character comparison.' },
      { question: 'Can I use this for comparing code snippets too?', answer: 'It works for code text, though for structured source files the dedicated Diff Checker tool may give clearer line-based results.' },
      { question: 'Is whitespace ignored when comparing?', answer: 'Minor whitespace differences can affect the diff result, so it is best to compare text with consistent formatting for the cleanest output.' },
      { question: 'Does it show which parts were only reordered rather than changed?', answer: 'Reordered text is generally shown as a deletion in one place and an addition in another, since the comparison does not track block movement separately.' },
      { question: 'Is either version of my text uploaded anywhere?', answer: 'No, the comparison is computed entirely in your browser.' },
    ],
    useCases: [
      'Comparing two drafts of an email or contract clause to see exactly what changed',
      'Reviewing an edited translation against the original text for accuracy',
      'Checking two versions of marketing copy before approving a revision',
      'Spotting subtle wording changes between two policy or documentation versions',
    ],
    tips: [
      'Keep formatting consistent between the two versions before comparing, stray whitespace differences can clutter the diff.',
      'For code specifically, use the dedicated Diff Checker tool instead, which gives clearer line-based results.',
      'Reordered content shows as a deletion plus an addition rather than a "moved" marker, so read both changes together to understand what actually happened.',
    ],
  },

  'json-formatter': {
    intro:
      'API developers debugging a malformed response payload, and backend engineers reviewing a config file, both need to quickly turn a wall of unformatted JSON into something readable. This formatter beautifies JSON with proper indentation, minifies it to save space, validates syntax and attempts basic repair of common mistakes, and offers a tree view so you can explore nested objects and arrays visually instead of scrolling through raw text.',
    steps: [
      { title: 'Paste your JSON', description: 'Add raw or minified JSON into the input panel.' },
      { title: 'Choose an action', description: 'Select Format to beautify, Minify to compact, or Validate to check syntax.' },
      { title: 'Switch to tree view', description: 'Explore nested objects and arrays interactively in the tree inspector.' },
      { title: 'Fix errors if flagged', description: 'Use the repair option or the reported error location to correct invalid JSON.' },
      { title: 'Copy the formatted result', description: 'Copy the cleaned-up JSON for use in your code or API tool.' },
    ],
    faqs: [
      { question: 'Can this tool fix broken or invalid JSON?', answer: 'It includes a basic repair feature that can fix common issues like trailing commas or missing quotes, but severely malformed JSON may still need manual correction.' },
      { question: 'Does the tree view let me collapse and expand nested objects?', answer: 'Yes, the tree inspector lets you expand and collapse objects and arrays so you can navigate deeply nested structures without scrolling through raw text.' },
      { question: 'Is there a size limit on the JSON I can format?', answer: 'Since formatting happens in your browser, very large JSON files are limited by your device memory rather than a fixed server-side limit.' },
      { question: 'Does minify remove comments from JSON?', answer: 'Standard JSON does not support comments, so if your input contains comment-like text it may cause a validation error rather than being stripped automatically.' },
      { question: 'Is my JSON data uploaded to a server?', answer: 'No, all parsing, formatting and validation run locally in your browser using JavaScript.' },
    ],
    useCases: [
      'Catching a malformed JSON payload before it hits production, using the validation and repair features',
      'Beautifying a minified API response to inspect its structure during debugging',
      'Minifying a config file before deploying it to reduce payload size',
      'Exploring a deeply nested API response using the tree view instead of scrolling raw text',
    ],
    tips: [
      'Use the tree view for deeply nested structures, collapsing branches is far faster than scanning indentation by eye.',
      'The repair feature handles common issues like trailing commas, but treat it as a starting point, not a guarantee, for badly malformed input.',
      'Remember standard JSON does not support comments, comment-like text will trigger a validation error rather than being stripped.',
    ],
  },

  'xml-formatter': {
    intro:
      'Integration developers working with SOAP APIs or configuration files often receive XML crammed onto a single line, making it nearly impossible to read. This formatter adds proper indentation to messy XML, or minifies it down to one line to save space, while also checking that the document is well-formed and pointing out where parsing errors occur, all without installing an IDE plugin.',
    steps: [
      { title: 'Paste your XML', description: 'Add the XML document or fragment into the input area.' },
      { title: 'Choose Format or Minify', description: 'Pick whether you want readable indentation or a compact single line.' },
      { title: 'Check validation results', description: 'Review any well-formedness errors and their reported location.' },
      { title: 'Copy the output', description: 'Copy the formatted or minified XML for your project.' },
    ],
    faqs: [
      { question: 'Does this validate XML against a schema (XSD)?', answer: 'No, it only checks that the XML is well-formed (properly nested and closed tags), it does not validate against an XSD or DTD schema.' },
      { question: 'Will it preserve CDATA sections and comments?', answer: 'Yes, standard CDATA sections and comments are preserved through formatting and minification.' },
      { question: 'Can it handle XML namespaces?', answer: 'Yes, namespace prefixes and declarations are treated as normal attributes and elements and are preserved as-is.' },
      { question: 'What happens if my XML has an unclosed tag?', answer: 'The validator reports a well-formedness error indicating the document could not be parsed, generally near the problematic tag.' },
      { question: 'Is my XML sent to a server for processing?', answer: 'No, formatting and validation both happen locally in your browser.' },
    ],
    useCases: [
      'Making a single-line SOAP API response readable enough to debug',
      'Reformatting a configuration file before committing it for code review',
      'Checking that an XML document is well-formed before feeding it into a parser',
      'Minifying an XML payload to shave bytes off a request before sending it',
    ],
    tips: [
      'Well-formedness checks catch unclosed or mismatched tags, but this does not validate against an XSD or DTD schema.',
      'CDATA sections and comments are preserved through formatting, so it is safe to run on documents that rely on them.',
      'If an error is reported, check near the location given first, the parser usually stops close to the actual problem.',
    ],
  },

  'yaml-formatter': {
    intro:
      'DevOps engineers editing a docker-compose file or a CI/CD pipeline definition need consistent YAML indentation, and sometimes need to quickly check the equivalent JSON structure. This tool reformats YAML with clean, consistent indentation and converts between YAML and JSON in either direction, making it easier to review config files or feed data into tools that expect one format or the other.',
    steps: [
      { title: 'Paste YAML or JSON', description: 'Add your source content into the input box.' },
      { title: 'Pick a conversion direction', description: 'Choose to format YAML, or convert YAML to JSON or JSON to YAML.' },
      { title: 'Review the output', description: 'Check the formatted or converted result for correctness.' },
      { title: 'Copy the result', description: 'Copy the output into your config file or codebase.' },
    ],
    faqs: [
      { question: 'Does this tool support YAML anchors and aliases?', answer: 'No, anchors, aliases and custom tags are not supported, stick to plain key-value and list structures for reliable results.' },
      { question: 'Can it handle multi-document YAML files separated by ---?', answer: 'Multi-document YAML files are not supported; format or convert one document at a time.' },
      { question: 'What happens if my YAML has inconsistent indentation?', answer: 'Since YAML structure depends on indentation, inconsistently indented input can be parsed incorrectly or reported as invalid, fix indentation before formatting.' },
      { question: 'Will converting YAML to JSON preserve comments?', answer: 'No, JSON has no concept of comments, so any comments in the YAML are dropped during conversion.' },
      { question: 'Is my configuration file uploaded anywhere?', answer: 'No, parsing and conversion happen entirely client-side in your browser.' },
    ],
    useCases: [
      'Cleaning up inconsistent indentation in a docker-compose.yml before committing it',
      'Converting a YAML pipeline definition to JSON to feed into a tool that expects JSON input',
      'Checking the equivalent JSON structure of a Kubernetes manifest for debugging',
      'Reformatting a messy YAML config pulled from another team\'s repository',
    ],
    tips: [
      'Fix indentation issues in the source before formatting, YAML structure depends on indentation, so inconsistent spacing can be misread.',
      'Avoid anchors, aliases and multi-document files split by "---" since neither is supported here.',
      'Remember comments are dropped when converting YAML to JSON, since JSON has no comment syntax, keep a copy of the original if comments matter.',
    ],
  },

  'sql-formatter': {
    intro:
      'DBAs reviewing a slow query and backend developers pasting a long SQL statement into a code review both benefit from having keywords capitalized and clauses broken onto their own lines. This formatter beautifies SQL queries by placing major clauses like SELECT, FROM, WHERE, JOIN and GROUP BY on separate indented lines with configurable indent size, turning a dense one-line query into something that is actually easy to read and review.',
    steps: [
      { title: 'Paste your SQL query', description: 'Add the raw or minified SQL statement into the input area.' },
      { title: 'Choose indentation settings', description: 'Set the indent size and dialect options if available.' },
      { title: 'Format the query', description: 'The tool restructures clauses onto separate, indented lines.' },
      { title: 'Copy the formatted SQL', description: 'Copy the readable query for your codebase or query tool.' },
    ],
    faqs: [
      { question: 'Does this formatter validate that my SQL syntax is correct?', answer: 'It focuses on formatting and indentation rather than full syntax validation, so it may still format a query that contains a logical or syntax error.' },
      { question: 'Does it support dialect-specific syntax like T-SQL or PL/pgSQL?', answer: 'It handles common standard SQL syntax well, but highly dialect-specific extensions may not be formatted with the same precision as a dedicated dialect-aware formatter.' },
      { question: 'Will it change my column or table names?', answer: 'No, it only affects whitespace, line breaks and keyword casing, identifiers like table and column names are left untouched.' },
      { question: 'Can it format very long queries with many joins and subqueries?', answer: 'Yes, nested subqueries and multiple joins are indented to reflect their structure, though extremely complex queries may need manual review afterward.' },
      { question: 'Is my SQL query sent to a server for formatting?', answer: 'No, formatting runs entirely in your browser using JavaScript.' },
    ],
    useCases: [
      'Turning a dense one-line query pasted from a slow query log into something reviewable',
      'Cleaning up a long query with multiple joins before pasting it into a pull request',
      'Standardizing keyword casing and indentation across a team\'s saved queries',
      'Making a generated ORM query readable enough to spot an obvious logic issue',
    ],
    tips: [
      'This formats structure and casing, it does not validate logic, a nicely formatted query can still be wrong.',
      'Adjust the indent size to match your team\'s existing SQL style guide before copying the result into a shared file.',
      'For heavily dialect-specific syntax like T-SQL extensions, review the output manually since formatting precision can vary.',
    ],
  },

  'html-formatter': {
    intro:
      'Cleaning up markup scraped from another website, or shrinking a page\'s HTML before deployment, are two very different needs served by the same tool. This formatter prettifies HTML with consistent, configurable indentation for readability, or minifies it into a single compact block to reduce file size, giving developers a quick way to tidy or compress markup without a full build pipeline.',
    steps: [
      { title: 'Paste your HTML', description: 'Add the markup you want to format or minify.' },
      { title: 'Set the indent size', description: 'Choose your preferred indentation width for Format mode.' },
      { title: 'Choose Format or Minify', description: 'Pick whether you want readable output or a compact single-line result.' },
      { title: 'Copy the result', description: 'Copy the processed HTML into your project.' },
    ],
    faqs: [
      { question: 'Will formatting change how the page renders in the browser?', answer: 'No, formatting only adjusts whitespace and indentation in the source code, it does not alter the DOM structure or how the page looks when rendered.' },
      { question: 'Does minify remove HTML comments?', answer: 'Minification typically strips unnecessary whitespace and can remove comments, which shrinks file size but also removes any inline notes for other developers.' },
      { question: 'Can it format embedded inline JavaScript and CSS inside <script> and <style> tags?', answer: 'Basic indentation is applied around these blocks, but the JavaScript or CSS content itself is not deeply reformatted, use the dedicated JS or CSS formatter for that.' },
      { question: 'Is this tool a substitute for an HTML validator?', answer: 'No, it focuses on formatting rather than checking for invalid or deprecated HTML, use a dedicated validator if you need standards compliance checking.' },
      { question: 'Is my HTML processed locally?', answer: 'Yes, everything runs in your browser with no data sent to a server.' },
    ],
    useCases: [
      'Prettifying markup scraped from another website to make it readable during review',
      'Minifying a page\'s HTML before deployment to shave off file size',
      'Cleaning up auto-generated markup from a page builder before hand-editing it',
      'Standardizing indentation across HTML templates maintained by multiple developers',
    ],
    tips: [
      'Formatting only touches whitespace and indentation, it will not fix invalid or deprecated markup, so pair it with a validator if standards compliance matters.',
      'Use the dedicated JS or CSS formatter for the contents of <script> and <style> blocks, this tool only lightly indents around them.',
      'Minifying strips comments along with whitespace, so keep an unminified copy if you rely on inline notes for other developers.',
    ],
  },

  'css-formatter': {
    intro:
      'A stylesheet minified for production is unreadable when you need to debug it, and a hand-written SCSS snippet copied from a tutorial often has inconsistent spacing. This tool formats CSS, plus basic SCSS and LESS syntax, into a clean, consistently indented layout, or minifies it into a compact single line to reduce file size before shipping to production.',
    steps: [
      { title: 'Paste your stylesheet', description: 'Add CSS, SCSS or LESS code into the input area.' },
      { title: 'Choose Format or Minify', description: 'Pick readable formatting or compact minification.' },
      { title: 'Review the output', description: 'Check that rules, selectors and properties are laid out correctly.' },
      { title: 'Copy the styles', description: 'Copy the result straight into your stylesheet or build process.' },
    ],
    faqs: [
      { question: 'Does this fully support SCSS features like nesting and mixins?', answer: 'Basic SCSS and LESS syntax is handled for formatting purposes, but this is a lightweight formatter, not a full preprocessor, it will not compile nested SCSS into plain CSS.' },
      { question: 'Will minifying my CSS break any functionality?', answer: 'Minification only removes whitespace and comments, so valid CSS should continue to work identically, but always test after minifying production stylesheets.' },
      { question: 'Does it reorder CSS properties alphabetically?', answer: 'No, it preserves your original property order and only adjusts indentation and line breaks.' },
      { question: 'Can it detect invalid CSS syntax?', answer: 'It is focused on formatting rather than strict validation, so some malformed CSS may still be reformatted without an explicit error.' },
      { question: 'Is my stylesheet uploaded anywhere during formatting?', answer: 'No, all formatting happens locally in your browser.' },
    ],
    useCases: [
      'Un-minifying a production stylesheet to debug a layout issue',
      'Cleaning up inconsistent spacing in a SCSS snippet copied from a tutorial',
      'Minifying CSS before shipping it to reduce page weight',
      'Standardizing indentation across stylesheets contributed by different developers',
    ],
    tips: [
      'This is a lightweight formatter, not a preprocessor, it will not compile nested SCSS or resolve mixins into plain CSS.',
      'Property order is preserved exactly as written, so use a separate linter if you want properties sorted alphabetically.',
      'Always spot-test a minified stylesheet in the browser afterward, even though minification should not change behavior.',
    ],
  },

  'js-formatter': {
    intro:
      'Sometimes you just need to quickly re-indent a tangled snippet of JavaScript or shrink a script before pasting it somewhere space-constrained, without pulling in a full build tool. This is a lightweight formatter that strips comments and extra whitespace to minify code, or re-indents based on bracket depth to make it readable again, a fast pocket tool rather than a full parser-based formatter like Prettier.',
    steps: [
      { title: 'Paste your JS or TS code', description: 'Add the script or snippet you want to clean up.' },
      { title: 'Choose Format or Minify', description: 'Pick re-indentation for readability or minification for size.' },
      { title: 'Review the result', description: 'Check that the output still looks correct for your snippet.' },
      { title: 'Copy the code', description: 'Copy the formatted or minified code back into your project.' },
    ],
    faqs: [
      { question: 'Is this the same as running Prettier?', answer: 'No, this is a lightweight, bracket-depth-based re-indenter and whitespace/comment stripper, not a full AST-based parser like Prettier, so it will not catch or fix syntax errors and may not perfectly format every edge case (template literals, complex JSX, etc).' },
      { question: 'Will minifying rename variables to shorten the code further?', answer: 'No, it only strips comments and unnecessary whitespace, it does not perform variable renaming or dead-code elimination like a dedicated bundler minifier (e.g. Terser) would.' },
      { question: 'Can I format TypeScript code, including types and interfaces?', answer: 'Basic TypeScript syntax is handled reasonably well since formatting is based on brackets and structure rather than full type parsing, but very complex generics or type-level code may not indent perfectly.' },
      { question: 'Is it safe to use this in a CI pipeline instead of Prettier or ESLint?', answer: 'It is best used for quick manual cleanup, not as a replacement for Prettier or ESLint in an automated pipeline, since it does not enforce a strict, verified style guide.' },
      { question: 'Does it upload my source code anywhere?', answer: 'No, all processing happens locally in your browser.' },
    ],
    useCases: [
      'Quickly re-indenting a tangled snippet of JavaScript pasted from a chat or forum post',
      'Shrinking a script before pasting it somewhere space-constrained, like a bug report or config field',
      'Getting a rough readable view of minified third-party code before digging into it',
      'Cleaning up a small TypeScript snippet without pulling a build tool into a one-off task',
    ],
    tips: [
      'Treat this as a pocket tool, not a Prettier replacement, it will not catch syntax errors or perfectly handle complex JSX or template literals.',
      'Do not rely on it in a CI pipeline in place of Prettier or ESLint since it does not enforce a verified style guide.',
      'Minify mode only strips comments and whitespace, it will not rename variables or eliminate dead code like a bundler minifier would.',
    ],
  },

  'url-encoder': {
    intro:
      'Building a query string with special characters, or debugging why a link with spaces and symbols is breaking, requires proper URL encoding. This tool encodes special characters in text so they are safe to embed inside a URL, or decodes an already-encoded string back to plain text, with a toggle between encoding a single URI component and encoding a full URL.',
    steps: [
      { title: 'Paste your text or URL', description: 'Enter the value you want to encode or decode.' },
      { title: 'Choose component or full URL mode', description: 'Select whether to encode just a query value or an entire URL.' },
      { title: 'Pick Encode or Decode', description: 'Choose the direction of the conversion.' },
      { title: 'Copy the result', description: 'Copy the encoded or decoded value for your link or code.' },
    ],
    faqs: [
      { question: 'What is the difference between encoding a component versus a full URL?', answer: 'Component encoding (encodeURIComponent) escapes nearly every special character including "/" and "&", suitable for a single query value, while full URL encoding (encodeURI) leaves characters like "/" and ":" untouched since they are structurally part of a valid URL.' },
      { question: 'Will decoding fail on malformed percent-encoded input?', answer: 'Yes, if the input contains an invalid percent-encoding sequence, decoding will report an error rather than silently guessing at the intended value.' },
      { question: 'Does it handle Unicode characters like emoji or non-Latin text?', answer: 'Yes, Unicode characters are encoded into their correct percent-encoded UTF-8 byte sequences and can be decoded back correctly.' },
      { question: 'Is URL encoding the same as Base64 encoding?', answer: 'No, they are different schemes for different purposes, URL encoding escapes characters for safe use in a URL, while Base64 encodes binary data as ASCII text; use the dedicated Base64 tool for that.' },
      { question: 'Is any of this data sent to a server?', answer: 'No, encoding and decoding use built-in browser JavaScript functions and never leave your device.' },
    ],
    useCases: [
      'Building a query string value that contains spaces, ampersands or other special characters',
      'Debugging why a shared link with symbols or accented characters is breaking when clicked',
      'Decoding a percent-encoded parameter found in server logs or browser dev tools',
      'Encoding user input safely before appending it to a URL in application code',
    ],
    tips: [
      'Use component encoding (encodeURIComponent) for a single query value, and full URL encoding (encodeURI) when the input is already a whole URL.',
      'A decode error usually means the input has an invalid percent-encoding sequence, check for stray "%" characters not followed by two hex digits.',
      'Do not confuse this with Base64, URL encoding escapes characters for safe URL use, while Base64 encodes binary data as text.',
    ],
  },

  'base64': {
    intro:
      'Embedding a small image inline in CSS, sending binary data safely inside a JSON payload, or decoding a Base64 string found in an API response are all common developer tasks. This tool encodes text or uploaded files into Base64, and decodes Base64 strings back into their original text or downloadable file, all processed locally without uploading your data anywhere.',
    steps: [
      { title: 'Enter text or choose a file', description: 'Type text directly, or upload a file you want to encode.' },
      { title: 'Select Encode or Decode', description: 'Pick the direction based on what you are starting with.' },
      { title: 'Run the conversion', description: 'The tool processes the input instantly in your browser.' },
      { title: 'Copy or download the result', description: 'Copy the text result, or download the decoded file.' },
    ],
    faqs: [
      { question: 'Can I encode binary files like images, not just text?', answer: 'Yes, you can upload a file and the tool will produce its Base64 representation, which is useful for embedding small assets directly in code or data URIs.' },
      { question: 'Why does decoding sometimes fail with an error?', answer: 'Decoding fails if the input is not valid Base64, for example if it contains characters outside the Base64 alphabet or has incorrect padding.' },
      { question: 'Is Base64 encoding a form of encryption?', answer: 'No, Base64 is only an encoding scheme for representing binary data as text, it provides no security or confidentiality, and anyone can decode it instantly.' },
      { question: 'Does it support URL-safe Base64 variants?', answer: 'Standard Base64 with "+" and "/" characters is supported; if you need the URL-safe variant using "-" and "_" you may need to substitute characters manually.' },
      { question: 'Is my file or text uploaded to a server during encoding?', answer: 'No, all encoding and decoding happens locally using the Web APIs available in your browser.' },
    ],
    useCases: [
      'Embedding a small image inline as a data URI in CSS or HTML',
      'Encoding binary data safely for inclusion inside a JSON payload',
      'Decoding a Base64 string found in an API response to inspect its actual content',
      'Converting a small file to Base64 for a config value or environment variable',
    ],
    tips: [
      'Remember Base64 is not encryption, anyone can decode it instantly, so never use it to hide sensitive data.',
      'If decoding fails, check for missing padding or characters outside the standard Base64 alphabet.',
      'For URL-safe contexts, be ready to swap "+" and "/" for "-" and "_" manually, since only standard Base64 is produced here.',
    ],
  },

  'jwt-decoder': {
    intro:
      'When an API call fails with an authorization error, developers often need to inspect the claims inside a JWT to see the expiry time, issuer or user data without writing a script. This tool splits a JSON Web Token into its header, payload and signature, decodes the header and payload from Base64URL, and flags whether the token has expired, making it easy to debug login and API auth issues.',
    steps: [
      { title: 'Paste the JWT', description: 'Add the full token string, including all three dot-separated parts.' },
      { title: 'View the decoded header and payload', description: 'The tool decodes and displays the header and payload as readable JSON.' },
      { title: 'Check the expiry status', description: 'Look at the highlighted exp claim to see if the token is expired.' },
      { title: 'Inspect specific claims', description: 'Review individual claims like sub, iat and custom fields.' },
    ],
    faqs: [
      { question: 'Does this tool verify the JWT signature?', answer: 'No, it only decodes the header and payload from Base64URL to show their contents; it does not verify the signature against a secret or public key, so a decoded token could still be forged or tampered with.' },
      { question: 'Can I trust the claims shown without also verifying the token server-side?', answer: 'No, decoding alone tells you what a token claims, not whether those claims are authentic, always verify the signature server-side before trusting the token in a real authentication flow.' },
      { question: 'Why does the tool say my token is expired?', answer: 'It compares the "exp" claim, a Unix timestamp, against the current time on your device, and flags the token as expired if that time has passed.' },
      { question: 'Does it work with JWTs signed using RS256 as well as HS256?', answer: 'Yes, since decoding does not require the signing key, it works the same way regardless of which signing algorithm was used.' },
      { question: 'Is my token sent to a server when I paste it here?', answer: 'No, decoding happens entirely in your browser, the token, which may contain sensitive claims, never leaves your device.' },
    ],
    useCases: [
      'Debugging an API 401 error by checking a token\'s expiry and issuer claims',
      'Inspecting custom claims added to a JWT during a login flow implementation',
      'Verifying an access token contains the expected scopes before troubleshooting an authorization bug',
      'Checking whether a token from a support ticket has simply expired',
    ],
    tips: [
      'This only decodes the token, it does not verify the signature, never treat the displayed claims as proof of authenticity.',
      'Compare the "exp" claim against the current time in the token\'s own timezone context, since it is a Unix timestamp evaluated against your device clock.',
      'Because tokens can contain sensitive data, avoid pasting production tokens into any tool you do not fully trust, this one processes everything locally.',
    ],
  },

  'uuid-generator': {
    intro:
      'Database engineers seeding test records, and developers needing unique identifiers for new objects, both need a fast, reliable way to generate UUIDs without relying on a backend call. This generator produces RFC4122-compliant version 4 UUIDs in bulk, with options for uppercase or lowercase casing and different separator styles, so you can paste a batch straight into SQL inserts, config files, or test fixtures.',
    steps: [
      { title: 'Set the quantity', description: 'Choose how many UUIDs you want to generate at once.' },
      { title: 'Choose casing and format', description: 'Pick uppercase or lowercase, and any separator or hyphen style you need.' },
      { title: 'Generate the UUIDs', description: 'Click generate to produce the list instantly.' },
      { title: 'Copy or download the list', description: 'Copy all generated IDs, or download them as a text file.' },
    ],
    faqs: [
      { question: 'Are these UUIDs guaranteed to be globally unique?', answer: 'Version 4 UUIDs are generated using random or pseudo-random numbers with such a large possible value space that collisions are astronomically unlikely, though not mathematically impossible.' },
      { question: 'What randomness source does the generator use?', answer: 'It uses your browser\'s cryptographically secure random number generator (crypto.getRandomValues) where available, which produces stronger randomness than a simple Math.random-based approach.' },
      { question: 'Can I generate UUIDs without hyphens?', answer: 'Yes, you can choose a formatting option that removes the standard hyphens if your use case needs a plain 32-character hex string.' },
      { question: 'Does this generate UUID versions other than v4, like v1 or v7?', answer: 'This tool focuses on random version 4 UUIDs, the most common general-purpose type; time-based versions like v1 or v7 are not generated here.' },
      { question: 'Are the generated IDs sent to or logged on a server?', answer: 'No, generation happens entirely client-side, so the IDs never leave your browser unless you copy them yourself.' },
    ],
    useCases: [
      'Seeding test database records with unique identifiers before running a migration test',
      'Generating primary key values for new objects during local development',
      'Producing a batch of IDs for test fixtures or mock API responses',
      'Creating unique file or session identifiers without a backend round trip',
    ],
    tips: [
      'Generate in bulk and paste the whole batch into a SQL insert or fixture file rather than generating one at a time.',
      'Choose the no-hyphen format if your target system expects a plain 32-character hex string.',
      'This produces only random v4 UUIDs, use a dedicated library if you need time-ordered v1 or v7 identifiers.',
    ],
  },

  'hash-generator': {
    intro:
      'Verifying that a downloaded file has not been corrupted, or generating a checksum to compare two versions of a document, both rely on cryptographic hashing. This tool generates MD5, SHA-1, SHA-256 and SHA-512 hashes of any text you enter, using the browser\'s built-in Web Crypto API for the SHA algorithms, so you can quickly produce and compare fingerprints without installing command-line tools.',
    steps: [
      { title: 'Enter your text', description: 'Type or paste the text you want to hash.' },
      { title: 'Choose a hash algorithm', description: 'Select MD5, SHA-1, SHA-256 or SHA-512.' },
      { title: 'View the generated hash', description: 'The hash is computed and displayed instantly.' },
      { title: 'Copy the hash', description: 'Copy the resulting hash for comparison or storage.' },
    ],
    faqs: [
      { question: 'Can I convert a hash back into the original text?', answer: 'No, hashing is a one-way function by design, there is no way to reverse a hash back into its original input, which is exactly what makes hashes useful for integrity checks and password storage.' },
      { question: 'Is MD5 or SHA-1 safe to use for security purposes?', answer: 'No, both MD5 and SHA-1 are considered cryptographically broken for security-sensitive purposes like password hashing or digital signatures due to known collision vulnerabilities, use SHA-256 or SHA-512 for anything security-related.' },
      { question: 'Why would two different pieces of text produce the same hash?', answer: 'This is called a hash collision, and while theoretically possible for any hash function, it is computationally impractical to find for SHA-256 and SHA-512, and only practically demonstrated for weaker algorithms like MD5.' },
      { question: 'Can I hash a file instead of just text?', answer: 'This tool is designed for hashing text input directly; for hashing files you would need to first extract or paste their text content.' },
      { question: 'Is my text sent to a server to compute the hash?', answer: 'No, hashing is computed locally using the Web Crypto API built into your browser.' },
    ],
    useCases: [
      'Generating a checksum to verify two versions of a document are byte-for-byte identical',
      'Producing a SHA-256 hash to compare against a published file checksum after download',
      'Creating a quick fingerprint of a text blob for cache-busting or deduplication logic',
      'Testing hash output for a small piece of data before wiring up the same logic in code',
    ],
    tips: [
      'Use SHA-256 or SHA-512 for anything security-related, MD5 and SHA-1 are broken for that purpose and should only be used for simple integrity checks.',
      'Remember hashing is one-way, there is no decode option because none exists mathematically.',
      'To hash a file, extract or paste its text content first, since this tool hashes text input directly.',
    ],
  },

  'diff-checker': {
    intro:
      'Reviewing a pull request without a Git client handy, or comparing two versions of a config file before deploying, is much faster with a visual diff. This tool compares two blocks of code or text line by line and produces a color-coded diff showing exactly what was added, removed, or left unchanged, giving developers a quick way to sanity-check edits before committing them.',
    steps: [
      { title: 'Paste the original version', description: 'Add the first file or code block into the left panel.' },
      { title: 'Paste the changed version', description: 'Add the updated file or code block into the right panel.' },
      { title: 'Compare', description: 'Run the comparison to generate the line-by-line diff.' },
      { title: 'Review the color-coded changes', description: 'Added, removed and unchanged lines are marked in distinct colors.' },
    ],
    faqs: [
      { question: 'Does this diff work line by line or character by character?', answer: 'It primarily compares line by line, similar to a standard git diff, which makes it easy to spot which lines were added, removed or modified in code and config files.' },
      { question: 'Can I use it to compare two versions of a whole file?', answer: 'Yes, paste the full contents of each file version into the two panels and the tool will compute the differences across the entire content.' },
      { question: 'Does it ignore whitespace-only differences?', answer: 'By default, whitespace differences like extra spaces or indentation changes are treated as real changes; check for a whitespace-ignore option if you only care about content changes.' },
      { question: 'Is this a replacement for git diff in a real repository?', answer: 'It is meant for quick ad hoc comparisons of pasted text rather than replacing git\'s full diff and merge tooling for an actual repository workflow.' },
      { question: 'Are the two texts I paste uploaded anywhere?', answer: 'No, the comparison is computed entirely in your browser.' },
    ],
    useCases: [
      'Reviewing a pull request line by line without pulling the branch locally',
      'Comparing two versions of a config file before deploying a change',
      'Sanity-checking an automated code transformation against the original file',
      'Spotting exactly what changed between two saved drafts of a script',
    ],
    tips: [
      'Paste full file contents on both sides for the clearest line-by-line comparison rather than partial snippets.',
      'Check for a whitespace-ignore option if indentation-only changes are cluttering the diff with noise.',
      'Use this for quick ad hoc comparisons, for an actual repository workflow, git diff and merge tooling still handle history and conflicts better.',
    ],
  },

  'markdown-preview': {
    intro:
      'Writing documentation, a GitHub README, or a blog post in Markdown is much easier when you can see the rendered result as you type instead of guessing how headings and code blocks will look. This live Markdown editor shows your rendered HTML side by side with the source, updating instantly as you write headings, lists, links, tables and code blocks.',
    steps: [
      { title: 'Type or paste Markdown', description: 'Write your content in the editor panel using standard Markdown syntax.' },
      { title: 'Watch the live preview', description: 'The rendered HTML updates automatically on the other side as you type.' },
      { title: 'Adjust formatting as needed', description: 'Tweak headings, lists, links or code blocks and see the effect immediately.' },
      { title: 'Copy the Markdown or rendered HTML', description: 'Copy either the source Markdown or the generated HTML for your project.' },
    ],
    faqs: [
      { question: 'Does it support GitHub-flavored Markdown features like tables and task lists?', answer: 'Yes, common GitHub-flavored Markdown elements such as tables, task list checkboxes, and fenced code blocks with syntax highlighting are generally supported.' },
      { question: 'Can I export the rendered output as HTML?', answer: 'Yes, you can copy the rendered HTML output to embed elsewhere, separate from the raw Markdown source.' },
      { question: 'Does it support embedded raw HTML inside the Markdown?', answer: 'Basic inline HTML is typically rendered as part of the preview, consistent with how most Markdown parsers treat embedded HTML tags.' },
      { question: 'Will my Markdown be saved anywhere if I close the tab?', answer: 'No, the editor works entirely in memory in your browser session, so unsaved content is lost if you close or refresh the tab without copying it out.' },
      { question: 'Is any of my writing sent to a server?', answer: 'No, Markdown parsing and rendering happen locally using client-side JavaScript.' },
    ],
    useCases: [
      'Writing a GitHub README and checking how headings, tables and code blocks will actually render',
      'Drafting a blog post in Markdown while previewing the formatted result as you go',
      'Checking that a task list or table renders correctly before pushing documentation',
      'Reviewing how fenced code blocks with syntax highlighting will look before publishing',
    ],
    tips: [
      'The editor holds content only in memory for the session, copy your Markdown out before closing or refreshing the tab.',
      'Check embedded raw HTML in the preview if your Markdown mixes in inline tags, since rendering follows standard Markdown-parser behavior.',
      'Copy the rendered HTML directly if you need to paste formatted content into a tool that does not support Markdown.',
    ],
  },

  'html-markdown': {
    intro:
      'Pulling an article out of a webpage to paste into a README, or turning Markdown release notes into HTML for an email newsletter, both require format conversion that is tedious to do by hand. This tool converts HTML into clean Markdown, or Markdown into HTML, in either direction, letting developers and writers move content between formats without manually rewriting headings, links and lists.',
    steps: [
      { title: 'Paste your source content', description: 'Add HTML markup or Markdown text into the input box.' },
      { title: 'Choose the conversion direction', description: 'Select HTML to Markdown, or Markdown to HTML.' },
      { title: 'Convert', description: 'The tool transforms the content into the target format.' },
      { title: 'Copy the converted result', description: 'Copy the output into your README, CMS, or email tool.' },
    ],
    faqs: [
      { question: 'Will HTML-to-Markdown conversion preserve complex layouts like nested tables?', answer: 'Simple structures like headings, links, lists and basic tables convert cleanly, but deeply nested or heavily styled HTML layouts may lose some visual fidelity since Markdown has a simpler feature set than HTML.' },
      { question: 'Does Markdown-to-HTML conversion include a full stylesheet?', answer: 'No, it generates semantic HTML elements without any styling, you will need to apply your own CSS if you want the output to match a specific visual design.' },
      { question: 'What happens to inline styles or custom HTML attributes when converting to Markdown?', answer: 'Inline styles and custom attributes are generally dropped during conversion, since Markdown does not have an equivalent syntax for arbitrary HTML attributes.' },
      { question: 'Can I round-trip content, converting HTML to Markdown and back, without losing anything?', answer: 'For simple content the round trip is usually close to lossless, but complex formatting like custom classes, multi-column layouts or embedded scripts will not survive the conversion in either direction.' },
      { question: 'Is my content processed on a server during conversion?', answer: 'No, the conversion logic runs entirely in your browser using JavaScript.' },
    ],
    useCases: [
      'Pulling an article out of a webpage and converting it to Markdown for a README or wiki',
      'Turning Markdown release notes into HTML for an email newsletter',
      'Migrating documentation content between a Markdown-based wiki and an HTML-based CMS',
      'Converting a Markdown changelog into HTML to embed in a product update page',
    ],
    tips: [
      'Expect simple structures like headings, links and lists to convert cleanly, but review deeply nested tables or heavily styled HTML by hand afterward.',
      'Markdown-to-HTML output has no styling attached, apply your own CSS if you need it to match a specific design.',
      'Do not expect a lossless round trip for complex content, custom classes, multi-column layouts and embedded scripts do not survive conversion either direction.',
    ],
  },
};
