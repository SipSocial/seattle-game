'use client'

/**
 * ActionWordOverlay - Cinematic action word flashes
 * 
 * Inspired by commercial "TACKLE", "DEFEND", "DOMINATE" overlays
 * Flash action words during key moments:
 * - SNAP! on ball snap
 * - OPEN! when receiver gets separation  
 * - PERFECT! on perfect throw timing
 * - TOUCHDOWN! with massive slam effect
 * - PICKED! on interception
 */

import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ActionWord = 
  | 'SNAP!'
  | 'OPEN!'
  | 'PERFECT!'
  | 'TOUCHDOWN!'
  | 'PICKED!'
  | 'SACKED!'
  | 'FIRST DOWN!'
  | 'INCOMPLETE'

interface ActionWordOverlayProps {
  word: ActionWord | null
  onComplete?: () => void
}

const WORD_STYLES: Record<ActionWord, {
  color: string
  glow: string
  scale: number
  duration: number
}> = {
  'SNAP!': {
    color: '#69BE28',
    glow: 'rgba(105, 190, 40, 0.8)',
    scale: 1.2,
    duration: 400,
  },
  'OPEN!': {
    color: '#69BE28',
    glow: 'rgba(105, 190, 40, 0.6)',
    scale: 1.0,
    duration: 500,
  },
  'PERFECT!': {
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.8)',
    scale: 1.3,
    duration: 600,
  },
  'TOUCHDOWN!': {
    color: '#69BE28',
    glow: 'rgba(105, 190, 40, 1)',
    scale: 1.8,
    duration: 1200,
  },
  'PICKED!': {
    color: '#FF4444',
    glow: 'rgba(255, 68, 68, 0.8)',
    scale: 1.4,
    duration: 800,
  },
  'SACKED!': {
    color: '#FF6600',
    glow: 'rgba(255, 102, 0, 0.8)',
    scale: 1.3,
    duration: 700,
  },
  'FIRST DOWN!': {
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.6)',
    scale: 1.1,
    duration: 600,
  },
  'INCOMPLETE': {
    color: '#AAAAAA',
    glow: 'rgba(170, 170, 170, 0.4)',
    scale: 0.9,
    duration: 500,
  },
}

export const ActionWordOverlay = memo(function ActionWordOverlay({
  word,
  onComplete,
}: ActionWordOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    if (word) {
      setIsVisible(true)
      const style = WORD_STYLES[word]
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, style.duration)
      return () => clearTimeout(timer)
    }
  }, [word, onComplete])
  
  if (!word) return null
  
  const style = WORD_STYLES[word]
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 100 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* Background flash for big words */}
          {(word === 'TOUCHDOWN!' || word === 'PICKED!') && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: style.duration / 1000 }}
              style={{
                background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
              }}
            />
          )}
          
          {/* Main word */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ 
              scale: [0.5, style.scale, style.scale * 0.95],
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -10],
            }}
            transition={{ 
              duration: style.duration / 1000,
              times: [0, 0.2, 0.7, 1],
              ease: 'easeOut',
            }}
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 'clamp(3rem, 15vw, 6rem)',
              fontWeight: 900,
              color: style.color,
              textShadow: `
                0 0 40px ${style.glow},
                0 0 80px ${style.glow},
                4px 4px 0 rgba(0,0,0,0.5)
              `,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            {word}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
