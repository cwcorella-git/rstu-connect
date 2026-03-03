'use client'

import { SectionTypePicker } from './SectionTypePicker'

interface EmptyPageStateProps {
  onAddSection: (type: string) => void
}

export function EmptyPageState({ onAddSection }: EmptyPageStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Page</h2>
        <p className="text-gray-500 mb-8">Choose a section to get started</p>

        <SectionTypePicker mode="inline" onSelect={onAddSection} />
      </div>
    </div>
  )
}
