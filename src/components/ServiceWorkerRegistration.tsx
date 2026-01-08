'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 *
 * Registers the service worker for PWA functionality and push notifications.
 * This component renders nothing and only handles SW registration.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) {
      return
    }

    // Register service worker
    const registerSW = async () => {
      try {
        const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : ''
        const registration = await navigator.serviceWorker.register(`${basePath}/sw.js`, {
          scope: `${basePath}/`,
        })

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available - optionally notify user about update
              }
            })
          }
        })

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Controller changed, new service worker active
        })

      } catch {
        // SW registration failed
      }
    }

    // Register on load
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
      return () => window.removeEventListener('load', registerSW)
    }
  }, [])

  // This component renders nothing
  return null
}
