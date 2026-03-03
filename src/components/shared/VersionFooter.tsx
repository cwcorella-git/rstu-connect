'use client'

import { useState, useEffect } from 'react'
import { isAdmin, hasRole } from '@/lib/storage/profileStorage'

interface VersionData {
  commit: string
  message: string
  author: string
  date: string
  branch: string
  buildTime: string
}

export function VersionFooter() {
  const [versionData, setVersionData] = useState<VersionData | null>(null)
  const [isAdminOrOrganizer, setIsAdminOrOrganizer] = useState(false)

  useEffect(() => {
    // Check if user is admin or organizer
    setIsAdminOrOrganizer(isAdmin() || hasRole('organizer'))
  }, [])

  useEffect(() => {
    fetch('/version-info.json')
      .then(res => res.json())
      .then(data => setVersionData(data))
      .catch(() => {})
  }, [])

  // Only show to admins/organizers
  if (!versionData || !isAdminOrOrganizer) return null

  // Format the date nicely
  const dateObj = new Date(versionData.buildTime)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-300 text-xs px-4 py-2 border-t border-gray-700 z-30 font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Commit info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Commit:</span>
            <code className="text-yellow-300 font-bold bg-gray-800 px-2 py-1 rounded">{versionData.commit}</code>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-gray-500">Branch:</span>
            <code className="text-green-300 bg-gray-800 px-2 py-1 rounded">{versionData.branch}</code>
          </div>
        </div>

        {/* Right: Date and message */}
        <div className="flex items-center gap-3 text-right min-w-0">
          <div className="hidden md:flex flex-col gap-1 text-gray-400">
            <div className="text-xs">{formattedDate}</div>
            <div className="text-xs text-gray-500 truncate">{versionData.message}</div>
          </div>
          <div className="text-xs text-gray-500">
            Built {new Date(versionData.buildTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  )
}
