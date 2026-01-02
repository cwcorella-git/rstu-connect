'use client'

import { useState, useEffect } from 'react'

interface VersionData {
  commit: string
  message: string
}

export function VersionInfo() {
  const [isVisible, setIsVisible] = useState(false)
  const [versionData, setVersionData] = useState<VersionData | null>(null)

  useEffect(() => {
    fetch('/version-info.json')
      .then(res => res.json())
      .then(data => setVersionData(data))
      .catch(err => console.warn('Version info not available'))
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        setIsVisible(!isVisible)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  if (!versionData || !isVisible) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 bg-gray-900 text-gray-100 text-xs p-3 rounded-tl-lg font-mono shadow-lg">
      <div className="space-y-1">
        <div className="text-yellow-300 font-bold">{versionData.commit}</div>
        <div className="text-gray-400 text-xs">{versionData.message}</div>
        <div className="text-gray-500 text-xs mt-2 cursor-pointer" onClick={() => setIsVisible(false)}>
          (Ctrl+Shift+V to hide)
        </div>
      </div>
    </div>
  )
}
