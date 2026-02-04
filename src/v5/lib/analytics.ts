/**
 * Analytics Module - Dark Side Football
 * 
 * Local-first analytics tracking system.
 * Events stored in localStorage queue, ready for future integration
 * with Mixpanel, Amplitude, or custom backend.
 * 
 * SSR-safe - all localStorage access guards for window.
 */

// ============================================
// Types
// ============================================

export type AnalyticsEvent =
  | 'page_view'
  | 'registration_start'
  | 'registration_complete'
  | 'game_start'
  | 'game_complete'
  | 'pick_made'
  | 'picks_complete'
  | 'scan_complete'
  | 'prize_won'
  | 'share_click'
  | 'sponsor_click'
  | 'shop_view'
  | 'product_click'
  | 'referral_share'

export interface AnalyticsPayload {
  event: AnalyticsEvent
  properties?: Record<string, string | number | boolean>
  timestamp: number
  sessionId: string
  deviceId: string
}

// ============================================
// Constants
// ============================================

const STORAGE_KEYS = {
  EVENTS_QUEUE: 'dsf_analytics_queue',
  DEVICE_ID: 'dsf_device_id',
  SESSION_ID: 'dsf_session_id',
  SESSION_TIMESTAMP: 'dsf_session_ts',
} as const

const MAX_QUEUE_SIZE = 100
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

// ============================================
// State
// ============================================

let debugMode = process.env.NODE_ENV === 'development'

// ============================================
// Helpers
// ============================================

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Generate a unique ID (UUID v4 style)
 */
function generateId(): string {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get or create persistent device ID
 */
export function getDeviceId(): string {
  if (!isBrowser()) return 'ssr'
  
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
  if (!deviceId) {
    deviceId = generateId()
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
  }
  return deviceId
}

/**
 * Get or create session ID (expires after 30 min inactivity)
 */
export function getSessionId(): string {
  if (!isBrowser()) return 'ssr'
  
  const now = Date.now()
  const lastTimestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP)
  const currentSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
  
  // Check if session is still valid
  if (currentSessionId && lastTimestamp) {
    const elapsed = now - parseInt(lastTimestamp, 10)
    if (elapsed < SESSION_TIMEOUT_MS) {
      // Update timestamp and return existing session
      localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, now.toString())
      return currentSessionId
    }
  }
  
  // Create new session
  const newSessionId = generateId()
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId)
  localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, now.toString())
  return newSessionId
}

/**
 * Get the events queue from localStorage
 */
function getEventsQueue(): AnalyticsPayload[] {
  if (!isBrowser()) return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS_QUEUE)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save events queue to localStorage
 */
function saveEventsQueue(queue: AnalyticsPayload[]): void {
  if (!isBrowser()) return
  
  try {
    // Keep only the most recent events if over limit
    const trimmedQueue = queue.slice(-MAX_QUEUE_SIZE)
    localStorage.setItem(STORAGE_KEYS.EVENTS_QUEUE, JSON.stringify(trimmedQueue))
  } catch (error) {
    // localStorage might be full, try to clear old events
    if (debugMode) {
      console.warn('[Analytics] Failed to save events:', error)
    }
  }
}

/**
 * Log event to console in debug mode
 */
function logEvent(payload: AnalyticsPayload): void {
  if (!debugMode || !isBrowser()) return
  
  const timestamp = new Date(payload.timestamp).toLocaleTimeString()
  
  console.groupCollapsed(
    `%c📊 Analytics %c${payload.event}%c @ ${timestamp}`,
    'color: #6366f1; font-weight: bold;',
    'color: #10b981; font-weight: bold; padding: 0 4px;',
    'color: #64748b; font-weight: normal;'
  )
  
  console.log('%cEvent:', 'font-weight: bold; color: #f59e0b;', payload.event)
  
  if (payload.properties && Object.keys(payload.properties).length > 0) {
    console.log('%cProperties:', 'font-weight: bold; color: #f59e0b;', payload.properties)
  }
  
  console.log('%cSession:', 'font-weight: bold; color: #64748b;', payload.sessionId.slice(0, 8) + '...')
  console.log('%cDevice:', 'font-weight: bold; color: #64748b;', payload.deviceId.slice(0, 8) + '...')
  
  console.groupEnd()
}

// ============================================
// Public API
// ============================================

/**
 * Track an analytics event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isBrowser()) return
  
  const payload: AnalyticsPayload = {
    event,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    deviceId: getDeviceId(),
  }
  
  // Add to queue
  const queue = getEventsQueue()
  queue.push(payload)
  saveEventsQueue(queue)
  
  // Log in debug mode
  logEvent(payload)
}

/**
 * Track a page view
 */
export function trackPageView(pageName: string): void {
  trackEvent('page_view', { page: pageName })
}

/**
 * Enable debug mode (console logging)
 */
export function enableDebugMode(): void {
  debugMode = true
  if (isBrowser()) {
    console.log(
      '%c📊 Analytics Debug Mode Enabled',
      'color: #10b981; font-weight: bold; font-size: 14px;'
    )
  }
}

/**
 * Disable debug mode
 */
export function disableDebugMode(): void {
  debugMode = false
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return debugMode
}

/**
 * Get all stored events (for debugging or export)
 */
export function getStoredEvents(): AnalyticsPayload[] {
  return getEventsQueue()
}

/**
 * Clear all stored events
 */
export function clearStoredEvents(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEYS.EVENTS_QUEUE)
}

/**
 * Get event count
 */
export function getEventCount(): number {
  return getEventsQueue().length
}

// ============================================
// Future Integration Helpers
// ============================================

/**
 * Flush events to an external service
 * Placeholder for future integration
 */
export async function flushEvents(
  endpoint?: string
): Promise<{ success: boolean; eventsFlushed: number }> {
  const events = getEventsQueue()
  
  if (events.length === 0) {
    return { success: true, eventsFlushed: 0 }
  }
  
  if (!endpoint) {
    // No endpoint configured, just report count
    if (debugMode) {
      console.log(`[Analytics] ${events.length} events ready to flush (no endpoint configured)`)
    }
    return { success: true, eventsFlushed: 0 }
  }
  
  try {
    // Future: POST to endpoint
    // const response = await fetch(endpoint, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events }),
    // })
    // if (response.ok) clearStoredEvents()
    
    return { success: true, eventsFlushed: events.length }
  } catch (error) {
    if (debugMode) {
      console.error('[Analytics] Failed to flush events:', error)
    }
    return { success: false, eventsFlushed: 0 }
  }
}
