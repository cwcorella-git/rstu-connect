'use client'

/**
 * Event Storage - CRUD operations for building events
 * Uses localStorage with optional Supabase sync
 */

import { sanitizeText, sanitizeRichText, sanitizeUrl } from './sanitize'
import { tryAction } from './rateLimit'

// Event types
export type EventType = 'custom' | 'meeting' | 'committee' | 'workshop' | 'action' | 'intake' | 'social' | 'other'
export type EventStatus = 'proposed' | 'confirmed' | 'cancelled' | 'completed'
export type RsvpStatus = 'yes' | 'no' | 'maybe'

export interface EventLocation {
  name: string
  address?: string
  isVirtual: boolean
  virtualLink?: string
}

export interface EventRsvp {
  profileId: string
  profileNickname: string
  status: RsvpStatus
  timestamp: number
}

export interface ActionItem {
  id: string
  description: string
  assignedTo?: string
  assignedToName?: string
  completed: boolean
  dueDate?: number
}

export interface MeetingNotes {
  content: string              // Markdown
  attendees: string[]          // Profile IDs
  actionItems: ActionItem[]
  createdAt: number
  updatedAt: number
}

export interface EventVotes {
  upvotes: string[]            // Profile IDs who approve
  downvotes: string[]          // Profile IDs who reject
  threshold: number            // Required upvotes to pass
}

export interface EventRecurrence {
  type: 'none' | 'weekly' | 'biweekly' | 'monthly'
  interval: number             // 1 for weekly, 2 for biweekly
  endDate?: number             // Optional series end (timestamp)
  parentEventId?: string       // Link to first event in series
  seriesId?: string            // Shared ID for all events in series
  occurrenceNumber?: number    // Which occurrence (1, 2, 3...)
}

export interface BuildingEvent {
  id: string

  // Scope
  buildingId: string           // Primary building (chatSlug)
  buildingAddress: string
  groupId?: string             // If linked property group
  isGroupWide: boolean

  // Campaign integration
  campaignId?: string          // Link to campaign if part of organizing effort

  // Basic info
  title: string
  description?: string
  eventType: EventType
  status: EventStatus

  // Timing
  dateTime: number             // Unix timestamp (milliseconds)
  durationMinutes: number      // Default 60

  // Location
  location: EventLocation

  // Organizer
  createdBy: string            // Profile ID
  createdByName: string
  createdAt: number

  // RSVPs
  rsvps: EventRsvp[]

  // Meeting notes (added after)
  notes?: MeetingNotes

  // Chat integration
  chatMessageId?: string

  // Voting (for proposed events)
  votes?: EventVotes

  // Recurrence (for recurring events)
  recurrence?: EventRecurrence
}

// Storage key
const EVENTS_STORAGE_KEY = 'rstu-events'

// Generate a cryptographically secure short ID
function generateShortId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0]
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Crypto API not available')
}

// Get all events from localStorage
export function getAllEvents(): BuildingEvent[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error loading events:', error)
    return []
  }
}

// Save all events to localStorage
function saveAllEvents(events: BuildingEvent[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Error saving events:', error)
  }
}

// Get events for a specific building
export function getBuildingEvents(buildingId: string): BuildingEvent[] {
  const allEvents = getAllEvents()
  return allEvents.filter(e =>
    e.buildingId === buildingId ||
    (e.isGroupWide && e.groupId) // Include group events
  )
}

// Get events for a specific group
export function getGroupEvents(groupId: string): BuildingEvent[] {
  const allEvents = getAllEvents()
  return allEvents.filter(e => e.groupId === groupId && e.isGroupWide)
}

// Get upcoming events (not cancelled or completed)
export function getUpcomingEvents(buildingId?: string): BuildingEvent[] {
  const now = Date.now()
  const allEvents = getAllEvents()

  return allEvents
    .filter(e => {
      const isUpcoming = e.dateTime > now && e.status !== 'cancelled' && e.status !== 'completed'
      if (buildingId) {
        return isUpcoming && (e.buildingId === buildingId || (e.isGroupWide && e.groupId))
      }
      return isUpcoming
    })
    .sort((a, b) => a.dateTime - b.dateTime)
}

