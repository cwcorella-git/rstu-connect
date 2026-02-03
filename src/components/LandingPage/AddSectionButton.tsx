'use client'

import { useState } from 'react'
import { SECTION_TYPES } from '@/lib/landingPageStorage'

interface AddSectionButtonProps {
  onAdd: (type: string) => void
}

export function AddSectionButton({ onAdd }: AddSectionButtonProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="relative flex items-center justify-center py-1">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-400 border border-dashed border-gray-300 rounded-full hover:border-blue-400 hover:text-blue-500 transition-colors bg-white"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 max-h-64 overflow-y-auto">
            {SECTION_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setShowPicker(false) }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
