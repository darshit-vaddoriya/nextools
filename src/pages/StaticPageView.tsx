import React from 'react';
import { StaticPageId } from '../config/pages';
import { About } from './About';
import { Contact } from './Contact';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Terms } from './Terms';
import { Disclaimer } from './Disclaimer';
import { CookiePolicy } from './CookiePolicy';

interface StaticPageViewProps {
  pageId: StaticPageId;
  onBack: () => void;
  onOpenPage: (id: StaticPageId) => void;
}

/** Routes /about, /contact, /privacy, /terms, /disclaimer and /cookies to their page. */
export const StaticPageView: React.FC<StaticPageViewProps> = ({ pageId, onBack, onOpenPage }) => {
  switch (pageId) {
    case 'about':
      return <About onBack={onBack} onOpenContact={() => onOpenPage('contact')} />;
    case 'contact':
      return <Contact onBack={onBack} />;
    case 'terms':
      return <Terms onBack={onBack} />;
    case 'disclaimer':
      return <Disclaimer onBack={onBack} />;
    case 'cookies':
      return <CookiePolicy onBack={onBack} onOpenPrivacy={() => onOpenPage('privacy')} />;
    case 'privacy':
    default:
      return <PrivacyPolicy onBack={onBack} onOpenCookies={() => onOpenPage('cookies')} />;
  }
};
