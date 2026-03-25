import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

export async function GET() {
  try {
    const stats = await db.activityLogs.getStats()
    const actions = await db.activityLogs.getDistinctActions()
    return NextResponse.json({ success: true, stats, actions })
  } catch (error) {
    return apiError(error, 500)
  }
}
