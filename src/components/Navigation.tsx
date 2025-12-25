'use client'

import { useState, useEffect } from 'react'
import { useTab } from '@/contexts/TabContext'
import { useAuth } from '@/contexts/AuthContext'
import { HamburgerMenu } from './HamburgerMenu'
import { MessageHub } from './Messages/MessageHub'
import { getTotalUnreadCount } from '@/lib/directMessageStorage'

export function Navigation() {
  const { activeTab, setActiveTab } = useTab()
  const { isAuthenticated, canAccessToolsTab, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Load unread count
  useEffect(() => {
    if (!isAuthenticated) return

    const updateCount = () => {
      setUnreadCount(getTotalUnreadCount())
    }
    updateCount()

    const interval = setInterval(updateCount, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('home')}
          className={`whitespace-nowrap ${
            activeTab === 'home'
              ? 'text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Organize
        </button>
        <button
          onClick={() => setActiveTab('reading')}
          className={`whitespace-nowrap ${
            activeTab === 'reading'
              ? 'text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reading
        </button>
        <button
          onClick={() => setActiveTab('mutualAid')}
          className={`whitespace-nowrap ${
            activeTab === 'mutualAid'
              ? 'text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mutual Aid
        </button>
        {canAccessToolsTab && (
          <button
            onClick={() => setActiveTab('tools')}
            className={`whitespace-nowrap ${
              activeTab === 'tools'
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tools
          </button>
        )}
        {isAuthenticated && (
          <button
            onClick={() => setShowMessages(true)}
            className="relative p-1.5 text-gray-600 hover:text-gray-900 transition"
            title="Messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab('profile')}
          className={`whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'profile'
              ? 'text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {isAuthenticated ? 'Profile' : 'Login'}
        </button>
        <a
          href="https://renosparkstenantsunion.org"
          className="text-rstu-red hover:text-rstu-red-dark font-medium whitespace-nowrap"
        >
          Main site
        </a>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
        {/* Messages button */}
        {isAuthenticated && (
          <button
            onClick={() => setShowMessages(true)}
            className="relative p-1.5 text-gray-600 hover:text-gray-900 transition"
            title="Messages"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
        {/* Login/Profile button */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`text-sm px-2.5 py-1 rounded-md border transition-colors ${
            activeTab === 'profile'
              ? 'border-rstu-red bg-rstu-red text-white'
              : 'border-rstu-red/60 text-rstu-red hover:border-rstu-red'
          }`}
        >
          {isAuthenticated ? 'Profile' : 'Login'}
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

      {/* Messages Hub Modal */}
      {showMessages && (
        <MessageHub onClose={() => setShowMessages(false)} />
      )}
    </>
  )
}
