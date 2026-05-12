import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Parse JSON from a fetch Response. Use instead of `response.json()` when the server might return
 * an HTML error page (404/502) — otherwise the client throws "Unexpected token '<'".
 */
export async function parseJsonResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text()
  const trimmed = text.trimStart()
  if (trimmed.startsWith("<")) {
    const hint =
      response.status === 404
        ? "Registration service was not found. Deploy the app with Next.js API routes enabled, or check the site URL."
        : response.status >= 500
          ? "Server error. Please try again later."
          : `The server returned an unexpected page (HTTP ${response.status}).`
    throw new Error(hint)
  }
  if (!trimmed) {
    throw new Error("Empty response from server.")
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error("Invalid response from server.")
  }
}

/**
 * Returns a candidate's display name. Prevents duplication when firstName === lastName
 * (e.g. "nabeel nabeel" stored from old single-name entries → shows as "nabeel").
 */
export function formatCandidateName(firstName = "", lastName = ""): string {
  const fn = firstName.trim()
  const ln = lastName.trim()
  if (!ln || ln.toLowerCase() === fn.toLowerCase()) return fn
  return `${fn} ${ln}`
}

/**
 * Demand entry person to display only when it is not the same string as the company line
 * (avoids duplicate name when legacy rows stored the contact as `companyName`).
 */
export function distinctEntryPersonName(
  companyName: string | undefined,
  entryName: string | undefined | null,
): string | null {
  const e = entryName?.trim()
  if (!e) return null
  const c = (companyName ?? "").trim()
  if (!c) return e
  if (e.toLowerCase() === c.toLowerCase()) return null
  return e
}
