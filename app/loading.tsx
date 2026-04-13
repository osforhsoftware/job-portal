import { BrandLogo } from "@/components/brand-logo"

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <BrandLogo
        size="xl"
        presentational
        imageClassName="loading-logo-pulse"
      />
    </div>
  )
}
