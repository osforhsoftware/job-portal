import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

async function getSettingsPayload() {
  const [videoRequiredSetting, commissionRateSetting, defaultAgencyIdSetting] = await Promise.all([
    db.settings.get('videoRequired'),
    db.settings.get('commissionRate'),
    db.settings.get('defaultAgencyId'),
  ])
  const videoRequired = videoRequiredSetting?.value === true
  const commissionRate = typeof commissionRateSetting?.value === 'number'
    ? commissionRateSetting.value
    : 0.15
  let defaultAgencyId: string | null = null
  const raw = defaultAgencyIdSetting?.value
  if (typeof raw === 'string' && raw.trim()) {
    defaultAgencyId = raw.trim()
  }
  return { videoRequired, commissionRate, defaultAgencyId }
}

export async function GET() {
  try {
    const settings = await getSettingsPayload()
    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { videoRequired, commissionRate, defaultAgencyId } = body

    if (videoRequired !== undefined) {
      await db.settings.set('videoRequired', !!videoRequired)
    }
    if (commissionRate !== undefined) {
      const rate = Number(commissionRate)
      if (rate < 0 || rate > 1) {
        return NextResponse.json(
          { error: 'Commission rate must be between 0 and 1 (e.g. 0.15 for 15%)' },
          { status: 400 }
        )
      }
      await db.settings.set('commissionRate', rate)
    }
    if (defaultAgencyId !== undefined) {
      const cleared =
        defaultAgencyId === null ||
        defaultAgencyId === '' ||
        (typeof defaultAgencyId === 'string' && defaultAgencyId.trim() === '')
      if (cleared) {
        await db.settings.set('defaultAgencyId', null)
      } else if (typeof defaultAgencyId === 'string') {
        const id = defaultAgencyId.trim()
        const agency = await db.agencies.getById(id)
        if (!agency) {
          return NextResponse.json({ error: 'Agency not found' }, { status: 400 })
        }
        if (agency.approvalStatus !== 'approved') {
          return NextResponse.json(
            { error: 'Only approved agencies can be set as the default' },
            { status: 400 }
          )
        }
        if (!agency.isActive) {
          return NextResponse.json(
            { error: 'Agency must be active to be set as the default' },
            { status: 400 }
          )
        }
        await db.settings.set('defaultAgencyId', id)
      } else {
        return NextResponse.json({ error: 'defaultAgencyId must be a string or null' }, { status: 400 })
      }
    }

    const settings = await getSettingsPayload()
    await logActivity({ userType: 'superadmin', entityType: 'settings', action: 'update_settings', description: 'Updated platform settings', metadata: { videoRequired, commissionRate, defaultAgencyId }, status: 'success', ip, userAgent: ua })
    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('Settings update error:', error)
    await logActivity({ userType: 'superadmin', entityType: 'settings', action: 'update_settings', description: 'Settings update failed', metadata: { error: String(error) }, status: 'failed', ip, userAgent: ua })
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
