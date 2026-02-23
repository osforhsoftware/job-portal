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

    const allApps = await db.applications.getByAgencyId(agencyId)
    const agentApps = allApps.filter(a => a.agentId === agentId)
    const selectedApps = agentApps.filter(a => a.status === 'selected')

    const totalCommission = selectedApps.reduce(
      (sum, a) => sum + (a.commission || 0) * (agent.commissionPercent / 100), 0
    )

    const perDemand = new Map<string, { demandTitle: string; companyName: string; earnings: number; count: number }>()
    for (const app of selectedApps) {
      const existing = perDemand.get(app.demandId) || {
        demandTitle: app.demandTitle,
        companyName: app.companyName,
        earnings: 0,
        count: 0,
      }
      existing.earnings += (app.commission || 0) * (agent.commissionPercent / 100)
      existing.count++
      perDemand.set(app.demandId, existing)
    }

    return NextResponse.json({
      success: true,
      commissionPercent: agent.commissionPercent,
      totalEarnings: agent.totalEarnings || totalCommission,
      totalPlacements: selectedApps.length,
      perDemandEarnings: Array.from(perDemand.entries()).map(([id, data]) => ({ demandId: id, ...data })),
    })
  } catch (error) {
    console.error('Failed to fetch agent commission:', error)
    return NextResponse.json({ error: 'Failed to fetch commission' }, { status: 500 })
  }
}
