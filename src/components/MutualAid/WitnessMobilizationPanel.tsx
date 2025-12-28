'use client'

import React, { useState } from 'react'
import {
  addWitnessSignup,
  removeWitnessSignup,
  getDaysUntilCourt,
  type EvictionCase
} from '@/lib/evictionDefenseStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface WitnessMobilizationPanelProps {
  evictionCase: EvictionCase
  onUpdated?: () => void
}

export function WitnessMobilizationPanel({ evictionCase, onUpdated }: WitnessMobilizationPanelProps) {
  const profile = getCurrentProfile()
  const [newWitnessName, setNewWitnessName] = useState('')
  const [newWitnessRole, setNewWitnessRole] = useState<'neighbor' | 'tenant' | 'organizer' | 'attorney' | 'other'>('neighbor')
  const [newWitnessContact, setNewWitnessContact] = useState('')
  const [newWitnessStatus, setNewWitnessStatus] = useState<'interested' | 'confirmed' | 'present'>('interested')

  const daysUntilCourt = getDaysUntilCourt(evictionCase.courtDate)

  const handleAddWitness = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newWitnessName.trim()) return

    addWitnessSignup(evictionCase.id, {
      name: newWitnessName,
      role: newWitnessRole,
      contact: newWitnessContact,
      status: newWitnessStatus,
      signedUpAt: new Date().toISOString(),
      signedUpBy: profile?.id || 'anonymous'
    })

    setNewWitnessName('')
    setNewWitnessContact('')
    setNewWitnessStatus('interested')
    onUpdated?.()
  }

  const handleRemoveWitness = (index: number) => {
    removeWitnessSignup(evictionCase.id, index)
    onUpdated?.()
  }

  const handleUpdateWitnessStatus = (index: number, newStatus: 'interested' | 'confirmed' | 'present') => {
    const witness = evictionCase.witnessSignups[index]
    if (!witness) return

    const updatedWitness = { ...witness, status: newStatus }
    removeWitnessSignup(evictionCase.id, index)
    addWitnessSignup(evictionCase.id, updatedWitness)
    onUpdated?.()
  }

  const interestedCount = evictionCase.witnessSignups.filter(w => w.status === 'interested').length
  const confirmedCount = evictionCase.witnessSignups.filter(w => w.status === 'confirmed').length
  const presentCount = evictionCase.witnessSignups.filter(w => w.status === 'present').length

  const isCourtSoon = daysUntilCourt !== null && daysUntilCourt <= 7

  return (
    <div className="space-y-4">
      {/* Court Date Status */}
      {evictionCase.courtDate && (
        <div className={`p-3 rounded-lg ${
          isCourtSoon
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`font-semibold text-sm ${isCourtSoon ? 'text-red-900' : 'text-blue-900'}`}>
                Court Date: {evictionCase.courtDate}
              </h4>
              {daysUntilCourt !== null && (
                <p className={`text-xs mt-1 ${isCourtSoon ? 'text-red-700' : 'text-blue-700'}`}>
                  {daysUntilCourt === 0
                    ? '⚠️ TODAY'
                    : daysUntilCourt === 1
                    ? '⚠️ Tomorrow'
                    : `${daysUntilCourt} days away`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Witness Summary */}
      {evictionCase.witnessSignups.length > 0 && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">{interestedCount}</div>
            <div className="text-xs text-gray-600">Interested</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{confirmedCount}</div>
            <div className="text-xs text-gray-600">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{presentCount}</div>
            <div className="text-xs text-gray-600">Present</div>
          </div>
        </div>
      )}

      {/* Witness List */}
      {evictionCase.witnessSignups.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Court Support Team</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {evictionCase.witnessSignups.map((witness, index) => {
              const statusColor = {
                interested: 'bg-yellow-50 border-yellow-200',
                confirmed: 'bg-green-50 border-green-200',
                present: 'bg-blue-50 border-blue-200'
              }[witness.status]

              return (
                <div key={index} className={`p-3 border rounded-lg ${statusColor}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900">{witness.name}</h5>
                      <div className="text-xs text-gray-600 mt-0.5 space-y-0.5">
                        <p>
                          <strong>Role:</strong> {witness.role.replace(/-/g, ' ')}
                        </p>
                        {witness.contact && (
                          <p>
                            <strong>Contact:</strong> {witness.contact}
                          </p>
                        )}
                        {witness.signedUpAt && (
                          <p>
                            <strong>Signed up:</strong> {new Date(witness.signedUpAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveWitness(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Remove witness"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Status Selector */}
                  <div className="mt-2 flex gap-1">
                    {(['interested', 'confirmed', 'present'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateWitnessStatus(index, status)}
                        className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                          witness.status === status
                            ? status === 'interested'
                              ? 'bg-yellow-200 text-yellow-800'
                              : status === 'confirmed'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-blue-200 text-blue-800'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {status === 'interested' ? '👋' : status === 'confirmed' ? '✓' : '✓✓'}
                        {' '}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Witness Form */}
      <form onSubmit={handleAddWitness} className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900">Add Court Witness</h4>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={newWitnessName}
            onChange={(e) => setNewWitnessName(e.target.value)}
            placeholder="Witness name"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
          <select
            value={newWitnessRole}
            onChange={(e) => setNewWitnessRole(e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
          >
            <option value="neighbor">Neighbor/Tenant</option>
            <option value="tenant">Building Tenant</option>
            <option value="organizer">Organizer</option>
            <option value="attorney">Attorney/Legal Worker</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Contact Info (optional)</label>
          <input
            type="text"
            value={newWitnessContact}
            onChange={(e) => setNewWitnessContact(e.target.value)}
            placeholder="Phone or email"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={newWitnessStatus}
            onChange={(e) => setNewWitnessStatus(e.target.value as any)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rstu-red"
          >
            <option value="interested">Interested</option>
            <option value="confirmed">Confirmed</option>
            <option value="present">Already Present</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-rstu-red text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Add Witness
        </button>
      </form>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-200">
        <p>
          <strong>Building court presence:</strong> Having neighbors, tenants, and organizers present at court
          shows the judge that the building is organized and increases chances of dismissal or favorable outcomes.
        </p>
      </div>
    </div>
  )
}
