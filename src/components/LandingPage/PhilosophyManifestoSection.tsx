'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function PhilosophyManifestoSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Opening Manifesto */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {t('landing.manifesto.heading')}
          </h2>

          <div className="bg-gradient-to-r from-rstu-red to-red-600 text-white rounded-lg p-8 sm:p-12">
            <p className="text-lg sm:text-xl leading-relaxed font-medium">
              <span className="block mb-4">
                {t('landing.manifesto.statement1')}
              </span>
              <span className="block mb-4">
                {t('landing.manifesto.statement2')}
              </span>
              <span className="block">
                {t('landing.manifesto.statement3')}
              </span>
            </p>
          </div>
        </div>

        {/* Core Beliefs - Three Essential Principles */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('landing.manifesto.beliefs')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Belief 1: Housing is a Right */}
            <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-rstu-red">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.manifesto.belief1Title')}
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">
                {t('landing.manifesto.belief1Desc')}
              </p>
            </div>

            {/* Belief 2: Class Struggle */}
            <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-rstu-red">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.manifesto.belief2Title')}
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">
                {t('landing.manifesto.belief2Desc')}
              </p>
            </div>

            {/* Belief 3: Solidarity */}
            <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-rstu-red">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t('landing.manifesto.belief3Title')}
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">
                {t('landing.manifesto.belief3Desc')}
              </p>
            </div>
          </div>
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
