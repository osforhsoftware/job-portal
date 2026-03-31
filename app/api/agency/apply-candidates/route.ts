import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { demandIsLiveOnMarketplace } from '@/lib/demand-approval'
import { candidateCanSubmitToDemands } from '@/lib/candidate-demand-eligibility'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    const body = await request.json()
    const { demandId, candidateIds, agencyId, agentId } = body

    if (!demandId || !candidateIds?.length || !agencyId) {
      return NextResponse.json({ error: 'demandId, candidateIds, and agencyId are required' }, { status: 400 })
    }

    const demand = await db.demands.getById(demandId)
    if (!demand) {
      return NextResponse.json({ error: 'Demand not found' }, { status: 404 })
    }

    if (!demandIsLiveOnMarketplace(demand)) {
      return NextResponse.json(
        { error: 'This demand is not yet approved or is not available' },
        { status: 400 }
      )
    }

    const results = []
    for (const candidateId of candidateIds) {
      const candidate = await db.candidates.getById(candidateId)
      if (!candidate) continue

      if (!candidateCanSubmitToDemands(candidate)) {
        results.push({
          candidateId,
          status: 'unavailable',
          message:
            candidate.status === 'placed'
              ? 'This candidate is already placed (hired) and cannot be submitted to new demands'
              : 'This candidate is not available for new demand applications',
        })
        continue
      }

      if (demand.jobSubCategoryId) {
        await db.candidates.update(candidateId, { jobSubCategoryId: demand.jobSubCategoryId })
      }

      const existingApps = await db.applications.getByAgencyId(agencyId)
      const alreadyApplied = existingApps.find(
        a => a.candidateId === candidateId && a.demandId === demandId
      )
      if (alreadyApplied) {
        results.push({ candidateId, status: 'duplicate', message: 'Already applied' })
        continue
      }

      const application = await db.applications.create({
        candidateId,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        demandId,
        demandTitle: demand.jobTitle,
        companyId: demand.companyId,
        companyName: demand.companyName,
        agencyId,
        agentId,
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
        message: `${application.candidateName} applied for ${demand.jobTitle} (via agency).`,
        link: `/company/demands/${demandId}`,
      }).catch(() => {})
      results.push({ candidateId, status: 'submitted', applicationId: application.id })
    }

    await logActivity({
      userId: agencyId,
      userType: 'agency',
      entityType: 'submission',
      entityId: demandId,
      action: 'create',
      description: `Applied ${results.filter(r => r.status === 'submitted').length} candidates to demand: ${demand.jobTitle}`,
      metadata: { demandId, candidateIds, submitted: results.filter(r => r.status === 'submitted').length, duplicates: results.filter(r => r.status === 'duplicate').length },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Failed to apply candidates:', error)
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'submission',
      action: 'create',
      description: 'Failed to apply candidates to demand',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return NextResponse.json({ error: 'Failed to submit applications' }, { status: 500 })
  }
}
