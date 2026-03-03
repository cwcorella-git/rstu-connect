'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { isAdmin } from '@/lib/storage/profileStorage'
import { useLanguage } from './LanguageContext'
import { isGitHubConfigured, setStoredToken, clearStoredToken, validateToken } from '@/lib/services/githubService'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

interface EditModeContextType {
  isEditMode: boolean
  editingKey: string | null
  saveStatus: SaveStatus
  error: string | null
  currentLanguage: string
  needsTokenSetup: boolean
  isValidatingToken: boolean
  setEditingKey: (key: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setError: (error: string | null) => void
  toggleEditMode: () => void
  exitEditMode: () => void
  submitToken: (token: string) => Promise<boolean>
  clearToken: () => void
}

const EditModeContext = createContext<EditModeContextType | null>(null)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [needsTokenSetup, setNeedsTokenSetup] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(false)
  const { locale } = useLanguage()

  // Check if token is configured when entering edit mode
  const checkTokenSetup = useCallback(() => {
    const hasToken = isGitHubConfigured()
    setNeedsTokenSetup(!hasToken)
    return hasToken
  }, [])

  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      // Exiting edit mode - clear state
      setIsEditMode(false)
      setEditingKey(null)
      setSaveStatus('idle')
      setError(null)
      setNeedsTokenSetup(false)
    } else {
      // Entering edit mode - require admin status
      if (!isAdmin()) {
        // Silently ignore non-admins
        return
      }
      setIsEditMode(true)
      checkTokenSetup()
    }
  }, [isEditMode, checkTokenSetup])

  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
    setEditingKey(null)
    setSaveStatus('idle')
    setError(null)
    setNeedsTokenSetup(false)
  }, [])

  const submitToken = useCallback(async (token: string): Promise<boolean> => {
    setIsValidatingToken(true)
    setError(null)

    try {
      const isValid = await validateToken(token)
      if (isValid) {
        setStoredToken(token)
        setNeedsTokenSetup(false)
        return true
      } else {
        setError('Invalid token. Make sure it has repo access.')
        return false
      }
    } catch {
      setError('Failed to validate token')
      return false
    } finally {
      setIsValidatingToken(false)
    }
  }, [])

  const clearToken = useCallback(() => {
    clearStoredToken()
    setNeedsTokenSetup(true)
  }, [])

  // Handle Ctrl+Shift+E to toggle edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        toggleEditMode()
      }
      // Handle global Escape to exit edit mode
      if (e.key === 'Escape' && isEditMode && !editingKey && !needsTokenSetup) {
        exitEditMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleEditMode, exitEditMode, isEditMode, editingKey, needsTokenSetup])

  // Clear success status after delay
  useEffect(() => {
    if (saveStatus === 'success') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        editingKey,
        saveStatus,
        error,
        currentLanguage: locale,
        needsTokenSetup,
        isValidatingToken,
        setEditingKey,
        setSaveStatus,
        setError,
        toggleEditMode,
        exitEditMode,
        submitToken,
        clearToken,
      }}
    >
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (!context) {
    throw new Error('useEditMode must be used within an EditModeProvider')
  }
  return context
}
