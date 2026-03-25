import type { Candidate } from '@/lib/db'
import { getDatabase } from '@/lib/mongodb'
import { saveBuffer } from '@/lib/file-storage'
import * as XLSX from 'xlsx'

import { db } from './db'

export type BulkUploadSourceType = 'bulk_upload'

export const BULK_UPLOAD_MAX_CANDIDATES = 1000
export const BULK_UPLOAD_MAX_CV_SIZE_BYTES = 5 * 1024 * 1024
export const BULK_UPLOAD_MAX_TOTAL_CV_SIZE_BYTES = 500 * 1024 * 1024

export const BULK_UPLOAD_SHEET_NAME = 'Candidates'

export const BULK_UPLOAD_REQUIRED_COLUMNS = [
  'SLNo',
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'nationality',
  'skill',
  'currentLocation',
  'jobCategories',
  'highestEducation',
  'cvFileName',
  'candidateSelected',
] as const

export const BULK_UPLOAD_OPTIONAL_COLUMNS = [
  'preferredLocations',
  'languages',
  'maritalStatus',
  'currentSalary',
  'salaryExpectation',
  'visaStatus',
  'visaValidityDate',
  'remarks',
  'currentStatus',
  'howYouKnowAboutUs',
  'nextStep',
] as const

export type BulkUploadColumnName = (typeof BULK_UPLOAD_REQUIRED_COLUMNS)[number] | (typeof BULK_UPLOAD_OPTIONAL_COLUMNS)[number]

export type BulkUploadValidationError = {
  rowNo: number // Excel row number (data row starts at 2)
  errors: string[]
  email?: string
  cvFileName?: string
}

export type BulkUploadValidationResult = {
  spreadsheetFileName: string
  candidatesToUpload: number
  totalCandidatesInSheet: number
  totalCvFilesInBatch: number
  missingCvFileNames: string[]
  errors: BulkUploadValidationError[]
  errorReportBase64?: string
  validRows: BulkUploadParsedRow[]
}

export type BulkUploadParsedRow = {
  rowNo: number
  slNo: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  nationality: string
  skill: string[] // mapped to Candidate.skills
  currentLocation: string
  preferredLocations: string[]
  languages: string[]
  maritalStatus: string
  currentSalary?: string
  jobCategories: string[]
  highestEducation: string
  cvFileName: string
  salaryExpectation?: string
  visaStatus?: string
  visaValidityDate?: string
  remarks?: string
  currentStatus?: string
  howYouKnowAboutUs?: string
  nextStep?: string
  candidateSelectedRaw: string
  candidateSelected?: boolean
}

const ALLOWED_GENDERS = new Set(['Male', 'Female', 'Other', 'Prefer Not to Say'])
const ALLOWED_MARITAL_STATUSES = new Set(['Single', 'Married', 'Divorced', 'Widowed'])
const ALLOWED_HIGHEST_EDUCATIONS = new Set(['10th', '12th', 'Diploma', 'Bachelor', 'Master', 'PhD'])
const ALLOWED_CURRENT_STATUS = new Set(['Active', 'Inactive', 'On Hold', 'Rejected'])
const ALLOWED_VISA_STATUSES = new Set(['Indian Citizen', 'Work Visa', 'Requires Sponsorship', 'On Valid Visa'])

function asTrimmedString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') {
    // For numeric cells like "10" we don't want "10.0"
    if (Number.isInteger(value)) return String(value)
    return String(value).trim()
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).trim()
}

function normalizeHeaderCell(v: unknown): string {
  return asTrimmedString(v).replace(/^\uFEFF/, '') // strip BOM if present
}

function parseDecimalLpa(raw: string, fieldLabel: string, errors: string[]) {
  if (!raw) return undefined
  const n = Number(raw)
  if (Number.isNaN(n) || n < 0) errors.push(`${fieldLabel} must be a valid decimal number in LPA`)
  return raw
}

