'use client'

import { useDelegateStatus, useDelegateStats } from '@/hooks/useDelegateStatus'
import { getDelegateThresholds } from '@/lib/adminSettingsStorage'
import { getLinkedGroups } from '@/lib/linkedPropertiesStorage'
import { useMemo } from 'react'

interface ProgressBarProps {
  current: number
  target: number
  label: string
  valueLabel?: string
  color: 'green' | 'amber' | 'blue'
}

function ProgressBar({ current, target, label, valueLabel, color }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isMet = current >= target

  const colorClasses = {
    green: { bar: 'bg-green-500', bg: 'bg-green-100', text: 'text-green-700' },
    amber: { bar: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-700' },
    blue: { bar: 'bg-blue-500', bg: 'bg-blue-100', text: 'text-blue-700' },
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className={isMet ? 'text-green-600 font-medium' : 'text-gray-500'}>
          {valueLabel || `${current} / ${target}`}
          {isMet && ' ✓'}
        </span>
      </div>
      <div className={`h-2 rounded-full ${colorClasses[color].bg}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color].bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function DelegateStatus() {
  const { delegateProfile, isDelegate, delegateWeight, isLoading } = useDelegateStatus()
  const { stats } = useDelegateStats()
  const thresholds = getDelegateThresholds()

  // Get bloc details
  const blocs = useMemo(() => {
    if (!delegateProfile) return []
    const allBlocs = getLinkedGroups()
    return allBlocs.filter(b => delegateProfile.blocs.includes(b.id))
  }, [delegateProfile])

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )
  }

  if (!delegateProfile) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delegate Status</h3>
        <p className="text-gray-600">Sign in to view your delegate status and voting power.</p>
      </div>
    )
  }

  const status = delegateProfile.qualificationStatus

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`p-6 rounded-lg border ${
        isDelegate
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {delegateProfile.nickname}
            </h3>
            <p className="text-sm text-gray-600 capitalize">
              {delegateProfile.role} · {isDelegate ? 'Qualified Delegate' : 'Not Yet Qualified'}
            </p>
          </div>
          {isDelegate && (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {delegateWeight.toFixed(1)}
              </div>
              <div className="text-xs text-green-700">Voting Weight</div>
            </div>
          )}
        </div>

        {isDelegate ? (
          <p className="text-sm text-green-700">
            You can vote on app-wide proposals. Your vote carries {delegateWeight.toFixed(1)} weight
            based on tenant representation and activity.
          </p>
        ) : (
          <p className="text-sm text-amber-700">
            Build tenant power to earn delegate status. Meet the thresholds below to vote on app decisions.
          </p>
        )}
      </div>

      {/* Qualification Progress */}
      <div className="p-6 bg-white rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-4">Qualification Progress</h4>
        <div className="space-y-4">
          <ProgressBar
            current={delegateProfile.verifiedTenantsRepresented}
            target={thresholds.minVerifiedTenants}
            label="Verified Tenants Represented"
            color={status.meetsTenantsThreshold ? 'green' : 'amber'}
          />
          <ProgressBar
            current={delegateProfile.blocs.length}
            target={thresholds.minBlocs}
            label="Blocs Organized"
            color={status.meetsBlocsThreshold ? 'green' : 'amber'}
          />
          <ProgressBar
            current={delegateProfile.activityScore}
            target={thresholds.minActivityScore}
            label="Activity Score"
            color={status.meetsActivityThreshold ? 'green' : 'blue'}
          />
        </div>

        {!isDelegate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>To qualify:</strong>
              {status.tenantsNeeded > 0 && (
                <span> Represent {status.tenantsNeeded} more verified tenant{status.tenantsNeeded !== 1 ? 's' : ''}.</span>
              )}
              {status.blocsNeeded > 0 && (
                <span> Organize {status.blocsNeeded} more bloc{status.blocsNeeded !== 1 ? 's' : ''}.</span>
              )}
              {status.activityNeeded > 0 && (
                <span> Earn {status.activityNeeded} more activity points.</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Activity Breakdown */}
      <div className="p-6 bg-white rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-4">Activity Breakdown</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {delegateProfile.proposalsCreated}
            </div>
            <div className="text-xs text-gray-600">Proposals Created</div>
            <div className="text-xs text-gray-400">+10 pts each</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {delegateProfile.votesParticipated}
            </div>
            <div className="text-xs text-gray-600">Votes Cast</div>
            <div className="text-xs text-gray-400">+2 pts each</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {delegateProfile.buildingsRepresented}
            </div>
            <div className="text-xs text-gray-600">Buildings</div>
            <div className="text-xs text-gray-400">+5 pts each</div>
          </div>
        </div>
      </div>

      {/* Blocs Represented */}
      {blocs.length > 0 && (
        <div className="p-6 bg-white rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-4">
            Your Blocs ({blocs.length})
          </h4>
          <div className="space-y-2">
            {blocs.map(bloc => (
              <div
                key={bloc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{bloc.name}</div>
                  <div className="text-xs text-gray-500">
                    {bloc.apns.length} building{bloc.apns.length !== 1 ? 's' : ''} ·
                    {bloc.memberProfiles?.length || 0} member{(bloc.memberProfiles?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Bloc
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Stats (for delegates) */}
      {isDelegate && stats && (
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-4">Delegate Network</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.totalDelegates}
              </div>
              <div className="text-xs text-blue-600">Active Delegates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.totalDelegateWeight.toFixed(1)}
              </div>
              <div className="text-xs text-blue-600">Total Vote Weight</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.totalTenantsRepresented}
              </div>
              <div className="text-xs text-blue-600">Tenants Represented</div>
            </div>
          </div>
          {stats.totalDelegateWeight > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-blue-700">
                Your weight is <strong>{((delegateWeight / stats.totalDelegateWeight) * 100).toFixed(1)}%</strong> of total delegate power
              </p>
            </div>
          )}
        </div>
      )}

      {/* How Voting Weight Works */}
      <div className="p-6 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-900 mb-2">How Voting Weight Works</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Base Weight:</strong> √(verified tenants) × 5
            <br />
            <span className="text-xs text-gray-500">
              Using square root prevents large blocs from dominating
            </span>
          </p>
          <p>
            <strong>Activity Bonus:</strong> Up to +50% based on participation
          </p>
          <p>
            <strong>Maximum Weight:</strong> 100 (cap to ensure diversity)
          </p>
        </div>
      </div>
    </div>
  )
}
