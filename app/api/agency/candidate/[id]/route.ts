import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
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
    const updated = await db.candidates.update(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    await logActivity({
      userId: updated.agencyId || 'unknown',
      userType: 'agency',
      entityType: 'candidate',
      entityId: id,
      action: 'update',
      description: `Candidate updated: ${updated.firstName || ''} ${updated.lastName || ''} (${id})`,
      metadata: { updatedFields: Object.keys(body) },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true, candidate: updated })
  } catch (error) {
    console.error('Failed to update candidate:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'candidate',
      action: 'update',
      description: 'Failed to update candidate',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 })
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
    const candidate = await db.candidates.getById(id)
    const database = await getDatabase()
    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id }
    const result = await database.collection('candidates').deleteOne(query)
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    await logActivity({
      userId: candidate?.agencyId || 'unknown',
      userType: 'agency',
      entityType: 'candidate',
      entityId: id,
      action: 'delete',
      description: `Candidate deleted: ${candidate?.firstName || ''} ${candidate?.lastName || ''} (${id})`,
      metadata: { candidateId: id, candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'unknown' },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete candidate:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'candidate',
      action: 'delete',
      description: 'Failed to delete candidate',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 })
  }
}
