import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClientLayout } from '@/components/ClientLayout'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/rstu-connect/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-white">
        <ServiceWorkerRegistration />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
