'use client'

import { useEffect, useRef, useState } from 'react'
import { isAdmin, getCurrentProfile, clearProfile } from '@/lib/profileStorage'
import { useRouter } from 'next/navigation'

interface UserDropdownProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export function UserDropdown({ isOpen, onToggle, onClose }: UserDropdownProps) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profile = getCurrentProfile()

  if (!profile) return null

  // Get user initials
  const getInitials = () => {
    const parts = profile.nickname?.split(' ') || ['?']
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return profile.nickname?.substring(0, 2).toUpperCase() || '?'
  }

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle keyboard (Escape to close)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Handle sign out
  const handleSignOut = () => {
    clearProfile()
    onClose()
    router.push('/')
  }

  // Handle admin click
  const handleAdmin = () => {
    onClose()
    router.push('/admin')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={onToggle}
        className="w-10 h-10 rounded-full bg-rstu-red text-white flex items-center justify-center font-semibold hover:bg-red-700 transition-colors"
        title={profile.nickname}
        aria-label={`${profile.nickname} menu`}
        aria-expanded={isOpen}
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">{profile.nickname}</div>
            <div className="text-xs text-gray-500">
              {profile.trustLevel === 'verified' && 'Verified'}
              {profile.trustLevel === 'invited' && 'Invited'}
              {profile.trustLevel === 'self_registered' && 'Self-registered'}
            </div>
          </div>

          {/* Admin Button */}
          {isAdmin() && (
            <>
              <button
                onClick={handleAdmin}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Admin
              </button>
              <div className="border-t border-gray-200" />
            </>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
