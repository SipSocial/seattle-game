'use client'

/**
 * PAUSE MENU - Premium Glass Design
 * 
 * Nike/Apple-level pause screen with:
 * - Frosted glass morphism
 * - Elegant typography
 * - Smooth micro-interactions
 * - Premium haptic feedback
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/src/store/gameStore'
import { AudioManager } from '@/src/game/systems/AudioManager'

interface PauseMenuProps {
  isOpen: boolean
  onResume: () => void
  onRestart: () => void
  onQuit: () => void
}

const smoothSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
}

// Premium button component
function MenuButton({ 
  children, 
  onClick, 
  variant = 'primary',
  icon,
}: { 
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: React.ReactNode
}) {
  const baseStyles = {
    width: '100%',
    padding: '18px 24px',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'var(--font-oswald), sans-serif',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s',
  }
  
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #69BE28 0%, #4a9c1c 100%)',
      color: '#000',
      boxShadow: '0 8px 32px rgba(105, 190, 40, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    secondary: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    ghost: {
      background: 'transparent',
      color: 'rgba(255,255,255,0.5)',
      border: 'none',
    },
  }
  
  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(15)
    AudioManager.playMenuClick()
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

// Stat pill component
function StatPill({ value, label, color = '#69BE28' }: { value: number | string; label: string; color?: string }) {
  return (
    <div 
      className="text-center"
      style={{
        padding: '16px 24px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        flex: 1,
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...smoothSpring, delay: 0.3 }}
      >
        <span 
          className="font-display block"
          style={{ 
            fontSize: 'clamp(2rem, 8vw, 2.5rem)',
            color,
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span 
          className="block"
          style={{ 
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '8px',
          }}
        >
          {label}
        </span>
      </motion.div>
    </div>
  )
}

export function PauseMenu({ isOpen, onResume, onRestart, onQuit }: PauseMenuProps) {
  const score = useGameStore((s) => s.score)
  const wave = useGameStore((s) => s.wave)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop - premium blur with gradient */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            style={{
              background: 'linear-gradient(180deg, rgba(0,20,40,0.85) 0%, rgba(0,10,20,0.95) 100%)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={() => { 
              if (navigator.vibrate) navigator.vibrate(10)
              AudioManager.playMenuClick()
              onResume()
            }}
          />

          {/* Content Container */}
          <motion.div
            className="relative z-10 w-full px-6"
            style={{ maxWidth: '380px' }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={smoothSpring}
          >
            {/* Main Card */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(30,50,70,0.8) 0%, rgba(15,30,50,0.95) 100%)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '28px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                padding: '32px 28px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Accent gradient line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20%',
                  right: '20%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #69BE28, transparent)',
                  borderRadius: '0 0 4px 4px',
                }}
              />
              
              {/* Header */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.1 }}
                style={{ marginBottom: '28px' }}
              >
                {/* Animated pause icon */}
                <motion.div
                  className="inline-flex items-center justify-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(105,190,40,0.1)',
                    border: '2px solid rgba(105,190,40,0.3)',
                    marginBottom: '16px',
                  }}
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 rgba(105,190,40,0)',
                      '0 0 0 12px rgba(105,190,40,0.1)',
                      '0 0 0 0 rgba(105,190,40,0)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#69BE28">
                    <rect x="6" y="4" width="4" height="16" rx="2" />
                    <rect x="14" y="4" width="4" height="16" rx="2" />
                  </svg>
                </motion.div>
                
                <h2 
                  className="font-display"
                  style={{
                    fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  GAME PAUSED
                </h2>
              </motion.div>

              {/* Current Stats */}
              <motion.div 
                className="flex"
                style={{ gap: '12px', marginBottom: '28px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.2 }}
              >
                <StatPill value={score} label="Score" />
                <StatPill value={wave} label="Wave" color="#FFD700" />
              </motion.div>

              {/* Buttons */}
              <motion.div 
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.3 }}
              >
                <MenuButton 
                  variant="primary"
                  onClick={onResume}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  }
                >
                  Resume
                </MenuButton>

                <MenuButton 
                  variant="secondary"
                  onClick={onRestart}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  Restart Game
                </MenuButton>

                <div style={{ height: '4px' }} />

                <MenuButton 
                  variant="ghost"
                  onClick={onQuit}
                >
                  Quit to Menu
                </MenuButton>
              </motion.div>
            </div>
            
            {/* Tip text */}
            <motion.p
              className="text-center"
              style={{
                marginTop: '20px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.05em',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Tap outside to resume
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PauseMenu
