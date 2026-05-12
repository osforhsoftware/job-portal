"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RotateCcw, Save, Sparkles } from "lucide-react"
import { MessageBanner } from "@/components/ui/message-banner"

interface Rule {
  agent: {
    minTarget: number
    standardTarget: number
    highTarget: number
    belowMinPenaltyPercent: number
    bonusTiers: Array<{ closures: number; percent: number }>
    mainCommissionPercent: number
    subCommissionPercent: number
  }
  agency: {
    minTarget: number
    standardTarget: number
    highTarget: number
    bonusTiers: Array<{ closures: number; percent: number }>
  }
  speed: { within3Days: number; within7Days: number }
  demand: {
    conversionPercent: number
    highValueMin: number
    highValueMax: number
  }
  quality: { bonusPercent: number }
  scoreWeights: {
    closures: number
    speed: number
    quality: number
    feedback: number
  }
  ratingThresholds: { elite: number; good: number; average: number }
}

export default function AdminCommissionRulesPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [rule, setRule] = useState<Rule | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] =
    useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/admin/login")
      return
    }
    const userData = JSON.parse(user)
    if (userData.role !== "super_admin" && userData.role !== "admin") {
      router.push("/")
      return
    }
    setUserRole(userData.role)
    load()
  }, [router])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/commission-rules")
      const data = await res.json()
      if (data.success) setRule(data.rule)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!rule) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/commission-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      })
      const data = await res.json()
      if (data.success) {
        setRule(data.rule)
        setMessage({ type: "success", text: "Commission rules updated." })
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save",
        })
      }
    } catch (error) {
      setMessage({ type: "error", text: String(error) })
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/commission-rules", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setRule(data.rule)
        setMessage({ type: "success", text: "Reset to ONEMYJOB defaults." })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || !rule) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  const updateAgent = <K extends keyof Rule["agent"]>(
    key: K,
    value: Rule["agent"][K],
  ) => setRule({ ...rule, agent: { ...rule.agent, [key]: value } })

  const updateAgency = <K extends keyof Rule["agency"]>(
    key: K,
    value: Rule["agency"][K],
  ) => setRule({ ...rule, agency: { ...rule.agency, [key]: value } })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminNav role={userRole ?? undefined} />

        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Commission, Target & Bonus Rules</h1>
              <p className="text-sm text-muted-foreground">
                Tunes the engine that drives agent + agency rewards
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} disabled={saving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to defaults
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>

          <MessageBanner
            message={message}
            onDismiss={() => setMessage(null)}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Targets</CardTitle>
                <CardDescription>Monthly placements thresholds</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  label="Minimum"
                  value={rule.agent.minTarget}
                  onChange={(v) => updateAgent("minTarget", v)}
                />
                <NumberField
                  label="Standard"
                  value={rule.agent.standardTarget}
                  onChange={(v) => updateAgent("standardTarget", v)}
                />
                <NumberField
                  label="High"
                  value={rule.agent.highTarget}
                  onChange={(v) => updateAgent("highTarget", v)}
                />
                <NumberField
                  label="Below-min penalty (%)"
                  value={rule.agent.belowMinPenaltyPercent}
                  onChange={(v) => updateAgent("belowMinPenaltyPercent", v)}
                />
                <NumberField
                  label="Main agent (%)"
                  value={rule.agent.mainCommissionPercent}
                  onChange={(v) => updateAgent("mainCommissionPercent", v)}
                />
                <NumberField
                  label="Sub-agent (%)"
                  value={rule.agent.subCommissionPercent}
                  onChange={(v) => updateAgent("subCommissionPercent", v)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agency Targets</CardTitle>
                <CardDescription>Aggregate monthly closures</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  label="Minimum"
                  value={rule.agency.minTarget}
                  onChange={(v) => updateAgency("minTarget", v)}
                />
                <NumberField
                  label="Standard"
                  value={rule.agency.standardTarget}
                  onChange={(v) => updateAgency("standardTarget", v)}
                />
                <NumberField
                  label="High"
                  value={rule.agency.highTarget}
                  onChange={(v) => updateAgency("highTarget", v)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Bonus Tiers</CardTitle>
                <CardDescription>10/20/30+ closures per spec</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rule.agent.bonusTiers.map((t, idx) => (
                  <div key={idx} className="grid gap-3 sm:grid-cols-2">
                    <NumberField
                      label="Closures"
                      value={t.closures}
                      onChange={(v) => {
                        const next = [...rule.agent.bonusTiers]
                        next[idx] = { ...t, closures: v }
                        updateAgent("bonusTiers", next)
                      }}
                    />
                    <NumberField
                      label="Bonus %"
                      value={t.percent}
                      onChange={(v) => {
                        const next = [...rule.agent.bonusTiers]
                        next[idx] = { ...t, percent: v }
                        updateAgent("bonusTiers", next)
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agency Bonus Tiers</CardTitle>
                <CardDescription>50/100/200+ closures per spec</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rule.agency.bonusTiers.map((t, idx) => (
                  <div key={idx} className="grid gap-3 sm:grid-cols-2">
                    <NumberField
                      label="Closures"
                      value={t.closures}
                      onChange={(v) => {
                        const next = [...rule.agency.bonusTiers]
                        next[idx] = { ...t, closures: v }
                        updateAgency("bonusTiers", next)
                      }}
                    />
                    <NumberField
                      label="Bonus %"
                      value={t.percent}
                      onChange={(v) => {
                        const next = [...rule.agency.bonusTiers]
                        next[idx] = { ...t, percent: v }
                        updateAgency("bonusTiers", next)
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Speed & Demand Bonuses</CardTitle>
                <CardDescription>
                  Time-to-close and demand-generation rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Within 3 days (%)"
                  value={rule.speed.within3Days}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      speed: { ...rule.speed, within3Days: v },
                    })
                  }
                />
                <NumberField
                  label="Within 7 days (%)"
                  value={rule.speed.within7Days}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      speed: { ...rule.speed, within7Days: v },
                    })
                  }
                />
                <NumberField
                  label="Demand conversion (%)"
                  value={rule.demand.conversionPercent}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      demand: { ...rule.demand, conversionPercent: v },
                    })
                  }
                />
                <NumberField
                  label="Quality bonus (%)"
                  value={rule.quality.bonusPercent}
                  onChange={(v) =>
                    setRule({ ...rule, quality: { bonusPercent: v } })
                  }
                />
                <NumberField
                  label="High-value AED (min)"
                  value={rule.demand.highValueMin}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      demand: { ...rule.demand, highValueMin: v },
                    })
                  }
                />
                <NumberField
                  label="High-value AED (max)"
                  value={rule.demand.highValueMax}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      demand: { ...rule.demand, highValueMax: v },
                    })
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Score & Rating</CardTitle>
                <CardDescription>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Weights must sum to a non-zero total
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="Closures weight"
                  value={rule.scoreWeights.closures}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      scoreWeights: { ...rule.scoreWeights, closures: v },
                    })
                  }
                />
                <NumberField
                  label="Speed weight"
                  value={rule.scoreWeights.speed}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      scoreWeights: { ...rule.scoreWeights, speed: v },
                    })
                  }
                />
                <NumberField
                  label="Quality weight"
                  value={rule.scoreWeights.quality}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      scoreWeights: { ...rule.scoreWeights, quality: v },
                    })
                  }
                />
                <NumberField
                  label="Feedback weight"
                  value={rule.scoreWeights.feedback}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      scoreWeights: { ...rule.scoreWeights, feedback: v },
                    })
                  }
                />
                <NumberField
                  label="Elite ≥"
                  value={rule.ratingThresholds.elite}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      ratingThresholds: { ...rule.ratingThresholds, elite: v },
                    })
                  }
                />
                <NumberField
                  label="Good ≥"
                  value={rule.ratingThresholds.good}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      ratingThresholds: { ...rule.ratingThresholds, good: v },
                    })
                  }
                />
                <NumberField
                  label="Average ≥"
                  value={rule.ratingThresholds.average}
                  onChange={(v) =>
                    setRule({
                      ...rule,
                      ratingThresholds: { ...rule.ratingThresholds, average: v },
                    })
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
      />
    </div>
  )
}
