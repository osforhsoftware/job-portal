import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId')
    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 })
    }

    const agent = await db.agents.getById(agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const { password: _, ...agentData } = agent
    return NextResponse.json({ success: true, agent: agentData })
  } catch (error) {
    console.error('Failed to fetch agent profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { agentId, name, phone, password, photoUrl, idProofUrl } = body

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (name) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (password) updates.password = hashPassword(password)
    if (photoUrl !== undefined) updates.photoUrl = photoUrl
    if (idProofUrl !== undefined) {
      updates.idProofUrl = idProofUrl
      updates.idProofSubmittedAt = idProofUrl ? new Date().toISOString() : undefined
    }

    const updated = await db.agents.update(agentId, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const { password: _, ...agentData } = updated

    const updatedFields = Object.keys(updates).filter(k => k !== 'password')
    await logActivity({
      userId: agentId,
      userName: updated.name,
      userType: 'agent',
      entityType: 'agent',
      entityId: agentId,
      action: 'update',
      description: `Agent updated profile (${updatedFields.join(', ')})`,
      metadata: { agentId, updatedFields },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({ success: true, agent: agentData })
  } catch (error) {
    console.error('Failed to update agent profile:', error)
    await logActivity({
      userType: 'agent',
      entityType: 'agent',
      action: 'update',
      description: 'Failed to update agent profile',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
