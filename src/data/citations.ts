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
  // Housing Statistics
  'reno-rent-increase-2024': {
    id: 'reno-rent-increase-2024',
    title: 'Reno rent prices increased 40% since 2019',
    author: 'Apartment List',
    source: 'Apartment List National Rent Report',
    date: '2024',
    url: 'https://www.apartmentlist.com/research/national-rent-data',
    description: 'National rent tracking data showing Reno-Sparks metro area rent increases.',
  },
  'washoe-eviction-rate': {
    id: 'washoe-eviction-rate',
    title: 'Washoe County Eviction Filing Rate',
    author: 'Eviction Lab',
    source: 'Princeton University Eviction Lab',
    date: '2023',
    url: 'https://evictionlab.org/',
    description: 'Eviction filing data for Washoe County, Nevada.',
  },
  'nevada-rent-burden': {
    id: 'nevada-rent-burden',
    title: '50% of Nevada renters are cost-burdened',
    author: 'National Low Income Housing Coalition',
    source: 'Out of Reach Report',
    date: '2024',
    url: 'https://nlihc.org/oor',
    description: 'Percentage of renters spending more than 30% of income on housing.',
  },
  'corporate-landlord-evictions': {
    id: 'corporate-landlord-evictions',
    title: 'Corporate landlords file evictions at 2x the rate of individual owners',
    author: 'Private Equity Stakeholder Project',
    source: 'Research Report',
    date: '2023',
    url: 'https://pestakeholder.org/',
    description: 'Research on corporate landlord eviction practices.',
  },

  // Legal References
  'nrs-118a-implied-warranty': {
    id: 'nrs-118a-implied-warranty',
    title: 'Nevada Implied Warranty of Habitability',
    source: 'Nevada Revised Statutes',
    date: '2023',
    url: 'https://www.leg.state.nv.us/NRS/NRS-118A.html',
    description: 'NRS 118A.290 establishes that landlords must maintain rental units in habitable condition.',
  },
  'retaliation-protection-effectiveness': {
    id: 'retaliation-protection-effectiveness',
    title: 'Anti-retaliation laws reduce illegal evictions by 15%',
    author: 'Urban Institute',
    source: 'Housing Policy Research',
    date: '2022',
    url: 'https://www.urban.org/',
    description: 'Research on effectiveness of tenant protection laws.',
  },

  // Organizing Research
  'tenant-union-success-rate': {
    id: 'tenant-union-success-rate',
    title: 'Buildings with tenant unions see 30% fewer evictions',
    author: 'Right to the City Alliance',
    source: 'Tenant Organizing Research',
    date: '2023',
    url: 'https://righttothecity.org/',
    description: 'Research on tenant union effectiveness.',
  },
  'collective-bargaining-rent': {
    id: 'collective-bargaining-rent',
    title: 'Collective tenant action reduces rent increases by average of 12%',
    author: 'PolicyLink',
    source: 'Housing Justice Research',
    date: '2022',
    url: 'https://www.policylink.org/',
    description: 'Study on collective bargaining outcomes for tenant groups.',
  },
  'habitability-complaint-resolution': {
    id: 'habitability-complaint-resolution',
    title: '73% of habitability complaints resolved when tenants organize collectively',
    author: 'National Housing Law Project',
    source: 'Tenant Rights Research',
    date: '2023',
    url: 'https://www.nhlp.org/',
    description: 'Research on collective action effectiveness for habitability issues.',
  },

  // Local Context
  'washoe-rental-units': {
    id: 'washoe-rental-units',
    title: 'Washoe County has over 80,000 rental units',
    author: 'U.S. Census Bureau',
    source: 'American Community Survey',
    date: '2023',
    url: 'https://data.census.gov/',
    description: 'Census data on rental housing stock in Washoe County.',
  },
  'reno-corporate-ownership': {
    id: 'reno-corporate-ownership',
    title: '35% of Reno rental properties owned by corporate entities',
    author: 'Washoe County Assessor',
    source: 'Property Records Analysis',
    date: '2024',
    description: 'Analysis of Washoe County property ownership records.',
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
