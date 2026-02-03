'use client'

/**
 * PhaseOverlay - Dynamic phase transition announcements
 * 
 * Shows dramatic text overlays when game phases change:
 * - SNAP! - Ball is snapped
 * - READ THE DEFENSE - QB in pocket
 * - THROW IT! - Ball released
 * - CATCH! - Ball arriving
 */

import { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PhaseOverlayProps {
  phase: string
  previousPhase?: string
}

interface OverlayConfig {
  text: string
  subtext?: string
  color: string
  bgGradient: string
  duration: number
}

const PHASE_CONFIGS: Record<string, OverlayConfig> = {
  SNAP: {
    text: 'SNAP!',
    color: '#00aaff',
    bgGradient: 'linear-gradient(135deg, rgba(0,170,255,0.2) 0%, rgba(0,100,200,0.1) 100%)',
    duration: 600,
  },
  DROPBACK: {
    text: 'DROP BACK',
    subtext: 'Setting up...',
    color: '#69BE28',
    bgGradient: 'linear-gradient(135deg, rgba(105,190,40,0.15) 0%, rgba(74,154,28,0.05) 100%)',
    duration: 500,
  },
  READ: {
    text: 'READ IT',
    subtext: 'Find the open receiver',
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 100%)',
    duration: 800,
  },
  THROW: {
    text: 'THROW!',
    color: '#69BE28',
    bgGradient: 'linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(74,154,28,0.1) 100%)',
    duration: 400,
  },
  BALL_FLIGHT: {
    text: 'CATCH IT!',
    subtext: 'Time your catch',
    color: '#FFD700',
    bgGradient: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 100%)',
    duration: 600,
  },
}

export const PhaseOverlay = memo(function PhaseOverlay({ phase, previousPhase }: PhaseOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const [currentConfig, setCurrentConfig] = useState<OverlayConfig | null>(null)
  
  useEffect(() => {
    const config = PHASE_CONFIGS[phase]
    if (config && phase !== previousPhase) {
      setCurrentConfig(config)
      setShowOverlay(true)
      
      const timer = setTimeout(() => {
        setShowOverlay(false)
      }, config.duration)
      
      return () => clearTimeout(timer)
    }
  }, [phase, previousPhase])
  
  return (
    <AnimatePresence>
      {showOverlay && currentConfig && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
          style={{
            zIndex: 60,
            background: currentConfig.bgGradient,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0, y: -20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 25,
              duration: 0.3,
            }}
            style={{ textAlign: 'center' }}
          >
            <h1
              style={{
                fontSize: 'clamp(48px, 15vw, 80px)',
                fontWeight: 900,
                color: currentConfig.color,
                fontFamily: 'var(--font-oswald)',
                letterSpacing: '0.05em',
                textShadow: `
                  0 4px 20px ${currentConfig.color}60,
                  0 0 60px ${currentConfig.color}40,
                  2px 2px 0 rgba(0,0,0,0.3)
                `,
                WebkitTextStroke: '2px rgba(255,255,255,0.2)',
              }}
            >
              {currentConfig.text}
            </h1>
            
            {currentConfig.subtext && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  fontSize: 'clamp(14px, 4vw, 20px)',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: '8px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                {currentConfig.subtext}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ============================================================================
// DOWN & DISTANCE ANNOUNCEMENT
// ============================================================================

interface DownAnnouncementProps {
  down: number
  distance: number
  yardLine: number
  isVisible: boolean
}

export const DownAnnouncement = memo(function DownAnnouncement({
  down,
  distance,
  yardLine,
  isVisible,
}: DownAnnouncementProps) {
  const downText = ['1ST', '2ND', '3RD', '4TH'][down - 1] || `${down}TH`
  const distanceText = distance >= 10 ? `${distance}` : distance === 0 ? 'INCHES' : `${distance}`
  const locationText = yardLine > 50 ? `OPP ${100 - yardLine}` : yardLine === 50 ? '50' : `OWN ${yardLine}`
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 55,
          }}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Down */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(24px, 7vw, 32px)',
                  fontWeight: 900,
                  color: '#FFD700',
                  fontFamily: 'var(--font-oswald)',
                  lineHeight: 1,
                }}
              >
                {downText}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.1em',
                }}
              >
                DOWN
              </span>
            </div>
            
            {/* Separator */}
            <div
              style={{
                width: '2px',
                height: '32px',
                background: 'rgba(255,255,255,0.2)',
              }}
            />
            
            {/* Distance */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(24px, 7vw, 32px)',
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                  lineHeight: 1,
                }}
              >
                {distanceText}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.1em',
                }}
              >
                TO GO
              </span>
            </div>
            
            {/* Separator */}
            <div
              style={{
                width: '2px',
                height: '32px',
                background: 'rgba(255,255,255,0.2)',
              }}
            />
            
            {/* Location */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(14px, 4vw, 18px)',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'var(--font-oswald)',
                  lineHeight: 1.2,
                }}
              >
                {locationText}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.1em',
                }}
              >
                YARD LINE
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ============================================================================
// TOUCHDOWN CELEBRATION
// ============================================================================

interface TouchdownCelebrationProps {
  isVisible: boolean
  points?: number
}

export const TouchdownCelebration = memo(function TouchdownCelebration({
  isVisible,
  points = 6,
}: TouchdownCelebrationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center"
          style={{
            zIndex: 70,
            background: 'linear-gradient(135deg, rgba(105,190,40,0.3) 0%, rgba(0,34,68,0.5) 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti/celebration particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: '10px',
                height: '10px',
                borderRadius: i % 2 === 0 ? '50%' : '2px',
                background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#69BE28' : '#fff',
                left: `${10 + Math.random() * 80}%`,
                top: '-10%',
              }}
              animate={{
                y: ['0vh', '120vh'],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
                ease: 'easeIn',
              }}
            />
          ))}
          
          {/* Main touchdown text */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 15,
            }}
            style={{ textAlign: 'center' }}
          >
            <motion.h1
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  '0 4px 30px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.3)',
                  '0 4px 50px rgba(255,215,0,0.7), 0 0 120px rgba(255,215,0,0.5)',
                  '0 4px 30px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.3)',
                ],
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                fontSize: 'clamp(56px, 18vw, 96px)',
                fontWeight: 900,
                color: '#FFD700',
                fontFamily: 'var(--font-oswald)',
                letterSpacing: '0.05em',
                textShadow: '0 4px 30px rgba(255,215,0,0.5), 0 0 80px rgba(255,215,0,0.3)',
                WebkitTextStroke: '3px rgba(0,0,0,0.3)',
              }}
            >
              TOUCHDOWN!
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(36px, 10vw, 56px)',
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                +{points}
              </span>
              <span
                style={{
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'var(--font-oswald)',
                }}
              >
                POINTS
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
