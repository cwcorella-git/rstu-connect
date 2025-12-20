'use client'

import { BuildingComplaint } from '@/lib/buildingOrganizingStorage'
import { ComplaintCard } from './ComplaintCard'

interface ComplaintsListProps {
  complaints: BuildingComplaint[]
  buildingId: string
  onUpdate: () => void
}

export function ComplaintsList({ complaints, buildingId, onUpdate }: ComplaintsListProps) {
  // Separate by status
  const voting = complaints.filter(c => c.status === 'voting')
  const other = complaints.filter(c => c.status !== 'voting')

  if (complaints.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">No complaints submitted yet</p>
        <p className="text-xs text-gray-400 mt-1">Be the first to voice a concern</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active voting */}
      {voting.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Under Vote ({voting.length})
          </h4>
          <div className="space-y-3">
            {voting.map(complaint => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                buildingId={buildingId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past complaints */}
      {other.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Past Complaints ({other.length})
          </h4>
          <div className="space-y-3">
            {other.map(complaint => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                buildingId={buildingId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
