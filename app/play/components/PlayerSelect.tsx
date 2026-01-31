'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GradientButton } from '@/components/ui/GradientButton'
import { PositionChip } from '@/components/ui/PositionChip'
import { StatDisplay } from '@/components/ui/StatDisplay'
import { NavigationArrows } from '@/components/ui/NavigationArrows'
import { DotIndicator } from '@/components/ui/DotIndicator'

// ============================================================================
// PLAYER DATA
// ============================================================================

interface PlayerData {
  jersey: number
  name: string
  position: string
  stats: Record<string, number>
  imageFront: string
}

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const PLAYERS: PlayerData[] = [
  { jersey: 0, name: 'DeMarcus Lawrence', position: 'DE', stats: { tackles: 53, sacks: 6, forcedFumbles: 3 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/332d7473-6c1f-4bb8-b05f-3153ead9f23e/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_332d7473-6c1f-4bb8-b05f-3153ead9f23e_0.png' },
  { jersey: 99, name: 'Leonard Williams', position: 'DT', stats: { tackles: 62, sacks: 7, qbHits: 22 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/140da1c5-350a-435a-9020-e0dcb37e5bd3/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_140da1c5-350a-435a-9020-e0dcb37e5bd3_0.png' },
  { jersey: 91, name: 'Byron Murphy II', position: 'DT', stats: { tackles: 62, sacks: 7, qbHits: 13 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e36992d-ac71-49b5-b3ad-7b1b2c8c6278/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_8e36992d-ac71-49b5-b3ad-7b1b2c8c6278_0.png' },
  { jersey: 58, name: 'Derick Hall', position: 'EDGE', stats: { tackles: 30, sacks: 2, qbHits: 13 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9d86de1b-8b70-4cab-a879-0fea0e2e5880/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_9d86de1b-8b70-4cab-a879-0fea0e2e5880_0.png' },
  { jersey: 7, name: 'Uchenna Nwosu', position: 'OLB', stats: { tackles: 35, sacks: 7, qbHits: 15 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5e219974-5422-4683-ac72-ffb5b321819c/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_5e219974-5422-4683-ac72-ffb5b321819c_0.png' },
  { jersey: 13, name: 'Ernest Jones IV', position: 'MLB', stats: { tackles: 126, interceptions: 5, passDefended: 7 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f982ec62-3c44-4672-adf4-b1dbeb228012/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_f982ec62-3c44-4672-adf4-b1dbeb228012_0.png' },
  { jersey: 42, name: 'Drake Thomas', position: 'LB', stats: { tackles: 96, sacks: 3.5, tfl: 10 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d2833c29-06cf-43b8-a66f-d90d72a09c51/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_d2833c29-06cf-43b8-a66f-d90d72a09c51_0.png' },
  { jersey: 21, name: 'Devon Witherspoon', position: 'CB', stats: { tackles: 72, interceptions: 1, passDefended: 7 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/df5df5a0-9f26-463f-a540-bf0e2fd20f83/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_df5df5a0-9f26-463f-a540-bf0e2fd20f83_0.png' },
  { jersey: 29, name: 'Josh Jobe', position: 'CB', stats: { tackles: 54, interceptions: 1, passDefended: 12 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/89892bc5-c800-4790-95aa-e7a50a4cc1b6/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_89892bc5-c800-4790-95aa-e7a50a4cc1b6_0.png' },
  { jersey: 20, name: 'Julian Love', position: 'S', stats: { tackles: 34, interceptions: 1, passDefended: 6 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4cf6ca19-acc7-43ac-ab46-893692b85a36/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_4cf6ca19-acc7-43ac-ab46-893692b85a36_0.png' },
  { jersey: 8, name: 'Coby Bryant', position: 'S', stats: { tackles: 66, interceptions: 4, passDefended: 7 }, imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/10d006eb-a852-43cc-acc2-748cefc882bc/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_10d006eb-a852-43cc-acc2-748cefc882bc_0.png' },
]

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
// COMPONENT
// ============================================================================

interface PlayerSelectProps {
  onSelect: (jersey: number) => void
}

export default function PlayerSelect({ onSelect }: PlayerSelectProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 left, 1 right, 0 initial
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerImageRef = useRef<HTMLDivElement>(null)

  // Smooth animation refs
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const animationRef = useRef<number>(0)
  const isTouching = useRef(false)

  const player = PLAYERS[index]
  const nameParts = player.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Preload all player images on mount
  useEffect(() => {
    let mounted = true
    const imagePromises = PLAYERS.map((p) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // Don't block on errors
        img.src = p.imageFront
      })
    })

    Promise.all(imagePromises).then(() => {
      if (mounted) setImagesLoaded(true)
    })

    // Set loaded after a max wait time to prevent indefinite loading
    const timeout = setTimeout(() => {
      if (mounted) setImagesLoaded(true)
    }, 3000)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [])

  // Navigation with direction tracking
  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir)
    setIndex((i) => (i + dir + PLAYERS.length) % PLAYERS.length)
  }, [])

  const handleSelect = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 100])
    setIsExiting(true)
    // Give time for exit animation
    setTimeout(() => {
      onSelect(PLAYERS[index].jersey)
    }, 200)
  }, [index, onSelect])

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

  // Buttery smooth 3D touch tracking with RAF
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

  // Slide variants for player switching
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

  // Exit animation for selecting
  const exitVariants = {
    initial: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1, transition: { duration: 0.2 } },
  }

  return (
    <motion.main 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ perspective: '1200px', touchAction: 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : (imagesLoaded ? 1 : 0.8) }}
      transition={{ duration: 0.3 }}
    >
      {/* Video Background */}
      <VideoBackground src={BACKGROUND_VIDEO} poster={BACKGROUND_POSTER} overlay={false} />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
      </div>

      {/* 3D Player Container */}
      <div 
        ref={playerContainerRef}
        className="absolute inset-0 flex items-end justify-center pb-32"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Shadow */}
        <motion.div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[50%] h-[15%] rounded-full blur-xl"
          style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.9) 0%, transparent 70%)' }}
          animate={{ opacity: imagesLoaded ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Player Image with smooth transitions */}
        <div 
          ref={playerImageRef}
          className="relative w-full max-w-[500px] h-[80vh]"
          style={{ willChange: 'transform' }}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.img
              key={player.jersey}
              src={player.imageFront}
              alt={player.name}
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(105,190,40,0.4)) drop-shadow(0 20px 50px rgba(0,0,0,0.6))',
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
      <div className="relative z-20 h-full flex flex-col px-6" style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}>
        
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.1 }}
        >
          <p className="text-[#69BE28] text-[10px] font-bold uppercase tracking-[0.3em]">
            Choose Your Defender
          </p>
          <p className="text-white/30 text-[8px] uppercase tracking-widest mt-1">
            Move your finger to rotate
          </p>
        </motion.div>

        {/* Jersey Number (floating) */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={`jersey-${player.jersey}`}
            className="absolute top-1/4 left-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 0.15, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={smoothSpring}
          >
            <span 
              className="text-8xl font-black"
              style={{ 
                WebkitTextStroke: '2px rgba(105,190,40,0.3)',
                color: 'transparent',
                textShadow: '0 0 60px rgba(105,190,40,0.2)',
              }}
            >
              #{player.jersey}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Player Info */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={`info-${player.jersey}`}
            className="mb-6 text-center flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={smoothSpring}
          >
            <div className="mb-8">
              <PositionChip position={player.position} />
            </div>

            <h1 className="text-white text-3xl font-black uppercase leading-none tracking-tight">
              {firstName}
            </h1>
            <h1 
              className="text-5xl font-black uppercase leading-none tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #69BE28 0%, #7ed957 50%, #69BE28 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {lastName}
            </h1>

            <div className="flex justify-center gap-8 mt-5">
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
          className="flex flex-col items-center gap-5 pb-6" 
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.2 }}
        >
          <DotIndicator 
            total={PLAYERS.length} 
            current={index}
            onSelect={(i) => {
              if (i !== index) {
                setDirection(i > index ? 1 : -1)
                setIndex(i)
              }
            }}
          />

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
            Select {lastName || firstName}
          </GradientButton>

          <p className="text-white/30 text-[9px] uppercase tracking-[0.2em]">
            {index + 1} of {PLAYERS.length} Defenders
          </p>
        </motion.div>
      </div>

      {/* Preload hidden images */}
      <div className="hidden">
        {PLAYERS.map((p) => (
          <img key={p.jersey} src={p.imageFront} alt="" />
        ))}
      </div>
    </motion.main>
  )
}
