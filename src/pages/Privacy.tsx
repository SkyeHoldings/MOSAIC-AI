import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <article className="legal-page">
      <header className="page-hero legal-hero">
        <p className="legal-kicker">Legal</p>
        <h1>Privacy Policy</h1>
        <p>Last updated: August 5, 2026</p>
      </header>

      <div className="legal-body">
        <p>
          This Privacy Policy explains how MOSAIC (&quot;MOSAIC,&quot; &quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares information when
          you visit{' '}
          <a href="https://hellomosaic.ai">hellomosaic.ai</a> (the
          &quot;Site&quot;) or contact us about our marketing and AI services.
        </p>

        <h2>1. Who we are</h2>
        <p>
          MOSAIC is a marketing studio based in Coeur d&apos;Alene, Idaho,
          serving businesses in the Inland Northwest and beyond. For privacy
          questions, email{' '}
          <a href="mailto:skye@hellomosaic.ai">skye@hellomosaic.ai</a>.
        </p>

        <h2>2. Information we collect</h2>
        <h3>Information you provide</h3>
        <p>
          When you use our contact form, SMS opt-in form, or otherwise reach out,
          we may collect:
        </p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Mobile phone number</li>
          <li>Company name</li>
          <li>Area of interest or message content</li>
          <li>SMS opt-in consent and related disclosures you accept</li>
          <li>Any other details you choose to share</li>
        </ul>
        <p>
          If you book a call through Calendly, Calendly may collect scheduling
          details (such as name, email, and meeting preferences) according to
          its own privacy policy.
        </p>

        <h3>Information collected automatically</h3>
        <p>
          Like most websites, we may automatically collect certain technical
          information when you visit the Site, including:
        </p>
        <ul>
          <li>IP address and approximate location</li>
          <li>Browser type, device type, and operating system</li>
          <li>Pages viewed, referring URL, and time spent on pages</li>
          <li>Date and time of visits</li>
        </ul>
        <p>
          We use Google Analytics (measurement ID G-6PMLC3GB8M) to understand
          how the Site is used. Google may set cookies or similar technologies
          as described in Google&apos;s privacy documentation.
        </p>

        <h2>3. How we use information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Respond to inquiries and schedule conversations</li>
          <li>Provide, improve, and operate our Site and services</li>
          <li>Understand Site performance and visitor interest</li>
          <li>Send follow-up communications related to your request</li>
          <li>
            Send text messages you have opted into (for example promotional
            updates, appointment reminders, and related MOSAIC messages)
          </li>
          <li>Protect against misuse and comply with legal obligations</li>
        </ul>
        <p>
          We do not sell your personal information. We do not sell or share
          mobile phone numbers with third parties or affiliates for their own
          marketing.
        </p>
        <h3>Text messaging</h3>
        <p>
          If you opt in to SMS through our{' '}
          <Link to="/sms-opt-in">SMS opt-in page</Link> or the optional consent
          checkbox on our contact form, you may receive recurring promotional
          and informational texts from MOSAIC. Message frequency varies. Message
          and data rates may apply. Reply STOP to cancel and HELP for help.
          Consent is not a condition of any purchase. You can also email{' '}
          <a href="mailto:skye@hellomosaic.ai">skye@hellomosaic.ai</a> to update
          your preferences.
        </p>

        <h2>4. How we share information</h2>
        <p>We may share information with:</p>
        <ul>
          <li>
            <strong>Service providers</strong> who help us run the Site and
            communications — for example Formspree (form delivery), SimpleTexting
            or similar SMS providers (text messaging), Calendly (scheduling),
            Google Analytics (analytics), and hosting providers
          </li>
          <li>
            <strong>Professional advisors</strong> such as lawyers or
            accountants when reasonably necessary
          </li>
          <li>
            <strong>Authorities</strong> when required by law or to protect
            rights, safety, or property
          </li>
        </ul>
        <p>
          If we are involved in a merger, acquisition, or asset sale, information
          may be transferred as part of that transaction.
        </p>

        <h2>5. Cookies and similar technologies</h2>
        <p>
          Cookies and similar technologies may be used for essential Site
          function and analytics. You can control cookies through your browser
          settings. Disabling cookies may affect how some parts of the Site
          work.
        </p>

        <h2>6. Data retention</h2>
        <p>
          We keep personal information only as long as needed for the purposes
          described in this policy, unless a longer period is required or
          permitted by law. Contact-form submissions are typically retained so
          we can manage client relationships and follow up on inquiries.
        </p>

        <h2>7. Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational
          measures to protect personal information. No method of transmission
          or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>

        <h2>8. Your choices and rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          update, or delete certain personal information, or to object to or
          restrict certain processing. To make a request, email{' '}
          <a href="mailto:skye@hellomosaic.ai">skye@hellomosaic.ai</a>. We may
          need to verify your identity before completing the request.
        </p>

        <h2>9. Children&apos;s privacy</h2>
        <p>
          The Site is not directed to children under 13, and we do not knowingly
          collect personal information from children under 13. If you believe a
          child has provided us information, contact us and we will take
          appropriate steps to delete it.
        </p>

        <h2>10. Third-party links and embeds</h2>
        <p>
          The Site may link to or embed third-party services (including Calendly
          and analytics tools). Those services are governed by their own privacy
          policies, not this one.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last
          updated&quot; date at the top will change when we do. Continued use of
          the Site after an update means you accept the revised policy.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions about this Privacy Policy or our data practices:
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
          See also our <Link to="/terms">Terms &amp; Conditions</Link>.
        </p>
      </div>
    </article>
  )
}
