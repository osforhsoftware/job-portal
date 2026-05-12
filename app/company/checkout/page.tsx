"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, CreditCard, ShieldCheck, Diamond, Star, Zap } from "lucide-react"
import { FormEvent, useState } from "react"

type PlanMeta = {
  title: string
  subtitle: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  isEnterprise?: boolean
  isFree?: boolean
}

const PLAN_META: Record<string, PlanMeta> = {
  free: {
    title: "Free Plan",
    subtitle: "Basic platform access with no payment required.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isFree: true,
    features: [
      "Basic platform access",
      "Post demands (subject to approval)",
      "Access company dashboard",
      "Email support",
    ],
  },
  bronze: {
    title: "Bronze Plan",
    subtitle: "Essential hiring tools for growing businesses.",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    features: [
      "25 CV downloads per period",
      "Demand creation access",
      "Basic hiring management",
      "Staff user accounts",
    ],
  },
  silver: {
    title: "Silver Plan",
    subtitle: "Extended recruitment access for regular hiring teams.",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    features: [
      "100 CV downloads per period",
      "Extended recruitment access",
      "Improved hiring flexibility",
      "Staff user management",
    ],
  },
  gold: {
    title: "Gold Plan",
    subtitle: "Full access for high-volume hiring operations.",
    monthlyPrice: 599,
    yearlyPrice: 5990,
    features: [
      "Unlimited CV downloads",
      "Full recruitment access",
      "Advanced demand management",
      "Priority chat & email support",
    ],
  },
  diamond: {
    title: "Diamond Plan",
    subtitle: "Enterprise-level hiring with premium features and priority support.",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    isEnterprise: true,
    features: [
      "Unlimited CV downloads",
      "Premium recruitment features",
      "Advanced company management",
      "Enterprise-level hiring tools",
      "Dedicated priority support",
    ],
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const plan = searchParams.get("plan") || "free"
  const duration = (searchParams.get("duration") || "monthly") as "monthly" | "yearly"
  const planMeta = PLAN_META[plan] ?? PLAN_META.free

  const price =
    duration === "yearly" ? planMeta.yearlyPrice : planMeta.monthlyPrice
  const perLabel = duration === "yearly" ? "/ year" : "/ month"
  const yearlySaving =
    duration === "yearly" && planMeta.monthlyPrice > 0
      ? Math.round(100 - (planMeta.yearlyPrice / (planMeta.monthlyPrice * 12)) * 100)
      : 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push("/company/dashboard")
    }, 900)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="site-container flex flex-1 items-center justify-center bg-background py-10">
        <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[2fr,1.4fr]">
          {/* Checkout card */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  3
                </span>
                <span>Step 3 of 4 · Payment</span>
              </div>
              <CardTitle className="flex items-center gap-2 text-xl">
                {planMeta.isEnterprise && <Diamond className="h-5 w-5 text-violet-500" />}
                {!planMeta.isEnterprise && !planMeta.isFree && <Star className="h-5 w-5 text-primary" />}
                Complete your plan setup
              </CardTitle>
              <CardDescription>{planMeta.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                {planMeta.isFree ? (
                  <div className="rounded-lg border border-dashed border-emerald-400/60 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <Check className="h-4 w-4" />
                      No payment required for the Free plan
                    </div>
                    <p className="text-xs leading-relaxed opacity-80">
                      Your account will be created with basic access. You can upgrade to a paid
                      plan at any time from your company dashboard.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Billing summary */}
                    <div className={`rounded-lg border p-4 ${planMeta.isEnterprise ? "border-violet-500/30 bg-violet-500/5" : "border-primary/20 bg-primary/5"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{planMeta.title}</p>
                          <p className="mt-0.5 text-xs capitalize text-muted-foreground">{duration} subscription</p>
                          {yearlySaving > 0 && (
                            <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Saving {yearlySaving}% vs monthly billing
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            AED {price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{perLabel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on card</Label>
                        <Input id="cardName" placeholder="e.g. John Smith" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input id="expiry" placeholder="MM / YY" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold ${planMeta.isEnterprise ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700" : ""}`}
                >
                  {loading ? (
                    "Processing…"
                  ) : planMeta.isFree ? (
                    "Create Free Account"
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay AED {price.toLocaleString()} {perLabel}
                    </>
                  )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secured with 256-bit SSL encryption
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Plan summary card */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Plan summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground capitalize">{planMeta.title}</span>
                  <span className="text-muted-foreground capitalize">{planMeta.isFree ? "Free" : duration}</span>
                </div>
                <ul className="space-y-2">
                  {planMeta.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-[2px] h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!planMeta.isFree && (
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>Total due today</span>
                      <span>AED {price.toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {duration === "yearly"
                        ? "Billed annually. Cancel anytime."
                        : "Billed monthly. Cancel anytime."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-2">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">Active subscriptions only</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Plan features, CV access, and premium functionality are only available with an
                    active subscription. Expired or cancelled plans revert to restricted free-tier access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function CompanyCheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
