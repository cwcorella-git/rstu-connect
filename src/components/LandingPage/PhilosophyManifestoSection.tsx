'use client'

export function PhilosophyManifestoSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Opening Manifesto */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Why We Organize
          </h2>

          <div className="bg-gradient-to-r from-rstu-red to-red-600 text-white rounded-lg p-8 sm:p-12">
            <p className="text-lg sm:text-xl leading-relaxed font-medium">
              <span className="block mb-4">
                Housing is a human right, not a commodity to be bought and sold for profit.
              </span>
              <span className="block mb-4">
                When landlords own our homes, they own our power.
              </span>
              <span className="block">
                We organize to reclaim that power—collectively.
              </span>
            </p>
          </div>
        </div>

        {/* Core Beliefs - Three Essential Principles */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What We Believe
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Belief 1: Housing is a Right */}
            <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-rstu-red">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Housing is a Human Right
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">
                Everyone deserves a safe, stable, and comfortable home—no matter their income, background, or circumstance. Housing is not a luxury for the wealthy. It is essential to human dignity.
              </p>
            </div>

            {/* Belief 2: Class Struggle */}
            <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-rstu-red">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Landlord & Tenant Interests Are Irreconcilable
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">
                There is a fundamental conflict: landlords profit from extracting wealth from tenants. Their interests can never align with ours. We cannot negotiate away a system designed to exploit us.
              </p>
            </div>

            {/* Belief 3: Solidarity */}
            <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-rstu-red">
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Solidarity is Our Strength
              </h4>
              <p className="text-base text-gray-700 leading-relaxed">
                An injury to one is an injury to all. Our power comes from standing together—across buildings, neighborhoods, and communities. When we fight collectively, we win.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-400 font-semibold">≈</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
      </div>
    </section>
  )
}
