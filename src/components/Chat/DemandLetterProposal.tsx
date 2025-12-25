'use client'

import { useState } from 'react'
import { EnhancedBuilding } from '@/lib/getBuildingsData'
import { type LinkedPropertyGroup } from '@/lib/linkedPropertiesStorage'
import { createProposal, VOTE_THRESHOLDS } from '@/lib/governanceStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface DemandLetterProposalProps {
  building: EnhancedBuilding
  propertyGroup: LinkedPropertyGroup | null
  onSubmit: (message: string) => void
  onClose: () => void
}

const DEMAND_CATEGORIES = [
  { id: 'repairs', label: 'Repairs & Maintenance', icon: '🔧' },
  { id: 'rent', label: 'Rent Issues', icon: '💰' },
  { id: 'services', label: 'Building Services', icon: '🏢' },
  { id: 'safety', label: 'Safety & Security', icon: '🔒' },
  { id: 'harassment', label: 'Stop Harassment', icon: '⚠️' },
  { id: 'other', label: 'Other', icon: '📝' },
]

const DEMAND_TEMPLATES: Record<string, string[]> = {
  repairs: [
    'Fix heating/cooling system within [X] days',
    'Repair plumbing issues (specify)',
    'Address mold/moisture problems',
    'Fix broken appliances',
    'Repair common area issues',
  ],
  rent: [
    'Rescind the rent increase of [X]%',
    'Reduce rent by [X]% due to habitability issues',
    'Provide itemized breakdown of fees',
    'Return wrongfully withheld security deposits',
  ],
  services: [
    'Restore laundry room access',
    'Improve trash/recycling service',
    'Fix parking lot lighting',
    'Restore amenities (pool, gym, etc.)',
  ],
  safety: [
    'Install/repair security cameras',
    'Fix broken locks on entry doors',
    'Address pest infestation',
    'Improve exterior lighting',
  ],
  harassment: [
    'Cease illegal entry into units',
    'Stop threatening notices',
    'Respect quiet enjoyment rights',
    'End discriminatory treatment',
  ],
  other: [],
}

export function DemandLetterProposal({
  building,
  propertyGroup,
  onSubmit,
  onClose,
}: DemandLetterProposalProps) {
  const [step, setStep] = useState<'category' | 'demands' | 'review'>('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [demands, setDemands] = useState<string[]>([])
  const [customDemand, setCustomDemand] = useState('')
  const [deadline, setDeadline] = useState('14')
  const [recipientName, setRecipientName] = useState(building.owner || '')

  const profile = getCurrentProfile()
  const groupId = propertyGroup?.id || building.chatSlug

  const handleAddDemand = (demand: string) => {
    if (!demands.includes(demand)) {
      setDemands([...demands, demand])
    }
  }

  const handleRemoveDemand = (demand: string) => {
    setDemands(demands.filter(d => d !== demand))
  }

  const handleAddCustomDemand = () => {
    if (customDemand.trim() && !demands.includes(customDemand.trim())) {
      setDemands([...demands, customDemand.trim()])
      setCustomDemand('')
    }
  }

  const handleSubmit = () => {
    if (!profile || demands.length === 0) return

    const demandsList = demands.join('; ')
    const proposal = createProposal('demand-letter', groupId, {
      targetValue: recipientName,
      reason: `Demands (${deadline} day deadline): ${demandsList}`,
    })

    if (proposal) {
      const message = `[GOV:demand-letter:${groupId}:${deadline}] 📋 DEMAND LETTER to ${recipientName}: ${demands.length} demand(s) with ${deadline}-day deadline.`
      onSubmit(message)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Draft Demand Letter
            </h2>
            <p className="text-xs text-gray-500">
              Step {step === 'category' ? '1' : step === 'demands' ? '2' : '3'} of 3:
              {step === 'category' && ' Select Category'}
              {step === 'demands' && ' Add Demands'}
              {step === 'review' && ' Review & Submit'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 'category' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                What type of issues are you demanding action on?
              </p>
              {DEMAND_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setStep('demands')
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition flex items-center gap-3"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium text-gray-900">{cat.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 'demands' && selectedCategory && (
            <div>
              {/* Back Button */}
              <button
                onClick={() => setStep('category')}
                className="flex items-center gap-1 text-xs text-gray-500 mb-3 hover:text-gray-700"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to categories
              </button>

              {/* Selected Demands */}
              {demands.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Your Demands ({demands.length})
                  </p>
                  <div className="space-y-1">
                    {demands.map((demand, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">{demand}</span>
                        <button
                          onClick={() => handleRemoveDemand(demand)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Suggestions */}
              {DEMAND_TEMPLATES[selectedCategory]?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Suggestions (tap to add)</p>
                  <div className="flex flex-wrap gap-1">
                    {DEMAND_TEMPLATES[selectedCategory].map((template, i) => (
                      <button
                        key={i}
                        onClick={() => handleAddDemand(template)}
                        disabled={demands.includes(template)}
                        className={`px-2 py-1 text-xs rounded-full transition ${
                          demands.includes(template)
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                        }`}
                      >
                        + {template}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Demand Input */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Add Custom Demand</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDemand}
                    onChange={(e) => setCustomDemand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDemand()}
                    placeholder="Type your demand..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddCustomDemand}
                    disabled={!customDemand.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              {demands.length > 0 && (
                <button
                  onClick={() => setStep('review')}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Continue to Review
                </button>
              )}
            </div>
          )}

          {step === 'review' && (
            <div>
              {/* Back Button */}
              <button
                onClick={() => setStep('demands')}
                className="flex items-center gap-1 text-xs text-gray-500 mb-3 hover:text-gray-700"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to demands
              </button>

              {/* Recipient */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Addressed To
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Landlord or property manager name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Deadline */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Deadline
                </label>
                <select
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>

              {/* Demands Summary */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Demands ({demands.length})</p>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {demands.map((demand, i) => (
                      <li key={i}>{demand}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Voting Info */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Collective Action:</strong> This demand letter requires +{VOTE_THRESHOLDS['demand-letter']} votes to be sent.
                  Once passed, it will be formatted and ready for delivery.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={demands.length === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-300"
            >
              Submit for Vote
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
