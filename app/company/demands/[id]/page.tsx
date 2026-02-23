"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Download,
  Loader2,
  Briefcase,
  User,
  Mail,
  Phone,
  Building2,
} from "lucide-react"
import { toast } from "sonner"
import { PageLoader } from "@/components/page-loader"

interface Submission {
  id: string
  candidateId: string
  candidateName: string
  demandId: string
  demandTitle: string
  status: string
  agentId?: string
  agentName: string | null
  agencyName: string | null
  candidate: {
    id: string
    name: string
    email: string
    phone: string
    skills: string[]
    cvUrl?: string
  } | null
}

export default function CompanyDemandSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const demandId = params?.id as string
  const [companyId, setCompanyId] = useState("")
  const [demand, setDemand] = useState<{ jobTitle: string; companyName: string } | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login/company")
      return
    }
    const u = JSON.parse(user)
    const cid = u.companyId ?? u.id ?? ""
    setCompanyId(cid)
    if (!cid || !demandId) {
      setLoading(false)
      return
    }
    Promise.all([
      fetch(`/api/company/demands?companyId=${cid}`).then((r) => r.json()),
      fetch(`/api/company/submissions?companyId=${cid}&demandId=${demandId}`).then((r) => r.json()),
    ])
      .then(([demandsRes, subRes]) => {
        if (demandsRes.success && demandsRes.demands) {
          const d = demandsRes.demands.find((x: { id: string }) => x.id === demandId)
          if (d) setDemand({ jobTitle: d.jobTitle, companyName: d.companyName })
        }
        if (subRes.success && subRes.submissions) setSubmissions(subRes.submissions)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [demandId, router])

  const updateStatus = async (submissionId: string, status: string) => {
    if (!companyId) return
    setUpdatingId(submissionId)
    try {
      const res = await fetch(`/api/company/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, status }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, status } : s))
        )
        toast.success("Status updated")
      } else {
        toast.error(data.error || "Update failed")
      }
    } catch {
      toast.error("Update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/company/demands">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            {demand?.jobTitle ?? "Demand"} — Submissions
          </h1>
          <p className="text-muted-foreground">{demand?.companyName}</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No submissions yet</p>
            <p className="text-sm text-muted-foreground">Candidates will appear here when agencies submit CVs.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Name, Email, Phone, Agent, Agency, Status, CV</CardTitle>
            <p className="text-sm text-muted-foreground">Shortlist, Interview, Hire, or Reject candidates.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.candidate?.name ?? s.candidateName}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        {s.candidate?.email && (
                          <a
                            href={`mailto:${s.candidate.email}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {s.candidate.email}
                          </a>
                        )}
                        {!s.candidate?.email && "—"}
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        {s.candidate?.phone ? (
                          <a
                            href={`tel:${s.candidate.phone}`}
                            className="flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {s.candidate.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{s.agentName ?? "—"}</TableCell>
                      <TableCell>{s.agencyName ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.status === "hired"
                              ? "default"
                              : s.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end flex-wrap">
                          <Select
                            value={s.status}
                            onValueChange={(v) => updateStatus(s.id, v)}
                            disabled={updatingId === s.id}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              {updatingId === s.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="shortlisted">Shortlist</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="hired">Hire</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                          {s.candidate?.cvUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-1"
                            >
                              <a
                                href={s.candidate.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Download className="h-3 w-3" />
                                CV
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
