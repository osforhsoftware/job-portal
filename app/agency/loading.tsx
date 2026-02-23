import { Building2 } from "lucide-react"

export default function AgencyLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="loading-fade-up flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted loading-shimmer" />
          <div className="h-4 w-64 rounded-md bg-muted loading-shimmer" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted loading-shimmer" />
      </div>

      {/* Stats cards skeleton */}
      <div className="loading-fade-up loading-fade-up-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-28 rounded bg-muted loading-shimmer" />
              <div className="h-9 w-9 rounded-full bg-muted loading-shimmer" />
            </div>
            <div className="mt-2 h-8 w-20 rounded bg-muted loading-shimmer" />
            <div className="mt-2 h-3 w-24 rounded bg-muted loading-shimmer" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="loading-fade-up loading-fade-up-delay-2 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 h-5 w-32 rounded bg-muted loading-shimmer" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-muted loading-shimmer" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 h-5 w-32 rounded bg-muted loading-shimmer" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 rounded bg-muted loading-shimmer" />
                <div className="h-4 w-20 rounded bg-muted loading-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center spinner overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-2 border-primary/30 loading-pulse-ring" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
            <Building2 className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
