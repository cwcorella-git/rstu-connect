'use client'

import { useState } from 'react'
import { useDisplay } from '@/contexts/DisplayContext'
import { SectionToggle } from './SectionToggle'
import {
  type LayoutPreset,
  type DisplayDensity,
  type SectionVisibility,
  PRESET_LABELS,
  DENSITY_LABELS,
} from '@/lib/displayStorage'

// Tab labels for section visibility
const TAB_LABELS: Record<keyof SectionVisibility, string> = {
  home: 'Organize',
  reading: 'Reading',
  mutualAid: 'Mutual Aid',
  tools: 'Tools',
  profile: 'Profile',
}

interface DisplaySettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DisplaySettingsModal({ isOpen, onClose }: DisplaySettingsModalProps) {
  const {
    preferences,
    setLayoutPreset,
    setDensity,
    resetToDefaults,
  } = useDisplay()

  const [activeSection, setActiveSection] = useState<'layout' | 'sections' | 'advanced'>('layout')
  const [selectedSectionTab, setSelectedSectionTab] = useState<keyof SectionVisibility>('home')

  if (!isOpen) return null

  const presets: LayoutPreset[] = ['default', 'focus', 'compact', 'wide-list', 'wide-content']
  const densities: DisplayDensity[] = ['comfortable', 'compact', 'spacious']
  const sectionTabs = Object.keys(TAB_LABELS) as (keyof SectionVisibility)[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Display Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveSection('layout')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeSection === 'layout'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Layout
          </button>
          <button
            onClick={() => setActiveSection('sections')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeSection === 'sections'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sections
          </button>
          <button
            onClick={() => setActiveSection('advanced')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeSection === 'advanced'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Layout Section */}
          {activeSection === 'layout' && (
            <div className="space-y-6">
              {/* Layout Presets */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Layout Preset</h3>
                <div className="grid grid-cols-5 gap-2">
                  {presets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => setLayoutPreset(preset)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                        preferences.layoutPreset === preset
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {/* Preset icon */}
                      <svg className="w-8 h-8 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        {preset === 'default' && (
                          <>
                            <rect x="3" y="3" width="7" height="18" rx="1" />
                            <rect x="12" y="3" width="9" height="18" rx="1" />
                          </>
                        )}
                        {preset === 'focus' && (
                          <rect x="3" y="3" width="18" height="18" rx="1" />
                        )}
                        {preset === 'compact' && (
                          <>
                            <rect x="3" y="3" width="5" height="18" rx="1" />
                            <rect x="10" y="3" width="11" height="18" rx="1" />
                          </>
                        )}
                        {preset === 'wide-list' && (
                          <>
                            <rect x="3" y="3" width="10" height="18" rx="1" />
                            <rect x="15" y="3" width="6" height="18" rx="1" />
                          </>
                        )}
                        {preset === 'wide-content' && (
                          <>
                            <rect x="3" y="3" width="4" height="18" rx="1" />
                            <rect x="9" y="3" width="12" height="18" rx="1" />
                          </>
                        )}
                      </svg>
                      <span className="text-xs">{PRESET_LABELS[preset]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Display Density</h3>
                <div className="flex gap-2">
                  {densities.map(density => (
                    <button
                      key={density}
                      onClick={() => setDensity(density)}
                      className={`flex-1 py-2.5 px-4 text-sm rounded-lg transition-all ${
                        preferences.density === density
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {DENSITY_LABELS[density]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Controls spacing and text size throughout the app.
                </p>
              </div>

              {/* Current Panel Width Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Panel Width</span>
                  <span className="text-sm font-medium text-gray-900">
                    {preferences.panelConfig.home.width}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Panel widths are set by layout presets. Use the Reading tab resize handle for manual adjustments.
                </p>
              </div>
            </div>
          )}

          {/* Sections Tab */}
          {activeSection === 'sections' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Show or hide sections within each tab.
              </p>

              {/* Tab selector */}
              <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
                {sectionTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedSectionTab(tab)}
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors ${
                      selectedSectionTab === tab
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {/* Section toggles for selected tab */}
              <div className="bg-gray-50 rounded-lg p-4">
                <SectionToggle tab={selectedSectionTab} />
              </div>

              <p className="text-xs text-gray-500">
                Note: Section visibility is a preview feature. Some sections may not fully support hiding yet.
              </p>
            </div>
          )}

          {/* Advanced Tab */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              {/* Reset */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Reset Settings</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Restore all display settings to their default values.
                </p>
                <button
                  onClick={() => {
                    resetToDefaults()
                  }}
                  className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toggle Quick Switcher</span>
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                      Ctrl+Shift+L
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toggle Edit Mode (Admin)</span>
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                      Ctrl+Shift+E
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Admin Logout</span>
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                      Ctrl+Shift+A
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Current Settings Debug */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(preferences, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
