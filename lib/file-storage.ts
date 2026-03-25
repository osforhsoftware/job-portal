/**
 * Local file storage under `public/uploads/`. Served by Next as static files at `/uploads/...`.
 *
 * Example client upload:
 * ```ts
 * const fd = new FormData()
 * fd.append('file', file)
 * fd.append('type', 'cv') // cv | video | passport | agency-logo | ...
 * const res = await fetch('/api/upload', { method: 'POST', body: fd })
 * const { url } = await res.json() // { success, url: "/uploads/cv/2026/03/...", ... }
 * ```
 */
import { randomBytes } from 'crypto'
import { createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

const proofMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const imageMimes = ['image/jpeg', 'image/png', 'image/webp']

export type StorageUploadType =
  | 'cv'
  | 'manual-cv'
  | 'video'
  | 'passport'
  | 'agency-logo'
  | 'agency-proof'
  | 'agent-photo'
  | 'agent-proof'
  | 'company-proof'
  | 'photo'
  | 'proof'

const TYPE_SEGMENTS: Record<StorageUploadType, string[]> = {
  cv: ['cv'],
  'manual-cv': ['cv'],
  video: ['video'],
  passport: ['passport'],
  'agency-logo': ['agency', 'logo'],
  'agency-proof': ['agency', 'proof'],
  'agent-photo': ['agent', 'photo'],
  'agent-proof': ['agent', 'proof'],
  'company-proof': ['company', 'proof'],
  photo: ['agent', 'photo'],
  proof: ['agency', 'proof'],
}

export const ALLOWED_CONFIG: Record<
  StorageUploadType,
  { mimes: string[]; maxSize: number }
> = {
  cv: {
    mimes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024,
  },
  'manual-cv': {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 5 * 1024 * 1024,
  },
  video: {
    mimes: [
      'video/webm',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ],
    maxSize: 50 * 1024 * 1024,
  },
  passport: {
    mimes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024,
  },
  'agency-logo': {
    mimes: imageMimes,
    maxSize: 2 * 1024 * 1024,
  },
  'agency-proof': {
    mimes: proofMimes,
    maxSize: 10 * 1024 * 1024,
  },
  'agent-photo': {
    mimes: imageMimes,
    maxSize: 2 * 1024 * 1024,
  },
  'agent-proof': {
    mimes: proofMimes,
    maxSize: 10 * 1024 * 1024,
  },
  'company-proof': {
    mimes: proofMimes,
    maxSize: 10 * 1024 * 1024,
  },
  photo: {
    mimes: imageMimes,
    maxSize: 2 * 1024 * 1024,
  },
  proof: {
    mimes: proofMimes,
    maxSize: 10 * 1024 * 1024,
  },
}

/** API `type` values accepted by POST /api/upload (excludes manual-cv) */
export const UPLOAD_API_TYPE_KEYS = [
  'cv',
  'video',
  'passport',
  'agency-logo',
  'agency-proof',
  'agent-photo',
  'agent-proof',
  'company-proof',
  'photo',
  'proof',
] as const

export type UploadApiTypeKey = (typeof UPLOAD_API_TYPE_KEYS)[number]

export function isUploadApiType(t: string): t is UploadApiTypeKey {
  return (UPLOAD_API_TYPE_KEYS as readonly string[]).includes(t)
}

export function sanitizeFilename(name: string): string {
  const base = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_')
  const trimmed = base.replace(/_+/g, '_').replace(/^\.+/, '')
  return (trimmed || 'file').slice(0, 200)
}

export interface GeneratedPath {
  absoluteDir: string
  absolutePath: string
  publicUrl: string
  storedFileName: string
}

/**
 * Build destination paths under public/uploads/{category}/YYYY/MM[/userId]/timestamp-random-name
 */
export function generateFilePath(
  type: StorageUploadType,
  originalName: string,
  userId?: string
): GeneratedPath {
  const segments = TYPE_SEGMENTS[type]
  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const timestamp = Date.now()
  const random = randomBytes(8).toString('hex')
  const safe = sanitizeFilename(originalName)
  const storedFileName = `${timestamp}-${random}-${safe}`

  const subPath = [...segments, yyyy, mm]
  if (userId) {
    const u = sanitizeFilename(userId).slice(0, 80)
    if (u) subPath.push(u)
  }

  const absoluteDir = path.join(process.cwd(), 'public', 'uploads', ...subPath)
  const absolutePath = path.join(absoluteDir, storedFileName)
  const publicUrl = '/' + ['uploads', ...subPath, storedFileName].join('/')

  return { absoluteDir, absolutePath, publicUrl, storedFileName }
}

export function validateFile(
  file: File,
  type: StorageUploadType
): { valid: true } | { valid: false; error: string } {
  const config = ALLOWED_CONFIG[type]
  if (!config) {
    return { valid: false, error: 'Invalid storage type' }
  }
  if (!config.mimes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${config.mimes.join(', ')}`,
    }
  }
  if (file.size > config.maxSize) {
    const maxMB = config.maxSize / (1024 * 1024)
    return { valid: false, error: `File too large. Maximum size is ${maxMB} MB` }
  }
  return { valid: true }
}

export function validateBuffer(
  buffer: Buffer,
  mimeType: string,
  type: StorageUploadType
): { valid: true } | { valid: false; error: string } {
  const config = ALLOWED_CONFIG[type]
  if (!config) {
    return { valid: false, error: 'Invalid storage type' }
  }
  if (!config.mimes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${config.mimes.join(', ')}`,
    }
  }
  if (buffer.length > config.maxSize) {
    const maxMB = config.maxSize / (1024 * 1024)
    return { valid: false, error: `File too large. Maximum size is ${maxMB} MB` }
  }
  return { valid: true }
}

