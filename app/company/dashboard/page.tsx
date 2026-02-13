"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Briefcase,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Building2,
  MapPin,
  Clock,
  Plus,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  Home,
  MessageSquare,
  Gavel,
  BarChart3,
  Filter,
} from "lucide-react"
import { useTheme } from "next-themes"

// Mock data
const stats = [
  { label: "Active Jobs", value: "12", change: "+2", icon: Briefcase },
  { label: "Total Candidates", value: "458", change: "+45", icon: Users },
  { label: "Bids Placed", value: "34", change: "+8", icon: Gavel },
  { label: "Hired This Month", value: "8", change: "+3", icon: TrendingUp },
]

const recentJobs = [
  {
    id: 1,
    title: "Senior Civil Engineer",
    location: "Dubai, UAE",
    applicants: 45,
    status: "active",
    postedDate: "2 days ago",
    salary: "$3,000 - $4,500",
  },
  {
    id: 2,
    title: "Project Manager",
    location: "Abu Dhabi, UAE",
    applicants: 32,
    status: "active",
    postedDate: "5 days ago",
    salary: "$4,000 - $6,000",
  },
  {
    id: 3,
    title: "Site Supervisor",
    location: "Dubai, UAE",
    applicants: 28,
    status: "closed",
    postedDate: "1 week ago",
    salary: "$2,500 - $3,500",
  },
]

const topCandidates = [
  { id: 1, name: "Mohammed Ahmed", role: "Civil Engineer", experience: "8 years", status: "shortlisted" },
  { id: 2, name: "Priya Sharma", role: "Project Manager", experience: "10 years", status: "new" },
  { id: 3, name: "Ahmed Hassan", role: "Site Engineer", experience: "5 years", status: "bidding" },
]

export default function CompanyDashboard() {
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TalentBid</span>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <Link href="/company/dashboard" className="flex items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 text-primary">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/company/jobs" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Briefcase className="h-5 w-5" />
            My Jobs
            <Badge className="ml-auto">12</Badge>
          </Link>
          <Link href="/company/candidates" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Users className="h-5 w-5" />
            Candidates
          </Link>
          <Link href="/company/bidding" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Gavel className="h-5 w-5" />
            Bidding Center
          </Link>
          <Link href="/company/shortlist" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <FileText className="h-5 w-5" />
            Shortlisted
          </Link>
          <Link href="/company/messages" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <MessageSquare className="h-5 w-5" />
            Messages
          </Link>
          <Link href="/company/analytics" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <Link href="/company/settings" className="flex items-center gap-3 rounded-lg px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Company Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                5
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    GC
                  </div>
                  <span className="hidden sm:inline">Gulf Construction</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" />
                  Company Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-8">
          {/* Quick Actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search candidates, jobs..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button asChild className="gap-2">
                <Link href="/company/jobs/new">
                  <Plus className="h-4 w-4" />
                  Post New Job
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Jobs</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/company/jobs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applicants} applicants
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.postedDate}
                          </span>
                        </div>
                      </div>
                      <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Candidates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Candidates</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/company/candidates">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                          {candidate.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.role} • {candidate.experience}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            candidate.status === "shortlisted"
                              ? "default"
                              : candidate.status === "bidding"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {candidate.status}
                        </Badge>
                        <Button size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
