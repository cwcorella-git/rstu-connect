'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BuildingEvent,
  EventType,
  createEvent,
  getEventTypeLabel,
  getEventTypeIcon,
  formatEventForChat,
} from '@/lib/eventStorage';
import { getCurrentProfile } from '@/lib/profileStorage';
import { AvailabilitySuggest } from './AvailabilitySuggest';
import { TimeSlot, getNextSlotDate } from '@/lib/availabilityUtils';

interface EventCreatorProps {
  buildingId: string;
  buildingAddress: string;
  groupId?: string;
  isGroupWide: boolean;
  onClose: () => void;
  onCreated: (event: BuildingEvent) => void;
}

const EVENT_TYPES: EventType[] = ['meeting', 'workshop', 'action', 'committee', 'intake', 'social', 'other'];

export function EventCreator({
  buildingId,
  buildingAddress,
  groupId,
  isGroupWide,
  onClose,
  onCreated
}: EventCreatorProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('meeting');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [locationName, setLocationName] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState('');

  // UI state
  const [showSuggestions, setShowSuggestions] = useState(true);
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

  // Handle selecting a suggested time
  const handleSelectSuggestion = (slot: TimeSlot) => {
    const date = getNextSlotDate(slot);
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    setDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    setShowSuggestions(false);
  };

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
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-event-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
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
                placeholder="e.g., Tenant Meeting, Know Your Rights Workshop"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      eventType === type
                        ? 'bg-rstu-red text-white border-rstu-red'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span>{getEventTypeIcon(type)}</span>
                    <span>{getEventTypeLabel(type)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="What will be discussed or what should attendees know?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
              />
            </div>

            {/* Date/Time Suggestions */}
            {showSuggestions && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Suggested Times
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Pick manually
                  </button>
                </div>
                <AvailabilitySuggest
                  buildingId={buildingId}
                  onSelectSlot={handleSelectSuggestion}
                />
              </div>
            )}

            {/* Manual Date/Time */}
            {!showSuggestions && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
                      Date & Time
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(true)}
                      className="text-xs text-rstu-red hover:text-red-700"
                    >
                      Show suggestions
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    id="datetime"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isVirtual}
                    onChange={() => setIsVirtual(false)}
                    className="text-rstu-red focus:ring-rstu-red"
                  />
                  <span className="text-sm text-gray-700">In Person</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isVirtual}
                    onChange={() => setIsVirtual(true)}
                    className="text-rstu-red focus:ring-rstu-red"
                  />
                  <span className="text-sm text-gray-700">Virtual</span>
                </label>
              </div>

              {!isVirtual ? (
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="e.g., Community Room, Clubhouse, Park"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              ) : (
                <input
                  type="url"
                  value={virtualLink}
                  onChange={e => setVirtualLink(e.target.value)}
                  placeholder="Meeting link (optional, can add later)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
