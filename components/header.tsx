"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
  Globe,
} from "lucide-react"

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
  { code: "tl", name: "Filipino" },
  { code: "bn", name: "বাংলা" },
]

export function Header() {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState("en")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TalentBid</span>
        </Link>

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

                {/* Mobile Auth Actions */}
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <p className="mb-2 px-4 text-xs font-medium uppercase text-muted-foreground">
                    Login As
                  </p>
                  <Link
                    href="/login/candidate"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                  >
                    <Users className="h-5 w-5" />
                    Job Seeker
                  </Link>
                  <Link
                    href="/login/company"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                  >
                    <Building2 className="h-5 w-5" />
                    Company
                  </Link>
                  <Link
                    href="/login/agency"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground hover:bg-accent"
                  >
                    <Briefcase className="h-5 w-5" />
                    Agency
                  </Link>
                </div>

                {/* Register CTAs */}
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
