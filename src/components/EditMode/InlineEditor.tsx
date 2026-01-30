'use client'

import { useState } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { type ElementStyleOverride, clearElementStyle } from '@/lib/elementStyleStorage'

interface InlineEditorProps {
  tKey: string
  onSave: () => void
  onClose: () => void
  isSaving: boolean
  hasChanges: boolean
  error: string | null
  copyValue?: string
  currentStyle?: ElementStyleOverride
  onStyleChange?: (style: ElementStyleOverride) => void
}

export function InlineEditor({ tKey, onSave, onClose, isSaving, hasChanges, error, copyValue, currentStyle, onStyleChange }: InlineEditorProps) {
  const { currentLanguage } = useEditMode()
  const [showCopyFallback, setShowCopyFallback] = useState(false)
  const [copied, setCopied] = useState(false)

  // Style controls
  const [fontSize, setFontSize] = useState<number>(currentStyle?.fontSize || 0)
  const [maxWidth, setMaxWidth] = useState<number>(currentStyle?.maxWidth || 0)

  const stylesChanged = fontSize !== (currentStyle?.fontSize || 0) || maxWidth !== (currentStyle?.maxWidth || 0)

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

  // Show copy fallback when error contains network issues
  const showFallback = showCopyFallback || (error && (error.includes('Network') || error.includes('connect')))

  const handleCopyToClipboard = async () => {
    const copyText = `Translation Update:
File: src/contexts/LanguageContext.tsx
Locale: ${currentLanguage}
Key: '${tKey}'
New Value: '${(copyValue || '').replace(/'/g, "\\'")}'

Find this key in the ${currentLanguage} section and update the value.`

    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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

  return (
    <div className="relative z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-2 min-w-[280px] max-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]" title={tKey}>
            {tKey}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
            {currentLanguage}
          </span>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}

        {/* Copy fallback when GitHub save fails */}
        {showFallback && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs text-amber-800 mb-2">
              GitHub API blocked. Copy changes to edit manually:
            </p>
            <button
              onClick={() => { setShowCopyFallback(true); handleCopyToClipboard() }}
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
        <div className="px-1 space-y-2">
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
        <div className="flex items-center justify-between mt-2 px-1 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Edit text above · Esc to cancel
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
              onClick={onSave}
              disabled={isSaving || (!hasChanges && !stylesChanged)}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
