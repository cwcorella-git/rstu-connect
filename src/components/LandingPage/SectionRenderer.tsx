'use client'

import { SectionDescriptor } from '@/lib/storage/landingPageStorage'
import { useLanguage } from '@/contexts/LanguageContext'
import { ColumnsSection } from './ColumnsSection'
import { HeroSection } from './HeroSection'
import { RightsSection } from './RightsSection'
import { OrganizingWorksSection } from './OrganizingWorksSection'
import { LocalCrisisSection } from './LocalCrisisSection'
import { ActionSection } from './ActionSection'
import { CallToActionSection } from './CallToActionSection'
import { MissionSection } from './MissionSection'
import { CoreValuesSection } from './CoreValuesSection'
import { PhilosophySection } from './PhilosophySection'
import { PhilosophyManifestoSection } from './PhilosophyManifestoSection'
import { FeaturedReadingsSection } from './FeaturedReadingsSection'
import { CustomTextSection } from './CustomTextSection'
import { CustomCardsSection } from './CustomCardsSection'
import { ImageBannerSection } from './ImageBannerSection'
import { HowItWorksSection } from './HowItWorksSection'

// Get localized text with fallback: current locale -> 'en' -> legacy string -> undefined
function getLocalizedText(value: unknown, locale: string): string | undefined {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const localized = value as Record<string, string>
    return localized[locale] || localized['en']
  }
  return undefined
}

interface SectionRendererProps {
  section: SectionDescriptor
  nested?: boolean
  onEnter: () => void
  onNavigate: (tab: string) => void
  onScrollClick: () => void
  onSectionConfigChange?: (id: string, config: Record<string, unknown>) => void
}

export function SectionRenderer({
  section,
  nested,
  onEnter,
  onNavigate,
  onScrollClick,
  onSectionConfigChange,
}: SectionRendererProps) {
  const { type, config } = section
  const { locale } = useLanguage()

  const handleConfigChange = (newConfig: Record<string, unknown>) => {
    onSectionConfigChange?.(section.id, newConfig)
  }

  switch (type) {
    case 'columns':
      // Guard: columns cannot be nested
      if (nested) return <div className="py-4 text-center text-gray-400 text-sm">Columns cannot be nested</div>
      return (
        <ColumnsSection
          section={section}
          config={config}
          onConfigChange={handleConfigChange}
          onEnter={onEnter}
          onNavigate={onNavigate}
        />
      )
    case 'hero':
      return (
        <HeroSection
          onScrollClick={onScrollClick}
          onEnter={onEnter}
          showLogo={config.showLogo as boolean | undefined}
          headlineOverride={getLocalizedText(config.headlineOverride, locale)}
          taglineOverride={getLocalizedText(config.taglineOverride, locale)}
          missionOverride={getLocalizedText(config.missionOverride, locale)}
        />
      )
    case 'rights':
      return <RightsSection />
    case 'organizing':
      return <OrganizingWorksSection />
    case 'crisis':
      return <LocalCrisisSection />
    case 'action':
      return <ActionSection />
    case 'cta':
      return <CallToActionSection onEnter={onEnter} onNavigate={onNavigate} />
    case 'mission':
      return <MissionSection />
    case 'values':
      return <CoreValuesSection />
    case 'philosophy':
      return <PhilosophySection />
    case 'manifesto':
      return <PhilosophyManifestoSection />
    case 'readings':
      return <FeaturedReadingsSection onNavigate={onNavigate} />
    case 'text':
      return (
        <CustomTextSection
          config={config}
          onConfigChange={handleConfigChange}
          nested={nested}
        />
      )
    case 'cards':
      return (
        <CustomCardsSection
          config={config}
          onConfigChange={handleConfigChange}
          nested={nested}
        />
      )
    case 'image-banner':
      return (
        <ImageBannerSection
          config={config}
          onConfigChange={handleConfigChange}
          nested={nested}
        />
      )
    case 'how-it-works':
      return (
        <HowItWorksSection
          config={config}
          onConfigChange={handleConfigChange}
        />
      )
    default:
      return (
        <div className="py-10 px-4 text-center text-gray-400">
          Unknown section type: {type}
        </div>
      )
  }
}
