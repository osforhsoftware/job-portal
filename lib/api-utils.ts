import { NextResponse } from 'next/server'

/**
 * Return a JSON error response with the actual error message when available.
 * Use in API route catch blocks so clients see "DATABASE_URL is not set" etc. instead of generic "Internal server error".
 */
export function apiError(error: unknown, status = 500): NextResponse {
  const message = error instanceof Error ? error.message : 'Internal server error'
  console.error('API error:', error)
  return NextResponse.json({ error: message }, { status })
}
