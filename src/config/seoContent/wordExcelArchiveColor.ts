import { ToolSeoMap } from './types';

export const WORD_EXCEL_ARCHIVE_COLOR_SEO_CONTENT: ToolSeoMap = {
  'docx-to-pdf': {
    intro:
      'This tool converts a Microsoft Word .docx file into a shareable PDF right in your browser tab, which is handy when you need to send a resume, contract, or report in a format that looks identical on every device. Because the conversion runs on your own machine using in-browser rendering, your document text never leaves your computer or touches a remote server. It works well for straightforward documents with standard fonts, headings, and images.',
    steps: [
      { title: 'Select your Word file', description: 'Click the upload area or drag a .docx file into the tool.' },
      { title: 'Wait for local processing', description: 'The document is parsed and rendered entirely in your browser.' },
      { title: 'Review the preview', description: 'Check that headings, paragraphs, and images look correct before exporting.' },
      { title: 'Download the PDF', description: 'Save the generated PDF file to your device.' },
    ],
    faqs: [
      { question: 'Is my Word document uploaded to a server?', answer: 'No. The .docx to PDF conversion happens locally in your browser tab, so the file content is never transmitted anywhere.' },
      { question: 'Will complex formatting be preserved?', answer: 'Standard formatting like headings, bold/italic text, bullet lists, and embedded images convert well. Very complex layouts with nested tables or unusual fonts may render slightly differently than in Word.' },
      { question: 'Is there a file size limit?', answer: 'There is no artificial cap, but very large documents (hundreds of pages or many high-resolution images) depend on your device memory and may take longer to process.' },
      { question: 'Does it work on mobile browsers?', answer: 'Yes, it runs in any modern browser, though converting large files is faster on a desktop with more available memory.' },
      { question: 'Can I convert multiple files at once?', answer: 'You can convert files one after another; each conversion is processed independently in your browser.' },
    ],
  },
  'docx-to-html': {
    intro:
      'Use this tool to pull clean, structured HTML markup out of a Word document so you can paste it into a CMS, blog editor, or static site without wrestling with Word\'s bloated export format. It keeps headings, lists, and tables intact while converting locally, so the source document stays private. This is especially useful for content writers who draft in Word but publish on the web.',
    steps: [
      { title: 'Upload the DOCX file', description: 'Choose the Word document you want to convert.' },
      { title: 'Let the browser parse it', description: 'The document structure is read and mapped to semantic HTML tags.' },
      { title: 'Copy or download the markup', description: 'Grab the generated HTML with the copy button or save it as a file.' },
      { title: 'Paste into your editor', description: 'Drop the HTML into your CMS, blog, or website source.' },
    ],
    faqs: [
      { question: 'Will the HTML include inline styles or just structure?', answer: 'The tool focuses on semantic markup such as headings, paragraphs, lists, and tables rather than copying every Word-specific style, which keeps the output clean for reuse on the web.' },
      { question: 'Are images preserved?', answer: 'Images embedded in the document are extracted and referenced in the output markup where the conversion supports it.' },
      { question: 'Is my document sent anywhere?', answer: 'No, everything is processed locally in your browser; nothing is uploaded to a server.' },
      { question: 'What about tables and nested lists?', answer: 'Tables and lists are converted to their HTML equivalents; extremely complex nested structures may need minor manual cleanup afterward.' },
      { question: 'Can I use this output directly in WordPress or another CMS?', answer: 'Yes, the generated HTML is meant to be pasted directly into a rich text or HTML editor.' },
    ],
  },
  'docx-to-markdown': {
    intro:
      'This converter turns a Word document into clean Markdown, which is ideal if you are moving documentation from Word into a README, static site generator, or note-taking app that speaks Markdown. Headings become # syntax, bold and italic text keep their emphasis markers, and lists are reformatted with proper dashes or numbers. All parsing happens client-side, so the document never leaves your device.',
    steps: [
      { title: 'Choose your Word file', description: 'Upload the .docx document you want converted.' },
      { title: 'Processing runs in-browser', description: 'The tool reads the document structure and maps it to Markdown syntax.' },
      { title: 'Preview the Markdown output', description: 'Scan the result to confirm headings and formatting translated correctly.' },
      { title: 'Download the .md file', description: 'Save the Markdown file or copy it directly to your clipboard.' },
    ],
    faqs: [
      { question: 'Does it handle tables?', answer: 'Simple tables are converted to Markdown table syntax; very complex or merged-cell tables may need manual touch-up.' },
      { question: 'Will links and formatting survive the conversion?', answer: 'Hyperlinks, bold, italic, and list formatting are mapped to their standard Markdown equivalents.' },
      { question: 'Is this safe for confidential documents?', answer: 'Yes, conversion happens entirely in your browser with no file upload, so confidential content stays on your machine.' },
      { question: 'What Markdown flavor does it produce?', answer: 'It outputs widely compatible standard Markdown that works in most static site generators, GitHub, and note apps.' },
      { question: 'Can I edit the result afterward?', answer: 'Yes, the output is plain text, so you can copy it into any text editor and adjust it before publishing.' },
    ],
  },
  'docx-to-txt': {
    intro:
      'When you just need the words from a Word document without any formatting, this tool strips out styles, fonts, and layout to give you raw plain text. It is useful for feeding document content into another app, running a quick word count, or archiving text without the overhead of a binary Word file. The extraction happens locally in your browser rather than on a remote server.',
    steps: [
      { title: 'Upload your DOCX file', description: 'Select the Word document you want the plain text from.' },
      { title: 'Automatic text extraction', description: 'The tool reads the document body and strips all formatting locally.' },
      { title: 'Review the plain text', description: 'Scroll through the extracted text to confirm nothing important was lost.' },
      { title: 'Copy or download as .txt', description: 'Use the copy button or download the plain text file.' },
    ],
    faqs: [
      { question: 'Does it keep paragraph breaks?', answer: 'Yes, paragraph and line breaks are preserved so the text remains readable, even though styling is removed.' },
      { question: 'What happens to images and tables?', answer: 'Images are dropped since this is a plain text extraction; table cell text is typically flattened into readable lines.' },
      { question: 'Is the file uploaded anywhere?', answer: 'No, the DOCX file is parsed directly in your browser and never sent to a server.' },
      { question: 'Does it work with older .doc files?', answer: 'This tool is built for the modern .docx XML format; legacy binary .doc files are not supported.' },
      { question: 'Can I use this for large documents?', answer: 'Yes, though very large files depend on your browser\'s available memory to process quickly.' },
    ],
  },
  'html-to-docx': {
    intro:
      'This tool takes raw HTML markup and turns it into a formatted Word .docx file, which is useful when you have web content, an exported blog post, or an email template that needs to become an editable Word document. Headings, bold and italic text, and lists are translated into corresponding Word styles. Since everything is generated locally, your HTML content and the resulting document never pass through an external server.',
    steps: [
      { title: 'Paste or upload your HTML', description: 'Enter HTML markup directly into the input area.' },
      { title: 'Convert in your browser', description: 'The tool builds a valid DOCX structure locally from the HTML tags.' },
      { title: 'Preview the result', description: 'Check that headings, text formatting, and lists mapped correctly.' },
      { title: 'Download the Word document', description: 'Save the generated .docx file to open in Word or Google Docs.' },
    ],
    faqs: [
      { question: 'Which HTML tags are supported?', answer: 'Common tags such as headings, paragraphs, bold/italic text, links, and lists convert reliably; highly custom CSS layouts may not carry over exactly.' },
      { question: 'Is my HTML content uploaded anywhere?', answer: 'No, the DOCX file is built entirely client-side in your browser.' },
      { question: 'Can I open the output in both Microsoft Word and Google Docs?', answer: 'Yes, the generated file follows the standard .docx format compatible with Word, Google Docs, and LibreOffice.' },
      { question: 'Will inline CSS styles be preserved exactly?', answer: 'Basic styling like bold, italics, and color is preserved where possible, but pixel-perfect CSS layouts are not guaranteed since Word uses its own styling model.' },
      { question: 'Does it support embedded images in the HTML?', answer: 'Image tags with accessible sources are included where the converter can read the image data.' },
    ],
  },
  'markdown-to-docx': {
    intro:
      'This tool converts Markdown text or files into a properly formatted Word document, applying Word heading styles, bullet and numbered lists, and inline emphasis automatically. It is a fast way to turn README files, notes, or documentation written in Markdown into a .docx you can share with people who expect a Word file. The whole conversion process runs locally in your browser, so your notes stay private.',
    steps: [
      { title: 'Paste or upload your Markdown', description: 'Type Markdown text directly or upload a .md file.' },
      { title: 'Automatic style mapping', description: 'Headings, lists, and emphasis are mapped to matching Word styles.' },
      { title: 'Preview the formatted document', description: 'Check that the structure and formatting look right.' },
      { title: 'Download the DOCX file', description: 'Save the finished Word document to your device.' },
    ],
    faqs: [
      { question: 'Does it support code blocks?', answer: 'Fenced code blocks are converted using a monospace style so code stays readable in the resulting Word document.' },
      { question: 'Are tables in Markdown converted too?', answer: 'Markdown table syntax is translated into native Word tables.' },
      { question: 'Is my Markdown content sent to a server?', answer: 'No, conversion happens entirely in your browser without uploading any content.' },
      { question: 'Can I edit the resulting document in Word afterward?', answer: 'Yes, the output is a standard editable .docx file you can open and modify in Word or any compatible editor.' },
      { question: 'What Markdown syntax is supported?', answer: 'Standard Markdown elements including headings, bold/italic, links, lists, and tables are supported.' },
    ],
  },
  'word-viewer': {
    intro:
      'This viewer lets you open and read a .docx file directly in your browser without owning a copy of Microsoft Word or uploading the file to a third-party viewer. It renders the document with pagination so long files are easy to scroll through, which is useful when you just need to quickly check the contents of a file someone sent you. Because rendering happens on-device, the document contents are never transmitted anywhere.',
    steps: [
      { title: 'Open the Word Viewer tool', description: 'Navigate to the tool page in your browser.' },
      { title: 'Upload the DOCX file', description: 'Select or drag in the Word document you want to view.' },
      { title: 'Browse the rendered pages', description: 'Scroll or page through the document as it renders locally.' },
      { title: 'Print or close when done', description: 'Use your browser\'s print function if you need a hard copy, or simply close the tab.' },
    ],
    faqs: [
      { question: 'Do I need Microsoft Word installed to use this?', answer: 'No, this tool renders .docx files directly in the browser, so you can view them without having Word or any other office suite installed.' },
      { question: 'Is the document uploaded to a server to be rendered?', answer: 'No, rendering happens locally in your browser; the file is never sent anywhere.' },
      { question: 'Can I edit the document here?', answer: 'This tool is read-only for viewing; use a dedicated editor if you need to make changes to the content.' },
      { question: 'Does it support password-protected files?', answer: 'Password-protected or encrypted DOCX files are not supported since the browser cannot decrypt them without the original password flow.' },
      { question: 'Will formatting look exactly like in Microsoft Word?', answer: 'Most standard formatting renders accurately, though very Word-specific features may appear slightly different.' },
    ],
  },
  'word-metadata': {
    intro:
      'This tool inspects the hidden metadata stored inside a .docx file, such as the author name, creation and last-modified dates, revision number, and any custom document properties. It is a quick way to check who last touched a document or verify authorship before sharing a file externally, without needing to open Word\'s document properties dialog. All metadata is read locally in your browser.',
    steps: [
      { title: 'Upload the Word document', description: 'Select the .docx file whose metadata you want to inspect.' },
      { title: 'View the extracted metadata', description: 'The tool reads the document\'s core and app properties locally.' },
      { title: 'Check fields of interest', description: 'Look at author, dates, revision count, and custom properties.' },
      { title: 'Edit or export if needed', description: 'Update fields where supported and save the file with revised metadata.' },
    ],
    faqs: [
      { question: 'What metadata fields does it show?', answer: 'Typical fields include author, company, creation date, last modified date, last modified by, and revision number, along with any custom document properties.' },
      { question: 'Is this useful for removing personal information before sharing?', answer: 'Yes, checking metadata is a good first step before sending a document externally, since author names and edit history can reveal more than intended.' },
      { question: 'Is my file uploaded to see the metadata?', answer: 'No, the metadata is extracted directly from the file in your browser without any upload.' },
      { question: 'Can I remove or change the metadata?', answer: 'Where editing is supported, you can update fields like author or title and save a new copy with the revised metadata.' },
      { question: 'Does it work on documents created in Google Docs and exported to DOCX?', answer: 'Yes, as long as the file follows the standard .docx XML format, its embedded metadata can be read.' },
    ],
  },
  'word-compare': {
    intro:
      'This tool compares two versions of a Word document and highlights the differences between them, making it easy to spot added, removed, or changed text without manually scanning both files line by line. It is helpful for reviewing contract revisions, tracking edits between drafts, or confirming that a colleague\'s changes match what was agreed. Both documents are compared locally in your browser rather than being uploaded anywhere.',
    steps: [
      { title: 'Upload the first document', description: 'Select the original or older version of the .docx file.' },
      { title: 'Upload the second document', description: 'Select the revised or newer version to compare against.' },
      { title: 'Run the comparison', description: 'The tool analyzes both files locally and highlights differences.' },
      { title: 'Review the highlighted diff', description: 'Scan insertions and deletions shown side by side or inline.' },
    ],
    faqs: [
      { question: 'What kind of changes does it detect?', answer: 'It highlights inserted, deleted, and modified text between the two versions of the document.' },
      { question: 'Are both files uploaded to a server for comparison?', answer: 'No, both documents are parsed and compared entirely within your browser.' },
      { question: 'Does it compare formatting changes too, or just text?', answer: 'The comparison focuses primarily on text content differences; purely visual formatting changes may not always be flagged.' },
      { question: 'Can I export the comparison result?', answer: 'Yes, the highlighted differences can be exported or saved as a comparison report where supported.' },
      { question: 'Does file size affect comparison speed?', answer: 'Very large or heavily formatted documents may take a bit longer to process since everything runs on your device rather than a server.' },
    ],
  },
  'word-remove-format': {
    intro:
      'Use this tool to strip all formatting, styles, and tracked-change artifacts from a Word document, leaving behind clean plain content that is easy to paste elsewhere without carrying over odd fonts or leftover styles. It is particularly useful when copying text from a heavily formatted document into a plain editor or a new template. The cleanup happens directly in your browser without uploading the file.',
    steps: [
      { title: 'Upload the DOCX file', description: 'Select the Word document you want to clean up.' },
      { title: 'Automatic formatting removal', description: 'The tool strips inline styles, comments, and tracked changes locally.' },
      { title: 'Review the cleaned content', description: 'Confirm the text content is intact and free of formatting.' },
      { title: 'Download the clean file', description: 'Save the formatting-free document to your device.' },
    ],
    faqs: [
      { question: 'Does this remove tracked changes and comments too?', answer: 'Yes, tracked changes and comments are stripped along with inline formatting, leaving just the finalized text.' },
      { question: 'Will the text content be changed or lost?', answer: 'No, the actual words and paragraph structure are preserved; only visual styling and metadata like comments are removed.' },
      { question: 'Is my document uploaded to a server during cleanup?', answer: 'No, formatting removal is done entirely client-side in your browser.' },
      { question: 'What format is the output saved as?', answer: 'The cleaned result can be downloaded as a plain, unformatted document or plain text depending on your chosen output.' },
      { question: 'Is this useful for removing tracked-change history before sharing?', answer: 'Yes, it is a quick way to make sure a document you send externally does not carry hidden edit history.' },
    ],
  },
  'csv-viewer': {
    intro:
      'This tool lets you open a CSV or TSV file and browse it as a readable table instead of squinting at raw comma-separated text in a plain text editor. You can upload a file or paste data directly, switch the delimiter between comma, tab, pipe, or semicolon, and the table updates instantly. Everything is parsed locally with a lightweight hand-written parser, so your data never leaves your browser.',
    steps: [
      { title: 'Upload or paste your data', description: 'Drag in a .csv/.tsv file or paste delimited text into the box.' },
      { title: 'Pick the correct delimiter', description: 'Choose comma, tab, pipe, or semicolon if it is not auto-detected.' },
      { title: 'Browse the rendered table', description: 'Scroll through rows and columns in the formatted table view.' },
      { title: 'Check the row and column count', description: 'Use the summary count to confirm the file loaded as expected.' },
    ],
    faqs: [
      { question: 'Does it support Excel .xlsx files?', answer: 'No, this viewer is built for delimited text files like CSV and TSV, not the binary .xlsx spreadsheet format.' },
      { question: 'Is my data uploaded anywhere?', answer: 'No, the file is read and parsed entirely in your browser using JavaScript; nothing is sent to a server.' },
      { question: 'What happens with quoted fields containing commas?', answer: 'The parser correctly handles quoted fields, including commas, quotes, and line breaks inside quoted values, following standard CSV quoting rules.' },
      { question: 'Is there a limit on file size or row count?', answer: 'There is no hard-coded limit, but extremely large files depend on your browser\'s memory and may render more slowly.' },
      { question: 'Can I switch delimiters after loading a file?', answer: 'Yes, you can change the delimiter setting at any time and the table will re-parse the existing text.' },
    ],
  },
  'csv-editor': {
    intro:
      'This interactive editor turns CSV or TSV data into a spreadsheet-style grid where you can edit cell values, add or remove rows and columns, and rename headers, then export the result as a new CSV file. It is useful for making quick fixes to a data export without opening a full spreadsheet application. All editing happens in your browser and nothing is uploaded until you choose to download the file.',
    steps: [
      { title: 'Load your CSV or TSV data', description: 'Upload a file or paste delimited text into the input box.' },
      { title: 'Edit cells directly', description: 'Click into any cell or header to change its value.' },
      { title: 'Add or remove rows and columns', description: 'Use the row and column buttons to adjust the table shape.' },
      { title: 'Export the edited data', description: 'Click Export CSV to download the updated file.' },
    ],
    faqs: [
      { question: 'Can I edit Excel .xlsx files with this tool?', answer: 'No, this editor works with plain CSV/TSV text data, not binary Excel workbooks.' },
      { question: 'Does it save automatically?', answer: 'No automatic save happens; you export the edited table manually as a CSV file when you are done.' },
      { question: 'Is my spreadsheet data sent to a server while I edit it?', answer: 'No, all editing happens locally in your browser tab; data is never uploaded.' },
      { question: 'Can I rename column headers?', answer: 'Yes, header cells in the top row are editable text inputs just like any other cell.' },
      { question: 'What delimiter does the exported file use?', answer: 'The export uses whichever delimiter you selected — comma, tab, pipe, or semicolon.' },
    ],
  },
  'csv-cleaner': {
    intro:
      'This tool automatically tidies up messy CSV data by trimming stray whitespace from every cell, removing completely empty rows, and normalizing inconsistent line endings between Windows and Unix formats. It is a fast way to prep a raw data export before importing it into another system or spreadsheet. All cleaning options run locally in your browser, and you can toggle each fix on or off before downloading the result.',
    steps: [
      { title: 'Upload or paste your CSV data', description: 'Load the file or text you want to clean.' },
      { title: 'Choose your cleaning options', description: 'Toggle whitespace trimming, empty row removal, and line-ending normalization.' },
      { title: 'Preview the cleaned table', description: 'Check the resulting table and see how many empty rows were removed.' },
      { title: 'Download the cleaned CSV', description: 'Save the sanitized file to your device.' },
    ],
    faqs: [
      { question: 'What kinds of issues does the cleaner fix?', answer: 'It trims leading/trailing whitespace in cells, removes rows that are entirely empty, and normalizes line endings between \\r\\n and \\n.' },
      { question: 'Does it fix broken text encoding automatically?', answer: 'It normalizes line endings and whitespace; if a file has corrupted character encoding, you may need to re-export it with the correct encoding first.' },
      { question: 'Is my data uploaded during cleaning?', answer: 'No, all cleaning operations run in your browser using JavaScript; no file is sent to a server.' },
      { question: 'Can I choose which fixes to apply?', answer: 'Yes, each cleaning option — trimming, empty row removal, and line-ending normalization — has its own toggle.' },
      { question: 'Does it work with tab-separated files too?', answer: 'Yes, you can switch the delimiter to tab, pipe, or semicolon before cleaning.' },
    ],
  },
  'csv-to-json': {
    intro:
      'This tool converts CSV data into a JSON array of objects, using the first row as property keys for every subsequent row, which is a common step when feeding tabular data into an API or JavaScript application. It works on plain CSV or TSV text rather than binary Excel files, and the conversion happens instantly as you type or upload. Nothing is sent to a server during the conversion.',
    steps: [
      { title: 'Upload or paste CSV data', description: 'Load your delimited data into the input box.' },
      { title: 'Select the delimiter', description: 'Choose comma, tab, pipe, or semicolon to match your data.' },
      { title: 'View the generated JSON', description: 'The tool converts each row into an object keyed by the header row.' },
      { title: 'Copy or download the JSON', description: 'Use the copy button or download the .json file.' },
    ],
    faqs: [
      { question: 'Does this support .xlsx Excel files?', answer: 'No, this converts CSV/TSV text data specifically; binary Excel workbooks are not parsed by this tool.' },
      { question: 'How are column headers used?', answer: 'The first row of your data is used as the object keys for every row that follows.' },
      { question: 'What happens with duplicate or missing headers?', answer: 'Missing header names are auto-labeled like "col1", "col2" so every column still has a usable key.' },
      { question: 'Is my CSV data uploaded anywhere?', answer: 'No, parsing and JSON generation both happen locally in your browser.' },
      { question: 'What if my CSV is invalid?', answer: 'The tool shows an error message describing what went wrong so you can fix the input.' },
    ],
  },
  'json-to-csv': {
    intro:
      'This tool flattens a JSON array of objects into CSV rows, automatically detecting all unique keys across the array to build a complete header row, even if some objects are missing certain fields. It is useful for turning an API response or exported JSON dataset into a spreadsheet-friendly CSV file. The conversion is done entirely in your browser using JavaScript\'s built-in JSON parser.',
    steps: [
      { title: 'Paste your JSON array', description: 'Enter a JSON array of objects into the input textarea.' },
      { title: 'Choose the output delimiter', description: 'Pick comma, tab, pipe, or semicolon for the resulting file.' },
      { title: 'Review the generated CSV', description: 'Check that all fields and rows converted as expected.' },
      { title: 'Copy or download the CSV', description: 'Use the copy button or save the .csv file to your device.' },
    ],
    faqs: [
      { question: 'Does it produce an Excel .xlsx file?', answer: 'No, the output is a plain CSV text file, not a binary Excel workbook; you can open it in Excel, but it is not the native .xlsx format.' },
      { question: 'What if my objects have different sets of keys?', answer: 'The tool automatically collects every unique key across all objects to build the header row, leaving cells blank where a given object lacks that key.' },
      { question: 'What happens with nested objects or arrays inside the JSON?', answer: 'Nested values are converted to their JSON string representation inside the cell since CSV has no concept of nested structures.' },
      { question: 'Is my JSON data uploaded to a server?', answer: 'No, the conversion runs entirely client-side using your browser\'s JSON parser.' },
      { question: 'What happens if my JSON is invalid?', answer: 'An error message is shown explaining that the input could not be parsed, so you can correct the syntax.' },
    ],
  },
  'tsv-converter': {
    intro:
      'This tool converts freely between CSV, TSV, and JSON formats, letting you pick any of the three as your input and any as your output. It is handy when you have tab-separated data from a database export that needs to become comma-separated CSV, or JSON that needs to become a spreadsheet-friendly table. All format conversion happens locally using a hand-written parser, with no file upload involved.',
    steps: [
      { title: 'Select the input format', description: 'Choose CSV, TSV, or JSON as the format of your source data.' },
      { title: 'Paste or type your data', description: 'Enter the data matching the selected input format.' },
      { title: 'Select the output format', description: 'Choose the format you want to convert to.' },
      { title: 'Copy or download the result', description: 'Grab the converted output with the copy button or file download.' },
    ],
    faqs: [
      { question: 'Can I convert JSON directly to TSV?', answer: 'Yes, you can pick JSON as the input and TSV as the output (or any other combination among CSV, TSV, and JSON).' },
      { question: 'Does this support Excel binary files?', answer: 'No, it works with plain text CSV/TSV and JSON; it does not read or write .xlsx binary spreadsheet files.' },
      { question: 'Is my data uploaded to convert it?', answer: 'No, all format conversion happens in your browser without sending data anywhere.' },
      { question: 'What happens if my JSON input is not an array?', answer: 'The tool requires the JSON input to be an array of objects and will show an error if it is not.' },
      { question: 'Can I download the converted file directly?', answer: 'Yes, a download button saves the result with the appropriate file extension for the chosen output format.' },
    ],
  },
  'delimiter-converter': {
    intro:
      'This tool swaps the delimiter used in a text file, so you can turn comma-separated data into pipe-separated, semicolon-separated, or tab-separated text and back again. It is useful when a downstream system expects a specific delimiter that differs from what your data currently uses. Conversion happens instantly in your browser as you type or paste text, with no upload required.',
    steps: [
      { title: 'Paste your delimited text', description: 'Enter the text data you want to convert.' },
      { title: 'Choose the source delimiter', description: 'Select the delimiter currently used in your data.' },
      { title: 'Choose the target delimiter', description: 'Select the delimiter you want the output to use.' },
      { title: 'Copy or download the result', description: 'Grab the converted text or save it as a file.' },
    ],
    faqs: [
      { question: 'Which delimiters are supported?', answer: 'Comma, tab, pipe, and semicolon are all supported as both source and target delimiters.' },
      { question: 'Does it handle values that already contain the target delimiter?', answer: 'Yes, values containing the delimiter, quotes, or line breaks are automatically wrapped in quotes in the output, following standard CSV quoting rules.' },
      { question: 'Is my text uploaded anywhere?', answer: 'No, the delimiter conversion runs entirely in your browser using JavaScript.' },
      { question: 'Can I convert a TSV file to CSV with this?', answer: 'Yes, set the source delimiter to tab and the target delimiter to comma.' },
      { question: 'Does it work on very large text blocks?', answer: 'Yes, though extremely large inputs depend on your browser\'s available memory to process smoothly.' },
    ],
  },
  'remove-duplicates': {
    intro:
      'This tool scans a CSV or TSV file and removes any rows that are exact duplicates of an earlier row, keeping the first occurrence and reporting how many duplicates were removed. It is a quick way to clean up a data export that has accidental repeats before importing it elsewhere. The deduplication logic runs entirely in your browser using row-by-row comparison, not a spreadsheet engine.',
    steps: [
      { title: 'Upload or paste your data', description: 'Load the CSV or TSV file you want to deduplicate.' },
      { title: 'Set the correct delimiter', description: 'Confirm the delimiter matches your data format.' },
      { title: 'Review the deduplicated table', description: 'Check the count of duplicate rows that were removed.' },
      { title: 'Download the cleaned file', description: 'Save the deduplicated CSV to your device.' },
    ],
    faqs: [
      { question: 'Does this work on Excel .xlsx files?', answer: 'This tool is built for delimited text data such as CSV and TSV; it does not parse binary Excel workbooks directly.' },
      { question: 'How does it decide a row is a duplicate?', answer: 'It compares the full contents of each row (excluding the header) against previously seen rows and flags an exact match as a duplicate.' },
      { question: 'Which occurrence of a duplicate is kept?', answer: 'The first occurrence of each unique row is kept, and later exact repeats are removed.' },
      { question: 'Is my data uploaded to check for duplicates?', answer: 'No, deduplication runs locally in your browser without sending any data to a server.' },
      { question: 'Does it detect near-duplicates with minor differences?', answer: 'No, it only removes exact row matches; rows that differ by even a single character or extra space are treated as distinct.' },
    ],
  },
  'merge-csv': {
    intro:
      'This tool combines multiple CSV or TSV files into a single file by stacking their rows together, using the header row from the first file as the combined header. It is useful for merging several monthly exports or split data files back into one dataset. All files are read and merged directly in your browser, and you get a warning if the files have mismatched headers.',
    steps: [
      { title: 'Add two or more CSV files', description: 'Upload at least two files you want to merge.' },
      { title: 'Review the file list', description: 'Remove any file you added by mistake before merging.' },
      { title: 'Click Merge Files', description: 'The tool combines all rows using the first file\'s header order.' },
      { title: 'Download the merged CSV', description: 'Save the combined dataset to your device.' },
    ],
    faqs: [
      { question: 'What happens if the files have different headers?', answer: 'You will see a warning noting that headers differ, and the rows are still merged using the first file\'s header order, so double-check column alignment afterward.' },
      { question: 'Can I merge Excel .xlsx files this way?', answer: 'No, this tool merges plain CSV/TSV text files; binary .xlsx workbooks are not supported.' },
      { question: 'Is there a limit on how many files I can merge?', answer: 'There is no fixed limit, but merging many large files depends on your browser\'s available memory.' },
      { question: 'Are the files uploaded to a server to be merged?', answer: 'No, all files are read and combined locally in your browser.' },
      { question: 'Can I remove a file before merging?', answer: 'Yes, each added file has a remove button so you can adjust the list before running the merge.' },
    ],
  },
  'zip-extractor': {
    intro:
      'This tool opens a .zip archive and lets you browse its contents, then extract individual files or download everything at once, all without uploading the archive to a server. It is useful when you received a zipped folder and just want to grab one or two files without installing archive software. Extraction is powered by an in-browser ZIP library that reads the archive entirely on your device.',
    steps: [
      { title: 'Select or drop a .zip file', description: 'Choose the ZIP archive you want to open.' },
      { title: 'Browse the file list', description: 'See every file and folder inside the archive along with its size.' },
      { title: 'Extract a single file', description: 'Click the download icon next to any file to save just that one.' },
      { title: 'Or download everything', description: 'Click Download All to save every file in the archive one after another.' },
    ],
    faqs: [
      { question: 'Is the ZIP file uploaded to a server to extract it?', answer: 'No, the archive is read and extracted entirely in your browser using a JavaScript ZIP library.' },
      { question: 'Does it support password-protected ZIP files?', answer: 'No, encrypted or password-protected archives are not supported since the browser library cannot decrypt them.' },
      { question: 'Can I extract just one file instead of the whole archive?', answer: 'Yes, each file in the list has its own download button so you can extract individual files.' },
      { question: 'What happens with corrupted ZIP files?', answer: 'If the archive cannot be read, the tool shows an error message indicating it may be corrupted or unsupported.' },
      { question: 'Is there a size limit for the ZIP file?', answer: 'There is no hard-coded limit, but very large archives depend on your device\'s available memory and browser performance.' },
    ],
  },
  'zip-creator': {
    intro:
      'This tool bundles multiple files you select into a single .zip archive, which is a fast way to package documents, images, or project files for sharing without needing any desktop compression software. You can name the resulting archive, review the file list and total size before zipping, and remove any file you no longer want to include. Compression happens entirely in your browser.',
    steps: [
      { title: 'Add files to zip', description: 'Select or drag in the files you want to bundle together.' },
      { title: 'Name your archive', description: 'Type a custom name for the output .zip file.' },
      { title: 'Review the file list', description: 'Check the included files and total size, removing any you don\'t need.' },
      { title: 'Create and download the ZIP', description: 'Click the button to compress everything and save the archive.' },
    ],
    faqs: [
      { question: 'Are my files uploaded to create the ZIP?', answer: 'No, the archive is built entirely in your browser using a JavaScript compression library; files never leave your device.' },
      { question: 'What compression level does it use?', answer: 'It uses standard DEFLATE compression at a balanced level, giving reasonable file size reduction without excessive processing time.' },
      { question: 'Is there a limit to how many files I can add?', answer: 'There is no fixed limit, but adding many large files increases memory use and the time needed to generate the archive.' },
      { question: 'Can I remove a file after adding it?', answer: 'Yes, every added file has a remove button so you can adjust the selection before zipping.' },
      { question: 'Does it preserve original file names?', answer: 'Yes, each file keeps its original name inside the generated archive.' },
    ],
  },
  'batch-zip': {
    intro:
      'This tool zips each file you add individually into its own separate archive, then bundles all of those small ZIPs into one outer archive for a single convenient download. It is useful when you need to distribute several files that each need to stay as their own standalone ZIP, such as separate submission packages, rather than one combined archive. Everything is compressed locally in your browser.',
    steps: [
      { title: 'Add multiple files', description: 'Select or drag in the files you want zipped individually.' },
      { title: 'Review the file list', description: 'Confirm how many inner ZIPs will be created, one per file.' },
      { title: 'Create the batch ZIPs', description: 'Click the button to compress each file into its own archive.' },
      { title: 'Download the outer bundle', description: 'Save the single outer batch-zips.zip containing all the individual archives.' },
    ],
    faqs: [
      { question: 'How is this different from the regular ZIP Creator?', answer: 'The regular ZIP Creator puts all files into one shared archive, while this tool wraps each file in its own separate ZIP first, then bundles those individual ZIPs together for download.' },
      { question: 'Are my files uploaded anywhere during this process?', answer: 'No, both the inner and outer zipping steps happen entirely in your browser.' },
      { question: 'What is the output file named?', answer: 'The final downloaded bundle is named batch-zips.zip, containing one .zip file per original file you added.' },
      { question: 'Can I use this to prepare separate downloadable packages for different recipients?', answer: 'Yes, since each inner ZIP is self-contained, you can extract the outer bundle and hand out the individual archives separately.' },
      { question: 'Is there a limit on the number of files?', answer: 'There is no fixed limit, but zipping many files individually takes more processing time and memory than a single combined archive.' },
    ],
  },
  'color-converter': {
    intro:
      'This tool lets you pick a color visually or type a HEX code and instantly see the equivalent RGB and HSL values, along with a strip of lighter and darker shades generated from the same hue. It is useful for designers and developers who need to translate a brand color between different CSS color notations while building a style guide. All calculations happen locally in JavaScript with no network requests.',
    steps: [
      { title: 'Pick or type a color', description: 'Use the color picker or enter a HEX code directly.' },
      { title: 'View the converted formats', description: 'See the matching RGB and HSL values update instantly.' },
      { title: 'Browse the shade palette', description: 'Click any generated shade swatch to switch to that color.' },
      { title: 'Copy the format you need', description: 'Use the copy button next to HEX, RGB, or HSL to grab the code.' },
    ],
    faqs: [
      { question: 'Which color formats does it convert between?', answer: 'It converts between HEX, RGB, and HSL notations; it does not currently output HSV or CMYK values.' },
      { question: 'Is my color data sent anywhere?', answer: 'No, all color math runs locally in your browser using plain JavaScript.' },
      { question: 'Can I use this for print color matching?', answer: 'Since it works with screen-based HEX/RGB/HSL values rather than CMYK, it is best suited for web and UI design rather than exact print color matching.' },
      { question: 'What is the shade palette for?', answer: 'It generates a strip of lighter and darker variations of your chosen hue, useful for building consistent UI color scales.' },
      { question: 'Does it support 3-digit shorthand HEX codes?', answer: 'Yes, 3-character HEX shorthand is automatically expanded to the full 6-character form.' },
    ],
  },
  'gradient-generator': {
    intro:
      'This tool provides a visual builder for CSS linear and radial gradients, letting you drag color stops, adjust their position and angle, and instantly copy the resulting CSS background property. It removes the guesswork of hand-writing gradient syntax and is handy for designing hero sections, buttons, or backgrounds. The live preview and generated code update in real time, entirely within your browser.',
    steps: [
      { title: 'Choose gradient type', description: 'Select linear or radial gradient style.' },
      { title: 'Set the angle (linear only)', description: 'Drag the angle slider to rotate the gradient direction.' },
      { title: 'Adjust color stops', description: 'Change stop colors and drag their position sliders to fine-tune the blend.' },
      { title: 'Add more stops if needed', description: 'Click Add Stop for a multi-color gradient.' },
      { title: 'Copy the CSS code', description: 'Grab the generated background CSS to paste into your stylesheet.' },
    ],
    faqs: [
      { question: 'Does it support radial gradients too?', answer: 'Yes, you can toggle between linear and radial gradient types at any time.' },
      { question: 'How many color stops can I add?', answer: 'You can add as many stops as you like, with a minimum of two required to form a gradient.' },
      { question: 'Is the generated CSS compatible with all modern browsers?', answer: 'Yes, it outputs standard linear-gradient() and radial-gradient() CSS syntax supported by all current browsers.' },
      { question: 'Does this tool save my gradients?', answer: 'No, gradients exist only in your current browser session; copy the CSS code if you want to keep it.' },
      { question: 'Is any data sent to a server while I design a gradient?', answer: 'No, the entire builder runs client-side with no network requests.' },
    ],
  },
  'palette-color': {
    intro:
      'This tool generates a harmonious set of colors starting from a single seed color, using standard color theory rules like complementary, analogous, triadic, tetradic, and monochromatic harmonies. It is useful for quickly building a coordinated color scheme for a design project without manually calculating hue rotations. Every palette is computed instantly in your browser using HSL math, with one-click copy for each generated swatch.',
    steps: [
      { title: 'Pick a seed color', description: 'Choose a starting color using the color picker or HEX input.' },
      { title: 'Select a harmony rule', description: 'Pick complementary, analogous, triadic, tetradic, or monochromatic.' },
      { title: 'Review the generated swatches', description: 'See the resulting palette of coordinated colors.' },
      { title: 'Copy any swatch', description: 'Click the copy icon on a swatch to grab its HEX code.' },
    ],
    faqs: [
      { question: 'What harmony rules are available?', answer: 'You can choose complementary, analogous, triadic, tetradic, or monochromatic color harmony based on your seed color.' },
      { question: 'How is the palette calculated?', answer: 'The seed color is converted to HSL, then new colors are generated by rotating the hue (or adjusting lightness for monochromatic) according to the selected harmony rule.' },
      { question: 'Is my color choice sent anywhere?', answer: 'No, all palette generation happens locally in your browser using JavaScript color math.' },
      { question: 'Can I save a generated palette?', answer: 'The palette is not saved automatically; copy the individual HEX codes you want to keep for later use.' },
      { question: 'Does the number of colors change with the harmony type?', answer: 'Yes, for example complementary gives two colors, triadic gives three, tetradic gives four, and monochromatic gives five shades of the same hue.' },
    ],
  },
  'contrast-checker': {
    intro:
      'This tool calculates the WCAG contrast ratio between a foreground text color and a background color, then checks it against the AA and AAA thresholds for both normal and large text. It is essential for making sure your website or app text is readable and meets accessibility standards before you ship a design. The ratio and live text preview update instantly as you adjust either color, all computed locally in your browser.',
    steps: [
      { title: 'Set the foreground color', description: 'Choose the text color using the picker or HEX input.' },
      { title: 'Set the background color', description: 'Choose the background color the text will sit on.' },
      { title: 'Check the live preview', description: 'See sample large and normal text rendered with your chosen colors.' },
      { title: 'Review the pass/fail results', description: 'Check the contrast ratio against AA and AAA thresholds for both text sizes.' },
    ],
    faqs: [
      { question: 'What contrast ratio do I need for WCAG AA compliance?', answer: 'Normal text needs a ratio of at least 4.5:1, while large text needs at least 3:1 to pass WCAG AA.' },
      { question: 'What about WCAG AAA?', answer: 'AAA is stricter, requiring at least 7:1 for normal text and 4.5:1 for large text.' },
      { question: 'How is the contrast ratio calculated?', answer: 'It uses the WCAG relative luminance formula for both colors and computes the ratio between the lighter and darker luminance values, exactly as specified in the accessibility guidelines.' },
      { question: 'Is my color data sent to a server?', answer: 'No, the contrast calculation runs entirely in your browser using standard luminance math.' },
      { question: 'What counts as "large text" for these thresholds?', answer: 'WCAG generally defines large text as 18pt (24px) regular or 14pt (18.66px) bold and larger, which is why it has a lower required contrast ratio.' },
    ],
  },
  'glassmorphism': {
    intro:
      'This tool provides a live visual builder for the popular glassmorphism (frosted glass) UI style, letting you adjust backdrop blur, glass opacity, border opacity, and corner radius with sliders while watching the effect render in real time on a sample card. Once you\'re happy with the look, it generates ready-to-use CSS with the backdrop-filter property and vendor prefix included. Everything runs client-side, so there is nothing to upload or configure on a server.',
    steps: [
      { title: 'Adjust the backdrop blur', description: 'Drag the blur slider to control how frosted the glass looks.' },
      { title: 'Set glass and border opacity', description: 'Fine-tune how transparent the panel and its border edge appear.' },
      { title: 'Adjust the border radius', description: 'Round the corners of the glass card to match your design.' },
      { title: 'Copy the generated CSS', description: 'Grab the ready-made CSS class including backdrop-filter and fallbacks.' },
    ],
    faqs: [
      { question: 'Will the glass effect work in every browser?', answer: 'The backdrop-filter CSS property used for the blur effect is supported in all current major browsers, though very old browser versions may not render the blur and will just show a semi-transparent panel.' },
      { question: 'Does the generated CSS include vendor prefixes?', answer: 'Yes, it includes both the standard backdrop-filter property and the -webkit-backdrop-filter prefix for broader compatibility.' },
      { question: 'Do I need a background image for the glass effect to show?', answer: 'Yes, the frosted blur effect is only visible when there is content behind the glass element, such as a background image, gradient, or other page elements.' },
      { question: 'Is any data sent to a server while designing the effect?', answer: 'No, the entire preview and CSS generation happens locally in your browser.' },
      { question: 'Can I customize the box-shadow or colors beyond what the sliders offer?', answer: 'The sliders control blur, opacity, and radius; you can further customize the copied CSS manually in your own stylesheet, such as changing the box-shadow color.' },
    ],
  },
};
