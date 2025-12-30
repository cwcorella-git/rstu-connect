'use client'

export function MissionSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How to Get Started Organizing
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Building tenant power starts with organization. Here's how to begin in your building.
          </p>
        </div>

        {/* Why Organize */}
        <div className="bg-white border-l-4 border-rstu-red rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Form a Tenants Association?
          </h3>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            Individual tenants often feel powerless. But when you organize together, you have real power to:
          </p>
          <ul className="space-y-2 text-base text-gray-700">
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Negotiate with landlords from a position of strength</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Share resources and knowledge about tenant rights</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Support each other through housing crises</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Address building-wide problems collectively</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Build community and solidarity</span>
            </li>
          </ul>
        </div>

        {/* Getting Started Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-2xl font-bold text-rstu-red mb-3">1</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Identify Core Issues
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              Talk to neighbors about what problems you all face. Maintenance? Rent increases? Discrimination? Start there.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-2xl font-bold text-rstu-red mb-3">2</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Find Your Allies
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              Look for neighbors who are frustrated, good communicators, and willing to volunteer time. Start with 3-5 people.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="text-2xl font-bold text-rstu-red mb-3">3</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Have Conversations
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              One-on-one talks build trust. Listen to their concerns, share your story, and gauge interest in collective action.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Get Help from RSTU
          </h3>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            You don't have to do this alone. The Reno Sparks Tenants Union offers:
          </p>
          <ul className="space-y-2 text-base text-gray-700 mb-6">
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Organizing support and strategic planning</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Know Your Rights education and trainings</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Connections to tenant-friendly attorneys and legal aid</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold">—</span>
              <span>Connection with other tenant organizers</span>
            </li>
          </ul>
          <p className="text-base text-gray-700 font-semibold">
            Read the full guide in our reading library for detailed steps, common challenges, legal protections, and more.
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
