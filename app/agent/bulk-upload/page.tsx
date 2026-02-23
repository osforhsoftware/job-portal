"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  CloudUpload,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"
import { PageLoader } from "@/components/page-loader"

interface UploadResult {
  filename: string
  status: "success" | "duplicate" | "error"
  message: string
  candidateId?: string
}

interface DemandOption {
  id: string
  jobTitle: string
  companyName: string
  positions: number
  status: string
}

function AgentBulkUploadContent() {
  const searchParams = useSearchParams()
  const demandIdFromUrl = searchParams.get("demandId")

  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<UploadResult[]>([])
  const [summary, setSummary] = useState<{
    total: number
    uploaded: number
    duplicates: number
    errors: number
  } | null>(null)
  const [agencyId, setAgencyId] = useState("")
  const [agentId, setAgentId] = useState("")
  const [demands, setDemands] = useState<DemandOption[]>([])
  const [selectedDemandId, setSelectedDemandId] = useState<string>("none")
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const u = JSON.parse(user)
    setAgencyId(u.agencyId ?? "")
    setAgentId(u.agentId ?? u.id ?? "")
  }, [])

  useEffect(() => {
    fetch("/api/agency/demands")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.demands) {
          const open = data.demands.filter((d: DemandOption) => d.status === "open")
          setDemands(open)
          if (demandIdFromUrl && open.some((d: DemandOption) => d.id === demandIdFromUrl)) {
            setSelectedDemandId(demandIdFromUrl)
          } else if (open.length && selectedDemandId === "none") {
            setSelectedDemandId(open[0].id)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [demandIdFromUrl])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const validFiles = selected.filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type === "application/msword" ||
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.name.endsWith(".pdf") ||
        f.name.endsWith(".doc") ||
        f.name.endsWith(".docx")
    )
    if (validFiles.length < selected.length) {
      toast.warning(`${selected.length - validFiles.length} file(s) skipped (only PDF, DOC, DOCX allowed)`)
    }
    setFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    const userStr = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null
    const u = userStr ? JSON.parse(userStr) : {}
    const effectiveAgencyId = agencyId || u.agencyId
    const effectiveAgentId = agentId || u.agentId || u.id
    if (!effectiveAgencyId || !effectiveAgentId) {
      toast.error("Session missing. Please log in again as an agent.")
      return
    }
    setUploading(true)
    setProgress(0)
    setResults([])
    setSummary(null)

    const formData = new FormData()
    formData.append("agencyId", effectiveAgencyId)
    formData.append("agentId", effectiveAgentId)
    if (selectedDemandId && selectedDemandId !== "none") formData.append("demandId", selectedDemandId)
    files.forEach((f) => formData.append("files", f))

    const progressInterval = setInterval(() => setProgress((p) => Math.min(p + 5, 90)), 200)

    try {
      const res = await fetch("/api/agency/bulk-upload", { method: "POST", body: formData })
      const data = await res.json()
      clearInterval(progressInterval)
      setProgress(100)
      if (data.success) {
        setResults(data.results)
        setSummary({
          total: data.total,
          uploaded: data.uploaded,
          duplicates: data.duplicates,
          errors: data.errors,
        })
        toast.success(`${data.uploaded} of ${data.total} files uploaded successfully`)
        setFiles([])
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch {
      clearInterval(progressInterval)
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    const valid = dropped.filter(
      (f) => f.name.endsWith(".pdf") || f.name.endsWith(".doc") || f.name.endsWith(".docx")
    )
    setFiles((prev) => [...prev, ...valid])
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/agent/demands">← Demands</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bulk Upload CVs</h1>
          <p className="text-sm text-muted-foreground">
            Select a company demand and upload PDF/DOC/DOCX CVs. Data is extracted and linked to the demand.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Select demand
          </CardTitle>
          <CardDescription>
            Each CV will create a candidate and a submission for the selected demand. Required for company to see your submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDemandId} onValueChange={setSelectedDemandId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select demand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No demand (candidates only)</SelectItem>
              {demands.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.jobTitle} — {d.companyName} ({d.positions})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 transition-colors hover:border-primary/50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX (max 5MB per file)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{files.length} file(s) selected</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                  Clear All
                </Button>
                <Button size="sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {uploading && (
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(idx)}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
            <CardDescription>Summary of the bulk upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{summary.uploaded}</p>
                <p className="text-xs text-green-600">Uploaded</p>
              </div>
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-900 dark:bg-yellow-900/20">
                <p className="text-2xl font-bold text-yellow-600">{summary.duplicates}</p>
                <p className="text-xs text-yellow-600">Duplicates</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600">{summary.errors}</p>
                <p className="text-xs text-red-600">Errors</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.filename}</TableCell>
                      <TableCell>
                        {r.status === "success" && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="mr-1 h-3 w-3" /> Success
                          </Badge>
                        )}
                        {r.status === "duplicate" && (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Duplicate
                          </Badge>
                        )}
                        {r.status === "error" && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <XCircle className="mr-1 h-3 w-3" /> Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.message}</TableCell>
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

export default function AgentBulkUploadPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AgentBulkUploadContent />
    </Suspense>
  )
}
