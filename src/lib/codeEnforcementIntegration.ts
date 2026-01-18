/**
 * Code Enforcement Integration
 * Generates pre-filled complaint URLs for Reno city code enforcement
 * and email templates for direct contact
 */

export interface CodeEnforcementComplaintData {
  buildingAddress: string
  propertyOwner?: string
  issueType: string
  issueDescription: string
  reporterName?: string
  reporterPhone?: string
  reporterEmail?: string
  habitabilityIssues?: string[]
}

/**
 * Generate a URL for Reno city code enforcement online complaint form
 * Pre-fills available fields with complaint data
 */
export function generateRenoCodeEnforcementUrl(data: CodeEnforcementComplaintData): string {
  const params = new URLSearchParams()

  // Reno code enforcement form typically accepts these parameters
  params.append('property_address', data.buildingAddress)

  if (data.propertyOwner) {
    params.append('owner_name', data.propertyOwner)
  }

  params.append('complaint_category', data.issueType)
  params.append('complaint_description', data.issueDescription)

  if (data.reporterName) {
    params.append('reporter_name', data.reporterName)
  }

  if (data.reporterPhone) {
    params.append('reporter_phone', data.reporterPhone)
  }

  if (data.reporterEmail) {
    params.append('reporter_email', data.reporterEmail)
  }

  // Build URL to Reno code enforcement online complaint system
  // Note: This URL structure is a standard format; adjust based on actual Reno city website
  const baseUrl = 'https://reno.gov/government/departments/community-services/code-enforcement/submit-a-complaint'
  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate an email template for code enforcement complaint
 * Can be sent to code.enforcement@reno.nv.us or copied manually
 */
export function generateCodeEnforcementEmailTemplate(data: CodeEnforcementComplaintData): {
  to: string
  subject: string
  body: string
} {
  const habitabilityList = data.habitabilityIssues
    ? data.habitabilityIssues.map(issue => `• ${issue}`).join('\n')
    : ''

  const body = `
RENO CODE ENFORCEMENT COMPLAINT

PROPERTY ADDRESS:
${data.buildingAddress}

OWNER/MANAGER NAME:
${data.propertyOwner || 'Unknown'}

COMPLAINT TYPE:
${data.issueType}

DETAILED DESCRIPTION:
${data.issueDescription}

${habitabilityList ? `HABITABILITY ISSUES DOCUMENTED:\n${habitabilityList}\n` : ''}

REPORTER INFORMATION:
Name: ${data.reporterName || '(Anonymous)'}
Phone: ${data.reporterPhone || 'Not provided'}
Email: ${data.reporterEmail || 'Not provided'}

---
Submitted via RSTU Connect Tenant Organizing Platform
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
`.trim()

  return {
    to: 'code.enforcement@reno.nv.us',
    subject: `Code Enforcement Complaint - ${data.buildingAddress}`,
    body
  }
}

/**
 * Get the direct link to Reno code enforcement website
 */
export function getRenoCodeEnforcementWebsite(): string {
  return 'https://reno.gov/government/departments/community-services/code-enforcement'
}

/**
 * Get code enforcement phone number for Reno
 */
export function getRenoCodeEnforcementPhone(): string {
  return '(775) 334-8650'
}

/**
 * Get code enforcement email for Reno
 */
export function getRenoCodeEnforcementEmail(): string {
  return 'code.enforcement@reno.nv.us'
}

/**
 * Open Reno code enforcement complaint form in new window
 * with pre-filled data
 */
export function openRenoCodeEnforcementForm(data: CodeEnforcementComplaintData): void {
  const url = generateRenoCodeEnforcementUrl(data)
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Copy code enforcement email template to clipboard
 */
export function copyCodeEnforcementEmailTemplate(data: CodeEnforcementComplaintData): boolean {
  const template = generateCodeEnforcementEmailTemplate(data)
  const emailContent = `To: ${template.to}\nSubject: ${template.subject}\n\n${template.body}`

  try {
    navigator.clipboard.writeText(emailContent)
    return true
  } catch (error) {
    console.error('[CodeEnforcement] Failed to copy email template:', error)
    return false
  }
}

/**
 * Get complaint categories accepted by Reno code enforcement
 */
export function getCodeEnforcementCategories(): Array<{ key: string; label: string; description: string }> {
  return [
    {
      key: 'habitability',
      label: 'Habitability Violations',
      description: 'Serious health/safety issues (no heat, water, mold, electrical hazards, etc.)'
    },
    {
      key: 'maintenance',
      label: 'Maintenance Issues',
      description: 'Property maintenance violations (broken doors, windows, structural issues)'
    },
    {
      key: 'dangerous-conditions',
      label: 'Dangerous Conditions',
      description: 'Immediate safety hazards (loose railings, broken stairs, asbestos, lead paint)'
    },
    {
      key: 'nuisance',
      label: 'Public Nuisance',
      description: 'Trash, vermin, overgrown vegetation, or other environmental hazards'
    },
    {
      key: 'occupancy',
      label: 'Occupancy Code Violation',
      description: 'Too many people in unit or illegal room divisions'
    },
    {
      key: 'utilities',
      label: 'Utility Service Failure',
      description: 'Lack of essential utilities (water, gas, electricity, sewer)'
    },
    {
      key: 'other',
      label: 'Other Code Violation',
      description: 'Other building, housing, or zoning code violations'
    }
  ]
}

/**
 * Map habitability issue labels to code enforcement categories
 */
export function getCodeEnforcementCategoryFromHabitabilityIssue(habitabilityLabel: string): string {
  const label = habitabilityLabel.toLowerCase()

  if (label.includes('heat') || label.includes('temperature') || label.includes('water')) {
    return 'utilities'
  }

  if (label.includes('mold') || label.includes('electrical') || label.includes('roof') || label.includes('foundation')) {
    return 'dangerous-conditions'
  }

  if (label.includes('door') || label.includes('window') || label.includes('paint') || label.includes('carpet')) {
    return 'maintenance'
  }

  if (label.includes('pest') || label.includes('vermin') || label.includes('rodent')) {
    return 'nuisance'
  }

  return 'habitability'
}
