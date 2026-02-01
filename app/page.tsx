'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { SoundtrackPlayer } from '@/components/ui/SoundtrackPlayer'
import { AudioManager } from '@/src/game/systems/AudioManager'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useSoundtrackStore } from '@/src/store/soundtrackStore'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

const CampaignIcon = () => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)

const PlayIcon = () => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const musicEnabled = useSoundtrackStore((state) => state.musicEnabled)

  useEffect(() => {
    setMounted(true)
    
    // Initialize audio system early
    AudioManager.init()
    SoundtrackManager.init()
    
    // Set up global audio unlock on first user interaction
    const handleInteraction = () => {
      AudioManager.unlock()
      // Start home screen music after first interaction (browser autoplay policy)
      if (musicEnabled) {
        SoundtrackManager.playForScreen('home')
        // Show mini player
        useSoundtrackStore.getState().setPlayerView('mini')
      }
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
    
    if (!AudioManager.isReady()) {
      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
    } else if (musicEnabled) {
      // Audio already unlocked, start music immediately
      SoundtrackManager.playForScreen('home')
      // Ensure mini player is visible
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
    <div className="fixed inset-0 bg-[#002244]">
      {/* Background Layer */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.55}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute top-0 left-0 right-0 h-[200px]"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-[400px]"
          style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)' }}
        />
      </div>

      {/* Content - Simple flexbox, vertically distributed */}
      <motion.div 
        className="relative z-10 h-full w-full flex flex-col justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        {/* ============ TOP: Branding ============ */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
          transition={{ ...spring, delay: 0.1 }}
        >
          {/* Logo */}
          <div 
            className="inline-flex items-center justify-center w-[80px] h-[80px] rounded-[20px]"
            style={{ 
              background: 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)',
              boxShadow: '0 12px 40px rgba(105,190,40,0.4)',
            }}
          >
            <div 
              className="w-[72px] h-[72px] rounded-[16px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #002244 0%, #001428 100%)' }}
            >
              <span 
                className="text-[44px] font-black text-white leading-none"
                style={{ 
                  fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                  textShadow: '0 2px 16px rgba(105,190,40,0.6)',
                }}
              >
                12
              </span>
            </div>
          </div>

          {/* Title - 32px below logo */}
          <div style={{ marginTop: '32px' }}>
            <h1 style={{ fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif' }}>
              <span 
                className="block text-[56px] leading-[0.9] tracking-tight"
                style={{ 
                  background: 'linear-gradient(135deg, #69BE28 0%, #8BD44A 50%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 24px rgba(105,190,40,0.35))',
                }}
              >
                DARK SIDE
              </span>
              <span 
                className="block text-[36px] text-white leading-none tracking-[0.2em]"
                style={{ marginTop: '8px' }}
              >
                GAME
              </span>
            </h1>

            {/* Tagline - 16px below title */}
            <p 
              className="text-[13px] italic tracking-[0.2em] uppercase"
              style={{ color: 'rgba(165,172,175,0.5)', marginTop: '16px' }}
            >
              &ldquo;Turn the lights off on them&rdquo;
            </p>
          </div>
        </motion.div>

        {/* ============ MIDDLE: Actions ============ */}
        <motion.div 
          className="w-full"
          style={{ maxWidth: '340px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.25 }}
        >
          {/* Primary Game Buttons */}
          <Link href="/campaign" style={{ display: 'block' }}>
            <GradientButton size="lg" fullWidth radius="lg" icon={<CampaignIcon />} iconPosition="left">
              Road to Super Bowl
            </GradientButton>
          </Link>

          <div style={{ height: '16px' }} />

          <Link href="/play" style={{ display: 'block' }}>
            <GhostButton size="lg" fullWidth radius="lg" variant="green" icon={<PlayIcon />} iconPosition="left">
              Endless Mode
            </GhostButton>
          </Link>

          {/* Settings - separated by 24px */}
          <div style={{ height: '24px' }} />

          <Link href="/settings" style={{ display: 'block' }}>
            <GhostButton size="md" fullWidth radius="lg" variant="subtle" icon={<SettingsIcon />} iconPosition="left">
              Settings
            </GhostButton>
          </Link>

          {/* How to Play - 40px below buttons */}
          <div 
            className="flex justify-center items-start"
            style={{ marginTop: '40px', gap: '48px' }}
          >
            {[
              { num: '1', label: 'Pick' },
              { num: '2', label: 'Drag' },
              { num: '3', label: 'Defend' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[14px] font-bold"
                  style={{ 
                    background: 'rgba(105,190,40,0.12)',
                    border: '1.5px solid rgba(105,190,40,0.3)',
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald), sans-serif',
                  }}
                >
                  {step.num}
                </div>
                <span 
                  className="text-[10px] font-medium tracking-widest uppercase"
                  style={{ color: 'rgba(165,172,175,0.45)', marginTop: '8px' }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ============ BOTTOM: Sponsor & Legal ============ */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ ...spring, delay: 0.4 }}
        >
          {/* Sponsor */}
          <div>
            <span 
              className="block text-[10px] tracking-[0.3em] uppercase"
              style={{ color: 'rgba(255,215,0,0.4)' }}
            >
              Powered by
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://cdn.shopify.com/s/files/1/0407/8580/5468/files/DrinkSip_Logo_SVG.svg?v=1759624477"
              alt="DrinkSip"
              style={{ height: '48px', width: 'auto', margin: '12px auto 0', opacity: 0.85 }}
            />
          </div>

          {/* Legal - 32px below sponsor, with room for mini player */}
          <p 
            className="text-[8px] tracking-widest uppercase"
            style={{ color: 'rgba(165,172,175,0.2)', marginTop: '32px', marginBottom: '80px' }}
          >
            Not affiliated with Seattle Seahawks or NFL
          </p>
        </motion.div>
      </motion.div>

      {/* Soundtrack Player - slim bar at very bottom */}
      <SoundtrackPlayer />
    </div>
  )
}
