'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GENERATED_ASSETS } from '@/src/game/data/campaignAssets'
import { CampaignStage } from '@/src/game/data/campaign'

interface StageTransitionProps {
  stage: CampaignStage
  onStart: () => void
  autoStartDelay?: number
  planeImageUrl?: string
}

/**
 * Cinematic stage transition - Boeing 737 flies across screen
 * Ultra-minimal: just plane + countdown, no clutter
 */
export function StageTransition({ 
  stage, 
  onStart, 
  autoStartDelay = 2000,
  planeImageUrl = GENERATED_ASSETS.airplaneUrl,
}: StageTransitionProps) {
  const [countdown, setCountdown] = useState(Math.ceil(autoStartDelay / 1000))
  const [imageLoaded, setImageLoaded] = useState(false)
  const hasStartedRef = { current: false }

  const handleStart = useCallback(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    onStart()
  }, [onStart])

  // Countdown timer
  useEffect(() => {
    if (autoStartDelay <= 0) {
      handleStart()
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setTimeout(handleStart, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoStartDelay, handleStart])

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#001528' }}
    >
      {/* Sky gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a1929 0%, #1a3a5c 40%, #2d5a7b 70%, #1a3a5c 100%)',
        }}
      />
      
      {/* Subtle stars/atmosphere */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 40%)',
        }}
      />

      {/* Boeing 737 plane - flies from right to center-left */}
      {planeImageUrl && (
        <motion.div
          className="absolute inset-0 flex items-center"
          style={{ paddingLeft: '5%' }}
          initial={{ x: '100vw' }}
          animate={{ x: imageLoaded ? '0vw' : '100vw' }}
          transition={{ 
            duration: 1.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <motion.img
            src={planeImageUrl}
            alt="Dark Side Team Plane"
            onLoad={() => setImageLoaded(true)}
            style={{
              width: 'min(85vw, 600px)',
              height: 'auto',
              filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.8))',
            }}
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Bottom bar - minimal info */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          paddingLeft: '24px',
          paddingRight: '24px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
          paddingTop: '80px',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex items-end justify-between max-w-lg mx-auto">
          {/* Left: Week + matchup */}
          <div>
            <div 
              className="uppercase tracking-widest"
              style={{ 
                fontSize: '10px', 
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '4px',
              }}
            >
              {stage.weekLabel}
            </div>
            <div 
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                fontSize: 'clamp(18px, 4vw, 24px)',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '0.02em',
              }}
            >
              vs {stage.visuals.opponent.name.split(' ').pop()}
            </div>
          </div>
          
          {/* Right: Countdown */}
          <div className="text-right">
            <div 
              className="uppercase tracking-widest"
              style={{ 
                fontSize: '10px', 
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '4px',
              }}
            >
              {countdown > 0 ? 'Starting in' : 'Ready'}
            </div>
            <div 
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                fontSize: 'clamp(24px, 5vw, 32px)',
                fontWeight: 700,
                color: '#69BE28',
              }}
            >
              {countdown > 0 ? countdown : 'GO'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StageTransition
