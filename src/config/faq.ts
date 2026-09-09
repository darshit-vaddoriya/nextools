/**
 * The homepage FAQ.
 *
 * Single source of truth for both the visible accordion (App.tsx) and the
 * FAQPage JSON-LD (utils/seo.ts). Google requires the structured data to match
 * what the visitor actually sees, so these must never be maintained separately.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'Are the tools really free?',
    a: 'Yes. Every tool on NextTool is free, with no hidden fees, premium tiers or usage limits.',
  },
  {
    q: 'Do my files get uploaded to a server?',
    a: 'No. All processing happens on your device, so your files are never sent anywhere.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account, no email and no sign-up required. Just open a tool and start using it immediately.',
  },
  {
    q: 'What happens to my files after I finish?',
    a: 'Your files are only read by the tool you opened and are cleared when you leave the page. Nothing is stored or tracked.',
  },
  {
    q: 'How is NextTool different from iLovePDF or SmallPDF?',
    a: 'Unlike cloud-based alternatives, NextTool processes everything locally for faster results, complete privacy and no upload limits.',
  },
];
