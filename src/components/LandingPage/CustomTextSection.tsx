'use client'

import { useRef, useCallback } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface CustomTextSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

// Get localized text with fallback: current locale -> 'en' -> legacy string
function getLocalizedText(value: unknown, locale: string, fallback: string): string {
  if (typeof value === 'string') return value // Legacy format
  if (value && typeof value === 'object') {
    const localized = value as Record<string, string>
    return localized[locale] || localized['en'] || fallback
  }
  return fallback
}

// Set localized text, preserving other locales
function setLocalizedText(
  config: Record<string, unknown>,
  key: string,
  locale: string,
  value: string
): Record<string, unknown> {
  const existing = config[key]
  // Convert legacy string to object format
  const localized: Record<string, string> =
    typeof existing === 'string' ? { en: existing } :
    (existing && typeof existing === 'object') ? { ...(existing as Record<string, string>) } :
    {}
  localized[locale] = value
  return { ...config, [key]: localized }
}

export function CustomTextSection({ config, onConfigChange }: CustomTextSectionProps) {
  const { isEditMode } = useEditMode()
  const { locale } = useLanguage()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)

  const heading = getLocalizedText(config.heading, locale, 'Section Heading')
  const body = getLocalizedText(config.body, locale, 'Add your content here.')
  const bgColor = (config.bgColor as string) || 'white'

  const handleBlur = useCallback(() => {
    const newHeading = headingRef.current?.innerText || heading
    const newBody = bodyRef.current?.innerText || body
    if (newHeading !== heading || newBody !== body) {
      let updated = config
      if (newHeading !== heading) {
        updated = setLocalizedText(updated, 'heading', locale, newHeading)
      }
      if (newBody !== body) {
        updated = setLocalizedText(updated, 'body', locale, newBody)
      }
      onConfigChange(updated)
    }
  }, [config, heading, body, locale, onConfigChange])

  const bgClass = bgColor === 'gray' ? 'bg-gray-50' : 'bg-white'

  return (
    <section className={`py-10 sm:py-12 px-4 ${bgClass}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2
          ref={headingRef}
          contentEditable={isEditMode ? 'plaintext-only' : undefined}
          suppressContentEditableWarning
          onBlur={handleBlur}
          className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 ${
            isEditMode ? 'outline-dashed outline-2 outline-blue-300 outline-offset-2 cursor-text' : ''
          }`}
        >
          {heading}
        </h2>
        <p
          ref={bodyRef}
          contentEditable={isEditMode ? 'plaintext-only' : undefined}
          suppressContentEditableWarning
          onBlur={handleBlur}
          className={`text-base sm:text-lg text-gray-600 leading-relaxed ${
            isEditMode ? 'outline-dashed outline-2 outline-blue-300 outline-offset-2 cursor-text' : ''
          }`}
        >
          {body}
        </p>
      </div>
    </section>
  )
}
