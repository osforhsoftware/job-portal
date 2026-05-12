import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { CommissionRule } from '@/lib/db'
import {
  DEFAULT_COMMISSION_RULE,
  getCommissionRule,
} from '@/lib/commission-engine'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const rule = await getCommissionRule()
    return NextResponse.json({ success: true, rule })
  } catch (error) {
    console.error('Failed to fetch commission rule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commission rule' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = (await request.json()) as Partial<CommissionRule>
    const current = await getCommissionRule()

    const merged: CommissionRule = {
      ...current,
      ...body,
      id: 'global',
      agent: { ...current.agent, ...(body.agent ?? {}) },
      agency: { ...current.agency, ...(body.agency ?? {}) },
      speed: { ...current.speed, ...(body.speed ?? {}) },
      demand: { ...current.demand, ...(body.demand ?? {}) },
      quality: { ...current.quality, ...(body.quality ?? {}) },
      scoreWeights: { ...current.scoreWeights, ...(body.scoreWeights ?? {}) },
      ratingThresholds: {
        ...current.ratingThresholds,
        ...(body.ratingThresholds ?? {}),
      },
      updatedAt: new Date().toISOString(),
    }

    if (
      merged.scoreWeights.closures +
        merged.scoreWeights.speed +
        merged.scoreWeights.quality +
        merged.scoreWeights.feedback ===
      0
    ) {
      return NextResponse.json(
        { error: 'Score weights cannot all be zero' },
        { status: 400 },
      )
    }

    const saved = await db.commissionRules.set(merged)
    await logActivity({
      userType: 'superadmin',
      entityType: 'settings',
      action: 'update_commission_rule',
      description: 'Updated commission/target/bonus rule',
      metadata: { rule: saved },
      status: 'success',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ success: true, rule: saved })
  } catch (error) {
    console.error('Failed to update commission rule:', error)
    await logActivity({
      userType: 'superadmin',
      entityType: 'settings',
      action: 'update_commission_rule',
      description: 'Commission rule update failed',
      metadata: { error: String(error) },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json(
      { error: 'Failed to update commission rule' },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const reset = await db.commissionRules.set({
      ...DEFAULT_COMMISSION_RULE,
      updatedAt: new Date().toISOString(),
    })
    return NextResponse.json({ success: true, rule: reset })
  } catch (error) {
    console.error('Failed to reset commission rule:', error)
    return NextResponse.json(
      { error: 'Failed to reset commission rule' },
      { status: 500 },
    )
  }
}
