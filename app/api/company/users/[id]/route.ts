import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  let id: string | undefined
  try {
    await initializeDatabase()
    ;({ id } = await params)
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const { isActive, name } = body as { isActive?: boolean; name?: string }

    const updated = await db.users.update(id, {
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(typeof name === 'string' ? { name: name.trim() } : {}),
    })

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { password: _pw, ...userWithoutPassword } = updated

    await logActivity({
      userId: id,
      userName: updated.name,
      userType: 'company',
      entityType: 'company',
      entityId: id,
      action: 'update',
      description: `Updated company user "${updated.name}"`,
      metadata: { updatedFields: Object.keys(body).filter(k => k !== 'password') },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    await logActivity({
      userType: 'company',
      entityType: 'company',
      action: 'update',
      description: 'Failed to update company user',
      metadata: { userId: id, error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return apiError(error, 500)
  }
}

