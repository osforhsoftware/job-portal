"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  Users,
  Briefcase,
  Download,
  TrendingUp,
  CreditCard,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { toast } from "sonner"

interface PerAgent {
  agentId: string
  agentName: string
  commissionPercent: number
  applications: number
  earnings: number
}

interface PerDemand {
  demandId: string
  demandTitle: string
  companyName: string
  earnings: number
  count: number
}

interface PaymentRow {
  id: string
  amount: number
  type: string
  status: string
  date: string
}

export default function CommissionPage() {
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [perAgent, setPerAgent] = useState<PerAgent[]>([])
  const [perDemand, setPerDemand] = useState<PerDemand[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId } = JSON.parse(user)

    fetch(`/api/agency/commission?agencyId=${agencyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTotalEarnings(data.totalEarnings)
          setPerAgent(data.perAgentEarnings)
          setPerDemand(data.perDemandEarnings)
          setPayments(data.paymentHistory)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const exportCSV = () => {
    const rows = [
      ["Agent", "Commission %", "Applications", "Earnings"],
      ...perAgent.map(a => [a.agentName, a.commissionPercent, a.applications, a.earnings]),
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "commission-report.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Report exported")
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Commission & Payments</h1>
          <p className="text-sm text-muted-foreground">Track earnings and payment history</p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
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
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{perAgent.length}</p>
              <p className="text-sm text-muted-foreground">Earning Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{perDemand.length}</p>
              <p className="text-sm text-muted-foreground">Earning Demands</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Per Agent</TabsTrigger>
          <TabsTrigger value="demands">Per Demand</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Earnings</CardTitle>
              <CardDescription>Commission breakdown by agent</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {perAgent.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No agent earnings yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Commission %</TableHead>
                        <TableHead>Placements</TableHead>
                        <TableHead>Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perAgent.map(a => (
                        <TableRow key={a.agentId}>
                          <TableCell className="font-medium">{a.agentName}</TableCell>
                          <TableCell>{a.commissionPercent}%</TableCell>
                          <TableCell>{a.applications}</TableCell>
                          <TableCell className="font-medium text-green-600">${a.earnings.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demands">
          <Card>
            <CardHeader>
              <CardTitle>Demand Earnings</CardTitle>
              <CardDescription>Commission breakdown by job demand</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {perDemand.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No demand earnings yet</div>
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
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Record of all payments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No payment history yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-muted-foreground">{new Date(p.date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{p.type.replace("_", " ")}</TableCell>
                          <TableCell className="font-medium">${p.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                              {p.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
