'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('EventForm')

import { useState, useMemo } from 'react'
import {
  createEvent,
  getEventTypeLabel,
  getEventTypeIcon,
  type EventType,
  EVENT_VOTE_THRESHOLD,
} from '@/lib/storage/eventStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import type { BuildingEvent } from '@/lib/storage/eventStorage'

interface DayEventFormProps {
  date: Date
  buildingId: string
  buildingAddress: string
  onCreated: (event: BuildingEvent) => void
  onCancel: () => void
}

const EVENT_TYPES: EventType[] = ['custom', 'meeting', 'workshop', 'action', 'committee', 'intake', 'social', 'other']

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function DayEventForm({
  date,
  buildingId,
  buildingAddress,
  onCreated,
  onCancel
}: DayEventFormProps) {
  const profile = getCurrentProfile()

  // Pre-fill date at 6 PM
  const getInitialDateTime = () => {
    const d = new Date(date)
    d.setHours(18, 0, 0, 0)
    return formatDateTimeLocal(d)
  }

  // Form state
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<EventType>('custom')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState(getInitialDateTime)
  const [duration, setDuration] = useState(60)
  const [locationName, setLocationName] = useState('')
  const [isVirtual, setIsVirtual] = useState(false)
  const [virtualLink, setVirtualLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const descriptionLength = useMemo(() => description.length, [description])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Event title is required')
      return
    }

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!locationName.trim() && !isVirtual) {
      setError('Location is required for in-person events')
      return
    }

    if (isVirtual && !virtualLink.trim()) {
      setError('Meeting link is required for virtual events')
      return
    }

    try {
      setIsSubmitting(true)
      const dateObj = new Date(dateTime)

      const event = createEvent({
        buildingId,
        buildingAddress,
        isGroupWide: false,
        title: title.trim(),
        description: description.trim() || undefined,
        eventType,
        dateTime: dateObj.getTime(),
        durationMinutes: duration,
        location: {
          name: isVirtual ? 'Virtual Meeting' : locationName.trim(),
          isVirtual,
          virtualLink: isVirtual ? virtualLink.trim() : undefined
        },
        createdBy: profile?.id || 'unknown',
        createdByName: profile?.nickname || 'Unknown',
        status: 'confirmed'
      })

      if (!event) {
        setError('Unable to create event. Please try again in a moment.')
        return
      }

      onCreated(event)
      // Reset form
      setTitle('')
      setDescription('')
      setEventType('custom')
      setLocationName('')
      setIsVirtual(false)
      setVirtualLink('')
      setDateTime(getInitialDateTime)
    } catch (err) {
      setError('Failed to create event')
      log.error('Error creating event:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Create Event</h3>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Building meeting, Tenant discussion"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              disabled={isSubmitting}
            >
              {EVENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {getEventTypeIcon(type)} {getEventTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Location Toggle & Input */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={isVirtual}
                onChange={(e) => {
                  setIsVirtual(e.target.checked)
                  setLocationName('')
                  setVirtualLink('')
                }}
                className="rounded border-gray-300"
                disabled={isSubmitting}
              />
              <label htmlFor="isVirtual" className="text-xs font-medium text-gray-700">
                Virtual Meeting
              </label>
            </div>

            {isVirtual ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  value={virtualLink}
                  onChange={(e) => setVirtualLink(e.target.value)}
                  placeholder="https://zoom.us/..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Community room, Lobby, Coffee shop"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="What is this event about?"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {descriptionLength}/500 characters
            </p>
          </div>


          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-rstu-red rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
