'use client'

import { SECTION_CATEGORIES } from '@/lib/storage/landingPageStorage'

interface SectionTypePickerProps {
  onSelect: (type: string) => void
  excludeTypes?: string[]
  mode: 'popover' | 'inline'
}

const TYPE_ICONS: Record<string, string> = {
  columns: '\u229E',      // squared plus (grid)
  text: '\u2261',          // triple bar (text)
  cards: '\u2586',         // block
  'image-banner': '\u25A3', // square with fill
  hero: '\u2605',          // star
  cta: '\u261B',           // pointing hand
  rights: '\u2696',        // scales
  organizing: '\u2699',    // gear
  crisis: '\u26A0',        // warning
  action: '\u2714',        // check
  mission: '\u2691',       // flag
  values: '\u2665',        // heart
  philosophy: '\u2609',    // sun
  readings: '\u2617',      // book (rotated)
  manifesto: '\u270E',     // pencil
  'how-it-works': '\u2460', // circled 1
}

export function SectionTypePicker({ onSelect, excludeTypes = [], mode }: SectionTypePickerProps) {
  const isInline = mode === 'inline'

  return (
    <div className={isInline ? 'space-y-6' : 'space-y-3'}>
      {SECTION_CATEGORIES.map((category) => {
        const filteredItems = category.items.filter(
          (item) => !excludeTypes.includes(item.type)
        )
        if (filteredItems.length === 0) return null

        return (
          <div key={category.label}>
            <h4 className={`font-semibold text-gray-500 uppercase tracking-wider mb-2 ${
              isInline ? 'text-xs' : 'text-[10px] px-2'
            }`}>
              {category.label}
            </h4>
            <div className={isInline
              ? 'grid grid-cols-2 sm:grid-cols-3 gap-2'
              : 'space-y-0.5'
            }>
              {filteredItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onSelect(item.type)}
                  className={isInline
                    ? 'flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center'
                    : 'w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors'
                  }
                >
                  <span className={isInline ? 'text-2xl' : 'text-base w-5 text-center'}>
                    {TYPE_ICONS[item.type] || '\u25A1'}
                  </span>
                  <div className={isInline ? '' : 'flex-1 text-left'}>
                    <span className={`font-medium ${isInline ? 'text-sm block text-gray-900' : ''}`}>
                      {item.label}
                    </span>
                    {isInline && (
                      <span className="text-xs text-gray-500 block mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
