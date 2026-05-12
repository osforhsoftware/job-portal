import type { Candidate, JobCategory, JobSubCategory } from '@/lib/db'

export interface CandidateJobClassification {
  jobCategoryName?: string
  jobSubCategoryName?: string
  /** Sub-category IDs held by this candidate (from jobSubCategoryId + jobCategories entries that are subs). */
  subCategoryIds: string[]
  /** Parent category IDs only (jobCategoryId + jobCategories entries that are parents, not subs). */
  parentCategoryIds: string[]
}

/**
 * Normalizes candidate job classification for APIs and demand matching.
 * `jobCategories` is overloaded in the product: it may contain sub-category IDs (wizard flows)
 * or parent category IDs (e.g. agency manual candidate form).
 */
export function classifyCandidateJobCategories(
  c: Pick<Candidate, 'jobCategoryId' | 'jobSubCategoryId' | 'jobCategories'>,
  jobCategories: JobCategory[],
  jobSubCategories: JobSubCategory[],
): CandidateJobClassification {
  const categoryMap = new Map(jobCategories.map((x) => [x.id, x.name]))
  const subById = new Map(jobSubCategories.map((s) => [s.id, s]))

  const subCategoryIds: string[] = []
  const parentCategoryIds: string[] = []

  const pushSub = (id?: string) => {
    if (!id || !subById.has(id)) return
    if (!subCategoryIds.includes(id)) subCategoryIds.push(id)
  }
  const pushParent = (id?: string) => {
    if (!id || !categoryMap.has(id)) return
    if (!parentCategoryIds.includes(id)) parentCategoryIds.push(id)
  }

  pushSub(c.jobSubCategoryId)

  for (const id of c.jobCategories ?? []) {
    if (subById.has(id)) pushSub(id)
    else if (categoryMap.has(id)) pushParent(id)
  }

  pushParent(c.jobCategoryId)

  let jobSubCategoryName: string | undefined
  let jobCategoryName: string | undefined

  if (subCategoryIds.length > 0) {
    const sub = subById.get(subCategoryIds[0])
    jobSubCategoryName = sub?.name
    if (sub) jobCategoryName = categoryMap.get(sub.categoryId)
  }

  if (!jobCategoryName && parentCategoryIds.length > 0) {
    jobCategoryName = categoryMap.get(parentCategoryIds[0])
  }

  return {
    jobCategoryName,
    jobSubCategoryName,
    subCategoryIds,
    parentCategoryIds,
  }
}

export function candidateMatchesDemandClassification(
  classified: CandidateJobClassification,
  demand: { jobCategoryId?: string; jobSubCategoryId?: string },
): boolean {
  if (demand.jobSubCategoryId) {
    if (classified.subCategoryIds.includes(demand.jobSubCategoryId)) return true
    if (demand.jobCategoryId && classified.parentCategoryIds.includes(demand.jobCategoryId)) return true
    return false
  }
  if (demand.jobCategoryId) return classified.parentCategoryIds.includes(demand.jobCategoryId)
  return false
}

/** Label above the candidate name in submit dialogs: matched demand sub/parent, else primary classification. */
export function candidateRoleLabelForDemand(
  classified: CandidateJobClassification,
  demand: {
    jobCategoryId?: string
    jobCategoryName?: string
    jobSubCategoryId?: string
    jobSubCategoryName?: string
  },
): string | undefined {
  if (demand.jobSubCategoryId && classified.subCategoryIds.includes(demand.jobSubCategoryId)) {
    return demand.jobSubCategoryName ?? classified.jobSubCategoryName
  }
  if (demand.jobCategoryId && classified.parentCategoryIds.includes(demand.jobCategoryId)) {
    return classified.jobCategoryName ?? demand.jobCategoryName ?? classified.jobSubCategoryName
  }
  return classified.jobSubCategoryName ?? classified.jobCategoryName
}
