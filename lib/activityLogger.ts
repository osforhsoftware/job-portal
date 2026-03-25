import { db, type ActivityLogUserType, type ActivityLogEntityType, type ActivityLogStatus } from './db'
import { NextRequest } from 'next/server'

interface LogActivityParams {
  userId?: string
  userName?: string
  userEmail?: string
  userType: ActivityLogUserType
  entityType: ActivityLogEntityType
  entityId?: string
  action: string
  description: string
  metadata?: Record<string, unknown>
  status: ActivityLogStatus
  ip?: string | null
  userAgent?: string | null
}

function sanitizeMetadata(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!data) return undefined
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'creditCard', 'cvv', 'ssn']
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await db.activityLogs.create({
      userId: params.userId,
      userName: params.userName,
      userEmail: params.userEmail,
      userType: params.userType,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      description: params.description,
      metadata: sanitizeMetadata(params.metadata),
      status: params.status,
      ipAddress: params.ip ?? undefined,
      userAgent: params.userAgent ?? undefined,
    })
  } catch (error) {
    console.error('Activity logging failed:', error)
  }
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}
