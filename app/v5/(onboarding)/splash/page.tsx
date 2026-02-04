'use client'

/**
 * Dark Side Football - Premium Game Entry Splash
 * 
 * TWO PHASES:
 * 1. ANIMATION PHASE: 60fps React animation (30 seconds) - native resolution
 * 2. CAPTURE PHASE: Immersive game-like entry experience
 * 
 * Design: Epic Games / Rockstar style - feels like entering a AAA game
 * 
 * V2: Uses live React + Framer Motion instead of compressed video
 *     for crystal-clear 60fps native resolution rendering
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Trophy } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load animation component for faster initial load
const SplashAnimation = dynamic(() => import('./SplashAnimation'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full"
          style={{
            border: '3px solid rgba(105, 190, 40, 0.2)',
            borderTopColor: '#69BE28',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '0.2em' }}>
          LOADING EXPERIENCE
        </p>
      </div>
    </div>
  ),
})

// === ASSETS ===
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'
const DRINKSHIP_LOGO = 'https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477'

// === ANIMATION CONFIG ===
const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }
const springHeavy = { type: 'spring' as const, stiffness: 200, damping: 22 }

// Stagger delays for epic reveal
const STAGGER = {
  logo: 0.3,
  title: 0.5,
  subtitle: 0.7,
  prize: 0.9,
  cta: 1.2,
  footer: 1.5,
}

type Phase = 'trailer' | 'capture'

export default function SplashPage() {
  const router = useRouter()
  const ambientRef = useRef<HTMLVideoElement>(null)
  
  const [phase, setPhase] = useState<Phase>('trailer')
  const [mounted, setMounted] = useState(false)
  const [muted, setMuted] = useState(true)

  // Initialize
  useEffect(() => {
    setMounted(true)
  }, [])

  // Ambient video for capture phase
  useEffect(() => {
    const video = ambientRef.current
    if (!video || phase !== 'capture') return
    video.play().catch(() => {
      video.muted = true
      video.play().catch(() => {})
    })
  }, [phase])

  const handleAnimationComplete = useCallback(() => {
    localStorage.setItem('darkside_trailer_seen', 'true')
    setPhase('capture')
  }, [])

  const handleSkip = useCallback(() => {
    localStorage.setItem('darkside_trailer_seen', 'true')
    setPhase('capture')
  }, [])

  const handleToggleMute = useCallback(() => {
    setMuted(prev => !prev)
  }, [])

  const handleEnterGiveaway = useCallback(() => {
    router.push('/v5/register')
  }, [router])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000' }}>
      <AnimatePresence mode="wait">
        {/* ============================================ */}
        {/* PHASE 1: ANIMATION - 60fps React Animation */}
        {/* Crystal clear, native resolution rendering */}
        {/* ============================================ */}
        {phase === 'trailer' && (
          <motion.div
            key="trailer"
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SplashAnimation
              onComplete={handleAnimationComplete}
              onSkip={handleSkip}
              muted={muted}
              onMuteToggle={handleToggleMute}
            />
          </motion.div>
        )}

        {/* ============================================ */}
        {/* PHASE 2: CAPTURE - Epic Game Entry */}
        {/* ============================================ */}
        {phase === 'capture' && (
          <motion.div
            key="capture"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Cinematic Background Video */}
            <video
              ref={ambientRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={BACKGROUND_POSTER}
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
            >
              <source src={BACKGROUND_VIDEO} type="video/mp4" />
            </video>

            {/* Heavy cinematic gradients */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
              <div className="absolute inset-x-0 top-0" style={{ height: '35%', background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }} />
              <div className="absolute inset-x-0 bottom-0" style={{ height: '60%', background: 'linear-gradient(0deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 40%, transparent 100%)' }} />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />
            </div>

            {/* Content - Three Zone Layout */}
            <motion.div 
              className="relative z-10 h-full w-full flex flex-col justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: mounted ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
                paddingLeft: '24px',
                paddingRight: '24px',
              }}
            >
              {/* TOP ZONE: Sponsor Branding - Clean layout */}
              <motion.header
                className="flex-shrink-0 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: STAGGER.logo }}
              >
                {/* Brought to you by DrinkSip */}
                <p style={{ 
                  fontSize: '9px', 
                  fontWeight: 500, 
                  letterSpacing: '0.2em', 
                  textTransform: 'uppercase', 
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '8px',
                }}>
                  Brought to you by
                </p>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={DRINKSHIP_LOGO}
                  alt="DrinkSip"
                  style={{ 
                    height: '48px', 
                    width: 'auto', 
                    margin: '0 auto', 
                    filter: 'drop-shadow(0 4px 16px rgba(255,215,0,0.25))',
                  }}
                />
              </motion.header>

              {/* MIDDLE ZONE: Hero Content */}
              <main className="flex-1 flex flex-col justify-center text-center" style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
                {/* Main Title - DARK SIDE */}
                <motion.h1
                  className="font-display"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ ...springHeavy, delay: STAGGER.title }}
                  style={{ 
                    fontSize: 'clamp(3.5rem, 18vw, 5.5rem)', 
                    letterSpacing: '0.02em', 
                    lineHeight: 0.85, 
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 40%, #69BE28 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent', 
                    filter: 'drop-shadow(0 6px 60px rgba(105,190,40,0.5))' 
                  }}
                >
                  DARK SIDE
                </motion.h1>

                <motion.p
                  className="font-display"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: STAGGER.subtitle }}
                  style={{ 
                    marginTop: '8px', 
                    fontSize: 'clamp(1rem, 5vw, 1.5rem)', 
                    letterSpacing: '0.3em', 
                    color: 'rgba(255,255,255,0.9)', 
                    textShadow: '0 2px 20px rgba(0,0,0,0.5)' 
                  }}
                >
                  THE VIDEO GAME
                </motion.p>

                {/* Prize Callout */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: STAGGER.prize }}
                  style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                >
                  <div 
                    style={{ 
                      width: '52px', 
                      height: '52px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.1) 100%)', 
                      border: '1px solid rgba(255,215,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trophy size={26} style={{ color: 'rgba(255,215,0,0.9)' }} />
                  </div>
                  <span style={{ 
                    fontSize: '15px', 
                    fontWeight: 700, 
                    letterSpacing: '0.12em', 
                    textTransform: 'uppercase', 
                    color: '#FFD700',
                  }}>
                    Win Big Game Tickets
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 400, 
                    letterSpacing: '0.1em', 
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    Drawing Saturday from San Francisco
                  </span>
                </motion.div>
              </main>

              {/* BOTTOM ZONE: CTA + Footer */}
              <motion.footer
                className="flex-shrink-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: STAGGER.cta }}
                style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}
              >
                {/* Main CTA Button - Premium Gold */}
                <motion.button
                  onClick={handleEnterGiveaway}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full overflow-hidden"
                  style={{
                    height: '56px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-oswald), sans-serif',
                    letterSpacing: '0.08em',
                    color: '#002244',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(255,215,0,0.4)',
                  }}
                >
                  {/* Shine sweep */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Play size={16} fill="currentColor" />
                    ENTER THE BIG GAME GIVEAWAY
                  </span>
                </motion.button>

                {/* Footer info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: STAGGER.footer, duration: 0.6 }}
                  style={{ marginTop: '16px', textAlign: 'center' }}
                >
                  <p style={{ 
                    fontSize: '10px', 
                    fontWeight: 400, 
                    letterSpacing: '0.1em', 
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    Free to play • Must be 21+ • Terms Apply
                  </p>
                  
                  {/* DeMarcus Lawrence credit - small and respectful */}
                  <p style={{ 
                    marginTop: '12px',
                    fontSize: '8px', 
                    fontWeight: 500, 
                    letterSpacing: '0.15em', 
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)',
                  }}>
                    DeMarcus Lawrence, Co-Founder
                  </p>
                </motion.div>
              </motion.footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
