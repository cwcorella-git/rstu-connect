'use client'

import { useEditMode } from '@/contexts/EditModeContext'
import { isGitHubConfigured } from '@/lib/githubService'

/**
 * EditModeIndicator - Shows a status bar when edit mode is active
 *
 * Fixed at the top of the screen, shows:
 * - Edit mode status
 * - Current language being edited
 * - Save status (saving/success/error)
 * - Instructions to exit
 */
export function EditModeIndicator() {
  const { isEditMode, saveStatus, error, currentLanguage, exitEditMode } = useEditMode()

  if (!isEditMode) return null

  const isConfigured = isGitHubConfigured()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-sm px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            <span className="font-semibold">Edit Mode Active</span>
          </div>
          <span className="text-blue-200">|</span>
          <span className="text-blue-100">
            Editing: <span className="font-mono bg-blue-700 px-1 rounded">{currentLanguage.toUpperCase()}</span>
          </span>
        </div>

        {/* Center: Save status */}
        <div className="flex items-center gap-3">
          {!isConfigured && (
            <div className="flex items-center gap-2 text-yellow-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>GitHub token not configured</span>
            </div>
          )}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-blue-100">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving to GitHub...</span>
            </div>
          )}
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved! Deploy in progress...</span>
            </div>
          )}
          {saveStatus === 'error' && error && (
            <div className="flex items-center gap-2 text-red-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: Instructions and exit */}
        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-xs">
            Ctrl+Click text to edit
          </span>
          <span className="text-blue-200">|</span>
          <button
            onClick={exitEditMode}
            className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded transition-colors"
          >
            Exit (Ctrl+Shift+E)
          </button>
        </div>
      </div>
    </div>
  )
}
