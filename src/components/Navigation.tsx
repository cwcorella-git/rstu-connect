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
        {/* Ghost button for profile/join - subtle secondary action */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors ${
            activeTab === 'profile'
              ? 'border-rstu-red bg-rstu-red text-white'
              : 'border-rstu-red/60 text-rstu-red hover:border-rstu-red hover:bg-red-50'
          }`}
        >
          {hasProfile ? (profileName || 'Profile') : 'Join'}
          {isAdminUser && (
            <span className="ml-0.5 px-1 py-0.5 text-[10px] font-semibold bg-white text-rstu-red rounded">
              Admin
            </span>
          )}
        </button>
        {/* Primary CTA - solid button */}
        <a
          className="whitespace-nowrap px-3 py-1.5 bg-rstu-red text-white rounded-md font-medium hover:bg-rstu-red-dark transition-colors"
          href="https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Involved
        </a>
        <a
          href="https://renosparkstenantsunion.org"
          className="text-gray-600 hover:text-gray-900 whitespace-nowrap"
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
