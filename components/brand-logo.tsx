import Link from "next/link"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-9",
  md: "h-10",
  lg: "h-12",
  /** Prominent header / hero */
  xl: "h-14 md:h-16",
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
}

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = false,
  wordmarkClassName,
  size = "md",
  href = "/",
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/one_my_job_icon_1.png"
        alt="ONEMYJOB"
        className={cn("w-auto object-contain object-left", sizes[size], imageClassName)}
      />
      {showWordmark && (
        <span className={cn("text-xl font-bold tracking-tight", wordmarkClassName)}>
          <span className="text-brand-navy">ONE</span>
          <span className="text-brand-green">MYJOB</span>
        </span>
      )}
    </Link>
  )
}
