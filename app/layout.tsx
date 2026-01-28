import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Darkside Defense - DrinkSip',
  description: 'Endless football defense game. Tackle the horde. Level up. Survive. Powered by DrinkSip.',
  keywords: ['game', 'football', 'arcade', 'mobile', 'Darkside', 'DrinkSip', 'endless'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Darkside Defense',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0B1F24" />
      </head>
      <body 
        className="antialiased overflow-hidden"
        style={{
          overscrollBehavior: 'none',
          position: 'fixed',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </body>
    </html>
  )
}
