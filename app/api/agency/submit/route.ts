import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    const body = await request.json()
    const { applicationIds, agencyId } = body

    if (!applicationIds?.length || !agencyId) {
      return NextResponse.json({ error: 'applicationIds and agencyId required' }, { status: 400 })
    }

    const results = []
    for (const appId of applicationIds) {
      const app = await db.applications.getById(appId)
      if (!app || app.agencyId !== agencyId) {
        results.push({ id: appId, status: 'error', message: 'Not found or unauthorized' })
        continue
      }
      if (app.status !== 'pending') {
        results.push({ id: appId, status: 'skipped', message: `Already ${app.status}` })
        continue
      }
      await db.applications.update(appId, { status: 'pending' })
      results.push({ id: appId, status: 'submitted' })
    }

    await logActivity({
      userId: agencyId,
      userType: 'agency',
      entityType: 'submission',
      entityId: agencyId,
      action: 'create',
      description: `Submitted ${results.filter(r => r.status === 'submitted').length} applications`,
      metadata: { applicationIds, submitted: results.filter(r => r.status === 'submitted').length, skipped: results.filter(r => r.status === 'skipped').length, errors: results.filter(r => r.status === 'error').length },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Failed to submit applications:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'submission',
      action: 'create',
      description: 'Failed to submit applications',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    const body = await request.json()
    const { applicationId, status, agencyId } = body

    if (!applicationId || !status || !agencyId) {
      return NextResponse.json({ error: 'applicationId, status, and agencyId required' }, { status: 400 })
    }

    const app = await db.applications.getById(applicationId)
    if (!app || app.agencyId !== agencyId) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updated = await db.applications.update(applicationId, { status })

    await logActivity({
      userId: agencyId,
      userType: 'agency',
      entityType: 'submission',
      entityId: applicationId,
      action: 'update',
      description: `Application status updated to '${status}'`,
      metadata: { applicationId, previousStatus: app.status, newStatus: status },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true, application: updated })
  } catch (error) {
    console.error('Failed to update application:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'submission',
      action: 'update',
      description: 'Failed to update application',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
