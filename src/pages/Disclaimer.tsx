import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';

interface DisclaimerProps {
  onBack: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onBack }) => (
  <PageLayout
    icon={AlertTriangle}
    title="Disclaimer"
    subtitle="What NextTool does and does not guarantee about its tools, content and advertising"
    onBack={onBack}
  >
    <PageProse>
      <PageSection title="General information only">
        <p>
          All content on https://nexttool.click, including tool descriptions, how-to guides, FAQs
          and calculator outputs, is published for general information and convenience. We make
          every reasonable effort to keep it accurate and current, but we give no warranty of any
          kind, express or implied, about the completeness, accuracy, reliability or suitability of
          the site or its content for any purpose. Any reliance you place on it is strictly at your
          own risk.
        </p>
      </PageSection>

      <PageSection title="Tool results and data loss">
        <p>
          The tools on this site convert, compress, edit and generate files locally in your
          browser. Results depend on your browser, device capabilities and the structure of your
          input file. Conversions can change formatting, drop unsupported features or, in rare
          cases, fail on damaged input.
        </p>
        <p>
          <strong className="text-foreground">Always keep an original copy of any file before
          processing it.</strong> NextTool accepts no liability for corrupted output, lost data or
          any decision made on the basis of a tool's result.
        </p>
      </PageSection>

      <PageSection title="Not professional advice">
        <p>
          Nothing on this site constitutes professional advice. In particular:
        </p>
        <PageList
          items={[
            'Financial calculators (EMI, GST, percentage, currency and similar) produce estimates for illustration only and are not financial, tax or investment advice.',
            'Health calculators such as BMI are simplified formulas and are not medical advice or a diagnosis.',
            'Security tools such as password and hash generators are provided as utilities and are not a substitute for a professional security review.',
            'Document tools do not make an output legally valid; signing, redaction and form-filling results should be reviewed by a qualified professional where the stakes require it.',
          ]}
        />
        <p>
          Always consult a suitably qualified professional before acting on anything you calculate
          or produce here.
        </p>
      </PageSection>

      <PageSection title="Advertising disclosure">
        <p>
          NextTool is free to use and is funded by advertising served through Google AdSense, and
          occasionally by voluntary donations. Advertisements are labelled and are placed outside
          the working area of each tool. We do not choose, endorse or vet individual advertisements
          and receive no compensation from advertisers for editorial coverage. Any transaction you
          enter into with an advertiser is entirely between you and that advertiser.
        </p>
      </PageSection>

      <PageSection title="External links">
        <p>
          This site links to external websites that are not maintained by us. We include such links
          where they are useful, but we have no control over their content, availability or
          practices, and a link does not imply endorsement. Please review the terms and privacy
          policy of any external site you visit.
        </p>
      </PageSection>

      <PageSection title="Trademarks and affiliation">
        <p>
          Product and format names such as PDF, Word, Excel, PowerPoint, JPEG and PNG are the
          property of their respective owners and are used here only to describe file
          compatibility. NextTool is an independent project and is not affiliated with, endorsed by
          or sponsored by Adobe, Microsoft, Google or any other such company.
        </p>
      </PageSection>

      <PageSection title="Availability">
        <p>
          We do not guarantee that the site will be available without interruption or free of
          errors. Tools may be added, changed or withdrawn at any time, and browser updates can
          affect features that rely on newer web platform capabilities.
        </p>
      </PageSection>

      <PageSection title="Contact">
        <p>
          If you believe something on this site is inaccurate or misleading, please tell us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 hover:brightness-110">
            {CONTACT_EMAIL}
          </a>{' '}
          and we will review it.
        </p>
      </PageSection>
    </PageProse>
  </PageLayout>
);
