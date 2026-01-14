'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import {
  type Circle,
  CIRCLE_CATEGORIES,
  CIRCLE_CATEGORY_COLORS,
  isMember,
  joinCircle,
  leaveCircle,
  isCreator,
} from '@/lib/circleStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { useState } from 'react'

interface CircleCardProps {
  circle: Circle
  onSelect?: (circle: Circle) => void
  onUpdate?: () => void
  compact?: boolean
}

export function CircleCard({ circle, onSelect, onUpdate, compact = false }: CircleCardProps) {
  const { t } = useLanguage()
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const profile = getCurrentProfile()
  const memberOfCircle = isMember(circle.id)
  const creatorOfCircle = isCreator(circle.id)

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!profile || isJoining) return

    setIsJoining(true)
    const success = joinCircle(circle.id)
    setIsJoining(false)

    if (success && onUpdate) {
      onUpdate()
    }
  }

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!profile || isLeaving || creatorOfCircle) return

    setIsLeaving(true)
    const success = leaveCircle(circle.id)
    setIsLeaving(false)

    if (success && onUpdate) {
      onUpdate()
    }
  }

  const categoryColor = CIRCLE_CATEGORY_COLORS[circle.category] || CIRCLE_CATEGORY_COLORS.other
  const categoryLabel = CIRCLE_CATEGORIES[circle.category] || 'Other'

  if (compact) {
    return (
      <div
        onClick={() => onSelect?.(circle)}
        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer bg-white"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{circle.name}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColor}`}>
              {categoryLabel}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">{circle.memberIds.length} {t('circles.members') || 'members'}</p>
        </div>
        {memberOfCircle ? (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            {t('circles.joined') || 'Joined'}
          </span>
        ) : profile && circle.isOpen ? (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="px-3 py-1 text-sm bg-rstu-red text-white rounded-full hover:bg-red-700 disabled:opacity-50"
          >
            {isJoining ? '...' : t('circles.join') || 'Join'}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      onClick={() => onSelect?.(circle)}
      className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{circle.name}</h3>
          <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${categoryColor}`}>
            {categoryLabel}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {circle.description}
        </p>

        {/* Interest Tags */}
        {circle.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {circle.interests.slice(0, 4).map(interest => (
              <span
                key={interest}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {interest}
              </span>
            ))}
            {circle.interests.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-gray-400">
                +{circle.interests.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{circle.memberIds.length}</span>
            {' '}{t('circles.members') || 'members'}
          </div>

          {memberOfCircle ? (
            creatorOfCircle ? (
              <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                {t('circles.creator') || 'Creator'}
              </span>
            ) : (
              <button
                onClick={handleLeave}
                disabled={isLeaving}
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50"
              >
                {isLeaving ? '...' : t('circles.leave') || 'Leave'}
              </button>
            )
          ) : profile && circle.isOpen ? (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="px-3 py-1 text-sm bg-rstu-red text-white rounded-full hover:bg-red-700 disabled:opacity-50"
            >
              {isJoining ? '...' : t('circles.join') || 'Join'}
            </button>
          ) : !circle.isOpen ? (
            <span className="px-3 py-1 text-xs text-gray-500 border border-gray-200 rounded-full">
              {t('circles.inviteOnly') || 'Invite only'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
