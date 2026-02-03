'use client'

import { useState, useEffect } from 'react'
import { useOnboardingSafe } from '@/contexts/OnboardingContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface ChecklistItemConfig {
  key: string
  labelKey: string
  descKey: string
  action?: () => void
}

interface OnboardingChecklistProps {
  onNavigate?: (tab: string) => void
  className?: string
}

export function OnboardingChecklist({ onNavigate, className = '' }: OnboardingChecklistProps) {
  const onboarding = useOnboardingSafe()
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  // Delay visibility to prevent flash during hydration
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Don't render if no onboarding context or checklist dismissed
  if (!onboarding || !isVisible) return null
  if (onboarding.state.checklistDismissed) return null

  const { state, completeItem, minimizeChecklist, dismissChecklist, getProgress } = onboarding
  const progress = getProgress()

  // Don't show if all items complete
  if (progress.percent === 100) return null

  const items: ChecklistItemConfig[] = [
    {
      key: 'profile',
      labelKey: 'onboarding.checklist.profile',
      descKey: 'onboarding.checklist.profileDesc',
      action: () => onNavigate?.('profile'),
    },
    {
      key: 'building',
      labelKey: 'onboarding.checklist.building',
      descKey: 'onboarding.checklist.buildingDesc',
      action: () => onNavigate?.('home'),
    },
    {
      key: 'chat',
      labelKey: 'onboarding.checklist.chat',
      descKey: 'onboarding.checklist.chatDesc',
      action: () => onNavigate?.('home'),
    },
    {
      key: 'library',
      labelKey: 'onboarding.checklist.library',
      descKey: 'onboarding.checklist.libraryDesc',
      action: () => onNavigate?.('reading'),
    },
    {
      key: 'mutualAid',
      labelKey: 'onboarding.checklist.mutualAid',
      descKey: 'onboarding.checklist.mutualAidDesc',
      action: () => onNavigate?.('mutualAid'),
    },
  ]

  const isMinimized = state.checklistMinimized

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rstu-red to-red-600 text-white cursor-pointer"
        onClick={() => minimizeChecklist(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="font-semibold text-sm">{t('onboarding.checklist.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
            {progress.completed}/{progress.total}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isMinimized ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {/* Checklist Items */}
      {!isMinimized && (
        <div className="p-3 space-y-2">
          {items.map(item => {
            const isComplete = state.checklistItems.find(i => i.key === item.key)?.completed ?? false

            return (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                  isComplete
                    ? 'bg-green-50'
                    : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                }`}
                onClick={() => {
                  if (!isComplete && item.action) {
                    item.action()
                  }
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isComplete) {
                      onboarding.uncompleteItem(item.key)
                    } else {
                      completeItem(item.key)
                    }
                  }}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isComplete
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-rstu-red'
                  }`}
                >
                  {isComplete && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isComplete ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                    {t(item.labelKey)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t(item.descKey)}
                  </p>
                </div>

                {/* Arrow for incomplete items */}
                {!isComplete && (
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            )
          })}

          {/* Dismiss button */}
          <div className="pt-2 border-t border-gray-100 mt-3">
            <button
              onClick={dismissChecklist}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t('onboarding.checklist.dismiss')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
