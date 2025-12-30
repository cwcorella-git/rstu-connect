'use client'

interface HeroSectionProps {
  onScrollClick: () => void
  onEnter: () => void
}

export function HeroSection({ onScrollClick, onEnter }: HeroSectionProps) {
  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-28 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Branding */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rstu-red rounded-full mb-4">
            <span className="text-white text-3xl font-bold">⚙️</span>
          </div>
          <h1 className="text-sm font-semibold text-rstu-red uppercase tracking-wide mb-2">
            Reno-Sparks Tenants Union
          </h1>
          <p className="text-xs text-gray-500">Nevada's First Tenants Union</p>
        </div>

        {/* Main Mission Statement */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          We Are Fighting For Safe and Secure Housing For All
        </h2>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Housing is a human right, not a commodity. We organize collectively to build tenant power, hold landlords accountable, and create the world where everyone has control over their living situation.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={onEnter}
            className="px-8 py-3 bg-rstu-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            Enter RSTU Connect
          </button>
          <button
            onClick={onScrollClick}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-rstu-red hover:text-rstu-red transition-colors text-center"
          >
            Learn More
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center animate-pulse">
          <button
            onClick={onScrollClick}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Scroll to next section"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </section>
  )
}
