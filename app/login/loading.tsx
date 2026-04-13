import { BrandLogo } from "@/components/brand-logo"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo
          size="xl"
          presentational
          imageClassName="loading-logo-pulse"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading</p>
          <p className="mt-1 text-xs text-muted-foreground">Please wait...</p>
        </div>

        <div className="mt-4 w-80 space-y-4">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="mx-auto h-6 w-24 rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
              <div className="h-10 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
