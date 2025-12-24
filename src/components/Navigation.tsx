'use client'

import { useState } from 'react'
import { useTab } from '@/contexts/TabContext'
import { useAuth } from '@/contexts/AuthContext'
import { HamburgerMenu } from './HamburgerMenu'

export function Navigation() {
  const { activeTab, setActiveTab } = useTab()
  const { isAuthenticated, canAccessToolsTab, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

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
    </>
  )
}
