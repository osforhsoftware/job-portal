import { UserPlus, FileSearch, Gavel, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Profile",
    description:
      "Candidates register with easy forms, upload CV, record video intro. Companies post job requirements.",
    color: "bg-primary",
  },
  {
    icon: FileSearch,
    step: "02",
    title: "Match & Shortlist",
    description:
      "AI matches candidates to jobs. Companies and agencies review profiles and shortlist candidates.",
    color: "bg-accent",
  },
  {
    icon: Gavel,
    step: "03",
    title: "Bidding Process",
    description:
      "Companies and agencies bid on candidates. Transparent pricing with competitive offers.",
    color: "bg-primary",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Selection & Hire",
    description:
      "Best bid wins. Complete documentation, contracts, and onboarding through the platform.",
    color: "bg-accent",
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            How It Works
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Simple Process, Powerful Results
          </h2>
          <p className="text-pretty text-muted-foreground">
            Our streamlined recruitment process connects talent with opportunities through transparent bidding.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block" />

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative ${index % 2 === 1 ? "lg:mt-24" : ""}`}
              >
                {/* Step Card */}
                <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg md:p-8">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 flex h-8 w-16 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                    Step {step.step}
                  </div>

                  <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-start sm:gap-6">
                    {/* Icon */}
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${step.color} text-white transition-transform group-hover:scale-110`}
                    >
                      <step.icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
