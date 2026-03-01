'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  type Circle,
  CIRCLE_CATEGORIES,
  CIRCLE_CATEGORY_COLORS,
  isMember,
  isCreator,
  joinCircle,
  leaveCircle,
  deleteCircle,
  getCircleMembers,
} from '@/lib/storage/circleStorage'
import { getCurrentProfile, type UserProfile, INTEREST_LABELS } from '@/lib/storage/profileStorage'

interface CircleDetailViewProps {
  circle: Circle
  onBack: () => void
  onUpdate: () => void
}

export function CircleDetailView({ circle, onBack, onUpdate }: CircleDetailViewProps) {
  const { t } = useLanguage()
  const [members, setMembers] = useState<UserProfile[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const profile = getCurrentProfile()
  const memberOfCircle = isMember(circle.id)
  const creatorOfCircle = isCreator(circle.id)

  useEffect(() => {
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circle.id])

  const loadMembers = async () => {
    setIsLoadingMembers(true)
    const membersList = await getCircleMembers(circle.id)
    setMembers(membersList)
    setIsLoadingMembers(false)
  }

  const handleJoin = async () => {
    if (!profile || isJoining) return

    setIsJoining(true)
    const success = joinCircle(circle.id)
    setIsJoining(false)

    if (success) {
      onUpdate()
      loadMembers()
    }
  }

  const handleLeave = async () => {
    if (!profile || isLeaving || creatorOfCircle) return

    setIsLeaving(true)
    const success = leaveCircle(circle.id)
    setIsLeaving(false)

    if (success) {
      onUpdate()
      onBack()
    }
  }

  const handleDelete = async () => {
    if (!profile || isDeleting || !creatorOfCircle) return

    setIsDeleting(true)
    const success = deleteCircle(circle.id)
    setIsDeleting(false)

    if (success) {
      onUpdate()
      onBack()
    }
  }

  const categoryColor = CIRCLE_CATEGORY_COLORS[circle.category] || CIRCLE_CATEGORY_COLORS.other
  const categoryLabel = CIRCLE_CATEGORIES[circle.category] || 'Other'

  // Find creator in members list
  const creator = members.find(m => m.id === circle.creatorId)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('circles.backToCircles') || 'Back to Circles'}
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{circle.name}</h1>
              <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColor}`}>
                {categoryLabel}
              </span>
            </div>
            <p className="text-gray-600">{circle.description}</p>
          </div>

          {/* Join/Leave/Delete Actions */}
          <div className="flex flex-col gap-2">
            {memberOfCircle ? (
              creatorOfCircle ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  {t('circles.deleteCircle') || 'Delete Circle'}
                </button>
              ) : (
                <button
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {isLeaving ? '...' : t('circles.leave') || 'Leave'}
                </button>
              )
            ) : profile && circle.isOpen ? (
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-4 py-2 text-sm bg-rstu-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isJoining ? '...' : t('circles.join') || 'Join Circle'}
              </button>
            ) : !circle.isOpen ? (
              <span className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
                {t('circles.inviteOnly') || 'Invite only'}
              </span>
            ) : null}
          </div>
        </div>

        {/* Interest Tags */}
        {circle.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {circle.interests.map(interest => (
              <span
                key={interest}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {INTEREST_LABELS[interest] || interest}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>
            <span className="font-medium text-gray-700">{circle.memberIds.length}</span> {t('circles.members') || 'members'}
          </span>
          {creator && (
            <span>
              {t('circles.createdBy') || 'Created by'} <span className="font-medium text-gray-700">{creator.nickname}</span>
            </span>
          )}
          {circle.chatEnabled && (
            <span className="flex items-center gap-1 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {t('circles.chatEnabled') || 'Chat'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Members Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t('circles.membersTitle') || 'Members'}
          </h2>

          {isLoadingMembers ? (
            <div className="text-center py-8 text-gray-500">
              {t('common.loading') || 'Loading...'}
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {member.nickname?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.nickname}</span>
                      {member.id === circle.creatorId && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {t('circles.creator') || 'Creator'}
                        </span>
                      )}
                    </div>
                    {member.buildingAddress && (
                      <p className="text-sm text-gray-500 truncate">
                        {member.buildingAddress.split(',')[0]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('circles.noMembers') || 'No members yet'}
            </div>
          )}
        </div>

        {/* Chat Link (if enabled and member) */}
        {circle.chatEnabled && circle.chatSlug && memberOfCircle && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {t('circles.circleChat') || 'Circle Chat'}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('circles.circleChatHelp') || 'Join the conversation with other members'}
            </p>
            <div className="text-sm text-gray-500">
              Chat slug: <code className="bg-white px-2 py-1 rounded border border-gray-200">{circle.chatSlug}</code>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('circles.deleteConfirmTitle') || 'Delete Circle?'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('circles.deleteConfirmMessage') || 'This will permanently delete the circle and remove all members. This cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? '...' : t('circles.delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
