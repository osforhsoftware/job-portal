import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { importBulkUploadCandidates, validateBulkUploadCandidates } from '@/lib/bulk-upload-candidates'
import { sendBulkUploadCompletedEmail } from '@/lib/email'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    await initializeDatabase()
    const formData = await request.formData()

    const agencyId = (formData.get('agencyId') as string | null)?.trim()
    if (!agencyId) return NextResponse.json({ error: 'agencyId required' }, { status: 400 })

    const agency = await db.agencies.getById(agencyId)
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    if (!agency.isActive || agency.approvalStatus !== 'approved') {
      return NextResponse.json({ error: 'Agency is not active' }, { status: 403 })
    }
    if (!agency.bulkUploadAccessEnabled) {
      return NextResponse.json({ error: 'Feature not enabled for this agency' }, { status: 403 })
    }

    const spreadsheetBlob = formData.get('spreadsheet')
    const spreadsheetFileName = (spreadsheetBlob as any)?.name
    if (!spreadsheetBlob || !(spreadsheetBlob instanceof Blob) || typeof spreadsheetFileName !== 'string') {
      return NextResponse.json({ error: 'Spreadsheet file (field: spreadsheet) is required' }, { status: 400 })
    }

    const spreadsheetBuffer = Buffer.from(await (spreadsheetBlob as any as File).arrayBuffer())

    const cvFiles: Array<{ fileName: string; buffer: Buffer; size: number; type: string }> = []
    for (const [key, value] of formData.entries()) {
      if (!(value instanceof Blob)) continue
      if (key !== 'cvFiles' && key !== 'files') continue
      const f = value as any as File
      if (!f.name) continue
      cvFiles.push({
        fileName: f.name,
        buffer: Buffer.from(await f.arrayBuffer()),
        size: f.size ?? 0,
        type: f.type ?? '',
      })
    }
    if (!cvFiles.length) return NextResponse.json({ error: 'No CV files provided' }, { status: 400 })

    const uploadedBy = (formData.get('uploadedBy') as string | null)?.trim() || undefined
    const uploadedByEmail = (formData.get('uploadedByEmail') as string | null)?.trim() || undefined
    const uploadedByName = (formData.get('uploadedByName') as string | null)?.trim() || undefined
    const agentId = (formData.get('agentId') as string | null)?.trim() || undefined

    const validation = await validateBulkUploadCandidates({
      agencyId,
      spreadsheetFileName,
      spreadsheetBuffer,
      cvFiles,
      uploadedBy,
    })

    if (validation.errors.length) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        candidatesToUpload: validation.candidatesToUpload,
        totalCandidatesInSheet: validation.totalCandidatesInSheet,
        errors: validation.errors,
        errorReportBase64: validation.errorReportBase64,
      })
    }

    const result = await importBulkUploadCandidates({
      agencyId,
      uploadedBy,
      uploadedByEmail,
      spreadsheetFileName,
      spreadsheetBuffer,
      cvFiles,
      agentId,
      validation,
    })

    if (uploadedByEmail) {
      await sendBulkUploadCompletedEmail({
        to: uploadedByEmail,
        userName: uploadedByName || undefined,
        agencyName: agency.name,
        batchId: result.batchId,
        candidatesUploaded: result.successfulUploads,
        cvFilesLinked: result.successfulUploads,
        uploadedAt: new Date().toISOString(),
      })
    }

    await logActivity({
      userId: agencyId,
      userName: agency.name,
      userType: 'agency',
      entityType: 'bulk',
      entityId: result.batchId,
      action: 'create',
      description: `Bulk candidate import completed: ${result.successfulUploads} candidates imported`,
      metadata: { batchId: result.batchId, successfulUploads: result.successfulUploads, spreadsheetFileName, cvFileCount: cvFiles.length, uploadedBy, agentId },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    if (error && typeof error === 'object' && 'validation' in (error as any)) {
      const validation = (error as any).validation
      return NextResponse.json({
        success: false,
        error: (error as Error).message,
        candidatesToUpload: validation?.candidatesToUpload ?? 0,
        totalCandidatesInSheet: validation?.totalCandidatesInSheet ?? 0,
        errors: validation?.errors ?? [],
        errorReportBase64: validation?.errorReportBase64,
      })
    }
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'bulk',
      action: 'create',
      description: 'Failed to import bulk upload candidates',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return apiError(error, 400)
  }
}