function parseDateFlexible(raw: string, errors: string[], label: string): string | undefined {
  const s = raw.trim()
  if (!s) return undefined
  // DD/MM/YYYY
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/
  const m = s.match(ddmmyyyy)
  if (m) {
    const day = Number(m[1])
    const month = Number(m[2])
    const year = Number(m[3])
    const d = new Date(Date.UTC(year, month - 1, day))
    if (Number.isNaN(d.getTime())) {
      errors.push(`${label} must be in DD/MM/YYYY`)
      return undefined
    }
    return d.toISOString().slice(0, 10)
  }

  // YYYY-MM-DD
  const yyyyMMdd = /^(\d{4})-(\d{2})-(\d{2})$/
  if (yyyyMMdd.test(s)) return s

  errors.push(`${label} must be DD/MM/YYYY or YYYY-MM-DD`)
  return undefined
}

function splitCommaList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function validateRequiredColumns(headers: string[]): { missing: string[] } {
  const missing = BULK_UPLOAD_REQUIRED_COLUMNS.filter((col) => !headers.includes(col))
  return { missing }
}

function toBooleanYesNo(raw: string, errors: string[], label: string): boolean | undefined {
  const s = raw.trim().toUpperCase()
  if (!s) {
    errors.push(`${label} is required`)
    return undefined
  }
  if (s === 'YES') return true
  if (s === 'NO') return false
  errors.push(`${label} must be YES or NO`)
  return undefined
}

function statusToCandidateStatus(status?: string, isActiveFromStatus?: boolean): { status?: Candidate['status']; isActive?: boolean; currentStatus?: string } {
  const s = (status ?? '').trim()
  if (!s) return {}
  if (!ALLOWED_CURRENT_STATUS.has(s)) return {}

  switch (s) {
    case 'Active':
      return { status: 'available', isActive: true, currentStatus: s }
    case 'On Hold':
      return { status: 'on_hold', isActive: true, currentStatus: s }
    case 'Inactive':
      return { status: 'available', isActive: false, currentStatus: s }
    case 'Rejected':
      return { status: 'available', isActive: false, currentStatus: s }
    default:
      return {}
  }
}

function addErrorPrefix(rowNo: number, errors: string[]): BulkUploadValidationError {
  return { rowNo, errors }
}

