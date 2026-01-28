import type { Metadata, Viewport } from 'next'
import { Oswald, Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'

// Premium sports typography
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  title: 'SEAHAWKS DEFENSE | 12th Man Experience',
  description: 'Step into CenturyLink Field. Pick your defender. Protect the endzone. The Legion of Boom lives on.',
  keywords: ['Seattle Seahawks', 'football game', 'defense', 'Legion of Boom', '12th Man', 'arcade', 'mobile game'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Seahawks Defense',
  },
  openGraph: {
    title: 'SEAHAWKS DEFENSE | 12th Man Experience',
    description: 'Step into CenturyLink Field. Pick your defender. Protect the endzone.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#002244',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#002244" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body 
        className="antialiased overflow-hidden"
        style={{
          overscrollBehavior: 'none',
          position: 'fixed',
          width: '100%',
          height: '100%',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          backgroundColor: '#002244',
        }}
      >
        {children}
      </body>
    </html>
  )
}
