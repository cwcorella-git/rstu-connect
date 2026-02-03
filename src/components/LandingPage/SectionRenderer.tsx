'use client'

import { SectionDescriptor } from '@/lib/landingPageStorage'
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

interface SectionRendererProps {
  section: SectionDescriptor
  onEnter: () => void
  onNavigate: (tab: string) => void
  onScrollClick: () => void
  onSectionConfigChange?: (id: string, config: Record<string, unknown>) => void
}

export function SectionRenderer({
  section,
  onEnter,
  onNavigate,
  onScrollClick,
  onSectionConfigChange,
}: SectionRendererProps) {
  const { type, config } = section

  const handleConfigChange = (newConfig: Record<string, unknown>) => {
    onSectionConfigChange?.(section.id, newConfig)
  }

  switch (type) {
    case 'hero':
      return (
        <HeroSection
          onScrollClick={onScrollClick}
          onEnter={onEnter}
          showLogo={config.showLogo as boolean | undefined}
          headlineOverride={config.headlineOverride as string | undefined}
          taglineOverride={config.taglineOverride as string | undefined}
          missionOverride={config.missionOverride as string | undefined}
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
        />
      )
    case 'cards':
      return (
        <CustomCardsSection
          config={config}
          onConfigChange={handleConfigChange}
        />
      )
    case 'image-banner':
      return (
        <ImageBannerSection
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
