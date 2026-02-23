import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }

    const applications = await db.applications.getByAgencyId(agencyId)
    const agents = await db.agents.getByAgencyId(agencyId)
    const payments = await db.payments.getAll()
    const agencyPayments = payments.filter(p => p.entityId === agencyId)

    const totalEarnings = applications
      .filter(a => a.status === 'selected')
      .reduce((sum, a) => sum + (a.commission || 0), 0)

    const perAgentEarnings = agents.map(agent => {
      const agentApps = applications.filter(a => a.agentId === agent.id && a.status === 'selected')
      const earnings = agentApps.reduce((sum, a) => sum + (a.commission || 0) * (agent.commissionPercent / 100), 0)
      return {
        agentId: agent.id,
        agentName: agent.name,
        commissionPercent: agent.commissionPercent,
        applications: agentApps.length,
        earnings,
      }
    })

    const demandEarningsMap = new Map<string, { demandTitle: string; companyName: string; earnings: number; count: number }>()
    for (const app of applications.filter(a => a.status === 'selected')) {
      const key = app.demandId
      const existing = demandEarningsMap.get(key) || { demandTitle: app.demandTitle, companyName: app.companyName, earnings: 0, count: 0 }
      existing.earnings += app.commission || 0
      existing.count++
      demandEarningsMap.set(key, existing)
    }

    return NextResponse.json({
      success: true,
      totalEarnings,
      perAgentEarnings,
      perDemandEarnings: Array.from(demandEarningsMap.entries()).map(([id, data]) => ({ demandId: id, ...data })),
      paymentHistory: agencyPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        type: p.type,
        status: p.status,
        date: p.createdAt,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch commission data:', error)
    return NextResponse.json({ error: 'Failed to fetch commission data' }, { status: 500 })
  }
}
