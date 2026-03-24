import nodemailer from 'nodemailer'

/**
 * Email is sent only via Nodemailer + SMTP.
 * Required env: SMTP_HOST, SMTP_USER, SMTP_PASS
 * Optional: SMTP_PORT (default 587), SMTP_SECURE (true for port 465), SMTP_FROM
 *
 * EMAIL_SERVICE_KEY is not used — authentication is SMTP_USER + SMTP_PASS only.
 */

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS
  )
}

function createSmtpTransport() {
  const host = process.env.SMTP_HOST!.trim()
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER!.trim()
  const pass = process.env.SMTP_PASS!

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

/** From header: SMTP_FROM if set, otherwise the authenticated SMTP_USER address */
function getMailFrom(): string {
  const custom = process.env.SMTP_FROM?.trim()
  if (custom) return custom
  const user = process.env.SMTP_USER?.trim()
  if (user) return `"Recruitment Platform" <${user}>`
  return '"Recruitment Platform" <no-reply@localhost>'
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!isSmtpConfigured()) {
    console.warn(
      '[email] SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS. Skipping send.'
    )
    return
  }

  const transporter = createSmtpTransport()

  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to,
      subject: 'Reset your password',
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>– Recruitment Platform</p>
      `,
      text: `Reset your password: ${resetLink}`,
    })
  } catch (error) {
    console.error('[email] Failed to send password reset email', error)
  }
}

export async function sendBulkUploadCompletedEmail(args: {
  to: string
  userName?: string
  agencyName: string
  batchId: string
  candidatesUploaded: number
  cvFilesLinked: number
  uploadedAt: string
}) {
  const { to, userName, agencyName, batchId, candidatesUploaded, cvFilesLinked, uploadedAt } = args

  if (!isSmtpConfigured()) {
    console.warn('[email] SMTP not configured. Skipping bulk upload email.')
    return
  }

  const transporter = createSmtpTransport()

  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to,
      subject: 'Bulk Candidate Upload Completed',
      html: `
        <p>Hi ${userName ?? 'there'},</p>
        <p>Your bulk candidate upload has been completed successfully.</p>
        <p><strong>Batch Details</strong></p>
        <ul>
          <li>Batch ID: <strong>${batchId}</strong></li>
          <li>Agency: <strong>${agencyName}</strong></li>
          <li>Candidates Uploaded: <strong>${candidatesUploaded}</strong></li>
          <li>CV Files Linked: <strong>${cvFilesLinked}</strong></li>
          <li>Uploaded At: <strong>${uploadedAt}</strong></li>
        </ul>
        <p>All candidates are now visible in your Candidates Dashboard.</p>
        <p>Best regards,<br/>TalentHub System</p>
      `,
      text: `Hi ${userName ?? 'there'},\n\nYour bulk candidate upload has been completed successfully.\n\nBatch Details:\n- Batch ID: ${batchId}\n- Agency: ${agencyName}\n- Candidates Uploaded: ${candidatesUploaded}\n- CV Files Linked: ${cvFilesLinked}\n- Uploaded At: ${uploadedAt}\n\nAll candidates are now visible in your Candidates Dashboard.\n\nBest regards,\nTalentHub System`,
    })
  } catch (error) {
    console.error('[email] Failed to send bulk upload email', error)
  }
}
