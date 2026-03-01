'use client'

import { useState } from 'react'
import { LandingPageConfig } from '@/lib/storage/landingPageStorage'

interface PageSelectorProps {
  pages: LandingPageConfig[]
  activeId: string
  onChange: (id: string) => void
  onAdd: (name: string) => void
  onDelete?: (id: string) => void
}

export function PageSelector({ pages, activeId, onChange, onAdd, onDelete }: PageSelectorProps) {
  const [showNameInput, setShowNameInput] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAdd(name)
    setNewName('')
    setShowNameInput(false)
  }

  return (
    <div className="flex items-center justify-center gap-2 py-2 bg-gray-50 border-b border-gray-200">
      {pages.map((page, i) => (
        <div key={page.id} className="relative group">
          <button
            onClick={() => onChange(page.id)}
            className={`w-9 h-9 rounded-full border-2 text-sm font-semibold transition-colors flex items-center justify-center ${
              activeId === page.id
                ? 'bg-rstu-red text-white border-rstu-red'
                : 'border-gray-300 text-gray-500 hover:border-rstu-red hover:text-rstu-red'
            }`}
            title={page.name}
          >
            {i + 1}
          </button>
          {/* Delete button on hover (not for page-1) */}
          {onDelete && page.id !== 'page-1' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(page.id) }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Delete "${page.name}"`}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {/* Add new page */}
      {showNameInput ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowNameInput(false) }}
            placeholder="Page name"
            className="w-28 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rstu-red"
            autoFocus
          />
          <button onClick={handleAdd} className="text-green-600 hover:text-green-700 text-sm font-bold">✓</button>
          <button onClick={() => setShowNameInput(false)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setShowNameInput(true)}
          className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-rstu-red hover:text-rstu-red text-lg font-light transition-colors flex items-center justify-center"
          title="Create new page"
        >
          +
        </button>
      )}
    </div>
  )
}
