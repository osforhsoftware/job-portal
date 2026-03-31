import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: demandId } = await ctx.params
    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    const demand = await db.demands.getById(demandId)
    if (!demand) return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    if (String(demand.companyId) !== String(companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pending = await db.demandEditRequests.getPendingForDemand(demandId, companyId)
    return NextResponse.json({
      success: true,
      pending: pending ?? null,
    })
  } catch (error) {
    return apiError(error, 500)
  }
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const { id: demandId } = await ctx.params
    const body = await request.json()
    const { companyId, requestedByUserId, requestedByEmployeeName } = body as {
      companyId: string
      requestedByUserId?: string
      requestedByEmployeeName?: string
    }

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    const demand = await db.demands.getById(demandId)
    if (!demand) return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    if (String(demand.companyId) !== String(companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const before = await db.demandEditRequests.getPendingForDemand(demandId, companyId)
    if (!before) {
      return NextResponse.json({ error: 'No pending request to cancel' }, { status: 404 })
    }

    const cancelledCount = await db.demandEditRequests.cancelPendingForDemand(demandId, companyId)

    await logActivity({
      userId: requestedByUserId,
      userName: requestedByEmployeeName,
      userType: 'company',
      entityType: 'demand',
      entityId: demandId,
      action: 'update',
      description: `Cancelled pending demand ${before.changes?.markForDelete ? 'delete' : 'edit'} request for "${demand.jobTitle}"`,
      metadata: { companyId, demandId, requestId: before.id, cancelledCount },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Pending request cancelled',
      cancelledCount,
    })
  } catch (error) {
    await logActivity({
      userType: 'company',
      entityType: 'demand',
      action: 'update',
      description: 'Failed to cancel pending demand request',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return apiError(error, 500)
  }
}
