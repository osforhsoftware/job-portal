import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { db, initializeDatabase } from '@/lib/db'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { extractTextFromBuffer, parseCandidateFromText } from '@/lib/cv-parser'
import { apiError } from '@/lib/api-utils'

// Allow larger multipart body for bulk CV uploads (e.g. many PDFs)
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

function sanitizeFileName(name: string | undefined): string {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_').slice(0, 100)
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    const formData = await request.formData()
    const agencyId = (formData.get('agencyId') as string)?.trim() || null
    const agentIdRaw = (formData.get('agentId') as string)?.trim()
    const agentId = agentIdRaw && agentIdRaw !== 'none' ? agentIdRaw : undefined
    const demandIdRaw = (formData.get('demandId') as string)?.trim()
    const demandId = demandIdRaw && demandIdRaw !== 'none' ? demandIdRaw : null
    // Collect file parts: accept both File and Blob (some runtimes send Blob)
    const files: Array<File | Blob> = []
    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof Blob && value.size > 0) {
        files.push(value)
      }
    }

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Agency session missing. Please log in again as an agency.' },
        { status: 401 }
      )
    }
    if (!files.length) {
      return NextResponse.json(
        { error: 'No files provided. Select at least one PDF, DOC, or DOCX file.' },
        { status: 400 }
      )
    }

    const agency = await db.agencies.getById(agencyId)
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    let demand: Awaited<ReturnType<typeof db.demands.getById>> | null = null
    if (demandId) {
      demand = await db.demands.getById(demandId)
      if (!demand || demand.status !== 'open') {
        return NextResponse.json({ error: 'Demand not found or not open' }, { status: 400 })
      }
    }

    const limit = (agency as { cvUploadLimit?: number }).cvUploadLimit ?? -1
    const used = (agency as { cvUploadsUsed?: number }).cvUploadsUsed ?? 0
    if (limit !== -1 && used + files.length > limit) {
      return NextResponse.json({
        error: `Upload limit exceeded. ${limit - used} uploads remaining.`,
      }, { status: 400 })
    }

    ensureUploadsDir()
    const dbInstance = await getDatabase()
    const results: Array<{ filename: string; status: string; message: string; candidateId?: string }> = []
    let successCount = 0

    for (const file of files) {
      const fileDisplayName = (file instanceof File ? file.name : undefined) ?? 'file'
      const fileType = file.type || ''
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        if (!ALLOWED_TYPES.includes(fileType) && !/\.(pdf|doc|docx)$/i.test(fileDisplayName)) {
          results.push({ filename: fileDisplayName, status: 'error', message: 'Invalid file type (PDF, DOC, DOCX only)' })
          continue
        }
        if (buffer.length > MAX_FILE_SIZE) {
          results.push({ filename: fileDisplayName, status: 'error', message: `File too large (max 5MB)` })
          continue
        }

        const fileHash = sha256(buffer)
        const existingByHash = await dbInstance.collection('candidates').findOne({ resumeHash: fileHash })
        if (existingByHash) {
          results.push({ filename: fileDisplayName, status: 'duplicate', message: 'Duplicate file (hash)' })
          continue
        }

        const text = await extractTextFromBuffer(buffer, fileType)
        const parsed = parseCandidateFromText(text, fileDisplayName)
        const nameStr = (parsed?.name ?? '').toString().trim() || 'Unknown Candidate'
        const [firstName, ...lastParts] = nameStr.split(/\s+/)
        const lastName = lastParts.join(' ') || 'Candidate'

        if (parsed.email || parsed.phone) {
          const existingByContact = await dbInstance.collection('candidates').findOne({
            $or: [
              ...(parsed.email ? [{ email: parsed.email }] : []),
              ...(parsed.phone ? [{ phone: parsed.phone }] : []),
            ].filter(Boolean),
          })
          if (existingByContact) {
            results.push({ filename: fileDisplayName, status: 'duplicate', message: 'Duplicate (email/phone)' })
            continue
          }
        }

        const safeName = sanitizeFileName(fileDisplayName)
        const savedFileName = `cv-${Date.now()}-${safeName}`
        const filePath = path.join(UPLOADS_DIR, savedFileName)
        fs.writeFileSync(filePath, buffer)
        const cvUrl = `/uploads/${savedFileName}`

        const candidate = await db.candidates.create({
          firstName: firstName || 'Unknown',
          lastName,
          email: parsed.email || `${(firstName || 'unknown').toLowerCase().replace(/\s/g, '')}.${lastName.toLowerCase().replace(/\s/g, '')}@pending.upload`,
          phone: parsed.phone || '',
          dateOfBirth: '',
          gender: '',
          nationality: '',
          currentLocation: '',
          preferredLocations: [],
          languages: [],
          maritalStatus: '',
          totalExperience: parsed.experience || '',
          expectedSalary: '',
          noticePeriod: '',
          industries: [],
          jobTypes: [],
          jobCategories: [],
          highestEducation: '',
          fieldOfStudy: '',
          skills: parsed.skills?.length ? parsed.skills : [],
          certifications: [],
          status: 'available',
          role: 'candidate',
          password: '',
          isActive: true,
          agencyId,
          cvUrl,
        })

        await dbInstance.collection('candidates').updateOne(
          { _id: new ObjectId(candidate.id) },
          { $set: { resumeHash: fileHash } }
        )

        await db.candidateSources.create({
          candidateId: candidate.id,
          agentId,
          agencyId,
          sourceType: 'bulk_upload',
        })

        if (demandId && demand) {
          const existingApp = await dbInstance.collection('applications').findOne({
            candidateId: candidate.id,
            demandId,
            agencyId,
          })
          if (!existingApp) {
            await db.applications.create({
              candidateId: candidate.id,
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
          }
        }

        successCount++
        results.push({ filename: fileDisplayName, status: 'success', message: 'Uploaded', candidateId: candidate.id })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process'
        results.push({ filename: fileDisplayName, status: 'error', message })
      }
    }

    const currentUsed = (agency as { cvUploadsUsed?: number }).cvUploadsUsed ?? 0
    const currentTotal = (agency as { totalCandidates?: number }).totalCandidates ?? 0
    await db.agencies.update(agencyId, {
      cvUploadsUsed: currentUsed + successCount,
      totalCandidates: currentTotal + successCount,
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
    return apiError(error, 500)
  }
}
