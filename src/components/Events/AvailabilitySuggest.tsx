'use client'

import { useMemo } from 'react';
import { suggestMeetingTimes, formatTimeSlot, TimeSlot, getAggregatedAvailability } from '@/lib/availabilityUtils';

interface AvailabilitySuggestProps {
  buildingId: string;
  onSelectSlot: (slot: TimeSlot) => void;
}

export function AvailabilitySuggest({ buildingId, onSelectSlot }: AvailabilitySuggestProps) {
  // Get suggested time slots
  const suggestions = useMemo(() => {
    return suggestMeetingTimes(buildingId, 5);
  }, [buildingId]);

  // Get aggregated availability info
  const availability = useMemo(() => {
    return getAggregatedAvailability(buildingId);
  }, [buildingId]);

  // Calculate max score for bar width
  const maxScore = Math.max(...suggestions.map(s => s.score), 1);

  // If no availability data, show default message
  const hasAvailabilityData = availability.totalPeople > 0;

  return (
    <div className="space-y-3">
      {/* Info Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {hasAvailabilityData ? (
          <span>Based on availability data from {availability.totalPeople} tenant{availability.totalPeople !== 1 ? 's' : ''}</span>
        ) : (
          <span>Default suggestions (no availability data yet)</span>
        )}
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-2">
        {suggestions.map((slot, index) => {
          const barWidth = hasAvailabilityData
            ? Math.max(20, (slot.score / maxScore) * 100)
            : 60;

          return (
            <button
              key={`${slot.day}-${slot.hour}-${index}`}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-left group"
            >
              {/* Radio circle */}
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-rstu-red flex-shrink-0" />

              {/* Time info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">
                    {formatTimeSlot(slot)}
                  </span>
                  {hasAvailabilityData && slot.availableCount > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      {slot.availableCount} available
                    </span>
                  )}
                </div>

                {/* Score bar */}
                {hasAvailabilityData && (
                  <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                )}

                {/* Conflict warning */}
                {slot.conflictCount > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {slot.conflictCount} may have conflicts
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary of popular times */}
      {hasAvailabilityData && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <p className="font-medium mb-1">Most popular times:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(availability.dayScores)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .filter(([, score]) => score > 0)
              .map(([day, score]) => (
                <span key={day} className="px-2 py-0.5 bg-blue-100 rounded">
                  {day}
                </span>
              ))}
            {Object.entries(availability.timeScores)
              .sort(([, a], [, b]) => b - a)
              .filter(([, score]) => score > 0)
              .slice(0, 2)
              .map(([time, score]) => (
                <span key={time} className="px-2 py-0.5 bg-blue-100 rounded capitalize">
                  {time}s
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
