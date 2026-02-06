'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  CheckIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  HomeIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  BuildingLibraryIcon,
  ScaleIcon,
  HandRaisedIcon,
  MegaphoneIcon,
  CameraIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  DocumentIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
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
  shouldSuggestStrike,
  getActiveCases,
} from '@/lib/storage/escalationStorage'
import { getCurrentProfile } from '@/lib/storage/profileStorage'
import { getStrikeForBuilding } from '@/lib/storage/strikeStorage'
import { StrikeEscalationPanel } from './StrikeEscalationPanel'

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
  const { t } = useLanguage()
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
        ? t('escalation.daysOverdue').replace('{n}', String(Math.abs(daysUntil)))
        : daysUntil === 0
        ? t('escalation.dueToday')
        : t('escalation.daysRemaining').replace('{n}', String(daysUntil)),
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
          {t('escalation.backToList')}
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
              ? `${t('escalation.unit')} ${caseData.affectedUnits[0]}`
              : `${caseData.affectedUnits.length} ${t('escalation.units')}`}
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
                  {isComplete ? <CheckIcon className="w-4 h-4" /> : index + 1}
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
          <p className="font-medium text-gray-900">{t(`escalation.stage.${caseData.stage}`)}</p>
          <p className="text-sm text-gray-500">{t(`escalation.stageDesc.${caseData.stage}`)}</p>
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
<ClockIcon className="w-4 h-4 inline mr-1" />{t('escalation.deadline')}: {deadline.date}
              </span>
              <span className="text-sm ml-2 text-gray-600">({deadline.label})</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Suggested Action */}
      {caseData.stage !== 'resolved' && (
        <div className={`px-4 py-3 flex-shrink-0 border-b ${
          suggestion.urgent ? 'bg-red-50 border-red-100' :
          suggestion.confidence === 'high' ? 'bg-green-50 border-green-100' :
          'bg-blue-50 border-blue-100'
        }`}>
          {/* Main suggestion */}
          <div className="flex items-start gap-2">
            <span className={`${suggestion.urgent ? 'animate-pulse' : ''}`}>
              {suggestion.urgent ? <ExclamationCircleIcon className="w-5 h-5 text-red-600" /> : suggestion.confidence === 'high' ? <CheckIcon className="w-5 h-5 text-green-600" /> : <ArrowRightIcon className="w-5 h-5 text-blue-600" />}
            </span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                suggestion.urgent ? 'text-red-700' :
                suggestion.confidence === 'high' ? 'text-green-700' :
                'text-blue-700'
              }`}>
                {suggestion.action}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{suggestion.reason}</p>

              {/* Confidence badge */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  suggestion.confidence === 'high' ? 'bg-green-200 text-green-800' :
                  suggestion.confidence === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {suggestion.confidence} {t('escalation.confidence')}
                </span>
                <span className="text-xs text-gray-500">
                  {t('escalation.dayInStage').replace('{n}', String(suggestion.daysInCurrentStage))}
                </span>
              </div>

              {/* Based on context */}
              {suggestion.basedOn.length > 1 && (
                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">{t('escalation.basedOn')} </span>
                  {suggestion.basedOn.slice(0, 3).map((source, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5">
                      {i > 0 && ' • '}
                      {source.type === 'building_history' && <><HomeIcon className="w-3 h-3 inline" /> {source.detail}</>}
                      {source.type === 'landlord_pattern' && <><UserIcon className="w-3 h-3 inline" /> {source.detail}</>}
                      {source.type === 'time' && <><ClockIcon className="w-3 h-3 inline" /> {source.detail}</>}
                      {source.type === 'severity' && <><ExclamationTriangleIcon className="w-3 h-3 inline" /> {source.detail}</>}
                      {source.type === 'stage' && source.detail !== `Current stage: ${caseData.stage}` && <><MapPinIcon className="w-3 h-3 inline" /> {source.detail}</>}
                    </span>
                  )).filter(Boolean)}
                </div>
              )}
            </div>
          </div>

          {/* Alternative actions */}
          {suggestion.alternativeActions && suggestion.alternativeActions.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1.5">{t('escalation.alsoConsider')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.alternativeActions.map((alt, i) => (
                  <button
                    key={i}
                    className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                    title={alt.reason}
                  >
                    {alt.action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Building & Landlord Context */}
      {(buildingHistory.totalCases > 0 || landlordPattern.totalCases > 0) && caseData.stage !== 'resolved' && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <div className="flex flex-wrap gap-3 text-xs">
            {buildingHistory.totalCases > 0 && (
              <span className="text-gray-600 inline-flex items-center gap-1">
                <HomeIcon className="w-3 h-3" /> {t('escalation.building')}: {buildingHistory.victories}/{buildingHistory.totalCases} {t('escalation.wins')}
                {buildingHistory.winRate > 0 && ` (${Math.round(buildingHistory.winRate * 100)}%)`}
              </span>
            )}
            {landlordPattern.totalCases > 0 && landlordPattern.typicalBehavior !== 'unknown' && (
              <span className={`inline-flex items-center gap-1 ${
                landlordPattern.typicalBehavior === 'hostile' ? 'text-red-600' :
                landlordPattern.typicalBehavior === 'ignores_until_pressure' ? 'text-orange-600' :
                landlordPattern.typicalBehavior === 'slow' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                <UserIcon className="w-3 h-3" /> {t('escalation.landlord')}: {landlordPattern.typicalBehavior.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Strike Escalation Panel - shows when conditions are met or case is linked to strike */}
      {caseData.stage !== 'resolved' && (shouldSuggestStrike(caseData.buildingId) || caseData.strikePreparationId || getStrikeForBuilding(caseData.buildingId)) && (
        <div className="px-4 py-2 flex-shrink-0">
          <StrikeEscalationPanel
            buildingId={caseData.buildingId}
            buildingAddress={caseData.buildingAddress}
            linkedCases={getActiveCases(caseData.buildingId)}
            onStrikeCreated={refreshCase}
          />
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
            {t(`escalation.tab.${tab}`)}
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
                  <p className="font-medium text-blue-700">{t('escalation.draftDemand')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.draftDemandDesc')}</p>
                </button>
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-700">{t('escalation.addNote')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.addNoteDesc')}</p>
                </button>
              </>
            )}

            {caseData.stage === 'drafted' && (
              <>
                <button
                  onClick={() => setShowDeliveryForm(true)}
                  className="w-full p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <p className="font-medium text-blue-700">{t('escalation.recordDelivery')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.recordDeliveryDesc')}</p>
                </button>
                <button
                  onClick={() => setShowDemandForm(true)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-700">{t('escalation.editDemand')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.editDemandDesc')}</p>
                </button>
              </>
            )}

            {(caseData.stage === 'delivered' || caseData.stage === 'awaiting') && (
              <>
                <button
                  onClick={() => setShowResponseForm(true)}
                  className="w-full p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <p className="font-medium text-blue-700">{t('escalation.logResponse')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.logResponseDesc')}</p>
                </button>
                <button
                  onClick={() => setShowEscalationForm(true)}
                  className="w-full p-3 text-left border border-orange-200 rounded-lg hover:bg-orange-50"
                >
                  <p className="font-medium text-orange-700">{t('escalation.startEscalation')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.startEscalationDesc')}</p>
                </button>
              </>
            )}

            {caseData.stage === 'escalating' && (
              <>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-700 mb-2">{t('escalation.activeEscalations')}</p>
                  {caseData.escalationPaths.length === 0 ? (
                    <p className="text-sm text-gray-500">{t('escalation.noEscalationsYet')}</p>
                  ) : (
                    <div className="space-y-2">
                      {caseData.escalationPaths.map((path, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1">
                            {path.type === 'code_enforcement' && <><BuildingLibraryIcon className="w-4 h-4" /> {t('escalation.codeEnforcement')}</>}
                            {path.type === 'legal' && <><ScaleIcon className="w-4 h-4" /> {t('escalation.legal')}</>}
                            {path.type === 'strike' && <><HandRaisedIcon className="w-4 h-4" /> {t('escalation.strike')}</>}
                            {path.type === 'public_pressure' && <><MegaphoneIcon className="w-4 h-4" /> {t('escalation.publicPressure')}</>}
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
                  <p className="font-medium text-orange-700">{t('escalation.addEscalationPath')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.addEscalationPathDesc')}</p>
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
                  <p className="font-medium text-green-700">{t('escalation.resolveCase')}</p>
                  <p className="text-sm text-gray-600">{t('escalation.resolveCaseDesc')}</p>
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
                  {caseData.resolution.type === 'victory' && `🎉 ${t('escalation.victory')}`}
                  {caseData.resolution.type === 'compromise' && `🤝 ${t('escalation.compromise')}`}
                  {caseData.resolution.type === 'loss' && `❌ ${t('escalation.loss')}`}
                  {caseData.resolution.type === 'ongoing' && `🔄 ${t('escalation.ongoing')}`}
                  {caseData.resolution.type === 'abandoned' && `⏸️ ${t('escalation.abandoned')}`}
                </p>
                <p className="text-sm mt-1">{caseData.resolution.summary}</p>
                {caseData.resolution.demandsMet && caseData.resolution.demandsMet.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">{t('escalation.demandsMet')}</p>
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
              <p className="text-center text-gray-500 py-4">{t('escalation.noEvidenceYet')}</p>
            ) : (
              caseData.evidence.map((ev) => (
                <div key={ev.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">
                      {ev.type === 'photo' && <CameraIcon className="w-5 h-5" />}
                      {ev.type === 'document' && <DocumentTextIcon className="w-5 h-5" />}
                      {ev.type === 'video' && <VideoCameraIcon className="w-5 h-5" />}
                      {ev.type === 'receipt' && <DocumentIcon className="w-5 h-5" />}
                      {ev.type === 'other' && <PaperClipIcon className="w-5 h-5" />}
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
              {t('escalation.addEvidence')}
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
  const { t } = useLanguage()
  const [demandText, setDemandText] = useState(existingDemand || '')
  const [deadlineDays, setDeadlineDays] = useState(existingDeadline || 14)
  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!demandText.trim() || !profile) return
    draftDemand(caseId, demandText, deadlineDays, profile.id)
    onSave()
  }

  return (
    <Modal title={t('escalation.draftDemand')} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.demandText')}
          </label>
          <textarea
            value={demandText}
            onChange={(e) => setDemandText(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('escalation.form.demandPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.responseDeadline')}
          </label>
          <select
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>7 {t('escalation.form.days')}</option>
            <option value={14}>14 {t('escalation.form.days')}</option>
            <option value={21}>21 {t('escalation.form.days')}</option>
            <option value={30}>30 {t('escalation.form.days')}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            {t('escalation.form.cancel')}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t('escalation.form.saveDraft')}
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
  const { t } = useLanguage()
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
    <Modal title={t('escalation.recordDelivery')} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.deliveryMethod')}
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as DeliveryMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="certified_mail">{t('escalation.form.certifiedMail')}</option>
            <option value="email">{t('escalation.form.email')}</option>
            <option value="hand_delivered">{t('escalation.form.handDelivered')}</option>
            <option value="posted">{t('escalation.form.posted')}</option>
            <option value="other">{t('escalation.form.other')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.proof')}
          </label>
          <input
            type="text"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder={t('escalation.form.proofPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.deadlineFromToday')}
          </label>
          <select
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>7 {t('escalation.form.days')}</option>
            <option value={14}>14 {t('escalation.form.days')}</option>
            <option value={21}>21 {t('escalation.form.days')}</option>
            <option value={30}>30 {t('escalation.form.days')}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            {t('escalation.form.cancel')}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t('escalation.form.markDelivered')}
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
  const { t } = useLanguage()
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
    <Modal title={t('escalation.logResponse')} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.responseType')}
          </label>
          <select
            value={responseType}
            onChange={(e) => setResponseType(e.target.value as ResponseType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="agreed">{t('escalation.form.agreed')}</option>
            <option value="partial">{t('escalation.form.partial')}</option>
            <option value="refused">{t('escalation.form.refused')}</option>
            <option value="ignored">{t('escalation.form.ignored')}</option>
            <option value="retaliated">{t('escalation.form.retaliated')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.contactMethod')}
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="none">{t('escalation.form.noContact')}</option>
            <option value="phone">{t('escalation.form.phone')}</option>
            <option value="email">{t('escalation.form.email')}</option>
            <option value="letter">{t('escalation.form.letter')}</option>
            <option value="in_person">{t('escalation.form.inPerson')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.summary')}
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder={t('escalation.form.summaryPlaceholder')}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            {t('escalation.form.cancel')}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t('escalation.form.logResponse')}
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
  const { t } = useLanguage()
  const [pathType, setPathType] = useState<EscalationPath['type']>('code_enforcement')
  const profile = getCurrentProfile()

  const alreadyActive = existingPaths.some(p => p.type === pathType && p.status === 'active')

  const handleSubmit = () => {
    if (!profile || alreadyActive) return
    startEscalation(caseId, pathType, profile.id)
    onSave()
  }

  const escalationOptions = [
    { value: 'code_enforcement', label: t('escalation.codeEnforcement'), icon: BuildingLibraryIcon, desc: t('escalation.form.codeEnforcementDesc') },
    { value: 'legal', label: t('escalation.form.legalAid'), icon: ScaleIcon, desc: t('escalation.form.legalAidDesc') },
    { value: 'strike', label: t('escalation.form.rentStrike'), icon: HandRaisedIcon, desc: t('escalation.form.rentStrikeDesc') },
    { value: 'public_pressure', label: t('escalation.publicPressure'), icon: MegaphoneIcon, desc: t('escalation.form.publicPressureDesc') },
  ]

  return (
    <Modal title={t('escalation.startEscalation')} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.escalationType')}
          </label>
          <div className="space-y-2">
            {escalationOptions.map((option) => (
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
                  <p className="font-medium flex items-center gap-2"><option.icon className="w-4 h-4" /> {option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
        {alreadyActive && (
          <p className="text-sm text-orange-600">
            {t('escalation.form.alreadyActive')}
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            {t('escalation.form.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={alreadyActive}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50"
          >
            {t('escalation.startEscalation')}
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
  const { t } = useLanguage()
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
    <Modal title={t('escalation.resolveCase')} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.resolutionType')}
          </label>
          <select
            value={resolutionType}
            onChange={(e) => setResolutionType(e.target.value as ResolutionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="victory">{t('escalation.form.victoryDemandsMet')}</option>
            <option value="compromise">{t('escalation.form.compromisePartial')}</option>
            <option value="loss">{t('escalation.form.lossDemandNotMet')}</option>
            <option value="ongoing">{t('escalation.form.ongoingContinue')}</option>
            <option value="abandoned">{t('escalation.form.abandonedNotPursuing')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.summary')}
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder={t('escalation.form.outcomePlaceholder')}
          />
        </div>
        {(resolutionType === 'victory' || resolutionType === 'compromise') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('escalation.form.demandsMetPerLine')}
            </label>
            <textarea
              value={demandsMet}
              onChange={(e) => setDemandsMet(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t('escalation.form.demandsMetPlaceholder')}
            />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            {t('escalation.form.cancel')}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
            {t('escalation.resolveCase')}
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
  const { t } = useLanguage()
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
    <Modal title={t('escalation.addNote')} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('escalation.form.note')}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder={t('escalation.form.notePlaceholder')}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
            {t('escalation.form.cancel')}
          </button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t('escalation.form.addNote')}
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
