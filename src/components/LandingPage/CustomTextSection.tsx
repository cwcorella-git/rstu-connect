'use client'

import { useRef, useCallback } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'

interface CustomTextSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function CustomTextSection({ config, onConfigChange }: CustomTextSectionProps) {
  const { isEditMode } = useEditMode()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)

  const heading = (config.heading as string) || 'Section Heading'
  const body = (config.body as string) || 'Add your content here.'
  const bgColor = (config.bgColor as string) || 'white'

  const handleBlur = useCallback(() => {
    const newHeading = headingRef.current?.innerText || heading
    const newBody = bodyRef.current?.innerText || body
    if (newHeading !== heading || newBody !== body) {
      onConfigChange({ ...config, heading: newHeading, body: newBody })
    }
  }, [config, heading, body, onConfigChange])

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
