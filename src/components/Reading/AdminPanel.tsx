'use client'

import { useState, useEffect } from 'react'
import { getAdminState, toggleDocumentVisibility, exportAdminState, importAdminState } from '@/lib/adminStorage'
import type { ReadingDocument } from '@/lib/getReadingData'

interface AdminPanelProps {
  documents: ReadingDocument[]
  onClose: () => void
  onUpdate: () => void
}

export function AdminPanel({ documents, onClose, onUpdate }: AdminPanelProps) {
  const [adminState, setAdminState] = useState(getAdminState())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(documents.map(d => d.category))).sort()]

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const visibleCount = documents.filter(d => !adminState.hiddenDocuments.includes(d.id)).length
  const hiddenCount = documents.length - visibleCount

  const handleToggle = (docId: string) => {
    toggleDocumentVisibility(docId)
    setAdminState(getAdminState())
    onUpdate()
  }

  const handleExport = () => {
    const json = exportAdminState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rstu-admin-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (importAdminState(content)) {
        setAdminState(getAdminState())
        onUpdate()
        alert('Configuration imported successfully!')
      } else {
        alert('Failed to import configuration. Invalid format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Document Library Admin</h2>
            <p className="text-sm text-gray-500 mt-1">
              {visibleCount} visible, {hiddenCount} hidden documents
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === cat
                    ? 'bg-rstu-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Import/Export */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export Config
            </button>
            <label className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
              Import Config
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const isHidden = adminState.hiddenDocuments.includes(doc.id)
              return (
                <div
                  key={doc.id}
                  className={`p-3 border rounded-lg flex items-start justify-between ${
                    isHidden ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${isHidden ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.category} • {Math.ceil(doc.wordCount / 250)} min read
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(doc.id)}
                    className={`ml-4 px-3 py-1 text-xs rounded ${
                      isHidden
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {isHidden ? 'Show' : 'Hide'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
