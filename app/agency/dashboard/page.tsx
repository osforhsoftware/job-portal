"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Users,
  Briefcase,
  FileCheck,
  UserCheck,
  Wallet,
  CreditCard,
  Upload,
  TrendingUp,
  BarChart3,
  UserCog,
  Link2,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/page-loader"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Stats {
  totalCandidates: number
  activeDemands: number
  submittedApplications: number
  selectedCandidates: number
  pendingApplications: number
  totalCommissionEarned: number
  pendingPayments: number
  totalAgents: number
  subscriptionPlan: string
  subscriptionStatus: string
  cvUploadsUsed: number
  cvUploadLimit: number
  bidsUsed: number
  biddingLimit: number
}

const PIPELINE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8"]

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
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      className="fill-foreground"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) { setLoading(false); return }
    const { agencyId } = JSON.parse(user)
    if (!agencyId) { setLoading(false); return }

    fetch(`/api/agency/stats?agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pipelineData = [
    { name: "Applied", value: stats?.submittedApplications || 42 },
    { name: "Screened", value: Math.round((stats?.submittedApplications || 42) * 0.7) },
    { name: "Interview", value: Math.round((stats?.submittedApplications || 42) * 0.45) },
    { name: "Offered", value: Math.round((stats?.submittedApplications || 42) * 0.2) },
    { name: "Hired", value: stats?.selectedCandidates || 8 },
  ]

  const cvUsagePercent =
    stats?.cvUploadLimit === -1 ? 0 : ((stats?.cvUploadsUsed || 0) / (stats?.cvUploadLimit || 1)) * 100
  const bidUsagePercent =
    stats?.biddingLimit === -1 ? 0 : ((stats?.bidsUsed || 0) / (stats?.biddingLimit || 1)) * 100

  const heroStats = [
    {
      title: "Total Candidates",
      value: stats?.totalCandidates || 0,
      icon: Users,
      iconWrap: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      href: "/agency/candidates",
      change: "+12%",
    },
    {
      title: "Active Demands",
      value: stats?.activeDemands || 0,
      icon: Briefcase,
      iconWrap: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      href: "/agency/demands",
      change: "+5%",
    },
    {
      title: "Applications",
      value: stats?.submittedApplications || 0,
      icon: FileCheck,
      iconWrap: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      href: "/agency/applications",
      change: "+18%",
    },
    {
      title: "Selected / Hired",
      value: stats?.selectedCandidates || 0,
      icon: UserCheck,
      iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      href: "/agency/applications",
      change: "+3%",
    },
  ]

  const revenueStats = [
    {
      title: "Commission Earned",
      value: (stats?.totalCommissionEarned || 0).toLocaleString(),
      icon: Wallet,
      iconWrap: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      sub: "Lifetime earnings",
      href: "/agency/commission",
    },
    {
      title: "Pending Payments",
      value: (stats?.pendingPayments || 0).toLocaleString(),
      icon: CreditCard,
      iconWrap: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
      sub: "Awaiting clearance",
      href: "/agency/commission",
    },
  ]

  const quickActions = [
    { label: "Bulk Upload CVs", icon: Upload, href: "/agency/bulk-upload-candidates" },
    { label: "Open Demands", icon: Briefcase, href: "/agency/demands" },
    { label: "Manage Agents", icon: UserCog, href: "/agency/agents" },
    { label: "Referral Links", icon: Link2, href: "/agency/referrals" },
    { label: "Analytics", icon: BarChart3, href: "/agency/reports" },
    { label: "Track Apps", icon: FileCheck, href: "/agency/applications" },
  ]

  if (loading) {
    return <PageLoader message="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Agency Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back — here’s your overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
            <Link href="/register/company">
              <Building2 className="h-4 w-4" />
              Register as company
            </Link>
          </Button>
          <Badge variant="secondary" className="h-9 gap-1.5 px-3 text-sm font-semibold capitalize">
            <Sparkles className="h-3.5 w-3.5" />
            {stats?.subscriptionPlan || "Pro"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href} className="group block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className={cn("rounded-xl p-2.5", stat.iconWrap)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {stat.title}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {revenueStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href} className="group block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-5 py-6">
                  <div className={cn("flex-shrink-0 rounded-2xl p-4", stat.iconWrap)}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recruitment Pipeline
            </CardTitle>
            <CardDescription>Application funnel breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="h-[220px] w-full flex-shrink-0 sm:w-[220px] text-foreground">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                      stroke="none"
                    >
                      {pipelineData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]}
                          style={{ filter: "drop-shadow(0 2px 6px rgba(99,102,241,0.25))" }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex-1 space-y-3">
                {pipelineData.map((stage, i) => {
                  const pct = Math.round((stage.value / (pipelineData[0].value || 1)) * 100)
                  return (
                    <div key={stage.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{ background: PIPELINE_COLORS[i % PIPELINE_COLORS.length] }}
                          />
                          <span className="font-medium text-foreground">{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{stage.value}</span>
                          <span className="w-9 text-right text-muted-foreground">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: PIPELINE_COLORS[i % PIPELINE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card className="border-primary/20 bg-primary/[0.03] dark:bg-primary/5">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Plan Usage
                </CardTitle>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400">
                  {stats?.subscriptionStatus || "Active"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>CV Uploads</span>
                  <span className="text-foreground">
                    {stats?.cvUploadsUsed || 0} / {stats?.cvUploadLimit === -1 ? "∞" : stats?.cvUploadLimit}
                  </span>
                </div>
                {stats?.cvUploadLimit !== -1 && (
                  <Progress
                    value={cvUsagePercent}
                    className="h-2 bg-muted [&_[data-slot=progress-indicator]]:bg-indigo-600 dark:[&_[data-slot=progress-indicator]]:bg-indigo-400"
                  />
                )}
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>Bids Placed</span>
                  <span className="text-foreground">
                    {stats?.bidsUsed || 0} / {stats?.biddingLimit === -1 ? "∞" : stats?.biddingLimit}
                  </span>
                </div>
                {stats?.biddingLimit !== -1 && (
                  <Progress
                    value={bidUsagePercent}
                    className="h-2 bg-muted [&_[data-slot=progress-indicator]]:bg-violet-600 dark:[&_[data-slot=progress-indicator]]:bg-violet-400"
                  />
                )}
              </div>
              <Button className="w-full gap-2" asChild>
                <Link href="/agency/settings">
                  <Sparkles className="h-4 w-4" />
                  Upgrade Plan
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
              <CardDescription>Jump to frequent tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent/50"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-lg bg-muted p-2 text-primary transition-colors group-hover:bg-primary/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
                          {action.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
