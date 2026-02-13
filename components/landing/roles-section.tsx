import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Building2, Briefcase, ArrowRight, Check } from "lucide-react"

const roles = [
  {
    icon: Users,
    title: "For Job Seekers",
    description: "Find your dream job through competitive bidding",
    features: [
      "Free profile creation with video intro",
      "Get discovered by companies worldwide",
      "Receive competitive offers through bids",
      "Track applications in real-time",
      "Multi-language support",
    ],
    cta: "Create Free Profile",
    href: "/register/candidate",
    color: "bg-primary",
  },
  {
    icon: Building2,
    title: "For Companies",
    description: "Hire the best talent through smart bidding",
    features: [
      "Post unlimited job requirements",
      "Access verified candidate database",
      "Bid on shortlisted candidates",
      "Advanced filtering and search",
      "Analytics and reporting dashboard",
    ],
    cta: "Start Hiring",
    href: "/register/company",
    color: "bg-accent",
    featured: true,
  },
  {
    icon: Briefcase,
    title: "For Agencies",
    description: "Scale your recruitment business",
    features: [
      "Bulk CV upload capability",
      "Manage multiple clients",
      "Participate in bidding process",
      "Commission tracking system",
      "Dedicated agency dashboard",
    ],
    cta: "Partner With Us",
    href: "/register/agency",
    color: "bg-primary",
  },
]

export function RolesSection() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Choose Your Role
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            One Platform, Three Powerful Experiences
          </h2>
          <p className="text-pretty text-muted-foreground">
            Whether you are looking for a job, hiring talent, or running a recruitment agency, we have got you covered.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {roles.map((role, index) => (
            <div
              key={index}
              className={`relative rounded-2xl border bg-card p-8 transition-all hover:shadow-xl ${
                role.featured
                  ? "border-primary shadow-lg lg:-mt-4 lg:mb-4"
                  : "border-border"
              }`}
            >
              {role.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${role.color} text-white`}
              >
                <role.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-xl font-bold text-foreground">{role.title}</h3>
              <p className="mb-6 text-muted-foreground">{role.description}</p>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {role.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                asChild
                className="w-full gap-2"
                variant={role.featured ? "default" : "outline"}
              >
                <Link href={role.href}>
                  {role.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
