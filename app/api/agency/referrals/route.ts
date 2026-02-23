import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }

    const agents = await db.agents.getByAgencyId(agencyId)
    const sources = await db.candidateSources.getByAgencyId(agencyId)
    const referralSources = sources.filter(s => s.sourceType === 'referral' || s.sourceType === 'link')

    const agency = await db.agencies.getById(agencyId)

    const agentReferrals = agents.map(agent => {
      const agentSources = referralSources.filter(s => s.agentId === agent.id)
      return {
        agentId: agent.id,
        agentName: agent.name,
        referralCode: agent.referralCode,
        totalReferrals: agentSources.length,
        totalPlacements: agent.totalPlacements,
        totalEarnings: agent.totalEarnings,
      }
    })

    return NextResponse.json({
      success: true,
      agencyReferralLink: agency?.referralLink || '',
      totalReferrals: referralSources.length,
      agentReferrals,
    })
  } catch (error) {
    console.error('Failed to fetch referrals:', error)
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 })
  }
}
