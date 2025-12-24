'use client'

import type { MetricStatus } from '@/lib/rentFairnessCalculations'

interface FairnessMetricProps {
  title: string
  value: string
  benchmark?: string
  percentDiff?: number
  status: MetricStatus
  description: string
  showBar?: boolean
  barValue?: number  // 0-100 for progress bar
  children?: React.ReactNode
}

// Status colors - neutral, based on position relative to benchmark
const STATUS_CONFIG: Record<MetricStatus, { bg: string; text: string; border: string; icon: string }> = {
  below: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '↓',
  },
  at: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: '=',
  },
  above: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: '↑',
  },
  high: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: '↑↑',
  },
}

// Progress bar colors based on status
const BAR_COLORS: Record<MetricStatus, string> = {
  below: 'bg-blue-500',
  at: 'bg-gray-500',
  above: 'bg-yellow-500',
  high: 'bg-orange-500',
}

export function FairnessMetric({
  title,
  value,
  benchmark,
  percentDiff,
  status,
  description,
  showBar = false,
  barValue,
  children,
}: FairnessMetricProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className={`rounded-lg border p-3 ${config.bg} ${config.border}`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${config.text}`}>
            {config.icon}
          </span>
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        <span className={`text-sm font-bold ${config.text}`}>{value}</span>
      </div>

      {/* Benchmark comparison */}
      {benchmark && (
        <div className="text-xs text-gray-500 mb-1">
          {benchmark}
        </div>
      )}

      {/* Progress bar */}
      {showBar && barValue !== undefined && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${BAR_COLORS[status]}`}
            style={{ width: `${Math.min(100, Math.max(0, barValue))}%` }}
          />
        </div>
      )}

      {/* Description */}
      <div className={`text-xs ${config.text}`}>
        {description}
      </div>

      {/* Optional children (for inline prompts, etc.) */}
      {children && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}

// Compact version for summary views
export function FairnessMetricCompact({
  title,
  value,
  status,
}: Pick<FairnessMetricProps, 'title' | 'value' | 'status'>) {
  const config = STATUS_CONFIG[status]

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded ${config.bg}`}>
      <span className="text-xs text-gray-600">{title}</span>
      <span className={`text-xs font-medium ${config.text}`}>
        {config.icon} {value}
      </span>
    </div>
  )
}
