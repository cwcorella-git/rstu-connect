'use client'

import { getStatusInfo, type OrganizingStatus } from '@/lib/buildingOrganizingStorage'

interface OrganizingStatusBadgeProps {
  status: OrganizingStatus
  showDescription?: boolean
}

export function OrganizingStatusBadge({ status, showDescription = false }: OrganizingStatusBadgeProps) {
  const info = getStatusInfo(status)

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${info.bgColor} ${info.color}`}>
        {info.label}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500">{info.description}</span>
      )}
    </div>
  )
}
