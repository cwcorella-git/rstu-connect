'use client'

import { useState, useMemo, useCallback } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';
import { EventCalendar } from '../Events/EventCalendar';
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
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Get ALL events (upcoming + past) for calendar display
  const allEvents = useMemo(() => {
    const upcoming = getUpcomingEvents(chatSlug);
    const past = getPastEvents(chatSlug);
    return [...upcoming, ...past];
  }, [chatSlug, refreshKey]);

  // Building info for calendar header
  const buildingInfo = useMemo(() => ({
    units: building.units,
    yearBuilt: building.yearBuilt,
  }), [building.units, building.yearBuilt]);

  // Refresh events after changes
  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Handle creating an event (optionally with preselected date)
  const handleCreateEvent = useCallback((date?: Date) => {
    setPreselectedDate(date);
    setShowCreator(true);
  }, []);

  // Handle event creation completed
  const handleEventCreated = useCallback((event: BuildingEvent) => {
    setShowCreator(false);
    setPreselectedDate(undefined);
    handleRefresh();
  }, [handleRefresh]);

  // Handle closing the creator
  const handleCloseCreator = useCallback(() => {
    setShowCreator(false);
    setPreselectedDate(undefined);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Linked group banner */}
      {linkedGroup && (
        <div className="bg-orange-50 border-b border-orange-200 px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-xs text-orange-700">
            Shared across <strong>{linkedGroup.name}</strong>
          </span>
        </div>
      )}

      {/* Calendar View */}
      <EventCalendar
        buildingId={chatSlug}
        events={allEvents}
        buildingInfo={buildingInfo}
        onRefresh={handleRefresh}
        onCreateEvent={handleCreateEvent}
      />

      {/* Event Creator Modal */}
      {showCreator && (
        <EventCreator
          buildingId={chatSlug}
          buildingAddress={building.address}
          groupId={linkedGroup?.id}
          isGroupWide={!!linkedGroup}
          preselectedDate={preselectedDate}
          onClose={handleCloseCreator}
          onCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
