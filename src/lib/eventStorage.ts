'use client'

/**
 * Event Storage - CRUD operations for building events
 * Uses localStorage with optional Supabase sync
 */

// Event types
export type EventType = 'meeting' | 'committee' | 'workshop' | 'action' | 'intake' | 'social' | 'other'
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

export interface BuildingEvent {
  id: string

  // Scope
  buildingId: string           // Primary building (chatSlug)
  buildingAddress: string
  groupId?: string             // If linked property group
  isGroupWide: boolean

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
}

// Storage key
const EVENTS_STORAGE_KEY = 'rstu-events'

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

// Create a new event
export function createEvent(event: Omit<BuildingEvent, 'id' | 'createdAt' | 'rsvps'>): BuildingEvent {
  const newEvent: BuildingEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    profileNickname,
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
    content,
    attendees,
    actionItems: actionItems.map(item => ({
      ...item,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
