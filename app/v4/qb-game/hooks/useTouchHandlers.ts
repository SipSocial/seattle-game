/**
 * useTouchHandlers - iOS-friendly touch handling
 * 
 * This hook provides reliable touch handling for iOS Safari
 * by using native touch events instead of synthetic events.
 */

import { useCallback, useRef, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface TouchState {
  isTouching: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
}

export interface TouchHandlers {
  onTap: (callback: () => void) => {
    onTouchStart: (e: React.TouchEvent | TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent | TouchEvent) => void
    onClick: (e: React.MouseEvent | MouseEvent) => void
  }
  onSwipe: (callback: (direction: 'left' | 'right' | 'up' | 'down') => void) => {
    onTouchStart: (e: React.TouchEvent | TouchEvent) => void
    onTouchMove: (e: React.TouchEvent | TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent | TouchEvent) => void
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TAP_THRESHOLD = 10 // Max movement in pixels to still count as tap
const SWIPE_THRESHOLD = 50 // Min movement in pixels to trigger swipe
const TAP_DURATION_MAX = 300 // Max duration in ms for a tap

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

export function triggerHaptic(pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'medium') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 20],
    error: [50, 30, 50, 30, 50],
  }
  
  try {
    navigator.vibrate(patterns[pattern])
  } catch {
    // Vibration not supported
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useTouchHandlers(): TouchHandlers {
  const touchRef = useRef<TouchState>({
    isTouching: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  })
  
  const touchStartTimeRef = useRef<number>(0)
  
  // Prevent default on touchend to avoid double-tap zoom
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-prevent-zoom]')) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('touchend', preventZoom, { passive: false })
    return () => document.removeEventListener('touchend', preventZoom)
  }, [])
  
  /**
   * Create tap handlers for an element
   */
  const onTap = useCallback((callback: () => void) => {
    let touchStarted = false
    let touchStartTime = 0
    let startX = 0
    let startY = 0
    
    return {
      onTouchStart: (e: React.TouchEvent | TouchEvent) => {
        const touch = 'touches' in e ? e.touches[0] : null
        if (!touch) return
        
        touchStarted = true
        touchStartTime = Date.now()
        startX = touch.clientX
        startY = touch.clientY
        
        // Prevent iOS from showing touch callout
        e.stopPropagation()
      },
      
      onTouchEnd: (e: React.TouchEvent | TouchEvent) => {
        if (!touchStarted) return
        
        const touch = 'changedTouches' in e ? e.changedTouches[0] : null
        if (!touch) return
        
        const duration = Date.now() - touchStartTime
        const deltaX = Math.abs(touch.clientX - startX)
        const deltaY = Math.abs(touch.clientY - startY)
        
        // Check if this qualifies as a tap
        if (duration <= TAP_DURATION_MAX && deltaX <= TAP_THRESHOLD && deltaY <= TAP_THRESHOLD) {
          e.preventDefault()
          e.stopPropagation()
          triggerHaptic('light')
          callback()
        }
        
        touchStarted = false
      },
      
      // Fallback for desktop
      onClick: (e: React.MouseEvent | MouseEvent) => {
        if (!touchStarted) {
          e.preventDefault()
          e.stopPropagation()
          callback()
        }
      },
    }
  }, [])
  
  /**
   * Create swipe handlers for an element
   */
  const onSwipe = useCallback((callback: (direction: 'left' | 'right' | 'up' | 'down') => void) => {
    let startX = 0
    let startY = 0
    let currentX = 0
    let currentY = 0
    
    return {
      onTouchStart: (e: React.TouchEvent | TouchEvent) => {
        const touch = 'touches' in e ? e.touches[0] : null
        if (!touch) return
        
        startX = touch.clientX
        startY = touch.clientY
        currentX = startX
        currentY = startY
      },
      
      onTouchMove: (e: React.TouchEvent | TouchEvent) => {
        const touch = 'touches' in e ? e.touches[0] : null
        if (!touch) return
        
        currentX = touch.clientX
        currentY = touch.clientY
      },
      
      onTouchEnd: () => {
        const deltaX = currentX - startX
        const deltaY = currentY - startY
        
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)
        
        // Check if this qualifies as a swipe
        if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
          if (absX > absY) {
            // Horizontal swipe
            callback(deltaX > 0 ? 'right' : 'left')
          } else {
            // Vertical swipe
            callback(deltaY > 0 ? 'down' : 'up')
          }
          triggerHaptic('light')
        }
      },
    }
  }, [])
  
  return { onTap, onSwipe }
}

// ============================================================================
// UTILITY: Touch-friendly button props
// ============================================================================

export function getTouchButtonProps(onClick: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    style: {
      touchAction: 'manipulation' as const,
      WebkitTouchCallout: 'none' as const,
      WebkitUserSelect: 'none' as const,
      userSelect: 'none' as const,
      cursor: 'pointer' as const,
    },
    'data-prevent-zoom': true,
    onTouchStart: (e: React.TouchEvent) => {
      e.stopPropagation()
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      triggerHaptic('light')
      onClick()
    },
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
  }
}
