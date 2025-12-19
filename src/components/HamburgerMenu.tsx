'use client'

import { useEffect, useState } from 'react'
import { useTab } from '@/contexts/TabContext'
import { canAccessTools, getCurrentProfile, isAdmin } from '@/lib/profileStorage'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { activeTab, setActiveTab } = useTab()
  const [showTools, setShowTools] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)

  // Check profile when menu opens
  useEffect(() => {
    if (isOpen) {
      const profile = getCurrentProfile()
      setShowTools(canAccessTools())
      setHasProfile(!!profile)
      setProfileName(profile?.nickname || null)
      setIsAdminUser(isAdmin())
    }
  }, [isOpen])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleNavigation = (tab: 'home' | 'reading' | 'tools' | 'profile') => {
    setActiveTab(tab)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <nav className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-4 flex flex-col h-[calc(100%-60px)]">
          {/* Main Tabs */}
          <div className="px-4 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</span>
          </div>

          <button
            onClick={() => handleNavigation('home')}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
              activeTab === 'home'
                ? 'bg-red-50 text-rstu-red border-r-4 border-rstu-red'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Organize
          </button>

          <button
            onClick={() => handleNavigation('reading')}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
              activeTab === 'reading'
                ? 'bg-red-50 text-rstu-red border-r-4 border-rstu-red'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Reading
          </button>

          {showTools && (
            <button
              onClick={() => handleNavigation('tools')}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                activeTab === 'tools'
                  ? 'bg-red-50 text-rstu-red border-r-4 border-rstu-red'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Tools
            </button>
          )}

          {/* External Links */}
          <div className="px-4 mt-6 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Links</span>
          </div>

          <a
            href="https://renosparkstenantsunion.org"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-3 text-left flex items-center gap-3 text-rstu-red font-medium hover:bg-red-50"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Main Site
            <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Spacer to push Account section to bottom */}
          <div className="flex-1" />

          {/* Account Section - at bottom */}
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</span>
            </div>

            <button
              onClick={() => handleNavigation('profile')}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                activeTab === 'profile'
                  ? 'bg-red-50 text-rstu-red border-r-4 border-rstu-red'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {hasProfile ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              )}
              {hasProfile ? (profileName || 'Profile') : 'Login / Create Profile'}
              {isAdminUser && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-rstu-red text-white rounded">
                  Admin
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
