"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import {
  Search,
  Edit,
  Trash2,
  Loader2,
  Users,
  Plus,
  X,
  Upload,
  ChevronDown,
  Eye,
  FilterX,
  Check,
} from "lucide-react"
import { PageLoader } from "@/components/page-loader"
import { cn, formatCandidateName } from "@/lib/utils"
import { ALL_COUNTRIES } from "@/lib/countries"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidateRow {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  skills: string[]
  status: string
  source: string
  agentId?: string
  currentJobTitle?: string
  currentLocation: string
  createdAt: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  maritalStatus?: string
  currentSalary?: string
  salaryExpectation?: string
  visaValidity?: string
  languages?: string[]
  remarks?: string
  jobCategoryName?: string
  jobSubCategoryName?: string
  cvUrl?: string
}

/** Active job sub-category with parent label for the Add Candidate dropdown */
interface JobSubCategoryOption {
  id: string
  name: string
  categoryId: string
  categoryName: string
}
interface AgentOption { id: string; name: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  fullName: "", email: "", phone: "",
  dateOfBirth: "", gender: "", nationality: "",
  jobSubCategoryIds: [] as string[],   // ← now an array
  currentSalary: "", salaryExpectation: "",
  country: "", city: "",
  maritalStatus: "", visaValidity: "", remarks: "",
  skills: [] as string[],
  languages: [] as string[],
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  available:     { label: "Available",     className: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" },
  under_bidding: { label: "Under Bidding", className: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  interviewed:   { label: "Interviewed",   className: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800" },
  selected:      { label: "Selected",      className: "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800" },
  on_hold:       { label: "On Hold",       className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" },
  placed:        { label: "Placed",        className: "bg-emerald-950/30 text-emerald-200 border border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" },
}

const SOURCE_MAP: Record<string, string> = {
  referral:    "Referral",
  bulk_upload: "Bulk Upload",
  manual:      "Manual",
  link:        "Link",
}

const SKILL_SUGGESTIONS = [
  "React","Node.js","Python","TypeScript","AWS","DevOps","Docker",
  "Machine Learning","SQL","MongoDB","Java","PHP","Flutter","iOS","Android",
  "Project Management","Sales","Marketing","Finance","HR","Logistics",
]

const LANGUAGE_OPTIONS = [
  "English","Arabic","French","Spanish","Hindi","Urdu",
  "Malayalam","Tamil","Tagalog","Bengali","Sinhala","Nepali",
]

const GENDER_OPTIONS   = ["Male", "Female", "Prefer not to say"]
const MARITAL_OPTIONS  = ["Single", "Married", "Divorced", "Widowed"]

// ─── Reusable form primitives ─────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function Field({
  label, required, hint, children, className,
}: {
  label: string; required?: boolean; hint?: string
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground leading-none">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function NativeSelect({
  value, onChange, required, placeholder, children, className,
}: {
  value: string; onChange: (v: string) => void
  required?: boolean; placeholder?: string
  children: React.ReactNode; className?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={cn(
          "appearance-none w-full h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          !value ? "text-muted-foreground" : "text-foreground",
          className,
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  )
}

function TagInput({
  tags, onChange, suggestions = [], placeholder = "Type and press Enter…",
}: {
  tags: string[]; onChange: (t: string[]) => void
  suggestions?: string[]; placeholder?: string
}) {
  const [input, setInput]   = useState("")
  const [open, setOpen]     = useState(false)
  const inputRef            = useRef<HTMLInputElement>(null)
  const containerRef        = useRef<HTMLDivElement>(null)

  const filtered = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  )

  function add(tag: string) {
    const t = tag.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput(""); setOpen(false)
  }
  function remove(tag: string) { onChange(tags.filter(t => t !== tag)) }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter")     { e.preventDefault(); if (input.trim()) add(input) }
    if (e.key === "Backspace" && !input && tags.length) remove(tags[tags.length - 1])
    if (e.key === "Escape")    setOpen(false)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "min-h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5",
          "flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-ring",
        )}
      >
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs font-medium">
            {tag}
            <button type="button" onClick={e => { e.stopPropagation(); remove(tag) }}
              className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-border bg-popover shadow-md py-1 max-h-44 overflow-y-auto">
          {filtered.map(s => (
            <button key={s} type="button"
              onMouseDown={e => { e.preventDefault(); add(s) }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── NEW: Searchable Multi-Select for Job Sub-Categories ──────────────────────

function SubCategoryMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = "Search and select sub-categories…",
  required,
}: {
  options: JobSubCategoryOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Group filtered options by category
  const filtered = options.filter(o => {
    const q = search.toLowerCase()
    return (
      o.name.toLowerCase().includes(q) ||
      o.categoryName.toLowerCase().includes(q)
    )
  })

  const grouped = filtered.reduce<Record<string, JobSubCategoryOption[]>>((acc, o) => {
    if (!acc[o.categoryName]) acc[o.categoryName] = []
    acc[o.categoryName].push(o)
    return acc
  }, {})

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(s => s !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  function removeById(id: string) {
    onChange(selectedIds.filter(s => s !== id))
  }

  function getLabel(id: string) {
    const opt = options.find(o => o.id === id)
    return opt ? opt.name : id
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger box */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setOpen(o => !o)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(o => !o) }}
        className={cn(
          "min-h-9 w-full rounded-md border border-input bg-background px-2.5 py-1.5",
          "flex flex-wrap gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring",
          open && "ring-2 ring-ring",
        )}
      >
        {selectedIds.length === 0 ? (
          <span className="text-sm text-muted-foreground self-center py-0.5">{placeholder}</span>
        ) : (
          selectedIds.map(id => (
            <span
              key={id}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium"
            >
              {getLabel(id)}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeById(id) }}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={cn(
          "ml-auto self-center h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform",
          open && "rotate-180",
        )} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories or roles…"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              onKeyDown={e => { if (e.key === "Escape") { setOpen(false); setSearch("") } }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {Object.keys(grouped).length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No results found</p>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  {/* Category header */}
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground bg-muted/40 sticky top-0">
                    {category}
                  </div>
                  {/* Sub-category items */}
                  {items.map(item => {
                    const isSelected = selectedIds.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); toggle(item.id) }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isSelected && "bg-primary/5",
                        )}
                      >
                        {/* Checkbox indicator */}
                        <span className={cn(
                          "flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-input bg-background",
                        )}>
                          {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                        </span>
                        <span className={cn(isSelected && "font-medium")}>{item.name}</span>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer: count + clear */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">
                {selectedIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden native input for required validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={selectedIds.length ? selectedIds[0] : ""}
          onChange={() => {}}
          className="sr-only"
          aria-hidden
        />
      )}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ firstName = "", lastName = "" }: { firstName?: string; lastName?: string }) {
  const full = formatCandidateName(firstName, lastName)
  const parts = full.split(/\s+/)
  const initials = parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0][0] ?? "").toUpperCase()
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold select-none">
      {initials}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [agentFilter, setAgentFilter]   = useState("all")
  const [agencyId, setAgencyId]     = useState("")

  // Add dialog
  const [addOpen, setAddOpen]       = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [cvFile, setCvFile]         = useState<File | null>(null)
  const [creating, setCreating]     = useState(false)
  const [jobSubCategoryOptions, setJobSubCategoryOptions] = useState<JobSubCategoryOption[]>([])
  const [agents, setAgents]         = useState<AgentOption[]>([])

  // Edit dialog
  const [editCandidate, setEditCandidate] = useState<CandidateRow | null>(null)
  const [editOpen, setEditOpen]     = useState(false)
  const [editSkillTags, setEditSkillTags] = useState<string[]>([])
  const [editLanguageTags, setEditLanguageTags] = useState<string[]>([])
  const [editFullName, setEditFullName] = useState("")
  const [editCountry, setEditCountry] = useState("")
  const [editCity, setEditCity]     = useState("")
  const [editCvFile, setEditCvFile] = useState<File | null>(null)
  const [saving, setSaving]         = useState(false)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: "" })

  // Details side panel
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<CandidateRow | null>(null)

  // helpers
  const setField = (key: keyof typeof EMPTY_FORM) =>
    (value: string | string[]) => setForm(prev => ({ ...prev, [key]: value }))
  const setStr = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setField(key)(e.target.value)

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) return
    const { agencyId: aid } = JSON.parse(user)
    setAgencyId(aid)
    loadCandidates(aid)

