"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
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
  Search,
  ChevronsUpDown,
  Check,
  Globe,
  FilterX,
  ListFilter,
  ChevronDown,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ALL_COUNTRIES } from "@/lib/countries"
import type {
  MarketplaceFilterValues,
  MarketplaceSortMode,
} from "@/lib/marketplace-demand-filters"
import {
  DEFAULT_MARKETPLACE_FILTERS,
  countActiveMarketplaceFilters,
} from "@/lib/marketplace-demand-filters"

type JobCategoryRow = { id: string; name: string; emoji?: string }
type JobSubCategoryRow = { id: string; categoryId: string; name: string }

type Props = {
  filters: MarketplaceFilterValues
  onFiltersChange: (next: MarketplaceFilterValues) => void
  totalCount: number
  filteredCount: number
  className?: string
  /** Start with the filter panel expanded (e.g. deep-linked URL). */
  defaultOpen?: boolean
}

export function MarketplaceDemandFilterControls({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  className,
  defaultOpen = false,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(defaultOpen)
  const [jobCategories, setJobCategories] = useState<JobCategoryRow[]>([])
  const [subCategories, setSubCategories] = useState<JobSubCategoryRow[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [subsLoading, setSubsLoading] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)

  const activeFilterCount = useMemo(
    () => countActiveMarketplaceFilters(filters),
    [filters],
  )

  const patch = (partial: Partial<MarketplaceFilterValues>) => {
    onFiltersChange({ ...filters, ...partial })
  }

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
    if (filters.categoryFilter === "all") {
      setSubCategories([])
      return
    }
    let cancelled = false
    setSubsLoading(true)
    fetch(
      `/api/job-sub-categories?categoryId=${encodeURIComponent(filters.categoryFilter)}`,
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
  }, [filters.categoryFilter])

  useEffect(() => {
    if (filters.categoryFilter === "all" && filters.subCategoryFilter !== "all") {
      onFiltersChange({ ...filters, subCategoryFilter: "all" })
    }
  }, [filters.categoryFilter, filters.subCategoryFilter, filters, onFiltersChange])

  useEffect(() => {
    if (
      filters.subCategoryFilter !== "all" &&
      subCategories.length > 0 &&
      !subCategories.some((s) => s.id === filters.subCategoryFilter)
    ) {
      onFiltersChange({ ...filters, subCategoryFilter: "all" })
    }
  }, [filters, subCategories, onFiltersChange])

  const reset = () => {
    onFiltersChange({ ...DEFAULT_MARKETPLACE_FILTERS })
    setFiltersOpen(false)
  }

  return (
    <Collapsible
      open={filtersOpen}
      onOpenChange={setFiltersOpen}
      className={cn("space-y-0", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span>{" "}
          demands
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-dashed"
              aria-expanded={filtersOpen}
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
                  filtersOpen && "rotate-180",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-muted-foreground h-9"
            onClick={reset}
            disabled={activeFilterCount === 0}
          >
            <FilterX className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <CollapsibleContent className="overflow-hidden transition-[height] duration-200 ease-out data-[state=closed]:border-t-0">
        <div className="grid gap-3 border-t border-border/60 pt-4 mt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="relative min-w-0 sm:col-span-2 lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search title, company, location, skills, category…"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            className="pl-9 h-9"
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
              <Label htmlFor="mf-country" className="text-xs text-muted-foreground">
                Country
              </Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="mf-country"
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="h-9 w-full justify-between font-normal"
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate">
                      <Globe className="h-4 w-4 shrink-0 opacity-70" />
                      {filters.countryFilter === "all"
                        ? "All countries"
                        : filters.countryFilter}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[min(100vw-2rem,380px)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search country…" />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all-countries"
                          onSelect={() => {
                            patch({ countryFilter: "all" })
                            setCountryOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.countryFilter === "all"
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
                              patch({ countryFilter: country })
                              setCountryOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.countryFilter === country
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
              <Label htmlFor="mf-state" className="text-xs text-muted-foreground">
                State / Region
              </Label>
              <Input
                id="mf-state"
                placeholder="e.g. Dubai, California"
                value={filters.stateFilter}
                onChange={(e) => patch({ stateFilter: e.target.value })}
                className="h-9"
                autoComplete="address-level1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mf-city" className="text-xs text-muted-foreground">
                City
              </Label>
              <Input
                id="mf-city"
                placeholder="e.g. Abu Dhabi"
                value={filters.cityFilter}
                onChange={(e) => patch({ cityFilter: e.target.value })}
                className="h-9"
                autoComplete="address-level2"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Matches text inside each job&apos;s location field (and country also uses nationality when set).
          </p>
        </div>

        <Select
          value={filters.categoryFilter}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              categoryFilter: v,
              subCategoryFilter: "all",
            })
          }
          disabled={categoriesLoading}
        >
          <SelectTrigger className="h-9 w-full">
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
          value={filters.subCategoryFilter}
          onValueChange={(v) => patch({ subCategoryFilter: v })}
          disabled={filters.categoryFilter === "all" || subsLoading}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue
              placeholder={
                filters.categoryFilter === "all"
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

        <Select
          value={filters.genderFilter}
          onValueChange={(v) => patch({ genderFilter: v })}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.joiningFilter}
          onValueChange={(v) => patch({ joiningFilter: v })}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Start" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any start</SelectItem>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortMode}
          onValueChange={(v) =>
            patch({ sortMode: v as MarketplaceSortMode })
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="deadline">Deadline soonest</SelectItem>
            <SelectItem value="salary_desc">Salary (high first)</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
