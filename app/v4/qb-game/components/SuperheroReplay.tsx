'use client'

/**
 * SuperheroReplay - Madden x Superhero Cinematic Celebration
 * 
 * 5-second sequence triggered on big plays (TD + 25+ yard gains):
 * 
 * SECOND 1: Flash + Freeze - Screen flashes green, gameplay freezes
 * SECOND 2: Hero Reveal - Player slides in with cape/glow overlay
 * SECOND 3: Stats Slam - Name + yards slam in with impact shake
 * SECOND 4: Action Replay - Quick frames of the catch
 * SECOND 5: Transition Out - Scale down, crowd roar, fade back
 */

import { memo, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OFFENSE_PLAYERS } from '@/src/game/data/playerRosters'

interface SuperheroReplayProps {
  isActive: boolean
  scoringPlayerJersey: number
  yardsGained: number
  isTouchdown: boolean
  onComplete: () => void
}

type ReplayPhase = 'flash' | 'heroReveal' | 'statsSlam' | 'action' | 'transition' | 'done'

// Phase timings (in ms)
const PHASE_TIMINGS: Record<ReplayPhase, number> = {
  flash: 200,
  heroReveal: 1200,
  statsSlam: 1000,
  action: 800,
  transition: 800,
  done: 0,
}

export const SuperheroReplay = memo(function SuperheroReplay({
  isActive,
  scoringPlayerJersey,
  yardsGained,
  isTouchdown,
  onComplete,
}: SuperheroReplayProps) {
  const [phase, setPhase] = useState<ReplayPhase>('flash')
  const [glowPulse, setGlowPulse] = useState(1)
  
  const player = useMemo(() => 
    OFFENSE_PLAYERS.find(p => p.jersey === scoringPlayerJersey) || OFFENSE_PLAYERS[0],
    [scoringPlayerJersey]
  )
  
  const lastName = player.name.split(' ').pop()?.toUpperCase() || ''
  
  // Phase progression
  useEffect(() => {
    if (!isActive) {
      setPhase('flash')
      return
    }
    
    let currentPhase: ReplayPhase = 'flash'
    const phases: ReplayPhase[] = ['flash', 'heroReveal', 'statsSlam', 'action', 'transition', 'done']
    let phaseIndex = 0
    
    const advancePhase = () => {
      phaseIndex++
      if (phaseIndex < phases.length) {
        currentPhase = phases[phaseIndex]
        setPhase(currentPhase)
        
        if (currentPhase === 'done') {
          onComplete()
        } else {
          setTimeout(advancePhase, PHASE_TIMINGS[currentPhase])
        }
      }
    }
    
    setTimeout(advancePhase, PHASE_TIMINGS['flash'])
    
    return () => {
      // Cleanup handled by phase progression
    }
  }, [isActive, onComplete])
  
  // Glow pulse animation
  useEffect(() => {
    if (!isActive) return
    
    let frame = 0
    const interval = setInterval(() => {
      frame++
      setGlowPulse(1 + Math.sin(frame * 0.15) * 0.3)
    }, 33)
    
    return () => clearInterval(interval)
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* === PHASE 1: FLASH === */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: '#69BE28' }}
          />
        )}
      </AnimatePresence>
      
      {/* Background */}
      <div 
        className="absolute inset-0" 
        style={{ 
          background: 'linear-gradient(180deg, #001020 0%, #002244 50%, #001525 100%)'
        }} 
      />
      
      {/* Stadium light beams */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 0%, 
              transparent 0deg,
              rgba(255,255,255,0.03) 10deg,
              transparent 20deg,
              transparent 40deg,
              rgba(255,255,255,0.02) 50deg,
              transparent 60deg,
              transparent 120deg,
              rgba(255,255,255,0.03) 130deg,
              transparent 140deg,
              transparent 160deg,
              rgba(255,255,255,0.02) 170deg,
              transparent 180deg
            )
          `,
        }}
      />
      
      {/* === PHASE 2: HERO REVEAL === */}
      <AnimatePresence>
        {(phase === 'heroReveal' || phase === 'statsSlam' || phase === 'action' || phase === 'transition') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Massive radial glow behind player */}
            <motion.div
              className="absolute"
              animate={{ scale: [0.8, 1, 0.95] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '150vw',
                height: '150vh',
                background: `radial-gradient(ellipse at center, rgba(105,190,40,${0.3 * glowPulse}) 0%, transparent 50%)`,
              }}
            />
            
            {/* Player hero shot */}
            <motion.div
              className="relative"
              initial={{ x: 300, opacity: 0, scale: 1.2 }}
              animate={{ 
                x: 0, 
                opacity: 1, 
                scale: phase === 'transition' ? 0.3 : 1,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 80, 
                damping: 15,
                scale: { duration: 0.5 },
              }}
            >
              {/* Cape/energy effect behind player */}
              <motion.div
                className="absolute"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  top: '10%',
                  left: '-20%',
                  width: '140%',
                  height: '100%',
                  background: `
                    radial-gradient(ellipse 80% 60% at 50% 40%, 
                      rgba(105,190,40,0.4) 0%, 
                      rgba(105,190,40,0.1) 40%,
                      transparent 70%
                    )
                  `,
                  filter: 'blur(20px)',
                }}
              />
              
              {/* Player image */}
              <motion.img
                src={player.imageFront}
                alt={player.name}
                style={{
                  width: 'clamp(250px, 60vw, 400px)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: `drop-shadow(0 0 ${30 * glowPulse}px rgba(105,190,40,0.6))`,
                }}
              />
              
              {/* Jersey number floating */}
              <motion.div
                className="absolute"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                style={{
                  top: '5%',
                  right: '-10%',
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  fontSize: 'clamp(4rem, 15vw, 7rem)',
                  fontWeight: 900,
                  color: '#69BE28',
                  textShadow: `
                    0 0 40px rgba(105,190,40,0.8),
                    4px 4px 0 #002244
                  `,
                  lineHeight: 1,
                }}
              >
                #{player.jersey}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* === PHASE 3: STATS SLAM === */}
      <AnimatePresence>
        {(phase === 'statsSlam' || phase === 'action') && (
          <motion.div
            className="absolute bottom-[15%] left-0 right-0 text-center"
            initial={{ y: 100, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          >
            {/* Player name - MASSIVE */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: 'clamp(3rem, 14vw, 6rem)',
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 0 40px rgba(105,190,40,0.4), 4px 4px 0 rgba(0,0,0,0.5)',
                letterSpacing: '-0.02em',
              }}
            >
              {lastName}
            </motion.div>
            
            {/* Yards/TD indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: '8px',
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                fontWeight: 900,
                color: '#69BE28',
                textShadow: '0 0 20px rgba(105,190,40,0.6)',
                letterSpacing: '0.1em',
              }}
            >
              {isTouchdown ? 'TOUCHDOWN!' : `+${yardsGained} YARDS`}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* === PHASE 4: ACTION FRAMES (comic book style) === */}
      <AnimatePresence>
        {phase === 'action' && (
          <motion.div
            className="absolute top-4 left-0 right-0 flex justify-center gap-2"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -10 + i * 5 }}
                animate={{ scale: 1, rotate: -5 + i * 5 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                style={{
                  width: 'clamp(60px, 15vw, 90px)',
                  height: 'clamp(80px, 20vw, 120px)',
                  borderRadius: '8px',
                  border: '3px solid #69BE28',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                <img
                  src={player.imageFront}
                  alt=""
                  style={{
                    width: '150%',
                    height: '150%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    transform: `scale(${1 + i * 0.1})`,
                    filter: i === 2 ? 'none' : 'brightness(0.8)',
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* === PARTICLE EFFECTS === */}
      <CelebrationParticles isActive={phase !== 'flash' && phase !== 'done'} />
    </motion.div>
  )
})

// ============================================================================
// CELEBRATION PARTICLES
// ============================================================================

const CelebrationParticles = memo(function CelebrationParticles({ 
  isActive 
}: { isActive: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      size: 3 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 80,
    })),
  [])
  
  if (!isActive) return null
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            background: '#69BE28',
            boxShadow: `0 0 ${p.size * 2}px rgba(105,190,40,0.8)`,
          }}
          animate={{
            y: [0, -600],
            x: [0, p.drift],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
})