async function parseSpreadsheetToRows(spreadsheetBuffer: Buffer, spreadsheetFileName: string): Promise<BulkUploadParsedRow[]> {
  const workbook = XLSX.read(spreadsheetBuffer, { type: 'buffer', cellDates: true })

  const ext = spreadsheetFileName.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'csv'
  const sheetName =
    ext === 'xlsx'
      ? workbook.Sheets[BULK_UPLOAD_SHEET_NAME]
        ? BULK_UPLOAD_SHEET_NAME
        : (() => {
            throw new Error(
              `Missing required sheet "${BULK_UPLOAD_SHEET_NAME}". Add a sheet named "${BULK_UPLOAD_SHEET_NAME}" with headers in row 1.`
            )
          })()
      : workbook.SheetNames[0]

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`)

  const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (!aoa.length) return []

  const headerRow = aoa[0].map(normalizeHeaderCell)
  const headerToIndex = new Map<string, number>()
  headerRow.forEach((h, idx) => {
    if (!h) return
    headerToIndex.set(h, idx)
  })

  const headerValidation = validateRequiredColumns(headerRow)
  if (headerValidation.missing.length) {
    throw new Error(`Missing required column(s): ${headerValidation.missing.join(', ')}`)
  }

  const get = (row: any[], colName: string) => {
    const idx = headerToIndex.get(colName)
    if (idx === undefined) return ''
    return row[idx]
  }

  const parsed: BulkUploadParsedRow[] = []

  for (let rowIdx = 1; rowIdx < aoa.length; rowIdx++) {
    const row = aoa[rowIdx]

    const isAllEmpty = (row ?? []).every((cell) => {
      const s = asTrimmedString(cell)
      return !s
    })
    if (isAllEmpty) continue

    const rowNo = rowIdx + 2 // excel row number (header is row 1)

    const rawSlNo = asTrimmedString(get(row, 'SLNo'))
    const slNo = rawSlNo ? Number(rawSlNo) : NaN

    parsed.push({
      rowNo,
      slNo: slNo,
      firstName: asTrimmedString(get(row, 'firstName')),
      lastName: asTrimmedString(get(row, 'lastName')),
      email: asTrimmedString(get(row, 'email')).toLowerCase(),
      phone: asTrimmedString(get(row, 'phone')),
      dateOfBirth: asTrimmedString(get(row, 'dateOfBirth')),
      gender: asTrimmedString(get(row, 'gender')),
      nationality: asTrimmedString(get(row, 'nationality')),
      skill: splitCommaList(asTrimmedString(get(row, 'skill'))),
      currentLocation: asTrimmedString(get(row, 'currentLocation')),
      preferredLocations: splitCommaList(asTrimmedString(get(row, 'preferredLocations'))),
      languages: splitCommaList(asTrimmedString(get(row, 'languages'))),
      maritalStatus: asTrimmedString(get(row, 'maritalStatus')),
      currentSalary: asTrimmedString(get(row, 'currentSalary')) || undefined,
      jobCategories: splitCommaList(asTrimmedString(get(row, 'jobCategories'))),
      highestEducation: asTrimmedString(get(row, 'highestEducation')),
      cvFileName: asTrimmedString(get(row, 'cvFileName')),
      salaryExpectation: asTrimmedString(get(row, 'salaryExpectation')) || undefined,
      visaStatus: asTrimmedString(get(row, 'visaStatus')) || undefined,
      visaValidityDate: asTrimmedString(get(row, 'visaValidityDate')) || undefined,
      remarks: asTrimmedString(get(row, 'remarks')) || undefined,
      currentStatus: asTrimmedString(get(row, 'currentStatus')) || undefined,
      howYouKnowAboutUs: asTrimmedString(get(row, 'howYouKnowAboutUs')) || undefined,
      nextStep: asTrimmedString(get(row, 'nextStep')) || undefined,
      candidateSelectedRaw: asTrimmedString(get(row, 'candidateSelected')),
    })
  }

  return parsed
}

export async function validateBulkUploadCandidates(args: {
  agencyId: string
  uploadedBy?: string
  spreadsheetFileName: string
  spreadsheetBuffer: Buffer
  cvFiles: Array<{ fileName: string; buffer: Buffer; size: number; type: string }>
}): Promise<BulkUploadValidationResult> {
  const { agencyId, spreadsheetFileName, spreadsheetBuffer, cvFiles } = args
  const allRows = await parseSpreadsheetToRows(spreadsheetBuffer, spreadsheetFileName)

  if (allRows.length > BULK_UPLOAD_MAX_CANDIDATES) {
    throw new Error(`Maximum ${BULK_UPLOAD_MAX_CANDIDATES} candidates per upload exceeded`)
  }

  // CV files basic validation
  const cvMap = new Map<string, { fileName: string; buffer: Buffer; size: number; type: string }>()
  const cvErrors: string[] = []
  let totalCvSize = 0
  for (const f of cvFiles) {
    totalCvSize += f.size
    if (f.size > BULK_UPLOAD_MAX_CV_SIZE_BYTES) cvErrors.push(`CV file '${f.fileName}' exceeds 5 MB limit`)
    const allowedExt = ['.pdf', '.doc', '.docx']
    const lower = f.fileName.toLowerCase()
    const extOk = allowedExt.some((e) => lower.endsWith(e))
    if (!extOk) cvErrors.push(`File '${f.fileName}': Only .pdf, .doc, .docx allowed`)

    if (cvMap.has(f.fileName)) cvErrors.push(`File '${f.fileName}': Duplicate file name in batch`)
    cvMap.set(f.fileName, f)
  }
  if (totalCvSize > BULK_UPLOAD_MAX_TOTAL_CV_SIZE_BYTES) {
    cvErrors.push(`Total CV upload size exceeds 500 MB limit`)
  }

  const errors: BulkUploadValidationError[] = []

  const emailToRowNos = new Map<string, number[]>()
  for (const r of allRows) {
    if (r.email) {
      const e = r.email.toLowerCase()
      emailToRowNos.set(e, [...(emailToRowNos.get(e) ?? []), r.rowNo])
    }
  }

  // Detect duplicates within sheet
  for (const [email, rowNos] of emailToRowNos.entries()) {
    if (rowNos.length > 1) {
      for (const rowNo of rowNos) {
        errors.push({
          rowNo,
          errors: [`Row ${rowNo}: Email already exists in the spreadsheet`],
          email,
        })
      }
    }
  }

  // Validate each row fields
  const normalizedRows: BulkUploadParsedRow[] = []
  const usedCvFileNames = new Map<string, number[]>() // cvFileName -> rowNos

  for (const row of allRows) {
    const rowErrors: string[] = []

    const requiredPairs: Array<[keyof BulkUploadParsedRow, string]> = [
      ['slNo', 'SLNo'],
      ['firstName', 'firstName'],
      ['lastName', 'lastName'],
      ['email', 'email'],
      ['phone', 'phone'],
      ['dateOfBirth', 'dateOfBirth'],
      ['gender', 'gender'],
      ['nationality', 'nationality'],
      ['skill', 'skill'],
      ['currentLocation', 'currentLocation'],
      ['jobCategories', 'jobCategories'],
      ['highestEducation', 'highestEducation'],
      ['cvFileName', 'cvFileName'],
      ['candidateSelectedRaw', 'candidateSelected'],
    ]

    for (const [k, label] of requiredPairs) {
      const v = (row as any)[k]
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === 'string' && !v.trim()) ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === 'number' && Number.isNaN(v))
      if (empty) rowErrors.push(`Row ${row.rowNo}: '${label}' is required`)
    }

    if (Number.isFinite(row.slNo) && row.slNo > 0) {
      // ok
    } else if (row.slNo !== undefined) {
      rowErrors.push(`Row ${row.rowNo}: SLNo must be a positive integer`)
    }

    // email format
    const email = row.email?.toLowerCase()
    if (email) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      if (!emailOk) rowErrors.push(`Row ${row.rowNo}: Invalid email format`)
    }

    // phone (international: digits, optional + prefix, allow spaces/dashes)
    if (row.phone) {
      const compact = row.phone.replace(/[\s\-().]/g, '')
      const phoneOk = /^\+?[0-9]{7,15}$/.test(compact)
      if (!phoneOk) rowErrors.push(`Row ${row.rowNo}: Phone must be a valid international format`)
      ;(row as any).phone = compact
    }

    // DOB
    if (row.dateOfBirth) {
      const parsedDob = parseDateFlexible(row.dateOfBirth, rowErrors, 'Date of birth')
      ;(row as any).dateOfBirth = parsedDob ?? row.dateOfBirth
    }

    // gender
    if (row.gender) {
      const normalized =
        row.gender.trim().toLowerCase() === 'prefer not to say'
          ? 'Prefer Not to Say'
          : row.gender.trim().charAt(0).toUpperCase() + row.gender.trim().slice(1).toLowerCase()
      if (!ALLOWED_GENDERS.has(normalized)) rowErrors.push(`Row ${row.rowNo}: Gender must be Male / Female / Other / Prefer Not to Say`)
      ;(row as any).gender = normalized
    }

    // maritalStatus (optional)
    if (row.maritalStatus) {
      const normalized =
        row.maritalStatus.trim().toLowerCase() === 'prefer not to say'
          ? 'Prefer not to say'
          : row.maritalStatus.trim().charAt(0).toUpperCase() + row.maritalStatus.trim().slice(1).toLowerCase()
      if (row.maritalStatus && !ALLOWED_MARITAL_STATUSES.has(normalized)) {
        rowErrors.push(`Row ${row.rowNo}: Marital status must be Single / Married / Divorced / Widowed`)
      }
      ;(row as any).maritalStatus = normalized
    }

    // skill
    if (!row.skill || row.skill.length === 0) rowErrors.push(`Row ${row.rowNo}: skill must be a comma-separated list`)

    // currentSalary & salaryExpectation (optional)
    if (row.currentSalary) {
      const decimalErrors: string[] = []
      parseDecimalLpa(row.currentSalary, 'currentSalary', decimalErrors)
      rowErrors.push(...decimalErrors)
    }
    if (row.salaryExpectation) {
      const decimalErrors: string[] = []
      parseDecimalLpa(row.salaryExpectation, 'salaryExpectation', decimalErrors)
      rowErrors.push(...decimalErrors)
    }

    // highestEducation
    if (row.highestEducation) {
      const normalized = row.highestEducation.trim()
      if (!ALLOWED_HIGHEST_EDUCATIONS.has(normalized)) {
        rowErrors.push(`Row ${row.rowNo}: highestEducation must be 10th / 12th / Diploma / Bachelor / Master / PhD`)
      }
      ;(row as any).highestEducation = normalized
    }

    // currentStatus optional
    if (row.currentStatus) {
      if (!ALLOWED_CURRENT_STATUS.has(row.currentStatus.trim())) {
        rowErrors.push(`Row ${row.rowNo}: currentStatus must be Active / Inactive / On Hold / Rejected`)
      }
      ;(row as any).currentStatus = row.currentStatus.trim()
    }

    // visaStatus optional
    if (row.visaStatus) {
      if (!ALLOWED_VISA_STATUSES.has(row.visaStatus.trim())) {
        rowErrors.push(`Row ${row.rowNo}: visaStatus must be one of the allowed values`)
      }
      ;(row as any).visaStatus = row.visaStatus.trim()
    }

    // visaValidityDate optional
    if (row.visaValidityDate) {
      const parsedVisa = parseDateFlexible(row.visaValidityDate, rowErrors, 'visaValidityDate')
      if (parsedVisa) (row as any).visaValidityDate = parsedVisa
    }

    // candidateSelected
    const parsedCandidateSelected = toBooleanYesNo(row.candidateSelectedRaw, rowErrors, 'candidateSelected')
    if (typeof parsedCandidateSelected === 'boolean') row.candidateSelected = parsedCandidateSelected

    // jobCategories
    if (!row.jobCategories || row.jobCategories.length === 0) rowErrors.push(`Row ${row.rowNo}: jobCategories must be a comma-separated list`)

    // cvFileName tracking
    if (row.cvFileName) {
      usedCvFileNames.set(row.cvFileName, [...(usedCvFileNames.get(row.cvFileName) ?? []), row.rowNo])
    } else {
      rowErrors.push(`Row ${row.rowNo}: CV file name is required`)
    }

    if (rowErrors.length) {
      errors.push({ rowNo: row.rowNo, errors: rowErrors, email: row.email, cvFileName: row.cvFileName })
    } else {
      normalizedRows.push(row)
    }
  }

  // CV mapping validation (existence + usage uniqueness)
  const referencedCvNames = new Set(normalizedRows.map((r) => r.cvFileName))
  const missingCvFileNames = [...referencedCvNames].filter((name) => !cvMap.has(name))
  for (const name of missingCvFileNames) {
    const rowsUsing = normalizedRows.filter((r) => r.cvFileName === name)
    for (const r of rowsUsing) {
      errors.push({
        rowNo: r.rowNo,
        errors: [`Row ${r.rowNo}: CV file '${name}' not uploaded`],
        email: r.email,
        cvFileName: name,
      })
    }
  }

  for (const [cvName, rowNos] of usedCvFileNames.entries()) {
    if (rowNos.length > 1) {
      for (const rowNo of rowNos) {
        errors.push({
          rowNo,
          errors: [`Row ${rowNo}: CV file '${cvName}' is referenced by multiple candidates`],
          cvFileName: cvName,
        })
      }
    }
  }

  // System uniqueness: email must not exist in candidates/agencies/companies/users
  const normalizedUniqueEmails = [...new Set(normalizedRows.map((r) => r.email).filter(Boolean))]
  if (normalizedUniqueEmails.length) {
    const database = await getDatabase()
    const [cand, agencies, companies, users] = await Promise.all([
      database.collection('candidates').find({ email: { $in: normalizedUniqueEmails } }).project({ email: 1 }).toArray(),
      database.collection('agencies').find({ email: { $in: normalizedUniqueEmails } }).project({ email: 1 }).toArray(),
      database.collection('companies').find({ email: { $in: normalizedUniqueEmails } }).project({ email: 1 }).toArray(),
      database.collection('users').find({ email: { $in: normalizedUniqueEmails } }).project({ email: 1 }).toArray(),
    ])

    const existingEmails = new Set<string>([
      ...cand.map((d: any) => String(d.email).toLowerCase()),
      ...agencies.map((d: any) => String(d.email).toLowerCase()),
      ...companies.map((d: any) => String(d.email).toLowerCase()),
      ...users.map((d: any) => String(d.email).toLowerCase()),
    ])

    for (const r of normalizedRows) {
      if (existingEmails.has(r.email.toLowerCase())) {
        errors.push({
          rowNo: r.rowNo,
          errors: [`Row ${r.rowNo}: Email already exists in database`],
          email: r.email,
          cvFileName: r.cvFileName,
        })
      }
    }
  }

  // CV file errors are "global"; convert them into row-less errors
  for (const cvErr of cvErrors) {
    errors.push({
      rowNo: 0,
      errors: [cvErr],
    })
  }

  const validRows = normalizedRows.filter((r) => !errors.some((e) => e.rowNo === r.rowNo))

  // Summary counts
  const candidatesToUpload = validRows.length
  const errorReportBase64 =
    errors.length > 0 ? generateErrorReportXlsx({ allRows, errors }) : undefined

  return {
    spreadsheetFileName,
    candidatesToUpload,
    totalCandidatesInSheet: allRows.length,
    totalCvFilesInBatch: cvFiles.length,
    missingCvFileNames,
    errors,
    errorReportBase64,
    validRows,
  }
}

function generateErrorReportXlsx(args: { allRows: BulkUploadParsedRow[]; errors: BulkUploadValidationError[] }): string {
  const headers = ['Row No', 'Email', 'CV File Name', 'Errors']

  const rowByNo = new Map<number, BulkUploadParsedRow>()
  for (const r of args.allRows) rowByNo.set(r.rowNo, r)

  const data: any[][] = []
  for (const err of args.errors) {
    const row = rowByNo.get(err.rowNo)
    data.push([
      err.rowNo || '',
      err.email ?? row?.email ?? '',
      err.cvFileName ?? row?.cvFileName ?? '',
      err.errors.join('; '),
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Error Report')
  return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' }) as unknown as string
}

export async function importBulkUploadCandidates(args: {
  agencyId: string
  uploadedBy?: string
  uploadedByEmail?: string
  spreadsheetFileName: string
  spreadsheetBuffer: Buffer
  cvFiles: Array<{ fileName: string; buffer: Buffer; size: number; type: string }>
  agentId?: string
  validation?: BulkUploadValidationResult
}): Promise<{
  batchId: string
  successfulUploads: number
  failedUploads: number
  totalCandidates: number
  results: Array<{ rowNo: number; status: 'success' | 'error'; message: string; candidateId?: string }>
}> {
  const validation = args.validation ?? (await validateBulkUploadCandidates(args))
  if (validation.errors.length) throw Object.assign(new Error('Validation failed'), { validation })

  const { agencyId, uploadedBy, spreadsheetFileName, spreadsheetBuffer, cvFiles, agentId } = args
  const database = await getDatabase()
  const now = new Date()
  const batchId = `BU-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6)}`

  // CV lookup
  const cvMap = new Map<string, { fileName: string; buffer: Buffer; size: number; type: string }>()
  for (const f of cvFiles) cvMap.set(f.fileName, f)

  const results: Array<{ rowNo: number; status: 'success' | 'error'; message: string; candidateId?: string }> = []

  // Monthly limit check (if enabled)
  const agency = await db.agencies.getById(agencyId)
  const monthlyLimit = (agency as any)?.bulkUploadMonthlyLimit
  if (typeof monthlyLimit === 'number' && monthlyLimit >= 0) {
    // -1 = unlimited
    if (monthlyLimit !== -1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
      const existingBatches = await database.collection('uploadBatches').find({
        agencyId,
        uploadedAt: { $gte: monthStart, $lte: monthEnd },
        uploadStatus: 'Completed',
      }).toArray()
      const used = existingBatches.reduce((sum: number, b: any) => sum + Number(b.successfulUploads || 0), 0)
      const incoming = validation.validRows.length
      if (used + incoming > monthlyLimit) {
        throw new Error(`Monthly bulk upload limit exceeded. Used: ${used}, limit: ${monthlyLimit}, incoming: ${incoming}`)
      }
    }
  }

  // Import candidates
  let successfulUploads = 0
  const totalCandidates = validation.validRows.length

  for (const row of validation.validRows) {
    try {
      const cvFile = cvMap.get(row.cvFileName)
      if (!cvFile) throw new Error(`CV file not found for '${row.cvFileName}'`)

      const { url: cvUrl } = await saveBuffer(
        cvFile.buffer,
        cvFile.type,
        cvFile.fileName,
        'cv',
        { userId: agencyId }
      )

      const mappedStatus = statusToCandidateStatus(row.currentStatus)

      const candidate = await db.candidates.create({
        role: 'candidate',
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        dateOfBirth: row.dateOfBirth,
        gender: row.gender,
        nationality: row.nationality,
        currentLocation: row.currentLocation,
        preferredLocations: row.preferredLocations,
        languages: row.languages,
        maritalStatus: row.maritalStatus,
        totalExperience: '',
        currentJobTitle: '',
        currentCompany: '',
        currentSalary: row.currentSalary ?? '',
        expectedSalary: row.salaryExpectation ?? '',
        salaryExpectation: row.salaryExpectation ?? '',
        noticePeriod: '',
        industries: [],
        jobTypes: [],
        jobCategories: row.jobCategories,
        highestEducation: row.highestEducation,
        fieldOfStudy: '',
        skills: row.skill,
        certifications: [],
        cvUrl,
        photoUrl: undefined,
        passportUrl: undefined,
        videoUrl: undefined,
        status: mappedStatus.status ?? 'available',
        visaCategory: row.visaValidityDate ?? '',
        visaValidity: row.visaValidityDate ?? '',
        visaStatus: row.visaStatus ?? '',
        salaryRange: undefined,
        password: '',
        isActive: mappedStatus.isActive ?? true,
        agencyId,
        // Extra fields used by UI/spec (stored as custom properties)
        remarks: row.remarks ?? '',
        howYouKnowAboutUs: row.howYouKnowAboutUs ?? '',
        nextStep: row.nextStep ?? '',
        currentStatus: row.currentStatus ?? mappedStatus.currentStatus ?? 'Active',
        candidateSelected: row.candidateSelected ?? false,
      } as any)

      await db.candidateSources.create({
        candidateId: candidate.id,
        agentId: agentId || undefined,
        agencyId,
        sourceType: 'bulk_upload',
      })

      await database.collection('candidateFiles').insertOne({
        candidateId: candidate.id,
        fileName: row.cvFileName,
        fileSize: cvFile.size,
        fileType: cvFile.type,
        filePath: cvUrl,
        uploadedAt: now.toISOString(),
      })

      successfulUploads++
      results.push({ rowNo: row.rowNo, status: 'success', message: 'Uploaded', candidateId: candidate.id })
    } catch (e: any) {
      results.push({ rowNo: row.rowNo, status: 'error', message: e?.message || 'Import failed' })
    }
  }

  const failedUploads = totalCandidates - successfulUploads

  const errorLog = results
    .filter((r) => r.status === 'error')
    .map((r) => ({ rowNo: r.rowNo, message: r.message }))

  // Upload batch log
  await database.collection('uploadBatches').insertOne({
    batchId,
    agencyId,
    uploadedBy: uploadedBy ?? null,
    uploadedByEmail: args.uploadedByEmail ?? null,
    spreadsheetFileName,
    totalCandidates,
    successfulUploads,
    failedUploads,
    totalCVFiles: cvFiles.length,
    uploadStatus: failedUploads > 0 ? 'Completed' : 'Completed',
    uploadedAt: now.toISOString(),
    completedAt: now.toISOString(),
    errorLog,
  })

  // Update agency counters
  await db.agencies.update(agencyId, {
    cvUploadsUsed: ((agency as any)?.cvUploadsUsed || 0) + successfulUploads,
    totalCandidates: ((agency as any)?.totalCandidates || 0) + successfulUploads,
  })

  return { batchId, successfulUploads, failedUploads, totalCandidates, results }
}

