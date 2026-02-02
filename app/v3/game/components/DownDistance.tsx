'use client'

/**
 * Down & Distance Display
 * 
 * Premium broadcast-style down & distance indicator
 * Uses fluid typography for responsive sizing
 */

import { motion } from 'framer-motion'

interface DownDistanceProps {
  down: number
  yardsToGo: number
  ballPosition: number
}

export function DownDistance({ down, yardsToGo, ballPosition }: DownDistanceProps) {
  // Format down display
  const downSuffix = down === 1 ? 'ST' : down === 2 ? 'ND' : down === 3 ? 'RD' : 'TH'
  
  // Format yards display
  const yardsDisplay = yardsToGo <= 0 ? 'GOAL' : yardsToGo.toString()
  const isGoal = yardsToGo <= 0
  
  // Ball position display
  const positionDisplay = ballPosition >= 50 
    ? `OPP ${100 - ballPosition}` 
    : `OWN ${ballPosition}`
  
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) 0',
        marginTop: 'var(--space-2)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* Down & Distance Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 'var(--space-1)',
          padding: 'var(--space-2) var(--space-4)',
          background: 'linear-gradient(135deg, rgba(105, 190, 40, 0.2) 0%, rgba(105, 190, 40, 0.1) 100%)',
          border: '1px solid rgba(105, 190, 40, 0.3)',
          borderRadius: 'var(--btn-radius-full)',
          boxShadow: '0 2px 12px rgba(105, 190, 40, 0.15)',
        }}
      >
        {/* Down number */}
        <span
          style={{
            fontSize: 'var(--step-1)',
            fontFamily: 'var(--font-bebas), var(--font-oswald)',
            color: 'var(--seahawks-green)',
            lineHeight: 1,
          }}
        >
          {down}
        </span>
        <span
          style={{
            fontSize: 'var(--text-caption)',
            fontFamily: 'var(--font-oswald)',
            color: 'var(--seahawks-green)',
            marginRight: '4px',
          }}
        >
          {downSuffix}
        </span>
        
        {/* Separator */}
        <span
          style={{
            fontSize: 'var(--text-caption)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          &
        </span>
        
        {/* Yards */}
        <span
          style={{
            fontSize: 'var(--step-1)',
            fontFamily: 'var(--font-bebas), var(--font-oswald)',
            color: isGoal ? 'var(--accent-gold)' : 'white',
            lineHeight: 1,
            textShadow: isGoal ? '0 0 12px rgba(255, 215, 0, 0.5)' : 'none',
          }}
        >
          {yardsDisplay}
        </span>
      </div>
      
      {/* Ball Position */}
      <div
        style={{
          fontSize: 'var(--text-caption)',
          fontFamily: 'var(--font-oswald)',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Ball on {positionDisplay}
      </div>
    </motion.div>
  )
}
