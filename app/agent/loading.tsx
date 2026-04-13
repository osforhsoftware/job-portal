import { BrandLogo } from "@/components/brand-logo"

export default function AgentLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-3 h-5 w-40 rounded bg-muted" />
        <div className="mb-2 h-4 w-72 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-muted" />
          <div className="h-10 w-24 rounded-lg bg-muted" />
          <div className="h-10 w-10 rounded-lg bg-muted" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-9 w-9 rounded-full bg-muted" />
            </div>
            <div className="mt-2 h-8 w-16 rounded bg-muted" />
            <div className="mt-2 h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 h-5 w-40 rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted" />
          ))}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70">
        <BrandLogo
          size="lg"
          presentational
          imageClassName="loading-logo-pulse"
        />
      </div>
    </div>
  )
}
