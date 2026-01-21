'use client'

import { useMemo, useState } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import {
  getStrikePreparation,
  createStrikePreparation,
  calculateStrikeReadiness,
  type StrikePreparation,
} from '@/lib/strikeStorage'
import { getCurrentProfile } from '@/lib/profileStorage'
import { getHabitabilityScore } from '@/lib/canvassStorage'
import { getGroupForApn } from '@/lib/linkedPropertiesStorage'
import { RentStrikeVote } from '@/components/Chat/RentStrikeVote'
import { LegalChecklistPanel } from './Strike/LegalChecklistPanel'
import { ParticipationTracker } from './Strike/ParticipationTracker'
import { FinancialCalculator } from './Strike/FinancialCalculator'
import { DefensePreparation } from './Strike/DefensePreparation'
import { StrikeReadinessGauge } from './Strike/StrikeReadinessGauge'

interface RentStrikeToolkitProps {
  building: EnhancedBuilding
  mode?: 'building-tab' | 'organizer-dashboard' | 'campaign-detail'
  campaignId?: string
}

type StepType = 'legal' | 'participation' | 'financial' | 'defense'

export function RentStrikeToolkit({
  building,
  mode = 'building-tab',
  campaignId,
}: RentStrikeToolkitProps) {
  const currentUser = getCurrentProfile()
  const [activeStep, setActiveStep] = useState<StepType>('legal')
  const [showVoteModal, setShowVoteModal] = useState(false)

  // Initialize or get existing strike preparation
  const strikePrep = useMemo(() => {
    let strike = getStrikePreparation(building.chatSlug)
    if (!strike && currentUser) {
      strike = createStrikePreparation(building.chatSlug, currentUser.id)
      if (campaignId) {
        // Store campaign ID if provided (would need to update strike)
      }
    }
    return strike
  }, [building.chatSlug, currentUser, campaignId])

  // Calculate strike readiness
  const readiness = useMemo(
    () => (strikePrep ? calculateStrikeReadiness(strikePrep.id) : null),
    [strikePrep?.id]
  )

  // Get habitability score for legal checklist
  const habitabilityScore = useMemo(
    () => getHabitabilityScore(building.chatSlug),
    [building.chatSlug]
  )

  // Generate demands text from strike preparation
  const demandsText = useMemo(() => {
    if (!strikePrep || !habitabilityScore) return ''

    const issues = habitabilityScore.issueBreakdown.slice(0, 3)
    const issueList = issues
      .map(issue => `${issue.label} (${issue.count} units affected)`)
      .join('; ')

    const demands = []
    if (issueList) {
      demands.push(`Address habitability issues: ${issueList}`)
    }
    if (strikePrep.financial.monthlyRentAtRisk > 0) {
      demands.push(
        `Escrow account established for ${strikePrep.participation.committedUnits.length} units (${strikePrep.participation.percentCommitted}% participation)`
      )
    }

    return demands.join('. ')
  }, [strikePrep, habitabilityScore])

  // Get property group for vote - must be before early return
  const propertyGroup = useMemo(() => getGroupForApn(building.apn) || null, [building.apn])

  if (!strikePrep || !readiness || !currentUser) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <p>Loading strike preparation toolkit...</p>
      </div>
    )
  }

  // Define step order
  const steps: StepType[] = ['legal', 'participation', 'financial', 'defense']

  // Check if a step is complete
  const isStepComplete = (step: StepType): boolean => {
    switch (step) {
      case 'legal':
        return readiness.legalReady
      case 'participation':
        return readiness.participationReady
      case 'financial':
        return readiness.demandsReady
      case 'defense':
        return readiness.defenseReady
      default:
        return false
    }
  }

  // Get step label
  const getStepLabel = (step: StepType): string => {
    switch (step) {
      case 'legal':
        return 'Legal'
      case 'participation':
        return 'Participation'
      case 'financial':
        return 'Financial'
      case 'defense':
        return 'Defense'
      default:
        return step
    }
  }

  // Handle vote submission
  const handleVoteSubmit = (message: string) => {
    // The vote is created in RentStrikeVote component via createProposal
    // Just close the modal here
    setShowVoteModal(false)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Rent Strike Preparation</h2>
        <p className="text-sm text-gray-600">
          {building.address} • {building.units} units
        </p>
      </div>

      {/* Readiness Gauge */}
      <div className="flex-shrink-0">
        <StrikeReadinessGauge readiness={readiness} />
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 p-4 border-b border-gray-200 flex-shrink-0 overflow-x-auto">
        {steps.map((step) => {
          const complete = isStepComplete(step)
          const active = activeStep === step
          return (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                active
                  ? 'bg-rstu-red text-white'
                  : complete
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {complete && <span className="mr-2">✓</span>}
              {getStepLabel(step)}
            </button>
          )
        })}
      </div>

      {/* Scrollable Content + Footer */}
      <div className="flex-1 overflow-y-auto">
        {/* Step Content */}
        <div className="p-4">
          {activeStep === 'legal' && (
            <LegalChecklistPanel strikePrep={strikePrep} building={building} />
          )}
          {activeStep === 'participation' && (
            <ParticipationTracker strikePrep={strikePrep} building={building} />
          )}
          {activeStep === 'financial' && (
            <FinancialCalculator strikePrep={strikePrep} building={building} />
          )}
          {activeStep === 'defense' && (
            <DefensePreparation strikePrep={strikePrep} building={building} />
          )}
        </div>

        {/* Actions Footer - Now part of scrollable content */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 sticky bottom-0">
          {readiness.overallReady ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">
                  ✓ All requirements met. Ready to authorize strike!
                </p>
              </div>
              <button
                onClick={() => setShowVoteModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Proceed to Strike Authorization Vote →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Next Steps:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {readiness.blockers.map((blocker, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{blocker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <RentStrikeVote
          building={building}
          propertyGroup={propertyGroup}
          prefilledDemands={demandsText}
          prefilledReason="repairs"
          onSubmit={handleVoteSubmit}
          onClose={() => setShowVoteModal(false)}
        />
      )}
    </div>
  )
}
