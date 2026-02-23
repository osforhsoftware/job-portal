import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId')
    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 })
    }

    const sources = await db.candidateSources.getByAgentId(agentId)
    const candidateIds = sources.map(s => s.candidateId)

    const allCandidates = await db.candidates.getAll()
    const candidates = allCandidates
      .filter(c => candidateIds.includes(c.id))
      .map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        skills: c.skills,
        status: c.status,
        currentLocation: c.currentLocation,
        createdAt: c.createdAt,
        source: sources.find(s => s.candidateId === c.id)?.sourceType || 'unknown',
      }))

    return NextResponse.json({ success: true, candidates })
  } catch (error) {
    console.error('Failed to fetch agent candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
