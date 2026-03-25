import { NextRequest, NextResponse } from 'next/server'
import { db, type ActivityLogFilter } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

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

    const { logs } = await db.activityLogs.getAll(filter, 1, 10000)

    const headers = ['Date & Time', 'User Type', 'Name', 'Email', 'Action', 'Entity Type', 'Entity ID', 'Description', 'Status', 'IP Address']
    const csvRows = [headers.join(',')]

    for (const log of logs) {
      const row = [
        log.createdAt,
        log.userType,
        `"${(log.userName || '').replace(/"/g, '""')}"`,
        log.userEmail || '',
        log.action,
        log.entityType,
        log.entityId || '',
        `"${(log.description || '').replace(/"/g, '""')}"`,
        log.status,
        log.ipAddress || '',
      ]
      csvRows.push(row.join(','))
    }

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    return apiError(error, 500)
  }
}
