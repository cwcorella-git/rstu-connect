'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BuildingEvent,
  EventType,
  createEvent,
  getEventTypeLabel,
  getEventTypeIcon,
} from '@/lib/eventStorage';
import { getCurrentProfile } from '@/lib/profileStorage';

interface EventCreatorProps {
  buildingId: string;
  buildingAddress: string;
  groupId?: string;
  isGroupWide: boolean;
  preselectedDate?: Date;
  onClose: () => void;
  onCreated: (event: BuildingEvent) => void;
}

const EVENT_TYPES: EventType[] = ['custom', 'meeting', 'workshop', 'action', 'committee', 'intake', 'social', 'other'];

// Helper: format date for datetime-local input
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EventCreator({
  buildingId,
  buildingAddress,
  groupId,
  isGroupWide,
  preselectedDate,
  onClose,
  onCreated
}: EventCreatorProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Pre-fill date/time if date is provided (default to 6 PM)
  const getInitialDateTime = () => {
    if (preselectedDate) {
      const date = new Date(preselectedDate);
      date.setHours(18, 0, 0, 0);
      return formatDateTimeLocal(date);
    }
    // Default to today at 6 PM if no date provided
    const today = new Date();
    today.setHours(18, 0, 0, 0);
    return formatDateTimeLocal(today);
  };

  // Form state
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('custom');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(getInitialDateTime);
  const [duration, setDuration] = useState(60);
  const [locationName, setLocationName] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get profile for creator info
  const profile = useMemo(() => getCurrentProfile(), []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Please enter an event title');
      return;
    }
    if (!dateTime) {
      setError('Please select a date and time');
      return;
    }
    if (!isVirtual && !locationName.trim()) {
      setError('Please enter a location or mark as virtual');
      return;
    }
    if (!profile) {
      setError('Please create a profile first');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventDateTime = new Date(dateTime).getTime();

      const event = createEvent({
        buildingId,
        buildingAddress,
        groupId,
        isGroupWide,
        title: title.trim(),
        description: description.trim() || undefined,
        eventType,
        status: 'confirmed',
        dateTime: eventDateTime,
        durationMinutes: duration,
        location: {
          name: isVirtual ? 'Virtual Meeting' : locationName.trim(),
          isVirtual,
          virtualLink: isVirtual && virtualLink.trim() ? virtualLink.trim() : undefined,
        },
        createdBy: profile.id,
        createdByName: profile.nickname || 'Anonymous',
      });

      onCreated(event);
    } catch (err) {
      setError('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-event-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <h2 id="create-event-title" className="text-lg font-semibold text-gray-900">
              Create Event
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Tenant Meeting"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                autoFocus
              />
            </div>

            {/* Date/Time and Duration - side by side */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="datetime"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                >
                  <option value={30}>30 min</option>
                  <option value={60}>1 hr</option>
                  <option value={90}>1.5 hr</option>
                  <option value={120}>2 hr</option>
                </select>
              </div>
            </div>

            {/* Location - inline toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={e => setIsVirtual(e.target.checked)}
                    className="rounded text-rstu-red focus:ring-rstu-red"
                  />
                  Virtual
                </label>
              </div>
              {!isVirtual ? (
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="e.g., Community Room, Lobby"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                />
              ) : (
                <input
                  type="url"
                  value={virtualLink}
                  onChange={e => setVirtualLink(e.target.value)}
                  placeholder="Meeting link (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* Event Type - simple dropdown */}
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={e => setEventType(e.target.value as EventType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {getEventTypeIcon(type)} {getEventTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description - collapsed by default */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Additional details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-rstu-red hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
