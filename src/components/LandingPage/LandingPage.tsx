'use client'

import { useRef } from 'react'
import { HeroSection } from './HeroSection'
import { MissionSection } from './MissionSection'
import { CoreValuesSection } from './CoreValuesSection'
import { PhilosophySection } from './PhilosophySection'
import { FeaturedReadingsSection } from './FeaturedReadingsSection'
import { CallToActionSection } from './CallToActionSection'
import { LandingFooter } from './LandingFooter'

interface LandingPageProps {
  onEnter: () => void
  onNavigate: (tab: string) => void
}

export function LandingPage({ onEnter, onNavigate }: LandingPageProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element && contentRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      ref={contentRef}
      className="w-full h-full overflow-y-auto bg-gradient-to-b from-white to-gray-50"
      style={{ height: 'calc(100vh - 140px)' }}
    >
      {/* Sticky header with Enter button (desktop) */}
      <div className="fixed top-0 right-0 left-0 z-40 bg-white border-b border-gray-200 px-4 py-3 hidden lg:flex items-center justify-end gap-4"
        style={{ marginTop: 'calc(70px)' }}>
        <button
          onClick={onEnter}
          className="px-6 py-2 bg-rstu-red text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Enter RSTU Connect
        </button>
      </div>

      {/* Main content with top padding for fixed header */}
      <div className="lg:pt-16">
        {/* Hero Section */}
        <div id="hero">
          <HeroSection
            onScrollClick={() => scrollToSection('mission')}
            onEnter={onEnter}
          />
        </div>

        {/* Mission Section */}
        <div id="mission">
          <MissionSection />
        </div>

        {/* Core Values Section */}
        <div id="values">
          <CoreValuesSection />
        </div>

        {/* Philosophy Section */}
        <div id="philosophy">
          <PhilosophySection />
        </div>

        {/* Featured Readings Section */}
        <div id="readings">
          <FeaturedReadingsSection onNavigate={onNavigate} />
        </div>

        {/* Call to Action Section */}
        <div id="cta">
          <CallToActionSection
            onEnter={onEnter}
            onNavigate={onNavigate}
          />
        </div>

        {/* Footer */}
        <LandingFooter onEnter={onEnter} />
      </div>
    </div>
  )
}
