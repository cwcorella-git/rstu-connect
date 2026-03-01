/**
 * Rent Increase Dispute Letter PDF Generation
 * Generates formal letters disputing unusual rent increases under Nevada law
 */

import jsPDF from 'jspdf'

export interface RentDisputeData {
  tenantName: string
  propertyAddress: string
  landlordName?: string
  previousRent: number
  newRent: number
  increasePercent: number
  effectiveDate?: string
  buildingAverage?: number
  generatedDate?: Date
  organizationName?: string
  organizationPhone?: string
}

/**
 * Generate a professional rent increase dispute letter
 * Helps tenants challenge unusual rent increases (>5% annual increase)
 * Returns a Blob that can be downloaded
 */
export function generateRentDisputePDF(data: RentDisputeData): Blob {
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

  // Header - Organization name
  if (data.organizationName) {
    yPos = addMultilineText(data.organizationName, 12, 'bold', 'center')
  }

  // Title
  yPos = addMultilineText('LETTER OF INQUIRY - RENT INCREASE', 14, 'bold', 'center')
  yPos += 2

  // Subheader with legal reference
  yPos = addMultilineText(
    'Reference: Nevada Revised Statutes § 118A.350 (Good Faith and Fair Dealing)',
    9,
    'normal',
    'center'
  )
  yPos += 5

  // Date
  const letterDate = data.generatedDate
    ? data.generatedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  yPos = addMultilineText(`Date: ${letterDate}`, 10, 'normal', 'left')
  yPos += 3

  // Recipient section
  yPos = addMultilineText('TO:', 10, 'bold', 'left')
  yPos = addMultilineText(data.landlordName || 'Property Owner/Manager', 10, 'normal', 'left')
  yPos = addMultilineText(data.propertyAddress, 10, 'normal', 'left')
  yPos += 5

  // Re: line
  yPos = addMultilineText(
    `RE: INQUIRY REGARDING RENT INCREASE - ${data.propertyAddress}`,
    10,
    'bold',
    'left'
  )
  yPos += 3

  // Opening
  yPos = addMultilineText(`Dear Property Owner/Manager:`, 10, 'normal', 'left')
  yPos += 3

  // Main body
  yPos = addMultilineText(
    `This letter is to formally notify you of concerns regarding an unusual rent increase notice received on the above-referenced property. As a tenant, I am writing to request clarification on this increase and to document my concerns in accordance with Nevada law.`,
    10,
    'normal',
    'left'
  )

  yPos += 5

  // Rent increase details
  yPos = addMultilineText('RENT INCREASE DETAILS:', 10, 'bold', 'left')
  yPos += 2

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const details = [
    `Previous Monthly Rent: $${data.previousRent.toLocaleString()}`,
    `New Monthly Rent: $${data.newRent.toLocaleString()}`,
    `Dollar Increase: $${(data.newRent - data.previousRent).toLocaleString()}/month`,
    `Percentage Increase: ${data.increasePercent.toFixed(1)}%`,
  ]

  if (data.effectiveDate) {
    details.push(`Effective Date: ${data.effectiveDate}`)
  }

  if (data.buildingAverage) {
    const diff = data.newRent - data.buildingAverage
    const percent = ((diff / data.buildingAverage) * 100).toFixed(1)
    details.push(`Building Average Rent: $${data.buildingAverage.toLocaleString()}`)
    details.push(`Your Rent vs. Building Average: ${diff > 0 ? '+' : ''}${percent}%`)
  }

  details.forEach((detail) => {
    doc.text(`• ${detail}`, margins.left + 5, yPos)
    yPos += 5
  })

  yPos += 3

  // Concern section
  yPos = addMultilineText('LEGAL CONCERNS:', 10, 'bold', 'left')
  yPos += 2

  const concerns = [
    `The proposed rent increase of ${data.increasePercent.toFixed(1)}% exceeds the typical regional average increase of approximately 3% annually.`,
    `Under Nevada Revised Statutes § 118A.350, landlords are required to act in good faith and deal fairly with tenants. Unusually high rent increases may warrant clarification and justification.`,
  ]

  concerns.forEach((concern) => {
    yPos = addMultilineText(`• ${concern}`, 9, 'normal', 'left')
    yPos += 1
  })

  yPos += 5

  // Request for information
  yPos = addMultilineText('REQUESTED INFORMATION:', 10, 'bold', 'left')
  yPos += 2

  const requests = [
    'Written justification for the proposed rent increase',
    'Explanation of how the new rent amount was calculated',
    'Any changes to property conditions or amenities that justify the increase',
    'Comparison to prevailing market rates for similar properties in the area',
  ]

  requests.forEach((request) => {
    yPos = addMultilineText(`• ${request}`, 9, 'normal', 'left')
  })

  yPos += 5

  // Next steps
  yPos = addMultilineText('NEXT STEPS:', 10, 'bold', 'left')
  yPos += 2

  yPos = addMultilineText(
    'Please provide written response to this inquiry within 14 days of receiving this letter. If you believe the increase is justified, please provide supporting documentation. If we do not receive satisfactory clarification, we may pursue this matter through the following channels:',
    9,
    'normal',
    'left'
  )

  yPos += 3

  const nextSteps = [
    'File a complaint with the Nevada Housing Division',
    'Seek assistance from Northern Nevada Legal Aid',
    'Coordinate with other tenants at the property',
  ]

  nextSteps.forEach((step) => {
    yPos = addMultilineText(`• ${step}`, 9, 'normal', 'left')
  })

  yPos += 5

  // Resources
  yPos = addMultilineText('RESOURCES:', 10, 'bold', 'left')
  yPos += 2

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Northern Nevada Legal Aid: (775) 284-3491', margins.left, yPos)
  yPos += 4
  doc.text('Nevada Housing Division: https://ndcp.nv.gov/landlord-tenant', margins.left, yPos)
  yPos += 4
  doc.text('Reno-Sparks Tenants Union: Community Organizing Support', margins.left, yPos)

  yPos += 5

  // Closing
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Sincerely,', margins.left, yPos)
  yPos += 15

  // Signature line
  doc.setFontSize(9)
  doc.text('_________________________________', margins.left, yPos)
  yPos += 4
  doc.text(data.tenantName, margins.left, yPos)

  // Footer with legal disclaimer
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'LEGAL NOTICE: This document is generated by Reno-Sparks Tenants Union for informational purposes. We recommend consulting with Northern Nevada Legal Aid ((775) 284-3491) before submitting. ' +
      'This letter is provided to help tenants understand their rights under Nevada Revised Statutes § 118A.350. Keep a copy for your records.',
    margins.left,
    pageHeight - 12,
    { align: 'left', maxWidth: contentWidth }
  )

  return doc.output('blob')
}

/**
 * Download rent dispute letter as PDF file
 */
export function downloadRentDisputePDF(data: RentDisputeData): void {
  const blob = generateRentDisputePDF(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `rent-increase-inquiry_${data.propertyAddress.slice(0, 20).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
