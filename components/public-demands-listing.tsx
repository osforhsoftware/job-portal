"use client"

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Briefcase,
  MapPin,
  Wallet,
  Calendar,
  Clock,
  Loader2,
  Send,
  LogIn,
  UserPlus,
  Building2,
  Search,
  Eye,
  Users,
  UserCheck,
  ChevronsUpDown,
  Check,
  Globe,
  Tag,
  FilterX,
  ListFilter,
  ChevronDown,
} from "lucide-react"
import { formatRelativeTime, cn } from "@/lib/utils"
import { toast } from "sonner"
import { BENEFITS } from "@/lib/job-config"
import type { BenefitType } from "@/lib/job-config"
import { ALL_COUNTRIES } from "@/lib/countries"
import {
  countActiveMarketplaceFilters,
  filterAndSortMarketplaceDemands,
  type MarketplaceFilterValues,
  type MarketplaceSortMode,
} from "@/lib/marketplace-demand-filters"

/** URL query keys owned by this page (others e.g. `redirect` are preserved). */
const FILTER_QUERY_KEYS = [
  "q",
  "category",
  "sub",
  "country",
  "join",
  "sort",
  "gender",
  "state",
  "city",
] as const

type PublicDemand = {
  id: string
  jobTitle: string
  description: string
  skills: string[]
  requirements: string[]
  salary: {
    amount?: number
    min?: number
    max?: number
    currency: string
  }
  location: string
  deadline: string
  createdAt: string
  joining: string
  companyName: string
  quantity: number
  filledPositions: number
  status: string
  gender?: string
  nationality?: string[]
  benefits?: BenefitType[]
  dutyHoursPerDay?: number
  breakTimeHours?: number
  dayOffPerMonth?: number
  timeRemark?: string
  shiftStartTime?: string
  shiftEndTime?: string
  otherBenefitNote?: string
  jobCategoryId?: string
  jobSubCategoryId?: string
  jobCategoryName?: string
  jobSubCategoryName?: string
}

function formatSalary(s: PublicDemand["salary"] | undefined): string {
  if (!s?.currency) return "—"
  const cur = s.currency
  const n = (x: number) => x.toLocaleString("en-GB")
  if (typeof s.min === "number" && typeof s.max === "number")
    return `${cur} ${n(s.min)} – ${n(s.max)}`
  if (typeof s.amount === "number" && s.amount > 0)
    return `${cur} ${n(s.amount)}`
  return cur
}

function benefitLabel(v: BenefitType): string {
  return BENEFITS.find((b) => b.value === v)?.label ?? v
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
}

/** Same output on server and client (fixed locale). */
function formatDateEnGB(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", DATE_FMT)
}

/**
 * Relative "time ago" uses `Date.now()`, which differs between SSR and the
 * browser — hydrate with a fixed date first, then update after mount.
 */
function SafeRelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => formatDateEnGB(iso))
  useEffect(() => {
    setLabel(formatRelativeTime(iso))
  }, [iso])
  return <span>{label}</span>
}

type JobCategoryRow = {
  id: string
  name: string
  emoji?: string
}

type JobSubCategoryRow = {
  id: string
  categoryId: string
  name: string
}

