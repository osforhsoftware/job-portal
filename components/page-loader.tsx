import { BrandLogo } from "@/components/brand-logo"

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <BrandLogo
        size="lg"
        presentational
        imageClassName="loading-logo-pulse"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
