import { MarketingPageLayout } from "@/components/marketing-page-layout"

export const metadata = {
  title: "Privacy Policy | OneMyJob",
  description: "Learn how OneMyJob collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <MarketingPageLayout
      title="Privacy Policy"
      subtitle="Last updated: May 2025 — We respect your privacy and are committed to protecting your personal data."
    >
      <div className="mx-auto max-w-3xl space-y-10 text-sm text-muted-foreground">

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Who We Are</h2>
          <p>
            OneMyJob ("we", "our", "us") operates the recruitment and bidding platform available
            at onemyjob.com. We are headquartered in Dubai, United Arab Emirates. For privacy
            enquiries contact us at{" "}
            <a href="mailto:support@onemyjob.com" className="text-primary hover:underline">
              support@onemyjob.com
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Information We Collect</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Account data:</strong> name, email address,
              hashed password, account role (candidate, agency, company).
            </li>
            <li>
              <strong className="text-foreground">Profile data:</strong> employment history,
              education, skills, uploaded CV / documents, profile photo (candidates); company
              name, address, registration number (companies); agency name and proof documents
              (agencies).
            </li>
            <li>
              <strong className="text-foreground">Recruitment activity:</strong> job applications,
              shortlist status, bid and offer submissions, messages, interview scheduling
              metadata, and demand postings.
            </li>
            <li>
              <strong className="text-foreground">Technical data:</strong> IP address,
              device/browser information, session identifiers, log data, and cookie identifiers.
            </li>
            <li>
              <strong className="text-foreground">Payment data (if applicable):</strong> billing
              contact name, payment status. Full card data is handled by our payment processor
              and never stored on our servers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. How We Use Your Information</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>Provide and operate Platform features (registration, dashboards, search, bidding, messaging).</li>
            <li>Match candidates with relevant job demands and connect companies with suitable profiles.</li>
            <li>Send transactional notifications (application updates, bid activity, account alerts).</li>
            <li>Security monitoring, fraud prevention, and abuse detection.</li>
            <li>Customer support and responding to your enquiries.</li>
            <li>Analytics and product improvement (using aggregated or anonymised data where possible).</li>
            <li>Compliance with applicable laws and legal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Legal Bases for Processing (GDPR / UK GDPR)</h2>
          <p>Where EU or UK data protection law applies, we rely on the following legal bases:</p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li><strong className="text-foreground">Contract:</strong> processing necessary to provide the Platform as agreed at registration.</li>
            <li><strong className="text-foreground">Legitimate interests:</strong> security, fraud prevention, and product improvement.</li>
            <li><strong className="text-foreground">Consent:</strong> non-essential cookies and optional marketing communications (you may withdraw at any time).</li>
            <li><strong className="text-foreground">Legal obligation:</strong> compliance with applicable laws.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Sharing Your Information</h2>
          <p>We may share information with:</p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Other users you interact with:</strong> candidate
              profile data is shared with companies and agencies based on your actions and Platform
              settings (e.g., applying for a demand, being shortlisted).
            </li>
            <li>
              <strong className="text-foreground">Service providers:</strong> cloud hosting,
              email delivery, analytics, customer support tools, and payment processors — all
              bound by appropriate data processing agreements.
            </li>
            <li>
              <strong className="text-foreground">Legal authorities:</strong> where required by
              applicable law, court order, or to protect the rights, property, or safety of
              OneMyJob, its users, or the public.
            </li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide the
            Platform, comply with legal obligations, resolve disputes, and enforce our agreements.
            Profile and application data is typically retained for up to 3 years after account
            closure, unless a shorter period is required by law or requested by you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">7. Your Rights</h2>
          <p>
            Depending on your location you may have the right to:
          </p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li><strong className="text-foreground">Access</strong> — request a copy of your personal data.</li>
            <li><strong className="text-foreground">Rectification</strong> — correct inaccurate data.</li>
            <li><strong className="text-foreground">Erasure</strong> — request deletion of your data ("right to be forgotten"), subject to legal limits.</li>
            <li><strong className="text-foreground">Restriction / Objection</strong> — limit or object to certain processing.</li>
            <li><strong className="text-foreground">Data portability</strong> — receive your data in a structured, machine-readable format.</li>
            <li><strong className="text-foreground">Withdraw consent</strong> — where processing is based on consent, withdraw it at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:support@onemyjob.com" className="text-primary hover:underline">
              support@onemyjob.com
            </a>. We will respond within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">8. International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries outside your own. Where
            required, we rely on appropriate safeguards such as standard contractual clauses
            approved by relevant data protection authorities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">9. Security</h2>
          <p>
            We apply administrative, technical, and organisational security measures including
            encrypted data transmission (TLS), hashed passwords, and role-based access controls.
            No system is completely secure; please use a strong, unique password and keep it
            confidential.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">10. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies. See our full{" "}
            <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for
            details on what we use and how to manage your preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">11. Children</h2>
          <p>
            The Platform is not intended for anyone under 18 years of age. We do not knowingly
            collect personal information from children. If you believe we have inadvertently
            collected such data, please contact us immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the revised version
            with a new "Last updated" date. For material changes we will notify you by email or
            in-app notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">13. Contact Us</h2>
          <p>
            OneMyJob — Dubai, United Arab Emirates
            <br />
            Email:{" "}
            <a href="mailto:support@onemyjob.com" className="text-primary hover:underline">
              support@onemyjob.com
            </a>
          </p>
        </section>

        <p className="border-t border-border pt-6 text-xs">
          Also see our{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>,{" "}
          <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>, and{" "}
          <a href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</a>.
        </p>
      </div>
    </MarketingPageLayout>
  )
}
