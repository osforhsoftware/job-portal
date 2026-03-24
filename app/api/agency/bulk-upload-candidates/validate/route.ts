import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { apiError } from '@/lib/api-utils'
import { validateBulkUploadCandidates } from '@/lib/bulk-upload-candidates'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    const validation = await validateBulkUploadCandidates({
      agencyId,
      spreadsheetFileName: spreadsheetFileName || 'spreadsheet',
      spreadsheetBuffer,
      cvFiles,
      uploadedBy: (formData.get('uploadedBy') as string | null)?.trim() || undefined,
    })

    // Agency-specific max batch check (if configured)
    const maxPerBatch = typeof agency.bulkUploadMaxCandidatesPerBatch === 'number' ? agency.bulkUploadMaxCandidatesPerBatch : -1
    if (maxPerBatch !== -1 && maxPerBatch >= 0 && validation.totalCandidatesInSheet > maxPerBatch) {
      return NextResponse.json({
        success: false,
        error: `Maximum candidates per batch is ${maxPerBatch} for this agency`,
        candidatesToUpload: 0,
        totalCandidatesInSheet: validation.totalCandidatesInSheet,
        errors: [
          {
            rowNo: 0,
            errors: [`Maximum candidates per upload exceeded for this agency. Limit: ${maxPerBatch}`],
          },
        ],
        errorReportBase64: validation.errorReportBase64,
      })
    }

    // Keep response lightweight (validRows is intentionally omitted)
    const { validRows, ...rest } = validation

    return NextResponse.json({
      success: true,
      ...rest,
      canImport: rest.errors.length === 0,
    })
  } catch (error) {
    return apiError(error, 400)
  }
}

