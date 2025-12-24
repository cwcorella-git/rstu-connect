/**
 * Lease Tracker Storage
 *
 * Stores personal lease data for individual tenants.
 * Helps track rent history, lease dates, and important deadlines.
 * All data stored locally in localStorage - no cloud sync.
 */

// === TYPES ===

export interface RentHistoryEntry {
  date: string // ISO date when rent changed
  amount: number
  notes?: string // e.g., "Annual increase", "New lease"
}

export interface LeaseData {
  // Lease dates
  startDate: string // ISO date
  endDate: string // ISO date (empty = month-to-month)
  isMonthToMonth: boolean

  // Financial
  monthlyRent: number
  securityDeposit: number
  rentHistory: RentHistoryEntry[]

  // Landlord info
  landlordName?: string
  managementCompany?: string

  // Tracking
  lastIncreaseDate?: string // ISO date
  lastIncreaseAmount?: number // Dollar amount of increase
  nextIncreaseNoticeDate?: string // When to expect 60-day notice

  // Notes
  notes?: string

  // Meta
  created: number
  updated: number
}

export interface LeaseState {
  leaseData: LeaseData | null
  lastModified: number
}

// === CONSTANTS ===

const STORAGE_KEY = 'rstu_lease_data'

// Nevada law constants
export const NEVADA_RENT_NOTICE_DAYS = 60 // Days notice required before rent increase
export const NEVADA_LATE_FEE_MAX_PERCENT = 5 // Maximum late fee percentage
export const NEVADA_SECURITY_DEPOSIT_MAX_MONTHS = 3 // Maximum security deposit in months

// === HELPER FUNCTIONS ===

/**
 * Calculate days until a date
 */
