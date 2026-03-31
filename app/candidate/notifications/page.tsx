"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CandidateHubNav } from "@/components/candidate/candidate-hub-nav"
import {
  Bell,
  CheckCheck,
  Loader2,
  LogIn,
  RefreshCw,
  Briefcase,
  FileCheck,
  Megaphone,
  CreditCard,
  MessageSquare,
  Shield,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationItem {
  id: string
  type:
    | "new_submission"
    | "application_status"
    | "new_demand"
    | "approval"
    | "payment"
    | "message"
    | "system"
    | string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

function formatTime(createdAt: string): string {
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

function notificationIcon(type: string) {
  const cls = "h-4 w-4 shrink-0"
  switch (type) {
    case "application_status":
      return <FileCheck className={cls} />
    case "new_submission":
    case "new_demand":
      return <Briefcase className={cls} />
    case "approval":
      return <Shield className={cls} />
    case "payment":
      return <CreditCard className={cls} />
    case "message":
      return <MessageSquare className={cls} />
    case "system":
    default:
      return <Megaphone className={cls} />
  }
}

export default function CandidateNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [entityId, setEntityId] = useState("")
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all")

  const load = useCallback(async (id: string) => {
    const r = await fetch(
      `/api/notifications?role=candidate&entityId=${encodeURIComponent(id)}&limit=50`
    )
    const data = await r.json()
    if (data.success && data.notifications) {
      setNotifications(data.notifications)
    } else {
      setNotifications([])
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (!stored) {
      setLoading(false)
      return
    }
    try {
      const u = JSON.parse(stored)
      const id = u.candidateId ?? u.id
      if (!id) {
        setLoading(false)
        return
      }
      setEntityId(id)
      load(id).finally(() => setLoading(false))
    } catch {
      setLoading(false)
    }
  }, [load])

  const refresh = async () => {
    if (!entityId) return
    setRefreshing(true)
    try {
      await load(entityId)
    } finally {
      setRefreshing(false)
    }
  }

  const markAllRead = async () => {
    if (!entityId) return
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, role: "candidate", entityId }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // ignore
    }
  }

  const markOneRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      // ignore
    }
  }

  const filtered = useMemo(() => {
    if (filterTab === "unread") return notifications.filter((n) => !n.read)
    return notifications
  }, [notifications, filterTab])

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!loading && !entityId) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <CandidateHubNav className="mb-6" />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <LogIn className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Sign in to see notifications</h1>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Application updates, job alerts, and system messages will appear here.
              </p>
            </div>
            <Button asChild>
              <Link href="/login/candidate?redirect=/candidate/notifications">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Stay on top of applications, shortlists, and platform updates.
        </p>
      </div>

      <CandidateHubNav className="mb-6" />

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5 text-primary" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="secondary" className="font-normal">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => refresh()}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="bg-transparent" onClick={markAllRead}>
                <CheckCheck className="mr-1 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={filterTab}
              onValueChange={(v) => setFilterTab(v as "all" | "unread")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2 sm:w-[220px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex flex-col gap-0 divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse px-4 py-4">
                  <div className="h-4 max-w-md rounded bg-muted sm:w-2/3" />
                  <div className="mt-2 h-3 max-w-lg rounded bg-muted sm:w-full" />
                  <div className="mt-2 h-3 w-24 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">
                {filterTab === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterTab === "unread"
                  ? "You’re all caught up. Try showing all notifications."
                  : "When recruiters act on your profile or bids, you’ll see it here."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((n) => {
                const Row = (
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors",
                      n.link && "cursor-pointer hover:bg-muted/50",
                      !n.read && "bg-primary/[0.06]"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background",
                        !n.read ? "border-primary/20 text-primary" : "text-muted-foreground"
                      )}
                    >
                      {notificationIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{n.title}</span>
                        {!n.read && (
                          <span className="inline-block h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.message}</p>
                      <span className="mt-1 text-xs text-muted-foreground">{formatTime(n.createdAt)}</span>
                    </div>
                  </div>
                )

                if (n.link) {
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.link}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => {
                          if (!n.read) void markOneRead(n.id)
                        }}
                      >
                        {Row}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => {
                        if (!n.read) void markOneRead(n.id)
                      }}
                    >
                      {Row}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
