import { Shield } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full border-2 border-primary/30 loading-pulse-ring" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center loading-fade-up">
          <p className="text-sm font-medium text-foreground">Loading Admin Panel</p>
          <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
        </div>

        {/* Skeleton content */}
        <div className="mt-6 w-full max-w-2xl space-y-4 loading-fade-up loading-fade-up-delay-1">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="h-4 w-20 rounded bg-muted loading-shimmer" />
                <div className="mt-3 h-7 w-14 rounded bg-muted loading-shimmer" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted loading-shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
