import type { Demand } from '@/lib/db'

/** Legacy documents without `approvalStatus` are treated as already published. */
export function demandIsLiveOnMarketplace(d: Demand): boolean {
  const s = d.approvalStatus
  if (s === 'pending' || s === 'rejected') return false
  return true
}
