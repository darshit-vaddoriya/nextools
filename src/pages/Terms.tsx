import React from 'react';
import { Scale } from 'lucide-react';
import { PageLayout, PageProse, PageSection, PageList } from './PageLayout';
import { CONTACT_EMAIL } from '../config/pages';

interface TermsProps {
  onBack: () => void;
}

export const Terms: React.FC<TermsProps> = ({ onBack }) => (
  <PageLayout
    icon={Scale}
    title="Terms of Service"
    subtitle="The agreement between you and NextTool when you use this website"
    onBack={onBack}
  >
    <PageProse>
      <PageSection title="1. Acceptance of these terms">
        <p>
          These Terms of Service govern your access to and use of https://nexttool.click and the
          tools published on it (the "Service"). By using the Service you agree to be bound by
          these terms. If you do not agree, do not use the Service.
        </p>
      </PageSection>

      <PageSection title="2. The Service">
        <p>
          NextTool provides free, browser-based utilities for working with documents, images, text,
          code and other data. All processing happens locally in your browser. No account is
          required and no fee is charged. We may add, change, suspend or remove any tool at any
          time without notice.
        </p>
      </PageSection>

      <PageSection title="3. Your files and your responsibility">
        <p>
          You keep all rights to the files and content you process with NextTool. Because that
          content never leaves your device, we never acquire any licence to it and never take
          custody of it.
        </p>
        <p>
          You are solely responsible for the content you process, for having the legal right to
          process it, and for keeping your own backups. Always retain an original copy before
          running any operation that modifies a file.
        </p>
      </PageSection>

      <PageSection title="4. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <PageList
          items={[
            'break any applicable law or regulation, or infringe anyone\'s intellectual property, privacy or other rights;',
            'process material you are not authorised to possess or modify, including forging or falsifying documents;',
            'attempt to disrupt, overload, reverse-engineer for malicious purposes, or gain unauthorised access to the site or its infrastructure;',
            'scrape, mirror or systematically republish the site\'s content or code as a competing service;',
            'interfere with, obscure, click artificially on, or otherwise manipulate advertising shown on the site; or',
            'distribute malware or use the tools as part of an attack on any third party.',
          ]}
        />
      </PageSection>

      <PageSection title="5. Intellectual property">
        <p>
          The NextTool name, logo, interface design, written guides and original source code are
          owned by NextTool and protected by copyright and other laws. You may use the Service for
          personal and commercial work, but you may not copy, resell or redistribute the site
          itself without written permission. Third-party open-source libraries used by the site
          remain under their own licences.
        </p>
      </PageSection>

      <PageSection title="6. Advertising">
        <p>
          The Service is supported by advertising, currently served through Google AdSense. By
          using the Service you accept that ads will be displayed alongside the tools. We do not
          endorse advertised products and are not a party to any transaction between you and an
          advertiser.
        </p>
      </PageSection>

      <PageSection title="7. No warranty">
        <p>
          The Service is provided "as is" and "as available", without warranties of any kind,
          express or implied, including merchantability, fitness for a particular purpose,
          accuracy, and non-infringement. We do not warrant that any tool will be uninterrupted,
          error-free, or that outputs will meet your requirements or be free of data loss or
          formatting changes.
        </p>
      </PageSection>

      <PageSection title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, NextTool and its operators will not be liable for
          any indirect, incidental, special, consequential or exemplary damages, or for any loss of
          data, files, profits, revenue or goodwill, arising from or related to your use of or
          inability to use the Service — even if we have been advised of the possibility of such
          damages. Where liability cannot be excluded, it is limited to INR 1,000 or the amount you
          paid us in the preceding twelve months, whichever is greater.
        </p>
      </PageSection>

      <PageSection title="9. Indemnity">
        <p>
          You agree to indemnify and hold harmless NextTool and its operators from any claim,
          demand, loss or expense (including reasonable legal fees) arising out of your misuse of
          the Service or your breach of these terms or of any law or third-party right.
        </p>
      </PageSection>

      <PageSection title="10. Third-party links and services">
        <p>
          The Service contains links to third-party websites and embeds third-party services such
          as advertising and analytics. We do not control and are not responsible for their
          content, policies or practices. Your dealings with them are solely between you and them.
        </p>
      </PageSection>

      <PageSection title="11. Termination">
        <p>
          We may restrict or terminate your access to the Service at any time if you breach these
          terms or use the Service in a way that harms it or other users. You may stop using the
          Service at any time.
        </p>
      </PageSection>

      <PageSection title="12. Governing law">
        <p>
          These terms are governed by the laws of India, and the courts of Gujarat, India will have
          exclusive jurisdiction over any dispute, without prejudice to any mandatory consumer
          protection rights you have where you live.
        </p>
      </PageSection>

      <PageSection title="13. Changes and contact">
        <p>
          We may revise these terms from time to time; the current version is always the one
          published on this page, and the date below shows when it last changed. Questions about
          these terms can be sent to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2 hover:brightness-110">
            {CONTACT_EMAIL}
          </a>.
        </p>
      </PageSection>
    </PageProse>
  </PageLayout>
);
