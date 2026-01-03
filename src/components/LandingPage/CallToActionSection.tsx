'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface CallToActionSectionProps {
  onEnter: () => void
  onNavigate: (tab: string) => void
}

interface CTA {
  id: string
  titleKey: string
  descKey: string
  action: () => void
  isExternal?: boolean
  href?: string
}

export function CallToActionSection({ onEnter, onNavigate }: CallToActionSectionProps) {
  const { t } = useLanguage()

  const ctas: CTA[] = [
    // LOW commitment - just learning
    {
      id: 'library',
      titleKey: 'landing.cta.option1Title',
      descKey: 'landing.cta.option1Desc',
      action: () => {
        onNavigate('reading')
      }
    },
    // MEDIUM commitment - passive exploration
    {
      id: 'building',
      titleKey: 'landing.cta.option2Title',
      descKey: 'landing.cta.option2Desc',
      action: () => {
        onNavigate('home')
      }
    },
    // MEDIUM-HIGH commitment - active participation
    {
      id: 'profile',
      titleKey: 'landing.cta.option3Title',
      descKey: 'landing.cta.option3Desc',
      action: () => {
        onNavigate('profile')
      }
    },
    // HIGH commitment - in-person organizing
    {
      id: 'main-site',
      titleKey: 'landing.cta.option4Title',
      descKey: 'landing.cta.option4Desc',
      action: () => {
        window.open('https://renosparkstenantsunion.org', '_blank')
      },
      isExternal: true,
      href: 'https://renosparkstenantsunion.org'
    }
  ]

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.cta.heading')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('landing.cta.subtitle')}
          </p>
        </div>

        {/* CTA Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ctas.map((cta) => (
            <button
              key={cta.id}
              onClick={cta.action}
              className="group flex flex-col h-full bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-rstu-red hover:shadow-lg transition-all duration-200 text-left"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rstu-red transition-colors">
                {t(cta.titleKey)}
              </h3>
              <p className="text-sm text-gray-600 flex-grow mb-4">
                {t(cta.descKey)}
              </p>
              <div className="flex items-center gap-2 text-rstu-red font-semibold text-sm">
                <span>Start</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Main CTA - Enter RSTU Connect */}
        <div className="bg-rstu-red rounded-lg p-8 sm:p-12 text-white text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('landing.cta.heading')}
          </h3>
          <p className="text-base sm:text-lg text-white mb-8 max-w-2xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <button
            onClick={onEnter}
            className="inline-block px-10 py-4 bg-white text-rstu-red font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            {t('landing.cta.enter')}
          </button>
        </div>

        {/* Info box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900">
            <strong>New to organizing?</strong> {t('landing.cta.or')} {t('landing.cta.guide')}
          </p>
        </div>
      </div>
    </section>
  )
}
