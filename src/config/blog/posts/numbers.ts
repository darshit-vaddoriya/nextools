import { BlogPost } from '../types';

export const NUMBERS_POSTS: BlogPost[] = [
  {
    slug: 'timestamps-time-zones-and-the-missing-hour',
    title: 'Unix timestamps, UTC and the off-by-one-hour bug',
    description: 'A timestamp is a count of seconds with no time zone in it. Almost every date bug comes from adding a zone too early or too late.',
    excerpt: 'Your report is right eleven months of the year and wrong for one week in spring. That is daylight saving, and the fix is upstream of the report.',
    category: 'numbers',
    tags: ['timestamps', 'timezones', 'dates'],
    published: '2026-09-13',
    relatedTools: ['timestamp-converter', 'timezone-converter', 'age-calculator'],
    takeaways: [
      'A Unix timestamp has no time zone. It is a count of seconds since 1970 in UTC, and a zone is applied only when it is displayed.',
      'Store UTC, display local. Storing local time loses which offset was in force and cannot be recovered later.',
      'Offsets like +05:30 are not time zones. A zone is a set of rules that changes; an offset is a single number at one instant.',
      'A 10-digit number is seconds and a 13-digit one is milliseconds. Mixing them puts dates in 1970 or in the year 54,000.',
    ],
    body: `A nightly job has run correctly for months. One morning in spring the numbers are wrong by an hour, and a week later they are fine again. Nothing was deployed.

This is the most common date bug there is, and understanding it takes one idea: a timestamp does not have a time zone.

## What a timestamp is

A Unix timestamp is a single integer: the number of seconds elapsed since 1 January 1970 at 00:00:00 UTC. That is the whole definition.

\`1789200000\` is a specific instant. It is the same instant in Mumbai, London and São Paulo. There is no zone stored in it, because none is needed. A zone is only involved when you turn that number into something a human reads, and a different zone gives a different reading of the same instant.

So the timestamp is the fact and the displayed date is an interpretation. Bugs happen when interpretation is mistaken for the fact.

> [!NOTE]
> Two lengths are in circulation. Unix seconds are 10 digits; JavaScript's \`Date.now()\` returns milliseconds, which is 13. Feed milliseconds to something expecting seconds and you get a date tens of thousands of years in the future. Feed seconds to something expecting milliseconds and everything lands in January 1970. If a [timestamp converter](/tool/timestamp-converter) shows you either, you have the units wrong, not the value.

## Offsets are not time zones

\`+05:30\` is an offset, a fixed number of minutes from UTC.

\`Asia/Kolkata\` is a time zone, which is a *set of rules* describing which offset applies on which dates, including historical changes and daylight saving transitions.

The difference is the source of the spring bug. \`Europe/London\` is \`+00:00\` in winter and \`+01:00\` in summer. If you stored an offset instead of a zone, you recorded the answer for one instant and have no way to work out the answer for another.

This is why "store UTC, display local" is the standard advice. Storing the instant keeps the fact. Applying a zone at display time re-runs the rules for that particular date and gets it right in both halves of the year.

## The transitions that actually break things

Twice a year, local time does something a naive calculation does not expect.

**Spring forward.** Clocks jump from 01:59 to 03:00. The hour between does not exist. A job scheduled at 02:30 local either does not run or runs twice, depending on the scheduler. A date arithmetic routine that adds 24 hours to a timestamp and calls it "tomorrow" lands an hour off.

**Autumn back.** Clocks go from 02:59 back to 02:00. That hour happens twice, so 02:30 local is ambiguous and maps to two distinct instants. A log sorted by local time appears to go backwards.

The rule that avoids both: do arithmetic in UTC, convert for display. "Add one day" is not "add 86,400 seconds" if a transition falls in between, and only the zone rules know that.

> [!WARNING]
> Zone rules change by legislation, not by nature. Countries add, remove and shift daylight saving with a few months' notice, and the IANA database is updated several times a year. A system pinned to an old copy will be quietly wrong for whichever region changed. This is not something you can reason out; it needs current data.

## Comparing across zones

When the question is "what time is the call for everyone", the answer is not arithmetic on offsets, because the offsets on the day of the meeting may not be the offsets today.

A [time zone converter](/tool/timezone-converter) that works from zone names rather than fixed offsets applies the rules for the actual date, which is why it can tell you that a 14:00 London to New York gap is five hours in most of the year and four for the two weeks when the two regions change on different dates. That gap genuinely exists, it catches recurring meetings every spring, and no amount of offset arithmetic predicts it.

## Date arithmetic is not subtraction

Working out an age or a duration in whole years and months is not a division problem, because months have different lengths and years have different numbers of days.

Subtracting two timestamps and dividing by 31,536,000 gives an answer that drifts, because it ignores leap years. Someone born on 29 February has no birthday in most years, and different jurisdictions answer the legal question differently.

The correct approach is calendar arithmetic: compare year, then month, then day, borrowing where needed. That is what an [age calculator](/tool/age-calculator) does, and why its answer differs from a spreadsheet formula that divides by 365.25.

## Practical rules

1. **Store instants in UTC.** Seconds or milliseconds, pick one and be consistent.
2. **Store the zone name**, not the offset, when you need to know where something happened.
3. **Do arithmetic in UTC**, convert at the edges.
4. **Use ISO 8601 in files and APIs.** \`2026-09-13T14:30:00Z\` is unambiguous and sorts correctly as plain text.
5. **Test around the transitions.** A test suite that only runs in one half of the year will not find this class of bug.

Converting a timestamp or comparing two zones is pure arithmetic against a rules table, with nothing to send anywhere. The [timestamp converter](/tool/timestamp-converter), [time zone converter](/tool/timezone-converter) and [age calculator](/tool/age-calculator) here all run in the tab, which is worth having when the timestamps you are debugging came out of a production log.`,
  },

  {
    slug: 'the-maths-behind-the-calculators',
    title: 'EMI, GST and percentages: the formulas the calculators are running',
    description: 'Loan instalments, tax-inclusive prices and percentage change all have one formula each. Knowing them tells you when an answer is wrong.',
    excerpt: 'A 20% rise followed by a 20% fall does not get you back to where you started. That is not a rounding error, and the same confusion makes tax and loan figures wrong.',
    category: 'numbers',
    tags: ['finance', 'percentages', 'units'],
    published: '2026-09-14',
    relatedTools: ['emi-calculator', 'gst-calculator', 'percentage-calc', 'unit-converter', 'bmi-calculator', 'number-to-words', 'roman-numerals', 'scientific-calc'],
    takeaways: [
      'Percentage change is not symmetric. Down 20% then up 20% leaves you 4% below where you started.',
      'Removing GST from an inclusive price is division, not subtraction. Taking 18% off a 118 price does not give 100.',
      'EMI is fixed but its split is not: early instalments are mostly interest, which is why early repayment saves so much.',
      'Temperature is the one unit conversion with an offset, so a ratio that works for length does not work for Celsius.',
    ],
    body: `A price rises 20% and then falls 20%. Most people expect to be back where they started. Starting at 100, you rise to 120, then fall by 20% *of 120*, which is 24, landing at 96.

That 4% is not rounding. It is the single most common numerical mistake in everyday work, and the same misunderstanding produces wrong tax figures and wrong loan comparisons.

## Percentage change is directional

The trap is that the percentage is always *of something*, and the something changes.

| Question | Formula |
|---|---|
| What is X% of Y | \`Y × X / 100\` |
| X is what percent of Y | \`X / Y × 100\` |
| Change from A to B | \`(B − A) / A × 100\` |
| Reverse: B is A after X% increase | \`A = B / (1 + X/100)\` |

The last row is the one people get wrong. If a price is 118 after an 18% increase, the original is \`118 / 1.18 = 100\`, not \`118 − 18 = 100\` by coincidence of the numbers, and definitely not \`118 × 0.82 = 96.76\`.

Also worth separating: a **percentage point** and a **percent** are different units. A rate going from 4% to 6% has risen two percentage points, or fifty percent. Both statements are true and they describe the same change, which is why the ambiguity is so useful to people arguing a case.

A [percentage calculator](/tool/percentage-calc) is worth using for the reverse cases specifically, because those are the ones where the wrong method produces a plausible-looking number.

## GST and the inclusive-price problem

Tax calculations are the same reverse-percentage problem with money attached.

**Adding GST** to a base price is simple: \`base × (1 + rate)\`. At 18%, a base of 1,000 becomes 1,180.

**Removing GST** from an inclusive price is division: \`inclusive / (1 + rate)\`. From 1,180 at 18%, the base is \`1180 / 1.18 = 1,000\` and the tax is 180.

> [!WARNING]
> Subtracting 18% from 1,180 gives 967.60, which is wrong by 32.40. This mistake appears constantly in invoices prepared by hand, and it understates the base every time.

For Indian GST there is a further split that matters on the invoice rather than in the total. An intra-state supply divides the rate into CGST and SGST, half each, so 18% appears as 9% plus 9%. An inter-state supply uses a single IGST line at the full 18%. The amount payable is identical; the presentation is not, and getting it wrong is a compliance issue rather than an arithmetic one. A [GST calculator](/tool/gst-calculator) that shows the split is doing that part.

## What an EMI actually is

An equated monthly instalment is a fixed payment covering interest on the outstanding balance plus enough principal that the loan clears exactly at the end of the term.

\`\`\`
EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
\`\`\`

\`P\` is the principal, \`n\` the number of months, and \`r\` the **monthly** rate, which is the annual rate divided by 12 and then by 100. Using the annual rate here is the usual error and produces a wildly wrong figure. An [EMI calculator](/tool/emi-calculator) does this correctly and, more usefully, shows the amortisation schedule underneath; the exponentiation is awkward enough by hand that a [scientific calculator](/tool/scientific-calc) is the minimum if you want to check it yourself.

The payment is constant. Its composition is not, and that is the part worth understanding:

| Stage | Interest | Principal |
|---|---|---|
| First instalment | Most of it | Very little |
| Middle of term | Roughly even | Roughly even |
| Final instalment | Almost nothing | Almost all |

Because interest is charged on the outstanding balance, and the balance starts high, early payments are mostly interest. This has a direct consequence: **a lump sum repaid early removes far more total interest than the same sum repaid late**, because it removes principal that would otherwise have accrued interest for the whole remaining term.

It also explains why a small rate difference matters so much over a long term. On a 25-year loan, half a percentage point can change the total interest by more than a year's payments, because the effect compounds across 300 months. Comparing two offers by their EMI alone hides this; compare total interest paid.

## Units, and the one that is different

Most unit conversion is multiplication by a constant. A metre is 3.28084 feet, a kilogram is 2.20462 pounds, and the ratio holds at every value.

Temperature does not work that way, because the scales have different zero points:

\`\`\`
°F = °C × 9/5 + 32
\`\`\`

There is an offset, so the ratio between two temperatures is not preserved. 20°C is not twice as warm as 10°C in Fahrenheit, and "a 5 degree rise" means different amounts in the two scales. This is the one conversion where intuition from length and weight actively misleads, and it is why a [unit converter](/tool/unit-converter) handles temperature as a special case.

> [!NOTE]
> [BMI](/tool/bmi-calculator) deserves a similar caution. It is \`weight / height²\`, a population statistic from the 1830s, and it has no term for muscle, bone density, body composition or ancestry. It is a rough screening number, not a diagnosis, and it misclassifies muscular and elderly people in opposite directions.

## The small conversions

Two that come up more than you would expect:

[Number to words](/tool/number-to-words) exists because cheques, contracts and invoices require the amount spelled out. The reason is fraud prevention: digits can be altered with a pen, words cannot be extended convincingly. Note that the Indian system groups in lakhs and crores rather than thousands and millions, so the same figure is written differently depending on the convention.

[Roman numerals](/tool/roman-numerals) follow a subtractive rule where a smaller value before a larger one is subtracted: \`IV\` is 4, \`IX\` is 9, \`XL\` is 40. Only powers of ten are subtracted, and only from the next two values up, which is why \`IC\` is not a valid way to write 99. It is \`XCIX\`.

Every calculation here is arithmetic on numbers you typed, so none of it needs a server. That is worth having for the loan and tax cases in particular, where the figures being entered are salary, outstanding debt and turnover.`,
  },

  {
    slug: 'dates-numbers-across-locales',
    title: 'The same number written six ways: dates and separators across locales',
    description: 'A file that reads 03/04/2026 says two different dates depending on who opens it, and 1,234 means two different numbers.',
    excerpt: 'Half the world reads 03/04/2026 as March and half as April. Neither is wrong, which is exactly why the format cannot be trusted.',
    category: 'numbers',
    tags: ['locales', 'dates', 'currency', 'formatting'],
    published: '2026-09-14',
    relatedTools: ['number-to-words', 'unit-converter', 'timezone-converter', 'gst-calculator'],
    takeaways: [
      '03/04/2026 is March in the US and April almost everywhere else, and nothing in the file says which.',
      'In much of Europe the decimal separator is a comma, so 1,234 is one and a bit rather than a thousand.',
      'Store an unambiguous machine value and format it for display. Never store a formatted string.',
      'The Indian system groups digits in lakhs and crores, so the same figure is written differently from the same data.',
    ],
    body: `A colleague sends a spreadsheet with a column of dates reading \`03/04/2026\`. In London that is the third of April. In New York it is the fourth of March. Nothing in the file distinguishes them, and both readers are confident.

This is not a rare edge case. It is the default state of any exported data that nobody thought about.

## The date one is the worst of them

Three orderings are in wide use:

| Format | Where | \`03/04/2026\` means |
|---|---|---|
| DD/MM/YYYY | UK, most of Europe, India, Australia | 3 April |
| MM/DD/YYYY | United States | 4 March |
| YYYY-MM-DD | ISO 8601, most of East Asia | unambiguous |

The failure is silent, which is what makes it dangerous. A wrongly parsed date does not error; it produces a plausible wrong answer, and only days where the day number exceeds twelve give the game away. That means **roughly a third of dates are ambiguous and the rest are not**, so a spot check of a few rows will usually miss it.

The fix is to use ISO 8601, \`2026-04-03\`, everywhere that a machine will read it. It is unambiguous, it sorts correctly as plain text, and it is the one format no locale reinterprets. The same reasoning applies to [naming files](/blog/naming-files-that-survive), where an ISO date at the front is the only way a chronological set sorts chronologically.

## Separators swap over

Numbers have the mirror-image problem.

\`\`\`
1,234.56    UK, US, India, Australia
1.234,56    Germany, Spain, Italy, Brazil
1 234,56    France, Sweden, Poland
1'234.56    Switzerland
\`\`\`

So \`1,234\` is one thousand two hundred and thirty-four in London and one point two three four in Berlin. A CSV crossing that boundary does not merely display oddly; it is off by a factor of a thousand, or it splits into two columns because the comma is also the field delimiter in a locale where the list separator is a semicolon. That is the same collision behind [why CSVs break in Excel](/blog/why-csv-files-break-in-excel).

## Digit grouping is not always in threes

The Indian numbering system groups the first three digits and then in pairs, and uses names that have no Western equivalent:

\`\`\`
       1,00,000  = one lakh       (100 thousand)
   1,00,00,000  = one crore      (10 million)
\`\`\`

So ten million is written \`10,000,000\` in one convention and \`1,00,00,000\` in another, from the same underlying value. A [number to words](/tool/number-to-words) converter has to pick a system, and which one it picks changes the output entirely, which matters when the words are going on a cheque or into a contract where the written amount is the legally controlling one.

## Currency is not just a symbol

Placement and spacing vary: \`$1,234.56\`, \`1.234,56 €\`, \`SFr. 1'234.56\`. Minor units vary too. The assumption that every currency has two decimal places is wrong: the Japanese yen has none, and the Kuwaiti dinar has three. Code that rounds everything to two decimals is wrong in both directions.

And tax is a presentation problem as much as an arithmetic one. Whether a displayed price includes tax is a regional expectation rather than a detail: European prices are quoted inclusive, US prices exclusive. Getting the [inclusive and exclusive arithmetic](/blog/the-maths-behind-the-calculators) right is one job, and a [GST calculator](/tool/gst-calculator) that shows the split does it; presenting the result in the form a given market expects is a separate one.

## The rule that resolves all of it

> [!TIP]
> Store an unambiguous machine value and format it only at the moment of display. Never store a formatted string.

That means an ISO date or a [Unix timestamp](/blog/timestamps-time-zones-and-the-missing-hour) rather than \`03/04/2026\`; a number rather than \`"1,234.56"\`; an amount in minor units with a currency code rather than \`"$1,234.56"\`.

Formatting is a one-way operation. Once \`1.234,56\` is in a cell, recovering the intended value requires knowing which locale produced it, and that information is usually gone.

On the way out, \`Intl.NumberFormat\` and \`Intl.DateTimeFormat\` already know every rule above, including the Indian grouping and the currencies with no minor unit. Hand-rolling separators is how these bugs get written.

## Units, while you are here

The same discipline applies to measurements. Store a canonical unit, convert for display.

The failure mode is well documented: the Mars Climate Orbiter was lost in 1999 because one team supplied impulse in pound-force seconds while the receiving system expected newton-seconds. Nobody made an arithmetic error. The numbers simply meant different things, and nothing in the interface said which.

A [unit converter](/tool/unit-converter) handles the arithmetic, and the one case that is not a simple ratio is temperature, which has an offset rather than a scale factor, so intuition from length and weight actively misleads there.

## A short checklist for data that will travel

1. ISO 8601 dates in every file, every API and every filename.
2. Store numbers as numbers, never as formatted strings.
3. State the currency as a code, and do not assume two decimal places.
4. Say which unit a column is in, in the column name.
5. Format at the edge, using the platform's locale support rather than your own.
6. If a file crosses a border, say what conventions it uses in whatever accompanies it.

Point six is the cheapest of them and the one that would have prevented every problem described above.`,
  },

  {
    slug: 'mean-median-and-percentiles',
    title: 'Mean, median and percentiles: reading a number honestly',
    description: 'An average is one number standing in for a distribution. Which average you pick decides what it conceals.',
    excerpt: 'A mean response time of four hours can describe a service where nothing takes four hours. The median and a percentile say what actually happens.',
    category: 'numbers',
    tags: ['statistics', 'averages', 'percentiles', 'reporting'],
    published: '2026-09-14',
    relatedTools: ['percentage-calc', 'scientific-calc', 'csv-editor', 'unit-converter'],
    takeaways: [
      'The mean is pulled by outliers; the median is not. Skewed data needs the median.',
      'A percentile answers what the bad case looks like, which an average cannot.',
      'Always report the sample size next to an average, because 4.8 from six ratings is not 4.8 from six hundred.',
      'Averaging percentages or rates without weighting them by volume gives the wrong answer.',
    ],
    body: `Support tickets are answered in a mean time of four hours. Most are answered in twenty minutes; a handful took three days. The mean describes neither group and no individual ticket.

Choosing an average is choosing what to hide.

## Three summaries, three questions

**Mean.** Add everything, divide by the count. Uses every value, which is why a single extreme one moves it.

**Median.** Sort, take the middle. Half above, half below. An outlier changes the mean substantially and the median barely at all.

**Mode.** The most frequent value. Useful for categories, where a mean has no meaning.

\`\`\`
Salaries: 25k, 27k, 28k, 30k, 32k, 240k

Mean   = 63,667   describes nobody
Median = 29,000   describes the typical person
\`\`\`

The rule that follows: **if the data is skewed, use the median.** Income, house prices, response times, page load times and session durations are all skewed, because they have a floor and no ceiling.

If the data is roughly symmetric, the mean and median agree and it does not matter which you pick. Comparing the two is itself the fastest test for skew: if they are far apart, the distribution has a tail.

## Percentiles say what the bad case is

A percentile is the value below which a given share of observations fall. The 95th percentile is the value that 95% come in under.

This is the right tool for anything where the tail is the problem rather than the typical case.

\`\`\`
Page load, 1000 sessions

Median (p50)  0.8s    half of visits
p95           4.2s    1 in 20 visits
p99          11.0s    1 in 100 visits
\`\`\`

The median says the site is fast. The p99 says that one visitor in a hundred waits eleven seconds, and on a site with 100,000 sessions that is a thousand people. Both numbers are true, and they support different decisions.

> [!WARNING]
> Percentiles cannot be averaged. The p95 of two servers is not the mean of their individual p95 values, and combining them requires the underlying data. This is a common reporting error in dashboards that aggregate pre-computed percentiles.

## Rates and percentages need weighting

Averaging an average is the other reliable way to get a wrong number.

\`\`\`
Branch A: 90% satisfaction from 10 responses
Branch B: 70% satisfaction from 990 responses

Mean of the two rates = 80%
Actual overall        = 70.2%
\`\`\`

The correct calculation goes back to the counts: total satisfied divided by total responses. Averaging the percentages treats ten people and 990 people as equally important.

This matters constantly in reporting, because percentages are what get stored and the underlying counts often do not survive into the summary. A [percentage calculator](/tool/percentage-calc) does the arithmetic; keeping the denominators is the part that has to be decided earlier.

The same asymmetry that makes [percentage change non-symmetric](/blog/the-maths-behind-the-calculators) is at work here: a percentage is always *of something*, and averaging loses the something.

## What to publish next to a number

**The count.** An average with no sample size is uninterpretable. A 4.8 rating from six reviews and from six hundred look identical and mean different things.

**The spread.** Minimum and maximum at least, or the median alongside the mean.

**The period.** An average over what window, and is it the same window as last time.

A number presented alone invites a decision it may not support, and the count is the cheapest correction available.

## Two practical checks

**Sort the column and look at both ends.** This is the fastest way to find the impossible values, and a [CSV editor](/tool/csv-editor) that sorts does it in one click. A 400% completion rate or a negative age tells you the data has a problem before anyone acts on the average.

**Compare mean and median before trusting either.** If they differ substantially, the mean is being pulled and the median is the honest summary.

And the standing caution: a difference between two averages is not automatically a real difference. Small samples move around on their own, and two numbers that differ by a point may be describing the same underlying thing on two different days. Reporting the count is what lets a reader judge that for themselves.`,
  },

  {
    slug: 'compound-interest-and-saving',
    title: 'Compound interest: the arithmetic behind savings and debt',
    description: 'The same formula grows a savings balance and a credit card balance. Compounding frequency and fees decide how much of it you keep.',
    excerpt: 'A quoted rate and what you actually earn are different numbers. The gap is compounding frequency, and it has a name.',
    category: 'numbers',
    tags: ['interest', 'savings', 'apr', 'compounding'],
    published: '2026-09-14',
    relatedTools: ['emi-calculator', 'percentage-calc', 'scientific-calc', 'gst-calculator'],
    takeaways: [
      'Compounding means earning interest on previous interest, so the balance grows by a curve rather than a line.',
      'A nominal rate and the effective annual rate differ whenever interest compounds more than once a year.',
      'Time matters more than rate. Starting earlier beats a slightly better rate over any long period.',
      'Credit card interest usually compounds daily, which is why a balance grows faster than the headline rate suggests.',
    ],
    body: `Two accounts both advertise 12% a year. One pays it once at the end; the other pays 1% every month. After a year the second has paid 12.68%.

Nothing is misleading about either. They compound differently, and that gap is the whole subject.

## The formula

\`\`\`
A = P (1 + r/n)^(nt)
\`\`\`

\`P\` is the starting amount, \`r\` the annual rate as a decimal, \`n\` how many times a year it compounds, and \`t\` the number of years.

The interesting part is \`n\`. On 100,000 at 12% for one year:

| Compounding | n | Ending balance |
|---|---|---|
| Annually | 1 | 112,000 |
| Quarterly | 4 | 112,551 |
| Monthly | 12 | 112,683 |
| Daily | 365 | 112,747 |

More frequent compounding pays more on the same nominal rate, and the gains flatten quickly. The difference between daily and monthly is small; the difference between annual and monthly is not.

Because of this, a nominal rate is not directly comparable between products. The **effective annual rate** is what makes them comparable:

\`\`\`
EAR = (1 + r/n)^n - 1
\`\`\`

12% compounded monthly is an effective 12.68%. Comparing two savings products by their headline rate without checking the frequency compares two different things.

## Time is the variable that matters most

This is the part that is genuinely counter-intuitive, because the growth is exponential and intuition is linear.

\`\`\`
5,000 a year at 8%

10 years   78,227     contributed 50,000
20 years  247,115     contributed 100,000
30 years  611,729     contributed 150,000
\`\`\`

Contributions tripled between year 10 and year 30. The balance grew nearly eightfold. The extra came from returns on returns.

The practical consequence: **starting earlier beats optimising the rate.** Ten years of a mediocre return started now generally beats a better return started in ten years, and no amount of later contribution catches up, because the missing years are the ones that would have compounded longest.

## The same formula works against you

A credit card at 24% APR usually compounds daily, so the effective rate is closer to 27%.

Carry 50,000 and pay only the minimum, typically around 5% of the balance, and the balance falls very slowly because most of each payment is interest. This is the same structure as an [EMI amortisation schedule](/blog/the-maths-behind-the-calculators): early payments are mostly interest because interest is charged on the outstanding balance and the balance starts high.

Which is why an extra payment early removes far more total interest than the same amount later. It removes principal that would otherwise have accrued interest for the entire remaining term.

> [!NOTE]
> An [EMI calculator](/tool/emi-calculator) is the right tool here even for a card balance, because the amortisation view shows the split between interest and principal on each payment. That split is the argument for paying more than the minimum, and it is far more persuasive as a table than as a percentage.

## What quietly removes the gains

**Fees.** A 1% annual management fee on an 8% return takes about 12% of the growth every year, and compounds against you exactly as returns compound for you. Over thirty years that is a substantial share of the final balance.

**Inflation.** A 7% return with 5% inflation is a 2% real return. The nominal number is the one advertised and the real one is what you can buy.

**Tax.** Depends entirely on the jurisdiction and the account type, and the difference between a taxed and a tax-sheltered account over decades is usually larger than the difference between two reasonable rates.

None of these are hidden. They are simply not in the headline figure, which is a [percentage of something](/blog/the-maths-behind-the-calculators) that has not been stated.

## The rough check worth knowing

The rule of 72 estimates how long a balance takes to double:

\`\`\`
years to double = 72 / rate
\`\`\`

At 8%, about nine years. At 6%, twelve. At 2%, thirty-six.

It is an approximation and it is accurate enough for mental arithmetic in the 4% to 12% range, which covers most real decisions. It also works for the other direction: at 6% inflation, prices double in twelve years.

For anything where the answer matters, use the actual formula, with a [scientific calculator](/tool/scientific-calc) if you are checking someone else's figure by hand. And whenever you are comparing two products, convert both to an effective annual rate first, because that is the only comparison that means anything.`,
  },
];
