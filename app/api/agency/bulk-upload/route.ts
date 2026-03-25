import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { apiError } from '@/lib/api-utils'
import { saveBuffer } from '@/lib/file-storage'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function nameFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
  return base || 'Unknown'
}

function inferPdfMime(file: Blob & { name?: string }, index: number): string {
  const t = file.type?.trim()
  if (t) return t
  const n = (file as { name?: string }).name || ''
  if (n.toLowerCase().endsWith('.pdf')) return 'application/pdf'
  return 'application/octet-stream'
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)

  try {
    await initializeDatabase()

    const formData = await request.formData()
    const agencyId = (formData.get('agencyId') as string)?.trim()
    const demandId = (formData.get('demandId') as string)?.trim() || null

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency session missing' }, { status: 401 })
    }

    const agency = await db.agencies.getById(agencyId)
    let jobSubCategoryId: string | undefined
    if (demandId) {
      const demand = await db.demands.getById(demandId)
      jobSubCategoryId = demand?.jobSubCategoryId
    }
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const files: Blob[] = []
    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof Blob && value.size > 0) {
        files.push(value)
      }
    }

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const dbInstance = await getDatabase()

    const results = await Promise.all(
      files.map(async (file, index) => {
        const filename = (file as File & { name?: string }).name || `file-${index}.pdf`

        try {
          const buffer = Buffer.from(await file.arrayBuffer())

          if (buffer.length > MAX_FILE_SIZE) {
            return { filename, status: 'error' as const, message: 'File too large' }
          }

          const mimeType = inferPdfMime(file as File, index)
          if (mimeType !== 'application/pdf') {
            return {
              filename,
              status: 'error' as const,
              message: 'Each file must be a PDF',
            }
          }

          const hash = sha256(buffer)

          const hashExists = await dbInstance
            .collection('candidates')
            .findOne({ resumeHash: hash }, { projection: { _id: 1 } })

          if (hashExists) {
            return { filename, status: 'duplicate' as const, message: 'Duplicate (hash)' }
          }

          const { url: cvUrl } = await saveBuffer(buffer, mimeType, filename, 'cv', {
            userId: agencyId,
          })

          const displayName = nameFromFilename(filename)
          const nameParts = displayName.split(/\s+/)
          const firstName = nameParts[0] ?? 'Unknown'
          const lastName = nameParts.slice(1).join(' ') ?? ''

          const emailForDb = `no-email-${hash}`

          const candidate = await db.candidates.create({
            firstName,
            lastName,
            email: emailForDb,
            phone: '',
            skills: [],
            totalExperience: '',
            currentLocation: '',
            currentJobTitle: undefined,
            currentCompany: undefined,
            highestEducation: '',
            fieldOfStudy: '',
            languages: [],
            certifications: [],
            status: 'available',
            role: 'candidate',
            agencyId,
            cvUrl,
            password: '',
            isActive: true,
            jobSubCategoryId,
          } as any)

          await dbInstance.collection('candidates').updateOne(
            { _id: new ObjectId(candidate.id) },
            { $set: { resumeHash: hash } }
          )

          return {
            filename,
            status: 'success' as const,
            message: 'Uploaded',
            candidateId: candidate.id,
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Upload failed'
          return {
            filename,
            status: 'error' as const,
            message,
          }
        }
      })
    )

    const successCount = results.filter((r) => r.status === 'success').length

    await db.agencies.update(agencyId, {
      cvUploadsUsed: (agency.cvUploadsUsed || 0) + successCount,
      totalCandidates: (agency.totalCandidates || 0) + successCount,
    })

    await logActivity({
      userId: agencyId,
      userName: agency.name,
      userType: 'agency',
      entityType: 'bulk',
      entityId: agencyId,
      action: 'create',
      description: `Bulk CV upload: ${successCount} uploaded, ${results.filter(r => r.status === 'duplicate').length} duplicates, ${results.filter(r => r.status === 'error').length} errors`,
      metadata: { totalFiles: files.length, uploaded: successCount, duplicates: results.filter(r => r.status === 'duplicate').length, errors: results.filter(r => r.status === 'error').length, demandId },
      status: 'success',
      ip,
      userAgent: ua,
    })

    return NextResponse.json({
      success: true,
      total: files.length,
      uploaded: successCount,
      duplicates: results.filter((r) => r.status === 'duplicate').length,
      errors: results.filter((r) => r.status === 'error').length,
      results,
    })
  } catch (error) {
    await logActivity({
      userId: 'unknown',
      userType: 'agency',
      entityType: 'bulk',
      action: 'create',
      description: 'Failed to bulk upload CVs',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    })
    return apiError(error, 500)
  }
}