export function daysUntil(dateStr: string): number {
  if (!dateStr) return -1
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if lease is expiring soon (within 60 days)
 */
export function isLeaseExpiringSoon(endDate: string): boolean {
  const days = daysUntil(endDate)
  return days >= 0 && days <= 60
}

/**
 * Calculate total rent paid over a period
 */
export function calculateTotalRentPaid(leaseData: LeaseData): number {
  if (!leaseData.rentHistory.length) {
    // Use current rent and lease start
    const start = new Date(leaseData.startDate)
    const now = new Date()
    const months = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    return months * leaseData.monthlyRent
  }

  // Calculate based on rent history
  let total = 0
  const now = new Date()

  for (let i = 0; i < leaseData.rentHistory.length; i++) {
    const entry = leaseData.rentHistory[i]
    const entryDate = new Date(entry.date)
    const nextEntry = leaseData.rentHistory[i + 1]
    const endDate = nextEntry ? new Date(nextEntry.date) : now

    // Months at this rent level
    const months = Math.floor(
      (endDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    total += months * entry.amount
  }

  return total
}

/**
 * Calculate rent increase percentage
 */
export function calculateRentIncreasePercent(
  oldRent: number,
  newRent: number
): number {
  if (oldRent === 0) return 0
  return Math.round(((newRent - oldRent) / oldRent) * 100 * 10) / 10
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get warning level for lease end date
 */
export function getLeaseEndWarningLevel(
  endDate: string
): 'urgent' | 'warning' | 'ok' | 'expired' {
  const days = daysUntil(endDate)
  if (days < 0) return 'expired'
  if (days <= 30) return 'urgent'
  if (days <= 60) return 'warning'
  return 'ok'
}

/**
 * Generate ICS calendar event for lease end date
 */
export function generateLeaseEndICS(leaseData: LeaseData): string {
  if (!leaseData.endDate || leaseData.isMonthToMonth) return ''

  const endDate = new Date(leaseData.endDate)
  const reminderDate = new Date(endDate)
  reminderDate.setDate(reminderDate.getDate() - 60) // 60 days before

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const uid = `lease-end-${Date.now()}@rstu-connect`

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RSTU Connect//Lease Tracker//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(endDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Lease Ends
DESCRIPTION:Your lease ends today. If you haven't received renewal terms, contact your landlord.
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-P60D
DESCRIPTION:Lease ends in 60 days - time to negotiate renewal
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-P30D
DESCRIPTION:Lease ends in 30 days
END:VALARM
END:VEVENT
END:VCALENDAR`
}

/**
 * Generate ICS for rent increase notice deadline
 */
export function generateRentNoticeICS(
  leaseData: LeaseData,
  expectedIncreaseDate: string
): string {
  const increaseDate = new Date(expectedIncreaseDate)
  const noticeDeadline = new Date(increaseDate)
  noticeDeadline.setDate(noticeDeadline.getDate() - 60) // 60 days before

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const uid = `rent-notice-${Date.now()}@rstu-connect`

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RSTU Connect//Lease Tracker//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(noticeDeadline)}
DTEND:${formatICSDate(noticeDeadline)}
SUMMARY:Rent Increase Notice Deadline
DESCRIPTION:Under Nevada law (NRS 118A), landlords must provide 60 days written notice before increasing rent. If you haven't received notice, a rent increase on ${increaseDate.toLocaleDateString()} may not be enforceable.
END:VEVENT
END:VCALENDAR`
}

// === STATE MANAGEMENT ===

/**
 * Get lease state from localStorage
 */
export function getLeaseState(): LeaseState {
  if (typeof window === 'undefined') {
    return { leaseData: null, lastModified: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { leaseData: null, lastModified: 0 }
    }
    return JSON.parse(stored)
  } catch {
    return { leaseData: null, lastModified: 0 }
  }
}

/**
 * Save lease state to localStorage
 */
function saveLeaseState(state: LeaseState): void {
  if (typeof window === 'undefined') return

  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[LeaseStorage] Failed to save:', e)
  }
}

// === CRUD OPERATIONS ===

/**
 * Get current lease data
 */
export function getLeaseData(): LeaseData | null {
  return getLeaseState().leaseData
}

/**
 * Check if lease data exists
 */
export function hasLeaseData(): boolean {
  return getLeaseData() !== null
}

/**
 * Create or update lease data
 */
export function saveLeaseData(data: Partial<LeaseData>): LeaseData {
  const state = getLeaseState()
  const now = Date.now()

  if (state.leaseData) {
    // Update existing
    state.leaseData = {
      ...state.leaseData,
      ...data,
      updated: now,
    }
  } else {
    // Create new
    state.leaseData = {
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      isMonthToMonth: data.isMonthToMonth || false,
      monthlyRent: data.monthlyRent || 0,
      securityDeposit: data.securityDeposit || 0,
      rentHistory: data.rentHistory || [],
      landlordName: data.landlordName,
      managementCompany: data.managementCompany,
      lastIncreaseDate: data.lastIncreaseDate,
      lastIncreaseAmount: data.lastIncreaseAmount,
      nextIncreaseNoticeDate: data.nextIncreaseNoticeDate,
      notes: data.notes,
      created: now,
      updated: now,
    }
  }

  saveLeaseState(state)

  // Sync to profile
  syncLeaseToProfile()

  return state.leaseData
}

/**
 * Add a rent history entry
 */
export function addRentHistoryEntry(entry: RentHistoryEntry): LeaseData | null {
  const state = getLeaseState()
  if (!state.leaseData) return null

  // Add entry and sort by date
  state.leaseData.rentHistory.push(entry)
  state.leaseData.rentHistory.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Update current rent to most recent
  const mostRecent = state.leaseData.rentHistory[state.leaseData.rentHistory.length - 1]
  if (mostRecent) {
    const previousRent = state.leaseData.monthlyRent
    state.leaseData.monthlyRent = mostRecent.amount
    state.leaseData.lastIncreaseDate = mostRecent.date

    if (previousRent > 0 && mostRecent.amount > previousRent) {
      state.leaseData.lastIncreaseAmount = mostRecent.amount - previousRent
    }
  }

  state.leaseData.updated = Date.now()
  saveLeaseState(state)

  // Sync to profile
  syncLeaseToProfile()

  return state.leaseData
}

/**
 * Remove a rent history entry by date
 */
export function removeRentHistoryEntry(date: string): LeaseData | null {
  const state = getLeaseState()
  if (!state.leaseData) return null

  state.leaseData.rentHistory = state.leaseData.rentHistory.filter(
    (e) => e.date !== date
  )
  state.leaseData.updated = Date.now()
  saveLeaseState(state)
  return state.leaseData
}

/**
 * Clear all lease data
 */
export function clearLeaseData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// === ANALYSIS FUNCTIONS ===

/**
 * Get lease summary for display
 */
export function getLeaseSummary(): {
  hasLease: boolean
  daysUntilEnd: number
  warningLevel: 'urgent' | 'warning' | 'ok' | 'expired' | 'none'
  monthlyRent: number
  totalPaid: number
  rentIncreases: number
  averageIncreasePercent: number
} {
  const data = getLeaseData()

  if (!data) {
    return {
      hasLease: false,
      daysUntilEnd: -1,
      warningLevel: 'none',
      monthlyRent: 0,
      totalPaid: 0,
      rentIncreases: 0,
      averageIncreasePercent: 0,
    }
  }

  // Calculate average increase percentage
  let totalIncreasePercent = 0
  let increaseCount = 0

  for (let i = 1; i < data.rentHistory.length; i++) {
    const prev = data.rentHistory[i - 1].amount
    const curr = data.rentHistory[i].amount
    if (curr > prev) {
      totalIncreasePercent += calculateRentIncreasePercent(prev, curr)
      increaseCount++
    }
  }

  return {
    hasLease: true,
    daysUntilEnd: data.isMonthToMonth ? -1 : daysUntil(data.endDate),
    warningLevel: data.isMonthToMonth
      ? 'none'
      : getLeaseEndWarningLevel(data.endDate),
    monthlyRent: data.monthlyRent,
    totalPaid: calculateTotalRentPaid(data),
    rentIncreases: increaseCount,
    averageIncreasePercent:
      increaseCount > 0 ? Math.round(totalIncreasePercent / increaseCount) : 0,
  }
}

/**
 * Sync lease data to user profile
 * Call this when lease data is updated to keep profile in sync
 */
export function syncLeaseToProfile(): void {
  const data = getLeaseData()
  if (!data) return

  // Dynamically import to avoid circular deps
  import('./profileStorage').then(({ getCurrentProfile, updateProfile }) => {
    const profile = getCurrentProfile()
    if (!profile) return

    // Sync relevant fields from lease to profile
    updateProfile({
      rentAmount: data.monthlyRent,
      moveInDate: data.startDate,
      leaseType: data.isMonthToMonth ? 'month-to-month' : 'fixed',
      leaseExpires: data.isMonthToMonth ? undefined : data.endDate,
      securityDeposit: data.securityDeposit,
      lastRentIncrease: data.lastIncreaseAmount,
    })
  })
}

/**
 * Initialize lease from profile data if lease doesn't exist
 * Call this when viewing lease tracker for first time
 */
export function initLeaseFromProfile(): LeaseData | null {
  const existing = getLeaseData()
  if (existing) return existing

  // Dynamically import to avoid circular deps
  // Return null and let caller handle async
  return null
}

/**
 * Async version that initializes from profile
 */
export async function initLeaseFromProfileAsync(): Promise<LeaseData | null> {
  const existing = getLeaseData()
  if (existing) return existing

  const { getCurrentProfile } = await import('./profileStorage')
  const profile = getCurrentProfile()
  if (!profile) return null

  // Only create lease if profile has rent data
  if (!profile.rentAmount) return null

  const now = Date.now()
  const leaseData: LeaseData = {
    startDate: profile.moveInDate || '',
    endDate: profile.leaseExpires || '',
    isMonthToMonth: profile.leaseType === 'month-to-month',
    monthlyRent: profile.rentAmount || 0,
    securityDeposit: profile.securityDeposit || 0,
    rentHistory: profile.rentAmount ? [{
      date: profile.moveInDate || new Date().toISOString().split('T')[0],
      amount: profile.rentAmount,
      notes: 'Initial rent from profile'
    }] : [],
    created: now,
    updated: now,
  }

  // Save and return
  const state = getLeaseState()
  state.leaseData = leaseData
  state.lastModified = Date.now()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[LeaseStorage] Failed to save:', e)
  }

  return leaseData
}

/**
 * Get upcoming important dates
 */
export function getImportantDates(): {
  date: string
  label: string
  daysUntil: number
  type: 'lease_end' | 'rent_notice' | 'custom'
  warning: boolean
}[] {
  const data = getLeaseData()
  if (!data) return []

  const dates: {
    date: string
    label: string
    daysUntil: number
    type: 'lease_end' | 'rent_notice' | 'custom'
    warning: boolean
  }[] = []

  // Lease end date
  if (data.endDate && !data.isMonthToMonth) {
    const days = daysUntil(data.endDate)
    if (days >= 0) {
      dates.push({
        date: data.endDate,
        label: 'Lease ends',
        daysUntil: days,
        type: 'lease_end',
        warning: days <= 60,
      })
    }
  }

  // Rent increase notice deadline (if tracking)
  if (data.nextIncreaseNoticeDate) {
    const days = daysUntil(data.nextIncreaseNoticeDate)
    if (days >= 0) {
      dates.push({
        date: data.nextIncreaseNoticeDate,
        label: 'Rent notice deadline',
        daysUntil: days,
        type: 'rent_notice',
        warning: days <= 14,
      })
    }
  }

  // Sort by date
  dates.sort((a, b) => a.daysUntil - b.daysUntil)

  return dates
}
