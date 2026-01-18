/**
 * Legal Aid Referral System
 * Generates pre-filled intake forms for Northern Nevada Legal Aid
 * and connects tenants with legal resources for housing issues
 */

export interface LegalAidReferralData {
  tenantName?: string
  tenantPhone?: string
  tenantEmail?: string
  buildingAddress: string
  propertyOwner?: string
  issueType: 'habitability' | 'eviction' | 'discrimination' | 'harassment' | 'illegal-lease' | 'retaliation'
  issueDescription: string
  monthlyRent?: number
  housingStatus?: 'living' | 'evicted' | 'threatened'
}

/**
 * Northern Nevada Legal Aid intake form details
 */
export const NORTHERN_NEVADA_LEGAL_AID = {
  name: 'Northern Nevada Legal Aid Center',
  phone: '(775) 324-0999',
  email: 'info@nnevadlegal.org',
  website: 'https://www.nnevadlegal.org',
  intakeUrl: 'https://www.nnevadlegal.org/get-help/apply-for-legal-help'
}

/**
 * Generate an email template for legal aid referral
 */
export function generateLegalAidEmailTemplate(data: LegalAidReferralData): {
  to: string
  subject: string
  body: string
} {
  const body = `
LEGAL AID INTAKE REQUEST - HOUSING MATTER

TENANT INFORMATION:
Name: ${data.tenantName || '(Not provided)'}
Phone: ${data.tenantPhone || '(Not provided)'}
Email: ${data.tenantEmail || '(Not provided)'}

PROPERTY INFORMATION:
Address: ${data.buildingAddress}
Owner/Manager: ${data.propertyOwner || 'Unknown'}
Monthly Rent: ${data.monthlyRent ? `$${data.monthlyRent}` : 'Not provided'}

HOUSING STATUS:
${
  data.housingStatus === 'living'
    ? 'Currently living in the unit'
    : data.housingStatus === 'evicted'
      ? 'Recently evicted/displaced'
      : 'Facing eviction threat'
}

ISSUE TYPE:
${getIssueLabelFromType(data.issueType)}

DETAILED DESCRIPTION:
${data.issueDescription}

---
CASE TYPE CODE: ${getCaseTypeCode(data.issueType)}

This referral was submitted via RSTU Connect tenant organizing platform.
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Please contact the applicant at the above phone/email to discuss legal representation.
`.trim()

  return {
    to: NORTHERN_NEVADA_LEGAL_AID.email,
    subject: `Legal Aid Intake - ${data.issueType.replace('-', ' ').toUpperCase()} - ${data.buildingAddress}`,
    body
  }
}

/**
 * Get human-readable label for issue type
 */
function getIssueLabelFromType(issueType: string): string {
  const labels: Record<string, string> = {
    habitability: 'Habitability Violations - Uninhabitable Living Conditions',
    eviction: 'Eviction Defense - Illegal or Unjust Eviction',
    discrimination: 'Housing Discrimination - Illegal Discrimination',
    harassment: 'Landlord Harassment - Illegal Tenant Harassment',
    'illegal-lease': 'Illegal Lease Terms - Unlawful Lease Conditions',
    retaliation: 'Retaliation - Landlord Retaliation for Organizing'
  }
  return labels[issueType] || 'Housing Issue'
}

/**
 * Get case type code for legal aid tracking
 */
function getCaseTypeCode(issueType: string): string {
  const codes: Record<string, string> = {
    habitability: 'HOU-HAB',
    eviction: 'HOU-EVIC',
    discrimination: 'HOU-DISC',
    harassment: 'HOU-HAR',
    'illegal-lease': 'HOU-LEASE',
    retaliation: 'HOU-RET'
  }
  return codes[issueType] || 'HOU-OTHER'
}

/**
 * Copy legal aid referral template to clipboard
 */
export function copyLegalAidEmailTemplate(data: LegalAidReferralData): boolean {
  const template = generateLegalAidEmailTemplate(data)
  const emailContent = `To: ${template.to}\nSubject: ${template.subject}\n\n${template.body}`

  try {
    navigator.clipboard.writeText(emailContent)
    return true
  } catch (error) {
    console.error('[LegalAid] Failed to copy legal aid email:', error)
    return false
  }
}

