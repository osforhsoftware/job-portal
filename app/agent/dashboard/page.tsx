"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  FileCheck,
  DollarSign,
  TrendingUp,
  Copy,
  Link2,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { toast } from "sonner"

interface Stats {
  totalReferrals: number
  totalCandidates: number
  totalApplications: number
  pendingApplications: number
  shortlisted: number
  interview: number
  selected: number
  rejected: number
  totalEarnings: number
  totalPlacements: number
  totalPoints: number
  commissionPercent: number
  referralCode: string
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agentId, agencyId } = JSON.parse(user)
    if (!agentId || !agencyId) return

    fetch(`/api/agent/stats?agentId=${agentId}&agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const referralLink = stats?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register/candidate?ref=${stats.referralCode}`
    : ""

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast.success("Referral link copied!")
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-emerald-600" />
            Your Referral Link
          </CardTitle>
          <CardDescription>Share this link to recruit candidates and earn commission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={referralLink} readOnly className="flex-1 font-mono text-sm" />
            <Button onClick={copyLink} className="bg-emerald-600 hover:bg-emerald-700">
              <Copy className="mr-2 h-4 w-4" />Copy
            </Button>
            <Button variant="outline" onClick={() => setShowQR(!showQR)}>
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
          {showQR && stats?.referralCode && (
            <div className="mt-4 flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`}
                alt="QR Code"
                className="h-48 w-48 rounded-lg border border-border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/agent/candidates">
          <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-emerald-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Candidates</CardTitle>
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCandidates || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.totalReferrals || 0} referrals</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/agent/applications">
          <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-emerald-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
                <FileCheck className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.pendingApplications || 0} pending</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hired / Placements</CardTitle>
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.selected || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.totalPlacements ?? 0} placements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Points</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPoints ?? 0}</div>
            <p className="text-xs text-muted-foreground">+10 per hire</p>
          </CardContent>
        </Card>

        <Link href="/agent/commission">
          <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-emerald-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
              <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/20">
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats?.totalEarnings || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats?.commissionPercent || 0}% commission rate</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Application Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Overview of your submitted applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{stats?.pendingApplications || 0}</p>
                <p className="text-xs text-yellow-600">Submitted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats?.shortlisted || 0}</p>
                <p className="text-xs text-blue-600">Shortlisted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-900/20">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{stats?.interview || 0}</p>
                <p className="text-xs text-indigo-600">Interview</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{stats?.selected || 0}</p>
                <p className="text-xs text-green-600">Hired</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{stats?.rejected || 0}</p>
                <p className="text-xs text-red-600">Rejected</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
