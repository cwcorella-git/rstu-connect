'use client'

import { useState, useEffect } from 'react'
import { useTab } from '@/contexts/TabContext'
import { HamburgerMenu } from './HamburgerMenu'
import { canAccessTools, getCurrentProfile, isAdmin } from '@/lib/profileStorage'

export function Navigation() {
  const { activeTab, setActiveTab } = useTab()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(false)

  // Check profile on mount and periodically
  useEffect(() => {
    const checkProfile = () => {
      const profile = getCurrentProfile()
      setShowTools(canAccessTools())
      setHasProfile(!!profile)
      setProfileName(profile?.nickname || null)
      setIsAdminUser(isAdmin())
    }
    checkProfile()

    // Re-check when tab changes (profile might have been created)
    const interval = setInterval(checkProfile, 1000)
    return () => clearInterval(interval)
  }, [activeTab])

  return (
    <>
      {/* Desktop Navigation - Order: Organize, Reading, Get Involved, Tools, Profile, Main Site */}
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
        <a
          className="text-gray-600 hover:text-gray-900 whitespace-nowrap"
          href="https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Involved
        </a>
        {showTools && (
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
        <button
          onClick={() => setActiveTab('profile')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors ${
            activeTab === 'profile'
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-400 text-gray-700 hover:border-gray-900 hover:bg-gray-100'
          }`}
        >
          {hasProfile ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )}
          {hasProfile ? (profileName || 'Profile') : 'Join'}
          {isAdminUser && (
            <span className="ml-0.5 px-1 py-0.5 text-[10px] font-semibold bg-rstu-red text-white rounded">
              Admin
            </span>
          )}
        </button>
        <a
          href="https://renosparkstenantsunion.org"
          className="text-rstu-red hover:text-rstu-red-dark font-medium whitespace-nowrap"
        >
          Main site
        </a>
      </nav>

      {/* Mobile Navigation - Hamburger */}
      <div className="md:hidden flex items-center gap-2">
        <a
          href="https://renosparkstenantsunion.org"
          className="text-rstu-red hover:text-rstu-red-dark font-medium text-sm whitespace-nowrap"
        >
          Main site
        </a>
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
