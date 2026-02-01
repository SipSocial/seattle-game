'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface GyroscopeData {
  tiltX: number // -1 to 1 (left/right tilt)
  tiltY: number // -1 to 1 (forward/back tilt)
  isSupported: boolean
  isActive: boolean
}

/**
 * useGyroscope - Hook for device orientation (gyroscope) data
 * Returns normalized tilt values for parallax effects
 */
export function useGyroscope(enabled: boolean = true): GyroscopeData {
  const [data, setData] = useState<GyroscopeData>({
    tiltX: 0,
    tiltY: 0,
    isSupported: false,
    isActive: false,
  })
  
  const baselineRef = useRef<{ beta: number; gamma: number } | null>(null)
  const smoothedRef = useRef({ x: 0, y: 0 })

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return

    // Set baseline on first reading (current phone position = neutral)
    if (!baselineRef.current) {
      baselineRef.current = {
        beta: event.beta,
        gamma: event.gamma,
      }
    }

    // Calculate relative tilt from baseline
    const relativeBeta = event.beta - baselineRef.current.beta
    const relativeGamma = event.gamma - baselineRef.current.gamma

    // Normalize to -1 to 1 range (with 30 degree max tilt)
    const maxTilt = 30
    const rawX = Math.max(-1, Math.min(1, relativeGamma / maxTilt))
    const rawY = Math.max(-1, Math.min(1, relativeBeta / maxTilt))

    // Smooth the values for fluid motion (lerp)
    const smoothing = 0.15
    smoothedRef.current.x += (rawX - smoothedRef.current.x) * smoothing
    smoothedRef.current.y += (rawY - smoothedRef.current.y) * smoothing

    setData(prev => ({
      ...prev,
      tiltX: smoothedRef.current.x,
      tiltY: smoothedRef.current.y,
      isActive: true,
    }))
  }, [])

  useEffect(() => {
    if (!enabled) {
      setData(prev => ({ ...prev, isActive: false, tiltX: 0, tiltY: 0 }))
      return
    }

    // Check if DeviceOrientationEvent is supported
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setData(prev => ({ ...prev, isSupported: false }))
      return
    }

    setData(prev => ({ ...prev, isSupported: true }))

    // iOS 13+ requires permission request
    const requestPermission = async () => {
      // @ts-ignore - iOS specific API
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          // @ts-ignore
          const permission = await DeviceOrientationEvent.requestPermission()
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        } catch (error) {
          console.error('Gyroscope permission error:', error)
        }
      } else {
        // Non-iOS or older iOS
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      baselineRef.current = null
    }
  }, [enabled, handleOrientation])

  // Reset baseline when re-enabled
  useEffect(() => {
    if (enabled) {
      baselineRef.current = null
    }
  }, [enabled])

  return data
}
