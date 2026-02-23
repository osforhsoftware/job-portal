import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId required' }, { status: 400 })
    }
    const applications = await db.applications.getByAgencyId(agencyId)
    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
