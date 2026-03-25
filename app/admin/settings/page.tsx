"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MessageBanner } from "@/components/ui/message-banner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, ArrowLeft, Loader2, Save } from "lucide-react"

type AgencyRow = {
  id: string
  name: string
  approvalStatus?: string
  isActive?: boolean
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [videoRequired, setVideoRequired] = useState(false)
  const [commissionRatePercent, setCommissionRatePercent] = useState("15")
  const [defaultAgencyId, setDefaultAgencyId] = useState<string>("")
  const [agencies, setAgencies] = useState<AgencyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/admin/login")
      return
    }
    const userData = JSON.parse(user)
    if (userData.role !== "super_admin" && userData.role !== "admin") {
      router.push("/")
      return
    }
    setUserRole(userData.role)
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    try {
      const [settingsRes, agenciesRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/agencies"),
      ])
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setVideoRequired(data.settings.videoRequired ?? false)
        const rate = (data.settings.commissionRate ?? 0.15) * 100
        setCommissionRatePercent(String(Math.round(rate)))
        setDefaultAgencyId(
          typeof data.settings.defaultAgencyId === "string" ? data.settings.defaultAgencyId : ""
        )
      }
      if (agenciesRes.ok) {
        const data = await agenciesRes.json()
        setAgencies(data.agencies ?? [])
      }
    } catch (e) {
      console.error(e)
      setMessage({ type: "error", text: "Failed to load settings" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setMessage(null)
    setSaving(true)
    try {
      const rate = parseFloat(commissionRatePercent)
      if (isNaN(rate) || rate < 0 || rate > 100) {
        setMessage({ type: "error", text: "Commission rate must be between 0 and 100" })
        setSaving(false)
        return
      }
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoRequired,
          commissionRate: rate / 100,
          defaultAgencyId: defaultAgencyId.trim() === "" ? null : defaultAgencyId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" })
        setSaving(false)
        return
      }
      setVideoRequired(data.settings.videoRequired)
      setCommissionRatePercent(String(Math.round(data.settings.commissionRate * 100)))
      setDefaultAgencyId(
        typeof data.settings.defaultAgencyId === "string" ? data.settings.defaultAgencyId : ""
      )
      setMessage({ type: "success", text: "Settings saved successfully" })
    } catch (e) {
      console.error(e)
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  if (userRole === null) return null

  const eligibleAgencies = agencies.filter(
    (a) => a.approvalStatus === "approved" && a.isActive !== false
  )
  const defaultAgencyInvalid =
    defaultAgencyId !== "" &&
    !eligibleAgencies.some((a) => a.id === defaultAgencyId)
  const orphanAgency = defaultAgencyInvalid
    ? agencies.find((a) => a.id === defaultAgencyId)
    : undefined

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <AdminNav role={userRole} />
          <div className="mb-8">
            <Link href="/admin/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="mt-2 text-muted-foreground">Configure platform-wide settings</p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Video profile requirement, commission rate, default agency for self-registration, and other options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {message && (
                  <MessageBanner message={message} onDismiss={() => setMessage(null)} />
                )}

                {defaultAgencyInvalid && (
                  <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                    The saved default agency is no longer eligible (inactive or not approved). Choose another agency or clear this setting.
                    {orphanAgency ? ` (${orphanAgency.name})` : ""}
                  </p>
                )}

                <div className="flex flex-col gap-3 rounded-lg border border-border/50 p-4">
                  <div>
                    <Label htmlFor="defaultAgency" className="font-medium text-foreground">
                      Default agency for candidate self-registration
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Self-registered candidates with no referral link are assigned to this agency so they appear under that agency&apos;s candidates. Leave unset so only Super Admin sees them until reassigned.
                    </p>
                  </div>
                  <Select
                    value={defaultAgencyId === "" ? "__none__" : defaultAgencyId}
                    onValueChange={(v) => setDefaultAgencyId(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger id="defaultAgency" className="w-full max-w-md">
                      <SelectValue placeholder="No default agency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None (unassigned)</SelectItem>
                      {defaultAgencyInvalid && defaultAgencyId && orphanAgency && (
                        <SelectItem value={defaultAgencyId}>
                          {orphanAgency.name} (not eligible — update required)
                        </SelectItem>
                      )}
                      {defaultAgencyInvalid && defaultAgencyId && !orphanAgency && (
                        <SelectItem value={defaultAgencyId}>
                          Unknown agency (clear or replace)
                        </SelectItem>
                      )}
                      {eligibleAgencies.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <p className="font-medium text-foreground">Video profile required</p>
                    <p className="text-sm text-muted-foreground">
                      When enabled, candidates must add a video profile to complete registration.
                    </p>
                  </div>
                  <Switch
                    checked={videoRequired}
                    onCheckedChange={setVideoRequired}
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <Label htmlFor="commissionRate" className="font-medium text-foreground">Commission rate (%)</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Default commission percentage for agencies (0–100).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commissionRate"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={commissionRatePercent}
                      onChange={(e) => setCommissionRatePercent(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save settings
                      </>
                    )}
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/dashboard">Back to Dashboard</Link>
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
