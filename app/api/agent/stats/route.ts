import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId')
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agentId || !agencyId) {
      return NextResponse.json({ error: 'agentId and agencyId required' }, { status: 400 })
    }

    const agent = await db.agents.getById(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const sources = await db.candidateSources.getByAgentId(agentId)
    const applications = await db.applications.getByAgencyId(agencyId)
    const agentApps = applications.filter((a) => a.agentId === agentId)
    const points = await db.agentPoints.getByAgentId(agentId)
    const totalPoints = points.reduce((s, p) => s + p.points, 0)

    return NextResponse.json({
      success: true,
      stats: {
        totalReferrals: sources.length,
        totalCandidates: sources.length,
        totalApplications: agentApps.length,
        pendingApplications: agentApps.filter((a) => a.status === 'pending' || a.status === 'submitted').length,
        shortlisted: agentApps.filter((a) => a.status === 'shortlisted').length,
        interview: agentApps.filter((a) => a.status === 'interview').length,
        selected: agentApps.filter((a) => a.status === 'selected' || a.status === 'hired').length,
        rejected: agentApps.filter((a) => a.status === 'rejected').length,
        totalEarnings: agent.totalEarnings,
        totalPlacements: agent.totalPlacements,
        totalPoints,
        commissionPercent: agent.commissionPercent,
        referralCode: agent.referralCode,
      },
    })
  } catch (error) {
    console.error('Failed to fetch agent stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
