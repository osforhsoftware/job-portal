import { User } from "lucide-react"

export default function CandidateLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full border-2 border-primary/30 loading-pulse-ring" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center loading-fade-up">
          <p className="text-sm font-medium text-foreground">Loading Dashboard</p>
          <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
        </div>

        {/* Profile card skeleton */}
        <div className="mt-6 w-full max-w-md space-y-4 loading-fade-up loading-fade-up-delay-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted loading-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-36 rounded bg-muted loading-shimmer" />
                <div className="h-4 w-48 rounded bg-muted loading-shimmer" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="h-3 w-16 rounded bg-muted loading-shimmer" />
                <div className="mt-2 h-6 w-10 rounded bg-muted loading-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
