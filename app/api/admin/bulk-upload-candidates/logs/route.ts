import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase()
    const agencyId = request.nextUrl.searchParams.get('agencyId') || undefined
    const database = await getDatabase()

    const query = agencyId ? { agencyId } : {}
    const logs = await database
      .collection('uploadBatches')
      .find(query)
      .sort({ uploadedAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    return apiError(error, 500)
  }
}

