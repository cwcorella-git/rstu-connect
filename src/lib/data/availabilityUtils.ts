'use client'

/**
 * Availability Utils - Smart time suggestion algorithm
 * Uses bestDays, bestTimeToReach, and workHours to find optimal meeting times
 */

import { getBuildingCanvass, UnitRecord } from '../storage/canvassStorage'
import { getCurrentProfile, UserProfile } from '../storage/profileStorage'

// Day names mapping
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
type DayName = typeof DAYS[number]

// Time of day periods
type TimeOfDay = 'morning' | 'afternoon' | 'evening'

// Time slot for suggestions
export interface TimeSlot {
  day: DayName
  dayIndex: number  // 0 = Sunday, 6 = Saturday
  hour: number      // 24-hour format
  minute: number
  score: number
  availableCount: number
  conflictCount: number
}

// Parsed availability data
interface AvailabilityData {
  preferredDays: DayName[]
  preferredTimeOfDay: TimeOfDay[]
  workHoursBlocked: { day: DayName; start: number; end: number }[]
}

// Parse bestDays string into array of day names
function parseBestDays(bestDays: string | string[] | undefined): DayName[] {
  if (!bestDays) return []

  // If already array
  if (Array.isArray(bestDays)) {
    return bestDays.filter(d => DAYS.includes(d as DayName)) as DayName[]
  }

  // Parse string like "Mon, Tue, Wed" or "Monday, Tuesday"
  const days: DayName[] = []
  const input = bestDays.toLowerCase()

  if (input.includes('mon')) days.push('Mon')
  if (input.includes('tue')) days.push('Tue')
  if (input.includes('wed')) days.push('Wed')
  if (input.includes('thu')) days.push('Thu')
  if (input.includes('fri')) days.push('Fri')
  if (input.includes('sat')) days.push('Sat')
  if (input.includes('sun')) days.push('Sun')

  // Handle "weekdays" or "weekends"
  if (input.includes('weekday')) {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  }
  if (input.includes('weekend')) {
    return ['Sat', 'Sun']
  }

  return days
}

// Parse bestTimeToReach into time of day preferences
function parseBestTimeToReach(timeStr: string | undefined): TimeOfDay[] {
  if (!timeStr) return []

  const input = timeStr.toLowerCase()
  const times: TimeOfDay[] = []

  if (input.includes('morning') || input.includes('am') || input.includes('before noon')) {
    times.push('morning')
  }
  if (input.includes('afternoon') || input.includes('lunch')) {
    times.push('afternoon')
  }
  if (input.includes('evening') || input.includes('night') || input.includes('after 5') || input.includes('after work')) {
    times.push('evening')
  }

  // If no specific time found, check for general patterns
  if (times.length === 0) {
    // Check for time ranges like "6-8pm"
    const pmMatch = input.match(/(\d+)-?(\d+)?\s*pm/i)
    if (pmMatch) {
      const hour = parseInt(pmMatch[1])
      if (hour >= 5 || hour <= 8) times.push('evening')
      else times.push('afternoon')
    }

    const amMatch = input.match(/(\d+)-?(\d+)?\s*am/i)
    if (amMatch) {
      times.push('morning')
    }
  }

  return times
}

// Parse workHours string into blocked time ranges
function parseWorkHours(workHours: string | undefined): { day: DayName; start: number; end: number }[] {
  if (!workHours) return []

  const input = workHours.toLowerCase()
  const blocked: { day: DayName; start: number; end: number }[] = []

  // Parse common patterns like "9-5 M-F", "9am-5pm Monday-Friday"
  // Extract time range
  let startHour = 9
  let endHour = 17

  const timeMatch = input.match(/(\d+)\s*(?:am)?\s*[-–to]+\s*(\d+)\s*(?:pm)?/i)
  if (timeMatch) {
    startHour = parseInt(timeMatch[1])
    endHour = parseInt(timeMatch[2])

    // Adjust for PM
    if (endHour < 12 && (input.includes('pm') || endHour < startHour)) {
      endHour += 12
    }
    if (startHour < 8 && !input.includes('am')) {
      // Probably meant AM for start, PM for end
      if (endHour > 12) startHour = startHour // keep as is (like 9am)
    }
  }

  // Determine which days
  let workDays: DayName[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] // Default M-F

  if (input.includes('m-f') || input.includes('mon-fri') || input.includes('monday-friday') || input.includes('weekdays')) {
    workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  } else if (input.includes('every day') || input.includes('7 days')) {
    workDays = [...DAYS]
  }

  // Check for specific day mentions that might override
  if (input.includes('sat')) workDays.push('Sat')
  if (input.includes('sun')) workDays.push('Sun')

  // Create blocked ranges for each work day
  for (const day of workDays) {
    blocked.push({ day, start: startHour, end: endHour })
  }

  return blocked
}

