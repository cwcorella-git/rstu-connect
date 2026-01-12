'use client'

import { useState, useEffect, useRef } from 'react'
import { useDisplay } from '@/contexts/DisplayContext'
import { DisplaySettingsModal } from './DisplaySettingsModal'
import {
  type LayoutPreset,
  type DisplayDensity,
  PRESET_LABELS,
  DENSITY_LABELS,
} from '@/lib/displayStorage'

// Preset icons (simple representations)
const PRESET_ICONS: Record<LayoutPreset, React.ReactNode> = {
  'default': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="12" y="3" width="9" height="18" rx="1" />
    </svg>
  ),
  'focus': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="1" />
    </svg>
  ),
  'compact': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="5" height="18" rx="1" />
      <rect x="10" y="3" width="11" height="18" rx="1" />
    </svg>
  ),
  'wide-list': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="10" height="18" rx="1" />
      <rect x="15" y="3" width="6" height="18" rx="1" />
    </svg>
  ),
  'wide-content': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="4" height="18" rx="1" />
      <rect x="9" y="3" width="12" height="18" rx="1" />
    </svg>
  ),
}

export function QuickSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const {
    preferences,
    setLayoutPreset,
    setDensity,
    resetToDefaults,
  } = useDisplay()

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard shortcut: Ctrl+Shift+L
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const presets: LayoutPreset[] = ['default', 'focus', 'compact', 'wide-list', 'wide-content']
  const densities: DisplayDensity[] = ['comfortable', 'compact', 'spacious']

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Display settings (Ctrl+Shift+L)"
        aria-label="Display settings"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Display Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Layout Presets */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Layout</label>
              <div className="grid grid-cols-5 gap-1">
                {presets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setLayoutPreset(preset)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                      preferences.layoutPreset === preset
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    title={PRESET_LABELS[preset]}
                  >
                    {PRESET_ICONS[preset]}
                    <span className="text-[10px] mt-1 truncate w-full text-center">
                      {PRESET_LABELS[preset].split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">Density</label>
              <div className="flex gap-1">
                {densities.map(density => (
                  <button
                    key={density}
                    onClick={() => setDensity(density)}
                    className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                      preferences.density === density
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {DENSITY_LABELS[density]}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Panel Width */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Panel Width: {preferences.panelConfig.home.width}%
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={preferences.panelConfig.home.width}
                  onChange={(e) => {
                    // This would need to update all panels - simplified for now
                    const width = parseInt(e.target.value)
                    // We'll just show it for now, actual implementation uses the hook
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled // Disable for now, will work through context
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Use presets above to change layout
              </p>
            </div>

            {/* Divider */}
            <hr className="my-3 border-gray-200" />

            {/* More Settings Link */}
            <button
              onClick={() => {
                setIsOpen(false)
                setShowSettingsModal(true)
              }}
              className="w-full py-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              More settings...
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                resetToDefaults()
                setIsOpen(false)
              }}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          {/* Keyboard hint */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-[10px] text-gray-500 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-700">Ctrl+Shift+L</kbd> to toggle
            </p>
          </div>
        </div>
      )}

      {/* Full Settings Modal */}
      <DisplaySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  )
}
