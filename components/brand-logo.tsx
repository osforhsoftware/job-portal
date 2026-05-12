import Link from "next/link"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-12",
  md: "h-13",
  lg: "h-15",
  /** Prominent header / hero */
  xl: "h-20 md:h-22",
} as const

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  /** Show “ONE” + “MYJOB” wordmark next to the image (navy / green). */
  showWordmark?: boolean
  wordmarkClassName?: string
  size?: keyof typeof sizes
  /** Defaults to home `/`; use e.g. `/agency/dashboard` in app shells. */
  href?: string
  /** Static branding (no link) — e.g. full-page loading states */
  presentational?: boolean
}

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = false,
  wordmarkClassName,
  size = "md",
  href = "/",
  presentational = false,
}: BrandLogoProps) {
  const inner = (
    <>
      <img
        src="/one_my_job_icon_2.png"
        alt="ONEMYJOB"
        className={cn("w-auto object-contain object-left", sizes[size], imageClassName)}
      />
      {showWordmark && (
        <span className={cn("text-xl font-bold tracking-tight", wordmarkClassName)}>
          <span className="text-brand-navy">ONE</span>
          <span className="text-brand-green">MYJOB</span>
        </span>
      )}
    </>
  )

  if (presentational) {
    return <span className={cn("inline-flex items-center gap-2", className)}>{inner}</span>
  }

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      {inner}
    </Link>
  )
}
