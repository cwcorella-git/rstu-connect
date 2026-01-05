'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function RightsSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          {t('landing.rights.title')}
        </h2>
        <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
          {t('landing.rights.subtitle')}
        </p>

        {/* Rights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Habitability */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-rstu-red mb-3">
              {t('landing.rights.habitability.title')}
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.habitability.weatherproof')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.habitability.plumbing')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.habitability.heat')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.habitability.pest')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.habitability.structure')}</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 italic">
              {t('landing.rights.habitability.nrs')}
            </p>
          </div>

          {/* Anti-Retaliation */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-rstu-red mb-3">
              {t('landing.rights.retaliation.title')}
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              {t('landing.rights.retaliation.description')}
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.retaliation.organize')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.retaliation.report')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <span>{t('landing.rights.retaliation.union')}</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 italic">
              {t('landing.rights.retaliation.nrs')}
            </p>
          </div>
        </div>

        {/* Remedies Section */}
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold text-rstu-red mb-4">
            {t('landing.rights.remedies.title')}
          </h3>
          <p className="text-gray-700 mb-6">
            {t('landing.rights.remedies.intro')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('landing.rights.remedies.essential.title')}
              </h4>
              <p className="text-gray-700 text-sm">
                {t('landing.rights.remedies.essential.text')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('landing.rights.remedies.non_essential.title')}
              </h4>
              <p className="text-gray-700 text-sm">
                {t('landing.rights.remedies.non_essential.text')}
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">⚠️ {t('landing.rights.remedies.warning.title')}</span>{' '}
              {t('landing.rights.remedies.warning.text')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
