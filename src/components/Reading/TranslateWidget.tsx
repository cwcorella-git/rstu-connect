'use client'

import { useEffect, useState } from 'react'

// Extend window type for Google Translate
declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (options: object, elementId: string) => void
      }
    }
    googleTranslateElementInit?: () => void
  }
}

interface TranslateWidgetProps {
  className?: string
}

/**
 * Google Translate Element for document content translation.
 *
 * This embeds Google's translate widget which allows users to translate
 * document content into any language Google supports.
 */
export function TranslateWidget({ className = '' }: TranslateWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.translate) {
      initTranslate()
      return
    }

    // Define the callback function
    (window as any).googleTranslateElementInit = initTranslate

    // Load Google Translate script
    const script = document.createElement('script')
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      delete (window as any).googleTranslateElementInit
    }
  }, [])

  function initTranslate() {
    if (!document.getElementById('google_translate_element')) return

    try {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,tl,zh-CN,vi,ko,ja,ar,fa,ru,uk,de,fr,pt',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      )
      setIsLoaded(true)
    } catch (e) {
      console.error('Google Translate init error:', e)
    }
  }

  return (
    <div className={`translate-widget ${className}`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-xs text-gray-500 mr-2">Translate:</span>
        <div id="google_translate_element" className="inline-block" />
      </div>

      {/* Hide Google branding with CSS */}
      <style jsx global>{`
        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 12px !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 2px 8px !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value {
          color: #374151 !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none;
        }
        .goog-te-gadget img {
          display: none !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .skiptranslate {
          display: none !important;
        }
        .goog-te-spinner-pos {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
