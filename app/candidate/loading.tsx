import { BrandLogo } from "@/components/brand-logo"

export default function CandidateLoading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo
          size="xl"
          presentational
          imageClassName="loading-logo-pulse"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading Dashboard</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait...</p>
        </div>

        <div className="mt-6 w-full max-w-md space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-36 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="mt-2 h-6 w-10 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
