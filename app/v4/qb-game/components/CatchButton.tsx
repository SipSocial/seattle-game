'use client'

/**
 * CatchButton - Timing-based catch button
 * 
 * Large button that appears during ball flight for receiver catch timing.
 */

import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTouchButtonProps, triggerHaptic } from '../hooks/useTouchHandlers'

interface CatchButtonProps {
  isVisible: boolean
  ballProgress: number // 0-1 during ball flight
  onCatch: () => void
}

export const CatchButton = memo(function CatchButton({
  isVisible,
  ballProgress,
  onCatch,
}: CatchButtonProps) {
  // Calculate timing indicator
  // Perfect window is 0.7-0.85 progress
  const isPerfectWindow = ballProgress >= 0.7 && ballProgress <= 0.85
  const isGoodWindow = ballProgress >= 0.5 && ballProgress < 0.7
  const isLateWindow = ballProgress > 0.85 && ballProgress <= 0.95
  
  // Button color based on timing
  const getButtonColor = () => {
    if (isPerfectWindow) return '#69BE28'
    if (isGoodWindow) return '#FFD700'
    if (isLateWindow) return '#FF6B35'
    return 'rgba(255,255,255,0.3)'
  }
  
  // Button text based on timing
  const getButtonText = () => {
    if (isPerfectWindow) return 'PERFECT!'
    if (isGoodWindow) return 'CATCH'
    if (isLateWindow) return 'LATE!'
    return 'CATCH'
  }
  
  const handleCatch = useCallback(() => {
    if (isPerfectWindow) {
      triggerHaptic('success')
    } else if (isGoodWindow) {
      triggerHaptic('medium')
    } else {
      triggerHaptic('error')
    }
    onCatch()
  }, [isPerfectWindow, isGoodWindow, onCatch])
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
          }}
        >
          {/* Timing ring indicator */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              border: `4px solid ${getButtonColor()}40`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: isPerfectWindow ? [1, 0.6, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          
          {/* Progress ring */}
          <svg
            width="140"
            height="140"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(-90deg)',
            }}
          >
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            
            {/* Progress arc */}
            <motion.circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke={getButtonColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - ballProgress)}`}
            />
            
            {/* Perfect window indicator */}
            <path
              d={`M 70 10 A 60 60 0 0 1 ${70 + 60 * Math.cos((0.7 * 360 - 90) * Math.PI / 180)} ${70 + 60 * Math.sin((0.7 * 360 - 90) * Math.PI / 180)}`}
              fill="none"
              stroke="rgba(105,190,40,0.5)"
              strokeWidth="12"
              strokeLinecap="round"
              style={{
                transform: `rotate(${0.7 * 360}deg)`,
                transformOrigin: '70px 70px',
              }}
            />
          </svg>
          
          {/* Main catch button */}
          <motion.div
            {...getTouchButtonProps(handleCatch)}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${getButtonColor()} 0%, ${getButtonColor()}CC 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px ${getButtonColor()}60, inset 0 2px 0 rgba(255,255,255,0.3)`,
              border: '3px solid rgba(255,255,255,0.4)',
            }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: isPerfectWindow ? [1, 1.05, 1] : 1,
            }}
            transition={{
              scale: { duration: 0.2, repeat: isPerfectWindow ? Infinity : 0 },
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <motion.span
                style={{
                  display: 'block',
                  fontSize: isPerfectWindow ? '18px' : '16px',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-oswald)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {getButtonText()}
              </motion.span>
              
              {/* Hand icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#fff"
                style={{ 
                  marginTop: '4px',
                  opacity: 0.8,
                }}
              >
                <path d="M6.5 6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v6c0 .28.22.5.5.5s.5-.22.5-.5V3.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v9c0 .28.22.5.5.5s.5-.22.5-.5V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v8.5c0 .28.22.5.5.5s.5-.22.5-.5V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v7c0 3.31-2.69 6-6 6h-2c-3.31 0-6-2.69-6-6V6.5z"/>
              </svg>
            </div>
          </motion.div>
          
          {/* Timing text */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%',
              top: '100%',
              transform: 'translateX(-50%)',
              marginTop: '16px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: isPerfectWindow ? '#69BE28' : 'rgba(255,255,255,0.6)',
                letterSpacing: '0.1em',
              }}
            >
              {isPerfectWindow ? 'NOW!' : 'TAP TO CATCH'}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
