'use client'

interface PhilosophyPillar {
  id: string
  title: string
  author: string
  quote: string
  description: string
  keyPoints: string[]
}

const PILLARS: PhilosophyPillar[] = [
  {
    id: 'municipalism',
    title: 'Libertarian Municipalism',
    author: 'Murray Bookchin',
    quote: '"Power cannot be used to abolish hierarchy; it can only reinforce it. We need confederal structures where power flows upward from assemblies of ordinary people, not from the top down."',
    description: 'Democracy is not a distant vote for distant politicians. It is tenants in a building deciding together how to live. Libertarian municipalism starts with neighborhood and building assemblies where ordinary people deliberate, decide, and act directly on the issues affecting their lives. These assemblies then confederate—linking together without centralizing authority—creating networks of power that remain accountable to those they represent. This is how we overcome the separation between rulers and ruled, and how we build power from the ground up.',
    keyPoints: [
      'Direct democracy: assemblies where tenants make decisions together',
      'Confederation: networks of equal groups, not hierarchies',
      'Accountability: representatives answerable to assemblies',
      'Localism with solidarity: decisions at the neighborhood level, coordinated across communities'
    ]
  },
  {
    id: 'mutual-aid',
    title: 'Mutual Aid',
    author: 'Peter Kropotkin',
    quote: '"Mutual aid is the tendency of all living organisms to help each other. Cooperation, not competition, is the natural state of survival."',
    description: 'The capitalist myth says we compete as isolated individuals fighting for survival. Mutual aid tells the truth: humans survive and flourish through cooperation. When a tenant faces eviction, their neighbors organize a defense. When rent becomes impossible, we pool resources. When the state fails the unhoused, we build shelter together. Mutual aid is not charity—it has no hierarchy of giver and receiver. It is solidarity: the reciprocal understanding that we survive together or not at all. It is how we meet each other\'s needs outside and against capitalist markets, building the relations of care that will sustain us in the liberated world we\'re building.',
    keyPoints: [
      'Solidarity as principle: an injury to one is an injury to all',
      'Reciprocity, not hierarchy: we all give and receive',
      'Collective care: meeting needs through mutual support',
      'Alternative to markets: resources distributed by need, not profit'
    ]
  },
  {
    id: 'dual-power',
    title: 'Dual Power',
    author: 'Tenants\' Rights Organizers',
    quote: '"We do not win by asking the landlord to be kind. We win by making our collective power so undeniable that the landlord has no choice but to concede. And as we win, we build the institutions of a world without landlords."',
    description: 'Dual power means fighting on two fronts simultaneously. First, we confront the power of landlords and the state with organized action: rent strikes, eviction defense, political pressure. We make collective power visible and irresistible. But confrontation alone cannot build the world we need. So second, we build alternative structures that prove another way is possible: tenant assemblies that govern democratically, mutual aid networks that meet needs collectively, cooperative housing that provides shelter without extraction. As we fight the old world, we construct the new world within it. Neither confrontation nor construction alone is enough—together they form a strategy that weakens landlord control while strengthening tenant power and prefiguring the liberated world we seek.',
    keyPoints: [
      'Resistance: confronting landlord power through organized struggle',
      'Construction: building democratic and cooperative alternatives',
      'Prefiguration: the means we use shape the world we create',
      'Integration: resistance and construction reinforce each other'
    ]
  }
]

export function PhilosophySection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Opening Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Our Organizing Philosophy
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            We don't just fight to win concessions from landlords. We fight to build a different kind of power—collective, democratic, and rooted in solidarity. Our philosophy rests on three pillars that work together to transform how we live, relate to each other, and understand what's possible.
          </p>
          <p className="text-base text-gray-600 italic">
            These are not separate strategies but interconnected principles that reinforce each other.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PILLARS.map((pillar) => (
            <div key={pillar.id} className="bg-white rounded-lg p-8 border border-gray-200 hover:border-rstu-red hover:shadow-lg transition-all duration-200">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-600 font-medium">— {pillar.author}</p>
              </div>

              {/* Quote */}
              <div className="bg-red-50 border-l-4 border-rstu-red p-4 mb-6">
                <p className="text-sm italic text-gray-700">
                  {pillar.quote}
                </p>
              </div>

              {/* Description */}
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                {pillar.description}
              </p>

              {/* Key Points */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Core Concepts:</p>
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

        {/* Closing Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-4xl mx-auto mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Three Pillars, One Power
          </h3>
          <div className="space-y-4 text-base text-gray-700">
            <p>
              These three pillars are not separate—they work together. <strong>Municipalism</strong> gives us the democratic form: how we decide together. <strong>Mutual aid</strong> gives us the social content: how we care for each other. <strong>Dual power</strong> gives us the strategy: how we confront landlord power while building alternatives.
            </p>
            <p>
              When we <strong>build tenant associations</strong>, we're practicing municipalism—creating assemblies where ordinary tenants make decisions that affect their lives. When we <strong>organize mutual aid networks</strong>, we're proving that we can meet each other's needs without landlord profiteers. When we <strong>wage direct action campaigns</strong>, we're exercising dual power—resisting exploitation while building the tenant power structures that will sustain us in a liberated future.
            </p>
            <p>
              This is how we move from complaint to power, from survival to liberation. Not by accepting the world as it is, but by actively constructing the world as it should be.
            </p>
          </div>
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
