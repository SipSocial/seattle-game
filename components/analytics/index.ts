/**
 * Analytics Components - Dark Side Football
 */

export {
  AnalyticsProvider,
  useAnalytics,
  useTrackOnMount,
  useTrackedClick,
} from './AnalyticsProvider'

// Re-export core analytics functions for direct use
export {
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
  flushEvents,
  type AnalyticsEvent,
  type AnalyticsPayload,
} from '@/src/v5/lib/analytics'
