import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPageLayout } from "@/components/marketing-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Target,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  ShieldAlert,
  Users,
  Wallet,
  Layers,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Commission, Targets & Bonus Structure | ONEMYJOB.COM",
  description:
    "Transparent commission, targets, bonus and penalty rules for agents and agencies on ONEMYJOB.COM.",
}

export default function CommissionStructurePage() {
  return (
    <MarketingPageLayout
      title="Agent & Agency Target, Bonus & Penalty Structure"
      subtitle="Everything we use to calculate commission, bonuses, penalties and your performance score on ONEMYJOB.COM. Transparent — no hidden rules."
    >
      <div className="space-y-12">
        {/* 1. Performance Tiers */}
        <Section
          number="1"
          icon={Trophy}
          title="Performance Tiers"
          description="Your monthly closures determine your tier — and unlock progressively better rewards."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <TierCard
              tone="slate"
              tier="Basic"
              tag="Active"
              range="1–10 closures / month"
            />
            <TierCard
              tone="blue"
              tier="Growth"
              tag="Performing"
              range="11–30 closures / month"
            />
            <TierCard
              tone="amber"
              tier="Elite"
              tag="High Performer"
              range="31+ closures / month"
            />
          </div>
        </Section>

        {/* 2 & 3. Targets */}
        <Section
          number="2"
          icon={Target}
          title="Monthly Targets"
          description="Both agents and agencies have a minimum, standard and high target. Hit standard for normal commission. Beat high for bonus eligibility."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <TargetCard
              role="Agent"
              rows={[
                { label: "Minimum", value: "5 placements", note: "Below → -5% commission" },
                { label: "Standard", value: "10 placements", note: "Normal commission" },
                { label: "High", value: "20+ placements", note: "Bonus eligible" },
              ]}
            />
            <TargetCard
              role="Agency"
              rows={[
                { label: "Minimum", value: "20 placements" },
                { label: "Standard", value: "50 placements" },
                { label: "High", value: "100+ placements" },
              ]}
            />
          </div>
        </Section>

        {/* 4. Bonus Structure */}
        <Section
          number="4"
          icon={TrendingUp}
          title="Bonus Structure"
          description="Stacking bonuses on top of your base commission."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <BonusTable
              role="Agent Bonus"
              rows={[
                { label: "10 closures", value: "+2%" },
                { label: "20 closures", value: "+5%" },
                { label: "30+ closures", value: "+8%" },
              ]}
            />
            <BonusTable
              role="Agency Bonus"
              rows={[
                { label: "50 closures", value: "+3%" },
                { label: "100 closures", value: "+5%" },
                { label: "200+ closures", value: "+8%" },
              ]}
            />
          </div>
        </Section>

        {/* 5-7. Speed, Demand, Quality */}
        <Section
          number="5"
          icon={Zap}
          title="Speed, Demand & Quality Bonuses"
          description="Reward signals beyond raw volume."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Pill
              icon={Zap}
              title="Speed bonus"
              tone="amber"
              lines={["Within 3 days → +3%", "Within 7 days → +2%"]}
            />
            <Pill
              icon={Sparkles}
              title="Demand generation"
              tone="blue"
              lines={[
                "Demand converted → +5%",
                "High value demand → AED 100–300",
              ]}
            />
            <Pill
              icon={Award}
              title="Quality bonus"
              tone="purple"
              lines={[
                "+2% bonus",
                "Priority allocation",
                "Featured status",
              ]}
            />
          </div>
        </Section>

        {/* 8. Multi-Level Commission */}
        <Section
          number="8"
          icon={Layers}
          title="Multi-Level Commission"
          description="Main agents earn the full base; sub-agents earn a recruited share."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-emerald-500/40 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Main Agent
                </CardTitle>
                <CardDescription>Direct closure — 15% commission</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-emerald-600">15%</p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/40 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Sub-Agent
                </CardTitle>
                <CardDescription>
                  Closure routed via main agent — 10% commission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">10%</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* 10-11. Performance Score & Rating */}
        <Section
          number="10"
          icon={Award}
          title="Performance Score & Rating Levels"
          description="One number, weighted across four signals — used to gate Elite status, priority allocation and risk reviews."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Weights</CardTitle>
                <CardDescription>Sum of 100%</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <ScoreWeight label="Closures" value="40%" />
                <ScoreWeight label="Speed" value="20%" />
                <ScoreWeight label="Quality" value="20%" />
                <ScoreWeight label="Feedback" value="20%" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rating Levels</CardTitle>
                <CardDescription>From your performance score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <RatingRow label="90+" tag="Elite" tone="emerald" />
                <RatingRow label="70–89" tag="Good" tone="blue" />
                <RatingRow label="50–69" tag="Average" tone="amber" />
                <RatingRow label="<50" tag="At Risk" tone="red" />
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* 12. Example Earnings */}
        <Section
          number="12"
          icon={Wallet}
          title="Example Earnings"
          description="A worked example for an agent hitting their high target."
        >
          <Card className="border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Placements" value="20" />
              <Stat label="Base commission" value="AED 5,000" />
              <Stat label="Bonuses" value="≈ AED 1,500" tone="emerald" />
              <Stat label="Total" value="≈ AED 6,500" tone="emerald" bold />
            </CardContent>
          </Card>
        </Section>

        {/* 13. System Logic */}
        <Section
          number="13"
          icon={ShieldAlert}
          title="System Logic"
          description="Every closure flows through this pipeline — no manual adjustments."
        >
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {[
                  "Placement",
                  "Payment",
                  "Commission",
                  "Bonus",
                  "Penalty",
                  "Wallet",
                ].map((step, idx, arr) => (
                  <div key={step} className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="px-3 py-1.5 text-sm font-medium"
                    >
                      {step}
                    </Badge>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>

        <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-8">
            <div>
              <h3 className="text-xl font-bold">Ready to start earning?</h3>
              <p className="text-sm text-muted-foreground">
                Register as an agency or sub-agent and unlock the full reward
                stack on day one.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/register/agency">Register Agency</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/agency/commission">Live Commission Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MarketingPageLayout>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Local helpers                               */
/* -------------------------------------------------------------------------- */

function Section({
  number,
  icon: Icon,
  title,
  description,
  children,
}: {
  number: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Section {number}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </section>
  )
}

function TierCard({
  tone,
  tier,
  tag,
  range,
}: {
  tone: "slate" | "blue" | "amber"
  tier: string
  tag: string
  range: string
}) {
  const styles: Record<string, string> = {
    slate: "border-slate-300 dark:border-slate-700",
    blue: "border-blue-400/60 bg-blue-500/5",
    amber: "border-amber-400/60 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent",
  }
  const text: Record<string, string> = {
    slate: "text-slate-700 dark:text-slate-300",
    blue: "text-blue-700 dark:text-blue-300",
    amber: "text-amber-700 dark:text-amber-300",
  }
  return (
    <Card className={styles[tone]}>
      <CardContent className="space-y-2 pt-6">
        <p className={`text-xs font-medium uppercase tracking-wide ${text[tone]}`}>{tag}</p>
        <p className="text-2xl font-bold">{tier}</p>
        <p className="text-sm text-muted-foreground">{range}</p>
      </CardContent>
    </Card>
  )
}

function TargetCard({
  role,
  rows,
}: {
  role: string
  rows: { label: string; value: string; note?: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{role} Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="text-sm font-semibold">{r.label}</p>
              {r.note && (
                <p className="text-xs text-muted-foreground">{r.note}</p>
              )}
            </div>
            <span className="font-medium">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function BonusTable({
  role,
  rows,
}: {
  role: string
  rows: { label: string; value: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{role}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg border border-dashed p-3"
          >
            <span className="text-sm">{r.label}</span>
            <span className="font-bold text-emerald-600">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Pill({
  icon: Icon,
  title,
  tone,
  lines,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  tone: "amber" | "blue" | "purple"
  lines: string[]
}) {
  const styles: Record<string, string> = {
    amber: "border-amber-500/40 bg-amber-500/5",
    blue: "border-blue-500/40 bg-blue-500/5",
    purple: "border-purple-500/40 bg-purple-500/5",
  }
  const ic: Record<string, string> = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  }
  return (
    <Card className={styles[tone]}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-5 w-5 ${ic[tone]}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {lines.map((l) => (
            <li key={l} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ScoreWeight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

function RatingRow({
  label,
  tag,
  tone,
}: {
  label: string
  tag: string
  tone: "emerald" | "blue" | "amber" | "red"
}) {
  const cls: Record<string, string> = {
    emerald: "bg-emerald-500 text-white",
    blue: "bg-blue-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
  }
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="font-mono text-sm">{label}</span>
      <Badge className={cls[tone]}>{tag}</Badge>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
  bold,
}: {
  label: string
  value: string
  tone?: "emerald"
  bold?: boolean
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 ${bold ? "text-3xl" : "text-2xl"} font-bold ${
          tone === "emerald" ? "text-emerald-600" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}
