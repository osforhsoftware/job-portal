import { MarketingPageLayout } from "@/components/marketing-page-layout"

export const metadata = {
  title: "Cookie Policy | OneMyJob",
  description: "Learn about the cookies OneMyJob uses and how to manage your preferences.",
}

export default function CookiesPage() {
  return (
    <MarketingPageLayout
      title="Cookie Policy"
      subtitle="Last updated: May 2025 — This policy explains the cookies and similar technologies we use on OneMyJob."
    >
      <div className="mx-auto max-w-3xl space-y-10 text-sm text-muted-foreground">

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They help
            websites remember preferences, keep you logged in, and understand how you interact with
            the site. Similar technologies include local storage, session storage, and pixel tags.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Cookies We Use</h2>

          <div className="space-y-5">
            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Essential Cookies</h3>
              <p>
                These are strictly necessary for the Platform to function. They handle authentication
                sessions (keeping you logged in), security tokens, load balancing, and UI state such as
                sidebar open/closed preferences. You cannot opt out of essential cookies without
                disabling the Platform's core functionality.
              </p>
              <p className="text-xs"><strong className="text-foreground">Examples:</strong> session token, CSRF token, sidebar state preference.</p>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Preference Cookies</h3>
              <p>
                These remember your choices so you don't have to set them every visit — for example
                language selection or display settings. Disabling them may mean you need to re-enter
                preferences each session.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Analytics Cookies (Optional)</h3>
              <p>
                We may use analytics tools (e.g. page-view tracking) to understand how users navigate
                the Platform so we can improve it. These cookies collect aggregated, anonymised data
                about visits — not personal information tied to your identity.
              </p>
              <p className="text-xs">These are only set with your consent where required by law.</p>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Marketing Cookies (Optional)</h3>
              <p>
                We do not currently use marketing or retargeting cookies. If this changes in the future,
                we will update this policy and request your consent before setting them.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Third-Party Cookies</h2>
          <p>
            Some features may use third-party services (such as an embedded video or payment
            widget) that set their own cookies. We do not control those cookies. Please refer to
            the relevant third party's privacy and cookie policies for more information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. How to Control Cookies</h2>
          <p>
            You can manage cookies through your browser settings. Most browsers let you:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>View the cookies that have been set.</li>
            <li>Delete some or all cookies.</li>
            <li>Block cookies from all or specific sites.</li>
          </ul>
          <p>
            Please note that blocking or deleting essential cookies will prevent the Platform from
            working correctly — you may not be able to log in or use core features. Refer to your
            browser's help documentation for step-by-step instructions:
          </p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>Chrome: <em>Settings → Privacy and security → Cookies and other site data</em></li>
            <li>Safari: <em>Preferences → Privacy → Manage Website Data</em></li>
            <li>Firefox: <em>Settings → Privacy & Security → Cookies and Site Data</em></li>
            <li>Edge: <em>Settings → Cookies and site permissions</em></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">5. Consent</h2>
          <p>
            Where required by applicable law (for example in the EU / UK under ePrivacy rules), we
            will request your consent before setting non-essential cookies. You can change your
            preferences at any time via your account settings or browser controls.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">6. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy as our technology and legal requirements change. The
            "Last updated" date at the top of this page reflects the most recent revision.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">7. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at{" "}
            <a href="mailto:support@onemyjob.com" className="text-primary hover:underline">
              support@onemyjob.com
            </a>.
          </p>
        </section>

        <p className="border-t border-border pt-6 text-xs">
          Also see our{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>,{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>, and{" "}
          <a href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</a>.
        </p>
      </div>
    </MarketingPageLayout>
  )
}
