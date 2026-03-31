'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, Briefcase, Utensils, Home, Car, FileCheck, HeartPulse, MoreHorizontal, User, Users, Globe, Clock, CalendarClock, Calendar, X, Shield, CalendarDays, Tags, MapPin, DollarSign } from "lucide-react"
import { ALL_COUNTRIES } from "@/lib/countries"
import { BenefitType, NationalityType, BENEFITS } from "@/lib/job-config"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const benefitIconMap: Record<BenefitType, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  accommodation: <Home className="h-4 w-4" />,
  transportation: <Car className="h-4 w-4" />,
  visa: <FileCheck className="h-4 w-4" />,
  medical_insurance: <HeartPulse className="h-4 w-4" />,
  overtime: <Clock className="h-4 w-4" />,
  insurance: <Shield className="h-4 w-4" />,
  annual_leave_30_days: <CalendarDays className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
}

const benefitConfig: { value: BenefitType; label: string; icon: React.ReactNode }[] =
  BENEFITS.map((b) => ({ ...b, icon: benefitIconMap[b.value] }))

function SelectChip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-muted hover:text-foreground",
        className,
      ].join(" ")}
    >
      {active && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-2 ring-background">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </span>
      )}
      {children}
    </button>
  )
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  renderOption,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  renderOption?: (v: T) => React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-[#F3F4F6] p-1 ring-1 ring-[#E5E7EB] shadow-sm">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
            "transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#2563EB]",
            value === opt
              ? "bg-[#2563EB] text-white shadow-sm ring-1 ring-[#1D4ED8]"
              : "bg-transparent text-slate-700 hover:bg-white hover:text-slate-900",
          ].join(" ")}
        >
          {renderOption ? renderOption(opt) : opt}
        </button>
      ))}
    </div>
  )
}

