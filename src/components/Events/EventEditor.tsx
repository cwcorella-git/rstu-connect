'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BuildingEvent,
  EventType,
  updateEvent,
  getEventTypeLabel,
  getEventTypeIcon,
} from '@/lib/eventStorage';
import { getCurrentProfile } from '@/lib/profileStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { AvailabilitySuggest } from './AvailabilitySuggest';
import type { TimeSlot } from '@/lib/availabilityUtils';

interface EventEditorProps {
  event: BuildingEvent;
  buildingId: string;
  onClose: () => void;
  onUpdated: (event: BuildingEvent) => void;
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

// Helper: convert TimeSlot to next occurrence date
function getNextOccurrenceOfSlot(slot: TimeSlot): Date {
  const today = new Date();
  const targetDay = slot.dayIndex; // 0-6, 0 = Sunday
  const targetHour = slot.hour;
  const targetMinute = slot.minute;

  // Calculate days ahead to reach target day of week
  let daysAhead = targetDay - today.getDay();

  // If same day but time has already passed, add 7 days
  if (daysAhead === 0) {
    const slotTime = targetHour * 60 + targetMinute;
    const nowTime = today.getHours() * 60 + today.getMinutes();
    if (slotTime <= nowTime) daysAhead = 7;
  } else if (daysAhead < 0) {
    daysAhead += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() + daysAhead);
  result.setHours(targetHour, targetMinute, 0, 0);

  return result;
}

export function EventEditor({
  event,
  buildingId,
  onClose,
  onUpdated
}: EventEditorProps) {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state - pre-fill from existing event
  const [title, setTitle] = useState(event.title);
  const [eventType, setEventType] = useState<EventType>(event.eventType);
  const [description, setDescription] = useState(event.description || '');
  const [dateTime, setDateTime] = useState(formatDateTimeLocal(new Date(event.dateTime)));
  const [duration, setDuration] = useState(event.durationMinutes || 60);
  const [locationName, setLocationName] = useState(event.location.name === 'Virtual Meeting' ? '' : event.location.name);
  const [isVirtual, setIsVirtual] = useState(event.location.isVirtual);
  const [virtualLink, setVirtualLink] = useState(event.location.virtualLink || '');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTimeSuggestions, setShowTimeSuggestions] = useState(false);

  // Get profile for creator info
  const profile = useMemo(() => getCurrentProfile(), []);

  // Handler: convert TimeSlot to datetime and fill form
  const handleSlotSelect = (slot: TimeSlot) => {
    const slotDate = getNextOccurrenceOfSlot(slot);
    const formatted = formatDateTimeLocal(slotDate);
    setDateTime(formatted);
    setShowTimeSuggestions(false);
  };

  // Auto-expand suggestions for meeting type
  useEffect(() => {
    if (eventType === 'meeting') {
      setShowTimeSuggestions(true);
    } else {
      setShowTimeSuggestions(false);
    }
  }, [eventType]);

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
      setError(t('events.titleRequired') || 'Please enter an event title');
      return;
    }
    if (!description.trim()) {
      setError(t('events.descriptionRequired') || 'Please enter a description for the event');
      return;
    }
    if (!dateTime) {
      setError(t('events.dateTimeRequired') || 'Please select a date and time');
      return;
    }
    if (!isVirtual && !locationName.trim()) {
      setError(t('events.locationRequired') || 'Please enter a location or mark as virtual');
      return;
    }

    setIsSubmitting(true);

    try {
      const eventDateTime = new Date(dateTime).getTime();

      // Update event data
      const updated = updateEvent(event.id, {
        title: title.trim(),
        description: description.trim(),
        eventType,
        dateTime: eventDateTime,
        durationMinutes: duration,
        location: {
          name: isVirtual ? t('events.virtualMeeting') : locationName.trim(),
          isVirtual,
          virtualLink: isVirtual && virtualLink.trim() ? virtualLink.trim() : undefined,
        },
      });

      if (updated) {
        onUpdated(updated);
      } else {
        setError(t('events.updateFailed'));
      }
    } catch (err) {
      setError(t('events.updateFailedRetry'));
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
          aria-labelledby="edit-event-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <h2 id="edit-event-title" className="text-lg font-semibold text-gray-900">
              {t('events.editEvent') || 'Edit Event'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={t('common.close')}
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
                {t('events.eventTitle') || 'Event Title'}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('events.eventTitlePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                autoFocus
              />
            </div>

            {/* Smart Time Suggestions */}
            {eventType === 'meeting' && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowTimeSuggestions(!showTimeSuggestions)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>{t('events.suggestOptimalMeetingTime') || 'Suggest optimal meeting time'}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showTimeSuggestions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {showTimeSuggestions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <AvailabilitySuggest
                      buildingId={buildingId}
                      onSelectSlot={handleSlotSelect}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Date/Time and Duration - side by side */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('events.dateAndTime') || 'Date & Time'}
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
                  {t('events.duration') || 'Duration'}
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                >
                  <option value={30}>{t('events.duration30') || '30 min'}</option>
                  <option value={60}>{t('events.duration60') || '1 hr'}</option>
                  <option value={90}>{t('events.duration90') || '1.5 hr'}</option>
                  <option value={120}>{t('events.duration120') || '2 hr'}</option>
                </select>
              </div>
            </div>

            {/* Location - inline toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {t('events.location') || 'Location'}
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={e => setIsVirtual(e.target.checked)}
                    className="rounded text-rstu-red focus:ring-rstu-red"
                  />
                  {t('events.virtual') || 'Virtual'}
                </label>
              </div>
              {!isVirtual ? (
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder={t('events.locationPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                />
              ) : (
                <input
                  type="url"
                  value={virtualLink}
                  onChange={e => setVirtualLink(e.target.value)}
                  placeholder={t('events.meetingLinkPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* Event Type - simple dropdown */}
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                {t('events.type') || 'Type'} <span className="text-gray-400 font-normal">({t('common.optional') || 'optional'})</span>
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

            {/* Description - REQUIRED */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('events.description') || 'Description'} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder={t('events.descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length} / 500 {t('common.characters')}</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-rstu-red hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (t('events.saving') || 'Saving...') : (t('common.save') || 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
