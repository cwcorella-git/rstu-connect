'use client'

import { useRef } from 'react'
import { HeroSection } from './HeroSection'
import { RightsSection } from './RightsSection'
import { OrganizingWorksSection } from './OrganizingWorksSection'
import { LocalCrisisSection } from './LocalCrisisSection'
import { ActionSection } from './ActionSection'
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
      className="w-full bg-white overflow-y-scroll h-full"
      style={{ scrollbarGutter: 'stable' }}
    >
      <div>
        {/* Hero Section - Evidence-based opening */}
        <div id="hero">
          <HeroSection
            onScrollClick={() => scrollToSection('rights')}
            onEnter={onEnter}
          />
        </div>

        {/* Rights Section - What rights do I have? */}
        <div id="rights">
          <RightsSection />
        </div>

        {/* Organizing Works Section - Does organizing actually work? */}
        <div id="organizing">
          <OrganizingWorksSection />
        </div>

        {/* Local Crisis Section - What's happening in Reno-Sparks? */}
        <div id="crisis">
          <LocalCrisisSection />
        </div>

        {/* Action Section - What can I do right now? */}
        <div id="action">
          <ActionSection />
        </div>

        {/* Call to Action Section - Final CTA to join/enter */}
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
