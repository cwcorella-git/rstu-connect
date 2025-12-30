'use client'

import { useState } from 'react'
import { LinkedPropertyGroup, generateBlocName } from '@/lib/linkedPropertiesStorage'
import { createEvent, EventType, getEventTypeLabel, getEventTypeIcon } from '@/lib/eventStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { EnhancedBuilding } from '@/lib/getBuildingsData'

interface BlocEventFormProps {
  group: LinkedPropertyGroup
  buildings: EnhancedBuilding[]
  onClose: () => void
  onSuccess: () => void
}

const EVENT_TYPES: EventType[] = ['meeting', 'committee', 'workshop', 'action', 'social', 'other']

export function BlocEventForm({ group, buildings, onClose, onSuccess }: BlocEventFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<EventType>('meeting')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [isVirtual, setIsVirtual] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [virtualLink, setVirtualLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profile = getCurrentProfile()

  // Get association info
  const blocBuildings = buildings.filter(b => group.apns.includes(b.apn))
  const addresses = blocBuildings.map(b => b.address)
  const blocName = group.name || generateBlocName(addresses)

  // Get primary building for the event
  const primaryBuilding = blocBuildings[0]

  const handleSubmit = () => {
    if (!profile || !title.trim() || !date || !time || !primaryBuilding) return
    if (!isVirtual && !locationName.trim()) return

    setIsSubmitting(true)

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`).getTime()

    createEvent({
      buildingId: primaryBuilding.apn,
      buildingAddress: primaryBuilding.address,
      groupId: group.id,
      isGroupWide: true,
      title: title.trim(),
      description: description.trim() || undefined,
      eventType,
      status: 'proposed',
      dateTime,
      durationMinutes,
      location: {
        name: isVirtual ? 'Virtual Meeting' : locationName.trim(),
        isVirtual,
        virtualLink: isVirtual ? virtualLink.trim() || undefined : undefined,
      },
      createdBy: profile.id,
      createdByName: profile.nickname,
    })

    setIsSubmitting(false)
    onSuccess()
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  const isValid = title.trim() && date && time && (isVirtual || locationName.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Plan Event</h2>
            <p className="text-xs text-gray-500">{blocName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setEventType(type)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                    eventType === type
                      ? 'border-rstu-red bg-red-50 text-rstu-red font-medium'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{getEventTypeIcon(type)}</span>
                  <span>{getEventTypeLabel(type)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bloc Planning Meeting"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will be discussed or planned?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>

          {/* Location Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setIsVirtual(false)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  !isVirtual
                    ? 'border-gray-800 bg-gray-800 text-white font-medium'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                In-Person
              </button>
              <button
                onClick={() => setIsVirtual(true)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  isVirtual
                    ? 'border-gray-800 bg-gray-800 text-white font-medium'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Virtual
              </button>
            </div>

            {isVirtual ? (
              <input
                type="url"
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
                placeholder="Meeting link (Zoom, Meet, etc.) - optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
            ) : (
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Community Room, Lobby"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
            )}
          </div>

          {/* Autonomous Planning Note */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              <strong>Autonomous Planning:</strong> Blocs can organize events independently.
              No approval from the union is required.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isValid && !isSubmitting
                ? 'bg-rstu-red hover:bg-red-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  )
}
