"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/page-loader"

export default function AdminBulkUploadLogsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

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

    fetch("/api/admin/bulk-upload-candidates/logs")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.logs)) setLogs(d.logs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  if (!userRole || loading) return <PageLoader />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-6xl space-y-6">
          <AdminNav role={userRole ?? undefined} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Bulk upload logs</h1>
              <p className="text-sm text-muted-foreground">Recent batches across all agencies.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/bulk-upload-candidates">Back to upload</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent batches</CardTitle>
              <CardDescription>Latest 50 records.</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No batches yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>OK</TableHead>
                        <TableHead>Fail</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((b) => (
                        <TableRow key={String(b.batchId)}>
                          <TableCell className="font-mono text-xs">{String(b.batchId ?? "")}</TableCell>
                          <TableCell className="text-sm">{String(b.agencyId ?? "")}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm">{String(b.spreadsheetFileName ?? "")}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {b.uploadedAt ? new Date(String(b.uploadedAt)).toLocaleString() : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-800">
                              {Number(b.successfulUploads ?? 0)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-rose-500/10 text-rose-800">
                              {Number(b.failedUploads ?? 0)}
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
        </div>
      </main>
    </div>
  )
}
