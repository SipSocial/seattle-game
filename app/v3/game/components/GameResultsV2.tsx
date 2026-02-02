'use client'

/**
 * Game Results V2
 * 
 * Premium post-game summary showing:
 * - Final score with win/loss state
 * - QB rating with grade
 * - Full stat breakdown
 * - Receiver stats
 * - Play-by-play highlights
 * - Leaderboard submission
 * 
 * Design: Nike-level, celebratory animations, glassmorphism
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { 
  useStatsStore,
  useCurrentQBStats, 
  useCurrentReceiverStats,
  usePasserRatingGrade,
} from '@/src/v4/store/statsStore'
import { getStarRating, getPerformanceSummary } from '@/src/v4/lib/qbRating'

const smoothSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

interface GameResultsV2Props {
  isOpen: boolean
  won: boolean
  homeScore: number
  awayScore: number
  opponentName: string
  onPlayAgain: () => void
  onReturnToMap: () => void
}

// Star component
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={filled ? '#FFD700' : 'rgba(255,255,255,0.15)'} 
      style={{ width: '24px', height: '24px' }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// Stat row component
function StatRow({ 
  label, 
  value, 
  highlight = false,
  color = '#fff',
}: { 
  label: string
  value: string | number
  highlight?: boolean
  color?: string
}) {
  return (
    <div 
      className="flex justify-between items-center"
      style={{ 
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span 
        className={highlight ? 'font-display' : 'font-bold'}
        style={{ 
          fontSize: highlight ? '18px' : '14px', 
          color,
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function GameResultsV2({
  isOpen,
  won,
  homeScore,
  awayScore,
  opponentName,
  onPlayAgain,
  onReturnToMap,
}: GameResultsV2Props) {
  const router = useRouter()
  const qbStats = useCurrentQBStats()
  const receiverStats = useCurrentReceiverStats()
  const ratingGrade = usePasserRatingGrade()
  const endGame = useStatsStore((s) => s.endGame)
  
  const [showDetails, setShowDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Calculate derived stats
  const gameRating = useStatsStore.getState().getCurrentGameRating()
  const starRating = getStarRating(gameRating)
  const performanceSummary = getPerformanceSummary(
    qbStats.passerRating,
    gameRating,
    qbStats.touchdowns,
    qbStats.interceptions
  )
  
  const compPct = qbStats.attempts > 0 
    ? ((qbStats.completions / qbStats.attempts) * 100).toFixed(1) 
    : '0.0'
  
  // Get top receivers
  const topReceivers = Object.values(receiverStats)
    .sort((a, b) => b.receivingYards - a.receivingYards)
    .slice(0, 3)
  
  const handleSubmitScore = useCallback(async () => {
    setIsSubmitting(true)
    // End game and save stats
    endGame(won, homeScore, awayScore)
    setIsSubmitting(false)
  }, [endGame, won, homeScore, awayScore])
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'rgba(0, 10, 20, 0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <motion.div
          className="w-full max-w-md mx-4 overflow-hidden"
          style={{
            background: 'rgba(15, 30, 50, 0.9)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={smoothSpring}
        >
          {/* Win/Loss Banner */}
          <motion.div
            className="relative text-center overflow-hidden"
            style={{
              padding: '32px 24px 24px',
              background: won 
                ? 'linear-gradient(180deg, rgba(105,190,40,0.3) 0%, transparent 100%)'
                : 'linear-gradient(180deg, rgba(255,107,107,0.3) 0%, transparent 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Result */}
            <motion.h1
              className="font-display"
              style={{
                fontSize: 'clamp(3rem, 15vw, 4.5rem)',
                lineHeight: 1,
                color: won ? '#69BE28' : '#FF6B6B',
                textShadow: won 
                  ? '0 0 40px rgba(105,190,40,0.5)'
                  : '0 0 40px rgba(255,107,107,0.5)',
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...smoothSpring, delay: 0.3 }}
            >
              {won ? 'VICTORY' : 'DEFEAT'}
            </motion.h1>
            
            {/* Score */}
            <motion.div
              className="flex items-center justify-center"
              style={{ gap: '16px', marginTop: '12px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="font-display" style={{ fontSize: '36px', color: '#fff' }}>
                {homeScore}
              </span>
              <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)' }}>-</span>
              <span className="font-display" style={{ fontSize: '36px', color: 'rgba(255,255,255,0.5)' }}>
                {awayScore}
              </span>
            </motion.div>
            
            <motion.span
              style={{
                display: 'block',
                marginTop: '8px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              vs {opponentName}
            </motion.span>
            
            {/* Stars */}
            <motion.div
              className="flex justify-center"
              style={{ gap: '4px', marginTop: '16px' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <StarIcon filled={i < starRating} />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Performance Summary */}
            <motion.span
              className="uppercase font-bold"
              style={{
                display: 'block',
                marginTop: '12px',
                fontSize: '11px',
                letterSpacing: '0.15em',
                color: ratingGrade.color,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {performanceSummary}
            </motion.span>
          </motion.div>
          
          {/* QB Rating Section */}
          <motion.div
            style={{ padding: '20px 24px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Rating Card */}
            <div
              className="flex items-center justify-between"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center" style={{ gap: '12px' }}>
                <motion.div
                  className="flex items-center justify-center"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${ratingGrade.color}30 0%, ${ratingGrade.color}10 100%)`,
                    border: `2px solid ${ratingGrade.color}`,
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span
                    className="font-display"
                    style={{ fontSize: '24px', color: ratingGrade.color }}
                  >
                    {ratingGrade.grade}
                  </span>
                </motion.div>
                
                <div>
                  <span
                    className="block uppercase font-bold"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Passer Rating
                  </span>
                  <span
                    className="block font-display"
                    style={{ fontSize: '32px', color: '#fff' }}
                  >
                    {qbStats.passerRating.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span
                  className="block uppercase font-bold"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  Game Rating
                </span>
                <span
                  className="block font-display"
                  style={{ fontSize: '24px', color: '#69BE28' }}
                >
                  {gameRating.toFixed(0)}
                </span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div 
              className="grid grid-cols-4"
              style={{ marginTop: '16px', gap: '8px' }}
            >
              {[
                { label: 'CMP/ATT', value: `${qbStats.completions}/${qbStats.attempts}` },
                { label: 'CMP%', value: `${compPct}%` },
                { label: 'YARDS', value: qbStats.passingYards, color: '#69BE28' },
                { label: 'TD/INT', value: `${qbStats.touchdowns}/${qbStats.interceptions}`, color: qbStats.interceptions > qbStats.touchdowns ? '#FF6B6B' : '#00FF88' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center"
                  style={{
                    padding: '12px 8px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                  }}
                >
                  <span
                    className="block font-bold"
                    style={{ fontSize: '14px', color: stat.color || '#fff' }}
                  >
                    {stat.value}
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Expandable Details */}
          <motion.div
            style={{ padding: '0 24px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between"
              style={{
                padding: '12px 0',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                {showDetails ? 'Hide Details' : 'Show Details'}
              </span>
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={2}
                animate={{ rotate: showDetails ? 180 : 0 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Detailed Stats */}
                  <div style={{ paddingBottom: '16px' }}>
                    <StatRow label="Yards Per Attempt" value={qbStats.yardsPerAttempt.toFixed(1)} />
                    <StatRow label="Perfect Throws" value={qbStats.throwQuality.perfect} color="#FFD700" />
                    <StatRow label="Good Throws" value={qbStats.throwQuality.good} color="#00FF88" />
                    <StatRow label="Late Throws" value={qbStats.throwQuality.late} color="#FFA500" />
                    <StatRow label="Quick Releases" value={qbStats.quickReleases} />
                    <StatRow label="Sacks Taken" value={qbStats.sacksTaken} color={qbStats.sacksTaken > 0 ? '#FF6B6B' : '#fff'} />
                    
                    {/* Top Receivers */}
                    {topReceivers.length > 0 && (
                      <>
                        <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                          <span
                            className="uppercase font-bold"
                            style={{
                              fontSize: '10px',
                              letterSpacing: '0.1em',
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            Top Receivers
                          </span>
                        </div>
                        {topReceivers.map((rec) => (
                          <div
                            key={rec.playerId}
                            className="flex justify-between items-center"
                            style={{
                              padding: '8px 0',
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                            }}
                          >
                            <span style={{ fontSize: '12px', color: '#fff' }}>
                              {rec.playerName}
                            </span>
                            <div className="flex items-center" style={{ gap: '16px' }}>
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                {rec.receptions}/{rec.targets}
                              </span>
                              <span style={{ fontSize: '12px', color: '#69BE28', fontWeight: 600 }}>
                                {rec.receivingYards} YDS
                              </span>
                              {rec.touchdowns > 0 && (
                                <span style={{ fontSize: '11px', color: '#FFD700' }}>
                                  {rec.touchdowns} TD
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Actions */}
          <motion.div
            style={{
              padding: '20px 24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <GradientButton 
              size="lg" 
              fullWidth 
              radius="lg"
              onClick={() => {
                handleSubmitScore()
                onPlayAgain()
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Play Next Game'}
            </GradientButton>
            
            <GhostButton 
              size="md" 
              fullWidth 
              radius="lg" 
              variant="subtle"
              onClick={() => {
                handleSubmitScore()
                onReturnToMap()
              }}
            >
              Return to Map
            </GhostButton>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GameResultsV2
