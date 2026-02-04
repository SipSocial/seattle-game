import type { Metadata, Viewport } from 'next'
import Script from 'next/script'

/**
 * V5 Layout - DrinkSip Dark Side Football App Shell
 * 
 * PWA-optimized layout with:
 * - Dark background gradient (#000A14 to #001428)
 * - Safe area handling for notched devices
 * - Bottom padding for navigation bar
 * - Service worker registration
 * - Apple-specific PWA meta tags
 */

export const metadata: Metadata = {
  title: 'Dark Side Football | DrinkSip',
  description: 'Win Big Game Tickets with DrinkSip - Play Dark Side Football',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dark Side',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
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

export default function V5Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen min-h-[100dvh] no-overscroll"
      style={{
        background: 'linear-gradient(180deg, #000A14 0%, #001428 100%)',
      }}
    >
      {/* Apple-specific PWA meta tags */}
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Dark Side" />
      
      {/* Splash screens for iOS */}
      <link 
        rel="apple-touch-startup-image" 
        href="/icons/splash-1170x2532.png"
        media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
      />
      <link 
        rel="apple-touch-startup-image" 
        href="/icons/splash-1284x2778.png"
        media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
      />
      
      {children}
      
      {/* Service Worker Registration */}
      <Script id="sw-register" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js', { scope: '/v5' })
                .then(function(registration) {
                  console.log('[PWA] Service Worker registered:', registration.scope);
                  
                  // Check for updates periodically
                  setInterval(function() {
                    registration.update();
                  }, 60 * 60 * 1000); // Check every hour
                })
                .catch(function(error) {
                  console.log('[PWA] Service Worker registration failed:', error);
                });
            });
            
            // Handle controller change (new service worker took over)
            navigator.serviceWorker.addEventListener('controllerchange', function() {
              console.log('[PWA] New service worker activated');
            });
          }
        `}
      </Script>
    </div>
  )
}
