'use client'

interface SectionControlsProps {
  index: number
  total: number
  sectionType: string
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onOpenSettings?: () => void
  settingsOpen?: boolean
}

export function SectionControls({ index, total, sectionType, onMoveUp, onMoveDown, onRemove, onOpenSettings, settingsOpen }: SectionControlsProps) {
  return (
    <div className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-white/90 rounded-lg shadow-sm border border-gray-200 px-1.5 py-1">
      <span className="text-[10px] text-gray-400 px-1 font-mono">{sectionType}</span>
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className={`w-6 h-6 flex items-center justify-center transition-colors ${
            settingsOpen ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
          }`}
          title="Section settings"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
      <button
        onClick={onMoveUp}
        disabled={index === 0}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Move up"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        onClick={onMoveDown}
        disabled={index === total - 1}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Move down"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button
        onClick={onRemove}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        title="Remove section"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
