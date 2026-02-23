import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }

    const agency = await db.agencies.getById(agencyId)
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const candidates = await db.candidates.getAll()
    const agencyCandidates = candidates.filter(c => c.agencyId === agencyId)

    const applications = await db.applications.getByAgencyId(agencyId)
    const demands = await db.demands.getOpen()
    const agents = await db.agents.getByAgencyId(agencyId)

    const submitted = applications.length
    const selected = applications.filter((a) => a.status === 'selected' || a.status === 'hired').length
    const interviews = applications.filter((a) => a.status === 'interview').length
    const pending = applications.filter((a) => a.status === 'pending' || a.status === 'submitted').length
    const totalCommission = applications
      .filter((a) => a.status === 'selected' || a.status === 'hired')
      .reduce((sum, a) => sum + (a.commission || 0), 0)

    return NextResponse.json({
      success: true,
      stats: {
        totalCandidates: agencyCandidates.length,
        activeDemands: demands.length,
        submittedApplications: submitted,
        selectedCandidates: selected,
        totalInterviews: interviews,
        pendingApplications: pending,
        totalCommissionEarned: agency.totalCommission || totalCommission,
        pendingPayments: agency.totalRevenue ? agency.totalRevenue - totalCommission : 0,
        totalAgents: agents.length,
        subscriptionPlan: agency.subscriptionPlan,
        subscriptionStatus: agency.subscriptionStatus,
        cvUploadsUsed: agency.cvUploadsUsed,
        cvUploadLimit: agency.cvUploadLimit,
        bidsUsed: agency.bidsUsed,
        biddingLimit: agency.biddingLimit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch agency stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
