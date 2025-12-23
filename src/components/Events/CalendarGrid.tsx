'use client'

import { useMemo } from 'react';
import { BuildingEvent } from '@/lib/eventStorage';
import { CalendarDay } from './CalendarDay';
import { getDateKey } from './EventCalendar';

interface CalendarGridProps {
  days: Date[];
  currentMonth: Date;
  eventsByDay: Map<string, BuildingEvent[]>;
  selectedDay: Date | null;
  onDayClick: (day: Date) => void;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_LABELS_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  days,
  currentMonth,
  eventsByDay,
  selectedDay,
  onDayClick
}: CalendarGridProps) {
  const today = useMemo(() => new Date(), []);

  // Calculate number of rows (weeks)
  const numWeeks = Math.ceil(days.length / 7);

  return (
    <div className="h-full flex flex-col">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-px border-b border-gray-200 pb-1 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label + i}
            className="text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase"
            title={WEEKDAY_LABELS_LONG[i]}
          >
            <span className="sm:hidden">{label}</span>
            <span className="hidden sm:inline">{WEEKDAY_LABELS_LONG[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Days Grid - fills available space */}
      <div
        className="flex-1 grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden"
        style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}
      >
        {days.map((day, index) => {
          const key = getDateKey(day);
          const events = eventsByDay.get(key) || [];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = selectedDay?.toDateString() === day.toDateString();

          return (
            <CalendarDay
              key={index}
              date={day}
              events={events}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              onClick={() => onDayClick(day)}
            />
          );
        })}
      </div>
    </div>
  );
}
