// Static content pages (About / Contact / legal). These exist as real, crawlable
// routes because ad networks, AdSense in particular, require a site to publish
// ownership, contact and policy information before it can be approved.

export type StaticPageId =
  | 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'cookies';

export interface StaticPageMeta {
  id: StaticPageId;
  /** URL path, also used as the sitemap entry */
  path: string;
  /** Short label for nav/footer links */
  label: string;
  /** <title> (without the brand suffix) */
  title: string;
  description: string;
}

export const STATIC_PAGES: StaticPageMeta[] = [
  {
    id: 'about',
    path: '/about',
    label: 'About Us',
    title: 'About Us',
    description:
      'Who builds NextTool, why it exists and how a suite of free browser-based file, image and developer tools is run without uploads or accounts.',
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Contact Us',
    title: 'Contact Us',
    description:
      'Get in touch with the NextTool team for support, bug reports, feature requests, advertising or legal enquiries. We reply within two business days.',
  },
  {
    id: 'privacy',
    path: '/privacy',
    label: 'Privacy Policy',
    title: 'Privacy Policy',
    description:
      'How NextTool handles your data: files are processed on your device, plus full disclosure of cookies, analytics and Google AdSense advertising.',
  },
  {
    id: 'terms',
    path: '/terms',
    label: 'Terms of Service',
    title: 'Terms of Service',
    description:
      'The terms and conditions that govern your use of NextTool, including acceptable use, intellectual property and limitation of liability.',
  },
  {
    id: 'disclaimer',
    path: '/disclaimer',
    label: 'Disclaimer',
    title: 'Disclaimer',
    description:
      'Important disclaimers about the accuracy of NextTool results, external links, advertising and professional advice.',
  },
  {
    id: 'cookies',
    path: '/cookies',
    label: 'Cookie Policy',
    title: 'Cookie Policy',
    description:
      'Which cookies and local storage keys NextTool uses, why they exist, and how to control advertising cookies from Google and its partners.',
  },
];

export const STATIC_PAGE_IDS = STATIC_PAGES.map(p => p.id);

export const getStaticPage = (id: string): StaticPageMeta | undefined =>
  STATIC_PAGES.find(p => p.id === id);

export const getStaticPageByPath = (path: string): StaticPageMeta | undefined =>
  STATIC_PAGES.find(p => p.path === path);

/** Contact address published on the site, must match the AdSense account owner. */
export const CONTACT_EMAIL = 'dk.coder7250@gmail.com';

/** Human-readable date shown at the bottom of every policy page. */
export const POLICY_LAST_UPDATED = 'September 9, 2026';
