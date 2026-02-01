'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, usePlayerStats, useArMode } from '@/src/store/gameStore'
import { AudioManager } from '@/src/game/systems/AudioManager'

interface GameHUDProps {
  onPause?: () => void
  onToggleAR?: () => void
}

export function GameHUD({ onPause, onToggleAR }: GameHUDProps) {
  const score = useGameStore((s) => s.score)
  const lives = useGameStore((s) => s.lives)
  const wave = useGameStore((s) => s.wave)
  const combo = useGameStore((s) => s.combo)
  const maxCombo = useGameStore((s) => s.maxCombo)
  const fanMeter = useGameStore((s) => s.fanMeter)
  const stats = usePlayerStats()
  const arMode = useArMode()
  const setArMode = useGameStore((s) => s.setArMode)
  
  // Only show stats if there are any bonuses
  const hasStats = stats.defenderCount > 1 || stats.speedBoost > 0 || stats.tackleRadius > 0 || stats.enemySlowdown > 0
  
  // Handle AR toggle
  const handleToggleAR = () => {
    setArMode(!arMode.enabled)
    onToggleAR?.()
  }

  return (
    <>
      {/* Top HUD Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-50"
        style={{ 
          paddingTop: 'max(8px, env(safe-area-inset-top))',
          paddingLeft: 'max(12px, env(safe-area-inset-left))',
          paddingRight: 'max(12px, env(safe-area-inset-right))',
          pointerEvents: 'none',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          
          {/* LEFT SIDE: Score & Wave */}
          <div 
            className="flex flex-col gap-1.5"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,34,68,0.9) 0%, rgba(0,20,40,0.95) 100%)',
                borderRadius: 12,
                padding: '10px 14px',
                border: '1px solid rgba(105,190,40,0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                minWidth: 85,
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'radial-gradient(ellipse at top left, rgba(105,190,40,0.3) 0%, transparent 70%)',
                }}
              />
              <div className="relative">
                <div 
                  className="text-[10px] uppercase tracking-widest mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  Score
                </div>
                <div 
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{
                    color: '#69BE28',
                    fontFamily: 'var(--font-oswald), system-ui, sans-serif',
                    textShadow: '0 0 20px rgba(105,190,40,0.5)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {score.toLocaleString()}
                </div>
              </div>
            </motion.div>

            {/* Wave Badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-2"
              style={{
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 8,
                padding: '6px 10px',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span 
                className="text-[10px] uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Wave
              </span>
              <span 
                className="text-base font-bold"
                style={{ 
                  color: '#69BE28',
                  fontFamily: 'var(--font-oswald), system-ui, sans-serif',
                }}
              >
                {wave}
              </span>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Lives & Pause */}
          <div 
            className="flex items-center gap-2"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Combo Indicator */}
            <AnimatePresence>
              {combo > 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(105,190,40,0.25) 0%, rgba(105,190,40,0.15) 100%)',
                    borderRadius: 10,
                    padding: '6px 12px',
                    border: '1px solid rgba(105,190,40,0.5)',
                    boxShadow: '0 0 20px rgba(105,190,40,0.3)',
                  }}
                >
                  <div 
                    className="text-lg font-black"
                    style={{
                      color: '#69BE28',
                      fontFamily: 'var(--font-oswald), system-ui, sans-serif',
                      textShadow: '0 0 15px rgba(105,190,40,0.8)',
                    }}
                  >
                    {combo}x
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lives Display */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1"
              style={{
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 10,
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: i < lives ? 1 : 0.6,
                    opacity: i < lives ? 1 : 0.15,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <svg 
                    className="w-5 h-5" 
                    viewBox="0 0 24 24" 
                    fill={i < lives ? '#E53935' : '#444'}
                    style={{
                      filter: i < lives ? 'drop-shadow(0 0 4px rgba(229,57,53,0.5))' : 'none',
                    }}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </motion.div>
              ))}
            </motion.div>

            {/* AR Mode Toggle Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              onClick={() => { AudioManager.playClick(); handleToggleAR(); }}
              className="flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{
                height: 40,
                padding: '0 12px',
                background: arMode.enabled 
                  ? 'linear-gradient(135deg, rgba(105,190,40,0.3) 0%, rgba(105,190,40,0.15) 100%)'
                  : 'rgba(0,0,0,0.6)',
                borderRadius: 12,
                border: arMode.enabled 
                  ? '1px solid rgba(105,190,40,0.5)'
                  : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: arMode.enabled 
                  ? '0 4px 20px rgba(105,190,40,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* AR Icon - Viewfinder style */}
              <svg 
                className="w-4 h-4" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke={arMode.enabled ? '#69BE28' : 'rgba(255,255,255,0.7)'}
                strokeWidth="2"
                strokeLinecap="round"
              >
                {/* Viewfinder corners */}
                <path d="M4 8V6a2 2 0 0 1 2-2h2" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
                {/* Center circle for AR focus */}
                <circle cx="12" cy="12" r="3" fill={arMode.enabled ? '#69BE28' : 'none'} />
              </svg>
              
              {/* AR Label */}
              <span 
                className="text-xs font-bold uppercase tracking-wide"
                style={{ 
                  color: arMode.enabled ? '#69BE28' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'var(--font-oswald), system-ui, sans-serif',
                  textShadow: arMode.enabled ? '0 0 10px rgba(105,190,40,0.5)' : 'none',
                }}
              >
                AR
              </span>
            </motion.button>

            {/* Pause Button */}
            {onPause && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                onClick={() => { AudioManager.playClick(); onPause?.(); }}
                className="flex items-center justify-center transition-all active:scale-90"
                style={{
                  width: 40,
                  height: 40,
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <svg 
                  className="w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="rgba(255,255,255,0.7)"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        {/* Wave Timer Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2"
          style={{
            marginLeft: 4,
            marginRight: 4,
          }}
        >
          <div 
            style={{
              height: 4,
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Timer progress will be controlled by game logic */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #69BE28 0%, #8BD44A 100%)',
                borderRadius: 2,
                boxShadow: '0 0 10px rgba(105,190,40,0.4)',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Stats Panel - Bottom Right */}
      <AnimatePresence>
        {hasStats && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed z-40"
            style={{
              bottom: 'max(80px, calc(env(safe-area-inset-bottom) + 60px))',
              right: 'max(12px, env(safe-area-inset-right))',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 10,
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex flex-col gap-1.5">
                {stats.defenderCount > 1 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#69BE28">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-7 9c0-2.67 5.33-4 7-4s7 1.33 7 4v1H5v-1z"/>
                    </svg>
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {stats.defenderCount} Defenders
                    </span>
                  </div>
                )}
                {stats.speedBoost > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#69BE28">
                      <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                    </svg>
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      +{stats.speedBoost}% Speed
                    </span>
                  </div>
                )}
                {stats.tackleRadius > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#69BE28">
                      <circle cx="12" cy="12" r="10" stroke="#69BE28" strokeWidth="2" fill="none"/>
                      <circle cx="12" cy="12" r="4" fill="#69BE28"/>
                    </svg>
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      +{stats.tackleRadius}% Reach
                    </span>
                  </div>
                )}
                {stats.enemySlowdown > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#69BE28">
                      <path d="M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8C4.26 6.46 3 9.05 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9h-1z"/>
                    </svg>
                    <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      -{stats.enemySlowdown}% Enemy Speed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fan Meter (12th Man) - Bottom of screen */}
      <AnimatePresence>
        {fanMeter > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed z-50"
            style={{
              bottom: 'max(24px, env(safe-area-inset-bottom))',
              left: 'max(16px, env(safe-area-inset-left))',
              right: 'max(16px, env(safe-area-inset-right))',
              pointerEvents: 'none',
            }}
          >
            {/* Label */}
            <div 
              className="text-center mb-1.5 text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              12th Man
            </div>
            
            {/* Progress Bar */}
            <div 
              style={{
                height: 8,
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid rgba(105,190,40,0.2)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  background: fanMeter >= 100 
                    ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
                    : 'linear-gradient(90deg, #69BE28 0%, #8BD44A 100%)',
                  borderRadius: 4,
                  boxShadow: fanMeter >= 100 
                    ? '0 0 20px rgba(255,215,0,0.6)' 
                    : '0 0 15px rgba(105,190,40,0.4)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, fanMeter)}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
            
            {/* Percentage */}
            <div 
              className="text-center mt-1 text-[10px] tabular-nums font-medium"
              style={{ color: fanMeter >= 100 ? '#FFD700' : 'rgba(105,190,40,0.8)' }}
            >
              {Math.floor(fanMeter)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default GameHUD
