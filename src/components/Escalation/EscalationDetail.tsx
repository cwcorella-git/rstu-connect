'use client'

import { useState } from 'react'
import {
  type EscalationCase,
  type EscalationStage,
  type DeliveryMethod,
  type ResponseType,
  type ResolutionType,
  type EscalationPath,
  type EnhancedSuggestion,
  type SuggestionSource,
  advanceStage,
  draftDemand,
  recordDelivery,
  recordLandlordResponse,
  startEscalation,
  resolveCase,
  addEvidence,
  addTimelineEvent,
  getEnhancedSuggestion,
  getBuildingHistory,
  getLandlordPattern,
  getCaseById,
} from '@/lib/escalationStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface EscalationDetailProps {
  caseData: EscalationCase
  onBack: () => void
  onUpdate: () => void
}

const stageLabels: Record<EscalationStage, string> = {
  identified: 'Issue Identified',
  drafted: 'Demand Drafted',
  delivered: 'Demand Delivered',
  awaiting: 'Awaiting Response',
  escalating: 'Escalation Active',
  resolved: 'Resolved',
}

const stageDescriptions: Record<EscalationStage, string> = {
  identified: 'Document the issue and gather support from neighbors',
  drafted: 'Demand letter is ready - choose delivery method',
  delivered: 'Waiting for deadline or landlord response',
  awaiting: 'Evaluate response and decide next steps',
  escalating: 'Active escalation in progress',
  resolved: 'Case concluded',
}

const stageOrder: EscalationStage[] = [
  'identified', 'drafted', 'delivered', 'awaiting', 'escalating', 'resolved'
]

