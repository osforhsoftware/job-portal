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
} from '@/lib/commission-engine'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId')
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agentId || !agencyId) {
      return NextResponse.json(
        { error: 'agentId and agencyId required' },
        { status: 400 },
      )
    }

    const [agent, allApps, rule] = await Promise.all([
      db.agents.getById(agentId),
      db.applications.getByAgencyId(agencyId),
      getCommissionRule(),
    ])
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const period = getCurrentPeriodMonth()
    const agentApps = allApps.filter((a) => a.agentId === agentId)
    const selectedApps = agentApps.filter(
      (a) => a.status === 'selected' || a.status === 'hired',
    )

    const monthlySelected = selectedApps.filter((a) => {
      const when = a.selectedAt || a.updatedAt
      return when && when.startsWith(period)
    })
    const monthlyClosures = monthlySelected.length

    const tier = getTier(monthlyClosures, 'agent')

    // Speed metric — % of monthly placements closed within 7 days.
    const withSpeed = monthlySelected.filter((a) => {
      const days =
        a.daysToClose ??
        (a.selectedAt
          ? daysBetween(a.submittedAt, a.selectedAt)
          : undefined)
      return days !== undefined && days <= 7
    }).length
    const speedPct = monthlyClosures
      ? Math.round((withSpeed / monthlyClosures) * 100)
      : 0

    const closuresPct = Math.min(
      Math.round((monthlyClosures / rule.agent.standardTarget) * 100),
      100,
    )
    const qualityPct = agent.qualityFlag ? 100 : 60
    const feedbackPct =
      typeof agent.feedbackScore === 'number' ? agent.feedbackScore : 70

    const performanceScore = computePerformanceScore(
      { closuresPct, speedPct, qualityPct, feedbackPct },
      rule,
    )
    const ratingLevel = getRatingLevel(performanceScore, rule)

    // Aggregate this month's bonuses + penalties (live from the engine).
    const totalsBonusPercent: Record<string, number> = {}
    let bonusAmountThisMonth = 0
    let penaltyAmountThisMonth = 0
    for (const app of monthlySelected) {
      const breakdown = computeCommission({
        placementValue: app.placementValue ?? app.commission ?? 0,
        scope: 'agent',
        isMainAgent: agent.isMainAgent ?? true,
        monthlyClosures,
        application: app,
        qualityFlag: agent.qualityFlag,
        rule,
      })
      for (const b of breakdown.bonuses) {
        bonusAmountThisMonth += b.amount
        if (b.percent !== undefined) {
          totalsBonusPercent[b.label] = b.percent
        }
      }
      for (const p of breakdown.penalties) penaltyAmountThisMonth += p.amount
    }

    return NextResponse.json({
      success: true,
      period,
      tier,
      ratingLevel,
      performanceScore,
      monthlyClosures,
      target: {
        min: rule.agent.minTarget,
        standard: rule.agent.standardTarget,
        high: rule.agent.highTarget,
        achieved: monthlyClosures,
        percentToStandard: Math.min(
          Math.round((monthlyClosures / rule.agent.standardTarget) * 100),
          100,
        ),
        percentToHigh: Math.min(
          Math.round((monthlyClosures / rule.agent.highTarget) * 100),
          100,
        ),
      },
      commission: {
        basePercent: agent.isMainAgent ?? true
          ? rule.agent.mainCommissionPercent
          : rule.agent.subCommissionPercent,
        isMainAgent: agent.isMainAgent ?? true,
      },
      bonuses: {
        bandPercent: totalsBonusPercent,
        amountThisMonth: Math.round(bonusAmountThisMonth * 100) / 100,
      },
      penalty: {
        amountThisMonth: Math.round(penaltyAmountThisMonth * 100) / 100,
        belowMinimum: monthlyClosures < rule.agent.minTarget,
      },
      score: {
        weights: rule.scoreWeights,
        breakdown: { closuresPct, speedPct, qualityPct, feedbackPct },
      },
      rule,
    })
  } catch (error) {
    console.error('Failed to fetch agent performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent performance' },
      { status: 500 },
    )
  }
}
