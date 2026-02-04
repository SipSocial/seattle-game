'use client'

/**
 * V5 Game Results Page
 * 
 * Shows post-game results with:
 * - Victory/defeat state
 * - Score and stars
 * - Entry earned badge
 * - Share for bonus entry
 * - Drawing countdown
 * - Play again / map navigation
 * 
 * Uses V4 store patterns with V5 entry tracking
 */

import { Suspense, useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Shield, Check, Share2, Map, RefreshCw, Ticket, Clock, Zap, Star } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { LoadingSpinner } from '@/components/ui'
import { useGameStore, useTotalEntries, useCampaignProgress } from '@/src/store/gameStore'
import { useV5Drawing, CAMPAIGN_STAGES, getStageById } from '@/src/v5/store/v5GameStore'
import { AudioManager } from '@/src/game/systems/AudioManager'
import Confetti from 'react-confetti'

const spring = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Calculate stars from score
function calculateStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= 10000) return 3
  if (score >= 5000) return 2
  if (score >= 1000) return 1
  return 0
}

// Calculate entries from score
function calculateEntries(score: number): number {
  if (score >= 10000) return 5
  if (score >= 5000) return 3
  if (score >= 1000) return 2
  return 1
}

// Star display component
function StarDisplay({ stars }: { stars: 0 | 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2, 8px)', justifyContent: 'center' }}>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 300 }}
        >
          <Star
            className="w-10 h-10"
            fill={i <= stars ? '#FFD700' : 'rgba(255,255,255,0.1)'}
            stroke={i <= stars ? '#FFA500' : 'rgba(255,255,255,0.1)'}
            style={{
              filter: i <= stars ? 'drop-shadow(0 2px 8px rgba(255,215,0,0.5))' : 'none',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Parse URL params
  const score = parseInt(searchParams.get('score') || '0', 10)
  const won = searchParams.get('won') === 'true'
  const weekId = parseInt(searchParams.get('weekId') || '1', 10)
  const tackles = parseInt(searchParams.get('tackles') || '0', 10)
  const sacks = parseInt(searchParams.get('sacks') || '0', 10)
  const interceptions = parseInt(searchParams.get('interceptions') || '0', 10)
  
  // Store state
  const totalEntries = useTotalEntries()
  const addShareBonusEntry = useGameStore((state) => state.addShareBonusEntry)
  const shareBonusUsed = useGameStore((state) => state.campaign.shareBonusUsed)
  const drawing = useV5Drawing()
  
  // Get stage info
  const stage = useMemo(() => getStageById(weekId), [weekId])
  const stars = useMemo(() => calculateStars(score), [score])
  const entriesEarned = useMemo(() => calculateEntries(score), [score])
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [shared, setShared] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    // Show confetti if won
    if (won) {
      setShowConfetti(true)
      AudioManager.playConfirm()
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [won])
  
  // Handle share
  const handleShare = useCallback(async () => {
    const shareText = `I just scored ${score.toLocaleString()} points playing Dark Side Defense! Play now and win Big Game tickets at darksidefootball.com`
    
    // Check for Web Share API support
    const canShare = typeof window !== 'undefined' && 'navigator' in window && 'share' in window.navigator
    
    if (canShare) {
      try {
        await window.navigator.share({
          title: 'Dark Side Football',
          text: shareText,
          url: 'https://darksidefootball.com',
        })
        
        // Add bonus entry if not already used
        if (!shareBonusUsed) {
          addShareBonusEntry()
          setShared(true)
          
          // Haptic feedback
          if ('vibrate' in window.navigator) {
            window.navigator.vibrate([50, 100, 50])
          }
        }
      } catch (err) {
        // User cancelled or error - still count as attempt
        console.log('Share cancelled')
      }
    } else if (typeof window !== 'undefined' && window.navigator?.clipboard) {
      // Fallback: copy to clipboard
      try {
        await window.navigator.clipboard.writeText(shareText + ' https://darksidefootball.com')
        alert('Link copied to clipboard!')
      } catch (err) {
        console.log('Clipboard failed')
      }
    }
  }, [score, shareBonusUsed, addShareBonusEntry])
  
  // Handle play again
  const handlePlayAgain = useCallback(() => {
    AudioManager.playMenuClick()
    router.push(`/v5/game/defense?weekId=${weekId}`)
  }, [router, weekId])
  
  // Handle go to map
  const handleGoToMap = useCallback(() => {
    AudioManager.playMenuClick()
    router.push('/v5/game/map')
  }, [router])
  
  // Handle go to hub
  const handleGoToHub = useCallback(() => {
    AudioManager.playMenuClick()
    router.push('/v5/game')
  }, [router])

  return (
    <div 
      className="min-h-full flex flex-col"
      style={{ 
        background: won 
          ? 'linear-gradient(180deg, #001428 0%, #002244 50%, #001428 100%)'
          : 'linear-gradient(180deg, #1a0a0a 0%, #0a0a1a 50%, #1a0a0a 100%)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--space-8, 32px))',
        paddingBottom: 'var(--space-8, 32px)',
        paddingLeft: 'var(--space-5, 20px)',
        paddingRight: 'var(--space-5, 20px)',
      }}
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 400}
            height={typeof window !== 'undefined' ? window.innerHeight : 800}
            recycle={false}
            numberOfPieces={200}
            colors={['#69BE28', '#FFD700', '#fff', '#002244']}
          />
        )}
      </AnimatePresence>
      
      <div style={{ maxWidth: 'var(--container-sm, 384px)', margin: '0 auto', width: '100%' }}>
        
        {/* Victory/Defeat Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.8 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{ marginBottom: 'var(--space-6, 24px)' }}
        >
          {/* Result Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              margin: '0 auto var(--space-4, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: won 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : 'linear-gradient(135deg, rgba(255,100,100,0.3) 0%, rgba(255,50,50,0.2) 100%)',
              boxShadow: won 
                ? '0 0 40px rgba(255,215,0,0.5)'
                : '0 0 40px rgba(255,50,50,0.3)',
            }}
          >
            {won ? (
              <Trophy className="w-10 h-10" style={{ color: '#002244' }} />
            ) : (
              <Shield className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.5)' }} />
            )}
          </motion.div>
          
          {/* Result Text */}
          <h1 
            className="font-display"
            style={{ 
              fontSize: 'clamp(2.5rem, 12vw, 4rem)',
              letterSpacing: '0.02em',
              background: won
                ? 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)'
                : 'linear-gradient(180deg, rgba(255,150,150,1) 0%, rgba(255,100,100,1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: won ? 'drop-shadow(0 4px 20px rgba(255,215,0,0.5))' : 'none',
            }}
          >
            {won ? 'VICTORY' : 'DEFEAT'}
          </h1>
          
          {/* Stage info */}
          {stage && (
            <p style={{ 
              fontSize: 'var(--text-caption, 12px)',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 'var(--space-2, 8px)',
            }}>
              {stage.weekLabel} • vs {stage.visuals.opponent.name.split(' ').pop()}
            </p>
          )}
        </motion.div>
        
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.25 }}
          style={{ marginBottom: 'var(--space-5, 20px)' }}
        >
          <GlassCard variant={won ? 'green' : 'default'} padding="lg">
            {/* Score */}
            <div className="text-center" style={{ marginBottom: 'var(--space-4, 16px)' }}>
              <p style={{ 
                fontSize: 'var(--text-micro, 10px)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 'var(--space-2, 8px)',
              }}>
                Final Score
              </p>
              <p style={{ 
                fontSize: 'clamp(3rem, 15vw, 4.5rem)',
                fontWeight: 800,
                fontFamily: 'var(--font-oswald)',
                color: '#fff',
                lineHeight: 1,
              }}>
                {score.toLocaleString()}
              </p>
            </div>
            
            {/* Stars */}
            <StarDisplay stars={stars} />
            
            {/* Stats Grid */}
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-4, 16px)',
                marginTop: 'var(--space-5, 20px)',
                paddingTop: 'var(--space-4, 16px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div className="text-center">
                <p style={{ 
                  fontSize: 'var(--text-title, 24px)',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                }}>
                  {tackles}
                </p>
                <p style={{ fontSize: 'var(--text-micro, 10px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Tackles
                </p>
              </div>
              <div className="text-center">
                <p style={{ 
                  fontSize: 'var(--text-title, 24px)',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                }}>
                  {sacks}
                </p>
                <p style={{ fontSize: 'var(--text-micro, 10px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  Sacks
                </p>
              </div>
              <div className="text-center">
                <p style={{ 
                  fontSize: 'var(--text-title, 24px)',
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'var(--font-oswald)',
                }}>
                  {interceptions}
                </p>
                <p style={{ fontSize: 'var(--text-micro, 10px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                  INTs
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
        
        {/* Entry Earned Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.35 }}
          style={{ marginBottom: 'var(--space-5, 20px)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4, 16px) var(--space-5, 20px)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
              border: '1px solid rgba(255,215,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)' }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Ticket className="w-6 h-6" style={{ color: '#FFD700' }} />
              </motion.div>
              <div>
                <p style={{ 
                  fontSize: 'var(--text-body, 14px)',
                  fontWeight: 600,
                  color: '#FFD700',
                }}>
                  +{entriesEarned} {entriesEarned === 1 ? 'Entry' : 'Entries'} Earned
                </p>
                <p style={{ 
                  fontSize: 'var(--text-micro, 10px)',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  Total: {totalEntries} entries
                </p>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: 'spring' }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check className="w-5 h-5" style={{ color: '#fff' }} />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Share for Bonus */}
        {!shareBonusUsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ ...spring, delay: 0.4 }}
            style={{ marginBottom: 'var(--space-5, 20px)' }}
          >
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3, 12px)',
                padding: 'var(--space-4, 16px)',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(105,190,40,0.2) 0%, rgba(105,190,40,0.1) 100%)',
                border: '1px solid rgba(105,190,40,0.4)',
                cursor: 'pointer',
              }}
            >
              <Share2 className="w-5 h-5" style={{ color: 'var(--seahawks-green, #69BE28)' }} />
              <span style={{ 
                fontSize: 'var(--text-body, 14px)',
                fontWeight: 600,
                color: 'var(--seahawks-green, #69BE28)',
              }}>
                Share & Earn +1 Bonus Entry
              </span>
            </motion.button>
          </motion.div>
        )}
        
        {shared && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: 'var(--space-3, 12px)',
              marginBottom: 'var(--space-4, 16px)',
              borderRadius: '12px',
              background: 'rgba(105,190,40,0.2)',
              border: '1px solid rgba(105,190,40,0.3)',
            }}
          >
            <p style={{ color: 'var(--seahawks-green, #69BE28)', fontSize: 'var(--text-body, 14px)' }}>
              Bonus entry added!
            </p>
          </motion.div>
        )}
        
        {/* Drawing Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.45 }}
          style={{ marginBottom: 'var(--space-6, 24px)' }}
        >
          <GlassCard variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ 
                  fontSize: 'var(--text-micro, 10px)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#FFD700',
                  marginBottom: 'var(--space-1, 4px)',
                }}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  Drawing Countdown
                </p>
                <p style={{ 
                  fontSize: 'var(--text-caption, 12px)',
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  Win 2 Big Game tickets
                </p>
              </div>
              <p style={{ 
                fontSize: 'var(--text-subtitle, 18px)',
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'var(--font-oswald)',
              }}>
                {drawing.isLive ? 'LIVE' : `${drawing.days}d ${drawing.hours}h`}
              </p>
            </div>
          </GlassCard>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ ...spring, delay: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3, 12px)' }}
        >
          <GradientButton 
            fullWidth 
            onClick={handlePlayAgain}
            style={{ height: '56px' }}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Play Again
          </GradientButton>
          
          <GhostButton 
            fullWidth 
            onClick={handleGoToMap}
          >
            <Map className="w-5 h-5 mr-2" />
            Campaign Map
          </GhostButton>
          
          <button
            onClick={handleGoToHub}
            style={{
              padding: 'var(--space-3, 12px)',
              fontSize: 'var(--text-body, 14px)',
              color: 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Back to Game Hub
          </button>
        </motion.div>
        
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div 
        className="fixed inset-0 flex items-center justify-center" 
        style={{ background: '#002244' }}
      >
        <LoadingSpinner size="xl" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
