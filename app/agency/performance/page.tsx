"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  Target,
  Sparkles,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Calculator,
  Building2,
  Users,
  Zap,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageLoader } from "@/components/page-loader"
import { cn } from "@/lib/utils"

interface PerformanceData {
  period: string
  tier: "basic" | "growth" | "elite"
  ratingLevel: "elite" | "good" | "average" | "risk"
  performanceScore: number
  monthlyClosures: number
  target: {
    min: number
    standard: number
    high: number
    achieved: number
    percentToStandard: number
    percentToHigh: number
  }
  bonuses: { tierBonusPercent: number; amountThisMonth: number }
  penalty: { amountThisMonth: number; belowMinimum: boolean }
  score: {
    weights: { closures: number; speed: number; quality: number; feedback: number }
    breakdown: { closuresPct: number; speedPct: number; qualityPct: number; feedbackPct: number }
  }
  topAgents: { agentId: string; name: string; closures: number }[]
  rule: {
    agency: {
      minTarget: number
      standardTarget: number
      highTarget: number
      bonusTiers: Array<{ closures: number; percent: number }>
    }
    speed: { within3Days: number; within7Days: number }
    demand: { conversionPercent: number; highValueMin: number; highValueMax: number }
    quality: { bonusPercent: number }
  }
}

