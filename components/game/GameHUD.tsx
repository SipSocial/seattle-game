'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/src/store/gameStore'

interface GameHUDProps {
  onPause?: () => void
}

export function GameHUD({ onPause }: GameHUDProps) {
  const score = useGameStore((s) => s.score)
  const lives = useGameStore((s) => s.lives)
  const wave = useGameStore((s) => s.wave)
  const combo = useGameStore((s) => s.combo)
  const fanMeter = useGameStore((s) => s.fanMeter)

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      <div className="flex items-start justify-between px-4">
        {/* Left: Score & Wave */}
        <div className="pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1"
          >
            {/* Score */}
            <div 
              className="px-4 py-2 rounded-xl backdrop-blur-md"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(105, 190, 40, 0.3)',
              }}
            >
              <div className="text-[9px] text-white/50 uppercase tracking-wider">Score</div>
              <div 
                className="text-2xl font-black leading-none"
                style={{
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), sans-serif',
                  textShadow: '0 0 10px rgba(105, 190, 40, 0.5)',
                }}
              >
                {score.toLocaleString()}
              </div>
            </div>

            {/* Wave */}
            <div 
              className="px-3 py-1.5 rounded-lg backdrop-blur-md"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-[9px] text-white/50 uppercase tracking-wider">Wave </span>
              <span 
                className="text-sm font-bold"
                style={{ color: '#69BE28', fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {wave}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right: Lives & Pause */}
        <div className="pointer-events-auto flex items-start gap-2">
          {/* Combo (when active) */}
          <AnimatePresence>
            {combo > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="px-3 py-2 rounded-xl backdrop-blur-md"
                style={{
                  background: 'rgba(105, 190, 40, 0.2)',
                  border: '1px solid rgba(105, 190, 40, 0.5)',
                }}
              >
                <div 
                  className="text-lg font-black"
                  style={{
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald), sans-serif',
                    textShadow: '0 0 15px rgba(105, 190, 40, 0.8)',
                  }}
                >
                  {(1 + combo * 0.5).toFixed(1)}x
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lives */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-1.5 px-3 py-2 rounded-xl backdrop-blur-md"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i < lives ? 1 : 0.7,
                  opacity: i < lives ? 1 : 0.2,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <svg 
                  className="w-5 h-5" 
                  viewBox="0 0 24 24" 
                  fill={i < lives ? '#E53935' : '#333'}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.div>
            ))}
          </motion.div>

          {/* Pause Button */}
          {onPause && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onPause}
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Fan Meter (12th Man) - Bottom of screen */}
      <AnimatePresence>
        {fanMeter > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 z-40"
          >
            <div 
              className="h-3 rounded-full overflow-hidden backdrop-blur-md"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(105, 190, 40, 0.3)',
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #69BE28 0%, #7ed957 100%)',
                  boxShadow: '0 0 20px rgba(105, 190, 40, 0.6)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${fanMeter}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            <div className="text-center mt-1 text-[9px] uppercase tracking-wider text-white/50">
              12th Man • {fanMeter.toFixed(0)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameHUD
