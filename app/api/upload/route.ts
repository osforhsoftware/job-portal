import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

const ALLOWED_TYPES: Record<string, { mimes: string[]; maxSize: number }> = {
  cv: {
    mimes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024,
  },
  video: {
    mimes: ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    maxSize: 50 * 1024 * 1024,
  },
  photo: {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024,
  },
  passport: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024,
  },
  proof: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024,
  },
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100)
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileType || !ALLOWED_TYPES[fileType]) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be one of: cv, video, photo, passport' },
        { status: 400 }
      )
    }

    const config = ALLOWED_TYPES[fileType]

    if (!config.mimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file format for ${fileType}. Allowed: ${config.mimes.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > config.maxSize) {
      const maxMB = config.maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Maximum size for ${fileType} is ${maxMB} MB` },
        { status: 400 }
      )
    }

    ensureUploadsDir()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = sanitizeFileName(file.name)
    const fileName = `${fileType}-${Date.now()}-${safeName}`
    const filePath = path.join(UPLOADS_DIR, fileName)

    fs.writeFileSync(filePath, buffer)

    const url = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url,
      fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}
