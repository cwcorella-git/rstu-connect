'use client'

import { useState, useRef } from 'react'
import { useTab } from '@/contexts/TabContext'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { HamburgerMenu } from './HamburgerMenu'
import { useUnreadCount } from '@/hooks/useDirectMessages'
import { useEditMode } from '@/contexts/EditModeContext'
import { isAdmin } from '@/lib/storage/profileStorage'
import { getEffectiveNavLabel, getEffectiveNavOrder } from '@/lib/utils/navHelpers'
import { setNavLabel, moveTab } from '@/lib/storage/adminSettingsStorage'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import type { Tab } from '@/contexts/TabContext'

export function Navigation() {
  const { activeTab, setActiveTab } = useTab()
  const { isAuthenticated, canAccessToolsTab, canAccessOrganizeTab, profile } = useAuth()
  const { t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const { isEditMode } = useEditMode()

  // Real-time unread count from Socket.io
  const unreadCount = useUnreadCount()

  // Inline editing state
  const [editingTab, setEditingTab] = useState<Tab | null>(null)
  const [editValue, setEditValue] = useState('')
  const editRef = useRef<HTMLSpanElement>(null)

  // Force re-render when nav config changes
  const [renderKey, setRenderKey] = useState(0)

  // Get dynamic navigation order
  const navOrder = getEffectiveNavOrder()

  // Handler functions for inline editing
  const handleContextMenu = (e: React.MouseEvent, tab: Tab) => {
    if (!isEditMode || !isAdmin()) return
    e.preventDefault()
    setEditingTab(tab)
    setEditValue(getEffectiveNavLabel(tab, t))

    setTimeout(() => {
      if (editRef.current) {
        editRef.current.focus()
        // Select all text
        const range = document.createRange()
        range.selectNodeContents(editRef.current)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }, 0)
  }

  const handleSaveLabel = (tab: Tab) => {
    if (!editingTab) return

    const trimmed = editValue.trim()
    if (trimmed && trimmed !== getEffectiveNavLabel(tab, t)) {
      setNavLabel(tab, trimmed)
      setRenderKey(prev => prev + 1) // Force re-render
    }
    setEditingTab(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent, tab: Tab) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveLabel(tab)
    } else if (e.key === 'Escape') {
      setEditingTab(null)
    }
  }

  const handleMoveTab = (tab: Tab, direction: 'left' | 'right') => {
    moveTab(tab, direction)
    setRenderKey(prev => prev + 1) // Force re-render
  }

  // Check if tab should be rendered based on permissions
  const shouldRenderTab = (tab: Tab): boolean => {
    if (tab === 'home' && !canAccessOrganizeTab) return false
    if (tab === 'tools' && !canAccessToolsTab) return false
    return true
  }

  // Render a single navigation tab
  const renderNavTab = (tab: Tab, index: number, visibleIndex: number) => {
    if (!shouldRenderTab(tab)) return null

    const isEditing = editingTab === tab
    const label = getEffectiveNavLabel(tab, t)
    const showEditControls = isEditMode && isAdmin()

    // Special handling for Profile tab (shows unread count)
    if (tab === 'profile') {
      return (
        <div key={tab} className="relative group">
          {showEditControls && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                            opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pr-2">
              {visibleIndex > 0 && (
                <button
                  onClick={() => handleMoveTab(tab, 'left')}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Move left"
                >
                  <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => !isEditing && setActiveTab(tab)}
            onContextMenu={(e) => handleContextMenu(e, tab)}
            className={`whitespace-nowrap flex items-center gap-2 relative ${
              activeTab === tab
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span
              ref={isEditing ? editRef : undefined}
              contentEditable={isEditing ? 'plaintext-only' : undefined}
              suppressContentEditableWarning={isEditing}
              onBlur={() => handleSaveLabel(tab)}
              onKeyDown={(e) => handleKeyDown(e, tab)}
              onInput={(e) => setEditValue(e.currentTarget.textContent || '')}
              className={isEditing ? 'outline-2 outline-dashed outline-blue-500 px-1' : ''}
            >
              {isEditing ? editValue : (isAuthenticated ? label : t('nav.login'))}
            </span>
            {isAuthenticated && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )
    }

    return (
      <div key={tab} className="relative group">
        {showEditControls && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                          opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pr-2">
            {visibleIndex > 0 && (
              <button
                onClick={() => handleMoveTab(tab, 'left')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Move left"
              >
                <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {visibleIndex < navOrder.filter(shouldRenderTab).length - 1 && (
              <button
                onClick={() => handleMoveTab(tab, 'right')}
                className="p-1 hover:bg-gray-100 rounded"
                title="Move right"
              >
                <ArrowRightIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => !isEditing && setActiveTab(tab)}
          onContextMenu={(e) => handleContextMenu(e, tab)}
          className={`whitespace-nowrap ${
            activeTab === tab
              ? 'text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span
            ref={isEditing ? editRef : undefined}
            contentEditable={isEditing ? 'plaintext-only' : undefined}
            suppressContentEditableWarning={isEditing}
            onBlur={() => handleSaveLabel(tab)}
            onKeyDown={(e) => handleKeyDown(e, tab)}
            onInput={(e) => setEditValue(e.currentTarget.textContent || '')}
            className={isEditing ? 'outline-2 outline-dashed outline-blue-500 px-1' : ''}
          >
            {isEditing ? editValue : label}
          </span>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav key={renderKey} className="hidden md:flex items-center space-x-3 lg:space-x-5 xl:space-x-6 text-xs lg:text-sm">
        {navOrder.map((tab, index) => {
          // Calculate visible index (skipping filtered tabs)
          const visibleIndex = navOrder.slice(0, index).filter(shouldRenderTab).length
          return renderNavTab(tab, index, visibleIndex)
        })}
        <a
          href="https://renosparkstenantsunion.org"
          className="text-rstu-red hover:text-rstu-red-dark font-medium whitespace-nowrap"
        >
          {t('nav.mainSite')}
        </a>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
        {/* Login/Profile button */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`text-sm px-2.5 py-1 rounded-md border transition-colors relative ${
            activeTab === 'profile'
              ? 'border-rstu-red bg-rstu-red text-white'
              : 'border-rstu-red/60 text-rstu-red hover:border-rstu-red'
          }`}
        >
          <div className="flex items-center gap-1">
            {isAuthenticated ? t('nav.profile') : t('nav.login')}
            {isAuthenticated && unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </button>
        {/* Hamburger menu */}
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
