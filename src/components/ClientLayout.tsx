'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { TabProvider, useTab } from '@/contexts/TabContext'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { EditModeProvider } from '@/contexts/EditModeContext'
import { DisplayProvider } from '@/contexts/DisplayContext'
import { Navigation } from '@/components/Navigation'
import { LanguageSelector } from '@/components/LanguageSelector'
import { QuickSwitcher } from '@/components/Display'
import { VersionFooter } from '@/components/VersionFooter'
import { EditModeIndicator } from '@/components/EditMode'
import { Footer } from '@/components/Footer'

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
            <QuickSwitcher />
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
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Edit Mode Indicator - shows below header when edit mode is active */}
        <EditModeIndicator />

        {/* Page Content */}
        <div className="flex-1">
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
