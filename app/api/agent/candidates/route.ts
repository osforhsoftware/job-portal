import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { classifyCandidateJobCategories } from '@/lib/candidate-job-classification'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId')
    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 })
    }

    const sources = await db.candidateSources.getByAgentId(agentId)
    const candidateIds = sources.map(s => s.candidateId)

    const [allCandidates, jobCategories, jobSubCategories] = await Promise.all([
      db.candidates.getAll(),
      db.jobCategories.getAll(),
      db.jobSubCategories.getAll(),
    ])

    const candidates = allCandidates
      .filter(c => candidateIds.includes(c.id))
      .map(c => {
        const cls = classifyCandidateJobCategories(c, jobCategories, jobSubCategories)
        return {
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          skills: c.skills,
          status: c.status,
          currentLocation: c.currentLocation,
          createdAt: c.createdAt,
          source: sources.find(s => s.candidateId === c.id)?.sourceType || 'unknown',
          dateOfBirth: c.dateOfBirth,
          gender: c.gender,
          nationality: c.nationality,
          maritalStatus: c.maritalStatus,
          currentSalary: c.currentSalary,
          salaryExpectation: c.salaryExpectation ?? c.expectedSalary,
          visaValidity: c.visaValidity ?? c.visaCategory,
          languages: c.languages,
          remarks: (c as any).remarks,
          jobCategoryId: c.jobCategoryId,
          jobSubCategoryId: c.jobSubCategoryId,
          jobCategories: c.jobCategories,
          jobCategoryName: cls.jobCategoryName,
          jobSubCategoryName: cls.jobSubCategoryName,
          subCategoryIds: cls.subCategoryIds,
          parentCategoryIds: cls.parentCategoryIds,
          cvUrl: c.cvUrl,
        }
      })

    return NextResponse.json({ success: true, candidates })
  } catch (error) {
    console.error('Failed to fetch agent candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
