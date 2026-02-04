'use client'

import { useRef, useEffect } from 'react'
import { COLUMN_LAYOUTS, type SectionDescriptor } from '@/lib/landingPageStorage'

interface SettingField {
  key: string
  label: string
  type: 'toggle' | 'text' | 'textarea' | 'select' | 'color' | 'layout-picker'
  options?: string[]
  default?: unknown
}

const SECTION_SETTINGS: Record<string, SettingField[]> = {
  hero: [
    { key: 'showLogo', label: 'Show Logo', type: 'toggle', default: true },
    { key: 'headlineOverride', label: 'Headline', type: 'text' },
    { key: 'taglineOverride', label: 'Tagline', type: 'text' },
    { key: 'missionOverride', label: 'Mission Text', type: 'textarea' },
  ],
  text: [
    { key: 'bgColor', label: 'Background', type: 'select', options: ['white', 'gray'] },
  ],
  'image-banner': [
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'textColor', label: 'Text Color', type: 'select', options: ['white', 'black'] },
  ],
  columns: [
    { key: 'layout', label: 'Layout', type: 'layout-picker' },
    { key: 'gap', label: 'Gap', type: 'select', options: ['none', 'sm', 'md', 'lg'] },
    { key: 'bgColor', label: 'Background', type: 'select', options: ['transparent', 'white', 'gray'] },
  ],
}

interface SectionSettingsPanelProps {
  section: SectionDescriptor
  onConfigChange: (config: Record<string, unknown>) => void
  onClose: () => void
}

export function SectionSettingsPanel({ section, onConfigChange, onClose }: SectionSettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const fields = SECTION_SETTINGS[section.type]

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid catching the triggering click
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [onClose])

  if (!fields || fields.length === 0) {
    return (
      <div ref={panelRef} className="absolute top-10 right-2 z-40 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
        <p className="text-xs text-gray-400">No settings for this section</p>
      </div>
    )
  }

  const updateField = (key: string, value: unknown) => {
    onConfigChange({ ...section.config, [key]: value })
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-10 right-2 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {fields.map((field) => {
        const value = section.config[field.key]

        switch (field.type) {
          case 'toggle':
            return (
              <label key={field.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-700">{field.label}</span>
                <button
                  type="button"
                  onClick={() => updateField(field.key, value === undefined ? !(field.default ?? false) : !value)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    (value ?? field.default) ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    (value ?? field.default) ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </label>
            )

          case 'text':
            return (
              <div key={field.key}>
                <label className="text-xs text-gray-700 block mb-1">{field.label}</label>
                <input
                  type="text"
                  value={(typeof value === 'string' ? value : '') as string}
                  onChange={(e) => updateField(field.key, e.target.value || undefined)}
                  placeholder={`Override ${field.label.toLowerCase()}...`}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )

          case 'textarea':
            return (
              <div key={field.key}>
                <label className="text-xs text-gray-700 block mb-1">{field.label}</label>
                <textarea
                  value={(typeof value === 'string' ? value : '') as string}
                  onChange={(e) => updateField(field.key, e.target.value || undefined)}
                  placeholder={`Override ${field.label.toLowerCase()}...`}
                  rows={3}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y"
                />
              </div>
            )

          case 'select':
            return (
              <div key={field.key}>
                <label className="text-xs text-gray-700 block mb-1">{field.label}</label>
                <select
                  value={(value as string) || field.options?.[0] || ''}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )

          case 'color':
            return (
              <div key={field.key}>
                <label className="text-xs text-gray-700 block mb-1">{field.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(value as string) || '#cc0000'}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(value as string) || '#cc0000'}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>
            )

          case 'layout-picker':
            return (
              <div key={field.key}>
                <label className="text-xs text-gray-700 block mb-1">{field.label}</label>
                <div className="flex flex-wrap gap-1">
                  {COLUMN_LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => updateField(field.key, l.id)}
                      className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                        (value || '1-1') === l.id
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                      }`}
                      title={l.label}
                    >
                      {l.id}
                    </button>
                  ))}
                </div>
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
