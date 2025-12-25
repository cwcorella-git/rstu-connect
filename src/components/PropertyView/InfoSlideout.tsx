'use client'

import { useEffect, useRef } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { PropertyInfoTab } from './PropertyInfoTab';

interface InfoSlideoutProps {
  building: EnhancedBuilding;
  linkedBuildings?: EnhancedBuilding[];
  onSelectBuilding?: (building: EnhancedBuilding) => void;
  allBuildings?: EnhancedBuilding[];
  onSelectBuildingWithChat?: (building: EnhancedBuilding) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function InfoSlideout({
  building,
  linkedBuildings,
  onSelectBuilding,
  allBuildings,
  onSelectBuildingWithChat,
  isOpen,
  onClose
}: InfoSlideoutProps) {
  const slideoutRef = useRef<HTMLDivElement>(null);

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
      if (slideoutRef.current && !slideoutRef.current.contains(e.target as Node)) {
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

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Slideout Panel */}
      <div
        ref={slideoutRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Property Information"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {building.propertyName || building.address}
            </h2>
            {building.propertyName && (
              <p className="text-sm text-gray-600 truncate">{building.address}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Close property info"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - PropertyInfoTab without its own header */}
        <div className="flex-1 overflow-hidden">
          <PropertyInfoTab
            building={building}
            linkedBuildings={linkedBuildings}
            onSelectBuilding={onSelectBuilding}
            allBuildings={allBuildings}
            onSelectBuildingWithChat={onSelectBuildingWithChat}
          />
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
