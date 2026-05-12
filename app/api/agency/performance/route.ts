import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  computeCommission,
  computePerformanceScore,
  daysBetween,
  getCommissionRule,
  getCurrentPeriodMonth,
  getRatingLevel,
  getTier,
  getTierBonusPercent,
} from '@/lib/commission-engine'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }

    const [agency, apps, rule, agents] = await Promise.all([
      db.agencies.getById(agencyId),
      db.applications.getByAgencyId(agencyId),
      getCommissionRule(),
      db.agents.getByAgencyId(agencyId),
    ])
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const period = getCurrentPeriodMonth()
    const selectedApps = apps.filter(
      (a) => a.status === 'selected' || a.status === 'hired',
    )
    const monthlySelected = selectedApps.filter((a) => {
      const when = a.selectedAt || a.updatedAt
      return when && when.startsWith(period)
    })
    const monthlyClosures = monthlySelected.length

    const tier = getTier(monthlyClosures, 'agency')
    const tierBonusPercent = getTierBonusPercent(monthlyClosures, rule, 'agency')

    const withSpeed = monthlySelected.filter((a) => {
      const days =
        a.daysToClose ??
        (a.selectedAt ? daysBetween(a.submittedAt, a.selectedAt) : undefined)
      return days !== undefined && days <= 7
    }).length
    const speedPct = monthlyClosures
      ? Math.round((withSpeed / monthlyClosures) * 100)
      : 0
    const closuresPct = Math.min(
      Math.round((monthlyClosures / rule.agency.standardTarget) * 100),
      100,
    )
    const qualityPct = agency.qualityFlag ? 100 : 60
    const feedbackPct =
      typeof agency.feedbackScore === 'number' ? agency.feedbackScore : 70

    const performanceScore = computePerformanceScore(
      { closuresPct, speedPct, qualityPct, feedbackPct },
      rule,
    )
    const ratingLevel = getRatingLevel(performanceScore, rule)

    let bonusAmountThisMonth = 0
    let penaltyAmountThisMonth = 0
    for (const app of monthlySelected) {
      const breakdown = computeCommission({
        placementValue: app.placementValue ?? app.commission ?? 0,
        scope: 'agency',
        monthlyClosures,
        application: app,
        qualityFlag: agency.qualityFlag,
        rule,
      })
      for (const b of breakdown.bonuses) bonusAmountThisMonth += b.amount
      for (const p of breakdown.penalties) penaltyAmountThisMonth += p.amount
    }

    // Top contributing agents this month
    const agentMap = new Map<string, { name: string; closures: number }>()
    for (const a of monthlySelected) {
      if (!a.agentId) continue
      const found = agents.find((x) => x.id === a.agentId)
      if (!found) continue
      const cur = agentMap.get(a.agentId) || { name: found.name, closures: 0 }
      cur.closures += 1
      agentMap.set(a.agentId, cur)
    }
    const topAgents = Array.from(agentMap.entries())
      .map(([id, v]) => ({ agentId: id, ...v }))
      .sort((a, b) => b.closures - a.closures)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      period,
      tier,
      ratingLevel,
      performanceScore,
      monthlyClosures,
      target: {
        min: rule.agency.minTarget,
        standard: rule.agency.standardTarget,
        high: rule.agency.highTarget,
        achieved: monthlyClosures,
        percentToStandard: Math.min(
          Math.round((monthlyClosures / rule.agency.standardTarget) * 100),
          100,
        ),
        percentToHigh: Math.min(
          Math.round((monthlyClosures / rule.agency.highTarget) * 100),
          100,
        ),
      },
      bonuses: {
        tierBonusPercent,
        amountThisMonth: Math.round(bonusAmountThisMonth * 100) / 100,
      },
      penalty: {
        amountThisMonth: Math.round(penaltyAmountThisMonth * 100) / 100,
        belowMinimum: monthlyClosures < rule.agency.minTarget,
      },
      score: {
        weights: rule.scoreWeights,
        breakdown: { closuresPct, speedPct, qualityPct, feedbackPct },
      },
      topAgents,
      rule,
    })
  } catch (error) {
    console.error('Failed to fetch agency performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agency performance' },
      { status: 500 },
    )
  }
}
