import type { Candidate } from '@/lib/db'

/** True when the candidate may be submitted / apply to open demands (agency + direct marketplace). */
export function candidateCanSubmitToDemands(candidate: Candidate): boolean {
  return candidate.isActive && candidate.status === 'available'
}
