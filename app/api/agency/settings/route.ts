import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    return NextResponse.json({ success: true, agency: updated })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