    Promise.all([
      fetch("/api/admin/job-categories").then(r => r.json()),
      fetch("/api/admin/job-sub-categories").then(r => r.json()),
    ])
      .then(([catRes, subRes]) => {
        const categories = (catRes.categories || []) as { id: string; name: string; isActive?: boolean }[]
        const catMap = new Map(categories.map(c => [c.id, c]))
        const subs = (subRes.subCategories || []) as {
          id: string
          name: string
          categoryId: string
          isActive?: boolean
        }[]
        const options: JobSubCategoryOption[] = subs
          .filter(s => {
            if (s.isActive === false) return false
            const parent = catMap.get(s.categoryId)
            if (!parent || parent.isActive === false) return false
            return true
          })
          .map(s => {
            const parent = catMap.get(s.categoryId)!
            return {
              id: s.id,
              name: s.name,
              categoryId: s.categoryId,
              categoryName: parent.name,
            }
          })
          .sort((a, b) => {
            const byParent = a.categoryName.localeCompare(b.categoryName)
            if (byParent !== 0) return byParent
            return a.name.localeCompare(b.name)
          })
        setJobSubCategoryOptions(options)
      })
      .catch(console.error)

    fetch(`/api/agency/agents?agencyId=${aid}`).then(r => r.json()).then(d => {
      if (d.success && d.agents) setAgents(d.agents.map((a: any) => ({ id: a.id, name: a.name })))
    }).catch(console.error)
  }, [])

  async function loadCandidates(aid: string) {
    try {
      const res  = await fetch(`/api/agency/candidates?agencyId=${aid}`)
      const data = await res.json()
      if (data.success) setCandidates(data.candidates)
      else toast.error(data.error || "Failed to load candidates")
    } catch { toast.error("Failed to load candidates") }
    finally  { setLoading(false) }
  }

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = candidates.filter(c => {
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      formatCandidateName(c.firstName, c.lastName).toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.currentLocation && c.currentLocation.toLowerCase().includes(q)) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    const matchAgent =
      agentFilter === "all"
        ? true
        : agentFilter === "unassigned"
          ? !c.agentId
          : c.agentId === agentFilter
    return (
      matchSearch &&
      matchAgent &&
      (statusFilter === "all" || c.status === statusFilter) &&
      (sourceFilter === "all" || c.source === sourceFilter)
    )
  })

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    sourceFilter !== "all" ||
    agentFilter !== "all"

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setSourceFilter("all")
    setAgentFilter("all")
  }

  function onAddDialogOpenChange(open: boolean) {
    setAddOpen(open)
    if (open) setSelectedAgentId("")
  }

  // ── Create ──────────────────────────────────────────────────────────────────
  async function handleCreateCandidate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fullName.trim()) { toast.error("Enter the candidate's full name"); return }
    if (!form.email?.trim() || !form.phone?.trim()) {
      toast.error("Email and phone are required")
      return
    }
    if (!form.jobSubCategoryIds.length) { toast.error("Select at least one job sub-category"); return }
    if (!cvFile)             { toast.error("Upload a CV"); return }
    if (!agencyId)           { toast.error("Agency not found. Please log in again."); return }

    setCreating(true)
    try {
      const fd = new FormData()
      const nameParts = form.fullName.trim().split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ")
      const currentLocation = [form.city, form.country].filter(Boolean).join(", ")
      fd.append("firstName", firstName)
      if (lastName) fd.append("lastName", lastName)
      if (form.email) fd.append("email", form.email)
      if (form.phone) fd.append("phone", form.phone)
      if (form.dateOfBirth) fd.append("dateOfBirth", form.dateOfBirth)
      if (form.gender) fd.append("gender", form.gender)
      if (form.nationality) fd.append("nationality", form.nationality)
      if (currentLocation) fd.append("currentLocation", currentLocation)
      if (form.maritalStatus) fd.append("maritalStatus", form.maritalStatus)
      if (form.currentSalary) fd.append("currentSalary", form.currentSalary)
      if (form.salaryExpectation) fd.append("salaryExpectation", form.salaryExpectation)
      if (form.visaValidity) fd.append("visaValidity", form.visaValidity)
      if (form.remarks) fd.append("remarks", form.remarks)
      if (form.languages.length) fd.append("languages", form.languages.join(", "))
      if (form.skills.length)    fd.append("skill", form.skills.join(", "))
      // Send all selected sub-category IDs
      fd.append("jobCategories", JSON.stringify(form.jobSubCategoryIds))
      fd.append("agencyId", agencyId)
      if (selectedAgentId) fd.append("agentId", selectedAgentId)
      fd.append("cvUpload", cvFile)

      const res  = await fetch("/api/agency/manual-candidates", { method: "POST", body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        toast.error(typeof data?.error === "string" ? data.error : "Failed to create candidate")
        return
      }
      toast.success("Candidate created")
      setAddOpen(false); setForm(EMPTY_FORM); setCvFile(null); setSelectedAgentId("")
      loadCandidates(agencyId)
    } catch { toast.error("Failed to create candidate") }
    finally   { setCreating(false) }
  }

  // ── Edit ────────────────────────────────────────────────────────────────────
  function openEdit(c: CandidateRow) {
    setEditCandidate({ ...c })
    setEditSkillTags([...(c.skills ?? [])])
    setEditLanguageTags([...(c.languages ?? [])])
    setEditFullName(formatCandidateName(c.firstName, c.lastName))
    const locParts = (c.currentLocation || "").split(",").map((s: string) => s.trim())
    if (locParts.length >= 2) {
      setEditCity(locParts.slice(0, -1).join(", "))
      setEditCountry(locParts[locParts.length - 1])
    } else {
      setEditCity(locParts[0] || "")
      setEditCountry("")
    }
    setEditCvFile(null)
    setEditOpen(true)
  }

  async function handleSaveEdit() {
    if (!editCandidate) return
    setSaving(true)
    try {
      // Upload new CV first if provided
      let cvUrl = editCandidate.cvUrl
      if (editCvFile) {
        const fd = new FormData()
        fd.append("cvUpload", editCvFile)
        const cvRes  = await fetch(`/api/agency/candidate/${editCandidate.id}/cv`, { method: "POST", body: fd })
        const cvData = await cvRes.json()
        if (!cvRes.ok || !cvData.success) {
          toast.error(cvData.error || "CV upload failed")
          setSaving(false); return
        }
        cvUrl = cvData.cvUrl
      }

      const nameParts = editFullName.trim().split(/\s+/)
      const firstName = nameParts[0] || editCandidate.firstName
      const lastName = nameParts.slice(1).join(" ")
      const currentLocation = [editCity, editCountry].filter(Boolean).join(", ")

      const res = await fetch(`/api/agency/candidate/${editCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email:             editCandidate.email,
          phone:             editCandidate.phone,
          dateOfBirth:       editCandidate.dateOfBirth || "",
          gender:            editCandidate.gender || "",
          nationality:       editCandidate.nationality || "",
          maritalStatus:     editCandidate.maritalStatus || "",
          currentLocation,
          currentSalary:     editCandidate.currentSalary || "",
          salaryExpectation: editCandidate.salaryExpectation || "",
          visaValidity:      editCandidate.visaValidity || "",
          skills:            editSkillTags,
          languages:         editLanguageTags,
          remarks:           editCandidate.remarks || "",
          ...(cvUrl ? { cvUrl } : {}),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Candidate updated")
        setEditOpen(false); loadCandidates(agencyId)
      } else {
        toast.error(data.error || "Update failed")
      }
    } catch { toast.error("Update failed") }
    finally  { setSaving(false) }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    const id = deleteConfirm.id
    try {
      const res  = await fetch(`/api/agency/candidate/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Candidate deleted")
        setCandidates(prev => prev.filter(c => c.id !== id))
      } else { toast.error(data.error || "Delete failed") }
    } catch { toast.error("Delete failed") }
  }

  if (loading) return <PageLoader />

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Candidates{" "}
            <span className="font-normal text-muted-foreground text-lg">({candidates.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your agency candidate database</p>
        </div>
        <Button onClick={() => onAddDialogOpenChange(true)} className="gap-2 h-9">
          <Plus className="h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {/* Filters bar */}
      <Card className="shadow-none">
        <CardContent className="space-y-3 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone, location, skills…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="under_bidding">Under Bidding</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="bulk_upload">Bulk Upload</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 gap-1.5"
                onClick={clearFilters}
              >
                <FilterX className="h-3.5 w-3.5" />
                Clear filters
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span>
            {" "}of{" "}
            <span className="font-medium text-foreground">{candidates.length}</span>
            {" "}candidates
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-none overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <Users className="h-10 w-10 opacity-25" />
              <p className="text-sm font-medium">No candidates found</p>
              <p className="text-xs opacity-60">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Add your first candidate to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {["Name","Job","Location","Skills","Status","Source","Actions"].map(h => (
                      <TableHead key={h}
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9",
                          h === "Actions" && "text-right",
                        )}>
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => {
                    const status = STATUS_MAP[c.status]
                    return (
                      <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar firstName={c.firstName} lastName={c.lastName} />
                            <div>
                              <span className="font-medium text-sm block">{formatCandidateName(c.firstName, c.lastName)}</span>
                              <span className="text-xs text-muted-foreground">{c.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="text-sm leading-tight">
                            {c.jobSubCategoryName ? (
                              <>
                                <span className="font-medium">{c.jobSubCategoryName}</span>
                                {c.jobCategoryName && (
                                  <span className="block text-xs text-muted-foreground">{c.jobCategoryName}</span>
                                )}
                              </>
                            ) : c.jobCategoryName ? (
                              <span className="font-medium">{c.jobCategoryName}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3">{c.currentLocation || "—"}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.skills?.slice(0, 2).map(s => (
                              <Badge key={s} variant="secondary" className="text-xs px-2 py-0 font-normal">{s}</Badge>
                            ))}
                            {(c.skills?.length ?? 0) > 2 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0 font-normal">+{c.skills.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          {status ? (
                            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", status.className)}>
                              {status.label}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground capitalize">{c.status?.replace(/_/g, " ")}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className="text-xs font-normal capitalize">
                            {SOURCE_MAP[c.source] ?? c.source?.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="View details"
                              onClick={() => {
                                setSelected(c)
                                setDetailOpen(true)
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit"
                              onClick={() => openEdit(c)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Delete"
                              onClick={() => setDeleteConfirm({ open: true, id: c.id })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Candidate Modal ─────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Add Candidate</DialogTitle>
              <DialogDescription className="text-xs">Fill in the candidate details and upload their CV.</DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateCandidate} className="px-6 py-5 space-y-7">

            {/* Personal */}
            <section>
              <SectionHeading>Personal details</SectionHeading>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Full name" required className="col-span-2">
                  <Input value={form.fullName} onChange={setStr("fullName")} placeholder="e.g. James Adeyemi" required />
                </Field>
                <Field label="Date of birth">
                  <Input type="date" value={form.dateOfBirth} onChange={setStr("dateOfBirth")} />
                </Field>
                <Field label="Gender">
                  <NativeSelect value={form.gender} onChange={setField("gender")} placeholder="Select gender">
                    {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </NativeSelect>
                </Field>
                <Field label="Nationality">
                  <Input value={form.nationality} onChange={setStr("nationality")} placeholder="e.g. Indian" />
                </Field>
                <Field label="Marital status">
                  <NativeSelect value={form.maritalStatus} onChange={setField("maritalStatus")} placeholder="Select status">
                    {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </NativeSelect>
                </Field>
              </div>
            </section>

            {/* Contact */}
            <section>
              <SectionHeading>Contact</SectionHeading>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Field label="Email" required>
                  <Input type="email" value={form.email} onChange={setStr("email")} placeholder="Enter the candidate's email address" required />
                </Field>
                <Field label="Phone" required>
                  <Input value={form.phone} onChange={setStr("phone")} placeholder="+44 7700 000000" required />
                </Field>
                <Field label="Country">
                  <NativeSelect value={form.country} onChange={setField("country")} placeholder="Select country">
                    {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </NativeSelect>
                </Field>
                <Field label="City">
                  <Input value={form.city} onChange={setStr("city")} placeholder="e.g. Dubai" />
                </Field>
              </div>
            </section>

            {/* Role */}
            <section>
              <SectionHeading>Role & compensation</SectionHeading>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {/* ── NEW: Multi-select with search for sub-categories ── */}
                <Field
                  label="Job sub-categories"
                  required
                  hint="Search and select one or more roles / trades. Grouped by parent category."
                  className="col-span-2"
                >
                  <SubCategoryMultiSelect
                    options={jobSubCategoryOptions}
                    selectedIds={form.jobSubCategoryIds}
                    onChange={ids => setForm(prev => ({ ...prev, jobSubCategoryIds: ids }))}
                    required
                  />
                </Field>
                <Field
                  label="Assign agent"
                  hint="Leave blank to assign to your agency account only."
                >
                  <NativeSelect
                    value={selectedAgentId}
                    onChange={setSelectedAgentId}
                    placeholder="Agency account (no specific agent)"
                  >
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </NativeSelect>
                </Field>
                <Field label="Current salary">
                  <Input value={form.currentSalary} onChange={setStr("currentSalary")} placeholder="e.g. 60,000" />
                </Field>
                <Field label="Salary expectation">
                  <Input value={form.salaryExpectation} onChange={setStr("salaryExpectation")} placeholder="e.g. 75,000" />
                </Field>
                <Field label="Visa validity" className="col-span-2">
                  <Input value={form.visaValidity} onChange={setStr("visaValidity")} placeholder="e.g. Dec 2027 or N/A" />
                </Field>
              </div>
            </section>

            {/* Skills */}
            <section>
              <SectionHeading>Skills & languages</SectionHeading>
              <div className="grid gap-y-4">
                <Field label="Skills" hint="Type a skill and press Enter, or pick from suggestions">
                  <TagInput tags={form.skills} onChange={setField("skills")} suggestions={SKILL_SUGGESTIONS} placeholder="e.g. React, Node.js…" />
                </Field>
                <Field label="Languages" hint="Select or type spoken languages">
                  <TagInput tags={form.languages} onChange={setField("languages")} suggestions={LANGUAGE_OPTIONS} placeholder="e.g. English, Arabic…" />
                </Field>
              </div>
            </section>

            {/* Documents */}
            <section>
              <SectionHeading>Documents & notes</SectionHeading>
              <div className="grid gap-y-4">
                <Field label="CV upload" required hint="PDF, DOC or DOCX · max 10 MB">
                  <label className={cn(
                    "flex items-center gap-3 h-10 w-full rounded-md border border-dashed border-input",
                    "bg-muted/40 hover:bg-muted/70 px-3 cursor-pointer transition-colors text-sm text-muted-foreground",
                  )}>
                    <Upload className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{cvFile ? cvFile.name : "Click to upload CV…"}</span>
                    <input type="file" accept=".pdf,.doc,.docx" required className="sr-only"
                      onChange={e => setCvFile(e.target.files?.[0] ?? null)} />
                  </label>
                </Field>
                <Field label="Remarks">
                  <Input value={form.remarks} onChange={setStr("remarks")} placeholder="Any additional notes…" />
                </Field>
              </div>
            </section>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" className="h-9" disabled={creating} onClick={() => onAddDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="h-9 min-w-[150px] gap-2">
                {creating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><Upload className="h-4 w-4" /> Create Candidate</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Edit Candidate</DialogTitle>
              <DialogDescription className="text-xs">Update candidate information</DialogDescription>
            </DialogHeader>
          </div>

          {editCandidate && (
            <div className="px-6 py-5 space-y-7">

              {/* Personal */}
              <section>
                <SectionHeading>Personal details</SectionHeading>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Full name" required className="col-span-2">
                    <Input value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="e.g. James Adeyemi" />
                  </Field>
                  <Field label="Date of birth">
                    <Input
                      type="date"
                      value={editCandidate.dateOfBirth || ""}
                      onChange={e => setEditCandidate({ ...editCandidate, dateOfBirth: e.target.value })}
                    />
                  </Field>
                  <Field label="Gender">
                    <NativeSelect
                      value={editCandidate.gender || ""}
                      onChange={v => setEditCandidate({ ...editCandidate, gender: v })}
                      placeholder="Select gender"
                    >
                      {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </NativeSelect>
                  </Field>
                  <Field label="Nationality">
                    <Input
                      value={editCandidate.nationality || ""}
                      onChange={e => setEditCandidate({ ...editCandidate, nationality: e.target.value })}
                      placeholder="e.g. Indian"
                    />
                  </Field>
                  <Field label="Marital status">
                    <NativeSelect
                      value={editCandidate.maritalStatus || ""}
                      onChange={v => setEditCandidate({ ...editCandidate, maritalStatus: v })}
                      placeholder="Select status"
                    >
                      {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </NativeSelect>
                  </Field>
                </div>
              </section>

              {/* Contact */}
              <section>
                <SectionHeading>Contact</SectionHeading>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Email" className="col-span-2">
                    <Input
                      type="email"
                      value={editCandidate.email}
                      onChange={e => setEditCandidate({ ...editCandidate, email: e.target.value })}
                      placeholder="candidate@example.com"
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={editCandidate.phone}
                      onChange={e => setEditCandidate({ ...editCandidate, phone: e.target.value })}
                      placeholder="+44 7700 000000"
                    />
                  </Field>
                  <Field label="Country">
                    <NativeSelect value={editCountry} onChange={setEditCountry} placeholder="Select country">
                      {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </NativeSelect>
                  </Field>
                  <Field label="City" className="col-span-2">
                    <Input value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="e.g. Dubai" />
                  </Field>
                </div>
              </section>

              {/* Role & compensation */}
              <section>
                <SectionHeading>Role & compensation</SectionHeading>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Field label="Current salary">
                    <Input
                      value={editCandidate.currentSalary || ""}
                      onChange={e => setEditCandidate({ ...editCandidate, currentSalary: e.target.value })}
                      placeholder="e.g. 60,000"
                    />
                  </Field>
                  <Field label="Salary expectation">
                    <Input
                      value={editCandidate.salaryExpectation || ""}
                      onChange={e => setEditCandidate({ ...editCandidate, salaryExpectation: e.target.value })}
                      placeholder="e.g. 75,000"
                    />
                  </Field>
                  <Field label="Visa validity" className="col-span-2">
                    <Input
                      value={editCandidate.visaValidity || ""}
                      onChange={e => setEditCandidate({ ...editCandidate, visaValidity: e.target.value })}
                      placeholder="e.g. Dec 2027 or N/A"
                    />
                  </Field>
                </div>
              </section>

              {/* Skills & languages */}
              <section>
                <SectionHeading>Skills & languages</SectionHeading>
                <div className="grid gap-y-4">
                  <Field label="Skills" hint="Type a skill and press Enter, or pick from suggestions">
                    <TagInput tags={editSkillTags} onChange={setEditSkillTags} suggestions={SKILL_SUGGESTIONS} />
                  </Field>
                  <Field label="Languages" hint="Select or type spoken languages">
                    <TagInput tags={editLanguageTags} onChange={setEditLanguageTags} suggestions={LANGUAGE_OPTIONS} placeholder="e.g. English, Arabic…" />
                  </Field>
                </div>
              </section>

              {/* Documents */}
              <section>
                <SectionHeading>CV / Documents</SectionHeading>
                <div className="grid gap-y-4">
                  {editCandidate.cvUrl && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Upload className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Current CV:</span>
                      <a
                        href={editCandidate.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline truncate max-w-[260px]"
                      >
                        {editCandidate.cvUrl.split("/").pop()}
                      </a>
                    </div>
                  )}
                  <Field
                    label={editCandidate.cvUrl ? "Replace CV" : "Upload CV"}
                    hint="PDF, DOC or DOCX · max 5 MB"
                  >
                    <label className={cn(
                      "flex items-center gap-3 h-10 w-full rounded-md border border-dashed border-input",
                      "bg-muted/40 hover:bg-muted/70 px-3 cursor-pointer transition-colors text-sm text-muted-foreground",
                    )}>
                      <Upload className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{editCvFile ? editCvFile.name : "Click to upload…"}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={e => setEditCvFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </Field>
                </div>
              </section>

              {/* Notes */}
              <section>
                <SectionHeading>Notes</SectionHeading>
                <Field label="Remarks">
                  <Input
                    value={editCandidate.remarks || ""}
                    onChange={e => setEditCandidate({ ...editCandidate, remarks: e.target.value })}
                    placeholder="Any additional notes…"
                  />
                </Field>
              </section>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button variant="outline" className="h-9" disabled={saving} onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving} className="h-9 min-w-[130px] gap-2">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={open => setDeleteConfirm(prev => ({ ...prev, open }))}
        title="Delete candidate?"
        description="This will permanently remove this candidate from your database. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* ── Details Side Panel ────────────────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open)
        if (!open) setSelected(null)
      }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                Candidate details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Full profile information for this candidate.
              </DialogDescription>
            </DialogHeader>
          </div>

          {selected && (
            <div className="px-6 py-5 space-y-6 text-sm">
              {/* Header summary */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar firstName={selected.firstName} lastName={selected.lastName} />
                  <div>
                    <p className="text-base font-semibold">
                      {formatCandidateName(selected.firstName, selected.lastName)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selected.email}
                    </p>
                    {selected.currentLocation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selected.currentLocation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    {STATUS_MAP[selected.status] ? (
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
                        STATUS_MAP[selected.status].className,
                      )}>
                        {STATUS_MAP[selected.status].label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground capitalize">
                        {selected.status?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs font-normal capitalize">
                      {SOURCE_MAP[selected.source] ?? selected.source?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Added {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>

              {/* Personal / contact */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Personal
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <p className="text-muted-foreground">Date of birth</p>
                      <p className="font-medium">{selected.dateOfBirth || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">{selected.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nationality</p>
                      <p className="font-medium">{selected.nationality || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Marital status</p>
                      <p className="font-medium">{selected.maritalStatus || "—"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Contact
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{selected.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selected.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selected.currentLocation || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & compensation */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Role & compensation
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {(selected.jobSubCategoryName || selected.jobCategoryName) && (
                      <div>
                        <p className="text-muted-foreground">Job</p>
                        <p className="font-medium">
                          {selected.jobSubCategoryName || selected.jobCategoryName}
                          {selected.jobSubCategoryName && selected.jobCategoryName && (
                            <span className="ml-1 text-muted-foreground font-normal">({selected.jobCategoryName})</span>
                          )}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Current salary</p>
                      <p className="font-medium">{selected.currentSalary || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salary expectation</p>
                      <p className="font-medium">{selected.salaryExpectation || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Visa validity</p>
                      <p className="font-medium">{selected.visaValidity || "—"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.languages && selected.languages.length > 0 ? (
                      selected.languages.map(lang => (
                        <Badge key={lang} variant="secondary" className="text-xs px-2 py-0 font-normal">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills && selected.skills.length > 0 ? (
                    selected.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs px-2 py-0 font-normal">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No skills added</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Notes
                </p>
                <p className="text-xs">
                  {selected.remarks || <span className="text-muted-foreground">No additional notes</span>}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}