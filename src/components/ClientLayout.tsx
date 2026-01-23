'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { TabProvider, useTab } from '@/contexts/TabContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { EditModeProvider } from '@/contexts/EditModeContext'
import { DisplayProvider } from '@/contexts/DisplayContext'
import { Navigation } from '@/components/Navigation'
import { LanguageSelector } from '@/components/LanguageSelector'
import { VersionFooter } from '@/components/VersionFooter'
import { EditModeIndicator } from '@/components/EditMode'
import { Footer } from '@/components/Footer'
import { OfflineBanner, OfflineIndicator } from '@/components/OfflineBanner'

function Header() {
  const { setActiveTab } = useTab()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <img
              src="/rstu-connect/rstu-logo-compact.png"
              alt="RSTU - Reno-Sparks Tenants Union"
              className="h-10 w-auto"
            />
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
    <DisplayProvider>
    <EditModeProvider>
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
      </main>
    </TabProvider>
    </AuthProvider>
    </EditModeProvider>
    </DisplayProvider>
    </LanguageProvider>
  )
}
