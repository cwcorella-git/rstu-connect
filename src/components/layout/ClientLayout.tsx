'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { TabProvider, useTab } from '@/contexts/TabContext'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { EditModeProvider } from '@/contexts/EditModeContext'
import { DisplayProvider } from '@/contexts/DisplayContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { Navigation } from '@/components/layout/Navigation'
import { LanguageSelector } from '@/components/layout/LanguageSelector'
import { VersionFooter } from '@/components/shared/VersionFooter'
import { EditModeIndicator } from '@/components/EditMode'
import { Footer } from '@/components/layout/Footer'
import { OfflineBanner, OfflineIndicator } from '@/components/shared/OfflineBanner'
import { OnboardingChecklist } from '@/components/Onboarding/OnboardingChecklist'
import { LegislationProvider } from '@/contexts/LegislationContext'
import { LegislationPopup } from '@/components/Legislation'
import { CitationProvider } from '@/contexts/CitationContext'
import { CitationPopup } from '@/components/Citations'

function FloatingChecklist() {
  const { setActiveTab } = useTab()
  return (
    <OnboardingChecklist
      onNavigate={(tab) => setActiveTab(tab as 'landing' | 'home' | 'reading' | 'mutualAid' | 'tools' | 'profile')}
      className="fixed bottom-4 right-4 w-80 z-50 max-h-[calc(100vh-8rem)] overflow-auto"
    />
  )
}

function Header() {
  const { t, isLoading } = useLanguage()
  const { setActiveTab } = useTab()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <span className="text-lg font-bold text-rstu-red">
              {isLoading ? 'RSTU' : t('header.title')}
            </span>
            <span className="text-sm text-gray-600">
              {isLoading ? 'Connect' : t('header.subtitle')}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <OfflineIndicator />
            <LanguageSelector />
            <Navigation />
          </div>
        </div>
      </div>
    </header>
  )
}

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
    <OnboardingProvider>
    <DisplayProvider>
    <EditModeProvider>
    <LegislationProvider>
    <CitationProvider>
    <AuthProvider>
    <TabProvider>
      <main className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Edit Mode Indicator - shows below header when edit mode is active */}
        <EditModeIndicator />

        {/* Offline Banner - shows when disconnected */}
        <OfflineBanner />

        {/* Page Content - scrolls internally */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        <Footer />

        {/* Version Footer for admins/organizers */}
        <VersionFooter />

        {/* Legislation Popup - global overlay for NRS references */}
        <LegislationPopup />

        {/* Citation Popup - Wikipedia-style source references */}
        <CitationPopup />

        {/* Floating Onboarding Checklist */}
        <FloatingChecklist />
      </main>
    </TabProvider>
    </AuthProvider>
    </CitationProvider>
    </LegislationProvider>
    </EditModeProvider>
    </DisplayProvider>
    </OnboardingProvider>
    </LanguageProvider>
  )
}
