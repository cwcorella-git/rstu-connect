'use client'

import { ReactNode } from 'react'
import { TabProvider } from '@/contexts/TabContext'
import { Navigation } from '@/components/Navigation'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <TabProvider>
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-rstu-red">RSTU</span>
                <span className="text-sm text-gray-600">Connect</span>
              </div>
              <Navigation />
            </div>
          </div>
        </header>

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
                href="mailto:renotenantsunion@gmail.com"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </a>
              {' · '}
              <span>© 2025 Reno-Sparks Tenants Union</span>
            </p>
          </div>
        </footer>
      </main>
    </TabProvider>
  )
}
