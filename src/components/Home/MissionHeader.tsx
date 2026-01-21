'use client'

import { useState, useEffect, useMemo } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { useLanguage } from '@/contexts/LanguageContext'
import missionQuotes from '@/data/mission-quotes.json'

interface MissionHeaderProps {
  buildings: EnhancedBuilding[]
  onAction: (action: 'report' | 'meeting' | 'rights') => void
  isNewUser?: boolean
}

const STORAGE_KEY = 'rstu-mission-header-expanded'

export function MissionHeader({ buildings, onAction, isNewUser = false }: MissionHeaderProps) {
  const { t } = useLanguage()

  // Default expanded for new users, collapsed for returning users
  const [isExpanded, setIsExpanded] = useState(isNewUser)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load preference from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsExpanded(stored === 'true')
    } else if (isNewUser) {
      // First time visitor - default to expanded
      setIsExpanded(true)
    }
    setIsHydrated(true)
  }, [isNewUser])

  // Save preference when changed (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, String(isExpanded))
    }
  }, [isExpanded, isHydrated])

  // Rotate quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % missionQuotes.quotes.length)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate stats from buildings data
  const stats = useMemo(() => {
    if (buildings.length === 0) {
      return {
        totalRentals: 0,
        corporatePercent: 0,
        rentIncrease: 31, // Static from local crisis data
        activeMembers: 0
      }
    }

    const corporateOwned = buildings.filter(b => b.isCorporateOwned).length
    const corporatePercent = Math.round((corporateOwned / buildings.length) * 100)

    // Count properties with active organizing (from canvass data if available)
    // For now, estimate based on organizing status
    const activeProperties = buildings.filter(b => b.organizingStatus === 'active').length

    return {
      totalRentals: buildings.length,
      corporatePercent,
      rentIncrease: 31, // 5-year rent increase from local crisis data
      activeMembers: activeProperties * 3 // Rough estimate: 3 members per active property
    }
  }, [buildings])

  const currentQuote = missionQuotes.quotes[currentQuoteIndex]

  // Don't render different content during SSR vs hydration
  if (!isHydrated) {
    return (
      <div className="bg-gray-900 text-white">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">{t('mission.tagline')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white flex-shrink-0">
      {/* Always visible: Tagline bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-rstu-red">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </span>
          <span className="text-sm font-medium">{t('mission.tagline')}</span>
        </div>
        <span className="text-gray-400 text-xs flex items-center gap-1">
          {isExpanded ? t('mission.collapse') : t('mission.expand')}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">
              {t('mission.title')}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              {t('mission.subtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-700">
            <div className="bg-gray-800 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-white">
                {stats.totalRentals.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">{t('mission.stats.rentals')}</p>
            </div>
            <div className="bg-gray-800 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-rstu-red">
                {stats.rentIncrease}%
              </p>
              <p className="text-xs text-gray-400">{t('mission.stats.rentIncrease')}</p>
            </div>
            <div className="bg-gray-800 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-400">
                {stats.corporatePercent}%
              </p>
              <p className="text-xs text-gray-400">{t('mission.stats.corporate')}</p>
            </div>
            <div className="bg-gray-800 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {stats.activeMembers}
              </p>
              <p className="text-xs text-gray-400">{t('mission.stats.members')}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-gray-700">
            <button
              onClick={() => onAction('report')}
              className="px-3 py-1.5 bg-rstu-red text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              {t('mission.action.report')}
            </button>
            <button
              onClick={() => onAction('meeting')}
              className="px-3 py-1.5 bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors"
            >
              {t('mission.action.meeting')}
            </button>
            <button
              onClick={() => onAction('rights')}
              className="px-3 py-1.5 bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors"
            >
              {t('mission.action.rights')}
            </button>
          </div>

          {/* Featured Quote */}
          <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-start gap-2">
              <span className="text-gray-500 text-lg leading-none">&quot;</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 italic leading-relaxed">
                  {currentQuote.text}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  — {currentQuote.author}
                  {currentQuote.source && (
                    <span className="text-gray-600">, {currentQuote.source}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
