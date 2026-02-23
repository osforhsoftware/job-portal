"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserCog, Lock, Save } from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { toast } from "sonner"

export default function AgentSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", commissionPercent: 0, referralCode: "" })
  const [passwordForm, setPasswordForm] = useState({ new: "", confirm: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agentId, setAgentId] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agentId: aid } = JSON.parse(user)
    setAgentId(aid)

    fetch(`/api/agent/profile?agentId=${aid}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setProfile({
            name: data.agent.name || "",
            email: data.agent.email || "",
            phone: data.agent.phone || "",
            commissionPercent: data.agent.commissionPercent || 0,
            referralCode: data.agent.referralCode || "",
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, name: profile.name, phone: profile.phone }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Profile updated")
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        user.name = profile.name
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        toast.error(data.error || "Failed to update")
      }
    } catch {
      toast.error("Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!passwordForm.new) {
      toast.error("Please enter a new password")
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Passwords do not match")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/agent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, password: passwordForm.new }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password updated")
        setPasswordForm({ new: "", confirm: "" })
      } else {
        toast.error(data.error || "Failed to update")
      }
    } catch {
      toast.error("Failed to update")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your agent profile</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            My Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-muted" />
            <p className="mt-1 text-xs text-muted-foreground">Email is set by your agency and cannot be changed</p>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>

          <Separator />

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Commission Rate</p>
              <p className="text-xs text-muted-foreground">Set by your agency</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              {profile.commissionPercent}%
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Referral Code</p>
              <p className="text-xs text-muted-foreground">Your unique recruitment code</p>
            </div>
            <code className="rounded bg-muted px-2 py-1 text-sm">{profile.referralCode}</code>
          </div>

          <Button onClick={saveProfile} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={passwordForm.new}
              onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <Button onClick={changePassword} disabled={saving}>
            <Lock className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
