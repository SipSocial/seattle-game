/**
 * V3 Layout - Dark Side Game V3
 * 
 * Inherits all design tokens from globals.css
 * Provides V3-specific metadata while preserving premium UI patterns
 */
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'DARK SIDE FOOTBALL | Road to Super Bowl',
  description: 'Play offense AND defense. Throw TDs like Sam Darnold. Get sacks like DeMarcus Lawrence. Lead the Dark Side to glory.',
  keywords: ['football game', 'QB game', 'offense defense', 'Dark Side', 'mobile game', 'sports game'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dark Side Football',
  },
  openGraph: {
    title: 'DARK SIDE FOOTBALL | Road to Super Bowl',
    description: 'Play offense AND defense. Lead the Dark Side to glory.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a', // Dark Side black instead of Seahawks navy
}

export default function V3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div 
      className="min-h-screen"
      style={{
        // Dark Side theme - stealth black base
        backgroundColor: '#0a0a0a',
      }}
    >
      {children}
    </div>
  )
}
