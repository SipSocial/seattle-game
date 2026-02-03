'use client'

/**
 * ScoreHUD - Game score and status display
 * 
 * Shows score, quarter, time, down & distance, and pocket timer.
 */

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DriveState } from '../lib/gameLogic'
import { GamePhase } from '../hooks/useGameState'

interface ScoreHUDProps {
  drive: DriveState
  phase: GamePhase
  pocketTime: number
  pocketTimeMax: number
}

export const ScoreHUD = memo(function ScoreHUD({
  drive,
  phase,
  pocketTime,
  pocketTimeMax,
}: ScoreHUDProps) {
  // Format time remaining
  const timeDisplay = useMemo(() => {
    const minutes = Math.floor(drive.timeRemaining / 60)
    const seconds = drive.timeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [drive.timeRemaining])
  
  // Format down and distance
  const downDisplay = useMemo(() => {
    const ordinals = ['1st', '2nd', '3rd', '4th']
    const down = ordinals[drive.down - 1] || '4th'
    const distance = drive.yardsToGo >= 10 && drive.yardLine + drive.yardsToGo >= 100
      ? 'Goal'
      : `${drive.yardsToGo}`
    return `${down} & ${distance}`
  }, [drive.down, drive.yardsToGo, drive.yardLine])
  
  // Calculate pocket timer percentage
  const pocketPercent = Math.min(100, (pocketTime / pocketTimeMax) * 100)
  const isPocketDanger = pocketPercent > 70
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        paddingLeft: '12px',
        paddingRight: '12px',
        pointerEvents: 'none',
      }}
    >
      {/* Top bar with score and time */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        {/* Score pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '8px 20px',
            borderRadius: '24px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Home (Dark Side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#69BE28',
              }}
            />
            <span
              style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'var(--font-oswald)',
              }}
            >
              {drive.score.home}
            </span>
          </div>
          
          {/* Separator */}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>-</span>
          
          {/* Away */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'var(--font-oswald)',
              }}
            >
              {drive.score.away}
            </span>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
              }}
            />
          </div>
        </div>
        
        {/* Quarter & Time */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.1em',
            }}
          >
            Q{drive.quarter}
          </span>
          <span
            style={{
              fontSize: 'clamp(14px, 3.5vw, 18px)',
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'var(--font-oswald)',
            }}
          >
            {timeDisplay}
          </span>
        </div>
      </div>
      
      {/* Down & Distance pill */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 16px',
            borderRadius: '16px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,215,0,0.2)',
          }}
        >
          <span
            style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              fontWeight: 700,
              color: '#FFD700',
              fontFamily: 'var(--font-oswald)',
            }}
          >
            {downDisplay}
          </span>
          
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            •
          </span>
          
          <span
            style={{
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Ball on {drive.yardLine <= 50 ? `Own ${drive.yardLine}` : `Opp ${100 - drive.yardLine}`}
          </span>
        </div>
      </div>
      
      {/* Pocket Timer (only during READ phase) */}
      {phase === 'READ' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              width: '160px',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                borderRadius: '3px',
                background: isPocketDanger
                  ? 'linear-gradient(90deg, #FF4444 0%, #FF6B6B 100%)'
                  : 'linear-gradient(90deg, #69BE28 0%, #7ed957 100%)',
              }}
              animate={{
                width: `${100 - pocketPercent}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          {/* Pocket time label */}
          <span
            style={{
              marginLeft: '8px',
              fontSize: '10px',
              fontWeight: 600,
              color: isPocketDanger ? '#FF6B6B' : 'rgba(255,255,255,0.5)',
            }}
          >
            {isPocketDanger ? 'THROW NOW!' : 'POCKET'}
          </span>
        </motion.div>
      )}
    </div>
  )
})
