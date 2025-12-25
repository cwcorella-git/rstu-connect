'use client'

import { LinkedPropertyGroup, generateBlocName } from '@/lib/linkedPropertiesStorage'
import { getGroupEvents } from '@/lib/eventStorage'

interface BlocCardProps {
  group: LinkedPropertyGroup
  addresses: string[]  // Addresses from buildings data
  onClick: () => void
  isSelected?: boolean
}

export function BlocCard({ group, addresses, onClick, isSelected }: BlocCardProps) {
  // Use custom name if set, otherwise generate from addresses
  const blocName = group.name || generateBlocName(addresses)
  const propertyCount = group.apns.length
  const allianceCount = group.alliances?.length || 0
  const memberCount = group.memberProfiles?.length || 0

  // Get upcoming events for this block
  const events = getGroupEvents(group.id)
  const upcomingEvents = events.filter(e =>
    e.dateTime > Date.now() &&
    e.status !== 'cancelled' &&
    e.status !== 'completed'
  )

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-red-50 border-rstu-red shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Bloc Name */}
      <h3 className="font-semibold text-gray-900 mb-1">{blocName}</h3>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
        </span>

        {memberCount > 0 && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        )}
      </div>

      {/* Upcoming Events Badge */}
      {upcomingEvents.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {upcomingEvents.length} upcoming {upcomingEvents.length === 1 ? 'event' : 'events'}
        </div>
      )}

      {/* Alliances Badge */}
      {allianceCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-purple-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Allied with {allianceCount} {allianceCount === 1 ? 'bloc' : 'blocs'}
        </div>
      )}
    </div>
  )
}
