'use client'

import { BuildingEvent } from '@/lib/eventStorage';
import { getEventDotColor } from './EventCalendar';

interface CalendarDayProps {
  date: Date;
  events: BuildingEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function CalendarDay({
  date,
  events,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick
}: CalendarDayProps) {
  // Filter out cancelled events for display
  const activeEvents = events.filter(e => e.status !== 'cancelled');

  // Determine background and text colors
  const getBgClass = () => {
    if (isSelected) return 'bg-red-50';
    if (!isCurrentMonth) return 'bg-gray-50';
    return 'bg-white';
  };

  const getTextClass = () => {
    if (!isCurrentMonth) return 'text-gray-400';
    return 'text-gray-900';
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getBgClass()}
        p-1 sm:p-2
        min-h-[60px] sm:min-h-[80px]
        flex flex-col
        hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rstu-red
        ${isSelected ? 'ring-2 ring-inset ring-rstu-red' : ''}
      `}
      aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${activeEvents.length > 0 ? `, ${activeEvents.length} event${activeEvents.length > 1 ? 's' : ''}` : ''}`}
    >
      {/* Day Number */}
      <div className="flex items-center justify-center sm:justify-start mb-1">
        <span
          className={`
            ${getTextClass()}
            text-sm font-medium
            ${isToday ? 'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-rstu-red text-white' : ''}
          `}
        >
          {date.getDate()}
        </span>
      </div>

      {/* Event Dots */}
      {activeEvents.length > 0 && (
        <div className="flex flex-wrap gap-0.5 justify-center sm:justify-start mt-auto">
          {activeEvents.slice(0, 3).map((event, i) => (
            <span
              key={event.id || i}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getEventDotColor(event.eventType)}`}
              title={event.title}
            />
          ))}
          {activeEvents.length > 3 && (
            <span className="text-[10px] text-gray-500 ml-0.5">
              +{activeEvents.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
