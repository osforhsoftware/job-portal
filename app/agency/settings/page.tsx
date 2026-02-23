"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  CreditCard,
  Bell,
  Lock,
  Save,
  Upload,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { toast } from "sonner"

export default function SettingsPage() {
  const [agency, setAgency] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agencyId, setAgencyId] = useState("")

  const [profile, setProfile] = useState({ name: "", phone: "", email: "" })
  const [bankDetails, setBankDetails] = useState({ bankName: "", accountNumber: "", iban: "", swiftCode: "" })
  const [notifications, setNotifications] = useState({ email: true, newDemand: true, applicationUpdate: true, paymentReceived: true })
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" })

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId: aid } = JSON.parse(user)
    setAgencyId(aid)

    fetch(`/api/agency/settings?agencyId=${aid}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAgency(data.agency)
          setProfile({ name: data.agency.name || "", phone: data.agency.phone || "", email: data.agency.email || "" })
          if (data.agency.bankDetails) setBankDetails(data.agency.bankDetails)
          if (data.agency.notificationPreferences) setNotifications(data.agency.notificationPreferences)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId, name: profile.name, phone: profile.phone }),
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

  const saveBankDetails = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId, bankDetails }),
      })
      const data = await res.json()
      if (data.success) toast.success("Bank details saved")
      else toast.error("Failed to save")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId, notificationPreferences: notifications }),
      })
      const data = await res.json()
      if (data.success) toast.success("Notification preferences saved")
      else toast.error("Failed to save")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your agency profile and preferences</p>
      </div>

      {/* Agency Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Agency Profile
          </CardTitle>
          <CardDescription>Update your agency information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Agency Name</Label>
            <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-muted" />
            <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm">Upload Logo</Button>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Subscription Plan</p>
              <p className="text-xs text-muted-foreground">Current active plan</p>
            </div>
            <Badge className="capitalize">{agency?.subscriptionPlan || "basic"}</Badge>
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Details
          </CardTitle>
          <CardDescription>Required for commission payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Bank Name</Label>
            <Input value={bankDetails.bankName} onChange={e => setBankDetails(p => ({ ...p, bankName: e.target.value }))} />
          </div>
          <div>
            <Label>Account Number</Label>
            <Input value={bankDetails.accountNumber} onChange={e => setBankDetails(p => ({ ...p, accountNumber: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>IBAN</Label>
              <Input value={bankDetails.iban} onChange={e => setBankDetails(p => ({ ...p, iban: e.target.value }))} />
            </div>
            <div>
              <Label>SWIFT Code</Label>
              <Input value={bankDetails.swiftCode} onChange={e => setBankDetails(p => ({ ...p, swiftCode: e.target.value }))} />
            </div>
          </div>
          <Button onClick={saveBankDetails} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Bank Details"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch checked={notifications.email} onCheckedChange={v => setNotifications(p => ({ ...p, email: v }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">New Demand Alerts</p>
              <p className="text-xs text-muted-foreground">When new job demands are posted</p>
            </div>
            <Switch checked={notifications.newDemand} onCheckedChange={v => setNotifications(p => ({ ...p, newDemand: v }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Application Updates</p>
              <p className="text-xs text-muted-foreground">Status changes on your applications</p>
            </div>
            <Switch checked={notifications.applicationUpdate} onCheckedChange={v => setNotifications(p => ({ ...p, applicationUpdate: v }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Payment Received</p>
              <p className="text-xs text-muted-foreground">When commission payments are made</p>
            </div>
            <Switch checked={notifications.paymentReceived} onCheckedChange={v => setNotifications(p => ({ ...p, paymentReceived: v }))} />
          </div>
          <Button onClick={saveNotifications} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Preferences"}
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
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))} />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>
          <Button
            onClick={() => {
              if (passwordForm.new !== passwordForm.confirm) {
                toast.error("Passwords do not match")
                return
              }
              toast.success("Password change requested (not yet implemented)")
            }}
          >
            <Lock className="mr-2 h-4 w-4" />Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