/**
 * Open Northern Nevada Legal Aid intake form
 */
export function openLegalAidIntakeForm(): void {
  window.open(NORTHERN_NEVADA_LEGAL_AID.intakeUrl, '_blank', 'noopener,noreferrer')
}

/**
 * Get Nevada tenant rights resources
 */
export function getNevadaTenantRightsResources(): Array<{
  title: string
  description: string
  url: string
  organization: string
}> {
  return [
    {
      title: 'Nevada Tenant Rights Guide',
      description: 'Comprehensive guide to tenant rights under Nevada law (NRS 118A)',
      url: 'https://www.nnevadlegal.org/get-help/housing',
      organization: 'Northern Nevada Legal Aid'
    },
    {
      title: 'Habitability Standards (NRS 118A.320)',
      description: 'Legal standards for what landlords must provide (heat, water, electricity, etc.)',
      url: 'https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec320',
      organization: 'Nevada Legislature'
    },
    {
      title: 'Eviction Defense Resources',
      description: 'Information on defending against illegal or unjust evictions',
      url: 'https://www.nnevadlegal.org/get-help/housing',
      organization: 'Northern Nevada Legal Aid'
    },
    {
      title: 'Housing Discrimination',
      description: 'Fair housing laws and how to report discrimination (FHA, Nevada law)',
      url: 'https://www.hud.gov/program_offices/fair_housing_equal_opp',
      organization: 'HUD Fair Housing'
    },
    {
      title: 'Nevada Retaliatory Eviction Laws',
      description: 'Protection from eviction in retaliation for organizing or asserting rights',
      url: 'https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec400',
      organization: 'Nevada Legislature'
    }
  ]
}

/**
 * Determine if issue type qualifies for legal aid
 * (Legal aid focuses on specific high-need areas)
 */
export function doesIssueQualifyForLegalAid(issueType: string): boolean {
  const qualifyingTypes = ['eviction', 'discrimination', 'harassment', 'retaliation', 'illegal-lease']
  return qualifyingTypes.includes(issueType)
}

/**
 * Get legal aid eligibility information
 */
export function getLegalAidEligibilityInfo(): {
  incomeLimits: string
  services: string[]
  contactInfo: string
} {
  return {
    incomeLimits:
      'Generally up to 150% of federal poverty level (~$2,000/month for single person in Nevada)',
    services: [
      'Eviction defense',
      'Housing rights consultation',
      'Lease review and negotiation',
      'Fair housing discrimination claims',
      'Unlawful retaliation defense',
      'Document preparation and filing'
    ],
    contactInfo: `Northern Nevada Legal Aid Center
Phone: ${NORTHERN_NEVADA_LEGAL_AID.phone}
Email: ${NORTHERN_NEVADA_LEGAL_AID.email}
Website: ${NORTHERN_NEVADA_LEGAL_AID.website}`
  }
}

/**
 * Get crisis legal resources for immediate housing threats
 */
export function getCrisisLegalResources(): Array<{
  name: string
  type: string
  phone?: string
  description: string
}> {
  return [
    {
      name: 'Northern Nevada Legal Aid - Emergency Line',
      type: 'Emergency Legal Help',
      phone: '(775) 324-0999',
      description: 'Call for urgent eviction or immediate housing crisis'
    },
    {
      name: 'Nevada Legal Services',
      type: 'Statewide Legal Aid',
      phone: '(702) 386-1070',
      description: 'Statewide legal aid network for housing issues'
    },
    {
      name: 'Nevada Eviction Moratorium Hotline',
      type: 'Eviction Support',
      description: 'Information on current eviction protections and resources'
    },
    {
      name: 'RSTU Tenant Support Network',
      type: 'Community Organizing Support',
      description: 'Connect with experienced tenant organizers for collective action'
    }
  ]
}

/**
 * Check if issue type suggests immediate legal action needed
 */
export function doesIssueSuggestUrgentLegalAction(issueType: string): boolean {
  const urgentTypes = ['eviction', 'discrimination', 'harassment', 'retaliation']
  return urgentTypes.includes(issueType)
}
