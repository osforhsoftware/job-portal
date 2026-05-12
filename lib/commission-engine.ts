// ONEMYJOB.COM commission engine — single source of truth.
// Implements the Agent & Agency Target / Bonus / Penalty / Performance-Score spec.
//
// All consumers (API routes, dashboards, admin tools) should import from here
// rather than re-implementing thresholds. The defaults are also persisted to the
// `commissionRules` collection on first read so admins can tweak them at runtime.

import { db } from './db'
import type {
  Application,
  CommissionRule,
  PerformanceTier,
  RatingLevel,
} from './db'

export const DEFAULT_COMMISSION_RULE: CommissionRule = {
  id: 'global',
  agent: {
    minTarget: 5,
    standardTarget: 10,
    highTarget: 20,
    belowMinPenaltyPercent: -5,
    bonusTiers: [
      { closures: 10, percent: 2 },
      { closures: 20, percent: 5 },
      { closures: 30, percent: 8 },
    ],
    mainCommissionPercent: 15,
    subCommissionPercent: 10,
  },
  agency: {
    minTarget: 20,
    standardTarget: 50,
    highTarget: 100,
    bonusTiers: [
      { closures: 50, percent: 3 },
      { closures: 100, percent: 5 },
      { closures: 200, percent: 8 },
    ],
  },
  speed: { within3Days: 3, within7Days: 2 },
  demand: {
    conversionPercent: 5,
    highValueMin: 100,
    highValueMax: 300,
  },
  quality: { bonusPercent: 2 },
  scoreWeights: { closures: 40, speed: 20, quality: 20, feedback: 20 },
  ratingThresholds: { elite: 90, good: 70, average: 50 },
  updatedAt: new Date().toISOString(),
}

/**
 * Returns the active commission rule, persisting the default on first call.
 */
export async function getCommissionRule(): Promise<CommissionRule> {
  const existing = await db.commissionRules.get()
  if (existing) return existing
  return db.commissionRules.set(DEFAULT_COMMISSION_RULE)
}

/* -------------------------------------------------------------------------- */
/*                                Tier helpers                                */
/* -------------------------------------------------------------------------- */

export function getTier(
  closures: number,
  scope: 'agent' | 'agency',
): PerformanceTier {
  if (scope === 'agent') {
    if (closures >= 31) return 'elite'
    if (closures >= 11) return 'growth'
    return 'basic'
  }
  // agency thresholds map to the spec's monthly bands
  if (closures >= 100) return 'elite'
  if (closures >= 50) return 'growth'
  return 'basic'
}

export function getTierLabel(tier: PerformanceTier): string {
  switch (tier) {
    case 'elite':
      return 'Elite (High Performer)'
    case 'growth':
      return 'Growth (Performing)'
    default:
      return 'Basic (Active)'
  }
}

/* -------------------------------------------------------------------------- */
/*                                Bonus helpers                               */
/* -------------------------------------------------------------------------- */

export function getTierBonusPercent(
  closures: number,
  rule: CommissionRule,
  scope: 'agent' | 'agency',
): number {
  const tiers =
    scope === 'agent' ? rule.agent.bonusTiers : rule.agency.bonusTiers
  let pct = 0
  for (const t of tiers) {
    if (closures >= t.closures) pct = t.percent
  }
  return pct
}

export function getSpeedBonusPercent(
  daysToClose: number | undefined,
  rule: CommissionRule,
): number {
  if (daysToClose === undefined || daysToClose === null) return 0
  if (daysToClose <= 3) return rule.speed.within3Days
  if (daysToClose <= 7) return rule.speed.within7Days
  return 0
}

export function getDemandConversionPercent(
  app: Pick<Application, 'fromConvertedDemand'>,
  rule: CommissionRule,
): number {
  return app.fromConvertedDemand ? rule.demand.conversionPercent : 0
}

export function getQualityBonusPercent(
  qualityFlag: boolean | undefined,
  rule: CommissionRule,
): number {
  return qualityFlag ? rule.quality.bonusPercent : 0
}

/* -------------------------------------------------------------------------- */
/*                              Penalty helpers                               */
/* -------------------------------------------------------------------------- */

export function getPenaltyPercent(
  closures: number,
  rule: CommissionRule,
  scope: 'agent' | 'agency',
): number {
  if (scope === 'agent') {
    return closures < rule.agent.minTarget ? rule.agent.belowMinPenaltyPercent : 0
  }
  // Spec only defines an explicit -% penalty for agents; agencies miss bonuses
  // when below minimum but don't take a flat -%. Admins can override later.
  return 0
}

/* -------------------------------------------------------------------------- */
/*                          Performance score & rating                        */
/* -------------------------------------------------------------------------- */

