import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Failed to submit applications:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    return NextResponse.json({ success: true, application: updated })
  } catch (error) {
    console.error('Failed to update application:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