async function streamFileToDisk(file: File, destPath: string): Promise<void> {
  await fs.mkdir(path.dirname(destPath), { recursive: true })
  const webStream = file.stream()
  const nodeReadable = Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0])
  const writeStream = createWriteStream(destPath)
  try {
    await pipeline(nodeReadable, writeStream)
  } catch (err) {
    await fs.unlink(destPath).catch(() => {})
    throw err
  }
}

/**
 * Save a multipart File to local disk under public/uploads. Uses streams to limit memory use.
 */
export async function saveFile(
  file: File,
  type: StorageUploadType,
  options?: { userId?: string }
): Promise<{ url: string; fileName: string; size: number }> {
  const v = validateFile(file, type)
  if (!v.valid) {
    throw new Error(v.error)
  }

  const { absolutePath, publicUrl } = generateFilePath(type, file.name, options?.userId)
  await streamFileToDisk(file, absolutePath)

  return {
    url: publicUrl,
    fileName: file.name,
    size: file.size,
  }
}

/**
 * Save an in-memory buffer (e.g. bulk import). Uses writeFile; callers should keep buffers small per validation limits.
 */
export async function saveBuffer(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  type: StorageUploadType,
  options?: { userId?: string }
): Promise<{ url: string; fileName: string; size: number }> {
  const v = validateBuffer(buffer, mimeType, type)
  if (!v.valid) {
    throw new Error(v.error)
  }

  const { absoluteDir, absolutePath, publicUrl } = generateFilePath(
    type,
    originalName,
    options?.userId
  )
  await fs.mkdir(absoluteDir, { recursive: true })
  await fs.writeFile(absolutePath, buffer)

  return {
    url: publicUrl,
    fileName: originalName,
    size: buffer.length,
  }
}

/** Optional: remove a previously stored file when replacing (public URL path only). */
export async function deleteUploadIfExists(publicUrl: string | undefined): Promise<void> {
  if (!publicUrl || typeof publicUrl !== 'string') return
  if (!publicUrl.startsWith('/uploads/')) return
  const relative = publicUrl.replace(/^\//, '')
  const full = path.join(process.cwd(), 'public', relative)
  const resolved = path.resolve(full)
  const publicRoot = path.join(process.cwd(), 'public')
  if (!resolved.startsWith(publicRoot)) return
  await fs.unlink(resolved).catch(() => {})
}
