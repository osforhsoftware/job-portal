import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const ip = getClientIp(request)
    const ua = getUserAgent(request)
    const { token, newPassword, confirmPassword } = await request.json()

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, new password, and confirm password are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const resetRecord = await db.passwordResetTokens.getByToken(token)
    if (!resetRecord) {
      await logActivity({
        userType: 'system',
        entityType: 'login',
        action: 'reset_password',
        description: 'Password reset attempted with invalid or expired token',
        metadata: {},
        status: 'failed',
        ip,
        userAgent: ua,
      })
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      )
    }

    const email = resetRecord.email
    let account: { id: string; name?: string; role?: string } | null = null

    // Update password in whichever collection owns this email
    const admin = await db.users.getByEmail(email)
    if (admin) {
      await db.users.update(admin.id, { password: hashPassword(newPassword) })
      account = { id: admin.id, name: (admin as any).name, role: (admin as any).role }
    } else {
      const agency = await db.agencies.getByEmail(email)
      if (agency) {
        await db.agencies.update(agency.id, { password: hashPassword(newPassword) } as any)
        account = { id: agency.id, name: (agency as any).name, role: 'agency' }
      } else {
        const company = await db.companies.getByEmail(email)
        if (company) {
          await db.companies.update(company.id, { password: hashPassword(newPassword) } as any)
          account = { id: company.id, name: (company as any).name, role: 'company' }
        } else {
          const candidate = await db.candidates.getByEmail(email)
          if (candidate) {
            await db.candidates.update(candidate.id, { password: hashPassword(newPassword) } as any)
            account = { id: candidate.id, name: (candidate as any).name, role: 'candidate' }
          } else {
            const agent = await db.agents.getByEmail(email)
            if (agent) {
              await db.agents.update(agent.id, { password: hashPassword(newPassword) } as any)
              account = { id: agent.id, name: (agent as any).name, role: 'agent' }
            } else {
              await logActivity({
                userType: 'system',
                entityType: 'login',
                action: 'reset_password',
                description: `Password reset failed: user not found for email ${email}`,
                metadata: { email },
                status: 'failed',
                ip,
                userAgent: ua,
              })
              return NextResponse.json(
                { error: 'User not found' },
                { status: 400 }
              )
            }
          }
        }
      }
    }
    await db.passwordResetTokens.deleteByToken(token)

    if (account) {
      const userType = account.role === 'super_admin' ? 'superadmin' : (account.role || 'system')
      await logActivity({
        userId: account.id,
        userName: account.name,
        userEmail: email,
        userType: userType as any,
        entityType: 'login',
        entityId: account.id,
        action: 'reset_password',
        description: `Password reset successfully for ${email}`,
        metadata: { email, role: account.role },
        status: 'success',
        ip,
        userAgent: ua,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now log in with your new password.',
    })
  } catch (error) {
    return apiError(error, 500)
  }
}
