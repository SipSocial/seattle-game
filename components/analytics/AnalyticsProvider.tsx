'use client'

/**
 * Analytics Provider - Dark Side Football
 * 
 * Wraps the app to provide analytics context and automatic page tracking.
 * Uses Next.js router events to detect navigation.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  trackEvent,
  trackPageView,
  enableDebugMode,
  disableDebugMode,
  isDebugMode,
  getSessionId,
  getDeviceId,
  getStoredEvents,
  clearStoredEvents,
  getEventCount,
  type AnalyticsEvent,
  type AnalyticsPayload,
} from '@/src/v5/lib/analytics'

// ============================================
// Types
// ============================================

interface AnalyticsContextValue {
  /** Track a custom event */
  track: (event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) => void
  /** Track a page view manually */
  trackPage: (pageName: string) => void
  /** Get current session ID */
  sessionId: string
  /** Get device ID */
  deviceId: string
  /** Enable debug logging */
  enableDebug: () => void
  /** Disable debug logging */
  disableDebug: () => void
  /** Check if debug mode is on */
  isDebugEnabled: boolean
  /** Get all stored events */
  getEvents: () => AnalyticsPayload[]
  /** Clear stored events */
  clearEvents: () => void
  /** Get count of stored events */
  eventCount: number
}

interface AnalyticsProviderProps {
  children: React.ReactNode
  /** Track page views automatically (default: true) */
  autoTrackPageViews?: boolean
  /** Enable debug mode on mount (default: follows NODE_ENV) */
  debug?: boolean
}

// ============================================
// Context
// ============================================

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)

// ============================================
// Provider
// ============================================

export function AnalyticsProvider({
  children,
  autoTrackPageViews = true,
  debug,
}: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathRef = useRef<string | null>(null)
  const isInitialMount = useRef(true)

  // Initialize debug mode
  useEffect(() => {
    if (debug !== undefined) {
      debug ? enableDebugMode() : disableDebugMode()
    }
  }, [debug])

  // Track page views on route change
  useEffect(() => {
    if (!autoTrackPageViews) return

    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    // Skip if same path (prevents double tracking)
    if (previousPathRef.current === currentPath) return

    // Don't track on initial mount if we want to avoid SSR hydration issues
    // But we do want the initial page view
    if (isInitialMount.current) {
      isInitialMount.current = false
    }

    // Track the page view
    trackPageView(pathname || '/')
    previousPathRef.current = currentPath
  }, [pathname, searchParams, autoTrackPageViews])

  // Memoized track function
  const track = useCallback(
    (event: AnalyticsEvent, properties?: Record<string, string | number | boolean>) => {
      trackEvent(event, properties)
    },
    []
  )

  // Memoized track page function
  const trackPage = useCallback((pageName: string) => {
    trackPageView(pageName)
  }, [])

  // Context value
  const value: AnalyticsContextValue = {
    track,
    trackPage,
    sessionId: typeof window !== 'undefined' ? getSessionId() : 'ssr',
    deviceId: typeof window !== 'undefined' ? getDeviceId() : 'ssr',
    enableDebug: enableDebugMode,
    disableDebug: disableDebugMode,
    isDebugEnabled: isDebugMode(),
    getEvents: getStoredEvents,
    clearEvents: clearStoredEvents,
    eventCount: typeof window !== 'undefined' ? getEventCount() : 0,
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access analytics functions
 * 
 * @example
 * ```tsx
 * const { track } = useAnalytics()
 * 
 * const handleClick = () => {
 *   track('sponsor_click', { sponsorId: 'nike', location: 'header' })
 * }
 * ```
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext)
  
  if (!context) {
    // Return a no-op implementation if used outside provider
    // This allows components to use analytics without wrapping in provider (graceful degradation)
    return {
      track: () => {},
      trackPage: () => {},
      sessionId: 'no-provider',
      deviceId: 'no-provider',
      enableDebug: () => {},
      disableDebug: () => {},
      isDebugEnabled: false,
      getEvents: () => [],
      clearEvents: () => {},
      eventCount: 0,
    }
  }
  
  return context
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Track an event on component mount
 */
export function useTrackOnMount(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>
) {
  const { track } = useAnalytics()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current) {
      track(event, properties)
      hasTracked.current = true
    }
  }, [track, event, properties])
}

/**
 * Create a tracked click handler
 */
export function useTrackedClick<T extends HTMLElement = HTMLElement>(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
  onClick?: (e: React.MouseEvent<T>) => void
) {
  const { track } = useAnalytics()

  return useCallback(
    (e: React.MouseEvent<T>) => {
      track(event, properties)
      onClick?.(e)
    },
    [track, event, properties, onClick]
  )
}
