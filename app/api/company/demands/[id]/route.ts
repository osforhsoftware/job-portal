import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const demand = await db.demands.getById(id)
    if (!demand) return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    return NextResponse.json({ success: true, demand })
  } catch (error) {
    return apiError(error, 500)
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const { id: demandId } = await ctx.params
    const body = await request.json()
    const { companyId, requestedByUserId, requestedByEmployeeName, changes } = body as {
      companyId: string
      requestedByUserId?: string
      requestedByEmployeeName?: string
      changes: Record<string, unknown>
    }

    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }

    const demand = await db.demands.getById(demandId)
    if (!demand) return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    if (String(demand.companyId) !== String(companyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!changes || typeof changes !== 'object') {
      return NextResponse.json({ error: 'changes required' }, { status: 400 })
    }

    const created = await db.demandEditRequests.create({
      demandId,
      companyId,
      requestedByUserId,
      requestedByEmployeeName,
      changes,
      reviewedAt: undefined,
      reviewedByUserId: undefined,
      reviewNote: undefined,
    })

    const admins = (await db.users.getAll()).filter(
      (u) => u.role === 'admin' || u.role === 'super_admin'
    )
    for (const admin of admins) {
      await db.notifications.create({
        recipientType: 'admin',
        recipientId: admin.id,
        type: 'approval',
        title: 'Demand edit request',
        message: `Company requested edits for demand "${demand.jobTitle}". Review in Approvals.`,
        link: '/admin/approvals',
      }).catch(() => {})
    }

    await logActivity({
      userId: requestedByUserId,
      userName: requestedByEmployeeName,
      userType: 'company',
      entityType: 'demand',
      entityId: demandId,
      action: 'update',
      description: `Submitted edit request for demand "${demand.jobTitle}"`,
      metadata: { companyId, demandId, changedFields: Object.keys(changes) },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Edit request submitted for approval',
      request: created,
    })
  } catch (error) {
    await logActivity({
      userType: 'company',
      entityType: 'demand',
      action: 'update',
      description: 'Failed to submit demand edit request',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return apiError(error, 500)
  }
}

export async function DELETE(
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

    const created = await db.demandEditRequests.create({
      demandId,
      companyId,
      requestedByUserId,
      requestedByEmployeeName,
      changes: { markForDelete: true },
      reviewedAt: undefined,
      reviewedByUserId: undefined,
      reviewNote: undefined,
    })

    const admins = (await db.users.getAll()).filter(
      (u) => u.role === 'admin' || u.role === 'super_admin'
    )
    for (const admin of admins) {
      await db.notifications.create({
        recipientType: 'admin',
        recipientId: admin.id,
        type: 'approval',
        title: 'Demand delete request',
        message: `Company requested to delete demand "${demand.jobTitle}". Review in Approvals.`,
        link: '/admin/approvals',
      }).catch(() => {})
    }

    await logActivity({
      userId: requestedByUserId,
      userName: requestedByEmployeeName,
      userType: 'company',
      entityType: 'demand',
      entityId: demandId,
      action: 'delete',
      description: `Submitted delete request for demand "${demand.jobTitle}"`,
      metadata: { companyId, demandId },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Delete request submitted for approval',
      request: created,
    })
  } catch (error) {
    await logActivity({
      userType: 'company',
      entityType: 'demand',
      action: 'delete',
      description: 'Failed to submit demand delete request',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return apiError(error, 500)
  }
}

