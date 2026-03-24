"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  CloudUpload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"

type ValidationError = {
  rowNo: number
  errors: string[]
  email?: string
  cvFileName?: string
}

type ValidationResponse = {
  spreadsheetFileName: string
  candidatesToUpload: number
  totalCandidatesInSheet: number
  totalCvFilesInBatch: number
  missingCvFileNames: string[]
  errors: ValidationError[]
  errorReportBase64?: string
  canImport: boolean
}

function downloadBase64Xlsx(base64: string, filename: string) {
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

type AgencyOption = { id: string; name: string }

export default function AdminBulkUploadCandidatesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cvFileInputRef = useRef<HTMLInputElement>(null)

  const [userRole, setUserRole] = useState<string | null>(null)
  const [agencies, setAgencies] = useState<AgencyOption[]>([])
  const [selectedAgencyId, setSelectedAgencyId] = useState("")

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [spreadsheet, setSpreadsheet] = useState<File | null>(null)
  const [cvFiles, setCvFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const [validation, setValidation] = useState<ValidationResponse | null>(null)
  const [importResult, setImportResult] = useState<{
    batchId: string
    successfulUploads: number
    failedUploads: number
    totalCandidates: number
  } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }
    const u = JSON.parse(userStr)
    if (u.role !== "super_admin" && u.role !== "admin") {
      router.push("/")
      return
    }
    setUserRole(u.role)

    fetch("/api/admin/agencies")
      .then((r) => r.json())
      .then((d) => {
        if (d?.agencies) {
          setAgencies(
            d.agencies.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }))
          )
        }
      })
      .catch(() => {})
  }, [router])

  const selectedAgencyName = useMemo(
    () => agencies.find((a) => a.id === selectedAgencyId)?.name ?? "",
    [agencies, selectedAgencyId]
  )

  const spreadsheetError = useMemo(() => {
    if (!spreadsheet) return null
    const lower = spreadsheet.name.toLowerCase()
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".csv")) return "Spreadsheet must be .xlsx or .csv"
    return null
  }, [spreadsheet])

  const cvFilesError = useMemo(() => {
    if (!cvFiles.length) return null
    for (const f of cvFiles) {
      const lower = f.name.toLowerCase()
      const ok = lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx")
      if (!ok) return `Unsupported CV format: ${f.name}`
      if (f.size > 5 * 1024 * 1024) return `File exceeds 5 MB: ${f.name}`
    }
    return null
  }, [cvFiles])

  const appendUploaderFields = (formData: FormData) => {
    const userStr = localStorage.getItem("user")
    const u = userStr ? JSON.parse(userStr) : {}
    formData.append("uploadedBy", u.id ?? "")
    if (u.email) formData.append("uploadedByEmail", u.email)
    if (u.name) formData.append("uploadedByName", u.name)
  }

  const handleValidate = async () => {
    if (!selectedAgencyId) {
      toast.error("Select an agency.")
      return
    }
    if (!spreadsheet) {
      toast.error("Please choose the spreadsheet.")
      return
    }
    if (spreadsheetError) {
      toast.error(spreadsheetError)
      return
    }
    if (!cvFiles.length) {
      toast.error("Please upload at least one CV file.")
      return
    }
    if (cvFilesError) {
      toast.error(cvFilesError)
      return
    }

    setUploading(true)
    setValidation(null)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append("agencyId", selectedAgencyId)
      formData.append("spreadsheet", spreadsheet)
      cvFiles.forEach((f) => formData.append("cvFiles", f))
      appendUploaderFields(formData)

      const res = await fetch("/api/admin/bulk-upload-candidates/validate", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || "Validation failed")
        setValidation(null)
        return
      }
      setValidation(data)
      setStep(3)
    } catch {
      toast.error("Validation failed")
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (!validation?.canImport) {
      toast.error("Fix validation errors before importing.")
      return
    }
    if (!selectedAgencyId || !spreadsheet) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("agencyId", selectedAgencyId)
      formData.append("spreadsheet", spreadsheet)
      cvFiles.forEach((f) => formData.append("cvFiles", f))
      appendUploaderFields(formData)

      const res = await fetch("/api/admin/bulk-upload-candidates/import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || "Import failed")
        setValidation(null)
        return
      }

      setImportResult({
        batchId: data.batchId,
        successfulUploads: data.successfulUploads,
        failedUploads: data.failedUploads,
        totalCandidates: data.totalCandidates,
      })
      setStep(4)
      toast.success("Bulk import completed.")
      setCvFiles([])
      setSpreadsheet(null)
    } catch {
      toast.error("Import failed")
    } finally {
      setUploading(false)
    }
  }

  if (!userRole) return <PageLoader />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-5xl space-y-6">
          <AdminNav role={userRole ?? undefined} />

          <div>
            <h1 className="text-3xl font-bold text-foreground">Bulk Upload Candidates</h1>
            <p className="mt-2 text-muted-foreground">
              Import candidates for any approved agency using a spreadsheet and matching CV files.
            </p>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Select Agency
                </CardTitle>
                <CardDescription>Choose the agency that will own these candidates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Agency</label>
                  <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agency…" />
                    </SelectTrigger>
                    <SelectContent>
                      {agencies.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!selectedAgencyId} className="gap-2">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudUpload className="h-5 w-5 text-primary" />
                  Upload Files
                </CardTitle>
                <CardDescription>
                  Target agency: <strong>{selectedAgencyName || selectedAgencyId}</strong>. Filenames must match{" "}
                  <code className="text-xs">cvFileName</code> in the sheet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">1) Upload Spreadsheet</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.csv"
                      className="hidden"
                      onChange={(e) => setSpreadsheet(e.target.files?.[0] ?? null)}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                      <FileText className="h-4 w-4" />
                      Choose File
                    </Button>
                    {spreadsheet ? <Badge variant="secondary">{spreadsheet.name}</Badge> : <span className="text-sm text-muted-foreground">No file selected</span>}
                  </div>
                  {spreadsheetError && <p className="text-sm text-destructive">{spreadsheetError}</p>}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">2) Upload CV Files</p>
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
                      "hover:border-primary/60 bg-muted/20",
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const incoming = Array.from(e.dataTransfer.files || [])
                      const valid = incoming.filter((f) => {
                        const lower = f.name.toLowerCase()
                        return lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx")
                      })
                      if (valid.length !== incoming.length) toast.warning("Some files were skipped (only PDF/DOC/DOCX allowed).")
                      setCvFiles((prev) => [...prev, ...valid])
                    }}
                    onClick={() => cvFileInputRef.current?.click()}
                  >
                    <CloudUpload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 font-medium">Drag & drop CVs here</p>
                    <p className="text-xs text-muted-foreground">Max 5 MB each</p>
                  </div>
                  <input
                    ref={cvFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const incoming = Array.from(e.target.files || [])
                      setCvFiles((prev) => [...prev, ...incoming])
                    }}
                  />
                </div>

                {cvFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{cvFiles.length} file(s) selected</p>
                      <Button variant="ghost" size="sm" onClick={() => setCvFiles([])} disabled={uploading}>
                        Clear
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {cvFiles.map((f, idx) => (
                        <div key={`${f.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button variant="ghost" size="sm" disabled={uploading} onClick={() => setCvFiles((prev) => prev.filter((_, i) => i !== idx))}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    {cvFilesError && <p className="text-sm text-destructive">{cvFilesError}</p>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={uploading} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleValidate} disabled={uploading} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Review & Validate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && validation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Review & Confirm
                </CardTitle>
                <CardDescription>Agency: {selectedAgencyName || selectedAgencyId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-2">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Spreadsheet</p>
                      <p className="font-medium text-sm">{validation.spreadsheetFileName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Candidates to upload</p>
                      <p className="font-medium text-sm">{validation.candidatesToUpload}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CV files</p>
                      <p className="font-medium text-sm">{validation.totalCvFilesInBatch}</p>
                    </div>
                  </div>
                  {validation.errors.length === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      All validations passed.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="h-4 w-4" />
                      Validation failed for some rows.
                    </div>
                  )}
                </div>

                {validation.missingCvFileNames.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Missing CV files</p>
                    <div className="flex flex-wrap gap-2">
                      {validation.missingCvFileNames.map((n) => (
                        <Badge key={n} variant="destructive">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {validation.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Validation errors</p>
                      {validation.errorReportBase64 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadBase64Xlsx(validation.errorReportBase64!, `bulk-upload-errors-${Date.now()}.xlsx`)}
                        >
                          <Download className="h-4 w-4" />
                          Download Error Report
                        </Button>
                      )}
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/10 p-3 max-h-72 overflow-y-auto">
                      {validation.errors.slice(0, 80).map((e, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <p className="text-xs text-muted-foreground">
                            Row {e.rowNo} {e.email ? `· ${e.email}` : ""} {e.cvFileName ? `· ${e.cvFileName}` : ""}
                          </p>
                          <p className="text-sm text-destructive">{e.errors.join(" ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={uploading} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild disabled={uploading}>
                      <Link href="/admin/candidates">Candidates</Link>
                    </Button>
                    <Button onClick={handleImport} disabled={uploading || !validation.canImport} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Importing…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Confirm Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Upload Completed
                </CardTitle>
                <CardDescription>Batch {importResult.batchId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-border p-4 bg-muted/20 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Candidates</p>
                    <p className="font-medium">{importResult.successfulUploads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="font-medium">{importResult.failedUploads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total rows</p>
                    <p className="font-medium">{importResult.totalCandidates}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/admin/candidates">Go to Candidates</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/bulk-upload-candidates/logs">View logs</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1)
                      setImportResult(null)
                      setValidation(null)
                    }}
                  >
                    Upload again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
