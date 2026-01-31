'use client'

import { useRef, useEffect, useState } from 'react'

interface VideoBackgroundProps {
  src: string
  poster?: string
  overlay?: boolean
  overlayOpacity?: number
  className?: string
}

export function VideoBackground({
  src,
  poster,
  overlay = true,
  overlayOpacity = 0.3,
  className = '',
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      if (!isPlaying) {
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked, will play on interaction
          })
      }
    }

    // Try to play immediately
    playVideo()

    // Play on any user interaction
    const handleInteraction = () => playVideo()
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('click', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('click', handleInteraction)
    }
  }, [isPlaying])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{ transform: 'scale(1.1)' }}
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Pulsing spotlight glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%]"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(105,190,40,0.5) 0%, transparent 70%)',
            opacity: 0.2,
            animation: 'pulseLight 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dark overlay for text readability */}
      {overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `rgba(0, 0, 0, ${overlayOpacity})`,
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulseLight {
          0%, 100% { opacity: 0.2; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.4; transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default VideoBackground
