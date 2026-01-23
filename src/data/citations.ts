/**
 * Citation/Reference System
 * Wikipedia-style numbered references [1], [2], etc.
 */

export interface Citation {
  id: string
  title: string
  author?: string
  source?: string
  date?: string
  url?: string
  accessDate?: string
  quote?: string
  description?: string
}

/**
 * Central citation database
 * Add citations here and reference them by ID throughout the app
 */
export const citations: Record<string, Citation> = {
  // ============================================
  // LOCAL HOUSING CRISIS - Reno-Sparks Specific
  // ============================================

  'washoe-assessor-data': {
    id: 'washoe-assessor-data',
    title: 'Washoe County Property Records',
    source: 'Washoe County Assessor\'s Office',
    date: '2025',
    url: 'https://www.washoecounty.gov/assessor/',
    description: 'Public property records for 192,000+ parcels in Washoe County, including ownership, assessed values, and property characteristics.',
  },
  'rstu-corporate-analysis': {
    id: 'rstu-corporate-analysis',
    title: '50+ Corporate Landlord Entities in Reno-Sparks',
    author: 'RSTU Research',
    source: 'Portfolio analysis of Washoe County property records',
    date: '2025',
    description: 'RSTU analysis identifying corporate entities controlling multiple rental properties through address matching and ownership records.',
  },
  'gage-village-portfolio': {
    id: 'gage-village-portfolio',
    title: 'GAGE VILLAGE Controls 3,335 Units',
    author: 'RSTU Research',
    source: 'Washoe County Assessor property records analysis',
    date: '2025',
    description: 'Portfolio analysis of GAGE VILLAGE properties in Reno showing 3,335 units with $103M total assessed value.',
  },
  'hidden-fees-analysis': {
    id: 'hidden-fees-analysis',
    title: 'Hidden Fees Add $200-400/Month Beyond Rent',
    author: 'RSTU Research',
    source: 'Analysis of rental listings and tenant surveys',
    date: '2025',
    description: 'Survey of rental listings and tenant reports showing application fees ($50-100), pet fees ($25-50/month), parking ($75-150), and utility fees add significant costs beyond advertised rent.',
  },
  'rent-increase-20-percent': {
    id: 'rent-increase-20-percent',
    title: 'Rent Increases of 20% or More Common in Nevada',
    author: 'Nevada Housing Coalition',
    source: 'Tenant survey and market analysis',
    date: '2024',
    description: 'Without rent control, Nevada landlords can raise rent any amount with proper notice. Tenant surveys report increases of 15-30% are common.',
  },

  // ============================================
  // STATEWIDE/REGIONAL HOUSING STATISTICS
  // ============================================

  'reno-rent-increase-2024': {
    id: 'reno-rent-increase-2024',
    title: 'Reno Rent Prices Increased 40%+ Since 2019',
    author: 'Apartment List',
    source: 'Apartment List National Rent Report',
    date: '2024',
    url: 'https://www.apartmentlist.com/research/national-rent-data',
    description: 'National rent tracking data showing Reno-Sparks metro area among fastest rent growth in the nation.',
  },
  'washoe-cost-burdened': {
    id: 'washoe-cost-burdened',
    title: '57% of Washoe County Renters Are Cost-Burdened',
    author: 'National Low Income Housing Coalition',
    source: 'Out of Reach Report - Nevada',
    date: '2024',
    url: 'https://nlihc.org/oor/nevada',
    description: 'Cost-burdened means paying more than 30% of household income on rent. Over half of Washoe County renters meet this threshold.',
  },
  'minimum-wage-housing-hours': {
    id: 'minimum-wage-housing-hours',
    title: '82 Hours/Week at Minimum Wage for 1BR Apartment',
    author: 'National Low Income Housing Coalition',
    source: 'Out of Reach 2024 Report',
    date: '2024',
    url: 'https://nlihc.org/oor',
    description: 'At Nevada\'s minimum wage of $12/hour, a worker would need to work 82 hours per week to afford a modest 1-bedroom apartment without being cost-burdened.',
  },
  'washoe-homeless-count': {
    id: 'washoe-homeless-count',
    title: '1,760 People Experiencing Homelessness in Washoe County',
    author: 'Washoe County',
    source: 'Point-in-Time Count',
    date: '2024',
    url: 'https://www.washoecounty.gov/hsa/',
    description: 'Annual Point-in-Time homeless count conducted in January 2024.',
  },
  'nevada-eviction-rate': {
    id: 'nevada-eviction-rate',
    title: '296 Evictions Filed Per Day in Nevada (Statewide)',
    author: 'Eviction Lab',
    source: 'Princeton University Eviction Lab',
    date: '2024',
    url: 'https://evictionlab.org/',
    description: 'Nevada has one of the highest eviction filing rates in the nation. This equals approximately 108,000 eviction filings per year statewide.',
  },
  'luxury-unit-construction': {
    id: 'luxury-unit-construction',
    title: '94% of New Reno Apartments Are Luxury Units',
    author: 'CoStar Group',
    source: 'Reno-Sparks Multifamily Market Report',
    date: '2024',
    description: 'Analysis of apartment construction in Reno over the past decade shows the vast majority of new units are Class A luxury apartments, with very few affordable units built.',
  },
  'nevada-fastest-eviction': {
    id: 'nevada-fastest-eviction',
    title: 'Nevada Has One of the Fastest Eviction Processes in the Nation',
    author: 'National Housing Law Project',
    source: 'State Eviction Laws Comparison',
    date: '2023',
    url: 'https://www.nhlp.org/',
    description: 'Nevada\'s summary eviction process can result in removal in as few as 10-14 days, compared to 30-90 days in most other states.',
  },

  // ============================================
  // ORGANIZING VICTORIES & RESEARCH
  // ============================================

  'kc-tenants-strike': {
    id: 'kc-tenants-strike',
    title: 'KC Tenants: 248-Day Strike, $300,000 Forgiven',
    author: 'KC Tenants',
    source: 'Press Release and Media Coverage',
    date: '2023',
    url: 'https://kctenants.org/',
    description: 'KC Tenants conducted a 248-day rent strike at Quality Hill Towers resulting in $300,000 in back rent forgiven and improved conditions.',
  },
  'ny-good-cause-eviction': {
    id: 'ny-good-cause-eviction',
    title: 'New York Good Cause Eviction Protects ~1 Million Renters',
    author: 'Housing Justice for All',
    source: 'Policy Analysis',
    date: '2024',
    url: 'https://www.housingjusticeforall.org/',
    description: 'After five years of sustained organizing, New York passed Good Cause Eviction protections in 2024, covering approximately 1 million previously unprotected renters.',
  },
  'california-ab-1482': {
    id: 'california-ab-1482',
    title: 'California Tenant Protection Act Covers ~8 Million Renters',
    author: 'California Legislative Analyst',
    source: 'AB 1482 Fiscal Analysis',
    date: '2019',
    url: 'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=201920200AB1482',
    description: 'California\'s Tenant Protection Act (2019) caps annual rent increases at 5% + CPI and requires just cause for eviction, covering approximately 8 million renters statewide.',
  },
  'oregon-rent-control': {
    id: 'oregon-rent-control',
    title: 'Oregon: First Statewide Rent Control (2019)',
    author: 'Oregon State Legislature',
    source: 'Senate Bill 608',
    date: '2019',
    url: 'https://olis.oregonlegislature.gov/liz/2019R1/Measures/Overview/SB608',
    description: 'Oregon became the first state to enact statewide rent control with SB 608, limiting annual rent increases to 7% + CPI.',
  },
  'tenant-union-success-rate': {
    id: 'tenant-union-success-rate',
    title: 'Buildings with Tenant Unions See 30% Fewer Evictions',
    author: 'Right to the City Alliance',
    source: 'Tenant Organizing Research',
    date: '2023',
    url: 'https://righttothecity.org/',
    description: 'Research on tenant union effectiveness showing reduced eviction rates in buildings with active tenant organizations.',
  },
  'collective-bargaining-rent': {
    id: 'collective-bargaining-rent',
    title: 'Collective Tenant Action Reduces Rent Increases by 12%',
    author: 'PolicyLink',
    source: 'Housing Justice Research',
    date: '2022',
    url: 'https://www.policylink.org/',
    description: 'Study on collective bargaining outcomes for tenant groups.',
  },
  'habitability-complaint-resolution': {
    id: 'habitability-complaint-resolution',
    title: '73% of Habitability Complaints Resolved with Collective Action',
    author: 'National Housing Law Project',
    source: 'Tenant Rights Research',
    date: '2023',
    url: 'https://www.nhlp.org/',
    description: 'Research on collective action effectiveness for habitability issues.',
  },

  // ============================================
  // CORPORATE LANDLORD RESEARCH
  // ============================================

  'corporate-landlord-evictions': {
    id: 'corporate-landlord-evictions',
    title: 'Corporate Landlords File Evictions at 2x the Rate of Individual Owners',
    author: 'Private Equity Stakeholder Project',
    source: 'Research Report',
    date: '2023',
    url: 'https://pestakeholder.org/',
    description: 'Research on corporate landlord eviction practices showing significantly higher eviction rates compared to individual landlords.',
  },

  // ============================================
  // LEGAL REFERENCES
  // ============================================

  'nrs-118a-retaliation': {
    id: 'nrs-118a-retaliation',
    title: 'NRS 118A.510: Anti-Retaliation with $2,500 Penalty',
    source: 'Nevada Revised Statutes',
    date: '2023',
    url: 'https://www.leg.state.nv.us/NRS/NRS-118A.html#NRS118ASec510',
    description: 'Nevada law prohibits landlord retaliation for tenant organizing. Violators can be forced to pay $2,500 in punitive damages plus actual damages.',
  },

  // ============================================
  // DATABASE STATISTICS
  // ============================================

  'rstu-property-database': {
    id: 'rstu-property-database',
    title: 'RSTU Property Database: 16,000+ Rental Properties',
    author: 'RSTU Research',
    source: 'Washoe County Assessor data, filtered for rentals',
    date: '2025',
    description: 'RSTU maintains a database of 16,000+ rental properties in Washoe County, derived from the county assessor\'s 192,000+ parcel records.',
  },
  'rstu-document-library': {
    id: 'rstu-document-library',
    title: 'RSTU Reading Library: 2,900+ Organizing Resources',
    author: 'RSTU',
    source: 'RSTU Connect Document Library',
    date: '2025',
    description: 'Curated collection of tenant organizing resources, legal guides, theory, and historical documents.',
  },
}

/**
 * Find a citation by ID
 */
export function findCitation(id: string): Citation | undefined {
  return citations[id]
}

/**
 * Get all citations used on a page (for generating a references section)
 */
export function getCitations(ids: string[]): Citation[] {
  return ids
    .map(id => citations[id])
    .filter((c): c is Citation => c !== undefined)
}
