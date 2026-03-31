import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Building2, Briefcase } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-foreground py-20 text-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Heading */}
          <h2 className="mb-6 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            Ready to Transform Your Recruitment Journey?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-background/70">
            Join thousands of candidates, companies, and agencies already using ONEMYJOB to connect talent with opportunity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-background px-8 text-foreground hover:bg-background/90"
            >
              <Link href="/register/candidate">
                <Users className="h-5 w-5" />
                Find Jobs
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-background/30 bg-transparent px-8 text-background hover:bg-background/10"
            >
              <Link href="/register/company">
                <Building2 className="h-5 w-5" />
                Hire Talent
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-background/30 bg-transparent px-8 text-background hover:bg-background/10"
            >
              <Link href="/register/agency">
                <Briefcase className="h-5 w-5" />
                Partner as Agency
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-background/20 pt-8">
            <div className="flex items-center gap-2 text-sm text-background/70">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Free to join
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              No hidden fees
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              24/7 support
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Secure platform
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
