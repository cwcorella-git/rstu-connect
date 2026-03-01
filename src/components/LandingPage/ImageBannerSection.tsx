'use client'

import { useRef, useCallback } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface ImageBannerSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
  nested?: boolean
}

// Get localized text with fallback: current locale -> 'en' -> legacy string
function getLocalizedText(value: unknown, locale: string, fallback: string): string {
  if (typeof value === 'string') return value
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
  const localized: Record<string, string> =
    typeof existing === 'string' ? { en: existing } :
    (existing && typeof existing === 'object') ? { ...(existing as Record<string, string>) } :
    {}
  localized[locale] = value
  return { ...config, [key]: localized }
}

export function ImageBannerSection({ config, onConfigChange, nested }: ImageBannerSectionProps) {
  const { isEditMode } = useEditMode()
  const { locale } = useLanguage()
  const textRef = useRef<HTMLHeadingElement>(null)

  const overlayText = getLocalizedText(config.overlayText, locale, 'Banner Text')
  const bgColor = (config.bgColor as string) || '#cc0000'
  const textColor = (config.textColor as string) || 'white'

  const handleBlur = useCallback(() => {
    const newText = textRef.current?.innerText || overlayText
    if (newText !== overlayText) {
      onConfigChange(setLocalizedText(config, 'overlayText', locale, newText))
    }
  }, [config, overlayText, locale, onConfigChange])

  return (
    <section
      className={nested ? 'py-6 px-2' : 'py-12 sm:py-16 px-4'}
      style={{ backgroundColor: bgColor }}
    >
      <div className={`${nested ? 'max-w-full' : 'max-w-4xl mx-auto'} text-center`}>
        <h2
          ref={textRef}
          contentEditable={isEditMode ? 'plaintext-only' : undefined}
          suppressContentEditableWarning
          onBlur={handleBlur}
          className={`${nested ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'} font-bold leading-tight ${
            isEditMode ? 'outline-dashed outline-2 outline-white/50 outline-offset-4 cursor-text' : ''
          }`}
          style={{ color: textColor }}
        >
          {overlayText}
        </h2>
      </div>
    </section>
  )
}
