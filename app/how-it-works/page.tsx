import { MarketingPageLayout } from "@/components/marketing-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, FileSearch, Gavel, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Sign up and publish needs",
    body: "Candidates create a profile with CV and optional video intro. Companies publish open roles with skills, location, salary bands, and deadlines. Agencies connect their teams to the same marketplace.",
  },
  {
    icon: FileSearch,
    title: "Discover and shortlist",
    body: "Search and filters help everyone find the right fit. Companies review applicants; agencies propose candidates from their pool. Everyone works from one transparent list of open demands.",
  },
  {
    icon: Gavel,
    title: "Bid with clarity",
    body: "Where bidding applies, offers are structured and comparable—so decisions are based on fit and terms, not guesswork. Status updates keep candidates and partners informed.",
  },
  {
    icon: CheckCircle,
    title: "Hire and onboard",
    body: "Once a match is confirmed, you complete next steps in one place: messaging, documents, and handoff to onboarding. The platform stays the single source of truth for that role.",
  },
]

export default function HowItWorksPage() {
  return (
    <MarketingPageLayout
      title="How It Works"
      subtitle="OneMyJob connects candidates, employers, and agencies on a single recruitment and bidding workflow—from first post to hire."
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <section className="space-y-4 text-muted-foreground">
          <p>
            Whether you are hiring, looking for work, or placing candidates, the
            flow is designed to stay simple: publish → match → decide → hire. Below
            is the end-to-end journey on the platform.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            The four-step journey
          </h2>
          <div className="grid gap-4">
            {steps.map((s) => (
              <Card key={s.title} className="border-border/80 shadow-none">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold leading-snug">
                      {s.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pl-[4.25rem] text-sm text-muted-foreground">
                  {s.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          <p>
            Ready to try it?{" "}
            <a href="/jobs" className="font-medium text-primary underline-offset-4 hover:underline">
              Browse open jobs
            </a>
            , or choose{" "}
            <a
              href="/register/candidate"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              candidate
            </a>
            ,{" "}
            <a
              href="/register/company"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              company
            </a>
            , or{" "}
            <a
              href="/register/agency"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              agency
            </a>{" "}
            registration to get started.
          </p>
        </section>
      </div>
    </MarketingPageLayout>
  )
}
