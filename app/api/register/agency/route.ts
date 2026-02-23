import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { apiError } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const body = await request.json()
    const { name, email, phone, password, proofDocumentUrl } = body

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!proofDocumentUrl) {
      return NextResponse.json(
        { error: 'Proof document is required' },
        { status: 400 }
      )
    }

    const existingAgency = await db.agencies.getByEmail(email)
    const existingCompany = await db.companies.getByEmail(email)
    const existingCandidate = await db.candidates.getByEmail(email)
    const existingAdmin = await db.users.getByEmail(email)
    if (existingAgency || existingCompany || existingCandidate || existingAdmin) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const agency = await db.agencies.create({
      role: 'agency',
      password: hashPassword(password),
      isActive: false,
      approvalStatus: 'pending',
      name,
      email,
      phone,
      proofDocumentUrl,
      subscriptionPlan: 'basic' as any,
      subscriptionStatus: 'expired',
      cvUploadLimit: 0,
      cvUploadsUsed: 0,
      biddingLimit: 0,
      bidsUsed: 0,
      jobOfferLimit: 0,
      jobOffersUsed: 0,
      totalCandidates: 0,
      totalInterviews: 0,
      totalSelections: 0,
      totalRevenue: 0,
      totalCommission: 0,
    })

    return NextResponse.json({
      success: true,
      message: 'Agency registered successfully. Your account is pending admin approval.',
    })
  } catch (error) {
    return apiError(error, 500)
  }
}
