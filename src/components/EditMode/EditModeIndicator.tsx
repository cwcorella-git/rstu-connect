'use client'

import { useState, KeyboardEvent } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'

/**
 * EditModeIndicator - Shows a status bar when edit mode is active
 * Also handles GitHub token setup for saving changes
 */
export function EditModeIndicator() {
  const {
    isEditMode,
    saveStatus,
    error,
    currentLanguage,
    needsTokenSetup,
    isValidatingToken,
    exitEditMode,
    submitToken,
    clearToken,
  } = useEditMode()

  const [tokenInput, setTokenInput] = useState('')

  if (!isEditMode) return null

  const handleTokenSubmit = async () => {
    if (!tokenInput.trim()) return
    const success = await submitToken(tokenInput.trim())
    if (success) {
      setTokenInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTokenSubmit()
    } else if (e.key === 'Escape') {
      exitEditMode()
    }
  }

  // Token setup screen
  if (needsTokenSetup) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            GitHub Token Required
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            To edit content, you need a GitHub Personal Access Token with <code className="bg-gray-100 px-1 rounded">repo</code> access.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Access Token
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              disabled={isValidatingToken}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=RSTU%20Connect%20Editor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Create new token
            </a>
            <div className="flex gap-2">
              <button
                onClick={exitEditMode}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={isValidatingToken}
              >
                Cancel
              </button>
              <button
                onClick={handleTokenSubmit}
                disabled={isValidatingToken || !tokenInput.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isValidatingToken ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating...
                  </>
                ) : (
                  'Save Token'
                )}
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Your token is stored locally in your browser and never sent to our servers.
          </p>
        </div>
      </div>
    )
  }

  // Normal edit mode indicator
  return (
    <div className="sticky top-[57px] z-40 bg-blue-600 text-white text-sm px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            <span className="font-semibold">Edit Mode</span>
          </div>
          <span className="text-blue-200">|</span>
          <span className="text-blue-100">
            <span className="font-mono bg-blue-700 px-1 rounded">{currentLanguage.toUpperCase()}</span>
          </span>
        </div>

        {/* Center: Save status */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-blue-100">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved! Deploying...</span>
            </div>
          )}
          {saveStatus === 'error' && error && (
            <div className="flex items-center gap-2 text-red-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span
                className="max-w-[400px] overflow-x-auto whitespace-nowrap scrollbar-thin select-all cursor-text"
                title={error}
              >
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Right: Instructions and exit */}
        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-xs hidden sm:inline">
            Ctrl+Click to edit
          </span>
          <button
            onClick={clearToken}
            className="text-xs text-blue-200 hover:text-white"
            title="Change GitHub token"
          >
            Token
          </button>
          <span className="text-blue-200">|</span>
          <button
            onClick={exitEditMode}
            className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}
