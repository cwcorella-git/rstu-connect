'use client'

import { useState, useEffect } from 'react'
import { saveDocumentEdit, deleteDocumentEdit, getDocumentEdit } from '@/lib/adminStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface DocumentEditorProps {
  document: ReadingDocument
  initialContent: string
  onClose: () => void
  onSave: () => void
}

export function DocumentEditor({ document, initialContent, onClose, onSave }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title)
  const [content, setContent] = useState(initialContent)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setHasChanges(title !== document.title || content !== initialContent)
  }, [title, content, document.title, initialContent])

  const handleSave = () => {
    saveDocumentEdit(document.id, title, content)
    onSave()
    onClose()
  }

  const handleRevert = () => {
    if (confirm('Are you sure you want to discard all edits and restore the original document?')) {
      deleteDocumentEdit(document.id)
      onSave()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Edit Document</h2>
            <p className="text-xs text-gray-500 mt-1">
              Changes are saved locally. Export edits to create a patch file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
              placeholder="Document title"
            />
          </div>

          {/* Content Editor */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Markdown Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent resize-none"
              placeholder="# Document content in markdown..."
            />
          </div>

          {/* Change Indicator */}
          {hasChanges && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              You have unsaved changes
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleRevert}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Revert to Original
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-rstu-red text-white rounded hover:bg-red-700"
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
