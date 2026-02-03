'use client'

/**
 * GameOverlay - Quick result banners
 * 
 * Shows outcome as quick banners that auto-dismiss.
 * Non-intrusive - doesn't block gameplay flow.
 */

import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayResult, PassOutcome, ThrowTiming, CatchTiming } from '../lib/gameLogic'
import { getTouchButtonProps, triggerHaptic } from '../hooks/useTouchHandlers'

// ============================================================================
// RESULT BANNER (Non-intrusive)
// ============================================================================

interface ResultOverlayProps {
  result: PlayResult | null
  throwTiming: ThrowTiming | null
  catchTiming: CatchTiming | null
  onContinue: () => void
  isVisible: boolean
}

export const ResultOverlay = memo(function ResultOverlay({
  result,
  throwTiming,
  catchTiming,
  onContinue,
  isVisible,
}: ResultOverlayProps) {
  // Hook must be called before any early returns
  const handleContinue = useCallback(() => {
    triggerHaptic('light')
    onContinue()
  }, [onContinue])
  
  if (!result) return null
  
  // Skip touchdown - handled by TouchdownCelebration component
  if (result.outcome === 'touchdown') return null
  
  // Get display config based on outcome
  const getDisplayConfig = () => {
    switch (result.outcome) {
      case 'complete':
        return {
          title: result.isFirstDown ? 'FIRST DOWN!' : 'COMPLETE',
          subtitle: `+${result.yardsGained} YDS`,
          color: result.isFirstDown ? '#FFD700' : '#69BE28',
          bgColor: 'rgba(0,50,30,0.95)',
        }
      case 'incomplete':
        return {
          title: 'INCOMPLETE',
          subtitle: '',
          color: '#FF6B35',
          bgColor: 'rgba(50,20,0,0.95)',
        }
      case 'interception':
        return {
          title: 'INTERCEPTED!',
          subtitle: 'TURNOVER',
          color: '#FF4444',
          bgColor: 'rgba(60,0,0,0.95)',
        }
      case 'sack':
        return {
          title: 'SACKED!',
          subtitle: `${result.yardsGained} YDS`,
          color: '#FF6B35',
          bgColor: 'rgba(50,20,0,0.95)',
        }
      default:
        return {
          title: 'PLAY OVER',
          subtitle: '',
          color: '#fff',
          bgColor: 'rgba(0,0,0,0.95)',
        }
    }
  }
  
  const config = getDisplayConfig()
  
  // Timing badge
  const getTimingBadge = (timing: string | null, label: string) => {
    if (!timing) return null
    const colors: Record<string, string> = {
      perfect: '#69BE28',
      good: '#FFD700',
      early: '#FF6B35',
      late: '#FF6B35',
      veryLate: '#FF4444',
      missed: '#FF4444',
    }
    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 700,
          color: colors[timing] || '#fff',
          background: `${colors[timing] || '#fff'}20`,
          letterSpacing: '0.05em',
        }}
      >
        {label}: {timing.toUpperCase()}
      </span>
    )
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          {...getTouchButtonProps(handleContinue)}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            borderRadius: '20px',
            background: config.bgColor,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `2px solid ${config.color}40`,
            boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${config.color}30`,
            cursor: 'pointer',
          }}
        >
          {/* Main result */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: 'clamp(24px, 7vw, 36px)',
                fontWeight: 900,
                color: config.color,
                fontFamily: 'var(--font-oswald)',
                letterSpacing: '0.02em',
                textShadow: `0 2px 10px ${config.color}50`,
              }}
            >
              {config.title}
            </span>
            {config.subtitle && (
              <span
                style={{
                  fontSize: 'clamp(16px, 4vw, 22px)',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {config.subtitle}
              </span>
            )}
          </div>
          
          {/* Timing badges */}
          {(throwTiming || catchTiming) && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {getTimingBadge(throwTiming, 'THROW')}
              {getTimingBadge(catchTiming, 'CATCH')}
            </div>
          )}
          
          {/* Tap hint */}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              marginTop: '4px',
            }}
          >
            TAP TO CONTINUE
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ============================================================================
// GAME OVER OVERLAY
// ============================================================================

interface GameOverOverlayProps {
  score: { home: number; away: number }
  onReplay: () => void
  onExit: () => void
  isVisible: boolean
}

export const GameOverOverlay = memo(function GameOverOverlay({
  score,
  onReplay,
  onExit,
  isVisible,
}: GameOverOverlayProps) {
  const isWin = score.home > score.away
  
  return (
    <AnimatePresence>
      {isVisible && (
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
              ? 'linear-gradient(135deg, rgba(105,190,40,0.95) 0%, rgba(0,34,68,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(40,0,0,0.95) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 20px',
            }}
          >
            {/* Result text */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 'clamp(40px, 14vw, 64px)',
                fontWeight: 900,
                color: isWin ? '#FFD700' : '#FF4444',
                fontFamily: 'var(--font-oswald)',
                letterSpacing: '0.05em',
                textShadow: isWin
                  ? '0 4px 30px rgba(255,215,0,0.5)'
                  : '0 4px 30px rgba(255,68,68,0.5)',
              }}
            >
              {isWin ? 'VICTORY!' : 'DEFEAT'}
            </motion.h1>
            
            {/* Final score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginTop: '24px',
                padding: '20px 40px',
                borderRadius: '20px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>DARK SIDE</span>
                <div
                  style={{
                    fontSize: 'clamp(32px, 10vw, 48px)',
                    fontWeight: 900,
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald)',
                  }}
                >
                  {score.home}
                </div>
              </div>
              
              <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.3)' }}>-</span>
              
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>OPPONENT</span>
                <div
                  style={{
                    fontSize: 'clamp(32px, 10vw, 48px)',
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-oswald)',
                  }}
                >
                  {score.away}
                </div>
              </div>
            </motion.div>
            
            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '40px',
              }}
            >
              <div
                {...getTouchButtonProps(onReplay)}
                style={{
                  padding: '14px 32px',
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #69BE28 0%, #4a9a1c 100%)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.1em',
                  }}
                >
                  PLAY AGAIN
                </span>
              </div>
              
              <div
                {...getTouchButtonProps(onExit)}
                style={{
                  padding: '14px 32px',
                  borderRadius: '25px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.1em',
                  }}
                >
                  EXIT
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
