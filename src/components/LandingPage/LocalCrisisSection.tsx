'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function LocalCrisisSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          {t('landing.crisis.title')}
        </h2>
        <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
          {t('landing.crisis.subtitle')}
        </p>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {/* Rent Increases */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">
              {t('landing.crisis.rent_increase')}
            </p>
            <p className="text-sm text-gray-700">
              {t('landing.crisis.rent_increase_label')}
            </p>
          </div>

          {/* Cost-Burdened */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">
              57%
            </p>
            <p className="text-sm text-gray-700">
              {t('landing.crisis.cost_burdened')}
            </p>
          </div>

          {/* Hourly Wage */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">
              82 hrs
            </p>
            <p className="text-sm text-gray-700">
              {t('landing.crisis.minimum_wage_hours')}
            </p>
          </div>

          {/* Homelessness */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">
              1,760
            </p>
            <p className="text-sm text-gray-700">
              {t('landing.crisis.homeless')}
            </p>
          </div>

          {/* Daily Evictions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">
              296
            </p>
            <p className="text-sm text-gray-700">
              {t('landing.crisis.daily_evictions')}
            </p>
          </div>

          {/* Luxury Only */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">
              94%
            </p>
            <p className="text-sm text-gray-700">
              {t('landing.crisis.luxury_units')}
            </p>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="bg-white p-8 rounded-lg border-2 border-rstu-red">
          <p className="text-lg text-gray-900 leading-relaxed">
            {t('landing.crisis.impact')}
          </p>
        </div>

        {/* Support Available */}
        <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {t('landing.crisis.support_title')}
          </h3>
          <p className="text-gray-700 mb-3">
            {t('landing.crisis.support_intro')}
          </p>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• <strong>{t('landing.crisis.support_legal')}</strong></li>
            <li>• <strong>{t('landing.crisis.support_assistance')}</strong></li>
            <li>• <strong>{t('landing.crisis.support_advocacy')}</strong></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
