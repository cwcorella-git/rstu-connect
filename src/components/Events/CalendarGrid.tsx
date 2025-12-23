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

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  days,
  currentMonth,
  eventsByDay,
  selectedDay,
  onDayClick
}: CalendarGridProps) {
  const today = useMemo(() => new Date(), []);

  return (
    <div className="h-full flex flex-col">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {WEEKDAY_LABELS.map(label => (
          <div
            key={label}
            className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
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
