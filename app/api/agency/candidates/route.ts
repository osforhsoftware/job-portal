import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }

    const allCandidates = await db.candidates.getAll()
    const candidates = allCandidates.filter(c => c.agencyId === agencyId)

    const sources = await db.candidateSources.getByAgencyId(agencyId)
    const sourceMap = new Map(sources.map(s => [s.candidateId, s]))

    const enriched = candidates.map(c => ({
      ...c,
      source: sourceMap.get(c.id)?.sourceType || 'unknown',
      agentId: sourceMap.get(c.id)?.agentId,
    }))

    return NextResponse.json({ success: true, candidates: enriched })
  } catch (error) {
    console.error('Failed to fetch candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