// Get past events
export function getPastEvents(buildingId?: string): BuildingEvent[] {
  const now = Date.now()
  const allEvents = getAllEvents()

  return allEvents
    .filter(e => {
      const isPast = e.dateTime <= now || e.status === 'completed' || e.status === 'cancelled'
      if (buildingId) {
        return isPast && (e.buildingId === buildingId || (e.isGroupWide && e.groupId))
      }
      return isPast
    })
    .sort((a, b) => b.dateTime - a.dateTime) // Most recent first
}

// Get event by ID
export function getEventById(eventId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  return allEvents.find(e => e.id === eventId) || null
}

// Get events for a user (where they have RSVP'd)
export function getUserEvents(profileId: string): BuildingEvent[] {
  const allEvents = getAllEvents()
  return allEvents.filter(e =>
    e.rsvps.some(r => r.profileId === profileId)
  ).sort((a, b) => a.dateTime - b.dateTime)
}

// Get events for a specific campaign
export function getCampaignEvents(campaignId: string): BuildingEvent[] {
  const allEvents = getAllEvents()
  return allEvents
    .filter(e => e.campaignId === campaignId)
    .sort((a, b) => a.dateTime - b.dateTime)
}

// Get upcoming events for a campaign
export function getUpcomingCampaignEvents(campaignId: string): BuildingEvent[] {
  const now = Date.now()
  return getCampaignEvents(campaignId).filter(e =>
    e.dateTime > now && e.status !== 'cancelled' && e.status !== 'completed'
  )
}

// Get past events for a campaign
export function getPastCampaignEvents(campaignId: string): BuildingEvent[] {
  const now = Date.now()
  return getCampaignEvents(campaignId)
    .filter(e => e.dateTime <= now || e.status === 'completed' || e.status === 'cancelled')
    .sort((a, b) => b.dateTime - a.dateTime)
}

// Link an event to a campaign
export function linkEventToCampaign(eventId: string, campaignId: string): BuildingEvent | null {
  return updateEvent(eventId, { campaignId })
}

// Unlink an event from a campaign
export function unlinkEventFromCampaign(eventId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)
  if (!event) return null

  delete event.campaignId
  saveAllEvents(allEvents)
  return event
}

// Create a new event
export function createEvent(event: Omit<BuildingEvent, 'id' | 'createdAt' | 'rsvps'>): BuildingEvent | null {
  // Check rate limit
  const rateLimitResult = tryAction('event_create', event.createdBy)
  if (!rateLimitResult.allowed) {
    console.warn('[EventStorage] Rate limited:', rateLimitResult.error)
    return null
  }

  const newEvent: BuildingEvent = {
    ...event,
    // Sanitize user-provided text fields
    title: sanitizeText(event.title),
    description: event.description ? sanitizeRichText(event.description) : undefined,
    createdByName: sanitizeText(event.createdByName),
    location: {
      ...event.location,
      name: sanitizeText(event.location.name),
      address: event.location.address ? sanitizeText(event.location.address) : undefined,
      virtualLink: event.location.virtualLink ? sanitizeUrl(event.location.virtualLink) : undefined,
    },
    id: `evt-${Date.now()}-${generateShortId()}`,
    createdAt: Date.now(),
    rsvps: []
  }

  const allEvents = getAllEvents()
  allEvents.push(newEvent)
  saveAllEvents(allEvents)

  return newEvent
}

// Update an event
export function updateEvent(eventId: string, updates: Partial<BuildingEvent>): BuildingEvent | null {
  const allEvents = getAllEvents()
  const index = allEvents.findIndex(e => e.id === eventId)

  if (index === -1) return null

  allEvents[index] = { ...allEvents[index], ...updates }
  saveAllEvents(allEvents)

  return allEvents[index]
}

// Delete an event
export function deleteEvent(eventId: string): boolean {
  const allEvents = getAllEvents()
  const index = allEvents.findIndex(e => e.id === eventId)

  if (index === -1) return false

  allEvents.splice(index, 1)
  saveAllEvents(allEvents)

  return true
}

// RSVP to an event
export function rsvpToEvent(
  eventId: string,
  profileId: string,
  profileNickname: string,
  status: RsvpStatus
): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event) return null

  // Remove existing RSVP if any
  event.rsvps = event.rsvps.filter(r => r.profileId !== profileId)

  // Add new RSVP
  event.rsvps.push({
    profileId,
    profileNickname: sanitizeText(profileNickname),
    status,
    timestamp: Date.now()
  })

  saveAllEvents(allEvents)
  return event
}

