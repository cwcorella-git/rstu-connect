'use client'

import { useState } from 'react';
import { BuildingEvent } from '@/lib/storage/eventStorage';
import { EventCard } from './EventCard';

interface EventListProps {
  events: BuildingEvent[];
  title: string;
  buildingId: string;
  onRefresh: () => void;
  collapsed?: boolean;
}

export function EventList({
  events,
  title,
  buildingId,
  onRefresh,
  collapsed = false
}: EventListProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  if (events.length === 0) return null;

  return (
    <div>
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left mb-2"
      >
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-400">({events.length})</span>
      </button>

      {/* Event Cards */}
      {isExpanded && (
        <div className="space-y-3">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              buildingId={buildingId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
