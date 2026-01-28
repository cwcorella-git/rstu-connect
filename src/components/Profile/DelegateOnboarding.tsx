'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getCurrentDelegateProfile,
  type DelegateProfile,
} from '@/lib/delegateStorage'
import { getDelegateThresholds } from '@/lib/adminSettingsStorage'

interface DelegateOnboardingProps {
  onNavigateToTools?: () => void
  onNavigateToBlocs?: () => void
  onNavigateToBuilding?: () => void
}

export function DelegateOnboarding({
  onNavigateToTools,
  onNavigateToBlocs,
  onNavigateToBuilding,
}: DelegateOnboardingProps) {
  const { t } = useLanguage()

  const delegateProfile = useMemo(() => getCurrentDelegateProfile(), [])
  const thresholds = useMemo(() => getDelegateThresholds(), [])

  if (!delegateProfile) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
        No profile data available
      </div>
    )
  }

  const { qualificationStatus, canVoteOnAppGovernance, delegateWeight } = delegateProfile
  const isQualified = canVoteOnAppGovernance

  // Calculate progress
  const tenantsProgress = Math.min(100, (delegateProfile.verifiedTenantsRepresented / thresholds.minVerifiedTenants) * 100)
  const blocsProgress = Math.min(100, (delegateProfile.blocs.length / thresholds.minBlocs) * 100)
  const activityProgress = Math.min(100, (delegateProfile.activityScore / thresholds.minActivityScore) * 100)

  // Count completed requirements
  const completedCount = [
    qualificationStatus.meetsTenantsThreshold,
    qualificationStatus.meetsBlocsThreshold,
    qualificationStatus.meetsActivityThreshold,
  ].filter(Boolean).length

  // If qualified, show celebration + what they can do
  if (isQualified) {
    return (
      <div className="space-y-4">
        {/* Qualified Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">You're a Qualified Delegate!</h3>
              <p className="text-green-100 mt-1">
                Voting weight: <span className="font-bold text-white">{delegateWeight.toFixed(1)} points</span>
              </p>
            </div>
          </div>
        </div>

        {/* What You Can Do */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Your Delegate Powers</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">Vote on App Features</p>
                <p className="text-sm text-blue-700">Enable/disable features, change tab visibility</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-purple-900">Shape Union Direction</p>
                <p className="text-sm text-purple-700">Vote on strategic decisions and policies</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-900">Admin Accountability</p>
                <p className="text-sm text-red-700">Vote to recall admins who don't serve tenants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Representation</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{delegateProfile.verifiedTenantsRepresented}</div>
              <div className="text-xs text-gray-500">Tenants</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{delegateProfile.blocs.length}</div>
              <div className="text-xs text-gray-500">Blocs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{delegateProfile.activityScore}</div>
              <div className="text-xs text-gray-500">Activity</div>
            </div>
          </div>
        </div>

        {/* Bookchin Principle */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-900">The Bookchin Principle</p>
              <p className="text-xs text-amber-700 mt-1">
                Admins maintain the platform but cannot vote. Power flows from tenants through delegates like you.
                Your voting weight represents the {delegateProfile.verifiedTenantsRepresented} tenants you've organized.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not yet qualified - show progression path
  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-amber-900">Become a Delegate</h3>
            <p className="text-sm text-amber-700">{completedCount}/3 requirements met</p>
          </div>
        </div>
        <div className="w-full bg-amber-200 rounded-full h-2">
          <div
            className="h-2 bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* What is a Delegate */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-2">What is a Delegate?</h4>
        <p className="text-sm text-gray-600 mb-3">
          Delegates are organizers who earn <strong>voting power</strong> by representing real tenants.
          As a delegate, you can vote on app-wide decisions — which features to enable, strategic direction,
          and even removing admins who don't serve tenants.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Admins cannot vote</strong> (the Bookchin principle). Power flows from tenants through delegates.
        </p>
      </div>

      {/* Requirements with CTAs */}
      <div className="space-y-3">
        {/* Requirement 1: Verified Tenants */}
        <div className={`rounded-lg border-2 p-4 ${
          qualificationStatus.meetsTenantsThreshold
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                qualificationStatus.meetsTenantsThreshold ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {qualificationStatus.meetsTenantsThreshold ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold text-gray-500">1</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${qualificationStatus.meetsTenantsThreshold ? 'text-green-800' : 'text-gray-900'}`}>
                    Verify Tenants
                  </p>
                  <span className="text-sm font-medium text-gray-600">
                    {delegateProfile.verifiedTenantsRepresented}/{thresholds.minVerifiedTenants}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Go door-to-door and mark tenants as "verified" in the unit tracker
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      qualificationStatus.meetsTenantsThreshold ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${tenantsProgress}%` }}
                  />
                </div>
              </div>
            </div>
            {!qualificationStatus.meetsTenantsThreshold && onNavigateToTools && (
              <button
                onClick={onNavigateToTools}
                className="px-3 py-1.5 bg-rstu-red text-white text-xs font-medium rounded-lg hover:bg-red-700 flex-shrink-0"
              >
                Start Canvassing
              </button>
            )}
          </div>
        </div>

        {/* Requirement 2: Join/Create Bloc */}
        <div className={`rounded-lg border-2 p-4 ${
          qualificationStatus.meetsBlocsThreshold
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                qualificationStatus.meetsBlocsThreshold ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {qualificationStatus.meetsBlocsThreshold ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold text-gray-500">2</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${qualificationStatus.meetsBlocsThreshold ? 'text-green-800' : 'text-gray-900'}`}>
                    Organize a Bloc
                  </p>
                  <span className="text-sm font-medium text-gray-600">
                    {delegateProfile.blocs.length}/{thresholds.minBlocs}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Create or join a bloc — a group of tenants organizing together
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      qualificationStatus.meetsBlocsThreshold ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${blocsProgress}%` }}
                  />
                </div>
              </div>
            </div>
            {!qualificationStatus.meetsBlocsThreshold && onNavigateToBlocs && (
              <button
                onClick={onNavigateToBlocs}
                className="px-3 py-1.5 bg-rstu-red text-white text-xs font-medium rounded-lg hover:bg-red-700 flex-shrink-0"
              >
                Find Blocs
              </button>
            )}
          </div>
        </div>

        {/* Requirement 3: Activity Score */}
        <div className={`rounded-lg border-2 p-4 ${
          qualificationStatus.meetsActivityThreshold
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                qualificationStatus.meetsActivityThreshold ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {qualificationStatus.meetsActivityThreshold ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold text-gray-500">3</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${qualificationStatus.meetsActivityThreshold ? 'text-green-800' : 'text-gray-900'}`}>
                    Build Activity Score
                  </p>
                  <span className="text-sm font-medium text-gray-600">
                    {delegateProfile.activityScore}/{thresholds.minActivityScore}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Create proposals (+10), vote on proposals (+2), organize buildings (+5)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      qualificationStatus.meetsActivityThreshold ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${activityProgress}%` }}
                  />
                </div>
              </div>
            </div>
            {!qualificationStatus.meetsActivityThreshold && onNavigateToBuilding && (
              <button
                onClick={onNavigateToBuilding}
                className="px-3 py-1.5 bg-rstu-red text-white text-xs font-medium rounded-lg hover:bg-red-700 flex-shrink-0"
              >
                Get Active
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Activity So Far</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-gray-900">{delegateProfile.proposalsCreated}</div>
            <div className="text-xs text-gray-500">Proposals (+10 ea)</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{delegateProfile.votesParticipated}</div>
            <div className="text-xs text-gray-500">Votes (+2 ea)</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{delegateProfile.buildingsRepresented}</div>
            <div className="text-xs text-gray-500">Buildings (+5 ea)</div>
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Why Delegate Status Matters</p>
            <p className="text-xs text-blue-700 mt-1">
              Your voting weight is calculated from the tenants you represent. This ensures decisions
              reflect actual tenant power, not whoever has the most free time to click buttons.
              The square root formula prevents any single organizer from dominating.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
