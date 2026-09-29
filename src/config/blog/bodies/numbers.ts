// Article bodies for the "numbers" topic, split out of posts/numbers.ts.
//
// Bodies are only needed when an article is actually rendered, so they live in
// their own chunk. Keeping them beside the post metadata put every article on
// the site into the entry bundle — downloaded by the homepage and every tool
// page, which never display an article body.
export const NUMBERS_BODIES: Record<string, string> = {
  'timestamps-time-zones-and-the-missing-hour': `A nightly job has run correctly for months. One morning in spring the numbers are wrong by an hour, and a week later they are fine again. Nothing was deployed.

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

**Spring forward.** In the US, for example, clocks jump from 01:59 to 03:00. The hour between does not exist. A job scheduled at 02:30 local either does not run or runs twice, depending on the scheduler. A date arithmetic routine that adds 24 hours to a timestamp and calls it "tomorrow" lands an hour off.

**Autumn back.** Clocks go from 02:59 back to 02:00. That hour happens twice, so 02:30 local is ambiguous and maps to two distinct instants. A log sorted by local time appears to go backwards.

The rule that avoids both: do arithmetic in UTC, convert for display. "Add one day" is not "add 86,400 seconds" if a transition falls in between, and only the zone rules know that.

> [!WARNING]
> Zone rules change by legislation, not by nature. Countries add, remove and shift daylight saving with a few months' notice, and the IANA database is updated several times a year. A system pinned to an old copy will be quietly wrong for whichever region changed. This is not something you can reason out; it needs current data.

## Comparing across zones

When the question is "what time is the call for everyone", the answer is not arithmetic on offsets, because the offsets on the day of the meeting may not be the offsets today.

A [time zone converter](/tool/timezone-converter) that works from zone names rather than fixed offsets applies the rules for the actual date, which is why it can tell you that the London to New York gap is five hours for most of the year but four for about three weeks in March and one week around the start of November, because the US and UK change their clocks on different dates. That gap genuinely exists, it catches recurring meetings every spring, and no amount of offset arithmetic predicts it.

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
  'the-maths-behind-the-calculators': `A price rises 20% and then falls 20%. Most people expect to be back where they started. Starting at 100, you rise to 120, then fall by 20% *of 120*, which is 24, landing at 96.

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
  'unit-conversion-and-its-assumptions': `Unit conversion looks like the most solved problem in arithmetic. It is also the cause of one of the most expensive software failures on record — the Mars Climate Orbiter, lost because one system produced pound-force seconds and another consumed newton-seconds — and of a steady stream of smaller errors in recipes, invoices and engineering spreadsheets.

The reason is that "convert units" covers several genuinely different operations.

## Ratio scales: a single factor

Length, mass, duration, energy and data have a true zero. Zero metres is no length, and two metres is twice one metre. Conversion is one multiplication and the ratios compose:

\`\`\`
1 inch  = 25.4 mm       (exact, by definition)
1 mile  = 1,609.344 m   (exact)
1 kg    = 2.20462262 lb
\`\`\`

The first two are exact because the inch and the yard were redefined in terms of the metre in 1959. That is worth knowing: many imperial units are now *defined* metrically, so the conversion is not an approximation.

## Interval scales: a factor and an offset

Celsius and Fahrenheit have arbitrary zeros. Zero degrees is not the absence of temperature, so ratios are meaningless — 20 °C is not twice as hot as 10 °C in any physical sense.

\`\`\`
°F = °C × 9/5 + 32
°C = (°F − 32) × 5/9
\`\`\`

The offset also means differences convert differently from values. A rise of 10 °C is a rise of 18 °F, not 50 °F. Applying the value formula to a difference is a standard bug in weather and process-control code.

Kelvin is the exception: it has a true zero, so it is a ratio scale and 200 K really is twice 100 K.

## The same name, different sizes

Several unit names mean different quantities depending on where you are:

- **Gallon.** US 3.785 L, imperial 4.546 L — about 20% apart.
- **Fluid ounce.** US 29.57 mL, imperial 28.41 mL.
- **Ton.** Short 907 kg, long 1,016 kg, metric 1,000 kg.
- **Pint.** US 473 mL, imperial 568 mL.
- **Billion.** Now 10⁹ almost everywhere, but older European documents use 10¹².

None of these is signalled by the unit name, so a fuel-economy or shipping-weight figure copied between two documents can be 10–20% wrong with nothing to flag it. A [unit converter](/tool/unit-converter) that names the system explicitly — US liquid gallon, not "gallon" — is not being pedantic; it is the only way the answer is defined.

> [!NOTE]
> Fuel economy is a double trap: miles per gallon is distance ÷ volume, litres per 100 km is volume ÷ distance. They are reciprocals, so converting is not a factor at all, and a higher number is better in one and worse in the other.

## Conversions that need a property

Some "conversions" are not unit conversions:

**Mass to volume** requires density. 1 kg of water is 1 L; 1 kg of flour is about 1.9 L; 1 kg of honey is about 0.7 L. This is why cup measurements in recipes are unreliable across ingredients, and why professional baking uses mass.

**Currency** requires a rate, which changes every second and differs between mid-market, card and cash. There is no intrinsic factor between two currencies; a currency converter reports a rate at a moment, not a fact.

**Data rate to transfer time** requires the actual throughput, not the advertised one. And bits versus bytes is a factor of eight that connection speeds and file sizes deliberately state differently.

**KB versus KiB.** 1 kB is 1,000 bytes; 1 KiB is 1,024. Storage manufacturers use the first, operating systems historically used the second, and the gap grows with scale — about 7% at the gigabyte level and 10% at the terabyte level, which is exactly why a "2 TB" drive shows as 1.81 TB.

> [!WARNING]
> Round once, at the end. Converting inches to centimetres, rounding to a whole number, then converting to metres and rounding again produces an error several times larger than doing the full chain at full precision and rounding the final figure. In spreadsheets, be sure you are rounding the value rather than only its display — the two behave very differently downstream.

## Practical rules

1. Write the unit next to every number, in cells, variables and API fields.
2. Name the system, not just the unit: \`us_gallons\`, not \`gallons\`.
3. Convert at the boundary, store one canonical unit internally.
4. Treat temperature differences separately from temperature values.
5. Round at the end, once.

The [unit converter](/tool/unit-converter) and [scientific calculator](/tool/scientific-calc) here run locally, so checking a figure is instant and the numbers you are checking stay on your machine.`,
};
