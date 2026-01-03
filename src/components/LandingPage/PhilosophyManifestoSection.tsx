'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function PhilosophyManifestoSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Opening Manifesto */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-12 leading-tight">
            {t('landing.manifesto.heading')}
          </h2>

          <div className="space-y-4">
            {/* Statement 1 */}
            <div className="bg-gradient-to-r from-rstu-red to-red-600 text-white rounded-lg p-8 sm:p-10 border-l-4 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed">
                {t('landing.manifesto.statement1')}
              </p>
            </div>

            {/* Statement 2 */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-8 sm:p-10 border-l-4 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed">
                {t('landing.manifesto.statement2')}
              </p>
            </div>

            {/* Statement 3 */}
            <div className="bg-gradient-to-r from-red-700 to-rstu-red text-white rounded-lg p-8 sm:p-10 border-l-4 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed">
                {t('landing.manifesto.statement3')}
              </p>
            </div>
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
