import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const agent = await db.agents.getById(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const sources = await db.candidateSources.getByAgentId(agentId)
    const applications = await db.applications.getByAgencyId(agent.agencyId)
    const agentApps = applications.filter(a => a.agentId === agentId)

    return NextResponse.json({
      success: true,
      stats: {
        agentName: agent.name,
        referralCode: agent.referralCode,
        totalReferrals: sources.length,
        totalApplications: agentApps.length,
        totalPlacements: agentApps.filter(a => a.status === 'selected').length,
        totalEarnings: agent.totalEarnings,
        commissionPercent: agent.commissionPercent,
      },
    })
  } catch (error) {
    console.error('Failed to fetch referral stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
