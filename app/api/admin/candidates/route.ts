import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const candidates = await db.candidates.getAll()
    const candidatesSafe = await Promise.all(candidates.map(async (candidate) => {
      const agency = candidate.agencyId ? await db.agencies.getById(candidate.agencyId) : null
      // never expose passwords
      const { password, ...rest } = candidate as any
      return { ...rest, agency: agency ? ({ ...agency, password: undefined } as any) : null }
    }))
    return NextResponse.json({ success: true, candidates: candidatesSafe })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { action, candidateId, ...updates } = body
    if (action === 'approve' && candidateId) {
      const candidate = await db.candidates.getById(candidateId)
      if (!candidate) {
        return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
      }
      await db.candidates.update(candidateId, { ...updates })
      await logActivity({ userType: 'superadmin', entityType: 'candidate', entityId: candidateId, action: 'approve_candidate', description: `Approved candidate ${(candidate as any).name || candidateId}`, metadata: { candidateId }, status: 'success', ip, userAgent: ua })
    }
  } catch (error) {
    await logActivity({ userType: 'superadmin', entityType: 'candidate', action: 'candidate_action', description: 'Candidate action failed', metadata: { error: String(error) }, status: 'failed', ip, userAgent: ua })
    return NextResponse.json(
      { error: 'Failed to update candidate' },
      { status: 500 }
    )
  }
}
