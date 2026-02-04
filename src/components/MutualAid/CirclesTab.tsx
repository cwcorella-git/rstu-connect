'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getCircles,
  getMyCircles,
  getRecommendedCircles,
  searchCircles,
  getCirclesByCategory,
  type Circle,
  type CircleCategory,
  CIRCLE_CATEGORIES,
} from '@/lib/storage/circleStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import { CircleCard } from './CircleCard'
import { CreateCircleModal } from './CreateCircleModal'
import { CircleDetailView } from './CircleDetailView'

type ViewMode = 'discover' | 'my_circles'

export function CirclesTab() {
  const { t } = useLanguage()
  const [viewMode, setViewMode] = useState<ViewMode>('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CircleCategory | 'all'>('all')
  const [circles, setCircles] = useState<Circle[]>([])
  const [recommendedCircles, setRecommendedCircles] = useState<Circle[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null)

  const profile = getCurrentProfile()

  const loadCircles = useCallback(() => {
    if (viewMode === 'my_circles') {
      setCircles(getMyCircles())
    } else {
      if (searchQuery.trim()) {
        setCircles(searchCircles(searchQuery))
      } else if (selectedCategory !== 'all') {
        setCircles(getCirclesByCategory(selectedCategory))
      } else {
        setCircles(getCircles())
      }
    }

    // Load recommendations
    if (profile) {
      setRecommendedCircles(getRecommendedCircles(profile))
    }
  }, [viewMode, searchQuery, selectedCategory, profile])

  useEffect(() => {
    loadCircles()
  }, [loadCircles])

  const handleCircleCreated = (circle: Circle) => {
    setShowCreateModal(false)
    loadCircles()
    setSelectedCircle(circle)
  }

  const handleCircleSelect = (circle: Circle) => {
    setSelectedCircle(circle)
  }

  const handleBack = () => {
    setSelectedCircle(null)
    loadCircles()
  }

  // Show circle detail view if a circle is selected
  if (selectedCircle) {
    return (
      <CircleDetailView
        circle={selectedCircle}
        onBack={handleBack}
        onUpdate={loadCircles}
      />
    )
  }

  const categoryKeys = Object.keys(CIRCLE_CATEGORIES) as CircleCategory[]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('circles.title') || 'Circles'}
            </h2>
            <p className="text-sm text-gray-500">
              {t('circles.subtitle') || 'Interest-based groups created by tenants'}
            </p>
          </div>
          {profile && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              {t('circles.create') || 'Create Circle'}
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setViewMode('discover')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'discover'
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('circles.discover') || 'Discover'}
          </button>
          <button
            onClick={() => setViewMode('my_circles')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'my_circles'
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('circles.myCircles') || 'My Circles'}
          </button>
        </div>

        {/* Search & Filters (only in discover mode) */}
        {viewMode === 'discover' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('circles.searchPlaceholder') || 'Search circles...'}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('circles.allCategories') || 'All'}
              </button>
              {categoryKeys.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t(`circles.category.${category}`) || CIRCLE_CATEGORIES[category]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Recommended Circles (only if we have recommendations and in discover mode) */}
        {viewMode === 'discover' && recommendedCircles.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {t('circles.recommended') || 'Recommended for you'}
            </h3>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {recommendedCircles.slice(0, 4).map(circle => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  onSelect={handleCircleSelect}
                  onUpdate={loadCircles}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Circle List */}
        {circles.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {circles.map(circle => (
              <CircleCard
                key={circle.id}
                circle={circle}
                onSelect={handleCircleSelect}
                onUpdate={loadCircles}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {viewMode === 'my_circles'
                ? t('circles.noMyCircles') || 'You haven\'t joined any circles yet'
                : t('circles.noCircles') || 'No circles found'
              }
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {viewMode === 'my_circles'
                ? t('circles.noMyCirclesHelp') || 'Discover circles that match your interests'
                : t('circles.noCirclesHelp') || 'Be the first to create a circle'
              }
            </p>
            {profile && viewMode === 'my_circles' && (
              <button
                onClick={() => setViewMode('discover')}
                className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700 text-sm"
              >
                {t('circles.discoverCircles') || 'Discover Circles'}
              </button>
            )}
            {profile && viewMode === 'discover' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700 text-sm"
              >
                {t('circles.createFirst') || 'Create the First Circle'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <CreateCircleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCircleCreated}
        />
      )}
    </div>
  )
}
