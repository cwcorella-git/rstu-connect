'use client'

import { useRef, useCallback } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'

interface CardData {
  title: string
  body: string
}

interface CustomCardsSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function CustomCardsSection({ config, onConfigChange }: CustomCardsSectionProps) {
  const { isEditMode } = useEditMode()
  const headingRef = useRef<HTMLHeadingElement>(null)

  const heading = (config.heading as string) || 'Cards Section'
  const cards = (config.cards as CardData[]) || []

  const handleHeadingBlur = useCallback(() => {
    const newHeading = headingRef.current?.innerText || heading
    if (newHeading !== heading) {
      onConfigChange({ ...config, heading: newHeading })
    }
  }, [config, heading, onConfigChange])

  const handleCardChange = useCallback((index: number, field: 'title' | 'body', value: string) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], [field]: value }
    onConfigChange({ ...config, cards: newCards })
  }, [config, cards, onConfigChange])

  const handleAddCard = useCallback(() => {
    const newCards = [...cards, { title: 'New Card', body: 'Description here.' }]
    onConfigChange({ ...config, cards: newCards })
  }, [config, cards, onConfigChange])

  const handleRemoveCard = useCallback((index: number) => {
    const newCards = cards.filter((_, i) => i !== index)
    onConfigChange({ ...config, cards: newCards })
  }, [config, cards, onConfigChange])

  const gridCols = cards.length <= 2 ? 'sm:grid-cols-2' :
                   cards.length === 3 ? 'sm:grid-cols-3' :
                   'sm:grid-cols-2 lg:grid-cols-4'

  return (
    <section className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2
          ref={headingRef}
          contentEditable={isEditMode ? 'plaintext-only' : undefined}
          suppressContentEditableWarning
          onBlur={handleHeadingBlur}
          className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center ${
            isEditMode ? 'outline-dashed outline-2 outline-blue-300 outline-offset-2 cursor-text' : ''
          }`}
        >
          {heading}
        </h2>

        <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
          {cards.map((card, i) => (
            <div key={i} className="relative bg-gray-50 rounded-lg p-5 border border-gray-200">
              {isEditMode && (
                <button
                  onClick={() => handleRemoveCard(i)}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  title="Remove card"
                >
                  ×
                </button>
              )}
              <CardField
                value={card.title}
                isEditMode={isEditMode}
                onChange={(v) => handleCardChange(i, 'title', v)}
                className="text-lg font-bold text-rstu-red mb-2"
              />
              <CardField
                value={card.body}
                isEditMode={isEditMode}
                onChange={(v) => handleCardChange(i, 'body', v)}
                className="text-sm text-gray-600 leading-relaxed"
              />
            </div>
          ))}
        </div>

        {isEditMode && (
          <button
            onClick={handleAddCard}
            className="mt-4 mx-auto block px-4 py-2 text-sm border-2 border-dashed border-gray-300 text-gray-400 rounded-lg hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            + Add Card
          </button>
        )}
      </div>
    </section>
  )
}

function CardField({
  value,
  isEditMode,
  onChange,
  className,
}: {
  value: string
  isEditMode: boolean
  onChange: (value: string) => void
  className: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleBlur = () => {
    const newValue = ref.current?.innerText || value
    if (newValue !== value) {
      onChange(newValue)
    }
  }

  return (
    <div
      ref={ref}
      contentEditable={isEditMode ? 'plaintext-only' : undefined}
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className} ${isEditMode ? 'outline-dashed outline-1 outline-blue-300 outline-offset-1 cursor-text' : ''}`}
    >
      {value}
    </div>
  )
}
