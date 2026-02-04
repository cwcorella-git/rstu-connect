'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage, SUPPORTED_LOCALES, type Locale } from '@/contexts/LanguageContext'

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons'
  className?: string
}

export function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLocale = SUPPORTED_LOCALES.find(l => l.code === locale)

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {SUPPORTED_LOCALES.map(loc => (
          <button
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className={`px-2 py-1 text-xs rounded transition ${
              locale === loc.code
                ? 'bg-rstu-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {loc.code.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title="Select language"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="hidden sm:inline">{currentLocale?.code.toUpperCase()}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {SUPPORTED_LOCALES.map(loc => (
            <button
              key={loc.code}
              onClick={() => {
                setLocale(loc.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                locale === loc.code ? 'text-rstu-red font-medium' : 'text-gray-700'
              }`}
            >
              <span>{loc.nativeName}</span>
              {locale === loc.code && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
