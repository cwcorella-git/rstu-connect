'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function ActionSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
          {t('landing.action.title')}
        </h2>
        <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
          {t('landing.action.subtitle')}
        </p>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Legal Help */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-rstu-red mb-4">
              {t('landing.action.legal.title')}
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">
                  {t('landing.action.legal.org1.name')}
                </p>
                <p className="text-xs mt-1">
                  {t('landing.action.legal.org1.phone')}: (775) 284-3491 ext. 316
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t('landing.action.legal.org2.name')}
                </p>
                <p className="text-xs mt-1">
                  {t('landing.action.legal.org2.phone')}: (775) 329-2727
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t('landing.action.legal.org3.name')}
                </p>
                <p className="text-xs mt-1">
                  {t('landing.action.legal.org3.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Immediate Help */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-rstu-red mb-4">
              {t('landing.action.emergency.title')}
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">
                  {t('landing.action.emergency.eviction.title')}
                </p>
                <p className="text-xs mt-1">
                  {t('landing.action.emergency.eviction.phone')}: (775) 334-3310
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t('landing.action.emergency.rental.title')}
                </p>
                <p className="text-xs mt-1">
                  {t('landing.action.emergency.rental.description')}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t('landing.action.emergency.code.title')}
                </p>
                <p className="text-xs mt-1">
                  {t('landing.action.emergency.code.phone')}: (775) 334-4636
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Organize */}
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('landing.action.organize.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-rstu-red mb-3">1</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('landing.action.organize.step1.title')}
              </h4>
              <p className="text-sm text-gray-700">
                {t('landing.action.organize.step1.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rstu-red mb-3">2</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('landing.action.organize.step2.title')}
              </h4>
              <p className="text-sm text-gray-700">
                {t('landing.action.organize.step2.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rstu-red mb-3">3</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('landing.action.organize.step3.title')}
              </h4>
              <p className="text-sm text-gray-700">
                {t('landing.action.organize.step3.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg text-gray-900 mb-6">
            {t('landing.action.cta')}
          </p>
          <p className="text-sm text-gray-600">
            {t('landing.action.contact_email')}
          </p>
        </div>
      </div>
    </section>
  )
}
