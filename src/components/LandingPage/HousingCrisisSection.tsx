'use client'

import { useState } from 'react'
import { CitationLink } from '@/components/Citations'

export function HousingCrisisSection() {
  const [expandData, setExpandData] = useState(false)

  return (
    <section className="py-10 sm:py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            The Housing Crisis in Reno-Sparks
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Housing is becoming impossible to afford. Corporate landlords control thousands of units and extract maximum profit from tenants.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stat 1: Corporate Control */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-2">
              <div className="text-3xl font-bold text-rstu-red">50+<CitationLink id="rstu-corporate-analysis" number={1} /></div>
              <p className="text-sm font-semibold text-gray-700">Corporate entities</p>
            </div>
            <p className="text-xs text-gray-600">Control thousands of rental units across Reno-Sparks</p>
          </div>

          {/* Stat 2: Hidden Fees */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-2">
              <div className="text-3xl font-bold text-rstu-red">$200–400<CitationLink id="hidden-fees-analysis" number={2} /></div>
              <p className="text-sm font-semibold text-gray-700">Hidden fees per month</p>
            </div>
            <p className="text-xs text-gray-600">Beyond rent: application, pet, parking, utility fees</p>
          </div>

          {/* Stat 3: Largest Portfolio */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-2">
              <div className="text-3xl font-bold text-rstu-red">3,335<CitationLink id="gage-village-portfolio" number={3} /></div>
              <p className="text-sm font-semibold text-gray-700">Units controlled</p>
            </div>
            <p className="text-xs text-gray-600">GAGE VILLAGE (single entity in Reno)</p>
          </div>

          {/* Stat 4: Profit Extraction */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-2">
              <div className="text-3xl font-bold text-rstu-red">$103M<CitationLink id="gage-village-portfolio" number={3} /></div>
              <p className="text-sm font-semibold text-gray-700">Total assessed value</p>
            </div>
            <p className="text-xs text-gray-600">Wealth extracted through rent from working tenants</p>
          </div>
        </div>

        {/* Main Crisis Description */}
        <div className="bg-white rounded-lg p-8 border-l-4 border-rstu-red shadow-sm mb-8">
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            <strong>This isn&apos;t an accident.</strong> The housing crisis is a system designed to profit off our need for shelter. Corporate landlords have systematized the extraction of wealth from working tenants through three mechanisms:
          </p>
          <ul className="space-y-3 text-base text-gray-700">
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">1.</span>
              <span><strong>Rent increases:</strong> Landlords raise rents every year—sometimes by 20% or more<CitationLink id="rent-increase-20-percent" number={4} />—pushing families toward impossible choices.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">2.</span>
              <span><strong>Hidden fees:</strong> Parking, pet, application, and utility fees add $200–400/month<CitationLink id="hidden-fees-analysis" number={2} /> beyond the advertised rent.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rstu-red font-bold flex-shrink-0">3.</span>
              <span><strong>Portfolio consolidation:</strong> Corporations buy multiple properties to control entire neighborhoods, giving them power over entire communities.</span>
            </li>
          </ul>
        </div>

        {/* Real Story */}
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            A Real Story
          </h3>
          <blockquote className="text-base text-gray-700 italic border-l-4 border-gray-300 pl-6 mb-4">
            &quot;I work two jobs. I make decent money. But my landlord raised my rent from $1,200 to $1,600 in one month. That&apos;s $4,800 a year more. I can&apos;t afford the increase and the hidden fees. I&apos;m choosing between paying rent and getting medicine for my daughter.&quot;
          </blockquote>
          <p className="text-sm text-gray-600">
            — Maria, tenant in Sparks
          </p>
        </div>

        {/* Expandable Data Source Section */}
        <div>
          <button
            onClick={() => setExpandData(!expandData)}
            className="w-full text-left flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">
              Where does this data come from?
            </span>
            <span className={`transform transition-transform ${expandData ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandData && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              <p className="mb-4">
                This data comes from Washoe County property records and RSTU&apos;s analysis of corporate landlord portfolios in the Reno-Sparks area.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>Property data:</strong> Washoe County Assessor&apos;s Office public database (16,000+ rental properties)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>Corporate ownership:</strong> Address-based portfolio analysis (companies with multiple properties)</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span><strong>Rent and fees:</strong> Market analysis of rental listings and tenant reports</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-gray-600">
                Data reflects conditions as of 2025. For the full analysis, see &quot;Exposed: Shocking Reasons Rents and Hidden Fees Are Too High&quot; in the reading library.
              </p>
            </div>
          )}
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
