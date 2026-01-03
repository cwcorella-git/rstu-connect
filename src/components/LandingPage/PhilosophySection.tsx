'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface PhilosophyPillar {
  id: string
  titleKey: string
  authorKey: string
  quoteKey: string
  descKey: string
  conceptKeys: string[]
}

const PILLARS: PhilosophyPillar[] = [
  {
    id: 'municipalism',
    titleKey: 'landing.philosophy.pillar1Title',
    authorKey: 'landing.philosophy.pillar1Author',
    quoteKey: 'landing.philosophy.pillar1Quote',
    descKey: 'landing.philosophy.pillar1Desc',
    conceptKeys: [
      'landing.philosophy.pillar1Concept1',
      'landing.philosophy.pillar1Concept2',
      'landing.philosophy.pillar1Concept3',
      'landing.philosophy.pillar1Concept4'
    ]
  },
  {
    id: 'mutual-aid',
    titleKey: 'landing.philosophy.pillar2Title',
    authorKey: 'landing.philosophy.pillar2Author',
    quoteKey: 'landing.philosophy.pillar2Quote',
    descKey: 'landing.philosophy.pillar2Desc',
    conceptKeys: [
      'landing.philosophy.pillar2Concept1',
      'landing.philosophy.pillar2Concept2',
      'landing.philosophy.pillar2Concept3',
      'landing.philosophy.pillar2Concept4'
    ]
  },
  {
    id: 'dual-power',
    titleKey: 'landing.philosophy.pillar3Title',
    authorKey: 'landing.philosophy.pillar3Author',
    quoteKey: 'landing.philosophy.pillar3Quote',
    descKey: 'landing.philosophy.pillar3Desc',
    conceptKeys: [
      'landing.philosophy.pillar3Concept1',
      'landing.philosophy.pillar3Concept2',
      'landing.philosophy.pillar3Concept3',
      'landing.philosophy.pillar3Concept4'
    ]
  }
]

export function PhilosophySection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Opening Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t('landing.philosophy.heading')}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {t('landing.philosophy.intro')}
          </p>
          <p className="text-base text-gray-600 italic">
            {t('landing.philosophy.introNote')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="bg-white rounded-lg p-8 border border-gray-200 hover:border-rstu-red hover:shadow-lg transition-all duration-200">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t(pillar.titleKey)}</h3>
                <p className="text-sm text-gray-600 font-medium">— {t(pillar.authorKey)}</p>
              </div>

              {/* Quote */}
              <div className="bg-red-50 border-l-4 border-rstu-red p-4 mb-6">
                <p className="text-sm italic text-gray-700">
                  {t(pillar.quoteKey)}
                </p>
              </div>

              {/* Description */}
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                {t(pillar.descKey)}
              </p>

              {/* Core Concepts */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Core Concepts:</p>
                <ul className="space-y-2">
                  {pillar.conceptKeys.map((key, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-rstu-red font-bold flex-shrink-0">•</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

        {/* Closing Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-4xl mx-auto mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t('landing.philosophy.closingTitle')}
          </h3>
          <div className="space-y-4 text-base text-gray-700">
            <p>{t('landing.philosophy.closingP1')}</p>
            <p>{t('landing.philosophy.closingP2')}</p>
            <p>{t('landing.philosophy.closingP3')}</p>
          </div>
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
