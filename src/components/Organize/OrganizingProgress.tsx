'use client'

interface OrganizingProgressProps {
  linkedProfiles: number
  totalUnits: number
  targetPercent?: number // Default 65% for strike-ready
}

export function OrganizingProgress({ linkedProfiles, totalUnits, targetPercent = 65 }: OrganizingProgressProps) {
  const currentPercent = totalUnits > 0 ? Math.round((linkedProfiles / totalUnits) * 100) : 0
  const progressWidth = Math.min(currentPercent, 100)
  const isAtTarget = currentPercent >= targetPercent

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">
          {linkedProfiles} of {totalUnits} tenants participating ({currentPercent}%)
        </span>
        <span className={isAtTarget ? 'text-green-600 font-medium' : 'text-gray-400'}>
          {targetPercent}% target
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtTarget ? 'bg-green-500' : currentPercent >= 10 ? 'bg-yellow-500' : 'bg-gray-400'
          }`}
          style={{ width: `${progressWidth}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute h-2 w-0.5 bg-red-600 -mt-2"
          style={{ marginLeft: `${targetPercent}%` }}
        />
      </div>
      {currentPercent < 10 && (
        <p className="text-xs text-gray-400">Reach 10% for Active status, {targetPercent}% for Strike-Ready</p>
      )}
    </div>
  )
}