const TIER_BADGE: Record<string, { label: string; class: string }> = {
  basic: {
    label: "Basic — Active",
    class: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
  growth: {
    label: "Growth — Performing",
    class: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  },
  elite: {
    label: "Elite — High Performer",
    class:
      "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
  },
}

const RATING_BADGE: Record<string, { label: string; class: string }> = {
  elite: { label: "Elite (90+)", class: "bg-emerald-500 text-white" },
  good: { label: "Good (70-89)", class: "bg-blue-500 text-white" },
  average: { label: "Average (50-69)", class: "bg-amber-500 text-white" },
  risk: { label: "At Risk (<50)", class: "bg-red-500 text-white" },
}

export default function AgencyPerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [calcPlacements, setCalcPlacements] = useState(50)
  const [calcPlacementValue, setCalcPlacementValue] = useState(1000)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId } = JSON.parse(user)
    if (!agencyId) return
    fetch(`/api/agency/performance?agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d)
      })
      .finally(() => setLoading(false))
  }, [])

  const example = useMemo(() => {
    if (!data) return null
    const totalValue = calcPlacements * calcPlacementValue
    let tierPct = 0
    for (const t of data.rule.agency.bonusTiers) {
      if (calcPlacements >= t.closures) tierPct = t.percent
    }
    const tierBonus = (totalValue * tierPct) / 100
    return { totalValue, tierPct, tierBonus }
  }, [calcPlacements, calcPlacementValue, data])

  if (loading) return <PageLoader />
  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Unable to load performance data.
        </CardContent>
      </Card>
    )
  }

  const tierStyle = TIER_BADGE[data.tier]
  const ratingStyle = RATING_BADGE[data.ratingLevel]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agency Performance</h1>
          <p className="text-sm text-muted-foreground">
            Period {data.period} · target/bonus/penalty driven by ONEMYJOB rules
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("border px-3 py-1 text-sm", tierStyle.class)}>
            <Trophy className="mr-1.5 h-3.5 w-3.5" />
            {tierStyle.label}
          </Badge>
          <Badge className={cn("px-3 py-1 text-sm", ratingStyle.class)}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {ratingStyle.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Target}
          color="emerald"
          value={String(data.monthlyClosures)}
          label={`Closures / target ${data.target.standard}`}
        />
        <Stat
          icon={TrendingUp}
          color="blue"
          value={`+${data.bonuses.tierBonusPercent}%`}
          label="Active tier bonus"
        />
        <Stat
          icon={Wallet}
          color="purple"
          accent="emerald"
          value={`+AED ${data.bonuses.amountThisMonth.toLocaleString()}`}
          label="Bonuses this month"
        />
        <Stat
          icon={AlertTriangle}
          color="red"
          accent="red"
          value={
            data.penalty.belowMinimum
              ? `Below ${data.rule.agency.minTarget}`
              : `AED ${data.penalty.amountThisMonth.toLocaleString()}`
          }
          label={data.penalty.belowMinimum ? "Below minimum" : "No penalties"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            Agency Target Progress
          </CardTitle>
          <CardDescription>
            Minimum {data.rule.agency.minTarget} · Standard{" "}
            {data.rule.agency.standardTarget} · High {data.rule.agency.highTarget}+
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Toward standard</span>
              <span className="font-medium">
                {data.monthlyClosures} / {data.target.standard}
              </span>
            </div>
            <Progress value={data.target.percentToStandard} className="h-3" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Toward high target</span>
              <span className="font-medium">
                {data.monthlyClosures} / {data.target.high}
              </span>
            </div>
            <Progress value={data.target.percentToHigh} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Bonus Structure
            </CardTitle>
            <CardDescription>Earned at agency level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.rule.agency.bonusTiers.map((t) => {
              const reached = data.monthlyClosures >= t.closures
              return (
                <div
                  key={t.closures}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    reached
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-border",
                  )}
                >
                  <span>
                    {t.closures}+ closures
                    {reached && (
                      <span className="ml-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        UNLOCKED
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-emerald-600">+{t.percent}%</span>
                </div>
              )
            })}
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Speed bonus
              </span>
              <span className="font-medium text-amber-600">
                +{data.rule.speed.within3Days}% / +{data.rule.speed.within7Days}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
              <span>Demand-generation bonus</span>
              <span className="font-medium text-blue-600">
                +{data.rule.demand.conversionPercent}%
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
              <span>High-value demand</span>
              <span className="font-medium text-blue-600">
                AED {data.rule.demand.highValueMin}-{data.rule.demand.highValueMax}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
              <span>Quality bonus</span>
              <span className="font-medium text-purple-600">
                +{data.rule.quality.bonusPercent}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Performance Score
            </CardTitle>
            <CardDescription>
              Weighted across closures, speed, quality, feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-purple-200 dark:border-purple-900">
                <div className="text-center">
                  <p className="text-3xl font-bold">{data.performanceScore}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
            </div>
            <ScoreRow
              label={`Closures (${data.score.weights.closures}%)`}
              value={data.score.breakdown.closuresPct}
            />
            <ScoreRow
              label={`Speed (${data.score.weights.speed}%)`}
              value={data.score.breakdown.speedPct}
            />
            <ScoreRow
              label={`Quality (${data.score.weights.quality}%)`}
              value={data.score.breakdown.qualityPct}
            />
            <ScoreRow
              label={`Feedback (${data.score.weights.feedback}%)`}
              value={data.score.breakdown.feedbackPct}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Top Contributing Agents
          </CardTitle>
          <CardDescription>Closures booked this month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {data.topAgents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No closures booked this month yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Closures</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topAgents.map((a) => {
                    const tier =
                      a.closures >= 31 ? "elite" : a.closures >= 11 ? "growth" : "basic"
                    const style = TIER_BADGE[tier]
                    return (
                      <TableRow key={a.agentId}>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell>{a.closures}</TableCell>
                        <TableCell>
                          <Badge className={cn("border", style.class)}>
                            {style.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bonus Calculator
          </CardTitle>
          <CardDescription>
            Estimate the agency-level bonus at different closure volumes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="placements">Closures</Label>
              <Input
                id="placements"
                type="number"
                min={0}
                value={calcPlacements}
                onChange={(e) => setCalcPlacements(Number(e.target.value || 0))}
              />
            </div>
            <div>
              <Label htmlFor="value">AED per placement</Label>
              <Input
                id="value"
                type="number"
                min={0}
                value={calcPlacementValue}
                onChange={(e) =>
                  setCalcPlacementValue(Number(e.target.value || 0))
                }
              />
            </div>
            <div>
              <Label>Total placement value</Label>
              <Input
                value={`AED ${example?.totalValue.toLocaleString() ?? 0}`}
                readOnly
                className="font-medium"
              />
            </div>
          </div>
          {example && (
            <div className="mt-6 grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Tier bonus ({example.tierPct}%)
                </span>
                <span className="font-medium text-emerald-600">
                  + AED {example.tierBonus.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Active threshold reached
                </span>
                <span className="font-medium">
                  {example.tierPct > 0 ? `${example.tierPct}% bonus` : "None"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

function Stat({
  icon: Icon,
  color,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  color: "emerald" | "blue" | "purple" | "red"
  accent?: "emerald" | "red"
  value: string
  label: string
}) {
  const wrap: Record<string, string> = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/20",
    blue: "bg-blue-100 dark:bg-blue-900/20",
    purple: "bg-purple-100 dark:bg-purple-900/20",
    red: "bg-red-100 dark:bg-red-900/20",
  }
  const ic: Record<string, string> = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    red: "text-red-600",
  }
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={cn("rounded-full p-3", wrap[color])}>
          <Icon className={cn("h-5 w-5", ic[color])} />
        </div>
        <div>
          <p
            className={cn(
              "text-2xl font-bold",
              accent === "emerald" && "text-emerald-600",
              accent === "red" && "text-red-600",
            )}
          >
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
