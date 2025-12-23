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
    if (isToday) return 'text-rstu-red font-bold';
    if (!isCurrentMonth) return 'text-gray-400';
    return 'text-gray-900';
  };

  // Today gets a red box outline around the entire cell
  const getTodayClass = () => {
    if (isToday) return 'ring-2 ring-inset ring-rstu-red';
    return '';
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getBgClass()}
        ${getTodayClass()}
        p-0.5 sm:p-1
        flex flex-col items-center justify-start
        hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
        ${isSelected && !isToday ? 'ring-2 ring-inset ring-gray-400' : ''}
      `}
      aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${isToday ? ' (today)' : ''}${activeEvents.length > 0 ? `, ${activeEvents.length} event${activeEvents.length > 1 ? 's' : ''}` : ''}`}
    >
      {/* Day Number */}
      <span
        className={`
          ${getTextClass()}
          text-xs sm:text-sm leading-none py-0.5
        `}
      >
        {date.getDate()}
      </span>

      {/* Event Dots */}
      {activeEvents.length > 0 && (
        <div className="flex flex-wrap gap-px justify-center mt-0.5">
          {activeEvents.slice(0, 3).map((event, i) => (
            <span
              key={event.id || i}
              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getEventDotColor(event.eventType)}`}
            />
          ))}
          {activeEvents.length > 3 && (
            <span className="text-[8px] sm:text-[10px] text-gray-500 leading-none">
              +{activeEvents.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
