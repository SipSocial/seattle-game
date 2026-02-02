'use client'

/**
 * Pressure Meter
 * 
 * Visual indicator of QB pressure level
 * Fills up as pocket collapses
 */

import { motion } from 'framer-motion'

interface PressureMeterProps {
  level: number // 0-1
  isVisible: boolean
}

export function PressureMeter({ level, isVisible }: PressureMeterProps) {
  if (!isVisible) return null
  
  // Color transitions from green to yellow to red
  const getColor = () => {
    if (level < 0.4) return 'var(--seahawks-green)'
    if (level < 0.7) return '#FFD700'
    return '#FF4444'
  }
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Circular progress */}
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${level * 220} 220`}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            filter: level > 0.7 ? 'drop-shadow(0 0 10px rgba(255, 68, 68, 0.6))' : undefined,
          }}
          initial={{ strokeDasharray: '0 220' }}
          animate={{ strokeDasharray: `${level * 220} 220` }}
          transition={{ duration: 0.1 }}
        />
        
        {/* Center text */}
        <text
          x="40"
          y="44"
          textAnchor="middle"
          fill={getColor()}
          fontSize="14"
          fontFamily="var(--font-oswald)"
          fontWeight="700"
        >
          {level > 0.7 ? 'RUSH!' : 'PRESSURE'}
        </text>
      </svg>
    </motion.div>
  )
}