// Get availability data from a profile
function getProfileAvailability(profile: UserProfile | null): AvailabilityData | null {
  if (!profile) return null

  return {
    preferredDays: parseBestDays(profile.bestDays),
    preferredTimeOfDay: parseBestTimeToReach(profile.bestTimeToReach),
    workHoursBlocked: parseWorkHours(profile.workHours)
  }
}

// Get availability data from a canvass record
function getRecordAvailability(record: UnitRecord): AvailabilityData {
  return {
    preferredDays: parseBestDays(record.bestDays),
    preferredTimeOfDay: parseBestTimeToReach(record.bestTimeToReach),
    workHoursBlocked: parseWorkHours(record.workHours)
  }
}

// Check if a time slot conflicts with work hours
function isWorkHoursConflict(
  slot: { dayIndex: number; hour: number },
  workBlocked: { day: DayName; start: number; end: number }[]
): boolean {
  const dayName = DAYS[slot.dayIndex]

  for (const block of workBlocked) {
    if (block.day === dayName && slot.hour >= block.start && slot.hour < block.end) {
      return true
    }
  }

  return false
}

// Convert time of day to hour ranges
function getHoursForTimeOfDay(time: TimeOfDay): number[] {
  switch (time) {
    case 'morning':
      return [9, 10, 11]
    case 'afternoon':
      return [12, 13, 14, 15, 16]
    case 'evening':
      return [17, 18, 19, 20]
  }
}

// Generate all possible time slots for the next 2 weeks
function generateTimeSlots(): Omit<TimeSlot, 'score' | 'availableCount' | 'conflictCount'>[] {
  const slots: Omit<TimeSlot, 'score' | 'availableCount' | 'conflictCount'>[] = []
  const now = new Date()

  // Generate slots for the next 14 days
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    const dayIndex = date.getDay()
    const dayName = DAYS[dayIndex]

    // Generate time slots from 9 AM to 8 PM
    for (let hour = 9; hour <= 20; hour++) {
      // Only on the hour for simplicity (can add :30 later)
      slots.push({
        day: dayName,
        dayIndex,
        hour,
        minute: 0
      })
    }
  }

  return slots
}

