'use client'

import { useState } from 'react'
import {
  type Victory,
  getVictoryTypeLabel,
  getVictoryTypeColor,
  deleteVictory,
} from '@/lib/victoryStorage'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { VictoryTimeline } from './VictoryTimeline'
import { VictoryAnnouncement } from './VictoryAnnouncement'

interface VictoryDetailProps {
  victory: Victory
  onEdit: () => void
  onDelete: () => void
}

export function VictoryDetail({
  victory,
  onEdit,
  onDelete,
}: VictoryDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  const handleDelete = () => {
    deleteVictory(victory.id)
    onDelete()
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Type badge and date */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getVictoryTypeColor(
                  victory.type
                )}`}
              >
                {getVictoryTypeLabel(victory.type)}
              </span>
              <span className="text-sm text-gray-500">{formatDate(victory.date)}</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900">{victory.title}</h2>

            {/* Landlord */}
            {victory.landlordName && (
              <p className="text-sm text-gray-600 mt-1">vs. {victory.landlordName}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Impact Metrics */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Impact</h3>
          <div className="grid grid-cols-2 gap-3">
            {victory.quantifiedImpact && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-600 font-medium">Impact</p>
                <p className="text-lg font-bold text-green-700">{victory.quantifiedImpact}</p>
              </div>
            )}
            {victory.unitsAffected && victory.unitsAffected > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Units Affected</p>
                <p className="text-lg font-bold text-blue-700">{victory.unitsAffected}</p>
              </div>
            )}
            {victory.monthlyRentReduction && victory.monthlyRentReduction > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-600 font-medium">Monthly Savings</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatCurrency(victory.monthlyRentReduction)}
                </p>
              </div>
            )}
            {victory.duration && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-xs text-orange-600 font-medium">Duration</p>
                <p className="text-lg font-bold text-orange-700">{victory.duration}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{victory.description}</p>
        </div>

        {/* Tactics */}
        {victory.tactics && victory.tactics.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tactics Used</h3>
            <div className="flex flex-wrap gap-2">
              {victory.tactics.map((tactic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {tactic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Member Testimonial */}
        {victory.memberQuote && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Member Testimonial</h3>
            <blockquote className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
              <p className="text-sm text-gray-700 italic">&ldquo;{victory.memberQuote}&rdquo;</p>
              {victory.memberName && (
                <footer className="text-xs text-gray-500 mt-2">&mdash; {victory.memberName}</footer>
              )}
            </blockquote>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowTimeline(true)}
            className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            View Timeline
          </button>
          <button
            onClick={() => setShowAnnouncement(true)}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Victory"
        message={`Are you sure you want to delete "${victory.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Timeline modal */}
      {showTimeline && (
        <VictoryTimeline
          victory={victory}
          onClose={() => setShowTimeline(false)}
        />
      )}

      {/* Announcement modal */}
      {showAnnouncement && (
        <VictoryAnnouncement
          victory={victory}
          onClose={() => setShowAnnouncement(false)}
        />
      )}
    </div>
  )
}
