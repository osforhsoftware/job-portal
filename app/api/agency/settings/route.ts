import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }
    const agency = await db.agencies.getById(agencyId)
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, agency })
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    const body = await request.json()
    const { agencyId, ...updates } = body

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }

    const allowedFields = ['name', 'phone', 'logoUrl', 'bankDetails', 'notificationPreferences']
    const sanitized: Record<string, any> = {}
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    const updated = await db.agencies.update(agencyId, sanitized)
    if (!updated) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    await logActivity({
      userId: agencyId,
      userName: updated.name,
      userType: 'agency',
      entityType: 'settings',
      entityId: agencyId,
      action: 'update',
      description: `Agency settings updated: ${Object.keys(sanitized).join(', ')}`,
      metadata: { updatedFields: Object.keys(sanitized) },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true, agency: updated })
  } catch (error) {
    console.error('Failed to update settings:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'settings',
      action: 'update',
      description: 'Failed to update agency settings',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
