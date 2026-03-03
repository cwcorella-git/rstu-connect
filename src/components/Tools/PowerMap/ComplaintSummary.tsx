'use client'

import { COMPLAINT_CATEGORIES } from '@/lib/storage/canvassStorage'

interface ComplaintSummaryProps {
  complaintsByCategory: Record<string, number>
  totalComplaints: number
}

// Create a lookup map for category labels
const categoryLabelMap: Map<string, string> = new Map(
  COMPLAINT_CATEGORIES.map(cat => [cat.key, cat.label])
)

export function ComplaintSummary({ complaintsByCategory, totalComplaints }: ComplaintSummaryProps) {
  if (totalComplaints === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        No complaints filed across this portfolio
      </div>
    )
  }

  // Sort categories by count
  const sortedCategories = Object.entries(complaintsByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6) // Top 6 categories

  const maxCount = sortedCategories[0]?.[1] || 1

  return (
    <div className="space-y-2">
      {sortedCategories.map(([category, count]) => {
        const label = categoryLabelMap.get(category) || category
        const percentage = (count / maxCount) * 100

        return (
          <div key={category}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">{label}</span>
              <span className="text-gray-500">{count} buildings</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