// Score time slots based on availability data
export function suggestMeetingTimes(
  buildingId: string,
  limit: number = 5
): TimeSlot[] {
  // Collect all availability data from building records and current profile
  const availabilityList: AvailabilityData[] = []

  // Get current user's profile
  const profile = getCurrentProfile()
  if (profile) {
    const profileAvail = getProfileAvailability(profile)
    if (profileAvail) {
      availabilityList.push(profileAvail)
    }
  }

  // Get all canvass records for this building
  const buildingCanvass = getBuildingCanvass(buildingId)
  const records = buildingCanvass ? Object.values(buildingCanvass.units) : []
  for (const record of records) {
    const recordAvail = getRecordAvailability(record)
    if (recordAvail.preferredDays.length > 0 || recordAvail.preferredTimeOfDay.length > 0) {
      availabilityList.push(recordAvail)
    }
  }

  // If no availability data, return default evening weekday slots
  if (availabilityList.length === 0) {
    return getDefaultSlots()
  }

  // Generate and score all slots
  const baseSlots = generateTimeSlots()
  const scoredSlots: TimeSlot[] = []

  for (const slot of baseSlots) {
    let score = 0
    let availableCount = 0
    let conflictCount = 0

    for (const avail of availabilityList) {
      let personScore = 0

      // +2 for preferred day
      if (avail.preferredDays.includes(slot.day)) {
        personScore += 2
      }

      // +1 for preferred time of day
      for (const timeOfDay of avail.preferredTimeOfDay) {
        const preferredHours = getHoursForTimeOfDay(timeOfDay)
        if (preferredHours.includes(slot.hour)) {
          personScore += 1
          break
        }
      }

      // -3 for work hour conflict
      if (isWorkHoursConflict(slot, avail.workHoursBlocked)) {
        personScore -= 3
        conflictCount++
      } else if (personScore > 0) {
        availableCount++
      }

      score += personScore
    }

    scoredSlots.push({
      ...slot,
      score,
      availableCount,
      conflictCount
    })
  }

  // Sort by score (descending) and take top N
  scoredSlots.sort((a, b) => {
    // Primary sort by score
    if (b.score !== a.score) return b.score - a.score
    // Secondary sort by available count
    if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount
    // Tertiary sort by fewer conflicts
    return a.conflictCount - b.conflictCount
  })

  // Deduplicate by day+hour to get variety
  const seen = new Set<string>()
  const uniqueSlots: TimeSlot[] = []

  for (const slot of scoredSlots) {
    const key = `${slot.day}-${slot.hour}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueSlots.push(slot)
    }
    if (uniqueSlots.length >= limit) break
  }

  return uniqueSlots
}

// Get default time slots when no availability data exists
function getDefaultSlots(): TimeSlot[] {
  const now = new Date()
  const slots: TimeSlot[] = []

  // Suggest weekday evenings
  const preferredDays: DayName[] = ['Wed', 'Thu', 'Tue']
  const preferredHours = [18, 19, 17, 20]

  for (let dayOffset = 1; dayOffset <= 14 && slots.length < 5; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    const dayIndex = date.getDay()
    const dayName = DAYS[dayIndex]

    if (preferredDays.includes(dayName)) {
      for (const hour of preferredHours) {
        if (slots.length >= 5) break
        slots.push({
          day: dayName,
          dayIndex,
          hour,
          minute: 0,
          score: 0,
          availableCount: 0,
          conflictCount: 0
        })
      }
    }
  }

  // If still not enough, add weekend afternoon
  if (slots.length < 5) {
    for (let dayOffset = 1; dayOffset <= 14 && slots.length < 5; dayOffset++) {
      const date = new Date(now)
      date.setDate(date.getDate() + dayOffset)
      const dayIndex = date.getDay()
      const dayName = DAYS[dayIndex]

      if (dayName === 'Sat' || dayName === 'Sun') {
        slots.push({
          day: dayName,
          dayIndex,
          hour: 14,
          minute: 0,
          score: 0,
          availableCount: 0,
          conflictCount: 0
        })
      }
    }
  }

  return slots
}

// Format a time slot for display
export function formatTimeSlot(slot: TimeSlot): string {
  const hour12 = slot.hour > 12 ? slot.hour - 12 : slot.hour
  const ampm = slot.hour >= 12 ? 'PM' : 'AM'
  const minuteStr = slot.minute.toString().padStart(2, '0')
  return `${slot.day} ${hour12}:${minuteStr} ${ampm}`
}

// Get the next occurrence of a time slot as a Date
export function getNextSlotDate(slot: TimeSlot): Date {
  const now = new Date()
  const result = new Date(now)

  // Find the next occurrence of this day
  const currentDay = now.getDay()
  let daysUntil = slot.dayIndex - currentDay
  if (daysUntil <= 0) daysUntil += 7 // Next week

  result.setDate(result.getDate() + daysUntil)
  result.setHours(slot.hour, slot.minute, 0, 0)

  // If the slot is today but already passed, go to next week
  if (result <= now) {
    result.setDate(result.getDate() + 7)
  }

  return result
}

// Aggregate availability from all building members
export function getAggregatedAvailability(buildingId: string): {
  dayScores: Record<DayName, number>
  timeScores: Record<TimeOfDay, number>
  totalPeople: number
} {
  const dayScores: Record<DayName, number> = {
    Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
  }
  const timeScores: Record<TimeOfDay, number> = {
    morning: 0, afternoon: 0, evening: 0
  }

  let totalPeople = 0

  // Get current user's profile
  const profile = getCurrentProfile()
  if (profile) {
    const avail = getProfileAvailability(profile)
    if (avail && (avail.preferredDays.length > 0 || avail.preferredTimeOfDay.length > 0)) {
      totalPeople++
      for (const day of avail.preferredDays) {
        dayScores[day]++
      }
      for (const time of avail.preferredTimeOfDay) {
        timeScores[time]++
      }
    }
  }

  // Get all canvass records for this building
  const buildingCanvass = getBuildingCanvass(buildingId)
  const records = buildingCanvass ? Object.values(buildingCanvass.units) : []
  for (const record of records) {
    const avail = getRecordAvailability(record)
    if (avail.preferredDays.length > 0 || avail.preferredTimeOfDay.length > 0) {
      totalPeople++
      for (const day of avail.preferredDays) {
        dayScores[day]++
      }
      for (const time of avail.preferredTimeOfDay) {
        timeScores[time]++
      }
    }
  }

  return { dayScores, timeScores, totalPeople }
}
