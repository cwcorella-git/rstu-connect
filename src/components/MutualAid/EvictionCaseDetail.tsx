'use client'

import React, { useState } from 'react'
import {
  getCase,
  updateCaseStage,
  markCaseResolved,
  assignAttorney,
  removeAttorney,
  addDefenseStrategy,
  removeDefenseStrategy,
  addEvidence,
  deleteEvidence,
  addNote,
  deleteNote,
  getDaysUntilCourt,
  type EvictionCase,
  type DefenseStrategy
} from '@/lib/evictionDefenseStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { NevadaEvictionPlaybook } from './NevadaEvictionPlaybook'

interface EvictionCaseDetailProps {
  caseId: string
  onCaseUpdated?: () => void
}

export function EvictionCaseDetail({ caseId, onCaseUpdated }: EvictionCaseDetailProps) {
  const evictionCase = getCase(caseId)
  const [newNote, setNewNote] = useState('')
  const [newEvidenceType, setNewEvidenceType] = useState<'photo' | 'rent-receipt' | 'repair-request' | 'lease' | 'notice' | 'other'>('photo')
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('')
  const [attorneyName, setAttorneyName] = useState('')
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolveOutcome, setResolveOutcome] = useState<'dismissed' | 'settled' | 'won' | 'lost'>('dismissed')
  const [showPlaybook, setShowPlaybook] = useState(false)

  const profile = getCurrentProfile()

  if (!evictionCase) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-gray-500">Case not found</p>
      </div>
    )
  }

  const daysUntilCourt = getDaysUntilCourt(evictionCase.courtDate)

  // Handler functions
  const handleAddDefenseStrategy = (strategy: DefenseStrategy) => {
    addDefenseStrategy(caseId, strategy)
    onCaseUpdated?.()
  }

  const handleRemoveDefenseStrategy = (strategy: DefenseStrategy) => {
    removeDefenseStrategy(caseId, strategy)
    onCaseUpdated?.()
  }

  const handleAssignAttorney = () => {
    if (attorneyName.trim()) {
      assignAttorney(caseId, attorneyName)
      setAttorneyName('')
      onCaseUpdated?.()
    }
  }

  const handleRemoveAttorney = () => {
    removeAttorney(caseId)
    onCaseUpdated?.()
  }

  const handleAddEvidence = () => {
    if (newEvidenceDesc.trim()) {
      addEvidence(caseId, {
        type: newEvidenceType,
        description: newEvidenceDesc,
        uploadedDate: new Date().toISOString().split('T')[0]
      })
      setNewEvidenceDesc('')
      onCaseUpdated?.()
    }
  }

  const handleDeleteEvidence = (evidenceId: string) => {
    deleteEvidence(caseId, evidenceId)
    onCaseUpdated?.()
  }

  const handleAddNote = () => {
    if (newNote.trim() && profile) {
      addNote(caseId, profile.id, profile.nickname, newNote, false)
      setNewNote('')
      onCaseUpdated?.()
    }
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote(caseId, noteId)
    onCaseUpdated?.()
  }

  const handleResolveCase = () => {
    const today = new Date().toISOString().split('T')[0]
    markCaseResolved(caseId, {
      result: resolveOutcome,
      date: today
    })
    setShowResolveModal(false)
    onCaseUpdated?.()
  }

  const defenseStrategies: DefenseStrategy[] = [
    'habitability_defense',
    'retaliation_defense',
    'procedural_defense',
    'payment_plan',
    'rent_withholding',
    'other'
  ]

  const getStrategyLabel = (strategy: DefenseStrategy): string => {
    const labels: Record<DefenseStrategy, string> = {
      habitability_defense: 'Habitability Defense (NRS 118A.355)',
      retaliation_defense: 'Retaliation Defense (NRS 118A.510)',
      procedural_defense: 'Procedural Defect',
      payment_plan: 'Payment Plan',
      rent_withholding: 'Rent Withholding (NRS 118A.490)',
      other: 'Other'
    }
    return labels[strategy]
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {evictionCase.anonymousDisplay && evictionCase.unitNumber
                ? `Tenant at Unit ${evictionCase.unitNumber}`
                : evictionCase.tenantName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{evictionCase.buildingAddress}</p>
          </div>
          <div className={`px-3 py-1 rounded text-sm font-bold ${
            evictionCase.urgency === 'critical'
              ? 'bg-red-100 text-red-700'
              : evictionCase.urgency === 'urgent'
              ? 'bg-orange-100 text-orange-700'
              : evictionCase.urgency === 'high'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {evictionCase.urgency.toUpperCase()}
          </div>
        </div>

        {/* Court Countdown */}
        {evictionCase.courtDate && (
          <div className={`mt-3 p-2 rounded text-sm font-semibold ${
            daysUntilCourt !== null && daysUntilCourt <= 7
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {daysUntilCourt === null
              ? 'Court date: ' + evictionCase.courtDate
              : daysUntilCourt < 0
              ? `⚠️ OVERDUE - Court was ${Math.abs(daysUntilCourt)} days ago`
              : daysUntilCourt === 0
              ? '🚨 COURT TODAY'
              : `Court in ${daysUntilCourt} day${daysUntilCourt === 1 ? '' : 's'}`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Case Timeline */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Case Timeline</h4>
          <div className="space-y-2 text-sm">
            {evictionCase.noticeReceivedDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Notice Received:</span>
                <span className="font-medium text-gray-900">{evictionCase.noticeReceivedDate}</span>
              </div>
            )}
            {evictionCase.filingDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Case Filed:</span>
                <span className="font-medium text-gray-900">{evictionCase.filingDate}</span>
              </div>
            )}
            {evictionCase.courtDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Court Date:</span>
                <span className="font-medium text-gray-900">{evictionCase.courtDate}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-gray-900">{evictionCase.stage.replace(/-/g, ' ')}</span>
            </div>
          </div>

          {/* Nevada Playbook Link */}
          {evictionCase.noticeType && (
            <button
              onClick={() => setShowPlaybook(true)}
              className="w-full mt-4 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              📖 View Nevada Legal Guide for {evictionCase.noticeType} Notice
            </button>
          )}
        </section>

        {/* Defense Strategy */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Defense Strategies</h4>
          <div className="space-y-2">
            {defenseStrategies.map(strategy => (
              <label key={strategy} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={evictionCase.defenseStrategies.includes(strategy)}
                  onChange={e => {
                    if (e.target.checked) {
                      handleAddDefenseStrategy(strategy)
                    } else {
                      handleRemoveDefenseStrategy(strategy)
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">{getStrategyLabel(strategy)}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Attorney Assignment */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal Representation</h4>
          {evictionCase.legalRepresentation?.hasAttorney ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-green-700">
                <strong>{evictionCase.legalRepresentation.attorneyName}</strong>
                {evictionCase.legalRepresentation.clinic && ` (${evictionCase.legalRepresentation.clinic})`}
              </p>
              {evictionCase.legalRepresentation.consultDate && (
                <p className="text-xs text-green-600 mt-1">
                  Consulted: {evictionCase.legalRepresentation.consultDate}
                </p>
              )}
              <button
                onClick={handleRemoveAttorney}
                className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Remove Assignment
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700 mb-2">No attorney assigned</p>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Attorney name"
              value={attorneyName}
              onChange={e => setAttorneyName(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAssignAttorney()}
            />
            <button
              onClick={handleAssignAttorney}
              className="px-3 py-1.5 bg-rstu-red text-white rounded text-sm font-medium hover:bg-red-700"
            >
              Assign
            </button>
          </div>
        </section>

        {/* Evidence */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Evidence ({evictionCase.evidence.length})</h4>

          {evictionCase.evidence.length > 0 && (
            <div className="space-y-2 mb-3">
              {evictionCase.evidence.map(evidence => (
                <div key={evidence.id} className="bg-gray-50 border border-gray-200 rounded p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">{evidence.type.replace(/-/g, ' ')}</p>
                      <p className="text-xs text-gray-600 mt-1">{evidence.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{evidence.uploadedDate}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvidence(evidence.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newEvidenceType}
                onChange={e => setNewEvidenceType(e.target.value as any)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="photo">Photo</option>
                <option value="rent-receipt">Rent Receipt</option>
                <option value="repair-request">Repair Request</option>
                <option value="lease">Lease</option>
                <option value="notice">Notice</option>
                <option value="other">Other</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Evidence description"
              value={newEvidenceDesc}
              onChange={e => setNewEvidenceDesc(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2"
            />
            <button
              onClick={handleAddEvidence}
              className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              Add Evidence
            </button>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes ({evictionCase.notes.length})</h4>

          {evictionCase.notes.length > 0 && (
            <div className="space-y-2 mb-3">
              {evictionCase.notes.map(note => (
                <div key={note.id} className="bg-gray-50 border border-gray-200 rounded p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">
                        {note.authorName}
                        {note.organizerOnly && <span className="ml-1 text-red-600 text-xs">(Private)</span>}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {profile && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2 resize-none"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                className="w-full px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
              >
                Add Note
              </button>
            </div>
          )}
        </section>

        {/* Resolve Button */}
        {evictionCase.stage !== 'resolved' && (
          <div>
            <button
              onClick={() => setShowResolveModal(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
            >
              Mark Case Resolved
            </button>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resolve Case</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Outcome</label>
              <select
                value={resolveOutcome}
                onChange={e => setResolveOutcome(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="dismissed">Dismissed</option>
                <option value="settled">Settled</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveCase}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nevada Playbook Modal */}
      {showPlaybook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <NevadaEvictionPlaybook
              selectedNoticeType={evictionCase?.noticeType}
              onClose={() => setShowPlaybook(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
