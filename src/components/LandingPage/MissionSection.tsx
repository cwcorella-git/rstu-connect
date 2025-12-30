'use client'

export function MissionSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Organizing Philosophy
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            RSTU fights for housing justice based on principles of solidarity, mutual aid, and collective power.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white border-l-4 border-rstu-red rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Our Mission
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            We are a tenant organization fighting for safe and secure housing for all in the Reno-Sparks area. We believe that housing is a human right, not a commodity, and that everyone deserves control over their living situation.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Solidarity */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Solidarity
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Solidarity forms the basis of our organization. An injury to one is an injury to all. Our strength is in numbers—we will not win if we fight alone.
            </p>
          </div>

          {/* Mutual Aid */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Mutual Aid & Collective Action
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Through collective action and mutual aid, we organize to fight back against displacement and abuse. We support each other through housing struggles.
            </p>
          </div>

          {/* Justice is Indivisible */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Housing Justice is Indivisible
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              We can't fight for tenant rights while ignoring the rights of unhoused community members. Today's tenants are tomorrow's unhoused without strong protections.
            </p>
          </div>

          {/* Systemic Change */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Systemic Solutions
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Real solutions to housing insecurity require changing the systems that prioritize profit over people. We demand systemic change, not charity.
            </p>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="bg-gray-100 rounded-lg p-8 border-l-4 border-rstu-red mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Our Vision
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            We are committed to remaining an all-volunteer organization run democratically by tenants. We aim to build tenant power through mass participation and solidarity across communities of tenants. This includes holding landlords accountable, educating tenants about their rights and protections, eviction defense, and building community control over housing.
          </p>
        </div>

        {/* How We Organize */}
        <div className="bg-white border-l-4 border-rstu-red rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            How We Organize
          </h3>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            RSTU operates through democratic building assemblies where every tenant has an equal voice. Buildings organize into neighborhood associations and form alliances with other associations for citywide campaigns. This approach—sometimes called libertarian municipalism or confederalism—keeps power with ordinary tenants rather than concentrating it in leadership.
          </p>
          <p className="text-sm text-rstu-red font-semibold">
            Learn more in our Philosophy section ↓
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
