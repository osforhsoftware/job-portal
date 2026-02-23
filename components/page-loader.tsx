"use client"

import { Loader2 } from "lucide-react"

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-14 w-14 rounded-full border-2 border-primary/20 loading-pulse-ring" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground loading-fade-up">{message}</p>
    </div>
  )
}
