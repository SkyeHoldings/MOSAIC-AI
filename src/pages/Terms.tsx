import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <article className="legal-page">
      <header className="page-hero legal-hero">
        <p className="legal-kicker">Legal</p>
        <h1>Terms &amp; Conditions</h1>
        <p>Last updated: August 5, 2026</p>
      </header>

      <div className="legal-body">
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to
          and use of{' '}
          <a href="https://hellomosaic.ai">hellomosaic.ai</a> (the
          &quot;Site&quot;) operated by MOSAIC (&quot;MOSAIC,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;). By using the Site, you agree to
          these Terms. If you do not agree, please do not use the Site.
        </p>

        <h2>1. About MOSAIC</h2>
        <p>
          MOSAIC is a marketing studio based in Coeur d&apos;Alene, Idaho. We
          provide marketing, creative, paid media, and AI-assisted systems for
          businesses. The Site describes our work and lets visitors contact us
          or book a discovery call.
        </p>

        <h2>2. Using the Site</h2>
        <p>You agree to use the Site only for lawful purposes and in a way that does not:</p>
        <ul>
          <li>Violate any applicable law or regulation</li>
          <li>Infringe the rights of MOSAIC or any third party</li>
          <li>Attempt to gain unauthorized access to our systems or data</li>
          <li>Interfere with or disrupt the Site&apos;s operation</li>
          <li>Submit false, misleading, or harmful information through forms</li>
        </ul>

        <h2>3. No professional advice on the Site alone</h2>
        <p>
          Content on the Site — including case studies, package descriptions,
          and marketing examples — is for general informational purposes. It
          does not create a client relationship by itself and is not a
          substitute for a signed agreement, statement of work, or advice
          tailored to your business.
        </p>

        <h2>4. Inquiries, proposals, and client work</h2>
        <p>
          Submitting a contact form, completing the private program brief, or
          booking a call does not obligate either party to enter into a paid
          engagement. The program brief is an informal working snapshot, not a
          proposal, contract, or validated assessment. Any services we provide are
          governed by a separate written agreement (such as a proposal, MSA, or
          statement of work). If those documents conflict with these Terms, the
          signed client agreement controls for that engagement.
        </p>

        <h2>5. Text messaging</h2>
        <p>
          If you opt in to receive SMS from MOSAIC through our{' '}
          <Link to="/sms-opt-in">SMS opt-in page</Link> or the optional consent
          checkbox on our contact form, you agree to receive recurring
          promotional and informational text messages. Message frequency varies.
          Message and data rates may apply. Consent is not a condition of any
          purchase. Reply STOP to cancel and HELP for help. Additional details
          are in our <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          The Site and its content — including text, graphics, logos, layouts,
          and design — are owned by MOSAIC or our licensors and are protected by
          intellectual property laws. You may view and share links to the Site
          for personal or internal business reference. You may not copy,
          scrape, republish, or commercially exploit Site content without our
          prior written consent, except as allowed by law.
        </p>
        <p>
          Client work shown on the Site remains subject to the rights and
          approvals of the applicable brand owners. Trademarks appearing in
          examples belong to their respective owners.
        </p>

        <h2>7. Third-party services and links</h2>
        <p>
          The Site may link to or embed third-party tools (for example Calendly
          for scheduling, Formspree for form delivery, SimpleTexting or similar
          SMS providers, and Google Analytics).
          We are not responsible for third-party sites, services, or their
          terms. Your use of those services is subject to their own policies.
        </p>

        <h2>8. Privacy</h2>
        <p>
          How we collect and use personal information is described in our{' '}
          <Link to="/privacy">Privacy Policy</Link>. By using the Site, you
          acknowledge that policy.
        </p>

        <h2>9. Disclaimers</h2>
        <p>
          THE SITE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
          WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING
          IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE
          UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </p>
        <p>
          Results described in case studies or marketing materials are examples
          and not guarantees of future performance for any particular client or
          campaign.
        </p>

        <h2>10. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOSAIC AND ITS OWNERS,
          EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
          OF PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF
          THE SITE. OUR TOTAL LIABILITY FOR CLAIMS ARISING OUT OF THE SITE WILL
          NOT EXCEED ONE HUNDRED U.S. DOLLARS (USD $100).
        </p>
        <p>
          Some jurisdictions do not allow certain limitations; in those cases,
          our liability is limited to the fullest extent permitted by law.
        </p>

        <h2>11. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless MOSAIC and its owners,
          employees, and agents from claims, damages, losses, and expenses
          (including reasonable attorneys&apos; fees) arising from your misuse
          of the Site or your violation of these Terms.
        </p>

        <h2>12. Changes to the Site or Terms</h2>
        <p>
          We may update the Site or these Terms at any time. The &quot;Last
          updated&quot; date will change when we revise the Terms. Continued use
          of the Site after changes means you accept the updated Terms.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Idaho, without
          regard to conflict-of-law rules. Courts located in Idaho will have
          exclusive jurisdiction over disputes arising from these Terms or the
          Site, except where applicable law requires otherwise.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions about these Terms:
          <br />
          MOSAIC
          <br />
          Coeur d&apos;Alene, Idaho
          <br />
          <a href="mailto:skye@hellomosaic.ai">skye@hellomosaic.ai</a>
          <br />
          <a href="https://hellomosaic.ai">https://hellomosaic.ai</a>
        </p>

        <p className="legal-nav">
          See also our <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </article>
  )
}
