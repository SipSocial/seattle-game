'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GradientButton } from '../ui/GradientButton'
import { GhostButton } from '../ui/GhostButton'

interface CameraViewProps {
  onCapture: (photoDataUrl: string) => void
  onCancel: () => void
}

type CameraState = 'requesting' | 'ready' | 'captured' | 'error' | 'fallback'

export function CameraView({ onCapture, onCancel }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [state, setState] = useState<CameraState>('requesting')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Request camera access
  useEffect(() => {
    let mounted = true

    async function requestCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Prefer back camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setState('ready')
        }
      } catch (err) {
        console.error('Camera access error:', err)
        if (mounted) {
          setState('fallback')
        }
      }
    }

    requestCamera()

    return () => {
      mounted = false
      // Stop camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Capture photo from video stream
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    // Flash effect
    setTimeout(() => {
      const video = videoRef.current!
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame
      ctx.drawImage(video, 0, 0)

      // Get the image data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedPhoto(dataUrl)
      setState('captured')
      setIsCapturing(false)

      // Stop the camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }, 150) // Brief delay for flash effect
  }, [])

  // Handle file upload fallback
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setCapturedPhoto(dataUrl)
      setState('captured')
    }
    reader.readAsDataURL(file)
  }, [])

  // Retake photo
  const retakePhoto = useCallback(async () => {
    setCapturedPhoto(null)
    setState('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setState('ready')
      }
    } catch {
      setState('fallback')
    }
  }, [])

  // Confirm and submit photo
  const confirmPhoto = useCallback(() => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
    }
  }, [capturedPhoto, onCapture])

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input for fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera viewfinder */}
      <div 
        className="flex-1 relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Loading state */}
        <AnimatePresence>
          {state === 'requesting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ gap: 'var(--space-4)' }}
            >
              <motion.div
                className="w-12 h-12 rounded-full border-4 border-t-transparent"
                style={{ borderColor: '#69BE28', borderTopColor: 'transparent' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p 
                className="text-center"
                style={{ 
                  fontSize: 'var(--text-body)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Requesting camera access...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live video preview */}
        {(state === 'ready' || state === 'requesting') && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: state === 'ready' ? 'block' : 'none' }}
          />
        )}

        {/* Capture flash effect */}
        <AnimatePresence>
          {isCapturing && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white z-10"
            />
          )}
        </AnimatePresence>

        {/* Captured photo preview */}
        {state === 'captured' && capturedPhoto && (
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={capturedPhoto}
            alt="Captured photo"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Fallback upload prompt */}
        {state === 'fallback' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
            style={{ gap: 'var(--space-4)' }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(105, 190, 40, 0.2)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#69BE28" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <p 
              className="text-center"
              style={{ 
                fontSize: 'var(--text-body)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Camera not available.<br />Tap below to upload a photo.
            </p>
            <GradientButton
              size="md"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </GradientButton>
          </motion.div>
        )}

        {/* Viewfinder frame overlay */}
        {state === 'ready' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner brackets */}
            <div 
              className="absolute top-8 left-8 w-12 h-12"
              style={{
                borderLeft: '3px solid #69BE28',
                borderTop: '3px solid #69BE28',
                borderTopLeftRadius: '8px',
              }}
            />
            <div 
              className="absolute top-8 right-8 w-12 h-12"
              style={{
                borderRight: '3px solid #69BE28',
                borderTop: '3px solid #69BE28',
                borderTopRightRadius: '8px',
              }}
            />
            <div 
              className="absolute bottom-8 left-8 w-12 h-12"
              style={{
                borderLeft: '3px solid #69BE28',
                borderBottom: '3px solid #69BE28',
                borderBottomLeftRadius: '8px',
              }}
            />
            <div 
              className="absolute bottom-8 right-8 w-12 h-12"
              style={{
                borderRight: '3px solid #69BE28',
                borderBottom: '3px solid #69BE28',
                borderBottomRightRadius: '8px',
              }}
            />
            
            {/* Center target */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                className="w-24 h-24 rounded-full"
                style={{
                  border: '2px solid rgba(105, 190, 40, 0.5)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Instruction text */}
            <div 
              className="absolute bottom-4 left-0 right-0 text-center"
              style={{
                fontSize: 'var(--text-caption)',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Center the DrinkSip can in frame
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div 
        className="pt-6 flex flex-col"
        style={{ gap: 'var(--space-4)' }}
      >
        {state === 'ready' && (
          <>
            {/* Capture button */}
            <motion.button
              className="mx-auto relative"
              onClick={capturePhoto}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #69BE28 0%, #4A8A1C 100%)',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 24px rgba(105, 190, 40, 0.4)',
              }}
            >
              {/* Inner ring */}
              <div 
                className="absolute inset-2 rounded-full"
                style={{
                  border: '3px solid rgba(0, 34, 68, 0.5)',
                }}
              />
            </motion.button>
            <p 
              className="text-center"
              style={{
                fontSize: 'var(--text-caption)',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Tap to capture
            </p>
          </>
        )}

        {state === 'captured' && (
          <div className="flex" style={{ gap: 'var(--space-3)' }}>
            <GhostButton
              size="lg"
              fullWidth
              variant="subtle"
              onClick={retakePhoto}
            >
              Retake
            </GhostButton>
            <GradientButton
              size="lg"
              fullWidth
              onClick={confirmPhoto}
            >
              Use Photo
            </GradientButton>
          </div>
        )}

        {(state === 'requesting' || state === 'fallback') && (
          <GhostButton
            size="lg"
            fullWidth
            variant="subtle"
            onClick={onCancel}
          >
            Cancel
          </GhostButton>
        )}
      </div>
    </div>
  )
}

export default CameraView
