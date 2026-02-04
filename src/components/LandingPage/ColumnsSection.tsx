'use client'

import { useState, useCallback, useMemo } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { COLUMN_LAYOUTS, createSection, type SectionDescriptor } from '@/lib/landingPageStorage'
import { SectionRenderer } from './SectionRenderer'
import { SectionTypePicker } from './SectionTypePicker'

interface ColumnsSectionProps {
  section: SectionDescriptor
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
  onEnter: () => void
  onNavigate: (tab: string) => void
}

export function ColumnsSection({ section, config, onConfigChange, onEnter, onNavigate }: ColumnsSectionProps) {
  const { isEditMode } = useEditMode()
  const [swapPickerCol, setSwapPickerCol] = useState<number | null>(null)

  const layoutId = (config.layout as string) || '1-1'
  const layout = COLUMN_LAYOUTS.find(l => l.id === layoutId) || COLUMN_LAYOUTS[0]
  const columns = useMemo(() => (config.columns as SectionDescriptor[]) || [], [config.columns])
  const gap = (config.gap as string) || 'md'
  const bgColor = (config.bgColor as string) || 'transparent'

  const gapPx = { none: '0', sm: '0.5rem', md: '1rem', lg: '2rem' }[gap] || '1rem'
  const bgClass = bgColor === 'gray' ? 'bg-gray-50' : bgColor === 'white' ? 'bg-white' : ''

  const handleLayoutChange = useCallback((newLayoutId: string) => {
    const newLayout = COLUMN_LAYOUTS.find(l => l.id === newLayoutId)
    if (!newLayout) return

    const updated = [...columns]
    // Add columns if new layout has more
    while (updated.length < newLayout.cols) {
      const s = createSection('text')
      updated.push(s)
    }
    // Remove from end if new layout has fewer
    while (updated.length > newLayout.cols) {
      updated.pop()
    }
    onConfigChange({ ...config, layout: newLayoutId, columns: updated })
  }, [columns, config, onConfigChange])

  const handleColumnConfigChange = useCallback((colIndex: number, newColConfig: Record<string, unknown>) => {
    const updated = columns.map((col, i) =>
      i === colIndex ? { ...col, config: newColConfig } : col
    )
    onConfigChange({ ...config, columns: updated })
  }, [columns, config, onConfigChange])

  const handleSwapColumnType = useCallback((colIndex: number, type: string) => {
    const newSection = createSection(type)
    const updated = columns.map((col, i) =>
      i === colIndex ? { ...newSection, id: col.id } : col
    )
    onConfigChange({ ...config, columns: updated })
    setSwapPickerCol(null)
  }, [columns, config, onConfigChange])

  return (
    <section className={`py-6 px-4 ${bgClass}`}>
      {/* Layout picker bar (edit mode) */}
      {isEditMode && (
        <div className="flex items-center justify-center gap-1 mb-3">
          <span className="text-[10px] text-gray-400 mr-2">Layout:</span>
          {COLUMN_LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => handleLayoutChange(l.id)}
              className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                l.id === layoutId
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
              }`}
              title={l.label}
            >
              {l.id}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div
        className="max-w-6xl mx-auto grid grid-cols-1"
        style={{
          gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth >= 768
            ? layout.template
            : undefined,
          gap: gapPx,
        }}
      >
        {columns.map((col, i) => (
          <div key={col.id} className="relative min-h-[60px]">
            {/* Column slot controls (edit mode) */}
            {isEditMode && (
              <div className="absolute top-1 right-1 z-20 flex items-center gap-0.5">
                <button
                  onClick={() => setSwapPickerCol(swapPickerCol === i ? null : i)}
                  className="w-5 h-5 flex items-center justify-center text-[10px] text-gray-400 hover:text-blue-500 bg-white/80 rounded border border-gray-200"
                  title="Change section type"
                >
                  \u21C4
                </button>
              </div>
            )}

            {/* Swap picker dropdown */}
            {isEditMode && swapPickerCol === i && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSwapPickerCol(null)} />
                <div className="absolute top-7 right-1 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48 max-h-64 overflow-y-auto">
                  <SectionTypePicker
                    mode="popover"
                    excludeTypes={['columns']}
                    onSelect={(type) => handleSwapColumnType(i, type)}
                  />
                </div>
              </>
            )}

            <SectionRenderer
              section={col}
              nested
              onEnter={onEnter}
              onNavigate={onNavigate}
              onScrollClick={() => {}}
              onSectionConfigChange={(_id, newConfig) => handleColumnConfigChange(i, newConfig)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
