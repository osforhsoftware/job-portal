import { MarketingPageLayout } from "@/components/marketing-page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Heart, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <MarketingPageLayout
      title="About Us"
      subtitle="OneMyJob is built to make recruitment fairer, faster, and easier for candidates, companies, and agencies."
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-4 text-muted-foreground">
          <p>
            We started from a simple observation: hiring still breaks down when
            information is scattered across email, spreadsheets, and disconnected
            tools. OneMyJob brings open roles, profiles, and agency collaboration
            into one place—so decisions are visible, comparable, and auditable.
          </p>
          <p>
            Our team combines experience in HR tech, marketplaces, and regulated
            industries. We are headquartered in Dubai, UAE, and serve employers
            and partners across the region and beyond.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/80 shadow-none">
            <CardContent className="pt-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Mission</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect the right people to the right roles with transparency—so
                every hire is based on merit and fit, not friction.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-none">
            <CardContent className="pt-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Values</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We prioritize clarity for candidates, control for employers, and
                fair partnership for agencies—backed by responsive support.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80 shadow-none">
            <CardContent className="pt-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Trust</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We design for data minimization, role-based access, and clear
                terms—so you know who sees what, and why.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">What we offer</h2>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Public job discovery with rich filters and saved context.</li>
            <li>Dashboards for candidates, companies, agencies, and agents.</li>
            <li>Structured workflows for applications, shortlists, and bidding where enabled.</li>
            <li>Notifications and messaging to reduce email overload.</li>
          </ul>
        </section>

        <p className="text-sm text-muted-foreground">
          Questions? See our{" "}
          <a href="/faq" className="font-medium text-primary underline-offset-4 hover:underline">
            FAQ
          </a>{" "}
          or{" "}
          <a href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
    </MarketingPageLayout>
  )
}
