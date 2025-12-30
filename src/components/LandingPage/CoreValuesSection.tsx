'use client'

import { useState } from 'react'

interface CoreValue {
  id: string
  title: string
  description: string
}

const CORE_VALUES: CoreValue[] = [
  {
    id: 'housing-right',
    title: 'Housing is a Human Right',
    description: 'Everyone deserves a safe, stable, and comfortable home, regardless of circumstance. The commodification of housing has led to vast inequality. We fight for a city where no one is left without a home.'
  },
  {
    id: 'tenant-org',
    title: 'We Are a Tenants Organization',
    description: 'We fight for tenants, not for housing. The crisis is not due to lack of housing and won\'t be solved simply with more development. True justice is achieved by giving power to tenants to control their own housing.'
  },
  {
    id: 'houselessness',
    title: 'Houselessness',
    description: 'Houselessness is an inevitable consequence of treating housing like a commodity. We oppose any laws or policies that criminalize houselessness. A "tenant" includes anyone who does not control their housing, whether they currently have a home or not.'
  },
  {
    id: 'anti-gentrification',
    title: 'Anti-Gentrification',
    description: 'We are opposed to the displacement of people and communities through gentrification. Gentrification is not inevitable—it\'s a deliberate process led by stakeholders with financial interests.'
  },
  {
    id: 'class-struggle',
    title: 'Landlord & Tenant Interests Are Irreconcilable',
    description: 'There is a fundamental conflict between landlord and tenant interests. We reject any policy that attempts to paper over this conflict and advocate for a strategy of class struggle. Everyone needs housing, but no one needs a landlord.'
  },
  {
    id: 'solidarity',
    title: 'Solidarity',
    description: 'Solidarity forms the basis of our organization. We commit to having each other\'s backs. An injury to one is an injury to all. Our strength is in numbers.'
  },
  {
    id: 'equality',
    title: 'Equality',
    description: 'We fight for housing for all regardless of income, race, gender identity, sexual orientation, immigration status, and ability. We recognize the history of discriminatory housing policies targeting Black and Brown communities. Racial justice is essential to tenant liberation.'
  },
  {
    id: 'language-justice',
    title: 'Language Justice',
    description: 'We are committed to language justice and creating fully bilingual spaces. Everyone has the right to understand and be understood in their most comfortable language.'
  },
  {
    id: 'land-back',
    title: 'Land Back',
    description: 'Reno-Sparks is on the occupied and unceded territory of the Numu (Northern Paiute), Newe (Western Shoshone), and Wašiw (Washoe) peoples. The housing crisis is rooted in settler colonialism. We support demands for Land Back by Indigenous peoples.'
  }
]

export function CoreValuesSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600">
            Nine principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CORE_VALUES.map((value) => (
            <button
              key={value.id}
              onClick={() => toggleExpanded(value.id)}
              className={`text-left p-6 rounded-lg border-2 transition-all duration-200 ${
                expandedId === value.id
                  ? 'border-rstu-red bg-red-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-rstu-red'
              }`}
            >
              {/* Title (always visible) */}
              <div className="flex items-start justify-between gap-3">
                <h3 className={`font-bold text-base leading-tight text-left ${
                  expandedId === value.id ? 'text-rstu-red' : 'text-gray-900'
                }`}>
                  {value.title}
                </h3>
                <span className={`text-lg flex-shrink-0 transition-transform ${
                  expandedId === value.id ? 'rotate-180' : ''
                }`}>
                  {expandedId === value.id ? '▼' : '▶'}
                </span>
              </div>

              {/* Description (only when expanded) */}
              {expandedId === value.id && (
                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 font-semibold">≈</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
    </section>
  )
}
