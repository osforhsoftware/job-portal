"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Briefcase,
  ClipboardList,
  Eye,
  Loader2,
  Search,
  Users,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"

type DemandRow = Record<string, unknown> & {
  id: string
  companyId: string
  companyName: string
  jobTitle: string
  location?: string
  status?: string
  approvalStatus?: string
  createdAt?: string
  jobCategoryName?: string
  jobSubCategoryName?: string
  companyRegisteredName?: string
}

type SubmissionRow = Record<string, unknown> & {
  id: string
  demandId: string
  demandTitle: string
  companyId: string
  companyName: string
  companyRegisteredName?: string
  candidateId: string
  candidateName: string
  status: string
  submittedAt: string
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s+/, "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

function isProbablyUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim())
}

/** Renders a value without JSON.stringify for primitives, arrays of scalars, and shallow objects. */
function ValueBlock({ value }: { value: unknown }): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>
  }
  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>
  }
  if (typeof value === "string") {
    if (isProbablyUrl(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 break-all"
        >
          {value}
        </a>
      )
    }
    return <span className="whitespace-pre-wrap break-words">{value}</span>
  }
  if (typeof value === "number") {
    return <span>{value}</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">—</span>
    const allScalar = value.every((x) => x === null || ["string", "number", "boolean"].includes(typeof x))
    if (allScalar) {
      return <span>{value.map((x) => String(x)).join(", ")}</span>
    }
    return (
      <ul className="list-disc pl-4 space-y-1 text-sm">
        {value.map((item, i) => (
          <li key={i}>
            {typeof item === "object" && item !== null ? (
              <ShallowObjectBlock obj={item as Record<string, unknown>} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    )
  }
  if (typeof value === "object") {
    return <ShallowObjectBlock obj={value as Record<string, unknown>} />
  }
  return <span>{String(value)}</span>
}

function ShallowObjectBlock({ obj }: { obj: Record<string, unknown> }) {
  const entries = Object.entries(obj).filter(([k]) => k !== "password")
  if (entries.length === 0) return <span className="text-muted-foreground">—</span>
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 space-y-2 text-sm">
      {entries.map(([k, v]) => (
        <div key={k} className="grid gap-0.5 sm:grid-cols-[minmax(8rem,auto)_1fr] sm:gap-x-3">
          <span className="text-muted-foreground font-medium">{humanizeKey(k)}</span>
          <div className="min-w-0">
            <ValueBlock value={v} />
          </div>
        </div>
      ))}
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      {children}
    </div>
  )
}

function DetailRows({
  rows,
}: {
  rows: { label: string; value?: unknown; content?: ReactNode }[]
}) {
  return (
    <dl className="space-y-2.5 text-sm">
      {rows.map((row, idx) => (
        <div
          key={`${row.label}-${idx}`}
          className="grid gap-1 sm:grid-cols-[minmax(10rem,auto)_1fr] sm:gap-x-4 sm:items-start"
        >
          <dt className="text-muted-foreground shrink-0">{row.label}</dt>
          <dd className="min-w-0">{row.content ?? <ValueBlock value={row.value} />}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Resolved entity label: primary name from DB, secondary id. */
function NameWithIdBlock({ name, id }: { name?: unknown; id?: unknown }) {
  const nameStr = name != null && String(name).trim() !== "" ? String(name) : null
  const idStr = id != null && String(id).trim() !== "" ? String(id) : null
  return (
    <div className="space-y-0.5">
      {nameStr ? (
        <span className="font-medium text-foreground">{nameStr}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
      {idStr ? <span className="block text-xs font-mono text-muted-foreground">{idStr}</span> : null}
    </div>
  )
}

function RemainingRows({ obj, usedKeys }: { obj: Record<string, unknown>; usedKeys: Set<string> }) {
  const rest = Object.keys(obj)
    .filter((k) => !usedKeys.has(k) && k !== "password")
    .sort()
    .map((k) => ({ label: humanizeKey(k), value: obj[k] }))
  if (rest.length === 0) return null
  return (
    <DetailSection title="Additional fields">
      <DetailRows rows={rest} />
    </DetailSection>
  )
}

/** Keys merged into Company / Job category rows (not shown as raw id-only fields). */
const JOB_COMPANY_RESOLVED_KEYS = new Set([
  "companyId",
  "companyName",
  "companyRegisteredName",
  "jobCategoryId",
  "jobSubCategoryId",
  "jobCategoryName",
  "jobSubCategoryName",
])

const DEMAND_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "Job & company",
    keys: ["id", "jobTitle", "description", "location"],
  },
  {
    title: "Volume & requirements",
    keys: ["quantity", "positions", "filledPositions", "requirements", "skills", "gender", "nationality"],
  },
  {
    title: "Compensation & benefits",
    keys: ["salary", "benefits", "otherBenefitNote"],
  },
  {
    title: "Schedule & working time",
    keys: [
      "dutyHoursPerDay",
      "breakTimeHours",
      "dayOffPerMonth",
      "timeRemark",
      "shiftStartTime",
      "shiftEndTime",
    ],
  },
  {
    title: "Status & timeline",
    keys: [
      "joining",
      "status",
      "approvalStatus",
      "deadline",
      "createdByUserId",
      "createdByEmployeeName",
      "createdAt",
      "updatedAt",
    ],
  },
]

function DemandDetailContent({ d }: { d: DemandRow }) {
  const raw = d as Record<string, unknown>
  const used = new Set<string>()
  const sections: ReactNode[] = []
  for (const { title, keys } of DEMAND_GROUPS) {
    const rows: { label: string; value?: unknown; content?: ReactNode }[] = []

    if (title === "Job & company") {
      if (raw.companyId != null || raw.companyName != null || raw.companyRegisteredName != null) {
        used.add("companyId")
        used.add("companyName")
        used.add("companyRegisteredName")
        rows.push({
          label: "Company",
          content: (
            <NameWithIdBlock name={raw.companyRegisteredName ?? raw.companyName} id={raw.companyId} />
          ),
        })
      }
      if (raw.jobCategoryId != null || raw.jobCategoryName != null) {
        used.add("jobCategoryId")
        used.add("jobCategoryName")
        rows.push({
          label: "Job category",
          content: <NameWithIdBlock name={raw.jobCategoryName} id={raw.jobCategoryId} />,
        })
      }
      if (raw.jobSubCategoryId != null || raw.jobSubCategoryName != null) {
        used.add("jobSubCategoryId")
        used.add("jobSubCategoryName")
        rows.push({
          label: "Job sub-category",
          content: <NameWithIdBlock name={raw.jobSubCategoryName} id={raw.jobSubCategoryId} />,
        })
      }
      for (const key of keys) {
        if (!(key in raw) || raw[key] === undefined) continue
        used.add(key)
        rows.push({ label: humanizeKey(key), value: raw[key] })
      }
    } else {
      for (const key of keys) {
        if (!(key in raw) || raw[key] === undefined) continue
        used.add(key)
        rows.push({ label: humanizeKey(key), value: raw[key] })
      }
    }

    if (rows.length > 0) {
      sections.push(
        <DetailSection key={title} title={title}>
          <DetailRows rows={rows} />
        </DetailSection>
      )
    }
  }
  JOB_COMPANY_RESOLVED_KEYS.forEach((k) => used.add(k))
  return (
    <div className="space-y-6 pb-1">
      {sections}
      <RemainingRows obj={raw} usedKeys={used} />
    </div>
  )
}

const APP_KEYS_WITHOUT_COMPANY = [
  "id",
  "candidateId",
  "candidateName",
  "demandId",
  "demandTitle",
  "agencyId",
  "agentId",
  "status",
  "commission",
  "submittedAt",
  "updatedAt",
] as const

const APPLICATION_COMPANY_KEYS = new Set(["companyId", "companyName", "companyRegisteredName"])

const CANDIDATE_SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: "Personal",
    keys: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
      "nationality",
      "currentLocation",
      "preferredLocations",
      "languages",
      "maritalStatus",
    ],
  },
  {
    title: "Work experience",
    keys: [
      "totalExperience",
      "currentJobTitle",
      "currentCompany",
      "currentSalary",
      "expectedSalary",
      "noticePeriod",
      "industries",
      "jobTypes",
      "jobCategories",
    ],
  },
  {
    title: "Education & skills",
    keys: ["highestEducation", "fieldOfStudy", "skills", "certifications"],
  },
  {
    title: "Documents & media",
    keys: ["cvUrl", "photoUrl", "passportUrl", "videoUrl"],
  },
  {
    title: "Visa & compensation",
    keys: ["visaCategory", "visaValidity", "visaStatus", "salaryRange", "salaryExpectation"],
  },
  {
    title: "Status & notes",
    keys: [
      "status",
      "isActive",
      "remarks",
      "currentStatus",
      "howYouKnowAboutUs",
      "nextStep",
      "candidateSelected",
      "uploadBatchId",
    ],
  },
  {
    title: "Record identity",
    keys: ["id", "userId", "agencyId", "role", "createdAt", "updatedAt"],
  },
]

const CANDIDATE_JOB_CLASSIFICATION_KEYS = new Set([
  "jobCategoryId",
  "jobSubCategoryId",
  "jobCategoryName",
  "jobSubCategoryName",
])

function pushCandidateJobClassification(
  candidate: Record<string, unknown>,
  usedCandidate: Set<string>,
  candidateSections: ReactNode[],
) {
  const hasCat =
    candidate.jobCategoryId != null ||
    candidate.jobCategoryName != null
  const hasSub =
    candidate.jobSubCategoryId != null ||
    candidate.jobSubCategoryName != null
  if (!hasCat && !hasSub) return

  const rows: { label: string; content: ReactNode }[] = []
  if (hasCat) {
    usedCandidate.add("jobCategoryId")
    usedCandidate.add("jobCategoryName")
    rows.push({
      label: "Job category",
      content: <NameWithIdBlock name={candidate.jobCategoryName} id={candidate.jobCategoryId} />,
    })
  }
  if (hasSub) {
    usedCandidate.add("jobSubCategoryId")
    usedCandidate.add("jobSubCategoryName")
    rows.push({
      label: "Job sub-category",
      content: <NameWithIdBlock name={candidate.jobSubCategoryName} id={candidate.jobSubCategoryId} />,
    })
  }
  if (rows.length === 0) return
  candidateSections.push(
    <DetailSection key="job-classification" title="Job classification">
      <DetailRows rows={rows} />
    </DetailSection>,
  )
}

function SubmissionDetailContent({ s }: { s: SubmissionRow }) {
  const raw = s as Record<string, unknown>
  const candidate = raw.candidate as Record<string, unknown> | null | undefined
  const agent = raw.agent as Record<string, unknown> | null | undefined
  const agency = raw.agency as Record<string, unknown> | null | undefined

  const usedTop = new Set<string>(["candidate", "agent", "agency"])
  const appRows: { label: string; value?: unknown; content?: ReactNode }[] = []

  if (raw.companyId != null || raw.companyName != null || raw.companyRegisteredName != null) {
    APPLICATION_COMPANY_KEYS.forEach((k) => usedTop.add(k))
    appRows.push({
      label: "Company",
      content: (
        <NameWithIdBlock name={raw.companyRegisteredName ?? raw.companyName} id={raw.companyId} />
      ),
    })
  }

  for (const key of APP_KEYS_WITHOUT_COMPANY) {
    if (!(key in raw) || raw[key] === undefined) continue
    usedTop.add(key)
    appRows.push({ label: humanizeKey(key), value: raw[key] })
  }

  const usedCandidate = new Set<string>()
  const candidateSections: ReactNode[] = []
  if (candidate && typeof candidate === "object") {
    for (const { title, keys } of CANDIDATE_SECTIONS) {
      const rows: { label: string; value?: unknown; content?: ReactNode }[] = []
      for (const k of keys) {
        if (!(k in candidate) || candidate[k] === undefined) continue
        usedCandidate.add(k)
        rows.push({ label: humanizeKey(k), value: candidate[k] })
      }
      if (rows.length > 0) {
        candidateSections.push(
          <DetailSection key={title} title={title}>
            <DetailRows rows={rows} />
          </DetailSection>
        )
      }
      if (title === "Work experience") {
        pushCandidateJobClassification(candidate, usedCandidate, candidateSections)
      }
    }
    CANDIDATE_JOB_CLASSIFICATION_KEYS.forEach((k) => usedCandidate.add(k))
  }

  return (
    <div className="space-y-6 pb-1">
      <DetailSection title="Application (submission)">
        <DetailRows rows={appRows} />
      </DetailSection>
      <RemainingRows obj={raw} usedKeys={usedTop} />

      {candidate && typeof candidate === "object" && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Candidate</h3>
            <div className="space-y-6">{candidateSections}</div>
            <RemainingRows obj={candidate} usedKeys={usedCandidate} />
          </div>
        </>
      )}

      {agent && typeof agent === "object" && Object.keys(agent).length > 0 && (
        <>
          <Separator />
          <DetailSection title="Agent">
            <DetailRows
              rows={Object.entries(agent)
                .filter(([k]) => k !== "password")
                .map(([k, v]) => ({ label: humanizeKey(k), value: v }))}
            />
          </DetailSection>
        </>
      )}

      {agency && typeof agency === "object" && Object.keys(agency).length > 0 && (
        <>
          <Separator />
          <DetailSection title="Agency">
            <DetailRows
              rows={Object.entries(agency)
                .filter(([k]) => k !== "password")
                .map(([k, v]) => ({ label: humanizeKey(k), value: v }))}
            />
          </DetailSection>
        </>
      )}
    </div>
  )
}

export default function AdminDemandsOverviewPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [demands, setDemands] = useState<DemandRow[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [searchDemands, setSearchDemands] = useState("")
  const [searchSubmissions, setSearchSubmissions] = useState("")
  const [detailDemand, setDetailDemand] = useState<DemandRow | null>(null)
  const [detailSubmission, setDetailSubmission] = useState<SubmissionRow | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/admin/login")
      setAuthReady(true)
      return
    }
    const userData = JSON.parse(user)
    if (userData.role !== "super_admin") {
      router.replace("/admin/dashboard")
      setAuthReady(true)
      return
    }
    setUserRole(userData.role)
    setAuthReady(true)
  }, [router])

  useEffect(() => {
    if (userRole !== "super_admin") return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/demands-overview")
        const data = await res.json()
        if (!cancelled && data.success) {
          setDemands(data.demands || [])
          setSubmissions(data.submissions || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userRole])

  const filteredDemands = useMemo(() => {
    const q = searchDemands.trim().toLowerCase()
    if (!q) return demands
    return demands.filter((d) => {
      const blob = [
        d.jobTitle,
        d.companyName,
        d.companyId,
        d.location,
        d.status,
        d.approvalStatus,
        d.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return blob.includes(q)
    })
  }, [demands, searchDemands])

  const filteredSubmissions = useMemo(() => {
    const q = searchSubmissions.trim().toLowerCase()
    if (!q) return submissions
    return submissions.filter((s) => {
      const blob = [
        s.candidateName,
        s.demandTitle,
        s.companyName,
        s.status,
        s.demandId,
        s.companyId,
        s.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return blob.includes(q)
    })
  }, [submissions, searchSubmissions])

  if (!authReady) {
    return <PageLoader />
  }
  if (!userRole || userRole !== "super_admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8">
        <div className="site-container">
          <AdminNav role={userRole} />
          <div className="mb-8">
            <Link
              href="/admin/dashboard"
              className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Demands & submissions</h1>
            <p className="mt-2 text-muted-foreground">
              Platform-wide job demands and candidate submissions with full record data (super admin only).
            </p>
          </div>

          <Tabs defaultValue="demands" className="space-y-4">
            <TabsList>
              <TabsTrigger value="demands" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Demands ({demands.length})
              </TabsTrigger>
              <TabsTrigger value="submissions" className="gap-2">
                <Users className="h-4 w-4" />
                Submissions ({submissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="demands">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5" />
                    All demands
                  </CardTitle>
                  <CardDescription>
                    Every demand row from all companies, including pending approval and full hiring details.
                  </CardDescription>
                  <div className="relative max-w-md pt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Filter by title, company, location, status…"
                      className="pl-9"
                      value={searchDemands}
                      onChange={(e) => setSearchDemands(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Approval</TableHead>
                            <TableHead className="w-[100px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDemands.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                No demands match your filter.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredDemands.map((d) => (
                              <TableRow key={d.id}>
                                <TableCell className="font-medium max-w-[220px]">
                                  <div className="truncate" title={String(d.jobTitle)}>
                                    {String(d.jobTitle)}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate font-mono">{d.id}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="truncate max-w-[180px]" title={String(d.companyName)}>
                                    {String(d.companyName)}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono truncate">{d.companyId}</div>
                                </TableCell>
                                <TableCell className="text-sm">{d.location != null ? String(d.location) : "—"}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="capitalize">
                                    {d.status != null ? String(d.status) : "—"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {d.approvalStatus != null ? String(d.approvalStatus) : "approved (legacy)"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => setDetailDemand(d)}>
                                    <Eye className="h-4 w-4" />
                                    All data
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submissions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    All submissions
                  </CardTitle>
                  <CardDescription>
                    Every application with linked candidate, agency, and agent records (passwords omitted).
                  </CardDescription>
                  <div className="relative max-w-md pt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Filter by candidate, demand, company, status…"
                      className="pl-9"
                      value={searchSubmissions}
                      onChange={(e) => setSearchSubmissions(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Demand</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="w-[100px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubmissions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                No submissions match your filter.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredSubmissions.map((s) => (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">
                                  <div>{String(s.candidateName)}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{s.candidateId}</div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  <div className="truncate" title={String(s.demandTitle)}>
                                    {String(s.demandTitle)}
                                  </div>
                                  <div className="text-xs text-muted-foreground font-mono truncate">{s.demandId}</div>
                                </TableCell>
                                <TableCell className="max-w-[180px]">
                                  <div className="truncate">{String(s.companyName)}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="capitalize">
                                    {String(s.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                  {s.submittedAt
                                    ? new Date(String(s.submittedAt)).toLocaleString()
                                    : "—"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => setDetailSubmission(s)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    All data
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={!!detailDemand} onOpenChange={(o) => !o && setDetailDemand(null)}>
            <DialogContent className="flex max-h-[90vh] min-h-0 w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
              <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
                <DialogTitle>Demand — full details</DialogTitle>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain px-6 py-4 [scrollbar-gutter:stable]">
                {detailDemand && <DemandDetailContent d={detailDemand} />}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!detailSubmission} onOpenChange={(o) => !o && setDetailSubmission(null)}>
            <DialogContent className="flex max-h-[90vh] min-h-0 w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
              <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
                <DialogTitle>Submission — full details</DialogTitle>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain px-6 py-4 [scrollbar-gutter:stable]">
                {detailSubmission && <SubmissionDetailContent s={detailSubmission} />}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
