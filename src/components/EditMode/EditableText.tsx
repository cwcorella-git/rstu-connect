'use client'

import { useState, useRef, MouseEvent, createElement, ReactNode } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { InlineEditor } from './InlineEditor'

type ElementType = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'li'

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
 * In edit mode: Shows hover highlight, Ctrl+click opens inline editor
 */
export function EditableText({
  tKey,
  as = 'span',
  className = '',
  multiline = false,
  children,
}: EditableTextProps) {
  const { t } = useLanguage()
  const { isEditMode, editingKey, setEditingKey } = useEditMode()
  const [showEditor, setShowEditor] = useState(false)
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 })
  const elementRef = useRef<HTMLElement>(null)

  const translatedText = t(tKey)
  const isBeingEdited = editingKey === tKey

  const handleClick = (e: MouseEvent) => {
    // Only respond to Ctrl+click in edit mode
    if (!isEditMode || !e.ctrlKey) return

    e.preventDefault()
    e.stopPropagation()

    // Get position for the editor
    const rect = elementRef.current?.getBoundingClientRect()
    if (rect) {
      setEditorPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }

    setEditingKey(tKey)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingKey(null)
  }

  // Build className for edit mode
  const editModeClasses = isEditMode
    ? `cursor-pointer transition-all duration-150 hover:bg-blue-100 hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 ${
        isBeingEdited ? 'bg-blue-100 outline outline-2 outline-blue-500 outline-offset-2' : ''
      }`
    : ''

  const combinedClassName = `${className} ${editModeClasses}`.trim()

  // Create the element with proper props
  const element = createElement(
    as,
    {
      ref: elementRef,
      className: combinedClassName,
      onClick: handleClick,
      title: isEditMode ? `Ctrl+Click to edit: ${tKey}` : undefined,
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
            initialValue={translatedText}
            onClose={handleCloseEditor}
            multiline={multiline}
          />
        </div>
      )}
    </>
  )
}
