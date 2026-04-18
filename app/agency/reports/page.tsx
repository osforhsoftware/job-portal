"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { BarChart3, TrendingUp, Users, Wallet, Award, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/page-loader"
import { cn } from "@/lib/utils"

interface Report {
  totalApplications: number
  totalPlacements: number
  totalEarnings: number
  totalAgents: number
  monthlyBreakdown: { month: string; earnings: number; placements: number }[]
  agentPerformance: { name: string; totalSubmissions: number; placements: number; earnings: number }[]
}

const PALETTE = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#f97316"]
const RADIAN = Math.PI / 180

function renderPieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}) {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      className="fill-white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      {label != null && label !== "" && (
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 font-medium">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="capitalize text-muted-foreground">{entry.name}:</span>
          <span>{Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  sub,
  value,
  prefix = "",
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  sub: string
  value: string | number
  prefix?: string
  iconClass: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-start justify-between">
          <div className={cn("rounded-xl p-2.5", iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {prefix}
          {value}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId } = JSON.parse(user)
    fetch(`/api/agency/commission/report?agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setReport(data.report)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <PageLoader message="Loading reports..." />
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance metrics and visual analytics</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No report data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const successRate =
    report.totalApplications > 0
      ? parseFloat(((report.totalPlacements / report.totalApplications) * 100).toFixed(1))
      : 0

  const pieData = report.agentPerformance
    .filter((a) => a.totalSubmissions > 0)
    .map((a) => ({ name: a.name, value: a.totalSubmissions }))

  const agentRadial = report.agentPerformance.slice(0, 6).map((a, i) => ({
    name: a.name.split(" ")[0],
    submissions: a.totalSubmissions,
    placements: a.placements,
    fill: PALETTE[i % PALETTE.length],
  }))

  const maxSub = Math.max(...agentRadial.map((a) => a.submissions), 1)

  const fmtK = (n: number) =>
    typeof n === "number" && n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Performance metrics and visual analytics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Total Submissions"
          sub="All time"
          value={fmtK(report.totalApplications)}
          iconClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        <KpiCard
          icon={Award}
          label="Placements"
          sub="Successful hires"
          value={fmtK(report.totalPlacements)}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          icon={Target}
          label="Success Rate"
          sub="Placement ratio"
          value={`${successRate}%`}
          iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          icon={Wallet}
          label="Total Revenue"
          sub="Commission earned"
          value={fmtK(report.totalEarnings)}
          iconClass="bg-pink-500/10 text-pink-600 dark:text-pink-400"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Distribution</CardTitle>
            <CardDescription>Submission share by agent</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div className="relative h-[200px] w-full max-w-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {PALETTE.map((c, i) => (
                          <radialGradient key={i} id={`rg-${i}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={c} stopOpacity={1} />
                            <stop offset="100%" stopColor={c} stopOpacity={0.75} />
                          </radialGradient>
                        ))}
                      </defs>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderPieLabel}
                        stroke="none"
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={`url(#rg-${i % PALETTE.length})`}
                            style={{ filter: "drop-shadow(0 2px 6px rgba(99,102,241,0.25))" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground">{report.totalApplications}</span>
                    <span className="text-[10px] text-muted-foreground">Total</span>
                  </div>
                </div>
                <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
                  {pieData.slice(0, 6).map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{entry.name}</span>
                      <span className="font-semibold text-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Performance</CardTitle>
            <CardDescription>Submissions per agent (relative scale)</CardDescription>
          </CardHeader>
          <CardContent>
            {agentRadial.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            ) : (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      startAngle={90}
                      endAngle={-270}
                      data={agentRadial.map((a) => ({
                        ...a,
                        uv: Math.round((a.submissions / maxSub) * 100),
                      }))}
                    >
                      <RadialBar
                        background={{ fill: "var(--muted)" }}
                        cornerRadius={6}
                        dataKey="uv"
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0]?.payload as {
                            name?: string
                            submissions?: number
                            placements?: number
                          }
                          return (
                            <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
                              <p className="font-semibold text-popover-foreground">{d?.name}</p>
                              <p className="text-muted-foreground">
                                Submissions: {d?.submissions ?? 0}
                              </p>
                              <p className="text-emerald-600 dark:text-emerald-400">
                                Placements: {d?.placements ?? 0}
                              </p>
                            </div>
                          )
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                  {agentRadial.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: a.fill }} />
                      {a.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
            <CardDescription>Monthly earnings and placements</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Revenue
          </Badge>
        </CardHeader>
        <CardContent>
          {report.monthlyBreakdown.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
              No monthly data
            </div>
          ) : (
            <div className="h-[240px] w-full [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-text]:fill-muted-foreground">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.monthlyBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="placementsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#earningsGrad)"
                    name="Revenue"
                    dot={false}
                    activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="placements"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#placementsGrad)"
                    name="Placements"
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
