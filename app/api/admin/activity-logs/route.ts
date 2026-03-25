import { NextRequest, NextResponse } from 'next/server'
import { db, type ActivityLogFilter } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    const filter: ActivityLogFilter = {}
    const userType = searchParams.get('userType')
    const entityType = searchParams.get('entityType')
    const action = searchParams.get('action')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    if (userType) filter.userType = userType as ActivityLogFilter['userType']
    if (entityType) filter.entityType = entityType as ActivityLogFilter['entityType']
    if (action) filter.action = action
    if (status) filter.status = status as ActivityLogFilter['status']
    if (startDate) filter.startDate = startDate
    if (endDate) filter.endDate = endDate
    if (search) filter.search = search

    const { logs, total } = await db.activityLogs.getAll(filter, page, limit)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      logs,
      pagination: { page, limit, total, totalPages },
    })
  } catch (error) {
    return apiError(error, 500)
  }
}
