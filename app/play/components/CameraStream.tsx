'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/src/store/gameStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface CameraStreamProps {
  isActive: boolean
  onCameraReady?: () => void
  onCameraDisabled?: () => void
}

type CameraState = 'idle' | 'requesting' | 'ready' | 'error'

export function CameraStream({ isActive, onCameraReady, onCameraDisabled }: CameraStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)
  
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  const setCameraPermission = useGameStore((s) => s.setCameraPermission)
  const setArMode = useGameStore((s) => s.setArMode)

  // Start camera
  const startCamera = async () => {
    if (streamRef.current) return // Already have a stream
    if (cameraState === 'requesting') return // Already requesting
    
    setCameraState('requesting')
    setErrorMessage('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (!mountedRef.current) {
        // Component unmounted during request, clean up
        stream.getTracks().forEach(track => track.stop())
        return
      }

      streamRef.current = stream
      setCameraPermission('granted')

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to actually play
        await videoRef.current.play()
        
        if (mountedRef.current) {
          setCameraState('ready')
          onCameraReady?.()
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      
      if (!mountedRef.current) return
      
      setCameraState('error')
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setErrorMessage('Camera access denied. Enable camera in browser settings.')
          setCameraPermission('denied')
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('No camera found on this device.')
        } else if (err.name === 'NotReadableError') {
          setErrorMessage('Camera is being used by another app.')
        } else {
          setErrorMessage('Unable to access camera.')
        }
      }
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraState('idle')
    onCameraDisabled?.()
  }

  // Handle disable AR
  const handleDisableAR = () => {
    stopCamera()
    setArMode(false)
  }

  // Handle retry
  const handleRetry = () => {
    setCameraState('idle')
    setErrorMessage('')
    // Small delay before retrying
    setTimeout(() => startCamera(), 100)
  }

  // Start/stop based on isActive
  useEffect(() => {
    mountedRef.current = true
    
    if (isActive && cameraState === 'idle') {
      startCamera()
    } else if (!isActive && cameraState !== 'idle') {
      stopCamera()
    }

    return () => {
      mountedRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      stopCamera()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isActive) return null

  return (
    <>
      {/* Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed inset-0 w-full h-full object-cover"
        style={{
          zIndex: 0,
          opacity: cameraState === 'ready' ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />

      {/* Loading State */}
      <AnimatePresence>
        {cameraState === 'requesting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ 
              zIndex: 5,
              background: 'rgba(0,34,68,0.95)',
            }}
          >
            <GlassCard variant="green" padding="lg" className="text-center max-w-xs mx-4">
              {/* Simple clean loading */}
              <div className="mb-6 flex justify-center">
                <motion.div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(105,190,40,0.1)',
                    border: '2px solid rgba(105,190,40,0.3)',
                  }}
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 rgba(105,190,40,0.4)',
                      '0 0 0 12px rgba(105,190,40,0)',
                    ],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <svg 
                    className="w-8 h-8" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="#69BE28"
                    strokeWidth="1.5"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </motion.div>
              </div>

              <LoadingSpinner size="sm" />
              
              <p className="mt-4 text-white/80 text-sm font-medium">
                Enabling AR Camera
              </p>
              <p className="mt-1 text-white/40 text-xs">
                Allow camera access when prompted
              </p>

              {/* Cancel button */}
              <motion.button
                onClick={handleDisableAR}
                className="mt-6 text-white/50 text-xs hover:text-white/80 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {cameraState === 'error' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-6"
            style={{ 
              zIndex: 5,
              background: 'rgba(0,34,68,0.95)',
            }}
          >
            <GlassCard variant="default" padding="lg" className="text-center max-w-sm">
              {/* Error icon */}
              <div className="mb-4 flex justify-center">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(229,57,53,0.1)',
                    border: '2px solid rgba(229,57,53,0.3)',
                  }}
                >
                  <svg 
                    className="w-7 h-7" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="#E53935"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              </div>

              <h3 
                className="text-white font-bold text-base mb-2"
                style={{ fontFamily: 'var(--font-oswald), system-ui' }}
              >
                Camera Unavailable
              </h3>
              
              <p className="text-white/60 text-sm mb-6">
                {errorMessage}
              </p>
              
              <div className="flex flex-col gap-3">
                <GradientButton fullWidth onClick={handleRetry}>
                  Try Again
                </GradientButton>
                
                <motion.button
                  onClick={handleDisableAR}
                  className="py-2 text-white/50 text-sm hover:text-white/80 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  Continue Without AR
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
