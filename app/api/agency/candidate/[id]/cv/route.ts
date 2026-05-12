import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { saveFile } from '@/lib/file-storage'

export const runtime = 'nodejs'

const MAX_CV_SIZE = 5 * 1024 * 1024
const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const candidate = await db.candidates.getById(id)
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const cvFile = formData.get('cvUpload') as File | null

    if (!cvFile) {
      return NextResponse.json({ error: 'No CV file provided' }, { status: 400 })
    }

    if (!ALLOWED_CV_TYPES.includes(cvFile.type)) {
      return NextResponse.json(
        { error: 'CV must be a PDF or Word document (PDF, DOC, DOCX)' },
        { status: 400 }
      )
    }

    if (cvFile.size > MAX_CV_SIZE) {
      return NextResponse.json({ error: 'CV must be under 5 MB' }, { status: 400 })
    }

    const { url: cvUrl } = await saveFile(cvFile, 'manual-cv', { userId: id })
    const updated = await db.candidates.update(id, { cvUrl })

    return NextResponse.json({ success: true, cvUrl, candidate: updated })
  } catch (error) {
    console.error('Failed to upload CV:', error)
    return NextResponse.json({ error: 'Failed to upload CV' }, { status: 500 })
  }
}
