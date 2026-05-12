"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Check, Zap, Diamond, Star } from "lucide-react"

type Duration = "monthly" | "yearly"

const PLANS = [
  {
    id: "free",
    level: "free",
    name: "Free",
    badge: "Free Plan",
    monthlyPrice: 0,
    yearlyPrice: 0,
    subtitle: "Get started with basic hiring features at no cost.",
    cta: "Get Started Free",
    href: "/register/company?plan=free",
    popular: false,
    highlight: false,
    icon: null,
    features: [
      "Basic platform access",
      "Post demands (subject to approval)",
      "Access company dashboard",
      "Email support",
      "Restricted CV download access",
    ],
  },
  {
    id: "bronze",
    level: "bronze",
    name: "Bronze",
    badge: "AED 149 / month",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    subtitle: "Essential tools for growing businesses beginning to hire.",
    cta: "Start Bronze",
    href: "/register/company?plan=bronze",
    popular: false,
    highlight: false,
    icon: null,
    features: [
      "25 CV downloads per period",
      "Demand creation access",
      "Basic hiring management",
      "Staff user accounts",
      "Email support",
    ],
  },
  {
    id: "silver",
    level: "silver",
    name: "Silver",
    badge: "AED 299 / month",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    subtitle: "Extended recruitment access for teams with regular hiring needs.",
    cta: "Start Silver",
    href: "/register/company?plan=silver",
    popular: true,
    highlight: false,
    icon: Star,
    features: [
      "100 CV downloads per period",
      "Extended recruitment access",
      "Improved hiring flexibility",
      "Staff user management",
      "Priority email support",
    ],
  },
  {
    id: "gold",
    level: "gold",
    name: "Gold",
    badge: "AED 599 / month",
    monthlyPrice: 599,
    yearlyPrice: 5990,
    subtitle: "Full access for high-volume hiring operations.",
    cta: "Start Gold",
    href: "/register/company?plan=gold",
    popular: false,
    highlight: false,
    icon: null,
    features: [
      "Unlimited CV downloads",
      "Full recruitment access",
      "Advanced demand management",
      "Multiple staff accounts",
      "Priority chat & email support",
    ],
  },
  {
    id: "diamond",
    level: "diamond",
    name: "Diamond",
    badge: "Enterprise",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    subtitle: "Premium enterprise-level access with priority support and advanced features.",
    cta: "Get Diamond",
    href: "/register/company?plan=diamond",
    popular: false,
    highlight: true,
    icon: Diamond,
    features: [
      "Unlimited CV downloads",
      "Premium recruitment features",
      "Advanced company management",
      "Enterprise-level hiring tools",
      "Priority dedicated support",
    ],
  },
]

function PriceDisplay({
  plan,
  duration,
}: {
  plan: (typeof PLANS)[number]
  duration: Duration
}) {
  if (plan.monthlyPrice === 0) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">Free</span>
      </div>
    )
  }

  const price = duration === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
  const perLabel = duration === "monthly" ? "/ month" : "/ year"
  const yearlySaving =
    duration === "yearly"
      ? Math.round(100 - (plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)
      : 0

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-medium text-muted-foreground">AED</span>
        <span className="text-4xl font-bold text-foreground">{price.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">{perLabel}</span>
      </div>
      {duration === "yearly" && yearlySaving > 0 && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Save {yearlySaving}% vs monthly billing
        </p>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [duration, setDuration] = useState<Duration>("monthly")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="bg-background py-16 md:py-24">
          <div className="site-container">
            {/* Step pill */}
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  1
                </span>
                Step 1 of 4 · Choose your plan
              </span>
            </div>

            {/* Heading */}
            <div className="mb-10 text-center md:mb-12">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
                Transparent Pricing
              </p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Plans that grow with your team
              </h1>
              <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground md:text-base">
                Choose a subscription that matches your hiring volume. Start free and upgrade any time.
                Only active subscriptions unlock full platform features.
              </p>
            </div>

            {/* Monthly / Yearly toggle */}
            <div className="mb-10 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setDuration("monthly")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    duration === "monthly"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setDuration("yearly")}
                  className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    duration === "yearly"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Save up to 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {PLANS.map((plan) => {
                const Icon = plan.icon
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      plan.highlight
                        ? "border-primary/60 bg-gradient-to-b from-primary/5 to-card shadow-primary/10 shadow-md"
                        : plan.popular
                        ? "border-primary shadow-md"
                        : "border-border"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 right-5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
                        Most Popular
                      </div>
                    )}
                    {plan.highlight && (
                      <div className="absolute -top-3 right-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                        Enterprise
                      </div>
                    )}

                    {/* Plan header */}
                    <div className="mb-5 space-y-2">
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${plan.highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        )}
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {plan.name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {plan.subtitle}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      <PriceDisplay plan={plan} duration={duration} />
                    </div>

                    {/* CTA */}
                    <Button
                      asChild
                      className={`mb-6 w-full justify-center rounded-full text-sm font-semibold ${
                        plan.highlight
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                          : plan.popular
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <Link href={`${plan.href}&duration=${duration}`}>
                        {plan.cta}
                      </Link>
                    </Button>

                    {/* Features */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">
                        {plan.id === "free" ? "Included" : "What's included"}
                      </p>
                      <ul className="mt-2 space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-2.5 w-2.5 text-primary" />
                            </span>
                            <span className="text-xs leading-relaxed text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Subscription & access note */}
            <div className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">Subscription Duration</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Choose monthly or yearly billing. Yearly plans offer savings of up to 17%.
                    Both monthly and yearly subscriptions activate full plan features.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">Active Subscriptions Only</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Only active subscriptions unlock plan features, CV download access, and
                    premium company functionality. Expired or cancelled subscriptions revert
                    to restricted free-tier access.
                  </p>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Diamond className="h-4 w-4 text-primary" />
                    </span>
                    <p className="text-sm font-semibold text-foreground">Diamond — Enterprise</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The Diamond plan is our enterprise-level tier offering unlimited CV access,
                    advanced company management, and a dedicated priority support team.
                  </p>
                </div>
              </div>
            </div>

            {/* Permission note */}
            <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Company Permission Levels</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Company (Owner)</p>
                  <p className="text-xs text-muted-foreground">
                    Full platform access — create demands, manage staff users, manage subscriptions, and view all company data.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Staff Users</p>
                  <p className="text-xs text-muted-foreground">
                    Can log in, create demands, and view submissions. Cannot manage users, subscriptions, or directly edit/delete demands
                    (changes go through the approval workflow).
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">Approval workflow:</span> All newly created demands start with
                  &quot;Pending Approval&quot; status. Admin or Super Admin approval is required before agencies can view or bid on a demand.
                </p>
              </div>
            </div>

            {/* Footer note */}
            <p className="mt-8 text-center text-xs text-muted-foreground">
              No credit card required for the Free plan. Upgrade to a paid plan at any time from your company dashboard.
              All paid plans require an active subscription to access features.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
