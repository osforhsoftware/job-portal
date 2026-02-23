"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users } from "lucide-react"
import { PageLoader } from "@/components/page-loader"

interface CandidateRow {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  skills: string[]
  status: string
  currentLocation: string
  createdAt: string
  source: string
}

export default function AgentCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agentId } = JSON.parse(user)

    fetch(`/api/agent/candidates?agentId=${agentId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setCandidates(data.candidates)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = candidates.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    under_bidding: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    interviewed: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    selected: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Candidates ({candidates.length})</h1>
        <p className="text-sm text-muted-foreground">Candidates recruited through your referral link</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">No candidates found</p>
              <p className="text-sm text-muted-foreground">Share your referral link to start recruiting</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell>{c.phone || "-"}</TableCell>
                      <TableCell>{c.currentLocation || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {c.skills?.slice(0, 2).map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                          {(c.skills?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">+{c.skills.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status] || ""}`}>
                          {c.status?.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
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
