import { UserCog } from "lucide-react"

export default function AgentLoading() {
  return (
    <div className="space-y-6">
      {/* Referral card skeleton */}
      <div className="loading-fade-up rounded-xl border border-border bg-card p-6">
        <div className="mb-3 h-5 w-40 rounded bg-muted loading-shimmer" />
        <div className="mb-2 h-4 w-72 rounded bg-muted loading-shimmer" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-muted loading-shimmer" />
          <div className="h-10 w-24 rounded-lg bg-muted loading-shimmer" />
          <div className="h-10 w-10 rounded-lg bg-muted loading-shimmer" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="loading-fade-up loading-fade-up-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-24 rounded bg-muted loading-shimmer" />
              <div className="h-9 w-9 rounded-full bg-muted loading-shimmer" />
            </div>
            <div className="mt-2 h-8 w-16 rounded bg-muted loading-shimmer" />
            <div className="mt-2 h-3 w-20 rounded bg-muted loading-shimmer" />
          </div>
        ))}
      </div>

      {/* Status breakdown skeleton */}
      <div className="loading-fade-up loading-fade-up-delay-2 rounded-xl border border-border bg-card p-6">
        <div className="mb-4 h-5 w-40 rounded bg-muted loading-shimmer" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted loading-shimmer" />
          ))}
        </div>
      </div>

      {/* Center spinner overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-2 border-emerald-500/30 loading-pulse-ring" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 backdrop-blur-sm">
            <UserCog className="h-5 w-5 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
