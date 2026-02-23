"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, MapPin, Users } from "lucide-react"
import { PageLoader } from "@/components/page-loader"

interface Demand {
  id: string
  jobTitle: string
  companyName: string
  location: string
  positions: number
  filledPositions: number
  status: string
  createdAt: string
}

export default function CompanyDemandsPage() {
  const router = useRouter()
  const [demands, setDemands] = useState<Demand[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.replace("/login/company")
      return
    }
    try {
      const u = JSON.parse(user)
      if (u.role !== "company" && u.role !== "corporate") {
        router.replace("/login/company")
        return
      }
      const cid = u.companyId ?? u.id ?? ""
      setCompanyId(cid)
      if (!cid) {
        setLoading(false)
        return
      }
      fetch(`/api/company/demands?companyId=${cid}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setDemands(data.demands || [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } catch {
      router.replace("/login/company")
    }
  }, [router])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Demands</h1>
        <Button asChild className="gap-2">
          <Link href="/company/demands/new">
            <Plus className="h-4 w-4" />
            Create Demand
          </Link>
        </Button>
      </div>

      {demands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No demands yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create a demand to receive candidates from agencies</p>
            <Button asChild>
              <Link href="/company/demands/new">Create Demand</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {demands.map((d) => (
            <Card key={d.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{d.jobTitle}</CardTitle>
                  <Badge variant={d.status === "open" ? "default" : "secondary"} className="capitalize">
                    {d.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{d.companyName}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {d.location && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {d.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {d.filledPositions}/{d.positions} filled
                </span>
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link href={`/company/demands/${d.id}`}>View submissions</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
