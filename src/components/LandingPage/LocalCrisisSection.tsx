'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { EditableText } from '@/components/shared/EditableText'
import { CitationLink } from '@/components/shared/Citations'

export function LocalCrisisSection() {
  const { t } = useLanguage()

  return (
    <section className="py-10 sm:py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <EditableText
          tKey="landing.crisis.title"
          as="h2"
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center"
        />
        <EditableText
          tKey="landing.crisis.subtitle"
          as="p"
          className="text-center text-gray-700 mb-12 max-w-2xl mx-auto"
          multiline
        />

        {/* Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {/* Rent Increases */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <EditableText
              tKey="landing.crisis.rent_increase"
              as="p"
              className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2"
            />
            <p className="text-sm text-gray-700">
              <EditableText tKey="landing.crisis.rent_increase_label" as="span" />
              <CitationLink id="reno-rent-increase-2024" number={1} />
            </p>
          </div>

          {/* Cost-Burdened */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">57%</p>
            <p className="text-sm text-gray-700">
              <EditableText tKey="landing.crisis.cost_burdened" as="span" />
              <CitationLink id="washoe-cost-burdened" number={2} />
            </p>
          </div>

          {/* Hourly Wage */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">82 hrs</p>
            <p className="text-sm text-gray-700">
              <EditableText tKey="landing.crisis.minimum_wage_hours" as="span" />
              <CitationLink id="minimum-wage-housing-hours" number={3} />
            </p>
          </div>

          {/* Homelessness */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">1,760</p>
            <p className="text-sm text-gray-700">
              <EditableText tKey="landing.crisis.homeless" as="span" />
              <CitationLink id="washoe-homeless-count" number={4} />
            </p>
          </div>

          {/* Daily Evictions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">296</p>
            <p className="text-sm text-gray-700">
              <EditableText tKey="landing.crisis.daily_evictions" as="span" />
              <CitationLink id="nevada-eviction-rate" number={5} />
            </p>
          </div>

          {/* Luxury Only */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <p className="text-4xl sm:text-5xl font-bold text-rstu-red mb-2">94%</p>
            <p className="text-sm text-gray-700">
              <EditableText tKey="landing.crisis.luxury_units" as="span" />
              <CitationLink id="luxury-unit-construction" number={6} />
            </p>
          </div>
        </div>

        {/* Impact Statement */}
        <div className="bg-white p-8 rounded-lg border-2 border-rstu-red">
          <EditableText
            tKey="landing.crisis.impact"
            as="p"
            className="text-lg text-gray-900 leading-relaxed"
            multiline
          />
        </div>

        {/* Support Available */}
        <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <EditableText
            tKey="landing.crisis.support_title"
            as="h3"
            className="text-lg font-bold text-gray-900 mb-3"
          />
          <EditableText
            tKey="landing.crisis.support_intro"
            as="p"
            className="text-gray-700 mb-3"
            multiline
          />
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
