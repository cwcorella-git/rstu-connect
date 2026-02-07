'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  DocumentTextIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  CheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import type { EscalationCase, EscalationStage } from '@/lib/storage/escalationStorage'
import { shouldSuggestStrike } from '@/lib/storage/escalationStorage'

// ============================================================================
// Types
// ============================================================================

export type LadderStepId = 'document' | 'report' | 'demand' | 'escalate' | 'strike'
export type LadderStepStatus = 'completed' | 'current' | 'upcoming' | 'locked'

export interface LadderStep {
  id: LadderStepId
  status: LadderStepStatus
  completedAt?: number
}

export interface EscalationLadderProps {
  caseData: EscalationCase
  onActionClick?: (actionType: string) => void
  variant?: 'full' | 'compact'
  showStrike?: boolean
}

// ============================================================================
// Step Configuration
// ============================================================================

const STEP_ICONS: Record<LadderStepId, React.ComponentType<{ className?: string }>> = {
  document: DocumentTextIcon,
  report: PencilSquareIcon,
  demand: EnvelopeIcon,
  escalate: ArrowTrendingUpIcon,
  strike: FireIcon,
}

const STEP_COLORS: Record<LadderStepStatus, { bg: string; text: string; border: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
  current: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
  upcoming: { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-300' },
  locked: { bg: 'bg-gray-50', text: 'text-gray-300', border: 'border-gray-200' },
}

// ============================================================================
// Stage to Step Mapping
// ============================================================================

function mapStageToStep(stage: EscalationStage): LadderStepId {
  switch (stage) {
    case 'identified':
      return 'document'
    case 'drafted':
      return 'report'
    case 'delivered':
    case 'awaiting':
      return 'demand'
    case 'escalating':
      return 'escalate'
    case 'resolved':
      // Return the last active step for resolved cases
      return 'escalate'
  }
}

function getStepIndex(stepId: LadderStepId): number {
  const order: LadderStepId[] = ['document', 'report', 'demand', 'escalate', 'strike']
  return order.indexOf(stepId)
}

// ============================================================================
// Main Component
// ============================================================================

export function EscalationLadder({
  caseData,
  onActionClick,
  variant = 'full',
  showStrike: showStrikeProp,
}: EscalationLadderProps) {
  const { t } = useLanguage()

  // Determine if strike step should be shown
  const showStrike = showStrikeProp ?? shouldSuggestStrike(caseData.buildingId)

  // Calculate step statuses
  const steps = useMemo(() => {
    const currentStep = mapStageToStep(caseData.stage)
    const currentIndex = getStepIndex(currentStep)
    const isResolved = caseData.stage === 'resolved'

    const stepIds: LadderStepId[] = showStrike
      ? ['document', 'report', 'demand', 'escalate', 'strike']
      : ['document', 'report', 'demand', 'escalate']

    return stepIds.map((stepId): LadderStep => {
      const stepIndex = getStepIndex(stepId)

      let status: LadderStepStatus
      if (isResolved) {
        // For resolved cases, show all steps up to current as completed
        status = stepIndex <= currentIndex ? 'completed' : 'locked'
      } else if (stepIndex < currentIndex) {
        status = 'completed'
      } else if (stepIndex === currentIndex) {
        status = 'current'
      } else if (stepIndex === currentIndex + 1) {
        status = 'upcoming'
      } else {
        status = 'locked'
      }

      return { id: stepId, status }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- buildingId used for strike visibility check
  }, [caseData.stage, showStrike, caseData.buildingId])

  // Get actions for current step
  const currentStepActions = useMemo(() => {
    const actions: { label: string; actionType: string; recommended?: boolean }[] = []

    switch (caseData.stage) {
      case 'identified':
        actions.push(
          { label: t('ladder.action.draftDemand'), actionType: 'draft_demand', recommended: true },
          { label: t('ladder.action.addEvidence'), actionType: 'add_evidence' }
        )
        break
      case 'drafted':
        actions.push(
          { label: t('ladder.action.recordDelivery'), actionType: 'record_delivery', recommended: true },
          { label: t('ladder.action.editDemand'), actionType: 'edit_demand' }
        )
        break
      case 'delivered':
      case 'awaiting':
        actions.push(
          { label: t('ladder.action.logResponse'), actionType: 'log_response' },
          { label: t('ladder.action.startEscalation'), actionType: 'start_escalation', recommended: true }
        )
        break
      case 'escalating':
        actions.push(
          { label: t('ladder.action.addEscalationPath'), actionType: 'add_escalation' },
          { label: t('ladder.action.resolveCase'), actionType: 'resolve' }
        )
        break
    }

    return actions
  }, [caseData.stage, t])

  if (variant === 'compact') {
    return <EscalationLadderCompact steps={steps} />
  }

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        {t('ladder.title')}
      </h4>

      <div className="relative">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id]
          const colors = STEP_COLORS[step.status]
          const isLast = index === steps.length - 1
          const isStrike = step.id === 'strike'

          return (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-6 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Step row */}
              <div className={`flex items-start gap-3 py-2 ${step.status === 'current' ? 'bg-blue-50 -mx-2 px-2 rounded-lg' : ''}`}>
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${colors.border} ${colors.bg}`}
                >
                  {step.status === 'completed' ? (
                    <CheckIcon className={`w-5 h-5 ${colors.text}`} />
                  ) : step.status === 'locked' ? (
                    <LockClosedIcon className={`w-4 h-4 ${colors.text}`} />
                  ) : (
                    <Icon className={`w-5 h-5 ${colors.text} ${isStrike ? 'text-red-600' : ''}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className={`font-medium ${colors.text} ${isStrike && step.status !== 'locked' ? 'text-red-700' : ''}`}>
                      {t(`ladder.${step.id}`)}
                    </h5>
                    {step.status === 'current' && (
                      <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">
                        {t('ladder.current')}
                      </span>
                    )}
                    {step.status === 'completed' && (
                      <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                        {t('ladder.completed')}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${step.status === 'locked' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t(`ladder.${step.id}.desc`)}
                  </p>

                  {/* Criteria for current step */}
                  {step.status === 'current' && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">{t('ladder.criteria')}: </span>
                      {t(`ladder.${step.id}.criteria`)}
                    </div>
                  )}

                  {/* Actions for current step */}
                  {step.status === 'current' && currentStepActions.length > 0 && onActionClick && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentStepActions.map((action) => (
                        <button
                          key={action.actionType}
                          onClick={() => onActionClick(action.actionType)}
                          className={`text-xs px-3 py-1.5 rounded-lg border ${
                            action.recommended
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Compact Version (for case cards)
// ============================================================================

function EscalationLadderCompact({ steps }: { steps: LadderStep[] }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.id]
        const isLast = index === steps.length - 1
        const isStrike = step.id === 'strike'

        return (
          <div key={step.id} className="flex items-center">
            {/* Step dot/icon */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'current'
                  ? 'bg-blue-500 ring-2 ring-blue-200 animate-pulse'
                  : 'bg-gray-200'
              }`}
              title={t(`ladder.${step.id}`)}
            >
              {step.status === 'completed' ? (
                <CheckIcon className="w-3.5 h-3.5 text-white" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${
                  step.status === 'current'
                    ? 'text-white'
                    : isStrike
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`} />
              )}
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={`w-3 h-0.5 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export { EscalationLadderCompact }
