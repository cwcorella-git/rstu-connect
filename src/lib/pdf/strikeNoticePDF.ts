/**
 * Rent Strike Notice PDF Generation
 * Generates legal 14-day and 48-hour rent withholding notices under Nevada law
 */

import jsPDF from 'jspdf'

export interface StrikeNoticeData {
  noticeType: '14-day' | '48-hour'
  recipientName: string // Landlord/property manager name
  recipientAddress?: string
  propertyAddress: string
  propertyCity?: string
  tenantNames: string[]
  habitabilityIssues: Array<{ label: string; count: number }>
  escrowBankName: string
  escrowAccountInfo: string // Last 4 digits masked
  generatedDate?: Date
  organizationName?: string
  organizationPhone?: string
}

/**
 * Generate a professional rent withholding notice PDF compliant with Nevada law
 * Returns a Blob that can be downloaded or emailed
 */
export function generateStrikeNoticePDF(data: StrikeNoticeData): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margins = { top: 15, left: 20, right: 20, bottom: 15 }
  const contentWidth = pageWidth - margins.left - margins.right

  let yPos = margins.top

  // Helper to add text with automatic line breaking
  const addMultilineText = (
    text: string,
    fontSize: number,
    style: 'normal' | 'bold' = 'normal',
    align: 'left' | 'center' = 'left'
  ) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', style)

    const lines = doc.splitTextToSize(text, contentWidth)
    const lineHeight = fontSize * 0.353

    if (yPos + lineHeight * lines.length > pageHeight - margins.bottom) {
      doc.addPage()
      yPos = margins.top
    }

    doc.text(lines, margins.left, yPos, { align, maxWidth: contentWidth })
    yPos += lineHeight * lines.length + 2

    return yPos
  }

  // Header
  yPos = addMultilineText('NOTICE OF RENT WITHHOLDING', 14, 'bold', 'center')
  yPos += 2

  // Subheader with legal basis
  const legalBasis =
    data.noticeType === '14-day'
      ? 'Habitability Violations - Nevada Revised Statutes § 118A.355'
      : 'Essential Services Failure - Nevada Revised Statutes § 118A.380'

  yPos = addMultilineText(legalBasis, 9, 'normal', 'center')
  yPos += 5

  // Date
  const noticeDate = data.generatedDate
    ? data.generatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  yPos = addMultilineText(`Date: ${noticeDate}`, 10, 'normal', 'left')
  yPos += 3

  // Recipient section
  yPos = addMultilineText('TO:', 10, 'bold', 'left')
  yPos = addMultilineText(data.recipientName, 10, 'normal', 'left')
  if (data.recipientAddress) {
    yPos = addMultilineText(data.recipientAddress, 10, 'normal', 'left')
  }

  yPos += 5

  // Re: line
  yPos = addMultilineText(
    `RE: FORMAL NOTICE OF RENT WITHHOLDING - ${data.propertyAddress}`,
    10,
    'bold',
    'left'
  )
  yPos += 3

  // Opening
  yPos = addMultilineText(
    `Dear ${data.recipientName}:`,
    10,
    'normal',
    'left'
  )

  yPos += 3

  // Notice type-specific text
  if (data.noticeType === '14-day') {
    yPos = addMultilineText(
      'This letter serves as formal notice, required under Nevada Revised Statutes § 118A.355, that the tenants of the property located at ' +
        data.propertyAddress +
        ' are exercising their legal right to withhold rent due to serious habitability violations.',
      10,
      'normal',
      'left'
    )
  } else {
    yPos = addMultilineText(
      'This letter serves as formal notice, required under Nevada Revised Statutes § 118A.380, that the tenants of the property located at ' +
        data.propertyAddress +
        ' are exercising their legal right to withhold rent due to failure to provide essential services.',
      10,
      'normal',
      'left'
    )
  }

  yPos += 5

  // Reported issues
  yPos = addMultilineText(
    'DOCUMENTED HABITABILITY ISSUES:',
    10,
    'bold',
    'left'
  )
  yPos += 2

  data.habitabilityIssues.forEach((issue) => {
    yPos = addMultilineText(`• ${issue.label} (${issue.count} units affected)`, 9, 'normal', 'left')
  })

  yPos += 5

  // Rent Withholding Notice
  yPos = addMultilineText(
    'RENT WITHHOLDING NOTICE:',
    10,
    'bold',
    'left'
  )
  yPos += 2

  yPos = addMultilineText(
    'Effective immediately, all rent from the undersigned tenants will be withheld and deposited into the following escrow account, in compliance with Nevada law:',
    10,
    'normal',
    'left'
  )

  yPos += 3

  // Escrow account info
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(`Escrow Bank: ${data.escrowBankName}`, margins.left, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`Account (Last 4 digits): ${data.escrowAccountInfo}`, margins.left, yPos)
  yPos += 6

  yPos += 3

  // Legal basis text
  yPos = addMultilineText(
    'This action is taken in accordance with Nevada law, which permits tenants to deposit rent in escrow when a landlord fails to maintain the property in habitable condition. Rent will remain in escrow until all habitability issues are resolved and certified as corrected.',
    10,
    'normal',
    'left'
  )

  yPos += 5

  // Deadline
  const deadlineDate = new Date()
  if (data.noticeType === '14-day') {
    deadlineDate.setDate(deadlineDate.getDate() + 14)
    yPos = addMultilineText(
      `Deadline for Response: ${deadlineDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (14 days from notice)`,
      10,
      'bold',
      'left'
    )
  } else {
    deadlineDate.setDate(deadlineDate.getDate() + 2)
    yPos = addMultilineText(
      `Deadline for Response: ${deadlineDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (48 hours from notice)`,
      10,
      'bold',
      'left'
    )
  }

  yPos += 3

  // Legal disclosure
  yPos = addMultilineText(
    'You are required by law to acknowledge receipt of this notice and provide a plan for remediation within the specified timeframe. Failure to do so may result in additional legal action.',
    10,
    'normal',
    'left'
  )

  yPos += 5

  // Closing
  yPos = addMultilineText('Sincerely,', 10, 'normal', 'left')
  yPos += 15

  // Signatories
  yPos = addMultilineText('TENANTS (SIGNATORIES):', 10, 'bold', 'left')
  yPos += 3

  data.tenantNames.forEach((name, index) => {
    yPos = addMultilineText(`${index + 1}. ${name}`, 10, 'normal', 'left')
  })

  // Footer with legal disclaimer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'LEGAL NOTICE: This document is generated by Reno-Sparks Tenants Union for informational purposes. ' +
      'We recommend consulting with Northern Nevada Legal Aid ((775) 284-3491) before submitting. ' +
      'This notice is issued in accordance with Nevada Revised Statutes §§ 118A.355 and 118A.380.',
    margins.left,
    pageHeight - 15,
    { align: 'left', maxWidth: contentWidth }
  )

  return doc.output('blob')
}

