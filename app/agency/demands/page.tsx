"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Eye, Send, Briefcase, MapPin, Wallet, Users,
  Loader2, Building2, LayoutGrid, LayoutList, Table2,
  Calendar, ChevronRight, TrendingUp, Clock, UserCheck, User,
} from "lucide-react"
import { toast } from "sonner"
import { PageLoader } from "@/components/page-loader"
import { MarketplaceDemandFilterControls } from "@/components/marketplace-demand-filter-controls"
import { cn, distinctEntryPersonName, formatCandidateName } from "@/lib/utils"
import {
  DEFAULT_MARKETPLACE_FILTERS,
  filterAndSortMarketplaceDemands,
  type MarketplaceFilterValues,
} from "@/lib/marketplace-demand-filters"
import {
  candidateMatchesDemandClassification,
  candidateRoleLabelForDemand,
  type CandidateJobClassification,
} from "@/lib/candidate-job-classification"

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "float" | "table"

interface Demand {
  id: string
  companyName: string
  createdByEmployeeName?: string
  jobTitle: string
  description: string
  requirements: string[]
  skills: string[]
  salary?: { min?: number; max?: number; amount?: number; currency: string }
  gender: string
  location: string
  positions: number
  filledPositions: number
  status: string
  deadline: string
  nationality?: string[]
  jobCategoryId?: string
  jobSubCategoryId?: string
  jobCategoryName?: string
  jobSubCategoryName?: string
  joining?: string
  createdAt?: string
}

interface Candidate {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  status: string
  jobCategories?: string[]
  jobCategoryId?: string
  jobCategoryName?: string
  jobSubCategoryId?: string
  jobSubCategoryName?: string
  /** Resolved sub-category IDs (from GET /api/agency/candidates enrichment). */
  subCategoryIds?: string[]
  /** Resolved parent category IDs only. */
  parentCategoryIds?: string[]
}

function candidateClassificationFromRow(c: Candidate): CandidateJobClassification {
  return {
    jobCategoryName: c.jobCategoryName,
    jobSubCategoryName: c.jobSubCategoryName,
    subCategoryIds: c.subCategoryIds ?? [],
    parentCategoryIds: c.parentCategoryIds ?? [],
  }
}

function candidateMatchesDemandForSubmit(c: Candidate, demand: Demand): boolean {
  const hasResolved =
    (c.subCategoryIds && c.subCategoryIds.length > 0) ||
    (c.parentCategoryIds && c.parentCategoryIds.length > 0)
  if (hasResolved) {
    return candidateMatchesDemandClassification(candidateClassificationFromRow(c), demand)
  }
  if (demand.jobSubCategoryId) {
    if (c.jobSubCategoryId === demand.jobSubCategoryId) return true
    if ((c.jobCategories ?? []).includes(demand.jobSubCategoryId)) return true
    if (demand.jobCategoryId && (c.jobCategories ?? []).includes(demand.jobCategoryId)) return true
    return false
  }
  if (demand.jobCategoryId) {
    return c.jobCategoryId === demand.jobCategoryId || (c.jobCategories ?? []).includes(demand.jobCategoryId)
  }
  return false
}

