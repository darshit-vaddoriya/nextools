import { ToolSeoMap } from './types';

/**
 * SEO copy for the developer tools added in the "pro" batch: JSON → types,
 * cron, cURL conversion, escaping, .env, HTTP status, JSONPath and mock data.
 */
export const DEV_PRO_SEO_CONTENT: ToolSeoMap = {
  'json-to-types': {
    intro:
      'Wiring up a new API endpoint usually starts with the same chore: reading a sample JSON response and hand-typing an interface that matches it, field by field. This tool does that for you. Paste any JSON payload and get TypeScript interfaces, a Zod schema, Go structs or Python dataclasses, with nested objects promoted into their own named types and arrays of objects merged so a field missing from one row is marked optional instead of silently dropped. Everything is generated in your browser, so production payloads never leave your machine.',
    steps: [
      { title: 'Paste a JSON sample', description: 'Drop in a real API response — an object, or an array of objects.' },
      { title: 'Name the root type', description: 'Set the name for the top-level type, such as User or ApiResponse.' },
      { title: 'Pick your target', description: 'Switch between TypeScript, Zod, Go and Python output.' },
      { title: 'Copy into your project', description: 'Copy the generated code straight into your types file.' },
    ],
    faqs: [
      { question: 'How are optional fields detected?', answer: 'For an array of objects, every key is checked against every element. A key that is missing from at least one element is marked optional — `field?:` in TypeScript, `.optional()` in Zod, a pointer with `omitempty` in Go and `Optional[...] = None` in Python.' },
      { question: 'What happens to nested objects?', answer: 'Each nested object becomes its own named interface or struct, named after the key that holds it, so you get a readable set of types rather than one deeply inlined blob.' },
      { question: 'Does it handle null values?', answer: 'A field that is null in the sample cannot be typed accurately, so it is emitted as `null` in TypeScript and `interface{}` / `Any` in Go and Python. Give the tool a sample where the field is populated for a more precise type.' },
      { question: 'Is the Zod output ready to use?', answer: 'Yes. It emits one schema per object plus matching `z.infer` types, so you get both runtime validation and static types from a single source.' },
      { question: 'Is my JSON uploaded anywhere?', answer: 'No. Parsing and code generation happen entirely in your browser with JavaScript — nothing is sent to a server, which matters when the sample contains real customer data.' },
    ],
    useCases: [
      'Typing a third-party API response the moment you first call it',
      'Generating Go structs with correct json tags for a backend integration',
      'Creating a Zod schema to validate an untrusted webhook payload',
      'Turning a fixture file into Python dataclasses for a test suite',
    ],
    tips: [
      'Feed it the largest sample you have — more rows means better optional-field detection and fewer wrong types.',
      'If a numeric field is sometimes a whole number and sometimes a decimal, check the Go output, which picks int or float64 from the single sample value you gave it.',
      'Rename the root type before copying; a good name at the top propagates into how readable the nested types are.',
    ],
  },

  'cron-parser': {
    intro:
      'Cron syntax is five terse fields, and a single misplaced asterisk is the difference between a job running nightly and a job running every minute of every night. This tool translates any cron expression into plain English and, more usefully, lists the next times it will actually fire in your local timezone, so you can confirm the schedule before it goes anywhere near a production crontab or a CI pipeline. Common schedules are one click away, and everything is computed locally in your browser.',
    steps: [
      { title: 'Type or paste an expression', description: 'Enter a standard five-field cron expression such as 0 9 * * 1-5.' },
      { title: 'Read the plain-English summary', description: 'The tool describes exactly what the expression means.' },
      { title: 'Check the next runs', description: 'Scan the list of upcoming fire times to confirm the schedule matches your intent.' },
      { title: 'Start from a preset', description: 'Click any common schedule to load it, then adjust the fields you need.' },
    ],
    faqs: [
      { question: 'Which cron format does this use?', answer: 'Standard five-field crontab syntax: minute, hour, day of month, month and day of week. Ranges, lists, steps and month or weekday names such as MON and JAN are all supported.' },
      { question: 'What timezone are the next run times in?', answer: 'Your browser\'s local timezone. A real cron daemon fires in the server\'s timezone, so if your server runs UTC, remember to account for the offset.' },
      { question: 'Why does my day-of-month and day-of-week expression fire more often than expected?', answer: 'Classic crontab rules say that when both day fields are restricted, the job runs when either one matches, not both. This tool follows that same rule, which is why 0 0 13 * 5 fires on the 13th and on every Friday.' },
      { question: 'Does it support six-field expressions with seconds?', answer: 'No. Six-field syntax with a leading seconds column is a Quartz and Spring extension rather than standard crontab, so this parser expects exactly five fields and tells you when it gets a different count.' },
      { question: 'Can I use @daily or @hourly shortcuts?', answer: 'Those macros are not parsed directly, but the preset list contains the exact equivalents — @daily is 0 0 * * * and @hourly is 0 * * * *.' },
    ],
    useCases: [
      'Double-checking a backup schedule before committing it to a crontab',
      'Understanding an inherited cron line in a legacy deployment script',
      'Writing a GitHub Actions or Kubernetes CronJob schedule correctly the first time',
      'Explaining to a teammate exactly when a scheduled job will run',
    ],
    tips: [
      'A step like */5 in the minute field means every five minutes of every hour, not five minutes after the hour — the next-runs list makes the difference obvious.',
      'If a job must run once a day, pin the minute field to a specific number; leaving it as * makes it run sixty times.',
      'Compare the gap between the first two runs in the list — it is the fastest way to catch an expression that fires far more often than you intended.',
    ],
  },

  'curl-to-code': {
    intro:
      'Every browser lets you right-click a network request and "Copy as cURL", which is perfect for replaying a call in a terminal and useless for pasting into an application. This tool parses that command — method, URL, headers, body, basic auth, cookies — and rewrites it as working client code in fetch, axios, Python requests or Node\'s https module. JSON bodies are re-indented as real object literals rather than escaped strings, so the output is something you can read and edit rather than a one-line blob.',
    steps: [
      { title: 'Copy a request as cURL', description: 'In your browser DevTools Network tab, right-click a request and choose Copy as cURL.' },
      { title: 'Paste it into the input', description: 'Line continuations and quoted headers are handled for you.' },
      { title: 'Choose an output language', description: 'Switch between fetch, axios, Python requests and Node https.' },
      { title: 'Copy the generated code', description: 'Paste it into your project and adjust the token or payload as needed.' },
    ],
    faqs: [
      { question: 'Which curl flags are supported?', answer: 'The ones that affect the request: -X/--request, -H/--header, -d/--data and its variants, -u/--user for basic auth, -A/--user-agent, -b/--cookie, -F/--form, -G/--get and --url. Cosmetic or transport flags such as -s, -k, -L and --compressed are ignored because they do not change the generated code.' },
      { question: 'What method is used if the command has no -X?', answer: 'The same rule curl itself follows: GET when there is no body, POST when a data flag is present.' },
      { question: 'Is my auth token safe to paste here?', answer: 'The parsing runs entirely in your browser and nothing is transmitted, but a copied cURL command usually contains a live session token, so treat it carefully and rotate it if it was ever shared elsewhere.' },
      { question: 'Why is my JSON body a plain string instead of an object?', answer: 'The body is only re-expanded into an object literal when it parses as valid JSON. Form-encoded or multipart bodies stay as strings, which is what those APIs expect.' },
      { question: 'Does it handle multi-line commands?', answer: 'Yes. Backslash line continuations are joined before parsing, so you can paste a wrapped command exactly as your terminal or DevTools produced it.' },
    ],
    useCases: [
      'Turning a working DevTools request into application code without retyping headers',
      'Converting an API vendor\'s curl example from their docs into a fetch call',
      'Porting a shell script API call into a Python service',
      'Sharing a reproducible request with a teammate who works in a different language',
    ],
    tips: [
      'Strip or replace the Authorization header before pasting the generated code into a shared repository.',
      'If the API is a GET with a long query string, copy the URL out of the generated code — it is already decoded and readable.',
      'Check the parsed summary underneath the output: if the method or header count looks wrong, the command probably used a flag form the parser skipped.',
    ],
  },

  'string-escaper': {
    intro:
      'A quote in the wrong place breaks a JSON payload, a SQL statement or a shell command in three completely different ways, because each one escapes characters by its own rules. This tool applies the right rule for the context you pick — JSON string, JavaScript, SQL, shell, regex, CSV field, XML/HTML or URL component — and reverses it just as easily, so you can take an escaped string out of a log file and read the original text. Conversion is instant and happens in your browser.',
    steps: [
      { title: 'Paste your text', description: 'Enter the raw string you want to escape, or the escaped string you want to read.' },
      { title: 'Choose the target format', description: 'Pick JSON, JavaScript, SQL, shell, regex, CSV, XML or URL.' },
      { title: 'Switch escape or unescape', description: 'Toggle the direction depending on which way you need to go.' },
      { title: 'Copy the result', description: 'Grab the output and drop it into your code, query or config.' },
    ],
    faqs: [
      { question: 'What is the difference between JSON and JavaScript escaping?', answer: 'JSON escaping targets double-quoted strings and follows the JSON spec exactly. JavaScript escaping here targets single-quoted source literals, so it escapes apostrophes and leaves double quotes alone.' },
      { question: 'Is SQL escaping safe against injection?', answer: 'No. Doubling single quotes is correct for building a literal by hand, but parameterised queries and prepared statements are the only reliable defence against SQL injection. Use this for quick manual queries, not for application code.' },
      { question: 'Why does shell escaping wrap everything in single quotes?', answer: 'Single quotes are the only shell construct that disables all expansion, so wrapping the whole string and escaping any embedded apostrophe is the safest general rule for passing text through a shell.' },
      { question: 'What does regex escaping do?', answer: 'It backslash-escapes every character with special meaning in a pattern, which turns arbitrary text into a literal match — the same thing a RegExp.escape helper would do.' },
      { question: 'Does unescaping always return the original text?', answer: 'For JSON, XML, CSV and URL it round-trips exactly. For JavaScript and shell, some inputs are ambiguous, so check the result if the string contains stacked backslashes.' },
    ],
    useCases: [
      'Embedding a multi-line message into a JSON config value',
      'Reading an escaped string pulled out of a log line or a stack trace',
      'Turning a user-supplied string into a literal regex match',
      'Quoting a filename with spaces before pasting it into a shell command',
    ],
    tips: [
      'Use the Swap button to feed the output straight back in — it is the quickest way to prove a round trip is lossless.',
      'For CSV, the tool only quotes when it must (commas, quotes or newlines present), which is what spreadsheet software expects.',
      'URL component escaping encodes slashes too; if you are escaping a whole URL rather than a single parameter, only escape the individual values.',
    ],
  },

  'env-json': {
    intro:
      'Configuration tends to live in two shapes: a .env file for local development and a JSON object for a deploy dashboard, a Kubernetes secret or a test fixture. Converting between them by hand is tedious and easy to get wrong when values contain spaces, hashes or quotes. This tool moves in both directions, honouring quoted values, `export` prefixes, inline comments and escaped newlines, so the output is something you can paste straight into a config field. Values are processed locally and never uploaded.',
    steps: [
      { title: 'Pick a direction', description: 'Choose .env → JSON or JSON → .env.' },
      { title: 'Paste your config', description: 'Drop in the whole file — comments and blank lines are handled.' },
      { title: 'Review the converted output', description: 'The key count in the status pill confirms nothing was dropped.' },
      { title: 'Copy it where it is needed', description: 'Paste into your hosting dashboard, secret manager or config module.' },
    ],
    faqs: [
      { question: 'Are comments preserved?', answer: 'No. Comment lines starting with # are skipped because JSON has no place to put them. Inline comments after an unquoted value are stripped from that value, matching how dotenv parsers behave.' },
      { question: 'How are quoted values handled?', answer: 'Surrounding single or double quotes are removed when converting to JSON, and re-added on the way back whenever the value contains a space, hash, quote or equals sign, or is empty.' },
      { question: 'Does it support nested JSON objects?', answer: 'Environment variables are flat strings, so a nested object is serialised to a JSON string on the .env side. Going the other way, keep the JSON flat for a clean result.' },
      { question: 'Is it safe to paste production secrets?', answer: 'The conversion runs entirely in your browser and nothing is transmitted or stored. That said, treat any secret you paste into any browser tab as worth rotating if the machine is shared.' },
      { question: 'Does it handle `export KEY=value` lines?', answer: 'Yes. The `export ` prefix used in shell-sourced env files is stripped automatically.' },
    ],
    useCases: [
      'Moving local .env values into a Vercel, Netlify or Railway dashboard',
      'Building a JSON secret payload for Kubernetes or AWS Secrets Manager',
      'Generating a .env file from a config object handed over by another team',
      'Producing a fixture object for a test that reads environment variables',
    ],
    tips: [
      'Use "Use output as input" to flip direction and verify the round trip matches your original file.',
      'Multi-line values should be written with \\n in the .env file; the converter expands and re-collapses them for you.',
      'Check the key count before and after — a mismatch usually means a line was missing its equals sign.',
    ],
  },

  'http-status-codes': {
    intro:
      'HTTP status codes are the fastest way to describe what went wrong with a request, and also the easiest thing to get slightly wrong: 401 versus 403, 302 versus 307, 400 versus 422. This searchable reference lists every status code a real web application is likely to return, each with a short explanation of what it means in practice rather than a quote from the specification, filtered by class so you can scan just the 4xx or 5xx range when you are debugging.',
    steps: [
      { title: 'Search by code or keyword', description: 'Type 404, "rate limit" or "redirect" to narrow the list.' },
      { title: 'Filter by class', description: 'Use the 1xx to 5xx filters to see one family at a time.' },
      { title: 'Read the practical meaning', description: 'Each entry explains what the code signals in a real API.' },
    ],
    faqs: [
      { question: 'What is the difference between 401 and 403?', answer: '401 Unauthorized really means unauthenticated — the caller has not proved who they are, or the token is invalid or expired. 403 Forbidden means identity is established but this caller is not allowed to perform this action, so re-authenticating will not help.' },
      { question: 'When should an API return 400 versus 422?', answer: 'Use 400 when the request itself is malformed — broken JSON, a missing required parameter. Use 422 when the syntax is fine but the data fails business validation, such as an email that is already registered.' },
      { question: 'Which redirect code should I use for a permanent move?', answer: '301 for a permanent move where changing the method is acceptable, or 308 when the method and body must be preserved. Search engines transfer ranking signals for both.' },
      { question: 'Is 429 something I should retry automatically?', answer: 'Yes, but only after the delay the server asks for. Read the Retry-After header and back off exponentially rather than retrying immediately, or you will extend the rate limit window.' },
      { question: 'What causes a 502 versus a 504?', answer: 'A 502 Bad Gateway means the proxy received an invalid response from the upstream service — it answered, but badly. A 504 Gateway Timeout means the upstream never answered in time.' },
    ],
    useCases: [
      'Choosing the correct status code while designing a REST API',
      'Debugging a failing integration by understanding the code the server returned',
      'Explaining an error class to a non-backend teammate',
      'Checking whether a code is safe to retry before writing retry logic',
    ],
    tips: [
      'If you are unsure between two codes, pick the one that tells the client what to do next — that is the whole point of the status line.',
      'Never return 200 with an error object in the body; monitoring, caching and client libraries all key off the status code.',
      'Reserve 5xx for genuine server faults, so your error rate dashboards stay meaningful.',
    ],
  },

  'jsonpath-tester': {
    intro:
      'When an API returns a deeply nested response and you only need three fields out of it, a path expression beats scrolling through the payload. This tester runs JSONPath expressions against your document and shows the matching values live as you type, with support for dot and bracket notation, array indexes, wildcards, recursive descent and simple comparison filters. It is a fast way to build and verify the expression before you hard-code it in a script, a jq pipeline or an automation step.',
    steps: [
      { title: 'Paste your JSON', description: 'Drop in the document or API response you want to query.' },
      { title: 'Write a path expression', description: 'Start with $ and drill down, or click one of the example expressions.' },
      { title: 'Watch the matches update', description: 'The match count and the matching values refresh as you type.' },
      { title: 'Copy the result', description: 'Take the matched values or the finished expression into your code.' },
    ],
    faqs: [
      { question: 'Which JSONPath syntax is supported?', answer: 'The everyday subset: $ for the root, .key and [\'key\'] for properties, [0] for array indexes, [*] for all elements, .. for recursive descent, and [?(@.key==value)] filters with ==, !=, >, <, >= and <=.' },
      { question: 'What does recursive descent do?', answer: 'An expression like $..price searches the entire document at any depth and returns every value stored under that key, which is the quickest way to find a field when you do not know where it lives.' },
      { question: 'Why does my filter return nothing?', answer: 'Filters compare strictly, so @.status=="active" will not match the number 1 or the string "Active". Check the exact value and casing in the document, and use single quotes around string literals.' },
      { question: 'Does it support script expressions or functions?', answer: 'No. Length, slice and script expressions are deliberately left out — the goal is a predictable subset that behaves the same everywhere, not full parity with a specific JSONPath library.' },
      { question: 'Is my data uploaded?', answer: 'No. The document is parsed and queried entirely in your browser, so you can safely test against a real response.' },
    ],
    useCases: [
      'Extracting a list of IDs from a paginated API response',
      'Building the path expression for a Postman test or a CI assertion',
      'Finding where a value lives inside an unfamiliar nested payload',
      'Filtering an array of records down to the ones matching a status',
    ],
    tips: [
      'Build the expression a segment at a time and watch the match count — the step where it drops to zero is the step that is wrong.',
      'Use $..key first to discover where a field lives, then write the precise path for production use.',
      'A wildcard on an object ($.store.*) returns its values, which is handy for turning a keyed map into a list.',
    ],
  },

  'mock-json': {
    intro:
      'Building a list view, seeding a database or demoing a dashboard all need the same thing: a few dozen rows of data that look real. This generator lets you define the exact fields you need — names, emails, cities, prices, dates, UUIDs, booleans and more — and produces that dataset as JSON, CSV or ready-to-run SQL INSERT statements. The generator is seeded, so Regenerate gives you a fresh set while the same seed always rebuilds the same rows, and everything is produced locally without an API key or a rate limit.',
    steps: [
      { title: 'Define your fields', description: 'Name each field and pick the kind of value it should hold.' },
      { title: 'Set the row count', description: 'Choose anywhere from one row up to five hundred.' },
      { title: 'Pick an output format', description: 'Switch between JSON, CSV and SQL INSERT statements.' },
      { title: 'Copy or regenerate', description: 'Copy the dataset, or hit Regenerate for a completely different batch.' },
    ],
    faqs: [
      { question: 'What field types are available?', answer: 'Sequential ids, UUIDs, first and last names, full names, emails, usernames, cities, companies, phone numbers, booleans, integers, prices, dates, timestamps, sentences, paragraphs, URLs, IPv4 addresses and hex colours.' },
      { question: 'Is the data random every time?', answer: 'It is generated from a seeded pseudo-random source, so the output is stable until you press Regenerate. That makes it safe to use in a test fixture where a changing dataset would break assertions.' },
      { question: 'Can I use the SQL output directly?', answer: 'Yes. It emits one INSERT per row against a mock_data table with your field names as columns — rename the table to match your schema before running it.' },
      { question: 'Are the names and emails real?', answer: 'No. Names are drawn from a small list of computing pioneers and emails are built from fictional company domains, so nothing maps to a real person or a deliverable mailbox.' },
      { question: 'How many rows can I generate?', answer: 'Up to five hundred per batch, which keeps the preview responsive. For larger datasets, generate several batches and concatenate them.' },
    ],
    useCases: [
      'Seeding a local database with believable rows before building a UI',
      'Filling a table or list component to check pagination and overflow behaviour',
      'Creating a CSV fixture for an import feature you are testing',
      'Producing demo data for a screenshot or a client walkthrough',
    ],
    tips: [
      'Name your fields to match your real schema so the SQL and JSON drop straight into your project.',
      'Use the id field type for the primary key — it counts up from one rather than producing random numbers.',
      'Generate one row first to check the shape, then raise the count once the fields are right.',
    ],
  },
};
