import { NextRequest, NextResponse } from 'next/server'
import { db, Plan } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const plans = await db.plans.getAll()
    return NextResponse.json({ success: true, plans })
  } catch (error) {
    console.error('Plans fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

function parsePlanBody(body: any): Omit<Plan, 'id' | 'createdAt'> | null {
  const { name, type, level, price, features, isActive } = body
  if (!name || !type || !level) return null
  const priceNum = typeof price === 'number' ? price : parseFloat(price)
  if (isNaN(priceNum) || priceNum < 0) return null
  if (type !== 'agency' && type !== 'company') return null
  const plan: Omit<Plan, 'id' | 'createdAt'> = {
    name: String(name),
    type,
    level: String(level),
    price: priceNum,
    features: typeof features === 'object' && features !== null ? features : {},
    isActive: isActive !== false,
  }
  return plan
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const plan = parsePlanBody(body)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan: name, type, level, and price required' },
        { status: 400 }
      )
    }
    const created = await db.plans.create(plan)
    await logActivity({ userType: 'superadmin', entityType: 'plan', entityId: created.id, action: 'create_plan', description: `Created plan ${plan.name}`, metadata: { planName: plan.name, type: plan.type, level: plan.level, price: plan.price }, status: 'success', ip, userAgent: ua })
    return NextResponse.json({ success: true, plan: created })
  } catch (error) {
    console.error('Plan create error:', error)
    await logActivity({ userType: 'superadmin', entityType: 'plan', action: 'create_plan', description: 'Plan creation failed', metadata: { error: String(error) }, status: 'failed', ip, userAgent: ua })
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const planId = id != null ? String(id) : ''
    if (!planId) {
      return NextResponse.json({ error: 'Plan id required' }, { status: 400 })
    }
    const sanitized: Partial<Plan> = {}
    if (updates.name !== undefined) sanitized.name = String(updates.name)
    if (updates.type !== undefined) {
      if (updates.type !== 'agency' && updates.type !== 'company') {
        return NextResponse.json({ error: 'type must be agency or company' }, { status: 400 })
      }
      sanitized.type = updates.type
    }
    if (updates.level !== undefined) sanitized.level = String(updates.level)
    if (updates.price !== undefined) sanitized.price = Number(updates.price)
    if (updates.features !== undefined) sanitized.features = typeof updates.features === 'object' ? updates.features : {}
    if (updates.isActive !== undefined) sanitized.isActive = !!updates.isActive

    const updated = await db.plans.update(planId, sanitized)
    if (!updated) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    await logActivity({ userType: 'superadmin', entityType: 'plan', entityId: planId, action: 'update_plan', description: `Updated plan ${updated.name}`, metadata: { planName: updated.name, updates: sanitized }, status: 'success', ip, userAgent: ua })
    return NextResponse.json({ success: true, plan: updated })
  } catch (error) {
    console.error('Plan update error:', error)
    await logActivity({ userType: 'superadmin', entityType: 'plan', action: 'update_plan', description: 'Plan update failed', metadata: { error: String(error) }, status: 'failed', ip, userAgent: ua })
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}
