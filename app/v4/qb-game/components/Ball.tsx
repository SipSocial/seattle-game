'use client'

/**
 * Ball - Football with realistic arc and minimal arcade trail
 * 
 * Features:
 * - Realistic football shape with laces
 * - Subtle glowing trail (not overdone)
 * - Proper arc trajectory
 * - Spiral rotation during flight
 * - Synced with unified coordinate system
 */

import { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BallState } from '../hooks/useGameState'

interface BallProps {
  ball: BallState
  phase: string
}

export const Ball = memo(function Ball({ ball, phase }: BallProps) {
  const { x, y, inFlight, progress, targetX, targetY, startX, startY } = ball
  
  const isVisible = phase === 'BALL_FLIGHT' || phase === 'THROW' || inFlight
  
  // Spiral rotation (realistic football spin)
  const rotation = useMemo(() => {
    return progress * 720 // Two full spirals
  }, [progress])
  
  // Scale - slight grow at peak of arc
  const scale = useMemo(() => {
    const t = progress
    const curve = 4 * t * (1 - t) // Peaks at 0.5
    return 1.0 + (curve * 0.25) // Max 1.25x at peak
  }, [progress])
  
  // Arc height - parabolic trajectory
  const arcOffset = useMemo(() => {
    const t = progress
    // Parabolic: peaks at t=0.5
    const maxArc = 12 // percentage offset at peak
    return maxArc * 4 * t * (1 - t)
  }, [progress])
  
  // Current position along the path
  const currentX = startX + (targetX - startX) * progress
  const currentY = startY + (targetY - startY) * progress
  
  // Enhanced trail - dynamic length based on velocity
  const trail = useMemo(() => {
    if (!inFlight || progress < 0.05) return []
    
    // More trail points for deeper throws
    const throwDistance = Math.abs(targetY - startY)
    const trailCount = throwDistance > 40 ? 6 : throwDistance > 25 ? 5 : 4
    
    return Array.from({ length: trailCount }).map((_, i) => {
      const trailProgress = Math.max(0, progress - (i + 1) * 0.05)
      const tx = startX + (targetX - startX) * trailProgress
      const ty = startY + (targetY - startY) * trailProgress
      const tArc = 12 * 4 * trailProgress * (1 - trailProgress)
      
      // Trail particles get smaller and more transparent
      const fadeRatio = 1 - (i / trailCount)
      return {
        x: tx,
        y: ty - tArc * 0.5,
        opacity: 0.6 * fadeRatio,
        size: 12 - i * 1.5,
        isStreak: i < 2, // First 2 are streaks, rest are orbs
      }
    })
  }, [inFlight, progress, startX, startY, targetX, targetY])
  
  // Glow intensity increases near catch point
  const catchProximityGlow = useMemo(() => {
    if (progress > 0.6) {
      return 1 + (progress - 0.6) * 2.5 // Ramps up from 1x to 2x
    }
    return 1
  }, [progress])
  
  if (!isVisible) return null
  
  return (
    <AnimatePresence>
      {/* Enhanced glowing trail with streaks */}
      {trail.map((t, i) => (
        <motion.div
          key={`trail-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `calc(50% + ${t.x}%)`,
            top: `${t.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 23 - i,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: t.opacity }}
          exit={{ opacity: 0 }}
        >
          <div
            style={{
              width: t.isStreak ? `${t.size * 1.5}px` : `${t.size}px`,
              height: t.isStreak ? `${t.size * 3}px` : `${t.size}px`,
              borderRadius: t.isStreak ? '40%' : '50%',
              background: t.isStreak 
                ? `linear-gradient(180deg, rgba(255,220,150,${t.opacity}) 0%, transparent 100%)`
                : `radial-gradient(circle, rgba(255,220,150,${t.opacity}) 0%, transparent 70%)`,
              filter: 'blur(2px)',
              transform: t.isStreak ? 'rotate(-15deg)' : 'none',
            }}
          />
        </motion.div>
      ))}
      
      {/* Dynamic glow behind ball - intensifies near catch */}
      {inFlight && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `calc(50% + ${currentX}%)`,
            top: `${currentY - arcOffset * 0.5}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 24,
          }}
          animate={{
            scale: catchProximityGlow,
            opacity: 0.3 + (catchProximityGlow - 1) * 0.3,
          }}
          transition={{ duration: 0.1 }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,200,100,${0.3 * catchProximityGlow}) 0%, rgba(105,190,40,${0.2 * catchProximityGlow}) 40%, transparent 70%)`,
              filter: `blur(${5 + catchProximityGlow * 3}px)`,
            }}
          />
        </motion.div>
      )}
      
      {/* Shadow on field */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `calc(50% + ${currentX}%)`,
          top: `${currentY + 3}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 22,
        }}
        animate={{ 
          opacity: inFlight ? 0.35 : 0,
          scale: 1 + arcOffset * 0.02,
        }}
      >
        <div
          style={{
            width: '24px',
            height: '10px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            filter: `blur(${3 + arcOffset * 0.2}px)`,
          }}
        />
      </motion.div>
      
      {/* Main football */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: `calc(50% + ${currentX}%)`,
          top: `${currentY - arcOffset * 0.5}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 25,
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale,
          rotate: rotation,
        }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ 
          opacity: { duration: 0.1 },
          scale: { duration: 0.05 },
          rotate: { duration: 0.02, ease: 'linear' },
        }}
      >
        {/* Football body */}
        <div
          style={{
            width: 'clamp(28px, 7vw, 38px)',
            height: 'clamp(18px, 4.5vw, 24px)',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a0683c 0%, #8B5A2B 40%, #654321 100%)',
            border: '1.5px solid #4a3728',
            position: 'relative',
            boxShadow: `
              0 2px 10px rgba(0,0,0,0.4),
              inset 0 2px 4px rgba(255,255,255,0.2),
              inset 0 -2px 4px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Lace stripe */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '50%',
              height: '2px',
              background: '#fff',
              borderRadius: '1px',
            }}
          />
          {/* Cross laces */}
          {[-2, 0, 2].map((offset) => (
            <div
              key={offset}
              style={{
                position: 'absolute',
                top: '50%',
                left: `calc(50% + ${offset * 12}%)`,
                transform: 'translate(-50%, -50%)',
                width: '1.5px',
                height: '5px',
                background: '#fff',
                borderRadius: '1px',
              }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Target indicator - subtle */}
      {inFlight && progress > 0.3 && progress < 0.85 && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: `calc(50% + ${targetX}%)`,
            top: `${targetY}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 21,
          }}
          animate={{ 
            scale: [0.95, 1.1, 0.95],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px dashed rgba(255,215,0,0.5)',
              background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 50%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
})
