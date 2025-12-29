/**
 * iCalendar Format Generator
 * Generates .ics files for events that can be imported into Google Calendar, Outlook, Apple Calendar, etc.
 */

import type { BuildingEvent } from './eventStorage'

/**
 * Convert a BuildingEvent to iCalendar format (.ics)
 * Returns the iCalendar content as a string
 */
export function generateICalendar(event: BuildingEvent): string {
  const lines: string[] = []

  // iCalendar header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Reno-Sparks Tenants Union//RSTU Connect//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')

  // Event
  lines.push('BEGIN:VEVENT')

  // Unique ID (use event ID + domain to ensure uniqueness)
  lines.push(`UID:${event.id}@rstu-connect.local`)

  // Timestamp
  const now = new Date()
  lines.push(`DTSTAMP:${formatDateTime(now)}`)

  // Event date/time
  const eventDate = new Date(event.dateTime)
  lines.push(`DTSTART:${formatDateTime(eventDate)}`)

  // End time (calculated from duration)
  const endDate = new Date(eventDate.getTime() + event.durationMinutes * 60 * 1000)
  lines.push(`DTEND:${formatDateTime(endDate)}`)

  // Title
  lines.push(`SUMMARY:${escapeICalText(event.title)}`)

  // Description (includes event type and location)
  let description = ''
  if (event.description) {
    description += escapeICalText(event.description) + '\n\n'
  }
  description += `Event Type: ${event.eventType}\n`
  if (event.location.address) {
    description += `Location: ${escapeICalText(event.location.address)}\n`
  }
  if (event.location.virtualLink) {
    description += `Join: ${escapeICalText(event.location.virtualLink)}\n`
  }
  description += `Building: ${escapeICalText(event.buildingAddress)}\n`
  if (event.campaignId) {
    description += `Campaign: ${escapeICalText(event.campaignId)}\n`
  }

  // Add RSVP information if available
  if (event.rsvps.length > 0) {
    const yesCount = event.rsvps.filter(r => r.status === 'yes').length
    const maybeCount = event.rsvps.filter(r => r.status === 'maybe').length
    const noCount = event.rsvps.filter(r => r.status === 'no').length
    description += `\nRSVPs: ${yesCount} Yes, ${maybeCount} Maybe, ${noCount} No`
  }

  lines.push(`DESCRIPTION:${escapeICalText(description)}`)

  // Location field (for calendar apps that display it separately)
  if (event.location.address || event.location.name) {
    const locationName = event.location.isVirtual
      ? `Virtual Event${event.location.name ? ': ' + event.location.name : ''}`
      : event.location.address || event.location.name
    lines.push(`LOCATION:${escapeICalText(locationName)}`)
  }

  // URL (link back to event, if you want to add this in future)
  lines.push(`URL:${getEventUrl(event.id)}`)

  // Organizer
  lines.push(`ORGANIZER;CN=${escapeICalText(event.createdByName)}:mailto:organizer@rstu-connect.local`)

  // Status
  const statusMap: { [key in typeof event.status]: string } = {
    proposed: 'TENTATIVE',
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED',
    completed: 'CONFIRMED'
  }
  lines.push(`STATUS:${statusMap[event.status]}`)

  // Sequence (for updates)
  lines.push('SEQUENCE:0')

  // Last modified
  const lastModified = event.notes?.updatedAt || event.createdAt || Date.now()
  lines.push(`LAST-MODIFIED:${formatDateTime(new Date(lastModified))}`)

  // Created
  lines.push(`CREATED:${formatDateTime(new Date(event.createdAt))}`)

  // Event end
  lines.push('END:VEVENT')

  // Calendar end
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Format a Date object to iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatDateTime(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Escape special characters in iCalendar text fields
 * Per RFC 5545: CR, LF, and "," need escaping
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\') // Backslash first
    .replace(/\r\n/g, '\\n') // CRLF
    .replace(/\r/g, '\\n') // CR
    .replace(/\n/g, '\\n') // LF
    .replace(/,/g, '\\,') // Comma in some fields
    .replace(/;/g, '\\;') // Semicolon
}

/**
 * Generate event URL (for calendar apps that support clickable links)
 * Points to the event in the RSTU Connect app
 */
function getEventUrl(eventId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}?eventId=${eventId}`
  }
  return `https://rstu-connect.neocities.org?eventId=${eventId}`
}

/**
 * Download an iCalendar file
 */
export function downloadICalendar(event: BuildingEvent): void {
  const icalContent = generateICalendar(event)
  const blob = new Blob([icalContent], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFileName(event.title)}_${new Date(event.dateTime).toISOString().split('T')[0]}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate iCalendar content for multiple events (calendar-wide export)
 */
export function generateICalendarMultiple(events: BuildingEvent[]): string {
  const lines: string[] = []

  // Calendar header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Reno-Sparks Tenants Union//RSTU Connect//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push(`X-WR-CALNAME:RSTU Connect - ${new Date().getFullYear()} Events`)
  lines.push('X-WR-TIMEZONE:America/Los_Angeles')

  // Add all events
  for (const event of events) {
    // Extract just the VEVENT portion from each event
    const singleIcal = generateICalendar(event)
    const eventMatch = singleIcal.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/)
    if (eventMatch) {
      lines.push(eventMatch[0])
    }
  }

  // Calendar end
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Sanitize filename by removing special characters
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50)
}
