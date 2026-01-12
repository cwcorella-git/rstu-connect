'use client'

import { useSectionVisibility } from '@/contexts/DisplayContext'
import type { SectionVisibility } from '@/lib/displayStorage'

// Section labels per tab
const SECTION_LABELS: Record<keyof SectionVisibility, Record<string, string>> = {
  home: {
    stats: 'Building Stats',
    progress: 'Organizing Progress',
    favorites: 'Favorites',
    linkedGroups: 'Linked Groups',
  },
  reading: {
    categories: 'Categories',
    filters: 'Filters',
    meta: 'Document Meta',
  },
  mutualAid: {
    skills: 'Skills Directory',
    library: 'Resource Library',
    blocs: 'Blocs',
  },
  tools: {
    tasks: 'Tasks',
    powerMap: 'Power Map',
    canvassing: 'Canvassing',
  },
  profile: {
    rentComparison: 'Rent Comparison',
    activity: 'Activity',
    habitability: 'Habitability',
  },
}

interface SectionToggleProps<T extends keyof SectionVisibility> {
  tab: T
}

/**
 * Renders toggle switches for all sections in a given tab
 */
export function SectionToggle<T extends keyof SectionVisibility>({ tab }: SectionToggleProps<T>) {
  const { visibility, toggle } = useSectionVisibility(tab)
  const labels = SECTION_LABELS[tab]
  const sections = Object.keys(labels) as (keyof SectionVisibility[T])[]

  return (
    <div className="space-y-2">
      {sections.map(section => {
        const isVisible = visibility[section] as boolean
        const label = labels[section as string]

        return (
          <label
            key={section as string}
            className="flex items-center justify-between py-1 cursor-pointer"
          >
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => toggle(section)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isVisible ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={isVisible}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isVisible ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        )
      })}
    </div>
  )
}

/**
 * Get section visibility labels for a specific tab
 */
export function getSectionLabels<T extends keyof SectionVisibility>(tab: T): Record<string, string> {
  return SECTION_LABELS[tab]
}
