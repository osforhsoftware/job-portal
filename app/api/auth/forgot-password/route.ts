import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db, initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim()
    const admin = await db.users.getByEmail(normalizedEmail)
    const agency = await db.agencies.getByEmail(normalizedEmail)
    const company = await db.companies.getByEmail(normalizedEmail)
    const account = admin || agency || company

    if (!account) {
      // Don't reveal whether email exists - same response for success or not found
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
    }

    // Only allow reset for roles that use email/password login
    const allowedRoles = ['agency', 'company', 'corporate', 'admin', 'super_admin']
    const role = (account as any).role
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
    }

    // Remove any existing reset tokens for this email
    await db.passwordResetTokens.deleteByEmail(normalizedEmail)

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour

    await db.passwordResetTokens.create(normalizedEmail, token, expiresAt)

    // In production: send email with link e.g. ${process.env.APP_URL}/reset-password?token=${token}
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const resetLink = `${baseUrl}/reset-password?token=${token}`

    // For development/demo: return the link so user can use it without email configured
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
    })
  } catch (error) {
    return apiError(error, 500)
  }
}
