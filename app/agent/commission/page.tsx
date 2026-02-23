"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, Briefcase } from "lucide-react"
import { PageLoader } from "@/components/page-loader"

interface PerDemand {
  demandId: string
  demandTitle: string
  companyName: string
  earnings: number
  count: number
}

export default function AgentCommissionPage() {
  const [commissionPercent, setCommissionPercent] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalPlacements, setTotalPlacements] = useState(0)
  const [perDemand, setPerDemand] = useState<PerDemand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agentId, agencyId } = JSON.parse(user)

    fetch(`/api/agent/commission?agentId=${agentId}&agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCommissionPercent(data.commissionPercent)
          setTotalEarnings(data.totalEarnings)
          setTotalPlacements(data.totalPlacements)
          setPerDemand(data.perDemandEarnings)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Commission</h1>
        <p className="text-sm text-muted-foreground">Track your earnings from successful placements</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{commissionPercent}%</p>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPlacements}</p>
              <p className="text-sm text-muted-foreground">Successful Placements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Demand Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Position</CardTitle>
          <CardDescription>Breakdown of your commission per job demand</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {perDemand.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No earnings yet. Placements will appear here once candidates are selected.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead>Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perDemand.map(d => (
                    <TableRow key={d.demandId}>
                      <TableCell className="font-medium">{d.demandTitle}</TableCell>
                      <TableCell className="text-muted-foreground">{d.companyName}</TableCell>
                      <TableCell>{d.count}</TableCell>
                      <TableCell className="font-medium text-green-600">${d.earnings.toLocaleString()}</TableCell>
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
