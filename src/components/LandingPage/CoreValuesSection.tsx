'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface CoreValue {
  id: string
  titleKey: string
  descriptionKey: string
  iconBgColor: string
}

// Only include the values that are NEW, not already in Manifesto Beliefs
// Removed: Housing Right (Belief 1), Irreconcilable Conflict (Belief 2), Solidarity (Belief 3)
const CORE_VALUES: CoreValue[] = [
  {
    id: 'racial-justice',
    titleKey: 'landing.values.value4Title',
    descriptionKey: 'landing.values.value4Desc',
    iconBgColor: 'bg-yellow-100 border-yellow-500'
  },
  {
    id: 'anti-gentrification',
    titleKey: 'landing.values.value5Title',
    descriptionKey: 'landing.values.value5Desc',
    iconBgColor: 'bg-blue-100 border-blue-500'
  }
]

export function CoreValuesSection() {
  const { t } = useLanguage()

  return (
    <section className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('landing.values.heading')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('landing.values.subtitle')}
          </p>
        </div>

        {/* Two-column grid for the two core values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {CORE_VALUES.map((value) => (
            <div
              key={value.id}
              className="group relative"
            >
              {/* Color accent bar on left */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 bg-rstu-red rounded-l-lg`}></div>

              {/* Card content */}
              <div className="bg-gray-50 rounded-lg p-8 pl-6 border-l-4 border-rstu-red hover:shadow-lg transition-shadow duration-200">
                {/* Icon/Color indicator */}
                <div className={`inline-block w-12 h-12 rounded-lg mb-4 ${value.iconBgColor} border-2 flex items-center justify-center`}>
                  {value.id === 'racial-justice' && (
                    <span className="text-2xl">✊</span>
                  )}
                  {value.id === 'anti-gentrification' && (
                    <span className="text-2xl">🏘️</span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-rstu-red transition-colors">
                  {t(value.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-base text-gray-700 leading-relaxed">
                  {t(value.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Context note */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto text-center">
          <p className="text-sm text-blue-900">
            <strong>These values build on the foundation</strong> of housing as a right, class struggle, and mutual solidarity established above. Racial justice and anti-gentrification ensure we fight for ALL people experiencing housing injustice.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 font-semibold">≈</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
    </section>
  )
}
