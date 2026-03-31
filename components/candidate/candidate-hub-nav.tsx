"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Bell, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/candidate/profile", label: "Profile", icon: User },
  { href: "/candidate/notifications", label: "Notifications", icon: Bell },
  { href: "/candidate/messages", label: "Messages", icon: MessageSquare },
] as const

export function CandidateHubNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5",
        className
      )}
      aria-label="Candidate account"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/candidate/profile"
            ? pathname === "/candidate/profile" || pathname.startsWith("/candidate/profile/")
            : pathname === href || pathname.startsWith(href + "/")

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
