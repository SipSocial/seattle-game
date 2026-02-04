/**
 * Dark Side Football - Service Worker
 * 
 * Caching strategy:
 * - Static assets: Cache-first (fonts, images, CSS, JS bundles)
 * - API calls: Network-first with cache fallback
 * - Navigation: Network-first with offline fallback
 */

const CACHE_NAME = 'dark-side-v1';
const STATIC_CACHE_NAME = 'dark-side-static-v1';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/v5',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Offline fallback page (inline HTML)
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#002244">
  <title>Dark Side Football - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(180deg, #000A14 0%, #001428 100%);
      color: white;
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 24px;
      opacity: 0.8;
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      max-width: 300px;
      line-height: 1.5;
      margin-bottom: 32px;
    }
    button {
      background: linear-gradient(135deg, #69BE28 0%, #4a9218 100%);
      color: #002244;
      border: none;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-radius: 100px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 32px rgba(105, 190, 40, 0.4);
    }
    button:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <div class="icon">📡</div>
  <h1>You're Offline</h1>
  <p>Check your connection and try again. Your game progress is saved locally.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>
`;

// Install event - pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old versioned caches
              return name.startsWith('dark-side-') && 
                     name !== CACHE_NAME && 
                     name !== STATIC_CACHE_NAME;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except CDN assets)
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('shopify.com') &&
      !url.hostname.includes('cdn.')) {
    return;
  }
  
  // API calls - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Static assets - Cache first, network fallback
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Navigation requests - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }
  
  // Default - Network first
  event.respondWith(networkFirst(request));
});

// Check if request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.woff', '.woff2', '.ttf', '.eot',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.mp3', '.mp4', '.wav', '.m4a', '.webm',
    '.json'
  ];
  
  return staticExtensions.some((ext) => pathname.endsWith(ext)) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/icons/') ||
         pathname.startsWith('/sprites/') ||
         pathname.startsWith('/audio/');
}

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache-first fetch failed:', error);
    return new Response('', { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Try to serve from cache first
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page
    return new Response(OFFLINE_PAGE, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New update available',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'dark-side-notification',
    renotify: true,
    data: {
      url: data.url || '/v5'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Dark Side Football', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/v5';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if open
        for (const client of clients) {
          if (client.url.includes('/v5') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(url);
      })
  );
});
