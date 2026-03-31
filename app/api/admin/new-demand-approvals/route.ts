import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const pending = await db.demands.getPendingNewDemands()
    return NextResponse.json({ success: true, pending, count: pending.length })
  } catch (error) {
    return apiError(error, 500)
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { action, demandId, adminUserId, note } = body as {
      action: 'approve' | 'reject'
      demandId: string
      adminUserId?: string
      note?: string
    }

    if (!action || !demandId) {
      return NextResponse.json({ error: 'Missing action or demandId' }, { status: 400 })
    }

    const demand = await db.demands.getById(demandId)
    if (!demand) return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    if (demand.approvalStatus !== 'pending') {
      return NextResponse.json({ error: 'This demand is not awaiting approval' }, { status: 400 })
    }

    const companyName = demand.companyName
    const jobTitle = demand.jobTitle

    if (action === 'approve') {
      await db.demands.update(demandId, { approvalStatus: 'approved' })

      const approvedAgencies = (await db.agencies.getAll()).filter(
        (a) => (a as { approvalStatus?: string }).approvalStatus === 'approved' && a.isActive
      )
      for (const agency of approvedAgencies) {
        await db.notifications
          .create({
            recipientType: 'agency',
            recipientId: agency.id,
            type: 'new_demand',
            title: 'New demand posted',
            message: `${companyName} posted a new demand: ${jobTitle}`,
            link: '/agency/demands',
          })
          .catch(() => {})
      }

      await db.notifications
        .create({
          recipientType: 'company',
          recipientId: demand.companyId,
          type: 'approval',
          title: 'Demand approved',
          message: `Your demand "${jobTitle}" was approved and is now visible to agencies.`,
          link: '/company/demands',
        })
        .catch(() => {})

      await logActivity({
        userId: adminUserId || 'system',
        userName: 'Admin',
        userEmail: '',
        userType: 'superadmin',
        entityType: 'demand',
        entityId: demandId,
        action: 'approve_new_demand',
        description: `Approved new demand: ${jobTitle}`,
        metadata: { demandId, companyId: demand.companyId, jobTitle, note },
        status: 'success',
        ip,
        userAgent: ua,
      }).catch(() => {})

      return NextResponse.json({ success: true, message: 'Demand approved and published' })
    }

    await db.demands.update(demandId, { approvalStatus: 'rejected' })

    await db.notifications
      .create({
        recipientType: 'company',
        recipientId: demand.companyId,
        type: 'approval',
        title: 'Demand not approved',
        message: note
          ? `Your demand "${jobTitle}" was not approved. Note: ${note}`
          : `Your demand "${jobTitle}" was not approved.`,
        link: '/company/demands',
      })
      .catch(() => {})

    await logActivity({
      userId: adminUserId || 'system',
      userName: 'Admin',
      userEmail: '',
      userType: 'superadmin',
      entityType: 'demand',
      entityId: demandId,
      action: 'reject_new_demand',
      description: `Rejected new demand: ${jobTitle}`,
      metadata: { demandId, companyId: demand.companyId, jobTitle, note },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Demand rejected' })
  } catch (error) {
    return apiError(error, 500)
  }
}
