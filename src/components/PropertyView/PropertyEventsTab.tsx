'use client'

import { useState, useMemo, useCallback } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';
import { EventList } from '../Events/EventList';
import { EventCreator } from '../Events/EventCreator';
import {
  getUpcomingEvents,
  getPastEvents,
  BuildingEvent,
} from '@/lib/eventStorage';

interface PropertyEventsTabProps {
  building: EnhancedBuilding;
  chatSlug: string;
  linkedGroup: LinkedPropertyGroup | null;
}

export function PropertyEventsTab({ building, chatSlug, linkedGroup }: PropertyEventsTabProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get events for this building/group
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(chatSlug);
  }, [chatSlug, refreshKey]);

  const pastEvents = useMemo(() => {
    return getPastEvents(chatSlug);
  }, [chatSlug, refreshKey]);

  // Refresh events after changes
  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Handle event creation
  const handleEventCreated = useCallback((event: BuildingEvent) => {
    setShowCreator(false);
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Header with Create button */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div>
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
          {linkedGroup && (
            <p className="text-xs text-orange-600 mt-0.5">
              Shared across {linkedGroup.name}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-rstu-red rounded-md hover:bg-red-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Events Content */}
      <div className="flex-1 overflow-y-auto">
        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-1">No events yet</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-xs">
              Create your first event to start organizing with your neighbors.
            </p>
            <button
              onClick={() => setShowCreator(true)}
              className="px-4 py-2 text-sm font-medium text-rstu-red border border-rstu-red rounded-md hover:bg-red-50 transition-colors"
            >
              Create First Event
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <EventList
                events={upcomingEvents}
                title="Upcoming"
                buildingId={chatSlug}
                onRefresh={handleRefresh}
              />
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <EventList
                events={pastEvents}
                title="Past Events"
                buildingId={chatSlug}
                onRefresh={handleRefresh}
                collapsed
              />
            )}
          </div>
        )}
      </div>

      {/* Event Creator Modal */}
      {showCreator && (
        <EventCreator
          buildingId={chatSlug}
          buildingAddress={building.address}
          groupId={linkedGroup?.id}
          isGroupWide={!!linkedGroup}
          onClose={() => setShowCreator(false)}
          onCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
