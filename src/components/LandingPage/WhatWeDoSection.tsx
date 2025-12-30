'use client'

export function WhatWeDoSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How Tenants Win
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tenants organized together have power. RSTU supports three key strategies for building that power.
          </p>
        </div>

        {/* Three Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Building Associations */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9m11 0v-7a6 6 0 00-6-6 6 6 0 00-6 6v7m12 0H7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Build Tenant Associations
            </h3>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Start with your building. Organize your neighbors to address maintenance problems, fight unjust evictions, and negotiate with landlords from a position of collective power.
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              Local organizing builds the foundation for everything else
            </p>
          </div>

          {/* Card 2: Mutual Aid Networks */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Mutual Aid Networks
            </h3>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              When landlords retaliate, when rent becomes impossible, when someone loses housing—we support each other. Mutual aid builds solidarity and keeps our community strong.
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              We don't abandon each other. We take care of each other.
            </p>
          </div>

          {/* Card 3: Direct Action & Campaigns */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Direct Action & Campaigns
            </h3>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              We demand change through organized action: city council testimony, eviction defense, rent strikes, and campaigns against bad landlords. Power comes from coordinated, visible organizing.
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              When we fight together, we win together.
            </p>
          </div>
        </div>

        {/* Bottom explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-base text-blue-900 leading-relaxed">
            <strong>These strategies work together.</strong> Local associations provide the foundation. Mutual aid strengthens our bonds and shows collective care. Direct action demonstrates our power and forces change. All three are necessary for building housing justice.
          </p>
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
