import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { demandIsLiveOnMarketplace } from '@/lib/demand-approval'
import { candidateCanSubmitToDemands } from '@/lib/candidate-demand-eligibility'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

const DIRECT_AGENCY_ID = 'direct'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const body = await request.json()
    const { demandId, candidateId } = body

    if (!demandId || !candidateId) {
      return NextResponse.json(
        { error: 'demandId and candidateId are required' },
        { status: 400 }
      )
    }

    const demand = await db.demands.getById(demandId)
    if (!demand) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (!demandIsLiveOnMarketplace(demand)) {
      return NextResponse.json(
        { error: 'This job is not available for applications yet' },
        { status: 400 }
      )
    }

    if (demand.status !== 'open') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      )
    }

    const candidate = await db.candidates.getById(candidateId)
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    if (!candidateCanSubmitToDemands(candidate)) {
      return NextResponse.json(
        {
          error:
            candidate.status === 'placed'
              ? 'You are already placed in a role and cannot apply to other jobs on the platform'
              : 'Your profile is not available for new applications',
        },
        { status: 400 }
      )
    }

    const existingApps = await db.applications.getByDemandId(demandId)
    const alreadyApplied = existingApps.some(
      (a) => a.candidateId === candidateId
    )
    if (alreadyApplied) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    const application = await db.applications.create({
      candidateId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`.trim() || candidate.email,
      demandId,
      demandTitle: demand.jobTitle,
      companyId: demand.companyId,
      companyName: demand.companyName,
      agencyId: DIRECT_AGENCY_ID,
      agentId: undefined,
      status: 'submitted',
      commission: 0,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    await db.notifications.create({
      recipientType: 'company',
      recipientId: demand.companyId,
      type: 'new_submission',
      title: 'New application',
      message: `${application.candidateName} applied for ${demand.jobTitle}.`,
      link: `/company/demands/${demandId}`,
    }).catch(() => {})

    await logActivity({
      userId: candidateId,
      userName: application.candidateName,
      userType: 'candidate',
      entityType: 'submission',
      entityId: application.id,
      action: 'create',
      description: `Candidate applied for "${demand.jobTitle}" at ${demand.companyName}`,
      metadata: { demandId, candidateId, companyId: demand.companyId, applicationId: application.id },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
    })
  } catch (error) {
    console.error('Failed to submit application:', error)
    await logActivity({
      userType: 'candidate',
      entityType: 'submission',
      action: 'create',
      description: 'Failed to submit job application',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
