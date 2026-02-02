'use client'

/**
 * Play Result Overlay
 * 
 * Shows result of each play (TD, catch, incomplete, etc.)
 */

import { motion, AnimatePresence } from 'framer-motion'

type PlayResultType = 
  | 'touchdown'
  | 'firstDown'
  | 'catch'
  | 'incomplete'
  | 'sack'
  | 'turnover'
  | null

interface PlayResultProps {
  result: PlayResultType
  yards?: number
  onComplete?: () => void
}

const RESULT_CONFIG = {
  touchdown: {
    text: 'TOUCHDOWN!',
    color: 'var(--seahawks-green)',
    subtext: '+7 PTS',
    duration: 2000,
    glow: true,
  },
  firstDown: {
    text: 'FIRST DOWN',
    color: '#FFD700',
    subtext: null,
    duration: 1200,
    glow: false,
  },
  catch: {
    text: 'CATCH!',
    color: 'white',
    subtext: null,
    duration: 800,
    glow: false,
  },
  incomplete: {
    text: 'INCOMPLETE',
    color: '#FF4444',
    subtext: null,
    duration: 1000,
    glow: false,
  },
  sack: {
    text: 'SACKED!',
    color: '#FF4444',
    subtext: '-7 YDS',
    duration: 1200,
    glow: false,
  },
  turnover: {
    text: 'TURNOVER',
    color: '#FF4444',
    subtext: 'DOWNS',
    duration: 1500,
    glow: false,
  },
}

export function PlayResult({ result, yards, onComplete }: PlayResultProps) {
  if (!result) return null
  
  const config = RESULT_CONFIG[result]
  if (!config) return null
  
  const subtextDisplay = yards !== undefined ? `+${yards} YDS` : config.subtext
  
  return (
    <AnimatePresence>
      <motion.div
        key={result}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          pointerEvents: 'none',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={() => {
          setTimeout(() => onComplete?.(), config.duration)
        }}
      >
        {/* Main text */}
        <motion.div
          className="font-display"
          style={{
            fontSize: 'var(--text-hero)',
            color: config.color,
            textShadow: config.glow 
              ? `0 0 40px ${config.color}, 0 0 80px ${config.color}`
              : '0 4px 20px rgba(0,0,0,0.5)',
            letterSpacing: '0.05em',
          }}
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {config.text}
        </motion.div>
        
        {/* Subtext */}
        {subtextDisplay && (
          <motion.div
            className="font-heading"
            style={{
              marginTop: 'var(--space-3)',
              fontSize: 'var(--step-2)',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.1em',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {subtextDisplay}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
