'use client'

import { BuildingDemand } from '@/lib/buildingOrganizingStorage'
import { DemandCard } from './DemandCard'

interface DemandsListProps {
  demands: BuildingDemand[]
  buildingId: string
  totalUnits: number
  onUpdate: () => void
}

export function DemandsList({ demands, buildingId, totalUnits, onUpdate }: DemandsListProps) {
  if (demands.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No demands yet</p>
        <p className="text-xs text-gray-400 mt-1">Complaints with +5 net votes become demands</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {demands.map(demand => (
        <DemandCard
          key={demand.id}
          demand={demand}
          buildingId={buildingId}
          totalUnits={totalUnits}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
