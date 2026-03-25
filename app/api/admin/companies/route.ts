import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const companies = await db.companies.getAll()
    const companiesSafe = companies.map(({ password, ...rest }) => rest)
    companiesSafe.sort((a, b) => {
      const dateA = new Date((a as any).createdAt || 0).getTime()
      const dateB = new Date((b as any).createdAt || 0).getTime()
      return dateB - dateA
    })
    return NextResponse.json({ success: true, companies: companiesSafe })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { action, companyId, subscriptionPlan, subscriptionStatus, ...rest } = body as {
      action: string
      companyId: string
      subscriptionPlan?: string
      subscriptionStatus?: string
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    const company = await db.companies.getById(companyId)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (action === 'approve') {
      await db.companies.update(companyId, {
        isActive: true,
        subscriptionStatus: 'active' as 'active',
        ...rest,
      })
      const updated = await db.companies.getById(companyId)
      if (!updated) return NextResponse.json({ success: true, company: null })
      const { password, ...safe } = updated as any
      await logActivity({ userType: 'superadmin', entityType: 'company', entityId: companyId, action: 'approve_company', description: `Approved company ${company.name}`, metadata: { companyName: company.name }, status: 'success', ip, userAgent: ua })
      return NextResponse.json({ success: true, company: safe })
    }

    if (action === 'reject') {
      await db.companies.update(companyId, {
        isActive: false,
        subscriptionStatus: 'cancelled' as 'cancelled',
      })
      const updated = await db.companies.getById(companyId)
      if (!updated) return NextResponse.json({ success: true, company: null })
      const { password, ...safe } = updated as any
      await logActivity({ userType: 'superadmin', entityType: 'company', entityId: companyId, action: 'reject_company', description: `Rejected company ${company.name}`, metadata: { companyName: company.name }, status: 'success', ip, userAgent: ua })
      return NextResponse.json({ success: true, company: safe })
    }

    if (action === 'setActive') {
      await db.companies.update(companyId, { isActive: true })
      const updated = await db.companies.getById(companyId)
      if (!updated) return NextResponse.json({ success: true, company: null })
      const { password, ...safe } = updated as any
      await logActivity({ userType: 'superadmin', entityType: 'company', entityId: companyId, action: 'set_active', description: `Set company ${company.name} to active`, metadata: { companyName: company.name }, status: 'success', ip, userAgent: ua })
      return NextResponse.json({ success: true, company: safe })
    }

    if (action === 'setInactive') {
      await db.companies.update(companyId, { isActive: false })
      const updated = await db.companies.getById(companyId)
      if (!updated) return NextResponse.json({ success: true, company: null })
      const { password, ...safe } = updated as any
      await logActivity({ userType: 'superadmin', entityType: 'company', entityId: companyId, action: 'set_inactive', description: `Set company ${company.name} to inactive`, metadata: { companyName: company.name }, status: 'success', ip, userAgent: ua })
      return NextResponse.json({ success: true, company: safe })
    }

    if (action === 'updateSubscription') {
      const updates: Record<string, unknown> = {}
      if (subscriptionPlan !== undefined) {
        updates.subscriptionPlan = subscriptionPlan
      }
      if (subscriptionStatus !== undefined) {
        updates.subscriptionStatus = subscriptionStatus
      }
      await db.companies.update(companyId, updates as any)
      const updated = await db.companies.getById(companyId)
      if (!updated) return NextResponse.json({ success: true, company: null })
      const { password, ...safe } = updated as any
      await logActivity({ userType: 'superadmin', entityType: 'company', entityId: companyId, action: 'update_subscription', description: `Updated subscription for company ${company.name}`, metadata: { companyName: company.name, subscriptionPlan, subscriptionStatus }, status: 'success', ip, userAgent: ua })
      return NextResponse.json({ success: true, company: safe })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    await logActivity({ userType: 'superadmin', entityType: 'company', action: 'company_action', description: 'Company action failed', metadata: { error: String(error) }, status: 'failed', ip, userAgent: ua })
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}
