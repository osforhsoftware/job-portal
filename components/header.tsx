"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut as nextAuthSignOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Sun,
  Moon,
  Menu,
  Briefcase,
  Users,
  Building2,
  ChevronDown,
  LogIn,
  LogOut,
  Globe,
  User,
  MessageSquare,
  Bell,
} from "lucide-react"
import { DashboardNotificationBell } from "@/components/dashboard-notification-bell"
import { BrandLogo } from "@/components/brand-logo"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Find Jobs", href: "/jobs" },
  { name: "Companies", href: "/companies" },
  { name: "Agencies", href: "/agencies" },
  { name: "How It Works", href: "/how-it-works" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  { code: "hi", name: "हिन्दी" },
]

/** User menu: profile hub (edit available from profile page) */
function getProfileHref(role: string): string {
  if (role === "candidate") return "/candidate/profile"
  if (role === "company" || role === "corporate" || role === "staff") return "/company/dashboard"
  if (role === "agency") return "/agency/settings"
  if (role === "agent") return "/agent/settings"
  if (role === "admin" || role === "super_admin") return "/admin/settings"
  return "/"
}

/** User menu: view alerts / activity (aligned with notification bell “view all”) */
function getNotificationsHref(role: string): string {
  if (role === "candidate") return "/candidate/notifications"
  if (role === "company" || role === "corporate" || role === "staff") return "/company/demands"
  if (role === "agency") return "/agency/demands"
  if (role === "agent") return "/agent/applications"
  if (role === "admin" || role === "super_admin") return "/admin/approvals"
  return "/"
}

/** User menu: messaging (paths exist for candidate + company; others use closest hub) */
function getMessagesHref(role: string): string {
  if (role === "candidate") return "/candidate/messages"
  if (role === "company" || role === "corporate" || role === "staff") return "/company/messages"
  if (role === "agency") return "/agency/applications"
  if (role === "agent") return "/agent/applications"
  if (role === "admin" || role === "super_admin") return "/admin/dashboard"
  return "/"
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    candidate: "Job Seeker",
    company: "Company",
    corporate: "Company",
    staff: "Staff",
    agency: "Agency",
    agent: "Agent",
    admin: "Admin",
    super_admin: "Admin",
  }
  return labels[role] || role
}

type StoredUserShape = {
  id?: string
  name?: string
  email?: string
  role?: string
  image?: string
  companyId?: string
  agencyId?: string
  agentId?: string
  candidateId?: string
}

/** Registration used to omit role; infer so Profile / Messages links are not "/" */
function normalizeStoredUser(raw: StoredUserShape): StoredUserShape {
  if (raw.role) return raw
  if (raw.candidateId) return { ...raw, role: "candidate" }
  if (raw.agentId) return { ...raw, role: "agent" }
  if (raw.companyId) return { ...raw, role: "company" }
  if (raw.agencyId) return { ...raw, role: "agency" }
  if (raw.id && raw.email && !raw.companyId && !raw.agencyId && !raw.agentId) {
    return { ...raw, role: "candidate", candidateId: raw.candidateId ?? raw.id }
  }
  return raw
}

function readStoredUser(): StoredUserShape | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (!stored || !token) return null
    return normalizeStoredUser(JSON.parse(stored) as StoredUserShape)
  } catch {
    return null
  }
}

