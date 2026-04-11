import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function MarketingPageLayout({ title, subtitle, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30">
          <div className="site-container py-10 md:py-14">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="site-container py-10 md:py-14">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