// Remove RSVP from an event
export function removeRsvp(eventId: string, profileId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event) return null

  event.rsvps = event.rsvps.filter(r => r.profileId !== profileId)
  saveAllEvents(allEvents)

  return event
}

// Get RSVP counts for an event
export function getRsvpCounts(event: BuildingEvent): { yes: number; no: number; maybe: number } {
  return {
    yes: event.rsvps.filter(r => r.status === 'yes').length,
    no: event.rsvps.filter(r => r.status === 'no').length,
    maybe: event.rsvps.filter(r => r.status === 'maybe').length
  }
}

// Add meeting notes to an event
export function addMeetingNotes(
  eventId: string,
  content: string,
  attendees: string[],
  actionItems: Omit<ActionItem, 'id'>[]
): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event) return null

  const now = Date.now()
  event.notes = {
    content: sanitizeRichText(content),
    attendees,
    actionItems: actionItems.map(item => ({
      ...item,
      description: sanitizeText(item.description),
      assignedToName: item.assignedToName ? sanitizeText(item.assignedToName) : undefined,
      id: `action-${Date.now()}-${generateShortId()}`
    })),
    createdAt: now,
    updatedAt: now
  }

  // Mark event as completed
  event.status = 'completed'

  saveAllEvents(allEvents)
  return event
}

// Update meeting notes
export function updateMeetingNotes(
  eventId: string,
  updates: Partial<Omit<MeetingNotes, 'createdAt' | 'updatedAt'>>
): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event || !event.notes) return null

  event.notes = {
    ...event.notes,
    ...updates,
    updatedAt: Date.now()
  }

  saveAllEvents(allEvents)
  return event
}

// Toggle action item completion
export function toggleActionItem(eventId: string, actionItemId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event || !event.notes) return null

  const actionItem = event.notes.actionItems.find(a => a.id === actionItemId)
  if (actionItem) {
    actionItem.completed = !actionItem.completed
  }

  event.notes.updatedAt = Date.now()
  saveAllEvents(allEvents)

  return event
}

// Format event for chat message
export function formatEventForChat(event: BuildingEvent): string {
  // Format: [EVENT:id:type:title|datetime|location]
  const locationStr = event.location.isVirtual ? 'Virtual' : event.location.name
  return `[EVENT:${event.id}:${event.eventType}:${event.title}|${event.dateTime}|${locationStr}]`
}

// Parse event from chat message
export function parseEventFromChat(message: string): { eventId: string; type: EventType; title: string; dateTime: number; location: string } | null {
  const match = message.match(/\[EVENT:([^:]+):([^:]+):([^|]+)\|(\d+)\|([^\]]+)\]/)
  if (!match) return null

  return {
    eventId: match[1],
    type: match[2] as EventType,
    title: match[3],
    dateTime: parseInt(match[4], 10),
    location: match[5]
  }
}

// Get event type label
export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    custom: 'Custom',
    meeting: 'Meeting',
    committee: 'Committee',
    workshop: 'Workshop',
    action: 'Action',
    intake: 'Intake',
    social: 'Social',
    other: 'Other'
  }
  return labels[type]
}

// Get event type icon (emoji)
export function getEventTypeIcon(type: EventType): string {
  const icons: Record<EventType, string> = {
    custom: '✏️',
    meeting: '📅',
    committee: '👥',
    workshop: '🎓',
    action: '✊',
    intake: '📋',
    social: '🎉',
    other: '📌'
  }
  return icons[type]
}

// Check if event is happening soon (within 24 hours)
export function isEventSoon(event: BuildingEvent): boolean {
  const now = Date.now()
  const hoursUntil = (event.dateTime - now) / (1000 * 60 * 60)
  return hoursUntil > 0 && hoursUntil <= 24
}

// Check if event is happening very soon (within 1 hour)
export function isEventVerySoon(event: BuildingEvent): boolean {
  const now = Date.now()
  const hoursUntil = (event.dateTime - now) / (1000 * 60 * 60)
  return hoursUntil > 0 && hoursUntil <= 1
}

// Format event date/time for display
export function formatEventDateTime(dateTime: number): string {
  const date = new Date(dateTime)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  // Check if today
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${timeStr}`
  }

  // Check if tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`
  }

  // Within this week - show day name
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil > 0 && daysUntil <= 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return `${dayName}, ${timeStr}`
  }

  // Otherwise show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }) + `, ${timeStr}`
}

