"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Copy,
  Link2,
  QrCode,
  Users,
  TrendingUp,
  Share2,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { toast } from "sonner"

export default function AgentReferralsPage() {
  const [referralCode, setReferralCode] = useState("")
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [totalPlacements, setTotalPlacements] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agentId, agencyId } = JSON.parse(user)

    fetch(`/api/agent/stats?agentId=${agentId}&agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setReferralCode(data.stats.referralCode)
          setTotalReferrals(data.stats.totalReferrals)
          setTotalPlacements(data.stats.selected)
          setTotalEarnings(data.stats.totalEarnings)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const fullLink = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register/candidate?ref=${referralCode}`
    : ""

  const copyLink = () => {
    navigator.clipboard.writeText(fullLink)
    toast.success("Referral link copied!")
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Join via my referral", url: fullLink })
    } else {
      copyLink()
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Referral Link</h1>
        <p className="text-sm text-muted-foreground">Share your link to recruit candidates and earn commission</p>
      </div>

      {/* Referral Link */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-emerald-600" />
            Your Unique Referral Link
          </CardTitle>
          <CardDescription>
            Referral Code: <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">{referralCode}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={fullLink} readOnly className="flex-1 font-mono text-sm" />
            <Button onClick={copyLink} className="bg-emerald-600 hover:bg-emerald-700">
              <Copy className="mr-2 h-4 w-4" />Copy
            </Button>
            <Button variant="outline" onClick={() => setShowQR(!showQR)}>
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={shareLink}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {showQR && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullLink)}`}
                alt="QR Code"
                className="h-56 w-56 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">Scan to register as candidate</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReferrals}</p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPlacements}</p>
              <p className="text-sm text-muted-foreground">Placements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
