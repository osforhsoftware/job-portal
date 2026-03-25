import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  let body: any = {}

  try {
    await initializeDatabase()
    body = await request.json()
    const {
      companyName,
      tradeLicense,
      industry,
      companySize,
      website,
      country,
      city,
      address,
      description,
      contactName,
      contactEmail,
      contactPhone,
      contactPosition,
      password,
      confirmPassword,
      proofDocumentUrl,
    } = body

    if (
      !companyName ||
      !tradeLicense ||
      !industry ||
      !companySize ||
      !country ||
      !city ||
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      !contactPosition ||
      !password ||
      !confirmPassword ||
      !proofDocumentUrl
    ) {
      return NextResponse.json(
        { error: 'All required fields are required, including proof document' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirm password do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists across auth collections
    const existingCompany = await db.companies.getByEmail(contactEmail)
    const existingAgency = await db.agencies.getByEmail(contactEmail)
    const existingCandidate = await db.candidates.getByEmail(contactEmail)
    const existingAdmin = await db.users.getByEmail(contactEmail)
    if (existingCompany || existingAgency || existingCandidate || existingAdmin) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = hashPassword(password)

    const company = await db.companies.create({
      role: 'company',
      password: hashedPassword,
      isActive: true,
      name: companyName,
      tradeLicense,
      industry,
      companySize,
      website,
      country,
      city,
      address,
      description,
      logoUrl: undefined,
      proofDocumentUrl: proofDocumentUrl || undefined,
      contactName,
      contactEmail,
      contactPhone,
      contactPosition,
      // Convenience/back-compat fields
      email: contactEmail,
      phone: contactPhone,
      type: 'regular',
      isCorporate: false,
      totalCVDownloads: 0,
      totalBids: 0,
      totalInterviews: 0,
      totalHires: 0,
    })

    await logActivity({
      userType: 'company',
      entityType: 'company',
      entityId: company.id,
      action: 'register',
      description: `New company "${companyName}" registered`,
      metadata: { companyName, contactEmail, contactPhone, industry, companySize, country, city },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: company.id,
        email: company.email,
        phone: company.phone,
        role: company.role,
        name: company.contactName,
        isActive: company.isActive,
        companyId: company.id,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
      company: { ...company, password: undefined },
      message: 'Company registered successfully. You can now log in.',
    })
  } catch (error) {
    await logActivity({
      userType: 'company',
      entityType: 'company',
      action: 'register',
      description: `Company registration failed for "${body?.companyName || 'unknown'}"`,
      metadata: { contactEmail: body?.contactEmail, error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return apiError(error, 500)
  }
}
