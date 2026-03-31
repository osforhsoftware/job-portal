import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { BenefitType, NationalityType } from '@/lib/job-config'
import { apiError } from '@/lib/api-utils'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

async function notifyAdminsNewDemandPending(jobTitles: string[]) {
  const admins = (await db.users.getAll()).filter(
    (u) => u.role === 'admin' || u.role === 'super_admin'
  )
  const titleList = jobTitles.join(', ')
  for (const admin of admins) {
    await db.notifications
      .create({
        recipientType: 'admin',
        recipientId: admin.id,
        type: 'approval',
        title: 'New demand awaiting approval',
        message: `A company submitted new demand(s) for review: ${titleList}. Approve in Pending Approvals.`,
        link: '/admin/approvals',
      })
      .catch(() => {})
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    if (!companyId) {
      return NextResponse.json({ error: 'companyId required' }, { status: 400 })
    }
    const demands = await db.demands.getByCompanyId(companyId)
    const withPositions = demands.map(d => ({ ...d, positions: d.quantity }))
    return NextResponse.json({ success: true, demands: withPositions })
  } catch (error) {
    return apiError(error, 500)
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const {
      companyId,
      companyName,
      roles,
      createdByUserId,
      createdByEmployeeName,
      timeRemark,
      shiftStartTime,
      shiftEndTime,
      otherBenefitNote,
      description = '',
      location = '',
      requirements = [],
      skills = [],
      salaryAmount = 0,
      currency = 'AED',
      dutyHoursPerDay = 0,
      breakTimeHours = 0,
      dayOffPerMonth = 0,
      benefits = [],
      gender = 'any',
      nationality = ['any'],
      joining = 'immediate',
      status = 'open',
      deadline,
      jobCategoryId,
      jobSubCategoryId,
    } = body as {
      companyId: string
      companyName: string
      roles: Array<{ jobTitle: string; quantity: number }>
      createdByUserId?: string
      createdByEmployeeName?: string
      timeRemark?: string
      shiftStartTime?: string
      shiftEndTime?: string
      otherBenefitNote?: string
      description?: string
      location?: string
      requirements?: string[]
      skills?: string[]
      salaryAmount?: number
      currency?: string
      dutyHoursPerDay?: number
      breakTimeHours?: number
      dayOffPerMonth?: number
      benefits?: BenefitType[]
      gender?: 'male' | 'female' | 'any'
      nationality?: NationalityType[]
      joining?: 'immediate' | 'scheduled'
      status?: 'open' | 'closed' | 'on_hold'
      deadline?: string
      jobCategoryId?: string
      jobSubCategoryId?: string
    }

    if (!companyId || !companyName || !roles?.length) {
      return NextResponse.json(
        { error: 'companyId, companyName, and roles (array of { jobTitle, positions }) are required' },
        { status: 400 }
      )
    }

    const company = await db.companies.getById(companyId)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const name = companyName || company.name
    const deadlineDate = deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const created: Array<{ id: string; jobTitle: string; quantity: number }> = []
    for (const role of roles) {
      if (!role.jobTitle?.trim() || (role.quantity ?? 0) < 1) continue
      const demand = await db.demands.create({
        companyId,
        companyName: name,
        createdByUserId,
        createdByEmployeeName,
        timeRemark,
        shiftStartTime,
        shiftEndTime,
        otherBenefitNote,
        jobTitle: role.jobTitle.trim(),
        description,
        // Hiring details
        quantity: Math.max(1, Number(role.quantity)),
        filledPositions: 0,
        requirements,
        skills,
        // Salary
        salary: { amount: salaryAmount, currency },
        // Work schedule
        dutyHoursPerDay,
        breakTimeHours,
        dayOffPerMonth,
        // Benefits & eligibility
        benefits,
        gender,
        nationality,
        // Location & timing
        location: location || company.city || '',
        joining,
        status,
        deadline: deadlineDate,
        jobCategoryId: jobCategoryId || undefined,
        jobSubCategoryId: jobSubCategoryId || undefined,
        approvalStatus: 'pending',
      })
      created.push({ id: demand.id, jobTitle: demand.jobTitle, quantity: demand.quantity })
    }

    if (created.length) {
      await notifyAdminsNewDemandPending(created.map((d) => d.jobTitle))
    }

    await logActivity({
      userId: createdByUserId,
      userName: createdByEmployeeName,
      userType: 'company',
      entityType: 'demand',
      entityId: created[0]?.id,
      action: 'create',
      description: `Created ${created.length} demand(s) for ${name}`,
      metadata: { companyId, roles: created.map(d => ({ id: d.id, jobTitle: d.jobTitle, quantity: d.quantity })) },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} demand(s)`,
      demands: created,
    })
  } catch (error) {
    await logActivity({
      userType: 'company',
      entityType: 'demand',
      action: 'create',
      description: 'Failed to create demand(s)',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return apiError(error, 500)
  }
}
