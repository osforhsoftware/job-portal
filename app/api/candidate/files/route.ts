import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { deleteUploadIfExists, saveFile } from '@/lib/file-storage'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const candidateId = request.nextUrl.searchParams.get('candidateId')

    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID required' }, { status: 400 })
    }

    const candidate = await db.candidates.getById(candidateId)
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    return NextResponse.json({
      cvUrl: candidate.cvUrl || null,
      videoUrl: candidate.videoUrl || null,
      photoUrl: candidate.photoUrl || null,
      passportUrl: candidate.passportUrl || null,
    })
  } catch (error) {
    console.error('Fetch files error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    await initializeDatabase()
    const formData = await request.formData()

    const candidateId = formData.get('candidateId') as string
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID required' }, { status: 400 })
    }

    const candidate = await db.candidates.getById(candidateId)
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const cvFile = formData.get('cvFile') as File | null
    const videoFile = formData.get('videoFile') as File | null

    if (!cvFile && !videoFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const updates: Record<string, string> = {}

    if (cvFile) {
      const saved = await saveFile(cvFile, 'cv', { userId: candidateId })
      await deleteUploadIfExists(candidate.cvUrl)
      updates.cvUrl = saved.url
    }

    if (videoFile) {
      const saved = await saveFile(videoFile, 'video', { userId: candidateId })
      await deleteUploadIfExists(candidate.videoUrl)
      updates.videoUrl = saved.url
    }

    await db.candidates.update(candidateId, updates)

    const uploadedTypes = Object.keys(updates).map(k => k.replace('Url', ''))
    await logActivity({
      userId: candidateId,
      userType: 'candidate',
      entityType: 'file',
      entityId: candidateId,
      action: 'create',
      description: `Candidate uploaded file(s): ${uploadedTypes.join(', ')}`,
      metadata: { candidateId, fileTypes: uploadedTypes },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Files updated successfully',
      ...updates,
    })
  } catch (error: unknown) {
    console.error('File update error:', error)
    await logActivity({
      userType: 'candidate',
      entityType: 'file',
      action: 'create',
      description: 'Failed to upload candidate file(s)',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
