import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

function stripPassword<T extends { password?: string }>(obj: T | null | undefined): Omit<T, 'password'> | null {
  if (!obj) return null
  const { password: _p, ...rest } = obj
  return rest as Omit<T, 'password'>
}

async function resolveJobCategoryName(id?: string) {
  if (!id) return undefined
  const c = await db.jobCategories.getById(id)
  return c?.name
}

async function resolveJobSubCategoryName(id?: string) {
  if (!id) return undefined
  const s = await db.jobSubCategories.getById(id)
  return s?.name
}

export async function GET() {
  try {
    const demandsRaw = await db.demands.getAll()
    const demands = await Promise.all(
      demandsRaw.map(async (d) => {
        const [jobCategoryName, jobSubCategoryName, companyRegisteredName] = await Promise.all([
          resolveJobCategoryName(d.jobCategoryId),
          resolveJobSubCategoryName(d.jobSubCategoryId),
          d.companyId ? db.companies.getById(d.companyId).then((co) => co?.name) : Promise.resolve(undefined),
        ])
        return {
          ...d,
          positions: d.quantity,
          jobCategoryName,
          jobSubCategoryName,
          companyRegisteredName,
        }
      }),
    )

    const applications = await db.applications.getAll()
    const submissions = await Promise.all(
      applications.map(async (app) => {
        const candidate = await db.candidates.getById(app.candidateId)
        let enrichedCandidate = stripPassword(candidate)
        if (candidate && enrichedCandidate) {
          const [jobCategoryName, jobSubCategoryName] = await Promise.all([
            resolveJobCategoryName(candidate.jobCategoryId),
            resolveJobSubCategoryName(candidate.jobSubCategoryId),
          ])
          enrichedCandidate = {
            ...enrichedCandidate,
            jobCategoryName,
            jobSubCategoryName,
          }
        }
        const agent = app.agentId ? await db.agents.getById(app.agentId) : null
        const agency =
          app.agencyId && app.agencyId !== 'direct'
            ? await db.agencies.getById(app.agencyId)
            : null

        let companyRegisteredName: string | undefined
        if (app.companyId) {
          const co = await db.companies.getById(app.companyId)
          companyRegisteredName = co?.name
        }

        return {
          ...app,
          companyRegisteredName,
          candidate: enrichedCandidate,
          agent: agent ? stripPassword(agent) : null,
          agency:
            app.agencyId === 'direct'
              ? { id: 'direct', label: 'Self-applied / direct' as const }
              : stripPassword(agency),
        }
      }),
    )

    return NextResponse.json({ success: true, demands, submissions })
  } catch (error) {
    return apiError(error, 500)
  }
}
