import Link from "next/link"
import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-8",
  md: "h-9",
  lg: "h-10",
} as const

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  /** Show “ONE” + “MYJOB” wordmark next to the image (navy / green). */
  showWordmark?: boolean
  wordmarkClassName?: string
  size?: keyof typeof sizes
}

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = false,
  wordmarkClassName,
  size = "md",
}: BrandLogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/onemycv.jpeg"
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
