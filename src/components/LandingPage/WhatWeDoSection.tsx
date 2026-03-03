'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function WhatWeDoSection() {
  const { t } = useLanguage()

  return (
    <section className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('landing.whatWeDo.heading')}
          </h2>
          <div className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
            <p className="mb-4">
              {t('landing.whatWeDo.intro1')}
            </p>
            <p>
              {t('landing.whatWeDo.intro2')}
            </p>
          </div>
        </div>

        {/* Three Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Building Associations */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9m11 0v-7a6 6 0 00-6-6 6 6 0 00-6 6v7m12 0H7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.whatWeDo.card1Title')}
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase">
              {t('landing.whatWeDo.card1Theory')}
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {t('landing.whatWeDo.card1Desc')}
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              {t('landing.whatWeDo.card1Key')}
            </p>
          </div>

          {/* Card 2: Mutual Aid Networks */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.whatWeDo.card2Title')}
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase">
              {t('landing.whatWeDo.card2Theory')}
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {t('landing.whatWeDo.card2Desc')}
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              {t('landing.whatWeDo.card2Key')}
            </p>
          </div>

          {/* Card 3: Direct Action & Campaigns */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('landing.whatWeDo.card3Title')}
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase">
              {t('landing.whatWeDo.card3Theory')}
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {t('landing.whatWeDo.card3Desc')}
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              {t('landing.whatWeDo.card3Key')}
            </p>
          </div>
        </div>

        {/* Bottom explanation */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <p className="text-base text-gray-900 leading-relaxed mb-4">
            <strong>{t('landing.whatWeDo.summaryTitle')}</strong>
          </p>
          <ul className="space-y-2 text-base text-gray-700">
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">•</span>
              <span>{t('landing.whatWeDo.summaryMun')}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">•</span>
              <span>{t('landing.whatWeDo.summaryMutual')}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">•</span>
              <span>{t('landing.whatWeDo.summaryDual')}</span>
            </li>
          </ul>
        </div>

        {/* Decorative divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 font-semibold">≈</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
      </div>
    </section>
  )
}
