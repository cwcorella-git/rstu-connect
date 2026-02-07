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
} from '@heroicons/react/24/outline'
import type { EscalationCase, EscalationStage } from '@/lib/storage/escalationStorage'
import { shouldSuggestStrike } from '@/lib/storage/escalationStorage'

// ============================================================================
// Types
// ============================================================================

type LadderStepId = 'document' | 'report' | 'demand' | 'escalate' | 'strike'
type LadderStepStatus = 'completed' | 'current' | 'upcoming' | 'locked'

interface LadderStep {
  id: LadderStepId
  status: LadderStepStatus
}

interface EscalationLadderMiniProps {
  caseData: EscalationCase
  showLabels?: boolean
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

export function EscalationLadderMini({
  caseData,
  showLabels = false,
  showStrike: showStrikeProp,
}: EscalationLadderMiniProps) {
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
              className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'current'
                  ? 'bg-blue-500 ring-2 ring-blue-200'
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

              {/* Pulse animation for current step */}
              {step.status === 'current' && (
                <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25" />
              )}
            </div>

            {/* Label (optional) */}
            {showLabels && (
              <span className={`ml-1 text-xs ${
                step.status === 'completed'
                  ? 'text-green-600'
                  : step.status === 'current'
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-400'
              }`}>
                {t(`ladder.${step.id}.short`)}
              </span>
            )}

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
