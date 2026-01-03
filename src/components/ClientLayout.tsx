'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { TabProvider, useTab } from '@/contexts/TabContext'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { Navigation } from '@/components/Navigation'
import { LanguageSelector } from '@/components/LanguageSelector'
import { VersionFooter } from '@/components/VersionFooter'

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
    <AuthProvider>
    <TabProvider>
      <main className="min-h-screen flex flex-col pb-[50px]">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6 text-center">
            <p className="text-xs text-gray-500">
              <a
                href="https://renosparkstenantsunion.org"
                className="text-rstu-red hover:text-rstu-red-dark font-medium"
              >
                RSTU Main Site
              </a>
              {' · '}
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </a>
              {' · '}
              <span>© 2025 Reno-Sparks Tenants Union</span>
            </p>
          </div>
        </footer>

        {/* Version Footer for admins/organizers */}
        <VersionFooter />
      </main>
    </TabProvider>
    </AuthProvider>
    </LanguageProvider>
  )
}
