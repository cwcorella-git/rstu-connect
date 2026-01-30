'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { updateTranslation } from '@/lib/githubService'
import { type ElementStyleOverride, getElementStyle, setElementStyle, clearElementStyle } from '@/lib/elementStyleStorage'

interface InlineEditorProps {
  tKey: string
  initialValue: string
  onClose: () => void
  multiline?: boolean
  currentStyle?: ElementStyleOverride
  onStyleChange?: (style: ElementStyleOverride) => void
}

export function InlineEditor({ tKey, initialValue, onClose, multiline = false, currentStyle, onStyleChange }: InlineEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showCopyFallback, setShowCopyFallback] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const { currentLanguage, setSaveStatus, setError, setEditingKey } = useEditMode()

  // Style controls
  const [fontSize, setFontSize] = useState<number>(currentStyle?.fontSize || 0)
  const [maxWidth, setMaxWidth] = useState<number>(currentStyle?.maxWidth || 0)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  // Copy change info to clipboard for manual editing
  const handleCopyToClipboard = async () => {
    const copyText = `Translation Update:
File: src/contexts/LanguageContext.tsx
Locale: ${currentLanguage}
Key: '${tKey}'
New Value: '${value.replace(/'/g, "\\'")}'

Find this key in the ${currentLanguage} section and update the value.`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = copyText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFontSizeChange = (val: number) => {
    setFontSize(val)
    onStyleChange?.({ fontSize: val || undefined, maxWidth: maxWidth || undefined })
  }

  const handleMaxWidthChange = (val: number) => {
    setMaxWidth(val)
    onStyleChange?.({ fontSize: fontSize || undefined, maxWidth: val || undefined })
  }

  const handleResetStyles = () => {
    setFontSize(0)
    setMaxWidth(0)
    clearElementStyle(tKey)
    onStyleChange?.({})
  }

  const handleSave = async () => {
    // Save style overrides regardless of text change
    setElementStyle(tKey, { fontSize: fontSize || undefined, maxWidth: maxWidth || undefined })
    onStyleChange?.({ fontSize: fontSize || undefined, maxWidth: maxWidth || undefined })

    if (value === initialValue) {
      onClose()
      return
    }

    setIsSaving(true)
    setLocalError(null)
    setSaveStatus('saving')

    try {
      const result = await updateTranslation(currentLanguage, tKey, value)

      if (result.success) {
        setSaveStatus('success')
        setEditingKey(null)
        onClose()
      } else {
        setLocalError(result.error || 'Failed to save')
        setSaveStatus('error')
        setError(result.error || 'Failed to save')
        // Show copy fallback for network/CORS errors
        if (result.error?.includes('Network') || result.error?.includes('connect')) {
          setShowCopyFallback(true)
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setLocalError(errorMsg)
      setSaveStatus('error')
      setError(errorMsg)
      setShowCopyFallback(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault()
      handleSave()
    }
  }

  const inputClassName = `
    w-full px-3 py-2
    border-2 border-blue-500 rounded-lg
    bg-white text-gray-900
    focus:outline-none focus:ring-2 focus:ring-blue-400
    text-sm font-sans
    shadow-lg
  `

  return (
    <div className="relative z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-2 min-w-[300px] max-w-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]" title={tKey}>
            {tKey}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
            {currentLanguage}
          </span>
        </div>

        {/* Input */}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${inputClassName} resize-y min-h-[80px]`}
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClassName}
            disabled={isSaving}
          />
        )}

        {/* Error display */}
        {localError && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {localError}
          </div>
        )}

        {/* Copy fallback when GitHub save fails */}
        {showCopyFallback && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs text-amber-800 mb-2">
              GitHub API blocked. Copy changes to edit manually:
            </p>
            <button
              onClick={handleCopyToClipboard}
              className="w-full px-3 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 flex items-center justify-center gap-1"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Change Info
                </>
              )}
            </button>
          </div>
        )}

        {/* Style Controls */}
        <div className="mt-3 px-1 space-y-2 border-t border-gray-100 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 font-medium">Font Size</label>
              <span className="text-xs text-gray-700 font-mono">{fontSize ? `${fontSize}px` : 'default'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={64}
              step={1}
              value={fontSize}
              onChange={e => handleFontSizeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>default</span>
              <span>64px</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500 font-medium">Max Width (Wrapping)</label>
              <span className="text-xs text-gray-700 font-mono">{maxWidth ? `${maxWidth}px` : 'default'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1200}
              step={10}
              value={maxWidth}
              onChange={e => handleMaxWidthChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>default</span>
              <span>1200px</span>
            </div>
          </div>
          {(fontSize > 0 || maxWidth > 0) && (
            <button
              onClick={handleResetStyles}
              className="text-xs text-gray-500 hover:text-red-600 underline"
            >
              Reset Styles
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-gray-400">
            {multiline ? 'Ctrl+Enter to save' : 'Enter to save'} · Esc to cancel
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || value === initialValue}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
