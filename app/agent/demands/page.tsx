"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Building2,
  Upload,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"

interface Demand {
  id: string
  companyName: string
  jobTitle: string
  description: string
  requirements: string[]
  skills: string[]
  salary: { min: number; max: number; currency: string }
  gender: string
  location: string
  positions: number
  filledPositions: number
  status: string
  deadline: string
}

export default function AgentDemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    fetch("/api/agency/demands")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.demands) setDemands(data.demands)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openDemands = demands.filter((d) => d.status === "open")
  const filtered = openDemands.filter(
    (d) =>
      d.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (d.location && d.location.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Demands</h1>
          <p className="text-sm text-muted-foreground">
            View open demands and upload CVs for any role
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/agent/bulk-upload">
            <Upload className="h-4 w-4" />
            Bulk Upload CVs
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by job title, company, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No open demands found</p>
            <p className="text-sm text-muted-foreground">Check back later for new roles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((d) => (
            <Card key={d.id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{d.jobTitle}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {d.companyName}
                    </CardDescription>
                  </div>
                  <Badge variant={d.status === "open" ? "default" : "secondary"} className="capitalize shrink-0">
                    {d.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {d.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {d.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {d.salary.currency} {d.salary.min?.toLocaleString()} – {d.salary.max?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {d.filledPositions}/{d.positions} filled
                  </span>
                </div>
                {d.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {d.skills.slice(0, 4).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                    {d.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">+{d.skills.length - 4}</Badge>
                    )}
                  </div>
                )}
                <div className="mt-auto flex gap-2 pt-2">
                  <Dialog open={detailOpen && selectedDemand?.id === d.id} onOpenChange={(o) => { setDetailOpen(o); if (o) setSelectedDemand(d) }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{d.jobTitle}</DialogTitle>
                        <DialogDescription>
                          {d.companyName} · {d.location}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedDemand && (
                        <div className="space-y-4">
                          {selectedDemand.description && (
                            <div>
                              <h4 className="font-medium mb-1">Description</h4>
                              <p className="text-sm text-muted-foreground">{selectedDemand.description}</p>
                            </div>
                          )}
                          {selectedDemand.requirements?.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-1">Requirements</h4>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {selectedDemand.requirements.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Salary: </span>
                              {selectedDemand.salary.currency} {selectedDemand.salary.min?.toLocaleString()} – {selectedDemand.salary.max?.toLocaleString()}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Positions: </span>
                              {selectedDemand.positions}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Deadline: </span>
                              {selectedDemand.deadline ? new Date(selectedDemand.deadline).toLocaleDateString() : "—"}
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" asChild className="gap-1">
                    <Link href={`/agent/bulk-upload?demandId=${d.id}`}>
                      <Upload className="h-3 w-3" />
                      Bulk Upload CVs
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
