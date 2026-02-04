'use client'

import { useState, useRef, useCallback, useEffect, MouseEvent, TouchEvent, createElement, ReactNode, CSSProperties } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getElementStyle, setElementStyle, clearElementStyle, type ElementStyleOverride } from '@/lib/storage/elementStyleStorage'
import { updateTranslation } from '@/lib/services/githubService'

type ElementType = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'li'

const LONG_PRESS_DURATION = 500

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

interface EditableTextProps {
  tKey: string
  as?: ElementType
  className?: string
  multiline?: boolean
  children?: ReactNode
}

/**
 * EditableText - Inline editable translated text
 *
 * In edit mode: Ctrl+Click or long-press to edit text directly.
 * Drag the bottom-right handle to scale font size + max-width.
 * X to close (saves), ↺ to reset styles.
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
  const [liveStyle, setLiveStyle] = useState<ElementStyleOverride>(() => getElementStyle(tKey) || {})
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const originalTextRef = useRef<string>('')
  const dragStartRef = useRef<{ x: number; y: number; fontSize: number; maxWidth: number; mode: 'font' | 'width' } | null>(null)

  const translatedText = t(tKey)
  const isBeingEdited = editingKey === tKey

  // Close + save on click outside
  useEffect(() => {
    if (!isBeingEdited) return

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }

    // Delay to avoid catching the opening click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 50)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBeingEdited])

  // Global mouse handlers for drag
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!dragStartRef.current) return
      const { mode } = dragStartRef.current

      if (mode === 'width') {
        // Side edges: horizontal movement controls max-width
        const dx = e.clientX - dragStartRef.current.x
        const newMaxWidth = clamp(Math.round(dragStartRef.current.maxWidth + dx * 2), 100, 2000)
        setLiveStyle(prev => ({ ...prev, maxWidth: newMaxWidth }))
      } else {
        // Corner: vertical movement controls font size
        const dy = e.clientY - dragStartRef.current.y
        const scale = 1 + dy / 150
        const newFontSize = clamp(Math.round(dragStartRef.current.fontSize * scale), 8, 120)
        setLiveStyle(prev => ({ ...prev, fontSize: newFontSize }))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const openEditor = useCallback(() => {
    const el = elementRef.current
    if (!el) return

    originalTextRef.current = el.innerText

    setEditingKey(tKey)

    requestAnimationFrame(() => {
      el.focus()
    })
  }, [tKey, liveStyle, setEditingKey])

  const handleClose = useCallback(async () => {
    const el = elementRef.current
    if (!el) return

    // Save styles
    setElementStyle(tKey, { fontSize: liveStyle.fontSize, maxWidth: liveStyle.maxWidth })

    // Save text if changed
    const newText = el.innerText
    if (newText !== originalTextRef.current) {
      setSaveStatus('saving')
      try {
        const result = await updateTranslation(currentLanguage, tKey, newText)
        if (result.success) {
          setSaveStatus('success')
        } else {
          setSaveStatus('error')
          setError(result.error || 'Failed to save')
        }
      } catch (err) {
        setSaveStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    setEditingKey(null)
    setLiveStyle(getElementStyle(tKey) || {})
  }, [tKey, liveStyle, currentLanguage, setEditingKey, setSaveStatus, setError])

  const handleResetStyles = useCallback(() => {
    clearElementStyle(tKey)
    setLiveStyle({})
  }, [tKey])

  const startDrag = useCallback((e: React.MouseEvent, mode: 'font' | 'width') => {
    e.preventDefault()
    e.stopPropagation()
    const el = elementRef.current
    if (!el) return

    const computedStyle = window.getComputedStyle(el)
    const currentFontSize = liveStyle.fontSize || parseFloat(computedStyle.fontSize) || 16
    const currentMaxWidth = liveStyle.maxWidth || el.offsetWidth || 400

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      fontSize: currentFontSize,
      maxWidth: currentMaxWidth,
      mode,
    }
    setIsDragging(true)
  }, [liveStyle])

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
    if (isBeingEdited) return
    if (!e.ctrlKey) return
    e.preventDefault()
    e.stopPropagation()
    openEditor()
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isEditMode || isBeingEdited) return
    const touch = e.touches[0]
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
    longPressTimerRef.current = setTimeout(() => {
      if ('vibrate' in navigator) navigator.vibrate(50)
      openEditor()
    }, LONG_PRESS_DURATION)
  }, [isEditMode, isBeingEdited, openEditor])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartPosRef.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x)
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y)
    if (dx > 10 || dy > 10) clearLongPress()
  }, [clearLongPress])

  const handleTouchEnd = useCallback(() => {
    clearLongPress()
  }, [clearLongPress])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isBeingEdited) return
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      handleClose()
    }
  }, [isBeingEdited, handleClose])

  // Build className
  const editModeClasses = isEditMode
    ? isBeingEdited
      ? 'outline outline-2 outline-dashed outline-blue-500 outline-offset-4 cursor-text'
      : 'cursor-pointer transition-all duration-150 hover:bg-blue-100 hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2'
    : ''

  const combinedClassName = `${className} ${editModeClasses}`.trim()

  // Build inline style
  const inlineStyle: CSSProperties = {}
  if (liveStyle?.fontSize) {
    inlineStyle.fontSize = `${liveStyle.fontSize}px`
    inlineStyle.lineHeight = '1.3'
  }
  if (liveStyle?.maxWidth) {
    inlineStyle.maxWidth = `${liveStyle.maxWidth}px`
    inlineStyle.marginLeft = 'auto'
    inlineStyle.marginRight = 'auto'
  }

  const element = createElement(
    as,
    {
      ref: elementRef,
      className: combinedClassName,
      style: Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined,
      contentEditable: isBeingEdited ? 'plaintext-only' : undefined,
      suppressContentEditableWarning: isBeingEdited ? true : undefined,
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

  const hasStyleOverrides = !!(liveStyle?.fontSize || liveStyle?.maxWidth)

  return (
    <div ref={wrapperRef} className={isBeingEdited ? 'relative inline-block' : 'contents'}>
      {element}
      {isBeingEdited && (
        <>
          {/* Top-right: Reset + Close buttons */}
          <div className="absolute -top-3 -right-3 flex gap-1 z-50">
            {hasStyleOverrides && (
              <button
                onClick={(e) => { e.stopPropagation(); handleResetStyles() }}
                className="w-6 h-6 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-400 transition-colors shadow-sm"
                title="Reset styles"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleClose() }}
              className="w-6 h-6 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 transition-colors shadow-sm"
              title="Close (save changes)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Left edge: drag to adjust width */}
          <div
            onMouseDown={(e) => startDrag(e, 'width')}
            className="absolute top-1/2 -left-3 -translate-y-1/2 w-2 h-10 rounded-full bg-blue-400/40 hover:bg-blue-500/60 cursor-ew-resize z-50 transition-colors"
            title="Drag to adjust width"
          />

          {/* Right edge: drag to adjust width */}
          <div
            onMouseDown={(e) => startDrag(e, 'width')}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-2 h-10 rounded-full bg-blue-400/40 hover:bg-blue-500/60 cursor-ew-resize z-50 transition-colors"
            title="Drag to adjust width"
          />

          {/* Bottom-right corner: drag to adjust font size */}
          <div
            onMouseDown={(e) => startDrag(e, 'font')}
            className={`absolute -bottom-2 -right-2 w-5 h-5 flex items-center justify-center z-50 cursor-ns-resize ${
              isDragging ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
            } transition-colors`}
            title="Drag to resize text"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM18 14H16V12H18V14ZM14 18H12V16H14V18ZM10 22H8V20H10V22Z" />
            </svg>
          </div>

          {/* Size indicator while dragging */}
          {isDragging && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap z-50">
              {dragStartRef.current?.mode === 'font'
                ? `${liveStyle.fontSize || '–'}px`
                : `${liveStyle.maxWidth || '–'}px wide`}
            </div>
          )}
        </>
      )}
    </div>
  )
}