export interface PerformanceScoreInput {
  closuresPct: number // achievement vs target (0..100+)
  speedPct: number // % closed within 7 days (0..100)
  qualityPct: number // 0..100
  feedbackPct: number // 0..100
}

export function computePerformanceScore(
  input: PerformanceScoreInput,
  rule: CommissionRule,
): number {
  const w = rule.scoreWeights
  const total = w.closures + w.speed + w.quality + w.feedback
  if (total === 0) return 0
  const score =
    (clamp(input.closuresPct, 0, 100) * w.closures +
      clamp(input.speedPct, 0, 100) * w.speed +
      clamp(input.qualityPct, 0, 100) * w.quality +
      clamp(input.feedbackPct, 0, 100) * w.feedback) /
    total
  return Math.round(score)
}

export function getRatingLevel(
  score: number,
  rule: CommissionRule,
): RatingLevel {
  if (score >= rule.ratingThresholds.elite) return 'elite'
  if (score >= rule.ratingThresholds.good) return 'good'
  if (score >= rule.ratingThresholds.average) return 'average'
  return 'risk'
}

export function getRatingLabel(level: RatingLevel): string {
  switch (level) {
    case 'elite':
      return 'Elite'
    case 'good':
      return 'Good'
    case 'average':
      return 'Average'
    default:
      return 'At Risk'
  }
}

/* -------------------------------------------------------------------------- */
/*                          End-to-end commission calc                        */
/* -------------------------------------------------------------------------- */

export interface CommissionInput {
  /** Total AED earned from this placement (e.g. one month salary, fixed fee). */
  placementValue: number
  scope: 'agent' | 'agency'
  /** Agents only: 15% main vs 10% sub. Ignored for agencies. */
  isMainAgent?: boolean
  /** Closures already booked this period (used for tier bonus + penalty). */
  monthlyClosures: number
  application: Pick<
    Application,
    | 'daysToClose'
    | 'isHighValueDemand'
    | 'highValueBonusAmount'
    | 'fromConvertedDemand'
    | 'qualityFlag'
  >
  /** Quality flag carried on the entity (separate from per-application). */
  qualityFlag?: boolean
  rule: CommissionRule
}

export interface CommissionLine {
  label: string
  percent?: number
  amount: number
}

export interface CommissionBreakdown {
  basePercent: number
  base: number
  bonuses: CommissionLine[]
  penalties: CommissionLine[]
  total: number
}

export function computeCommission(input: CommissionInput): CommissionBreakdown {
  const { placementValue, scope, application, monthlyClosures, rule } = input

  const basePercent =
    scope === 'agent'
      ? input.isMainAgent
        ? rule.agent.mainCommissionPercent
        : rule.agent.subCommissionPercent
      : 0

  const base = (placementValue * basePercent) / 100

  const bonuses: CommissionLine[] = []
  const penalties: CommissionLine[] = []

  const tierPct = getTierBonusPercent(monthlyClosures, rule, scope)
  if (tierPct) {
    bonuses.push({
      label: 'Tier bonus',
      percent: tierPct,
      amount: (placementValue * tierPct) / 100,
    })
  }

  const speedPct = getSpeedBonusPercent(application.daysToClose, rule)
  if (speedPct) {
    bonuses.push({
      label: `Speed bonus (closed in ${application.daysToClose} days)`,
      percent: speedPct,
      amount: (placementValue * speedPct) / 100,
    })
  }

  const demandPct = getDemandConversionPercent(application, rule)
  if (demandPct) {
    bonuses.push({
      label: 'Demand-generation bonus',
      percent: demandPct,
      amount: (placementValue * demandPct) / 100,
    })
  }

  if (application.isHighValueDemand) {
    const flat = clamp(
      application.highValueBonusAmount ?? rule.demand.highValueMin,
      rule.demand.highValueMin,
      rule.demand.highValueMax,
    )
    bonuses.push({ label: 'High-value demand bonus', amount: flat })
  }

  const qualityPct = getQualityBonusPercent(
    input.qualityFlag || application.qualityFlag,
    rule,
  )
  if (qualityPct) {
    bonuses.push({
      label: 'Quality bonus',
      percent: qualityPct,
      amount: (placementValue * qualityPct) / 100,
    })
  }

  const penaltyPct = getPenaltyPercent(monthlyClosures, rule, scope)
  if (penaltyPct) {
    penalties.push({
      label: 'Below-minimum penalty',
      percent: penaltyPct,
      amount: (base * penaltyPct) / 100,
    })
  }

  const total =
    base +
    bonuses.reduce((s, b) => s + b.amount, 0) +
    penalties.reduce((s, p) => s + p.amount, 0)

  return { basePercent, base, bonuses, penalties, total: round2(total) }
}

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

export function getCurrentPeriodMonth(date: Date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function daysBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO).getTime()
  const end = new Date(endISO).getTime()
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
