'use client'

import { useEffect, useRef, useState } from 'react';
import { BuildingEvent } from '@/lib/eventStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { EventCard } from './EventCard';
import { ProposedEventCard } from './ProposedEventCard';
import { DayEventForm } from './DayEventForm';

interface DayDetailPanelProps {
  date: Date | null;
  events: BuildingEvent[];
  buildingId: string;
  buildingAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCreateEvent?: () => void;  // Deprecated - now handled internally
  onEditEvent?: (event: BuildingEvent) => void;
  onDeleteEvent?: (event: BuildingEvent) => void;
}

export function DayDetailPanel({
  date,
  events,
  buildingId,
  buildingAddress,
  isOpen,
  onClose,
  onRefresh,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent
}: DayDetailPanelProps) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Delay to prevent immediate close on open click
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !date) return null;

  // Format date for display
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Check if this is today
  const isToday = date.toDateString() === new Date().toDateString();

  // Check if this is in the past
  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));

  // Filter events by status
  const proposedEvents = events.filter(e => e.status === 'proposed');
  const confirmedEvents = events.filter(e => e.status === 'confirmed');
  const cancelledEvents = events.filter(e => e.status === 'cancelled');
  const hasAnyEvents = proposedEvents.length + confirmedEvents.length + cancelledEvents.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Panel - Right slideout on desktop, bottom sheet on mobile */}
      <div
        ref={panelRef}
        className="fixed z-50 bg-white shadow-xl flex flex-col
          right-0 top-0 h-full w-full max-w-md
          md:animate-slide-in-right
          animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label={`Events for ${dateLabel}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-gray-900">
              {isToday ? (t('calendar.today') || 'Today') : dateLabel}
            </h2>
            {isToday && (
              <p className="text-sm text-gray-500">{dateLabel}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Events and Create Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Events Section */}
          {hasAnyEvents && (
            <div className="space-y-3">
              {/* Proposed Events Section */}
              {proposedEvents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                    {t('events.needsYourVote') || 'Needs Your Vote'} ({proposedEvents.length})
                  </h3>
                  <div className="space-y-3">
                    {proposedEvents.map(event => (
                      <ProposedEventCard
                        key={event.id}
                        event={event}
                        buildingId={buildingId}
                        onRefresh={onRefresh}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmed Events Section */}
              {confirmedEvents.length > 0 && (
                <div>
                  {proposedEvents.length > 0 && (
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 mt-4">
                      {t('events.confirmedEvents') || 'Confirmed Events'}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {confirmedEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        buildingId={buildingId}
                        onRefresh={onRefresh}
                        showActions={true}
                        onEdit={onEditEvent}
                        onDelete={onDeleteEvent}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled events (collapsed) */}
              {cancelledEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    {t('events.cancelled') || 'Cancelled'} ({cancelledEvents.length})
                  </p>
                  {cancelledEvents.map(event => (
                    <div key={event.id} className="py-2 opacity-50">
                      <p className="text-sm text-gray-500 line-through">{event.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!hasAnyEvents && !showCreateForm && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {t('events.noEventsScheduled') || 'No events scheduled for this day'}
              </p>
            </div>
          )}

          {/* Create Event Form - inline in panel */}
          {!isPastDate && showCreateForm && date && (
            <DayEventForm
              date={date}
              buildingId={buildingId}
              buildingAddress={buildingAddress}
              onCreated={(event) => {
                setShowCreateForm(false)
                onRefresh()
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {/* Create Event Button - toggle form visibility */}
          {!isPastDate && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-rstu-red rounded-md hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('events.createEvent') || 'Create Event'}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