export function EscalationDetail({ caseData, onBack, onUpdate }: EscalationDetailProps) {
  const [activeSection, setActiveSection] = useState<'timeline' | 'actions' | 'evidence'>('actions')
  const [showDemandForm, setShowDemandForm] = useState(false)
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [showEscalationForm, setShowEscalationForm] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)

  const currentProfile = getCurrentProfile()
  const suggestion = getEnhancedSuggestion(caseData)
  const buildingHistory = getBuildingHistory(caseData.buildingId)
  const landlordPattern = getLandlordPattern(caseData.buildingAddress)
  const currentStageIndex = stageOrder.indexOf(caseData.stage)

  const refreshCase = () => {
    onUpdate()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Calculate deadline status
  const getDeadlineInfo = () => {
    if (!caseData.deadlineDate) return null
    const now = Date.now()
    const daysUntil = Math.ceil((caseData.deadlineDate - now) / (24 * 60 * 60 * 1000))

    return {
      date: formatDate(caseData.deadlineDate),
      daysUntil,
      isOverdue: daysUntil < 0,
      label: daysUntil < 0
        ? `${Math.abs(daysUntil)} days overdue`
        : daysUntil === 0
        ? 'Due today'
        : `${daysUntil} days remaining`,
    }
  }

  const deadline = getDeadlineInfo()

  return (
    <div className="bg-white rounded-lg border border-gray-200 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to list
        </button>

        <h2 className="text-xl font-semibold text-gray-900">{caseData.title}</h2>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            caseData.severity === 'emergency' ? 'bg-red-600 text-white' :
            caseData.severity === 'serious' ? 'bg-orange-100 text-orange-700' :
            caseData.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {caseData.severity.toUpperCase()}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {caseData.category}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {caseData.affectedUnits.length === 1
              ? `Unit ${caseData.affectedUnits[0]}`
              : `${caseData.affectedUnits.length} units`}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-2">{caseData.description}</p>
      </div>

      {/* Stage Progress */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          {stageOrder.map((stage, index) => {
            const isComplete = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            return (
              <div key={stage} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isComplete ? '✓' : index + 1}
                </div>
                {index < stageOrder.length - 1 && (
                  <div className={`w-8 h-1 ${
                    index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900">{stageLabels[caseData.stage]}</p>
          <p className="text-sm text-gray-500">{stageDescriptions[caseData.stage]}</p>
        </div>
      </div>

      {/* Deadline Banner */}
      {deadline && caseData.stage === 'delivered' && (
        <div className={`px-4 py-3 flex-shrink-0 ${
          deadline.isOverdue ? 'bg-red-50 border-b border-red-100' :
          deadline.daysUntil <= 3 ? 'bg-yellow-50 border-b border-yellow-100' :
          'bg-blue-50 border-b border-blue-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-medium ${
                deadline.isOverdue ? 'text-red-700' :
                deadline.daysUntil <= 3 ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                ⏱️ Deadline: {deadline.date}
              </span>
              <span className="text-sm ml-2 text-gray-600">({deadline.label})</span>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Action */}
      {caseData.stage !== 'resolved' && (
        <div className={`px-4 py-3 flex-shrink-0 ${
          suggestion.urgent ? 'bg-red-50 border-b border-red-100' : 'bg-green-50 border-b border-green-100'
        }`}>
          <p className={`text-sm font-medium ${suggestion.urgent ? 'text-red-700' : 'text-green-700'}`}>
            → {suggestion.action}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">{suggestion.reason}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {(['actions', 'timeline', 'evidence'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`flex-1 py-2 text-sm font-medium ${
              activeSection === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'actions' ? 'Actions' : tab === 'timeline' ? 'Timeline' : 'Evidence'}
            {tab === 'evidence' && caseData.evidence.length > 0 && (
              <span className="ml-1 text-xs bg-gray-200 px-1.5 rounded-full">
                {caseData.evidence.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Actions Tab */}
        {activeSection === 'actions' && (
          <div className="space-y-3">
            {/* Stage-specific actions */}
            {caseData.stage === 'identified' && (
              <>
                <button
                  onClick={() => setShowDemandForm(true)}
                  className="w-full p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <p className="font-medium text-blue-700">Draft Demand Letter</p>
                  <p className="text-sm text-gray-600">Create formal demand to send to landlord</p>
                </button>
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-700">Add Note</p>
                  <p className="text-sm text-gray-600">Document updates or findings</p>
                </button>
              </>
            )}

            {caseData.stage === 'drafted' && (
              <>
                <button
                  onClick={() => setShowDeliveryForm(true)}
                  className="w-full p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <p className="font-medium text-blue-700">Record Delivery</p>
                  <p className="text-sm text-gray-600">Mark demand as sent to landlord</p>
                </button>
                <button
                  onClick={() => setShowDemandForm(true)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-700">Edit Demand</p>
                  <p className="text-sm text-gray-600">Modify demand before sending</p>
                </button>
              </>
            )}

            {(caseData.stage === 'delivered' || caseData.stage === 'awaiting') && (
              <>
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="w-full p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <p className="font-medium text-blue-700">Log Landlord Response</p>
                  <p className="text-sm text-gray-600">Record contact or response from landlord</p>
                </button>
                <button
                  onClick={() => setShowEscalationForm(true)}
                  className="w-full p-3 text-left border border-orange-200 rounded-lg hover:bg-orange-50"
                >
                  <p className="font-medium text-orange-700">Start Escalation</p>
                  <p className="text-sm text-gray-600">Code enforcement, legal, strike, or public action</p>
                </button>
              </>
            )}

            {caseData.stage === 'escalating' && (
              <>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-700 mb-2">Active Escalations</p>
                  {caseData.escalationPaths.length === 0 ? (
                    <p className="text-sm text-gray-500">No escalations started yet</p>
                  ) : (
                    <div className="space-y-2">
                      {caseData.escalationPaths.map((path, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>
                            {path.type === 'code_enforcement' && '🏛️ Code Enforcement'}
                            {path.type === 'legal' && '⚖️ Legal'}
                            {path.type === 'strike' && '✊ Strike'}
                            {path.type === 'public_pressure' && '📢 Public Pressure'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            path.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            path.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {path.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowEscalationForm(true)}
                  className="w-full p-3 text-left border border-orange-200 rounded-lg hover:bg-orange-50"
                >
                  <p className="font-medium text-orange-700">Add Escalation Path</p>
                  <p className="text-sm text-gray-600">Start another escalation method</p>
                </button>
              </>
            )}

            {/* Always available actions */}
            {caseData.stage !== 'resolved' && (
              <>
                <hr className="my-4" />
                <button
                  onClick={() => setShowResolveForm(true)}
                  className="w-full p-3 text-left border border-green-200 rounded-lg hover:bg-green-50"
                >
                  <p className="font-medium text-green-700">Resolve Case</p>
                  <p className="text-sm text-gray-600">Mark as victory, compromise, or closed</p>
                </button>
              </>
            )}

            {caseData.stage === 'resolved' && caseData.resolution && (
              <div className={`p-4 rounded-lg ${
                caseData.resolution.type === 'victory' ? 'bg-green-50 border border-green-200' :
                caseData.resolution.type === 'compromise' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <p className="font-medium text-lg">
                  {caseData.resolution.type === 'victory' && '🎉 Victory!'}
                  {caseData.resolution.type === 'compromise' && '🤝 Compromise'}
                  {caseData.resolution.type === 'loss' && '❌ Loss'}
                  {caseData.resolution.type === 'ongoing' && '🔄 Ongoing'}
                  {caseData.resolution.type === 'abandoned' && '⏸️ Abandoned'}
                </p>
                <p className="text-sm mt-1">{caseData.resolution.summary}</p>
                {caseData.resolution.demandsMet && caseData.resolution.demandsMet.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">Demands Met:</p>
                    <ul className="text-sm list-disc list-inside">
                      {caseData.resolution.demandsMet.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeSection === 'timeline' && (
          <div className="space-y-4">
            {caseData.timeline.slice().reverse().map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'created' ? 'bg-blue-500' :
                    event.type === 'stage_change' ? 'bg-purple-500' :
                    event.type === 'resolved' ? 'bg-green-500' :
                    event.type === 'landlord_contact' ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`} />
                  {i < caseData.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-gray-900">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDateTime(event.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evidence Tab */}
        {activeSection === 'evidence' && (
          <div className="space-y-3">
            {caseData.evidence.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No evidence added yet</p>
            ) : (
              caseData.evidence.map((ev) => (
                <div key={ev.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {ev.type === 'photo' && '📷'}
                      {ev.type === 'document' && '📄'}
                      {ev.type === 'video' && '🎥'}
                      {ev.type === 'receipt' && '🧾'}
                      {ev.type === 'other' && '📎'}
                    </span>
                    <span className="font-medium text-gray-900">{ev.description}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Added {formatDateTime(ev.addedAt)}
                  </p>
                </div>
              ))
            )}
            <button
              onClick={() => {
                const desc = prompt('Describe the evidence:')
                if (desc && currentProfile) {
                  addEvidence(caseData.id, { type: 'other', description: desc }, currentProfile.id)
                  refreshCase()
                }
              }}
              className="w-full p-3 text-center border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              + Add Evidence
            </button>
          </div>
        )}
      </div>

      {/* Forms/Modals */}
      {showDemandForm && (
        <DemandForm
          caseId={caseData.id}
          existingDemand={caseData.demandText}
          existingDeadline={caseData.demandDeadlineDays}
          onSave={() => { setShowDemandForm(false); refreshCase() }}
          onCancel={() => setShowDemandForm(false)}
        />
      )}

      {showDeliveryForm && (
        <DeliveryForm
          caseId={caseData.id}
          defaultDeadline={caseData.demandDeadlineDays || 14}
          onSave={() => { setShowDeliveryForm(false); refreshCase() }}
          onCancel={() => setShowDeliveryForm(false)}
        />
      )}

      {showResponseForm && (
        <ResponseForm
          caseId={caseData.id}
          onSave={() => { setShowResponseForm(false); refreshCase() }}
          onCancel={() => setShowResponseForm(false)}
        />
      )}

      {showEscalationForm && (
        <EscalationForm
          caseId={caseData.id}
          existingPaths={caseData.escalationPaths}
          onSave={() => { setShowEscalationForm(false); refreshCase() }}
          onCancel={() => setShowEscalationForm(false)}
        />
      )}

      {showResolveForm && (
        <ResolveForm
          caseId={caseData.id}
          onSave={() => { setShowResolveForm(false); refreshCase() }}
          onCancel={() => setShowResolveForm(false)}
        />
      )}

      {showNoteForm && (
        <NoteForm
          caseId={caseData.id}
          onSave={() => { setShowNoteForm(false); refreshCase() }}
          onCancel={() => setShowNoteForm(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// Sub-forms
// ============================================================================

function DemandForm({ caseId, existingDemand, existingDeadline, onSave, onCancel }: {
  caseId: string
  existingDemand?: string
  existingDeadline?: number
  onSave: () => void
  onCancel: () => void
}) {
  const [demandText, setDemandText] = useState(existingDemand || '')
  const [deadlineDays, setDeadlineDays] = useState(existingDeadline || 14)
  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!demandText.trim() || !profile) return
    draftDemand(caseId, demandText, deadlineDays, profile.id)
    onSave()
  }

  return (
    <Modal title="Draft Demand" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Demand Text
          </label>
          <textarea
            value={demandText}
            onChange={(e) => setDemandText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="We, the tenants of [address], demand that..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response Deadline (days)
          </label>
          <select
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={21}>21 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Save Draft
          </button>
        </div>
      </div>
    </Modal>
  )
}

function DeliveryForm({ caseId, defaultDeadline, onSave, onCancel }: {
  caseId: string
  defaultDeadline: number
  onSave: () => void
  onCancel: () => void
}) {
  const [method, setMethod] = useState<DeliveryMethod>('certified_mail')
  const [proof, setProof] = useState('')
  const [deadlineDays, setDeadlineDays] = useState(defaultDeadline)
  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!profile) return
    recordDelivery(caseId, method, proof, deadlineDays, profile.id)
    onSave()
  }

  return (
    <Modal title="Record Delivery" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as DeliveryMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="certified_mail">Certified Mail</option>
            <option value="email">Email</option>
            <option value="hand_delivered">Hand Delivered</option>
            <option value="posted">Posted on Door</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proof (tracking #, email receipt, etc.)
          </label>
          <input
            type="text"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Tracking number or confirmation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response Deadline (days from today)
          </label>
          <select
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={21}>21 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Mark Delivered
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ResponseForm({ caseId, onSave, onCancel }: {
  caseId: string
  onSave: () => void
  onCancel: () => void
}) {
  const [responseType, setResponseType] = useState<ResponseType>('ignored')
  const [method, setMethod] = useState<'phone' | 'email' | 'letter' | 'in_person' | 'none'>('none')
  const [summary, setSummary] = useState('')
  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!profile) return
    recordLandlordResponse(caseId, {
      date: Date.now(),
      method,
      summary: summary || `Landlord ${responseType}`,
      responseType,
      recordedBy: profile.id,
    })
    onSave()
  }

  return (
    <Modal title="Log Landlord Response" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response Type
          </label>
          <select
            value={responseType}
            onChange={(e) => setResponseType(e.target.value as ResponseType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="agreed">Agreed to demands</option>
            <option value="partial">Partial agreement</option>
            <option value="refused">Refused</option>
            <option value="ignored">No response (ignored)</option>
            <option value="retaliated">Retaliated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="none">No contact</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="letter">Letter</option>
            <option value="in_person">In Person</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="What did they say? Any promises made?"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Log Response
          </button>
        </div>
      </div>
    </Modal>
  )
}

function EscalationForm({ caseId, existingPaths, onSave, onCancel }: {
  caseId: string
  existingPaths: EscalationPath[]
  onSave: () => void
  onCancel: () => void
}) {
  const [pathType, setPathType] = useState<EscalationPath['type']>('code_enforcement')
  const profile = getCurrentProfile()

  const alreadyActive = existingPaths.some(p => p.type === pathType && p.status === 'active')

  const handleSubmit = () => {
    if (!profile || alreadyActive) return
    startEscalation(caseId, pathType, profile.id)
    onSave()
  }

  return (
    <Modal title="Start Escalation" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escalation Type
          </label>
          <div className="space-y-2">
            {[
              { value: 'code_enforcement', label: '🏛️ Code Enforcement', desc: 'File complaint for inspection' },
              { value: 'legal', label: '⚖️ Legal Aid', desc: 'Consult with housing attorney' },
              { value: 'strike', label: '✊ Rent Strike', desc: 'Organize collective rent withholding' },
              { value: 'public_pressure', label: '📢 Public Pressure', desc: 'Media, rallies, public action' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                  pathType === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="escalation"
                  value={option.value}
                  checked={pathType === option.value}
                  onChange={(e) => setPathType(e.target.value as EscalationPath['type'])}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
        {alreadyActive && (
          <p className="text-sm text-orange-600">
            This escalation path is already active
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={alreadyActive}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50"
          >
            Start Escalation
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ResolveForm({ caseId, onSave, onCancel }: {
  caseId: string
  onSave: () => void
  onCancel: () => void
}) {
  const [resolutionType, setResolutionType] = useState<ResolutionType>('victory')
  const [summary, setSummary] = useState('')
  const [demandsMet, setDemandsMet] = useState('')
  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!summary.trim() || !profile) return
    resolveCase(caseId, {
      type: resolutionType,
      summary,
      demandsMet: demandsMet ? demandsMet.split('\n').filter(Boolean) : undefined,
    }, profile.id)
    onSave()
  }

  return (
    <Modal title="Resolve Case" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Type
          </label>
          <select
            value={resolutionType}
            onChange={(e) => setResolutionType(e.target.value as ResolutionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="victory">Victory - Demands met!</option>
            <option value="compromise">Compromise - Partial win</option>
            <option value="loss">Loss - Demands not met</option>
            <option value="ongoing">Ongoing - Will continue later</option>
            <option value="abandoned">Abandoned - No longer pursuing</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="What was the outcome?"
          />
        </div>
        {(resolutionType === 'victory' || resolutionType === 'compromise') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demands Met (one per line)
            </label>
            <textarea
              value={demandsMet}
              onChange={(e) => setDemandsMet(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Heating repaired&#10;$200 rent reduction&#10;Written apology"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
            Resolve Case
          </button>
        </div>
      </div>
    </Modal>
  )
}

function NoteForm({ caseId, onSave, onCancel }: {
  caseId: string
  onSave: () => void
  onCancel: () => void
}) {
  const [note, setNote] = useState('')
  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!note.trim() || !profile) return
    addTimelineEvent(caseId, {
      type: 'note',
      description: note,
      actorId: profile.id,
    })
    onSave()
  }

  return (
    <Modal title="Add Note" onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Add an update, finding, or observation..."
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Add Note
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================================================
// Modal Component
// ============================================================================

function Modal({ title, children, onClose }: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
