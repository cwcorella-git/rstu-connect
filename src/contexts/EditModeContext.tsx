'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { isAdmin } from '@/lib/profileStorage'
import { useLanguage } from './LanguageContext'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

interface EditModeContextType {
  isEditMode: boolean
  editingKey: string | null
  saveStatus: SaveStatus
  error: string | null
  currentLanguage: string
  setEditingKey: (key: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setError: (error: string | null) => void
  toggleEditMode: () => void
  exitEditMode: () => void
}

const EditModeContext = createContext<EditModeContextType | null>(null)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const { locale } = useLanguage()

  const toggleEditMode = useCallback(() => {
    if (!isAdmin()) {
      console.warn('[EditMode] Only admins can toggle edit mode')
      return
    }
    setIsEditMode(prev => {
      if (prev) {
        // Exiting edit mode - clear state
        setEditingKey(null)
        setSaveStatus('idle')
        setError(null)
      }
      return !prev
    })
  }, [])

  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
    setEditingKey(null)
    setSaveStatus('idle')
    setError(null)
  }, [])

  // Handle Ctrl+Shift+E to toggle edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        toggleEditMode()
      }
      // Also handle global Escape to exit edit mode
      if (e.key === 'Escape' && isEditMode && !editingKey) {
        exitEditMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleEditMode, exitEditMode, isEditMode, editingKey])

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
        setEditingKey,
        setSaveStatus,
        setError,
        toggleEditMode,
        exitEditMode,
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
