'use client'

/**
 * Scoreboard Component - ESPN Broadcast Quality
 * 
 * Premium ESPN-style scoreboard with glassmorphic design
 * Animated score changes, pulsing clock in final 2 minutes
 * Uses fluid typography tokens for responsive scaling
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScoreboardProps {
  homeScore: number
  awayScore: number
  quarter: number
  clockMs: number
  homeName?: string
  awayName?: string
}

export function Scoreboard({
  homeScore,
  awayScore,
  quarter,
  clockMs,
  homeName = 'DARK SIDE',
  awayName = 'OPPONENT',
}: ScoreboardProps) {
  // Track score changes for animation
  const [prevHomeScore, setPrevHomeScore] = useState(homeScore)
  const [prevAwayScore, setPrevAwayScore] = useState(awayScore)
  const [homeScoreChanged, setHomeScoreChanged] = useState(false)
  const [awayScoreChanged, setAwayScoreChanged] = useState(false)
  
  useEffect(() => {
    if (homeScore !== prevHomeScore) {
      setHomeScoreChanged(true)
      setPrevHomeScore(homeScore)
      setTimeout(() => setHomeScoreChanged(false), 600)
    }
  }, [homeScore, prevHomeScore])
  
  useEffect(() => {
    if (awayScore !== prevAwayScore) {
      setAwayScoreChanged(true)
      setPrevAwayScore(awayScore)
      setTimeout(() => setAwayScoreChanged(false), 600)
    }
  }, [awayScore, prevAwayScore])
  
  // Format clock as M:SS
  const minutes = Math.floor(clockMs / 60000)
  const seconds = Math.floor((clockMs % 60000) / 1000)
  const clockDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`
  
  // Quarter display
  const quarterDisplay = quarter <= 4 ? `Q${quarter}` : 'OT'
  
  // Final 2 minutes - clock pulses red
  const isFinal2Min = clockMs < 120000 && (quarter === 2 || quarter === 4)
  
  // Determine leader for visual emphasis
  const homeLeading = homeScore > awayScore
  const awayLeading = awayScore > homeScore
  
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(0, 17, 34, 0.98) 0%, rgba(0, 17, 34, 0.92) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--card-radius-md)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        overflow: 'hidden',
        maxWidth: '380px',
        margin: '0 auto',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* Home Team */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          padding: 'var(--space-3) var(--space-4)',
          background: homeLeading ? 'rgba(105, 190, 40, 0.1)' : 'transparent',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-micro)',
            fontFamily: 'var(--font-oswald)',
            color: 'var(--seahawks-green)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          {homeName}
        </div>
        <motion.div
          style={{
            fontSize: 'var(--step-3)',
            fontFamily: 'var(--font-bebas), var(--font-oswald)',
            color: homeLeading ? 'var(--seahawks-green)' : 'white',
            lineHeight: 1,
            textShadow: homeLeading ? '0 0 20px rgba(105, 190, 40, 0.5)' : 'none',
          }}
          animate={homeScoreChanged ? { scale: [1, 1.3, 1], color: ['#FFFFFF', '#69BE28', homeLeading ? '#69BE28' : '#FFFFFF'] } : {}}
          transition={{ duration: 0.5 }}
        >
          {homeScore}
        </motion.div>
      </div>
      
      {/* Center - Quarter & Clock */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 var(--space-4)',
          background: 'rgba(0,0,0,0.3)',
          minWidth: '80px',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-micro)',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.15em',
            marginBottom: '2px',
          }}
        >
          {quarterDisplay}
        </div>
        <motion.div
          style={{
            fontSize: 'var(--step-1)',
            fontFamily: 'var(--font-bebas), var(--font-oswald)',
            color: isFinal2Min ? '#FF4444' : 'white',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
          animate={isFinal2Min ? { opacity: [1, 0.6, 1] } : {}}
          transition={isFinal2Min ? { duration: 1, repeat: Infinity } : {}}
        >
          {clockDisplay}
        </motion.div>
      </div>
      
      {/* Away Team */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          padding: 'var(--space-3) var(--space-4)',
          background: awayLeading ? 'rgba(136, 0, 0, 0.15)' : 'transparent',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-micro)',
            fontFamily: 'var(--font-oswald)',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          {awayName}
        </div>
        <motion.div
          style={{
            fontSize: 'var(--step-3)',
            fontFamily: 'var(--font-bebas), var(--font-oswald)',
            color: awayLeading ? '#FF4444' : 'white',
            lineHeight: 1,
            textShadow: awayLeading ? '0 0 20px rgba(255, 68, 68, 0.4)' : 'none',
          }}
          animate={awayScoreChanged ? { scale: [1, 1.3, 1], color: ['#FFFFFF', '#FF4444', awayLeading ? '#FF4444' : '#FFFFFF'] } : {}}
          transition={{ duration: 0.5 }}
        >
          {awayScore}
        </motion.div>
      </div>
    </motion.div>
  )
}