// ============================================================================
// VOTING SYSTEM
// ============================================================================

export const EVENT_VOTE_THRESHOLD = 3
export const PROPOSAL_EXPIRY_DAYS = 7

// Vote on a proposed event
export function voteOnEvent(
  eventId: string,
  profileId: string,
  vote: 'up' | 'down'
): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event || !event.votes) return null

  const { upvotes, downvotes } = event.votes

  // Remove existing vote if any
  event.votes.upvotes = upvotes.filter(id => id !== profileId)
  event.votes.downvotes = downvotes.filter(id => id !== profileId)

  // Add new vote
  if (vote === 'up') {
    event.votes.upvotes.push(profileId)
  } else {
    event.votes.downvotes.push(profileId)
  }

  saveAllEvents(allEvents)
  return event
}

// Check proposal status
export function checkProposalStatus(event: BuildingEvent): {
  passed: boolean
  upvotes: number
  downvotes: number
  threshold: number
  daysRemaining: number
  isExpired: boolean
} {
  const votes = event.votes
  if (!votes) {
    return { passed: false, upvotes: 0, downvotes: 0, threshold: 0, daysRemaining: 0, isExpired: true }
  }

  const upvotes = votes.upvotes.length
  const downvotes = votes.downvotes.length
  const threshold = votes.threshold
  const passed = upvotes >= threshold

  const expiryTime = event.createdAt + (PROPOSAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  const now = Date.now()
  const daysRemaining = Math.ceil((expiryTime - now) / (24 * 60 * 60 * 1000))
  const isExpired = now > expiryTime

  return {
    passed,
    upvotes,
    downvotes,
    threshold,
    daysRemaining: Math.max(0, daysRemaining),
    isExpired
  }
}

// Confirm proposed event (change status from proposed to confirmed)
export function confirmProposedEvent(eventId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event || event.status !== 'proposed') return null

  event.status = 'confirmed'
  saveAllEvents(allEvents)
  return event
}

// Reject proposed event (change status to cancelled)
export function rejectProposedEvent(eventId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event || event.status !== 'proposed') return null

  event.status = 'cancelled'
  saveAllEvents(allEvents)
  return event
}

// Get all proposed events (optionally for specific building)
export function getProposedEvents(buildingId?: string): BuildingEvent[] {
  const allEvents = getAllEvents()
  return allEvents.filter(e => {
    const isProposed = e.status === 'proposed'
    if (buildingId) {
      return isProposed && (e.buildingId === buildingId || (e.isGroupWide && e.groupId))
    }
    return isProposed
  }).sort((a, b) => a.dateTime - b.dateTime)
}

// ============================================================================
// RECURRENCE SYSTEM
// ============================================================================

interface RecurrenceConfig {
  type: 'weekly' | 'biweekly' | 'monthly'
  interval: number
  endDate?: number
  seriesId?: string
}

// Generate recurring event instances
export function generateRecurringEvents(
  baseEvent: Omit<BuildingEvent, 'id' | 'createdAt' | 'rsvps'>,
  config: RecurrenceConfig,
  occurrences: number = 10
): BuildingEvent[] {
  const seriesId = config.seriesId || `series-${Date.now()}-${generateShortId()}`
  const events: BuildingEvent[] = []

  let currentDate = new Date(baseEvent.dateTime)
  let occurrence = 1

  while (occurrence <= occurrences) {
    // Check if past endDate
    if (config.endDate && currentDate.getTime() > config.endDate) {
      break
    }

    const newEvent: BuildingEvent = {
      ...baseEvent,
      id: `evt-${Date.now()}-${generateShortId()}`,
      dateTime: currentDate.getTime(),
      createdAt: Date.now(),
      rsvps: [],
      recurrence: {
        type: config.type,
        interval: config.interval,
        endDate: config.endDate,
        seriesId,
        occurrenceNumber: occurrence
      }
    }

    events.push(newEvent)

    // Advance to next occurrence
    switch (config.type) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
    }

    occurrence++
  }

  return events
}

// Check if event is part of a recurring series
export function isRecurringEvent(event: BuildingEvent): boolean {
  return !!(event.recurrence && event.recurrence.type !== 'none')
}

// Get all events in a series
export function getEventSeries(seriesId: string): BuildingEvent[] {
  const allEvents = getAllEvents()
  return allEvents
    .filter(e => e.recurrence && e.recurrence.seriesId === seriesId)
    .sort((a, b) => {
      const occA = a.recurrence?.occurrenceNumber || 0
      const occB = b.recurrence?.occurrenceNumber || 0
      return occA - occB
    })
}

