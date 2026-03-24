"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PageLoader } from "@/components/page-loader"
import { Badge } from "@/components/ui/badge"

export default function BulkUploadCandidatesHistoryPage() {
  const router = useRouter()
  const [agencyId, setAgencyId] = useState("")
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState<Array<Record<string, unknown>>>([])

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login/agency")
      return
    }
    const u = JSON.parse(userStr)
    if (u.role !== "agency") {
      router.push("/")
      return
    }
    const aid = u.agencyId ?? u.id ?? ""
    setAgencyId(aid)
  }, [router])

  useEffect(() => {
    if (!agencyId) return
    setLoading(true)
    fetch(`/api/agency/bulk-upload-candidates/history?agencyId=${encodeURIComponent(agencyId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.batches)) setBatches(d.batches)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [agencyId])

  if (!agencyId || loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Recent bulk upload batches for your agency.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/agency/bulk-upload-candidates">Back to Upload</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Batches</CardTitle>
          <CardDescription>Showing the latest 20 uploads.</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Candidates</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={String(b.batchId)}>
                    <TableCell className="font-medium">{String(b.batchId ?? "")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.uploadedAt ? new Date(String(b.uploadedAt)).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>{Number(b.totalCandidates ?? 0)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                        {Number(b.successfulUploads ?? 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-rose-500/10 text-rose-700 border-rose-500/20">
                        {Number(b.failedUploads ?? 0)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