/**
 * Download a rent strike notice PDF with the specified filename
 */
export function downloadStrikeNoticePDF(
  data: StrikeNoticeData,
  filename: string = 'rent-strike-notice.pdf'
): void {
  const blob = generateStrikeNoticePDF(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename based on notice type and property address
 */
export function getNoticeFilename(
  noticeType: '14-day' | '48-hour',
  propertyAddress: string
): string {
  const type = noticeType === '14-day' ? '14-day' : '48-hour'
  const sanitizedAddress = propertyAddress
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
  const timestamp = new Date().toISOString().split('T')[0]
  return `rent-strike-${type}-notice-${sanitizedAddress}-${timestamp}.pdf`
}

// ============================================================================
// GENERAL HABITABILITY NOTICE (Non-Strike Demand for Repairs)
// ============================================================================

export interface HabitabilityNoticeData {
  recipientName: string // Landlord/property manager
  recipientAddress?: string
  propertyAddress: string
  tenantNames: string[] // Names of tenants signing
  habitabilityIssues: Array<{ label: string; description?: string; count?: number }>
  requestedActions?: string[] // Specific repairs demanded
  responseDeadlineDays?: number // Default 14 days
  generatedDate?: Date
  tenantContactPhone?: string
  tenantContactEmail?: string
}

/**
 * Generate a formal habitability demand notice (14-day notice under NRS 118A.355)
 * This is not a strike notice, but a formal demand for repairs
 * Returns a Blob that can be downloaded
 */
export function generateHabitabilityNoticePDF(data: HabitabilityNoticeData): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margins = { top: 15, left: 20, right: 20, bottom: 15 }
  const contentWidth = pageWidth - margins.left - margins.right

  let yPos = margins.top

  // Helper to add text
  const addMultilineText = (
    text: string,
    fontSize: number,
    style: 'normal' | 'bold' = 'normal',
    align: 'left' | 'center' = 'left'
  ) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', style)

    const lines = doc.splitTextToSize(text, contentWidth)
    const lineHeight = fontSize * 0.353

    if (yPos + lineHeight * lines.length > pageHeight - margins.bottom) {
      doc.addPage()
      yPos = margins.top
    }

    doc.text(lines, margins.left, yPos, { align, maxWidth: contentWidth })
    yPos += lineHeight * lines.length + 2

    return yPos
  }

  // Header
  yPos = addMultilineText('FORMAL DEMAND FOR HABITABILITY REPAIRS', 14, 'bold', 'center')
  yPos += 2

  // Legal basis
  yPos = addMultilineText(
    'Pursuant to Nevada Revised Statutes § 118A.355 - Duty of Landlord to Maintain Property',
    9,
    'normal',
    'center'
  )
  yPos += 5

  // Date
  const noticeDate = data.generatedDate
    ? data.generatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  yPos = addMultilineText(`Date: ${noticeDate}`, 10, 'normal', 'left')
  yPos += 3

  // Recipient
  yPos = addMultilineText('TO:', 10, 'bold', 'left')
  yPos = addMultilineText(data.recipientName, 10, 'normal', 'left')
  if (data.recipientAddress) {
    yPos = addMultilineText(data.recipientAddress, 10, 'normal', 'left')
  }

  yPos += 5

  // Subject line
  yPos = addMultilineText(
    `RE: FORMAL DEMAND FOR REPAIRS - ${data.propertyAddress}`,
    10,
    'bold',
    'left'
  )
  yPos += 3

  // Opening
  yPos = addMultilineText(
    `Dear ${data.recipientName}:`,
    10,
    'normal',
    'left'
  )

  yPos += 3

  // Main text
  yPos = addMultilineText(
    `This letter serves as formal notice under Nevada Revised Statutes § 118A.355 that the property located at ${data.propertyAddress} is not being maintained in habitable condition. The tenant(s) listed below are exercising their legal right to demand immediate repairs of the documented habitability violations listed herein.`,
    10,
    'normal',
    'left'
  )

  yPos += 5

  // Issues section
  yPos = addMultilineText('DOCUMENTED HABITABILITY VIOLATIONS:', 10, 'bold', 'left')
  yPos += 2

  data.habitabilityIssues.forEach((issue) => {
    let issueText = `• ${issue.label}`
    if (issue.count) {
      issueText += ` (${issue.count} units affected)`
    }
    yPos = addMultilineText(issueText, 9, 'normal', 'left')

    if (issue.description) {
      yPos = addMultilineText(`  ${issue.description}`, 9, 'normal', 'left')
    }
  })

  yPos += 5

  // Requested actions
  if (data.requestedActions && data.requestedActions.length > 0) {
    yPos = addMultilineText('REQUIRED REPAIRS:', 10, 'bold', 'left')
    yPos += 2

    data.requestedActions.forEach((action) => {
      yPos = addMultilineText(`• ${action}`, 9, 'normal', 'left')
    })

    yPos += 5
  }

  // Legal basis
  yPos = addMultilineText(
    'Under Nevada law, landlords must maintain rental properties in habitable condition, including adequate heat, water, electricity, and freedom from pests and mold. Failure to do so violates the implied warranty of habitability and may expose you to legal consequences including tenant withholding of rent, damages, and court proceedings.',
    10,
    'normal',
    'left'
  )

  yPos += 5

  // Deadline
  const deadlineDays = data.responseDeadlineDays || 14
  const deadlineDate = new Date()
  deadlineDate.setDate(deadlineDate.getDate() + deadlineDays)

  yPos = addMultilineText(
    `DEADLINE FOR RESPONSE AND REPAIRS: ${deadlineDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (${deadlineDays} days from this notice)`,
    10,
    'bold',
    'left'
  )

  yPos += 3

  yPos = addMultilineText(
    `You must provide written acknowledgment of this notice and a detailed repair schedule within 3 days. All repairs must be completed by the deadline above.`,
    10,
    'normal',
    'left'
  )

  yPos += 5

  // Contact information
  if (data.tenantContactPhone || data.tenantContactEmail) {
    yPos = addMultilineText('CONTACT INFORMATION FOR COORDINATION:', 10, 'bold', 'left')
    if (data.tenantContactPhone) {
      yPos = addMultilineText(`Phone: ${data.tenantContactPhone}`, 9, 'normal', 'left')
    }
    if (data.tenantContactEmail) {
      yPos = addMultilineText(`Email: ${data.tenantContactEmail}`, 9, 'normal', 'left')
    }
    yPos += 5
  }

  // Closing
  yPos = addMultilineText('Sincerely,', 10, 'normal', 'left')
  yPos += 15

  // Signatories
  yPos = addMultilineText('TENANTS (SIGNATORIES):', 10, 'bold', 'left')
  yPos += 3

  data.tenantNames.forEach((name, index) => {
    yPos = addMultilineText(`${index + 1}. ${name}`, 10, 'normal', 'left')
  })

  // Footer
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'LEGAL NOTICE: This document is generated by Reno-Sparks Tenants Union. We recommend consulting with Northern Nevada Legal Aid ((775) 324-0999) before submitting. ' +
      'Preserve copies of this notice for your records. Nevada law provides protections against retaliation for asserting habitability rights.',
    margins.left,
    pageHeight - 10,
    { align: 'left', maxWidth: contentWidth }
  )

  return doc.output('blob')
}

/**
 * Download a habitability notice PDF
 */
export function downloadHabitabilityNoticePDF(
  data: HabitabilityNoticeData,
  filename: string = 'habitability-demand-notice.pdf'
): void {
  const blob = generateHabitabilityNoticePDF(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
