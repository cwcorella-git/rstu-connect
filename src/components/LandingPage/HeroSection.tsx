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
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 sm:py-12 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        {/* RSTU Branding - Logo over Text */}
        <div className="mb-5 sm:mb-8 flex flex-col items-center">
          <img
            src="/rstu-connect/rstu-logo-only.png"
            alt="RSTU"
            className="h-36 sm:h-44 lg:h-56 w-auto"
          />
          <img
            src="/rstu-connect/rstu-text-only.png"
            alt="Reno-Sparks Tenants Union"
            className="h-8 sm:h-10 lg:h-12 w-auto mt-2 sm:mt-3"
          />
        </div>

        {/* Main Headline */}
        <EditableText
          tKey="landing.hero.headline"
          as="h1"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-[1.1]"
        />

        {/* Tagline */}
        <EditableText
          tKey="landing.hero.tagline"
          as="p"
          className="text-lg sm:text-xl lg:text-2xl text-rstu-red font-semibold mb-4 sm:mb-6"
        />

        {/* Mission Statement */}
        <EditableText
          tKey="landing.hero.mission"
          as="p"
          className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed"
          multiline
        />

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onEnter}
            className="px-8 py-3 bg-rstu-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            {t('landing.hero.enter')}
          </button>
          <button
            onClick={onScrollClick}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-rstu-red hover:text-rstu-red transition-colors text-center"
          >
            {t('landing.hero.learnMore')}
          </button>
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </section>
  )
}
