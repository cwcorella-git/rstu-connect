'use client'

import { useState, useMemo } from 'react';
import {
  BuildingEvent,
  RsvpStatus,
  rsvpToEvent,
  getRsvpCounts,
  formatEventDateTime,
  getEventTypeLabel,
  isEventSoon,
  isEventVerySoon,
} from '@/lib/eventStorage';
import { getCurrentProfile } from '@/lib/profileStorage';
import { EventTypeIcon, getEventTypeColor, getEventTypeBgColor } from './EventTypeIcon';

interface EventCardProps {
  event: BuildingEvent;
  buildingId: string;
  onRefresh: () => void;
  compact?: boolean;
}

export function EventCard({ event, buildingId, onRefresh, compact = false }: EventCardProps) {
  const [isRsvping, setIsRsvping] = useState(false);

  // Get current user's profile
  const profile = useMemo(() => getCurrentProfile(), []);

  // Get current user's RSVP
  const currentRsvp = useMemo(() => {
    if (!profile) return null;
    return event.rsvps.find(r => r.profileId === profile.id);
  }, [event.rsvps, profile]);

  // Get RSVP counts
  const counts = useMemo(() => getRsvpCounts(event), [event]);

  // Check if event is soon
  const isSoon = isEventSoon(event);
  const isVerySoon = isEventVerySoon(event);
  const isPast = event.status === 'completed' || event.dateTime < Date.now();

  // Handle RSVP
  const handleRsvp = async (status: RsvpStatus) => {
    if (!profile) {
      alert('Please create a profile first to RSVP to events.');
      return;
    }

    setIsRsvping(true);
    try {
      rsvpToEvent(event.id, profile.id, profile.nickname || 'Anonymous', status);
      onRefresh();
    } finally {
      setIsRsvping(false);
    }
  };

  // Status badge
  const getStatusBadge = () => {
    if (event.status === 'cancelled') {
      return <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">Cancelled</span>;
    }
    if (event.status === 'completed') {
      return <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">Completed</span>;
    }
    if (isVerySoon) {
      return <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded animate-pulse">Starting Soon</span>;
    }
    if (isSoon) {
      return <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">Tomorrow</span>;
    }
    if (event.status === 'proposed') {
      return <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Proposed</span>;
    }
    return null;
  };

  if (compact) {
    return (
      <div className={`p-3 bg-white rounded-lg border ${isPast ? 'border-gray-200 opacity-75' : 'border-gray-300'}`}>
        <div className="flex items-start gap-2">
          <div className={`p-1.5 rounded-full ${getEventTypeBgColor(event.eventType)}`}>
            <EventTypeIcon type={event.eventType} className={`w-4 h-4 ${getEventTypeColor(event.eventType)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
            <p className="text-xs text-gray-500">{formatEventDateTime(event.dateTime)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${isPast ? 'border-gray-200' : isSoon ? 'border-orange-300' : 'border-gray-300'} overflow-hidden`}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Event Type Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isPast ? 'bg-gray-100' : isSoon ? 'bg-orange-100' : getEventTypeBgColor(event.eventType)
          }`}>
            <EventTypeIcon
              type={event.eventType}
              className={`w-5 h-5 ${isPast ? 'text-gray-400' : getEventTypeColor(event.eventType)}`}
            />
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-semibold ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                {event.title}
              </h4>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatEventDateTime(event.dateTime)}</span>
              {event.durationMinutes && (
                <span className="text-gray-400">({event.durationMinutes} min)</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {event.location.isVirtual ? (
                  <>Virtual{event.location.virtualLink && <span className="text-rstu-red"> (link available)</span>}</>
                ) : (
                  event.location.name
                )}
              </span>
            </div>

            {event.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {/* Attendee Count */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {counts.yes} going
          </span>
          {counts.maybe > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              {counts.maybe} maybe
            </span>
          )}
          <span className="text-gray-400">
            Organized by {event.createdByName}
          </span>
        </div>
      </div>

      {/* RSVP Footer - only show for upcoming events */}
      {!isPast && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">Your RSVP:</span>
            {(['yes', 'no', 'maybe'] as RsvpStatus[]).map(status => {
              const isSelected = currentRsvp?.status === status;
              const buttonClasses = {
                yes: isSelected ? 'bg-green-100 text-green-700 border-green-300' : 'hover:bg-green-50 hover:border-green-200',
                no: isSelected ? 'bg-red-100 text-red-700 border-red-300' : 'hover:bg-red-50 hover:border-red-200',
                maybe: isSelected ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'hover:bg-yellow-50 hover:border-yellow-200',
              };

              return (
                <button
                  key={status}
                  onClick={() => handleRsvp(status)}
                  disabled={isRsvping}
                  className={`px-3 py-1.5 text-xs font-medium rounded border border-gray-200 transition-colors ${buttonClasses[status]} ${isRsvping ? 'opacity-50' : ''}`}
                >
                  {status === 'yes' ? 'Yes' : status === 'no' ? 'No' : 'Maybe'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Meeting Notes indicator for completed events */}
      {event.notes && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View meeting notes
          </button>
        </div>
      )}
    </div>
  );
}
