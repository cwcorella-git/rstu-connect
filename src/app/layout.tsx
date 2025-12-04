import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'Reno-Sparks Tenants Union',
  description: 'Organizing platform for tenant power in Reno-Sparks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
