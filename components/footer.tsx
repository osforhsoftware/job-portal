import Link from "next/link"
import { Mail, MapPin } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

/** Public footer links — use routes that exist in `app/`. */
const footerLinks = {
  forCandidates: [
    { name: "Find Jobs", href: "/jobs" },
    { name: "Browse Demands", href: "/demands" },
    { name: "Create Profile", href: "/register/candidate" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ],
  forCompanies: [
    
    { name: "Register Company", href: "/register/company" },
    { name: "Pricing", href: "/pricing" },
    { name: "Post a Demand", href: "/company/demands/new" },
    { name: "Bidding Center", href: "/company/bidding-center" },
    { name: "Company Dashboard", href: "/company/dashboard" },
  ],
  forAgencies: [
    { name: "Partner With Us", href: "/register/agency" },
    { name: "Agency Dashboard", href: "/agency/dashboard" },
    { name: "Open Demands", href: "/agency/demands" },
    { name: "Bulk Upload (CVs)", href: "/agency/bulk-upload" },
    { name: "Commission Rates", href: "/agency/commission" },
    { name: "Commission Structure", href: "/commission-structure" },
  ],
  /** Aligned with the main header + Home. Legal links are in the bottom bar. */
  explore: [
    { name: "Home", href: "/" },
    { name: "Find Jobs", href: "/jobs" },
    { name: "About Us", href: "/about" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="site-container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-10">
          {/* Brand — wider column on large screens */}
          <div className="min-w-0 sm:col-span-2 lg:col-span-2">
            <BrandLogo size="xl" />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Revolutionary recruitment platform connecting talent with opportunities through smart bidding.
            </p>
            <div className="mt-6 space-y-2">
              <a
                href="mailto:support@onemyjob.com"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4 shrink-0" />
                support@onemyjob.com
              </a>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Dubai, United Arab Emirates</span>
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="mb-4 font-semibold text-foreground">For Candidates</h3>
            <ul className="space-y-2">
              {footerLinks.forCandidates.map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="mb-4 font-semibold text-foreground">For Companies</h3>
            <ul className="space-y-2">
              {footerLinks.forCompanies.map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="mb-4 font-semibold text-foreground">For Agencies</h3>
            <ul className="space-y-2">
              {footerLinks.forAgencies.map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h3 className="mb-4 font-semibold text-foreground">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href + link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ONEMYJOB. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
              Cookie Policy
            </Link>
            <Link href="/acceptable-use" className="text-sm text-muted-foreground hover:text-foreground">
              Acceptable Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
