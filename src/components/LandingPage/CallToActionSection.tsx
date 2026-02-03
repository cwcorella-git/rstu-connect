'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { EditableText } from '@/components/EditMode'

interface CallToActionSectionProps {
  onEnter: () => void
  onNavigate: (tab: string) => void
}

export function CallToActionSection({ onEnter, onNavigate }: CallToActionSectionProps) {
  const { t } = useLanguage()

  return (
    <section className="py-8 sm:py-10 px-4 bg-gradient-to-br from-rstu-red to-red-700">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <EditableText
          tKey="landing.cta.heading"
          as="h2"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        />

        {/* Subheading */}
        <EditableText
          tKey="landing.cta.subtitle"
          as="p"
          className="text-lg sm:text-xl text-white mb-12 opacity-95 max-w-2xl mx-auto"
          multiline
        />

        {/* Main CTA Button */}
        <button
          onClick={onEnter}
          className="inline-block px-12 py-5 bg-white text-rstu-red font-bold text-lg sm:text-xl rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform"
        >
          {t('landing.cta.enter')}
        </button>

        {/* Secondary actions below */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Learning path */}
          <button
            onClick={() => onNavigate('reading')}
            className="group text-left bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-lg p-6 transition-all duration-200 text-white"
          >
            <EditableText
              tKey="landing.cta.option1Title"
              as="h3"
              className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors"
            />
            <EditableText
              tKey="landing.cta.option1Desc"
              as="p"
              className="text-sm text-white text-opacity-90"
            />
          </button>

          {/* Explore buildings */}
          <button
            onClick={() => onNavigate('home')}
            className="group text-left bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-lg p-6 transition-all duration-200 text-white"
          >
            <EditableText
              tKey="landing.cta.option2Title"
              as="h3"
              className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors"
            />
            <EditableText
              tKey="landing.cta.option2Desc"
              as="p"
              className="text-sm text-white text-opacity-90"
            />
          </button>

          {/* In-person organizing */}
          <button
            onClick={() => {
              window.open('https://renosparkstenantsunion.org', '_blank')
            }}
            className="group text-left bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-20 rounded-lg p-6 transition-all duration-200 text-white"
          >
            <EditableText
              tKey="landing.cta.option4Title"
              as="h3"
              className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors"
            />
            <EditableText
              tKey="landing.cta.option4Desc"
              as="p"
              className="text-sm text-white text-opacity-90"
            />
          </button>
        </div>
      </div>
    </section>
  )
}
