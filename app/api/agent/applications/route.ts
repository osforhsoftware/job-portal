import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId')
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agentId || !agencyId) {
      return NextResponse.json({ error: 'agentId and agencyId required' }, { status: 400 })
    }

    const allApps = await db.applications.getByAgencyId(agencyId)
    const agentApps = allApps.filter(a => a.agentId === agentId)

    return NextResponse.json({ success: true, applications: agentApps })
  } catch (error) {
    console.error('Failed to fetch agent applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
