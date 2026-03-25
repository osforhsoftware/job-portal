import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const pending = await db.demandEditRequests.getPending()
    const demandIds = Array.from(new Set(pending.map((p) => p.demandId)))
    const demands = await Promise.all(demandIds.map((id) => db.demands.getById(id)))
    const byId = new Map(demands.filter(Boolean).map((d) => [String((d as any).id), d]))

    const enriched = pending.map((p) => ({
      ...p,
      demand: byId.get(String(p.demandId)) ?? null,
    }))

    return NextResponse.json({ success: true, pending: enriched, count: pending.length })
  } catch (error) {
    return apiError(error, 500)
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { action, requestId, adminUserId, note } = body as {
      action: 'approve' | 'reject'
      requestId: string
      adminUserId?: string
      note?: string
    }

    if (!action || !requestId) {
      return NextResponse.json({ error: 'Missing action or requestId' }, { status: 400 })
    }

    const req = await db.demandEditRequests.getById(requestId)
    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    if (req.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      const changes: any = req.changes || {}
      const demand = await db.demands.getById(req.demandId)

      if (changes.markForDelete) {
        if (demand) {
          await db.demands.delete(req.demandId)
        }
      } else {
        if (!demand) {
          await db.demandEditRequests.update(requestId, {
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedByUserId: adminUserId,
            reviewNote: 'Demand not found while approving edit; request auto-rejected.',
          })
          return NextResponse.json({ success: false, error: 'Demand not found; edit request rejected' }, { status: 404 })
        }
        await db.demands.update(req.demandId, req.changes as any)
      }
      await db.demandEditRequests.update(requestId, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedByUserId: adminUserId,
        reviewNote: note,
      })
      const jobTitle = demand?.jobTitle ?? 'Demand'
      await db.notifications.create({
        recipientType: 'company',
        recipientId: req.companyId,
        type: 'approval',
        title: 'Edit request approved',
        message: changes.markForDelete
          ? `Your request to delete "${jobTitle}" was approved.`
          : `Your edit request for "${jobTitle}" was approved and applied.`,
        link: '/company/demands',
      }).catch(() => {})
      await logActivity({
        userId: adminUserId || 'system',
        userName: 'Admin',
        userEmail: '',
        userType: 'superadmin',
        entityType: 'demand',
        entityId: req.demandId,
        action: changes.markForDelete ? 'approve_delete' : 'approve_edit',
        description: `Approved demand ${changes.markForDelete ? 'deletion' : 'edit'} request for: ${jobTitle}`,
        metadata: { requestId, demandId: req.demandId, companyId: req.companyId, jobTitle, isDelete: !!changes.markForDelete },
        status: 'success',
        ip,
        userAgent: ua,
      })
      return NextResponse.json({ success: true, message: changes.markForDelete ? 'Demand deleted' : 'Demand changes approved and applied' })
    }

    await db.demandEditRequests.update(requestId, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedByUserId: adminUserId,
      reviewNote: note,
    })
    const demandForReject = await db.demands.getById(req.demandId)
    const jobTitleReject = demandForReject?.jobTitle ?? 'Demand'
    await db.notifications.create({
      recipientType: 'company',
      recipientId: req.companyId,
      type: 'approval',
      title: 'Edit request rejected',
      message: `Your edit/delete request for "${jobTitleReject}" was rejected.`,
      link: '/company/demands',
    }).catch(() => {})
    await logActivity({
      userId: adminUserId || 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'demand',
      entityId: req.demandId,
      action: 'reject_edit',
      description: `Rejected demand edit request for: ${jobTitleReject}`,
      metadata: { requestId, demandId: req.demandId, companyId: req.companyId, jobTitle: jobTitleReject, note },
      status: 'success',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ success: true, message: 'Demand change request rejected' })
  } catch (error) {
    await logActivity({
      userId: 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'demand',
      entityId: '',
      action: 'demand_approval_action',
      description: `Failed to process demand approval: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return apiError(error, 500)
  }
}
