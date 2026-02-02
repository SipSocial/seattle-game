'use client'

/**
 * QB Stats HUD
 * 
 * Premium in-game stats display showing:
 * - Passer Rating (NFL formula)
 * - Completion percentage
 * - Passing yards
 * - TD/INT count
 * - Throw quality indicator
 * 
 * Design: Glassmorphic, minimal footprint, real-time updates
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentQBStats, usePasserRatingGrade } from '@/src/v4/store/statsStore'

const smoothSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

interface QBStatsHUDProps {
  isVisible: boolean
  isCompact?: boolean
}

export function QBStatsHUD({ isVisible, isCompact = false }: QBStatsHUDProps) {
  const qbStats = useCurrentQBStats()
  const ratingGrade = usePasserRatingGrade()
  
  // Calculate stats
  const compPct = qbStats.attempts > 0 
    ? Math.round((qbStats.completions / qbStats.attempts) * 100) 
    : 0
  
  const statLine = `${qbStats.completions}/${qbStats.attempts}`
  
  if (!isVisible) return null
  
  if (isCompact) {
    // Compact single-line version for during plays
    return (
      <motion.div
        className="fixed z-50"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={smoothSpring}
      >
        <div
          className="flex items-center"
          style={{
            background: 'rgba(10, 25, 40, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            gap: '16px',
          }}
        >
          {/* Rating */}
          <div className="flex items-center" style={{ gap: '6px' }}>
            <span
              className="font-bold"
              style={{
                fontSize: '11px',
                color: ratingGrade.color,
              }}
            >
              {qbStats.passerRating.toFixed(1)}
            </span>
            <span
              style={{
                fontSize: '9px',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.05em',
              }}
            >
              RTG
            </span>
          </div>
          
          {/* Divider */}
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />
          
          {/* Stat Line */}
          <div className="flex items-center" style={{ gap: '6px' }}>
            <span
              className="font-bold"
              style={{
                fontSize: '11px',
                color: '#fff',
              }}
            >
              {statLine}
            </span>
            <span
              style={{
                fontSize: '9px',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {compPct}%
            </span>
          </div>
          
          {/* Divider */}
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />
          
          {/* Yards */}
          <span
            className="font-bold"
            style={{
              fontSize: '11px',
              color: '#69BE28',
            }}
          >
            {qbStats.passingYards} YDS
          </span>
          
          {/* TD/INT */}
          <div className="flex items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#00FF88' }}>
              {qbStats.touchdowns}TD
            </span>
            {qbStats.interceptions > 0 && (
              <span style={{ fontSize: '11px', color: '#FF6B6B' }}>
                {qbStats.interceptions}INT
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
  
  // Full expanded version for between plays
  return (
    <motion.div
      className="fixed z-50"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        left: '16px',
        right: '16px',
      }}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={smoothSpring}
    >
      <div
        style={{
          background: 'rgba(10, 25, 40, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
          {/* Rating Badge */}
          <div className="flex items-center" style={{ gap: '10px' }}>
            <motion.div
              className="flex items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${ratingGrade.color}30 0%, ${ratingGrade.color}10 100%)`,
                border: `2px solid ${ratingGrade.color}`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: '18px',
                  color: ratingGrade.color,
                }}
              >
                {ratingGrade.grade}
              </span>
            </motion.div>
            
            <div>
              <div className="flex items-baseline" style={{ gap: '4px' }}>
                <span
                  className="font-display"
                  style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                    color: '#fff',
                  }}
                >
                  {qbStats.passerRating.toFixed(1)}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.05em',
                  }}
                >
                  RATING
                </span>
              </div>
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: ratingGrade.color,
                }}
              >
                {ratingGrade.label}
              </span>
            </div>
          </div>
          
          {/* TD/INT */}
          <div className="flex" style={{ gap: '12px' }}>
            <div className="text-center">
              <span
                className="block font-display"
                style={{ fontSize: '24px', color: '#00FF88' }}
              >
                {qbStats.touchdowns}
              </span>
              <span
                style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}
              >
                TD
              </span>
            </div>
            <div className="text-center">
              <span
                className="block font-display"
                style={{ fontSize: '24px', color: qbStats.interceptions > 0 ? '#FF6B6B' : 'rgba(255,255,255,0.3)' }}
              >
                {qbStats.interceptions}
              </span>
              <span
                style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}
              >
                INT
              </span>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div 
          className="flex justify-between"
          style={{
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Completions */}
          <div className="text-center">
            <span className="block font-bold" style={{ fontSize: '14px', color: '#fff' }}>
              {statLine}
            </span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
              COMP/ATT
            </span>
          </div>
          
          {/* Completion % */}
          <div className="text-center">
            <span className="block font-bold" style={{ fontSize: '14px', color: '#fff' }}>
              {compPct}%
            </span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
              CMP%
            </span>
          </div>
          
          {/* Yards */}
          <div className="text-center">
            <span className="block font-bold" style={{ fontSize: '14px', color: '#69BE28' }}>
              {qbStats.passingYards}
            </span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
              YARDS
            </span>
          </div>
          
          {/* YPA */}
          <div className="text-center">
            <span className="block font-bold" style={{ fontSize: '14px', color: '#fff' }}>
              {qbStats.yardsPerAttempt.toFixed(1)}
            </span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
              YPA
            </span>
          </div>
          
          {/* Throw Quality */}
          <div className="text-center">
            <div className="flex" style={{ gap: '2px', justifyContent: 'center' }}>
              {/* Perfect throws indicator */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: i < qbStats.throwQuality.perfect 
                      ? '#FFD700' 
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
              PERFECT
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default QBStatsHUD
