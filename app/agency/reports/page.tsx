"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"

interface Report {
  totalApplications: number
  totalPlacements: number
  totalEarnings: number
  totalAgents: number
  monthlyBreakdown: { month: string; earnings: number; placements: number }[]
  agentPerformance: { name: string; totalSubmissions: number; placements: number; earnings: number }[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"]

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId } = JSON.parse(user)

    fetch(`/api/agency/commission/report?agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setReport(data.report)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <PageLoader />
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">No report data available</p>
      </div>
    )
  }

  const successRate = report.totalApplications > 0
    ? ((report.totalPlacements / report.totalApplications) * 100).toFixed(1)
    : "0"

  const pieData = report.agentPerformance
    .filter(a => a.totalSubmissions > 0)
    .map(a => ({ name: a.name, value: a.totalSubmissions }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Performance metrics and visual analytics</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{report.totalApplications}</p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{successRate}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{report.totalAgents}</p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${report.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {report.monthlyBreakdown.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">No monthly data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={report.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Placements */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Placements</CardTitle>
            <CardDescription>Successful placements over time</CardDescription>
          </CardHeader>
          <CardContent>
            {report.monthlyBreakdown.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">No monthly data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="placements" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>Submissions by agent</CardDescription>
          </CardHeader>
          <CardContent>
            {report.agentPerformance.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">No agent data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.agentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="totalSubmissions" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Submissions" />
                  <Bar dataKey="placements" fill="#10b981" radius={[0, 4, 4, 0]} name="Placements" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Agent Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Distribution</CardTitle>
            <CardDescription>Submissions share by agent</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
