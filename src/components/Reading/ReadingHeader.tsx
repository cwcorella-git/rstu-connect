'use client'

import type { ReadingDocument } from '@/lib/getReadingData';

interface ReadingHeaderProps {
  document: ReadingDocument;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function ReadingHeader({ document, showBackButton, onBack }: ReadingHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to document list"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {document.title}
          </h2>
        </div>
      </div>
    </div>
  );
}
