/**
 * Shared filter/sort logic for marketplace demands (public /agency /agent listings).
 */

export type MarketplaceSortMode = "newest" | "deadline" | "salary_desc"

export type MarketplaceDemandForFilter = {
  id: string
  jobTitle: string
  companyName: string
  description?: string
  skills?: string[]
  location: string
  gender?: string
  nationality?: string[]
  jobCategoryId?: string
  jobSubCategoryId?: string
  jobCategoryName?: string
  jobSubCategoryName?: string
  joining?: string
  createdAt?: string
  deadline?: string
  salary?: {
    amount?: number
    min?: number
    max?: number
    currency?: string
  }
}

export type MarketplaceFilterValues = {
  search: string
  genderFilter: string
  /** Substring match on demand `location` (state / region / emirate, etc.). */
  stateFilter: string
  /** Substring match on demand `location` (city, etc.). */
  cityFilter: string
  categoryFilter: string
  subCategoryFilter: string
  countryFilter: string
  joiningFilter: string
  sortMode: MarketplaceSortMode
}

export function locationMatchesCountry(location: string, country: string): boolean {
  const loc = location.toLowerCase()
  const c = country.toLowerCase()
  if (loc.includes(c)) return true
  if (country === "United Arab Emirates") {
    return (
      loc.includes("uae") ||
      loc.includes("u.a.e") ||
      loc.includes("dubai") ||
      loc.includes("abu dhabi") ||
      loc.includes("sharjah") ||
      loc.includes("ajman")
    )
  }
  if (country === "United States") {
    return (
      loc.includes("usa") ||
      loc.includes("u.s.") ||
      loc.includes("united states")
    )
  }
  if (country === "United Kingdom") {
    return loc.includes("uk") || loc.includes("u.k.") || loc.includes("britain")
  }
  return false
}

export function matchesCountryFilter(
  d: MarketplaceDemandForFilter,
  country: string,
): boolean {
  if (country === "all") return true
  const nat = d.nationality ?? []
  const natOk = nat.some(
    (n) => n.trim().toLowerCase() === country.toLowerCase(),
  )
  const locOk = locationMatchesCountry(d.location || "", country)
  return locOk || natOk
}

function locationContains(loc: string, needle: string): boolean {
  const n = needle.trim()
  if (!n) return true
  return (loc || "").toLowerCase().includes(n.toLowerCase())
}

export function salarySortValue(
  s: MarketplaceDemandForFilter["salary"] | undefined,
): number {
  if (!s) return 0
  if (typeof s.amount === "number" && s.amount > 0) return s.amount
  if (typeof s.min === "number" && typeof s.max === "number")
    return (s.min + s.max) / 2
  if (typeof s.min === "number") return s.min
  if (typeof s.max === "number") return s.max
  return 0
}

function predicate<T extends MarketplaceDemandForFilter>(
  d: T,
  f: MarketplaceFilterValues,
): boolean {
  const q = f.search.trim().toLowerCase()
  const matchQ =
    !q ||
    d.jobTitle.toLowerCase().includes(q) ||
    d.companyName.toLowerCase().includes(q) ||
    (d.location || "").toLowerCase().includes(q) ||
    (d.skills || []).some((s) => s.toLowerCase().includes(q)) ||
    (d.jobCategoryName || "").toLowerCase().includes(q) ||
    (d.jobSubCategoryName || "").toLowerCase().includes(q)

  const g = (d.gender || "any").toLowerCase()
  const want = f.genderFilter.toLowerCase()
  const matchGender =
    f.genderFilter === "all" || g === "any" || g === want

  const locRaw = (d.location || "").trim()
  const matchState = locationContains(locRaw, f.stateFilter)
  const matchCity = locationContains(locRaw, f.cityFilter)

  const matchCat =
    f.categoryFilter === "all" || d.jobCategoryId === f.categoryFilter

  const matchSub =
    f.subCategoryFilter === "all" ||
    d.jobSubCategoryId === f.subCategoryFilter

  const matchCountry = matchesCountryFilter(d, f.countryFilter)

  const matchJoin =
    f.joiningFilter === "all" || d.joining === f.joiningFilter

  return (
    matchQ &&
    matchGender &&
    matchState &&
    matchCity &&
    matchCat &&
    matchSub &&
    matchCountry &&
    matchJoin
  )
}

/** Filter then sort (mutates order via new array). */
export function filterAndSortMarketplaceDemands<T extends MarketplaceDemandForFilter>(
  demands: T[],
  f: MarketplaceFilterValues,
): T[] {
  let list = demands.filter((d) => predicate(d, f))
  list = [...list]
  if (f.sortMode === "newest") {
    list.sort((a, b) => {
      const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return cb - ca
    })
  } else if (f.sortMode === "deadline") {
    list.sort((a, b) => {
      const da = a.deadline ? new Date(a.deadline).getTime() : 0
      const db = b.deadline ? new Date(b.deadline).getTime() : 0
      return da - db
    })
  } else {
    list.sort(
      (a, b) => salarySortValue(b.salary) - salarySortValue(a.salary),
    )
  }
  return list
}

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilterValues = {
  search: "",
  genderFilter: "all",
  stateFilter: "",
  cityFilter: "",
  categoryFilter: "all",
  subCategoryFilter: "all",
  countryFilter: "all",
  joiningFilter: "all",
  sortMode: "newest",
}

/** How many filter fields differ from defaults (for badge / “has filters”). */
export function countActiveMarketplaceFilters(
  f: MarketplaceFilterValues,
): number {
  let n = 0
  if (f.search.trim()) n++
  if (f.genderFilter !== "all") n++
  if (f.stateFilter.trim()) n++
  if (f.cityFilter.trim()) n++
  if (f.categoryFilter !== "all") n++
  if (f.subCategoryFilter !== "all") n++
  if (f.countryFilter !== "all") n++
  if (f.joiningFilter !== "all") n++
  if (f.sortMode !== "newest") n++
  return n
}

/** Distinct non-empty `location` strings from demands (sorted). */
export function uniqueLocationsFromDemands(
  demands: Pick<MarketplaceDemandForFilter, "location">[],
): string[] {
  const set = new Set<string>()
  for (const d of demands) {
    const loc = (d.location || "").trim()
    if (loc) set.add(loc)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}
