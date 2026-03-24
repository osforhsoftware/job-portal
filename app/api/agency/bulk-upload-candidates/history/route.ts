import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const agencyId = request.nextUrl.searchParams.get('agencyId')
    if (!agencyId) return NextResponse.json({ error: 'agencyId required' }, { status: 400 })

    const agency = await db.agencies.getById(agencyId)
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

    // For MVP: return history for the agency. (uploadedBy filtering can be added later)
    const database = await getDatabase()
    const batches = await database
      .collection('uploadBatches')
      .find({ agencyId })
      .sort({ uploadedAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({ success: true, batches })
  } catch (error) {
    return apiError(error, 500)
  }
}

