'use client'

import { useRef } from 'react'
import { HeroSection } from './HeroSection'
import { PhilosophyManifestoSection } from './PhilosophyManifestoSection'
import { WhatWeDoSection } from './WhatWeDoSection'
import { CoreValuesSection } from './CoreValuesSection'
import { PhilosophySection } from './PhilosophySection'
import { FeaturedReadingsSection } from './FeaturedReadingsSection'
import { CallToActionSection } from './CallToActionSection'

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
      <div>
        {/* Hero Section */}
        <div id="hero">
          <HeroSection
            onScrollClick={() => scrollToSection('philosophy')}
            onEnter={onEnter}
          />
        </div>

        {/* Philosophy Manifesto Section - Lead with WHY we organize */}
        <div id="philosophy">
          <PhilosophyManifestoSection />
        </div>

        {/* What We Do Section */}
        <div id="what-we-do">
          <WhatWeDoSection />
        </div>

        {/* Core Values Section */}
        <div id="values">
          <CoreValuesSection />
        </div>

        {/* Philosophy Pillars Section */}
        <div id="philosophy-pillars">
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
      </div>
    </div>
  )
}
