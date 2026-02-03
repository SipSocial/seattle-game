'use client'

/**
 * SharedResults - Results screen used by both QB and Defense games
 * 
 * Shows:
 * - Final score
 * - Performance rating (stars)
 * - Progress updates
 * - Giveaway CTA
 * - Next stage button
 */

import { memo, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, StageProgress } from '@/src/store/gameStore'
import { CAMPAIGN_STAGES } from '@/src/game/data/campaign'

// ============================================================================
// TYPES
// ============================================================================

interface SharedResultsProps {
  gameMode: 'qb' | 'defense'
  stageId: number
  score: number
  isWin: boolean
  stats?: {
    touchdowns?: number
    completions?: number
    interceptions?: number
    sacks?: number
    tackles?: number
    yardsAllowed?: number
  }
  onClose?: () => void
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateStars(score: number, gameMode: 'qb' | 'defense'): 0 | 1 | 2 | 3 {
  const thresholds = gameMode === 'qb'
    ? { three: 350, two: 200, one: 50 }
    : { three: 10000, two: 5000, one: 1000 }
  
  if (score >= thresholds.three) return 3
  if (score >= thresholds.two) return 2
  if (score >= thresholds.one) return 1
  return 0
}

// ============================================================================
// STAR DISPLAY
// ============================================================================

interface StarDisplayProps {
  stars: 0 | 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
}

const StarDisplay = memo(function StarDisplay({ stars, size = 'md' }: StarDisplayProps) {
  const sizes = {
    sm: 20,
    md: 32,
    lg: 48,
  }
  const starSize = sizes[size]
  
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {[1, 2, 3].map((i) => (
        <motion.svg
          key={i}
          width={starSize}
          height={starSize}
          viewBox="0 0 24 24"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= stars ? '#FFD700' : 'rgba(255,255,255,0.2)'}
            stroke={i <= stars ? '#FFA500' : 'rgba(255,255,255,0.1)'}
            strokeWidth="1"
            style={{
              filter: i <= stars ? 'drop-shadow(0 2px 8px rgba(255,215,0,0.5))' : 'none',
            }}
          />
        </motion.svg>
      ))}
    </div>
  )
})

// ============================================================================
// COMPONENT
// ============================================================================

export const SharedResults = memo(function SharedResults({
  gameMode,
  stageId,
  score,
  isWin,
  stats,
  onClose,
}: SharedResultsProps) {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)
  
  // Store actions
  const completeStageQB = useGameStore((state) => state.completeStageQB)
  const completeStageDefense = useGameStore((state) => state.completeStageDefense)
  const campaign = useGameStore((state) => state.campaign)
  
  // Calculate stars
  const stars = calculateStars(score, gameMode)
  
  // Get stage info
  const stage = CAMPAIGN_STAGES.find(s => s.id === stageId)
  const nextStage = CAMPAIGN_STAGES.find(s => s.id === stageId + 1)
  
  // Get current stage progress
  const stageProgress = campaign.stageProgress[stageId]
  
  // Update progress on mount
  useEffect(() => {
    if (isWin) {
      if (gameMode === 'qb') {
        completeStageQB(stageId, score, stars)
      } else {
        completeStageDefense(stageId, score, stars)
      }
    }
    
    // Delay showing content for entrance animation
    const timer = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(timer)
  }, [isWin, gameMode, stageId, score, stars, completeStageQB, completeStageDefense])
  
  // Navigation handlers
  const handleNextStage = useCallback(() => {
    if (nextStage) {
      localStorage.setItem('currentWeekId', String(nextStage.id))
      router.push('/play')
    } else {
      router.push('/campaign')
    }
  }, [nextStage, router])
  
  const handleReplay = useCallback(() => {
    // Reload current game
    router.refresh()
  }, [router])
  
  const handleGiveaway = useCallback(() => {
    router.push('/v4/giveaway')
  }, [router])
  
  const handleCampaign = useCallback(() => {
    router.push('/campaign')
  }, [router])
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isWin
            ? 'linear-gradient(135deg, rgba(105,190,40,0.95) 0%, rgba(0,34,68,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(40,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {showContent && (
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Result Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <h1
                style={{
                  fontSize: 'clamp(36px, 12vw, 56px)',
                  fontWeight: 900,
                  color: isWin ? '#FFD700' : '#FF4444',
                  fontFamily: 'var(--font-oswald)',
                  letterSpacing: '0.02em',
                  textShadow: isWin
                    ? '0 4px 30px rgba(255,215,0,0.5)'
                    : '0 4px 30px rgba(255,68,68,0.5)',
                  marginBottom: '8px',
                }}
              >
                {isWin ? 'VICTORY!' : 'DEFEAT'}
              </h1>
              
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                }}
              >
                {stage?.weekLabel} • {gameMode === 'qb' ? 'QB Legend' : 'Dark Side Defense'}
              </p>
            </motion.div>
            
            {/* Stars */}
            {isWin && <StarDisplay stars={stars} size="lg" />}
            
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'baseline',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(48px, 15vw, 64px)',
                    fontWeight: 900,
                    color: '#fff',
                    fontFamily: 'var(--font-oswald)',
                  }}
                >
                  {score.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: 600,
                  }}
                >
                  PTS
                </span>
              </div>
              
              {/* Stats Grid */}
              {stats && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {gameMode === 'qb' ? (
                    <>
                      {stats.touchdowns !== undefined && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#69BE28' }}>
                            {stats.touchdowns}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                            TDs
                          </div>
                        </div>
                      )}
                      {stats.completions !== undefined && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFD700' }}>
                            {stats.completions}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                            CMP
                          </div>
                        </div>
                      )}
                      {stats.interceptions !== undefined && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FF6B35' }}>
                            {stats.interceptions}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                            INT
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {stats.tackles !== undefined && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#69BE28' }}>
                            {stats.tackles}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                            TACKLES
                          </div>
                        </div>
                      )}
                      {stats.sacks !== undefined && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFD700' }}>
                            {stats.sacks}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                            SACKS
                          </div>
                        </div>
                      )}
                      {stats.yardsAllowed !== undefined && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FF6B35' }}>
                            {stats.yardsAllowed}
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                            YDS
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
            
            {/* Progress indicator */}
            {stageProgress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: stageProgress.qbCompleted
                        ? 'linear-gradient(135deg, #69BE28 0%, #4a9a1c 100%)'
                        : 'rgba(255,255,255,0.2)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>QB</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: stageProgress.defenseCompleted
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        : 'rgba(255,255,255,0.2)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>DEF</span>
                </div>
              </motion.div>
            )}
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
              }}
            >
              {/* Primary: Giveaway or Next Stage */}
              <button
                onClick={isWin ? handleGiveaway : handleReplay}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '30px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4a9a1c 100%)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(105,190,40,0.3)',
                }}
              >
                {isWin ? 'ENTER GIVEAWAY' : 'TRY AGAIN'}
              </button>
              
              {/* Secondary: Next stage or Campaign */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {isWin && nextStage && (
                  <button
                    onClick={handleNextStage}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      borderRadius: '25px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    NEXT STAGE
                  </button>
                )}
                
                <button
                  onClick={handleCampaign}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '25px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  CAMPAIGN MAP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
})

export default SharedResults
