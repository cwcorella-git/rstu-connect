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
      console.log('[SW] Service workers not supported')
      return
    }

    // Register service worker
    const registerSW = async () => {
      try {
        const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : ''
        const registration = await navigator.serviceWorker.register(`${basePath}/sw.js`, {
          scope: `${basePath}/`,
        })

        console.log('[SW] Service worker registered:', registration.scope)

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New service worker available')
                // Optionally notify user about update
              }
            })
          }
        })

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Controller changed, new service worker active')
        })

      } catch (err) {
        console.error('[SW] Registration failed:', err)
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
