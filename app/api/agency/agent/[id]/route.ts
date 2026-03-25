import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    const { id } = await params
    const body = await request.json()
    console.log(body,"ppppppppppp")
    if (body.password) {
      body.password = hashPassword(body.password)
    }
    const updated = await db.agents.update(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    const { password: _pw, ...safeBody } = body
    await logActivity({
      userId: updated.agencyId || 'unknown',
      userType: 'agency',
      entityType: 'agent',
      entityId: id,
      action: 'update',
      description: `Agent updated: ${updated.name || id}`,
      metadata: { updatedFields: Object.keys(safeBody) },
      status: 'success',
      ip,
      userAgent: ua,
    })

    const { password: _, ...agentWithoutPassword } = updated
    return NextResponse.json({ success: true, agent: agentWithoutPassword })
  } catch (error) {
    console.error('Failed to update agent:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'agent',
      action: 'update',
      description: 'Failed to update agent',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    const { id } = await params
    const agent = await db.agents.getById(id)
    const deleted = await db.agents.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    await logActivity({
      userId: agent?.agencyId || 'unknown',
      userType: 'agency',
      entityType: 'agent',
      entityId: id,
      action: 'delete',
      description: `Agent deleted: ${agent?.name || id}`,
      metadata: { agentId: id, agentName: agent?.name, agentEmail: agent?.email },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete agent:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'agent',
      action: 'delete',
      description: 'Failed to delete agent',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
  }
}
