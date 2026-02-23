import { LogIn } from "lucide-react"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 rounded-full border-2 border-primary/30 loading-pulse-ring" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center loading-fade-up">
          <p className="text-sm font-medium text-foreground">Loading</p>
          <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
        </div>

        {/* Login form skeleton */}
        <div className="mt-4 w-80 space-y-4 loading-fade-up loading-fade-up-delay-1">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-6 w-24 mx-auto rounded bg-muted loading-shimmer" />
            <div className="space-y-3">
              <div className="h-10 rounded-lg bg-muted loading-shimmer" />
              <div className="h-10 rounded-lg bg-muted loading-shimmer" />
              <div className="h-10 rounded-lg bg-muted loading-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
