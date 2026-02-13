import { TrendingUp, Users, Building2, Clock } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    value: "98%",
    label: "Placement Success Rate",
    description: "Of candidates find jobs within 30 days",
  },
  {
    icon: Users,
    value: "40%",
    label: "Faster Hiring",
    description: "Reduced time-to-hire with bidding",
  },
  {
    icon: Building2,
    value: "150+",
    label: "Countries Supported",
    description: "Global reach for international recruitment",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Platform Availability",
    description: "Round-the-clock bidding and support",
  },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="mb-1 text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="mb-2 font-medium text-foreground">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
