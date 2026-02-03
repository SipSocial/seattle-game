'use client'

/**
 * PlayerSelect - Single-step player selection
 * 
 * Shows only offense OR defense players based on gameMode prop.
 * Simplified from the two-step selection to work with the new flow
 * where game type is selected on the homepage.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GradientButton } from '@/components/ui/GradientButton'
import { PositionChip } from '@/components/ui/PositionChip'
import { StatDisplay } from '@/components/ui/StatDisplay'
import { NavigationArrows } from '@/components/ui/NavigationArrows'
import { DotIndicator } from '@/components/ui/DotIndicator'
import { useAudioUnlock } from '../hooks/useAudio'
import { AudioManager } from '@/src/game/systems/AudioManager'
import { OFFENSE_PLAYERS, DEFENSE_PLAYERS, type PlayerData } from '@/src/game/data/playerRosters'

// ============================================================================
// CONSTANTS
// ============================================================================

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Spring config for buttery smooth animations
const smoothSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
}

const fastSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
  mass: 0.8,
}

// ============================================================================
// TYPES
// ============================================================================

interface PlayerSelectProps {
  gameMode: 'qb' | 'defense'
  onSelect: (jersey: number) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PlayerSelect({ gameMode, onSelect }: PlayerSelectProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerImageRef = useRef<HTMLDivElement>(null)
  
  const ensureAudioUnlocked = useAudioUnlock()

  // Smooth animation refs
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const animationRef = useRef<number>(0)
  const isTouching = useRef(false)

  // Get roster based on game mode
  const players = gameMode === 'qb' ? OFFENSE_PLAYERS : DEFENSE_PLAYERS
  const player = players[index]
  const nameParts = player?.name.split(' ') || ['']
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Mode-specific labels
  const modeLabel = gameMode === 'qb' 
    ? 'Select Your Offensive Weapon' 
    : 'Select Your Defensive Beast'
  const buttonText = `Play as ${lastName || firstName}`
  const modeColor = gameMode === 'qb' ? '#69BE28' : '#FFD700'

  // Preload images
  useEffect(() => {
    let mounted = true
    setImagesLoaded(false)
    
    const imagePromises = players.map((p) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = p.imageFront
      })
    })

    Promise.all(imagePromises).then(() => {
      if (mounted) setImagesLoaded(true)
    })

    const timeout = setTimeout(() => {
      if (mounted) setImagesLoaded(true)
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [players])

  // Navigation
  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setIndex((i) => (i + dir + players.length) % players.length)
    try {
      AudioManager.playPlayerSwipe()
    } catch (e) {
      // Audio not ready
    }
  }, [players.length])

  // Handle selection
  const handleSelect = useCallback(async () => {
    await ensureAudioUnlocked()
    AudioManager.playPlayerSelect()
    
    if (navigator.vibrate) navigator.vibrate([50, 30, 100])
    
    const selectedJersey = players[index].jersey
    setIsExiting(true)
    
    setTimeout(() => {
      onSelect(selectedJersey)
    }, 200)
  }, [index, players, onSelect, ensureAudioUnlocked])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'Enter') handleSelect()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go, handleSelect])

  // 3D touch tracking
  useEffect(() => {
    let cachedRect: DOMRect | null = null
    
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor
    
    const applyTransforms = () => {
      const lerpFactor = isTouching.current ? 0.12 : 0.06
      currentX.current = lerp(currentX.current, targetX.current, lerpFactor)
      currentY.current = lerp(currentY.current, targetY.current, lerpFactor)
      
      const rotateY = currentX.current * 8
      const rotateX = -currentY.current * 5
      const translateX = currentX.current * 15
      const translateY = currentY.current * 10
      
      if (playerContainerRef.current) {
        playerContainerRef.current.style.transform = `
          rotateY(${rotateY}deg) 
          rotateX(${rotateX}deg) 
          translateX(${translateX}px) 
          translateY(${translateY}px)
        `
      }
      
      if (playerImageRef.current) {
        playerImageRef.current.style.transform = `translateZ(50px) translateX(${currentX.current * 10}px)`
      }
      
      animationRef.current = requestAnimationFrame(applyTransforms)
    }
    
    animationRef.current = requestAnimationFrame(applyTransforms)
    
    const updatePosition = (clientX: number, clientY: number) => {
      if (!cachedRect) cachedRect = containerRef.current?.getBoundingClientRect() || null
      if (!cachedRect) return
      targetX.current = ((clientX - cachedRect.left) / cachedRect.width - 0.5) * 2
      targetY.current = ((clientY - cachedRect.top) / cachedRect.height - 0.5) * 2
    }

    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true
      cachedRect = containerRef.current?.getBoundingClientRect() || null
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }
    
    const handleTouchEnd = () => {
      isTouching.current = false
      targetX.current = 0
      targetY.current = 0
      cachedRect = null
    }

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY)
    const handleMouseLeave = () => { targetX.current = 0; targetY.current = 0; cachedRect = null }
    const handleResize = () => { cachedRect = null }

    const container = containerRef.current
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: true })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true })
      container.addEventListener('mousemove', handleMouseMove, { passive: true })
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
        container.removeEventListener('touchcancel', handleTouchEnd)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // Slide variants
  const slideVariants = useMemo(() => ({
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
  }), [])

  if (!player) return null

  return (
    <motion.main 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ 
        perspective: '1200px', 
        touchAction: 'none',
        background: '#002244',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : (imagesLoaded ? 1 : 0.8) }}
      transition={{ duration: 0.3 }}
    >
      {/* Video Background */}
      <VideoBackground src={BACKGROUND_VIDEO} poster={BACKGROUND_POSTER} overlay={false} />

      {/* Premium Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div 
          className="absolute inset-x-0 top-0" 
          style={{ 
            height: '200px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' 
          }} 
        />
        <div 
          className="absolute inset-x-0 bottom-0" 
          style={{ 
            height: '450px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)' 
          }} 
        />
      </div>

      {/* 3D Player Container */}
      <div 
        ref={playerContainerRef}
        className="absolute inset-0 flex items-end justify-center"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          paddingBottom: '0',
        }}
      >
        {/* Ground Shadow */}
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 w-[60%] rounded-full blur-xl"
          style={{ 
            bottom: '8px',
            height: '50px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.9) 0%, transparent 70%)' 
          }}
          animate={{ opacity: imagesLoaded ? 0.8 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Player Image */}
        <div 
          ref={playerImageRef}
          className="relative w-full"
          style={{ 
            maxWidth: 'clamp(380px, 100vw, 600px)',
            height: '95vh',
            willChange: 'transform',
          }}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.img
              key={`${gameMode}-${player.jersey}`}
              src={player.imageFront}
              alt={player.name}
              className="absolute inset-x-0 bottom-0 w-full h-full object-contain object-bottom"
              style={{
                filter: `drop-shadow(0 0 60px ${modeColor}80) drop-shadow(0 25px 50px rgba(0,0,0,0.7))`,
              }}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={fastSpring}
              draggable={false}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* UI Layer */}
      <div 
        className="relative z-20 h-full flex flex-col"
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {/* Game Mode Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.1 }}
          className="flex justify-center"
          style={{ marginBottom: 'var(--space-3, 12px)' }}
        >
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${modeColor}20 0%, ${modeColor}10 100%)`,
              border: `1px solid ${modeColor}50`,
            }}
          >
            <div 
              style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: modeColor,
                boxShadow: `0 0 10px ${modeColor}`,
              }} 
            />
            <span 
              className="font-bold uppercase"
              style={{ 
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: modeColor,
              }}
            >
              {gameMode === 'qb' ? 'QB LEGEND' : 'DARK SIDE DEFENSE'}
            </span>
          </div>
        </motion.div>

        {/* Mode Label */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.15 }}
        >
          <p 
            className="font-bold uppercase"
            style={{ 
              fontSize: 'var(--text-caption, 11px)',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {modeLabel}
          </p>
        </motion.div>

        {/* Jersey Number (floating on left) */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={`jersey-${player.jersey}`}
            className="absolute left-4"
            style={{ top: '28%' }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 0.12, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={smoothSpring}
          >
            <span 
              className="font-black"
              style={{ 
                fontSize: 'clamp(64px, 15vw, 120px)',
                WebkitTextStroke: `2px ${modeColor}50`,
                color: 'transparent',
                textShadow: `0 0 80px ${modeColor}30`,
                fontFamily: 'var(--font-oswald), sans-serif',
              }}
            >
              #{player.jersey}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Player Info Card */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={`info-${player.jersey}`}
            className="text-center flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={smoothSpring}
            style={{ marginBottom: '8px' }}
          >
            {/* Position Chip */}
            <div style={{ marginBottom: '8px' }}>
              <PositionChip position={player.position} />
            </div>

            {/* Name */}
            <h1 
              className="uppercase leading-none"
              style={{ 
                fontFamily: 'var(--font-oswald), sans-serif',
                fontSize: 'clamp(1rem, 0.9rem + 1.5vw, 1.4rem)',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              {firstName}
            </h1>
            <h1 
              className="uppercase leading-none"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontSize: 'clamp(1.75rem, 1.5rem + 3vw, 2.5rem)',
                fontWeight: 900,
                marginTop: '2px',
                background: `linear-gradient(135deg, ${modeColor} 0%, ${gameMode === 'qb' ? '#7ed957' : '#FFE066'} 50%, ${modeColor} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.01em',
              }}
            >
              {lastName}
            </h1>

            {/* Stats Row */}
            <div 
              className="flex justify-center" 
              style={{ 
                gap: 'clamp(24px, 6vw, 40px)', 
                marginTop: '16px',
              }}
            >
              {Object.entries(player.stats).slice(0, 3).map(([key, val]) => (
                <StatDisplay key={key} value={val} label={key} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <NavigationArrows onPrev={() => go(-1)} onNext={() => go(1)} />

        {/* Bottom Controls */}
        <motion.div 
          className="flex flex-col items-center w-full"
          style={{ 
            gap: '12px',
            paddingBottom: '72px',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.2 }}
        >
          {/* Dot Indicator */}
          <DotIndicator 
            total={players.length} 
            current={index}
            onSelect={(i) => {
              if (i !== index) {
                setDirection(i > index ? 1 : -1)
                setIndex(i)
              }
            }}
          />

          {/* Main CTA Button */}
          <GradientButton 
            size="lg" 
            fullWidth 
            onClick={handleSelect}
            style={{ maxWidth: '320px' }}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            }
          >
            {buttonText}
          </GradientButton>
        </motion.div>
      </div>

      {/* Preload images */}
      <div className="hidden">
        {players.map((p) => (
          <img key={`${gameMode}-${p.jersey}`} src={p.imageFront} alt="" />
        ))}
      </div>
    </motion.main>
  )
}
