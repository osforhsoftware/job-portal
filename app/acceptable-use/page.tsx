import { MarketingPageLayout } from "@/components/marketing-page-layout"

export const metadata = {
  title: "Acceptable Use Policy | OneMyJob",
  description: "Rules for appropriate use of the OneMyJob platform.",
}

export default function AcceptableUsePage() {
  return (
    <MarketingPageLayout
      title="Acceptable Use Policy"
      subtitle="Last updated: May 2025 — This policy defines what you may and may not do on the OneMyJob platform."
    >
      <div className="mx-auto max-w-3xl space-y-10 text-sm text-muted-foreground">

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Purpose</h2>
          <p>
            This Acceptable Use Policy ("AUP") sets out the rules for using the OneMyJob platform
            ("Platform"). It applies to all users — candidates, companies, and agencies. This AUP
            is incorporated by reference into our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Prohibited Activities</h2>
          <p>You must not use the Platform to:</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Illegal or Harmful Activity</h3>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Violate any applicable local, national, or international law or regulation.</li>
                <li>Infringe on the intellectual property, privacy, or other rights of any person.</li>
                <li>Process personal data in a way that violates applicable data protection laws.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Misrepresentation and Fraud</h3>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Create a false identity, impersonate another person, or misrepresent your affiliation.</li>
                <li>Submit inaccurate, falsified, or misleading information in profiles, CVs, bids, or job demands.</li>
                <li>Manipulate or attempt to circumvent the bidding or matching process.</li>
                <li>Offer or accept payments or incentives outside the Platform in exchange for platform outcomes.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Harassment and Abuse</h3>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Harass, threaten, intimidate, or bully any other user.</li>
                <li>Post or transmit content that is discriminatory, hateful, sexually explicit, or violent.</li>
                <li>Contact users outside the Platform to circumvent its communication controls.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Technical Misuse</h3>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Scrape, spider, crawl, or otherwise systematically extract data from the Platform without written permission.</li>
                <li>Attempt to reverse engineer, decompile, or access the Platform's source code or infrastructure.</li>
                <li>Upload malware, viruses, ransomware, or any malicious code.</li>
                <li>Conduct denial-of-service attacks or attempt to gain unauthorised access to any account or system.</li>
                <li>Use automated tools (bots, scripts) to interact with the Platform in a way not expressly permitted.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Data Misuse</h3>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Collect, store, or process personal data of other users beyond what is reasonably required for the permitted recruitment purpose.</li>
                <li>Share, sell, or transfer other users' personal data to third parties without their consent.</li>
                <li>Use candidate data accessed through the Platform for any purpose other than evaluating that candidate for a legitimate vacancy.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-1">Spam and Unsolicited Communications</h3>
              <ul className="list-inside list-disc space-y-1 pl-2">
                <li>Send unsolicited commercial messages (spam) to other users.</li>
                <li>Send deceptive, misleading, or phishing communications.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Reporting Violations</h2>
          <p>
            If you believe another user has violated this AUP, please report it to us at{" "}
            <a href="mailto:support@onemyjob.com" className="text-primary hover:underline">
              support@onemyjob.com
            </a>{" "}
            with as much detail as possible. We will investigate and take appropriate action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Consequences of Violations</h2>
          <p>
            We take breaches of this AUP seriously. Depending on the severity, we may:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>Issue a warning.</li>
            <li>Temporarily suspend your account.</li>
            <li>Permanently terminate your account without refund.</li>
            <li>Report conduct to relevant authorities where required by law.</li>
          </ul>
          <p>
            We may act without prior notice where we believe there is an immediate risk to the
            Platform, other users, or third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Changes to This Policy</h2>
          <p>
            We may update this AUP from time to time. Material changes will be communicated via
            email or in-app notice. Continued use of the Platform after changes are posted
            constitutes acceptance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Contact</h2>
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
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, and{" "}
          <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
        </p>
      </div>
    </MarketingPageLayout>
  )
}
