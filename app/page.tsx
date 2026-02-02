'use client'

/**
 * Home Page - Nike-level design using design system tokens
 * 
 * Layout: 3-zone flex (sponsor / title / actions)
 * Typography: CSS clamp for fluid scaling
 * Spacing: 8px grid via CSS custom properties
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GradientButton } from '@/components/ui/GradientButton'
import { SoundtrackPlayer } from '@/components/ui/SoundtrackPlayer'
import { AudioManager } from '@/src/game/systems/AudioManager'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useSoundtrackStore } from '@/src/store/soundtrackStore'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const MapIcon = () => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const musicEnabled = useSoundtrackStore((state) => state.musicEnabled)

  useEffect(() => {
    setMounted(true)
    AudioManager.init()
    SoundtrackManager.init()
    
    const handleInteraction = () => {
      AudioManager.unlock()
      if (musicEnabled) {
        SoundtrackManager.playForScreen('home')
        useSoundtrackStore.getState().setPlayerView('mini')
      }
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
    
    if (!AudioManager.isReady()) {
      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
    } else if (musicEnabled) {
      SoundtrackManager.playForScreen('home')
      const currentView = useSoundtrackStore.getState().playerView
      if (currentView === 'hidden') {
        useSoundtrackStore.getState().setPlayerView('mini')
      }
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [musicEnabled])

  return (
    <div className="fixed inset-0" style={{ background: 'var(--seahawks-navy-dark)' }}>
      {/* Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.65}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0"
          style={{ 
            height: '40%',
            background: 'linear-gradient(180deg, rgba(0,10,20,0.9) 0%, rgba(0,10,20,0.5) 40%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{ 
            height: '55%',
            background: 'linear-gradient(0deg, rgba(0,10,20,0.95) 0%, rgba(0,10,20,0.6) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 h-full w-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* === ZONE 1: Sponsor (fixed height) === */}
        <header 
          className="flex-shrink-0 flex flex-col items-center justify-center"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-10))',
            paddingLeft: 'var(--space-8)',
            paddingRight: 'var(--space-8)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
            transition={{ ...spring, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
              alt="DrinkSip"
              style={{ height: 'clamp(56px, 12vw, 80px)', width: 'auto' }}
            />
            <span 
              style={{ 
                marginTop: 'var(--space-2)',
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: 'rgba(255, 215, 0, 0.55)',
              }}
            >
              Presents
            </span>
          </motion.div>
        </header>

        {/* === ZONE 2: Hero Title (flex-1 to center) === */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.2 }}
          >
            {/* Main Title */}
            <h1 
              className="font-display"
              style={{ 
                fontSize: 'clamp(3.5rem, 17vw, 7rem)',
                letterSpacing: '0.01em',
                lineHeight: 0.9,
                background: 'linear-gradient(180deg, #FFFFFF 20%, var(--seahawks-green) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 50px rgba(105, 190, 40, 0.45))',
              }}
            >
              DARK SIDE
            </h1>

            {/* FOOTBALL - Tight to title */}
            <p
              className="font-display"
              style={{
                marginTop: '2px',
                fontSize: 'clamp(1.25rem, 6vw, 2rem)',
                letterSpacing: '0.35em',
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              FOOTBALL
            </p>

            {/* Tagline */}
            <p
              style={{
                marginTop: 'var(--space-5)',
                fontSize: '10px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              Built for the 12&apos;s
            </p>
          </motion.div>
        </main>

        {/* === ZONE 3: Actions (fixed height) === */}
        <footer
          className="flex-shrink-0"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--space-24))',
            paddingLeft: 'var(--space-6)',
            paddingRight: 'var(--space-6)',
          }}
        >
          <motion.div
            style={{ maxWidth: 'var(--container-sm)', margin: '0 auto' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            {/* Primary CTA - Road to Super Bowl */}
            <Link href="/campaign" className="block">
              <GradientButton size="lg" fullWidth radius="lg" icon={<MapIcon />} iconPosition="left">
                Road to Super Bowl
              </GradientButton>
            </Link>

            {/* Disclaimer */}
            <p 
              className="text-center"
              style={{ 
                marginTop: 'var(--space-6)',
                fontSize: '8px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              Not affiliated with Seattle Seahawks or NFL
            </p>
          </motion.div>
        </footer>
      </motion.div>

      {/* Soundtrack Player */}
      <SoundtrackPlayer />
    </div>
  )
}
