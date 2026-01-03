'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface CoreValue {
  id: string
  titleKey: string
  descriptionKey: string
}

const CORE_VALUES: CoreValue[] = [
  {
    id: 'housing-right',
    titleKey: 'landing.values.value1Title',
    descriptionKey: 'landing.values.value1Desc'
  },
  {
    id: 'class-struggle',
    titleKey: 'landing.values.value2Title',
    descriptionKey: 'landing.values.value2Desc'
  },
  {
    id: 'solidarity',
    titleKey: 'landing.values.value3Title',
    descriptionKey: 'landing.values.value3Desc'
  },
  {
    id: 'equality',
    titleKey: 'landing.values.value4Title',
    descriptionKey: 'landing.values.value4Desc'
  },
  {
    id: 'anti-gentrification',
    titleKey: 'landing.values.value5Title',
    descriptionKey: 'landing.values.value5Desc'
  }
]

export function CoreValuesSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { t } = useLanguage()

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.values.heading')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('landing.values.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {CORE_VALUES.map((value) => (
            <button
              key={value.id}
              onClick={() => toggleExpanded(value.id)}
              className={`text-left p-6 rounded-lg border-2 transition-all duration-200 ${
                expandedId === value.id
                  ? 'border-rstu-red bg-red-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-rstu-red'
              }`}
            >
              {/* Title (always visible) */}
              <div className="flex items-start justify-between gap-3">
                <h3 className={`font-bold text-base leading-tight text-left ${
                  expandedId === value.id ? 'text-rstu-red' : 'text-gray-900'
                }`}>
                  {t(value.titleKey)}
                </h3>
                <span className={`text-lg flex-shrink-0 transition-transform ${
                  expandedId === value.id ? 'rotate-180' : ''
                }`}>
                  {expandedId === value.id ? '▼' : '▶'}
                </span>
              </div>

              {/* Description (only when expanded) */}
              {expandedId === value.id && (
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  {t(value.descriptionKey)}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 font-semibold">≈</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
    </section>
  )
}
