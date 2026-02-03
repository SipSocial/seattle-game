'use client'

/**
 * DefenderInterception - Cinematic diving catch animation for interceptions
 * 
 * Visual sequence (1.5 seconds):
 * 1. Defender Break - Defender sprints toward interception point
 * 2. Diving Catch - Defender dives with arms extended
 * 3. Catch Pose - Brief celebration pose + flash effect
 */

import { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DefenderInterceptionProps {
  isActive: boolean
  /** Screen X position of interception (percentage, 0 = center) */
  x: number
  /** Screen Y position of interception (percentage) */
  y: number
  /** Defender jersey number */
  jersey: number
  /** Called when animation completes */
  onComplete: () => void
}

type AnimationPhase = 'idle' | 'break' | 'dive' | 'catch' | 'celebrate'

export const DefenderInterception = memo(function DefenderInterception({
  isActive,
  x,
  y,
  jersey,
  onComplete,
}: DefenderInterceptionProps) {
  const [phase, setPhase] = useState<AnimationPhase>('idle')
  const [showFlash, setShowFlash] = useState(false)
  
  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      setShowFlash(false)
      return
    }
    
    // Animation sequence
    setPhase('break')
    
    const breakTimer = setTimeout(() => {
      setPhase('dive')
    }, 300)
    
    const diveTimer = setTimeout(() => {
      setPhase('catch')
      setShowFlash(true)
    }, 700)
    
    const celebrateTimer = setTimeout(() => {
      setPhase('celebrate')
      setShowFlash(false)
    }, 1000)
    
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 1500)
    
    return () => {
      clearTimeout(breakTimer)
      clearTimeout(diveTimer)
      clearTimeout(celebrateTimer)
      clearTimeout(completeTimer)
    }
  }, [isActive, onComplete])
  
  if (!isActive && phase === 'idle') return null
  
  return (
    <>
      {/* Red flash overlay for turnover */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'linear-gradient(135deg, #ff0000 0%, #990000 100%)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Defender diving animation */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute"
            style={{
              left: `calc(50% + ${x}%)`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 55,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={getDefenderAnimation(phase, x)}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            {/* Defender body */}
            <motion.div
              animate={getBodyAnimation(phase)}
              style={{
                width: 'clamp(50px, 14vw, 70px)',
                height: 'clamp(50px, 14vw, 70px)',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #cc0000 0%, #880000 100%)',
                border: '3px solid #fff',
                boxShadow: phase === 'catch' || phase === 'celebrate'
                  ? '0 0 30px rgba(255,0,0,0.8), 0 0 60px rgba(255,0,0,0.4)'
                  : '0 4px 20px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Jersey number */}
              <span
                style={{
                  fontSize: 'clamp(18px, 5vw, 26px)',
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                }}
              >
                {jersey}
              </span>
              
              {/* Extended arms during dive */}
              {(phase === 'dive' || phase === 'catch') && (
                <>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    style={{
                      position: 'absolute',
                      left: '-20px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(-20deg)',
                      width: '25px',
                      height: '8px',
                      borderRadius: '4px',
                      background: '#cc0000',
                      transformOrigin: 'right center',
                    }}
                  />
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    style={{
                      position: 'absolute',
                      right: '-20px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(20deg)',
                      width: '25px',
                      height: '8px',
                      borderRadius: '4px',
                      background: '#cc0000',
                      transformOrigin: 'left center',
                    }}
                  />
                </>
              )}
              
              {/* Ball in hands after catch */}
              {(phase === 'catch' || phase === 'celebrate') && (
                <motion.div
                  initial={{ scale: 0, y: -30 }}
                  animate={{ scale: 1, y: -35 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
                    border: '1px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                />
              )}
            </motion.div>
            
            {/* INT! label during celebrate */}
            {phase === 'celebrate' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                  position: 'absolute',
                  bottom: '-35px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                  border: '2px solid #fff',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#fff',
                    fontFamily: 'var(--font-oswald)',
                    letterSpacing: '0.05em',
                  }}
                >
                  INT!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

function getDefenderAnimation(phase: AnimationPhase, x: number) {
  switch (phase) {
    case 'break':
      return {
        opacity: 1,
        scale: 1,
        x: x > 0 ? -30 : 30, // Sprint from opposite direction
        y: 20,
        transition: { duration: 0.3, ease: 'easeOut' },
      }
    case 'dive':
      return {
        opacity: 1,
        scale: 1.2,
        x: 0,
        y: 0,
        rotate: x > 0 ? -30 : 30, // Dive angle
        transition: { duration: 0.4, ease: 'easeInOut' },
      }
    case 'catch':
      return {
        opacity: 1,
        scale: 1.4,
        x: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
      }
    case 'celebrate':
      return {
        opacity: 1,
        scale: 1.3,
        x: 0,
        y: -10,
        rotate: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
      }
    default:
      return { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }
  }
}

function getBodyAnimation(phase: AnimationPhase) {
  switch (phase) {
    case 'dive':
      return {
        scaleX: 1.3,
        scaleY: 0.8,
        transition: { duration: 0.3 },
      }
    case 'catch':
      return {
        scaleX: 1.1,
        scaleY: 1.1,
        transition: { duration: 0.15, type: 'spring', stiffness: 500 },
      }
    case 'celebrate':
      return {
        scaleX: 1,
        scaleY: 1,
        y: [0, -5, 0],
        transition: { duration: 0.4, repeat: 2 },
      }
    default:
      return { scaleX: 1, scaleY: 1 }
  }
}
