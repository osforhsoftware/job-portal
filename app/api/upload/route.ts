import { NextRequest, NextResponse } from 'next/server'
import {
  saveFile,
  validateFile,
  isUploadApiType,
  type StorageUploadType,
} from '@/lib/file-storage'
import { logActivity, getClientIp, getUserAgent } from '@/lib/activityLogger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ua = getUserAgent(request)
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileType || !isUploadApiType(fileType)) {
      return NextResponse.json(
        {
          error:
            'Invalid file type. Use: cv, video, passport, agency-logo, agency-proof, agent-photo, agent-proof, company-proof, photo, proof',
        },
        { status: 400 }
      )
    }

    const storageType = fileType as StorageUploadType
    const validation = validateFile(file, storageType)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { url, fileName, size } = await saveFile(file, storageType)

    await logActivity({
      userType: 'system',
      entityType: 'file',
      action: 'create',
      description: `File uploaded: ${fileName} (${storageType})`,
      metadata: { fileName, fileType: storageType, size, mimeType: file.type },
      status: 'success',
      ip,
      userAgent: ua,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      url,
      fileName,
      size,
      type: file.type,
    })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    await logActivity({
      userType: 'system',
      entityType: 'file',
      action: 'create',
      description: 'File upload failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      status: 'failed',
      ip,
      userAgent: ua,
    }).catch(() => {})
    const message = error instanceof Error ? error.message : 'Upload failed. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
