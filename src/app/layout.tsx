import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reno-Sparks Tenants Union',
  description: 'Organizing platform for tenant power in Reno-Sparks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <main className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-rstu-red">RSTU</span>
                  <span className="text-sm text-gray-600">Connect</span>
                </div>
                <nav className="flex items-center space-x-6 text-sm">
                  <a className="text-gray-900 hover:text-gray-700 font-medium" href="/">
                    Home
                  </a>
                  <a className="text-gray-600 hover:text-gray-900" href="/toolkit">
                    Toolkit
                  </a>
                  <a className="text-gray-600 hover:text-gray-900" href="/help">
                    Help
                  </a>
                  <a
                    href="https://renosparkstenantsunion.org"
                    className="text-rstu-red hover:text-rstu-red-dark font-medium"
                  >
                    Main site
                  </a>
                </nav>
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
      </body>
    </html>
  )
}
