"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Activity,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Shield,
  Monitor,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  X,
  User,
  Bot,
} from "lucide-react"

interface ActivityLog {
  id: string
  userId?: string
  userName?: string
  userEmail?: string
  userType: string
  entityType: string
  entityId?: string
  action: string
  description: string
  metadata?: Record<string, unknown>
  status: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  total: number
  byStatus: Record<string, number>
  byUserType: Record<string, number>
  byAction: Record<string, number>
  todayCount: number
}

const USER_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  superadmin: { label: "Super Admin", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: Shield },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Shield },
  agency: { label: "Agency", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Building2 },
  agent: { label: "Agent", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", icon: UserCheck },
  company: { label: "Company", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Briefcase },
  candidate: { label: "Candidate", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: User },
  system: { label: "System", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400", icon: Bot },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  success: { label: "Success", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
}

const ENTITY_TYPES = [
  "agency", "agent", "company", "candidate", "demand", "submission",
  "file", "login", "bulk", "subscription", "plan", "settings",
  "bid", "interview", "payment", "notification", "job_category", "system",
]

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function getActionIcon(action: string): React.ElementType {
  if (action.includes("login")) return Monitor
  if (action.includes("register") || action.includes("create")) return Users
  if (action.includes("approve")) return CheckCircle2
  if (action.includes("reject") || action.includes("delete")) return XCircle
  if (action.includes("update") || action.includes("edit")) return RefreshCw
  if (action.includes("upload") || action.includes("bulk")) return Download
  return Activity
}

function getActionColor(action: string): string {
  if (action.includes("login")) return "bg-blue-500"
  if (action.includes("register") || action.includes("create")) return "bg-green-500"
  if (action.includes("approve")) return "bg-emerald-500"
  if (action.includes("reject") || action.includes("spam")) return "bg-red-500"
  if (action.includes("delete") || action.includes("deactivate")) return "bg-red-500"
  if (action.includes("update") || action.includes("edit")) return "bg-amber-500"
  if (action.includes("upload") || action.includes("bulk")) return "bg-purple-500"
  if (action.includes("failed")) return "bg-red-500"
  return "bg-gray-500"
}

export default function ActivityLogsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [stats, setStats] = useState<Stats | null>(null)
  const [actions, setActions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "feed">("feed")

  // Filters
  const [filterUserType, setFilterUserType] = useState<string>("all")
  const [filterEntityType, setFilterEntityType] = useState<string>("all")
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSearch, setFilterSearch] = useState("")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) { router.push("/admin/login"); return }
    const userData = JSON.parse(user)
    if (userData.role !== "super_admin" && userData.role !== "admin") { router.push("/"); return }
    setUserRole(userData.role)
  }, [router])

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" })
      if (filterUserType !== "all") params.set("userType", filterUserType)
      if (filterEntityType !== "all") params.set("entityType", filterEntityType)
      if (filterAction !== "all") params.set("action", filterAction)
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterSearch) params.set("search", filterSearch)
      if (filterStartDate) params.set("startDate", filterStartDate)
      if (filterEndDate) params.set("endDate", filterEndDate)

      const res = await fetch(`/api/admin/activity-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err)
    } finally {
      setLoading(false)
    }
  }, [filterUserType, filterEntityType, filterAction, filterStatus, filterSearch, filterStartDate, filterEndDate])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity-logs/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setActions(data.actions || [])
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }, [])

  useEffect(() => {
    if (userRole) {
      fetchLogs()
      fetchStats()
    }
  }, [userRole, fetchLogs, fetchStats])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchLogs(pagination.page)
    }, 10000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs, pagination.page])

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (filterUserType !== "all") params.set("userType", filterUserType)
    if (filterEntityType !== "all") params.set("entityType", filterEntityType)
    if (filterAction !== "all") params.set("action", filterAction)
    if (filterStatus !== "all") params.set("status", filterStatus)
    if (filterSearch) params.set("search", filterSearch)
    if (filterStartDate) params.set("startDate", filterStartDate)
    if (filterEndDate) params.set("endDate", filterEndDate)

    window.open(`/api/admin/activity-logs/export?${params}`, "_blank")
  }

  const clearFilters = () => {
    setFilterUserType("all")
    setFilterEntityType("all")
    setFilterAction("all")
    setFilterStatus("all")
    setFilterSearch("")
    setFilterStartDate("")
    setFilterEndDate("")
  }

  const hasActiveFilters = filterUserType !== "all" || filterEntityType !== "all" ||
    filterAction !== "all" || filterStatus !== "all" || filterSearch || filterStartDate || filterEndDate

  const groupLogsByDate = (logs: ActivityLog[]) => {
    const groups: Record<string, ActivityLog[]> = {}
    for (const log of logs) {
      const date = new Date(log.createdAt)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday"
      } else {
        key = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(log)
    }
    return groups
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <AdminNav role={userRole ?? undefined} />

          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Activity Logs
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Monitor all platform activities in real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Live" : "Auto-refresh"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "feed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("feed")}
                  className="rounded-r-none"
                >
                  Feed
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  Table
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Logs</p>
                      <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold">{stats.todayCount.toLocaleString()}</p>
                    </div>
                    <Clock className="h-8 w-8 text-emerald-500/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Success</p>
                      <p className="text-2xl font-bold">{(stats.byStatus.success || 0).toLocaleString()}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500/30" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold">{(stats.byStatus.failed || 0).toLocaleString()}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search & Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search logs by description, name, email..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchLogs(1)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-1.5"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-[10px]">!</Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>

              {showFilters && (
                <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t pt-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">User Type</label>
                    <Select value={filterUserType} onValueChange={(v) => { setFilterUserType(v); }}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(USER_TYPE_CONFIG).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Entity</label>
                    <Select value={filterEntityType} onValueChange={(v) => { setFilterEntityType(v); }}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entities</SelectItem>
                        {ENTITY_TYPES.map((et) => (
                          <SelectItem key={et} value={et}>{et.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Action</label>
                    <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); }}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {actions.map((a) => (
                          <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                    <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); }}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
                    <Input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
                    <Input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Activity className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold text-foreground">No activity logs yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Activity will appear here as users interact with the platform
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "feed" ? (
            <FeedView
              logs={logs}
              groupLogsByDate={groupLogsByDate}
              onSelectLog={setSelectedLog}
            />
          ) : (
            <TableView logs={logs} onSelectLog={setSelectedLog} />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Detail
                </DialogTitle>
              </DialogHeader>
              {selectedLog && <LogDetailView log={selectedLog} />}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

function FeedView({
  logs,
  groupLogsByDate,
  onSelectLog,
}: {
  logs: ActivityLog[]
  groupLogsByDate: (logs: ActivityLog[]) => Record<string, ActivityLog[]>
  onSelectLog: (log: ActivityLog) => void
}) {
  const groups = groupLogsByDate(logs)

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([dateLabel, dateLogs]) => (
        <div key={dateLabel}>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground px-2">{dateLabel}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-1">
            {dateLogs.map((log) => (
              <FeedItem key={log.id} log={log} onClick={() => onSelectLog(log)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function FeedItem({ log, onClick }: { log: ActivityLog; onClick: () => void }) {
  const userConfig = USER_TYPE_CONFIG[log.userType] || USER_TYPE_CONFIG.system
  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending
  const ActionIcon = getActionIcon(log.action)
  const actionColor = getActionColor(log.action)

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-border hover:bg-accent/50"
    >
      {/* Action Icon */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${actionColor}`}>
        <ActionIcon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight">
              {log.description}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${userConfig.color}`}>
                {userConfig.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                {log.userName || log.userEmail || "System"}
              </span>
              {log.entityType && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {log.entityType.replace(/_/g, " ")}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">·</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(log.createdAt)}
            </span>
            <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Metadata preview */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground cursor-help">
                  <Info className="h-3 w-3" />
                  {Object.keys(log.metadata).length} fields
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(log.metadata, null, 2).slice(0, 500)}
                </pre>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}

function TableView({ logs, onSelectLog }: { logs: ActivityLog[]; onSelectLog: (log: ActivityLog) => void }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Date & Time</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">User Type</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Name / Email</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Action</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Entity</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Description</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-8"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const userConfig = USER_TYPE_CONFIG[log.userType] || USER_TYPE_CONFIG.system
              const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon

              return (
                <tr
                  key={log.id}
                  onClick={() => onSelectLog(log)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/50 last:border-0"
                >
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[10px] ${userConfig.color}`}>
                      {userConfig.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[140px] truncate">
                    {log.userName || log.userEmail || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs capitalize text-muted-foreground">
                    {log.entityType?.replace(/_/g, " ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs max-w-[220px] truncate">
                    {log.description}
                  </td>
                  <td className="px-3 py-2">
                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function LogDetailView({ log }: { log: ActivityLog }) {
  const userConfig = USER_TYPE_CONFIG[log.userType] || USER_TYPE_CONFIG.system
  const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`flex items-center gap-3 rounded-lg p-3 ${statusConfig.color}`}>
        <StatusIcon className="h-5 w-5" />
        <div>
          <p className="font-medium">{statusConfig.label}</p>
          <p className="text-xs opacity-80">{formatDateTime(log.createdAt)}</p>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">User Type</p>
          <Badge variant="outline" className={userConfig.color}>{userConfig.label}</Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Action</p>
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{log.action}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
          <p>{log.userName || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
          <p>{log.userEmail || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Entity Type</p>
          <p className="capitalize">{log.entityType?.replace(/_/g, " ") || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Entity ID</p>
          <p className="font-mono text-xs">{log.entityId || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">IP Address</p>
          <p className="font-mono text-xs">{log.ipAddress || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">User ID</p>
          <p className="font-mono text-xs">{log.userId || "—"}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
        <p className="text-sm">{log.description}</p>
      </div>

      {/* User Agent */}
      {log.userAgent && log.userAgent !== "unknown" && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">User Agent</p>
          <p className="text-xs text-muted-foreground break-all">{log.userAgent}</p>
        </div>
      )}

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Metadata</p>
          <div className="rounded-lg bg-muted/50 p-3 overflow-x-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
