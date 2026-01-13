'use client'

import {
  type Victory,
  getVictoryTypeLabel,
  getVictoryTypeColor,
  formatVictoryDate,
} from '@/lib/victoryStorage'

interface VictoryCardProps {
  victory: Victory
  isSelected: boolean
  onClick: () => void
}

export function VictoryCard({ victory, isSelected, onClick }: VictoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-green-50 border-l-4 border-l-green-600' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getVictoryTypeColor(
                victory.type
              )}`}
            >
              {getVictoryTypeLabel(victory.type)}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {victory.title}
          </h4>

          {/* Landlord or building */}
          {victory.landlordName && (
            <p className="text-xs text-gray-500 truncate">{victory.landlordName}</p>
          )}
        </div>

        {/* Right side - date and impact */}
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-400">
            {formatVictoryDate(victory.date)}
          </div>
          {victory.unitsAffected && victory.unitsAffected > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">
              {victory.unitsAffected} unit{victory.unitsAffected !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Impact preview */}
      {victory.quantifiedImpact && (
        <div className="mt-1.5">
          <span className="text-xs text-green-700 font-medium">
            {victory.quantifiedImpact}
          </span>
        </div>
      )}

      {/* Tactics preview */}
      {victory.tactics && victory.tactics.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {victory.tactics.slice(0, 3).map((tactic, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600"
            >
              {tactic}
            </span>
          ))}
          {victory.tactics.length > 3 && (
            <span className="text-[10px] text-gray-400">
              +{victory.tactics.length - 3} more
            </span>
          )}
        </div>
      )}
    </button>
  )
}
