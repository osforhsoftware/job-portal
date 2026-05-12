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
  Zap,
  Sparkles,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Calculator,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  commission: { basePercent: number; isMainAgent: boolean }
  bonuses: { bandPercent: Record<string, number>; amountThisMonth: number }
  penalty: { amountThisMonth: number; belowMinimum: boolean }
  score: {
    weights: { closures: number; speed: number; quality: number; feedback: number }
    breakdown: { closuresPct: number; speedPct: number; qualityPct: number; feedbackPct: number }
  }
  rule: {
    agent: {
      minTarget: number
      standardTarget: number
      highTarget: number
      bonusTiers: Array<{ closures: number; percent: number }>
      mainCommissionPercent: number
      subCommissionPercent: number
      belowMinPenaltyPercent: number
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

export default function AgentPerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [calcPlacements, setCalcPlacements] = useState(20)
  const [calcPlacementValue, setCalcPlacementValue] = useState(1000)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agentId, agencyId } = JSON.parse(user)
    if (!agentId || !agencyId) return
    fetch(`/api/agent/performance?agentId=${agentId}&agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d)
      })
      .finally(() => setLoading(false))
  }, [])

  const exampleEarnings = useMemo(() => {
    if (!data) return null
    const totalValue = calcPlacements * calcPlacementValue
    const base = (totalValue * data.commission.basePercent) / 100

    let tierPct = 0
    for (const t of data.rule.agent.bonusTiers) {
      if (calcPlacements >= t.closures) tierPct = t.percent
    }
    const tierBonus = (totalValue * tierPct) / 100
    const penaltyPct =
      calcPlacements < data.rule.agent.minTarget
        ? data.rule.agent.belowMinPenaltyPercent
        : 0
    const penalty = (base * penaltyPct) / 100
    return {
      totalValue,
      base,
      tierPct,
      tierBonus,
      penaltyPct,
      penalty,
      total: base + tierBonus + penalty,
    }
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
          <h1 className="text-2xl font-bold">Performance & Rewards</h1>
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

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/20">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.monthlyClosures}</p>
              <p className="text-xs text-muted-foreground">
                Closures this month / target {data.target.standard}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.commission.basePercent}%
              </p>
              <p className="text-xs text-muted-foreground">
                {data.commission.isMainAgent ? "Main agent" : "Sub-agent"} base
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                +AED {data.bonuses.amountThisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Bonuses this month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                AED {data.penalty.amountThisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.penalty.belowMinimum
                  ? `Below min (${data.rule.agent.minTarget})`
                  : "No penalties"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Target Progress
          </CardTitle>
          <CardDescription>
            Minimum {data.rule.agent.minTarget} · Standard{" "}
            {data.rule.agent.standardTarget} · High {data.rule.agent.highTarget}+
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Toward standard target</span>
              <span className="font-medium">
                {data.monthlyClosures} / {data.target.standard}
              </span>
            </div>
            <Progress value={data.target.percentToStandard} className="h-3" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Toward high target (bonus eligible)</span>
              <span className="font-medium">
                {data.monthlyClosures} / {data.target.high}
              </span>
            </div>
            <Progress value={data.target.percentToHigh} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Bonus structure */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Bonus Structure
            </CardTitle>
            <CardDescription>How extra commission stacks up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.rule.agent.bonusTiers.map((t) => {
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
                <Zap className="h-4 w-4 text-amber-500" />
                Speed bonus
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
              <span>High-value demand bonus</span>
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
              Weighted from closures, speed, quality and feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-purple-200 dark:border-purple-900">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {data.performanceScore}
                  </p>
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

      {/* Earnings calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Earnings Calculator
          </CardTitle>
          <CardDescription>
            Simulate how placements translate to take-home commission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="placements">Placements</Label>
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
            <div className="sm:col-span-1">
              <Label>Total placement value</Label>
              <Input
                value={`AED ${exampleEarnings?.totalValue.toLocaleString() ?? 0}`}
                readOnly
                className="font-medium"
              />
            </div>
          </div>
          {exampleEarnings && (
            <div className="mt-6 grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
              <Row
                label={`Base commission (${data.commission.basePercent}%)`}
                value={`AED ${exampleEarnings.base.toLocaleString()}`}
              />
              <Row
                label={`Tier bonus (${exampleEarnings.tierPct}%)`}
                value={`+ AED ${exampleEarnings.tierBonus.toLocaleString()}`}
                accent="emerald"
              />
              {exampleEarnings.penaltyPct !== 0 && (
                <Row
                  label={`Below-min penalty (${exampleEarnings.penaltyPct}%)`}
                  value={`AED ${exampleEarnings.penalty.toLocaleString()}`}
                  accent="red"
                />
              )}
              <Row
                label="Estimated total"
                value={`AED ${exampleEarnings.total.toLocaleString()}`}
                bold
              />
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

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string
  value: string
  accent?: "emerald" | "red"
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          accent === "emerald" && "text-emerald-600",
          accent === "red" && "text-red-600",
          bold && "text-base font-bold",
        )}
      >
        {value}
      </span>
    </div>
  )
}
