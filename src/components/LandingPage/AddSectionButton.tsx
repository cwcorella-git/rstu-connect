'use client'

import { useState } from 'react'
import { SectionTypePicker } from './SectionTypePicker'

interface AddSectionButtonProps {
  onAdd: (type: string) => void
}

export function AddSectionButton({ onAdd }: AddSectionButtonProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="relative flex items-center justify-center py-1">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-dashed border-gray-300 rounded-full hover:border-blue-400 hover:text-blue-500 transition-colors bg-white"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-56 max-h-80 overflow-y-auto">
            <SectionTypePicker
              mode="popover"
              onSelect={(type) => { onAdd(type); setShowPicker(false) }}
            />
          </div>
        </>
      )}
    </div>
  )
}
