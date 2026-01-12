'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { isAdmin } from '@/lib/profileStorage'
import { useLanguage } from './LanguageContext'
import { isGitHubConfigured, getStoredToken, setStoredToken, clearStoredToken, validateToken } from '@/lib/githubService'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

// Access code for edit mode (requires admin + this code)
// Can be overridden via environment variable
const EDIT_ACCESS_CODE = process.env.NEXT_PUBLIC_EDIT_ACCESS_CODE || 'rstuEd1t!'

interface EditModeContextType {
  isEditMode: boolean
  editingKey: string | null
  saveStatus: SaveStatus
  error: string | null
  currentLanguage: string
  needsTokenSetup: boolean
  isValidatingToken: boolean
  needsAccessCode: boolean
  setEditingKey: (key: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setError: (error: string | null) => void
  toggleEditMode: () => void
  exitEditMode: () => void
  submitToken: (token: string) => Promise<boolean>
  submitAccessCode: (code: string) => boolean
  clearToken: () => void
}

const EditModeContext = createContext<EditModeContextType | null>(null)

// Storage key for remembering edit access
const EDIT_ACCESS_KEY = 'rstu_edit_access'

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [needsTokenSetup, setNeedsTokenSetup] = useState(false)
  const [needsAccessCode, setNeedsAccessCode] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(false)
  const { locale } = useLanguage()

  // Check if user has previously authenticated for edit access (session-based)
  const hasEditAccess = useCallback(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(EDIT_ACCESS_KEY) === 'true'
  }, [])

  // Grant edit access for this session
  const grantEditAccess = useCallback(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(EDIT_ACCESS_KEY, 'true')
  }, [])

  // Check if token is configured when entering edit mode
  const checkTokenSetup = useCallback(() => {
    const hasToken = isGitHubConfigured()
    setNeedsTokenSetup(!hasToken)
    return hasToken
  }, [])

  // Submit access code to enter edit mode (requires admin + correct code)
  const submitAccessCode = useCallback((code: string): boolean => {
    // Double-check admin status
    if (!isAdmin()) {
      setError('Admin access required for edit mode')
      return false
    }
    if (code === EDIT_ACCESS_CODE) {
      grantEditAccess()
      setNeedsAccessCode(false)
      setIsEditMode(true)
      setError(null)
      checkTokenSetup()
      return true
    } else {
      setError('Invalid access code')
      return false
    }
  }, [grantEditAccess, checkTokenSetup])

  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      // Exiting edit mode - clear state
      setIsEditMode(false)
      setEditingKey(null)
      setSaveStatus('idle')
      setError(null)
      setNeedsTokenSetup(false)
      setNeedsAccessCode(false)
    } else {
      // Entering edit mode - require admin status first
      if (!isAdmin()) {
        setError('Admin access required for edit mode')
        setNeedsAccessCode(true) // Show prompt with error
        return
      }
      // Check if already authenticated this session
      if (hasEditAccess()) {
        setIsEditMode(true)
        checkTokenSetup()
      } else {
        // Need to prompt for access code
        setNeedsAccessCode(true)
      }
    }
  }, [isEditMode, hasEditAccess, checkTokenSetup])

  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
    setEditingKey(null)
    setSaveStatus('idle')
    setError(null)
    setNeedsTokenSetup(false)
    setNeedsAccessCode(false)
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
      // Handle Escape to close access code prompt
      if (e.key === 'Escape' && needsAccessCode) {
        setNeedsAccessCode(false)
        setError(null)
      }
      // Also handle global Escape to exit edit mode
      if (e.key === 'Escape' && isEditMode && !editingKey && !needsTokenSetup) {
        exitEditMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleEditMode, exitEditMode, isEditMode, editingKey, needsTokenSetup, needsAccessCode])

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
        needsAccessCode,
        setEditingKey,
        setSaveStatus,
        setError,
        toggleEditMode,
        exitEditMode,
        submitToken,
        submitAccessCode,
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
