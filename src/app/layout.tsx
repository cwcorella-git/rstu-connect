import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClientLayout } from '@/components/Layout/ClientLayout'
import { ServiceWorkerRegistration } from '@/components/shared/ServiceWorkerRegistration'
import { VersionInfo } from '@/components/shared/VersionInfo'

export const metadata: Metadata = {
  title: 'Reno-Sparks Tenants Union',
  description: 'Organizing platform for tenant power in Reno-Sparks',
  manifest: '/rstu-connect/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RSTU Connect',
  },
}

export const viewport: Viewport = {
  themeColor: '#cc0000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// Content Security Policy for XSS prevention
// Note: Using meta tag since this is a static export (headers() doesn't work)
// Note: frame-ancestors and X-Frame-Options must be set via HTTP headers at the hosting level
// (GitHub Pages, Neocities) - they are ignored when delivered via meta tags
const cspContent = [
  "default-src 'self'",
  // Scripts: self + inline needed for Next.js hydration
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Styles: self + inline needed for Tailwind/CSS-in-JS
  "style-src 'self' 'unsafe-inline'",
  // Images: self + data URIs + external HTTPS
  "img-src 'self' data: https: blob:",
  // Fonts
  "font-src 'self' data:",
  // Connections: Supabase, chat server, and WebSocket
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://rstu-chat-server.onrender.com wss://rstu-chat-server.onrender.com https://rstu-gun-relay.onrender.com wss://rstu-gun-relay.onrender.com https://tiles.openfreemap.org",
  // Media
  "media-src 'self'",
  // Workers (MapLibre GL uses web workers for rendering)
  "worker-src 'self' blob:",
  // Object/embed (disable for security)
  "object-src 'none'",
  // Base URI restriction
  "base-uri 'self'",
  // Form actions
  "form-action 'self'",
  // Upgrade insecure requests
  "upgrade-insecure-requests",
].join('; ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content={cspContent} />
        {/* Additional security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="icon" href="/rstu-connect/favicon.ico" sizes="any" />
        <link rel="icon" href="/rstu-connect/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/rstu-connect/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-white">
        <ServiceWorkerRegistration />
        <VersionInfo />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
