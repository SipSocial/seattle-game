'use client'

/**
 * GAME OVER SCREEN - Premium Results Display
 * 
 * World-class game over screen with:
 * - Celebratory animations for high scores
 * - Glassmorphic card design
 * - Elegant stat displays
 * - Smooth micro-interactions
 * - Premium haptic feedback
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/src/store/gameStore'

interface GameOverProps {
  isOpen: boolean
  onPlayAgain: () => void
  onChangePlayer: () => void
  onViewLeaderboard: () => void
  onGiveaway?: () => void
}

const smoothSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
}

// Animated confetti particle
function Confetti({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '8px',
        height: '8px',
        borderRadius: '2px',
        background: color,
        left: `${Math.random() * 100}%`,
        top: '-20px',
      }}
      initial={{ y: -20, opacity: 0, rotate: 0 }}
      animate={{ 
        y: '120vh',
        opacity: [0, 1, 1, 0],
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: 'linear',
        repeat: Infinity,
      }}
    />
  )
}

// Premium button component
function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary',
  icon,
  size = 'lg',
}: { 
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  icon?: React.ReactNode
  size?: 'md' | 'lg'
}) {
  const baseStyles = {
    width: '100%',
    padding: size === 'lg' ? '18px 24px' : '14px 20px',
    borderRadius: '14px',
    fontSize: size === 'lg' ? '15px' : '13px',
    fontWeight: 700,
    fontFamily: 'var(--font-oswald), sans-serif',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  }
  
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
      color: '#000',
      boxShadow: '0 8px 32px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.06)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    accent: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
      color: '#000',
      boxShadow: '0 8px 32px rgba(255, 215, 0, 0.35)',
    },
    ghost: {
      background: 'transparent',
      color: 'rgba(255,255,255,0.5)',
    },
  }
  
  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(15)
    onClick()
  }
  
  return (
    <motion.button
      style={{ ...baseStyles, ...variants[variant] }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      {icon}
      {children}
    </motion.button>
  )
}

// Stat display component
function StatItem({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  return (
    <motion.div 
      className="text-center flex-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothSpring, delay }}
    >
      <span 
        className="font-display block"
        style={{ 
          fontSize: 'clamp(1.5rem, 6vw, 2rem)',
          color: '#fff',
          lineHeight: 1,
        }}
      >
        {value.toLocaleString()}
      </span>
      <span 
        style={{ 
          fontSize: '9px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: '6px',
          display: 'block',
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

export function GameOver({ isOpen, onPlayAgain, onChangePlayer, onViewLeaderboard, onGiveaway }: GameOverProps) {
  const { score, wave, tackles, highScore, playerName, selectedDefender } = useGameStore()
  const [nameInput, setNameInput] = useState(playerName || '')
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const addLeaderboardEntry = useGameStore((s) => s.addLeaderboardEntry)

  useEffect(() => {
    if (isOpen) {
      setIsNewHighScore(score >= highScore && score > 0)
      if (playerName) setNameInput(playerName)
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(score >= highScore ? [50, 100, 50, 100, 100] : [50, 50])
      }
    }
  }, [isOpen, score, highScore, playerName])

  const handleSubmit = useCallback(() => {
    if (nameInput.length >= 1) {
      setPlayerName(nameInput)
      addLeaderboardEntry({
        playerName: nameInput.toUpperCase(),
        jerseyNumber: selectedDefender,
        score,
        wave,
        tackles,
      })
    }
    onPlayAgain()
  }, [nameInput, setPlayerName, addLeaderboardEntry, selectedDefender, score, wave, tackles, onPlayAgain])

  if (!isOpen) return null

  const confettiColors = ['#69BE28', '#FFD700', '#FF6B6B', '#4ECDC4', '#fff']

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="game-over-modal"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop with animated gradient */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: isNewHighScore
              ? 'radial-gradient(circle at 50% 30%, rgba(105,190,40,0.15) 0%, rgba(0,20,40,0.98) 60%)'
              : 'linear-gradient(180deg, rgba(0,20,40,0.9) 0%, rgba(0,10,20,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        />
        
        {/* Confetti for high score */}
        {isNewHighScore && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 25 }).map((_, i) => (
              <Confetti 
                key={i} 
                delay={i * 0.1} 
                color={confettiColors[i % confettiColors.length]} 
              />
            ))}
          </div>
        )}

        {/* Content */}
        <motion.div
          className="relative z-10 w-full px-5"
          style={{ maxWidth: '400px' }}
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={smoothSpring}
        >
          {/* Main Card */}
          <div
            style={{
              background: 'linear-gradient(180deg, rgba(30,50,70,0.85) 0%, rgba(15,30,50,0.95) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: '28px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: isNewHighScore 
                ? '0 30px 100px rgba(105,190,40,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
              padding: '32px 28px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Top accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: isNewHighScore 
                  ? 'linear-gradient(90deg, transparent, #FFD700, #69BE28, transparent)'
                  : 'linear-gradient(90deg, transparent, #69BE28, transparent)',
              }}
            />
            
            {/* Header */}
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...smoothSpring, delay: 0.1 }}
              style={{ marginBottom: '24px' }}
            >
              {isNewHighScore ? (
                <>
                  {/* Trophy animation */}
                  <motion.div
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.05) 100%)',
                      border: '2px solid rgba(255,215,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                    }}
                    animate={{ 
                      rotate: [0, -10, 10, -5, 5, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    🏆
                  </motion.div>
                  <h2 
                    className="font-display"
                    style={{
                      fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '0.02em',
                    }}
                  >
                    NEW HIGH SCORE!
                  </h2>
                </>
              ) : (
                <>
                  <motion.div
                    style={{
                      width: '72px',
                      height: '72px',
                      margin: '0 auto 16px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                    }}
                  >
                    🏈
                  </motion.div>
                  <h2 
                    className="font-display"
                    style={{
                      fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                      color: '#fff',
                      letterSpacing: '0.02em',
                    }}
                  >
                    GAME OVER
                  </h2>
                </>
              )}
            </motion.div>

            {/* Score */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...smoothSpring, delay: 0.2 }}
              style={{ marginBottom: '24px' }}
            >
              <span 
                className="font-display block"
                style={{
                  fontSize: 'clamp(3.5rem, 15vw, 5rem)',
                  color: '#69BE28',
                  lineHeight: 0.9,
                  textShadow: '0 0 60px rgba(105, 190, 40, 0.5)',
                }}
              >
                {score.toLocaleString()}
              </span>
              <span 
                style={{ 
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginTop: '8px',
                  display: 'block',
                }}
              >
                Final Score
              </span>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="flex"
              style={{ 
                gap: '16px', 
                marginBottom: '28px',
                padding: '16px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0.3 }}
            >
              <StatItem value={wave} label="Wave" delay={0.35} />
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <StatItem value={tackles} label="Tackles" delay={0.4} />
            </motion.div>

            {/* Name Entry */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0.4 }}
              style={{ marginBottom: '28px' }}
            >
              <label 
                style={{ 
                  display: 'block',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                Enter Initials
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.toUpperCase().slice(0, 3))}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                maxLength={3}
                placeholder="AAA"
                className="font-display"
                style={{
                  width: '140px',
                  height: '60px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  fontSize: '28px',
                  letterSpacing: '0.2em',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: inputFocused 
                    ? '2px solid #69BE28'
                    : '2px solid rgba(105, 190, 40, 0.25)',
                  color: '#69BE28',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: inputFocused ? '0 0 30px rgba(105,190,40,0.2)' : 'none',
                }}
              />
            </motion.div>

            {/* Buttons */}
            <motion.div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothSpring, delay: 0.5 }}
            >
              <ActionButton 
                variant="primary"
                onClick={handleSubmit}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Play Again
              </ActionButton>

              {onGiveaway && (
                <ActionButton 
                  variant="accent"
                  onClick={onGiveaway}
                  icon={<span style={{ fontSize: '16px' }}>🎁</span>}
                >
                  Enter Giveaway
                </ActionButton>
              )}

              <div className="flex" style={{ gap: '10px' }}>
                <ActionButton 
                  variant="secondary"
                  size="md"
                  onClick={onChangePlayer}
                >
                  Change Player
                </ActionButton>
                <ActionButton 
                  variant="secondary"
                  size="md"
                  onClick={onViewLeaderboard}
                >
                  Leaderboard
                </ActionButton>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GameOver
