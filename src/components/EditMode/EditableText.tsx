'use client'

import { useState, useRef, useCallback, MouseEvent, TouchEvent, createElement, ReactNode, CSSProperties } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { InlineEditor } from './InlineEditor'
import { getElementStyle, setElementStyle, type ElementStyleOverride } from '@/lib/elementStyleStorage'
import { updateTranslation } from '@/lib/githubService'

type ElementType = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'li'

const LONG_PRESS_DURATION = 500 // ms

interface EditableTextProps {
  tKey: string
  as?: ElementType
  className?: string
  multiline?: boolean
  children?: ReactNode
}

/**
 * EditableText - A wrapper for translated text that enables inline editing
 *
 * Usage:
 *   <EditableText tKey="landing.hero.title" as="h1" className="text-4xl font-bold" />
 *
 * In normal mode: Renders the translated text as the specified element
 * In edit mode: Ctrl+click or long-press makes the element contentEditable with a style toolbar below
 */
export function EditableText({
  tKey,
  as = 'span',
  className = '',
  multiline = false,
  children,
}: EditableTextProps) {
  const { t } = useLanguage()
  const { isEditMode, editingKey, setEditingKey, setSaveStatus, setError, currentLanguage } = useEditMode()
  const [showEditor, setShowEditor] = useState(false)
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 })
  const [liveStyle, setLiveStyle] = useState<ElementStyleOverride>(() => getElementStyle(tKey) || {})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [textChanged, setTextChanged] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const originalTextRef = useRef<string>('')

  const translatedText = t(tKey)
  const isBeingEdited = editingKey === tKey

  // Open the editor at element position
  const openEditor = useCallback(() => {
    const el = elementRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    setEditorPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    })

    // Store original text for cancel
    originalTextRef.current = el.innerText

    setEditingKey(tKey)
    setShowEditor(true)
    setTextChanged(false)
    setSaveError(null)

    // Focus the element for editing
    requestAnimationFrame(() => {
      el.focus()
    })
  }, [tKey, setEditingKey])

  // Clear long press timer
  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartPosRef.current = null
  }, [])

  const handleClick = (e: MouseEvent) => {
    if (!isEditMode) return
    // If already editing this element, let normal cursor positioning work
    if (isBeingEdited) return

    if (!e.ctrlKey) return
    e.preventDefault()
    e.stopPropagation()
    openEditor()
  }

  // Touch handlers for long-press support
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isEditMode) return
    if (isBeingEdited) return

    const touch = e.touches[0]
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }

    longPressTimerRef.current = setTimeout(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      openEditor()
    }, LONG_PRESS_DURATION)
  }, [isEditMode, isBeingEdited, openEditor])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartPosRef.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x)
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y)
    if (dx > 10 || dy > 10) {
      clearLongPress()
    }
  }, [clearLongPress])

  const handleTouchEnd = useCallback(() => {
    clearLongPress()
  }, [clearLongPress])

  const handleInput = useCallback(() => {
    const el = elementRef.current
    if (!el) return
    const current = el.innerText
    setTextChanged(current !== originalTextRef.current)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isBeingEdited) return
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBeingEdited, multiline])

  const handleCancel = useCallback(() => {
    // Restore original text
    const el = elementRef.current
    if (el) {
      el.innerText = originalTextRef.current
    }
    setShowEditor(false)
    setEditingKey(null)
    setTextChanged(false)
    setSaveError(null)
    // Revert styles from storage
    setLiveStyle(getElementStyle(tKey) || {})
  }, [tKey, setEditingKey])

  const handleSave = useCallback(async () => {
    const el = elementRef.current
    if (!el) return

    // Save style overrides
    setElementStyle(tKey, { fontSize: liveStyle.fontSize, maxWidth: liveStyle.maxWidth })

    const newText = el.innerText
    if (newText === originalTextRef.current) {
      // Style-only save
      setLiveStyle(getElementStyle(tKey) || {})
      setShowEditor(false)
      setEditingKey(null)
      return
    }

    // Save text via GitHub API
    setIsSaving(true)
    setSaveError(null)
    setSaveStatus('saving')

    try {
      const result = await updateTranslation(currentLanguage, tKey, newText)

      if (result.success) {
        setSaveStatus('success')
        originalTextRef.current = newText
        setShowEditor(false)
        setEditingKey(null)
        setTextChanged(false)
      } else {
        setSaveError(result.error || 'Failed to save')
        setSaveStatus('error')
        setError(result.error || 'Failed to save')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setSaveError(errorMsg)
      setSaveStatus('error')
      setError(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }, [tKey, liveStyle, currentLanguage, setEditingKey, setSaveStatus, setError])

  const handleStyleChange = useCallback((style: ElementStyleOverride) => {
    setLiveStyle(style)
  }, [])

  // Build className for edit mode
  const editModeClasses = isEditMode
    ? isBeingEdited
      ? 'outline outline-2 outline-dashed outline-blue-500 outline-offset-2 cursor-text'
      : 'cursor-pointer transition-all duration-150 hover:bg-blue-100 hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2'
    : ''

  const combinedClassName = `${className} ${editModeClasses}`.trim()

  // Build inline style from overrides
  const inlineStyle: CSSProperties = {}
  if (liveStyle?.fontSize) inlineStyle.fontSize = `${liveStyle.fontSize}px`
  if (liveStyle?.maxWidth) {
    inlineStyle.maxWidth = `${liveStyle.maxWidth}px`
    inlineStyle.marginLeft = 'auto'
    inlineStyle.marginRight = 'auto'
  }

  // Create the element with proper props
  const element = createElement(
    as,
    {
      ref: elementRef,
      className: combinedClassName,
      style: Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined,
      contentEditable: isBeingEdited ? 'plaintext-only' : undefined,
      suppressContentEditableWarning: isBeingEdited ? true : undefined,
      onInput: isBeingEdited ? handleInput : undefined,
      onKeyDown: isBeingEdited ? handleKeyDown : undefined,
      onClick: handleClick,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
      title: isEditMode && !isBeingEdited ? `Ctrl+Click or long-press to edit: ${tKey}` : undefined,
    },
    children || translatedText
  )

  return (
    <>
      {element}
      {showEditor && isBeingEdited && (
        <div
          className="fixed z-50"
          style={{
            top: editorPosition.top,
            left: editorPosition.left,
          }}
        >
          <InlineEditor
            tKey={tKey}
            onSave={handleSave}
            onClose={handleCancel}
            isSaving={isSaving}
            hasChanges={textChanged}
            error={saveError}
            copyValue={elementRef.current?.innerText}
            currentStyle={liveStyle}
            onStyleChange={handleStyleChange}
          />
        </div>
      )}
    </>
  )
}
