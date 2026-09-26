/**
 * The homepage FAQ.
 *
 * Single source of truth for both the visible accordion (App.tsx) and the
 * FAQPage JSON-LD (utils/seo.ts). Google requires the structured data to match
 * what the visitor actually sees, so these must never be maintained separately.
 *
 * Every answer has to stay literally true: no absolute promises ("forever",
 * "unlimited", "nothing is stored") and no claims about named competitors.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'Are the tools really free?',
    a: 'Yes. Every tool on NextTool is free to use, with no paid tiers, watermarks or sign-up. The site is supported by advertising.',
  },
  {
    q: 'Do my files get uploaded to a server?',
    a: 'No. The tools run in your browser, so the files you open are processed on your own device and are not sent to us. Some tools download a library or an AI model the first time you use them; that is code coming to you, not your file going anywhere.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account, no email and no sign-up required. Just open a tool and start using it immediately.',
  },
  {
    q: 'What happens to my files after I finish?',
    a: 'If History is on (the default), copies of your files and results are kept in this browser only, so you can download them again from the History page. You can turn History off or clear it at any time in Settings. With History off, files are discarded when you leave the page. Either way they stay on your device.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'There is no limit set by us. Because the work happens on your device, the practical limit is your browser\'s memory: very large videos or PDFs with thousands of pages may be slow on a phone or an older computer.',
  },
  {
    q: 'How is this different from converter sites that upload files?',
    a: 'Upload-based services send your file to their server, process it there and send the result back. NextTool does the processing inside your browser tab instead, so there is no upload wait and your file is not handed to a third party.',
  },
];
