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

    const monthlyData: Record<string, { month: string; earnings: number; placements: number }> = {}

    for (const app of applications.filter(a => a.status === 'selected')) {
      const date = new Date(app.submittedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, earnings: 0, placements: 0 }
      }
      monthlyData[monthKey].earnings += app.commission || 0
      monthlyData[monthKey].placements++
    }

    const report = {
      totalApplications: applications.length,
      totalPlacements: applications.filter(a => a.status === 'selected').length,
      totalEarnings: applications.filter(a => a.status === 'selected').reduce((s, a) => s + (a.commission || 0), 0),
      totalAgents: agents.length,
      monthlyBreakdown: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
      agentPerformance: agents.map(agent => {
        const agentApps = applications.filter(a => a.agentId === agent.id)
        return {
          name: agent.name,
          totalSubmissions: agentApps.length,
          placements: agentApps.filter(a => a.status === 'selected').length,
          earnings: agentApps.filter(a => a.status === 'selected').reduce((s, a) => s + (a.commission || 0) * (agent.commissionPercent / 100), 0),
        }
      }),
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Failed to generate commission report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