// Update all events in a series
export function updateEventSeries(seriesId: string, updates: Partial<BuildingEvent>): BuildingEvent[] {
  const allEvents = getAllEvents()
  const seriesEvents = allEvents.filter(e => e.recurrence && e.recurrence.seriesId === seriesId)

  seriesEvents.forEach(event => {
    Object.assign(event, updates)
  })

  saveAllEvents(allEvents)
  return seriesEvents
}

// Update a single event instance in a series
export function updateEventInstance(eventId: string, updates: Partial<BuildingEvent>): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event) return null

  Object.assign(event, updates)
  saveAllEvents(allEvents)
  return event
}

// Delete all events in a series
export function deleteEventSeries(seriesId: string): boolean {
  const allEvents = getAllEvents()
  const initialLength = allEvents.length
  const filtered = allEvents.filter(e => !(e.recurrence && e.recurrence.seriesId === seriesId))

  if (filtered.length === initialLength) return false

  saveAllEvents(filtered)
  return true
}

// Delete a single event instance (optionally delete all following)
export function deleteEventInstance(eventId: string, deleteFollowing: boolean = false): boolean {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event) return false

  if (!event.recurrence || !event.recurrence.seriesId) {
    // Not a recurring event, just delete it
    const index = allEvents.findIndex(e => e.id === eventId)
    allEvents.splice(index, 1)
    saveAllEvents(allEvents)
    return true
  }

  // For recurring events
  if (deleteFollowing) {
    // Delete this event and all following occurrences
    const seriesEvents = allEvents.filter(e => e.recurrence?.seriesId === event.recurrence!.seriesId)
    const currentOccurrence = event.recurrence.occurrenceNumber || 0

    const filtered = allEvents.filter(e => {
      if (e.recurrence?.seriesId !== event.recurrence!.seriesId) return true
      const occurrence = e.recurrence?.occurrenceNumber || 0
      return occurrence < currentOccurrence
    })

    saveAllEvents(filtered)
  } else {
    // Delete only this instance
    const index = allEvents.findIndex(e => e.id === eventId)
    allEvents.splice(index, 1)
    saveAllEvents(allEvents)
  }

  return true
}

// ============================================================================
// JITSI VIDEO MEETING INTEGRATION
// ============================================================================

/**
 * Generate a Jitsi Meet room name from event data
 * Jitsi room names should be URL-friendly alphanumeric strings
 */
export function generateJitsiRoomName(eventId: string, buildingAddress: string): string {
  // Create deterministic room name from event ID and address
  // Format: rstu-[buildingslug]-[eventid]
  const addressSlug = buildingAddress
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)

  const eventSlug = eventId.slice(0, 8)
  return `rstu-${addressSlug}-${eventSlug}`
}

/**
 * Generate full Jitsi Meet URL for an event
 * Uses jitsi.org public instance (no account required)
 */
export function generateJitsiMeetingUrl(eventId: string, buildingAddress: string): string {
  const roomName = generateJitsiRoomName(eventId, buildingAddress)
  return `https://meet.jitsi.org/${roomName}`
}

/**
 * Add Jitsi meeting link to a virtual event
 */
export function addJitsiMeetingLink(eventId: string): BuildingEvent | null {
  const allEvents = getAllEvents()
  const event = allEvents.find(e => e.id === eventId)

  if (!event || !event.location.isVirtual) return null

  const jitsiUrl = generateJitsiMeetingUrl(eventId, event.buildingAddress)

  event.location = {
    ...event.location,
    virtualLink: jitsiUrl
  }

  saveAllEvents(allEvents)
  return event
}

/**
 * Get Jitsi meeting link from an event (generates if not set)
 */
export function getJitsiMeetingLink(event: BuildingEvent): string | null {
  if (!event.location.isVirtual) return null

  // If virtual link exists, use it
  if (event.location.virtualLink) {
    return event.location.virtualLink
  }

  // Generate one
  return generateJitsiMeetingUrl(event.id, event.buildingAddress)
}

/**
 * Check if an event has a Jitsi meeting link
 */
export function hasJitsiLink(event: BuildingEvent): boolean {
  return event.location.isVirtual && !!(event.location.virtualLink)
}
