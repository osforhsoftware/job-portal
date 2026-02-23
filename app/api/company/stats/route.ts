import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    const company = await db.companies.getById(companyId)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const demands = await db.demands.getByCompanyId(companyId)
    const applications = await db.applications.getByCompanyId(companyId)

    const openDemands = demands.filter((d) => d.status === 'open')
    const totalSubmissions = applications.length
    const hired = applications.filter((a) => a.status === 'hired' || a.status === 'selected').length
    const shortlisted = applications.filter((a) => a.status === 'shortlisted').length
    const interview = applications.filter((a) => a.status === 'interview').length
    const submitted = applications.filter((a) => a.status === 'submitted' || a.status === 'pending').length

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const hiredThisMonth = applications.filter(
      (a) => (a.status === 'hired' || a.status === 'selected') && a.updatedAt >= startOfMonth
    ).length

    const recentDemands = demands
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    const recentSubmissions = applications
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 8)

    const submissionsWithCandidate = await Promise.all(
      recentSubmissions.map(async (app) => {
        const candidate = await db.candidates.getById(app.candidateId)
        const demand = demands.find((d) => d.id === app.demandId)
        return {
          id: app.id,
          candidateName: app.candidateName,
          demandTitle: app.demandTitle,
          demandId: app.demandId,
          status: app.status,
          submittedAt: app.submittedAt,
          candidateRole: demand?.jobTitle ?? app.demandTitle,
        }
      })
    )

    return NextResponse.json({
      success: true,
      stats: {
        activeDemands: openDemands.length,
        totalDemands: demands.length,
        totalSubmissions,
        submitted,
        shortlisted,
        interview,
        hired,
        hiredThisMonth,
        companyName: company.name,
      },
      recentDemands: recentDemands.map((d) => ({
        id: d.id,
        jobTitle: d.jobTitle,
        location: d.location,
        positions: d.positions,
        filledPositions: d.filledPositions,
        status: d.status,
        createdAt: d.createdAt,
        submissionCount: applications.filter((a) => a.demandId === d.id).length,
      })),
      recentSubmissions: submissionsWithCandidate,
    })
  } catch (error) {
    return apiError(error, 500)
  }
}
