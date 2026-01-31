/**
 * Background Cache System
 * Manages generated Leonardo AI backgrounds in localStorage
 */

const CACHE_KEY = 'seahawks-defense-backgrounds'
const CACHE_VERSION = 1

interface CachedBackground {
  stageId: number
  url: string
  generatedAt: number
  expiresAt: number
}

interface BackgroundCache {
  version: number
  backgrounds: Record<number, CachedBackground>
}

// Cache duration: 7 days (backgrounds don't need to regenerate often)
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Get the background cache from localStorage
 */
function getCache(): BackgroundCache {
  if (typeof window === 'undefined') {
    return { version: CACHE_VERSION, backgrounds: {} }
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) {
      return { version: CACHE_VERSION, backgrounds: {} }
    }

    const parsed = JSON.parse(cached) as BackgroundCache
    
    // Version migration if needed
    if (parsed.version !== CACHE_VERSION) {
      return { version: CACHE_VERSION, backgrounds: {} }
    }

    return parsed
  } catch {
    return { version: CACHE_VERSION, backgrounds: {} }
  }
}

/**
 * Save the background cache to localStorage
 */
function saveCache(cache: BackgroundCache): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Failed to save background cache:', error)
  }
}

/**
 * Get a cached background URL for a stage
 */
export function getCachedBackground(stageId: number): string | null {
  const cache = getCache()
  const cached = cache.backgrounds[stageId]

  if (!cached) return null

  // Check if expired
  if (Date.now() > cached.expiresAt) {
    // Remove expired entry
    delete cache.backgrounds[stageId]
    saveCache(cache)
    return null
  }

  return cached.url
}

/**
 * Cache a generated background URL
 */
export function cacheBackground(stageId: number, url: string): void {
  const cache = getCache()
  
  cache.backgrounds[stageId] = {
    stageId,
    url,
    generatedAt: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION_MS,
  }

  saveCache(cache)
}

/**
 * Check if a background is cached and valid
 */
export function hasValidCache(stageId: number): boolean {
  return getCachedBackground(stageId) !== null
}

/**
 * Get all cached stage IDs
 */
export function getCachedStageIds(): number[] {
  const cache = getCache()
  return Object.keys(cache.backgrounds).map(Number)
}

/**
 * Clear the entire background cache
 */
export function clearBackgroundCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_KEY)
}

/**
 * Clear cache for a specific stage
 */
export function clearStageCache(stageId: number): void {
  const cache = getCache()
  delete cache.backgrounds[stageId]
  saveCache(cache)
}

/**
 * Preload background image into browser cache
 */
export function preloadBackgroundImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to preload image'))
    img.src = url
  })
}

/**
 * Generate background for a stage via API and cache it
 */
export async function generateAndCacheBackground(stageId: number): Promise<string | null> {
  try {
    // Check if already cached
    const cached = getCachedBackground(stageId)
    if (cached) return cached

    // Start generation
    const response = await fetch('/api/backgrounds/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageId }),
    })

    if (!response.ok) {
      console.error('Background generation failed:', await response.text())
      return null
    }

    const { generationId } = await response.json()

    // Poll for completion
    const url = await pollForCompletion(generationId)
    if (url) {
      cacheBackground(stageId, url)
      await preloadBackgroundImage(url)
    }

    return url
  } catch (error) {
    console.error('Background generation error:', error)
    return null
  }
}

/**
 * Poll Leonardo API for generation completion
 */
async function pollForCompletion(generationId: string, maxAttempts = 30): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`/api/leonardo/status/${generationId}`)
      
      if (!response.ok) {
        await delay(2000)
        continue
      }

      const data = await response.json()
      
      if (data.status === 'COMPLETE' && data.images?.length > 0) {
        return data.images[0].url
      }

      if (data.status === 'FAILED') {
        console.error('Generation failed')
        return null
      }

      // Still pending, wait and retry
      await delay(2000)
    } catch (error) {
      console.error('Poll error:', error)
      await delay(2000)
    }
  }

  console.error('Generation timed out')
  return null
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
