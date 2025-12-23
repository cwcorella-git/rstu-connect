'use client'

import { useState, useMemo } from 'react';
import { BuildingEvent, EventType } from '@/lib/eventStorage';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailPanel } from './DayDetailPanel';

interface EventCalendarProps {
  buildingId: string;
  events: BuildingEvent[];
  onRefresh: () => void;
  onCreateEvent: (preselectedDate?: Date) => void;
}

// Helper: Get all days to display in a month grid (includes prev/next month padding)
function getCalendarDays(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // First day of the month
  const firstDay = new Date(year, monthIndex, 1);
  // Last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0);

  // Start from Sunday of the week containing the first day
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // End on Saturday of the week containing the last day
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const days: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

// Helper: Group events by date key for calendar lookup
function groupEventsByDay(events: BuildingEvent[]): Map<string, BuildingEvent[]> {
  const map = new Map<string, BuildingEvent[]>();

  events.forEach(event => {
    const date = new Date(event.dateTime);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(event);
  });

  // Sort events within each day by time
  map.forEach((dayEvents) => {
    dayEvents.sort((a, b) => a.dateTime - b.dateTime);
  });

  return map;
}

// Helper: Get dot color class for event type
export function getEventDotColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    meeting: 'bg-blue-500',
    action: 'bg-rstu-red',
    workshop: 'bg-purple-500',
    committee: 'bg-green-500',
    social: 'bg-yellow-500',
    intake: 'bg-gray-400',
    other: 'bg-gray-400',
  };
  return colors[type];
}

// Helper: Get date key string
export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function EventCalendar({
  buildingId,
  events,
  onRefresh,
  onCreateEvent
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Get calendar days for current month
  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  // Group events by day
  const eventsByDay = useMemo(() => groupEventsByDay(events), [events]);

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  // Handle close day panel
  const handleCloseDayPanel = () => {
    setSelectedDay(null);
  };

  // Handle create event from day panel
  const handleCreateEventForDay = () => {
    if (selectedDay) {
      onCreateEvent(selectedDay);
      setSelectedDay(null);
    }
  };

  // Get events for selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const key = getDateKey(selectedDay);
    return eventsByDay.get(key) || [];
  }, [selectedDay, eventsByDay]);

  // Format month/year for header
  const monthYearLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Check if we're viewing current month
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 flex-shrink-0">
        {/* Month Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-sm sm:text-base font-semibold text-gray-900 min-w-[120px] sm:min-w-[140px] text-center">
            {monthYearLabel}
          </h2>

          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next month"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => onCreateEvent()}
            className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm font-medium text-white bg-rstu-red rounded hover:bg-red-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden p-1.5 sm:p-2">
        <CalendarGrid
          days={calendarDays}
          currentMonth={currentMonth}
          eventsByDay={eventsByDay}
          selectedDay={selectedDay}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Day Detail Panel */}
      <DayDetailPanel
        date={selectedDay}
        events={selectedDayEvents}
        buildingId={buildingId}
        isOpen={!!selectedDay}
        onClose={handleCloseDayPanel}
        onRefresh={onRefresh}
        onCreateEvent={handleCreateEventForDay}
      />
    </div>
  );
}
