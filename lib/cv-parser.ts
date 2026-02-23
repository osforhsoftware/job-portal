/**
 * Extract text from PDF/DOC/DOCX buffers for CV parsing.
 * Uses pdf-parse (PDF) and mammoth (DOC/DOCX). Falls back to empty string if modules unavailable.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const type = mimeType?.toLowerCase() || ''
  try {
    if (type.includes('pdf')) {
      const mod = await import('pdf-parse')
      const pdfParse = (mod as { default?: (b: Buffer) => Promise<{ text?: string }> }).default ?? mod
      if (typeof pdfParse !== 'function') return ''
      const data = await (pdfParse as (b: Buffer) => Promise<{ text?: string }>)(buffer)
      return (data?.text || '').trim()
    }
    if (
      type.includes('msword') ||
      type.includes('wordprocessingml')
    ) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return (result?.value || '').trim()
    }
  } catch (_) {
    // pdf-parse or mammoth not installed or failed
  }
  return ''
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const PHONE_REGEX = /(?:\+?[\d\s()-]{10,20}|(?:\d{3}[-.\s]?){2}\d{4})/g
const NAME_LINE_REGEX = /^(?:name|full name|candidate)\s*[:.]?\s*(.+)$/im

export interface ParsedCV {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: string
}

/**
 * Parse candidate name, email, phone, skills, experience from extracted CV text.
 */
export function parseCandidateFromText(text: string, fallbackFileName?: string): ParsedCV {
  const t = (typeof text === 'string' ? text : '').slice(0, 15000)
  const emails = t.match(EMAIL_REGEX) || []
  const email = emails[0] || ''
  const phones = t.match(PHONE_REGEX) || []
  const phone = (phones[0] || '').replace(/\s+/g, ' ').trim().slice(0, 30)

  let name = ''
  const nameLine = t.split(/\r?\n/).find((line) => NAME_LINE_REGEX.test(line))
  if (nameLine) {
    const m = nameLine.match(NAME_LINE_REGEX)
    if (m) name = m[1].trim().slice(0, 120)
  }
  if (!name && t.length > 0) {
    const firstLine = t.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 2 && l.length < 80)
    if (firstLine && !firstLine.includes('@') && !/^\d[\d\s.-]*$/.test(firstLine)) name = firstLine
  }
  if (!name && fallbackFileName) {
    const base = fallbackFileName.replace(/\.[^.]+$/, '').replace(/[-_\s]+/g, ' ')
    name = base.slice(0, 80) || 'Unknown Candidate'
  }
  if (!name) name = 'Unknown Candidate'

  const skills: string[] = []
  const skillSection = t.match(/(?:skills?|competencies?|expertise)\s*[:.]?\s*([\s\S]*?)(?=\n\n|\r\n\r\n|experience|education|$)/im)
  if (skillSection) {
    const block = skillSection[1].replace(/,|;|\||\n/g, ' ').split(/\s+/).filter(Boolean)
    block.slice(0, 30).forEach((w) => {
      if (w.length > 1 && w.length < 50) skills.push(w)
    })
  }

  const expSection = t.match(/(?:experience|work history|employment)\s*[:.]?\s*([\s\S]*?)(?=\n\n|\r\n\r\n|education|skills|$)/im)
  const experience = expSection ? expSection[1].replace(/\s+/g, ' ').trim().slice(0, 500) : ''

  return { name, email, phone, skills, experience }
}
