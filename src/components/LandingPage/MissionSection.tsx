'use client'

export function MissionSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our Mission and Vision
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Statement Card */}
          <div className="bg-white border-l-4 border-rstu-red rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Mission
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              We are a tenant organization fighting for safe and secure housing for all in the Reno-Sparks area. We believe that housing is a human right, not a commodity, and that everyone deserves control over their living situation.
            </p>
          </div>

          {/* Vision Statement Card */}
          <div className="bg-white border-l-4 border-rstu-red rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vision
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              Through collective action and mutual aid, we organize to fight back against the displacement and abuse of tenants. We hold landlords accountable, educate tenants about their rights, and organize eviction defense. We remain an all volunteer organization run democratically by tenants, building tenant power through mass participation and solidarity.
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