function PublicDemandsListingInner({
  pageTitle,
  pageSubtitle,
  redirectPath,
}: {
  pageTitle: string
  pageSubtitle: string
  redirectPath: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [demands, setDemands] = useState<PublicDemand[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{
    id?: string
    role?: string
    candidateId?: string
  } | null>(null)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  /** Defaults must match SSR — URL is applied in useEffect to avoid hydration mismatches. */
  const [redirectTarget, setRedirectTarget] = useState(redirectPath)
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [stateFilter, setStateFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [subCategoryFilter, setSubCategoryFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [joiningFilter, setJoiningFilter] = useState("all")
  const [sortMode, setSortMode] = useState<MarketplaceSortMode>("newest")

  const [jobCategories, setJobCategories] = useState<JobCategoryRow[]>([])
  const [subCategories, setSubCategories] = useState<JobSubCategoryRow[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [subsLoading, setSubsLoading] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailDemand, setDetailDemand] = useState<PublicDemand | null>(null)
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false)

  const urlSyncSkip = useRef(true)

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "")
    setGenderFilter(searchParams.get("gender") ?? "all")
    setStateFilter(searchParams.get("state") ?? "")
    {
      const cityParam = searchParams.get("city")
      const locLegacy = searchParams.get("loc")
      setCityFilter(
        cityParam !== null ? cityParam : (locLegacy ?? ""),
      )
    }
    setCategoryFilter(searchParams.get("category") ?? "all")
    setSubCategoryFilter(searchParams.get("sub") ?? "all")
    setCountryFilter(searchParams.get("country") ?? "all")
    setJoiningFilter(searchParams.get("join") ?? "all")
    const s = searchParams.get("sort")
    setSortMode(
      s === "deadline" || s === "salary_desc" || s === "newest"
        ? s
        : "newest",
    )
    const r = searchParams.get("redirect")
    setRedirectTarget(r?.trim() ? r : redirectPath)
  }, [searchParams, redirectPath])

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDemands(data.jobs || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/job-categories")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.categories) return
        setJobCategories(
          data.categories.map(
            (c: { id: string; name: string; emoji?: string }) => ({
              id: c.id,
              name: c.name,
              emoji: c.emoji,
            }),
          ),
        )
      })
      .catch(() => {
        if (!cancelled) setJobCategories([])
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (categoryFilter === "all") {
      setSubCategories([])
      return
    }
    let cancelled = false
    setSubsLoading(true)
    fetch(
      `/api/job-sub-categories?categoryId=${encodeURIComponent(categoryFilter)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.subCategories) return
        setSubCategories(
          data.subCategories.map(
            (s: { id: string; categoryId: string; name: string }) => ({
              id: s.id,
              categoryId: s.categoryId,
              name: s.name,
            }),
          ),
        )
      })
      .catch(() => {
        if (!cancelled) setSubCategories([])
      })
      .finally(() => {
        if (!cancelled) setSubsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [categoryFilter])

  useEffect(() => {
    if (categoryFilter === "all" && subCategoryFilter !== "all") {
      setSubCategoryFilter("all")
    }
    if (
      subCategoryFilter !== "all" &&
      subCategories.length > 0 &&
      !subCategories.some((s) => s.id === subCategoryFilter)
    ) {
      setSubCategoryFilter("all")
    }
  }, [categoryFilter, subCategoryFilter, subCategories])

  const syncFiltersToUrl = useCallback(() => {
    const next = new URLSearchParams()
    const filterKeysSet = new Set<string>(FILTER_QUERY_KEYS)
    searchParams.forEach((value, key) => {
      if (key === "loc") return
      if (!filterKeysSet.has(key)) next.set(key, value)
    })
    if (search.trim()) next.set("q", search.trim())
    if (genderFilter !== "all") next.set("gender", genderFilter)
    if (stateFilter.trim()) next.set("state", stateFilter.trim())
    if (cityFilter.trim()) next.set("city", cityFilter.trim())
    if (categoryFilter !== "all") next.set("category", categoryFilter)
    if (subCategoryFilter !== "all") next.set("sub", subCategoryFilter)
    if (countryFilter !== "all") next.set("country", countryFilter)
    if (joiningFilter !== "all") next.set("join", joiningFilter)
    if (sortMode !== "newest") next.set("sort", sortMode)

    const qs = next.toString()
    const prev = searchParams.toString()
    if (qs !== prev) {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }
  }, [
    searchParams,
    router,
    pathname,
    search,
    genderFilter,
    stateFilter,
    cityFilter,
    categoryFilter,
    subCategoryFilter,
    countryFilter,
    joiningFilter,
    sortMode,
  ])

  useEffect(() => {
    if (urlSyncSkip.current) {
      urlSyncSkip.current = false
      return
    }
    const t = window.setTimeout(syncFiltersToUrl, 280)
    return () => window.clearTimeout(t)
  }, [syncFiltersToUrl])

  const marketplaceFilters = useMemo((): MarketplaceFilterValues => {
    return {
      search,
      genderFilter,
      stateFilter,
      cityFilter,
      categoryFilter,
      subCategoryFilter,
      countryFilter,
      joiningFilter,
      sortMode,
    }
  }, [
    search,
    genderFilter,
    stateFilter,
    cityFilter,
    categoryFilter,
    subCategoryFilter,
    countryFilter,
    joiningFilter,
    sortMode,
  ])

  const activeFilterCount = useMemo(
    () => countActiveMarketplaceFilters(marketplaceFilters),
    [marketplaceFilters],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)
    const hasQueryFilter =
      FILTER_QUERY_KEYS.some((k) => {
        const v = sp.get(k)
        return (
          v != null &&
          v !== "" &&
          v !== "all" &&
          v !== "newest"
        )
      }) ||
      (sp.get("loc") != null && sp.get("loc") !== "")
    if (hasQueryFilter) setFiltersPanelOpen(true)
  }, [])

  const filtered = useMemo(
    () => filterAndSortMarketplaceDemands(demands, marketplaceFilters),
    [demands, marketplaceFilters],
  )

  const resetFilters = () => {
    setSearch("")
    setGenderFilter("all")
    setStateFilter("")
    setCityFilter("")
    setCategoryFilter("all")
    setSubCategoryFilter("all")
    setCountryFilter("all")
    setJoiningFilter("all")
    setSortMode("newest")
    setFiltersPanelOpen(false)
  }

  const openDetail = (d: PublicDemand) => {
    setDetailDemand(d)
    setDetailOpen(true)
  }

  const handleApply = async (jobId: string) => {
    if (!user) {
      router.push(`/login/candidate?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }
    if (user.role !== "candidate") {
      toast.error("Please log in as a candidate to apply")
      router.push(`/login/candidate?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }
    const candidateId = user.candidateId ?? user.id
    if (!candidateId) {
      toast.error("Please complete your profile first")
      router.push("/register/candidate")
      return
    }

    setApplyingId(jobId)
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandId: jobId, candidateId }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(
          "Application submitted! The company will review your profile.",
        )
        setDemands((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, filledPositions: j.filledPositions + 1 }
              : j,
          ),
        )
        setDetailDemand((prev) =>
          prev && prev.id === jobId
            ? { ...prev, filledPositions: prev.filledPositions + 1 }
            : prev,
        )
      } else {
        toast.error(data.error || "Failed to apply")
      }
    } catch {
      toast.error("Failed to submit application")
    } finally {
      setApplyingId(null)
    }
  }

  const isCandidate = user?.role === "candidate"
  const candidateId = user?.candidateId ?? user?.id

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="site-container py-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {pageTitle}
            </h1>
            <p className="mt-2 text-muted-foreground">{pageSubtitle}</p>
          </div>

          {!loading && demands.length > 0 && (
            <div className="mb-6 space-y-4">
              <Collapsible
                open={filtersPanelOpen}
                onOpenChange={setFiltersPanelOpen}
                className="space-y-0"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {filtered.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {demands.length}
                    </span>{" "}
                    open demands
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-dashed"
                        aria-expanded={filtersPanelOpen}
                      >
                        <ListFilter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-5 min-w-5 justify-center px-1.5 text-[10px]"
                          >
                            {activeFilterCount}
                          </Badge>
                        )}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 shrink-0 opacity-70 transition-transform duration-200",
                            filtersPanelOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 gap-1.5 text-muted-foreground h-9"
                      onClick={resetFilters}
                      disabled={activeFilterCount === 0}
                    >
                      <FilterX className="h-4 w-4" />
                      Clear all
                    </Button>
                  </div>
                </div>

              <CollapsibleContent className="overflow-hidden">
                <div className="grid gap-3 border-t border-border/60 pt-4 mt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="relative min-w-0 sm:col-span-2 lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search title, company, location, skills, category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    aria-label="Search demands"
                  />
                </div>

                <div className="col-span-full space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="pub-mf-country" className="text-xs text-muted-foreground">
                        Country
                      </Label>
                      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="pub-mf-country"
                            variant="outline"
                            role="combobox"
                            aria-expanded={countryOpen}
                            className="h-9 w-full justify-between font-normal"
                          >
                            <span className="flex min-w-0 items-center gap-2 truncate">
                              <Globe className="h-4 w-4 shrink-0 opacity-70" />
                              {countryFilter === "all"
                                ? "All countries"
                                : countryFilter}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[min(100vw-2rem,380px)] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search country…" />
                            <CommandList>
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="all-countries"
                                  onSelect={() => {
                                    setCountryFilter("all")
                                    setCountryOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      countryFilter === "all"
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  All countries
                                </CommandItem>
                                {ALL_COUNTRIES.map((country) => (
                                  <CommandItem
                                    key={country}
                                    value={country}
                                    onSelect={() => {
                                      setCountryFilter(country)
                                      setCountryOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        countryFilter === country
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {country}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pub-mf-state" className="text-xs text-muted-foreground">
                        State / Region
                      </Label>
                      <Input
                        id="pub-mf-state"
                        placeholder="e.g. Dubai, California"
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="h-9"
                        autoComplete="address-level1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pub-mf-city" className="text-xs text-muted-foreground">
                        City
                      </Label>
                      <Input
                        id="pub-mf-city"
                        placeholder="e.g. Abu Dhabi"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="h-9"
                        autoComplete="address-level2"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    State and city match text inside each job&apos;s location field. Country also uses accepted nationalities.
                  </p>
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger
                    className="w-full"
                    disabled={categoriesLoading}
                  >
                    <SelectValue placeholder="Job category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {jobCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.emoji ? `${c.emoji} ` : ""}
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={subCategoryFilter}
                  onValueChange={setSubCategoryFilter}
                  disabled={categoryFilter === "all" || subsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        categoryFilter === "all"
                          ? "Pick a category first"
                          : "Sub-category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sub-categories</SelectItem>
                    {subCategories.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={joiningFilter}
                  onValueChange={setJoiningFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any start</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortMode}
                  onValueChange={(v) => setSortMode(v as MarketplaceSortMode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="deadline">Deadline soonest</SelectItem>
                    <SelectItem value="salary_desc">Salary (high first)</SelectItem>
                  </SelectContent>
                </Select>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Country matches job location text or accepted nationalities. Share
                  this view with filters in the URL (bookmark after filtering).
                </p>
              </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : demands.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No open demands yet</p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for new opportunities
                </p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="font-medium">No demands match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing search or using &quot;Clear all filters&quot;
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job) => (
                <Card
                  key={job.id}
                  className="group flex flex-col border-border/70 transition-all duration-200 hover:border-primary/40 hover:shadow-lg"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 font-semibold text-foreground">
                          {job.jobTitle}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{job.companyName}</span>
                        </p>
                        {(job.jobCategoryName || job.jobSubCategoryName) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.jobCategoryName && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-normal"
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {job.jobCategoryName}
                              </Badge>
                            )}
                            {job.jobSubCategoryName && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-normal"
                              >
                                {job.jobSubCategoryName}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-3">
                    {job.description && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {job.description}
                      </p>
                    )}

                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 4).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {s}
                          </Badge>
                        ))}
                        {job.skills.length > 4 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{job.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {formatSalary(job.salary) !== "—" && (
                        <span className="flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          {formatSalary(job.salary)}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      {job.gender && (
                        <span className="flex items-center gap-1 capitalize">
                          <UserCheck className="h-3 w-3" />
                          {job.gender}
                        </span>
                      )}
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateEnGB(job.deadline)}
                        </span>
                      )}
                      {job.joining && (
                        <span className="flex items-center gap-1 capitalize">
                          {job.joining}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <SafeRelativeTime iso={job.createdAt} />
                      <span className="text-muted-foreground/70">·</span>
                      <span>
                        {job.filledPositions}/{job.quantity} filled
                      </span>
                    </div>

                    <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 sm:flex-1"
                        onClick={() => openDetail(job)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button
                        className="w-full gap-2 sm:flex-1"
                        size="sm"
                        onClick={() => handleApply(job.id)}
                        disabled={applyingId === job.id}
                      >
                        {applyingId === job.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : !user ? (
                          <>
                            <LogIn className="h-3.5 w-3.5" />
                            Login to Apply
                          </>
                        ) : !isCandidate ? (
                          <>
                            <LogIn className="h-3.5 w-3.5" />
                            Login as Candidate
                          </>
                        ) : !candidateId ? (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            Complete Profile
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Apply
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!user && !loading && demands.length > 0 && (
            <div className="mt-8 flex justify-center gap-2 text-sm text-muted-foreground">
              <span>New here?</span>
              <Link
                href={`/register/candidate?redirect=${encodeURIComponent(redirectTarget)}`}
                className="font-medium text-primary hover:underline"
              >
                Create profile
              </Link>
              <span>to apply</span>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {detailDemand && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left text-xl leading-snug">
                  {detailDemand.jobTitle}
                </DialogTitle>
                <p className="text-left text-sm text-muted-foreground">
                  {detailDemand.companyName}
                </p>
                {(detailDemand.jobCategoryName ||
                  detailDemand.jobSubCategoryName) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detailDemand.jobCategoryName && (
                      <Badge variant="outline">{detailDemand.jobCategoryName}</Badge>
                    )}
                    {detailDemand.jobSubCategoryName && (
                      <Badge variant="secondary">
                        {detailDemand.jobSubCategoryName}
                      </Badge>
                    )}
                  </div>
                )}
              </DialogHeader>

              <div className="space-y-6 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Salary
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatSalary(detailDemand.salary)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Deadline
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatDateEnGB(detailDemand.deadline)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Positions
                    </p>
                    <p className="mt-1 flex items-center gap-2 font-semibold">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {detailDemand.filledPositions} / {detailDemand.quantity}{" "}
                      filled
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Location &amp; gender
                    </p>
                    <p className="mt-1 font-semibold">
                      {detailDemand.location || "—"}
                      {detailDemand.gender ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {detailDemand.gender}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                {detailDemand.description && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Description
                    </h3>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                      {detailDemand.description}
                    </p>
                  </div>
                )}

                {detailDemand.requirements?.length ? (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Requirements
                    </h3>
                    <ul className="list-inside list-disc space-y-1.5 text-foreground/90">
                      {detailDemand.requirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailDemand.skills?.length ? (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {detailDemand.skills.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(detailDemand.dutyHoursPerDay != null ||
                  detailDemand.breakTimeHours != null ||
                  detailDemand.dayOffPerMonth != null ||
                  detailDemand.shiftStartTime ||
                  detailDemand.shiftEndTime ||
                  detailDemand.timeRemark) && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Schedule
                    </h3>
                    <ul className="space-y-1 text-foreground/90">
                      {detailDemand.dutyHoursPerDay != null && (
                        <li>
                          Duty: {detailDemand.dutyHoursPerDay} h / day
                        </li>
                      )}
                      {detailDemand.breakTimeHours != null && (
                        <li>Break: {detailDemand.breakTimeHours} h</li>
                      )}
                      {detailDemand.dayOffPerMonth != null && (
                        <li>Days off: {detailDemand.dayOffPerMonth} / month</li>
                      )}
                      {(detailDemand.shiftStartTime ||
                        detailDemand.shiftEndTime) && (
                        <li>
                          Shift: {detailDemand.shiftStartTime ?? "?"} –{" "}
                          {detailDemand.shiftEndTime ?? "?"}
                        </li>
                      )}
                      {detailDemand.timeRemark && (
                        <li className="whitespace-pre-wrap">
                          {detailDemand.timeRemark}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {detailDemand.benefits && detailDemand.benefits.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Benefits
                    </h3>
                    <ul className="list-inside list-disc space-y-1">
                      {detailDemand.benefits.map((b) => (
                        <li key={b}>{benefitLabel(b)}</li>
                      ))}
                    </ul>
                    {detailDemand.otherBenefitNote && (
                      <p className="mt-2 text-muted-foreground">
                        {detailDemand.otherBenefitNote}
                      </p>
                    )}
                  </div>
                )}

                {detailDemand.nationality && detailDemand.nationality.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Nationality
                    </h3>
                    <p>{detailDemand.nationality.join(", ")}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
                  <Button
                    variant="outline"
                    className="sm:flex-1"
                    onClick={() => setDetailOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    className="sm:flex-1"
                    onClick={() => handleApply(detailDemand.id)}
                    disabled={applyingId === detailDemand.id}
                  >
                    {applyingId === detailDemand.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : !user ? (
                      <>
                        <LogIn className="h-4 w-4" />
                        Login to Apply
                      </>
                    ) : !isCandidate ? (
                      "Login as candidate"
                    ) : !candidateId ? (
                      "Complete profile"
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Apply now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function PublicDemandsListing(props: {
  pageTitle: string
  pageSubtitle: string
  redirectPath: string
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
          <Footer />
        </div>
      }
    >
      <PublicDemandsListingInner {...props} />
    </Suspense>
  )
}
