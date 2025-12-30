'use client'

import { useEffect, useState } from 'react'
import type { ReadingDocument } from '@/lib/getReadingData'
import readingManifest from '@/data/reading-manifest.json'

interface FeaturedReadingsSectionProps {
  onNavigate: (tab: string) => void
}

export function FeaturedReadingsSection({ onNavigate }: FeaturedReadingsSectionProps) {
  const [featuredDocs, setFeaturedDocs] = useState<ReadingDocument[]>([])

  useEffect(() => {
    // Load featured documents from localStorage or use staff picks
    if (typeof window !== 'undefined') {
      const featuredKey = 'rstu_featured_documents'
      const featuredIdsStr = localStorage.getItem(featuredKey)
      const featuredIds = featuredIdsStr ? JSON.parse(featuredIdsStr) : []

      const allDocs = readingManifest.documents as ReadingDocument[]

      let selected: ReadingDocument[] = []

      if (featuredIds.length > 0) {
        // Show admin-curated featured documents
        selected = allDocs
          .filter(doc => featuredIds.includes(doc.id))
          .slice(0, 6) // Max 6 documents
      } else {
        // Fallback to hardcoded staff picks
        const staffPickSlugs = [
          'how-to-organize-a-tenants-association',
          'community-democracy-and-mutual-aid',
          'how-to-organize-a-tenants-association-detailed',
          'social-ecology-and-communalism',
          'mutual-aid-a-factor-of-evolution',
          'mission-statement-and-core-values'
        ]

        selected = allDocs
          .filter(doc => staffPickSlugs.includes(doc.slug))
          .slice(0, 6)

        // If we still don't have enough, add recent documents from organizing category
        if (selected.length < 4) {
          const organizingDocs = allDocs
            .filter(doc => doc.category === 'organizing' && !staffPickSlugs.includes(doc.slug))
            .slice(0, 6 - selected.length)
          selected = [...selected, ...organizingDocs]
        }
      }

      setFeaturedDocs(selected)
    }
  }, [])

  const handleDocClick = (slug: string) => {
    // Navigate to reading tab and trigger document selection
    // The reading tab will check URL params for doc selection
    if (typeof window !== 'undefined') {
      // Store the selected doc in localStorage temporarily
      localStorage.setItem('rstu_selected_reading_doc', slug)
    }
    onNavigate('reading')
  }

  return (
    <section className="py-16 sm:py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Start Here: Essential Reading
          </h2>
          <p className="text-lg text-gray-600">
            Dive into RSTU's library of 900+ organizing resources
          </p>
        </div>

        {/* Featured Documents Grid */}
        {featuredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleDocClick(doc.slug)}
                className="group text-left bg-white rounded-lg border border-gray-200 p-6 hover:border-rstu-red hover:shadow-lg transition-all duration-200"
              >
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full group-hover:bg-rstu-red group-hover:text-white transition-colors">
                    {doc.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-rstu-red transition-colors line-clamp-2">
                  {doc.title}
                </h3>

                {/* Author */}
                {doc.author && (
                  <p className="text-sm text-gray-600 mb-3">
                    by <span className="font-semibold">{doc.author}</span>
                  </p>
                )}

                {/* Date */}
                {doc.date && (
                  <p className="text-xs text-gray-500 mb-3">
                    {doc.date}
                  </p>
                )}

                {/* Excerpt */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-3">
                  {doc.excerpt}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-rstu-red font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Read</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading featured documents...</p>
          </div>
        )}

        {/* Explore Library CTA */}
        <div className="mt-12 bg-gradient-to-r from-rstu-red to-red-700 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Explore the Full Library</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            These are just a few highlights. Dive into our complete reading library with 900+ documents on organizing, theory, housing justice, labor history, and mutual aid.
          </p>
          <button
            onClick={() => onNavigate('reading')}
            className="inline-block px-8 py-3 bg-white text-rstu-red font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse Full Library →
          </button>
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
