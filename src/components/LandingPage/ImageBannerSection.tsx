'use client'

import { useRef, useCallback } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'

interface ImageBannerSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function ImageBannerSection({ config, onConfigChange }: ImageBannerSectionProps) {
  const { isEditMode } = useEditMode()
  const textRef = useRef<HTMLHeadingElement>(null)

  const overlayText = (config.overlayText as string) || 'Banner Text'
  const bgColor = (config.bgColor as string) || '#cc0000'
  const textColor = (config.textColor as string) || 'white'

  const handleBlur = useCallback(() => {
    const newText = textRef.current?.innerText || overlayText
    if (newText !== overlayText) {
      onConfigChange({ ...config, overlayText: newText })
    }
  }, [config, overlayText, onConfigChange])

  return (
    <section
      className="py-12 sm:py-16 px-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          ref={textRef}
          contentEditable={isEditMode ? 'plaintext-only' : undefined}
          suppressContentEditableWarning
          onBlur={handleBlur}
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${
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
