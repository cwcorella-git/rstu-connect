'use client'

export function WhatWeDoSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How Tenants Win
          </h2>
          <div className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
            <p className="mb-4">
              Power doesn't come from landlords or politicians—it comes from us, organized collectively. We build tenant power through three interconnected strategies that reinforce each other.
            </p>
            <p>
              These strategies aren't new. They're rooted in decades of tenant movements, labor struggles, and anarchist theory about how ordinary people take control of their own lives. They work because they're designed to shift power from those who profit from housing toward those who need it to survive.
            </p>
          </div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Build Tenant Associations
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase">
              Libertarian Municipalism: Direct Democracy from the Ground Up
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Start with your building. Organize your neighbors to address maintenance problems, fight unjust evictions, and negotiate with landlords from a position of collective power. Building assemblies aren't just tactics—they're the foundation for democratic decision-making controlled by tenants, not leadership.
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              Power flows upward from assemblies, not downward from leaders
            </p>
          </div>

          {/* Card 2: Mutual Aid Networks */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Mutual Aid Networks
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase">
              Kropotkin: Solidarity Over Charity
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              When landlords retaliate, when rent becomes impossible, when someone loses housing—we support each other. Mutual aid isn't charity; it's solidarity. We share resources, knowledge, and care based on what people need and what we have to give, with no hierarchy and no judgment.
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              An injury to one is an injury to all
            </p>
          </div>

          {/* Card 3: Direct Action & Campaigns */}
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-6 w-12 h-12 bg-rstu-red bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-rstu-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Direct Action & Campaigns
            </h3>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase">
              Class Struggle: Confronting Power Where It Is
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              We demand change through organized action: eviction defense, rent strikes, city council pressure, and campaigns that make landlords and politicians feel our collective power. Landlords won't voluntarily give up profit—we have to take it back through confrontation and coordinated action.
            </p>
            <p className="text-sm text-rstu-red font-semibold">
              Without struggle, there is no change
            </p>
          </div>
        </div>

        {/* Bottom explanation */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <p className="text-base text-gray-900 leading-relaxed mb-4">
            <strong>These three strategies embody a coherent philosophy of power.</strong>
          </p>
          <ul className="space-y-2 text-base text-gray-700">
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">•</span>
              <span><strong>Municipalism:</strong> Building democratic power through tenant assemblies, bottom-up decision-making, and confederation between groups</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">•</span>
              <span><strong>Mutual Aid:</strong> Building solidarity by meeting each other's needs collectively, outside of capitalist hierarchies</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">•</span>
              <span><strong>Dual Power:</strong> Resisting landlord exploitation AND building alternative structures that prove we can run housing ourselves</span>
            </li>
          </ul>
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
