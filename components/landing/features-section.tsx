import {
  Video,
  Upload,
  Globe2,
  Shield,
  BarChart3,
  Bell,
  Smartphone,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Video Profiles",
    description: "1-minute video introductions help candidates stand out and companies assess personality fit.",
  },
  {
    icon: Upload,
    title: "Easy CV Upload",
    description: "Smart CV parsing automatically fills profile fields. Upload once, apply anywhere.",
  },
  {
    icon: Globe2,
    title: "Multi-Language Support",
    description: "Platform available in English, Arabic, Hindi, Filipino, Bengali and more.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Document verification ensures authenticity. Trust badges for verified candidates and companies.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track bids, views, and engagement with comprehensive dashboards for all users.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "WhatsApp, SMS, and email alerts keep everyone updated on bids and selections.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Fully responsive design. Manage profiles, jobs, and bids from any device.",
  },
  {
    icon: Zap,
    title: "Bulk Operations",
    description: "Agencies can upload hundreds of CVs at once. Companies can post multiple jobs efficiently.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1 text-sm font-medium text-foreground">
            Platform Features
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need for Smart Recruitment
          </h2>
          <p className="text-pretty text-muted-foreground">
            Powerful tools designed for candidates, companies, and agencies to streamline the hiring process.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
