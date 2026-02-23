import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    return apiError(error, 500)
  }
}
