'use client'

import { useState, useMemo, useCallback } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { EventCalendar } from '../Events/EventCalendar';
import { EventCreator } from '../Events/EventCreator';
import { EventEditor } from '../Events/EventEditor';
import {
  getUpcomingEvents,
  getPastEvents,
  BuildingEvent,
  deleteEvent,
} from '@/lib/eventStorage';
import { generateICalendarMultiple, downloadICalendar as downloadICalendarFile } from '@/lib/icalGenerator';

interface PropertyEventsTabProps {
  building: EnhancedBuilding;
  chatSlug: string;
  linkedGroup: LinkedPropertyGroup | null;
}

export function PropertyEventsTab({ building, chatSlug, linkedGroup }: PropertyEventsTabProps) {
  const { t } = useLanguage();
  const [showCreator, setShowCreator] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BuildingEvent | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get ALL events (upcoming + past) for calendar display
  const allEvents = useMemo(() => {
    const upcoming = getUpcomingEvents(chatSlug);
    const past = getPastEvents(chatSlug);
    return [...upcoming, ...past];
  }, [chatSlug, refreshKey]);

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

  // Handle editing an event
  const handleEditEvent = useCallback((event: BuildingEvent) => {
    setEditingEvent(event);
    setShowEditor(true);
  }, []);

  // Handle event editor completed
  const handleEventUpdated = useCallback((event: BuildingEvent) => {
    setShowEditor(false);
    setEditingEvent(null);
    handleRefresh();
  }, [handleRefresh]);

  // Handle closing the editor
  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
    setEditingEvent(null);
  }, []);

  // Handle deleting an event
  const handleDeleteEvent = useCallback((event: BuildingEvent) => {
    deleteEvent(event.id);
    handleRefresh();
  }, [handleRefresh]);

  // Handle exporting events to iCalendar format
  const handleExportEvents = useCallback(() => {
    if (allEvents.length === 0) {
      alert('No events to export');
      return;
    }

    try {
      const icalContent = generateICalendarMultiple(allEvents);
      const blob = new Blob([icalContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with building address and date
      const buildingName = building.address.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${buildingName}_events_${dateStr}.ics`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting events:', error);
      alert('Failed to export events');
    }
  }, [allEvents, building.address]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Linked group banner */}
      {linkedGroup && (
        <div className="bg-orange-50 border-b border-orange-200 px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-xs text-orange-700">
            {t('events.sharedAcross') || 'Shared across'} <strong>{linkedGroup.name}</strong>
          </span>
        </div>
      )}

      {/* Export toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-end gap-2 flex-shrink-0">
        <button
          onClick={handleExportEvents}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
          title="Export all events to calendar file (.ics)"
        >
          📥 Export to Calendar
        </button>
      </div>

      {/* Calendar View */}
      <EventCalendar
        buildingId={chatSlug}
        buildingAddress={building.address}
        events={allEvents}
        onRefresh={handleRefresh}
        onCreateEvent={handleCreateEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
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

      {/* Event Editor Modal */}
      {showEditor && editingEvent && (
        <EventEditor
          event={editingEvent}
          buildingId={chatSlug}
          onClose={handleCloseEditor}
          onUpdated={handleEventUpdated}
        />
      )}
    </div>
  );
}
