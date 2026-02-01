'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GradientButton } from '@/components/ui/GradientButton'
import { GhostButton } from '@/components/ui/GhostButton'
import { useGameStore } from '@/src/store/gameStore'

interface PauseMenuProps {
  isOpen: boolean
  onResume: () => void
  onRestart: () => void
  onQuit: () => void
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
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onResume}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full px-6"
            style={{ maxWidth: '360px' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <GlassCard padding="lg" className="text-center">
              {/* Header */}
              <div style={{ marginBottom: '32px' }}>
                <div className="text-4xl" style={{ marginBottom: '12px' }}>⏸️</div>
                <h2 
                  className="text-3xl font-black text-white uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Paused
                </h2>
              </div>

              {/* Current Stats */}
              <div 
                className="flex justify-center"
                style={{ gap: '48px', marginBottom: '32px' }}
              >
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{ color: '#69BE28', fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {score.toLocaleString()}
                  </div>
                  <div 
                    className="text-[11px] uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}
                  >
                    Score
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-3xl font-black"
                    style={{ color: '#69BE28', fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {wave}
                  </div>
                  <div 
                    className="text-[11px] uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}
                  >
                    Wave
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col" style={{ gap: '16px' }}>
                <GradientButton 
                  size="lg" 
                  fullWidth 
                  onClick={onResume}
                  icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  }
                >
                  Resume
                </GradientButton>

                <GhostButton 
                  size="lg"
                  fullWidth 
                  variant="green"
                  onClick={onRestart}
                >
                  Restart Game
                </GhostButton>

                <div style={{ height: '8px' }} />

                <GhostButton 
                  size="md"
                  fullWidth
                  variant="subtle"
                  onClick={onQuit}
                >
                  Quit to Menu
                </GhostButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PauseMenu