export default function CreateDemandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [employeeName, setEmployeeName] = useState("") // selected entry person name (saved to demand)
  const [employeeUserId, setEmployeeUserId] = useState("") // selected entry person userId (optional)
  const [staffUsers, setStaffUsers] = useState<{ id: string; name: string; email: string; isActive: boolean }[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [quantity, setQuantity] = useState("1")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [requirements, setRequirements] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [salaryAmount, setSalaryAmount] = useState("")
  const [currency, setCurrency] = useState("AED")
  const [dutyHoursPerDay, setDutyHoursPerDay] = useState("")
  const [breakTimeHours, setBreakTimeHours] = useState("")
  const [dayOffPerMonth, setDayOffPerMonth] = useState("")
  const [timeRemark, setTimeRemark] = useState("")
  const [benefits, setBenefits] = useState<BenefitType[]>([])
  const [otherBenefitNote, setOtherBenefitNote] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "any">("any")
  const [nationality, setNationality] = useState<NationalityType[]>([])
  const [nationalitySearch, setNationalitySearch] = useState("")
  const [joining, setJoining] = useState<"immediate" | "scheduled">("immediate")
  const [status, setStatus] = useState<"open" | "closed" | "on_hold">("open")
  const [deadline, setDeadline] = useState("")
  const [demandLetter, setDemandLetter] = useState<"have" | "arrange" | "">("")
  const [jobCategoryId, setJobCategoryId] = useState("")
  const [jobSubCategoryId, setJobSubCategoryId] = useState("")
  const [jobCategories, setJobCategories] = useState<{ id: string; name: string; slug: string; group?: string }[]>([])
  const [jobSubCategories, setJobSubCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [countryCode, setCountryCode] = useState("")
  const [stateCode, setStateCode] = useState("")
  const [cityName, setCityName] = useState("")
  const [availableCountries, setAvailableCountries] = useState<{ iso2: string; name: string }[]>([])
  const [availableStates, setAvailableStates] = useState<{ iso2: string; name: string }[]>([])
  const [availableCities, setAvailableCities] = useState<{ name: string }[]>([])
  const [statesLoading, setStatesLoading] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) { router.push("/login/company"); return }
    const u = JSON.parse(user)
    setUserId(u.id ?? "")
    setCompanyId(u.companyId ?? u.id ?? "")
    const derivedCompanyName = u.name ?? u.companyName ?? ""
    setCompanyName(derivedCompanyName)
    const defaultName = u.name ?? u.contactName ?? ""
    setEmployeeName(defaultName)
    setEmployeeUserId(u.id ?? "")
  }, [router])

  useEffect(() => {
    if (!companyId) return
    setStaffLoading(true)
    fetch(`/api/company/users?companyId=${encodeURIComponent(companyId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const list = (data.users ?? []).filter((u: any) => u.isActive)
          setStaffUsers(list)
        } else {
          setStaffUsers([])
        }
      })
      .catch(() => setStaffUsers([]))
      .finally(() => setStaffLoading(false))
  }, [companyId])

  useEffect(() => {
    fetch("/api/job-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setJobCategories(
            data.categories.map((c: { id: string; name: string; slug: string; group?: string }) => ({
              id: c.id,
              name: c.name,
              slug: c.slug || c.id,
              group: c.group,
            }))
          )
        }
      })
      .catch(() => setJobCategories([]))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    if (!jobCategoryId) {
      setJobSubCategories([])
      setJobSubCategoryId("")
      return
    }
    fetch(`/api/job-sub-categories?categoryId=${encodeURIComponent(jobCategoryId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.subCategories) {
          setJobSubCategories(
            data.subCategories.map((s: { id: string; name: string; slug: string }) => ({
              id: s.id,
              name: s.name,
              slug: s.slug || s.id,
            }))
          )
        } else {
          setJobSubCategories([])
        }
      })
      .catch(() => setJobSubCategories([]))
    setJobSubCategoryId("")
  }, [jobCategoryId])

  useEffect(() => {
    fetch("/api/geo/countries")
      .then((res) => res.json())
      .then((data) => {
        if (data.countries) {
          setAvailableCountries(data.countries)
        } else {
          setAvailableCountries([])
        }
      })
      .catch(() => setAvailableCountries([]))
  }, [])

  const updateLocationFromParts = (countryIso2: string, stateIso2: string, city: string) => {
    const country = availableCountries.find((c) => c.iso2 === countryIso2)?.name || ""
    const state = availableStates.find((s) => s.iso2 === stateIso2)?.name || ""
    const cityPart = city || ""

    const parts = [cityPart, state, country].filter(Boolean)
    setLocation(parts.join(", "))
  }

  const commitSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    setSkills((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const toggleBenefit = (value: BenefitType) => {
    setBenefits((prev) => prev.includes(value) ? prev.filter((b) => b !== value) : [...prev, value])
  }

  const addNationality = (country: NationalityType) => {
    setNationality((prev) => (prev.includes(country) ? prev : [...prev, country]))
  }

  const removeNationality = (country: NationalityType) => {
    setNationality((prev) => prev.filter((n) => n !== country))
  }

  const selectedCategoryName =
    jobCategories.find((c) => c.id === jobCategoryId)?.name

  const selectedSubCategoryName =
    jobSubCategories.find((s) => s.id === jobSubCategoryId)?.name

  const derivedJobTitle = selectedSubCategoryName || selectedCategoryName || "Role"

  const selectedEmployeeName = employeeName || ""

  const selectedBenefitLabels = benefitConfig
    .filter((b) => benefits.includes(b.value))
    .map((b) => b.label)

  const statusLabel = status.replace("_", " ")

  const handleSubmit = async () => {
    const qty = Math.max(1, Number(quantity || 0))
    if (!Number.isFinite(qty) || qty < 1) { toast.error("Quantity must be at least 1"); return }
    if (!location) { toast.error("Select a country"); return }
    if (!companyId) { toast.error("Company not found. Please log in again."); return }
    setLoading(true)
    try {
      const res = await fetch("/api/company/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          companyName: companyName || "Company",
          createdByUserId: userId || undefined,
          createdByEmployeeName: employeeName || undefined,
          timeRemark: timeRemark || undefined,
          otherBenefitNote: benefits.includes("other") ? (otherBenefitNote || undefined) : undefined,
          roles: [{ jobTitle: derivedJobTitle, quantity: qty }],
          description, location,
          requirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
          skills,
          salaryAmount: Number(salaryAmount || 0), currency,
          dutyHoursPerDay: Number(dutyHoursPerDay || 0),
          breakTimeHours: Number(breakTimeHours || 0),
          dayOffPerMonth: Number(dayOffPerMonth || 0),
          benefits, gender, nationality, joining, status,
          deadline: deadline || undefined,
          demandLetter: demandLetter || undefined,
          jobCategoryId: jobCategoryId || undefined,
          jobSubCategoryId: jobSubCategoryId || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Demand submitted. An admin will review it before it appears to agencies.")
        router.push("/company/demands")
      } else {
        toast.error(data.error || "Failed to create demand")
      }
    } catch {
      toast.error("Failed to create demand")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Create Demand
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Company info is filled automatically. Add job details, hiring details, and benefits below.
            </p>
          </CardHeader>

          <CardContent className="space-y-8 pt-2">

            {/* ── Job Category & Sub-category ── */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Tags className="h-5 w-5" />
                <Label className="text-base font-medium">Job Category</Label>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
                <div className="min-w-0 w-full flex-1 basis-0 space-y-2">
                  <Label>Category</Label>
                  <Select value={jobCategoryId} onValueChange={setJobCategoryId}>
                    <SelectTrigger className="w-full min-w-0 max-w-full">
                      <SelectValue placeholder={categoriesLoading ? "Loading…" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(["white_collar", "blue_collar", "other"] as const).map((group) => {
                        const cats = jobCategories.filter((c) => c.group === group || (!c.group && group === "other"))
                        if (cats.length === 0) return null
                        const label = group === "white_collar" ? "White Collar" : group === "blue_collar" ? "Blue Collar" : "Other"
                        return (
                          <SelectGroup key={group}>
                            <SelectLabel>{label}</SelectLabel>
                            {cats.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 w-full flex-1 basis-0 space-y-2">
                  <Label>Sub-category</Label>
                  <Select
                    value={jobSubCategoryId}
                    onValueChange={setJobSubCategoryId}
                    disabled={!jobCategoryId}
                  >
                    <SelectTrigger className="w-full min-w-0 max-w-full">
                      <SelectValue placeholder={jobCategoryId ? "Select sub-category" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {jobSubCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 w-full shrink-0 space-y-2 md:w-24 md:max-w-[8rem]">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Qty"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full min-w-0"
                  />
                </div>
              </div>
            </section>

            {/* ── Roles ── */}
            <section className="space-y-3">
              <div className="space-y-2">
                <Label>Demand entry person (staff)</Label>
                <Select
                  value={staffUsers.some((s) => s.id === employeeUserId) ? employeeUserId : ""}
                  onValueChange={(val) => {
                    setEmployeeUserId(val)
                    const found = staffUsers.find((s) => s.id === val)
                    if (found) setEmployeeName(found.name)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={staffLoading ? "Loading staff…" : "Select staff"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Staff</SelectLabel>
                      {staffUsers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </SelectItem>
                      ))}
                      {staffUsers.length === 0 && (
                        <SelectItem value="__none__" disabled>
                          No staff users found
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

            </section>

            {/* ── Location & Description ── */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label>Location (Country / State / City)</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="min-w-0 space-y-1">
                    <Label htmlFor="country-select" className="text-xs text-muted-foreground">
                      Country
                    </Label>
                    <Select
                      value={countryCode}
                      onValueChange={(code) => {
                        const normalizedCountry = code.toUpperCase()
                        setCountryCode(normalizedCountry)
                        setStateCode("")
                        setCityName("")
                        setAvailableStates([])
                        setAvailableCities([])
                        setStatesLoading(true)
                        fetch(`/api/geo/states?country=${encodeURIComponent(normalizedCountry)}`)
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.states) setAvailableStates(data.states)
                            else setAvailableStates([])
                          })
                          .catch(() => setAvailableStates([]))
                          .finally(() => setStatesLoading(false))
                        updateLocationFromParts(normalizedCountry, "", "")
                      }}
                    >
                      <SelectTrigger id="country-select">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries.map((country) => (
                          <SelectItem key={country.iso2} value={country.iso2}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <Label htmlFor="state-select" className="text-xs text-muted-foreground">
                      State / Region
                    </Label>
                    <Select
                      value={stateCode}
                      onValueChange={(code) => {
                        const normalizedState = code.toUpperCase()
                        setStateCode(normalizedState)
                        setCityName("")
                        setAvailableCities([])
                        if (!countryCode) {
                          updateLocationFromParts("", "", "")
                          return
                        }
                        setCitiesLoading(true)
                        fetch(`/api/geo/cities?country=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(normalizedState)}`)
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.cities) setAvailableCities(data.cities)
                            else setAvailableCities([])
                          })
                          .catch(() => setAvailableCities([]))
                          .finally(() => setCitiesLoading(false))
                        updateLocationFromParts(countryCode, normalizedState, "")
                      }}
                      disabled={!countryCode || statesLoading}
                    >
                      <SelectTrigger id="state-select">
                        <SelectValue
                          placeholder={
                            !countryCode
                              ? "Select country first"
                              : statesLoading
                                ? "Loading states…"
                                : availableStates.length === 0
                                  ? "No states found"
                                  : "Select state"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map((state) => (
                          <SelectItem key={state.iso2} value={state.iso2}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <Label htmlFor="city-select" className="text-xs text-muted-foreground">
                      City
                    </Label>
                    <Select
                      value={cityName}
                      onValueChange={(city) => {
                        setCityName(city)
                        if (!countryCode) {
                          setLocation(city || "")
                          return
                        }
                        updateLocationFromParts(countryCode, stateCode, city)
                      }}
                      disabled={!stateCode || citiesLoading}
                    >
                      <SelectTrigger id="city-select">
                        <SelectValue
                          placeholder={
                            !stateCode
                              ? "Select state first"
                              : citiesLoading
                                ? "Loading cities…"
                                : availableCities.length === 0
                                  ? "No cities found"
                                  : "Select city"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job description</Label>
                <Textarea id="description" placeholder="Brief job description" value={description}
                  onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
            </section>

            {/* ── Requirements & Skills ── */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                <Textarea id="requirements" placeholder={"e.g. 2+ years experience\ne.g. Basic English speaking"}
                  value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skillInput">Skills</Label>
                <div className="rounded-xl border border-border bg-muted/40 px-3 py-2">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        No skills added yet.
                      </span>
                    )}
                  </div>
                  <Input
                    id="skillInput"
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        commitSkill()
                      } else if (e.key === "Backspace" && !skillInput && skills.length) {
                        // quick remove last skill when input is empty
                        removeSkill(skills[skills.length - 1])
                      }
                    }}
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Example: customer service, sales, cleaning
                </p>
              </div>
            </section>

            {/* ── Salary ── */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryAmount">Salary amount</Label>
                <Input id="salaryAmount" type="number" min={0} placeholder="e.g. 2000"
                  value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" placeholder="e.g. AED" value={currency}
                  onChange={(e) => setCurrency(e.target.value)} />
              </div>
            </section>

            {/* ── Work schedule ── */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dutyHoursPerDay">Duty hrs / day</Label>
                <Input id="dutyHoursPerDay" type="number" min={0} value={dutyHoursPerDay}
                  onChange={(e) => setDutyHoursPerDay(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakTimeHours">Break (hrs)</Label>
                <Input id="breakTimeHours" type="number" min={0} value={breakTimeHours}
                  onChange={(e) => setBreakTimeHours(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dayOffPerMonth">Days off / mo</Label>
                <Input id="dayOffPerMonth" type="number" min={0} value={dayOffPerMonth}
                  onChange={(e) => setDayOffPerMonth(e.target.value)} />
              </div>
            </section>

            {/* ── Demand letter ── */}
            <section className="space-y-3">
              <div className="space-y-1">
                <Label>Demand letter</Label>
                <p className="text-xs text-muted-foreground">
                  Do you provide the demand letter for this requirement?
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setDemandLetter("have")}
                  className={[
                    "flex-1 rounded-lg border px-3 py-1.5 font-medium",
                    demandLetter === "have"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setDemandLetter("arrange")}
                  className={[
                    "flex-1 rounded-lg border px-3 py-1.5 font-medium",
                    demandLetter === "arrange"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  No
                </button>
              </div>
            </section>

            {/* ── Benefits ── */}
            <section className="space-y-3">
              <div>
                <Label>Benefits</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Select all that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {benefitConfig.map(({ value, label, icon }) => (
                  <SelectChip key={value} active={benefits.includes(value)} onClick={() => toggleBenefit(value)}>
                    {icon}
                    {label}
                  </SelectChip>
                ))}
              </div>
              {benefits.includes("other") && (
                <div className="space-y-1 pt-1">
                  <Label htmlFor="otherBenefitNote" className="text-xs">
                    Other benefit details
                  </Label>
                  <Textarea
                    id="otherBenefitNote"
                    rows={2}
                    placeholder="Describe the other benefits you provide."
                    value={otherBenefitNote}
                    onChange={(e) => setOtherBenefitNote(e.target.value)}
                  />
                </div>
              )}
            </section>

            {/* ── Gender ── */}
            <section className="space-y-2">
              <Label>Gender preference</Label>
              <SegmentedControl
                options={["male", "female", "any"] as const}
                value={gender}
                onChange={setGender}
                renderOption={(g) => (
                  <>
                    {g === "male" && <User className="h-3.5 w-3.5" />}
                    {g === "female" && <User className="h-3.5 w-3.5" />}
                    {g === "any" && <Users className="h-3.5 w-3.5" />}
                    <span className="capitalize">{g}</span>
                  </>
                )}
              />
            </section>

            {/* ── Nationality (multi-select) ── */}
            <section className="space-y-3">
              <div>
                <Label>Nationality</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Search and select one or more countries.
                </p>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search countries…"
                    value={nationalitySearch}
                    onChange={(e) => setNationalitySearch(e.target.value)}
                    className="pl-9"
                  />
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-muted/40 p-1 text-sm">
                  {ALL_COUNTRIES.filter((c) =>
                    c.toLowerCase().includes(nationalitySearch.toLowerCase())
                  ).map((country) => {
                    const selected = nationality.includes(country)
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => (selected ? removeNationality(country) : addNationality(country))}
                        className={[
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left",
                          selected
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-background hover:text-foreground",
                        ].join(" ")}
                      >
                        <span className="truncate">{country}</span>
                        {selected && <Check className="ml-2 h-3.5 w-3.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              {nationality.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {nationality.map((country) => (
                    <span
                      key={country}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {country}
                      <button
                        type="button"
                        onClick={() => removeNationality(country)}
                        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                        aria-label={`Remove ${country}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* ── Joining & Status & Deadline ── */}
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Joining */}
                <div className="space-y-2">
                  <Label>Joining</Label>
                  <SegmentedControl
                    options={["immediate", "scheduled"] as const}
                    value={joining}
                    onChange={setJoining}
                    renderOption={(j) => (
                      <>
                        {j === "immediate" ? <Clock className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
                        <span className="capitalize">{j}</span>
                      </>
                    )}
                  />
                </div>
                {/* Deadline - only relevant when joining is scheduled */}
                <div className="space-y-2">
                  <Label
                    htmlFor="deadline"
                    className={joining === "immediate" ? "text-muted-foreground" : undefined}
                  >
                    Deadline
                  </Label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="pl-9"
                      disabled={joining === "immediate"}
                    />
                  </div>
                  {joining === "immediate" && (
                    <p className="text-[11px] text-muted-foreground">
                      Deadline is not required when joining is immediate.
                    </p>
                  )}
                </div>
              </div>

              {/* Status — coloured chips */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2">
                  {(["open", "closed", "on_hold"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      data-active={status === s}
                      className={[
                        "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none",
                        status === s
                          ? s === "open"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500"
                            : s === "closed"
                            ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500"
                            : "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-border/80 hover:bg-muted",
                      ].join(" ")}
                    >
                      <span className={[
                        "h-2 w-2 rounded-full",
                        status === s
                          ? s === "open" ? "bg-emerald-500" : s === "closed" ? "bg-rose-500" : "bg-amber-500"
                          : "bg-muted-foreground/30",
                      ].join(" ")} />
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Remark (last) ── */}
            <section className="space-y-2">
              <Label htmlFor="timeRemark">Remark</Label>
              <Textarea
                id="timeRemark"
                placeholder="Any extra notes about this demand (timing, conditions, special instructions, etc.)"
                value={timeRemark}
                onChange={(e) => setTimeRemark(e.target.value)}
                rows={2}
              />
            </section>

            {/* ── Actions ── */}
            <div className="flex gap-2 pt-2 lg:hidden">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/company/demands">Cancel</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create demand
                  </>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-24 self-start">
          <Card className="border-border/60 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Demand Preview
              </CardTitle>
              <p className="text-xs text-muted-foreground">A quick summary before you submit.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="min-w-0 text-right font-medium">{derivedJobTitle}</p>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="min-w-0 text-right font-medium">{quantity || "1"}</p>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </p>
                  <p className="min-w-0 text-right font-medium">{location || "—"}</p>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Salary
                  </p>
                  <p className="min-w-0 text-right font-medium">
                    {salaryAmount ? `${salaryAmount} ${currency}` : "—"}
                  </p>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold capitalize",
                      status === "open"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : status === "closed"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        status === "open"
                          ? "bg-emerald-500"
                          : status === "closed"
                            ? "bg-rose-500"
                            : "bg-amber-500",
                      ].join(" ")}
                    />
                    {statusLabel}
                  </span>
                </div>

                {selectedBenefitLabels.length > 0 && (
                  <div className="pt-1">
                    <p className="mb-2 text-xs text-muted-foreground">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBenefitLabels.slice(0, 4).map((b) => (
                        <span key={b} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {b.replaceAll("_", " ")}
                        </span>
                      ))}
                      {selectedBenefitLabels.length > 4 && (
                        <span className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                          +{selectedBenefitLabels.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-sm space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Entry person</p>
                  <p className="text-right font-medium">{selectedEmployeeName || "—"}</p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-right font-medium capitalize">{gender}</p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Joining</p>
                  <p className="text-right font-medium capitalize">
                    {joining === "immediate" ? "Immediate" : `Scheduled ${deadline ? `(${deadline})` : ""}`}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="text-right font-medium">
                    {nationality.length ? `${nationality.length} countries` : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create demand
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/company/demands">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}