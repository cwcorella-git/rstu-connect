'use client'

interface LandingFooterProps {
  onEnter: () => void
}

export function LandingFooter({ onEnter }: LandingFooterProps) {
  return (
    <footer className="py-12 px-4 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-300 mb-6">
            Ready to organize with your neighbors?
          </p>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-2 px-8 py-3 bg-rstu-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Enter RSTU Connect
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Footer info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-white mb-3">About RSTU</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Reno-Sparks Tenants Union is Nevada's first tenants union. We organize for safe housing, tenant power, and a world where housing is a human right, not a commodity.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-white mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={onEnter} className="text-gray-400 hover:text-rstu-red transition-colors">
                  Property Directory
                </button>
              </li>
              <li>
                <button onClick={onEnter} className="text-gray-400 hover:text-rstu-red transition-colors">
                  Reading Library
                </button>
              </li>
              <li>
                <button onClick={onEnter} className="text-gray-400 hover:text-rstu-red transition-colors">
                  Organizing Tools
                </button>
              </li>
              <li>
                <a href="https://renosparkstenantsunion.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-rstu-red transition-colors">
                  Main Website
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-3">Get In Touch</h3>
            <p className="text-sm text-gray-400 mb-3">
              Questions about organizing? Want to get involved?
            </p>
            <a href="https://renosparkstenantsunion.org" target="_blank" rel="noopener noreferrer" className="inline-block text-rstu-red font-semibold text-sm hover:underline">
              Visit our main site →
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <p>
            RSTU Connect © {new Date().getFullYear()} • Made by tenants, for tenants
          </p>
          <p className="mt-2 text-xs">
            On the occupied/unceded territory of the Numu, Newe, and Wašiw peoples
          </p>
        </div>
      </div>
    </footer>
  )
}
