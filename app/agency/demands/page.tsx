"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  Eye,
  Send,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Loader2,
  Building2,
} from "lucide-react"
import { toast } from "sonner"
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

interface Candidate {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  status: string
}

export default function DemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [agencyId, setAgencyId] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId: aid } = JSON.parse(user)
    setAgencyId(aid)

    Promise.all([
      fetch("/api/agency/demands").then(r => r.json()),
      fetch(`/api/agency/candidates?agencyId=${aid}`).then(r => r.json()),
    ])
      .then(([demandData, candidateData]) => {
        if (demandData.success) setDemands(demandData.demands)
        if (candidateData.success) setCandidates(candidateData.candidates)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredDemands = demands.filter(d => {
    const matchSearch = d.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase())
    const matchGender = genderFilter === "all" || d.gender.toLowerCase() === genderFilter.toLowerCase() || d.gender === "any"
    return matchSearch && matchGender
  })

  const handleSubmitCandidates = async () => {
    if (!selectedDemand || selectedCandidates.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/agency/apply-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandId: selectedDemand.id, candidateIds: selectedCandidates, agencyId }),
      })
      const data = await res.json()
      if (data.success) {
        const submitted = data.results.filter((r: any) => r.status === "submitted").length
        const duplicates = data.results.filter((r: any) => r.status === "duplicate").length
        toast.success(`${submitted} candidate(s) submitted${duplicates ? `, ${duplicates} duplicate(s) skipped` : ""}`)
        setSubmitDialogOpen(false)
        setSelectedCandidates([])
      } else {
        toast.error(data.error || "Failed to submit")
      }
    } catch {
      toast.error("Failed to submit candidates")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by job title, company, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="any">Any</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Demands List */}
      {filteredDemands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No demands found</p>
            <p className="text-sm text-muted-foreground">Check back later for new job openings</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDemands.map(demand => (
            <Card key={demand.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{demand.jobTitle}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" />
                      {demand.companyName}
                    </CardDescription>
                  </div>
                  <Badge variant={demand.status === "open" ? "default" : "secondary"} className="capitalize">
                    {demand.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{demand.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{demand.salary.currency} {demand.salary.min.toLocaleString()} - {demand.salary.max.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{demand.filledPositions}/{demand.positions} filled</span>
                </div>
                {demand.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {demand.skills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                    {demand.skills.length > 4 && <Badge variant="secondary" className="text-xs">+{demand.skills.length - 4}</Badge>}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Dialog open={detailDialogOpen && selectedDemand?.id === demand.id} onOpenChange={(o) => { setDetailDialogOpen(o); if (o) setSelectedDemand(demand) }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm"><Eye className="mr-1 h-3 w-3" />Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{demand.jobTitle}</DialogTitle>
                        <DialogDescription>{demand.companyName} - {demand.location}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground">{demand.description}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Requirements</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {demand.requirements.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {demand.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-muted-foreground">Salary:</span> {demand.salary.currency} {demand.salary.min.toLocaleString()} - {demand.salary.max.toLocaleString()}</div>
                          <div><span className="text-muted-foreground">Gender:</span> {demand.gender}</div>
                          <div><span className="text-muted-foreground">Positions:</span> {demand.positions}</div>
                          <div><span className="text-muted-foreground">Deadline:</span> {new Date(demand.deadline).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={submitDialogOpen && selectedDemand?.id === demand.id} onOpenChange={(o) => { setSubmitDialogOpen(o); if (o) { setSelectedDemand(demand); setSelectedCandidates([]) } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={demand.status !== "open"}><Send className="mr-1 h-3 w-3" />Submit Candidates</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit Candidates for {demand.jobTitle}</DialogTitle>
                        <DialogDescription>Select candidates to apply for this position</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        {candidates.length === 0 ? (
                          <p className="py-4 text-center text-muted-foreground">No candidates available</p>
                        ) : (
                          candidates.filter(c => c.status === "available").map(candidate => (
                            <div key={candidate.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                              <Checkbox
                                checked={selectedCandidates.includes(candidate.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedCandidates(prev =>
                                    checked ? [...prev, candidate.id] : prev.filter(id => id !== candidate.id)
                                  )
                                }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{candidate.firstName} {candidate.lastName}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {candidate.skills?.slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        <Button onClick={handleSubmitCandidates} disabled={selectedCandidates.length === 0 || submitting} className="w-full">
                          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : `Submit ${selectedCandidates.length} Candidate(s)`}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
