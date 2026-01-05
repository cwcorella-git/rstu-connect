'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function OrganizingWorksSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          {t('landing.organizing.title')}
        </h2>
        <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
          {t('landing.organizing.subtitle')}
        </p>

        {/* Victories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* KC Tenants */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.organizing.kc.title')}
            </h3>
            <p className="text-sm text-rstu-red font-semibold mb-3">
              {t('landing.organizing.kc.stat')}
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.kc.win1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.kc.win2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.kc.win3')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.kc.win4')}</span>
              </li>
            </ul>
          </div>

          {/* New York */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.organizing.ny.title')}
            </h3>
            <p className="text-sm text-rstu-red font-semibold mb-3">
              {t('landing.organizing.ny.stat')}
            </p>
            <p className="text-gray-700 text-sm mb-3">
              {t('landing.organizing.ny.description')}
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.ny.win1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.ny.win2')}</span>
              </li>
            </ul>
          </div>

          {/* California */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.organizing.ca.title')}
            </h3>
            <p className="text-sm text-rstu-red font-semibold mb-3">
              {t('landing.organizing.ca.stat')}
            </p>
            <p className="text-gray-700 text-sm mb-3">
              {t('landing.organizing.ca.description')}
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.ca.win1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.ca.win2')}</span>
              </li>
            </ul>
          </div>

          {/* Oregon */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.organizing.or.title')}
            </h3>
            <p className="text-sm text-rstu-red font-semibold mb-3">
              {t('landing.organizing.or.stat')}
            </p>
            <p className="text-gray-700 text-sm mb-3">
              {t('landing.organizing.or.description')}
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.or.win1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <span>{t('landing.organizing.or.win2')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Key Message */}
        <div className="bg-rstu-red text-white p-8 rounded-lg text-center">
          <p className="text-lg sm:text-xl">
            {t('landing.organizing.message')}
          </p>
        </div>
      </div>
    </section>
  )
}
