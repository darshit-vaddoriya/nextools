import { BlogPost } from '../types';

export const NUMBERS_POSTS: BlogPost[] = [
  {
    slug: 'timestamps-time-zones-and-the-missing-hour',
    title: 'Unix timestamps, UTC and the off-by-one-hour bug',
    description: 'A timestamp is a count of seconds with no time zone in it. Almost every date bug comes from adding a zone too early or too late.',
    excerpt: 'Your report is right eleven months of the year and wrong for one week in spring. That is daylight saving, and the fix is upstream of the report.',
    category: 'data',
    tags: ['timestamps', 'timezones', 'dates'],
    published: '2026-09-16',
    updated: '2026-09-29',
    relatedTools: ['timestamp-converter', 'timezone-converter', 'age-calculator'],
    takeaways: [
      'A Unix timestamp has no time zone. It is a count of seconds since 1970 in UTC, and a zone is applied only when it is displayed.',
      'Store UTC, display local. Storing local time loses which offset was in force and cannot be recovered later.',
      'Offsets like +05:30 are not time zones. A zone is a set of rules that changes; an offset is a single number at one instant.',
      'A 10-digit number is seconds and a 13-digit one is milliseconds. Mixing them puts dates in January 1970 or tens of thousands of years in the future.',
    ],
    words: 907,
  },

  {
    slug: 'the-maths-behind-the-calculators',
    title: 'EMI, GST and percentages: the formulas the calculators are running',
    description: 'Loan instalments, tax-inclusive prices and percentage change all have one formula each. Knowing them tells you when an answer is wrong.',
    excerpt: 'A 20% rise followed by a 20% fall does not get you back to where you started. That is not a rounding error, and the same confusion makes tax and loan figures wrong.',
    category: 'data',
    tags: ['finance', 'percentages', 'units'],
    published: '2026-09-16',
    relatedTools: ['emi-calculator', 'gst-calculator', 'percentage-calc', 'unit-converter', 'bmi-calculator', 'number-to-words', 'roman-numerals', 'scientific-calc'],
    takeaways: [
      'Percentage change is not symmetric. Down 20% then up 20% leaves you 4% below where you started.',
      'Removing GST from an inclusive price is division, not subtraction. Taking 18% off a 118 price does not give 100.',
      'EMI is fixed but its split is not: early instalments are mostly interest, which is why early repayment saves so much.',
      'Temperature is the one unit conversion with an offset, so a ratio that works for length does not work for Celsius.',
    ],
    words: 1075,
  },

  {
    slug: 'unit-conversion-and-its-assumptions',
    title: 'Unit conversion is not one multiplication',
    description: 'Some conversions are a factor, some need an offset, and some depend on what you are measuring. Mixing them up is how spacecraft get lost.',
    excerpt: 'Twice the temperature in Celsius is not twice the temperature. Half the conversions people treat as multiplication are not multiplication.',
    category: 'data',
    tags: ['units', 'conversion', 'measurement'],
    published: '2026-09-17',
    updated: '2026-09-29',
    relatedTools: ['unit-converter', 'scientific-calc', 'percentage-calc'],
    takeaways: [
      'Ratio scales (length, mass, time) convert by multiplication. Interval scales (Celsius, Fahrenheit) need an offset, so doubling them is meaningless.',
      'A US gallon and an imperial gallon differ by about 20%, and both are called "gallon". The same trap applies to tons, pints and fluid ounces.',
      'Converting mass to volume requires a density, which is a property of the substance. A cup of flour and a cup of water are not the same weight.',
      'Round only at the end. Rounding mid-chain compounds the error through every later step.',
    ],
    words: 774,
  },
];
