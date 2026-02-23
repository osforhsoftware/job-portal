"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Copy,
  Link2,
  QrCode,
  Users,
  TrendingUp,
  ExternalLink,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { toast } from "sonner"

interface AgentReferral {
  agentId: string
  agentName: string
  referralCode: string
  totalReferrals: number
  totalPlacements: number
  totalEarnings: number
}

export default function ReferralsPage() {
  const [referralLink, setReferralLink] = useState("")
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [agentReferrals, setAgentReferrals] = useState<AgentReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId } = JSON.parse(user)

    fetch(`/api/agency/referrals?agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setReferralLink(data.agencyReferralLink)
          setTotalReferrals(data.totalReferrals)
          setAgentReferrals(data.agentReferrals)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getFullLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    return `${origin}/register/candidate?ref=${code}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Link copied to clipboard!")
  }

  const generateQRUrl = (link: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referral System</h1>
        <p className="text-sm text-muted-foreground">Manage referral links and track agent referrals</p>
      </div>

      {/* Agency Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Agency Referral Link
          </CardTitle>
          <CardDescription>Share this link with candidates to register under your agency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={getFullLink(referralLink)} readOnly className="flex-1 font-mono text-sm" />
            <Button onClick={() => copyToClipboard(getFullLink(referralLink))}>
              <Copy className="mr-2 h-4 w-4" />Copy
            </Button>
            <Button variant="outline" onClick={() => setShowQR(showQR === "agency" ? null : "agency")}>
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
          {showQR === "agency" && (
            <div className="mt-4 flex justify-center">
              <img
                src={generateQRUrl(getFullLink(referralLink))}
                alt="QR Code"
                className="h-48 w-48 rounded-lg border border-border"
              />
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
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agentReferrals.length}</p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agentReferrals.reduce((s, a) => s + a.totalPlacements, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Placements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Referral Links</CardTitle>
          <CardDescription>Each agent has a unique referral code to track their recruits</CardDescription>
        </CardHeader>
        <CardContent>
          {agentReferrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No agents yet. Add agents to generate referral links.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentReferrals.map(agent => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">{agent.referralCode}</code>
                      </TableCell>
                      <TableCell>{agent.totalReferrals}</TableCell>
                      <TableCell>{agent.totalPlacements}</TableCell>
                      <TableCell>${agent.totalEarnings.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(getFullLink(agent.referralCode))}
                          >
                            <Copy className="mr-1 h-3 w-3" />Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowQR(showQR === agent.agentId ? null : agent.agentId)}
                          >
                            <QrCode className="h-3 w-3" />
                          </Button>
                        </div>
                        {showQR === agent.agentId && (
                          <div className="mt-2 flex justify-end">
                            <img
                              src={generateQRUrl(getFullLink(agent.referralCode))}
                              alt="QR Code"
                              className="h-32 w-32 rounded-lg border border-border"
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
