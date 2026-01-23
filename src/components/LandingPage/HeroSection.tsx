'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { EditableText } from '@/components/EditMode'

interface HeroSectionProps {
  onScrollClick: () => void
  onEnter: () => void
}

export function HeroSection({ onScrollClick, onEnter }: HeroSectionProps) {
  const { t } = useLanguage()

  return (
    <section className="relative w-full flex-1 flex flex-col justify-center px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Branding */}
        <h1 className="text-sm font-bold text-rstu-red uppercase tracking-wide mb-4">
          {t('landing.hero.title')}
        </h1>

        {/* Main Statement - Evidence-based */}
        <EditableText
          tKey="landing.hero.headline"
          as="h2"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
        />

        {/* Subheading with key message */}
        <EditableText
          tKey="landing.hero.tagline"
          as="p"
          className="text-lg sm:text-xl text-rstu-red font-semibold mb-4"
        />

        {/* Supporting text */}
        <EditableText
          tKey="landing.hero.mission"
          as="p"
          className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed"
          multiline
        />

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onEnter}
            className="px-6 py-2.5 bg-rstu-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            {t('landing.hero.enter')}
          </button>
          <button
            onClick={onScrollClick}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-rstu-red hover:text-rstu-red transition-colors text-center"
          >
            {t('landing.hero.learnMore')}
          </button>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </section>
  )
}
