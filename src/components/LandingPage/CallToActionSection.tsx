'use client'

interface CallToActionSectionProps {
  onEnter: () => void
  onNavigate: (tab: string) => void
}

interface CTA {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
  isExternal?: boolean
  href?: string
}

export function CallToActionSection({ onEnter, onNavigate }: CallToActionSectionProps) {
  const ctas: CTA[] = [
    {
      id: 'building',
      title: 'Find Your Building',
      description: 'Search our database of 16,000+ rental properties in Reno-Sparks. Find your neighbors, check organizing status, and connect with other tenants.',
      icon: '🏢',
      action: () => {
        onNavigate('home')
      }
    },
    {
      id: 'profile',
      title: 'Create Your Profile',
      description: 'Join RSTU officially. Set up your tenant profile, connect with organizers, and gain access to organizing tools for your building.',
      icon: '👤',
      action: () => {
        onNavigate('profile')
      }
    },
    {
      id: 'library',
      title: 'Explore the Library',
      description: 'Access 900+ organizing resources. Learn tenant rights, organizing tactics, theory, and mutual aid strategies.',
      icon: '📚',
      action: () => {
        onNavigate('reading')
      }
    },
    {
      id: 'main-site',
      title: 'Visit Main Website',
      description: 'Learn more about RSTU, our campaigns, upcoming events, and how to get involved in person.',
      icon: '🔗',
      action: () => {
        window.open('https://renosparkstenantsunion.org', '_blank')
      },
      isExternal: true,
      href: 'https://renosparkstenantsunion.org'
    }
  ]

  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Involved?
          </h2>
          <p className="text-lg text-gray-600">
            Tenant power starts with you. Here's how to take the next step.
          </p>
        </div>

        {/* CTA Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ctas.map((cta) => (
            <button
              key={cta.id}
              onClick={cta.action}
              className="group flex flex-col h-full bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-6 hover:border-rstu-red hover:from-red-50 hover:to-white transition-all duration-200 text-left"
            >
              <span className="text-4xl mb-4">{cta.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rstu-red transition-colors">
                {cta.title}
              </h3>
              <p className="text-sm text-gray-600 flex-grow mb-4">
                {cta.description}
              </p>
              <div className="flex items-center gap-2 text-rstu-red font-semibold text-sm">
                <span>Start</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Main CTA - Enter RSTU Connect */}
        <div className="bg-gradient-to-r from-rstu-red to-red-700 rounded-lg p-8 sm:p-12 text-white text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Start Organizing Today
          </h3>
          <p className="text-base sm:text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            RSTU Connect is your tool for finding neighbors, organizing with your building, and building tenant power from the ground up.
          </p>
          <button
            onClick={onEnter}
            className="inline-block px-10 py-4 bg-white text-rstu-red font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            Enter RSTU Connect →
          </button>
        </div>

        {/* Info box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900">
            <strong>New to organizing?</strong> Start with our "<strong>How to Organize a Tenants Association</strong>" guide in the reading library. We'll walk you through every step.
          </p>
        </div>
      </div>
    </section>
  )
}
