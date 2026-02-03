'use client'

/**
 * TOUCHDOWN CELEBRATION - Cinematic Superhero Reveal
 * 
 * Inspired by commercial/Remotion aesthetic:
 * - Ultra-realistic player card hero shot
 * - Cinematic slide-in animations
 * - Dramatic green glow pulsing
 * - Movie-quality typography
 * - Superhero moment feeling
 */

import { memo, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OFFENSE_PLAYERS } from '@/src/game/data/playerRosters'

// DrinkSip SVG logo
const DRINKSIP_LOGO = 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477'

interface TouchdownCelebrationProps {
  scoringPlayerJersey: number
  onComplete: () => void
  yardsGained: number
}

export const TouchdownCelebration = memo(function TouchdownCelebration({
  scoringPlayerJersey,
  onComplete,
  yardsGained,
}: TouchdownCelebrationProps) {
  const [phase, setPhase] = useState<'flash' | 'reveal' | 'ready'>('flash')
  const [glowIntensity, setGlowIntensity] = useState(20)
  
  const player = OFFENSE_PLAYERS.find(p => p.jersey === scoringPlayerJersey) || OFFENSE_PLAYERS[0]
  const lastName = player.name.split(' ').pop()?.toUpperCase() || ''
  
  // Cinematic timing
  useEffect(() => {
    // Flash for impact
    const flashTimer = setTimeout(() => setPhase('reveal'), 150)
    // Ready for continue
    const readyTimer = setTimeout(() => setPhase('ready'), 2500)
    
    return () => {
      clearTimeout(flashTimer)
      clearTimeout(readyTimer)
    }
  }, [])
  
  // Pulsing glow effect (like Remotion's Math.sin approach)
  useEffect(() => {
    let frame = 0
    const interval = setInterval(() => {
      frame++
      setGlowIntensity(25 + Math.sin(frame * 0.1) * 10)
    }, 33) // ~30fps
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 9999, background: '#002244' }}
    >
      {/* === CINEMATIC FLASH === */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ background: '#69BE28' }}
          />
        )}
      </AnimatePresence>
      
      {/* === LAYERED BACKGROUND - Movie quality === */}
      
      {/* Deep navy base */}
      <div className="absolute inset-0" style={{ background: '#001525' }} />
      
      {/* Massive radial green glow from center */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 45%, rgba(105,190,40,0.25) 0%, transparent 60%)`,
        }}
      />
      
      {/* Stadium spotlight beams from top */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(170deg, rgba(255,255,255,0.03) 0%, transparent 30%),
            linear-gradient(190deg, rgba(255,255,255,0.02) 0%, transparent 25%),
            linear-gradient(175deg, rgba(105,190,40,0.05) 0%, transparent 40%)
          `,
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      
      {/* === CONTENT === */}
      <div 
        className="relative z-10 h-full w-full flex flex-col items-center justify-center"
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + clamp(80px, 15vh, 120px))',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        {/* === HERO CARD - Cinematic player reveal === */}
        <motion.div
          className="relative"
          initial={{ x: 200, opacity: 0, scale: 1.1 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 80, 
            damping: 15, 
            delay: 0.15,
          }}
        >
          {/* Giant glow behind card */}
          <div
            className="absolute"
            style={{
              width: 'clamp(300px, 80vw, 420px)',
              height: 'clamp(380px, 95vw, 520px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(ellipse at center, rgba(105,190,40,0.35) 0%, transparent 65%)`,
              filter: `blur(${glowIntensity}px)`,
            }}
          />
          
          {/* Player card container - matches Remotion commercial style */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(240px, 60vw, 320px)',
              height: 'clamp(300px, 75vw, 400px)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '3px solid #69BE28',
              boxShadow: `
                0 0 ${glowIntensity}px #69BE28,
                0 0 ${glowIntensity * 2}px rgba(105,190,40,0.4),
                0 20px 60px rgba(0,0,0,0.6)
              `,
              background: 'linear-gradient(180deg, #002244 0%, #001030 100%)',
            }}
          >
            {/* Player image - superhero pose */}
            <motion.img
              src={player.imageFront}
              alt={player.name}
              initial={{ scale: 1.15, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 100, 
                damping: 12,
                delay: 0.3,
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
              }}
            />
            
            {/* Gradient overlay at bottom for text */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(0deg, rgba(0,20,40,0.95) 0%, rgba(0,20,40,0.7) 50%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />
            
            {/* Jersey number - top right corner */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: 'clamp(1.75rem, 8vw, 2.5rem)',
                fontWeight: 900,
                color: '#69BE28',
                textShadow: `0 0 15px #002244, 2px 2px 0 #002244, -1px -1px 0 #002244`,
                lineHeight: 1,
              }}
            >
              #{player.jersey}
            </motion.div>
            
            {/* Player name inside card - bottom */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'Arial Black, Impact, sans-serif',
                  fontSize: 'clamp(1.5rem, 7vw, 2.25rem)',
                  fontWeight: 900,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  textShadow: '0 2px 15px rgba(0,0,0,0.8)',
                }}
              >
                {lastName}
              </div>
              
              {/* Position + Stats */}
              <div
                style={{
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 'clamp(0.75rem, 3.5vw, 1rem)',
                    fontWeight: 700,
                    color: '#69BE28',
                    letterSpacing: '0.1em',
                  }}
                >
                  {player.position}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>•</span>
                <span
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: 'clamp(0.75rem, 3.5vw, 1rem)',
                    fontWeight: 700,
                    color: '#69BE28',
                    letterSpacing: '0.05em',
                  }}
                >
                  +{yardsGained} YDS
                </span>
              </div>
            </motion.div>
          </div>
          
        </motion.div>
        
        {/* TOUCHDOWN text - above the card, separate element for proper centering */}
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.1 }}
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + clamp(20px, 5vh, 60px))',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 'clamp(2.5rem, 11vw, 4rem)',
            fontWeight: 900,
            color: '#69BE28',
            letterSpacing: '-0.02em',
            textShadow: `
              0 0 40px rgba(105,190,40,0.8),
              0 0 80px rgba(105,190,40,0.5),
              0 4px 0 #3d7a16
            `,
            padding: '0 20px',
          }}
        >
          TOUCHDOWN
        </motion.div>
        
        {/* === FOOTER: Sponsor + CTA === */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
          style={{ 
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            gap: '16px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {/* Sponsor */}
          <div className="flex flex-col items-center" style={{ gap: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              POWERED BY
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={DRINKSIP_LOGO}
              alt="DrinkSip"
              style={{ height: '44px', width: 'auto', opacity: 0.9 }}
            />
          </div>
          
          {/* Continue Button */}
          <AnimatePresence>
            {phase === 'ready' && (
              <motion.button
                initial={{ y: 30, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                whileTap={{ scale: 0.96 }}
                onClick={onComplete}
                style={{
                  width: 'calc(100% - 48px)',
                  maxWidth: '340px',
                  padding: '18px 32px',
                  fontFamily: 'Arial Black, Impact, sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4a8f1d 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  boxShadow: `
                    0 0 30px rgba(105,190,40,0.5),
                    0 8px 32px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.2)
                  `,
                }}
              >
                CONTINUE
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* === CINEMATIC PARTICLES === */}
      <CinematicParticles />
    </motion.div>
  )
})

// ============================================================================
// CINEMATIC PARTICLES - Subtle floating orbs like commercial
// ============================================================================
const CinematicParticles = memo(function CinematicParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      startY: 100 + Math.random() * 20,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3,
      size: 2 + Math.random() * 4,
      drift: (Math.random() - 0.5) * 60,
    })),
  [])
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: `-${p.startY}%`,
            width: p.size,
            height: p.size,
            background: '#69BE28',
            boxShadow: `0 0 ${p.size * 3}px rgba(105,190,40,0.8)`,
          }}
          animate={{
            y: [0, -800],
            x: [0, p.drift],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
})
