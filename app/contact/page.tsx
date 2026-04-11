import { MarketingPageLayout } from "@/components/marketing-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <MarketingPageLayout
      title="Contact Us"
      subtitle="We are here to help with accounts, partnerships, and product questions."
    >
      <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4 text-muted-foreground">
          <p>
            For the fastest response, email us with your organisation name (if
            applicable) and a short description of what you need. For billing or
            access issues, include the email address on the account.
          </p>
          <p>
            Enterprise and agency partnerships: mention your region, team size,
            and whether you need bulk candidate workflows or API access—we will
            route you to the right person.
          </p>
        </div>

        <Card className="h-fit border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">OneMyJob</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <a
              href="mailto:support@onemyjob.com"
              className="flex items-start gap-3 text-foreground hover:text-primary"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="block font-medium">Email</span>
                support@onemyjob.com
              </span>
            </a>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                <span className="block font-medium text-foreground">Address</span>
                <span className="text-muted-foreground">
                  Dubai, United Arab Emirates
                </span>
              </span>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="block font-medium text-foreground">
                  Support hours
                </span>
                Sunday–Thursday, 9:00–18:00 Gulf Standard Time (GST). We aim to
                reply within one business day.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingPageLayout>
  )
}
