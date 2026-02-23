"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Loader2, Check, Briefcase } from "lucide-react"
import { toast } from "sonner"

type RoleRow = { jobTitle: string; positions: string }

export default function CreateDemandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [roles, setRoles] = useState<RoleRow[]>([{ jobTitle: "", positions: "1" }])
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login/company")
      return
    }
    const u = JSON.parse(user)
    setCompanyId(u.companyId ?? u.id ?? "")
    setCompanyName(u.name ?? u.companyName ?? "")
  }, [router])

  const addRole = () => setRoles((r) => [...r, { jobTitle: "", positions: "1" }])
  const removeRole = (index: number) => setRoles((r) => r.filter((_, i) => i !== index))
  const updateRole = (index: number, field: keyof RoleRow, value: string) => {
    setRoles((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const handleSubmit = async () => {
    const valid = roles.filter((r) => r.jobTitle.trim() && Number(r.positions) >= 1)
    if (valid.length === 0) {
      toast.error("Add at least one role with a name and quantity")
      return
    }
    if (!companyId) {
      toast.error("Company not found. Please log in again.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/company/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          companyName: companyName || "Company",
          roles: valid.map((r) => ({ jobTitle: r.jobTitle.trim(), positions: Math.max(1, Number(r.positions)) })),
          description,
          location,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Created ${data.demands?.length ?? valid.length} demand(s). Visible to all approved agencies.`)
        router.push("/company/demands")
      } else {
        toast.error(data.error || "Failed to create demands")
      }
    } catch {
      toast.error("Failed to create demands")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/company/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Create Demand</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Add roles and quantity
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Each row becomes one open demand. Example: Cleaner → 20, Shopkeeper → 10
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Roles</Label>
              {roles.map((row, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g. Cleaner, Shopkeeper, Office Staff"
                    value={row.jobTitle}
                    onChange={(e) => updateRole(index, "jobTitle", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={row.positions}
                    onChange={(e) => updateRole(index, "positions", e.target.value)}
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRole(index)}
                    disabled={roles.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addRole} className="gap-1">
                <Plus className="h-4 w-4" /> Add role
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g. Dubai, UAE"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional, applied to all)</Label>
              <Textarea
                id="description"
                placeholder="Brief description for all roles"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" asChild>
                <Link href="/company/dashboard">Cancel</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create demand(s)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
