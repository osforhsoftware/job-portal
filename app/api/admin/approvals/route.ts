import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function GET() {
  try {
    const agencies = await db.agencies.getAll()
    const companies = await db.companies.getAll()

    const pendingAgencies = agencies
      .filter(a => {
        const status = (a as any).approvalStatus || (a.isActive ? 'approved' : 'pending')
        return status === 'pending'
      })
      .map(agency => ({
        type: 'agency' as const,
        id: agency.id,
        name: agency.name,
        email: agency.email,
        phone: agency.phone,
        subscriptionPlan: agency.subscriptionPlan,
        subscriptionStatus: agency.subscriptionStatus,
        proofDocumentUrl: (agency as any).proofDocumentUrl,
        createdAt: agency.createdAt,
        userActive: agency.isActive ?? false,
        userId: agency.id,
      }))

    const pendingCompanies = companies
      .filter(c => !c.subscriptionStatus || c.subscriptionStatus !== 'active')
      .map(company => ({
        type: 'company' as const,
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        subscriptionPlan: company.subscriptionPlan,
        subscriptionStatus: company.subscriptionStatus,
        createdAt: company.createdAt,
        userActive: company.isActive ?? false,
        userId: company.id,
      }))

    const pending = [...pendingAgencies, ...pendingCompanies].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      pending,
      counts: { agencies: pendingAgencies.length, companies: pendingCompanies.length },
    })
  } catch (error) {
    console.error('Approvals fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { action, type, id } = body

    if (!action || !type || !id) {
      return NextResponse.json(
        { error: 'Missing action, type, or id' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      if (type === 'agency') {
        const agency = await db.agencies.getById(id)
        if (!agency) {
          return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
        }
        await db.agencies.update(id, {
          approvalStatus: 'approved',
          subscriptionStatus: 'active',
          isActive: true,
        })
        await db.notifications.create({
          recipientType: 'agency',
          recipientId: id,
          type: 'approval',
          title: 'Agency approved',
          message: 'Your agency account has been approved. You can now sign in and start using the platform.',
          link: '/agency/dashboard',
        }).catch(() => {})
        await logActivity({ userType: 'superadmin', entityType: 'agency', entityId: id, action: 'approve_agency', description: `Approved agency ${agency.name}`, metadata: { agencyName: agency.name }, status: 'success', ip, userAgent: ua })
        return NextResponse.json({ success: true, message: 'Agency approved' })
      }
      if (type === 'company') {
        const company = await db.companies.getById(id)
        if (!company) {
          return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }
        await db.companies.update(id, {
          subscriptionStatus: 'active',
          subscriptionPlan: company.subscriptionPlan || 'bronze',
          isActive: true,
        })
        await db.notifications.create({
          recipientType: 'company',
          recipientId: id,
          type: 'approval',
          title: 'Company approved',
          message: 'Your company account has been approved. You can now sign in and start using the platform.',
          link: '/company/dashboard',
        }).catch(() => {})
        await logActivity({ userType: 'superadmin', entityType: 'company', entityId: id, action: 'approve_company', description: `Approved company ${company.name}`, metadata: { companyName: company.name }, status: 'success', ip, userAgent: ua })
        return NextResponse.json({ success: true, message: 'Company approved' })
      }
    }

    if (action === 'reject') {
      if (type === 'agency') {
        const agency = await db.agencies.getById(id)
        if (!agency) {
          return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
        }
        await db.agencies.update(id, {
          approvalStatus: 'rejected',
          isActive: false,
        })
        await db.notifications.create({
          recipientType: 'agency',
          recipientId: id,
          type: 'approval',
          title: 'Agency rejected',
          message: 'Your agency registration was rejected. Please contact support for more information.',
          link: '/',
        }).catch(() => {})
        await logActivity({ userType: 'superadmin', entityType: 'agency', entityId: id, action: 'reject_agency', description: `Rejected agency ${agency.name}`, metadata: { agencyName: agency.name }, status: 'success', ip, userAgent: ua })
        return NextResponse.json({ success: true, message: 'Agency rejected' })
      }
      if (type === 'company') {
        const company = await db.companies.getById(id)
        if (!company) {
          return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }
        await db.companies.update(id, { isActive: false })
        await db.notifications.create({
          recipientType: 'company',
          recipientId: id,
          type: 'approval',
          title: 'Company rejected',
          message: 'Your company registration was rejected. Please contact support for more information.',
          link: '/',
        }).catch(() => {})
        await logActivity({ userType: 'superadmin', entityType: 'company', entityId: id, action: 'reject_company', description: `Rejected company ${company.name}`, metadata: { companyName: company.name }, status: 'success', ip, userAgent: ua })
        return NextResponse.json({ success: true, message: 'Company rejected' })
      }
    }

    return NextResponse.json({ error: 'Invalid action or type' }, { status: 400 })
  } catch (error) {
    console.error('Approval action error:', error)
    await logActivity({ userType: 'superadmin', entityType: 'agency', action: 'approval_action', description: 'Approval action failed', metadata: { error: String(error) }, status: 'failed', ip, userAgent: ua })
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
