'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// PLAYER DATA - With multi-angle 3D support
// ============================================================================

interface PlayerData {
  jersey: number
  name: string
  position: string
  stats: Record<string, number>
  // Multi-angle images for 3D rotation effect
  imageFront: string
  imageLeft?: string
  imageRight?: string
}

// Animated video background - billowing smoke, no logo, more motion
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'

// ALL 11 STARTERS - 2025 Stats (14-3, NFC Champions, Super Bowl LX Bound!)
const SELECTED_PLAYERS: PlayerData[] = [
  // DeMarcus Lawrence #0 - DE - PRO BOWL! 6 sacks, 3 FF, 2 FR TDs! (OG image with no BG)
  { 
    jersey: 0, 
    name: 'DeMarcus Lawrence', 
    position: 'DE', 
    stats: { tackles: 53, sacks: 6, forcedFumbles: 3 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/332d7473-6c1f-4bb8-b05f-3153ead9f23e/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_332d7473-6c1f-4bb8-b05f-3153ead9f23e_0.png',
  },
  // Leonard Williams #99 - DT - PRO BOWL, AP-2! 7 sacks
  { 
    jersey: 99, 
    name: 'Leonard Williams', 
    position: 'DT', 
    stats: { tackles: 62, sacks: 7, qbHits: 22 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/140da1c5-350a-435a-9020-e0dcb37e5bd3/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_140da1c5-350a-435a-9020-e0dcb37e5bd3_0.png' 
  },
  // Byron Murphy II #91 - DT - 7 sacks!
  { 
    jersey: 91, 
    name: 'Byron Murphy II', 
    position: 'DT', 
    stats: { tackles: 62, sacks: 7, qbHits: 13 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/8e36992d-ac71-49b5-b3ad-7b1b2c8c6278/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_8e36992d-ac71-49b5-b3ad-7b1b2c8c6278_0.png' 
  },
  // Derick Hall #58 - EDGE
  { 
    jersey: 58, 
    name: 'Derick Hall', 
    position: 'EDGE', 
    stats: { tackles: 30, sacks: 2, qbHits: 13 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/9d86de1b-8b70-4cab-a879-0fea0e2e5880/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_9d86de1b-8b70-4cab-a879-0fea0e2e5880_0.png' 
  },
  // Uchenna Nwosu #7 - OLB - 7 sacks!
  { 
    jersey: 7, 
    name: 'Uchenna Nwosu', 
    position: 'OLB', 
    stats: { tackles: 35, sacks: 7, qbHits: 15 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/5e219974-5422-4683-ac72-ffb5b321819c/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_5e219974-5422-4683-ac72-ffb5b321819c_0.png' 
  },
  // Ernest Jones IV #13 - MLB - AP-2! 126 tackles, 5 INTs, 1 Pick-6!
  { 
    jersey: 13, 
    name: 'Ernest Jones IV', 
    position: 'MLB', 
    stats: { tackles: 126, interceptions: 5, passDefended: 7 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/f982ec62-3c44-4672-adf4-b1dbeb228012/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_f982ec62-3c44-4672-adf4-b1dbeb228012_0.png' 
  },
  // Drake Thomas #42 - LB - 96 tackles, 3.5 sacks!
  { 
    jersey: 42, 
    name: 'Drake Thomas', 
    position: 'LB', 
    stats: { tackles: 96, sacks: 3.5, tfl: 10 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/d2833c29-06cf-43b8-a66f-d90d72a09c51/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_d2833c29-06cf-43b8-a66f-d90d72a09c51_0.png' 
  },
  // Devon Witherspoon #21 - CB - PRO BOWL, AP-2!
  { 
    jersey: 21, 
    name: 'Devon Witherspoon', 
    position: 'CB', 
    stats: { tackles: 72, interceptions: 1, passDefended: 7 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/df5df5a0-9f26-463f-a540-bf0e2fd20f83/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_df5df5a0-9f26-463f-a540-bf0e2fd20f83_0.png' 
  },
  // Josh Jobe #29 - CB - 12 PD!
  { 
    jersey: 29, 
    name: 'Josh Jobe', 
    position: 'CB', 
    stats: { tackles: 54, interceptions: 1, passDefended: 12 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/89892bc5-c800-4790-95aa-e7a50a4cc1b6/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_89892bc5-c800-4790-95aa-e7a50a4cc1b6_0.png' 
  },
  // Julian Love #20 - S
  { 
    jersey: 20, 
    name: 'Julian Love', 
    position: 'S', 
    stats: { tackles: 34, interceptions: 1, passDefended: 6 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4cf6ca19-acc7-43ac-ab46-893692b85a36/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_4cf6ca19-acc7-43ac-ab46-893692b85a36_0.png' 
  },
  // Coby Bryant #8 - S - 4 INTs!
  { 
    jersey: 8, 
    name: 'Coby Bryant', 
    position: 'S', 
    stats: { tackles: 66, interceptions: 4, passDefended: 7 }, 
    imageFront: 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/10d006eb-a852-43cc-acc2-748cefc882bc/variations/Default_Photorealistic_3D_render_of_NFL_football_player_Seattl_0_10d006eb-a852-43cc-acc2-748cefc882bc_0.png' 
  },
]

// ============================================================================
// 3D MOCKUP COMPONENT
// ============================================================================

export default function MockupPage() {
  const [index, setIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const playerImageRef = useRef<HTMLDivElement>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  
  // Use refs for smooth animation without re-renders
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const animationRef = useRef<number>(0)
  const isTouching = useRef(false)

  // Force video play on mobile - needs user interaction
  useEffect(() => {
    const playVideo = () => {
      if (videoRef.current && !videoPlaying) {
        videoRef.current.play().then(() => {
          setVideoPlaying(true)
        }).catch(() => {
          // Autoplay blocked, will play on next touch
        })
      }
    }
    
    // Try to play immediately
    playVideo()
    
    // Also play on any touch/click
    const handleInteraction = () => playVideo()
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('click', handleInteraction, { once: true })
    
    return () => {
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('click', handleInteraction)
    }
  }, [videoPlaying])

  const player = SELECTED_PLAYERS[index]
  const nameParts = player.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Handle navigation
  const go = useCallback((dir: 1 | -1) => {
    if (transitioning) return
    setTransitioning(true)
    setIndex((i) => (i + dir + SELECTED_PLAYERS.length) % SELECTED_PLAYERS.length)
    setTimeout(() => setTransitioning(false), 600)
  }, [transitioning])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    addEventListener('keydown', handler)
    return () => removeEventListener('keydown', handler)
  }, [go])

  // Buttery smooth touch/mouse tracking with RAF and lerp
  useEffect(() => {
    let cachedRect: DOMRect | null = null
    
    // Lerp function for smooth interpolation
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }
    
    // Apply transforms directly to DOM (no React re-renders)
    const applyTransforms = () => {
      // Smooth interpolation - faster when touching, slower spring-back
      const lerpFactor = isTouching.current ? 0.15 : 0.08
      
      currentX.current = lerp(currentX.current, targetX.current, lerpFactor)
      currentY.current = lerp(currentY.current, targetY.current, lerpFactor)
      
      // Calculate transforms
      const rotateY = currentX.current * 8
      const rotateX = -currentY.current * 5
      const translateX = currentX.current * 15
      const translateY = currentY.current * 10
      const innerTranslateX = currentX.current * 10
      
      // Apply to player container
      if (playerContainerRef.current) {
        playerContainerRef.current.style.transform = `
          rotateY(${rotateY}deg) 
          rotateX(${rotateX}deg) 
          translateX(${translateX}px) 
          translateY(${translateY}px)
        `
      }
      
      // Apply parallax to inner image
      if (playerImageRef.current) {
        playerImageRef.current.style.transform = `translateZ(50px) translateX(${innerTranslateX}px)`
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(applyTransforms)
    }
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(applyTransforms)
    
    const updatePosition = (clientX: number, clientY: number) => {
      if (!cachedRect) {
        cachedRect = containerRef.current?.getBoundingClientRect() || null
      }
      if (!cachedRect) return
      
      // Calculate position relative to center (-1 to 1)
      targetX.current = ((clientX - cachedRect.left) / cachedRect.width - 0.5) * 2
      targetY.current = ((clientY - cachedRect.top) / cachedRect.height - 0.5) * 2
    }

    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true
      cachedRect = containerRef.current?.getBoundingClientRect() || null
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    
    const handleTouchEnd = () => {
      isTouching.current = false
      targetX.current = 0
      targetY.current = 0
      cachedRect = null
    }

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY)
    }

    const handleMouseLeave = () => {
      targetX.current = 0
      targetY.current = 0
      cachedRect = null
    }
    
    // Recache rect on resize
    const handleResize = () => {
      cachedRect = null
    }

    const container = containerRef.current
    if (container) {
      // Touch events with passive: false for smooth handling
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: true })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true })
      
      // Mouse events
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


  return (
    <main 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden cursor-default select-none"
      style={{ perspective: '1200px', touchAction: 'none' }}
    >
      
      {/* ===== LAYER 1: ANIMATED VIDEO BACKGROUND ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Looping video background with fog and lights animation */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ transform: 'scale(1.1)' }}
          poster="https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg"
        >
          <source src={BACKGROUND_VIDEO} type="video/mp4" />
        </video>
        
        {/* Overlay for depth and lighting effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Pulsing spotlight glow */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] opacity-20"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(105,190,40,0.5) 0%, transparent 70%)',
              animation: 'pulseLight 4s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* ===== LAYER 2: 3D PLAYER ===== */}
      <div 
        ref={playerContainerRef}
        className={`absolute inset-0 flex items-end justify-center pb-28 ${
          transitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          touchAction: 'none',
          transition: transitioning ? 'opacity 0.4s ease-out' : 'none',
        }}
      >
        {/* Player shadow on ground */}
        <div 
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[50%] h-[15%] rounded-full opacity-50 blur-xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.9) 0%, transparent 70%)',
          }}
        />
        
        {/* Player image with smooth fade transition between players */}
        <div 
          ref={playerImageRef}
          className="relative w-full max-w-[550px] h-[85vh]"
          style={{ 
            willChange: 'transform',
          }}
        >
          <img
            key={player.jersey}
            src={player.imageFront}
            alt={player.name}
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 40px rgba(105,190,40,0.4)) drop-shadow(0 20px 50px rgba(0,0,0,0.6))',
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? 'scale(0.95) translateY(20px)' : 'scale(1) translateY(0)',
              transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* ===== LAYER 3: UI OVERLAY ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top gradient for text readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        
        {/* Bottom gradient for controls */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* ===== LAYER 4: UI CONTENT ===== */}
      <div className="relative z-20 h-full flex flex-col justify-between px-6 py-8 safe-area">

        {/* --- HEADER --- */}
        <div className="text-center">
          <p className="text-[#69BE28] text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
            Choose Your Defender
          </p>
          <p className="text-white/30 text-[8px] uppercase tracking-widest mt-1">
            Move your finger to rotate
          </p>
        </div>

        {/* --- JERSEY NUMBER (floating) --- */}
        <div 
          className={`absolute top-1/4 left-6 transition-all duration-500 ${
            transitioning ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
          }`}
        >
          <span 
            className="text-8xl font-black text-white/10"
            style={{ 
              WebkitTextStroke: '2px rgba(105,190,40,0.3)',
              textShadow: '0 0 60px rgba(105,190,40,0.2)',
            }}
          >
            #{player.jersey}
          </span>
        </div>

        {/* --- SPACER --- */}
        <div className="flex-1" />

        {/* --- PLAYER INFO --- */}
        <div 
          className={`mb-6 transition-all duration-500 delay-100 ${
            transitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Position chip - matches button style */}
          <div className="mb-4">
            <span 
              className="inline-flex items-center justify-center px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-black min-w-[56px] relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                boxShadow: '0 4px 16px rgba(105,190,40,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              {player.position}
            </span>
          </div>

          {/* Name with 3D effect */}
          <h1 className="text-white text-3xl font-black uppercase leading-none tracking-tight drop-shadow-lg">
            {firstName}
          </h1>
          <h1 
            className="text-5xl font-black uppercase leading-none tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #69BE28 0%, #7ed957 50%, #69BE28 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(105,190,40,0.4)',
            }}
          >
            {lastName}
          </h1>

          {/* Stats with glow */}
          <div className="flex gap-8 mt-5">
            {Object.entries(player.stats).slice(0, 3).map(([key, val]) => (
              <div key={key} className="text-center">
                <div 
                  className="text-white text-3xl font-black"
                  style={{ textShadow: '0 0 20px rgba(105,190,40,0.5)' }}
                >
                  {val}
                </div>
                <div className="text-[#69BE28]/60 text-[9px] uppercase tracking-wider font-bold">
                  {key === 'forcedFumbles' ? 'FF' : 
                   key === 'interceptions' ? 'INT' : 
                   key === 'passDefended' ? 'PD' :
                   key === 'qbHits' ? 'QB HITS' :
                   key === 'tfl' ? 'TFL' :
                   key.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- NAVIGATION ARROWS --- */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
          <button
            onClick={() => go(-1)}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-[#69BE28]/30 flex items-center justify-center active:bg-[#69BE28]/30 active:scale-90 transition-all hover:border-[#69BE28]/60"
          >
            <svg className="w-5 h-5 text-[#69BE28]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
          <button
            onClick={() => go(1)}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-[#69BE28]/30 flex items-center justify-center active:bg-[#69BE28]/30 active:scale-90 transition-all hover:border-[#69BE28]/60"
          >
            <svg className="w-5 h-5 text-[#69BE28]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* --- BOTTOM CONTROLS --- */}
        <div className="flex flex-col items-center gap-5 pointer-events-auto">

          {/* Player dots */}
          <div className="flex gap-2">
            {SELECTED_PLAYERS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!transitioning && i !== index) {
                    setTransitioning(true)
                    setIndex(i)
                    setTimeout(() => setTransitioning(false), 600)
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-10 bg-[#69BE28] shadow-lg shadow-[#69BE28]/50'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Select Button with glow */}
          <button 
            className="w-full max-w-[300px] h-16 rounded-full flex items-center justify-center gap-3 active:scale-[0.97] transition-all relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
              boxShadow: '0 8px 32px rgba(105,190,40,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Shine effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                animation: 'shine 2s infinite',
              }}
            />
            <span className="text-black font-black text-base uppercase tracking-wide relative z-10">
              Select {lastName || firstName}
            </span>
            <svg className="w-5 h-5 text-black relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Counter */}
          <p className="text-white/30 text-[9px] uppercase tracking-[0.2em]">
            {index + 1} of {SELECTED_PLAYERS.length} Defenders
          </p>

        </div>

      </div>

      {/* ===== ANIMATIONS ===== */}
      <style jsx>{`
        @keyframes pulseLight {
          0%, 100% { opacity: 0.2; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.4; transform: translateX(-50%) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        @keyframes driftBg {
          0%, 100% { transform: scale(1.1) translateX(-0.5%) translateY(-0.5%); }
          50% { transform: scale(1.1) translateX(0.5%) translateY(0.5%); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .safe-area {
          padding-top: max(2rem, env(safe-area-inset-top));
          padding-bottom: max(2rem, env(safe-area-inset-bottom));
          padding-left: max(1.5rem, env(safe-area-inset-left));
          padding-right: max(1.5rem, env(safe-area-inset-right));
        }
      `}</style>

    </main>
  )
}
