'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'

// Video background - billowing smoke, stadium lights
const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

// Buttery smooth spring config
const smoothSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Trigger animations after mount to prevent hydration jitter
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted ? 1 : 0 }}
      transition={{ duration: 0.3 }} 
      className="h-[100dvh] flex flex-col overflow-hidden relative"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Video Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.4}
      />

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* ===== HEADER ===== */}
        <header className="relative z-10 px-6 pt-[max(env(safe-area-inset-top),24px)] text-center">
          {/* 12 Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: mounted ? 1 : 0, opacity: mounted ? 1 : 0 }}
            transition={{ ...smoothSpring, delay: 0.1 }}
            className="inline-block mb-4"
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{ 
                background: 'linear-gradient(135deg, #69BE28 0%, #4A9A1C 100%)',
                boxShadow: '0 0 60px rgba(105,190,40,0.6), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <div 
                className="absolute inset-[3px] rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #002244 0%, #001a33 100%)' }}
              >
                <span 
                  className="text-4xl text-white font-black"
                  style={{ 
                    fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif',
                    textShadow: '0 2px 10px rgba(105,190,40,0.5)',
                  }}
                >
                  12
                </span>
              </div>
              {/* Pulse ring */}
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{ 
                  border: '2px solid rgba(105,190,40,0.4)',
                  animationDuration: '2s',
                }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...smoothSpring, delay: 0.15 }}
          >
            <h1 
              className="leading-[0.85] tracking-tight"
              style={{ fontFamily: 'var(--font-bebas), var(--font-oswald), sans-serif' }}
            >
              <span 
                className="block text-[clamp(4rem,18vw,6rem)]"
                style={{ 
                  background: 'linear-gradient(135deg, #69BE28 0%, #8BD44A 40%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 20px rgba(105,190,40,0.4))',
                }}
              >
                SEAHAWKS
              </span>
              <span 
                className="block text-[clamp(2.8rem,12vw,4rem)] text-white"
                style={{ letterSpacing: '0.15em' }}
              >
                DEFENSE
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: mounted ? 1 : 0 }}
              transition={{ ...smoothSpring, delay: 0.25 }}
              className="text-sm mt-3 italic tracking-widest"
              style={{ color: 'rgba(165,172,175,0.7)' }}
            >
              The Legion Lives On
            </motion.p>
          </motion.div>
        </header>

        {/* ===== SPACER ===== */}
        <div className="flex-1" />

        {/* ===== MAIN CONTENT ===== */}
        <section className="relative z-10 px-6 pb-6">
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...smoothSpring, delay: 0.3 }}
          >
            <GlassCard className="mb-6" padding="md">
              <div className="flex justify-around">
                {[
                  { value: '24', label: 'DEFENDERS', icon: '🛡️' },
                  { value: '17', label: 'OPPONENTS', icon: '🏈' },
                  { value: '∞', label: 'WAVES', icon: '🌊' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div 
                      className="text-2xl font-black"
                      style={{ 
                        color: '#69BE28', 
                        fontFamily: 'var(--font-oswald), sans-serif',
                        textShadow: '0 0 20px rgba(105,190,40,0.5)',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-[9px] tracking-wider font-medium"
                      style={{ color: 'rgba(165,172,175,0.5)' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Game Mode Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.95 }}
            transition={{ ...smoothSpring, delay: 0.35 }}
            className="space-y-3"
          >
            {/* Campaign Mode */}
            <Link href="/campaign" className="block">
              <GradientButton 
                size="lg" 
                fullWidth
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
                iconPosition="left"
              >
                Road to Super Bowl
              </GradientButton>
            </Link>

            {/* Endless Mode */}
            <Link href="/play" className="block">
              <GhostButton 
                size="lg" 
                fullWidth
                variant="green"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                iconPosition="left"
              >
                Endless Mode
              </GhostButton>
            </Link>
          </motion.div>

          {/* Quick Instructions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
            transition={{ ...smoothSpring, delay: 0.4 }}
            className="flex justify-center gap-8 mt-5"
          >
            {[
              { step: '1', text: 'Pick Defender' },
              { step: '2', text: 'Drag to Tackle' },
              { step: '3', text: 'Survive Waves' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    background: 'rgba(105,190,40,0.2)',
                    color: '#69BE28',
                    border: '1px solid rgba(105,190,40,0.3)',
                  }}
                >
                  {item.step}
                </div>
                <span className="text-[10px] font-medium" style={{ color: 'rgba(165,172,175,0.5)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer 
          className="relative z-10 px-6 py-4 text-center"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ ...smoothSpring, delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[9px] tracking-wider" style={{ color: 'rgba(165,172,175,0.3)' }}>
                POWERED BY
              </span>
              <span 
                className="text-xs font-bold"
                style={{ 
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                DrinkSip
              </span>
              <div className="flex gap-1">
                <span className="text-[10px]">🍺</span>
                <span className="text-[10px]">🍉</span>
                <span className="text-[10px]">🍋</span>
                <span className="text-[10px]">🍊</span>
              </div>
            </div>
            <p className="text-[8px]" style={{ color: 'rgba(165,172,175,0.2)' }}>
              Not affiliated with Seattle Seahawks or NFL • A fan tribute to the Legion of Boom
            </p>
          </motion.div>
        </footer>

      </div>
    </motion.main>
  )
}
