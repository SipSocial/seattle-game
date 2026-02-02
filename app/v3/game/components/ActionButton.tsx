'use client'

/**
 * V3 Action Button Component
 * 
 * Large circular button for primary game actions (SPIN, TACKLE)
 * Features cooldown ring animation
 */

import { motion } from 'framer-motion'
import { useCallback } from 'react'

interface ActionButtonProps {
  label: string
  onAction: () => void
  cooldown: number // 0-1, where 1 = ready
  disabled?: boolean
  variant?: 'offense' | 'defense'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { button: 52, ring: 48, fontSize: 10, strokeWidth: 3 },
  md: { button: 64, ring: 58, fontSize: 11, strokeWidth: 4 },
  lg: { button: 80, ring: 72, fontSize: 13, strokeWidth: 5 },
}

export function ActionButton({
  label,
  onAction,
  cooldown,
  disabled = false,
  variant = 'offense',
  size = 'md',
  className = '',
}: ActionButtonProps) {
  const s = SIZES[size]
  const isReady = cooldown >= 1
  const canPress = isReady && !disabled

  // Colors based on variant
  const colors = {
    offense: {
      ready: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
      notReady: 'rgba(105, 190, 40, 0.2)',
      glow: 'rgba(105, 190, 40, 0.4)',
      ring: '#69BE28',
    },
    defense: {
      ready: 'linear-gradient(135deg, #FF6B6B 0%, #cc4444 100%)',
      notReady: 'rgba(255, 107, 107, 0.2)',
      glow: 'rgba(255, 107, 107, 0.4)',
      ring: '#FF6B6B',
    },
  }

  const c = colors[variant]

  // Circumference for progress ring
  const circumference = 2 * Math.PI * (s.ring / 2)
  const strokeDashoffset = circumference * (1 - cooldown)

  const handlePress = useCallback(() => {
    if (canPress) {
      onAction()
    }
  }, [canPress, onAction])

  return (
    <motion.button
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: s.button,
        height: s.button,
        borderRadius: '50%',
        background: isReady ? c.ready : c.notReady,
        boxShadow: isReady ? `0 4px 24px ${c.glow}` : 'none',
        border: 'none',
        cursor: canPress ? 'pointer' : 'not-allowed',
        WebkitTapHighlightColor: 'transparent',
      }}
      whileTap={canPress ? { scale: 0.9 } : undefined}
      whileHover={canPress ? { scale: 1.05 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handlePress}
      disabled={disabled}
    >
      {/* Cooldown ring background */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox={`0 0 ${s.button} ${s.button}`}
      >
        {/* Background ring */}
        <circle
          cx={s.button / 2}
          cy={s.button / 2}
          r={s.ring / 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={s.strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={s.button / 2}
          cy={s.button / 2}
          r={s.ring / 2}
          fill="none"
          stroke={c.ring}
          strokeWidth={s.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: isReady ? `drop-shadow(0 0 6px ${c.ring})` : 'none',
          }}
        />
      </svg>

      {/* Label */}
      <span
        className="relative z-10 font-bold uppercase tracking-wider"
        style={{
          fontFamily: 'var(--font-oswald)',
          fontSize: s.fontSize,
          color: isReady ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
          textShadow: isReady ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {label}
      </span>

      {/* Ready pulse effect */}
      {isReady && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: c.ready,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.15, 1.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  )
}

export default ActionButton
