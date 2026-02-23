"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  FileCheck,
  UserCheck,
  Clock,
  CreditCard,
  Upload,
  BarChart3,
  UserCog,
  Link2,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"

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

export default function AgencyDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId } = JSON.parse(user)
    if (!agencyId) return

    fetch(`/api/agency/stats?agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <PageLoader />
  }

  const statCards = [
    { title: "Total Candidates", value: stats?.totalCandidates || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20", href: "/agency/candidates" },
    { title: "Active Demands", value: stats?.activeDemands || 0, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20", href: "/agency/demands" },
    { title: "Applications", value: stats?.submittedApplications || 0, icon: FileCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20", href: "/agency/applications" },
    { title: "Selected", value: stats?.selectedCandidates || 0, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/20", href: "/agency/applications" },
    { title: "Commission Earned", value: `$${(stats?.totalCommissionEarned || 0).toLocaleString()}`, icon: DollarSign, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20", href: "/agency/commission" },
    { title: "Pending Payments", value: `$${(stats?.pendingPayments || 0).toLocaleString()}`, icon: CreditCard, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20", href: "/agency/commission" },
  ]

  const cvUsagePercent = stats?.cvUploadLimit === -1 ? 0 : ((stats?.cvUploadsUsed || 0) / (stats?.cvUploadLimit || 1)) * 100
  const bidUsagePercent = stats?.biddingLimit === -1 ? 0 : ((stats?.bidsUsed || 0) / (stats?.biddingLimit || 1)) * 100

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`rounded-full p-2 ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plan Usage</CardTitle>
              <Badge className="capitalize">{stats?.subscriptionPlan || "basic"}</Badge>
            </div>
            <CardDescription>Your current subscription usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">CV Uploads</span>
                <span className="font-medium">
                  {stats?.cvUploadsUsed || 0} / {stats?.cvUploadLimit === -1 ? "Unlimited" : stats?.cvUploadLimit}
                </span>
              </div>
              {stats?.cvUploadLimit !== -1 && <Progress value={cvUsagePercent} className="h-2" />}
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Bids Used</span>
                <span className="font-medium">
                  {stats?.bidsUsed || 0} / {stats?.biddingLimit === -1 ? "Unlimited" : stats?.biddingLimit}
                </span>
              </div>
              {stats?.biddingLimit !== -1 && <Progress value={bidUsagePercent} className="h-2" />}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Subscription Status</span>
              <Badge variant={stats?.subscriptionStatus === "active" ? "default" : "destructive"} className="capitalize">
                {stats?.subscriptionStatus || "active"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/agency/bulk-upload">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload Candidates
              </Button>
            </Link>
            <Link href="/agency/demands">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                View Open Demands
              </Button>
            </Link>
            <Link href="/agency/agents">
              <Button variant="outline" className="w-full justify-start">
                <UserCog className="mr-2 h-4 w-4" />
                Manage Agents
              </Button>
            </Link>
            <Link href="/agency/referrals">
              <Button variant="outline" className="w-full justify-start">
                <Link2 className="mr-2 h-4 w-4" />
                Referral Links
              </Button>
            </Link>
            <Link href="/agency/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
            <Link href="/agency/applications">
              <Button variant="outline" className="w-full justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                Track Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
