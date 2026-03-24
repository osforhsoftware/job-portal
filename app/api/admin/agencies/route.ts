import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const agencies = await db.agencies.getAll()
    const agenciesSafe = agencies.map(({ password, ...rest }) => rest)
    agenciesSafe.sort((a, b) => {
      const dateA = new Date((a as any).createdAt || 0).getTime()
      const dateB = new Date((b as any).createdAt || 0).getTime()
      return dateB - dateA
    })
    return NextResponse.json({ success: true, agencies: agenciesSafe })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, agencyId, ...updates } = body

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 })
    }

    const agency = await db.agencies.getById(agencyId)
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    if (action === 'approve') {
      await db.agencies.update(agencyId, {
        approvalStatus: 'approved',
        subscriptionStatus: 'active',
        isActive: true,
        ...updates,
      })
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'setBulkUploadAccess') {
      const {
        bulkUploadAccessEnabled,
        bulkUploadMonthlyLimit,
        bulkUploadMaxCandidatesPerBatch,
      } = body as {
        bulkUploadAccessEnabled?: boolean
        bulkUploadMonthlyLimit?: number
        bulkUploadMaxCandidatesPerBatch?: number
      }

      if (typeof bulkUploadAccessEnabled !== 'boolean') {
        return NextResponse.json(
          { error: 'bulkUploadAccessEnabled must be a boolean' },
          { status: 400 }
        )
      }

      const nextUpdates: Record<string, unknown> = {
        bulkUploadAccessEnabled,
      }

      if (bulkUploadMonthlyLimit !== undefined) {
        if (typeof bulkUploadMonthlyLimit !== 'number') {
          return NextResponse.json({ error: 'bulkUploadMonthlyLimit must be a number' }, { status: 400 })
        }
        nextUpdates.bulkUploadMonthlyLimit = bulkUploadMonthlyLimit
      }

      if (bulkUploadMaxCandidatesPerBatch !== undefined) {
        if (typeof bulkUploadMaxCandidatesPerBatch !== 'number') {
          return NextResponse.json({ error: 'bulkUploadMaxCandidatesPerBatch must be a number' }, { status: 400 })
        }
        nextUpdates.bulkUploadMaxCandidatesPerBatch = bulkUploadMaxCandidatesPerBatch
      }

      await db.agencies.update(agencyId, nextUpdates as any)

      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any

      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'reject') {
      await db.agencies.update(agencyId, {
        approvalStatus: 'rejected',
        isActive: false,
      })
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'deactivate') {
      await db.agencies.update(agencyId, {
        approvalStatus: 'rejected',
        subscriptionStatus: 'expired',
        isActive: false,
      })
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'moveToSpam') {
      await db.agencies.update(agencyId, {
        approvalStatus: 'spam',
        isActive: false,
      })
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'setActive') {
      await db.agencies.update(agencyId, { isActive: true })
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'setInactive') {
      await db.agencies.update(agencyId, { isActive: false })
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    if (action === 'delete') {
      const status = (agency as any).approvalStatus
      if (status !== 'spam') {
        return NextResponse.json(
          { error: 'Only spam agencies can be permanently deleted' },
          { status: 400 }
        )
      }
      const deleted = await db.agencies.delete(agencyId)
      if (!deleted) {
        return NextResponse.json({ error: 'Failed to delete agency' }, { status: 500 })
      }
      return NextResponse.json({ success: true, deleted: true })
    }

    if (action === 'updateStatus') {
      const { approvalStatus, isActive } = body
      const validStatuses = ['pending', 'approved', 'rejected', 'spam']
      if (!approvalStatus || !validStatuses.includes(approvalStatus)) {
        return NextResponse.json(
          { error: 'Valid approvalStatus required: pending, approved, rejected, spam' },
          { status: 400 }
        )
      }
      const update: Record<string, unknown> = {
        approvalStatus: approvalStatus as 'pending' | 'approved' | 'rejected' | 'spam',
      }
      if (approvalStatus === 'approved') {
        update.subscriptionStatus = 'active'
        update.isActive = true
      } else if (approvalStatus === 'rejected' || approvalStatus === 'spam') {
        update.isActive = false
      }
      if (typeof isActive === 'boolean') {
        update.isActive = isActive
      }
      await db.agencies.update(agencyId, update as any)
      const updatedAgency = await db.agencies.getById(agencyId)
      if (!updatedAgency) return NextResponse.json({ success: true, agency: null })
      const { password, ...safe } = updatedAgency as any
      return NextResponse.json({ success: true, agency: safe })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update agency' },
      { status: 500 }
    )
  }
}
