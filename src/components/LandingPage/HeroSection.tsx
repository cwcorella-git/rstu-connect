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
    <section className="relative px-4 bg-white min-h-[calc(100dvh-180px)] flex flex-col">
      <div className="max-w-3xl mx-auto text-center flex flex-col flex-1 justify-center w-full">
        {/* RSTU Branding - Logo over Text */}
        <div className="mb-2 flex flex-col items-center">
          <img
            src="/rstu-connect/rstu-logo-only.png"
            alt="RSTU"
            className="h-20 sm:h-24 lg:h-28 w-auto"
          />
          <img
            src="/rstu-connect/rstu-text-only.png"
            alt="Reno-Sparks Tenants Union"
            className="h-3.5 sm:h-4 lg:h-6 w-auto mt-1"
          />
        </div>

        {/* Main Headline */}
        <EditableText
          tKey="landing.hero.headline"
          as="h1"
          className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-1.5 leading-[1.1]"
        />

        {/* Tagline */}
        <EditableText
          tKey="landing.hero.tagline"
          as="p"
          className="text-sm sm:text-base text-rstu-red font-semibold mb-1.5 sm:mb-2"
        />

        {/* Mission Statement */}
        <EditableText
          tKey="landing.hero.mission"
          as="p"
          className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mb-3 sm:mb-4 leading-relaxed"
          multiline
        />

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <button
            onClick={onEnter}
            className="px-5 py-2 bg-rstu-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            {t('landing.hero.enter')}
          </button>
          <button
            onClick={onScrollClick}
            className="px-5 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-rstu-red hover:text-rstu-red transition-colors text-center"
          >
            {t('landing.hero.learnMore')}
          </button>
        </div>
      </div>

      {/* Scroll down arrow - pinned to bottom */}
      <button
        onClick={onScrollClick}
        className="text-gray-400 hover:text-gray-600 transition-colors mx-auto block py-2"
        aria-label="Scroll down"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </section>
  )
}
