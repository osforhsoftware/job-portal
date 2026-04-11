import { MarketingPageLayout } from "@/components/marketing-page-layout"
import { FaqPageContent } from "@/components/faq-page-content"

export default function FaqPage() {
  return (
    <MarketingPageLayout
      title="Frequently Asked Questions"
      subtitle="Quick answers about using OneMyJob as a candidate, employer, or agency."
    >
      <div className="mx-auto max-w-3xl">
        <FaqPageContent />
        <p className="mt-8 text-sm text-muted-foreground">
          Did not find what you need?{" "}
          <a
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Contact us
          </a>{" "}
          or read{" "}
          <a
            href="/how-it-works"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            How It Works
          </a>
          .
        </p>
      </div>
    </MarketingPageLayout>
  )
}
