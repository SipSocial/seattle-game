'use client'

/**
 * V5 Game Hub - World-class game selection
 * 
 * Design: Nike-level polish using production patterns from home page
 * Features:
 * - Entry counter badge
 * - Dark Side Defense (playable)
 * - QB Legend (locked until Saturday)
 * - Campaign progress
 * - Drawing countdown
 * 
 * IMPORTANT: Uses only primitive Zustand selectors to avoid infinite loops
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Shield, Lock, Map, Ticket, Clock } from 'lucide-react'
import { VideoBackground } from '@/components/ui/VideoBackground'
import { GlassCard } from '@/components/ui/GlassCard'
import { AudioManager } from '@/src/game/systems/AudioManager'
import { SoundtrackManager } from '@/src/game/systems/SoundtrackManager'
import { useGameStore } from '@/src/store/gameStore'
import { CAMPAIGN_STAGES, getDrawingCountdown } from '@/src/v5/store/v5GameStore'

const BACKGROUND_VIDEO = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/4b5f0ad3-9f4e-413f-b44a-053e9af6240c/4b5f0ad3-9f4e-413f-b44a-053e9af6240c.mp4'
const BACKGROUND_POSTER = 'https://cdn.leonardo.ai/users/eb9a23b8-36c0-4667-b97f-64fdee85d14b/generations/16412705-ca65-400e-bb78-80ff29be860a/segments/2:2:1/Phoenix_Empty_NFL_football_field_at_night_dramatic_billowing_s_0.jpg'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Check if QB game is unlocked (Saturday Feb 7, 2026)
function isQBUnlocked(): boolean {
  const unlockDate = new Date('2026-02-07T00:00:00-08:00')
  return new Date() >= unlockDate
}

// Shield icon for Dark Side Defense
const ShieldIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" />
  </svg>
)

// Football icon for QB Legend
const FootballIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="12" rx="10" ry="6" />
    <path d="M7 12h10M12 9v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export default function GameHubPage() {
  const [mounted, setMounted] = useState(false)
  const [drawingCountdown, setDrawingCountdown] = useState(() => getDrawingCountdown())
  const router = useRouter()
  
  // Use ONLY primitive selectors to avoid infinite loops
  const setPlayMode = useGameStore((state) => state.setPlayMode)
  const totalEntries = useGameStore((state) => state.campaign.totalEntries)
  const currentStageId = useGameStore((state) => state.campaign.currentStageId)
  const gamesWon = useGameStore((state) => state.campaign.gamesWon)
  const stageProgress = useGameStore((state) => state.campaign.stageProgress)
  
  const qbUnlocked = isQBUnlocked()
  
  // Memoize computed values
  const currentStage = useMemo(() => 
    CAMPAIGN_STAGES.find(s => s.id === currentStageId) || CAMPAIGN_STAGES[0],
    [currentStageId]
  )
  
  const completedCount = useMemo(() => {
    if (!stageProgress) return 0
    return Object.keys(stageProgress).filter(id => {
      const p = stageProgress[Number(id)]
      return p?.qbCompleted || p?.defenseCompleted
    }).length
  }, [stageProgress])
  
  const progressPercent = useMemo(() => 
    Math.round((completedCount / CAMPAIGN_STAGES.length) * 100),
    [completedCount]
  )
  
  // Update drawing countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDrawingCountdown(getDrawingCountdown())
    }, 60000)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    setMounted(true)
    AudioManager.init()
    SoundtrackManager.init()
    
    const handleInteraction = () => {
      AudioManager.unlock()
      SoundtrackManager.playForScreen('home')
    }
    
    if (!AudioManager.isReady()) {
      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [])
  
  // Handle game selection
  const handlePlayDefense = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15])
    }
    AudioManager.playConfirm()
    setPlayMode('defense')
    // Navigate to player select first
    router.push(`/v5/game/defense/select?weekId=${currentStageId}`)
  }, [setPlayMode, router, currentStageId])
  
  const handlePlayQB = useCallback(() => {
    if (!qbUnlocked) return
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15])
    }
    AudioManager.playConfirm()
    setPlayMode('qb')
    router.push(`/v5/game/qb?weekId=${currentStageId}`)
  }, [qbUnlocked, setPlayMode, router, currentStageId])
  
  const handleOpenMap = useCallback(() => {
    AudioManager.playMenuClick()
    router.push('/v5/game/map')
  }, [router])

  return (
    <div className="min-h-full" style={{ background: 'var(--seahawks-navy-dark, #002244)' }}>
      {/* Background */}
      <VideoBackground 
        src={BACKGROUND_VIDEO}
        poster={BACKGROUND_POSTER}
        overlay={true}
        overlayOpacity={0.75}
      />

      {/* Gradient overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0"
          style={{ 
            height: '30%',
            background: 'linear-gradient(180deg, rgba(0,10,20,0.95) 0%, transparent 100%)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0"
          style={{ 
            height: '40%',
            background: 'linear-gradient(0deg, rgba(0,10,20,0.95) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-6, 24px))',
          paddingBottom: 'var(--space-8, 32px)',
          paddingLeft: 'var(--space-5, 20px)',
          paddingRight: 'var(--space-5, 20px)',
        }}
      >
        <div style={{ maxWidth: 'var(--container-sm, 384px)', margin: '0 auto' }}>
          
          {/* Header with Entry Badge */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ marginBottom: 'var(--space-6, 24px)' }}
          >
            {/* Title */}
            <div>
              <h1 
                className="font-display"
                style={{ 
                  fontSize: 'clamp(1.75rem, 8vw, 2.5rem)',
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(180deg, #FFFFFF 20%, var(--seahawks-green, #69BE28) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                GAME HUB
              </h1>
              <p style={{ 
                fontSize: 'var(--text-micro, 10px)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                Road to The Big Game
              </p>
            </div>
            
            {/* Entry Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/v5/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2, 8px)',
                padding: 'var(--space-2, 8px) var(--space-4, 16px)',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
                border: '1px solid rgba(255,215,0,0.4)',
                cursor: 'pointer',
              }}
            >
              <Ticket className="w-4 h-4" style={{ color: '#FFD700' }} />
              <span style={{ 
                fontSize: 'var(--text-body, 14px)',
                fontWeight: 700,
                color: '#FFD700',
              }}>
                {totalEntries}
              </span>
            </motion.div>
          </motion.div>
          
          {/* Current Stage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.15 }}
            style={{ marginBottom: 'var(--space-5, 20px)' }}
          >
            <GlassCard variant="default" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-micro, 10px)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--seahawks-green, #69BE28)',
                    marginBottom: 'var(--space-1, 4px)',
                  }}>
                    {currentStage.weekLabel}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-subtitle, 18px)',
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                    {currentStage.location.isHome ? 'vs' : '@'} {currentStage.visuals.opponent.name.split(' ').pop()}
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-caption, 12px)',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 'var(--space-1, 4px)',
                  }}>
                    {currentStage.location.city}, {currentStage.location.state}
                  </p>
                </div>
                <motion.button
                  onClick={handleOpenMap}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2, 8px)',
                    padding: 'var(--space-2, 8px) var(--space-4, 16px)',
                    borderRadius: '12px',
                    background: 'rgba(105,190,40,0.15)',
                    border: '1px solid rgba(105,190,40,0.3)',
                    color: 'var(--seahawks-green, #69BE28)',
                    fontSize: 'var(--text-caption, 12px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Map className="w-4 h-4" />
                  Map
                </motion.button>
              </div>
              
              {/* Progress Bar */}
              <div style={{ marginTop: 'var(--space-4, 16px)' }}>
                <div className="flex justify-between" style={{ marginBottom: 'var(--space-1, 4px)' }}>
                  <span style={{ fontSize: 'var(--text-micro, 10px)', color: 'rgba(255,255,255,0.4)' }}>
                    Progress
                  </span>
                  <span style={{ fontSize: 'var(--text-micro, 10px)', color: 'rgba(255,255,255,0.6)' }}>
                    {completedCount} / {CAMPAIGN_STAGES.length}
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{
                      height: '100%',
                      borderRadius: '100px',
                      background: 'linear-gradient(90deg, var(--seahawks-green, #69BE28) 0%, #FFD700 100%)',
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
          
          {/* Game Mode Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 16px)' }}>
            
            {/* Dark Side Defense - PLAYABLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ ...spring, delay: 0.2 }}
            >
              <motion.button
                onClick={handlePlayDefense}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4, 16px)',
                  padding: 'var(--space-5, 20px)',
                  borderRadius: '20px',
                  border: '2px solid rgba(255,215,0,0.5)',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(0,34,68,0.9) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 8px 32px rgba(255,215,0,0.2)',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#002244',
                }}>
                  <Shield className="w-7 h-7" />
                </div>
                
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p className="font-display" style={{
                    fontSize: 'clamp(1.25rem, 6vw, 1.5rem)',
                    color: '#FFD700',
                    letterSpacing: '0.02em',
                  }}>
                    DARK SIDE DEFENSE
                  </p>
                  <p style={{
                    fontSize: 'var(--text-caption, 12px)',
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: 'var(--space-1, 4px)',
                  }}>
                    Stop the offense • Earn entries
                  </p>
                </div>
                
                {/* Play indicator */}
                <div style={{
                  padding: 'var(--space-2, 8px) var(--space-4, 16px)',
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#002244',
                  fontSize: 'var(--text-caption, 12px)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  PLAY
                </div>
              </motion.button>
            </motion.div>
            
            {/* QB Legend - LOCKED OR PLAYABLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
              transition={{ ...spring, delay: 0.25 }}
            >
              <motion.button
                onClick={handlePlayQB}
                whileHover={qbUnlocked ? { scale: 1.02 } : {}}
                whileTap={qbUnlocked ? { scale: 0.98 } : {}}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4, 16px)',
                  padding: 'var(--space-5, 20px)',
                  borderRadius: '20px',
                  border: qbUnlocked 
                    ? '2px solid rgba(105,190,40,0.5)'
                    : '2px solid rgba(255,255,255,0.15)',
                  background: qbUnlocked
                    ? 'linear-gradient(135deg, rgba(105,190,40,0.15) 0%, rgba(0,34,68,0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,34,68,0.9) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  cursor: qbUnlocked ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  opacity: qbUnlocked ? 1 : 0.7,
                  boxShadow: qbUnlocked ? '0 8px 32px rgba(105,190,40,0.2)' : 'none',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: qbUnlocked
                    ? 'linear-gradient(135deg, var(--seahawks-green, #69BE28) 0%, #4a9c1c 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: qbUnlocked ? '#fff' : 'rgba(255,255,255,0.5)',
                }}>
                  {qbUnlocked ? <Trophy className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>
                
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p className="font-display" style={{
                    fontSize: 'clamp(1.25rem, 6vw, 1.5rem)',
                    color: qbUnlocked ? 'var(--seahawks-green, #69BE28)' : 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.02em',
                  }}>
                    QB LEGEND
                  </p>
                  <p style={{
                    fontSize: 'var(--text-caption, 12px)',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: 'var(--space-1, 4px)',
                  }}>
                    {qbUnlocked ? 'Lead the offense • Score touchdowns' : 'Unlocks Saturday, Feb 7'}
                  </p>
                </div>
                
                {/* Status */}
                {qbUnlocked ? (
                  <div style={{
                    padding: 'var(--space-2, 8px) var(--space-4, 16px)',
                    borderRadius: '100px',
                    background: 'linear-gradient(135deg, var(--seahawks-green, #69BE28) 0%, #4a9c1c 100%)',
                    color: '#fff',
                    fontSize: 'var(--text-caption, 12px)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    PLAY
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1, 4px)',
                    color: 'rgba(255,255,255,0.4)',
                  }}>
                    <Clock className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-caption, 12px)' }}>SOON</span>
                  </div>
                )}
              </motion.button>
            </motion.div>
          </div>
          
          {/* Drawing Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.3 }}
            style={{ marginTop: 'var(--space-6, 24px)' }}
          >
            <GlassCard variant="green" padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ 
                    fontSize: 'var(--text-micro, 10px)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#FFD700',
                    marginBottom: 'var(--space-1, 4px)',
                  }}>
                    The Big Game Drawing
                  </p>
                  <p style={{ 
                    fontSize: 'var(--text-body, 14px)',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    Win 2 tickets to the game
                  </p>
                </div>
                
                {/* Countdown */}
                <div className="text-right">
                  {drawingCountdown.isLive ? (
                    <p style={{ 
                      fontSize: 'var(--text-subtitle, 18px)',
                      fontWeight: 700,
                      color: '#FFD700',
                    }}>
                      LIVE NOW
                    </p>
                  ) : (
                    <>
                      <p style={{ 
                        fontSize: 'var(--text-title, 24px)',
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: 'var(--font-oswald)',
                      }}>
                        {drawingCountdown.days}d {drawingCountdown.hours}h {drawingCountdown.minutes}m
                      </p>
                      <p style={{ 
                        fontSize: 'var(--text-micro, 10px)',
                        color: 'rgba(255,255,255,0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}>
                        Until Drawing
                      </p>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  )
}