function submitDialogRoleLabel(c: Candidate, demand: Demand): string | undefined {
  const hasResolved =
    (c.subCategoryIds && c.subCategoryIds.length > 0) ||
    (c.parentCategoryIds && c.parentCategoryIds.length > 0)
  if (hasResolved) {
    return candidateRoleLabelForDemand(candidateClassificationFromRow(c), demand)
  }
  if (
    demand.jobSubCategoryId &&
    (c.jobSubCategoryId === demand.jobSubCategoryId ||
      (c.jobCategories ?? []).includes(demand.jobSubCategoryId))
  ) {
    return demand.jobSubCategoryName ?? c.jobSubCategoryName
  }
  if (
    demand.jobCategoryId &&
    (c.jobCategoryId === demand.jobCategoryId || (c.jobCategories ?? []).includes(demand.jobCategoryId))
  ) {
    return c.jobCategoryName ?? demand.jobCategoryName ?? c.jobSubCategoryName
  }
  return c.jobSubCategoryName ?? c.jobCategoryName
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(salary: Demand["salary"]): string {
  if (!salary?.currency) return "—"
  const cur = salary.currency
  if (typeof salary.min === "number" && typeof salary.max === "number")
    return `${cur} ${salary.min.toLocaleString()} – ${salary.max.toLocaleString()}`
  if (typeof salary.amount === "number")
    return `${cur} ${salary.amount.toLocaleString()}`
  return cur
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dot: string; cls: string }> = {
  open:   { label: "Open",   dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
  closed: { label: "Closed", dot: "bg-rose-500",    cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800" },
  paused: { label: "Paused", dot: "bg-amber-500",   cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, dot: "bg-muted-foreground", cls: "bg-muted text-muted-foreground border-border" }
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", cfg.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  )
}

// ─── Fill bar ─────────────────────────────────────────────────────────────────

function FillBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-indigo-500"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{filled}/{total} filled</span>
        <span className="text-xs font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Deadline chip ────────────────────────────────────────────────────────────

function DeadlineChip({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr)
  const urgent = days <= 7
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs",
      urgent ? "text-rose-600 dark:text-rose-400 font-medium" : "text-muted-foreground",
    )}>
      <Calendar className="h-3 w-3 shrink-0" />
      {urgent ? `${days}d left` : new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
    </span>
  )
}

// ─── Truncated text with tooltip ──────────────────────────────────────────────

function TruncatedText({ text, lines = 2, className }: { text: string; lines?: number; className?: string }) {
  const style: React.CSSProperties = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as any,
    WebkitLineClamp: lines,
    overflow: "hidden",
  }
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p style={style} className={cn("cursor-default text-sm leading-relaxed text-muted-foreground", className)}>
            {text}
          </p>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed whitespace-pre-wrap">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Skill chip row with +N overflow ─────────────────────────────────────────

function SkillChips({ skills, max = 3 }: { skills: string[]; max?: number }) {
  const shown = skills.slice(0, max)
  const extra = skills.length - max
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map(s => (
        <Badge key={s} variant="secondary" className="rounded-full text-xs px-2 py-0 font-normal">{s}</Badge>
      ))}
      {extra > 0 && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="rounded-full text-xs px-2 py-0 cursor-default">+{extra}</Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="flex flex-wrap gap-1 max-w-[200px]">
              {skills.slice(max).map(s => (
                <span key={s} className="inline-block rounded-full bg-secondary text-secondary-foreground text-xs px-2 py-0.5">{s}</span>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass, bgClass }: {
  icon: React.ElementType; label: string; value: number; colorClass: string; bgClass: string
}) {
  return (
    <Card className="min-w-0 shadow-none">
      <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10", bgClass)}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colorClass)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">{value}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2 sm:text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Shared: detail dialog ────────────────────────────────────────────────────

function DetailDialog({
  demand,
  open,
  onOpenChange,
}: {
  demand: Demand;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const entryDisplay = distinctEntryPersonName(demand.companyName, demand.createdByEmployeeName)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0 rounded-xl shadow-xl">
        {/* Accessible dialog title for screen readers */}
        <DialogTitle className="sr-only">
          {demand.jobTitle} at {demand.companyName}
        </DialogTitle>

        {/* ===== PREMIUM HEADER ===== */}
        <div className="flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-6 space-y-4">
          {/* Top row: Title and Status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight line-clamp-2 leading-tight">
                {demand.jobTitle}
              </h1>
              <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>{demand.companyName}</span>
              </p>
              {entryDisplay && (
                <p
                  className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"
                  title="Demand entry person"
                >
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {entryDisplay}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={demand.status} />
            </div>
          </div>

          {/* Location and Gender Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-200">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">{demand.location}</span>
            </div>
            {demand.gender && (
              <>
                <div className="h-1 w-1 rounded-full bg-slate-500" />
                <div className="flex items-center gap-2 text-slate-200">
                  <UserCheck className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">{demand.gender}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="px-8 py-7 space-y-7">
            
            {/* ===== KEY METRICS GRID ===== */}
            <div className="grid grid-cols-2 gap-4">
              {/* Salary Card */}
              <div className="group">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-lg border border-blue-200/50 hover:border-blue-300 transition-all">
                  <div className="flex-shrink-0 p-2.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Salary
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {formatSalary(demand.salary)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deadline Card */}
              <div className="group">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-lg border border-amber-200/50 hover:border-amber-300 transition-all">
                  <div className="flex-shrink-0 p-2.5 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Deadline
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(demand.deadline).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Positions Card */}
              <div className="group">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-lg border border-emerald-200/50 hover:border-emerald-300 transition-all">
                  <div className="flex-shrink-0 p-2.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Positions
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {demand.filledPositions} / {demand.positions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gender Card */}
              {demand.gender && (
                <div className="group">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-lg border border-purple-200/50 hover:border-purple-300 transition-all">
                    <div className="flex-shrink-0 p-2.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <UserCheck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Gender
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {demand.gender}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== DESCRIPTION SECTION ===== */}
            {demand.description && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-600"></span>
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap break-words">
                  {demand.description}
                </p>
              </div>
            )}

            {/* ===== REQUIREMENTS SECTION ===== */}
            {demand.requirements && demand.requirements.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-600"></span>
                  Key Requirements
                </h2>
                <ul className="space-y-2">
                  {demand.requirements.map((requirement, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 group/item"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 group-hover/item:scale-125 transition-transform" />
                      <span className="text-sm text-slate-600 group-hover/item:text-slate-900 transition-colors">
                        {requirement}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ===== SKILLS SECTION ===== */}
            {demand.skills && demand.skills.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-600"></span>
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {demand.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200 hover:border-blue-300 hover:from-blue-50 hover:to-slate-50 hover:text-blue-700 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom padding for scrolling */}
            <div className="h-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Shared: submit dialog ────────────────────────────────────────────────────

/** Group candidates by their effective sub-category label, matched group first. */
function groupCandidatesForSubmit(
  candidates: Candidate[],
  demand: Demand,
): Array<{ label: string; isMatch: boolean; candidates: Candidate[] }> {
  // Split matched vs others first
  const matched = candidates.filter(c => candidateMatchesDemandForSubmit(c, demand))
  const others  = candidates.filter(c => !candidateMatchesDemandForSubmit(c, demand))

  const grouped = new Map<string, { isMatch: boolean; candidates: Candidate[] }>()

  for (const c of matched) {
    const label = c.jobSubCategoryName ?? c.jobCategoryName ?? "Other"
    if (!grouped.has(label)) grouped.set(label, { isMatch: true, candidates: [] })
    grouped.get(label)!.candidates.push(c)
  }
  for (const c of others) {
    const label = c.jobSubCategoryName ?? c.jobCategoryName ?? "Other"
    if (!grouped.has(label)) grouped.set(label, { isMatch: false, candidates: [] })
    grouped.get(label)!.candidates.push(c)
  }

  // Sort: matched groups first, then alphabetically within each tier
  return Array.from(grouped.entries())
    .map(([label, g]) => ({ label, ...g }))
    .sort((a, b) => {
      if (a.isMatch !== b.isMatch) return a.isMatch ? -1 : 1
      return a.label.localeCompare(b.label)
    })
}

function SubmitDialog({
  demand, candidates, open, onOpenChange, onSubmit, submitting,
  selected, setSelected,
}: {
  demand: Demand; candidates: Candidate[]; open: boolean
  onOpenChange: (o: boolean) => void; onSubmit: () => void
  submitting: boolean; selected: string[]; setSelected: (ids: string[]) => void
}) {
  const available = candidates.filter(c => c.status === "available")
  const entryDisplay = distinctEntryPersonName(demand.companyName, demand.createdByEmployeeName)
  const groups = groupCandidatesForSubmit(available, demand)
  const hasMatch = groups.some(g => g.isMatch)

  function toggle(id: string, checked: boolean) {
    setSelected(checked ? [...selected, id] : selected.filter(x => x !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-lg max-h-[88vh] p-0 gap-0 rounded-2xl overflow-hidden shadow-2xl">

        {/* ── Header ── */}
        <div className="shrink-0 bg-gradient-to-br from-slate-900 to-slate-800 px-6 pt-5 pb-4 text-white">
          <DialogTitle className="text-base font-bold leading-snug">
            Submit Candidates
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-300">
            for{" "}
            <span className="font-semibold text-white">{demand.jobTitle}</span>
            {" "}at{" "}
            <span className="font-semibold text-white">{demand.companyName}</span>
            {entryDisplay && (
              <span className="block mt-0.5 text-slate-400" title="Demand entry person">
                {entryDisplay}
              </span>
            )}
          </DialogDescription>

          {/* Demand sub-category pill */}
          {(demand.jobSubCategoryName || demand.jobCategoryName) && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-medium text-slate-200">
              <Briefcase className="h-3 w-3 shrink-0 text-blue-300" />
              {demand.jobSubCategoryName ?? demand.jobCategoryName}
            </div>
          )}
        </div>

        {/* ── Scrollable candidate list ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-5">
          {available.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <div className="rounded-2xl bg-muted p-5">
                <Users className="h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">No available candidates</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>

                {/* Section heading */}
                <div className={cn(
                  "flex items-center gap-2 mb-2.5 px-1",
                )}>
                  {group.isMatch && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                  <h3 className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    group.isMatch
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}>
                    {group.label}
                  </h3>
                  {group.isMatch && (
                    <span className="ml-auto text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
                      Best match
                    </span>
                  )}
                  {!group.isMatch && hasMatch && (
                    <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5">
                      Other
                    </span>
                  )}
                </div>

                {/* Candidate rows */}
                <div className="space-y-2">
                  {group.candidates.map(candidate => {
                    const checked = selected.includes(candidate.id)
                    const dimmed = !group.isMatch && hasMatch
                    return (
                      <label
                        key={candidate.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-150 select-none",
                          dimmed
                            ? cn(
                                "border-border/50 bg-muted/20",
                                checked
                                  ? "border-primary/40 bg-primary/5 opacity-80"
                                  : "opacity-50 hover:opacity-70 hover:border-border hover:bg-muted/40",
                              )
                            : checked
                              ? "border-primary bg-primary/8 shadow-sm ring-1 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-sm",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={v => toggle(candidate.id, !!v)}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-semibold text-sm leading-snug",
                            dimmed && !checked && "text-muted-foreground",
                          )}>
                            {formatCandidateName(candidate.firstName, candidate.lastName)}
                          </p>
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div className="mt-1.5">
                              <SkillChips skills={candidate.skills} max={4} />
                            </div>
                          )}
                        </div>
                        {checked && (
                          <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <ChevronRight className="h-3 w-3 text-primary" />
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div className="shrink-0 border-t bg-background px-5 py-4">
          {selected.length > 0 && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              {selected.length} candidate{selected.length !== 1 ? "s" : ""} selected
            </p>
          )}
          <Button
            onClick={onSubmit}
            disabled={selected.length === 0 || submitting}
            className="w-full h-10 gap-2 rounded-xl font-semibold"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              : <><Send className="h-4 w-4" /> Submit {selected.length > 0 ? `${selected.length} ` : ""}Candidate{selected.length !== 1 ? "s" : ""}</>
            }
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DemandsPage() {
  const [demands, setDemands]     = useState<Demand[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading]     = useState(true)
  const [filters, setFilters] = useState<MarketplaceFilterValues>(DEFAULT_MARKETPLACE_FILTERS)
  const [viewMode, setViewMode]   = useState<ViewMode>("grid")
  const [agencyId, setAgencyId]   = useState("")

  // Dialog state
  const [detailTarget, setDetailTarget]   = useState<string | null>(null)
  const [submitTarget, setSubmitTarget]   = useState<string | null>(null)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [submitting, setSubmitting]       = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId: aid } = JSON.parse(user)
    setAgencyId(aid)

    Promise.all([
      fetch("/api/agency/demands").then(r => r.json()),
      fetch(`/api/agency/candidates?agencyId=${aid}`).then(r => r.json()),
    ])
      .then(([dd, cd]) => {
        if (dd.success) setDemands(dd.demands)
        if (cd.success) setCandidates(cd.candidates)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const setFiltersStable = useCallback((next: MarketplaceFilterValues) => {
    setFilters(next)
  }, [])

  const filtered = useMemo(
    () => filterAndSortMarketplaceDemands(demands, filters),
    [demands, filters],
  )

  const openCount      = demands.filter(d => d.status === "open").length
  const totalPositions = demands.reduce((a, d) => a + (d.positions ?? 0), 0)
  const totalFilled    = demands.reduce((a, d) => a + (d.filledPositions ?? 0), 0)

  async function handleSubmit() {
    const demand = demands.find(d => d.id === submitTarget)
    if (!demand || selectedCandidates.length === 0) return
    setSubmitting(true)
    try {
      const res  = await fetch("/api/agency/apply-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandId: demand.id, candidateIds: selectedCandidates, agencyId }),
      })
      const data = await res.json()
      if (data.success) {
        const submitted  = data.results.filter((r: any) => r.status === "submitted").length
        const duplicates = data.results.filter((r: any) => r.status === "duplicate").length
        toast.success(`${submitted} submitted${duplicates ? `, ${duplicates} duplicate(s) skipped` : ""}`)
        setSubmitTarget(null); setSelectedCandidates([])
      } else { toast.error(data.error || "Failed to submit") }
    } catch { toast.error("Failed to submit candidates") }
    finally   { setSubmitting(false) }
  }

  if (loading) return <PageLoader />

  // ─── Shared action buttons per demand ──────────────────────────────────────
  function ActionButtons({ demand }: { demand: Demand }) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3"
          onClick={() => setDetailTarget(demand.id)}
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs px-3"
          disabled={demand.status !== "open"}
          onClick={() => { setSubmitTarget(demand.id); setSelectedCandidates([]) }}
        >
          <Send className="h-3.5 w-3.5" /> Submit
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-w-0 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard icon={Briefcase}   label="Active Demands"   value={openCount}       colorClass="text-primary"        bgClass="bg-primary/10" />
          <StatCard icon={TrendingUp}  label="Total Positions"  value={totalPositions}  colorClass="text-violet-600"     bgClass="bg-violet-50 dark:bg-violet-900/20" />
          <StatCard icon={Users}       label="Positions Filled" value={totalFilled}     colorClass="text-emerald-600"    bgClass="bg-emerald-50 dark:bg-emerald-900/20" />
        </div>
        {/* Filters + view toggle */}
        <Card className="min-w-0 overflow-hidden shadow-none">
          <CardContent className="space-y-4 px-4 py-4">
            <MarketplaceDemandFilterControls
              filters={filters}
              onFiltersChange={setFiltersStable}
              totalCount={demands.length}
              filteredCount={filtered.length}
            />
            <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <span className="mr-auto hidden text-xs text-muted-foreground sm:inline">
                Country matches location text or accepted nationalities
              </span>
              {/* View toggle — icon-only on narrow screens so all modes stay visible */}
              <div className="flex w-full min-w-0 items-center justify-center gap-0.5 self-end rounded-lg border bg-muted/40 p-1 sm:w-auto sm:justify-end">
                {([
                  { mode: "grid"  as ViewMode, Icon: LayoutGrid,  label: "Grid"  },
                  { mode: "float" as ViewMode, Icon: LayoutList,  label: "List"  },
                  { mode: "table" as ViewMode, Icon: Table2,      label: "Table" },
                ] as const).map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    title={label}
                    className={cn(
                      "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:flex-initial sm:px-2.5",
                      viewMode === mode
                        ? "border bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {filtered.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <div className="rounded-2xl bg-muted p-5">
                <Briefcase className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">No demands found</p>
              <p className="text-xs opacity-60">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}

        {/* ══ GRID VIEW ══════════════════════════════════════════════════════ */}
        {viewMode === "grid" && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((demand) => {
              const entryDisplay = distinctEntryPersonName(
                demand.companyName,
                demand.createdByEmployeeName,
              )
              return (
              <Card
                key={demand.id}
                className={cn(
                  "group flex flex-col overflow-hidden shadow-none transition-shadow hover:shadow-md",
                  demand.status !== "open" && "opacity-60",
                )}
              >
                {/* Top accent line */}
                <div className={cn(
                  "h-0.5 w-full",
                  demand.status === "open" ? "bg-primary" : demand.status === "paused" ? "bg-amber-400" : "bg-rose-400",
                )} />

                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-semibold leading-snug line-clamp-1">
                        {demand.jobTitle}
                      </CardTitle>
                      <CardDescription className="mt-0.5 space-y-0.5 text-xs">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{demand.companyName}</span>
                        </span>
                        {entryDisplay && (
                          <span
                            className="flex items-center gap-1 text-muted-foreground"
                            title="Demand entry person"
                          >
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{entryDisplay}</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <StatusBadge status={demand.status} />
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 flex-1">
                  {/* Description – 2-line clamp with tooltip */}
                  <TruncatedText text={demand.description} lines={2} />

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[100px]">{demand.location}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Wallet className="h-3 w-3 shrink-0" />{formatSalary(demand.salary)}
                    </span>
                    <DeadlineChip dateStr={demand.deadline} />
                  </div>

                  <FillBar filled={demand.filledPositions} total={demand.positions} />

                  <SkillChips skills={demand.skills} max={3} />

                  {/* Push actions to bottom */}
                  <div className="mt-auto pt-1">
                    <ActionButtons demand={demand} />
                  </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ══ FLOAT (LIST) VIEW ══════════════════════════════════════════════ */}
        {viewMode === "float" && filtered.length > 0 && (
          <div className="space-y-2.5">
            {filtered.map((demand) => {
              const entryDisplay = distinctEntryPersonName(
                demand.companyName,
                demand.createdByEmployeeName,
              )
              return (
              <Card
                key={demand.id}
                className={cn(
                  "shadow-none overflow-hidden transition-shadow hover:shadow-md",
                  demand.status !== "open" && "opacity-60",
                )}
              >
                {/* Left accent bar */}
                <div className="flex">
                  <div className={cn(
                    "w-0.5 shrink-0",
                    demand.status === "open" ? "bg-primary" : demand.status === "paused" ? "bg-amber-400" : "bg-rose-400",
                  )} />
                  <CardContent className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 flex-1">
                    {/* Icon */}
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="h-4.5 w-4.5" />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm leading-tight">{demand.jobTitle}</p>
                        <StatusBadge status={demand.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3 shrink-0" />{demand.companyName}
                        </span>
                        {entryDisplay && (
                          <span
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                            title="Demand entry person"
                          >
                            <User className="h-3 w-3 shrink-0" />
                            {entryDisplay}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />{demand.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wallet className="h-3 w-3 shrink-0" />{formatSalary(demand.salary)}
                        </span>
                        <DeadlineChip dateStr={demand.deadline} />
                      </div>

                      {/* Description – 1 line */}
                      <TruncatedText text={demand.description} lines={1} />

                      <SkillChips skills={demand.skills} max={4} />
                    </div>

                    {/* Right: fill + actions */}
                    <div className="flex flex-col gap-3 shrink-0 sm:min-w-[180px] sm:items-end">
                      <FillBar filled={demand.filledPositions} total={demand.positions} />
                      <ActionButtons demand={demand} />
                    </div>
                  </CardContent>
                </div>
              </Card>
              )
            })}
          </div>
        )}

        {/* ══ TABLE VIEW ═════════════════════════════════════════════════════ */}
        {viewMode === "table" && filtered.length > 0 && (
          <Card className="min-w-0 overflow-x-auto shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {["Job Title","Company","Location","Salary","Positions","Deadline","Status","Actions"].map(h => (
                    <TableHead
                      key={h}
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9",
                        h === "Actions" && "text-right",
                      )}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((demand) => {
                  const entryDisplay = distinctEntryPersonName(
                    demand.companyName,
                    demand.createdByEmployeeName,
                  )
                  return (
                  <TableRow
                    key={demand.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      demand.status !== "open" && "opacity-60",
                    )}
                  >
                    <TableCell className="py-3 max-w-[180px]">
                      <p className="font-medium text-sm truncate" title={demand.jobTitle}>{demand.jobTitle}</p>
                      <SkillChips skills={demand.skills} max={2} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5 min-w-0 max-w-[140px]">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{demand.companyName}</span>
                        </span>
                        {entryDisplay && (
                          <span
                            className="flex items-center gap-1 text-[11px] text-muted-foreground pl-5"
                            title="Demand entry person"
                          >
                            <User className="h-3 w-3 shrink-0 -ml-4" />
                            <span className="truncate">{entryDisplay}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[100px]">{demand.location}</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatSalary(demand.salary)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="w-24">
                        <FillBar filled={demand.filledPositions} total={demand.positions} />
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <DeadlineChip dateStr={demand.deadline} />
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={demand.status} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end">
                        <ActionButtons demand={demand} />
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Dialogs rendered outside card loops — no duplicate mounts */}
        {demands.map(demand => (
          <span key={demand.id}>
            <DetailDialog
              demand={demand}
              open={detailTarget === demand.id}
              onOpenChange={o => setDetailTarget(o ? demand.id : null)}
            />
            <SubmitDialog
              demand={demand}
              candidates={candidates}
              open={submitTarget === demand.id}
              onOpenChange={o => { setSubmitTarget(o ? demand.id : null); if (!o) setSelectedCandidates([]) }}
              onSubmit={handleSubmit}
              submitting={submitting}
              selected={selectedCandidates}
              setSelected={setSelectedCandidates}
            />
          </span>
        ))}
      </div>
    </TooltipProvider>
  )
}