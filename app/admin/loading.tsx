import { BrandLogo } from "@/components/brand-logo"

export default function AdminLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo
          size="xl"
          presentational
          imageClassName="loading-logo-pulse"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading Admin Panel</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait...</p>
        </div>

        <div className="mt-6 w-full max-w-2xl space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="mt-3 h-7 w-14 rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
