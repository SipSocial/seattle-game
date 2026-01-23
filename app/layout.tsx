import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Road to the Super Bowl - Seattle Darkside',
  description: 'A fast, arcade-style, mobile-first 2D side-scrolling football fantasy game. Control the Seattle Darkside defensive unit on your journey to the Super Bowl!',
  keywords: ['game', 'football', 'arcade', 'mobile', 'Seattle Darkside', 'Super Bowl'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden">{children}</body>
    </html>
  )
}
