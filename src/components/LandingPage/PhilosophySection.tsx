'use client'

interface PhilosophyPillar {
  id: string
  title: string
  author: string
  description: string
  keyPoints: string[]
}

const PILLARS: PhilosophyPillar[] = [
  {
    id: 'municipalism',
    title: 'Libertarian Municipalism',
    author: 'Murray Bookchin',
    description: 'We organize neighborhood by neighborhood, building by building. Democracy starts in our apartment complexes and expands through confederation—not hierarchies, but networks of equal assemblies making decisions collectively.',
    keyPoints: [
      'Neighborhood assemblies for direct democracy',
      'Democratic confederalism between groups',
      'Power from the ground up, not top-down',
      'Community control of resources and decisions'
    ]
  },
  {
    id: 'mutual-aid',
    title: 'Mutual Aid',
    author: 'Peter Kropotkin & RSTU',
    description: 'Mutual aid is solidarity, not charity. We organize collectively to meet our needs and support each other through struggles. An injury to one is an injury to all. When tenants stand together, we\'re unstoppable.',
    keyPoints: [
      'Reciprocal help and support networks',
      'Collective problem-solving',
      'No saviors—we save each other',
      'Solidarity across all communities'
    ]
  },
  {
    id: 'dual-power',
    title: 'Dual Power',
    author: 'Tenants\' Rights Organizers',
    description: 'We build power in two ways: fighting back against bad landlords AND creating alternative structures that meet our needs outside capitalist control. We\'re not just defending ourselves—we\'re building the new world.',
    keyPoints: [
      'Resist landlord exploitation (power against)',
      'Build tenant assemblies and governance',
      'Create mutual aid networks',
      'Develop cooperative solutions'
    ]
  }
]

export function PhilosophySection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Organizing Philosophy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three pillars of how we think about power, community, and change
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="bg-white rounded-lg p-8 border border-gray-200 hover:border-rstu-red hover:shadow-lg transition-all duration-200">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-600">by {pillar.author}</p>
              </div>

              {/* Description */}
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                {pillar.description}
              </p>

              {/* Key Points */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Key Ideas:</p>
                <ul className="space-y-2">
                  {pillar.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-rstu-red font-bold flex-shrink-0">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 font-semibold">≈</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
      </div>
    </section>
  )
}