function initialsFrom(nameOrEmail?: string) {
  const s = (nameOrEmail || "").trim()
  if (!s) return "U"
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Header() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState("en")
  const [user, setUser] = useState<{
    id?: string
    name?: string
    email?: string
    role?: string
    image?: string
    companyId?: string
    agencyId?: string
    agentId?: string
    candidateId?: string
  } | null>(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  // Hydrate user from localStorage after mount so server and client first paint match (avoids hydration error)
  useEffect(() => {
    const stored = readStoredUser()
    if (stored) {
      setUser(stored)
      try {
        localStorage.setItem("user", JSON.stringify(stored))
      } catch {
        /* ignore */
      }
      return
    }
    if (session?.user) {
      const su = session.user as Record<string, unknown>
      setUser(
        normalizeStoredUser({
          id: su.id as string | undefined,
          role: su.role as string | undefined,
          name: (session.user.name as string) || undefined,
          email: (session.user.email as string) || undefined,
          image: su.image as string | undefined,
          companyId: su.companyId as string | undefined,
          agencyId: su.agencyId as string | undefined,
          agentId: su.agentId as string | undefined,
          candidateId: su.candidateId as string | undefined,
        })
      )
    }
  }, [session])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    setIsOpen(false)
    setLogoutConfirmOpen(false)
    nextAuthSignOut({ callbackUrl: "/" })
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Globe className="h-4 w-4" />
                <span className="text-xs uppercase">{language}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-accent" : ""}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications for all dashboard roles */}
          {user?.role && user.id && (
            <>
              {(user.role === "admin" || user.role === "super_admin") && (
                <DashboardNotificationBell
                  role="admin"
                  entityId={user.id}
                  viewAllHref="/admin/approvals"
                />
              )}
              {user.role === "company" && (user.companyId || user.id) && (
                <DashboardNotificationBell
                  role="company"
                  entityId={user.companyId ?? user.id}
                  viewAllHref="/company/demands"
                />
              )}
              {user.role === "corporate" && (user.companyId || user.id) && (
                <DashboardNotificationBell
                  role="company"
                  entityId={user.companyId ?? user.id}
                  viewAllHref="/company/demands"
                />
              )}
              {user.role === "staff" && (user.companyId || user.id) && (
                <DashboardNotificationBell
                  role="company"
                  entityId={user.companyId ?? user.id}
                  viewAllHref="/company/demands"
                />
              )}
              {user.role === "agency" && (user.agencyId || user.id) && (
                <DashboardNotificationBell
                  role="agency"
                  entityId={user.agencyId ?? user.id}
                  viewAllHref="/agency/demands"
                />
              )}
              {user.role === "agent" && (user.agentId || user.id) && (
                <DashboardNotificationBell
                  role="agent"
                  entityId={user.agentId ?? user.id}
                  viewAllHref="/agent/applications"
                />
              )}
              {user.role === "candidate" && (user.candidateId || user.id) && (
                <DashboardNotificationBell
                  role="candidate"
                  entityId={user.candidateId ?? user.id}
                  viewAllHref="/candidate/notifications"
                />
              )}
            </>
          )}

          {/* Logged-in: Account dropdown with Dashboard + Logout */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user.image || ""} alt={user.name || user.email || "User"} />
                    <AvatarFallback>{initialsFrom(user.name || user.email)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[160px] truncate">{user.name || user.email || "Account"}</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {user.email}
                </div>
                {user.role && (
                  <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                    {getRoleLabel(user.role)}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => {
                    const href = getProfileHref(user.role || "")
                    queueMicrotask(() => router.push(href))
                  }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => {
                    const href = getNotificationsHref(user.role || "")
                    queueMicrotask(() => router.push(href))
                  }}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => {
                    const href = getMessagesHref(user.role || "")
                    queueMicrotask(() => router.push(href))
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={() => setLogoutConfirmOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Login Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <LogIn className="h-4 w-4" />
                    Login
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/login/candidate" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Job Seeker
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login/company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login/agency" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Agency
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/login" className="flex items-center gap-2 text-muted-foreground">
                      Admin Portal
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Register Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2">
                    Get Started
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/register/candidate" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Find Jobs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Hire Talent
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/agency" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Partner as Agency
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-6">
                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Language Selector Mobile */}
                <div className="border-t border-border pt-4">
                  <p className="mb-2 px-4 text-xs font-medium uppercase text-muted-foreground">
                    Language
                  </p>
                  <div className="grid grid-cols-2 gap-2 px-4">
                    {languages.slice(0, 4).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          language === lang.code
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-accent"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile: Logged-in user or Login/Register */}
                {user ? (
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <p className="px-4 text-sm font-medium text-foreground truncate">
                      {user.name || user.email}
                    </p>
                    {user.role && (
                      <p className="px-4 text-xs text-muted-foreground">
                        {getRoleLabel(user.role)}
                      </p>
                    )}
                    <Link
                      href={getProfileHref(user.role || "")}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                    >
                      <User className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 leading-snug">Profile</span>
                    </Link>
                    <Link
                      href={getNotificationsHref(user.role || "")}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                    >
                      <Bell className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 leading-snug">Notifications</span>
                    </Link>
                    <Link
                      href={getMessagesHref(user.role || "")}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                    >
                      <MessageSquare className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 leading-snug">Messages</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setLogoutConfirmOpen(true)}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 leading-snug">Logout</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                      <p className="mb-2 px-4 text-xs font-medium uppercase text-muted-foreground">
                        Login As
                      </p>
                      <Link
                        href="/login/candidate"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                      >
                        <Users className="h-5 w-5 shrink-0" />
                        <span className="min-w-0 leading-snug">Job Seeker</span>
                      </Link>
                      <Link
                        href="/login/company"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                      >
                        <Building2 className="h-5 w-5 shrink-0" />
                        <span className="min-w-0 leading-snug">Company</span>
                      </Link>
                      <Link
                        href="/login/agency"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                      >
                        <Briefcase className="h-5 w-5 shrink-0" />
                        <span className="min-w-0 leading-snug">Agency</span>
                      </Link>
                    </div>

                    <div className="flex flex-col gap-2 px-4">
                      <Button asChild className="w-full">
                        <Link href="/register/candidate" onClick={() => setIsOpen(false)}>
                          Find Jobs
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <Link href="/register/company" onClick={() => setIsOpen(false)}>
                          Hire Talent
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Log out?"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmLabel="Log out"
        variant="destructive"
        onConfirm={handleLogout}
      />
    </header>
  )
}
